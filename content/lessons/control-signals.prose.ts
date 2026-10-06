// Copyright © 2026 Christopher Snow

// The words of the lesson control-signals.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-9-control.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    'Module 8 ended with a question: "The datapath works, but how does the decoder work out those signals from K and J alone?" In its first two lessons you set WRITEY and BCONST by hand for each instruction. From the third lesson the decoder set every signal, drawn closed. Which gates turn K and J into the twelve control signals?',
  motivation:
    "The part of a machine that works out its control signals is a **control unit**. In Module 8's machine, the control unit is the decoder alone. Every instruction takes one edge, so its signals depend only on K and J. Each kind needs its own set of signals. A load writes register Y, reads memory and gives the ALU the constant. A branch writes no register and subtracts. Some signals follow the job digit: for a register job, OP2 OP1 OP0 are the job's bits 2, 1 and 0.",
  signalsTableLead:
    "The table comes from the decoder's circuit. The figure runs it for each kind from 1 to 8, with every job that kind defines, and reads the outputs.\n\nOne column per kind. One row per control signal. A cell is 1, 0, or J3, J2, J1 or J0. Read down a column to see what one kind needs.",
  signalsTableAfter:
    "Read along a row to see which kinds an OR gate joins. WRITEY is 1 for kinds 1, 2, 3 and 6. BCONST is 1 for kinds 2, 3, 4 and 7.\n\nFor kinds 1 and 2, OP2, OP1 and OP0 are J2, J1 and J0: the job digit is the ALU's code.\n\nA load, a store and a jump use OP = `010` to add. A branch uses OP = `011` to subtract. For a load or a store, AZERO is J3 and BYTE is J0.\n\nKind 8 sets every signal to 0.",
  prediction:
    'The figure is the decoder. Its inputs are K, J and C, the constant; it sets every control signal from them. Only the checks block reads C. The instruction is a jump, kind 7, job 0: `PC ← RA + c`. Choose an answer and press "Check my prediction". The figure then shows the decoder\'s outputs.',
  p1Question: "For a jump, kind 7, what does the decoder set BCONST to?",
  p1Explain:
    "BCONST is 1. A jump goes to RA + c. The ALU works that out: A takes RA, B takes the constant, and the ALU adds. So the decoder sets BCONST to 1, and OP2 OP1 OP0 to `010`, add. With BCONST at 0, B would take RB, and the jump would go to RA + RB. A jump writes no register: WRITEY is 0. JUMP is 1, so the next PC is the ALU's result.",
  decoderOpenLead:
    'The figure is the decoder: press it to open it. It is Module 8\'s decoder, which also takes C, the constant. Only its checks read C; the next lesson opens them.\n\nIts blocks:\n\n- "kind lines" turns K into one line per kind, 1 to 8. Each line is 1 only for its kind.\n- "split" splits J into its bits J3, J2, J1 and J0.\n- "control signals" works out the twelve signals from the kind lines and the job\'s bits.\n- "checks" works out STOP and CAUSED.\n\nPress a block to open it. Press K\'s and J\'s pins to change the instruction. The figure starts with a subtract: kind 1, job 3.',
  decoderOpenAfter:
    "Inside \"kind lines\" are two of Module 3's 2-to-4 decoders, one on K3 K2 and one on K1 K0. An AND gate per kind joins one line from each. Kind 5, `0101`, is line 1 of the 2-to-4 decoder on K3 K2 AND line 1 of the 2-to-4 decoder on K1 K0.\n\nA kind line that is a control signal on its own carries the signal's name. Kind 3's line is LOAD, kind 4's STORE, kind 5's BRANCH, kind 6's CALL, kind 7's JUMP. The lines of kinds 1, 2 and 8 are KIND1, KIND2 and KIND8.\n\nInside \"control signals\", each other signal is an OR of kind lines, or an AND of a line with a job bit, or both.\n\n- JOBS is KIND1 OR KIND2: the two kinds of job. MEM is LOAD OR STORE.\n- WRITEY is an OR of JOBS, LOAD and CALL.\n- Where a signal follows the job, an AND gate joins a line with a job bit: OP1 is an OR that takes JOBS AND J1.\n\nFor the subtract, KIND1 and JOBS are 1. WRITEY is 1. OP2 OP1 OP0 are `011`, J's low bits.",
  construction:
    "The decoder works out two control signals from K, the instruction kind. WRITEY means register Y is written. BCONST means the ALU's B takes the constant. Write each signal as an OR of comparisons on K. Each kind's line is a comparison: `(K == 4'h3)` is 1 only for kind 3. An OR of the relevant kind lines gives the signal.",
  writeWritesLead: "Write WRITEY and BCONST from K.",
  c1Task:
    "The module `writes` has input K (4 bits) and outputs WRITEY and BCONST. It starts with both outputs at 0: `assign WRITEY = 1'b0;` and `assign BCONST = 1'b0;`. Replace each 0 assignment with an OR of comparisons on K, one comparison for each kind that needs the signal to be 1. The tests try all 16 values of K, from `0` to `F`. Kinds 0, 8, and 9 to F set neither signal to 1. Allowed: `assign` and the operators `==`, `|`, `&` and `~`.",
  c1Hints: [
    "Name the kinds that write register Y. Which kinds' ALU takes the constant?",
    "A common mistake: a jump writes no register. Its WRITEY is 0, though its BCONST is 1.",
    "One kind's line: `(K == 4'h6)` is 1 only for a call.",
    "`assign WRITEY = (K == 4'h1) | (K == 4'h2) | (K == 4'h3) | (K == 4'h6);`",
    "The whole answer:\n\n```\nassign WRITEY = (K == 4'h1) | (K == 4'h2) | (K == 4'h3) | (K == 4'h6);\nassign BCONST = (K == 4'h2) | (K == 4'h3) | (K == 4'h4) | (K == 4'h7);\n```",
  ],
  decoderFaultsLead:
    'The figure shows the decoder: press it, then its control signals block. Each fault breaks one gate, or one line into the block. For example, "orOp0 made an AND" means the OR gate for OP0 becomes an AND gate. OP0\'s OR joins JOBS AND J0 with BRANCH. Another example: "LOAD stuck at 0" keeps kind 3\'s line at 0. Choose a fault, then press "Run checks". The test instructions are one of each kind 1 to 7. Before you run them, predict which will fail.',
  decoderFaultsOutcomes:
    "**orOp0 made an AND**: Two test instructions fail on OP0. Subtract (kind 1, job 3) needs OP0 = 1 from JOBS AND J0. Branch (kind 5, job 6) needs OP0 = 1 from BRANCH. An AND of the two is 1 for neither, since no instruction is both kinds. The other five need OP0 = 0, and get it. A wrong gate breaks one signal for some kinds.\n\n**LOAD stuck at 0**: Only the load fails, affecting five outputs. WRITEY, LOAD, BCONST and OP1 all show 0. The cause shows `21`. With its kind line stuck at 0, kind 3 produces no 1 on any kind line, so the checks block treats it as an unknown instruction. A lost kind line breaks every signal of one kind.",
  explanation:
    "The decoder works like Module 5's next-state logic. Module 3's 2-to-4 decoders and an AND gate per kind make the kind lines, as Module 3's decoder made Module 5's state lines. Module 5's row was an AND of a state's line with the row's inputs; here, an AND of a kind's line with a job bit. Module 5's next-state bit was an OR of rows; here, a signal is an OR of kind lines and such ANDs.\n\nThe decoder has no register. Its signals change as soon as K or J changes, and they settle before the next edge.",
  generalisation:
    "This design works for any list of kinds. Each kind gets one line.\n\nAdding a kind adds one line and joins it to the gates of every signal that kind needs. No other kind's signals change. The checks block must learn the new kind too: the next lesson opens it.\n\nKinds 0 and 9 to F have no line, so every signal is 0 for them.\n\nA machine that takes several edges for one instruction needs signals that change from edge to edge. This module's third lesson adds them.",
  writeSignalsLead: "Write all twelve control signals as one `case` on K.",
  c2Task:
    "The module `signals` has inputs K and J (4 bits each) and outputs the twelve control signals: WRITEY, LOAD, STORE, BYTE, AZERO, BCONST, OP2, OP1, OP0, BRANCH, CALL, JUMP.\n\nIn an `always_comb` block, every signal is first set to 0. Then a `case (K)` arm per kind sets the signals that kind needs.\n\nThe start has the arms for kinds 1 and 2. Add the arms for kinds 3 to 7. Kind 8 needs no arm: every signal stays 0.\n\nA signal that follows the job is set to the job's bit: `OP2 = J[2];`.\n\nThe tests give each kind every job it defines, and system jobs 0 to 4: 39 tests.",
  c2Hints: [
    "Copy kind 2's arm and change it for kind 3. Use the table above for each kind's column.",
    "A common mistake: setting OP1 for a load from J. A load always adds: OP1 is 1, OP2 and OP0 stay 0.",
    "`4'h3: begin WRITEY = 1'b1; LOAD = 1'b1; BCONST = 1'b1; OP1 = 1'b1; AZERO = J[3]; BYTE = J[0]; end`",
    "Kind 5: `4'h5: begin BRANCH = 1'b1; OP1 = 1'b1; OP0 = 1'b1; end`\n\nKind 6: `4'h6: begin WRITEY = 1'b1; CALL = 1'b1; end`",
    "The five arms, after kind 2's:\n\n```\n4'h3: begin WRITEY = 1'b1; LOAD = 1'b1; BCONST = 1'b1; OP1 = 1'b1; AZERO = J[3]; BYTE = J[0]; end\n4'h4: begin STORE = 1'b1; BCONST = 1'b1; OP1 = 1'b1; AZERO = J[3]; BYTE = J[0]; end\n4'h5: begin BRANCH = 1'b1; OP1 = 1'b1; OP0 = 1'b1; end\n4'h6: begin WRITEY = 1'b1; CALL = 1'b1; end\n4'h7: begin JUMP = 1'b1; BCONST = 1'b1; OP1 = 1'b1; end\n```",
  ],
  reflection:
    "The decoder is gates: one line per kind, and an OR per signal, with a job bit ANDed in where the job matters. The table of signals is the decoder's circuit written out.\n\nEvery word with a kind from 1 to 8 gets that kind's control signals.\n\nHow could the decoder's gates tell that a word is no instruction: kind 0, kind 9, or a job its kind does not define, such as job 8 of a register job?",
  modelVsReality:
    "The course's decoder already shares some gates between signals: JOBS feeds WRITEY and the ALU's code, MEM feeds BCONST, OP1, AZERO and BYTE. Real design tools go further: they merge and simplify gates across all the signals until each gate's job is hard to see. The course keeps the gates in the table's shape so each gate matches a row. Both give the same signals.\n\nA real decoder's gates take time, and that time adds to the path from the fetch to the edge that ends the instruction.",
} as const;
