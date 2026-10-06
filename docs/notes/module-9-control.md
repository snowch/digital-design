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
