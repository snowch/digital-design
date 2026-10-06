# Lesson fact sheet: "counters" (Module 5, lesson 2)

Read the shared fact sheet (00-module.md) first. This sheet holds the facts of this lesson.

## Terms this lesson introduces, and where

| term | where | plain meaning |
| --- | --- | --- |
| counter | the investigation, the lead of the first live figure (key `counterExplorerLead`) | a register whose D is worked out from its own Q as the next number up, so it goes up by one at each edge where EN is 1 |

Before that point (keys `question`, `motivation`, `prediction`, `p1Question`, `p1Explain`,
`p2Question`, `p2Explain`, and every option label) do not write "counter" in any form. The verb
"count" and the noun "count" (the number it has reached) are fine everywhere.

This lesson must not use: state, state machine, state diagram, next-state, register transfer,
one-hot, synchronous, encoding. Say "the number in the register", "the next number up".

## The story of this lesson

The office will send the manager a message when something is wrong (a later lesson builds that).
If the message fails, the office must wait a while before sending it again. How long is a while?
CLK rises at a steady rate, so a number of edges is a length of time. A circuit that counts edges
measures the wait. Its output TICK says when the count is about to start again.

## The circuit (library circuit counter-4)

- Inputs EN, RST, CLK. Outputs Q (a 4-bit word) and TICK.
- A 4-bit register (the registers lesson's register, with RST) holds Q. Its D comes from a block
  drawn as "add one" (instance name add): its inputs are Q and EN; its outputs are NEXT (4 bits)
  and COUT.
- Inside "add one": four half adders in a chain, ha0 to ha3. ha0 adds bit 0 of Q and EN. Each
  later half adder adds its bit of Q and the CARRY of the one before. The four SUMs make NEXT.
  The last CARRY is COUT. So NEXT is Q plus EN: Q plus 1 when EN is 1, Q itself when EN is 0.
- TICK is COUT: 1 while Q is `1111` and EN is 1, so the next edge will give `0000`.
- At an edge where RST is 1, Q becomes `0000`.

## The figures and what they show (all checked)

- Scene under the question (`count-scene`): a switch "Count" on EN, a button on RST, a clock on
  CLK, into a box marked ?, out to a 4-bit display and a lamp on TICK.
- Prediction 1 (`predict-wrap`, counter-4): RST 1 for one edge with EN 1, then RST 0, then 16
  edges with EN 1. Watch Q. Answer: `0000`. Options: `0000`; `1111` (it stops at the largest
  number); `XXXX`. After `1111` the next number up is `10000`, five bits; the register keeps four,
  so it takes `0000`. The carry out of bit 3 has nowhere to go: Module 3 called that overflow.
  TICK was 1 during the 16th edge's run-up, while Q was `1111`.
- Prediction 2 (`predict-pause`, counter-4): RST 1 for one edge, then two edges with EN 1, then
  EN 0, then three more edges. Watch Q. Answer: `0010`. Options `0010`, `0101`, `0000`. With EN
  0, NEXT is Q, so each edge keeps the count.
- Investigation explorer (`counter-explorer`, counter-4, Clocked): at the start Q is `XXXX`.
  Press RST to 1, press "Clock CLK": Q is `0000`. Press RST to 0 and EN to 1; each press of
  "Clock CLK" adds one. The "add one" block opens to show the half adders.
- Fault figure (`counter-faults`, counter-4, Clocked), with these checks: "reset" (RST 1, EN 1),
  "edge 1" to "edge 5" (RST 0, EN 1), "edge with EN 0". The healthy counter gives `0000`,
  `0001`, `0010`, `0011`, `0100`, `0101`, `0101`. The faults:
  - "carry into bit 2 cut" (the wire C2 from ha1's CARRY to ha2 fixed at 0): the count goes
    `0000`, `0001`, `0010`, `0011`, then back to `0000`, `0001`, and stays `0001` at the edge
    with EN 0. 3 of 7 checks fail: "edge 4", "edge 5", "edge with EN 0". Bit 2 never sees a carry,
    so it never changes; the count runs `0000` to `0011` and starts again.
  - "EN fixed at 1": only "edge with EN 0" fails: it gives `0110` instead of `0101`. 1 of 7.
  - "bit 0's XOR made an OR" (inside ha0): bit 0 becomes 1 at the first edge and stays 1, so the
    count goes `0001`, `0011`, `0101`, `0111`, `1001`: up by two. 5 of 7 fail: "edge 2" to "edge
    5" and "edge with EN 0".
- Fault figure's second figure (`predict-no-reset`, a prediction, counter-4): EN 1, RST 0 from
  the start, three edges, no reset. Watch Q. Answer `XXXX`. Options `0011`, `0000`, `XXXX`.
  Adding 1 to an unknown number gives an unknown number: each half adder's SUM is X when Q's bit
  is X.
- Explanation explorer (`add-one`, the "add one" block opened, Stepped): Q is set to `0111`
  and EN is 0, so NEXT is `0111`. Press EN to 1: NEXT changes bit by bit as the carry passes
  along the chain. The status line says "Settled in 5 steps." Moving the "Step" slider shows
  NEXT at each step: `0111`, `0111`, `0110`, `0100`, `0000`, `1000`. So NEXT passes through
  `0110`, `0100` and `0000` before it settles at `1000`. The register never takes those: it
  takes D only at an edge, and in the clocked model the circuit settles before every edge. With
  Q `1111` and EN 1, NEXT is `0000` and COUT is 1.
- Generalisation explorer (`count-to-five`, Clocked): the counter with Module 3's comparator,
  which compares Q with the fixed word `0101` (LAST). Its EQ output is TICK, and TICK ORed with
  RST drives the register's RST. Starting at `0000` after a reset, each edge with EN 1 gives
  `0001`, `0010`, `0011`, `0100`, `0101`; while Q is `0101`, TICK is 1; the next edge gives
  `0000`. TICK is 1 once every 6 edges. Any wait can be counted this way, by changing LAST.

## The challenges

- `count-two` (draw): inputs EN, RST, CLK; outputs Q1 and Q0. Parts offered: "D flip-flop with
  reset" blocks (inputs D, CLK, RST; at an edge where RST is 1, Q becomes 0) and half adder
  blocks. At an edge where RST is 1, both bits become 0. Otherwise at each edge where EN is 1
  the two bits count up by one (`00`, `01`, `10`, `11`, then `00`); where EN is 0 they keep their
  value. 9 tests. One test changes EN while CLK is 1. The reference: half adder 0 adds Q0 and
  EN; its SUM goes to Q0's flip-flop's D; half adder 1 adds Q1 and half adder 0's CARRY; its
  SUM goes to Q1's flip-flop's D; RST and CLK go to both flip-flops.
- `count-tick` (draw): inputs EN, RST, CLK; outputs Q3, Q2, Q1, Q0 and TICK. Same parts. Four
  bits counting from `0000` to `1111` and back to `0000`, EN and RST as before, and TICK is 1
  while the count is `1111` and EN is 1. 21 tests: a reset, 15 edges up to `1111` (TICK 1 after
  the 15th), EN falling while the clock is high (TICK goes to 0, the count stays), an edge with
  EN 0 (the count stays `1111`), EN rising while CLK is 1 (TICK goes to 1), and the 16th edge to
  `0000`. The reference is four half adders in a chain and four flip-flops; TICK is the last
  half adder's CARRY.

## Model versus hardware (facts)

- In the clocked model the circuit settles before every edge. In hardware the clock must be
  slow enough for the carry to pass along the whole chain, through every half adder, before the
  next edge: that is the setup time of Module 4 again, for the slowest path. A longer chain
  needs a slower clock or a faster way to work out the carries.
- The model's half adders all take the same one step each; real gates differ.
