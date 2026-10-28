# Citation pilot report

10 lessons, 864 concepts. Proposed 34 citations; **21 accepted** after the reviewer and script checks.

| Check | Count |
|---|---:|
| accepted via quote on page | 19 |
| accepted via Crossref DOI | 2 |
| rejected: reviewer | 11 |
| rejected: quote not found on page | 4 |

## Contradicted by a source (1)

These are likely errors in the lessons.

- `js-01-c3`: "technically they are hoisted to a "temporal dead zone" where access throws"  
  Source says: MDN says let declarations are commonly regarded as non-hoisted because they can only be accessed after the declaration is reached. Accessing a variable in the temporal dead zone throws a ReferenceError. The wording is contested rather than flatly wrong. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)

## Accepted citations (21)

- `dl-01-c2` "Neural network training has one scalar output (the loss) and millions to billions of inputs (the parameters). Reverse-mode wins by a factor of n."  
  Atilim Gunes Baydin, Barak A. Pearlmutter, Alexey Andreyevich Radul, Jeffrey Mark Siskind (2018). Automatic Differentiation in Machine Learning: a Survey. Journal of Machine Learning Research 18(153), 1-43. (quote on page)
- `dl-01-c3` "For exploding gradients, the standard fix is gradient clipping, which rescales the gradient vector to have norm at most some threshold"  
  Razvan Pascanu, Tomas Mikolov, Yoshua Bengio (2013). On the difficulty of training Recurrent Neural Networks. Proceedings of the 30th International Conference on Machine Learning (ICML), PMLR 28(3). (quote on page)
- `gdl-01-c1` "In 2021, Michael Bronstein, Joan Bruna, Taco Cohen, and Petar Veličković published the monograph Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges."  
  Michael M. Bronstein, Joan Bruna, Taco Cohen, Petar Veličković (2021). Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges. arXiv (arXiv:2104.13478). (quote on page)
- `gdl-01-c3` "group-equivariant CNNs (G-CNNs), introduced by Cohen and Welling in 2016"  
  Taco Cohen, Max Welling (2016). Group Equivariant Convolutional Networks. Proceedings of the 33rd International Conference on Machine Learning (PMLR 48:2990-2999). (quote on page)
- `info-01-c1` "The base-2 logarithm gives bits, which are yes/no answers."  
  C. E. Shannon (1948). A Mathematical Theory of Communication. Bell System Technical Journal 27. (quote on page)
- `info-01-c3` "Conditioning never increases entropy: H(Y|X) ≤ H(Y)."  
  C. E. Shannon (1948). A Mathematical Theory of Communication. Bell System Technical Journal 27. (Crossref DOI)
- `info-01-c3` "Equality holds exactly when X and Y are independent, that is, when knowing X is useless."  
  C. E. Shannon (1948). A Mathematical Theory of Communication. Bell System Technical Journal 27. (Crossref DOI)
- `c-01-c3` "arr[i] is exactly equivalent to *(arr + i)"  
  ISO/IEC JTC1/SC22/WG14 (2011). N1570: Committee Draft ISO/IEC 9899:201x, Programming languages: C (6.5.2.1 Array subscripting). WG14 C11 committee draft (HTML mirror at port70.net). (quote on page)
- `c-01-c3` "p2 - p1 returns the number of elements between them, not bytes."  
  ISO/IEC JTC1/SC22/WG14 (2011). N1570: Committee Draft ISO/IEC 9899:201x, Programming languages: C (6.5.6 Additive operators). WG14 C11 committee draft (HTML mirror at port70.net). (quote on page)
- `c-01-c3` "Buffer overflows are precisely this: writing past the end of an array, often onto the stack where return addresses live."  
  MITRE Corporation (2024). CWE-121: Stack-based Buffer Overflow. Common Weakness Enumeration, MITRE. (quote on page)
- `c-01-c2` "Free twice and you get double-free corruption."  
  MITRE Corporation (2024). CWE-415: Double Free. Common Weakness Enumeration, MITRE. (quote on page)
