# Brief SB: state-machines, Investigation, Construction, Failure experiment

Read 00-module.md and S-facts.md first. This text follows the predictions, which showed TRY
staying TRY after GO fell, and GIVE_UP ignoring a late OK. Do not repeat those results.
"State machine" and "next-state logic" are already introduced.

## Key `retryMachineLead` (above the big live figure; 150 to 210 words, two or three paragraphs)

Facts, in order:
1. The figure shows the whole state machine running, in four views from one simulator. It
   starts after a reset, in IDLE.
2. Introduce the term: the drawing at the top, a box per state with its name and code and an
   arrow per move labelled with the inputs that make it, is a **state diagram**.
3. Under it is the encoded table: one row per move, the state's code, the inputs the row reads
   ("–" where it reads none), and the next state's code. In each state exactly one row applies.
4. Then the circuit: next-state logic, the register, output logic. Each block opens, down to the
   flip-flops' latches. Last, a timing diagram of the run so far.
5. Press the input buttons ("GO = 0" and so on) to set the inputs, and "Clock CLK" for an edge.
   The status line says the state now, the row that applies, and the state the next edge will
   give. The diagram marks the state and the arrow the next edge takes; the table marks the
   row.
6. Try each kind of move: stay (a row back to the same state), advance (IDLE to TRY, TRY to WAIT
   or GIVE_UP), return (TRY to IDLE with OK, WAIT to TRY with TICK), and reset (RST to IDLE).

## Key `retryMachineAfter` (below it; 50 to 80 words)

Facts: the row marked comes from the table; the next state in the status line comes from the
circuit's own wire, next, which reaches the register's D. They agree in every state for every
input: the next-state logic is the table built in gates. The arrow taken at an edge is the row
that applied just before it.

## Key `construction` (section prose; 70 to 110 words)

Facts:
1. The next-state logic is read off the table, row by row, with nothing simplified.
2. Module 3's decoder turns the state's bits S1 and S0 into one line per state: Y0 for IDLE, Y1
   TRY, Y2 WAIT, Y3 GIVE_UP.
3. Each row is one AND gate: the state's line AND the row's inputs, with an input the row needs
   at 0 through a NOT gate.
4. Each bit of the next state is an OR of the rows whose next state has a 1 in that bit.
5. You draw bit 1 of the next state, N1.

## Key `buildNextOneLead` (above the challenge; one or two sentences)

Facts: draw N1 from the table. The parts offered are Module 3's decoder, AND, OR and NOT gates.
Do not give the answer.

## Key `c1Task` (the task; five to seven short sentences or a short list)

Facts:
1. Draw a circuit with inputs S1, S0, OK, FAIL and TICK and output N1.
2. N1 is bit 1 of the next state: 1 in every row whose next state is WAIT `10` or GIVE_UP `11`,
   and 0 in every other row.
3. Use the table: rows 4, 5, 8 and 9.
4. GO is not an input: no row whose next state is WAIT or GIVE_UP reads GO.
5. The tests try all 32 combinations of the five inputs.

## Key `c1Hints` (five hints, in this order)

1. (The idea.) Find the rows whose next state has bit 1 at 1. Make each one an AND gate of the
   state's line and the row's inputs, and join them with an OR gate.
2. (A mistake.) Leaving out a row's input at 0 makes the gate too eager: row 5 without NOT FAIL
   would also be 1 in row 4's case. Every input the row reads must be in its gate.
3. (A smaller example.) Row 8 alone: WAIT's line is the decoder's Y2. Row 8 reads TICK at 0, so
   its gate is Y2 AND NOT TICK.
4. (Part of the answer.) Row 4 is Y1 AND NOT OK AND FAIL. Row 5 is Y1 AND NOT OK AND NOT FAIL
   AND TICK. Row 9 reads no input: its term is Y3 itself.
5. (The whole answer.) Wire S1 and S0 to the decoder. Make NOT OK, NOT FAIL and NOT TICK. Row 4:
   an AND of Y1, NOT OK and FAIL. Row 5: an AND of Y1, NOT OK, NOT FAIL and TICK. Row 8: an AND
   of Y2 and NOT TICK. N1 is an OR of row 4, row 5, row 8 and Y3.

## Key `retryFaultsLead` (above a fault figure; 100 to 150 words)

Facts:
1. The figure is the controller with a fault to choose, drawn opened at its next-state logic,
   where each fault acts.
2. "Run checks" runs six checks and compares each with a healthy controller: "reset", "GO 1",
   "FAIL 1", "waiting" (FAIL back to 0), "TICK 1", and "no answer by the next TICK" (TICK still
   1). The healthy controller goes IDLE, TRY, WAIT, WAIT, TRY, GIVE_UP.
3. The faults: row 4's gate output fixed at 0; row 8's gate output fixed at 0; row 5's AND gate
   made an OR gate. (Refer to them as the first, second and third fault.)
4. Before you run the checks, find each row in the table and say which move breaks.

## Key `retryFaultsOutcomes` (shown only after "Run checks"; a short list, one item per fault)

Facts:
- First fault (row 4 fixed at 0): in TRY with FAIL 1, no row gives a 1, so the next state is
  `00`, IDLE. A failed message is taken for an answered one, and the manager is never told. 4 of
  6 checks fail: "FAIL 1", "waiting", "TICK 1" and "no answer by the next TICK".
- Second fault (row 8 fixed at 0): in WAIT with TICK 0 the next state is IDLE. The controller
  forgets the message it was to send again. 3 of 6 fail: "waiting", "TICK 1" and "no answer by
  the next TICK".
- Third fault (row 5's AND made an OR): row 5 is 1 whenever any of its inputs is, so right after
  the reset, in IDLE with OK 0, the next state is `11`. The controller jumps to GIVE_UP and sounds
  the siren before any message. 4 of 6 fail: "GO 1", "FAIL 1", "waiting" and "TICK 1".
- A row that leads to IDLE has no gate to break: no gate gives a 1 there, so the bits are 0.
