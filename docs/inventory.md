# Inventory: the existing interactive work, and what the course can build on

*Prompt A, Phase 1. Written before any new code. The author reviews this before Phase 2 starts.*

This document catalogues every interaction in the corpus the build prompt names, records the
result of running each repository's own tests, and concludes with a proposed layering, the
candidate shared primitives, the reuse decision for each tutorial, the duplication to consolidate,
what is not understood well enough to reuse, the toolchain continuity case, and one decision the
prompt leaves open: how the two target repositories split the work.

## 0. What reuse means for each part of the corpus

The prompt fixes this, and the inventory applies it throughout:

- **The two books** (*Parquet, byte by byte* and *Queries, operator by operator*) share no runtime
  with the course: Rust compiled to WebAssembly and Python under Pyodide, inside Make + Python +
  MyST sites, against TypeScript here. They are studied for **patterns**: which interactions work,
  how a lesson is declared, how tests and traces are presented. No code is extracted from them.
- **The five digital-design tutorials** are the only **code-level** reuse candidates. They may be
  wrapped, refactored or absorbed. Section 5.3 gives the verdict for each.
- **The platform** the course shares with the books is the **interaction vocabulary** (inspect,
  predict, step, experiment, break, explain, drill down, replay) and the **lesson data format**,
  not a code library.
- **The computer-systems book** is a prose and doc-site reference for tone and structure. It has
  no interactives.
- **Sizing and TCO** (`snowch/sizing-and-tco`) joined the corpus after the first draft of this
  inventory, at the author's request. It is the origin of the two books' tooling, has interactives
  of its own, and is where the author's prose process (a Haiku subagent drafts, the managing model
  checks facts) and two-half review process are written down. Patterns only, as for the books:
  sections 3.4 and 4.1.

## 1. The corpus as found

Two things about the corpus differ from how the prompt describes it, and both matter for what
follows.

**The five tutorials are not five repositories.** They are five files in one directory of the
author's personal site, `snowch/snowch.github.io`, under `digital-design/`, rendered by MyST
(`myst build --html --execute` in GitHub Actions) and published at the five URLs the prompt
lists. Four are Jupyter notebooks whose code cells are hidden (`remove-input`) and produce static
matplotlib, graphviz and svgwrite figures at build time. One is a Markdown file of tables.

**Only one of the five contains an interaction**, and it is not in a notebook. The "interactive"
tutorial is a notebook with one static block diagram and a link to `d-flip-flop-viz.html`, a
hand-written page of plain HTML, CSS and JavaScript (540 lines) that steps through eight
hard-coded snapshots of a rising clock edge on a Canvas. Everything else in the five is prose,
tables and pictures.

| Item | Where it lives | Form | Size | Tests |
|---|---|---|---|---|
| D flip-flop tutorial | `snowch.github.io/digital-design/d_flipflop_tutorial.ipynb` | notebook, 26 cells, 9 hidden matplotlib cells | 339 KB (embedded PNG outputs) | none |
| Interactive D flip-flop | `…/d-flip-flop-interactive.ipynb` + `…/d-flip-flop-viz.html` + `…/d-flip-flop-viz.jpg` | notebook (3 cells) linking to a static HTML page; MyST copies the page to `/build/d-flip-flop-viz-<hash>.html` | 7 KB + 19 KB + 184 KB screenshot | none |
| Latches and flip-flops quick reference | `…/latches_flipflop_quick_ref.md` | Markdown tables and admonitions | 2.3 KB | none |
| Timing diagrams tutorial | `…/timing_diagrams_tutorial.ipynb` | notebook, 19 cells, 6 hidden matplotlib cells | 33 KB | none |
| FSM tutorial | `…/fsm_tutorial.ipynb` | notebook, 43 cells; graphviz (4 cells), svgwrite (4), matplotlib (4) | 77 KB | none |
| Author's gap list | `…/DIGITAL_DESIGN_TODO.md` | the topics missing before computer architecture, with a suggested "more notebooks, wavedrom for timing" plan | 3.5 KB | n/a |
| Parquet book | `snowch/parquet-book` | Make + Python + MyST site; Rust reader (also WASM) and a Python twin; labs in plain ES modules (`web/lab/`, about 1,900 lines) | 16 chapters, 5 experiments | cargo, pytest, Playwright |
| Query-engine book | `snowch/query-engine-book` | same tooling, Python only; DuckDB reference; labs in plain ES modules (about 2,000 lines) | 19 chapters planned, 5 experiments | pytest, Playwright |
| Computer-systems book | `snowch/computer-systems` | MyST book; measurements stamped as JSON; no browser code beyond a stylesheet | 32 chapters | pytest |
| Sizing and TCO | `snowch/sizing-and-tco` | MyST parses, the repository renders; a model-as-code DSL and a Monte Carlo toolkit in Python; an interactive model viewer and a one-future-at-a-time page in plain ES modules (about 1,500 lines); graders under Pyodide; a browser review script; per-chapter videos in Git LFS | 24 chapters and the appendices | pytest, model and figure checks, `make review` |

The author's gap list is worth a sentence: it names the same missing topics the Prompt B
curriculum covers (combinational building blocks, arithmetic, memory, HDL, counters) and planned
to fill them with more notebooks. The prompt supersedes that plan with an interaction-first
runtime; the list confirms the content gap is real and already recognised.

## 2. The existing tests, run

Every repository's own suite was run in this container before anything else. The container has
Node 22, Python 3.11, rustup, Playwright 1.56 with Chromium, and no MyST, no RISC-V toolchain and
no QEMU.

| Repository | What was run | Result | Not run here, and why |
|---|---|---|---|
| `snowch.github.io` (the tutorials) | There is no test suite. The nearest check is what CI does: execute the notebooks. All four `digital-design` notebooks were executed with `nbclient` after installing graphviz, matplotlib, numpy, svgwrite. | All four execute with no error outputs (4.4 s, 1.6 s, 3.5 s, 2.9 s). Side effect: the FSM notebook writes eight SVG files into the source directory (`kmap_*.svg`, `state_encoding.svg`, `grouping_*.svg`); they are untracked, so the build regenerates them each time. | The full `myst build --execute` of the whole site: MyST is not installed, and the site's other notebooks need torch, mlflow and pinecone. |
| `parquet-book` | `rustup` installed the pinned 1.94.1 toolchain and the wasm target; `cargo test --workspace`; the wasm build; `pytest tests python/tests exercises/python`. | Rust: 115 passed, 0 failed, 43 ignored (the problem stubs, ignored by design). wasm build: ok. Python: 683 passed, 43 skipped (problem stubs), 113 s. | ruff, fmt, clippy; `fixtures/generate.py --check`; `pqlab figures --check`; the MyST parse, site render and link check (no MyST); the browser smoke test (needs the rendered site). |
| `query-engine-book` | Submodule `external/parquet-book` initialised; pinned `duckdb==1.1.2`, `pyarrow==18.1.0`; `pytest -q`. | 1031 passed, 227 skipped (problem stubs and the Pyodide parity cases), 288 s. | Same MyST-dependent stages; the browser checks (panels, workbench, edits, timings, site). |
| `computer-systems` | Submodule `xv6/xv6-riscv` initialised; `scripts/verify-setup.py`; `pytest tests/ -m "not problem"` as CI runs it. | 1698 passed, 56 skipped, 1 failed, 4 errors. The failure (`test_disasm`) and all four errors raise `ToolchainMissingError`: no `riscv64-linux-gnu-gcc`. The skips name the missing cross compiler, `qemu-system-riscv64`, and the board. | Everything that needs the cross toolchain, QEMU or the Raspberry Pi: `ci-check.sh`'s `bench.run_*  --check` stages. `make test` without the marker also runs the 213 problem stubs, which fail by design. |
| `sizing-and-tco` (added later) | Pinned `numpy`, `Pint`, `PyYAML`; `scripts/build-stamp.py` (which `ci-check.sh` runs before pytest; without it one anchor test fails on a fragment the stamp writes); `pytest tests/ -m "not problem"`; `verify-models.py`; `verify-numbers.py`. | 1661 passed, 75 skipped, 304 problem stubs deselected, 184 s. The skips need the MyST parse or a page type the test does not apply to. `verify-models`: 4 models OK. `verify-numbers`: 46 result files verified, 1 figure awaiting a measurement, as the book says. | The MyST build, the site render and link check, the offline install, and `make review` (needs the network and a browser). |

