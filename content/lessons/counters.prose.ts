// Copyright © 2026 Christopher Snow

// The words of the lesson on counters.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-5-state-machines.md; the briefs and the drafts as returned are beside it) and
// placed here key by key. Edit a fact here only after checking it against counters.facts.test.ts.

export const PROSE = {
  addOneAfter:
    "The register never takes `0110`, `0100` or `0000`. It takes D only at an edge. The adder settles between edges. Every flip-flop gets CLK itself, so all four bits change at the one edge, after the carries have settled. With Q `1111` and EN 1, NEXT is `0000` and COUT is 1. That is TICK.",
  addOneLead:
    "The figure shows the add one block alone, in the stepped model. Q is set to `0111` and EN to 0, so NEXT is `0111`. Press EN to 1. The carry takes 5 steps to pass along the chain and settle.\n\nMove the Step slider back to step 0 and forward one step at a time. Each step, the carry reaches one more half adder. NEXT passes through `0110`, `0100` and `0000` before it settles at `1000`. Press bits of Q to try other numbers, such as `1111`.",
  buildCountTickLead:
    "The shop's wait needs a 4-bit counter with TICK. Draw it from the same parts as the construction.",
  buildCountTwoLead:
    "The parts are buttons above the drawing; press one port and then another to wire them.",
  c1Hints: [
    "Each flip-flop's D input must be the next number's bit: the flip-flop's own bit plus any carry into it. A half adder gives both the SUM and CARRY you need.",
    "If EN goes to both half adders, both bits change and the count jumps. Only bit 0 adds EN. Bit 1 adds bit 0's carry instead.",
    "Try one bit alone: put Q0 on half adder A and EN on its B. The SUM equals Q0 XOR EN, so at an edge where EN is 1, Q0 flips; where EN is 0, it stays.",
    "Half adder 1 adds Q1 and half adder 0's CARRY. Its SUM goes to Q1's flip-flop's D.",
    "Place two \"D flip-flop with reset\" blocks and two half adders. The first half adder adds Q0 and EN; its SUM goes to Q0's flip-flop D. The second half adder adds Q1 and the first's CARRY; its SUM goes to Q1's flip-flop D. Wire CLK and RST to both flip-flops.",
  ],
  c1Task:
    "Draw a circuit with inputs EN, RST and CLK and outputs Q1 and Q0.\n\nAt a rising edge where RST is 1, Q1 and Q0 both become 0.\n\nAt each rising edge where EN is 1, the two bits count up by one: `00`, `01`, `10`, `11`, then back to `00`.\n\nAt a rising edge where EN is 0, they keep their current values.\n\nThe tests set EN, RST and CLK step by step and check Q1 and Q0 as they go. They include a step where EN changes while CLK is 1.",
  c2Hints: [
    "Extend the 2-bit counter: each bit needs its own flip-flop and half adder, and each half adder after the first adds the CARRY of the one before.",
    "TICK is not another flip-flop. It is a wire from somewhere in your circuit. Unlike a flip-flop, a wire changes right away when something changes, not only at an edge.",
    "In the 2-bit counter, half adder 1's CARRY is Q1 AND Q0 AND EN: it is 1 only while the count is `11` and EN is 1.",
    "The last half adder's CARRY, from the half adder whose A is Q3, is 1 only while Q3, Q2, Q1, Q0 and EN are all 1. Wire it to TICK.",
    "Four D flip-flop with reset blocks and four half adders. Half adder 0 adds Q0 and EN; each next one adds its bit of Q and the CARRY before it; each SUM drives its bit's flip-flop's D. CLK and RST go to every flip-flop. The last CARRY drives TICK.",
  ],
  c2Task:
    "Draw a circuit with inputs EN, RST and CLK and outputs Q3, Q2, Q1, Q0 and TICK. At an edge where RST is 1, every bit becomes 0. Otherwise at an edge where EN is 1, the four bits count up by one, from `0000` to `1111` and then back to `0000`; where EN is 0, it keeps its value. TICK is 1 while the count is `1111` and EN is 1, and 0 otherwise. TICK changes as soon as EN or the count changes, not only at an edge. The tests count all the way up and include tests where EN changes while CLK is 1.",
  construction:
    'Build a 2-bit counter from "D flip-flop with reset" blocks and half adders. A "D flip-flop with reset" has an RST pin. At an edge where RST is 1, its Q becomes 0. The registers lesson built that reset from gates; this part has it inside. Each bit of the counter uses one flip-flop and one half adder. Bit 0\'s carry goes into bit 1\'s half adder.',
  countToFiveAfter:
    "Q goes `0000`, `0001`, `0010`, `0011`, `0100`, `0101`, then `0000`. TICK is 1 while Q is `0101`: once every 6 edges. Changing the fixed word changes the wait. The gates in front of D decide the next number. Here they choose between the next number up and `0000`.",
  countToFiveLead:
    "A wait of 16 edges is only one wait. To count 6 edges, the counter must go from `0101` back to `0000`. The figure adds Module 3's comparator. It compares Q with the fixed word `0101`. Its output, EQ, is 1 while Q is `0101`. EQ is the TICK here. EQ, ORed with RST, drives the register's RST. So when Q is `0101`, the register's RST is 1, and at the next edge Q becomes `0000`.\n\nThe figure starts at `0000` after a reset, with EN at 1. Press \"Clock CLK\" and watch Q and TICK.",
  counterExplorerAfter:
    "TICK is the last half adder's carry. It is 1 while Q is `1111` and EN is 1, so the next edge gives `0000`. To measure a wait of 16 edges, start the counter at `0000` and watch for TICK.",
  counterExplorerLead:
    'This circuit runs the register\'s output Q back to the register\'s input through an "add one" block. At each rising edge, the register takes Q plus one.\n\nAt the start Q is `XXXX`: no edge has set it. Press RST to 1, then "Clock CLK": Q becomes `0000`. Press RST back to 0 and EN to 1. Each "Clock CLK" adds one to Q. Press EN to 0 and the count stays.\n\nOpen the "add one" block. Inside are four half adders in a chain. The first adds bit 0 of Q and EN. Each later half adder adds its bit and the carry from the one before. A register whose D is its own Q plus one is a **counter**. It goes up by one at each rising edge where EN is 1.',
  counterFaultsLead:
    'This is the 4-bit counter with three faults to choose from. The first fault is C2 forced to 0: C2 is the wire carrying ha1\'s CARRY into ha2. The second fault is EN fixed at 1. The third fault is ha0\'s XOR gate made an OR gate. Press "Run checks" to run seven checks: a reset, then five rising edges with EN 1, then one edge with EN 0.\n\nA healthy counter gives `0000` after reset, then `0001`, `0010`, `0011`, `0100`, `0101` from the five edges, and stays `0101` with EN 0.\n\nBefore running the checks, predict which will fail and what the faulty counter will do. Open the "add one" block to see where each fault acts. Then press "Run checks" and compare.',
  counterFaultsOutcomes:
    '**First fault:** bit 2 never gets the carry, so it never changes. The count goes `0000`, `0001`, `0010`, `0011`, then back to `0000`, `0001`, and stays at `0001`. Fails: "edge 4", "edge 5", "edge with EN 0". Total: 3 of 7.\n\n**Second fault:** EN is always 1, so every edge counts up. The edge with EN 0 should keep `0101` but gives `0110` instead. Fails: "edge with EN 0". Total: 1 of 7.\n\n**Third fault:** bit 0 becomes 1 at the first edge and never returns to 0. The count goes up by two each time: `0001`, `0011`, `0101`, `0111`, `1001`. Fails: "edge 2" to "edge 5" and "edge with EN 0". Total: 5 of 7.',
  explanation:
    "At every edge, all four flip-flops take their D at once. D is NEXT, worked out by the half adders from Q as it was before the edge. Q changes. The half adders work out a new NEXT. Nothing more happens until the next edge.\n\nThe carry passes along the chain, one half adder at a time. So NEXT does not change all at once.",
  modelVsReality:
    "In the clocked model the circuit settles before every edge. In hardware the clock must be slow enough for the carry to pass along the whole chain of half adders before the next edge: the setup time of Module 4, for the slowest path. A longer counter needs a slower clock or a faster way to work out the carries. The model's gates each take one step; real gates take different times.",
  motivation:
    "A register keeps a word and takes D at each edge. Module 3's adders add words. Feed the register's own Q into an adder that adds 1: its output goes into the register's D. At each edge, the register takes Q plus 1: the next number up.\n\nTo add 1, each bit needs a half adder: a half adder adds a bit of Q and a carry. Bit 0's half adder adds EN instead, so when EN is 0 nothing is added and the register keeps its number. The adder's output feeds back, but the loop does not run wild, because the register changes only at an edge.",
  p1Explain:
    "Q is `0000`. After 15 edges, Q was `1111`, the largest 4-bit number. The next number up, `10000`, has five bits, so the register keeps four and takes `0000`. The carry out of bit 3 has nowhere to go: Module 3 called this overflow, and counting wraps from `1111` to `0000`. While Q was `1111`, TICK was 1, as the timing diagram shows.",
  p1Question:
    "The figure resets the circuit, so Q is `0000`. EN stays 1. Then CLK rises 16 times. What is Q after the 16th edge?",
  p2Explain:
    "Q is `0010`. The two edges with EN 1 counted to `0010`. With EN at 0, the adder adds nothing, so D is Q and every edge keeps the number. EN is the load enable from the registers lesson, again in a new place, deciding whether an edge adds one.",
  p2Question:
    "The figure resets the circuit, then gives two edges with EN 1. Then EN goes to 0 and three more edges run. What is Q at the end?",
  p3Explain:
    "Q is `XXXX` because no edge has set it yet. One plus an unknown is unknown: each half adder's SUM is X when its bit of Q is X. A counter needs a reset before it can count.",
  p3Question:
    "EN is 1 from the start, and RST stays 0. The counter runs for three edges. What is Q after the third edge?",
  predictNoResetLead:
    "What happens if the counter never gets reset? The circuit is drawn above the question.",
  prediction:
    'Two figures run the circuit the question asks for. Each draws it above its question. Choose an option, then press "Check my prediction".',
  question:
    "The registers lesson asked: what if the gates before D worked out the next number up from Q? The shop needs this. The office must send the manager a message when something is wrong. If the message fails, the office must wait a while before trying again. CLK rises at a steady rate, so counting rising edges measures the wait.\n\nThe circuit has an input EN: it counts at an edge only while EN is 1. A reset, RST, starts it at `0000`. A 4-bit display shows the count. A lamp, TICK, lights while the count is `1111` and EN is 1, so the next edge gives `0000`.\n\nHow can a circuit add one to its own number at every edge?",
  reflection:
    "A counter is a register whose D is its own Q plus one, from a chain of half adders. EN decides whether an edge counts. RST starts it at `0000`. TICK, the last carry, says the count is about to wrap round.\n\nThe gates in front of D decide the next number. In the counter they always choose the next number up, or `0000`. The office's message needs a circuit that does one of several jobs: sending, waiting, giving up. It chooses its next job from what happened. What would the gates in front of D need then?",
} as const;
