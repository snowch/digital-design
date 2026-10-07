// Copyright © 2026 Christopher Snow

// The words of the lesson immediates.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended on three questions. The layout keeps every field in place and pays with a 12-bit constant. What can one instruction say in 12 bits? How far can a branch reach? What does a program do with a number too wide for the constant? Is 12 bits enough for what programs need to say?",
  motivation:
    "The constant is digits 2 to 0: 12 bits, read signed, widened to 64 bits by copying bit 11. It holds -2048 to 2047. The course's memory has 2 KB, at addresses `000` to `7FF`. `7FF` is 2047, the largest number the constant holds. The machine was given this much memory so that every address fits in one instruction's constant.\n\nSo an absolute load or store reaches any part of the memory in one instruction, with no register holding the address. R2 ← memory[`7D8`] is `380027D8`.\n\nA branch's constant counts instructions, not bytes: the target is PC + 4c. So a branch reaches 2047 instructions forward and 2048 back. The ROM holds 256 instructions, so every branch reaches the whole ROM.",
  rangeLead:
    "The figure widens three constants: `7FF` (2047, the largest), `800` (-2048, the smallest) and `FFF` (-1). In each, bit 11 is copied into bits 63 to 12.",
  prediction:
    'A branch tests a condition: equal, differs, less, or not less, with less and not less read signed or unsigned. There is no "greater than".\n\nA program needs to branch to a target if R1 > R2, read signed. The figure below has three pairs of values for R1 and R2: 5 and -3; -3 and 5; 5 and 5. Choose the branch that is taken for every pair exactly when R1 > R2.\n\nPress "Check my prediction". The figure then shows a table of every comparison and which branch is taken.',
  p1Question: "Which branch is taken exactly when R1 > R2, read signed?",
  p1Explain:
    'The correct branch is "if R2 < R1, signed": the machine\'s "less than", with the two registers swapped. R1 > R2 says the same as R2 < R1.\n\n"if R1 >= R2" is taken when R1 equals R2. With 5 and 5, R1 > R2 is false, but that branch is taken.\n\n"if R2 >= R1" is taken when R1 is less. With -3 and 5, R1 > R2 is false, but that branch is taken.',
  investigation:
    "The first figure shows every comparison for four pairs of words, reading them signed and unsigned. The second shows two ways to put a number larger than the constant allows into a register.",
  comparisonsLead:
    "Choose a pair of values for R1 and R2 from these four: 5 and -3, -3 and 5, 5 and 5, and the largest signed number and -1. For each pair, the table has a row for each comparison, read signed and read unsigned. Each row shows what the branch condition is and whether the machine takes that branch. Rows where the branch names its registers swapped are marked.",
  comparisonsAfter:
    'In every row, the branch is taken exactly when the comparison holds. "Greater than" is "less than" with R1 and R2 swapped. "Not greater", R1 <= R2, is "not less" when swapped. The last pair overflows when subtracted. MINUS is 1 and OVER is 1, but MINUS XOR OVER is 0. Read signed, R1 > R2 is true. Read unsigned, -1 is the largest word of all, so R1 > R2 is false. The same bits read as different comparisons.',
  wideLead:
    'The number 5000 does not fit in a constant. The first program uses three instructions: R1 ← 2047, then R1 ← R1 + 2047, then R1 ← R1 + 906. The second program stores 5000 as a word in the ROM, after the instructions. A load instruction reads it from the address the constant holds, into R1. Both put 5000 into R1 and onto the display at `7C0`. Press "Run the programs".',
  wideAfter:
    "Both programs put 5000 into R1 and onto the display. The first program: 5 instructions written and run, and 20 bytes of ROM. The second program: 3 instructions written and run, and 24 bytes of ROM. Those 24 bytes hold three instructions, 4 bytes of padding to start the word at a multiple of 8, and 8 bytes for the word itself. A word in the ROM holds any 64-bit number and needs only one load instruction. Sums of constants need more instructions as numbers grow larger.",
  construction:
    "A branch at address P to address T encodes the distance as a constant: (T - P) / 4. This constant is written as three hexadecimal digits and read as signed. In the colder-room program, a branch at `008` to `010` encodes (`010` - `008`) / 4 = 2, written `002`. A branch back from `010` to `008` encodes -2, written `FFE`.",
  workReachLead: "Work each number out by hand, then run the tests.",
  c1Task:
    "Give three answers. The first: the largest number one constant job can put into a register, in decimal. The second: the constant of a branch at `01C` whose target is `008`, written as three hexadecimal digits. The third: the highest address a branch at `000` can name, in hexadecimal. Three tests check the answers, one for each.",
  c1Hints: [
    "The constant is 12 bits, read signed. A branch's target is PC + 4c.",
    "A branch constant counts instructions, not bytes. Divide the address distance by 4.",
    "Example: a branch at `008` to `010`. Distance: (`010` - `008`) / 4 = 2, written `002`.",
    "(`008` - `01C`) / 4 is -5. The 12-bit encoding of -5 is `FFB`.",
    "The answers are 2047, `FFB`, and `1FFC`. The third is `000` + 4 × 2047. A fetch at `1FFC` stops the machine with cause `11`, because the ROM ends at `3FF`.",
  ],
  equalTrapLead:
    'The program counts how many rooms are warmer than the limit, -200, and shows the count. Room A reads -200 and room B reads -250. A room is warmer when the limit is less than its reading: R1 < R2 for room A. The program skips a room\'s count when the room is not warmer: use the branch condition R1 >= R2 signed, which means the limit is not less than the reading. A second program writes the skip as "colder": it uses R2 < R1 signed. Before you run them, predict what each displays. Then press "Run the programs".',
  equalTrapAfter:
    'The first displays 0: neither room warmer than -200. The second displays 1, counting room A which reads -200. "Not warmer" means not greater: reading <= limit. The machine says it as "not less" with swapped registers: `if R1 >= R2`. The condition `if R2 < R1` skips when reading < limit. A reading equal to the limit is not skipped.',
  explanation:
    'A number kept inside the instruction itself is what books call an **immediate**. It is there as soon as the instruction is read. The course\'s immediate is the 12-bit constant, read signed and widened to 64 bits.\n\nThree things fit in the constant. Every address of the 2 KB memory. Every branch target in the ROM. Small numbers jobs use most.\n\nThe branch conditions compare two values. They test for less and not less, read signed or unsigned. With the two registers in order or swapped, they give all four comparisons: less, not less, greater, not greater.\n\nThe machine needs no job for "greater than". A program names the registers the other way round and uses the less condition.',
  generalisation:
    "A number too wide for the constant can be kept as a word in the ROM. One load reads it. It can be any 64-bit number.\n\nOr the program builds it from constant jobs, each adding at most 2047.\n\nA number used once and not much wider than the constant can be summed. A larger number, or one used in many places, is better kept as a word.\n\nAn instruction set's constant is a balance. It must fit the instruction. It must hold what programs need most. The course's 12 bits hold every address.",
  writeGreaterLead: 'Write "greater than" from the ALU\'s subtraction.',
  c2Task:
    '1. Write the module `greater`. It takes inputs A and B, each 64 bits. It outputs GT, which is 1 when A > B, read signed.\n\n2. Use the course\'s `alu` module from Module 7, at 64 bits. It has inputs A, B, OP2, OP1, OP0 and outputs Y, ZERO, MINUS, COUT, OVER. You need not connect every output.\n\n3. The starter code subtracts B from A with the ALU and sets GT to MINUS XOR OVER. That is A < B, read signed. Change it so GT is A > B.\n\n4. You may use `module`, ports, `logic`, multi-bit signals, `assign`, `~`, `&`, `|`, `^`, and one module inside another.\n\n5. There are 10 tests: pairs of equal values, the largest and smallest signed numbers, and -1. The starter code fails 8 tests. The first failure is "A 5, B -3".',
  c2Hints: [
    "The idea: A > B is B < A.",
    "A common mistake: turning the start's GT over. NOT (A < B) is A >= B, which is 1 when A equals B.",
    "A smaller example: the ALU subtracts its B from its A when OP2, OP1 and OP0 are 0, 1 and 1.",
    "Part of the answer: connect the ALU's A input to B, and its B input to A: `.A(B), .B(A)`.",
    "The whole answer, as a code block:\n\n```\nalu a1 (.A(B), .B(A), .OP2(1'b0), .OP1(1'b1), .OP0(1'b1), .MINUS(M), .OVER(V));\nassign GT = M ^ V;\n```",
  ],
  reflection:
    "Twelve bits say every address, reach every branch target in the ROM, and hold the small numbers jobs use most. The swap gives all comparisons.\n\nKinds 0 and 9 to F say nothing. The decoder rejects any word with these kinds.\n\nWhat does the machine do with a word it has no instruction for? What else does it choose to leave out? What would it cost to add each missing piece?",
  modelVsReality:
    "The figures in this lesson run every program on the reference machine. The machine executes one instruction at a time.\n\nMany real machines have constants wider than 12 bits. They have memories far larger than 2 KB. On such machines, not every address fits inside one instruction. A program must build large addresses in multiple instructions to reach them.",
} as const;
