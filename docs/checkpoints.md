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
- The site is live at <https://snowch.github.io/digital-design/>, and every push to `main`
  deploys it. The default branch is `main`. The `github-pages` environment that Pages created
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

### An experiment running in parallel: the same rules, a second model

The author asked whether another model could build a lesson to the same standard, so that the
remaining modules could be delegated. A second session, on a different model, is building
Module 5's first lesson, registers (a word held by flip-flops sharing one clock, load-enable,
reset, and a counter or shift register as the capstone if it fits), on the branch
`module-5-registers-b`, under exactly the rules in `CLAUDE.md`: fact briefs, Haiku drafts,
the term gate, pinned numbers, the two-half review, `npm run check` green. The state machine
lesson and the extraction of primitives are kept out of it, because the build prompt makes the
extraction a stop-and-ask checkpoint. The session writes `docs/notes/module-5-registers.md` as
it goes: every brief sent, what each draft got wrong, the review's findings and their fates, and
the time taken. When it pushes, the comparison runs the check and the Playwright suite on its
branch, has two reviewers read both lessons blind under one brief with a sceptic on each
finding, and counts what is countable: tests at each level, findings by category, sentences
rewritten, wall-clock time. The write-up goes in this file.
