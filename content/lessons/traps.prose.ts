// Copyright © 2026 Christopher Snow

// The words of the lesson traps.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 1A to 1C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Module 11 ended on a question: what if, instead of halting, the machine went to a program of its own, said why, and carried on?\n\nThe figure runs a night program for the shop in the debugger. It shows room A's reading on the display, clears room B's sensor, and lights NIGHT.\n\nClearing room B's sensor is a mistake: a sensor is read only. Module 8 showed that a store to it makes the machine halt.\n\nRoom A reads -184 and room B -250.",
  haltsLead: 'Press "Run to the end" and see how far the night program gets.',
  haltsAfter:
    "The machine halts with cause `34` at `00C`, the store to room B's sensor, after 3 instructions.\n\nThe display shows -184: the program showed room A's reading before the mistake.\n\nNIGHT is off. The lines after the store never ran, and nothing more will run until someone resets the machine.",
  motivation:
    "The machine refuses some instructions. The store to room B's sensor faults. Instead of halting, the machine can go to a program of its own. A program the machine goes to when an instruction faults is a **handler**. Going to the handler in place of halting is a **trap**. The store traps instead of halting the machine.\n\nControl register C4 holds the handler's address. A program sets it before anything faults, with `C4 <= R1`.\n\nAt the edge that ends the instruction that faults, five registers take new words:\n\n- C2 takes the return point, where to go back to;\n- C1 takes C0, the status, as it was;\n- C0 takes `01`;\n- C3 takes the cause;\n- the PC takes C4, so the next instruction is the handler's first.\n\nThe instruction that faulted changes nothing else: no register, no memory, no device.\n\nThe handler reads the cause with `R5 <= C3`. It goes back with `resume`, which sets the PC to C2.\n\nC0 and C1 say more in lesson 3. In this lesson C0 is `01` throughout.",
  prediction:
    'The figure lists the night program with a handler at `024`. Its first two lines set C4 to `024`.\n\nThe handler keeps the cause at `400`, works on C2, and resumes.\n\nChoose an answer and press "Check my prediction".',
  p1Question: "Just after the store to room B's sensor traps, what does C2 hold?",
  p1Explain:
    "C2 holds `014`: the address of the store that faulted, not the next instruction.\n\nAfter a fault, the return point is the instruction that faulted, so a handler can mend what went wrong and run it again.\n\n`018` is the instruction after it. `024` is the handler's address, which the PC takes.\n\nThe next figure runs the program edge by edge.",
  investigation:
    "The figure is a timeline of the night program and its handler. It lists the run's edges one at a time. On this machine each edge runs one instruction, or takes one trap. Each edge says what ran, or that it trapped, and lists the transfers it makes, each with the word it takes, such as `C2 ← 014`.\n\nA register's word is shown as a decimal number, with its hexadecimal beside it from 10 up. At edge 7 the handler reads cause `34` into R5, and R5 shows 52 `034`: `34` in hexadecimal is 3 × 16 + 4 = 52 in decimal. The cause has not changed; only the way it is written has.",
  timelineLead:
    '1. Press "Next edge" five times, to the edge before the store.\n2. Press "Next edge" once more. The store traps. Watch the five transfers this one edge makes.\n3. Press "Next edge" to go through the handler\'s five lines and then its `resume`. Watch C2 take its new word before `resume` uses it.\n4. Press "Next edge" until the run reaches its last edge.',
  timelineAfter:
    "At edge 6 the store at `014` traps. It makes five transfers: C2 ← `014`, C1 ← `01`, C0 ← `01`, C3 ← `34` and PC ← `024`. The handler adds 4 to C2, so C2 holds `018`. `resume` runs at edge 12. It sets the PC to `018` and C0 to C1's `01`. The program then lights NIGHT and stops at `020`. The run has 15 edges in all: 14 instructions run and 1 trap. The display shows -184 and NIGHT is on. The machine did not halt.",
  construction:
    "You can work out what a trap leaves in the control registers without running the program.\n\nThe figure lists another program. It sets C4, puts the lamps' address plus 4 in R2, then loads the word at R2.\n\nThat address is not a multiple of 8, so the load faults.",
  quizListingLead: "The program, as the assembler lists it.",
  answersLead: "Work out each answer from the listing, then run the tests.",
  c1Task:
    "1. Just after the load traps, give in hexadecimal:\n   - what C2 holds;\n   - what C3 holds;\n   - what C1 holds;\n   - what the PC holds.\n2. Write C2 and the PC as three hexadecimal digits, C3 and C1 as two. There are 4 tests, one for each answer.",
  c1Hints: [
    "The idea: at the trap's edge, C2 takes the return point, C1 takes C0, C3 takes the cause and the PC takes C4.",
    "A common mistake: giving C2 the address of the next instruction. After a fault, the return point is the instruction that faulted.",
    "A smaller example: in the night program, the store at `014` traps. Its transfers are C2 ← `014`, C3 ← `34`, C1 ← `01` and PC ← `024`.",
    "Part of the answer: the load is at `010`, and C1 takes C0, which is `01` throughout this lesson. For C3, the causes are listed in the lesson on how an instruction reads or writes memory in Module 8, and again in the lesson on finding a mistake in a program in Module 11; the cause to find is the one for a word at an address that is not a multiple of 8.",
    "The whole answer: `010`, `33`, `01` and `01C`.",
  ],
  failureExperiment:
    "The figure runs the night program with a shorter handler. It keeps the cause at `400` and runs `resume` at once. It does not change C2.\n\nWatch C2 in the control registers panel.",
  noSkipLead: 'Predict how the run ends, then press "Run to the end".',
  noSkipAfter:
    "The debugger cuts the run off after 5000 instructions. NIGHT never lights.\n\nC2 still holds `014` when `resume` runs, so the PC goes back to the store to room B's sensor.\n\nThe store faults again and traps again. The handler resumes the program again, and the run goes round for ever.",
  explanation:
    "The return point is the address C2 holds, and `resume` goes there. After a fault, the return point is the instruction that faulted.\n\nThe handler can do one of two things:\n\n- mend what went wrong and run the instruction again, with C2 as it is;\n- skip the instruction, by adding 4 to C2 before `resume`.\n\nThe night program's store cannot be mended. Room B's sensor is read only, so the store faults every time it runs. Its handler skips it, with `R5 <= C2`, `R5 <= R5 + 4` and `C2 <= R5`.\n\nA control register moves only to or from an R register: `R5 <= C2` copies C2 into R5, and `C2 <= R5` copies R5 into C2. So the handler adds 4 to R5 between the two copies. The same two forms copy C0, C1, C3 and C4.\n\nThe assembler refuses a control register anywhere else, such as in `R5 <= C2 + 4`, a load or a store, and says why.\n\nWith C4 at 0, as at reset, there is no handler. An instruction that faults halts the machine with its cause, as it did in Modules 8 to 11. Every program in those modules ran with C4 at 0.\n\nAn instruction that faults at the address C4 holds also halts the machine instead of going to the handler. Otherwise a handler that faults on its own first instruction would go back to that line for ever.",
  debuggerLead:
    '1. Press "Run to a breakpoint". The run pauses at the handler\'s first line, at `024`. Read C2, C3 and C4 in the control registers.\n2. Press "Step" through the handler\'s six lines. Watch the word at `400` take the cause, and C2 take its new word.\n3. Press "Run to the end".',
  debuggerAfter:
    "The program stops at `020` with NIGHT on and -184 on the display. The status line says 14 instructions ran and 1 trap went to the handler.\n\nThe word at `400` holds 52 `034`: the cause `34`, kept as a word and written as a decimal number, as the timeline showed for R5.",
  generalisation:
    "Every cause goes to the same handler, at the address C4 holds. The handler reads C3 to tell the causes apart.\n\nA fault returns to the instruction that faulted.\n\nThe handler is an ordinary program in the ROM, written in the same assembly. The machine adds only the five transfers at the trap's edge and the two at `resume`'s edge.",
  skip34Lead: "Write the handler, step through it on the tests' programs, then run the tests.",
  c2Task:
    "1. Write a handler that skips every store the machine refuses with cause `34`, and keeps a count of them in the word at `400`, which you write `word[0x400]`.\n2. On any other cause, the handler runs `stop`, which ends the run.\n3. The starting text sets C4, sets the count to 0 and goes to `program`. The starting handler only resumes.\n4. There are 4 tests. Each adds its own program after yours, named `program`, and runs all of it from reset. The program's own last line is `end: stop`.\n5. Each test checks the count, the display, how many traps went to the handler, the causes in order, and where the run stops. The run stops at the program's `end`, or at the handler's `stop` after any other cause. Where the program carries on after a refused store, the test also checks that C2 holds the address of the line after the store, which the program names `after`.",
  c2Hints: [
    "The idea: read the cause with `R5 <= C3` and compare it with `0x34` before doing anything else.",
    "A common mistake: counting every trap. Only a refused store, cause `34`, is counted and skipped.",
    "A smaller example: the night program's handler skips with `R5 <= C2`, `R5 <= R5 + 4` and `C2 <= R5` before `resume`.",
    "Part of the answer: `R6 <= 0x34` then `if R5 != R6 goto other`, with `other: stop` at the end.",
    "The whole answer:\n\n```\n        R1 <= handler\n        C4 <= R1\n        R1 <= 0\n        word[0x400] <= R1       // the count of refused stores\n        goto program\nhandler: R5 <= C3\n        R6 <= 0x34\n        if R5 != R6 goto other\n        R5 <= word[0x400]\n        R5 <= R5 + 1\n        word[0x400] <= R5\n        R5 <= C2\n        R5 <= R5 + 4\n        C2 <= R5\n        resume\nother:  stop\n```",
  ],
  reflection:
    "The night program did not use R5. The handler wrote R5 three times.\n\nA handler runs in the middle of another program, which may keep its own words in R5.\n\nWhat must a handler leave as it found it, and where can it keep words while it works?",
  modelVsReality:
    "Real machines go to a handler as this one does: one register holds the return point, one the cause, and one the handler's address.\n\nMany keep a table of handler addresses in memory, one for each cause.\n\nThis machine takes one edge for a trap, as it does for each instruction. A real machine takes several clock edges for most instructions, and more for a trap. Module 9's machine of several edges takes several edges for each instruction too; lesson 7 counts a trap's edges on it.",
} as const;
