# Module 8: the CPU datapath

A working note, written as the module was built, on the branch `module-8-datapath`. Times are read
from the clock (`date -u`), not estimated. "The managing model" is the session that planned, wrote
the code and the briefs, and checked every draft; "the drafting subagent" is the subagent that
wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 05:39 UTC (first command in the session).
- Finished: 2026-10-06 09:08 UTC, after the last full check. About 3 hours 30 minutes.

## Log

- 05:39 to 05:46 Read CLAUDE.md, `docs/notes/module-8-plan.md`, `docs/plan.md`, `docs/machine.md`,
  `docs/isa.md`, `docs/platform.md`, `docs/authoring.md`, `docs/style.md`, `docs/simulator.md`,
  the inventory's section 8, `docs/checkpoints.md`, the notes for Modules 6 and 7, the diagrams,
  straight-wires, roomy-wires and SystemVerilog notes, and the lessons `alu-tests`, `memory-map`
  and `register-transfer` with their words. Read the platform code the module builds on: the
  circuit builder, the memory primitives, the library and its placements, the circuit view, the
  drawing pipeline, the memory explorer, the content tests and the HDL parser, gate and
  elaborator.
- 05:47 Measured before writing: building the 64-bit ALU took 260 ms for 2,433 parts. The
  circuit builder checked each new net's name against a set rebuilt from every net so far, which
  is quadratic; a datapath of ten thousand parts would have taken seconds to build. The set is now
  kept as nets are made (46 ms), with the same names out.
- 05:48 to 05:52 `packages/dd-model/src/machine.ts`, the instruction-level reference: one edge of
  the machine as `docs/isa.md` says, in bigints, on a state of PC, sixteen registers (unknown until
  set), the ROM's and the RAM's bytes and the devices; and `assemble.ts`, the authors' assembler
  for `docs/isa.md`'s assembly. Twelve tests, among them the worked example's six encodings and
  its run (the display shows -250). One failed first: `nothing` is a branch that reads no flag,
  and the reference had refused to branch on unknown registers whatever the condition.
- 05:52 to 05:58 `datapath.ts`: the datapath at 64 bits in five stages (below), and
  `datapath-run.ts`, which reads its state off the simulator's nets and compares a run with the
  reference after every instruction. The worked example ran right on the gates at the first try:
  9,856 parts.
- 05:56 to 06:02 Speed. A clock edge of the whole datapath took about 100 ms. Three changes to the
  settle, each exact, brought it to about 50 ms:
  - the history is kept as the nets each step changed, and a step's whole state is put together
    only when a view asks for it, where every step copied ten thousand values twice;
  - after a settle that ended with nothing changing, the next settle's first step works out only
    the readers of the inputs set since, where it worked out every gate; a restore, an oscillation
    or a first settle still works out every gate;
  - the hash that finds a repeated state now folds in every bit of a word, where it read the low 24
    bits and so made states of a 64-bit datapath that differ only above them collide.
  `settle-due.test.ts` holds a run of input changes to a plain settle step for step, and a restore
  to a full first step.
- 06:00 to 06:04 `machine-suite.ts`, the suite in Module 7's manner, and `datapath.test.ts`: 37
  programs (a normal one with every job, load, store and branch; six boundary pairs at the edges
  of the range, every job and every condition on each; three random programs from seed 1; three
  adversarial ones; and one per check that stops the machine, 23), each compared instruction by
  instruction. All passed first time, in 21 seconds. Seen to fail first: with the branch
  condition's XOR fed job bit 1 for bit 0, 30 of the 37 fail, and the memory stage run on a
  program with branches fails at its first `goto`.
- 06:05 to 06:12 Module instances in the SystemVerilog subset: the parser reads `name #(.P(v))
  inst (.port(value), ...);` and a text of several modules; the elaborator builds a module used
  inside another as a block named after the use, of the module's kind, whether the module is the
  text's own or one the course supplies (`CourseModule`: its ports and a function that builds it);
  the top module is the one no other uses. The construct is `instance` in `gate.ts`, and a text of
  two modules counts as using it. The loop check, which looked at every gate's readers by scanning
  every gate, now indexes them and leaves the course's modules alone, as it leaves a flip-flop:
  on a 64-bit datapath it would otherwise have taken minutes. Five tests, passing first time.
