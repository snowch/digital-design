# Module 9: control

A working note, written as the module was built, on the branch `module-9-control`. Times are read
from the clock (`date -u`), not estimated. "The managing model" is the session that planned, wrote
the code and the briefs, and checked every draft; "the drafting subagent" is the subagent that
wrote every learner-facing sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 10:31 UTC (first command in the session).

## Log

- 10:31 to 10:40 Read CLAUDE.md, `docs/plan.md`, `docs/notes/module-9-plan.md`, `docs/machine.md`,
  `docs/isa.md`, `docs/notes/module-8-datapath.md`, `docs/platform.md`, `docs/authoring.md`,
  `docs/style.md`, `docs/simulator.md`, the inventory's section 8, `docs/checkpoints.md`, the
  lessons `branches`, `fetch`, `state-machines` and `register-transfer` with their words, and the
  code the module builds on: the reference (`machine.ts`), the datapath and its run, the suite, the
  figure's datapath, the hand placements, the datapath figure, the state machine's figure and
  data, the machine's modules for the SystemVerilog subset, the content tests and Module 8's
  browser tests.
- 10:40 to 10:52 The reference takes options (`MachineOptions`: Module 9's check on a control
  register's number, and the capstone's call through a register); the authors' assembler writes
  `call R4 + 8, R15` only when told the kind. The decoder opened (`control.ts`) and the machine of
  several edges (`multicycle.ts`, `multicycle-run.ts`). On its first run the machine matched the
  reference after every instruction on all 37 programs of Module 8's suite, at about 10 ms an
  edge (7,178 parts; Module 8's full stage takes about 50 ms an edge). The decoder's tests: it
  finds illegal exactly what the reference finds, for every K and J under ten constants, and gives
  every legal instruction Module 8's decoder's signals. One test was wrong, not the circuit: it
  expected STOP to be 0 where the instruction is also illegal; STOP is the job alone, and the stop
  logic lets the cause win, as in Module 8. Seen to fail: the machine with IREN stuck at 1, HOLDM
  stuck at 0, CHECKING stuck at 0, or PCEN stuck at 1.
- 10:52 to 10:56 The machine as SystemVerilog (`content/lessons/module9.ts`: a top module, the
  controller in Module 5's form and the decoder as a `case` on K) with the course's modules for a
  memory of one port and the stop logic (`packages/hdl/src/machine9-modules.ts`, set `machine9`).
  Module 8's suite through the text matched the reference on the first run, in 48 seconds.
- 10:56 to 11:27 The drawings. Drawn automatically, the machine was a tangle about 4,000 pixels
  wide with 45 wire problems at its top level. Rather than route eighty wires by hand at one
  level, the machine is three blocks (control unit, datapath, memory) joined by a control bus of
  22 signals and the words between them, and each block opens; the bus is split beside the parts
  each piece of it drives. Then every level was placed by hand, checked with the content test's
  `sceneProblems` and looked at as a screenshot after each change. Two things went wrong on the
  way: the bus's join, a bare component, drew as an empty box with no wires into it (it is now a
  block with a port per signal); and the top level's hand routes for the clock and reset into a
  block named `memory` applied inside the memory block too, to the memory component of the same
  name (the outer block is now `port`). Module 5's figure draws the controller's circuit with 55
  problems (its layout was made for two-bit states), so lesson 9.3 shows the controller there as
  its diagram, table, trace and text, and its circuit inside the machine's drawing.
- 11:27 to 11:37 The figures of their own: the decoder's rows as a table (`control-table`), the
  map of every kind and job (`kind-map`), each kind's edges (`kind-edges`), all three read off the
  circuits as the page renders them; and the views of one edge beside the drawing (the
  instruction's edges and their transfers, the signals at the next edge, the controller's state
  diagram with its state marked, a timing diagram of the edges so far).
- 11:37 to 12:02 The five lessons' structure, their challenges and tests, with every word a
  placeholder. Faults first tried on IREN, MEM and PCEN gave unknowns everywhere (the IR held X
  after a reset); the IR now resets to 0, which the checks see as illegal only in READ. A stuck
  value on a net of the control bus drew its part at the wrong level; the control unit's nets are
  named `control/X` and each such fault is placed by the lesson (`at`).
- 12:02 to 12:33 The briefs (`docs/notes/module-9-control/briefs/`), the drafts, the checks, and
  the facts tests. Writing brief 5A, the managing model worked the capstone's edges out again and
  found the ALU edge it had given the call through a register was not needed: the instruction
  sets CALL, so the controller takes it from READ to WRITE, and at that edge the PC takes the
  ALU's result, which HA and the constant have fed since READ. With the extra edge, HR took a
  word nothing read. The capstone now takes the call's three edges, and the controller does not
  change: the reference's sequence, the drawn controller, the text, the tests and the lesson were
  changed together, and a unit test now walks the controller's table with the decoder's signals
  for every kind and compares the walk with the sequence the lessons state. Two lessons' figures
  moved: the decoder's table (9.1) and the map (9.2) were in the motivation, above predictions
  they answered, and are now in the explanation; 9.2's prediction became a stop whose constant is
  5, which passes, since the motivation states the rule on the number.

## Why five lessons

Module 8 ended on "how does the decoder work out those signals from K and J alone?", and the plan
asks for the decoder opened, illegal instructions, several edges an instruction, the four views
and a capstone. Each lesson answers the question the one before ends on, and each split falls
where a new part of the machine raises a new question:

1. `control-signals`: the decoder Module 8 drew closed, opened: one line per kind from Module 3's
   2-to-4 decoder twice, and each signal an OR of the kinds that need it. Introduces **control
   unit**. Ends: what should the machine do with a word that is no instruction?
2. `illegal-instructions`: the decoder's checks, with the constant as an input for the check on a
   control register's number (the decision of 6 October 2026). Introduces **illegal
   instruction**. It is a lesson of its own because the checks are a second block with a second
   input, and because the map of every kind and job needs its own room. Ends: what if the machine
   had one memory reached by one address?
3. `several-edges`: one memory port, the IR a register, the held words HA, HB, HR and HM, and the
   controller as Module 5's state machine with its next-state logic. Introduces **instruction
   register**. Ends: which signals make each edge do its work?
4. `micro-operations`: the controller's output logic, and the four linked views of one run.
   Introduces **micro-operation**. Lessons 3 and 4 split the controller as Module 5 split the
   retry controller: its states and moves first, then what each state does. Ends on the call
   through a register.
5. `new-instruction`: the capstone, the call through a register, end to end. Introduces nothing.

## Each kind's sequence of edges, and why

The controller has five states, each named for what its edge does: FETCH (`000`, IR ← memory[PC]),
READ (`001`, HA ← RA and HB ← RB; the decoder's checks count here), ALU (`010`, HR ← the ALU's
result), MEMORY (`011`, HM ← the word a load reads, or the store's write), WRITE (`100`, RY ← HR,
HM or PC + 4). The edge whose next state is FETCH ends the instruction: the PC takes the next PC
there and only there (PCEN), so the PC keeps the instruction's address through all its edges.

| Kind | States | Edges | Why |
| --- | --- | --- | --- |
| register job, constant job (1, 2) | FETCH READ ALU WRITE | 4 | the ALU's result is held in HR and written at its own edge |
| load (3) | FETCH READ ALU MEMORY WRITE | 5 | the address is the ALU's result; the memory's word is held in HM, then written |
| store (4) | FETCH READ ALU MEMORY | 4 | the address is the ALU's result; nothing to write |
| branch (5) | FETCH READ ALU | 3 | the condition reads the ALU's flags at the ALU edge, where the PC takes the next PC |
| call (6) | FETCH READ WRITE | 3 | no ALU work: the target comes from the next-PC block, and RY ← PC + 4 at WRITE |
| jump (7) | FETCH READ ALU | 3 | the PC takes the ALU's result, RA + c, at the ALU edge |
| call through a register (9, the capstone) | FETCH READ WRITE | 3 | the call's way: at WRITE the PC takes the ALU's result, which HA and c have fed since READ |
| stop, or an illegal word | FETCH, then halts in READ | 2 | the decoder's checks count only in READ, where the stop logic halts the machine |

Why READ for every kind, even a call or an absolute load that uses neither register: READ is
where the decoder's checks count (in FETCH the IR still holds the last instruction, or 0 after a
reset, and 0 is illegal), and where the controller reads CALL to choose its way. Why the PC waits:
a call's WRITE edge writes PC + 4, a branch's target is PC + 4c, both from the PC of the
instruction itself, and a stop leaves the PC on the stop, as Module 8's machine does. Why the
fetch does not add 4 (as the textbooks' fetch states do): the next PC is Module 8's block, which
already works out PC + 4, so the fetch needs no adder of its own.

The timer and the door's register move only at an instruction's end (ENDS), so the timer counts
instructions, as `docs/machine.md` requires, and both machines reach the same count at the same
instruction. Every enable that writes is ANDed with GO, so the edge at which the machine halts
writes nothing.

## Terms

Rationed, each introduced where the lesson's circuit first raises the question it answers:
**control unit** (`control-signals`), **illegal instruction** (`illegal-instructions`),
**instruction register** (`several-edges`), **micro-operation** (`micro-operations`). The capstone
introduces none. Not rationed, as the plan says: step, decode and decoding, controller, program,
machine, control signal. "Cycle" appears in no Module 9 lesson; the brief forbade it, and every
lesson says "edge". "Step" is kept for the settle model's steps; the stages of an instruction
are its edges, named by the controller's state.

One `termExemptions` entry was added to a lesson on `main`, and no other lesson on `main` was
edited: `fetch` (8.3) names cause 21 as "an illegal instruction", the decoder's own words for
the cause, where the machine stops on a word of 0s. Its reason, in the lesson: "Names cause 21 in
quotation marks, as the decoder's output says it, where the machine stops on a word of 0s; lesson
9.2 teaches which words are illegal and why." Module 8's figure strings say "an illegal
instruction" for cause 21 too; strings are not held to the gate, and the term is the course's
name for that cause.

## The capstone: a call through a register

The instruction is `docs/isa.md`'s "call through a register", `RY ← PC + 4` and `PC ← RA + c`,
at kind 9, job 0, in the learner's own copy of the machine's text. `docs/isa.md` does not change,
and the course's machine still refuses kind 9 with cause `21`. Every part it changed, and how each
change was tested:

- **The reference** (`packages/dd-model/src/machine.ts`): `MachineOptions.callThroughRegister`
  names the kind; `step` runs it as the transfer says. Tested in `control.test.ts` against
  hand-worked results, and by the suite below.
- **The authors' assembler** (`assemble.ts`): `call R4 + c, R15` writes kind 9 only when told the
  kind, and refuses with "this machine has no call through a register" otherwise. Tested in
  `control.test.ts`.
- **The drawn decoder** (`control.ts`, option `callThroughRegister`): a line KIND9; CALL and JUMP
  become OR gates (orCall of KIND6 and KIND9, orJump of KIND7 and KIND9), and KIND9 joins the ORs of
  WRITEY, BCONST and OP1; the kind check and the job check learn kind 9. Tested against the
  reference for every kind and job under ten constants (`control.test.ts`); the drawing's
  problems checked under every fault by the content tests.
- **The decoder's text** (`content/lessons/module9.ts`, `decoderText(true)`): one `case` arm and
  two changed terms of ILLEGAL. Tested as the capstone's first challenge (263 tests), whose
  reference passes and whose start fails 17.
- **The controller: no change.** The instruction sets CALL, so the controller takes the call's
  way, FETCH, READ, WRITE, and at the WRITE edge the PC takes the ALU's result, which HA and the
  constant have fed since READ. The build first gave it an ALU edge and a controller row of its
  own; working the edges out again for the lesson's brief showed that HR took a word nothing
  read, and the row went. `control.test.ts` walks the controller's table with the decoder's
  signals for every kind, the capstone's included, and compares the walk with `stateSequence`.
- **The datapath: no change.** "word for Y" already gives PC + 4 when CALL is 1, and the next PC
  already takes the ALU's result when JUMP is 1, last, so JUMP wins over CALL's target.
- **The machine, end to end**: the drawn machine with the capstone's decoder matches the
  reference after every instruction on Module 8's suite and on a program of two such calls,
  each in 3 edges (`multicycle.test.ts`); the machine's text does the same
  (`content/lessons/module9.test.ts`); the capstone's second challenge runs the shop's program
  through the learner's text edge by edge (23 tests, a reset raised and dropped while the clock
  is high among them), and its start fails 17, first at the call's READ edge.

