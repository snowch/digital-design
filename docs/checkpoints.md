# Checkpoints

The reports written for the author at each checkpoint of Prompt A, kept so Prompt B can read
what was decided and why.

## Checkpoint 1: the inventory

`docs/inventory.md` was written and the author approved its ten recommendations (section 7)
without change: a monorepo in this repository with the platform packages separate from the start;
`snowch/learning-platform` holding the contract and the cross-book job; a positive-edge flip-flop
whose master is transparent while the clock is low; the retry controller as Slice 2's example;
K-maps deferred; the metastability overlay as a seeded, recorded roll; JK and T flip-flops as
reference only; react-markdown with KaTeX for prose; deployment at `snowch.github.io/digital-design/`
with storage keys prefixed `dd:v1:`; and the term gate enforced from the first lesson.

## Checkpoint 3: Slice 1 usable end to end

### What exists

- **The platform.** `packages/lesson-schema` (the lesson format, its checks, the term gate, JSON
  Schema export), `packages/lesson-runtime` (the lesson page, the challenge runner with the
  diagnosis in the learner's terms, the hint ladder, browser-local learner state that is graded
  again on every load). Nothing in either knows what a circuit is.
- **The digital-design domain.** `packages/sim` (three-valued words, the netlist, the settle and
  delay models, the clocked discipline, traces and replay, test vectors with a diagnosis, the
  overlay), `packages/dd-model` (the latches, the flip-flop, the register, the two-button circuit,
  the fault library, the reference tables), `packages/hdl` (the SystemVerilog subset: parse, gate
  per lesson, elaborate to the same gates a drawing makes, generate back), `packages/dd-views`
  (the drawing editor, the circuit view with drill-down, the timing diagram, the truth table, the
  text panel, seven interactives, the book that ties them to the runtime).
- **The course.** `apps/course` (hash routes, lesson list with progress recomputed from stored
  work, themes) and `content/lessons/remember`, the first lesson: ten sections, seventeen figures,
  four challenges with tests, five hints each and a reference solution, an originality note.
- **The checks.** `npm run check` is exactly what CI runs: Prettier, strict `tsc`, 160 Vitest
  tests (engine, model, text, schema, runtime, views, content: every reference passes, every
  starting point fails, the term gate, the whole lesson renders), the build, and 30 Playwright
  tests at desktop and phone widths (completable with the reference through the page, rejects a
  wrong attempt with the gate named, keyboard-buildable, graded again on load, not bypassable
  through storage, resettable, hints one rung at a time, the roll replays identically).
- **The documents.** `docs/simulator.md`, `docs/authoring.md`, `CLAUDE.md` with every check
  that breaks the build and its reason, the inventory's section 8.1 with what Phase 2 taught.
- **The platform repository.** The cross-book regression workflow and the contract directory
  (the lesson format as JSON Schema, what a book supplies).

### How the prose was made

Every learner-facing string went through the process CLAUDE.md states: a brief of facts checked
against the simulator, a Haiku draft, a fact check that added words and sent five drafts back,
then a whole-lesson read and a reviewer's reading with a sceptic's pass on each finding. The
review found two numbers the briefs had stated from the engine's cold start rather than from the
figure (the stepper's times, the setup boundary), a fault paragraph that described an experiment
the chosen option could not run, terms arriving before their introduction (clock, flip-flop), and
"step" meaning three things. The facts test now pins the figures' numbers; the paragraphs were
redrafted from corrected briefs.

### What the author should look at

1. The lesson itself, as a learner, at <https://snowch.github.io/digital-design/#/lesson/remember>
   once the branch is merged and Pages deploys from Actions.
2. `docs/inventory.md` section 8.1: what to change in Prompt B.
3. The originality note in `content/lessons/remember.ts`.
4. The bundle: 885 kB minified, most of it KaTeX and react-markdown for one formula.

### Where things stand

- The course's CI is green on the branch head and on `main`, which was fast-forwarded to it.
- The cross-book regression run is green in all five jobs after three rounds of matching each
  book's own setup (dev requirements, the RISC-V-bound checks deselected, the query-engine book's
  npm packages and path).