- 06:12 to 06:15 The course's modules for a datapath text (`packages/hdl/src/machine-modules.ts`:
  `registers`, `alu`, `memory`, `decoder`, `stops`, `condition`), each built by the same
  function as the drawn block, and the whole datapath as text (`content/lessons/module8.ts`).
  `module8.test.ts` runs the 37 programs through the text, instruction by instruction against
  the reference: all passed first time, in 18 seconds.
- 06:14 The whole Vitest run after these changes: 6 failures, all in Module 2 to 5 fault labs'
  facts. The settle's new first step (only the readers of the inputs set since) missed a case: a
  stuck-at fault on an input drives the input's own net with a fixed value, so setting the input
  changed a net that a part also drives, and the part was not worked out again. The first step now
  works out the drivers of those nets too; a test holds that case to a plain settle. Then 660
  tests passed.
- 06:15 to 06:58 The datapath drawn at every stage. Hand placements for each stage's top level
  (`library-datapath.ts`), and the router learnt hand routes: a wire may carry where it turns,
  across then up or down, kept on the part it leaves. Several wires fed back from one column now
  get trunks of their own, where they shared one x. The full stage needed most of the time: the
  last five problems were the decoder's three outputs to the next-PC block (their U-shaped routes
  must nest: the lowest port turns first, its band lowest, its rise rightmost) and two selector
  outputs that ran within half a cell of the ALU's code wires. The circuit view gained
  `writtenWidth`: a datapath's 64-bit buses are too many and too close to write on the drawing,
  so their values are in the figure's table and in a press's readout.
- 07:00 to 07:10 The datapath figure (`DatapathFigure.tsx`, kind `datapath`): the drawing, a list
  of instructions for the IR bus where the stage has no ROM, Clock edge, Run until it stops and
  Start again, the program with the PC's row marked, the registers with the ones the last edge
  wrote, the buses a lesson names, the devices and the RAM; a prediction of the next edge whose
  answer is read off a copy of the simulator after a real edge; faults; and the last edge step by
  step. `datapath-figure.ts` builds a figure's datapath from lesson data. Written challenges can
  now use the course's modules (`courseModules` on a challenge; the book passes the machine's
  modules to the elaborator). The early stages' output is RESULT, not Y: the drawing would
  otherwise use Y for the register digit and the ALU's word at once.
- 07:10 to 07:12 Lesson 8.1, `instructions`: structure, challenges and facts test before any
  prose. The term gate failed as planned on `remember`, `bytes` and `memory-map` ("instructions"
  pointing ahead); each now lists the exemption.
- 07:12 to 07:20 Briefs: a shared fact sheet (`briefs/00-module.md`) and, per lesson, three prose
  briefs and one for labels. Lesson 8.2, `constants`, built while 8.1's drafts ran.
- 07:20 to 07:35 Lessons 8.3 (`fetch`) and 8.4 (`memory-access`): structure, challenges and facts
  tests, then briefs and drafts. A fault's fixed value, added to a hand-placed drawing, landed in
  rows below the parts and on top of wires; a lesson can now say where it is drawn (`at` on a
  stuck-at fault), and each Module 8 fault has a place checked with the scene's own problems.
  The term gate failed on `register-transfer` ("a branch" of an `if` chain) once 8.5 rationed
  "branch", as planned; it lists the exemption.
- 07:35 to 07:44 Lesson 8.5 (`branches`), with the capstone. Stepping one edge of the whole
  datapath showed PC going to 000 and back, and IR to the program's first instruction and back,
  before settling: the PC and the devices' words were Module 5's registers of gate-level
  flip-flops, whose latches pass values on through the settle model's steps. They are now one
  word of the `memory` primitive each, written at an edge where EN or RST is 1 (`edgeRegister`),
  and the 37 programs still pass on the drawing and the text. The decoder's and the ALU's own
  passing values remain, as the gates make them: HALT passes through 1 on the way to 0, and the
  lesson says so.