## What the platform gained, and why

- **The machine of several edges** (`packages/dd-model`): `control.ts` (the decoder opened, with
  the constant as an input, as gates; the controller as Module 5's machine; each kind's states),
  `multicycle.ts` (the machine built from Module 8's parts and Module 5's state machine, one
  memory port, as three blocks joined by a control bus), `multicycle-run.ts` (its comparison with
  the reference, instruction by instruction, with each kind's edge count checked),
  `multicycle-view.ts` (each edge's state, signals and register transfers, read off the nets),
  `library-control.ts` (the drawings, placed and routed by hand). Module 8's datapath stages and
  decoder are untouched; `datapath.ts` exports helpers it had kept private, and its memory ports
  take FETCHING and ENDS for a memory of one port.
- **The reference keeps the effect** and takes `MachineOptions` (`MODULE_9` for the check on a
  control register's number, and the capstone's kind). Module 8's stages are compared with the
  reference without the options, so their comparisons are unchanged.
- **Figures**: `control-table`, `kind-map` and `kind-edges` (`ControlViews.tsx`), each read off the
  circuits as the page renders it; the datapath figure's views of one edge (`microOps`, `signals`,
  `states`, `timing`), and two new questions it can ask (`edges`, `took`). Their words are in
  `strings.ts` under `control`, drafted from brief 6V.
- **The SystemVerilog subset**: the course's modules for Module 9 (`machine9-modules.ts`: a memory
  of one port and the stop logic, with the register file, the ALU and the condition), sets
  `machine9` and `machine9-call`.