- `cpp-01-c1` "In 1979 Bjarne Stroustrup started building C++, which began as "C with Classes" and added object-oriented programming to C while preserving its low-level control."  
  Bjarne Stroustrup. Bjarne Stroustrup's FAQ. stroustrup.com. (quote on page)
- `cpp-01-c3` "With manual cleanup(); calls, an exception between acquire and cleanup leaks the resource."  
  Bjarne Stroustrup and Herb Sutter (eds.), Standard C++ Foundation. C++ Core Guidelines, E.6: Use RAII to prevent leaks. isocpp.github.io. (quote on page)
- `csharp-01-c2` "Boxing happens when you store a value type in an object reference, which allocates a heap box"  
  Microsoft (2025). Boxing and Unboxing. Microsoft Learn (C# documentation). (quote on page)
- `csharp-01-c3` "New objects in the CLR start in Gen 0, where allocation is cheap"  
  Microsoft (2025). Fundamentals of garbage collection. Microsoft Learn (.NET documentation). (quote on page)
- `csharp-01-c3` "The CLR uses a generational, compacting garbage collector, so survivors are promoted to Gen 1, then Gen 2"  
  Microsoft (2025). Fundamentals of garbage collection. Microsoft Learn (.NET documentation). (quote on page)
- `go-01-c1` "In 2007 Robert Griesemer, Rob Pike, and Ken Thompson started designing Go at Google."  
  The Go Authors (2024). Frequently Asked Questions (FAQ). go.dev. (quote on page)
- `go-01-c3` "Map iteration order is randomized to discourage reliance on it."  
  The Go Authors (2012). Go 1 Release Notes. go.dev. (quote on page)
- `js-01-c2` "JavaScript was designed in 10 days in 1995"  
  Opensource.com (Red Hat) (2019). JavaScript's surprising rise from the ashes of the browser wars on Command Line Heroes. Opensource.com. (quote on page)
- `js-01-c3` "console.log(x); var x = 5; doesn't crash. It prints undefined."  
  MDN contributors (Mozilla) (2025). let. MDN Web Docs. (quote on page)
- `py-01-c3` "A parameter's default value is evaluated once, when the function is defined, not on each call."  
  Python Software Foundation (2026). The Python Language Reference: Compound statements (Function definitions). Python 3 documentation (docs.python.org). (quote on page)

## No source found (26)

- `py-01-c1`: "Names live in namespaces (dictionaries, basically)." (The execution model page does not state that namespaces are dictionaries in general; not verified.)
- `py-01-c1`: "The LEGB rule (Local, Enclosing, Global, Builtin) defines lookup order." (Python reference describes the order piecewise but never names LEGB; no reputable page opened that states it.)
- `py-01-c2`: "Hints are widely adopted in modern Python (FastAPI, Pydantic, large codebases)" (No authoritative source opened for adoption claim.)
- `go-01-c2`: "Methods can be defined on any named type, though not on aliases" (Not searched; this is a basic language-spec point, lower priority than the dated and numeric claims in the other concepts.)
- `gdl-01-c1`: "The five geometries are grids (translations), groups (general Lie groups), graphs (permutations), geodesics (manifolds) and gauges (local frames), and together they partition the modern landscape." (Opened the arXiv abstract only; it does not state this mapping, and the full text was not opened.)
- `gdl-01-c2`: "Modern equivariant nets like NequIP use multiple irreducible representations simultaneously." (The Nature Communications NequIP page redirected to a cookie check and could not be opened, so nothing was verified.)
- `gdl-01-c3`: "which generalize convolution to any compact group" (The Cohen and Welling abstract mentions only discrete groups generated by translations, reflections and rotations, and does not say 'any compact group'. The lesson wording may overstate it.)
- `dl-01-c1`: "Backpropagation gets it by applying the multivariate chain rule to a directed acyclic computation graph." (Opened Baydin et al. but found no sentence stating this exactly; did not pursue further.)
- `dl-01-c3`: "Residual connections (ResNet, 2015) give the gradient an identity path that bypasses depth." (Not searched or opened this session.)
- `dl-01-c3`: "gradient clipping ... (typically 1.0)" (Pascanu et al. used a threshold of 6 in one experiment; no opened source gives 1.0 as typical.)
- `cpp-01-c1`: "The C++ standard runs to over 1500 pages, and few developers know all of it." (Did not fetch a page confirming page count; varies by draft and edition.)
- `cpp-01-c3`: "So modern C++ can use exceptions safely, without the resource leaks that plague Java/C# without try-with-resources." (Comparative claim about Java/C#; no source opened.)
- `csharp-01-c1`: "In 2000, Anders Hejlsberg and Microsoft produced C#, a managed, statically typed, multi-paradigm language." (Microsoft's C# history page opened gives only C# 1.0 release in January 2002 and does not mention Hejlsberg or 2000; no reputable page opened that states it.)
- `csharp-01-c1`: "The original .NET Framework (Windows-only, 2002) was followed by Mono, which ported it to other platforms" (No reputable page opened supports the ordering; Mono's development began around the same time as or before .NET Framework 1.0 shipped, so the 'followed by' wording is doubtful.)
- `csharp-01-c1`: "Well-written C# is competitive with Java and within 2-3× of optimized C++ on most workloads" (No authoritative source found for the 2-3x figure; benchmark-dependent and not stated by any page opened.)
- `csharp-01-c3`: "Server GC (default for ASP.NET) uses multiple threads and is optimized for high allocation rates" (The Microsoft page opened says server GC uses dedicated threads per logical CPU, but states that for hosted apps such as ASP.NET the host determines the default flavor, and says nothing about high allocation rates.)
- `js-01-c2`: "JavaScript was designed in 10 days in 1995 and shipped before bad decisions could be reverted." (The 10 days in 1995 part is sourced; the 'shipped before bad decisions could be reverted' part was not stated by any page opened.)
- `js-01-c3`: "ES6 (2015) introduced let and const, which are block-scoped and have no surprise hoisting" (The MDN pages opened did not name ES6/ECMAScript 2015; the ECMAScript spec page was truncated, so the introduction date was not confirmed.)
- `js-01-c1`: "0.1 + 0.2 === 0.3 is false, since it actually comes out as 0.30000000000000004" (No page opened in this session stated this.)
- `c-01-c1`: "That trust suits systems programming (kernels, drivers, embedded, runtimes), and it has also been the source of decades of memory-safety bugs." (Only the NSA/CISA and Chromium pages state prevalence figures. The NSA page and PDFs returned 403, the CISA pages I opened gave no prevalence statement, and the Chromium project page was not opened and is not on the allowed source list.)
- `info-01-c1`: "In 1948, Claude Shannon's A Mathematical Theory of Communication founded an entire field." (Britannica and Nokia Bell Labs pages returned 403; the Shannon paper itself does not say it founded a field, so no opened source states it.)
- `info-01-c1`: "A 1-in-1024 lottery win is about 10 bits of surprise." (Arithmetic (log2 1024 = 10), not a sourced claim; no specific source sought.)
- `db-01-c1`: "In 1970, IBM researcher Edgar F. Codd published a paper titled A Relational Model of Data for Large Shared Data Banks." (True per search results (CACM 13(6), 377-387, DOI 10.1145/362384.362685), but I could not open a page with a verbatim quotable sentence. The ACM and Britannica pages returned 403, and the university-hosted PDFs were scans or timed out. The IBM history page I opened gave only paraphrase and fragments, with no full sentence.)
- `db-01-c1`: "Mathematically, a relation is a subset of the Cartesian product of its column domains." (Could not read the Codd paper text (scanned PDFs, fetch timeout), and found no other opened authoritative page.)
- `db-01-c2`: "The database then refuses to insert an order with a customer ID that doesn't exist." (Only the Waterloo lecture PDF was fetched, and it was unreadable binary. The search summaries came from course notes and tutorials that I did not open, so I have nothing allowed to cite.)
- `db-01-c3`: "The rule of thumb is to normalize first, then denormalize where measurements show you must." (Search results were study guides, Scribd and Medium pages, which are not allowed. I opened no authoritative page (textbook or vendor docs).)

## Rejected (13)

- `dl-01-c2` "Forward-mode computes ∂y/∂x by propagating tangents forward alongside the values": quote not found on page (https://arxiv.org/pdf/1502.05767)
- `info-01-c2` "English text has roughly 1.0–1.5 bits per character of entropy despite using 8-b": reviewer: Shannon 1951 says about one bit per letter (redundancy ~75%); the 1.0-1.5 range, 8-bit ASCII and compression claims are not on the page, so the claim is broader than the source. (https://sites.socsci.uci.edu/~rfutrell/teaching/itl-davis/readings/shannon1951prediction.pdf)
- `info-01-c2` "Shannon's source coding theorem makes this precise: you can't compress below H b": reviewer: Quote is the source/channel-capacity theorem (transmit at rate C/H over a channel), not the noiseless source coding statement about compressing no lower than H bits per symbol; mismatch, and quote is truncated.; quote not found on page (https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf)
- `cpp-01-c2` "If you write any of {destructor, copy constructor, copy assignment operator}, yo": reviewer: C.21 says to define or delete all five special functions. The claim is the classic Rule of Three (probably need all three), which is narrower, so the source does not match it exactly. (https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- `cpp-01-c2` "Modern C++ adds the Rule of Five (also move constructor and move assignment) and": reviewer: The C.20 quote only supports the Rule of Zero. The Rule of Five is in C.21 and the claim is a compound statement, so the quote and source do not support the whole claim. (https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- `csharp-01-c1` "Modern .NET (since .NET 5, 2020) is the single cross-platform .NET going forward": reviewer: The page says .NET 5 is 'the main implementation of .NET going forward'. The claim says 'the single cross-platform .NET', which is stronger. The page also states .NET Framework 4.x is still supported. (https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-5)
- `csharp-01-c3` "Short-lived objects almost never reach Gen 2": reviewer: The page says 'most objects' are reclaimed in generation 0. The claim says short-lived objects 'almost never' reach generation 2, which is a stronger statement than the page makes. (https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)
- `go-01-c1` "There are no exceptions, no generics until 2022, no inheritance, no operator ove": reviewer: The Go 1.18 blog post only supports generics arriving in 2022. It says nothing about exceptions, inheritance, operator overloading, implicit conversions, constructors or destructors, so the claim is much broader than the source. (https://go.dev/blog/go1.18)
- `js-01-c1` "The number type is a 64-bit IEEE 754 float, and there are no separate integer an": reviewer: Page has the 64-bit IEEE 754 sentence but never states that there are no separate integer and float types. The claim goes beyond the quote. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- `js-01-c1` "typeof null returns 'object', a famous bug from JavaScript's first 10 days that ": reviewer: Page says a fix was rejected. It says nothing about the bug dating from the first 10 days or about the web breaking, so the claim is broader than the source.; quote not found on page (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- `js-01-c3` "const means the binding can't be reassigned, though the value can still be mutat": quote not found on page (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- `py-01-c1` "It has only names bound to objects.": reviewer: The page says names refer to objects and are introduced by binding. It does not say Python has 'only' names bound to objects, which is the lesson's broader mental-model claim. (https://docs.python.org/3/reference/executionmodel.html)
- `py-01-c2` "Modern Python adds type hints (PEP 484, 2014) that look like def add(x: int, y: ": reviewer: PEP 484 exists, with the right authors and a 2014 creation date. But the quote ('no type checking happens at runtime') backs the runtime-ignores-hints point, not the claim that hints were added in 2014 with this syntax. The claim also uses a different example from the PEP's own. (https://peps.python.org/pep-0484/)
