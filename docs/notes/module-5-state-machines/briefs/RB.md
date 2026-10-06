# Brief RB: register-transfer, Investigation, Construction, Failure experiment

Read 00-module.md and R-facts.md first. This text follows the prediction, which showed PREV
taking NOW's old word. Do not repeat that result. Do not write "transfer".

## Key `nowPrevExplorerLead` (above a live figure; 80 to 120 words)

Facts:
1. The figure is the two registers, after a reset: NOW `0000`, PREV `0000`.
2. Press bits of IN to set a number, press SAVE to 1, and press "Clock CLK": NOW takes IN and
   PREV takes the old NOW. Set a new number and clock again.
3. Press SAVE to 0 and clock: nothing changes.
4. Press a register block to open it: four flip-flops, as in the registers lesson.

## Key `nowPrevExplorerAfter` (below it; 30 to 60 words)

Facts: one wire, from now's Q to prev's D, carries a word from one register to another. Nothing
else is needed to make PREV wait one save behind NOW: the edge does it.

## Key `construction` (section prose; 40 to 70 words)

Facts: the construction draws the two registers from register blocks. The drawing has words of
4 bits, drawn as wide wires. Do not describe how to use the editor (its help is under the
drawing).

## Key `buildNowPrevLead` (above the challenge; one or two sentences)

Facts: draw NOW and PREV. The part offered is the "4-bit register" block, with a reset and a load
enable. Do not give the answer.

## Key `c1Task` (the task; four to six short sentences or a short list)

Facts:
1. Draw a circuit with inputs IN (4 bits), SAVE, RST and CLK, and outputs NOW and PREV (4 bits
   each).
2. At an edge where RST is 1, NOW and PREV become `0000`.
3. Otherwise, at an edge where SAVE is 1, NOW takes IN and PREV takes the word NOW had before the
   edge. At an edge where SAVE is 0, both keep their words.
4. The tests include one where SAVE falls while CLK is 1 and one where SAVE rises while CLK is 1.

## Key `c1Hints` (five hints, in this order)

1. (The idea.) Each register takes its D at an edge where its EN is 1. PREV's D must carry the
   word NOW holds.
2. (A mistake.) Wiring IN to both registers' D makes PREV the same as NOW after every save.
3. (A smaller example.) With one-bit flip-flops, a shift register's second flip-flop takes the
   first one's Q. PREV is the second of a chain of two registers.
4. (Part of the answer.) The register for NOW takes D from IN. The register for PREV takes D from
   the first register's Q.
5. (The whole answer.) Place two "4-bit register" blocks. Wire IN to the first block's D and
   its Q to NOW and to the second block's D. Wire the second block's Q to PREV. Wire SAVE to both
   EN pins, RST to both RST pins, and CLK to both CLK pins.

## Key `predictLongPressLead` (above the failure experiment's first figure, a prediction; 50 to 80 words)

Facts: the circuit has a flaw that the tests above do not catch. A person pressing Save holds the
button for far longer than one clock period, so SAVE stays 1 for many edges. The figure saves
`0011`, sets IN to `0101`, then holds SAVE at 1 for three edges. It draws the circuit above its
question.

## Key `p2Question` (two or three sentences)

Facts: after a save of `0011`, IN is `0101` and SAVE is held at 1 for three edges. What is PREV
after the third edge?

## Key `p2Explain` (three to five sentences)

Facts: PREV is `0101`. The first edge of the press saved `0101` into NOW, and PREV took `0011`.
The second edge saved `0101` again, and PREV took NOW, which was `0101` by then. The number
before, `0011`, is lost. The clock does not wait for a finger.

## Key `saveOnceLead` (above the fix, a live figure; 100 to 140 words)

Facts:
1. The fix saves once per press. A flip-flop, last, takes SAVE at every edge: its Q, OLD, is
   what SAVE was at the edge before.
2. A NOT gate and an AND gate make STEP = SAVE AND NOT OLD. STEP is 1 only before the first edge
   of a press. After that edge, OLD is 1, so STEP is 0 for the rest of the press.
3. STEP drives both registers' EN in place of SAVE.
4. The figure starts with NOW `0011`, PREV `0000`, IN `0101`, SAVE 0. Press SAVE to 1 and press
   "Clock CLK" three times. Then press SAVE to 0, clock once, and press it again.

## Key `saveOnceAfter` (below it; 40 to 70 words)

Facts: after the first edge NOW is `0101` and PREV `0011`; the next two edges change nothing.
A new press saves again. The fix is itself a word passed from one flip-flop to another: last
keeps SAVE's value from one edge to the next.
