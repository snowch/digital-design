// Copyright © 2026 Christopher Snow

// The words of the lesson on alu.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-3-combinational.md) and checked against the simulator, then placed here by the
// lesson's structure in alu.ts. Edit a fact here only after checking it; the lesson's facts
// test (alu.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "The last lesson ended with two questions: could one adder do subtraction as well as addition? Could one block do other jobs on two words?\n\nThe office needs four jobs done on two words, A and B:\n\n- add them, as for room B's correction: room B's word plus -6;\n- subtract B from A: room A's word minus room B's word says how much warmer room A is;\n- XOR them: room A's twin sensors agree when every bit of the XOR of their words is 0;\n- AND them: B has 1s only in the bits to keep, and every other bit of A becomes 0. AND with `8000` keeps bit 15 alone, which is 1 exactly when a word reads below zero.\n\nOne block should do all four, on whatever two words it is given. Two inputs, OP1 and OP0, choose the job: `00` picks AND, `01` picks XOR, `10` picks add, `11` picks subtract. How can one circuit do four jobs on two words?",
  motivation:
    "AND and XOR are one gate per bit. Adding is the adder you built in the last lesson. Subtraction seems to need a new circuit. It does not: A minus B is A plus minus B. Module 1's signed reading lets you check which word reads as minus B. The prediction below tries one way to make that word from B.",
  prediction:
    'The figure draws its circuit above the question. Choose an answer, then press "Check my prediction". The page shows what the simulator gave, with the values written on the circuit.',
  p1Question:
    "The figure takes a 4-bit word B. A NOT gate called notB turns every bit of B over. Its output is the word NB. An adder block adds NB and `0000` (a part labelled CONST, named zero), with its carry in, CIN, fixed at 1 (another CONST, named one). Its SUM is the output NEG. So NEG is NOT B plus 1. B is `0011`, which is 3. What is NEG?",
  p1Explain:
    "NEG is `1101`. NOT B is `1100`, and adding 1 gives `1101`. Read signed, `1101` is -8 + 4 + 1 = -3: minus B. The next sections show why NOT B plus 1 is always minus B.",
  aluBlockLead:
    "This figure shows a 4-bit block with word inputs A and B, and inputs OP1 and OP0. The outputs are Y (a word) and COUT. The block is closed. A starts at `0010` (2) and B at `0011` (3). The table reads the words unsigned and signed. Press OP1 and OP0 through 00, 01, 10 and 11 in turn. Read Y for each job.",
  aluBlockAfter:
    "The four jobs give four different words:\n\n- AND gives `0010`\n- XOR gives `0001`\n- Add gives `0101` (5)\n- Subtract gives `1111`, which reads -1 signed: 2 - 3\n\nA block that does one of several jobs on two words, arithmetic or logic, chosen by inputs, is an **ALU** (arithmetic logic unit). The course builds it one bit at a time, starting with the two arithmetic jobs.",
  construction:
    "To subtract, compute A + NOT B + 1. Every bit of B must be turned over while subtracting, and left as it is while adding. Call the input that says \"subtract\" SUB. The + 1 comes in once, as the carry into bit 0: bit 0's carry in must be 1 when subtracting and 0 when adding. In the unit, bit 0's carry in is SUB itself. The circuit for one bit of a word, repeated once per bit, is a **slice**. You draw one slice of an add-or-subtract unit. The course's tests then chain copies of your slice into words of 1, 4 and 8 bits.",
  buildAddsubLead: "Draw one slice of the add-or-subtract unit with a full adder block and gates.",
  c1Task:
    "Draw a circuit with inputs A, B, CIN and SUB and outputs SUM and COUT. This is one bit of a unit that gives A + B while SUB is 0 and A - B while SUB is 1. The tests chain copies of your slice. Copy k takes bit k of A and bit k of B and gives bit k of SUM. SUB reaches every copy. Each copy's COUT drives the next copy's CIN. Copy 0's CIN is set by each test as the unit's own wiring sets it: 1 for a subtraction, 0 for an addition. There are 11 tests, with words of 1, 4 and 8 bits. Each checks SUM and the last copy's COUT. A failed test names the copy that went wrong, bit0 to bit7, and what that copy saw.",
  addsubFaultsLead:
    'This figure is a 4-bit add-or-subtract unit made of four slices of the kind you drew. They are labelled "add/sub" and named bit0 to bit3, arranged in a staircase from bit 0 at the bottom left to bit 3 at the top right. Split blocks give each slice its bits of A and B, and a join block makes SUM. A plain-wire part, carryIn, takes SUB and drives the wire C0, bit 0\'s carry in. Each slice\'s COUT is the next one\'s carry in: wires C1, C2, C3. bit3\'s COUT is COUT. Press a wire to see its name and value. Press a slice to open it and see its XOR gate, xorB, and its full adder. "Run checks" makes 4 checks: "6 + 3", "6 - 3", "3 - 6" and "5 - 5". Each compares SUM and COUT with a healthy unit\'s. Choose each fault in turn, and say first which checks you expect to fail.',
  addsubFaultsAfterFault1:
    '"C0 stuck at 0": 3 of 4 checks fail: "6 - 3", "3 - 6" and "5 - 5", every subtraction. Without the carry into bit 0 the unit gives A + NOT B, which is one less than A - B.',
  addsubFaultsAfterFault2:
    '"Bit 1\'s xorB changed to OR": 2 of 4 checks fail: "6 - 3" and "3 - 6". While SUB is 1 the OR gate gives 1 whatever bit 1 of B is. In "5 - 5", bit 1 of B is 0, and NOT 0 is 1 anyway, so it succeeds. Additions succeed, because with SUB at 0 the OR gate passes B.',
  addsubFaultsAfterFault3:
    '"C2 stuck at 0": 3 of 4 checks fail: "6 + 3", "3 - 6" and "5 - 5": each needs a carry from bit 1 into bit 2. "6 - 3" makes no such carry, and succeeds.',
  explanation:
    "Each bit of NOT B is the opposite of B's bit. Add B and NOT B together: you get 1 in every position. In 4 bits, that is `1111`, which reads as -1 when signed. So NOT B equals -1 minus B. Add 1 to both: NOT B plus 1 equals minus B.\n\nThis is why A plus NOT B plus 1 equals A minus B.\n\nThe last lesson's overflow rules are for adding, and they do not carry over to subtracting. Unsigned: when subtracting, COUT is 1 exactly when A is at least B, read unsigned. Signed: `0111` minus `1111` is 7 minus -1, which is 8. 8 does not fit in 4 bits signed, though A and B have different top bits.",
  addsubRowLead:
    "This is the healthy 4-bit add-or-subtract unit from the fault figure. It starts at `0010` minus `0011`: A is 2, B is 3, SUB is 1. The table reads each word signed. Change A, B and SUB. Press a slice to open it.",
  addsubRowAfter:
    "2 minus 3 gives SUM `1111`, which reads -1 signed. COUT is 0, because 2 is less than 3. Set A to `0110` and B to `0011`: 6 minus 3 gives SUM `0011` and COUT 1. Set SUB to 0. The same slices now add the two words instead: 2 plus 3 gives `0101`. One unit does both jobs; SUB decides whether to add or subtract.",
  generalisation:
    "Each ALU slice makes A AND B and A XOR B. It has one add-or-subtract part, which gives the sum bit of A plus B or of A minus B, as SUB says: one of the two, not both. A 4-way selector chooses one, controlled by OP1 and OP0.\n\nFor job 11 (subtract), SUB equals OP1 AND OP0: each slice has one AND gate that makes this signal. Bit 0 gets its carry in from another AND gate on OP1 and OP0.\n\nCopies of one slice make an ALU of any width.",
  alu16Lead:
    "The figure shows a 16-bit ALU, closed. A is room A's word (`FF48`, -184), and B is room B's word (`FF06`, -250). It starts at job 11, subtract. Words this wide show in hexadecimal; the table reads them signed. Press OP1 and OP0 to try the other jobs, and change B's bits in the row under the drawing.",
  alu16After:
    "The ALU performs four jobs on two words. Two of them are:\n\n- **Subtract**: Y is `0042`, which reads 66. Room A is 6.6 degrees warmer than room B. COUT is 1, because A is at least B, read unsigned.\n- **AND**: set B to `8000` and choose job 00. Y is `8000`: bit 15 of room A's word is 1, so room A's word reads below zero.\n- For AND and XOR, COUT shows the carry of A + B, which those jobs do not use.",
  buildAluSliceLead: "Draw one ALU slice. The tests chain copies into ALUs of 1, 4, 8 and 16 bits.",
  c2Task:
    "Draw a circuit with inputs A, B, CIN, OP1 and OP0 and outputs Y and COUT: one bit of the ALU.\n\nY is A AND B for OP1 OP0 = 00, A XOR B for 01, the sum bit of A + B for 10, and the sum bit of A - B for 11.\n\nYou have full adder blocks, 4-way selector blocks (ports A, B, C, D, S1, S0, top to bottom), and AND, XOR, OR and NOT gates.\n\nThe tests chain copies of your slice. Copy k takes bit k of A and B and gives bit k of Y. OP1 and OP0 reach every copy. Each copy's COUT drives the next one's CIN. Copy 0's CIN is set by each test, as the ALU's own AND gate sets it: 1 for subtract, 0 for the other jobs.\n\nThere are 24 tests: every job at 1, 4, 8 and 16 bits, the 16-bit ones on the two rooms' words. Each checks Y; for add and subtract it also checks COUT.",
  reflection:
    "Module 3 in short: selectors choose; decoders ask whether a number is theirs; comparators ask whether two words are equal; adders add, and one adder serves signed and unsigned words alike. The ALU uses selectors and an adder: each slice works out AND, XOR, and a sum or a difference, and a selector per bit picks one. One slice repeated gives any width.\n\nEvery circuit in this module gives outputs that depend only on its inputs now. The ALU's result lasts only while A, B, OP1 and OP0 stay as they are. But how could a circuit keep a result after its inputs change?",
  modelVsReality:
    "A 16-bit subtraction waits for a carry that may travel through all 16 slices; real ALUs use faster carry circuits.\n\nReal ALUs have more jobs and more outputs, for example one that says whether the result is all 0s. This course's four jobs and their numbering are its own choice.\n\nSome computers of the 1970s were built from ALU chips a few bits wide, chained like the copies of your slice. Today a processor's whole ALU sits on one chip with the rest of the processor.\n\nThe course's tests build the chain from your drawing.",
  c1Hints: [
    "A full adder adds A, B and CIN. Subtracting needs it to add NOT B instead of B, while SUB is 1.",
    "A common mistake: wiring SUB to the full adder's CIN. Only bit 0's carry in is the + 1; every other copy's CIN must come from the copy before it, and the chain does that for you.",
    "A smaller example: an XOR gate with inputs B and SUB gives B while SUB is 0 and NOT B while SUB is 1.",
    "Part of the answer: an XOR gate takes B and SUB. Its output goes to the full adder's B.",
    "The whole answer: an XOR gate takes B and SUB. A full adder takes A, the XOR gate's output and CIN. Its SUM drives SUM and its COUT drives COUT.",
  ],
  c2Hints: [
    "Make all four results at once, then let a 4-way selector pick one with OP1 and OP0.",
    "A common mistake: putting the 4-way selector's ports in the wrong order. The selector's port A is chosen by 00, port B by 01, port C by 10 and port D by 11.",
    "A smaller example: the add-or-subtract slice you drew is the arithmetic half. Its SUB is now OP1 AND OP0.",
    "Part of the answer: an AND gate on A and B gives the AND result; an XOR gate on A and B gives the XOR result. An AND gate on OP1 and OP0 gives SUB.",
    "The whole answer: an AND gate takes A and B; an XOR gate takes A and B. A second AND gate takes OP1 and OP0 (SUB). A second XOR gate takes B and SUB. A full adder takes A, that XOR gate's output and CIN; its COUT drives COUT. A 4-way selector takes the AND result on the selector's port A, the XOR result on its port B, the full adder's SUM on its ports C and D, with OP1 on S1 and OP0 on S0, and drives Y.",
  ],
} as const;
