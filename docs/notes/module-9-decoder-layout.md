# Module 9: the decoder's insides placed by hand

A working note, on the branch `module-9-decoder-layout` from `main` at 1d89fab. Times are read
from the clock (`date -u`). "The managing model" is the session that placed the parts, wrote the
routes and checked the words; "the drafting subagent" wrote the learner-facing sentences from a
brief of checked facts. The request came from the session that manages the course: every level of
the decoder a learner can open, placed and routed by hand as the machine's levels already are,
read the way the lesson's words describe it.

## Times

- Started: 2026-10-06 17:33 UTC.
- Layout finished: 18:10 UTC. Words drafted and checked: 18:13 UTC.
- Full check: RESULT_PLACEHOLDER

## What was placed, and why

Every level is placed in `packages/dd-model/src/library-control.ts`: positions in
`CONTROL_INSIDE`, by the block's kind, and routes in `CONTROL_KIND_ROUTES`, also by kind, applied
by `routedByKind` to every block of that kind in the library's `decoder` and in both machines. A
wire from a block's pin carries its route on the part it enters, not on the pin's net: the job's
bits enter the job check and the system jobs alike, whose gates share names, and a route on the
net drew one block's wires in the other.

One rule runs through the bus-shaped levels (the decoder, the checks, the control signals, the
kind lines): each line leaves its source and runs down a column of its own into the parts below
it, and a line from higher up takes a column further right. Two wires that leave one column and
enter another in the same order then never cross; the crossings that remain are a line passing
straight over a column that started above it, which no order of columns avoids.

- **The decoder** (`control-decoder`, `-mem`, `-call`). The kind lines and the split on the left,
  then the bus, then the control signals above the checks. The kind lines that are signals on
  their own (LOAD, STORE, BRANCH, CALL, JUMP; the capstone's LOAD, STORE, BRANCH) run straight out
  above the blocks. The decoder with MEM has a control-signals block with eight outputs, whose
  outputs sit half a row from the seven-output block's; so each variant has a kind of its own, as
  `control-signals-call` already had (`control.ts`, `parts.ts`, the labels unchanged).
- **The checks** (`decode-checks`, `-call`). The kind check, the job check and the number check
  stacked in the order the lesson's lead names them, their OR beside them, then the system jobs
  and the cause. CAUSED's pin sits a cell and a half left of the other outputs: its eight bits are
  written in binary, and the drawing's margin is worked out for hexadecimal.
- **The kind check** (`kind-check`, `-call`). One NOR gate; its inputs fan in from both sides of
  its middle row.
- **The job check** (`job-check`, `-call`). The groups in the order the lesson's words give them
  (kinds 1, 2 and 5; loads and stores; calls and jumps; kind 8), so BRANCH's pin sits after
  KIND2's inside the block. Each group's OR beside the AND that takes its job condition. The job's
  bits come down a bus below; the conditions worked out from them rise to their ANDs in nested
  columns, and the gates for jobs 5 to F sit lowest, J2 and J3 dropping into them from above, so
  no condition crosses another.
- **The number check** was placed in Module 9; two gates moved so that no wire steps half a row.
- **The system jobs**. SYSTEM above STOP, as the lead names them; the job's bits down a bus as in
  the job check.
- **The control signals** (`control-signals`, `-call`). JOBS and MEM first; then each signal in the
  order of the block's outputs, the ANDs that take a job bit beside the ORs, every line down or up
  a bus between them. The capstone's adds kind 9's line and CALL and JUMP as ORs at the bottom.
- **The kind lines** (`kind-lines`, both variants). The 2-to-4 decoder on K3 K2 above the one on
  K1 K0, as the lesson names them, and the ANDs in kind order below both, so every line runs down.
- **Module 3's 2-to-4 decoder** (`decoder-2`), opened inside the kind lines, is drawn as Module 3's
  own figure of its gates draws them (`decoder-gates`). It had been laid out automatically, with S0
  above S1 and the outputs out of order.

Every level was rendered at 1,280 pixels in both themes and looked at, and the checks at 375 in
the dark theme; the figures' first levels are drawn at both widths by the browser suite. Each has no problem under the drawing checks
with the roomy rules on, whether or not it is first shown: the three decoders' every level, and
the checks under each of 9.2's faults and the control signals under 9.1's wrong gate.

## Where each figure opens

- **9.1 `decoder-open`: the top, the decoder closed.** Its lead asks the learner to change K and
  J, and the bit boxes that set a word show only at the top level. The press that opens the
  decoder is the lesson's point: Module 8 drew it closed.
- **9.1 `decoder-faults`: inside the control signals.** A fault lab sets no inputs, so nothing is
  lost there, and both faults are in view: the broken gate, orOp0, and the LOAD line it reads.
- **9.2 `checks-open`: inside the checks.** The checks are the lesson's subject. The learner who
  wants another word goes back to the top with the trail; the lead says how.
- **9.2 `check-faults`: inside the checks**, where both stuck nets are. The stuck parts are placed
  in the empty corner below the pins (`at`), where they had been laid below the drawing and added
  to its height.
- **9.5 (and 9.3, 9.4): the machine's top.** Their figures run programs on the whole machine; the
  decoder is one block of the control unit there.

The content test now holds a figure's first level to the roomy rules, as the browser does, and not
only the top level (`content/lessons/lessons.test.tsx`). It does not under a fault: two figures of
Modules 5 and 6 that open inside a block crowd once a fault is applied (`state-machines`
`retry-faults`, `memory-map` `map-faults`), which is theirs to fix.

## The words

Brief L1 (`module-9-decoder-layout/briefs/L1.md`) and its draft (`drafts/L1.md`). Four leads
changed: the two fault labs and the checks' explorer say where the figure opens, with the course's
sentence about the trail. The check found that two leads were wrong before this branch: 9.1's
"Press K's and J's pins" and 9.2's "Press the pins for K, J and C" name pins that cannot be
pressed (a word's pin is not a button; the bit boxes under the drawing set it). Both now say the
bit boxes, and that they show only at the top level. Every fact was kept; the one change was the
quotation marks the lessons give block names.

## Left

- The library's `decoder-call-register` is named by no lesson; its top level keeps the decoder's
  placement and has two crossings the roomy rules would flag. The capstone's decoder is drawn in
  the machine (`machine-edges-call`), placed as above.
- The written margin of an output word of up to eight bits is worked out for hexadecimal though the
  word is written in binary (`sceneOf`); fixing it would change the width of drawings across the
  course, so pins are placed round it here, as Module 9 did before.
