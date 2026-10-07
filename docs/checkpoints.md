# Checkpoints

The reports written for the author at each checkpoint of Prompt A, kept so Prompt B can read
what was decided and why, and from the course plan's third checkpoint on, the plan's own
(`docs/plan.md`; its second checkpoint is recorded there, as a decision).

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

## Course checkpoint 3: one instruction added to the CPU end to end

The plan's third checkpoint (`docs/plan.md`, "When a module is done, and the checkpoints") comes
after Module 9, once one instruction has been added to the CPU end to end. The managing session
wrote this report on 6 October 2026, after merging Module 9.

### What exists since checkpoint 2

Checkpoint 2 approved `docs/machine.md` and `docs/isa.md` at 04:33 UTC. Since then:

- **Module 8, the datapath** (`instructions`, `constants`, `fetch`, `memory-access`, `branches`):
  the course machine running one instruction an edge, built from the learner's own parts, with
  figures for an instruction's fields, a constant's widening, events across edges, the memory map
  and a program's branches.
- **A pass over Module 8 for its learner.** A walker drove each lesson's built page as a learner
  does, at both widths and in the dark theme, and a sceptic attacked each of the 73 findings
  (`docs/notes/module-8-learner.md`). Most fixes are in code every module shares: no prediction
  answered before the learner commits, results and fault outcomes shown only after the run that
  makes them, a long run that redraws instead of freezing the page, failed tests reported in
  hexadecimal, and a stuck value drawn on its wire.
- **Module 9, control** (`control-signals`, `illegal-instructions`, `several-edges`,
  `micro-operations`, `new-instruction`): the decoder opened, its checks, and a second machine
  that runs the same instructions over several edges each, with one memory port, an instruction
  register, four held words and a controller built as Module 5's state machine. It matches the
  reference after every instruction of Module 8's 37 programs, drawn and as text.
- **The platform**: six shared primitives in `packages/primitives` (`docs/platform.md`); a cover
  at the top of the front page with every module of the plan; wires routed by hand kept inside
  their drawing; and, on every drawing at least 1,000 pixels wide that does not fit its box, a
  strip with the whole drawing small and a zoom from half to twice its size, by two fingers, a
  trackpad's pinch or two buttons (`docs/notes/overview-strip.md`).
- **A decision**: the course's calculator is designed once, in Module 10's encoding explorer, from
  the learner's ALU (`docs/plan.md`).

At checkpoint 3 the course had 32 lessons, in Modules 1 to 9, and Module 0 was still to be
written.

### The instruction added end to end

The capstone is `docs/isa.md`'s call through a register, `RY ← PC + 4` and `PC ← RA + c`, at
kind 9, job 0, in the learner's own copy of the machine's text. `docs/isa.md` does not change, and
the course's machine still refuses kind 9 with cause `21`, so kinds 9 to F stay free for Module 10.
What changed, and how each change is tested (`docs/notes/module-9-control.md`, "The capstone"):

| Part | Change | Tested by |
| --- | --- | --- |
| The decoder, drawn | a line for kind 9; CALL and JUMP become OR gates of two lines; kind 9 joins WRITEY, BCONST and OP1; the kind and job checks learn kind 9 | against the reference, every kind and job under ten constants |
| The decoder, as text | one `case` arm and two terms of ILLEGAL | the capstone's first challenge: 263 tests, its start fails 17 |
| The controller | none: the instruction sets CALL, so it takes a call's three edges | a walk of the controller's table for every kind |
| The datapath | none: "word for Y" already gives PC + 4 for CALL, and the next PC already takes the ALU's result for JUMP | the machine end to end, below |
| The whole machine | the decoder above, inside it | the drawn machine and its text against the reference after every instruction of Module 8's 37 programs and a program of two such calls; the capstone's second challenge, 23 tests, run edge by edge |

The plan recommended this instruction because it needs only new control. It turned out to need
less: the build first gave it an edge of its own at the ALU, then found that edge wrote a held
word nothing read, and took the call's three edges instead.

### What the managing session checked before merging

