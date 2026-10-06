# Brief CB: counters, Investigation, Construction, Failure experiment

Read 00-module.md and C-facts.md first. This text follows the prediction section, whose figures
showed Q wrapping from `1111` to `0000`, and EN 0 keeping the count. Do not repeat those
results.

## Key `counterExplorerLead` (above a live figure; 100 to 140 words)

Facts, in order:
1. The figure is the circuit from the predictions: a 4-bit register and an "add one" block. Q
   feeds back from the register to the block; the block's NEXT goes to the register's D.
2. At the start Q is `XXXX`: no edge has set it. Press RST to 1, then "Clock CLK": Q is `0000`.
3. Press RST back to 0 and EN to 1. Each press of "Clock CLK" adds one to Q. Press EN to 0 and
   the count stays.
4. Press the "add one" block to open it: four half adders in a chain, ha0 to ha3. ha0 adds bit
   0 of Q and EN; each later one adds its bit of Q and the CARRY of the one before.
5. Introduce the term, plain meaning first: a register whose D is its own Q plus one, so it goes
   up by one at each edge where EN is 1, is a **counter**.

## Key `counterExplorerAfter` (below it; 40 to 70 words)

Facts: TICK is the last half adder's CARRY. It is 1 while Q is `1111` and EN is 1: the next edge
will wrap to `0000`. To measure a wait of 16 edges, start the counter at `0000` and wait for
TICK.

## Key `construction` (section prose; 50 to 80 words)

Facts: the construction draws a 2-bit counter from the parts, to see the chain built. Each bit is
one flip-flop with a reset and one half adder. Do not describe how to use the editor (its help
is under the drawing).

## Key `buildCountTwoLead` (above the challenge; one or two sentences)

Facts: draw a 2-bit counter. The parts offered are "D flip-flop with reset" blocks and half adder
blocks. Do not give the answer.

## Key `c1Task` (the challenge's task; four to six short sentences or a short list)

Facts:
1. Draw a circuit with inputs EN, RST and CLK and outputs Q1 and Q0.
2. At an edge where RST is 1, Q1 and Q0 become 0.
3. Otherwise, at each edge where EN is 1, Q1 Q0 counts up by one: `00`, `01`, `10`, `11`, then
   `00` again. At an edge where EN is 0, they keep their value.
4. The tests change the inputs one at a time and check Q1 and Q0, including one test where EN
   changes while CLK is 1.

## Key `c1Hints` (five hints, in this order; one to three sentences each)

1. (The idea.) Each flip-flop's D must be the next number's bit: its own bit plus whatever is
   carried into it. A half adder gives both a SUM and a CARRY.
2. (A mistake.) Feeding EN straight to both half adders adds 1 to each bit at once, so the count
   jumps. Only bit 0 adds EN; bit 1 adds the carry from bit 0.
3. (A smaller example.) One bit alone: a half adder with A from Q0 and B from EN gives SUM = Q0
   XOR EN. At an edge where EN is 1, Q0 flips; where EN is 0, it keeps its value.
4. (Part of the answer.) Half adder 0: A is Q0, B is EN, SUM goes to Q0's flip-flop's D. Half
   adder 1: A is Q1, and B is half adder 0's CARRY.
5. (The whole answer.) Place two "D flip-flop with reset" blocks and two half adders. Half adder
   0 adds Q0 and EN; its SUM drives the first flip-flop's D, whose Q is Q0. Half adder 1 adds Q1
   and half adder 0's CARRY; its SUM drives the second flip-flop's D, whose Q is Q1. Wire CLK and
   RST to both flip-flops.

## Key `counterFaultsLead` (above a fault figure; 90 to 130 words)

Facts:
1. The figure is the 4-bit counter again, with a fault to choose. "Run checks" runs seven checks
   and compares each with a healthy counter: "reset", "edge 1" to "edge 5" with EN 1, then "edge
   with EN 0".
2. The healthy counter gives `0000`, `0001`, `0010`, `0011`, `0100`, `0101`, then `0101` again.
3. The three faults: the wire carrying ha1's CARRY into ha2 fixed at 0; EN fixed at 1; and ha0's
   XOR gate made an OR gate. (Use the fault labels the page shows; they will be given to you
   when they are drafted: refer to them as "the first fault", "the second", "the third" if you
   need to, and describe what each changes.)
4. Before you run the checks, say which ones you expect to fail, and what the count will do.
   Press the "add one" block to see where the fault acts.

## Key `counterFaultsOutcomes` (shown only after "Run checks"; a short list, one item per fault)

Facts:
- First fault (carry into ha2 cut): bit 2 never gets a carry, so it never changes. The count
  goes `0000` to `0011` and starts again at `0000`. 3 of 7 checks fail: "edge 4", "edge 5" and
  "edge with EN 0".
- Second fault (EN fixed at 1): every edge counts, so "edge with EN 0" gives `0110` instead of
  `0101`. 1 of 7 fails.
- Third fault (ha0's XOR made an OR): bit 0 becomes 1 at the first edge and never returns to 0,
  so the count goes up by two: `0001`, `0011`, `0101`, `0111`, `1001`. 5 of 7 fail: "edge 2" to
  "edge 5" and "edge with EN 0".

## Key `predictNoResetLead` (above the second figure, a prediction; one or two sentences)

Facts: a counter that is never reset. The figure draws the circuit above its question.

## Key `p3Question` (two or three sentences)

Facts: EN is 1 and RST stays 0 from the start. CLK rises three times. What is Q after the third
edge?

## Key `p3Explain` (two or three sentences)

Facts: Q is `XXXX`. No edge set Q, so it starts unknown, and one plus an unknown number is
unknown: each half adder's SUM is X when its bit of Q is X. A counter needs its reset before it
counts.
