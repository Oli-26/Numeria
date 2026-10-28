# Citation pilot report

10 lessons, 864 concepts. Proposed 29 citations; **14 accepted** after the reviewer and script checks.

| Check | Count |
|---|---:|
| accepted via quote on page | 13 |
| accepted via Crossref DOI | 1 |
| rejected: reviewer | 13 |
| rejected: DOI not found in Crossref | 4 |
| rejected: quote not found on page | 1 |
| rejected: DOI metadata mismatch (Crossref | 1 |

## Contradicted by a source (2)

These are likely errors in the lessons.

- `side-01-c2`: "An attacker who can time many decryptions of chosen ciphertexts can statistically infer, bit by bit, which exponent bits triggered the multiply."  
  Source says: Kocher's abstract says the attack is inexpensive and often requires only known ciphertext, so chosen ciphertexts are not needed. (https://paulkocher.com/doc/TimingAttacks.pdf)
- `neta-01-c3`: "reported throughput improvements of 4-14% globally"  
  Source says: YouTube throughput improved 4 percent on average globally and by more than 14 percent in some countries; 14% is not a global figure. (https://cloud.google.com/blog/products/networking/tcp-bbr-congestion-control-comes-to-gcp-your-internet-just-got-faster)

## Accepted citations (14)

- `rs-01-c1` "Every value has exactly one owner, a variable. When the owner goes out of scope, the value is dropped"  
  Steve Klabnik and Carol Nichols (2024). What Is Ownership? (The Rust Programming Language). doc.rust-lang.org. (quote on page)
- `rs-01-c1` "so s2 owns the string and s1 is no longer usable"  
  Steve Klabnik and Carol Nichols (2024). What Is Ownership? (The Rust Programming Language). doc.rust-lang.org. (quote on page)
- `rs-01-c1` "first stable 2015"  
  The Rust Team (2015). Announcing Rust 1.0. Rust Blog. (quote on page)
- `rs-01-c2` "Mutable references (&mut T) allow exactly one writer and no readers."  
  Steve Klabnik and Carol Nichols (2024). References and Borrowing (The Rust Programming Language). doc.rust-lang.org. (quote on page)
- `rs-01-c3` "Rc<T> gives shared ownership through single-threaded reference counting"  
  Steve Klabnik and Carol Nichols (2024). Rc<T>, the Reference Counted Smart Pointer (The Rust Programming Language). doc.rust-lang.org. (quote on page)
- `neta-01-c2` "Growth depends on the time since the last loss, not on RTT, which makes CUBIC RTT-fair"  
  L. Xu, S. Ha, I. Rhee, V. Goel, L. Eggert (2023). CUBIC for Fast and Long-Distance Networks (RFC 9438). IETF RFC Editor. (quote on page)
- `net-01-c3` "carrier pigeon per RFC 1149"  
  D. Waitzman (BBN STC) (1990). A Standard for the Transmission of IP Datagrams on Avian Carriers (RFC 1149). IETF Datatracker / RFC Editor. (quote on page)
- `sec-01-c2` "The STRIDE framework (Microsoft) lists categories of threats: Spoofing identity, Tampering with data, Repudiation, Information disclosure, Denial of service, Elevation of privilege."  
  Microsoft (2017). Threats - Microsoft Threat Modeling Tool. Microsoft Learn. (quote on page)
- `side-01-c2` "The field as we know it began with a 1996 paper by Paul Kocher, Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems."  
  Paul C. Kocher (1996). Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems. Advances in Cryptology (CRYPTO '96), LNCS 1109, Springer. (Crossref DOI)
- `side-01-c2` "For each bit of the private exponent d, the algorithm always squares, but it only multiplies if the bit is 1."  
  Paul C. Kocher (1996). Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems. Advances in Cryptology (CRYPTO '96), LNCS 1109, Springer. (quote on page)
- `sys-01-c2` "The optimal policy in hindsight, Belady's algorithm, evicts the item that will be needed furthest in the future."  
  Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau (2018). Operating Systems: Three Easy Pieces, Chapter 22: Beyond Physical Memory: Policies. Arpaci-Dusseau Books (University of Wisconsin-Madison). (quote on page)
- `sys-01-c1` "There are only two hard things in computer science: cache invalidation and naming things"  
  Martin Fowler. TwoHardThings. martinfowler.com. (quote on page)
- `tml-01-c1` "PAC (Probably Approximately Correct) learning, formalized by Valiant in 1984"  
  L. G. Valiant (1984). A Theory of the Learnable. Communications of the ACM 27(11), 1134-1142. (quote on page)
- `tml-01-c2` "Linear classifiers in R^d have VC dimension d+1, and axis-aligned rectangles in R^2 have VC dimension 4"  
  Rob Schapire (lecturer), Zeyu Jin (scribe) (2014). COS 511: Theoretical Machine Learning, Lecture #6. Princeton University. (quote on page)

## No source found (29)

- `rs-01-c1`: "Rust (Graydon Hoare, Mozilla, first stable 2015)" (2015 release confirmed; Hoare creator attribution not verified from an opened allowed source)
- `rs-01-c3`: "You can't easily build a doubly linked list (each node would need shared mutable references)" (No allowed source opened that states this)
- `os-01-c2`: "That makes creating one much cheaper than creating a process, typically 10-100x faster." (No reputable source found that states this ratio; it varies widely by system.)
- `os-01-c1`: "The operating system uses processes as its main isolation boundary." (Not searched; basic definition.)
- `os-01-c3`: "Modern schedulers run a thread for a short time slice (typically a few milliseconds)" (Not searched; no source opened.)
- `sec-01-c3`: "When (not if) a credential leaks, least privilege limits the blast radius." (Only a truncated NIST/CNSSI definition of least privilege was retrievable; no full-sentence source stating the blast radius point was opened.)
- `sec-01-c3`: "A corollary is to fail closed. If a security control breaks, the system should default to denying access, not permitting it." (NIST glossary page opened defines only fail secure, with a truncated quote; no source stating fail closed as a corollary of least privilege.)
- `para-01-c1`: "Imperative programming is the original paradigm, born with Fortran in 1957." (IBM (ibm.com/history/fortran) confirms Fortran's 1957 commercial release but not that imperative programming was 'born' with it; the paradigm predates Fortran (machine code, assembly). No source found for the full claim.)
- `para-01-c3`: "In 1968, Edsger Dijkstra published a one-page letter titled Go To Statement Considered Harmful." (UT Austin EWD archive page was opened and gives CACM 11 (March 1968), pp. 147-148, but I have no verbatim quote to cite, and the pagination suggests two pages rather than one.)
- `para-01-c3`: "The Böhm-Jacopini theorem proved this is enough, since any computable function can be written using only these three." (ACM, dblp and scilit pages returned 403 or access-denied; only a search summary was seen, so no opened page with a verbatim quote.)
- `para-01-c2`: "Before procedures arrived in the 1960s, programs were one giant flat block of GOTO statements." (Not searched due to source access limits; also an oversimplification (subroutines existed in the 1940s-50s).)
- `net-01-c3`: "designed by Vint Cerf and Bob Kahn in the 1970s" (Britannica and Internet Hall of Fame returned 403; IEEE Xplore page came back empty. Could not open any page stating it, so no citation. Candidate for later: Cerf and Kahn 1974, DOI 10.1109/TCOM.1974.1092259, but not opened.)
- `net-01-c3`: "That simplicity let the internet scale from four nodes in 1969 to billions of devices today." (Scientific American page opened but only gave a truncated partial sentence about the four nodes (connected Dec 5, 1969), not a full verbatim quote; no source for the billions of devices part.)
- `side-01-c1`: "the C implementation of RSA, running on a CPU, takes slightly different amounts of time depending on the bits of the key" (Covered generally by the Kocher paper already cited; no separate source opened for the other channels (power, heat, EM, sound).)
- `side-01-c2`: "Constant-time programming is now mandatory for any code that touches keys, and it's very hard to get right" (No reputable source opened stating this; it is an opinion-like generalisation.)
- `side-01-c3`: "When your VM and an attacker's VM share an Intel Xeon, you also share L3 cache, branch predictors, DRAM rows and frequency-scaling state." (Not verified against an opened source; the Ristenpart paper covers L1/L2 cache only.)
- `sys-01-c3`: "A site behind a CDN often serves over 90% of requests from cache, never touching the origin." (Could not open a reputable page stating this figure; Cloudflare page returned 403 and Akamai page gave no such number.)
- `sys-01-c3`: "Cloudflare, Akamai, Fastly, AWS CloudFront and Google Cloud CDN each operate hundreds of edge points-of-presence around the world." (Only vendor pages found; no neutral source confirming all five providers each have hundreds of PoPs.)
- `sys-01-c2`: "the gap between LRU and Belady is smaller than you'd guess." (Vague and workload dependent; no source found stating it.)
- `tml-01-c2`: "Neural networks with W weights and ReLU activations have VC dimension Θ(W L log W) (Bartlett-Harvey-Liaw-Mehrabian 2019)" (Opened JMLR page (jmlr.org/papers/v20/17-612.html): it proves upper bound O(WL log W) and a lower bound Ω(WL log(W/L)), 'tight for almost the entire range of parameters'. So Θ(WL log W) is not exactly stated; lesson should say nearly tight / O(WL log W).)
- `tml-01-c1`: "Vapnik and Chervonenkis built the foundation in 1971" (Did not open a page for the 1971 paper in this session.)
- `tml-01-c3`: "the Rademacher complexity is BR/√n" (Did not open a source stating this exact bound; the Bartlett-Mendelson page opened gave only the abstract. Also the c3 citation above is weak for the margin-bound claim (1998-2017 years not verified).)
- `qc-01-c1`: "An n-qubit register lives in a 2ⁿ-dimensional space, exponentially larger than n classical bits" (No openable reputable page found with a verbatim statement in the time spent; Nielsen and Chuang is not openable.)
- `qc-01-c1`: "A single qubit holds essentially the same information as a classical bit, since you can extract one bit from a measurement." (Holevo bound source not opened in this session.)
- `qc-01-c3`: "a circuit's T-count usually dominates its real-world cost" (A search result said T-count dominates cost, but I did not open that page and could not extract a verbatim quote.)
- `qc-01-c3`: "Superconducting platforms like IBM's Heron and Google's Willow implement a native gate set" (Nature page for Willow was paywalled or redirected; no vendor or reputable page opened.)
- `neta-01-c1`: "On a 100 ms, 10 Gbps link, recovering from one loss takes hours." (RFC 3649 gives the 100 ms/10 Gbps scenario (83,333-segment window; one loss per 1 2/3 hours sustainable) but states no recovery time; a derived estimate is about 70 minutes, not hours.)
- `neta-01-c2`: "your default congestion controller has been CUBIC since 2006 (RFC 8312, updated as RFC 9438 in 2023)" (RFC 9438 says CUBIC is the Linux default but gives no year; no opened page confirmed 2006.)
- `neta-01-c3`: "BBRv2 (2019) and BBRv3 (2023) added explicit response to loss and ECN signals" (Not verified from a page opened this session.)

## Rejected (15)

- `rs-01-c2` "data races, iterator invalidation, and accidental aliasing become impossible": reviewer: The page supports only data races at compile time. It never mentions iterator invalidation or aliasing, so the claim is broader than the source. (https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html)
- `neta-01-c1` "Van Jacobson's 1988 algorithm (now called TCP Tahoe/Reno, RFC 5681) introduced A": reviewer: RFC 5681 only says in its acknowledgments that the core algorithms were developed by Van Jacobson. It does not say 1988, Tahoe/Reno or that he introduced AIMD, so the claim is broader than the quote. (https://www.rfc-editor.org/rfc/rfc5681)
- `neta-01-c1` "Chiu and Jain proved this geometrically in 1989: additive growth and multiplicat": reviewer: The paper shows AIMD satisfies sufficient conditions for convergence to an efficient and fair state. It does not claim AIMD is the only linear control law that is stable and fair, which is what the lesson claim says. (https://classes.engineering.wustl.edu/~jain/papers/cong_av.htm)
- `neta-01-c3` "Google deployed it on YouTube and reported throughput improvements of 4-14% glob": reviewer: The page says 4% average throughput gain globally and more than 14% in some countries. The claim 'improvements of 4-14% globally' misstates that. The latency part (RTT down 33%) is also not covered by the quote. (https://cloud.google.com/blog/products/networking/tcp-bbr-congestion-control-comes-to-gcp-your-internet-just-got-faster)
- `os-01-c3` "Linux's CFS (Completely Fair Scheduler) was the default from 2007 until EEVDF re": reviewer: Page title is 'A Fair Slice' (Marcin Gastol), not the cited title 'Linux 6.6's new scheduler', so the metadata does not match. The 2007 default start is supported, but the metadata mismatch makes the citation unreliable. (https://www.linux-magazine.com/Issues/2025/301/EEVDF)
- `os-01-c3` "Linux's CFS (Completely Fair Scheduler) was the default from 2007 until EEVDF re": reviewer: The page supports only CFS being merged in 2.6.23. It gives no 6.6 or 2023 replacement date, so it does not support the full claim. (https://docs.kernel.org/scheduler/sched-design-CFS.html)
- `os-01-c3` "EEVDF keeps that proportional-share idea while adding latency deadlines.": reviewer: The quote is about the 6.6 transition and says nothing about proportional share plus latency deadlines. The page also dates the 6.6 option to 2024, and it does not say the proportional-share idea is kept, so the claim is only loosely supported. (https://docs.kernel.org/scheduler/sched-eevdf.html)
- `qc-01-c3` "Any single-qubit unitary can be approximated to error ε using O(log^c(1/ε)) gate": DOI not found in Crossref; quote not found on page (https://arxiv.org/abs/quant-ph/0505030)
- `qc-01-c3` "with c ≈ 4 classically and c ≈ 1 with modern algorithms": reviewer: Ross-Selinger supports only the c≈1 half (T-count 3log2(1/ε)); the claim also asserts c≈4 classically, which this source does not support, so it is broader than the source.; DOI not found in Crossref (https://arxiv.org/abs/1403.2975)
- `qc-01-c3` "The T gate stands out in surface-code fault-tolerance schemes, where it's much m": DOI not found in Crossref (https://arxiv.org/html/2411.04790v1)
- `qc-01-c2` "For d > 2 the analogous space is the much higher-dimensional generalized Bloch b": reviewer: Paper never mentions a generalized Bloch body; its 'irregular object' statement does not support the claim that the space is much higher-dimensional; mismatched. (https://quantum-journal.org/papers/q-2021-06-29-485/)
- `sec-01-c1` "Availability means legitimate users can actually use the system, which DDoS prot": reviewer: The NIST definition only says availability means timely and reliable access to information. It does not mention DDoS protection, redundancy or rate limiting, or 'legitimate users', so the claim goes beyond what the source supports. (https://csrc.nist.gov/glossary/term/information_security)
- `side-01-c3` "Co-residency attacks turned theoretical lab demos into practical concerns.": reviewer: The paper is real and the quote is on the page, but it does not say co-residency attacks turned theoretical lab demos into practical concerns. That is an interpretive framing, so the source supports something narrower than the claim.; DOI metadata mismatch (Crossref: "Hey, you, get off of my cloud", 2009) (https://cs.utexas.edu/~hovav/dist/cloudsec.pdf)
- `sys-01-c2` "TinyLFU beats classical algorithms on many real workloads.": reviewer: Paper is genuine, but the abstract says W-TinyLFU gets equal or better hit-ratios than state-of-the-art policies on the traces studied. The claim 'beats classical algorithms on many real workloads' is a different, looser statement (classical vs state of the art, beats vs equal or better).; DOI not found in Crossref (https://arxiv.org/abs/1512.00727)
- `tml-01-c3` "Bartlett's margin bounds (1998-2017) extend this to deep networks": reviewer: The Bartlett-Mendelson 2002 abstract covers Rademacher complexity risk bounds, not margin bounds for deep networks. It does not support a '1998-2017' span or an extension to deep networks, so the claim is broader than the source. (https://jmlr.org/papers/v3/bartlett02a.html)
