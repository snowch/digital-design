// Copyright © 2026 Christopher Snow

// The words of the lesson immediates.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended with three questions: What can one instruction say in 12 bits? How far can a branch reach? What does a program do with a number too wide for the constant?\n\nA branch compares two registers, but the machine has no test for greater than.\n\nHow does a program say greater than? Is 12 bits enough for what programs need to say?",
  motivation:
    "The constant occupies digits 2 to 0: 12 bits, read signed, widened to 64 bits by copying bit 11. It holds -2048 to 2047.\n\n`000` to `7FF` widen to 0 to 2047. `800` to `FFF` have bit 11 set to 1, so they widen to negative numbers, -2048 to -1. A load with the constant `800` stops the machine with cause `31`: the address is outside memory.\n\nThe largest address a constant names is `7FF`. The memory is 2 KB, from `000` to `7FF`. It was sized exactly to this range. Module 8's lesson 4 said every address fits in the constant; this is why.\n\nA branch's constant counts instructions, not bytes: the target is PC + 4c. Lesson 2 said a branch reaches the whole ROM of 256 instructions. This is why: a branch can reach 2047 instructions forward or 2048 back.",
  rangeLead:
    "The figure widens three constants: `7FF` (2047, the largest), `800` (-2048, the smallest), and `FFF` (-1). In each, bit 11 is copied into bits 63 to 12.",
  prediction:
    'A branch tests for equal, differ, less, or not less, read signed or unsigned. The machine has no test for greater than.\n\nA program must branch if R1 > R2, read signed.\n\nThe table shows three pairs of values: R1 and R2 are 5 and -3, -3 and 5, or 5 and 5.\n\nChoose the branch that is taken for every pair exactly when R1 > R2, then press "Check my prediction".\n\nFor each pair, the figure shows whether R1 > R2 holds and whether each branch is taken.',
  p1Question: "Which branch is taken exactly when R1 > R2, read signed?",
  p1Explain:
    'The correct branch is "if R2 < R1, signed": the machine\'s "less than", with the two registers swapped. R1 > R2 says the same as R2 < R1.\n\n"if R1 >= R2" is taken when R1 equals R2. With 5 and 5, R1 > R2 is false, but that branch is taken.\n\n"if R2 >= R1" is taken when R1 is less. With -3 and 5, R1 > R2 is false, but that branch is taken.',
  investigation:
    "The first figure shows every comparison for four pairs of words, reading them signed and unsigned. The second shows two ways to put a number larger than the constant allows into a register.",
  comparisonsLead:
    "Choose a pair of values for R1 and R2: 5 and -3, -3 and 5, 5 and 5, or the largest signed number and -1. The table has a row for each comparison, read signed and read unsigned. Each row shows the branch that tests it, the subtraction that branch makes with its flags, and whether the machine takes the branch. Rows where the branch names its registers swapped are marked.",
  comparisonsAfter:
    'In every row, the branch is taken exactly when the comparison holds. "Greater than" is "less than" with R1 and R2 swapped. "Not greater" (R1 <= R2) is "not less" swapped.\n\nWhen R1 is the largest signed number and R2 is -1, the R1 < R2 and R1 >= R2 branches subtract R2 from R1, which overflows: MINUS is 1, OVER is 1, so MINUS XOR OVER is 0 and R1 < R2, signed, is false. The R1 > R2 and R1 <= R2 branches subtract R1 from R2, which does not overflow: MINUS is 1, OVER is 0, so MINUS XOR OVER is 1 and R1 > R2, signed, is true.\n\nRead unsigned, -1 is the largest word, so R1 > R2 is false. The same bits answer differently when read signed or unsigned.',
  wideLead:
    '5000 does not fit in a constant. The first program builds it from constant jobs; the figure lists its instructions. The second program keeps 5000 as a word placed in the ROM with the program, after the instructions. One load reads it into R1, from the address the constant names.\n\nBoth programs put 5000 into R1 and onto the display at `7C0`. Answer the question first, then press "Run the programs".',
  wideAfter:
    "Both programs put 5000 into R1 and onto the display. The first runs 5 instructions and uses 20 bytes of ROM. The second runs 3 instructions and uses 24 bytes of ROM: the three instructions, 4 bytes of padding so the word starts at a multiple of 8, and the 8-byte word itself.\n\nA word in the ROM holds any 64-bit number for one load. As numbers grow, sums or doublings need more jobs.",
  construction:
    "A branch from address P to address T has a constant: (T - P) / 4. Write it in three hexadecimal digits and read it signed.\n\nIn the colder-room program, the branch at `008` goes forward to `010`: (`010` - `008`) / 4 = 2, written `002`.\n\nThe figure shows a loop that works out 7 × 5 by adding 7 five times. Its branch at `018` goes back to `010`: (`010` - `018`) / 4 = -2, written `FFE`.",
  workReachLead: "Work each number out by hand, then run the tests.",
  c1Task:
    "Give three answers, each tested.\n\nThe first: the largest number one instruction R1 ← c, a constant job with copy B, puts in R1, in decimal.\n\nThe second: the constant of a branch from `01C` to `008`, as three hexadecimal digits.\n\nThe third: the highest address a branch at `000` can name, in hexadecimal.",
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
    "A number kept inside the instruction itself is what books call an **immediate**. It is there as soon as the instruction is read. The course's immediate is the 12-bit constant, read signed and widened to 64 bits.\n\nThe branch conditions test for less and not less, read signed or unsigned. With the two registers in order or swapped, they give all four comparisons: less, not less, greater, not greater.\n\nThe machine needs no job for \"greater than\". A program names the registers the other way round and uses the less test.\n\nEach branch decides from one subtraction's flags. The swapped branch makes the other subtraction, so it has flags of its own.",
  generalisation:
    "A number too wide for the constant can be kept as a word in the ROM. One load reads it, and it can be any 64-bit number.\n\nOr a program builds it from jobs: sums of constants, each adding at most 2047, or doubling a register.\n\nA number used once and not much wider than the constant can be built. A larger one, or one used in many places, is better kept as a word.",
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
    "The swap gives every comparison.\n\nOn the course's machine, kinds 0 and 9 to F name no instruction.\n\nWhat does the machine do with an instruction's 32 bits that name no instruction? What else does the instruction set leave out, and what would each cost to add?",
  modelVsReality:
    "The programs in this lesson's figures run on a model of the machine that runs one instruction at a time (lesson 1's). It leaves out the clock edges and the parts a program cannot see: the IR, the held words, the controller's state.\n\nMany real machines have constants wider than 12 bits and memories far larger than 2 KB. On them, not every address fits in one instruction. A program builds a large address in several.",
  p2Question:
    "How many instructions does the first program run to show 5000 on the display, including the store and the stop?",
  p2Explain:
    "The first program runs 5 instructions: R1 ← 2047, R1 ← R1 + 2047, R1 ← R1 + 906, the store, and the stop. Each constant job adds at most 2047, and 5000 needs three of them.\n\nModule 8's lesson 2 built 3600 by doubling: R6 ← 1800, then R6 ← R6 + R6. Doubling builds 5000 in three jobs too: R1 ← 1250, then R1 ← R1 + R1 twice.",
  colderBranchLead:
    "The figure lists the loop and draws its branch, at `018`, as an arrow back to `010`. The branch is taken 4 times and not taken once, when the count reaches 0.",
} as const;
