
## computation, cs-compilers, cs-networks, cs-networking-advanced, history-medicine, history-medieval

Checked: 31 | OK: 4 | fixed-second-error: 18 | fixed-key: 0 | rewritten: 7 | explanation-only: 2

Notes: history-medicine and history-medieval contain no FindTheError items. correctAnswer is stored and graded 1-based (QuizComponent compares it to step index + 1; no item in the dataset uses "0"), so step numbers below are 1-based. No keys needed changing. Ids and lessonIds unchanged.

- computation / comp-q15: step 5 "Therefore L is regular" -> "If some regex matches exactly L, then L is regular"; step 4 clarified to "matches exactly the language L" (step 5 was a second false claim); explanation tidied
- computation / comp-q24: step 4 "multi-tape TMs solve problems single-tape cannot" -> two tapes decide palindromes in O(n) vs O(n^2) (second false step; key 3 kept)
- computation / comp-q32: step 5 "This contradicts undecidability" -> tracing one program gives no general decision method (second false step)
- computation / comp-q40: step 2 "SAT ... cannot be solved in polynomial time" -> every NP problem reduces to SAT (open question stated as fact; second false step)
- computation / comp-q64: rewritten; steps 2, 4, 5 were also false (superposition as parallel readout, "would prove P = NP", "breaks complexity theory"); now step 3 (one measurement reads all 2^n values) is the sole error, later steps are true conditionals about NP and BQP
- computation / mastery-comp-9: step 5 "no NP-complete problem can be solved efficiently" -> conditional on a proof of P != NP (second false step); step 3 "50 years" -> "over 50 years" (Cook 1971)
- cs-compilers / cc-q08: steps 5-6 ("works for all C++", "my lexer is correct") -> true narrative steps; explanation adds that name lookup, not depth, decides whether '<' opens a template
- cs-compilers / cc-q16: step 5 merged with the tool switch; step 6 -> "I still have to decide which if an else binds to" (old step 6 was a second false step); explanation notes shift is yacc's default
- cs-compilers / cc-q24: step 6 "my approach was reasonable" -> "GHC compiles full Haskell" (second false step); "~12 node types" -> about ten Core constructors
- cs-compilers / cc-q32: rewritten; steps 2 and 5 were also false (all names resolve at compile time) and step 4 misdescribed the TDZ; now step 6 (all JS name resolution is static like C) is the sole error, step 5 states strict-mode limits on with/eval
- cs-compilers / cc-q40: rewritten; explanation admitted steps 5 and 6 were both wrong and step 4 ran unification over inequalities; now step 5 (principal types survive with no extra machinery) is the sole error; explanation cites MLsub
- cs-compilers / cc-q48: step 3 "After insertion, every variable is single-assignment" -> "After renaming" (phi insertion alone does not give SSA); explanation: iterated dominance frontiers, "every" -> "most" compilers
- cs-compilers / cc-q56: step 5 "loop fusion is unsafe in general" -> the concrete fusion-preventing dependence (second false step); step 4 crash -> wrong results; step 6 now carries the overgeneralization
- cs-compilers / cc-q64: rewritten; steps 5-6 ("allocator is correct", "no need to spill") were also false and "100 vs 16" ignored live-range sharing; now 40 simultaneously live values vs 16 registers, step 4 drops the extra 24
- cs-compilers / cc-q72: steps 4-6 (MCU JIT "peak performance", "choice is optimal") -> true facts about the 64KB C firmware case (second false steps; explanation had said they "compound" the error)
- cs-networks / net-q08: step 5 "Lower-layer headers are stripped before transmission" -> each layer strips its own header on receipt (second false step)
- cs-networks / net-q16: explanation now exempts /31 (RFC 3021) and /32 from the reserved-address rule
- cs-networks / net-q24: rewritten to 4 steps; old steps 4-5 ("500 cannot happen", "500s are TCP bugs") were also false; "HTTP runs over TCP" scoped to HTTP/1.1 and HTTP/2
- cs-networks / net-q37: explanation drops DNS redirection (a valid cert check defeats it) in favour of mis-issued certs and malicious name owners
- cs-networks / mastery-net-6: rewritten; steps 2 and 4 ("all inbound web traffic is safe", "cannot be compromised") were also false; now step 5 (firewall replaces patching) is the sole error
- cs-networking-advanced / neta-q08: step 1 "only reacts to packet drops" -> loss or ECN marks; step 2 "very large buffers (deep buffers are cheap)" -> "Many routers have large buffers" (both overstated)
- cs-networking-advanced / neta-q16: rewritten; key 4 was a deployment decision while step 5 held the false replay claim and step 6 "safe" was also false; now step 4 is the false claim that encryption prevents 0-RTT replay
- cs-networking-advanced / neta-q24: step 4 "Adoption is 50%" -> over half of routed IPv4 prefixes have ROAs; step 5 "We can also deploy BGPsec" -> BGPsec was designed for path validation (barely deployable); explanation adds forged-origin detail
- cs-networking-advanced / neta-q40: step 5 "Privacy from the ISP is fully achieved" -> the DoH resolver now sees every query (second false step); explanation adds destination IP leak
- cs-networking-advanced / neta-q56: step 5 "deeper buffers reduce cost" -> they cost more (second false step, admitted in old explanation)
- cs-networking-advanced / neta-q64: step 5 "We expect a large performance gain" -> TCP/TLS would move to user space (second false step)
- cs-networking-advanced / neta-q72: step 4 "first-byte latency is 1 RTT" -> one handshake round trip before the request can be sent; step 5 now claims no client can send data before a handshake RTT (old step 5 about delivering data under 1 RTT was actually true even with 0-RTT)
