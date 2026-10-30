# Checks a batch's citation rows the way the final apply step will: the claim is exact lesson text, the domain is
# allowed, the page loads over plain HTTP (robots.txt obeyed, no JavaScript) and the quote is on it.
# Usage: python3 tools/gap/check_rows.py <topic-id>      (rows in gap-rows/<topic-id>/citations.json)
import difflib, hashlib, html, json, os, re, sys, time, urllib.parse, urllib.request, urllib.robotparser
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from plaintext import plain

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
UA = 'Mozilla/5.0 (X11; Linux x86_64) NousCitationCheck/1.0 (flirpgames@gmail.com)'
BANNED = re.compile(r'(wikipedia\.org|wikiwand|britannica\.com|openstax\.org|quora\.com|reddit\.com|medium\.com|stackexchange\.com|'
                    r'stackoverflow\.com|blogspot\.|wordpress\.com|answers\.|chegg\.com|coursehero\.com|scribd\.com|byjus\.com|study\.com|brainly)', re.I)
CACHE = os.path.join(ROOT, '.gap-cache')
os.makedirs(CACHE, exist_ok=True)
_robots, _last = {}, {}

def allowed(url):
    host = urllib.parse.urlsplit(url)
    base = f'{host.scheme}://{host.netloc}'
    if base not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        try:
            req = urllib.request.Request(base + '/robots.txt', headers={'User-Agent': UA})
            rp.parse(urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'ignore').splitlines())
        except Exception:
            rp.parse([])
        _robots[base] = rp
    return _robots[base].can_fetch(UA, url)

def page_text(url):
    key = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:12] + '.txt')
    if os.path.exists(key): return open(key).read()
    if not allowed(url): raise RuntimeError('robots.txt disallows this page')
    host = urllib.parse.urlsplit(url).netloc
    wait = 1.5 - (time.time() - _last.get(host, 0))
    if wait > 0: time.sleep(wait)
    _last[host] = time.time()
    req = urllib.request.Request(urllib.parse.quote(url, safe=":/?&=%#+,;@!$'()*~"), headers={'User-Agent': UA})
    data = urllib.request.urlopen(req, timeout=40).read(40_000_000)
    if data[:5] == b'%PDF-':
        import subprocess, tempfile
        with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
            f.write(data); f.flush()
            text = subprocess.run(['pdftotext', '-q', f.name, '-'], capture_output=True, text=True).stdout
    else:
        raw = data.decode('utf-8', 'ignore')
        raw = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', raw, flags=re.S)
        raw = re.sub(r'</?(a|em|strong|b|i|span|sup|sub|code|abbr|cite|q|small)\b[^>]*>', '', raw)
        text = html.unescape(re.sub(r'<[^>]+>', ' ', raw))
    text = re.sub(r'\s+', ' ', text)
    open(key, 'w').write(text)
    return text

norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[‘’“”"\'`–—-]', ' ', html.unescape(s or '').lower())).strip()
alnum = lambda s: re.sub(r'[^a-z0-9]', '', (s or '').lower())

def quote_ratio(quote, text):
    q = norm(quote); t = norm(text)
    if q in t or alnum(q) in alnum(text): return 1.0
    words, n = t.split(' '), len(q.split(' '))
    best = 0.0
    for i in range(max(1, len(words) - n + 1)):
        if alnum(words[i])[:2] != alnum(q.split(' ')[0])[:2]: continue
        best = max(best, difflib.SequenceMatcher(None, ' '.join(words[i:i + n]), q).ratio())
    return best

tid = sys.argv[1]
rows = json.load(open(os.path.join(ROOT, 'gap-rows', tid, 'citations.json')))
batches = json.load(open(os.path.join(HERE, 'batches.json')))
targets = {l['id'] for b in batches.values() for t in b if t['topic'] == tid for l in t['lessons']}
concepts, lesson_of = {}, {}
for l in json.load(open(os.path.join(ROOT, 'wwwroot', 'data', tid, 'lessons.json'))):
    for c in l['concepts']: concepts[c['id']] = plain(c['contentHtml']); lesson_of[c['id']] = l['id']
ok, covered = 0, set()
for i, r in enumerate(rows):
    errs = [f'missing {k}' for k in ('concept_id', 'claim', 'quote', 'url', 'title') if not r.get(k)]
    cid, claim, url = r.get('concept_id', ''), r.get('claim', ''), r.get('url', '')
    if cid not in concepts: errs.append('unknown concept_id')
    elif claim not in concepts[cid]: errs.append('claim is not exact text of the concept (copy it from the plain text)')
    if claim and not 5 <= len(claim.split()) <= 40: errs.append('claim should be 5 to 40 words')
    if '\\(' in claim: errs.append('claim contains maths markup')
    if BANNED.search(url): errs.append('banned domain')
    if '—' in json.dumps(r, ensure_ascii=False): errs.append('contains an em dash')
    if not errs:
        try:
            ratio = quote_ratio(r['quote'], page_text(url))
            if ratio < 0.9: errs.append(f'quote not found on the page (best match {ratio:.2f})')
        except Exception as e:
            errs.append(f'page not fetchable over plain HTTP ({str(e)[:70]}); pick another source')
    if errs: print(f'[{i}] {cid} FAIL: ' + '; '.join(errs))
    else: ok += 1; covered.add(lesson_of[cid])
missing = sorted(targets - covered)
print(f'\n{tid}: {ok}/{len(rows)} rows pass; target lessons covered {len(targets & covered)}/{len(targets)}'
      + (f'; still uncovered: {", ".join(missing)}' if missing else ''))