- **The words.** The five Module 9 lessons, read as their learner against the decoder, the
  controller, the machine and `docs/isa.md`. Every number the prose states is pinned by a facts
  test; four places were corrected (`docs/notes/module-9-control.md`, "The managing session's read
  and merge"). The new words of Module 8's pass were read against the machine too.
- **The order.** Module 8's pass was merged first and Module 9 on top, and Module 9's figures and
  challenges took the pass's patterns, so a learner meets the same behaviour in both modules.
- **The check.** The full check on the merged head, in a container that renders text as CI does:
  869 unit and integration tests and 556 browser tests passed, 34 were skipped, and none failed.
  It found one fault Module 9's own container could not see, a state table 4 pixels
  wider than a phone, now fixed. A look at the built pages, and at the code the two merges join,
  found two more that no test drove: lesson 9.3's controller figure opened on an unknown state,
  where its first step moved nothing, and the register table's "Written" missed a register given
  the word it already held. Both are fixed, and a test holds each.
- **CI and the deploy on `main`**: the same check runs in CI on every push, and the site deploys
  from `main`.

### What the author should look at

1. The five Module 9 lessons on the site, as a learner:
   <https://snowch.github.io/digital-design/#/lesson/control-signals>, then `illegal-instructions`,
   `several-edges`, `micro-operations` and `new-instruction`. Lesson 9.3 carries the most new
   ideas at once; lesson 9.5 is the checkpoint's instruction.
2. Four questions Module 9 leaves for you, each with a recommendation:
   - **The door between instructions.** The machine of several edges samples the door only at an
     instruction's last edge, as the timer counts, so both machines see the same door at the same
     instruction; a door opened and closed within one instruction's three to five edges raises no
     event. Recommendation: keep it, and say so in `docs/machine.md`'s line on the door.
   - **The capstone's size**: a decoder column and two terms of its checks. Recommendation: keep
     it. The lesson's point is that a new instruction can need four things (a column, a place in
     the checks, its states, new parts) and this one needed two; "set if less", the alternative,
     needs a new source for register Y, which is datapath work.
   - **The capstone's second challenge** repeats the first's decoder edits inside the whole
     machine's text. Recommendation: keep it as the end-to-end run, which is what this checkpoint
     asks for, and later let a challenge start from the learner's own answer to an earlier one.
   - **The decoder's insides** are laid out automatically and are dense; lesson 9.2 asks you to
     open its checks. Recommendation: place them by hand before Module 10.
3. A rule of yours, changed with the zoom: on the page as it loads, no text is under 11 pixels, as
   before, but a drawing you zoom out shows its words smaller, down to 0.6 of their size, then
   hides them. The alternative is to stop the zoom where words reach 11 pixels.
4. The zoom on a real phone. Two-finger zoom is tested through Chromium's touch input; Safari on
   iOS is not tested.

### Costs and known gaps

- The full check takes about 22 minutes, against 18 to 19 this morning. Module 9's
  machine runs Module 8's suite through its drawing and its text; running a third of the suite
  through the text would win back some of it.
- The fault labs of every module still show every fault's outcome after the first run; Module 8's
  pass gave the datapath figures one outcome per fault, and the same change would serve the fault
  labs.
- A 64-bit word in "Try it" is still entered as 64 separate bit buttons, in every module.
- Eleven branches from finished work, all merged into `main`, remain on GitHub for you to delete
  if you want them gone; the managing session cannot delete a branch.

### What comes next

Module 10, the instruction set: why the instruction set is as it is, with the encoding explorer
and the course's calculator built from the learner's ALU. Then Module 11, the assembler and the
debugger, and checkpoint 4.

### The author's answers

The author took every recommendation the same day, asking for the best reader and learner
experience, and asked for the gaps above that a learner meets to be closed: words typed in "Try
it", a fault lab's outcomes one fault at a time, and a wide drawing opened at the part its words
name. `docs/plan.md` records the decision.

## Course checkpoint 4: the assembler and the debugger

The plan's fourth checkpoint (`docs/plan.md`, "When a module is done, and the checkpoints") comes
after Module 11, the assembler and the debugger. The managing session wrote this report on 7
October 2026, after merging Module 11.

