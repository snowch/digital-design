# Brief CC: counters, Explanation, Generalisation, Challenge, Reflection, model note

Read 00-module.md and C-facts.md first. This text follows the failure experiment (three faults,
then a counter never reset that stays `XXXX`). Do not repeat those results.

## Key `explanation` (section prose, above a figure; 70 to 110 words, two paragraphs)

Facts:
1. Why a counter counts: at every edge, every flip-flop of the register takes its D at once.
   D is NEXT, worked out by the half adders from the Q of before the edge. Q changes, the half
   adders work out a new NEXT, and nothing more happens until the next edge.
2. The carry passes along the chain one half adder at a time, so NEXT does not change all at
   once. The figure below shows this.

## Key `addOneLead` (above the figure; 70 to 110 words)

Facts:
1. The figure is the "add one" block opened, alone, in the stepped model (badge "Stepped"). Q is
   set to `0111` and EN to 0, so NEXT is `0111`.
2. Press EN to 1. The status line says "Settled in 5 steps."
3. Move the "Step" slider back to step 0 and forward one step at a time. NEXT passes through
   `0110`, `0100` and `0000` before it settles at `1000`: each step, the carry reaches one more
   half adder.
4. Press bits of Q to try other numbers, such as `1111`.

## Key `addOneAfter` (below it; 50 to 80 words)

Facts: the register never takes `0110`, `0100` or `0000`. It takes D only at an edge, and the
adder settles between edges. That is why the registers lesson's rule matters: every flip-flop
gets CLK itself, so all four bits change at the one edge, after the carries have settled. With Q
`1111` and EN 1, NEXT is `0000` and COUT is 1: that is TICK.

## Key `countToFiveLead` (above the generalisation figure; 80 to 120 words)

Facts:
1. A wait of 16 edges is only one wait. To count 6 edges, the counter must go from `0101` back to
   `0000`.
2. The figure adds Module 3's comparator. It compares Q with a fixed word, `0101`. Its output,
   EQ, is 1 while Q is `0101`. EQ is the TICK here.
3. EQ, ORed with RST, drives the register's RST. So the edge after `0101` loads `0000`.
4. The figure starts at `0000`, after a reset, with EN at 1. Press "Clock CLK" and watch Q and
   TICK.

## Key `countToFiveAfter` (below it; 40 to 70 words)

Facts: Q goes `0000`, `0001`, `0010`, `0011`, `0100`, `0101`, then `0000`. TICK is 1 while Q is
`0101`: once every 6 edges. Changing the fixed word changes the wait. The gates in front of D
decide the next number; here they choose between the next number up and `0000`.

## Key `buildCountTickLead` (above the last challenge; one to three sentences)

Facts: the lab: the counter the shop's wait needs, 4 bits with TICK, drawn from the same parts as
the construction.

## Key `c2Task` (the task; a short list or five to seven sentences)

Facts:
1. Draw a circuit with inputs EN, RST and CLK and outputs Q3, Q2, Q1, Q0 and TICK.
2. RST and EN act as in the 2-bit counter: at an edge where RST is 1, every bit becomes 0;
   otherwise at an edge where EN is 1, Q3 Q2 Q1 Q0 counts up by one, from `0000` to `1111` and
   then back to `0000`; where EN is 0, it keeps its value.
3. TICK is 1 while the count is `1111` and EN is 1, and 0 otherwise. TICK changes as soon as EN
   or the count changes, not only at an edge.
4. The tests count all the way up, and include tests where EN changes while CLK is 1.

## Key `c2Hints` (five hints, in this order)

1. (The idea.) Extend the 2-bit counter: each bit needs its own flip-flop and half adder, and
   each half adder after the first adds the CARRY of the one before.
2. (A mistake.) A TICK taken from an AND of the four Q outputs alone stays 1 at an edge where EN
   is 0, but the tests expect 0 then. TICK must also need EN.
3. (A smaller example.) In the 2-bit counter, half adder 1's CARRY is Q1 AND Q0 AND EN: it is 1
   only while the count is `11` and EN is 1.
4. (Part of the answer.) The last half adder's CARRY, from the half adder whose A is Q3, is 1
   only while Q3, Q2, Q1, Q0 and EN are all 1. Wire it to TICK.
5. (The whole answer.) Four "D flip-flop with reset" blocks and four half adders. Half adder 0
   adds Q0 and EN; each next one adds its bit of Q and the CARRY before it; each SUM drives its
   bit's flip-flop's D. CLK and RST go to every flip-flop. The last CARRY drives TICK.

## Key `reflection` (60 to 100 words, two paragraphs)

Facts:
1. A counter is a register whose D is its own Q plus one, from a chain of half adders. EN decides
   whether an edge counts. RST starts it at `0000`. TICK, the last carry, says the count is about
   to wrap round.
2. The gates in front of D decide the next number. In the counter they always choose the next
   number up, or `0000`. End with the next question: the office's message needs a circuit that
   does one of several jobs, sending, waiting, giving up, and chooses its next job from what
   happened. What would the gates in front of D need then?

## Key `modelVsReality` (60 to 100 words)

Facts:
1. In the clocked model the circuit settles before every edge. In hardware the clock must be
   slow enough for the carry to pass along the whole chain of half adders before the next edge.
   This is the setup time of Module 4 again, for the slowest path from a flip-flop to a
   flip-flop.
2. A longer counter has a longer chain, so it needs a slower clock or a faster way to work out
   the carries.
3. The model's gates each take one step; real gates take different times.