- **The drawing**: `placedInside` accepts parts with a placement of their own (a fault's `at`), and
  eight block kinds are drawn closed.
- Module 8's overview strip and zoom (a trial on `main`) was turned on for the four views, then
  off again at the managing session's word (12:52): the trial stays on one figure until the author
  has tried it. The four views are where it would help most.

## Reviews

Each lesson had a reviewer subagent with `briefs/R-brief.md`, reading the lesson as text, and a
sceptic subagent with `briefs/S-brief.md`, ruling on every finding. Both reports are saved in
`docs/notes/module-9-control/reviews/`. Most findings stood or stood in part; those that
fell include 9.3's "the prediction can be read off the motivation",
9.5's "the ALU is gates gives the wrong reason", the test counts that differ from the listed
labels (the page counts only steps that check something), and 9.1's "the fault lab's cause comes
from outside the drawing".

Fixes, code first:

- `checks-text` (9.2) let an answer that ORs the check on the number in alone pass all 280 tests,
  the mistake its own hint names; the browser's wrong-attempt test found the same. Seven tests
  were added (287): jobs 0, 1 and 4 of kind 8 with 5 and with -1, and an add with 5.
- The four views (9.4) show AZERO and BCONST among the signals and IR, HR and HM as buses, which
  its text reads; the fault figure of 9.3 shows the controller's states, so the skipped MEMORY
  edge can be seen.
- Then the words, from five fix briefs (`briefs/F1.md` to `F5.md`) to the drafting subagent:
  "checks" kept for the decoder's block and the fault lab's runs called the instructions or words;
  the gates' roles in 9.1's explanation; a control register explained in 9.2, its third reason held
  back until after the prediction; IR set against Module 8's bus in 9.3, PCEN's exception at the
  stop, the branch's MET; the rule for enables stated only for the signals that let a register
  take a word (9.4); CALL and JUMP named as OR gates before the capstone's faults (9.5); the
  claim of a choice "at run time" softened to what the figure shows; repeats cut.

## Briefs and drafts

Every learner-facing string was drafted by the drafting subagent from a brief of checked facts
(`docs/notes/module-9-control/briefs/`, with `00-module.md` the shared sheet and `docs/style.md`
attached), one brief per part of a lesson (A, B, C), one for its labels (L), one for the figures'
words and the blocks' labels (6V), and one per lesson for the review's fixes (F1 to F5). The drafts
as returned are in `drafts/`, with each redraft after the note that sent it back. The managing
model checked facts only, added the fewest words where a fact was missing, and cut repeats; the
fixes it made itself are listed in the placing script's table, reproduced here.

What the drafts dropped, got wrong, or drifted on:

- **Dropped**: the earlier lesson's closing question at the head of 3A, 4A and 5A's fix (each
  restored: 3A and 4A sent back, 5A's by adding the sentence); Module 8's machine stopping at
  `82000005`, and Module 12 building the control registers (2A, words added); "the machine stops"
  after cause `21` (2A, added); the reason Module 9's decoder reads C (2A, added); "3" in "the start
  fails 3" (2B, added); the word `25001F48` and the tables appearing after the prediction (4A, sent
  back); the margin program's change (4A and 4B's fix, added); the checks block learning a new kind
  (F1, added); the text of 4B, whose first reply described the text instead of giving it (sent
  back).