- 07:44 to 07:52 Lesson 8.5's briefs and drafts; the figure's own words (brief 6V). The browser
  suite for the module (`tests/educational/module8.spec.ts`): every challenge completed with its
  reference through the page, five wrong texts rejected naming the failing test, saved work graded
  again on load, and the figure used as a learner uses it. Two of its tests were wrong, not the
  page: a row found by "R2" also matched the program's "R2 <= word[sensorA]", and a range input
  does not answer `fill`; both now find what they mean.
- 07:52 to 08:00 The browser's diagram checks caught three things the content tests could not: a
  written challenge's try-it drawing (the digits module, elaborated to slices and constants) ran
  its values off the drawing, so the module's text challenges try out on pins; the fetch stage's
  CAUSE value ran off the drawing's right edge, so the figure writes values of up to 4 bits and the
  tables carry the rest; and in the memory and full stages the clock's trunk turned beside the
  CLK pin's written value. The trunks moved half a cell, and the full stage's next-PC wire moved
  out of their way.
- 08:00 to 08:05 The second pass read the fault figures' results printed under them before the
  learner runs anything (Module 7's review had caught the same). They are now `outcomes`, shown
  once the learner has run the figure with a fault in. The mechanical walk (each page at 1280 and
  375 pixels and in the dark theme, every datapath control pressed): no page wider than the
  screen, no console error from the figures (one 404 for a resource on the first desktop load), and
  the drawing's trail named the circuit `datapath-fetch`; it now says "datapath".
- 08:05 to 08:15 The reading half: five reviewers, one per lesson, with the same written brief
  (`briefs/R-brief.md`), then one sceptic over all their findings (`reviews/findings.md`). Fixes
  to code first: a prediction's values hidden until the learner commits; the capstone moved onto
  the branch; the fetch figure steps its edges; the shop's numbers no longer collide (8.2's
  prediction constant is -100, which no register holds; 8.3's program keeps lesson 1's rooms).
  `main` moved twice (the editor's part names; the browser tests wait for the typefaces); merged
  with no conflict, and the 705 unit tests passed after the merge.
- 08:15 to 08:18 Five fix briefs (`briefs/F1.md` to `F5.md`), drafted, checked and placed.
- 08:18 to 08:38 The full check: 19 browser tests failed. Real, and fixed: on a phone, three
  Module 8 pages were 583 pixels wide (a 64-bit word input's bits each wrote their worth in the
  number, up to 19 digits; such a row now shows each bit's worth inside its group and the group's
  digit), the program table was 2 pixels too wide (its transfers now wrap), and the capstone's own
  browser test still expected the old edge. The other ten are screenshot comparisons, below.
- 08:45 to 09:05 The full check again: every stage passed but ten screenshot comparisons, none of
  them a Module 8 figure. The same ten fail on a clean copy of `main` built in this container, so
  they are this environment's text rendering (question 4).

## Briefs and drafts

A shared fact sheet (`briefs/00-module.md`), then per lesson three prose briefs and one for
labels (`1A` to `5L`), one for the figure's words (`6V`), and five fix briefs after the reviews
(`F1` to `F5`): 31 briefs, every learner-facing string drafted by the drafting subagent and checked
for facts by the managing model. The drafts' faults, as found and fixed:

- **Facts dropped**: the register file's read and write ports (1A); the constant 52 bits of 1
  (2B); "the limit" (2A); "(Module 4)" and the modules' identities in a task (1C). Each put back
  with the fewest words.
- **Facts wrong**: "Last lesson you subtracted them" for Module 7's flags lesson (1A); "the edge
  writes no register" turned into "no edge writes" (1A); "To load a larger constant ... add,
  subtract or shift" (2B; the machine has no shift); "After 500 edges, the simulation stops" for
  a machine that never stops (5B); the fix brief's own instruction "once only" copied into a
  sentence (F5).
- **Voice**: em dashes and "your shop's machine" throughout one draft (3A, sent back); headings
  that copied the brief's descriptions in lower case and a title that was not a question (2L, sent
  back); "operation code", near the rationed "opcode" (1B); "unrecognized" (6V).
