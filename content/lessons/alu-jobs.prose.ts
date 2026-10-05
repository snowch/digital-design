// The words of the lesson alu-jobs.
//
// Drafted by the course's prose process from briefs of checked facts (see CLAUDE.md and
// docs/notes/module-7-alu.md), checked against the simulator, and placed here by the lesson's
// structure. Edit a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Module 3's ALU does four jobs on two words A and B, chosen by OP1 and OP0: `00` AND, `01` XOR, `10` add, `11` subtract.\n\nThe shop's office now asks for four more jobs.\n\nOR turns chosen lamps on. In a word with one bit per lamp, B has a 1 in each bit to turn on. A OR B turns those lamps on and leaves every other bit of A unchanged.\n\nY is B unchanged, so a word can pass through the ALU as it is.\n\nCount up counts each time the freezer door opens: you add 1 to A. Count down counts down the minutes left of a defrost: you subtract 1 from A.\n\nA third select input, OP2, is added. OP2 = 0 keeps Module 3's four jobs and their codes. OP2 = 1 picks the new four: `100` OR, `101` copy B, `110` count up, `111` count down. A code is written OP2 OP1 OP0.\n\nHow can one slice do eight jobs without a second adder?",
  motivation:
    "OR is one gate per bit, as AND and XOR are. Copy B needs no gate: B already reaches every slice. Count up and count down are both additions. Count up is A + 1. Count down is A - 1, which is A plus minus 1. The slice's adder can do both. What changes is the word the adder adds to A.",
  prediction:
    'When you choose an answer and press "Check my prediction", the page shows what the simulator gave, with a timing diagram.',
  p1Question:
    "The figure shows the closed 4-bit ALU, with word inputs A and B, select inputs OP2, OP1 and OP0, and outputs Y and COUT. The office's count of minutes is at `0000`: A is `0000`, B is `0000`. The code is `111`, count down. What is Y?",
  p1Explain:
    "Y is `1111`. Count down adds `1111` to A with a carry into bit 0 of 0. Read signed, `1111` is -1, so A + `1111` is A - 1. `0000` + `1111` is `1111`: 15 unsigned, -1 signed. COUT is 0. The count wraps round to `1111` when it goes below `0000`.",
  eightJobsLead:
    "The figure is the same closed 4-bit ALU. Its inside cannot be opened here, because drawing a slice is this lesson's last challenge. A starts at `0011` (3) and B at `0101` (5). The table under the drawing reads each word unsigned and signed. Press OP2, OP1 and OP0 through the eight codes, `000` to `111`, and read Y for each.",
  eightJobsAfter:
    "Eight codes give eight different results. With A = `0011` (3) and B = `0101` (5):\n\n- `000` AND: `0001`.\n- `001` XOR: `0110`.\n- `010` add: `1000`. Read unsigned that is 8. Read signed it is -8: 3 + 5 does not fit a signed 4-bit word, which is Module 3's overflow.\n- `011` subtract: `1110`, which reads -2 signed: 3 - 5.\n- `100` OR: `0111`.\n- `101` copy B: `0101`.\n- `110` count up: `0100`, 3 + 1.\n- `111` count down: `0010`, 3 - 1. COUT is 1 for this job only, on these words.",
  construction:
    "Each slice's full adder adds three bits: A's bit, a bit of a second word, and a carry in. Call the second word **D**. D changes with the job. For add, D is B. For subtract, D is NOT B. For count up, D is all 0s. For count down, D is all 1s. For every bit-by-bit job, D is all 0s.\n\nOP1 says whether the job adds. OP0 turns D over: B becomes NOT B, all 0s become all 1s. OP2 says whether D comes from B or is a fixed word. For bit-by-bit jobs, D is all 0s, so the adder adds nothing to A and never carries: COUT is always 0. Your challenge is to draw one bit of D.",
  buildOperandLead: "Draw one bit of D from B and the three select inputs.",
  c1Task:
    "Draw a circuit with inputs B, OP2, OP1 and OP0, and one output: D, one bit of the adder's second word. D is 0 whenever OP1 is 0. When OP1 is 1: if OP2 is 0, D is B while OP0 is 0 and NOT B while OP0 is 1; if OP2 is 1, D is OP0 itself. You have 2-way selector blocks (ports A, B and S, top to bottom; Y is A while S is 0 and B while S is 1) and AND, XOR, OR and NOT gates. There are 16 tests, one for every pattern of B, OP2, OP1 and OP0.",
  c1Hints: [
    "Work through three things: whether the job adds, whether to turn B over, and whether to use a fixed word.",
    "Bit-by-bit jobs matter. When OP1 is 0, D must be 0, whatever B, OP2 and OP0 are.",
    "An XOR gate with inputs B and OP0 gives B when OP0 is 0 and NOT B when OP0 is 1.",
    "An XOR gate takes B and OP0. A 2-way selector takes that XOR gate's output on its port A, OP0 on its port B, and OP2 on S.",
    "Add an AND gate to the circuit from hint 4: it takes the selector's Y and OP1, and drives D.",
  ],
  jobFaultsLead:
    'The figure shows a 4-bit ALU built from four slices, named bit0 to bit3, arranged in a staircase from bit 0 at the bottom left to bit 3 at the top right. The slices are closed here; your last challenge is to draw one. Split blocks give each slice its bits of A and B. A join block combines the slices\' Y outputs. Two gates in front, xorC0 and andC0, make C0 from OP2, OP1 and OP0. Each slice\'s COUT passes to the next slice\'s carry in through wires C1, C2 and C3. Press any wire to see its name and value. "Run checks" compares Y and COUT with a healthy ALU\'s using 8 checks, one per job on 3 and 5: "3 AND 5", "3 XOR 5", "3 + 5", "3 - 5", "3 OR 5", "copy 5", "3 + 1" and "3 - 1". The fault options are "C0 stuck at 0", "OP2 stuck at 0" and "C2 stuck at 0". Choose each in turn and predict which checks will fail.',
  jobFaultsAfter:
    '- "C0 stuck at 0": 2 of 8 checks fail, the two that need C0 = 1: "3 - 5" and "3 + 1". Each result is one less. "3 - 5" gives `1101`, "3 + 1" gives `0011`.\n- "OP2 stuck at 0": 4 of 8 checks fail: "3 OR 5", "copy 5", "3 + 1" and "3 - 1". Each new job does Module 3\'s job with the same OP1 and OP0: OR gives AND\'s `0001`, copy B gives XOR\'s `0110`, count up gives add\'s `1000`, count down gives subtract\'s `1110`.\n- "C2 stuck at 0": 4 of 8 checks fail, all four arithmetic jobs: "3 + 5", "3 - 5", "3 + 1" and "3 - 1". All four make a carry from bit 1 into bit 2. The four bit-by-bit jobs all pass: their D is all 0s, so no carry is made.',
  explanation:
    "The carry into bit 0, C0, finishes each arithmetic job. Subtract needs C0 = 1 because A + NOT B + 1 equals A - B (as in Module 3). Count up needs C0 = 1 because A + 0 + 1 equals A + 1. Add needs C0 = 0, and count down needs C0 = 0 because all 1s reads -1 signed, so A + all 1s is A - 1. So C0 is 1 exactly when OP1 is 1 and OP2 and OP0 differ. The formula is C0 = OP1 AND (OP2 XOR OP0). Two gates outside the slices make it, as one AND gate made Module 3's carry in.",
  operandCarryLead:
    "The figure shows one bit of D with three gates: an XOR gate (xorB), a 2-way selector (pickD), and an AND gate (andD). Beside them are the two gates for C0: xorC0 and andC0. Inputs: B, OP2, OP1 and OP0. Outputs: D and C0. It starts at B = 1 and code `010` (add), which gives D = 1 and C0 = 0. Press the inputs through the arithmetic codes, then through a bit-by-bit code.",
  operandCarryAfter:
    "- `011` subtract: D is NOT B, C0 is 1.\n- `110` count up: D is 0, C0 is 1.\n- `111` count down: D is 1, C0 is 0.\n- Any code with OP1 = 0: D is 0 and C0 is 0.",
  generalisation:
    "The slice works on one bit, so copies of it chained make the ALU at any width. At 16 bits, counting shows how far a carry travels: from bit 0 through every slice whose bit of A is 1.",
  jobs16Lead:
    "The figure shows the 16-bit ALU as one block. Words this wide show in hexadecimal; the table reads them unsigned. It starts at A = `00FF`, B = `0000`, code `110` (count up). Y is `0100`: the carry made in bit 0 passes through the 8 slices whose bit of A is 1. Try A = `FFFF` next, then count down (code `111`) with A = `0000`. Change A's bits in the row under the drawing.",
  jobs16After:
    "Count up from `FFFF` gives `0000`, with COUT 1. Count down from `0000` gives `FFFF`, with COUT 0. The count wraps round at both ends, at 16 bits as at 4. How could the office tell that a count has wrapped, or has reached `0000`, without reading all 16 bits of Y?",
  buildSliceLead:
    "Draw one slice of the eight-job ALU; the tests chain copies of it at 1, 4, 8 and 16 bits.",
  c2Task:
    "Draw a circuit with inputs A, B, CIN, OP2, OP1 and OP0 and outputs Y and COUT: one slice of the eight-job ALU.\n\nY is, by code: `000` A AND B; `001` A XOR B; `010` the sum bit of A + B; `011` the sum bit of A - B; `100` A OR B; `101` B; `110` the sum bit of A + 1; `111` the sum bit of A - 1.\n\nCOUT is the full adder's carry out, for every job.\n\nYou have full adder blocks, 4-way selector blocks (ports A, B, C, D, S1 and S0, top to bottom; S1 S0 = 00 picks A, 01 picks B, 10 picks C, 11 picks D), 2-way selector blocks, and AND, XOR, OR and NOT gates.\n\nThe tests chain copies of your slice. Copy k takes bit k of A and B and gives bit k of Y. OP2, OP1 and OP0 reach every copy. Each copy's COUT drives the next copy's CIN. Copy 0's CIN is set by each test as the two gates in front set C0: 1 for subtract and count up, 0 for every other job.\n\nThere are 34 tests: every job at 1, 4, 8 and 16 bits (the 16-bit ones on the two rooms' words, `FF48` and `FF06`), and two more at 16 bits: `FFFF` counted up and `0000` counted down. Each checks Y and COUT.",
  c2Hints: [
    "Make every result at once, then let selectors pick one. The adder's sum serves all four arithmetic jobs.",
    "A common mistake: wiring B straight into the full adder. The adder must add D, the word your first challenge made, or subtract and the counts come out wrong.",
    "A smaller example: a 4-way selector with S1 = OP2 and S0 = OP0 picks among four bit-by-bit results: AND on port A, XOR on B, OR on C, and B itself on D.",
    "Part of the answer: the circuit for D from the first challenge feeds the full adder's B, with A and CIN. A 2-way selector with S = OP1 takes the 4-way selector's Y on its port A and the full adder's SUM on its port B, and drives Y.",
    "The whole answer: an AND, an XOR and an OR gate each take A and B. A 4-way selector takes their outputs on ports A, B and C, B itself on port D, OP2 on S1 and OP0 on S0. An XOR gate takes B and OP0; a 2-way selector takes that on its port A, OP0 on its port B and OP2 on S; an AND gate takes that selector's Y and OP1 and gives D. A full adder takes A, D and CIN; its COUT drives COUT. A 2-way selector takes the 4-way selector's Y on port A, the full adder's SUM on port B and OP1 on S, and drives Y.",
  ],
  reflection:
    "The ALU now does eight jobs, chosen by three select inputs. One adder serves all four arithmetic jobs because the word it adds, D, changes with the code, and two gates set the carry into bit 0. The new jobs came from the office's needs: lamps on, a word passed through, counts up and down.\n\nThe office's other questions about a result are yes or no: are all its bits 0? Does it read below zero? Did a count wrap round? How can the ALU answer each of these in one bit, beside Y?",
  modelVsReality:
    "The course's ALU does no shifts (moving every bit of a word one place left or right). A shift takes each bit from its neighbour, so it is not a chain of one-bit slices. Real ALUs often have a separate shifter beside the adder.\n\nThe jobs and their codes here are this course's own choice. Real ALUs have more jobs and their own codes.\n\nIn the course's stepped model every gate takes one step. Real gates take different times, and the same circuit built in a real chip may arrange its gates differently.",
} as const;