- **Wrong**: "the control unit sets MEM" and "the control unit transitions" where the decoder and
  the controller do (3B, sent back); "At the start, FETCHING and IREN are 1" (4B, corrected to
  "written"); "It sets CALL" read as the controller (5B, sent back); "a word whose kind and job the
  decoder knows" as the definition of an illegal instruction (F2, sent back); "the decoder's checks
  block" for the control signals block (F1, corrected); "Both keep one memory port" (F5,
  corrected); "An **illegal instruction** is one the decoder does not recognise" replacing the
  reason the checks wait for READ (3C, sent back).
- **Drifted**: "control unit" and "instruction register" bolded again in later lessons (3A, 3B, 3C,
  1C; bold removed or sent back); "jobs 1 to 3 are handled by a later module" for "stop the
  machine" (2A, corrected); "needs no new hardware" for "no new signal" (4C, later rewritten by F4);
  "both in one edge" in 2C's closing question (sent back); invented facts in 4A ("at the left",
  "the second program from Module 8", sent back); headings ending in full stops (4L, stripped);
  2L's headings "Write numbers as text" and "Memory reused" and caption "Try other words to test"
  (put back to the brief's words); the 6V labels "result hold" for HR and HM (kept "held word") and
  "ops" for the column of transfers (kept "Transfers").