Two lessons for the course's own test design come out of this. First, every book keeps a single
`scripts/ci-check.sh` that is exactly what CI runs, so a laptop and CI cannot drift; the course
should do the same with one `npm run check`. Second, problems that fail until solved are
deselected from the suite rather than skipped silently, and a scaffolding test beside each proves
it is answerable. The course's challenges need the same split: the reference solution passes the
challenge's tests in CI, and the shipped stub does not.

## 3. Interaction catalogue

Each row records where the interaction lives, what it does, which of the eight vocabulary words
it implements, whether it is a pattern to copy or code to reuse, whether it is already reusable,
domain-specific or needs a small abstraction, and where it is duplicated.

### 3.1 The digital-design tutorials

| Where | What it does | Vocabulary | Pattern or code | Reusability | Duplicated |
|---|---|---|---|---|---|
| `d-flip-flop-viz.html`: controls | Previous, Next, Reset over eight hard-coded steps. An `autoPlay()` function exists but no control calls it. | step, replay | code (plain JS); pattern: a stepper whose every step carries a title and an explanation | domain-specific and not a simulation: the steps are a hand-written table, not the output of a model | the same prev/next/reset shape as the Parquet book's token stepper |
| `d-flip-flop-viz.html`: canvas timeline | Two voltage traces (master enable, slave enable) drawn up to the current step against a threshold line, with a cursor. | inspect (read-only) | pattern: a timeline with a cursor and a threshold | Canvas 2D (the prompt wants SVG); the two traces are told apart by colour alone | the same waveform-over-time idea as every matplotlib figure in the notebooks |
| `d-flip-flop-viz.html`: latch state boxes | MASTER and SLAVE boxes showing TRANSPARENT, HOLDING, CLOSING, OPENING and the held value, with a blinking "CAPTURING!" overlay at the hand-off. | inspect, explain | pattern: a per-component state inspector beside the timeline | domain-specific; the states are strings in the step table | none |
| `d-flip-flop-viz.html`: step text | A title and a paragraph per step, written to explain the threshold crossing and the inverter delay. | explain | pattern: causal narration per step ("what changed, and why") | the text is tied to the eight hand-written steps; its numbers (threshold crossing at 0.35 ns, hand-off at 0.55 ns) are illustrative, not computed, and not internally consistent (the slave is said to open when the inverted clock crosses the threshold, though the legend says the slave's enable is CLK itself) | the master/slave story is told three times across the three D flip-flop files, with two different clock polarities (see 5.5) |
| D flip-flop tutorial: timing-diagram figures (edge capture, timing parameters, async reset, sync reset, enable) | Static matplotlib waveforms of CLK, D, Q and a control signal, with annotations. Each figure's signal pattern is chosen to show one behaviour and the prose explains why that pattern. | explain | the plotting code is Python and cannot be reused; the **signal patterns and the expected Q sequences** are reusable as test vectors and lesson data | content reusable, code not | the waveform plotting code is re-implemented in five cells of this notebook, six of the timing tutorial and one of the FSM tutorial |
| D flip-flop tutorial: symbol, register, shift-register block diagrams | Static matplotlib drawings. | explain | content; the drawings will be live circuit views | not reusable as code | none |
| D flip-flop tutorial: "why timing parameters exist" (RC charging, transistor as switch plus resistance) | A physics figure and prose: setup, hold and clock-to-Q as capacitor charging. | explain | pattern and content: the physical-intuition note the curriculum assigns to Module 1 and the model-vs-reality notes in Module 4 | prose reusable | none |
| D flip-flop tutorial: truth tables and parameter tables | Markdown tables (CLK/D/Q(next); setup, hold, clock-to-Q with typical values). | explain | data | reusable as structured data the simulator is tested against | the same tables appear in the quick reference |
| Interactive notebook: master/slave block diagram | Static matplotlib. Its labels say the master is active when CLK is HIGH and the output changes at the falling edge. | explain | content | contradicts the tutorial's rising-edge truth table and the viz page's polarity (5.5) | yes: three tellings, two polarities |
| Quick reference | Latch vs flip-flop table; SR latch, D latch, D, JK flip-flop truth tables; timing constraints; selection guide. | explain | data | reusable as-is as structured reference data, and as the oracle for the simulator's component tests | overlaps the tutorial's tables |
| Timing diagrams tutorial: signal types, bus notation, memory read, handshake, pipeline, glitch | Seven static matplotlib figures with a "why these specific values" paragraph each. | explain; the glitch figure is a static **break** example | content; the glitch case (`Y = A AND NOT B`, both inputs rising together) is a ready-made fault experiment for the propagation-delay mode | content reusable; code not | waveform code duplicated as above |
| FSM tutorial: state diagrams (toggle, Moore and Mealy sequence detector, traffic light, counter, arbiter) | graphviz SVG. | explain | content; the examples are the standard textbook ones (5.3) | not reusable as code; the examples should not be reused as examples | none |
| FSM tutorial: state tables, encoded state table, encoding schemes | Markdown tables and one matplotlib figure. | explain | content and data | the table-to-hardware chain is exactly what Slice 2 shows live | none |
| FSM tutorial: K-maps (template, D1, D0, Z, grouped) | svgwrite SVGs and a matplotlib figure of the three maps with groupings and equations. | explain; drill down (static): table to map to equation | content | minimisation is Module 2 and 3 material in the curriculum; Slice 2 does not need it (5.3) | the svgwrite helpers (`rounded_box`, `label`, `arrow`) are copied verbatim into three cells |
| FSM tutorial: FSM architecture figure and timing trace | A block diagram (next-state logic, two D flip-flops, output logic) and a twelve-cycle trace of CLK, X, state, Z. | explain | content; the trace's input pattern and the reasons for it are reusable as a test vector | reusable as data | none |

The honest summary: across the five tutorials the vocabulary implemented is **explain** (all),
**step** and **replay** (the viz page only), and **inspect** in the weak sense of reading a
static picture. Nothing lets the learner predict, experiment, break, or drill down. The content,
the chosen examples and the explanatory sequencing are good and are the reason the tutorials are
canonical candidates; the mechanism the prompt wants is absent and must be built.

### 3.2 The Parquet book's laboratory (`web/lab/`)

| Where | What it does | Vocabulary | Pattern or code | Reusability | Duplicated |
|---|---|---|---|---|---|
| `footer.js` (`FileViews`): three coordinated views | Bytes (`HexView`), structure as the reader parsed it (`StructureTree`), and an `Inspector`, each pointing at the others. Selecting a byte opens the tree to the deepest node containing it; selecting a node highlights its bytes. | inspect, drill down | pattern | the coordination (`pathTo`, `reveal`, `highlight`) is the generic part; the byte and Thrift details are domain | none |
| `hexview.js`: `dimOutside(spans)` | Dims every byte the reader never requested, from the reader's own request trace. | inspect (a trace made visible) | pattern: show the trace, never a drawing of it | generic idea: "what did the mechanism actually touch" | the request timelines in `scan.js` and `changes.js` show the same trace as lanes |
| `inspector.js`: byte edit and restore | Change one byte; the file inside the WebAssembly module changes and every panel recomputes from the damaged file; "Restore the original file". | break, replay | pattern: fault injection is an edit to the model's input, and everything downstream recomputes | generic shape (edit, recompute, restore) | the smoke test damages the closing magic and checks the reader refuses |
| `inspector.js`: interpretations | The selected bytes shown as every integer width, byte order, varint and Thrift header the reader can compute, under the path breadcrumb. | inspect, explain | pattern: a state inspector offers alternative readings of the same state | generic shape; domain readings | none |
| `compression.js`: token stepper | Previous and Next token; the current token highlights its input bytes in the hex view, its output bytes, and for a copy, the earlier bytes it copied. Clicking a token jumps to it. | step, inspect | pattern: a stepper whose current step drives highlights in two other views | generic stepper; domain highlights | prev/next/reset also in the viz page |
| `scan.js`, `changes.js`: request timelines | Requests on lanes by connection over simulated time; each request's dependency on an earlier one is visible as waiting. A strategy picker reruns the scan. | inspect, experiment | pattern: a lane timeline with totals | the lane-timeline drawing is written twice, near-identically, in the two files | yes (within the book) |
| `workbench.js` | Edit the chapter's Python stub, run its pytest graders in the page under Pyodide, see pass/fail per test with messages, keep the text in `localStorage` under `problems:<chapter>`, restore the stub, download. | experiment, explain | pattern: problems are tests; graders run where the learner is; failure messages teach | the shape of the course's TestHarness and learner-state persistence | the query-engine book has the same workbench |
| `commands.js` | Run buttons on printed commands that the page can run; "Open in Codespaces" on commands that need a compiler. | experiment | pattern only | not applicable: the course has no shell | none |
| walkthrough steps (`Edit and Run`) | A quoted program the learner edits and runs in place; the chapter asks for one change and says what to look for. | experiment, break | pattern: "change one thing, watch the mechanism" | applies directly to the HDL panel | the query-engine book's `edit.js` generalises it |
| data attributes (`data-state`, `data-footer-length`, `data-requests`, `data-token` and so on) | Every panel writes the facts it drew into `dataset`, so a browser test can hold the drawing to the native reader's answer. | (testing) | pattern: the educational test reads what the panel claims and compares it with the engine | generic | both books |
| `tests/browser/smoke.mjs` | Drives every chapter: panels draw what the native reader computes; damage and restore; workbench stubs fail in the page as at a desk; Run buttons print what the desk prints; layout holds on a phone; the cover, resume and home-screen behaviour. | (testing) | pattern: the "educational level" test the prompt asks for already exists in spirit | generic method | both books |

The book's invariant is the one the course should adopt word for word: **the interactive UI is a
view of the implementation, never a scripted animation.** The viz page violates it; every panel
in the two books honours it.

### 3.3 The query-engine book's laboratory (`web/lab/`)

| Where | What it does | Vocabulary | Pattern or code | Reusability | Duplicated |
|---|---|---|---|---|---|
| `lab.js`: the build draws first | The panel's JSON is computed at build time and embedded in the page; the panel draws with nothing to download. "Run it in your browser" recomputes under Pyodide and the page says whether the answer is the build's (`data-agrees`). | replay, explain | pattern: the page states whether the live run agrees with the reference | the course always runs live, but "the learner's circuit agrees with the reference" is the same check | none |
| `gather.js`, `branches.js`, `pruning.js`, `measure.js`: predict, then reveal | Each case shows what the learner predicts from, a box for the prediction, and every measurement hidden. Bars are scaled to the references alone so no length gives the answer away. After the reveal: three bars on one scale (your prediction, the reference, the measurement) and the counters. Predictions and the reveal persist in `localStorage`; "Predict again" clears them. | predict, explain, replay | pattern: the strongest prediction interaction in the corpus, with its research justification written in `spikes/panels/README.md` | the `bar()`, `predictionBox()` and saved-state code is copied verbatim into four files | yes, four times within the book |
| `plan.js`: variants | Buttons for query variants the build computed; before them, a question: "which operators will this change reach, and will their estimates move, their measurements, or both?" | predict, experiment | pattern: ask before the button | generic | none |
| `lab.js`: edit the query | The learner's edit runs through the same report; it is kept in storage, never compared with the build, and a broken query reports the engine's error in the status line while the last drawing stays. | experiment, break | pattern: an edit is never compared with a reference it did not run against; errors are reported, not hidden | directly the HDL editor's behaviour | none |
| `edit.js`: edit a listing of the engine | The learner's text runs in place of the engine's own code, then the page runs what the block names (a panel, a script, some tests) and undoes the edit. Figures computed for the book's query get a "stale" note while an edit is live. | experiment, break, explain | pattern: editable implementation with a visible consequence, and honest marking of what no longer matches | the stale-note idea applies when a learner edits HDL and the circuit view lags | none |
| `timed.js` | Times cases live in the browser; never a stored time. | experiment | pattern only | not applicable | none |
| `workbench.js` | As the Parquet book's. | experiment | pattern | as above | yes (across the two books, by design: "a fix to shared tooling is worth making in both") |
| storage keys | Every key is named for the book (`lab:<path>:…`, `edit:<book>:…`, `problems:<chapter>`) because the books share the origin `snowch.github.io`. `tests/browser/site.mjs` checks the site under its base path on a shared origin. | (platform) | rule to adopt | the course will be served from the same origin and must namespace its keys and use relative URLs | both books |
| `tests/browser/panels.mjs`, `workbench.mjs`, `edits.mjs`, `timings.mjs`, `site.mjs`, `chromium.mjs` | The panel asks before it answers and hides every measurement; predictions survive a reload; the live rerun agrees; an edited query draws the desk's answer for the same text; a broken one reports the error; reset and "Predict again" work; without JavaScript the panel says so. The workbench's shipped stubs fail with their own `NotImplementedError`, a wrong answer fails on the graders, the text is kept, reset restores. `chromium.mjs` serves the built site from disk through Playwright's route handler, with no local server, because the sandbox's proxy intercepts even loopback traffic. | (testing) | pattern: this is the "educational level" test list the prompt asks for, already worked out | generic method; and the no-server technique is needed in this very container | none |

### 3.4 Sizing and TCO: the viewer, the futures page, the graders and the review process

| Where | What it does | Vocabulary | Pattern or code | Reusability | Duplicated |
|---|---|---|---|---|---|
| `sizing/viewer/app.js`: the model page | The dependency graph coloured by node kind and provenance; an input UI generated from each node's declared range; every slider recomputes every point value at once; the distribution on any node; the tornado; a Details view per node with its label and provenance source. | inspect, experiment, drill down, explain | pattern | the generic shape is "move an input, everything downstream recomputes, and the page says what is now off the stamped scenario" | the graph and the input UI are generated from the model, so there is one copy |
| `sizing/viewer/evaluate.js` with `tests/test_viewer.py` | A second implementation of the arithmetic, in the browser, held to Python's by a test over every node of every model. The page never resamples in JavaScript: a second sampler would be a second answer nobody verified. | (correctness) | pattern: a second implementation is a liability unless a test pins it to the first | applies directly: the HDL elaborator and the circuit builder both produce netlists, and the same test vectors run against both | none |
| resample under Pyodide (`sizing/playground/driver.py`) | The same sampler with the same seed runs in the page with the inputs the reader fixed. With nothing moved it first shows that it reproduces the stamped result, then the reader trusts it with a change. | replay, explain | pattern: agreement with the reference before trust | the course's challenge runner states agreement between the learner's circuit and the reference the same way | the query-engine book's "Run it in your browser" is the same check |
| `sizing/viewer/futures.js`: one future at a time | One press, one draw: every input jumps to that future's value, the fleet is worked through once, the answer drops onto the pile, and ticks accumulate under each input. The clustering is drawn, not asserted. | step, experiment, explain | pattern: one step at a time with the accumulation left visible | the course's "one clock edge at a time, the trace grows" is this shape | none |
| `growth-explorer.js`, `growth-shapes.js` | Calculators inlined in a page whose formulas arrive from the DSL in data attributes, so the page computes what the model computes. Defaults are the model's point values; teaching choices are declared beside the formulas and said on the page. | experiment | pattern: parameters come from the model, and a teaching choice is labelled as one | the lesson's initial state and its model-versus-reality note | none |
| `checker.html` with `driver.py check` | Paste a model file; the verifier the build runs over the book's own models runs over it, and refuses a limit with no headroom with the repair named. | break, explain | pattern: the learner's checker is the build's checker | the HDL subset's gating and warnings run through one code path in the tests and in the page | none |
| the Check under each problem (`driver.py grade`, `playground/toolkit.py`) | pytest itself, under Pyodide, over the chapter's own test file against the stub as the reader has it; counts only the marked tests, so a desk and the page give the same verdict. "Nothing here reimplements anything." | experiment, explain | pattern: the books' workbench, and its origin | the course's ChallengeRunner | the two books' workbenches |
| `scripts/review-pages.py` | The mechanical half of a review: every page at five widths and in the dark theme; every Expand opened and closed with Escape; every slider at both ends, looking for NaN, Infinity or undefined; every node's Details written out; console errors, failed requests, broken links and anchors, images without alt text, controls with no accessible name, contrast in both themes, wording that assumes a mouse; every Check with the stub unchanged and with a reader's wrong attempts typed in. Severities: blocks, hides, look. | (review) | pattern: most of the prompt's accessibility list, made executable | the Playwright educational suite absorbs most of it; the rest is a Phase 2 script | none |
| `.claude/skills/editorial-review/` | The reading half: one subagent per page with a written brief; a cold read as someone who has read every earlier page and none after; every finding quotes the page; a direction, never a rewrite; verify before assert; never an answer in a review; one merged report with a "fix first" list of faults that recur across pages. | (review) | pattern | a lesson-review skill in Phase 2 | none |
| `CLAUDE.md` §6, `STYLE.md`, `tests/test_vocabulary.py`, `tests/test_book.py` | The prose process (section 4.1); twenty-four style rules and two closing passes, with a test that the checklist runs every rule; a six-word vocabulary ration enforced by a test that reads each word's home chapter from the glossary, with `% word-ok:` as the escape; every glossary term defined in a box in its home chapter; no product named; every chapter ends on a problem about the reader's own system. | (authoring) | pattern: an authoring rule with a check behind each | the course's `docs/style.md` (copied), `CLAUDE.md` (adopted), and a per-lesson term gate with a test in Phase 2 | none |
| `chapters/notebooklm/*.mp4`, `video/littles_law.yml`, `scripts/build-video.py` | Per-chapter video summaries kept in Git LFS, and a scripted video build. | (passive media) | not adopted: the prompt prefers animation the learner drives and that answers "what changed, and why" | not inspected in depth; the LFS objects are not served to this container | none |

### 3.5 The computer-systems book: patterns without interactives

| Where | What it does | Vocabulary | Reusable as |
|---|---|---|---|
| `ORIGINALITY.md` | One entry per chapter, in the same commit as the chapter: the works closest in subject and how this chapter's structure, examples and figures differ. `tests/test_book.py` fails a finished chapter without one. | explain | the lesson format's `originalityNote` field, with a test that every lesson has one |
| `bench/outline.py` and the seven-part shape | The book's shape as data; every chapter must carry the same headings in order; a chapter's identity is its slug, its number is derived. | (authoring) | the lesson schema and its validator; lesson identity by slug |
| "What this cannot tell you" (and the Parquet and query-engine books' section of the same name) | Every chapter names what its model, measurement or code leaves out, and where the limit is lifted. | explain | the lesson format's model-vs-reality note, as a required field |
| "No number typed into prose"; stamped results; `pending` figures that render as a warning rather than a placeholder | Every figure traces to generated data; a missing measurement is declared, never faked. | (authoring) | in the course: every waveform and table in a lesson is drawn from the simulator's trace, and a lesson test asserts the drawn values are the trace's |
| Problems are tests; `@pytest.mark.problem` deselected in CI; scaffolding tests prove answerability | | experiment | the challenge split described in section 2 |
| Voice rules (`CLAUDE.md` §7): say it, do not perform it; lead with the point; name the concrete noun; British English, no em dashes | | explain | the course's prose rules |

### 3.6 Vocabulary coverage

| Word | Tutorials | Parquet book | Query-engine book | Sizing and TCO | Course needs it from |
|---|---|---|---|---|---|
| inspect | static pictures only | hex, tree, inspector, counters, timelines | plan tree, counters | the graph, a node's Details, the distribution on any node | Slice 1 (signal table, latch internals), Slice 2 (state bits, D inputs) |
| predict | no | no (walkthroughs ask "what will this print" in prose) | the centre of every panel | no (the futures page shows a spread rather than asking for one) | both slices (one challenge per transition type in Slice 2) |
| step | the viz page only | token stepper | no | one future at a time | both slices (clock edges, propagation-delay steps) |
| experiment | no | choose a file or strategy, edit a step | variants, edit the query or the engine | sliders, resample with inputs held, the calculators | both slices (move D against the clock; change an encoding) |
| break | a static glitch figure | edit a byte; damage the magic | a broken query; an edited engine that fails its tests | the checker refuses a pasted model; wrong attempts under a Check | both slices (setup/hold violation; faulty encoding) |
| explain | prose and figures | inspector readings, status lines, "what this cannot tell you" | status lines, stale notes, "what this cannot tell you" | provenance colouring, Details, the agreement line before a resample, "what this cannot tell you" | every lesson section; diagnostic feedback |
| drill down | implicit, static (diagram to table to map to circuit) | byte to node and node to bytes | operator to counters | graph to node to provenance source | Slice 2 (state diagram to register bits to logic to flip-flops to gates) |
| replay | reset to step 0 | restore the original file | predict again; rerun in the browser | the same seed reproduces the stamped result; draw again | both slices (replay a recorded experiment, including a recorded metastability draw) |

## 4. Authoring infrastructure, as it exists

How the corpus declares, styles, tests, builds and deploys a lesson, and what the course keeps.

| Concern | Tutorials | Books | The course keeps |
|---|---|---|---|
| Declaring a lesson | a notebook or Markdown file listed in `myst.yml`'s TOC | a Markdown page whose headings must match `CHAPTER_SHAPE` in `tools/outline.py`; experiments as fenced blocks (` ```lab `, ` ```problems `, ` ```run `, ` ```timed `) that the renderer turns into mount points | the shape-as-data idea, as a typed lesson schema with a validator; interactives declared in the lesson data, not fenced in prose |
| Prose | Markdown in notebook cells, with LaTeX | MyST Markdown, quoted code via `{literalinclude}` text anchors, generated numbers via `{include}` | Markdown strings inside lesson data, rendered by the runtime (so prose authoring survives the stack change); maths via KaTeX where a lesson needs it |
| Figures | matplotlib, graphviz, svgwrite at build time | JSON computed by the implementation, drawn by plain ES modules in the browser | SVG React components drawn from the simulator's traces; no figure is a picture of a number the engine did not produce |
| Styling | the MyST book theme plus `custom.css` | one `book.css` per book with colour tokens for both themes; `lab.css` per lab; phone layouts checked in the browser test | plain modern CSS with custom properties, light and dark, phone first, reduced motion respected |
| Learner state | none | `localStorage`, keys namespaced per book because books share the origin | namespaced, versioned `localStorage`; completion never trusted without a re-run |
| Testing | none | `cargo test`/`pytest` for the engine; `test_book.py` for the shape and the no-pasted-code and banned-word rules; Playwright for "the page draws what the engine computed" | Vitest for engine and schema; Testing Library for runtime components; Playwright for the educational level |
| Build | `myst build --html --execute` | `make`: engine, figures, MyST parse, the repository's own renderer | Vite |
| CI | one deploy workflow | one `scripts/ci-check.sh` identical locally and in CI; a separate deploy workflow | one `npm run check`; deploy to Pages with a configurable base path |
| Deploy | GitHub Pages, user site | GitHub Pages, project sites under a base path, every URL relative | GitHub Pages project site at `snowch.github.io/digital-design/`; the path is free today (it returns 404) and the published viz page lives under `/build/`, so nothing is shadowed |
| Who writes the prose | not recorded | the model, directly, under each book's voice rules; in Sizing and TCO a Haiku subagent drafts from a fact brief and the managing model checks facts only | the Sizing and TCO process from the first lesson: `CLAUDE.md`, `docs/style.md`, section 4.1 |
| Reviewing a page | nothing | Sizing and TCO: a mechanical half (`scripts/review-pages.py`: five widths, dark theme, every control, every slider end, every Check with wrong attempts) and a reading half (one subagent per page with a written brief), merged into one report with a "fix first" list | both halves: the mechanical half inside the Playwright educational suite, the reading half as a lesson-review skill, in Phase 2 |

### 4.1 How prose is written and reviewed

Sizing and TCO's `CLAUDE.md` records a process the other books do not have, and the course adopts
it from its first lesson. Reader-facing prose is drafted by a Haiku subagent from a brief that is
a list of facts, each checked against the model or the code before the brief goes out, with the
style checklist attached. Haiku writes shorter and plainer sentences than a model that has the
whole repository in its head, and it drops facts and gets them wrong, so the managing model
checks the facts and nothing else: a missing fact gets the fewest words that carry it, a wrong
draft goes back with a note, and no sentence is rewritten. Then the whole page is read once, which
is where repeats and broken joins show; a repeat is cut by the manager, a join that needs new
words goes back to Haiku. The book's own record of what went wrong is the useful part: briefed
sentence by sentence, the page said the same point three times running; merged by rewriting, the
drafts got their padding back; and three of the errors that reached a draft were the brief's.

The process was tried once in this repository, on the preamble of `docs/style.md`. Six facts went
out; about a hundred and ninety words came back in three paragraphs that pass the checklist. The
check found one wrong fact (the draft said a file exists that Phase 2 will write), two dropped
facts (a repository name, and the pointer to `CLAUDE.md`) and one meaning drifted ("before a
lesson is called finished" became "before it finishes"). Each was fixed by adding words. That is
the profile the author's `CLAUDE.md` predicts, and it is what the fact check is for.

The review process has two halves (section 3.4), and the author's build prompt for that book adds
three rules the skill files do not state: reviewers over-call, so each finding is attacked by an
independent sceptic before anyone acts on it; a model cannot audit itself, so the findings that
matter most are about one's own recent edits; and a cold read gives the reviewer one page plus
every page before it and nothing else. `AUTHORING_GUIDE.md`'s list of what no check can catch
(a claim about the repository's own state, a word with two meanings on one page, a definite
article before an unintroduced noun, a term working before it is defined, a table nobody chose,
the same argument twice, a number spelled as a word) is carried into the course's `CLAUDE.md`
with the digital-design words that will trip it: *state*, *input*, *cycle*, *level*, *edge*.

## 5. Conclusions

### 5.1 Proposed layering, with the real modules

The code lives in one npm-workspaces repository (see 5.7 for why) with a package per layer, so
the eventual move of the platform packages to their own repository is a directory move.

```
apps/course                course shell: routes, navigation, progress, base path; renders lessons through the runtime
content/lessons            course content: one TypeScript module per lesson, typed by lesson-schema; prose as Markdown strings
packages/lesson-schema     the lesson data format (the platform contract): Lesson, Section, Challenge, Hint ladder,
                           TestVector reference, ModelVsReality, OriginalityNote; a validator every lesson test runs
packages/lesson-runtime    LessonRenderer and the ten section kinds; HintLadder; ChallengeRunner (runs a lesson's tests
                           against the learner's artifact and renders the Diagnosis); LearnerState (namespaced,
                           versioned localStorage; completion re-verified on load)
packages/primitives        shared interaction primitives. Empty at the end of Slice 1. Populated at Slice 2 under the
                           rule of two: Stepper, Timeline, StateInspector, DrillDown, PredictionChallenge, FaultInjector
packages/dd-views          digital-design interactives (React + SVG): CircuitView, TimingDiagram, TruthTable,
                           StateDiagram, StateTable, LatchInternals (the viz page's hand-off view, rebuilt on the
                           engine), HdlPanel
packages/sim               the simulation engine: Signal, Wire, Component interface (inputs, outputs, state, update,
                           serialise, test interface), Circuit, the combinational settle and the clocked step,
                           an optional propagation-delay mode, Probe, Trace, Snapshot and Replay, TestVector and
                           runVectors() returning a Diagnosis (failing inputs, actual, expected, first divergent
                           component); the metastability overlay as a separate, seeded, recorded module
packages/dd-model          the course's component library on the engine: gates, SR latch, D latch, master/slave D
                           flip-flop, register, FsmSpec and fsmToCircuit(), encodings, the fault library, and the
                           quick reference's truth tables as test data
packages/hdl               the SystemVerilog subset: lexer, parser, elaborator to a sim Circuit, generator from a
                           Circuit, per-lesson construct gating with plain messages, synthesis-style warnings
tests/educational          Playwright: every challenge completable with its reference solution, rejects a wrong
                           answer, deterministic across runs, resets cleanly, cannot be bypassed
```

Dependencies run downward only: `apps/course` → `lesson-runtime` → `primitives` → `dd-views` →
`sim` and `dd-model`; `hdl` depends on `sim`; `lesson-schema` depends on nothing. `content/lessons`
depends on `lesson-schema` and names components from `dd-views` and `dd-model` by id, not by
import, so a lesson stays data. Nothing in `sim`, `dd-model`, `hdl` or `lesson-schema` imports
React or touches the DOM; Vitest runs them without a browser.

### 5.2 Candidate shared primitives, under the rule of two

A primitive is extracted only when a second consumer needs it, and extracted from the second
consumer. In Prompt A the two slices are the two consumers: everything below is built
domain-specific inside Slice 1 and extracted at Slice 2, with both slices' tests green afterwards.
Each candidate is justified by at least two appearances in the corpus.

| Candidate | Corpus evidence (two or more places) | Slice 1 needs | Slice 2 needs | Verdict |
|---|---|---|---|---|
| **Stepper** | the viz page's prev/next/reset with a title and an explanation per step; the Parquet book's token stepper whose current step drives highlights in other views; Sizing and TCO's one-future-at-a-time page (one press, one draw, the pile grows) | step through clock edges and through the master/slave hand-off | step through transitions | extract at Slice 2 |
| **Timeline** | the Parquet book's lane timelines (`scan.js`, `changes.js`, written twice); the viz page's canvas traces with a cursor; every waveform figure in the notebooks | the timing diagram beside the circuit, with a cursor tied to the stepper | the FSM trace (CLK, inputs, state bits, outputs) | extract at Slice 2. The generic part is lanes of events over a time axis with a cursor and a selection; the waveform rendering (levels, edges, bus values, setup/hold shading) stays in `dd-views/TimingDiagram` |
| **StateInspector** | the Parquet inspector (one selection, many readings, a path breadcrumb); the viz page's latch state boxes; the query-engine panels' counters under each case; Sizing and TCO's node Details (label, kind, provenance source) opened from the graph | latch state (transparent, holding), held value, Q and not-Q | state register bits, decoded state name, D inputs | extract at Slice 2 |
| **DrillDown** | byte to tree node and back (`pathTo`, `reveal`) in the Parquet book; the FSM tutorial's static chain from diagram to table to logic to circuit | flip-flop to latches to gates | state diagram to register bits to next-state logic to D inputs to flip-flops (from Slice 1) to gates | extract at Slice 2; this is the slice's reason to exist |
| **PredictionChallenge** | four query-engine panels (predict, reveal, three bars on one scale, persisted, "predict again"); the plan panel's ask-before-the-button | "what will Q be after this edge?" | one prediction per transition type (stay, advance, return, reset) | extract at Slice 2. The four verbatim copies in the query-engine book are the design brief: one component, parameterised by what is predicted |
| **FaultInjector** | the Parquet inspector's byte edit with recompute and restore; the smoke test's damaged magic; the timing tutorial's glitch figure; the query-engine book's edited engine failing its own tests; Sizing and TCO's checker refusing a pasted model with the repair named | move D across the clock edge until setup or hold is violated | one faulty encoding to diagnose | extract at Slice 2. The generic shape is: a named fault applied to the model, everything recomputes, a restore |
| TestHarness | both workbenches; the computer-systems problem marks; Sizing and TCO's Check under each problem, which runs the chapter's own pytest file and counts only the marked tests, so the page and a desk agree | the finished flip-flop tested automatically with diagnostic feedback | the controller tested against its state machine | not a primitive: it belongs to `lesson-runtime` (`ChallengeRunner`), because every lesson uses it, with the domain part (what a test vector is, where divergence first appears) in `sim` |
| Replay | restore the file; predict again; the viz page's reset; rerun in the browser | replay a recorded setup/hold experiment and the one recorded metastability draw | replay a transition sequence | not a separate UI primitive: replay is an engine capability (`Snapshot`, `Trace`, a recorded seed) surfaced through the Stepper's scrubbing and a Reset. Rejected as its own component |

Rejected for Prompt A, with the place that would want them later: a bit or byte inspector (Module
1), a K-map view (Modules 2 and 3), a "the build drew first, the browser agrees" check (not
applicable: the course always runs live), timed blocks (the course never times), Run buttons and
Codespaces (no shell).

### 5.3 Which tutorials become canonical content as-is, which need wrapping, which need a rewrite

The prompt asks for the five tutorials' stack to be checked first, because continuity is measured
against them. The answer is: four of the five are Python notebooks executed at build time, whose
only outputs are static images and tables; one is a plain HTML and JavaScript page. The notebooks
cannot be wrapped by a TypeScript runtime at all. What can be carried over is the prose, the
tables, and the content of the figures: which signals, which input patterns, which cases, and why
those. So the plan for all five is **port, not wrap**: the prose and the chosen cases move into
lesson data, and every figure is replaced by a live view drawn from the simulator.

| Tutorial | Verdict | Reason recorded |
|---|---|---|
| D flip-flop tutorial | **canonical content for Slice 1**; prose ported; figures rewritten as live views | The sequence (why memory, latch vs flip-flop, the D flip-flop, reading a timing diagram, edge triggering, timing parameters and their physical cause, async and sync reset, enable, registers) is the slice's narrative spine. Its figures are static matplotlib PNGs that cannot be probed, stepped or broken, and the prompt's rules (observable mechanism over verbal explanation; prediction over passive viewing) and the books' invariant (a view of the implementation, never a scripted picture) both require regenerating them from the engine. The prose's example patterns become the slice's test vectors. |
| Interactive D flip-flop (notebook and viz page) | **pattern kept, code replaced** | The nanosecond-level step-through of the master/slave hand-off, with a threshold line and a sentence per step about what crossed what, is the best teaching idea in the five and becomes `LatchInternals` driven by the engine's propagation-delay mode. The code is replaced because it is a scripted animation (eight hand-written snapshots, not a model), uses Canvas where the prompt wants SVG, tells its two traces apart by colour alone, has no keyboard operation, carries dead autoplay code, and its narrative is not internally consistent about which enable the slave follows. Porting the 540 lines literally would preserve every one of these. |
| Latches and flip-flops quick reference | **as-is, as data** | Its tables become structured reference data shown in Slice 1's reference block and used as the oracle in `dd-model`'s component tests (the simulated SR latch must reproduce the table, forbidden row included). The JK and T flip-flop rows are kept as reference only: the curriculum's Module 4 teaches the D flip-flop alone (open question 6). |
| Timing diagrams tutorial | **partly canonical, mostly later modules**; the glitch case is reused now | Reading a timing diagram, buses, active-low notation and the glitch belong to Slices 1 and 2 and are ported. The memory interface, handshake and pipeline figures belong to Modules 5, 6 and 8 and wait. The glitch example (`Y = A AND NOT B`, both inputs rising) is a ready fault experiment for the propagation-delay mode and should appear in Slice 2's break section. Fix on the way: its notation table defines the falling edge as "LOW to HIGH". |
| FSM tutorial | **canonical method for Slice 2; examples replaced; K-maps deferred** | The chain (state diagram, state table, encoding, encoded table, next-state logic, D inputs, flip-flops, clock, timing trace, output) is exactly what Slice 2 shows in one live view. Its examples are the standard textbook ones (a toggle, the two-consecutive-ones sequence detector, a traffic light, a counter, an arbiter) and the prompt's originality rule says to use different ones; a software-engineer-native example is proposed in open question 3. K-map minimisation is Module 2 and 3 content and is not needed to prove the platform: Slice 2 should derive the next-state logic directly from the encoded table (open question 4). A wording fix on the way: Mealy outputs are combinational functions of state and synchronous inputs, not "asynchronous". |

### 5.4 Duplication to consolidate, and what stays duplicated

Consolidate in the course:

- The waveform plotting code written twelve times across the notebooks becomes one
  `TimingDiagram` view fed by traces. The clock-generation snippet written in every one of those
  cells becomes the engine's `Clock`.
- The master/slave description told three times with two polarities becomes one model with one
  stated convention (open question 2), shown live.
- The SR latch, D latch and D flip-flop truth tables in the tutorial and the quick reference
  become one data source that both the reference block and the component tests read.
- The three svgwrite K-map cells with copied helpers are not consolidated: they are deferred with
  K-maps.

Deliberately left duplicated, and why:

- The two books' shared tooling (renderer, workbench, panels, CI script) stays duplicated between
  them. The author's own rule applies: a fix to shared tooling is made in both until both are
  stable, then extracted. The course does not inherit that code and does not touch the books.
- The books' look (`book.css`) is not copied. The platform the course shares with them is the
  vocabulary and the lesson data format, not the appearance.
- The storage-key namespacing convention is adopted as a rule, not as code.
- The four query-engine panels' identical predict-then-reveal code stays as it is in that book;
  it is the brief for one `PredictionChallenge` component here.

### 5.5 Not understood well enough to reuse safely

- **The clock polarity of the D flip-flop.** The tutorial's truth table and the viz page describe
  a rising-edge flip-flop whose master is transparent while CLK is low. The interactive notebook's
  prose and its block diagram say the master captures while CLK is high and the output changes
  at the falling edge. The course has to pick one and should not copy either text until it has.
  Recommendation: positive-edge, master transparent while CLK is low (the convention the truth
  table and every timing figure already use). The site's notebook text is not fixed by this work,
  since the existing material is not modified; the inconsistency is reported here for the author.
- **The viz page's timings.** The threshold crossing at 0.35 ns, the hand-off at 0.55 ns, the
  "about 0.2 ns window" are illustrative numbers in a hand-written table, not a model's output,
  and the step text contradicts the legend about which enable the slave follows. None of it is
  reusable as data; the propagation-delay mode will produce its own, and the lesson's model-vs-
  reality note must say the delays are chosen for teaching, not measured.
- **Setup versus hold violations.** The tutorial says a setup violation makes Q "capture the wrong
  value" and a hold violation makes Q "metastable". In the overlay model either violation can
  produce a wrong value, a late value or a metastable one; the lesson's model-vs-reality note
  should say so rather than inherit the split.
- **Whether `myst build --execute` tolerates the FSM notebook's side effects.** It writes eight
  SVGs into the source directory at build time and includes them with `{figure}`; this works in
  the author's CI but is the kind of coupling the course should not reproduce. Not reused.
- **The books' Pyodide and WebAssembly runtime code** (`python-worker.js`, `wasm.js`, `runner.js`)
  is understood but out of scope by rule: no WebAssembly in the course.
- **What could not be exercised here**: the three books' browser suites and MyST stages, the
  computer-systems toolchain stages, and Sizing and TCO's MyST, offline-install and `make review`
  stages (section 2). The cross-book regression job planned for Phase 2 must install what each
  repository's `quality.yml` installs, or it will report skips as green.
- **Sizing and TCO's videos and video build.** The per-chapter videos are Git LFS objects the
  anonymous clone does not fetch, and `scripts/build-video.py` with `video/littles_law.yml` was
  not read in depth. Passive media is not what the prompt asks for, so nothing depends on
  understanding them; they are recorded so nobody mistakes the omission for a judgement.

### 5.6 The toolchain continuity case

**What the five tutorials use.** Jupyter notebooks and one Markdown file, authored in the
personal site's MyST project, executed and rendered by `myst build --html --execute` in GitHub
Actions with a Python environment (matplotlib, graphviz, svgwrite via wavedrom, numpy). One
hand-written HTML, CSS and JavaScript page with a Canvas, copied to the site as a static asset. No
tests, no component model, no state.

**What the books use.** Make + Python + MyST: MyST parses the pages to JSON, the repository's own
renderer (`tools/render.py`) renders the site, experiments are fenced blocks turned into mount
points, plain ES modules draw JSON that the implementation computed (Rust in WebAssembly, or
Python at build time and under Pyodide), pytest and `cargo test` test the implementation,
Playwright drives the built site, and a single `ci-check.sh` is what CI runs.

**What the clean-sheet stack breaks.**

- The prose authoring workflow: no notebooks, no MyST directives, no `{literalinclude}` of the
  implementation, no `{include}` of generated numbers. Prose becomes Markdown strings in typed
  lesson data. The two disciplines those directives enforced (quote the implementation, never
  type a number) need TypeScript equivalents: a lesson test that every drawn value is the
  trace's, and a lint that lesson prose carries no literal signal value the engine did not
  produce.
- The shared site look: the book theme and the books' `book.css` are not used. A learner moving
  between the books and the course will recognise the vocabulary and the lesson shape, not the
  chrome. The prompt accepts this.
- The books' renderer and check scripts (`render.py`, `verify-numbers.py`, `test_book.py`,
  `check-built-links.py`) are not shared with the course. Their rules are re-implemented where
  they still apply.
- The author's plan to extract one shared Python package from the two books is unaffected and
  unhelped: the course adds a third tooling family rather than joining that extraction.

**What it buys.**

- One language for the engine, the views, the lesson data and all three test levels. The
  simulator is unit-tested by Vitest without a DOM; the same code runs in the page.
- A component model. The books' labs are hand-built DOM strings, and the cost shows: the
  predict-then-reveal code exists in four copies and the lane timeline in two. React components
  with props are the direct fix, and the shared primitives are impossible to keep honest
  without one.
- Typed lesson data with a validator, in place of heading-shape tests over Markdown.
- A development loop with hot reload, in place of `make site` and a reload.
- Interaction-first pages: the runtime owns the page, so an interactive is the lesson rather
  than a fenced block inside prose that a doc-site shell wraps.
- Playwright, which the author already runs in both books' CI, for the educational level.

**Measured against the tutorials, not the books**, the loss is small: the tutorials' prose and
tables port directly, their figures were static and are replaced by the very interactivity the
course exists for, and their one interactive page is 540 lines of plain HTML, CSS and JavaScript
that is rewritten rather than ported for the reasons in 5.3.

**Is a different framework within the stack justified?** No. Vite, React, TypeScript strict,
Vitest, Testing Library and Playwright are the stack the prompt names; nothing found in the corpus
argues for another (the books' no-framework choice was made for pages that draw JSON a few times
per chapter, not for a runtime with shared interactive components). Two small dependency
decisions follow from the content: a Markdown renderer for lesson prose and KaTeX for the Boolean
equations the FSM material uses. Both are proposed in open question 7.

### 5.7 The two target repositories

The prompt's `[FILL]` resolves to two empty repositories: `snowch/digital-design` and
`snowch/learning-platform`. The prompt's layering and the rule of two decide where Prompt A's
code should live.

**Recommendation.** During Prompt A, all code lives in `digital-design` as the npm-workspaces
monorepo of 5.1, with the platform candidates (`lesson-schema`, `lesson-runtime`, `primitives`)
as their own packages from the first commit. `learning-platform` holds the platform contract as
documents (the interaction vocabulary, the lesson data format once Phase 2 designs it, the
adoption guide Prompt B asks for) and the cross-book regression workflow, which spans the
repositories and so belongs to neither book. The platform packages move to `learning-platform`
when a second book consumes them, and not before.

**Why.** The rule of two applies to repositories as it does to primitives: `learning-platform`
would have one code consumer in Prompt A, and the books, by the prompt's own definition, share
vocabulary and format with it, not code. The author's precedent says the same: the query-engine
book copied the Parquet book's tooling and defers extraction "once both books are stable". A
cross-repository dependency during the slices (a submodule or a published package, two CI runs
per change, version bumps on every runtime edit) would slow exactly the increments the prompt
wants small. Package boundaries inside one repository give the same architectural discipline at
no coordination cost, and `npm workspaces` make the later move a `git mv` plus a `package.json`
edit.

**What goes to `learning-platform` now.** A README stating this proposal and pointing at this
inventory, on the same branch. Nothing else until Phase 2.

## 6. Risks and rules to carry into Phase 2

- **Shared origin.** The course deploys to `snowch.github.io/digital-design/`, the same origin as
  the books. Every storage key is prefixed (`dd:v1:…`) and every URL relative, with the base path
  configured once (Vite `base`), as the books do and test.
- **Originality.** Slice 1 builds the mandated sequence (SR latch, D latch, clocking, master/slave
  flip-flop), which is also the textbook sequence. Its originality must come from the problem
  posed, the experiments and the exercises: the inventory proposes posing the problem as "a
  circuit that remembers which of two buttons was pressed last", using an odd-length inverter
  loop as the ambiguous feedback case the engine refuses to settle (and oscillates in the
  propagation-delay mode) against the even-length loop that remembers, and making the setup/hold
  slider and the recorded metastability draw the failure experiments. Slice 2's example is open
  question 3. Each lesson's `originalityNote` records the textbook example and the difference.
- **Metastability overlay.** The one non-deterministic model: a separate module whose random
  outcome is drawn once per experiment from a recorded seed, stored in the trace, so replay
  reproduces the divergence. Labelled in the lesson as the one place the deterministic engine
  steps aside. `docs/simulator.md` will specify it.
- **No scripted pictures.** Every waveform, state box and highlight is drawn from the engine's
  trace; a lesson test asserts it. This is the Parquet book's first invariant and the viz page's
  failure.
- **Challenges are tests.** The reference solution passes in CI; the shipped stub fails; no UI
  path marks a challenge complete without a run; a stored completion is re-run on load. Learner
  state is browser-local and trusted by default; no anti-cheat against a learner editing their own
  storage.
- **Cross-book regression.** Planned for Phase 2 in `learning-platform`: one workflow with a job
  per repository that checks it out and runs its own `scripts/ci-check.sh` (books) or
  `npm run check` (course), installing what each repository's `quality.yml` installs (pinned
  Rust, pinned pyarrow and DuckDB, pinned MyST, Playwright and Chromium, and for computer-systems
  the RISC-V and AArch64 cross compilers and QEMU). Sizing and TCO joins the matrix with its own
  `ci-check.sh`. Nightly and on dispatch; red if any suite is red. The books themselves are not
  modified.
- **Prose.** Every learner-facing string is drafted by a Haiku subagent from a fact brief and
  checked for facts by the managing model, then the whole lesson is read once (section 4.1,
  `CLAUDE.md`). `docs/style.md` is the checklist, copied from Sizing and TCO with a preamble that
  translates its two book-specific phrases. Already in place on the branch.
- **Review.** Every lesson gets the two-half review before it is called finished: the mechanical
  half in the Playwright suite, the reading half by one reviewer per lesson with a written brief
  and a sceptic per finding. The skill is a Phase 2 deliverable alongside `docs/authoring.md`.
- **Terms are gated per lesson, and a test enforces it.** The list of rationed terms and the
  lesson that introduces each live in the lesson data; a test fails any earlier lesson that uses
  one, with a `% word-ok:`-style exemption for a word used in another sense, as Sizing and TCO's
  `tests/test_vocabulary.py` does. The HDL construct gate is the same rule for code.

## 7. Open questions for the author (Checkpoint 1)

1. **Repository split.** Accept the recommendation in 5.7: all Prompt A code in `digital-design`
   as a workspaces monorepo with platform packages from the start; `learning-platform` holds the
   contract documents and the cross-book regression job until a second book consumes code?
2. **Clock polarity.** Positive-edge D flip-flop, master transparent while CLK is low, as the
   tutorial's truth table and the viz page have it? The interactive notebook's text says the
   opposite and is not fixed by this work.
3. **Slice 2's example.** The FSM tutorial's examples are the standard ones. Proposed instead: a
   retry-with-back-off controller (IDLE, TRY, WAIT, GIVE-UP; inputs go, ok, fail, tick; Moore
   outputs send and alarm), which software engineers already know from the other side and no
   digital-design text uses. It has the four transition types the slice needs predictions for
   (stay, advance, return, reset) and a natural faulty encoding to diagnose. Alternatives welcome.
4. **K-maps.** Defer minimisation to Modules 2 and 3 and have Slice 2 derive next-state logic
   directly from the encoded table (unminimised sum of products), showing the HDL `always_comb`
   `case` as the equivalent? Or keep a K-map step in Slice 2?
5. **Metastability overlay.** Confirm the design in section 6 (seeded draw recorded in the trace;
   labelled exception) before `docs/simulator.md` fixes it.
6. **JK and T flip-flops.** Keep the quick reference's JK and T rows as reference-only data in the
   course, since Module 4 teaches the D flip-flop alone?
7. **Dependencies for prose.** A Markdown renderer for lesson prose (`react-markdown` with
   `remark-gfm`) and KaTeX for equations, both rendering strings from lesson data. Any objection
   to either?
8. **Deployment path.** `snowch.github.io/digital-design/` is free today. Confirm it as the
   target, and that linking the existing five tutorial pages to the course is a later, separate
   change to the personal site.
9. **The prose and review process.** Sizing and TCO's process is adopted as described in section
   4.1, and `CLAUDE.md` and `docs/style.md` are already on the branch. Veto or amend anything
   there. One choice inside it is open: whether a Haiku draft is also used for the hints' lower
   rungs (mistake class, smaller example), which carry facts about the learner's specific wrong
   answer, or whether those are generated from the diagnosis directly with templated words.
10. **The rationed terms.** Phase 2 needs the list of terms each lesson is allowed to introduce
    (for the slices, candidates are *feedback*, *latch*, *transparent*, *edge*, *setup*, *hold*,
    *propagation delay*, *metastable*, *state*, *encoding*, *synchronous*). Should the gate be
    enforced by a test from the first lesson, as `tests/test_vocabulary.py` does, or kept as an
    authoring rule until the course has more than two lessons?

## 8. What changes in Prompt B given what was learned

Recorded now so it is not lost; revisited at the end of Prompt A.

- The query-engine book's predict-then-reveal panels are closer to the prompt's core loop than
  anything in the digital-design material. Module 0 onward should open every lab with a
  prediction box and hidden measurements, as those panels do.
- The author's existing discipline (shape enforced by tests, originality logged per chapter,
  numbers never typed, problems are tests, one CI script) should be the course's from Slice 1,
  not added later; Prompt B's module-done definition assumes it.
