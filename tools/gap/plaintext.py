# Lesson HTML -> plain text, plus a map from each plain-text character back to its position in the HTML,
# so a claim quoted from the plain text can be located exactly and marked in the HTML.
import html as htmlmod
import re

BLOCK = re.compile(r'</?(p|br|li|ul|ol|h\d|div|table|tr|td|th|blockquote)\b', re.I)
TAG_START = re.compile(r'</?[A-Za-z!]')
FIGURE = re.compile(r'<figure\b.*?</figure>', re.S | re.I)


def plain_with_map(h):
    """Returns (text, ends) where ends[i] is the HTML index just after plain-text character i."""
    out, ends = [], []
    skip = [(m.start(), m.end()) for m in FIGURE.finditer(h)]
    i, n = 0, len(h)
    while i < n:
        fig = next((e for s, e in skip if s == i), None)
        if fig is not None:
            out.append(' '); ends.append(fig); i = fig
            continue
        ch = h[i]
        # Browsers treat '<' as text unless a tag name, '/' or '!' follows (lessons write 'b < 0' raw).
        if ch == '<' and TAG_START.match(h, i):
            j = h.find('>', i)
            if j < 0: j = n - 1
            if BLOCK.match(h, i):
                out.append(' '); ends.append(j + 1)
            i = j + 1
        elif ch == '&':
            m = re.match(r'&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);', h[i:])
            if m:
                dec = htmlmod.unescape(m.group(0))
                for c in dec:
                    out.append(c); ends.append(i + len(m.group(0)))
                i += len(m.group(0))
            else:
                out.append(ch); ends.append(i + 1); i += 1
        else:
            out.append(ch); ends.append(i + 1); i += 1
    # Collapse whitespace runs, keeping the map of the first character in each run.
    text, tmap, prev_space = [], [], True
    for c, e in zip(out, ends):
        if c.isspace():
            if prev_space: continue
            text.append(' '); tmap.append(e); prev_space = True
        else:
            text.append(c); tmap.append(e); prev_space = False
    while text and text[-1] == ' ':
        text.pop(); tmap.pop()
    return ''.join(text), tmap


def plain(h):
    return plain_with_map(h)[0]
