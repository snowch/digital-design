// Copyright © 2026 Christopher Snow

// The words of the lesson encoding.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 asked why the layout is whole digits, and what that costs. Every instruction is 32 bits, which you write as eight hexadecimal digits: the kind K, the job J, the registers A, B and Y that the datapath uses, and the constant in digits 2 to 0. Each field sits in the same digits in every instruction. But the layout is a choice. The same 32 bits could be split in another way. What does this layout give you? What does it cost?",
  motivation:
    "The layout brings three advantages.\n\n- You read the instruction straight from its hexadecimal digits. `13123000` tells you kind 1, job 3, A is R1, B is R2, Y is R3: R3 ← R1 - R2.\n- Digits A, B and Y connect straight to the register file as its two read addresses and write address. No selector sits between them (Module 8).\n- The decoder never moves a field. The job is always digit 6; the constant is always digits 2 to 0 (Module 9).\n\nIt brings three costs.\n\n- The constant is 12 bits wide: -2048 to 2047.\n- There are 16 possible kinds. The course's machine uses 8 of them, kinds 1 to 8.\n- Most kinds leave a digit unused. A constant job and a load leave B unused. A store and a branch leave Y unused. A call leaves A and B unused. A jump leaves B and Y. A register job leaves the constant unused.",
  oneLayoutLead:
    "The figure below cuts one instruction into its fields. Choose one of four: R3 ← R1 - R2, R2 ← R1 + 100, R2 ← memory[`7D8`], or the branch `56230002` from the colder-room program. Each field sits in the same digits whichever you choose.",
  prediction:
    "A packed layout gives a kind's unused register digits to its constant.\n\nTake the constant job R2 ← R1 + 100. In the course's layout, its word is `22102064`: K J A B Y, then three digits of constant. Digit B is unused.\n\nIn a packed layout, the constant takes four digits (digits 3 to 0), holding -32768 to 32767. The constant's four digits sit side by side, and the other fields keep their order.\n\nChoose an answer and press \"Check my prediction\". The figure shows both layouts.",
  p1Question: "For R2 ← R1 + 100 in the packed layout, which field must move to another digit?",
  p1Explain:
    "Y moves, from digit 3 to digit 4. The constant's four digits must sit side by side, at digits 3 to 0. B's digit, 4, is the one left free, and Y takes it. The word changes from `22102064` to `22120064`. A stays in digit 5, and K and J stay where they were.",
  investigation:
    "Compare how the same instruction is laid out in two ways, for six instructions. Take any word apart and run the ALU.",
  layoutsLead:
    "Choose an instruction. The figure shows its word in each layout, digit by digit, with each field's name over its digits. Below each layout you see the constant's width and its range. A field that moves is outlined.",
  layoutsAfter:
    "In the packed layout:\n- A constant job and a load: a 16-bit constant (from -32768 to 32767), and Y moves to digit 4.\n- A branch: a 16-bit constant, and nothing moves. The word stays `56230002`.\n- A call: a 20-bit constant (from -524288 to 524287), and Y moves to digit 5.\n- A jump: a 20-bit constant, and nothing moves.\n- A register job: no change. It uses every register digit and leaves the constant unused.\n\nA store is laid out as a branch is: A and B, then four digits of constant.",
  explorerLead:
    'Type a word of eight hexadecimal digits, or choose one below the box. The figure breaks the word into fields and shows what the machine makes of it. It also shows the constant widened to 64 bits, the way the machine widens it. Below is a calculator that runs the ALU from Module 7 at 16 or 64 bits. Type A and B as signed numbers or in hexadecimal, choose a job, and the calculator gives Y in bits, in hexadecimal, unsigned, and signed, plus the four flags: ZERO, MINUS, COUT and OVER. Press "Take the job and B from the word" to extract the job from the J field of a register or constant job. For a constant job, it also sets B to the widened constant.',
  explorerAfter:
    "The calculator starts with the rooms' readings: A is -184 and B is -250, with job 3 (subtract). Y is 66. The flags are: ZERO is 0, MINUS is 0, COUT is 1, and OVER is 0. These are the flags the colder-room program's branch reads. MINUS XOR OVER is 0, so -184 is not less than -250, read signed.",
  construction:
    "To write an instruction's word, write its fields in order, one digit each: K, J, A, B, Y. Then write the constant as three hexadecimal digits. A field the instruction does not use is written as 0. A negative constant is written as its 12-bit signed reading: -3 is `FFD`. Here is an example: R2 ← R1 + 100. This is kind 2 (constant job), job 2 (add), A is R1, B unused (written 0), Y is R2. The constant 100 in hexadecimal is `064`. The word is `22102064`.",
  writeWordsLead: "Write each instruction's word as eight hexadecimal digits.",
  c1Task:
    "Write each instruction's word as eight hexadecimal digits. Here are the three instructions you need to encode:\n- R5 ← R2 - 7: a constant job with the ALU's subtract\n- R4 ← memory[R1 + 16]: a load of a word\n- if R3 != R6, PC ← PC + 4 × (-3): a branch three instructions back\n\nWrite 0 in any field the instruction does not use. There are 3 tests, one for each word. When a test fails, it shows the fields your word holds, side by side with the instruction asked for.",
  c1Hints: [
    "The structure: one digit each for K, J, A, B, Y, then three digits for the constant.",
    "A common mistake: the constant in decimal or with a minus sign. In hexadecimal, 16 is `010` and -3 is `FFD`.",
    "A smaller example: R2 ← R1 + 100 encodes as `22102064`.",
    "A load of a word at RA + c is kind 3, job 0. A branch taken when A differs from B is kind 5, job 3. Subtract is job 3.",
    "The whole answer is `23205007`, `30104010` and `53360FFD`.",
  ],
  packedReadLead:
    "The course's machine always reads every word in the course's layout. What does it make of a word when it is written in the packed layout instead? The figure shows three packed words for you to try:\n- `22120064`: R2 ← R1 + 100\n- `380207D8`: R2 ← memory[`7D8`]\n- `60F00001`: R15 ← PC + 4 and PC ← PC + 4 × 1, a call\n\nChoose each word. Before you do, predict which register the course's machine will write to.",
  packedReadAfter:
    "Each word writes R0, not the register it was written for. The course's machine reads digit 3 as Y. In each packed word, digit 3 holds the constant's top digit, here 0. `22120064` reads as R0 ← R1 + 100. `380207D8` reads as R0 ← memory[`7D8`]. `60F00001` reads as R0 ← PC + 4 and PC ← PC + 4 × 1. A word means one thing only under one layout. The layout is part of the instruction set.",
  explanation:
    "K and J together say what an instruction does: its kind and its job. The bits that choose what an instruction does are called its **opcode** (that is what books call them). In the course's layout, the opcode is digits 7 and 6.\n\nOf the 256 pairs of K and J, 37 are instructions whatever the constant is. Two more pairs, kind 8's jobs 2 and 3, are instructions only when the constant is 0 to 4.\n\nThe packed layout gives longer constants: 16 bits for a constant job, a load, a store or a branch, and 20 bits for a call or a jump.\n\nIt pays with selectors. Y sits in digit 3, 4 or 5 by kind, so the register file's write address needs a selector chosen by K. The constant is 12, 16 or 20 bits, so the widening needs a selector too.\n\nOn the course's machine the longer branch buys nothing. The ROM holds 256 instructions, and a 12-bit constant reaches 2047 instructions forward. Every address fits in 12 bits.\n\nOnly the jobs' numbers would gain.",
  generalisation:
    "Every instruction set chooses an encoding: how each instruction becomes bits.\n\nOne layout keeps the decoder and the register file simple, and a person can read a word.\n\nSeveral layouts give longer constants, but they pay with selectors and with words that are harder to read.\n\nThe course's machine chose one layout of whole digits, for people to read.\n\nThe digits left unused are not all waste. Kinds 9 to F are free. A new instruction takes a free kind, as the call through a register took kind 9 in your copy.",
  writeYdigitLead:
    "Write the selector the packed layout needs in front of the register file's write address.",
  c2Task:
    "Write the module `ydigit`. It takes IR as input, 32 bits. It outputs WA, 4 bits: the register file's write address for a word in the packed layout.\n\nWA is chosen by the kind:\n\n- For kinds 2 and 3 (constant job and load), WA is digit 4, which is `IR[19:16]`.\n- For kind 6 (call), WA is digit 5, which is `IR[23:20]`.\n- For every other kind, WA is digit 3, which is `IR[15:12]`.\n\nThe starting point uses only the last rule: `assign WA = IR[15:12];`. That is the course's layout.\n\nYou may use `module`, ports, `logic`, multi-bit signals, `assign`, selects, `always_comb`, and `case`. The test suite has 11 tests. The starting point fails 6 tests. The first failing test is `22120064`.",
  c2Hints: [
    "The idea: WA is a selector, and the kind, `IR[31:28]`, chooses which digit it passes.",
    "A common mistake: forgetting kind 3. A load writes register Y too, and leaves B unused, so its Y moves as a constant job's does.",
    "A smaller example: inside `always_comb`, `case (IR[31:28])` with the arm `4'h6: WA = IR[23:20];`.",
    "Part of the answer: `4'h2: WA = IR[19:16];`, `4'h3: WA = IR[19:16];` and `default: WA = IR[15:12];`.",
    "The whole answer, as a code block:\n\n```\nalways_comb\n  case (IR[31:28])\n    4'h2: WA = IR[19:16];\n    4'h3: WA = IR[19:16];\n    4'h6: WA = IR[23:20];\n    default: WA = IR[15:12];\n  endcase\n```",
  ],
  reflection:
    "The course's layout keeps every field in its place. It pays with a 12-bit constant.\n\nWhat can one instruction say in 12 bits? How far can a branch reach? What does a program do with a number too wide for the constant?",
  modelVsReality:
    "The course's machine has one layout of whole digits, for people to read.\n\nReal machines cut their words by bits, not digits. Many real machines have several different layouts.\n\nThe figures read every word with the same field split that the course's machine uses.",
} as const;