- The timing tutorial's memory-interface, handshake and pipeline material is already written for
  Modules 5, 6 and 8 and should be ported when those modules start.
- The author's gap list in `DIGITAL_DESIGN_TODO.md` can be retired once the Prompt B curriculum
  is published, with a pointer from the personal site.
- Prompt B's module-done definition should add the two-half review and a note of what the fact
  check caught, as Sizing and TCO's definition of done requires `make review` on every page.
  Fifteen modules of Haiku-drafted prose will show whether the brief-then-check split holds at
  that volume, and the per-module notes are where to record it.

### 8.1 Added at Checkpoint 3, from building Slice 1

- **Figures need prose on both sides.** A section's single `prose` string was not enough: the
  first lesson's explanation wants a paragraph above each of three figures and one below the
  last. The schema gained `lead` and `after` on an interactive. Prompt B's lesson format should
  start from that shape, and the briefs should be written per figure, not per section.
- **The clocked discipline cannot tell a flip-flop from a transparent latch.** A test that only
  pulses the clock passes a D latch wired to CLK. The flip-flop's tests set CLK as an input and
  change D while it is high. Every sequential challenge in Prompt B needs at least one step that
  changes an input while the clock is high.
- **The settle model's step count is what the figure shows.** The lesson said "3 steps" from the
  simulator's iteration count; the explorer shows the two changes. The facts test now pins the
  number the figure shows, and every number a lesson states should be read off the figure that
  shows it, not off the engine's internals.
- **The two-half review earns its place on the first lesson.** The first look at the built page
  found a lane missing from the timing diagram (an output looked up by net name, not port name),
  parts scaled up on a wide page, and a circuit that showed the names S and R before the lesson
  had introduced them. None of these fails a unit test; all of them fail a learner.
- **Haiku's profile held at this volume.** Over about eighty strings and thirty paragraphs: a
  dropped fact in roughly one draft in eight, a wrong fact in one in fifteen, and two vocabulary
  slips (a word already in use on the page, a mouse-only verb). The fixes were words added and
  five notes sent back; no sentence was rewritten. The cost that did not scale was the brief: the
  shared fact sheet took longer than all the checking.
- **"Draw" could not be the overlay's verb.** The page has a drawing editor; the random outcome
  is a "roll". Prompt B's vocabulary list should be checked against the names of the page's own
  controls, not only against the course's terms.
- **The bundle is 885 kB minified.** KaTeX and react-markdown are most of it, for one formula so
  far. Prompt B should decide whether the course needs maths rendering at all before Module 1
  ships; if not, dropping it halves the bundle.
