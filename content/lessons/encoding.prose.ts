// Copyright © 2026 Christopher Snow

// The words of the lesson encoding.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 asked why every field keeps one place in every instruction, and what that costs.\n\nEvery instruction is 32 bits, written as eight hexadecimal digits: the kind K, the job J, the registers A, B and Y, and the constant in digits 2 to 0. Each field sits in the same digits in every instruction.\n\nWhy whole digits? There are sixteen registers, sixteen kinds and sixteen jobs, so each field needs exactly 4 bits, one hexadecimal digit. Cutting the word by bits instead would buy room only where a field is unused.\n\nWhat does keeping every field in one place give? What does it cost?",
  motivation:
    "The layout brings three advantages.\n\n- You read the instruction straight from its hexadecimal digits. `13123000` tells you kind 1, job 3, A is R1, B is R2, Y is R3: R3 ← R1 - R2.\n- Digits A, B and Y connect straight to the register file as its two read addresses and write address. No selector sits between them (Module 8).\n- The decoder never moves a field. The job is always digit 6; the constant is always digits 2 to 0 (Module 9).\n\nIt brings three costs.\n\n- The constant is 12 bits wide: -2048 to 2047.\n- There are 16 possible kinds. The course's machine uses 8 of them, kinds 1 to 8.\n- Most kinds leave a digit unused. A constant job and a load leave B unused. A store and a branch leave Y unused. A call leaves A and B unused. A jump leaves B and Y. A register job leaves the constant unused.",
  oneLayoutLead:
    "The figure cuts one instruction into its fields. Choose one of four: R3 ← R1 - R2, R2 ← R1 + 100, R2 ← memory[`7D8`], or the branch `56230002` from the colder-room program. Each field sits in the same digits whichever you choose. A field the instruction leaves unused is marked, with what the machine does instead.",
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
    "In the packed layout:\n\n- A register job: no change. It uses every register digit and leaves the constant unused.\n- A branch: a 16-bit constant (-32768 to 32767), and nothing moves. The word stays `56230002`. A store is laid out as a branch is: A and B, then four digits of constant.\n- A jump: a 20-bit constant (-524288 to 524287), and nothing moves.\n- A constant job and a load: a 16-bit constant, and one register field moves to make room.\n- A call: a 20-bit constant, and one register field moves to make room.",
  explorerLead:
    'Type a word of eight hexadecimal digits, or choose one below the box. The figure breaks the word into fields and shows what the machine makes of it. It also shows the constant widened to 64 bits, the way the machine widens it. Below is a calculator that runs the ALU from Module 7 at 16 or 64 bits. Type A and B as signed numbers or in hexadecimal, choose a job, and the calculator gives Y in bits, in hexadecimal, unsigned, and signed, plus the four flags: ZERO, MINUS, COUT and OVER. Press "Take the job and B from the word" to extract the job from the J field of a register or constant job. For a constant job, it also sets B to the widened constant.',
  explorerAfter:
    "The calculator starts with the rooms' readings: A is -184 and B is -250, with job 3 (subtract). Y is 66. The flags are: ZERO is 0, MINUS is 0, COUT is 1, and OVER is 0. These are the flags the colder-room program's branch reads. MINUS XOR OVER is 0, so -184 is not less than -250, read signed.",
  construction:
    "To write an instruction's word, write its fields in order, one digit each: K, J, A, B, Y, then the constant as three hexadecimal digits. A field the instruction does not use is written as 0. A negative constant is written as the 12 bits whose signed reading it is: -100 is `F9C`.\n\nExample: R2 ← R1 + 100 is kind 2 (constant job), job 2 (add), A is R1, B unused (0), Y is R2, and 100 is `064`. The word is `22102064`.",
  writeWordsLead: "Write each instruction's word as eight hexadecimal digits.",
  c1Task:
    "Write each instruction's word as eight hexadecimal digits. Here are the three instructions you need to encode:\n- R5 ← R2 - 7: a constant job with the ALU's subtract\n- R4 ← memory[R1 + 16]: a load of a word\n- if R3 != R6, PC ← PC + 4 × (-3): a branch three instructions back\n\nWrite 0 in any field the instruction does not use. There are 3 tests, one for each word. When a test fails, it shows the fields your word holds, side by side with the instruction asked for.",
  c1Hints: [
    "The structure: one digit each for K, J, A, B, Y, then three digits for the constant.",
    "A common mistake: the constant in decimal, or with a minus sign. In hexadecimal, 16 is `010`, and -100 is `F9C`.",
    "A smaller example: R2 ← R1 + 100 encodes as `22102064`.",
    "A load of a word at RA + c is kind 3, job 0. A branch taken when A differs from B is kind 5, job 3. Subtract is job 3.",
    "The whole answer is `23205007`, `30104010` and `53360FFD`.",
  ],
  packedReadLead:
    "The course's machine reads every word in the course's layout. But what if you write a word in the packed layout instead? The figure shows three words in the packed layout: a constant job, a load and a call. Choose each word and read what the machine makes of it.",
  packedReadAfter:
    "The machine reads digit 3 as Y (the register to write). In `22120064` and `380207D8`, digit 3 is the constant's top digit. In `60F00001`, the constant spans digits 4 to 0, so digit 3 is its second digit. In all three, digit 3 is 0.\n\nSo each word writes to R0, not the register you wrote it for. `22120064` reads as R0 ← R1 + 100. `380207D8` reads as R0 ← memory[`7D8`]. `60F00001` reads as R0 ← PC + 4 and PC ← PC + 4 × 1.\n\nA word means one thing only under one layout. The layout is part of the instruction set.",
  explanation:
    "K and J together say what an instruction does: its kind and its job. The bits that choose what an instruction does are what books call its **opcode**. In the course's layout, the opcode is digits 7 and 6.\n\nBoth layouts hold the opcode in digits 7 and 6. K is always in the same place, so it can choose which digit holds Y. That is the packed layout's selector, which the challenge writes.\n\nThe packed layout gives longer constants: 16 bits for a constant job, load, store or branch, and 20 bits for a call or jump. It pays with selectors: Y sits in digit 3, 4 or 5 by kind, digit 4 for a constant job or a load, as the prediction found, and digit 5 for a call. Choosing the digit is the selector the paragraph before names. The constant is 12, 16 or 20 bits, so the widening needs a second selector.\n\nOn the course's machine, a longer branch buys nothing. A 12-bit branch already reaches the whole ROM (lesson 3 explains why). Only a constant job's constant would gain.",
  generalisation:
    "Every instruction set chooses an encoding: how each instruction becomes bits.\n\nOne layout keeps the decoder and the register file simple, and a person can read a word.\n\nSeveral layouts give longer constants, but they pay with selectors and with words that are harder to read.\n\nThe course's machine chose one layout of whole digits, for people to read.",
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
    "Real machines cut their words by bits, not digits, and many have several layouts. The explorer reads every word using the course's machine's own field split. The layouts figure also draws the packed split.",
} as const;
