// Copyright © 2026 Christopher Snow

// The words of the lesson design-an-instruction.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-10-instruction-set/briefs, brief 5R), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 4 asked which instruction you would add, and how you would show it is worth its cost. This lesson answers both for one instruction, set if less: it puts 1 in a register when one register's word is less than another's, and 0 when it is not. You design it, justify it with a program it shortens, and build it into your copy of Module 9's machine, where kind 9 holds the call through a register.\n\nWhat must the design decide?",
  motivation:
    "A program that compares and keeps the answer as a number needs a branch around each count. The count of cold rooms counts how many of two rooms are colder than the limit, -200. With branches, a branch skips each room's count when the room is not colder.\n\nOther programs could be shortened too: 7 × 5 by a loop (lesson 4), and the colder room (Module 8), which shows the lower of two readings.\n\nA design answers four questions: is its code free? Does every field keep the place and meaning every instruction gives it? What does it save, counted on a program? What does it cost the circuit? Apply them as lesson 4 did.",
  needLead:
    'The figure runs the count of cold rooms, written with branches, on the course\'s machine. Room A reads -184 and room B -250.\n\nPress "Run the programs".',
  needAfter:
    "It displays 1: room B, at -250, is colder than -200, and room A, at -184, is not. It has 10 instructions and runs 9.",
  designLead: "Design set if less against the four questions.",
  c1Task:
    "Design set if less: one instruction that puts 1 in a register when one register's word is less than another's, and 0 when it is not.\n\nMake five choices, each tied to a question: the kind (is its code free? choose from 0, 5, 9 or A); the field that names the register written, and where the condition comes from (does every field keep its place and meaning?); the program it shortens (what does it save?); and what it costs the circuit.\n\nThere are 5 tests, one for each choice.",
  c1Hints: [
    "The idea: answer each question as lesson 4 did, for this instruction.",
    "A common mistake: kind 9. It is free on the course's machine, but your copy's call through a register holds it.",
    "A smaller example: the call through a register (Module 9's lesson 5) took a free kind, named the register it writes in Y, and cost a decoder column and the checks.",
    "Part of the answer: every instruction that writes a register names it in Y, digit 3, so the register file's write address needs no selector. A branch's condition is its job digit.",
    "The whole answer: kind A; Y, digit 3; the job digit, as a branch's; the count of cold rooms; a new source for register Y's word, with a control signal to choose it.",
  ],
  prediction:
    "The course's design: set if less is kind A, free in your copy. Its job is a branch's condition: 0 always, 1 never, 2 equal, 3 differs, 4 and 5 less and not less read unsigned, 6 and 7 less and not less read signed. Jobs 8 to F are refused.\n\nIt reads A and B and writes Y; the constant is unused. R5 ← 1 if R2 < R1, read signed, else 0 is `A6215000`: kind A, job 6, A is R2, B is R1, Y is R5.\n\nIt subtracts RB from RA, as a branch does, and writes register Y, as a register job does. In Module 9's machine a register job takes FETCH, READ, ALU and WRITE; a branch takes FETCH, READ and ALU.\n\nThe figure runs the decoder's signals for kind A through the controller. Choose an answer and press \"Check my prediction\"; the figure then shows each kind's edges.",
  p1Question: "How many edges does set if take in your copy of Module 9's machine?",
  p1Explain:
    "Set if takes 4 edges, FETCH, READ, ALU, WRITE, as a register job. The decoder gives WRITEY and not MEM or CALL, so the controller goes from READ to ALU, then to WRITE. The controller does not change.\n\nAt the WRITE edge the condition is worked out again: HA, HB and the IR keep their words from READ, so the ALU's flags and MET are the same as at ALU. Register Y takes MET as a word.",
  shorterLead:
    'The figure runs the count of cold rooms two ways and shows R5 and R6. The first uses branches, on the course\'s machine. The second uses set if on your copy: R5 ← 1 if R2 < R1, R6 ← 1 if R3 < R1, read signed, then R4 ← R5 + R6. Press "Run the programs".',
  shorterAfter:
    "Both display 1. The branches: 10 instructions written, 9 run. Set if: 8 written, 8 run, and no branch, so the same instructions run whatever the readings. R5 holds 0 (room A is not colder) and R6 holds 1.",
  yWordLead:
    "The figure shows the block that chooses what word register Y takes. In Module 9, Y takes HR, the held result; or HM, the word a load reads when LOAD is 1; or PC + 4 when CALL is 1. Set if adds a source: MET, the condition's one bit, which the block met-word widens to a 64-bit word, 63 zeros above MET. A new control signal, SET, chooses that word over every other when it is 1. The figure opens with HR at `42`, HM at `7` and PC + 4 at `10`, all hexadecimal. Press LOAD, CALL, SET and MET and watch YIN.",
  yWordAfter:
    "When SET is 1, YIN shows MET as a 64-bit word: 1 (in the lowest bit) when the condition is true, 0 when it is false, regardless of what HR, HM, LOAD and CALL hold. The SET selector comes last in the chain, so it overrides both LOAD and CALL.",
  newColumnLead:
    "The table shows the decoder drawn with kind A beside the columns for a register job and a branch. Kind A's column gives WRITEY as a register job does, OP1 and OP0 for subtract as a branch does, BRANCH 0, and SET 1.",
  construction:
    "The decoder half applies Module 9's lesson 5 to kind A. The challenge says what the decoder must do for the design; the hints give the edits.",
  writeDecoderLead: "Add kind A to your copy's decoder.",
  c2Task:
    "Your starting text is your copy's decoder from Module 9's last lesson. Its inputs are K, J and C; its outputs are the control signals, MEM, SET, STOP and CAUSED. It declares SET, gives it 0, and still refuses kind A.\n\nThe decoder must give kind A WRITEY, subtract (OP1 and OP0) and SET; stop refusing kind A; and refuse kind A's jobs 8 to F, as it refuses kinds 1, 2 and 5's. ILLEGAL is an OR of six terms. Its first term refuses kind 0 and the kinds with no column; its second refuses job bit 3 for kinds 1, 2 and 5.\n\nThere are 262 tests in total: every kind and job with the constant 0, and kind 8's jobs 2 and 3 with three more constants. The start fails 16. The first failure is \"K A, J 0\".",
  c2Hints: [
    "The idea: kind A writes Y as a register job does, subtracts as a branch does, and raises SET.",
    "A common mistake: leaving kind A's jobs 8 to F legal. ILLEGAL's second term must refuse job bit 3 for kind A too.",
    "A smaller example, kind 9's arm from Module 9's lesson 5:\n`4'h9: begin WRITEY = 1'b1; BCONST = 1'b1; OP1 = 1'b1; CALL = 1'b1; JUMP = 1'b1; end`",
    "Part of the answer, ILLEGAL's first term:\n`(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9) & (K != 4'hA))`",
    "The whole answer: the arm `4'hA: begin WRITEY = 1'b1; OP1 = 1'b1; OP0 = 1'b1; SET = 1'b1; end`, the term in hint 4, and `(((K == 4'h1) | (K == 4'h2) | (K == 4'h5) | (K == 4'hA)) & J[3])`.",
  ],
  setFaultsLead:
    'The fault lab runs the block for register Y\'s word, drawn with the new source, through four cases: set if with MET at 1; set if with MET at 0; a register job; a load. HR holds `42` (66), HM `7` and PC + 4 `10` (16), all hexadecimal. Two faults: SET stuck at 0, the new source never chosen; SET stuck at 1, chosen for every instruction. Predict which cases each fault breaks, then press "Run checks".',
  faultSetLow:
    "**SET stuck at 0**\n\nBoth set if cases give `42`, HR, not 1 or 0. The register job gives `42` and the load `7`, as they should. The block then works as it did before the new source. Set if would write HR, the subtraction.",
  faultSetHigh:
    "**SET stuck at 1**\n\nThe set if cases are right. The register job gives 1, not `42`, and the load 1, not `7`. Every instruction that writes register Y writes the condition instead.",
  explanation:
    "The decoder gains a column for kind A, with the new line SET. WRITEY, OP1 and OP0 take kind A into their ORs. ILLEGAL learns kind A and refuses its jobs 8 to F.\n\nThe controller does not change. Set if takes a register job's 4 edges: FETCH, READ, ALU and WRITE. At the WRITE edge, MET is worked out again from the held words.\n\nThe datapath gains a source for the word register Y takes. MET is widened by met-word and chosen by SET.\n\nThe instruction set changed in your copy only. The course's machine still refuses kind A, with cause `21`.",
  conditionUsesLead:
    "The condition block produces MET from J and the flags. MET serves two paths: one for a branch to choose the next PC, one for set if to choose register Y's word. The drawing opens with PC4 at `10`, TARGET at `40`, and HR at `42`, all hexadecimal. Job 0 is met always. Set J's bits, press BRANCH, SET and the flags, then read NEXT and YIN in the table below the drawing.",
  generalisation:
    "Set if reads its job digit exactly as a branch does. The condition block takes J and the ALU's flags and gives MET for both kinds. The condition block needs no change.\n\nA field that keeps one meaning in every kind that uses it lets a new instruction reuse a part whole. A field that meant something else in the new kind would need a selector in front of that part.",
  writeMachineLead: "Join SET to the datapath and run the whole machine.",
  c3Task:
    "The text is your whole copy of Module 9's machine, with kind A in its decoder: the module `machine`, the controller and the decoder. The decoder gives SET, but the module `machine` does not use it, so set if writes HR, the subtraction.\n\nIn the module `machine`: declare SET among the control signals; join the decoder's SET port; and in the block that chooses YIN, make YIN take MET as a 64-bit word when SET is 1.\n\nThe memory holds the count of cold rooms with set if, run four times from a reset with different readings. Room B colder: the tests check the state and PC after every edge, then HALT and the display, and expect 1. Both colder expect 2, neither 0, and room A at the largest word, whose subtraction overflows, expects 1.\n\nThere are 39 tests in total. The start fails 4: its first run displays -34, not 1.",
  c3Hints: [
    "The idea: the decoder already raises SET. The datapath must give register Y the condition when it does.",
    "A common mistake: `YIN = MET;`. MET is 1 bit and YIN is 64. Put 63 zeros in front of MET.",
    "A smaller example: `{3'b000, B}` makes a 4-bit word from one bit B, three zeros above it.",
    "Part of the answer, after the line `if (CALL) YIN = PC4;`: `if (SET) YIN = {63'h0, MET};`",
    "The whole answer: SET added to the line that declares STOP and the other control signals; the port `.SET(SET)` beside `.MEM(MEM)`; the line in hint 4.",
  ],
  reflection:
    "You designed, justified and built an instruction.\n\nModule 10 asked what a program may rely on: the instruction set, each instruction's layout, and what it does to the parts a program can see. Every program so far was given as words and transfers.\n\nWriting a longer one word by word is slow, and a wrong digit is easy to make. How could you write programs in a form a person reads, and let a tool make the words?",
  modelVsReality:
    "On the course's machine a program cannot ask which instructions it has.\n\nA real machine often has a register a program can read. Through it, a program learns which added instructions this chip has. So one program can use a new instruction where it exists and fall back to older instructions where it does not.",
} as const;
