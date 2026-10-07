// Copyright © 2026 Christopher Snow

// The words of the lesson log-report, the module's capstone.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 7A to 7C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 6 asked: can you write a program the shop can use? The office wants a daily report on the temperature log. The report needs: how many readings were warmer than a set limit, an alarm if any were warmer, and the day's lowest and highest readings. The figure gives six logs and the report each one asks for.",
  asksLead:
    'The figure runs the starting text on each log. Press "Run all" to see what it leaves beside what each log asks for.',
  asksAfter:
    "The starting text finds the lowest reading on every log: its `lowest` is complete. It leaves 0 for the highest, 0 on the display and no lamp on, since `highest` and `warmer` both return 0. That is only right for the empty log, log 4, and the counts of logs 2 and 6. Your program must match every log.",
  motivation:
    "The report, as the tests check it:\n\n- the display shows how many readings are warmer than the limit; a reading equal to it is not;\n- ALARM is on when any reading is warmer, and no lamp is on otherwise;\n- the word at `400` holds the lowest reading and the word at `408` the highest, both 0 for an empty log;\n- the program ends at its `stop`.\n\nThe tests add `count`, `limit` and `log` after your program. Three functions do the work. Each takes the list's address in R1 and its count in R2, and leaves its result in R1: `lowest`, `highest`, and `warmer`, which also takes the limit in R3. The tests call each function alone, as lesson 3's did.",
  prediction:
    'The figure runs the given `lowest` on log 5, -184, 35, -176, 12, -190, and shows its result on the display. Choose an answer and press "Check my prediction". The buttons then work.',
  p1Question: "What does `lowest` return for log 5?",
  p1Explain:
    "It returns -190, the last reading. It starts with the first reading, -184, as the lowest so far. 35, -176 and 12 are not lower, so it keeps -184 past them. -190 is lower, and takes its place. It reads the readings signed: if you read them as unsigned, 35 and 12 would be lower than every negative reading.",
  investigation:
    "The figure runs `lowest` on log 5 with a breakpoint on `lowNext`. It watches R5, R6 and R2, and shows the log with the word R1 points at.",
  walkLead:
    'R5 holds the lowest reading so far. R6 holds the reading just loaded. Press "Run to a breakpoint" again and again to step through the loop. Watch R5 on each step: it changes only when a lower reading comes.',
  walkAfter:
    "R5 starts at -184, the first reading. When it reads 35, -176 and 12, none are lower than -184, so R5 keeps -184. When it reads -190, that is lower, so R5 takes -190. The display shows -190.",
  construction:
    "The specification, for the program as a whole:\n\n- The main program starts with `R14 <= 0x7C0`, as every program that keeps the calling convention does.\n- It calls `lowest`, `highest` and `warmer` in turn, each with `R1 <= log` and `R2 <= word[count]`, and `R3 <= word[limit]` for `warmer`.\n- It stores the lowest with `word[0x400] <= R1` and the highest with `word[0x408] <= R1`.\n- It stores the count of warm readings to the display, and, if it is not 0, stores 1 to the lamps: bit 0 is ALARM.\n- `highest` is `lowest` with one comparison turned round.\n- `warmer` walks the list as lesson 2's count did, with the limit in R3.\n- Each function uses only R1 to R9, so it needs no stack: it changes no kept register and calls nothing. Each returns with `goto R15`.",
  failureExperiment:
    'The figure runs a complete report. Its `highest` function starts with a highest so far of 0, not the first reading. Before you run it, predict which logs it will get wrong. Then press "Run all".',
  fromZeroLead: "Compare what the program leaves at `408` with what each log asks for.",
  fromZeroAfter:
    "It leaves 0 at `408` for logs 1, 2, 3 and 6: every reading in them is below 0, so none is higher than 0. It is right for log 4, the empty log, and for log 5, whose highest is 35. A start of 0 is a guess at the answer. Start from the first reading, as `lowest` does.",
  explanation:
    "The report uses the module's lessons:\n\n- the log is `word` data the assembler puts after the program (lesson 1);\n- each function walks a list with an address register and a count (lesson 2);\n- the functions take arguments and give results by the calling convention, so the tests can call each alone (lesson 3);\n- R14 is set, and each function leaves it, and R10 to R13, as it found them (lesson 4);\n- it does not need recursion (lesson 5): no part of the report depends on the readings' order;\n- the tests' logs reach the edges: an empty log, one reading, readings of both signs, a reading equal to the limit (lesson 6).",
  generalisation:
    "A program the shop can rely on passes tests chosen to reach every edge, not one that looks right. Each function, tested alone, can be used again: next week's report on room B's log calls the same `lowest`. The program reaches the shop's devices directly, with stores to the display and the lamps. A later module asks whether every program should be allowed to reach them.",
  challenge:
    'There are three ways in, and the tests are the same for each. In the guided way, the starting text has the main program and the `lowest` function complete; you write `highest` and `warmer`. The hints help one step at a time. From the specification: press "Start from an empty program" and follow the construction\'s specification. From the requirements alone: start with an empty program and use only the task and the tests.',
  reportLead:
    "Choose your way in, write the program, test it in the debugger on each log, then run the tests.",
  c1Task:
    "Write a program that reports on the log the tests add after it (`count`, `limit` and `log`):\n\n- the display shows how many readings are warmer than the limit;\n- ALARM is on when any reading is warmer, and no lamp is on otherwise;\n- the word at `400` holds the lowest reading and the word at `408` the highest, both 0 for an empty log;\n- the program ends at its `stop`.\n\nDo the work with three functions: `lowest`, `highest` and `warmer`. Each takes the list's address in R1 and its count in R2. `warmer` also takes the limit in R3. Each leaves its result in R1. Each keeps the calling convention: R10 to R14 as they were, and returns through R15.\n\nThere are 15 tests on six logs:\n\n- log 1: -184, -190, -176, -181, -172, -188, limit -180;\n- log 2: -195, -200, -191, -199, limit -180;\n- log 3: -175, limit -180;\n- log 4: empty, limit -180;\n- log 5: -184, 35, -176, 12, -190, limit -180;\n- log 6: -150, -160, -155, limit -150.\n\nSix run the whole program on each log and check the display, the lamps, the words at `400` and `408`, and the stop. Nine call each function alone on logs 1, 4 and 5, and check R1, R10 to R14 and the return.",
  c1Hints: [
    "The idea: write one function at a time, and test it alone in the debugger before the next.",
    "A common mistake: starting the highest so far at 0. On a log whose readings are all below 0, the highest is then 0.",
    "A smaller example: `lowest` keeps a reading when `if R5 < R6 signed` finds it no lower; `highest` keeps one when it is no higher.",
    "Part of the answer: `highest` is `lowest` with `if R6 < R5 signed goto highNext` in place of `if R5 < R6 signed goto lowNext`, and its own names. `warmer` counts with `if R3 >= R6 signed goto warmSkip`.",
    "The whole answer:\n\n```\nhighest:  R0 <= 0\n          if R2 == R0 goto highNone\n          R5 <= word[R1]\nhighNext: R1 <= R1 + 8\n          R2 <= R2 - 1\n          if R2 == R0 goto highDone\n          R6 <= word[R1]\n          if R6 < R5 signed goto highNext\n          R5 <= R6\n          goto highNext\nhighDone: R1 <= R5\n          goto R15\nhighNone: R1 <= 0\n          goto R15\n\nwarmer:   R0 <= 0\n          R5 <= 0\nwarmNext: if R2 == R0 goto warmDone\n          R6 <= word[R1]\n          if R3 >= R6 signed goto warmSkip\n          R5 <= R5 + 1\nwarmSkip: R1 <= R1 + 8\n          R2 <= R2 - 1\n          goto warmNext\nwarmDone: R1 <= R5\n          goto R15\n```",
  ],
  reflection:
    "Your program reaches the display and the lamps itself. When it does something the machine refuses, the machine halts and nothing more runs. A shop's machine runs more than one program. It should not stop for good on one program's mistake. What if, instead of halting, the machine went to a program of its own, said why, and carried on?",
  modelVsReality:
    "A real program would read the day's log as it was written, from a store that keeps it, not as data added after the program. The tests add the log so every log can be tried without rewriting the program. Real programs are tested the same way: on chosen inputs and with each function called alone. The tests can only show mistakes the chosen logs reach.",
} as const;