- The site is live at <https://snowch.github.io/digital-design/> with both lessons, and every
  push to `main` deploys it. The default branch is `main`. The `github-pages` environment that Pages created
  kept a branch rule naming the session branch, which was the default at the time, and refused
  every deploy from `main` even after the default changed; the deploy job no longer declares
  that environment, so no rule binds it, and the first push after the change deployed.
- The author found the drawings soft on a tablet. Ports now sit on whole pixels, and wires,
  signal levels, lane bases and axis lines are drawn without anti-aliasing (`crispEdges`), so a
  line is a hard edge at any zoom; gate outlines, wires and levels are two pixels wide, and part
  and port names are set in the full text colour.
- The review's findings were upheld by a sceptic's pass (16 whole, 9 in part, none rejected); it
  found three more facts, each fixed: the flip-flop shown as text no longer prints a line for an
  unused Qb; `~(a | b)` elaborates to one NOR gate, so an assign with one operator is one gate as
  the lesson says; and the roll's "20 units after the edge" is explained as when the slave's
  latch first answers.

- The author found the layout crude, and it was. A design pass gave the site shipped
  typefaces (Inter and JetBrains Mono), a text measure of 44rem with figures spanning a wider
  66rem page, design tokens for both themes, cards for figures, canvas panels that span their
  cards with the drawing centred and scaled up to a quarter where there is room, a shadow at
  whichever edge of a panel has more behind it, a sticky strip of lane names beside a scrolling
  timing diagram that opens on its shaded band or follows its cursor, values read over wires in
  a knockout halo, block names shown only where they say more than the block's kind, words in
  tables in the text face and values in the mono face. `tests/educational/aesthetics.spec.ts`
  holds the page to measurable rules (no text under 11 pixels, phone controls at least 40
  pixels tall, prose lines under about 85 characters) and to screenshots of the lesson header
  and four figures at both widths; the shipped fonts and the pinned Chromium make the
  screenshots stable across machines.
- The author asked whether a design skill could be applied. One can: Anthropic's
  `artifact-design` skill, written for claude.ai artifacts, whose fundamentals hold for any
  page. Against it the first pass was generic in three ways it names (Inter as the safe face, a
  warm cream ground, rounded corners on everything), so a second pass set a deliberate type
  pairing (Source Sans 3 for prose, Archivo set narrow and heavy for headings, JetBrains Mono for
  values, names, labels and code), biased the neutrals towards the accent's blue, cut the radii
  to a few pixels, and gave border, fill and shadow by role: a figure's card and a drawing's
  canvas have them; tables, option lists and disclosures inside a card have a rule or nothing.
  The section labels, badges and hint rungs are set in the mono face, as a datasheet sets its
  labels. Body text is 18 pixels on a 40rem measure, about 72 characters a line.
- A phone screenshot from the author showed a timing diagram's labels printed on top of each
  other. A Playwright test now measures every diagram's rendered text at both widths, before and
  after the figures are used, and fails on any overlap or overflow; it found the same fault in
  every block's name and in the output pins' values, all fixed, and it will check every figure
  Prompt B adds.

### Known gaps

- A long timing diagram scrolls sideways on a phone; its lane names stay put, it opens on the
  part that matters, and its table carries the values at the cursor.
- The drawing editor's wires route on simple rules; a dense drawing crosses itself.
- No lesson yet uses the register, the reset or the enable; they are built and tested.
- `docs/platform.md` and the extraction of shared primitives wait for Slice 2, by the rule of two.

### The same rules, a second model: Module 4 against Module 5

The author asked whether another model could build a lesson to the same standard, so that the
remaining modules could be delegated. A second session, on a different model, built Module 5's
first lesson, registers, on the branch `module-5-registers-b`, under exactly the rules in
`CLAUDE.md`: fact briefs, drafts by the drafting subagent, the term gate, pinned numbers, the
two-half review with a sceptic, `npm run check` green, and a module note written as it went
(`docs/notes/module-5-registers.md`). The state machine lesson and the extraction of primitives
were kept out of it, because the build prompt makes the extraction a stop-and-ask checkpoint.
The author then merged the branch to `main` to read it live.

**What it cost.** 65 minutes of wall-clock time, 52 turns, seven subagents, about $29 at list
price, of which the drafting subagent was under $2. Module 4 is not separable: it was built in
one day together with the platform under it.