- **Not given**: two drafts described their keys instead of writing them (4A, 4B, asked again);
  one lead described the circuit instead of the task (1C, sent back).
- **Repeats**: a reflection that kept the old paragraph beside the new one (F4); "jump" used for
  "go to" in a lesson that introduces the jump (5A). Cut or replaced.

## Reviews

| Lesson | Findings | Upheld | In part | Rejected |
|---|---|---|---|---|
| `instructions` | 9 | 1 | 7 | 1 |
| `constants` | 10 | 4 | 4 | 2 |
| `fetch` | 11 | 4 | 4 | 3 |
| `memory-access` | 8 | 1 | 5 | 2 |
| `branches` | 10 | 5 | 4 | 1 |

What the reviews changed, beyond wording: every prediction's answer was readable in the figure
before the learner committed (the buses table, the status line, the drawing's values), in all
five lessons; the capstone stepped a register copy under a section about the branch; 8.2's
prediction asked for -250 while a register on screen held -250; the fault figures' results were
printed before a run; "held at" where Module 7 says "stuck at". Not acted on: the learner cannot
record a failure experiment's prediction (the course's convention, as Module 7); byte loads are
stated and not run (Module 6 showed bytes; noted in the lesson).

## Why five lessons

Module 7 ended on "where do A and B come from, and where do Y and the flags go?", so the module
builds outwards from the ALU, one question a lesson, each with its own stage of the datapath drawn
and running:

1. `instructions`: the register file and the ALU joined, and a 32-bit word whose digits say which
   registers and which job (kind 1). Introduces **instruction** and **datapath**.
2. `constants`: the last three digits widened to 64 bits and a selector for the ALU's B (kind 2).
3. `fetch`: the program in the ROM, the program counter, the decoder the course supplies closed,
   and the stop logic with the checks on a fetch and an illegal instruction. Introduces
   **program counter** and **fetch**.
4. `memory-access`: loads and stores, the memory map whole with the shop's devices, and the memory's
   checks (kinds 3 and 4).
5. `branches`: the condition from the flags, the next PC, the call and the jump (kinds 5 to 7), and
   the capstone: one edge of the whole datapath stepped through every change it makes. Introduces
   **branch**.

The split falls where a new part of the drawing raises a new question; each lesson's drawing is
the last one plus what that question needs. Control signals are set by hand in the first two
lessons (WRITEY, BCONST), where the lesson teaches what each does; from lesson 3 the decoder sets
them, drawn closed until Module 9.

## Terms

Rationed: instruction and datapath (`instructions`), program counter and fetch (`fetch`), branch
(`branches`). Not rationed, as the plan says: program, machine, processor, control signal,
decode. Exemptions added to lessons on `main`, each with its reason: "instruction" on `remember`,
`bytes` and `memory-map` (each points ahead to the machine in one sentence); "branch" on
`register-transfer` (an arm of an `if` chain). No other lesson on `main` was edited.

## The control signals' names

