// Copyright © 2026 Christopher Snow

// The words of the lesson functions.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended with a question. The office wants your program to check room A's reading against its limit of -180, and room B's against -200. Each check runs the same lines on a different reading and limit. If you write the check twice, and there is a mistake in it, you must fix it in both places. Can you write the check once and run it from two different places?",
  twoWaysLead:
    "The figure shows two programs that do the same work. Room A's reading is -170 and room B's is -190. The first program writes the check twice: once for each room. The second writes it once under the name `above`, and reaches it from two places with `call above, R15`. Press \"Run the programs\" to count the instructions each runs.",
  twoWaysAfter:
    "Both programs show 10 on the display: room A is 10 tenths above -180. Both turn ALARM on because room B is 10 above -200. The first program has 18 instructions and runs 14. The second has 17 and runs 18. Each call to `above` runs 2 more instructions: the call itself and the jump back. The check is written once, so a mistake is mended in one place.",
  motivation:
    "Lesson 8.5 showed the call instruction. `call above, R15` puts the address of the instruction after the call in R15, and goes to `above`. `goto R15` jumps back to that address.\n\nA **function** is a piece of program that a call runs, and that goes back to the instruction after the call when it is done.\n\nThe values a function is given are its **arguments**. The `above` function takes two: the reading in R1 and the limit in R2. It leaves its result in R1: how far the reading is above the limit, or 0 when it is not above.\n\nBefore each call to `above`, the program puts the arguments in R1 and R2. After it, the result is in R1.",
  prediction:
    "The figure shows the debugger on the program. Room A's reading is -170 and room B's is -190. The debugger shows R1, R2 and R15. The program calls `above` twice: once from `008` and once from `018`. Choose which answer you think is right, then press \"Check my prediction\". The buttons will then work.",
  p1Question: "After the second call has run, what does R15 hold?",
  p1Explain:
    "R15 holds `01C`, the address of the instruction after the second call. The call at `018` wrote `01C` into R15, replacing `00C`, which the first call had written. The same `goto R15` at the end of `above` went back to `00C` the first time and goes back to `01C` this time. One function returns to wherever it was called from. The debugger shows R15 as 28, with `1C` under it in hexadecimal.",
  investigation:
    "The figure runs the program in the debugger, with a breakpoint on `above`'s first line. Each pause comes just after a call has gone to the function.",
  callLead:
    '1. The watch shows R1, R2, R15 and the PC.\n2. Press "Run to a breakpoint": the run pauses at `above` with the first call\'s arguments in R1 and R2, and R15 at `00C`.\n3. Then press "Step" until the PC is back in the main program, and watch R1 take the result.\n4. Do the same for the second call.',
  callAfter:
    "1. The first call gives `above` -170 and -180. It goes to `over` and returns 10, which the program shows on the display.\n2. The second call gives -190 and -200, and returns 10 too, so ALARM turns on.\n3. 18 instructions run, and the program stops at `02C`.",
  construction:
    "Which registers carry the arguments, which the result, and which a function may change is not up to each function. It is an agreement every program on the machine keeps: a **calling convention**. The course's is:\n\n- R1 to R4 carry a function's arguments. R1 carries its result back.\n- R5 to R9 are free: a function may change them. A caller cannot rely on what they hold after a call.\n- R10 to R13 are kept: a function that changes one puts it back before it returns. A caller can keep a word in one through a call.\n- R15 holds the return address.\n- R14 has a role lesson 4 gives it. R0 is free.\n\nA function may change its own arguments, R1 to R4, as `above` changes R1.",
  rolesLead:
    "Say what the calling convention lets a function do with each register, then run the tests.",
  c1Task:
    "For each of R1, R3, R7 and R12, choose what the calling convention says a function does with it: carries the result back; may change it; or must put it back before it returns. Choose one answer for each register. There are 4 tests, one for each register.",
  c1Hints: [
    "The idea: the convention gives each group of registers one role: R1 to R4, R5 to R9, R10 to R13.",
    "A common mistake: treating an argument as kept. A function may change R1 to R4; `above` changes R1 to give its result.",
    "A smaller example: R9 is free, so a function may change it.",
    "Part of the answer: R1 carries the result back, and R12 must be put back.",
    "The whole answer: R1 carries the result back; R3 and R7 may be changed; R12 must be put back.",
  ],
  failureExperiment:
    "This program adds room A's and room B's amounts above their limits, with room A at -170 and room B at -150. After the first call, it keeps room A's amount in R10, `R10 <= R1`, through the second call. R10 is kept, so the convention allows that. The second program is the same, except that its `above` uses R10 as a spare register on the way to its result, and does not put R10 back.",
  spoiledLead: 'Predict what each program shows, then press "Run the programs".',
  spoiledAfter:
    "The first shows 60: room A's 10 and room B's 50. R10 still holds 10 at the end. The second shows 100. Its `above` left room B's 50 in R10, so the program added 50 and 50. The function gives the right result every time. It breaks its caller, by changing a register the convention says it keeps.",
  explanation:
    "The machine knows nothing of functions. `call above, R15` is kind 6: it writes the address of the next instruction into the register its Y digit names, and goes to `above`. R15 is used here only because programs agree on it.\n\n`goto R15` is a jump to the address a register holds, like any other jump.\n\nNothing in the machine checks that a function puts R10 to R13 back, or that its result is in R1. The failure experiment's program broke the agreement, and the machine ran it without a word.\n\nA calling convention is an agreement between programs, not a part of the machine. It lets a function written by one person be called from a program another person wrote, and lets a test call a function on its own.",
  generalisation:
    "A function is written once and used from anywhere a call can reach. A mistake in it is mended once.\n\nA function can be tested alone: give it arguments, call it, and check its result and the registers it must keep. The challenge's tests do that.\n\nEach use costs two instructions: the call and the jump back. For a short piece used twice, the program is hardly shorter. For a longer piece or one used many times, the saving in lines grows.",
  aboveLead: "Write `above`, test it in the debugger, then run the tests.",
  c2Task:
    "The starting text is the lesson's main program with `above` returning 0 every time.\n\nWrite `above`: R1 holds a reading and R2 a limit. Return in R1 how far the reading is above the limit, or 0 if it is not above. A reading equal to the limit is not above it.\n\nKeep the calling convention: put back any of R10 to R14 you change, and return with `goto R15`.\n\nThere are 9 tests:\n\n- Six call `above` alone, with R1 and R2 set: -170 and -180; -190 and -180; -180 and -180; 25 and -180; -150 and -200; -205 and -200. Each checks R1, that R10 to R14 hold what they held before the call, and that the run came back through R15.\n- Three run the whole program with room A and room B at: -170 and -190; -185 and -210; 25 and -150. Each checks the display, the lamps and that the program ends at `stop`.",
  c2Hints: [
    "The idea: compare the reading with the limit, then either subtract or give 0.",
    "A common mistake: comparing `unsigned`. A reading of 25 read unsigned is smaller than -180 read unsigned, so the function would say it is not above.",
    "A smaller example: for a reading of -170 and a limit of -180, the result is -170 - (-180), which is 10.",
    "Part of the answer: `if R2 < R1 signed goto over` jumps when the limit is less than the reading.",
    "The whole answer:\n\n```\nabove: if R2 < R1 signed goto over\n       R1 <= 0\n       goto R15\nover:  R1 <= R1 - R2\n       goto R15\n```",
  ],
  reflection:
    "`above` calls no other function. The office now wants a function that checks both rooms by calling `above` twice.\n\nWhen it calls `above`, that call writes R15 with a new return address. But R15 already held this function's return address.\n\nWhat must a function that calls another keep, and where?",
  modelVsReality:
    "Every real machine has a calling convention written down for its programs and tools. This lets functions from different authors and tools work together. The course's convention is its own and follows none of them.\n\nMany real machines have a call that always writes one register. The course's call writes the register its Y digit names. So the choice of R15 is the convention's, not the machine's.",
} as const;
