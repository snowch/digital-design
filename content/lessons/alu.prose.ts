// The words of the lesson on alu.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-3-combinational.md) and checked against the simulator, then placed here by the
// lesson's structure in alu.ts. Edit a fact here only after checking it; the lesson's facts
// test (alu.facts.test.ts) holds the numbers.

export const PROSE = {
  question:
    "Lesson 3 ended with two questions: could one adder do subtraction as well as addition? Could one block do other jobs on two words?\n\nThe office needs four jobs done on the two rooms' words, A and B:\n\n- add them, as for room B's correction;\n- subtract B from A to see how much warmer room A is than room B;\n- XOR them because twin sensors agree when every bit of the result is 0;\n- AND them to keep only the bits a word of 1s and 0s chooses.\n\nOne block should do all four. Two inputs, OP1 and OP0, choose the job: `00` picks AND, `01` picks XOR, `10` picks add, `11` picks subtract. How can one circuit do four jobs on two words?",
  motivation:
    "Lesson 1 gave half the answer: work out every job's result at once, and let a 4-way selector per bit pick one, with OP1 and OP0 as its select inputs. AND and XOR are one gate per bit. Adding is the adder you built in lesson 3.\n\nSubtraction seems to need a new circuit. It does not. Module 1's signed reading tells you how to turn B into minus B with the adder you have, and then A minus B is A plus (minus B). This lesson works out how. The prediction below tries one way to make minus B.",
  prediction:
    'The figure draws its circuit above the question. Choose an answer, then press "Check my prediction". The page shows what the simulator gave, with a timing diagram.',
  p1Question:
    "The figure takes a 4-bit word B. A NOT gate called notB turns every bit of B over. Its output is the word NB. An adder block adds NB and `0000` (a part labelled CONST, named zero), with its carry in, CIN, fixed at 1 (another CONST, named one). Its SUM is the output NEG. So NEG is NOT B plus 1. B is `0011`, which is 3. What is NEG?",
  p1Explain:
    "NEG is `1101`. NOT B is `1100`, and adding 1 gives `1101`. Read signed, `1101` is -8 + 4 + 1 = -3: minus B. The next sections show why NOT B plus 1 is always minus B.",
  aluBlockLead:
    "This figure shows a 4-bit block with word inputs A and B, and inputs OP1 and OP0. The outputs are Y (a word) and COUT. The block is closed. A starts at `0010` (2) and B at `0011` (3). The table reads the words unsigned and signed. Press OP1 and OP0 through 00, 01, 10 and 11 in turn. Read Y for each job.",
  aluBlockAfter:
    "The four jobs give four different words:\n\n- AND gives `0010`\n- XOR gives `0001`\n- Add gives `0101` (5)\n- Subtract gives `1111`, which reads -1 signed: 2 - 3\n\nA block that does one of several jobs on two words, arithmetic or logic, chosen by inputs, is an **ALU** (arithmetic logic unit). The course builds it one bit at a time, starting with the two arithmetic jobs.",
  construction:
    "To subtract, use A + NOT B + 1. Per bit, two things are needed. B's bit must be turned over when subtracting: an XOR gate does this, because B XOR 1 is NOT B and B XOR 0 is B. And the carry into bit 0 must be 1 when subtracting, which gives the + 1. Call the input that says \"subtract\" SUB. Bit 0's carry in is SUB itself. The circuit for one bit of a word, repeated once per bit, is a **slice**. You draw one slice of an add-or-subtract unit. The course's tests then chain copies of your slice into words of 1, 4 and 8 bits.",
  buildAddsubLead: "Draw one slice of the add-or-subtract unit with a full adder block and gates.",
  c1Task:
    "Draw a circuit with inputs A, B, CIN and SUB and outputs SUM and COUT. This is one bit of a unit that gives A + B while SUB is 0 and A - B while SUB is 1. The tests chain copies of your slice. Copy k takes bit k of A and bit k of B and gives bit k of SUM. SUB reaches every copy. Each copy's COUT drives the next copy's CIN. Copy 0's CIN is set by each test as the unit's own wiring sets it: 1 for a subtraction, 0 for an addition. There are 11 tests, with words of 1, 4 and 8 bits. Each checks SUM and the last copy's COUT. A failed test names the copy that went wrong, bit0 to bit7, and what that copy saw.",
  addsubFaultsLead:
    'This figure is a 4-bit add-or-subtract unit made of four slices of the kind you drew. They are labelled "add/sub" and named bit0 to bit3, arranged in a staircase from bit 0 at the bottom left to bit 3 at the top right. Split blocks give each slice its bits of A and B, and a join block makes SUM. A plain-wire part, carryIn, takes SUB and drives the wire C0, bit 0\'s carry in. Each slice\'s COUT is the next one\'s carry in: wires C1, C2, C3. bit3\'s COUT is COUT. Press a slice to open it and see its XOR gate, xorB, and its full adder. "Run checks" makes 4 checks: "6 + 3", "6 - 3", "3 - 6" and "5 - 5". Each compares SUM and COUT with a healthy unit\'s. Choose each fault in turn, and say first which checks you expect to fail.',
  addsubFaultsAfter:
    '- "C0 stuck at 0": 3 of 4 checks fail: "6 - 3", "3 - 6" and "5 - 5", every subtraction. Without the carry into bit 0 the unit gives A + NOT B, which is one less than A - B.\n- "Bit 1\'s xorB changed to OR": 2 of 4 checks fail: "6 - 3" and "3 - 6". While SUB is 1 the OR gate gives 1 whatever bit 1 of B is. In "5 - 5", bit 1 of B is 0, and NOT 0 is 1 anyway, so it passes. Additions pass, because with SUB at 0 the OR gate passes B.\n- "C2 stuck at 0": 3 of 4 checks fail: "6 + 3", "3 - 6" and "5 - 5": each needs a carry from bit 1 into bit 2. "6 - 3" makes no such carry, and passes.',
  explanation:
    "Each bit of NOT B is the opposite of B's bit. Add them together: you get 1 in every position. In 4 bits, that is `1111`, which reads as -1 when signed. So NOT B equals -1 minus B. Add 1 to both: NOT B plus 1 equals minus B.\n\nThis is why A plus NOT B plus 1 equals A minus B. You build subtraction with the adder you already have.\n\nThe bits are the same whether you read them signed or unsigned, as lesson 3 showed for adding. Only overflow differs.",
  addsubRowLead:
    "This is the healthy 4-bit add-or-subtract unit from the fault figure. It starts at `0011` minus `0110`: A is 3, B is 6, SUB is 1. The table reads each word signed. Change A, B and SUB. Press a slice to open it.",
  addsubRowAfter:
    "3 minus 6 gives SUM `1101`, which reads -3 signed. Set SUB to 0. The same slices now add the two words instead of subtracting them. One unit does both jobs; SUB decides whether to add or subtract.",
  generalisation:
    "Each ALU slice produces four results per bit: A AND B, A XOR B, the sum bit of A plus B, and the sum bit of A minus B. A 4-way selector chooses one, controlled by OP1 and OP0.\n\nFor job 11 (subtract), SUB equals OP1 AND OP0: each slice has one AND gate that makes this signal. Bit 0 gets its carry in from another AND gate on OP1 and OP0.\n\nCopies of one slice make an ALU of any width. The figure below is a 16-bit ALU built that way.",
  alu16Lead:
    "The figure shows a 16-bit ALU, closed. A is room A's word (`FF48`, -184), and B is room B's word (`FF06`, -250). It starts at job 11, subtract. Words this wide show in hexadecimal; the table reads them signed. Press OP1 and OP0 to try the other jobs.",
  alu16After:
    "The ALU performs four jobs on two words. Here are the results from A = `FF48` (-184) and B = `FF06` (-250):\n\n- **Subtract**: `0042` reads 66. Room A is 6.6 degrees warmer than room B.\n- **XOR**: `004E`. Not all 0s, so the two words differ. (These are two rooms; for twin sensors in one room, all 0s would mean they agree.)\n- **Add**: `FE4E` reads -434.\n- **AND**: `FF00`, the bits that are 1 in both words.",
  buildAluSliceLead: "Draw one ALU slice. The tests chain copies into ALUs of 1, 4, 8 and 16 bits.",
  c2Task:
    "Draw a circuit with inputs A, B, CIN, OP1 and OP0 and outputs Y and COUT: one bit of the ALU.\n\nY is A AND B for OP1 OP0 = 00, A XOR B for 01, the sum bit of A + B for 10, and the sum bit of A - B for 11.\n\nYou have full adder blocks, 4-way selector blocks (inputs A, B, C, D, S1, S0, top to bottom), and AND, XOR, OR and NOT gates.\n\nThe tests chain copies of your slice. Copy k takes bit k of A and B and gives bit k of Y. OP1 and OP0 reach every copy. Each copy's COUT drives the next one's CIN. Copy 0's CIN is set by each test, as the ALU's own AND gate sets it: 1 for subtract, 0 for the other jobs.\n\nThere are 24 tests: every job at 1, 4, 8 and 16 bits, the 16-bit ones on the two rooms' words. Each checks Y; for add and subtract it also checks COUT.",
  reflection:
    'Module 3 in short: selectors choose, decoders and comparators ask "is this equal?", adders add, and one adder serves signed and unsigned words alike. The ALU puts them together: every job worked out at once, a selector per bit picking one, and one slice repeated for any width.\n\nEvery circuit in this module gives outputs that depend only on its inputs now. The ALU\'s result lasts only while A, B, OP1 and OP0 stay as they are. But how could a circuit keep a result after its inputs change?',
  modelVsReality:
    "The ALU's carry passes through every slice in turn, as in lesson 3's adder. A 16-bit subtraction waits for a carry that may travel all 16 slices; real ALUs use faster carry circuits.\n\nReal ALUs have more jobs and more outputs, for example one that says whether the result is all 0s. This course's four jobs and their numbering are its own choice.\n\nSome computers of the 1970s were built from ALU chips a few bits wide, chained like the copies of your slice.\n\nThe course's tests build the chain from your drawing; in hardware the copies are separate circuits on a chip.",
  c1Hints: [
    "A full adder adds A, B and CIN. Subtracting needs it to add NOT B instead of B, while SUB is 1.",
    "A common mistake: wiring SUB to the full adder's CIN. Only bit 0's carry in is the + 1; every other copy's CIN must come from the copy before it, and the chain does that for you.",
    "A smaller example: an XOR gate with inputs B and SUB gives B while SUB is 0 and NOT B while SUB is 1.",
    "Part of the answer: an XOR gate takes B and SUB. Its output goes to the full adder's B.",
    "The whole answer: an XOR gate takes B and SUB. A full adder takes A, the XOR gate's output and CIN. Its SUM drives SUM and its COUT drives COUT.",
  ],
  c2Hints: [
    "Make all four results at once, then let a 4-way selector pick one with OP1 and OP0.",
    "A common mistake: putting the 4-way selector's inputs in the wrong order. Input A is chosen by 00, B by 01, C by 10 and D by 11.",
    "A smaller example: the add-or-subtract slice you drew is the arithmetic half. Its SUB is now OP1 AND OP0.",
    "Part of the answer: an AND gate on A and B gives the AND result; an XOR gate on A and B gives the XOR result. An AND gate on OP1 and OP0 gives SUB.",
    "The whole answer: an AND gate takes A and B; an XOR gate takes A and B. A second AND gate takes OP1 and OP0 (SUB). A second XOR gate takes B and SUB. A full adder takes A, that XOR gate's output and CIN; its COUT drives COUT. A 4-way selector takes the AND result on A, the XOR result on B, the full adder's SUM on C and on D, with OP1 on S1 and OP0 on S0, and drives Y.",
  ],
} as const;
