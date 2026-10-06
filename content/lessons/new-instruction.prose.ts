// Copyright © 2026 Christopher Snow

// The words of the lesson new-instruction.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-9-control.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 4 ended with a question: what would the machine need to run a call through a register? In that instruction, RY ← PC + 4 and PC ← RA + c. Which parts of the machine would have to change? In this lesson you add it to your copy of the machine, end to end. How much of the machine must change for one new instruction?",
  motivation:
    "This instruction does two things at its last edge:\n- RY ← PC + 4, like a call: register Y keeps the address of the next instruction;\n- PC ← RA + c, like a jump: the PC takes the address from a register.\n\nA call goes to PC + 4c, a place fixed when the program is written. This instruction goes to the address in RA, so the program can choose the place while it runs.\n\nIt takes kind 9, job 0. Kind 9 is the first kind the machine leaves free.\n\nFor `R15 ← PC + 4, PC ← R4 + 0`, the word is `9040F000`: kind 9, job 0, A is R4, B is R0, Y is R15, constant 0.",
  callAndJumpLead:
    "The table shows the decoder's columns for a call (kind 6) and a jump (kind 7).\n\nA call sets WRITEY and CALL: register Y takes PC + 4.\n\nA jump sets BCONST, OP1 (add) and JUMP: the PC takes the ALU's result, RA + c.",
  prediction:
    'The figure runs a program with the new instruction in a machine that already has it. Four edges have passed: R4 ← `00C` is done.\n\nThe PC is `004`: the new instruction, `9040F000`.\n\nChoose an answer and press "Check my prediction". The figure then shows its tables and the "Clock edge" button.',
  p1Question:
    "The PC is `004`, the call through R4. How many edges does it take, from its fetch to the edge where the PC moves on?",
  p1Explain:
    "It takes 3 edges, as a call does:\n- FETCH: IR ← memory[PC];\n- READ: HA ← R4, HB ← R0;\n- WRITE: R15 ← PC + 4 (which is `008`), and PC ← HA + c (which is `00C`).\n\nThe decoder sets CALL, so the controller moves from READ to WRITE.\n\nIt needs no ALU edge. The ALU is gates. From the READ edge on, HA holds R4 and the constant is in IR, so the ALU's result is ready by the WRITE edge.\n\nA jump also takes the PC from the ALU at the first edge after READ. For a jump that edge is in ALU; here it is in WRITE.",
  chooseLead:
    'The office chooses at run time which room\'s reading the display shows. R4 holds the address of the routine to call.\n\n- `000` R4 ← `00C`, the address of showA\n- `004` `9040F000`: R15 ← PC + 4, PC ← R4 + 0\n- `008` stop\n- `00C` showA: R2 ← memory[`7D8`] (room A)\n- `010` memory[`7C0`] ← R2 (the display)\n- `014` `70F00000`: jump, PC ← R15\n- `018` showB: R2 ← memory[`7E0`] (room B)\n- `01C` memory[`7C0`] ← R2\n- `020` jump, PC ← R15\n\nWith R4 ← `018` instead, the same call would run showB.\n\nPress "Clock edge" or "Run until it stops", and watch the views of each edge.',
  chooseAfter:
    "The program stops after 21 edges. The display shows -184, room A's reading.\n\nR15 holds `008`, the address after the call.\n\nThe call through R4 takes 3 edges. The jump back at `014` takes 3, and returns to `008`, the stop.",
  construction:
    "The datapath needs no new parts. The block \"word for Y\" already gives PC + 4 when CALL is 1. The next PC is already the ALU's result when JUMP is 1. The ALU already adds RA and the constant for a jump.\n\nThe controller needs no change. The new instruction sets CALL, so the controller's call sequence applies unchanged.\n\nThe decoder is the only place that changes:\n- Add a column of signals for kind 9 that combines the call's and jump's signals.\n- Kind 9, job 0 is now an instruction.\n- Kind 9's other jobs are illegal.",
  writeDecoderLead: "Add kind 9 to the decoder.",
  c1Task:
    "The text is the whole decoder from lessons 1 and 2. It has three inputs: K, J and C. It outputs the twelve control signals, MEM (a load or a store), STOP and CAUSED.\n\nMake three changes:\n- Add an arm `4'h9:` to the case, setting the signals kind 9 needs.\n- In ILLEGAL's first term, stop refusing kind 9.\n- In the calls' and jumps' term, refuse kind 9 with any job but 0.\n\nThe test suite covers every kind and job with constant 0, jobs 2 and 3 of kind 8 with three constants, and kind 9 with constant `008`. That is 263 tests in total. The starting code fails 17 of them. The first is \"K 9, J 0\".",
  c1Hints: [
    "Kind 9's column is the call's column and the jump's column together.",
    "A common mistake: leaving BCONST at 0. Then the ALU adds RB, not the constant, and the PC takes RA + RB.",
    "The arm: `4'h9: begin WRITEY = 1'b1; BCONST = 1'b1; OP1 = 1'b1; CALL = 1'b1; JUMP = 1'b1; end`",
    "The first term of ILLEGAL: `(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9))`.",
    "The whole change: the arm in hint 3, the term in hint 4, and the calls' and jumps' term:\n`(((K == 4'h6) | (K == 4'h7) | (K == 4'h9)) & (J != 4'h0))`",
  ],
  callFaultsLead:
    "The figure runs the program that chooses a room, in a machine with the new instruction drawn. In the decoder, CALL is an OR of kind 6's line and kind 9's line. JUMP is an OR of kind 7's line and kind 9's line.\n\nIn the first fault, \"orCall made an AND\", CALL is kind 6's line AND kind 9's line, which is 0 for every kind. In the second fault, \"orJump made an AND\", JUMP is kind 7's line AND kind 9's line, also 0 for every kind.\n\nChoose a fault and press \"Run until it stops\". Before you do, say what you think R15 will hold.",
  callFaultsOutcomes:
    "**orCall made an AND**\n\nThe new instruction is no longer a call. From READ it goes to ALU, then WRITE: 4 edges. Without CALL, register Y takes HR instead of PC + 4. R15 takes `00C`, the routine's own address. The PC takes RA + c, which is `00C`. showA runs and the display shows -184.\n\nshowA's jump goes back to R15, `00C`, so showA runs again, for ever. \"Run until it stops\" gives up.\n\n**orJump made an AND**\n\nThe PC no longer takes the ALU's result. It takes the call's target, PC + 4c. With c at 0 that is `004`, the instruction itself. R15 takes `008` at every pass. The call runs again, for ever. The display shows 0.",
  explanation:
    "A new instruction is one column in the decoder and two changes to its checks.\n\nIn the drawn decoder, kind 9 has a line, KIND9. Kind 6's line is KIND6. Kind 7's line is KIND7. CALL and JUMP are OR gates. CALL is KIND6 OR KIND9. JUMP is KIND7 OR KIND9. KIND9 also joins the ORs of WRITEY, BCONST and OP1.\n\nWhen CALL and JUMP are both 1, register Y takes PC + 4. The PC takes the ALU's result. In the machine's text, `if (JUMP) NEXT = RESULT;` comes after the line for CALL, so JUMP wins. The controller reads CALL at READ and goes to WRITE, as for a call.",
  newColumnLead:
    "The table is read off the drawn decoder with the new instruction. Kind 9's column has every 1 that the call's column has, and every 1 that the jump's has.",
  generalisation:
    "A new instruction can need four things: a column in the decoder, a place in the checks, its states, and new parts in the datapath. This one needed only the first two. Its transfers were ones the machine already made, and its edges were the call's.\n\nAn instruction the ALU cannot do needs more. Module 7's ALU does no shifts. A shift instruction would need a new part in the datapath.\n\nKinds A to F stay free in the course's machine. Module 10 asks how to choose what to put there.",
  newEdgesLead:
    "The table is read off the decoder with the new instruction, and the controller. A call and the new instruction take FETCH, READ, WRITE. A jump takes FETCH, READ, ALU. All three take 3 edges.",
  writeMachineLead: "Add kind 9 to the whole machine's text, and run it end to end.",
  c2Task:
    "The text is the whole machine: the module `machine`, the controller and the decoder. The machine uses the course's modules for the register file, the ALU, the condition, the memory and the stop logic.\n\nThe start is this module's machine, which refuses kind 9 as an illegal instruction.\n\nMake the decoder changes of the last challenge in the machine's decoder.\n\nThe memory holds the program that chooses a room.\n\nThe tests reset the machine, then check the state and the PC after every edge of every instruction. During the call a reset rises and falls while CLK is 1. At the stop they check HALT and the display, -184. The challenge has 23 tests.\n\nThe start fails 17 tests. The first failure is \"004, edge 2 (READ): WRITE after it\": the machine halts at kind 9.",
  c2Hints: [
    "Only the decoder module changes. The module `machine` and the controller already handle a word with CALL and JUMP both at 1.",
    "A common mistake: sending kind 9 through ALU in the controller. Then it takes 4 edges, and the tests expect 3.",
    "In the decoder's `case`, after kind 7's arm:\n`4'h9: begin WRITEY = 1'b1; BCONST = 1'b1; OP1 = 1'b1; CALL = 1'b1; JUMP = 1'b1; end`",
    "In ILLEGAL, the first term becomes `(K == 4'h0) | (K[3] & (K != 4'h8) & (K != 4'h9))`.",
    "The whole change, in the decoder: the arm in hint 3, the term in hint 4, and the calls' and jumps' term `(((K == 4'h6) | (K == 4'h7) | (K == 4'h9)) & (J != 4'h0))`.",
  ],
  reflection:
    "You added an instruction to the machine: a column in the decoder and two changes to its checks. The simulator ran it end to end, edge by edge.\n\nTwo machines now run the same instructions. Module 8's takes one edge for each. This module's takes 3 to 5, and keeps one memory port. Both leave the same registers and memory after every instruction.\n\nWhich instructions a machine has is a choice. So is how their words are laid out. Why are the course's instructions the ones they are? How should the free kinds be used?",
  modelVsReality:
    "A chip cannot change once it is made. A new instruction means a new chip.\n\nPrograms written for the old chip must still run on the new one. So a maker gives new instructions kinds the old chip refused, as kind 9 was.\n\nYour kind 9 lives only in your copy of the machine's text. The course's machine still refuses kind 9, with cause `21`.",
} as const;