### What exists since checkpoint 3

Checkpoint 3 came after Module 9, on 6 October 2026, with 32 lessons in Modules 1 to 9. Since then:

- **Module 0, meet the machine** (`what-computers-do`, `inside-the-machine`): the finished machine
  run a line at a time in plain words, then opened down to one wire, before the build begins. The
  cover says Module 0 comes first.
- **Module 10, the instruction set** (`instruction-set`, `encoding`, `immediates`, `room-to-grow`,
  `design-an-instruction`):
  - why the instruction set is as it is;
  - the encoding explorer, with the calculator built from the learner's ALU;
  - the constant's range and the reach of a branch;
  - what an instruction left out costs a program;
  - a designed instruction, "set if less", added to the learner's machine.

  Four drawings came after its review: the agreement between programs and circuits, the cost of
  what is left out, the condition block and the memory map, each readable on a phone.
- **Module 11, programming and debugging** (`assembly`, `lists`, `functions`, `stack`, `recursion`,
  `debugging`, `log-report`), below.
- **The site**:
  - an icon for tabs and home screens, with a web app manifest;
  - the cover's path to Module 0;
  - a heading for the model note that the first pages can read ("How the page differs from
    hardware"), on pages with no clocked figure;
  - the list of modules without a heading on screen.

The course now has 46 lessons, in Modules 0 to 11. Modules 12 and 13 are still to be written.

### What the learner can now do

After Module 11 a learner can:

- write a program for the course machine as text, with names for addresses, and mend the lines the
  assembler refuses from its sentences;
- step a program, set breakpoints, watch registers and words, and read every way a run ends. It
  stops at its `stop`, the machine halts with a cause, the debugger pauses at a breakpoint or ends
  the run before a register nothing has set, or the run is cut off after 5000 instructions;
- walk a list in memory with a loop, and compare readings signed;
- write functions that keep the calling convention, call one from another with the stack, and
  write one that calls itself on work that nests (the cold store's rooms);
- find the mistake in a program that runs and gives a wrong answer, by a method, and choose test
  logs that reach the edges;
- write the shop's daily report from a log through four functions, each tested alone, one of which
  calls the other three and keeps what it needs on the stack.

### What was built

- **The learner's assembler.** It uses the authors' assembler's parsing, so every program assembles
  alike. Each refusal is a drafted sentence that names its line and what to change. A `word` may
  now hold a name, which the cold store's rooms need (`docs/isa.md`).
- **A debugger** that runs the instruction set on the instruction-level model, as lesson 10.1
  taught a program relies on.
  - It offers step, step back, run to a breakpoint or to the end, a watch, a view of a list, a
    view of the stack grouped by call, and the cut-off.
  - The line about to run stays in view, and the buttons, the watch and the view a lesson's steps
    name share one screen at both widths.
  - An address shows as the pages write it, in three hexadecimal digits beside its decimal.
- **Program challenges**, graded by running the learner's text over several logs and readings.
  - The tests check what a program can see: the display, the lamps, registers, words and how the
    run ended.
  - A function is also called alone, with the convention, its calls and the stack's depth checked.
  - Feedback says what the program left and how the run ended, never the answer.
- **Figures**: the listing, the debugger, the stack's depth over a run, and a program run over
  several logs. Module 10's program comparison is reused.

### What was decided

- **The assembly language** is `docs/isa.md`'s proposal with two refinements: a `word` may hold a
  name, and the assembler's refusals are listed in `docs/isa.md`.
- **The calling convention** is `docs/isa.md`'s, unchanged.
- **One word for each way a run ends**, course-wide; Module 10's program comparison now says a run
  stopped at its stop.
- **Recursion is taught on the cold store's rooms**, each opening onto up to two more, since a loop
  could follow them only by keeping a stack of its own. The first build's example, the log shown
  newest first, is done more simply by a loop.
- **The capstone has a function that calls the other three** and keeps what it needs on the stack.
  As first built it passed without a push, so the module's hardest part went unused in the lesson
  that ends it.
- **The SystemVerilog testbench constructs** (`initial`, `#`, `$display`) wait for Module 12: no
  Module 11 lesson needed them.

### What the managing session checked before merging

- **An early read** of lessons 11.1 to 11.5 at both widths, with eight notes the build acted on:
  - a debugger the learner can follow while it steps;
  - results that show only after their runs;
  - predictions and challenges that the page does not answer;
  - recursion on work that nests;
  - and four more.
- **A reading review.** Each of the seven lessons was read by its own reviewer as its learner, and
  a sceptic attacked each review against the page, the source and the built site. 79 findings were
  upheld or narrowed, 6 of them blocking. The build did every blocking and should-fix item, and
  every minor one but two. The module note records each one (`docs/notes/module-11-programming.md`).
- **The walk.** Every challenge was run with its starting text, with a line the assembler refuses
  and with a loop that never stops. No page showed a console error or scrolled sideways.
- **The full check** on the merged head: 1,191 unit and integration tests and 790 browser tests
  passed, 48 were skipped, and none failed. A first run found one fault that the build's container
  measured smaller: lesson 11.2's listing was 8 pixels wider than a phone. The build's fix is
  merged, and the check ran again on it.

### What the author should look at

1. **The seven lessons, as a learner.** Start at
   <https://snowch.github.io/digital-design/#/lesson/assembly>, then `lists`, `functions`, `stack`,
   `recursion`, `debugging` and `log-report`. Lesson 11.4
   carries the stack; 11.7 is the capstone.
2. **Module 12's plan** (`docs/notes/module-12-plan.md`). Its build starts from it now, and your
   answers can change it as it goes. Its decisions, each with a recommendation:
   - **Which control registers a program writes.** `docs/isa.md` lets `Cc <= Rm` write all five.
     `docs/machine.md`'s datapath gives the register A only to C0 and C4, yet its own text needs C1
     and C2 written back: to skip a faulting instruction, and to restore them before `resume` once
     a handler has turned interrupts on. Recommendation: all five, and correct `docs/machine.md`.
   - **Where the trap hardware goes.** Recommendation: the machine of several edges, as a step of
     its controller (Module 5's state machine, Module 9's control). Build it in Module 12's own
     copy, so Modules 8 to 11 do not change; Module 13 takes that copy.
   - **"Vector".** Checkpoint 2's decision 6 gives the word to C4, but the course already uses it
     for a bus of bits (lessons 6.2 and 6.4). Recommendation: keep it off Module 12's pages, and
     call C4 the handler's address.
   - **The services of a system call** start from `docs/isa.md`'s proposal: show a number, read a
     sensor, set the lamps, end the program. The build may change them and say why.
   - **The learner's assembler** refuses a control register outside C0 to C4 with a sentence.
3. **Module 13** is planned once Module 12's shape is settled. Checkpoint 5 comes before it is
   built, as the plan says.
4. **Two extraction candidates** wait for your approval under the rule of two:
   - Module 10's program comparison, now used by Modules 10 and 11; it is a course-side part;
   - the prediction gate: choose an answer, check it, and the figure's result appears.

### Costs and known gaps

- The full check takes about 45 minutes in the managing session's container and about 25 in CI.
  Module 11 added 78 unit tests and 93 browser tests.
- Ten stored screenshots fail in a build container on `main` too (text rendering). The managing
  session's container and CI pass them, and CI is the authority.
- The platform's verdict line has no form for one test ("0 of 1 tests passed"). One challenge has
  one test, 11.6's edge log; the build is giving it a second question.
- The learning platform's `main` has three commits that this course has not synced: role
  badges, details a reader opens, and a model's note stated once at the foot. Syncing them is a
  change to review on its own.
- Branches from finished work remain on GitHub for you to delete, among them `module-0-machine`,
  `module-10-instruction-set` and `module-11-programming`.

### What comes next

Module 12, traps and interrupts, from its plan:

- a handler instead of a stop;
- saving state;
- user and system mode;
- system calls;
- the timer's and the door's interrupts;
- nesting;
- the trap hardware, with a trap timeline pausable at every transition.

Its capstone is a minimal system-call mechanism. Then come checkpoint 5 and Module 13, the final
machine.