**What it produced.** Six commits, 40 files, 2,723 lines: the lesson (13 figures, 3 challenges,
2,949 learner-facing words against Module 4's 19 figures, 4 challenges and 2,352 words), its own
educational tests, a facts test, a screenshot baseline, and fourteen platform fixes with tests,
among them the term gate's lesson order (cross-module lessons were never compared), binary for
words, one `always_ff` per register in generated text, a failure reported at the block the
learner placed, and the educational and diagram suites extended to every lesson. On its branch
the check runs 180 unit tests and 68 Playwright tests, against 160 and 36 on `main` before it.

**How the two were compared.** Two reviewers, one on each model, each read both lessons blind
as the learner each lesson is written for, under one brief (`docs/notes/comparison/`
`reviewer-brief.md`), on the built site at both widths, pressing every control and checking
every number against the facts tests; neither was told who wrote what, and neither read the
module notes or the git history. Then two sceptics, again one on each model, attacked every
finding in both reviews under one brief, verified each against the page or the simulator, and
marked the findings the two reviews shared. The reviews and the verdicts are in
`docs/notes/comparison/`.

| | Module 4 (`remember`) | Module 5 (`registers`) |
| --- | --- | --- |
| Reviewer 1: findings (high / medium / low) | 30 (7 / 7 / 16) | 26 (0 / 5 / 21) |
| Reviewer 2: findings (high / medium / low) | 25 (1 / 15 / 9) | 22 (0 / 9 / 13) |
| Sceptic 1: upheld / in part / rejected | 46 / 9 / 0 | 32 / 14 / 2 |
| Sceptic 2: upheld / in part / rejected | 46 / 9 / 0 | 39 / 9 / 0 |
| Distinct points once shared ones are merged | 34 | 36 |
| Code or figure defects among them | 6 | 3 |

Both reviewers judged Module 5 the better read for its learner, independently and for the same
three reasons, and both sceptics upheld the findings behind that judgement. First, Module 5's
figures show what its prose claims; in Module 4 six things contradict the text beside them: a
stepped figure that draws the last settling step where its status line says X, the two button
wires of the central circuit sharing one track, the flip-flop's inner drawing with the slave's
enable wire leaving the master's box, a phase caption that says CLK was 1 at a moment the
figure shows 0, a roll that repeats from the third press, and a hardware note that says the
simulator decides every race by visiting order when the settle model is built not to. Second,
Module 5 names every signal before it asks a prediction; Module 4's first prediction asked
about a loop the learner could not see. That is now fixed for both lessons: every prediction
figure draws its circuit above the question. Third, Module 5 follows one question through
predict, build, break, explain and generalise; Module 4 answers its question with the latch and
then packs the clock, the flip-flop, setup and hold into its failure experiment.

Module 5's faults are smaller: words carrying two meanings on one page (keep, D, step), the
case for a reset made five times, an instruction to press a wire that only hovering fulfils (a
platform bug), a bit-order example whose two ends are the same digit, and a generated drawing
that shows parts the lesson never introduced.

**Verdict.** The remaining modules can be built by the second model under these rules, and the
rules are what made it work: the brief as a list of checked facts, the drafting subagent, the
term gate, the pinned numbers, the educational tests, and above all the two-half review with a
sceptic, which found what the check script could not in both lessons. Three things stay with
the managing model: merging to `main`, the fix pass after each review, and the stop-and-ask
checkpoints. Two things change for every module from here: the reviewers and the sceptic are
run on a model other than the one that built the lesson, and the module note is read before
the lesson is merged, because it is where the process shows.

**Caveats.** Module 4 was the first lesson and the platform was built under it, so its faults
include platform faults nobody had yet seen, and Module 5 had Module 4 and section 8.1 of the
inventory to learn from. The reviewers and sceptics ran on the same two models as the builders,
one each, which is why there were two of each; their counts agree (29 shared points by both
sceptics, 70 distinct, 78 and 85 of 103 findings upheld whole). A controlled version, the same
lesson by both models, was not run.

**The fix queue.** Every upheld finding on either lesson is work: code first, then fact briefs
per finding to the drafting subagent, then the whole lesson read once more. The eight code
defects are listed at the end of `docs/notes/comparison/verdicts-1.md`.
