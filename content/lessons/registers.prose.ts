// Copyright © 2026 Christopher Snow

// The words of the lesson on registers.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-5-registers.md) and checked against the simulator, then placed here by the
// lesson's structure in registers.ts. The strings the first fix pass changed came from its briefs
// B1 to B4 and BL (docs/notes/fix-pass-1.md). Edit a fact here only after checking it; the lesson's
// facts test (registers.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    'One flip-flop stores one bit. The previous lesson\'s question asked: "What would it take to store eight bits instead of one?" This lesson stores four.\n\nFour switches set a number, one bit per switch. A display shows a number. There is a Save button. The display must show what the switches were set to when Save was last pressed. It must keep showing that number while the switches move. When the power comes on, the display must show `0000`, not whatever the circuit happens to start with. The whole circuit runs from one clock, CLK, that rises at a steady rate and never stops.\n\nHow can a circuit store four bits together, change them only when told to, and start from a known value?',
  motivation:
    "The flip-flop takes D at every rising edge of CLK. With a never-stopping clock, that means a new value at every edge. The display must change only when Save is pressed, keeping its number at every other edge.\n\nFour flip-flops store four bits: one number. All four must change at the same moment, or the number passes through values nobody set.\n\nA flip-flop that no edge has set yet shows X. A display starting at X shows nothing anyone chose. So the circuit needs a way to start from a known value.\n\nThe previous lesson named three things a computer stores. Each is a number of several bits that must stay the same most of the time.",
  prediction:
    'Two figures below each pose a question about four flip-flops sharing one clock. Each figure draws its circuit above its question. Choose one of three answers, then press "Check my prediction". The timing diagram that appears shows what the simulator did.\n\nA timing diagram draws each signal as a line against time: high for 1, low for 0, a hatched band for X. The previous lesson showed several without naming them.',
  p1Question:
    "Four flip-flops share one clock. Their D inputs together are written D. Their outputs are Q, as four bits with bit 3 on the left and bit 0 on the right. In `1000`, bit 3 is 1 and bit 0 is 0.\n\nThe figure sets D to `0110` while CLK is low, then gives one rising edge of CLK. Then it sets D to `1111`, and CLK does not rise again.\n\nWhat is Q at the end?",
  p1Explain:
    "At the rising edge, all four flip-flops took their D at once. Q became `0110`. CLK did not rise again, so the later change of D to `1111` reached no flip-flop. Q changes only at a rising edge.",
  p2Question:
    "The four flip-flops now have one more input, EN. EN is different from the D latch's EN: this EN acts only at a rising edge, deciding whether Q takes D. At a rising edge where EN is 1, Q takes D. At a rising edge where EN is 0, Q keeps the value it had.\n\nThe figure starts the circuit fresh, with nothing set yet. It sets D to `0110` and EN to 0. EN stays at 0. CLK rises three times.\n\nWhat is Q after the third edge?",
  p2Explain:
    "Q is `XXXX`: unknown. No edge ever had EN at 1, so no flip-flop ever took D. Each edge kept the value each flip-flop already had. That value was never known.\n\nKeeping a value only helps once there is a known value to keep. The lesson adds a reset, RST, later. Unlike the latch's R in the previous lesson, which acted the moment it was 1, RST acts only at a rising edge, as EN does.",
  fourFlipFlopsLead:
    'Here are four flip-flops from the previous lesson: ff3 at the top down to ff0. In a word, bit 3 sits on the left. Here, ff3 sits at the top. Each has its own D pin (D3 to D0) and Q pin (Q3 to Q0). One clock wire, CLK, reaches all four.\n\nAt the start every Q is X, because no edge has set them yet. Press some D pins to set a number. Press "Clock CLK": all four Q change at the same edge, each to its own D. Press D pins without "Clock CLK": no Q changes.\n\nPress a flip-flop block to open it and see the two latches from the previous lesson.\n\nA word, as in Module 1, is several bits treated as one number. Flip-flops that share one clock and store a word are a **register**. This is a four-bit register.',
  fourFlipFlopsAfter:
    "Sharing one clock makes the four bits one word: all four take their D at the same edge, so the word changes at once. This register still takes D at every edge. So, wired to the switches, the display would follow them one edge late and Save would do nothing. You need a way to tell each edge whether the register takes D or keeps the value it has.",
  construction:
    "At each edge, the register either takes D (EN is 1) or keeps its value (EN is 0). An input that makes this decision is a **load enable**. Here it is EN, and EN is 1 while Save is pressed. You build it for one bit. A four-bit register is four of these bits sharing EN and CLK.\n\nPress the part buttons above the drawing to add parts. Press one port, then another, to wire them. A failed test names the test and the part that drives the wrong output.",
  buildKeepBitLead:
    "Draw one bit of the register with its load enable. You have a D flip-flop block and AND, OR and NOT gates.",
  c1Task:
    "Draw a circuit with inputs D, EN and CLK and output Q.\n\nAt a rising edge of CLK where EN is 1, Q takes D. At a rising edge where EN is 0, Q keeps its value. Between edges, Q does not change, whatever D and EN do.\n\nThe tests set D, EN and CLK step by step and check Q as they go. They include a step where EN changes while CLK is 1.",
  keepFaultsLead:
    'The figure shows these parts:\n\n- notEn (NOT of EN)\n- andLoad (D AND EN, output LOAD)\n- andKeep (Q AND NOT EN, output KEEP)\n- orChoice (LOAD OR KEEP, output CHOICE)\n- flip-flop ff\n\nCHOICE drives the flip-flop\'s D pin. The path from the flip-flop\'s Q through andKeep and orChoice back to its D pin is the **keep path**. Without it, the bit cannot keep a value.\n\n"Run checks" makes four checks. Each ends at a rising edge the figure makes itself, with no "Clock CLK" button. Each compares the faulty bit\'s Q with a healthy bit\'s:\n\n- "load 1" (D 1, EN 1)\n- "edge with EN 0" (D 0, EN 0)\n- "another edge with EN 0"\n- "load 0" (EN 1, D still 0)\n\nThe wires are not labelled in the drawing. Press a wire to see its name and value underneath.\n\nChoose each fault in turn and run the checks. Before you run them, say which checks you expect to fail.',
  gatedClockLead:
    'In the clocked model, one press of "Clock CLK" raises CLK and lowers it again. Other inputs change only while CLK is 0. This experiment needs EN to change while CLK is 1, so this figure runs the stepped model. The badge says "Stepped". You press CLK\'s pin yourself, up then down.\n\nA tempting shortcut: stop the clock reaching the flip-flop when EN is 0. An AND gate, andClk, takes CLK and EN. Its output wire, GCLK, drives the flip-flop\'s clock pin. With EN at 0, no edge gets through, so Q keeps its value.\n\nTry it: press D to 1. Press CLK to 1 while EN is 0. Then, with CLK still at 1, press EN to 1. Watch Q. Press the GCLK wire to see its value under the drawing.',
  gatedClockAfter:
    "With CLK at 1 and EN at 0, Q stayed X because no edge reached the flip-flop. When EN rose, Q became 1. CLK did not rise then, yet GCLK did: the flip-flop saw a rising edge.\n\nWith EN in the clock's path, EN rising while CLK is 1 makes a rising edge on GCLK. The flip-flop takes D when the clock did not choose. EN falling makes a falling edge, which the flip-flop ignores.\n\nIn the load-enable bit, CLK reaches the flip-flop directly, and EN only changes what reaches its D pin. A change of EN between edges changes nothing until the next rising edge of CLK.\n\nFrom here the course follows one rule: every flip-flop gets CLK itself. Other signals decide only what reaches its D pin.\n\nThe construction challenge's tests include one where EN changes while CLK is 1, so a bit built with the AND-gate shortcut fails.",
  explanation:
    "At every rising edge, the flip-flop takes whatever reaches its D pin: the wire CHOICE. EN decides what CHOICE is. When EN is 1, CHOICE is the input D. When EN is 0, CHOICE is the flip-flop's own Q through the keep path, leaving it unchanged.\n\nA load enable keeps whatever value is there, even X. That is why the second prediction ended at `XXXX` and the bit needs a reset.",
  keepClearBitLead:
    'The figure is the load-enable bit with one more input, RST, and a reference table below it. An AND gate, andClear, takes CHOICE and NOT RST (from a NOT gate, notRst). While RST is 1, andClear gives 0 whatever EN and D are, so the next edge makes Q 0.\n\nTry it. Press "Start again": Q is X. Press "Clock CLK" with EN at 0: Q stays X. Press RST to 1 and press "Clock CLK": Q becomes 0. Press RST back to 0, and EN and D decide again.\n\nThe reset acts only at a rising edge, like everything else that reaches the flip-flop\'s D pin. The table marks the row the next edge will apply.\n\nFor the display: set RST to 1 for one edge when power comes on. The display then shows `0000` until the first edge with Save pressed. What sets RST to 1 when the power comes on is outside this lesson.',
  registerAsTextLead:
    "This figure draws a four-bit register with a load enable, as one block. Inputs are D, CLK and EN; output is Q. The circuit behaves as four of the load-enable bits from the construction, sharing one clock and one enable. Bit N of D connects to flip-flop N.\n\n`logic [3:0]` declares a signal four bits wide, with bits numbered 3 down to 0.\n\nAt every rising edge of CLK, the lines between `begin` and `end` run. `begin` and `end` group lines under the `always_ff` line, like brackets group terms. Here one line sits between them.\n\nThe line `if (EN) Q <= D;`: if EN is 1, Q takes D.",
  registerAsTextAfter:
    "When EN is 0, no line gives Q a value, so Q keeps its value. The keep path you built from gates is written by leaving out a line for that case.\n\nFor eight bits, D and Q are declared `logic [7:0]`: bits 7 down to 0. A value written with its width, such as `8'b00000000`, must be eight bits wide. The text box refuses `4'b0000` for an eight-bit Q. A plain `0` takes Q's width.\n\nThe text does not place flip-flops. The course turns each bit of Q into a flip-flop when it builds the circuit from the text.",
  predictChainLead:
    "The previous lesson asked: what happens if the thing that changes D is itself a flip-flop clocked by the same edge? This section answers it, with a circuit the display does not need.\n\nThis figure draws four flip-flops on one clock. IN feeds the first flip-flop's D. Each other flip-flop's D comes from the flip-flop before it. The outputs are Q0 (the first) to Q3 (the last).\n\nWhat does this circuit do?",
  p3Question:
    "All four flip-flops start unknown. IN is set to 1 for one rising edge, then to 0 for two more rising edges.\n\nWhat is Q2 after the third edge?",
  p3Explain:
    "Q2 is 1.\n\nAt each edge, every flip-flop takes the value the one before it held just before the edge. The 1 entered Q0 at the first edge, moved to Q1 at the second and to Q2 at the third.\n\nThe bit does not move all the way along at once. Inside each flip-flop, the first latch closes at the edge before any Q changes. So each flip-flop takes the old value of the one before it.\n\nQ3 is still X: no known value has reached it yet.",
  buildShiftLead:
    "Flip-flops in a chain on one clock each take, at every edge, the value the one before it held just before the edge. So bits move one place along with each edge. This is a **shift register**.\n\nA bit does not move all the way along in one edge. Each flip-flop's master latch closes at the edge before any Q changes. So each flip-flop takes the old value of the one before it.\n\nIt takes a number one bit at a time on one wire. After four edges it stores the last four bits side by side: the newest in Q0, the oldest in Q3.\n\nBuild one from four D flip-flop blocks.",
  c2Task:
    "Draw a circuit with inputs IN and CLK, and outputs Q0, Q1, Q2 and Q3.\n\nAt each rising edge of CLK, Q0 takes IN. Q1 takes what Q0 held. Q2 takes what Q1 held. Q3 takes what Q2 held.\n\nBetween clock edges, nothing changes.\n\nThe tests send the bits 1, 0, 1, 1, 0 through, one per edge. After each edge, they check the outputs that store a known bit by then: early edges check only the first outputs. One test changes IN while CLK is 1.",
  writeRegisterLead:
    "Write the four-bit register with a reset as well as the load enable. The circuit your text makes is drawn under it as you type.",
  c3Task:
    "The module and ports are provided in the same order as the figure's text, with one more input RST. D and Q are four bits wide (`logic [3:0]`), and EN, RST and CLK are each one bit.\n\nAt a rising edge of CLK: if RST is 1, Q becomes `0000`. Otherwise if EN is 1, Q takes D. Otherwise Q keeps its value.\n\nThe notation `4'b0000` is a value four bits wide (the 4), written in binary (the `'b`), and `else if` tests its condition only when the `if` before it was false.\n\nWrite one `always_ff`; you may use `if`, `else`, `begin` and `end`. The tests include an edge where RST and EN are both 1, and a test where EN changes while CLK is 1.",
  reflection:
    "A register stores a word in flip-flops that share one clock. A load enable changes what reaches each flip-flop's D pin, never when the clock reaches it. At a rising edge, a reset brings every bit to a known value. A shift register is the same flip-flops wired in a chain, so bits move one place per edge.\n\nWhat if the gates before D worked out a new value from Q, such as the next number up? What would a circuit need to work through a fixed list of jobs, one per edge?",
  modelVsReality:
    "The clocked model gives every flip-flop its edge at the same moment. In hardware, the clock reaches different flip-flops at slightly different times.\n\nA shift register works because each flip-flop's output changes a little after the edge. This is later than the next flip-flop needs its D to be stable (its hold time). If the clock reached a later flip-flop late enough, a bit could pass through two flip-flops at one edge.\n\nA real flip-flop at power-on is not X. It settles to 0 or 1, but nothing says which. The simulator writes X because it cannot know.\n\nThis course's reset acts at a clock edge. Many real circuits use a reset that acts the moment RST rises, without waiting for an edge. The previous lesson's latch R acted that way; no register in this course does. Real chips also switch the clock off to save power, using a purpose-built part designed so an enable change cannot cause an edge. A plain AND gate, like the one in the failure experiment, fails to do this.",
  c1Hints: [
    "A flip-flop takes whatever reaches its D pin at each rising edge. To keep a value, make the D pin see the flip-flop's own Q at the edges where EN is 0. That is feedback, as in the previous lesson.",
    "Two ways fail: wiring D straight to the flip-flop, so every edge takes D; and putting EN in the clock's path with an AND gate. The second passes the first few tests, then fails when EN rises while CLK is 1: the AND gate's output rises then, and the flip-flop sees a rising edge that CLK never made.",
    "An AND gate with EN as one input passes its other input while EN is 1 and gives 0 while EN is 0.",
    "The D pin needs D when EN is 1 and Q when EN is 0. An AND gate with NOT EN as one input passes Q only while EN is 0.",
    "Place a NOT gate on EN. One AND gate takes D and EN. A second AND gate takes the flip-flop's Q and the NOT gate's output. An OR gate takes both AND outputs and drives the flip-flop's D. CLK goes straight to the flip-flop's CLK. Q is the flip-flop's Q.",
  ],
  c2Hints: [
    "At each rising edge, every bit moves one place along the chain, from IN towards Q3.",
    "Two common mistakes: wiring IN to every flip-flop's D makes all four take the same bit at every edge. Chaining them in the wrong order makes the new bit appear at Q3 instead of Q0.",
    "With two flip-flops, the first takes IN and the second takes the first one's Q. After two edges, the second shows what IN was at the first edge.",
    "The first flip-flop's D is IN, and its Q drives Q0. The second flip-flop's D is that Q0.",
    "Place four D flip-flop blocks. Connect CLK to all four, IN to the first block's D, and each block's Q to the next block's D. Wire the four blocks' Q outputs in order to Q0, Q1, Q2 and Q3.",
  ],
  c3Hints: [
    "The lines in an `always_ff` block decide what Q takes at each rising edge. Where no line gives Q a value, Q keeps the one it has.",
    "If you test EN before RST, an edge where both are 1 loads D instead of `0000`, and the reset fails. RST must be tested first.",
    "With one-bit names, `if (A) Y <= 1'b1; else if (B) Y <= 1'b0;` tests A first. B counts only when A is 0. When both are 0, no line runs and Y keeps its value.",
    "Start with `always_ff @(posedge CLK) begin`. Make the first line inside `if (RST) Q <= 4'b0000;`.",
    "The complete block is:\n\n```\nalways_ff @(posedge CLK) begin\n  if (RST) Q <= 4'b0000;\n  else if (EN) Q <= D;\nend\n```",
  ],
  keepFaultsAfter:
    '- KEEP wire forced to 0: a box CONST with value 0 now drives KEEP, and andKeep\'s output goes nowhere. Two checks fail, at "edge with EN 0" and "another edge with EN 0". With EN at 0, CHOICE is 0, so Q takes 0 instead of keeping the 1.\n\n- EN forced to 1: Two checks fail at the same points. Every edge takes D, and D is 0 there. Two different faults fail the same checks, so the checks alone do not say which fault it is.\n\n- OR gate changed to AND: Three checks fail, at "load 1" and both edges with EN 0. LOAD needs EN 1, KEEP needs EN 0: they never both become 1. CHOICE is always 0, so every edge makes Q 0. "load 0" passes because 0 is expected.',
} as const;
