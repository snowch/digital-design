// The words of the lesson flags.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-7-alu.md), checked against the simulator, and placed here by the lesson's
// structure. Edit a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "The office's other questions about a result are yes-or-no questions. Do room A's twin sensors agree? They agree when every bit of the XOR of their words is 0. Is room A colder than room B? Subtract room B's reading from A's, then ask whether the result reads below zero. Has the count of minutes reached `0000`?\n\nReading all 16 bits of Y to find each answer is work the ALU can do once, beside Y itself. A **flag** is a one-bit output beside the result that answers one yes-or-no question about it. Module 3's COUT is one already: it says whether a carry came out of the top slice.\n\nThe ALU gets four flags:\n\n- ZERO: 1 when every bit of Y is 0.\n- MINUS: Y's top bit; 1 when Y reads below zero, signed.\n- COUT: the carry out of the top slice.\n- OVER: 1 when the signed result does not fit in the word.\n\nCan four bits answer the office's questions? When does a flag give a wrong answer?",
  motivation:
    "ZERO answers two of the office's questions. Twin sensors agree when XOR gives ZERO = 1. The count has reached `0000` when count down gives ZERO = 1.\n\nMINUS is the top bit of Y. Module 3 found a word's top bit using AND and `8000`; MINUS gives it directly, for every job.\n\nFor 'is A colder than B', subtracting and reading MINUS looks enough. The prediction below tests it.",
  prediction:
    'The figure draws the closed 4-bit ALU, now with its four flags as outputs. Choose an answer, then press "Check my prediction".',
  p1Question:
    "A is `0111`, which is 7 signed. B is `1000`, which is -8 signed. The code is `011`, subtract, so Y is A - B. MINUS is Y's top bit.\n\nWhat will MINUS be?",
  p1Explain:
    "MINUS is 1. Subtracting -8 from 7 gives 15, but a 4-bit signed word holds only -8 to 7. So Y is `1111`, reading -1 signed. MINUS says 'below zero' for a true answer of 15, above zero. OVER is 1: the result did not fit. MINUS alone cannot tell you whether A is less than B.",
  fourFlagsLead:
    "Below is the closed 4-bit ALU with its four flags beside Y: ZERO, MINUS, COUT and OVER. You cannot open its inside here.\n\nIt starts with A = `0011` (3), B = `0101` (5), and code `011` to subtract. Change A and B by pressing their bits in the rows below the drawing. Then press OP2, OP1 or OP0 to try a different job code.",
  fourFlagsAfter:
    "- At the start, 3 minus 5 gives Y = `1110`, which reads -2 signed. ZERO is 0 (Y is not all 0), MINUS is 1 (Y's top bit is 1), COUT is 0 (3 is less than 5, unsigned), and OVER is 0 (no overflow).\n- Set B to `0011`: 3 minus 3 gives Y = `0000`. ZERO is 1 (all bits are 0), MINUS is 0 (top bit is 0), COUT is 1 (3 is at least 3, unsigned), and OVER is 0.\n- For the twin sensors, set A and B both to `1100` and choose code `001` to XOR. Y is `0000` and ZERO is 1: the words agree.",
  construction:
    "ZERO is 1 when every bit of Y is 0. Every job is built from one-bit slices, so ZERO is built the way the carry is: passed from slice to slice. Each slice takes ZIN, which says \"no 1 in any bit below this one\", and gives ZOUT, which says \"no 1 in this bit or any below\". ZOUT is 1 when ZIN is 1 and the slice's bit of Y is 0. Bit 0's ZIN is fixed at 1, because below bit 0 there are no bits. The top slice's ZOUT is ZERO. You draw one slice; the tests chain it, as Module 3's tests chained the ALU slice.",
  buildZeroLead: "Draw one slice of the zero chain; the tests chain copies at 1, 4, 8 and 16 bits.",
  c1Task:
    "Draw a circuit. The inputs are Y (one bit) and ZIN. The output is ZOUT. ZOUT is 1 when ZIN is 1 and Y is 0; otherwise ZOUT is 0. You have AND, OR, NOT and XOR gates. The tests chain copies of your slice. Copy k takes bit k of a word Y. Each copy's ZOUT drives the next copy's ZIN. Copy 0's ZIN is 1, as the ALU sets it. There are 12 tests at 1, 4, 8 and 16 bits. Each checks the last copy's ZOUT. A failed test names the copy that went wrong.",
  c1Hints: [
    'This slice says "still no 1"; it passes the news on only if its own bit is 0.',
    'An OR of ZIN and Y says "a 1 somewhere", the opposite question, and it is 1 for a word of all 0s only when ZIN is.',
    "With one slice, ZOUT is 1 only for Y = 0, because ZIN is 1.",
    "A NOT gate takes Y.",
    "A NOT gate takes Y. An AND gate takes ZIN and the NOT gate's output, and drives ZOUT.",
  ],
  flagFaultsLead:
    'The figure shows the 4-bit ALU with all four flags. The four slices, bit0 to bit3, are drawn as a staircase from bit 0 at the bottom left to bit 3 at the top right. Each slice is closed and now has inputs and outputs for the zero chain, and an OVER output. A part labelled CONST and named one gives Z0 = 1. Wires Z1, Z2 and Z3 pass ZOUT up to the next slice\'s ZIN; bit 3\'s ZOUT is ZERO. MINUS comes from "top bit", which takes bit 3 of Y. COUT and OVER come from bit 3. Press any wire to see its name and value. When you press "Run checks", 5 checks run: "3 - 5", "5 - 5", "7 - 8", "2 - 1" and "12 XOR 12". Each compares Y and the four flags with a healthy ALU. Three faults are ready: "Z2 stuck at 1", "Z0 stuck at 0" and "C3 stuck at 0". Choose each in turn and say first which checks you expect to fail.',
  flagFaultsAfter:
    'When "Z2 stuck at 1" is chosen, 1 of 5 checks fails: "2 - 1". Bit 2 now hears "no 1 below" whatever bits 0 and 1 hold, so ZERO looks only at bits 2 and 3. The result Y is `0001`, and ZERO says 1.\n\nWhen "Z0 stuck at 0" is chosen, 2 of 5 checks fail: "5 - 5" and "12 XOR 12". The zero chain now starts by saying "there is a 1", so ZERO is never 1, even when Y is `0000`.\n\nWhen "C3 stuck at 0" is chosen, 3 of 5 checks fail: "5 - 5", "7 - 8" and "2 - 1". Each of these subtractions makes a carry into bit 3. "3 - 5" makes none and succeeds.',
  explanation:
    "The two words the adder adds are A and D. For subtract, D is NOT B. So OVER reads A's, D's and the sum's top bits, not B's. The overflow rule is the same as in the adders lesson: a sum overflows when both input words have the same top bit but the result's top bit differs. For 7 - (-8), A is `0111` and D is NOT `1000`, which is `0111`. Both top bits are 0. The sum `1111` has top bit 1. OVER is 1.\n\nFor a bit-by-bit job, the adder adds all 0s to A, so COUT and OVER are both 0.\n\nAfter A - B, read signed, A is less than B exactly when MINUS and OVER differ. With no overflow, MINUS is right. With overflow, the true result is too big or too small to fit; its sign is lost, and MINUS says the opposite. Read unsigned, A is less than B when COUT is 0. A equals B when ZERO is 1.",
  overflowLimitLead:
    "The figure is the closed 4-bit ALU with flags. It shows A `0111`, B `1000`, code `011` subtract, the same words as the prediction. The table reads the words as signed.",
  overflowLimitAfter:
    "Y is `1111`. MINUS is 1 and OVER is 1. Since MINUS and OVER match, A is not less than B. This is correct: 7 is greater than -8. The carry out from bit 3 is 0.",
  generalisation:
    "The flags come from slices, so they work at any width. A chain through every slice makes ZERO. The top bit of Y is MINUS. The top slice makes COUT and OVER. At 16 bits, the office can ask its question: is room B colder than room A?",
  roomsFlagsLead:
    "Here is the 16-bit ALU with all four flags. Words display as hexadecimal; the table shows them read as signed numbers. Start at code `011`, subtract, with A = room B's word `FF06` (-250) and B = room A's word `FF48` (-184). Then swap the words. Then try add (code `010`) on `7FFF` and `0001`.",
  roomsFlagsAfter:
    "- `FF06` - `FF48`: Y is `FFBE` (-66). MINUS is 1, OVER is 0. Since MINUS and OVER differ, room B's word reads less than room A's: room B is colder by 6.6 degrees.\n- `FF48` - `FF06`: Y is `0042` (66). MINUS is 0, OVER is 0. They are the same, so room A is not colder.\n- `7FFF` + `0001`: Y is `8000`. MINUS is 1, OVER is 1. This shows signed overflow: 32767 plus 1 does not fit in a 16-bit signed word.",
  buildColderLead:
    "Draw a lamp, COLDER, that lights when A reads less than B, signed, using the flags of A - B.",
  c2Task:
    'Draw a circuit with inputs ZERO, MINUS, COUT and OVER, and output COLDER. The inputs are the flags of the 16-bit ALU after A - B. COLDER is 1 exactly when A reads less than B, signed. Use AND, OR, XOR and NOT gates. You need not use every input. There are 9 tests; each is named by the subtraction and the words, such as "FF06 - FF48". They include the rooms\' words and the words at the ends of the signed range, `7FFF` and `8000`, both ways round.',
  c2Hints: [
    "MINUS is right when OVER is 0. MINUS is wrong when OVER is 1.",
    'A common mistake is COLDER = MINUS. It fails "7FFF - 8000" and "8000 - 7FFF", where the subtraction overflows.',
    "One gate receives two inputs. It gives one input as output when the other is 0, and gives the opposite when the other is 1.",
    "Part of the answer is an XOR gate. ZERO and COUT are not needed.",
    "An XOR gate takes MINUS and OVER and drives COLDER.",
  ],
  reflection:
    'Four flags sit beside Y: ZERO, MINUS, COUT and OVER. Each answers one question in one bit. Read two of them together and they answer more: "less than", signed, is MINUS and OVER differing. ZERO is a chain through the slices, like the carry. MINUS, COUT and OVER come from the top slice.\n\nModule 3\'s tests chained a slice to 16 bits. What changes when the same slices make a word of 64 bits?',
  modelVsReality:
    "Real ALUs usually make ZERO with a tree of gates rather than a chain through the slices. Its depth (Module 2) grows far more slowly than the width.\n\nMany real processors keep the flags after each job, so a program running later can read them and check the result. In this ALU, the flags are outputs beside Y, and nothing keeps them for later reading.\n\nThe names ZERO, MINUS, COUT and OVER are this course's own.",
} as const;
