# Brief SC: state-machines, Explanation, Generalisation, Challenge, Reflection, model note

Read 00-module.md and S-facts.md first. This text follows the failure experiment: three faults
in the next-state logic. Do not repeat its results.

## Key `explanation` (section prose, above a figure; 100 to 150 words, two or three paragraphs)

Facts:
1. Between edges the next-state logic works out, from the state and the inputs, the code of the
   next state. That code waits at the register's D. At the edge the register takes it, and the
   next-state logic starts again from the new state.
2. Rows 2 and 3 lead to IDLE, `00`. They need no gate: when no row's gate gives a bit a 1, the
   OR gives 0. Row 9 reads no input, so its term is GIVE_UP's line itself. So the gates are row1,
   row4, row5, row6, row7, row8 and two OR gates.
3. SEND and SIREN come from the output logic, which reads the state alone. An input that changes
   between edges cannot change them; only an edge can.

## Key `nextStateInsideLead` (above the figure; 70 to 110 words)

Facts:
1. The figure is the controller opened at its next-state logic, running, after a reset, in IDLE.
2. The decoder's Y0 is 1. With GO at 0 no row's gate gives a 1, so next is `00`.
3. Press GO to 1: row1 gives 1, the OR gate for bit 0 gives 1, and next is `01`. Press "Clock
   CLK": the state becomes `01`, TRY, and Y1 is 1.
4. Try the inputs in TRY and watch which row's gate lights.

## Key `nextStateInsideAfter` (below it; 30 to 60 words)

Facts: at any moment at most one row's gate gives 1, the row that applies; when the row leads to
IDLE, none does. Each gate is a row of the table, and the table is the state diagram written out.

## Key `retryAsTextLead` (above the generalisation figure, which shows the diagram and the text; 150 to 210 words)

Facts:
1. The figure shows the state diagram beside the controller as the course's text.
2. The register is one `always_ff`: `if (RST) state <= 2'b00; else state <= next;`.
3. The next-state logic is one `always_comb` block. `always_comb` describes gates: its lines are
   worked out again whenever an input changes, not at an edge, and a value is given with `=`,
   not `<=`.
4. Inside it, `case (state)` picks the arm whose label equals the state. Each arm is one state's
   rows in the table's order, as `if` and `else if`. `default` takes every other value, here
   `11`, GIVE_UP. `//` starts a comment, which the circuit ignores.
5. `(state == 2'b01)` is 1 when the two sides are equal, as Module 3's comparator: SEND is 1 in
   TRY. `assign S = state;` gives the state's code to the output S.
6. The text and the table say the same thing, row for row. You can press the inputs and clock
   here too.

## Key `retryAsTextAfter` (below it; 30 to 60 words)

Facts: the state machine's form in text is always the same: the state in an `always_ff` with its
reset, the next state in an `always_comb` with a `case` arm per state, and the outputs from the
state alone.

## Key `predictResetLead` (above the challenge section's prediction; one or two sentences)

Facts: one kind of move is left to predict: the reset. The figure draws the circuit above its
question.

## Key `p3Question` (two or three sentences)

Facts: after a reset, GO 1 for one edge (TRY), then FAIL 1 for one edge (WAIT). Then RST is 1
and TICK is 1 for one edge. What is the state after it?

## Key `p3Explain` (two or three sentences)

Facts: the state is IDLE, `00`. The table says WAIT with TICK 1 goes to TRY (row 7), but the
reset wins: the register's reset acts before its D, as in the registers lesson.

## Key `writeLateOkLead` (above the lab; one to three sentences)

Facts: the lab changes the controller. An OK that arrives while the controller waits means the
manager has read the message after all.

## Key `c2Task` (the task; a short list or six to eight sentences)

Facts:
1. The text box starts with the whole controller's text.
2. Change it so that in WAIT: if OK is 1, the next state is IDLE; otherwise, if TICK is 1, TRY;
   otherwise WAIT. Nothing else changes: GIVE_UP still ignores OK.
3. Inputs GO, OK, FAIL, TICK, RST and CLK; outputs SEND, SIREN and S, the state's code.
4. The tests run the controller through every state, including an edge in WAIT with OK 1, an
   edge in GIVE_UP with OK 1, one test where GO falls while CLK is 1, and one where OK rises
   while CLK is 1.

## Key `c2Hints` (five hints, in this order)

1. (The idea.) Only the WAIT arm of the `case` changes. Write its rows in order: the row with OK
   first.
2. (A mistake.) Adding the OK row after the TICK row lets TICK win when both are 1, and the
   controller sends again though the manager has answered.
3. (A smaller example.) TRY's arm already starts with `if (OK) next = 2'b00;`: an answer ends the
   job.
4. (Part of the answer.) WAIT's arm starts `if (OK) next = 2'b00;`.
5. (The whole answer.) Replace WAIT's arm with:

   ```
   2'b10: begin // WAIT
     if (OK) next = 2'b00;
     else if (~OK & TICK) next = 2'b01;
     else next = 2'b10;
   end
   ```

## Key `reflection` (60 to 100 words, two paragraphs)

Facts:
1. A state machine is a register that holds its state and next-state logic that works out the
   next state from the state and the inputs. Its outputs here come from the state alone.
2. The next-state logic was read off the table, one gate per row; the text says the same table
   with `case`.
3. End with the next question: the codes `00` to `11` were chosen without a reason given. A reset
   always loads `00`. Does it matter which state gets which code?

## Key `modelVsReality` (70 to 110 words)

Facts:
1. The model's inputs change only between edges. A real answer from a phone can arrive at any
   moment, even just before an edge, when Module 4's metastability is the risk. The next lesson
   shows what an input that rises and falls between two edges does.
2. The next-state logic settles before every edge in the model. A real one takes time through the
   decoder, an AND gate and an OR gate, and the clock must leave that time, as for the counter's
   carries.
3. Real tools simplify the gates. The course builds them row by row so each gate matches a row.
   Both give the same next state.