The course's own, each named for what it does: WRITEY (write register Y), BCONST (B is the
constant), AZERO (A is 0), LOAD, STORE, BYTE, STOP, BRANCH, CALL, JUMP; and the stop logic's GO
(the edge goes ahead: PC's enable and the memory's writes) and WREG (WRITEY AND GO, the register
file's write enable). The cause buses are CAUSEF (fetch), CAUSED (decoder), CAUSEM (memory) and
CAUSE (the one the stop logic passes on). None of P&H's or H&H's names are used.

## What the platform gained

- The settle is faster (lazy history, the first step after a quiet settle works out only the
  readers and drivers of the inputs set since, a full-width hash), and the circuit builder's name
  check is linear: a clock edge of the whole datapath went from about 100 ms to about 50 ms.
- `memory` takes `x` in its list of first words: a register that starts unknown.
- The machine (`packages/dd-model`): `machine.ts`, the instruction-level reference; `assemble.ts`,
  the authors' assembler; `datapath.ts`, the datapath at five stages; `datapath-run.ts`, its
  state read off the nets and compared with the reference; `machine-suite.ts`, the suite in
  Module 7's manner; `datapath-figure.ts`, a figure's datapath from lesson data and what one edge
  does; `library-datapath.ts`, the stages placed and routed by hand.
- Registers that change only at an edge (`edgeRegister`): one word of the `memory` primitive. The
  PC and the devices' words use it, so a stepped edge shows no latch passing values.
- The SystemVerilog subset: module instances (`instance` in the gate), a text of several modules,
  and modules the course supplies (`CourseModule`; `machine-modules.ts`). A challenge names them
  with `courseModules`.
- The drawing: hand routes on a part (`meta.routes`), several fed-back nets from one column on
  trunks of their own, `writtenWidth` on the circuit view, and a fault's fixed value placed where a
  lesson says (`at`).
- The datapath figure (`datapath`), with an `outcomes` text shown only after a run and a
  prediction's values hidden until the learner commits.

## Questions for the author

1. **The door's first edge.** `docs/machine.md` says the door raises its event "when DOOR rises".
   At reset nothing says what DOOR was before, so the build takes "no edge before the first one"
   (the door's last level is kept inverted, and a reset makes it 0), and the reference agrees. A
   door already open at reset therefore raises no event. Say if it should.
2. **Kind 8, jobs 1 to 3 in Module 8.** With no control registers until Module 12, `resume`,
   `RY ← Cc` and `Cc ← RA` stop the machine as "a system job a later module builds", whatever the
   constant; the decoder does not check the control-register number until Module 12 adds the
   registers. `docs/isa.md` makes a number outside 0 to 4 illegal (21); Module 8 reports such an
   instruction as the later system job instead. The reference and the datapath agree.
3. **"Stuck at" or "held at".** The drafts said "held at 0"; the reviews found Module 7 says
   "stuck at", and every Module 8 fault now says "stuck at".
4. **Screenshots in this environment.** `aesthetics.spec.ts`'s screenshot tests fail here for
   figures and pages Module 8 does not touch (the remember lesson's header among them), by 4 to 7
   per cent of pixels: the text is drawn a pixel or so apart. The same ten fail on a clean copy of
   `main` built here. The rule tests in the same file pass, and so does every Module 8 page in
   `diagrams.spec.ts`. The baselines were not updated; CI's Chromium is the judge.

## What the module added to the check's time

The unit tests went from 660 to 706 and from about 40 to about 50 seconds: the 37 programs run
through the drawn datapath (21 s) and through the text (18 s) in parallel with the rest, and the
content tests check every Module 8 figure's circuit under every fault. The browser suite gained 42
tests (21 at each width) and about 1.5 minutes; the whole check took 17 to 19 minutes.

## Candidates for the shared primitives (listed, not extracted)

- **A prediction gate** that hides a figure's values until the learner commits: the datapath
  figure does it by hand; the carry steps and the suite lab hide their whole body instead. Two
  consumers today (datapath, carry steps).
- **Outcomes after a run**: `outcomes` in the fault lab, the suite lab and now the datapath figure.
- **A table of named words** (registers, buses, devices, RAM) beside a drawing: the memory
  explorer's words table and the datapath figure's four tables.

## What I would change

- The datapath drawings are wide (the full stage is about 2000 pixels) and scroll on a phone; a
  phone layout that stacks the memory and the stop logic below would read better, at the price of
  a second set of hand routes.
- The decoder's and ALU's passing values make the capstone's middle steps busy (MET changes many
  times while the carry runs). The lesson says so; a filter that names only the buses whose value
  is final at that step would let a learner follow the instruction's order more easily.
- A challenge on the whole datapath elaborates about ten thousand parts on every keystroke; a
  pause before elaborating would keep the editor quick on a slow phone.
