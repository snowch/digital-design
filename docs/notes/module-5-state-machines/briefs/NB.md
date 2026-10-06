# Brief NB: state-encoding, Investigation, Construction, Failure experiment

Read 00-module.md, S-facts.md and N-facts.md first. This text follows the prediction, which
showed that TRY at `00` makes a reset start the controller sending. Do not repeat that result.

## Key `zeroIdleMachineLead` (above a live state-machine figure with diagram, table and circuit; 110 to 160 words)

Facts:
1. Another choice: one flip-flop per state, where a state's code has a single 1 in that state's
   own bit. Introduce the term, plain meaning first: such codes are called **one-hot**.
2. This figure gives IDLE the code `000` and TRY, WAIT and GIVE_UP one bit each: TRY `001`, WAIT
   `010`, GIVE_UP `100`. Three flip-flops. A reset leads to IDLE.
3. Open the next-state logic. There is no decoder: TRY's, WAIT's and GIVE_UP's lines are the
   register's bits themselves. IDLE's line is a NOR gate of the three bits, 1 only when all are
   0. Each next-state bit is an OR of the rows leading to its state.
4. The table is the same nine rows; only the codes changed. Press the inputs and clock it.

## Key `zeroIdleMachineAfter` (below it; 40 to 70 words)

Facts: with one flip-flop per state, a state is read from one bit, so the next-state logic needs
no decoder. The cost is a flip-flop per state: three here instead of two. IDLE at `000` is what
makes a reset work: the next figures show why it must be.

## Key `construction` (section prose; 40 to 70 words)

Facts: the construction changes the controller's codes in its text, from the last lesson's 2-bit
codes to IDLE `000`, TRY `001`, WAIT `010`, GIVE_UP `100`. The table does not change. Only four
of the eight 3-bit patterns are states.

## Key `writeZeroIdleLead` (above the challenge; one or two sentences)

Facts: the text box starts with the last lesson's controller. Change its codes. Do not give the
answer.

## Key `c1Task` (the task; five to seven short sentences or a short list)

Facts:
1. Change the controller's text so the codes are IDLE `000`, TRY `001`, WAIT `010` and GIVE_UP
   `100`.
2. The state register and S become 3 bits wide: `logic [2:0]`, and the output S is
   `output logic [2:0] S`.
3. Every code in the text changes: the reset, the `case` labels, every next state, and the
   outputs' comparisons.
4. Only four of the eight 3-bit patterns are states. Send every other pattern to IDLE with a
   `default` arm.
5. The tests run the controller through every state, including FAIL rising while CLK is 1 and a
   second reset.

## Key `c1Hints` (five hints, in this order)

1. (The idea.) The table and the `case` arms' rows stay the same. Only the codes, written as
   numbers, change, and they become 3 bits wide.
2. (A mistake.) A 2-bit code left in a 3-bit place is refused, with its line: the text box says
   the value (or the `case` label) is 2 bits wide where 3 are needed. Every code must be written
   with 3 bits, such as `3'b001`.
3. (A smaller example.) The reset line becomes `if (RST) state <= 3'b000;`.
4. (Part of the answer.) The arms' labels become `3'b000`, `3'b001` and `3'b010`. GIVE_UP's arm
   is labelled `3'b100`, and a last arm `default: next = 3'b000;` sends every other pattern to
   IDLE.
5. (The whole answer.) Change `logic [1:0]` to `logic [2:0]` for state, next and S. Write IDLE
   as `3'b000`, TRY as `3'b001`, WAIT as `3'b010` and GIVE_UP as `3'b100` everywhere: the reset,
   the labels, each `next =` and each `(state == ...)`. Label GIVE_UP's arm `3'b100` instead of
   `default`, and add `default: next = 3'b000;`.

## Key `predictOneHotResetLead` (above the failure experiment's first figure; 40 to 70 words)

Facts: what if no state has the all-zero code? This figure gives each state its own bit, IDLE
included: IDLE `0001`, TRY `0010`, WAIT `0100`, GIVE_UP `1000`. Four flip-flops. It draws the
circuit above its question.

## Key `p2Question` (two or three sentences)

Facts: one edge with RST at 1, then GO at 1 for one edge. What is S, the state's code, after it?

## Key `p2Explain` (three or four sentences)

Facts: S is `0000`. The reset loaded `0000`, which no state has. No state's line is 1, so no row
applies, every next-state bit is 0, and the register stays `0000` at every edge, whatever GO
does. The controller never starts. A reset must lead to a state.

## Key `predictShortOkLead` (above the failure experiment's second figure; 50 to 80 words)

Facts: a different failure, with the last lesson's codes. The manager's phone answers OK for a
moment only. The figure resets the controller, sends (GO 1 for one edge, so TRY), then raises OK
to 1 and lowers it again, both between two edges, then gives one edge. It draws the circuit
above its question.

## Key `p3Question` (two sentences)

Facts: OK rose and fell between two edges. What is the state after the next edge?

## Key `p3Explain` (three or four sentences)

Facts: the state is TRY, `01`. The circuit reads OK only at an edge, and at the edge OK was 0,
so row 6 applied and TRY stayed TRY. The manager answered and the office is still waiting.
