// Copyright © 2026 Christopher Snow

// The words of the lesson illegal-instructions.
//
// Drafted by the course's prose process from briefs of checked facts (docs/notes/module-9-control.md
// and its briefs), checked against the simulator, and placed here by the lesson's structure. Edit
// a fact here only after checking it; the lesson's facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 ended with a question: what should the machine do with a word that is no instruction?\n\nKinds 0 and 9 to F have no kind line. A register job has jobs 0 to 7, so job 8 is not a job.\n\nThe word `82000005` is kind 8, job 2, constant 5. That job copies a control register into register Y, and the constant says which one. Module 8's machine stops at it, as a system job a later module builds.\n\nA control register is one of five registers, numbered 0 to 4, that Module 12 builds. The machine has no control register 5.\n\nHow does the decoder tell that a word is no instruction?",
  motivation:
    "A word the machine must refuse is an **illegal instruction**: a word that is no instruction the machine defines.\n\nA word is illegal for one of three reasons:\n\n- its kind is 0 or 9 to F;\n- its job is one its kind does not define (jobs 8 to F of kinds 1, 2 and 5; jobs outside 0, 1, 8 and 9 of loads and stores; any job but 0 of calls and jumps; jobs 5 to F of kind 8);\n- a system job names a control register outside 0 to 4, the constant read signed.\n\nAt an illegal instruction, the decoder gives CAUSED `21`, and the machine stops.\n\nKind 8: job 0 gives `41`; jobs 1 to 3 stop the machine as jobs a later module builds; job 4 is `stop`.\n\nModule 8's decoder read K and J only. The third reason needs the constant, so Module 9's decoder reads K, J and C.",
  kindMapLead:
    "Below is a map read off the decoder's circuit. One row per kind (`0` to `F`), one column per job (`0` to `F`). For each combination, the figure tests both constant 0 and constant 5, showing what the decoder outputs. A tick marks an instruction. A dot marks an illegal word. A c marks a word that is an instruction only when the constant is 0 to 4.",
  kindMapAfter:
    "The map shows 37 instructions, 2 constant-dependent words, and 217 illegal combinations. The two c cells are jobs 2 and 3 of kind 8. Rows 0 and 9 to F are all dots: these kinds have no kind line. Row 1, a register job, has ticks for jobs 0 to 7. Row 3, a load, has ticks for jobs 0, 1, 8 and 9.",
  prediction:
    'The figure below shows the decoder. Its inputs are K, J and C. Its output is CAUSED, the cause it gives.\n\nThe word is `84000005`: kind 8, job 4, constant 5.\n\nChoose an answer and press "Check my prediction".',
  p1Question: "What cause does the decoder give for `84000005`, kind 8, job 4, with constant 5?",
  p1Explain:
    "CAUSED is `00`. The word `84000005` is `stop`, and the machine stops at it with no fault.\n\nOnly jobs 2 and 3 of kind 8 name a control register, so the number check counts only for those jobs. Job 4 names no control register, so its constant is not read.\n\nThe word `82000005` is kind 8, job 2 with constant 5. It gives CAUSED `21`. The figure below shows the checks that reject it.",
  checksOpenLead:
    'Press the decoder in the figure, then its "checks" block. The instruction is `82000005`: kind 8, job 2, constant 5.\n\nThe block has six parts:\n\n- "kind check" outputs NOKIND, 1 when no kind line matches.\n- "job check" outputs BADJOB, 1 when the job does not match its kind.\n- "number check" outputs BADNUMBER, 1 when job 2 or 3 of kind 8 uses a number outside 0 to 4.\n- An OR gate joins these three into ILLEGAL.\n- "system jobs" outputs SYSTEM, 1 for job 0 of kind 8, and STOP, 1 for jobs 1 to 4.\n- "cause" outputs CAUSED: `21` when ILLEGAL is 1, `41` for kind 8 job 0, `00` otherwise.\n\nPress a block to open it. Press the pins for K, J and C to try other words.',
  checksOpenAfter:
    'The checks read the kind lines, not K. "kind check" is one NOR gate. NOKIND is 1 when no kind line matches.\n\n"job check" has one AND gate per group of kinds:\n\n- kinds 1, 2, 5: job bit 3 (jobs 8 to F);\n- loads and stores: job bit 2 or 1;\n- calls and jumps: when any job bit is 1;\n- kind 8: job bit 3, or job bit 2 and one of bits 1 or 0 (jobs 5 to F).\n\n"number check" reads the bits of C. C is outside 0 to 4 when any of bits 11 to 3 is 1, or when bit 2 is 1 with bit 1 or bit 0.\n\nFor `82000005`, C is `005`: bits 2 and 0 are 1. So BADNUMBER is 1, ILLEGAL is 1, and CAUSED is `21`.\n\nWith C at `004`, the word is legal, and STOP is 1.',
  construction:
    "C is a 12-bit signed number. Values 0 to 4 are valid: bits 11 to 3 are all 0, and bits 2 to 0 are `000` to `100`.\n\nC is outside this range if any of bits 11 to 3 is 1. This catches values 8 to `7FF` (8 to 2047) and `800` to `FFF` (the negative numbers).\n\nC is also outside the range if bit 2 is 1 with bit 1 or bit 0. This gives 5, 6 and 7.\n\nYou check both conditions.",
  writeOutsideLead: "Write OUTSIDE: 1 when C, read signed, is not 0 to 4.",
  c1Task:
    "The module `outside` has input C (12 bits) and output OUTSIDE.\n\nThe starting code checks only bits 2 to 0:\n\n```\nassign OUTSIDE = C[2] & (C[1] | C[0]);\n```\n\nThis gives 1 for values 5, 6 and 7.\n\nThe tests try 13 values: 0 to 8, `7FF`, `800`, `FFC` and `FFF`. The start fails 3 of them.\n\nYou can use `assign`, part selects like `C[11:3]`, and the operators `|`, `&`, `~`, `==` and `!=`.",
  c1Hints: [
    "Try value 8 on the start. Bits 2 to 0 of 8 are `000`, so the start gives 0. Which bits of 8 are 1?",
    "A common mistake: checking bit 11 alone. This catches negative numbers but not 8 to 2047.",
    "Any of bits 11 to 3 at 1 puts C outside 0 to 4: `(C[11:3] != 9'h0)`.",
    "Keep the start's term for 5, 6 and 7, and OR the two.",
    "The whole answer: `assign OUTSIDE = (C[11:3] != 9'h0) | (C[2] & (C[1] | C[0]));`",
  ],
  checkFaultsLead:
    'The figure shows the decoder: press it, then its "checks" block. Each fault breaks one check.\n\nWith "NOKIND stuck at 0", the kind check never signals that no kind line is 1. With "BADNUMBER stuck at 0", the number check never refuses a number.\n\nThe seven words are: all zeros, kind 9, job 8 of a register job, job 2 of kind 8 with 5, job 3 of kind 8 with -1, job 2 of kind 8 with 4, and an add.\n\nChoose a fault and press "Run checks". Before you run it, predict what cause each word now gets.',
  checkFaultsOutcomes: "The other words keep their cause under both faults.",

  checkFaultsOutcomesFault1:
    "**NOKIND stuck at 0:** Two of the seven words fail. All-zeros and kind 9 result in cause `00` instead of `21`. Every control signal is 0, so the machine runs them as do-nothing instructions and continues. The job check does not catch them: it reads the kind lines, and none is 1.",

  checkFaultsOutcomesFault2:
    "**BADNUMBER stuck at 0:** Two of the seven words fail. Job 2 with 5 and job 3 with -1 result in cause `00` instead of `21`. STOP is 1, so the machine stops. These are jobs a later module builds, as Module 8's machine treated them.",
  explanation:
    "The ILLEGAL signal is an OR of the kind check, the job check and the number check. These checks are gates, like the control signals, and settle before the next edge. When ILLEGAL is 1, the cause block outputs `21`. The stop logic halts the machine. An illegal instruction changes no register and no memory word.",
  generalisation:
    "A decoder that knows its kinds can refuse any word that does not match. Each kind has a kind line; a word with no line is illegal. The job check also refuses jobs the kind does not define. To add a new kind, a designer adds its kind line to the kind check and adds a term to the job check for its jobs. Nothing learns by itself. A jump to a wrong address runs whatever word is there. The checks stop the machine there only when the word is illegal; a word that is a legal instruction runs.",
  writeChecksLead: "Write the whole check: ILLEGAL from K, J and C.",
  c2Task:
    "Write a module `checks` with inputs K, J (4 bits each) and C (12 bits), output ILLEGAL. The module starts with: `assign ILLEGAL = (K == 4'h0) | (K[3] & (K != 4'h8));`. This rejects kinds 0 and kinds 9 to F. Add more terms, ORed together, for the job and constant checks. The job term rejects any job that a kind does not define. The constant term rejects jobs 2 and 3 of kind 8 when the constant is outside 0 to 4; reuse your OUTSIDE expression. Tests cover every kind and job with constant 0, jobs 2 and 3 of kind 8 with 12 other constants, and jobs 0, 1 and 4 of kind 8 with 5 and with -1, and an add with 5, whose constants name no control register: 287 tests. The starter code fails 105 of them.",
  c2Hints: [
    "Write one term for each group of kinds that share their jobs: kinds 1, 2 and 5; kinds 3 and 4 (loads and stores); kinds 6 and 7 (calls and jumps); and kind 8.",
    "A common mistake: do not OR OUTSIDE in on its own, or `stop` with constant 5 will be refused. OUTSIDE applies only to jobs 2 and 3 of kind 8, picked out by `(J[3:1] == 3'b001)`.",
    "Kinds 1, 2 and 5: `(((K == 4'h1) | (K == 4'h2) | (K == 4'h5)) & J[3])`. Loads and stores: `(((K == 4'h3) | (K == 4'h4)) & (J[2] | J[1]))`.",
    "Calls and jumps: `(((K == 4'h6) | (K == 4'h7)) & (J != 4'h0))`. Kind 8's jobs 5 to F: `((K == 4'h8) & (J[3] | (J[2] & (J[1] | J[0]))))`.",
    "The complete assignment:\n\n```\nassign ILLEGAL = (K == 4'h0) | (K[3] & (K != 4'h8))\n  | (((K == 4'h1) | (K == 4'h2) | (K == 4'h5)) & J[3])\n  | (((K == 4'h3) | (K == 4'h4)) & (J[2] | J[1]))\n  | (((K == 4'h6) | (K == 4'h7)) & (J != 4'h0))\n  | ((K == 4'h8) & (J[3] | (J[2] & (J[1] | J[0]))))\n  | ((K == 4'h8) & (J[3:1] == 3'b001) & ((C[11:3] != 9'h0) | (C[2] & (C[1] | C[0]))));\n```",
  ],
  reflection:
    "Every word now either runs as an instruction or stops the machine with cause `21`. The control unit is still the decoder of Module 8's machine. It now reads K, J and C, where Module 8's read K and J only. It works out the control signals and ILLEGAL. The machine runs each instruction in one edge. It reaches memory twice in that edge: once at the PC for the fetch, and once at the ALU's result for a load or store. What if the machine had one memory reached by one address, as Module 6's was? How could one instruction use it twice?",
  modelVsReality:
    "A real machine does not stop at an illegal instruction. Instead, it runs a program that deals with it. Module 12 builds that program. Real makers keep some kinds reserved, as this machine keeps kinds 9 to F, so a later version can define them. A program written for that later machine still runs on this one, until it hits a new kind. There the machine stops with cause `21`.",
} as const;
