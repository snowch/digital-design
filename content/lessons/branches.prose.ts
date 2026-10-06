// Copyright © 2026 Christopher Snow

// The words of the lesson branches.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-8-datapath.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Every program so far runs its instructions in order, from `000` to its `stop`. The office wants the lower of the two rooms' readings on the display. But which instruction runs next must depend on what the program finds when it compares the readings. How can the next instruction depend on a comparison?",
  motivation:
    "A **branch** is an instruction that chooses the next instruction (kind 5). It compares RA with RB: the ALU works out RA - RB, and the four flags say how they compare.\n\nIf the condition is met, PC ← PC + 4c; if not, PC ← PC + 4. The constant c counts instructions from the branch itself: c = 1 is the next one, c = -3 is three back.\n\nThe job digit selects the condition:\n\n- 0 always\n- 1 never\n- 2 A equals B\n- 3 A differs from B\n- 4 A less than B, unsigned\n- 5 not less, unsigned\n- 6 A less than B, signed\n- 7 not less, signed\n\nEqual means ZERO is 1. Less unsigned means COUT is 0. Less signed means MINUS XOR OVER is 1.",
  prediction:
    'This program checks which room is colder:\n\n- `000` `380027D8`: R2 ← memory[`7D8`] (room A\'s reading)\n- `004` `380037E0`: R3 ← memory[`7E0`] (room B\'s reading)\n- `008` `56230002`: if R2 < R3, read signed, PC ← `010`\n- `00C` `15032000`: R2 ← R3\n- `010` `480207C0`: memory[`7C0`] ← R2 (display)\n- `014` `84000000`: stop\n\nThe figure shows the state after two edges. R2 holds -184 and R3 holds -250, and PC is `008`, at the branch instruction.\n\nTwo new blocks appear: "condition" calculates MET (1 when the job\'s condition holds, 0 otherwise); "next PC" works out NEXT, what PC will be. The decoder\'s BRANCH output is 1.\n\nMake a prediction and press "Check my prediction". Then the "Clock edge" button appears.',
  p1Question:
    "PC is `008`, the branch, with R2 at -184 and R3 at -250. What is PC after the next edge?",
  p1Explain:
    "PC becomes `00C`. The branch is not taken.\n\nThe ALU computes R2 - R3: -184 - (-250) = 66. MINUS is 0 and OVER is 0, so MINUS XOR OVER is 0. R2 is not less than R3, so MET is 0. Therefore NEXT = PC + 4 = `00C`.\n\nAt the next edge, the program runs instruction `00C`, and R2 becomes -250 (room B's reading). The display shows -250 tenths of a degree, or -25.0 degrees. Room B is colder.\n\nIf R2 were less than R3, PC would go to `010` instead.",
  sumLead:
    'This program adds 5 + 4 + 3 + 2 + 1, with a branch that loops back:\n\n- `000` R1 ← 5\n- `004` R2 ← 0\n- `008` R0 ← 0\n- `00C` `12212000`: R2 ← R2 + R1\n- `010` `17101000`: R1 ← R1 - 1\n- `014` `53100FFE`: if R1 differs from R0, PC ← PC + 4 × (-2), which goes to `00C`\n- `018` memory[`7C0`] ← R2 (display)\n- `01C` stop\n\nThe constant `FFE` is -2, read as a signed number. It is the offset that sends PC back two instructions.\n\nThe table "Buses" shows RESULT (ALU output), PC4 (PC + 4), and NEXT (the next PC value). Watch NEXT at each branch to see where the program goes. You can press "Clock edge" to step through one edge at a time, or "Run until it stops" to run the whole program.',
  sumAfter:
    "The program stops after 20 edges, and the display shows 15: the sum of 5 + 4 + 3 + 2 + 1.\n\nThe branch is taken four times, while R1 is 4, 3, 2 and 1. When R1 reaches 0, it equals R0, the condition fails, the branch is not taken, and the program runs `018` to display the result.\n\nA branch does not write a register: the decoder sets WRITEY to 0.",
  construction:
    "The condition block reads the job digit J and the four flags: ZERO, MINUS, COUT and OVER. It produces MET. The job digit chooses one of eight answers: each is one flag, its NOT, a gate of two flags, 1 or 0. The challenge writes it with a `case` on J.",
  writeConditionLead: "Write the condition block: the job digit and the four flags in, MET out.",
  c1Task:
    "- Write a module called `condition`. Inputs: J (4 bits), ZERO, MINUS, COUT and OVER. Output: MET.\n- MET for each job: 0 gives 1; 1 gives 0; 2 gives ZERO; 3 gives NOT ZERO; 4 gives NOT COUT; 5 gives COUT; 6 gives MINUS XOR OVER; 7 gives NOT (MINUS XOR OVER).\n- The starting text has the `case` with job 0 and a `default` of 0. Add jobs 1 to 7.\n- Use `module`, ports, `logic`, multi-bit signals, `assign`, selects, the bitwise operators, `always_comb` and `case`.\n- There are 32 tests: each job 0 to 7, with the flags of A - B for four pairs: -184 and -250, -250 and -184, 5 and 5, and 1 and -1.",
  c1Hints: [
    "Each job is one line in the `case`, with MET set to one flag or a combination of flags.",
    "A common mistake: using COUT for less unsigned. A - B carries out when A is not less than B. So less unsigned is NOT COUT.",
    "`4'h2: MET = ZERO;` is the test for equal.",
    "`4'h6: MET = MINUS ^ OVER;` tests less signed. Its opposite, `4'h7: MET = ~(MINUS ^ OVER);`, tests not less signed.",
    "The whole `case`:\n\n```\nalways_comb\n  case (J)\n    4'h0: MET = 1'b1;\n    4'h1: MET = 1'b0;\n    4'h2: MET = ZERO;\n    4'h3: MET = ~ZERO;\n    4'h4: MET = ~COUT;\n    4'h5: MET = COUT;\n    4'h6: MET = MINUS ^ OVER;\n    4'h7: MET = ~(MINUS ^ OVER);\n    default: MET = 1'b0;\n  endcase\n```",
  ],
  branchFaultsLead:
    'This circuit runs the loop that adds 5 + 4 + 3 + 2 + 1. Pick one of two faults. In the first, "MET stuck at 1", the condition block gives 1 for every branch. In the second, "MET stuck at 0", it gives 0. Press "Run until it stops". Before you do, say what you think the display will show.',
  branchFaultsAfter:
    '- "MET stuck at 1": The branch is taken every time, even when R1 equals R0. The loop never ends, so R1 counts down past 0 into negative numbers. "Run until it stops" gives up after 500 edges. No store runs, so the display stays at 0.\n- "MET stuck at 0": The branch is never taken. The loop runs once. The display shows 5. R1 holds 4. The machine stops after 8 edges.\n- Both faults leave every other instruction unchanged. Only the choice of the next instruction breaks.',
  explanation:
    'The block "next PC" chooses NEXT from three words: PC + 4; the target, PC + 4c, where c is the widened constant and 4c is c times 4; and RESULT, the ALU\'s output word.\n\nNEXT is the target when the instruction is a branch and MET is 1. Otherwise NEXT is PC + 4.\n\nLike every other instruction, a branch does its work in one edge. The decoder sets BRANCH to 1. The ALU subtracts for every branch, and the condition block reads its flags. Before the edge, the next PC is worked out. At the edge, it is written into PC.',
  oneInstructionLead:
    'This figure runs the colder-room program to `004`, where R3 ← memory[`7E0`] waits. R2 is -184 and R3 is X.\n\nPress "Clock edge" once. That edge finishes the load and brings in the branch. The steps after it are the branch\'s work.\n\nBelow the drawing, "The last edge, step by step" lets you move through each step of the settle after that rising edge. Use the slider or press "Back a step", "Next step" or "Last step".\n\nAt each step, the drawing and the tables show the values at that step. The line under the slider names the buses that changed at it.\n\nStep 0 is the moment the clock rises, before anything has changed.',
  oneInstructionAfter:
    "At step 1, R3 takes -250, the load's word.\n\nAt step 2, PC becomes `008`. At step 4, IR carries `56230002`, the branch.\n\nAt step 7, QA and QB carry R2's and R3's words. At step 9, the decoder's BRANCH becomes 1.\n\nHALT is 1 at step 13 and 0 again at step 14.\n\nFrom step 18, the ALU's RESULT changes as the subtraction's carry runs through the 64 slices. It settles at 66 at step 137. MINUS settles at 0 at step 138.\n\nMET changes many times and settles at 0 at step 144. NEXT settles at `00C` at step 154. The settle ends at step 155.\n\nNothing writes during these steps. The next edge writes PC with NEXT.",
  generalisation:
    "Two more instruction kinds reach beyond the next instruction. A call (kind 6) stores the next instruction's address in register Y (RY ← PC + 4) and goes to PC + 4c. A jump (kind 7) goes to RA + c, the ALU's RESULT. To return from a call, jump to the register that holds the address: `goto R15` returns to the instruction after a call that saved its address in R15.\n\nA call writes Y with the next instruction's address. The block that chooses what the register file writes is the lesson-4 selector pickLoad. For a call, it now takes PC + 4. The block grew: in the drawing it is \"word for Y\", which holds pickLoad and a second selector for the call. A jump can reach any address, but if the target is outside the ROM or not a multiple of 4, the machine stops at its fetch with cause 11 or 12.",
  callLead:
    "This program calls a loop that adds 3 + 2 + 1, and returns.\n\n- `000` R2 ← 0\n- `004` R1 ← 3\n- `008` R0 ← 0\n- `00C` `6000F003`: call. R15 ← PC + 4, which is `010`. PC ← PC + 4 × 3, which is `018`.\n- `010` memory[`7C0`] ← R2\n- `014` stop\n- `018` R2 ← R2 + R1\n- `01C` R1 ← R1 - 1\n- `020` if R1 differs from R0, PC ← `018`\n- `024` `70F00000`: jump. PC ← R15.\n\nThe table shows R1, R2 and R15, and the buses RESULT, PC4, NEXT and YIN.",
  callAfter:
    "The program runs for 16 edges and then stops. R15 holds `010`, the address after the call. The display shows 6, the sum 3 + 2 + 1. The jump at `024` takes PC back to `010`.",
  writeNextLead: "Complete the datapath's text: choose the next PC.",
  c2Task:
    "The text is the course's whole datapath, the module `datapath`: every part of this module's lessons. The starting assignment is `assign NEXT = PC4;`, so every instruction goes to the next. Replace it so that:\n\n- NEXT is TARGET when BRANCH and MET are both 1, or when CALL is 1;\n- NEXT is RESULT when JUMP is 1;\n- NEXT is PC4 otherwise.\n\nTARGET is already worked out: `assign TARGET = PC + {WIDE[61:0], 2'b00};`, the constant times 4 added to PC. The ROM holds the call program above. The tests reset the machine and check PC after each of its 15 edges before the stop, then HALT and the display, 6, at the stop: 17 tests. You may use every construct the earlier challenges used.",
  c2Hints: [
    "Start NEXT at PC4, and let the other cases replace it in an `always_comb` block.",
    "A common mistake: taking the target for every branch. A branch goes to the target only when MET is 1.",
    "`if (JUMP) NEXT = RESULT;` is the jump's case.",
    "The branch and the call share the target: `if ((BRANCH & MET) | CALL) NEXT = TARGET;`",
    "The whole answer, in place of the assignment:\n\n```\nalways_comb begin\n  NEXT = PC4;\n  if ((BRANCH & MET) | CALL) NEXT = TARGET;\n  if (JUMP) NEXT = RESULT;\nend\n```",
  ],
  reflection:
    "The datapath is whole. It runs every instruction of kinds 1 to 7 and `stop`, one per edge. PC names each instruction. The ROM gives it. The register file and the ALU work on it. The memory reads or writes. The next-PC block chooses where to go next.\n\nYou wrote most of it as text: the digits, the widening, the selectors, PC, the checks, the condition and the next PC. The decoder is the block whose control signals you set by hand in the first two lessons. The datapath works, but how does the decoder work out those signals from K and J alone?",
  modelVsReality:
    "In this machine, every instruction takes one edge. The clock must wait for the slowest one. A load's path is the longest: PC, the ROM, the decoder, the register file, the ALU's add, the memory's read, and back to the register file. Module 9 splits instructions across several edges.\n\nIn the settle model, every gate takes one step. Real gates and wires take different times. A real circuit's passing values differ from the model's. A passing value is a value a signal takes for a few steps before it settles. Real circuits have them too. Registers take their words only at an edge. A passing value that settles before the next edge, with the setup time to spare (Module 4), does no harm.",
} as const;
