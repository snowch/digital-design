// The words of the lesson on adders.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-3-combinational.md) and checked against the simulator, then placed here by the
// lesson's structure in adders.ts. Edit a fact here only after checking it; the lesson's facts
// test (adders.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The last lesson ended with this: room B's sensor reads 0.6 degrees too warm. The display has shown room B at -25.0 degrees, from the word -250. The sensor counts in tenths of a degree, so every word it sends is 6 too high. The display must add -6 to every word from room B: -250 plus -6 is -256 tenths, which is -25.6 degrees.\n\nModule 1 ended with a question that goes further: signed and unsigned readings use the same 65536 patterns. Could one way of adding two words serve both readings? How does a circuit add two words?",
  motivation:
    "When you add on paper, you go one column at a time from the right. In decimal, 7 + 5 in one column gives 12: you write 2 and pass 1 to the next column on the left. Binary works the same way, just with two digits instead of ten. 1 + 1 in binary is 2, written `10`: you write 0 and pass 1 to the next column on the left. The bit a column passes to the next column on its left is the **carry**. So a column of an addition needs two outputs: the sum bit for that column, and the carry to the next. Start with the rightmost column, which has no carry coming into it.",
  prediction:
    'The figure draws a circuit for one column with no carry coming in. It has two inputs, A and B, and two outputs, SUM and CARRY. Choose an answer, then press "Check my prediction". The page will show what the simulator gave, with a timing diagram.',
  p1Question:
    "The circuit uses an XOR gate, xorSum, that takes A and B and drives SUM. An AND gate, andCarry, takes A and B and drives CARRY. Now A is 1 and B is 1. What is SUM?",
  p1Explain:
    "SUM is 0, and CARRY is 1. An XOR gate gives 1 only when its inputs differ, but these inputs are the same. An AND gate gives 1 when both are 1. CARRY and SUM together are `10` in binary, which is 2: the sum of 1 + 1.",
  halfAdderLead:
    "The figure shows the circuit running. Press A and B through all four patterns: `00`, `01`, `10` and `11`. For each pattern, read the CARRY bit and the SUM bit together as a 2-bit number. Put CARRY on the left and SUM on the right. Compare the result with A + B.",
  halfAdderAfter:
    'CARRY and SUM together always equal A + B. This is true for all four input patterns: 0 + 0 = `00`, 0 + 1 = `01`, 1 + 0 = `01`, and 1 + 1 = `10`. A circuit that adds two bits and gives a sum bit and a carry bit is a **half adder**. The next drawings show these two gates as one block labelled "half adder", with outputs SUM and CARRY.',
  columnsAloneLead:
    "The figure adds two 2-bit words, A1 A0 and B1 B0, one column at a time. Half adder ha0 adds column 0 (A0 and B0). Half adder ha1 adds column 1 (A1 and B1). Column 1 is drawn on top. Column 0's SUM goes to output SUM0, its CARRY to output CARRY0. Column 1's SUM goes to output SUM1, its CARRY to output CARRY1. No wire connects the two columns; each works alone. Press A0 and B0 to 1, with A1 and B1 at 0. You add `01` and `01`. One plus one is 2, which is `10` in binary. Read SUM1 and SUM0 together.",
  columnsAloneAfter:
    "SUM1 and SUM0 together show `00`, not `10`. Column 0 made a carry: CARRY0 is 1. But nothing sends the carry to column 1. Column 1 only adds A1 and B1, not the carry from column 0. To get the right answer, column 1 must add three bits: A1, B1, and the carry from column 0. A half adder adds only two bits.",
  construction:
    "A circuit that adds three bits (A, B, and a carry in, CIN) is a **full adder**. It gives a sum bit, SUM, and a carry out, COUT. Three bits can total at most 3, which is `11` in binary, so two output bits are enough. You build a full adder from two half adder blocks and one OR gate. A half adder has inputs A and B and outputs SUM and CARRY.",
  buildFullAdderLead: "Draw a full adder circuit using two half adder blocks and one OR gate.",
  c1Task:
    "Draw a circuit with inputs A, B and CIN, and outputs SUM and COUT. Read COUT and SUM together as a 2-bit number. It must equal A + B + CIN for all input patterns. SUM is 1 when an odd number of the three inputs are 1. COUT is 1 when two or more of the three inputs are 1. The circuit must pass 8 tests, one for each input pattern.",
  fullAdderFaultsLead:
    'The figure shows a full adder with this structure: ha1 adds A and B, with outputs on wires S1 and C1. The half adder ha2 adds S1 and CIN, with its SUM driving the full adder\'s SUM output and its CARRY on wire C2. The OR gate, orCarry, takes C1 and C2 and drives COUT. Press a half adder to open it and see its two gates inside. Press a wire to see its name and value. "Run checks" runs 5 checks. Each is named after the sum it tests, written as A + B + CIN:\n\n- "0 + 0 + 0"\n- "1 + 1 + 0"\n- "1 + 0 + 1"\n- "0 + 1 + 1"\n- "1 + 1 + 1"\n\nEach check compares the circuit\'s SUM and COUT with a healthy full adder\'s. Choose each fault in turn. Before you run the checks, say which you expect to fail.',
  fullAdderFaultsAfter:
    '- "OR to XOR on carry": No check fails. C1 and C2 are never both 1 at the same time. When A and B are both 1, ha1\'s sum, S1, is 0, so ha2 cannot make a carry. OR and XOR differ only when both their inputs are 1, so here they always agree.\n\n- "Carry in stuck at 0": 3 of 5 checks fail: "1 + 0 + 1", "0 + 1 + 1", and "1 + 1 + 1". These are the three checks where CIN is 1. When CIN is stuck at 0, the full adder operates as if CIN is always 0, so it only adds A and B.\n\n- "XOR to OR in ha2\'s sum": 2 of 5 checks fail: "1 + 0 + 1" and "0 + 1 + 1". In these checks, S1 and CIN are both 1, so the sum bit should be 0, but the OR gate incorrectly gives 1 instead. In the "1 + 1 + 1" check, S1 is 0, so OR and XOR give the same result and the check succeeds.',
  explanation:
    "A 4-bit adder adds two 4-bit words with one full adder for each column. A carry made in one column must reach the next column to its left. The challenge below asks you to wire this. Bit 0's full adder has a carry in, CIN, like the others. When the adder just adds A and B, CIN is 0. The top column's carry out is the carry out of the whole sum, COUT.\n\nA carry can travel from bit 0 all the way to COUT, through each full adder in turn.",
  predictSignedLead:
    "The 4-bit adder adds `0111` and `0001` to give `1000`. Read as unsigned, that is 7 + 1 = 8. From Module 1, you know that in a signed reading, the top bit's worth is negative.",
  p2Question: "What does the 4-bit word `1000` read as signed?",
  p2Explain:
    "`1000` reads as -8 signed: bit 3 is worth -8 and no other bit is 1.\n\nRead signed, `0111` is 7 and `0001` is 1, but the sum reads -8, not 8. Signed 4-bit words run from -8 to 7, so 8 does not fit. The adder gave the right bits; read signed, they mean something else.",
  adder4Lead:
    'The figure shows a 4-bit adder block, closed, with word inputs A and B, a one-bit input CIN, and outputs SUM and COUT. It starts at `0011` + `0010`, which gives SUM `0101`. The table beneath the figure reads A, B and SUM two ways, in the columns "Unsigned" and "Signed". COUT is a single bit; the table gives it no reading. The bit boxes under the drawing show each bit\'s unsigned worth: 8, 4, 2 and 1.\n\nTry these three sums:\n\n- `1111` + `0001`\n- `1000` + `1111`\n- `0101` + `1101`\n\nFor each, read SUM unsigned and signed, and read COUT. Ask: does the true result fit in 4 bits, read unsigned? Does it fit, read signed?',
  adder4After:
    "`1111` + `0001` gives SUM `0000`, COUT 1. Unsigned, 15 + 1 is 16, which does not fit in 0 to 15. Signed, -1 + 1 is 0, which fits.\n\n`1000` + `1111` gives SUM `0111`, COUT 1. Unsigned, 8 + 15 is 23, which does not fit. Signed, -8 + -1 is -9, which does not fit in -8 to 7: SUM reads 7.\n\n`0101` + `1101` gives SUM `0010`, COUT 1. Unsigned, 5 + 13 is 18, which does not fit. Signed, 5 + -3 is 2, which fits.\n\nThe prediction's `0111` + `0001` gave SUM `1000`, COUT 0. Unsigned, 7 + 1 is 8, which fits. Signed, 7 + 1 is 8, which does not fit.\n\nWhen the true result does not fit in the word, under the reading you use, that is **overflow**. Unsigned overflow happens exactly when COUT is 1: in the first three sums. Signed overflow happens exactly when A and B have the same top bit and SUM's top bit differs from it: in `1000` + `1111` and `0111` + `0001`. When A and B have different top bits, the sum never overflows signed.\n\nThis is the answer to Module 1's question: one adder serves both readings. It gives the same bits either way; the readings differ only in when the result fits.",
  generalisation:
    "The display shows 16-bit words, so the adder for the display is 16 full adders in a row. Room B's word, -250, is `FF06` in hexadecimal. To fix the sensor's error, the display adds -6, which as a 16-bit signed word is `FFFA`.",
  correctionLead:
    "The figure shows a 16-bit adder, closed, starting at room B's word plus the correction. Input A is `FF06` and input B is `FFFA`. Words this wide are shown in hexadecimal. The bit boxes under the drawing show unsigned worths, up to 32768 for bit 15. Read signed, bit 15 is worth -32768. Read the SUM and COUT, and look at the table's two readings.",
  correctionAfter:
    "SUM is `FF00`. Read as a signed word, that is -256, which shows -25.6 degrees: the room's true temperature.\n\nCOUT is 1. Read unsigned, 65286 + 65530 is 130816, which does not fit in 0 to 65535: COUT 1 signals unsigned overflow.\n\nBut the display reads words as signed. A and B both have top bit 1, and so does SUM, so the signed sum fits and the answer is right.",
  buildRippleLead:
    "Build a 4-bit adder from four full adder blocks. A split block breaks a word into its bits, and a join block combines four bits into a word.",
  c2Task:
    "Draw a circuit with word inputs A and B (4 bits each) and CIN, and outputs SUM (a 4-bit word) and COUT.\n\nCOUT and SUM, read together as a 5-bit unsigned number, must equal A + B + CIN.\n\nYou have full adder blocks, split blocks that break a word into bits b3 to b0, and join blocks that combine bits b3 to b0 into a word.\n\nThe 10 tests are chosen so a carry must travel through one column, through several columns, and out of the top as COUT.",
  buildOverflowLead:
    "Build a lamp, V, that lights when a signed 4-bit sum overflows. You need only the top bits of A, B and the sum. The parts for this lamp include a gate you have not met: **XNOR**. An XNOR gate is an XOR gate followed by a NOT. It gives 1 when its two inputs are the same, and 0 when they differ.",
  c3Task:
    "Draw a circuit with inputs A3, B3 and S3 (the top bits of A, B and their sum) and output V.\n\nV is 1 when A3 and B3 are the same and S3 differs from them. Otherwise V is 0.\n\nThere are 8 tests, one for each possible pattern of A3, B3 and S3. Your circuit must pass every test.",
  reflection:
    "A half adder adds two bits. A full adder adds three, and full adders in a row add words, each carry passing to the next column. The same bits of the sum serve both readings. Unsigned overflow is a carry out; signed overflow is two top bits that agree and a sum whose top bit does not.\n\nThe office wants to know how much warmer room A is than room B: that is subtraction. Can the same adder subtract? Could one block do other jobs on two words?",
  modelVsReality:
    "For `FFFF` + `0001`, the carry must pass through all 16 full adders before COUT and the top bits are right. In real hardware each full adder takes a short time, so a wide adder like this is slow.\n\nReal processors use adders with extra gates that work out each column's carry from the inputs in fewer levels of gates: less depth (in Module 2's sense) but more gates.\n\nThe stepped model counts steps, not time. Every explorer figure shows the settled result.\n\nThe sensor's 0.6-degree error is invented for this lesson.",
  c1Hints: [
    "Add in two goes: first add A and B, then add CIN to the result.",
    "A common mistake: wiring CIN into the first half adder instead of B, or leaving it out. Each of the three inputs must be added once.",
    "A smaller case: while CIN is 0, a full adder gives exactly what one half adder gives for A and B. So start from one half adder on A and B, then work out what CIN at 1 must change.",
    "Part of the answer: the first half adder takes A and B. The second takes the first's SUM and CIN. Its SUM is the full adder's SUM.",
    "The whole answer: the first half adder takes A and B. The second takes the first's SUM and CIN; its SUM is the full adder's SUM. An OR gate takes both CARRY outputs and drives COUT.",
  ],
  c2Hints: [
    "Each column is one full adder. Column 0 adds A's bit 0, B's bit 0 and CIN.",
    "A common mistake: giving every full adder CIN as its carry in. Then no carry passes between columns, and sums like `0011` + `0001` come out wrong.",
    "Work through a smaller example: two columns. Full adder 0 adds bit 0 of each word and CIN. Its COUT is full adder 1's CIN.",
    "Part of the answer: split A and split B. Full adder 0 takes b0 of each and CIN; full adder 1 takes b1 of each and full adder 0's COUT.",
    "The whole answer: split A and split B. Four full adders, 0 to 3: full adder k takes bit k of A and of B. Full adder 0's CIN is the input CIN; each other's CIN is the COUT of the one before. A join block takes the four SUM outputs, with bit 0 on b0, and drives SUM. Full adder 3's COUT drives COUT.",
  ],
  c3Hints: [
    "Two things must both be true: A3 equals B3, and S3 differs from A3.",
    "A common mistake: lighting V whenever S3 differs from A3. If A3 and B3 differ, the sum always fits, whatever S3 is.",
    "Recall: an XNOR gate gives 1 when its two inputs are the same; an XOR gate gives 1 when they differ.",
    "Part of the answer: an XNOR gate on A3 and B3 tells you whether the top bits agree.",
    "The whole answer: an XNOR gate takes A3 and B3. An XOR gate takes A3 and S3. An AND gate takes both outputs and drives V.",
  ],
} as const;
