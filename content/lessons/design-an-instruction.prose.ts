// Copyright © 2026 Christopher Snow

// The words of the lesson design-an-instruction.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs), checked against the simulator, and placed
// here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 4 asked which instruction you would add, and how you would show it is worth its cost. This lesson answers both. You design set if: RY ← 1 if RA and RB meet a condition, else RY ← 0. You justify it with a program it shortens, and build it into your copy of Module 9's machine, where kind 9 holds the call through a register. What does set if need from the machine?",
  motivation:
    "Set if keeps a comparison as a number: 1 or 0 in a register. Its job digit is a branch's condition: equal, differs, and less and not less, read signed or unsigned. With job 6, less read signed: R5 ← 1 if R2 < R1, read signed, else 0. Its word is `A6215000`: kind A, job 6, A is R2, B is R1, Y is R5, the constant unused.",
  shorterLead:
    'Two programs count how many rooms are colder than the limit, -200, and show the count:\n\n- The first uses branches on the course\'s machine. For each room, a branch skips the count when the room is not colder.\n- The second uses set if on your copy with kind A: R5 ← 1 if R2 < R1, R6 ← 1 if R3 < R1, then R4 ← R5 + R6.\n\nRoom A reads -184 and room B -250.\n\nPress "Run the programs".',
  shorterAfter:
    "Both display 1. Room B, at -250, is colder than -200. Room A, at -184, is not. The branches: 10 instructions written, 9 run. Set if: 8 instructions written, 8 run, and no branch, so the same instructions run whatever the readings. R5 holds 0 and R6 holds 1.",
  prediction:
    "Set if subtracts RB from RA, as a branch does, and writes register Y, as a register job does. In Module 9's machine a register job takes FETCH, READ, ALU and WRITE. A branch takes FETCH, READ and ALU. The figure runs the decoder's signals for kind A through the controller. Choose an answer and press \"Check my prediction\". The figure then shows each kind's edges.",
  p1Question: "How many edges does set if take in your copy of Module 9's machine?",
  p1Explain:
    "Set if takes 4 edges: FETCH, READ, ALU, WRITE, as a register job. The decoder sets WRITEY and not MEM or CALL, so the controller goes from READ to ALU, then to WRITE. The controller does not change. At the WRITE edge the condition is worked out again. HA, HB and the IR keep their words from READ, so the ALU's flags and MET are the same as at ALU. Register Y takes MET as a word.",
  yWordLead:
    "The figure shows the block that chooses what word register Y takes. In Module 9, Y takes HR (the held result), or HM (the word a load reads) when LOAD is 1, or PC + 4 when CALL is 1. You add a new input, MET: the branch condition as a 64-bit word, with 63 zeros in the upper bits and the condition itself in the lowest bit. When SET is 1, register Y takes that word instead of any other choice. Press LOAD, CALL, SET and MET to vary these signals, and watch YIN to see which word register Y takes.",
  yWordAfter:
    "When SET is 1, YIN shows MET as a 64-bit word: 1 (in the lowest bit) when the condition is true, 0 when it is false, regardless of what HR, HM, LOAD and CALL hold. The SET selector comes last in the chain, so it overrides both LOAD and CALL.",
  newColumnLead:
    "The table shows kind A read from your copy's decoder, shown next to the columns for a register job and a branch. Kind A's column sets WRITEY the way a register job sets it, sets OP1 and OP0 to subtract as a branch does, sets BRANCH to 0, and sets SET to 1.",
  construction:
    "A design is checked against the layout's rules from lessons 2 to 4. The rules are these:\n- a kind that is free in the machine it goes into;\n- each register is named by the field every instruction uses for it (so the decoder never moves which field it reads);\n- what the instruction shortens (counted on a program that uses it);\n- what it costs the circuit (set against what it saves).\n\nThe first challenge tests set if's design against all these rules. The second challenge builds its decoder column.",
  designLead: "Check set if's design against the layout's rules.",
  c1Task:
    "Your task is to design set if, a new instruction that writes the branch condition to a register. Make five choices to define your instruction:\n- the kind (choose from 0, 5, 9 or A);\n- the field that holds the register written;\n- where the condition comes from;\n- which program set if shortens;\n- what set if costs the circuit.\n\nThere are 5 tests total, one for each choice you make.",
  c1Hints: [
    "Keep three constraints in mind. Choose a free kind. Make sure each register is named by the field every instruction uses for it. Set the cost against what it saves.",
    "Do not choose kind 9. It is free in the course's machine, but in your copy it holds the call through a register. That instruction is already taken.",
    "Every instruction that writes a register names it in Y, digit 3. Because of this, the register file's write address needs no selector.",
    "The condition is the job digit, like a branch's, so the condition block built in Module 8 works for set if too. The program is the count of the cold rooms.",
    "Kind A, Y (digit 3) for the register field, the job digit for the condition, the count of the cold rooms for the program, and a new source for register Y driven by a new control signal SET.",
  ],
  writeDecoderLead: "Add kind A to your copy's decoder.",
  c2Task:
    "Your starting text is your copy's decoder from Module 9's last lesson. Its inputs are K, J and C. Its outputs are the control signals, MEM, SET, STOP and CAUSED. The starting code declares SET and sets it to 0. It still refuses kind A.\n\nMake three changes. First, add an arm `4'hA:` to the `case`, setting WRITEY, OP1, OP0 and SET. Second, in the ILLEGAL term, stop refusing kind A. Third, refuse kind A's jobs 8 to F, just as kinds 1, 2 and 5 refuse theirs: add kind A to the term that refuses job bit 3.\n\nThe test suite has 262 tests. It covers every kind and job with the constant 0, and jobs 2 and 3 of kind 8 with three different constants. The starting code fails 16 tests. The first failure is \"K A, J 0\".",
  c2Hints: [
    "Kind A's settings are: WRITEY like a register job, subtract (OP1 and OP0) like a branch, and SET at 1.",
    "Do not leave kind A's jobs 8 to F legal. The term that refuses job bit 3 for kinds 1, 2 and 5 must refuse it for kind A as well.",
    "A smaller example, the arm:\n`4'hA: begin WRITEY = 1'b1; OP1 = 1'b1; OP0 = 1'b1; SET = 1'b1; end`",
    "Part of the answer, ILLEGAL's first term:\n`(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9) & (K != 4'hA))`",
    "The whole answer: the arm in hint 3, the term in hint 4, and\n`(((K == 4'h1) | (K == 4'h2) | (K == 4'h5) | (K == 4'hA)) & J[3])`.",
  ],
  setFaultsLead:
    'The fault lab runs the block through four test cases. Case 1: set if with MET at 1. Case 2: set if with MET at 0. Case 3: a register job. Case 4: a load. The test values are: HR holds `42` (which is 66 in decimal), HM holds `7`, and PC + 4 is `10`.\n\nChoose one of two faults to inject:\n- "SET stuck at 0": the new input is never chosen;\n- "SET stuck at 1": it is chosen for every instruction.\n\nRun the tests with your chosen fault. Before you do, predict which of the four cases each fault breaks.',
  faultSetLow:
    "**SET stuck at 0**.\n\nBoth set if cases give `42` (the value of HR), not 1 or 0. The register job works right: it gives `42`. The load works right: it gives `7`. This is how your copy worked before you added set if to the datapath: set if would write RA - RB.",
  faultSetHigh:
    "**SET stuck at 1**.\n\nThe set if cases work right. The register job gives 1, not `42`. The load gives 1, not `7`. When SET is stuck at 1, every instruction that writes register Y writes its condition (1 if true, 0 if false) instead of what it should write.",
  explanation:
    "The decoder adds a column for kind A. Its line is the new control signal SET. WRITEY, OP1 and OP0 take kind A into their ORs. The checks learn kind A and refuse its jobs 8 to F.\n\nThe controller needs no change. Set if takes a register job's 4 edges. At WRITE, MET is worked out again from the held words.\n\nThe datapath has a new source for the word register Y takes: MET as a word, chosen by SET. In the machine's text it is `if (SET) YIN = {63'h0, MET};`.\n\nThe instruction set changed in your copy only. The course's machine still refuses kind A, with cause `21`.",
  generalisation:
    "A new instruction can need four things: a column in the decoder, a place in the checks, states of its own, and new parts in the datapath.\n\nThe call through a register needed the first two. Set if needed three: a column, the checks, and a new source for register Y.\n\nA shift or a multiplication would need a new part beside the ALU.\n\nEvery program written for your copy before kind A still runs on it: no old word changed its meaning.",
  writeMachineLead: "Join SET to the datapath and run the whole machine.",
  c3Task:
    "The text is your whole copy of Module 9's machine, with kind A in its decoder: the module `machine`, the controller and the decoder.\n\nThe decoder gives SET, but the module `machine` does not use it, so set if writes HR, the subtraction.\n\nMake three changes in the module `machine`:\n- declare SET among the control signals;\n- join the decoder's SET port: `.SET(SET)`;\n- in the block that chooses YIN, add a line so that when SET is 1, YIN takes MET as a word, `{63'h0, MET}`.\n\nThe memory holds the program that counts the cold rooms with set if.\n\nThe tests reset the machine, check the state and the PC after every edge of every instruction, then HALT and the display, 1, at the stop. There are 33 tests.\n\nThe start fails 1: at the stop it displays -34, not 1.",
  c3Hints: [
    "The idea: the decoder already raises SET. The datapath must give register Y the condition when it does.",
    "A common mistake: writing `YIN = MET;`. MET is 1 bit and YIN is 64, so the text does not elaborate. Put 63 zeros in front of MET.",
    "A smaller example, the decoder's port: `.SET(SET)` beside `.MEM(MEM)`.",
    "Part of the answer, after the line `if (CALL) YIN = PC4;`: `if (SET) YIN = {63'h0, MET};`",
    "The whole answer: SET added to the line that declares STOP and the other control signals; the port in hint 3; the line in hint 4.",
  ],
  reflection:
    "You designed, justified and built an instruction. Your copy runs it; the course's machine still refuses kind A.\n\nModule 10 asked what a program may rely on: the instruction set, each instruction's layout and what it does to the parts a program can see.\n\nEvery program so far was given to you as words and transfers. Writing a longer program word by word is slow, and a wrong digit is easy to make.\n\nHow could you write programs in a form a person reads, and let a tool make the words?",
  modelVsReality:
    "Your kind A lives in your copy of the machine's text only.\n\nA maker who adds an instruction makes a new chip. Programs that use the new instruction need that chip; the older chips refuse it, as the course's machine refuses kind A.",
} as const;
