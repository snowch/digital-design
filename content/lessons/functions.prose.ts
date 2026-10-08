// Copyright © 2026 Christopher Snow

// The words of the lesson functions.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 3A to 3C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 2 ended on a question. The office wants room A's reading checked against its limit, -180, and room B's against its own, -200. The check is the same lines each time, with a different reading and limit. Written out twice, a mistake in the check must be found and mended twice. How can a program use one piece of program from two places?",
  twoWaysLead:
    'The figure runs two programs that do the same work, with room A at -170 and room B at -190. The first writes the check out twice. The second writes it once, under the name `overBy`, and reaches it from two places with `call overBy, R15`. Press "Run the programs" to see the instruction count for each.',
  twoWaysAfter:
    "Both show 10 on the display: room A is 10 tenths of a degree above -180. Written twice, the program has 20 instructions and runs 18. Written once, it has 18 and runs 22: the same lines, with a call and a jump back for each use of `overBy`. The check now exists once. A mistake in it is mended in one place.",
  motivation:
    "Lesson 8.5 showed the call instruction. `call overBy, R15` puts the address of the instruction after the call in R15, then goes to `overBy`. `goto R15` jumps to the address R15 holds.\n\nA **function** is a piece of program a call runs, which goes back to the instruction after the call when it is done.\n\nThe values a function is given are its **arguments**. `overBy` takes two: a reading in R1 and a limit in R2. It leaves its result in R1: how far the reading is above the limit, or 0 when it is not above. It works out the difference in R5 first, and keeps it only if it is above 0.\n\nBefore each call, the program puts the arguments in R1 and R2. After the call, the result is in R1.",
  prediction:
    'The figure lists the program, which calls `overBy` twice: once from address `008` and once from `018`. Choose an answer and press "Check my prediction". When you do, the listing\'s words show.',
  p1Question: "When the program stops, what does R15 hold?",
  p1Explain:
    "R15 holds `01C`. Each call writes R15: the first at `008` wrote `00C`, the second at `018` wrote `01C`, replacing `00C`. Nothing after the second call writes R15, so it holds `01C` when the program stops. `018` is the call's own address. A call keeps the address after it so `goto R15` goes on from there. The `goto R15` went back to `00C` the first time and to `01C` the second: a function goes back to wherever it was called from. The next figure runs the program in the debugger so you can watch R15 change.",
  investigation:
    "The figure runs the program in the debugger with room A at -170 and room B at -190. A breakpoint pauses the run on the first line of `overBy`. Each time it pauses, a call has just reached that line.",
  callLead:
    '1. The watch shows R1, R2, R15 and the PC.\n2. Press "Run to a breakpoint": the program pauses at `overBy` with the first call\'s arguments in R1 and R2, and R15 holding `00C`.\n3. Press "Step" until the PC is back in the program that made the call, and watch R1 take the result.\n4. Do the same for the second call.\n\nUnder the debugger, the run is drawn as lanes, one for the main program and one for `overBy`, with time running down the page. Each call is an arrow from the main program to `overBy`, labelled with R15\'s new word. Each `goto R15` is an arrow back, labelled with the PC\'s new word. The drawing grows with each step.',
  callAfter:
    "The first call gives `overBy` -170 and -180. Its result is 10, shown on the display. The second call gives -190 and -200. Its result is 10 too, so ALARM turns on. The program runs 22 instructions and stops at `02C`. The drawing shows two calls and two returns: `R15 ← 00C` and `PC ← 00C` for the first call, `R15 ← 01C` and `PC ← 01C` for the second. Each `goto R15` goes back to the line after its own call.",
  construction:
    "Which registers carry a function's arguments, which carries the result, and which a function may change is not up to each function. It is an agreement every program on the machine keeps: a **calling convention**.\n\nThe course's calling convention:\n\n- R1 to R4 carry a function's arguments, and R1 carries the result back. A function may change R1 to R4.\n- R5 to R9 are free: a function may change them, so a caller cannot rely on what they hold after a call.\n- R10 to R13 are kept: a function that changes one puts it back before it returns, so a caller can keep a word in one through a call.\n- R15 holds the return address. R14 gets its role in lesson 4. R0 is free.",
  c1Task:
    "The starting text is a main program. It calls the function `overBy` once, for room A, and shows the result. The tests add `overBy` after your program. \"The tests add these lines\" shows it.\n\nThe `overBy` that the tests add gives the lesson's result. Then it changes every register the calling convention lets a function change: R0 and R2 to R9. Only R1, its result, and R10 to R15 come back as they were.\n\nChange the main program so that the display shows the larger of two amounts: room A's amount above -180, and room B's amount above -200. Then the program stops.\n\nCall `overBy` once for each room.\n\nThere are 5 tests. Each runs the program with a pair of readings, room A's then room B's: -170 and -190; -160 and -195; -175 and -170; -190 and -210; and 25 and -150. Each checks the display, that two calls of `overBy` returned, and that the program ends at its `stop`.",
  c1Hints: [
    "The idea: the second call puts room B's result in R1, so room A's must wait somewhere a call does not change.",
    "A common mistake: keeping room A's result in a free register, such as R5, or in R2 to R4. The `overBy` that the tests add changes R0 and R2 to R9 before it returns, as the calling convention allows, so the result is lost.",
    "A smaller example: `R10 <= R1` after the first call keeps room A's result in a kept register.",
    "Part of the answer: after the second call, `if R10 < R1 signed goto show` jumps when room B's is the larger.",
    "The whole answer:\n\n```\n        R1 <= word[sensorA]\n        R2 <= -180\n        call overBy, R15\n        R10 <= R1\n        R1 <= word[sensorB]\n        R2 <= -200\n        call overBy, R15\n        if R10 < R1 signed goto show\n        R1 <= R10\nshow:   word[display] <= R1\n        stop\n```",
  ],
  failureExperiment:
    "Two programs, with room A at -170 and room B at -150, both add room A's amount above -180 to room B's above -200. After calling `overBy` the first time, the first program keeps room A's result in R10 for the second call: `R10 <= R1`. The calling convention allows this. In the second program, `overBy` uses R10 instead of R5, and does not put it back before it returns.",
  spoiledLead: 'Predict what each program shows on the display, then press "Run the programs".',
  spoiledAfter:
    "The first program shows 60 on the display: room A's 10 and room B's 50 above their limits. R10 still holds 10 at the end. The second shows 100. Its `overBy` left room B's 50 in R10, so the program added 50 and 50 instead of 10 and 50. The function computes the right amount each time. It breaks the program by overwriting a register the calling convention says it must put back.",
  explanation:
    "The machine has no notion of a function. `call overBy, R15` is an instruction of kind 6: it puts the address of the next instruction into the register its Y digit names, here R15, and goes to `overBy`.\n\n`goto R15` is a jump to an address a register holds, like any other jump.\n\nThe machine does not check whether a function puts back R10 to R13 or leaves its answer in R1. The second program broke the agreement, and the machine ran to its `stop` without complaint.\n\nA calling convention is an agreement between programs, not part of the machine. It lets a function one person wrote be called from programs another person wrote, and lets a test call a function alone.",
  generalisation:
    "A function is written once and used from any call that can reach it.\n\nA function can be tested by itself: give it arguments, call it, check its answer and the registers it must keep. The challenge's tests do that.\n\nEach call costs two instructions more: the call and the jump back. For a short piece used twice, the program is no shorter. For a longer piece or one used many times, it saves space.",
  c2Task:
    "The shop's fridge must stay between 2.0 and 5.0 degrees: readings 20 to 50. Its sensor is the one programs read as `sensorA`.\n\nThe starting text has a main program. It calls the function `outOfRange` with the fridge's reading in R1, 20 in R2 and 50 in R3. It shows the result on the display, and turns ALARM on when the result is not 0. The `outOfRange` in the starting text has 0 as its result every time.\n\nWrite `outOfRange`. R1 holds a reading, R2 the range's low end and R3 its high end. Its result, in R1, is how far the reading is outside the range. If the reading is below the low end, the result is the low end minus the reading. If it is above the high end, the result is the reading minus the high end. Inside the range, the result is 0. A reading equal to an end is inside.\n\nKeep the calling convention. If you change any of R10 to R13, put it back before you return. Leave R14 as it was; lesson 4 gives it its role. Return with `goto R15`.\n\nThere are 10 tests. Seven test `outOfRange` alone. Before each, the test puts its own words in R10 to R14, and in R15 the address of a `stop` that it adds after your program, where the call returns. The seven tests use these values for R1, R2 and R3: 60, 20, 50; 10, 20, 50; 30, 20, 50; 20, 20, 50; 50, 20, 50; -15, 20, 50; and 75, 0, 40. Each checks R1, that R10 to R14 are as they were, and that the call returned through R15. A function that runs past its last line does not count as returned.\n\nThree tests run the whole program with the fridge's reading at 60, 30 and -5. Each checks the display, the lamps, and that the program ends at its `stop`.",
  c2Hints: [
    "The idea is two comparisons, one for each end of the range, and three paths out of the function.",
    "A common mistake is to compare unsigned. A reading of -15 read unsigned is larger than 50, so the function would say it is above the range instead of below.",
    "A smaller example: for a reading of 60 and a range of 20 to 50, the result is 60 - 50, which is 10.",
    "Part of the answer: `if R1 < R2 signed goto below` jumps when the reading is below the low end.",
    "The whole answer:\n```\noutOfRange: if R1 < R2 signed goto below\n        if R3 < R1 signed goto above\n        R1 <= 0\n        goto R15\nbelow:  R1 <= R2 - R1\n        goto R15\nabove:  R1 <= R1 - R3\n        goto R15\n```",
  ],
  reflection:
    "`overBy` calls no other function. The office now wants a function that adds both rooms' amounts by calling `overBy` twice.\n\nIts own call to `overBy` writes a new return address into R15. But R15 already holds the address this function must return to.\n\nWhat must a function that calls another function keep, and where must it keep it?",
  modelVsReality:
    "Every real machine has a calling convention written down for its programs and tools. The course's is its own and follows no real machine's. Many real machines have one call instruction that always writes one register. The course's call writes whichever register its Y digit names, so the choice of R15 is the convention's choice, not the machine's.",
  largerLead:
    "Write the main program, check it in the debugger on each pair of readings, then run the tests.",
  rangeLead: "Write `outOfRange`, test it in the debugger, then run the tests.",
} as const;
