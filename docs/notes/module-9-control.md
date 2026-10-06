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
