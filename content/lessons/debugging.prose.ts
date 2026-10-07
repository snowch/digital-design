// Copyright © 2026 Christopher Snow

// The words of the lesson debugging.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 6A to 6C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 5 ended on a question: how do you find the mistake in a program that runs and gives a wrong answer? The figure's program counts the log's readings warmer than the limit, -180, as lesson 2's program did. But someone has changed one line. It runs on every log and stops at its `stop`. On some logs, though, its answer is wrong.",
  resultsLead:
    'The figure gives five logs, each with the count it should show. Press "Run all" to run the program on each, and compare.',
  resultsAfter:
    "The program shows 1 for log 1, which asks for 2. It shows 0 for logs 4 and 5, which ask for 1. Logs 2 and 3 are right. Logs 1, 4 and 5 end with a reading warmer than the limit, -170. Logs 2 and 3 do not. The wrong answers are the first clue: the last reading never counts.",
  motivation:
    "A method for finding the mistake, in five steps:\n\n1. Choose a log that fails, the smallest you can, so that each run is short. Here, log 1.\n2. Say what each part of the program should leave. Before the loop, R1 should hold `log`'s address, R2 the count, 4, and R3 0. Each time round, R2 goes down by one.\n3. Set a breakpoint before the part you doubt, here `next`, and run to it.\n4. Step and watch. The first value that differs from what you said is next to the mistake.\n5. Mend the line, then run every log again, not only the one that failed.",
  prediction:
    'The program counts readings above -180. The figure lists it with log 1 after it: -190, -181, -175 and -170. The first time the run reaches `next`, 6 instructions have run. Choose an answer and press "Check my prediction". The listing\'s words then show.',
  p1Question: "When the run first reaches `next`, what does R2 hold?",
  p1Explain:
    "R2 holds 3, but the count is 4. Step 2 of the method says R2 should hold the count, 4, when the loop starts. Since it holds 3, a line before `next` is wrong. The next figure will run the program with a breakpoint on `next`.",
  investigation:
    "The figure runs log 1 with a breakpoint on `next` and watches on R1, R2 and R3. It shows the log and which reading R1 points to.",
  findLead:
    'Press "Run to a breakpoint" again and again. Before each press, predict where in the log R1 should point and what value R2 should hold. After each pause, watch the readings. Which readings does R1 reach, and does it advance?',
  findAfter:
    "At each pause at `next`, R1 and R2 change. At the four pauses, R1 holds `050`, `058`, `060` and `068`, and R2 holds 3, 2, 1 and 0. At the fourth pause, R2 is already 0, so the loop ends. R1 points at the last reading, -170, but no instruction loads it. The display shows 1, from -175. The program runs 28 instructions and stops at `038`.",
  construction:
    "Mend the count of warm readings. The tests run your program on several different logs, including an empty log.",
  mendCountLead: "Find the mistake with the debugger, mend it, and run the tests.",
  c1Task:
    "Your starting text is the lesson's program. It tries to count how many readings are warmer than the limit, but it misses one. Mend it so the display shows the right count.\n\nThe tests add `count`, `limit` and `log` after your program. All six tests use limit -180. The test logs are:\n\n- -190, -181, -175, -170\n- -170, -190\n- -190, -170\n- -170\n- an empty log\n- -200, 25, -150, 30\n\nEach test checks the display and that the program ends at its `stop`.",
  c1Hints: [
    "The idea: R2 counts the readings left. It must start at the count.",
    "A common mistake: deleting the wrong `R2 <= R2 - 1`. The one at `02C`, in the loop, counts each reading done. Without it, R2 never reaches 0, and the loop walks on past the log until the debugger pauses on a word nothing has set.",
    "A smaller example: for a log of one reading, the loop must go round once, so R2 must start at 1.",
    "Part of the answer: the line at `008` is the mistake.",
    "The whole answer: delete the line `R2 <= R2 - 1         // the readings are numbered from 0`.",
  ],
  failureExperiment:
    "Some mistakes halt the run instead of giving a wrong answer. This figure runs lesson 4's program with `sumOver`. Its first line changes from `R14 <= 0x7C0` to `R14 <= 0x400`. `400` is the first address of the RAM.",
  stackInRomLead: 'Predict how the run ends, then press "Run to the end".',
  stackInRomAfter:
    "The machine halts with cause `34` at `02C` after 6 instructions. `02C` is `sumOver`'s first push. R14 holds `3F8`, the ROM's last word. The push took 8 off `400`, moving down into the ROM. The stack grows down and must start past the RAM's last word, at `7C0`. The mistake is earlier, at `000`: which line set the value R14 held?",
  explanation:
    "How a run ends tells you where to look. The debugger says one of these:\n\n- **The program ran `stop`.** The run finished. Check what it left against what it should.\n- **The debugger cut the run off.** A loop never ends, or a return address was lost, as in lesson 4.\n- **The debugger paused: a register nothing has set.** A start is missing, such as `R14 <= 0x7C0`, or a line names the wrong register.\n- **Cause `12`, an instruction's address not a multiple of 4.** A `goto R15` with the wrong word in R15, as when pops run in the wrong order (lesson 4).\n- **Cause `21`, not an instruction.** The run went past the program's end into data or 0s: a missing `stop`, or a branch to the wrong name.\n- **Cause `31`, no memory at the address.** An address register went too far: a list walked past its end, or more pops than pushes.\n- **Cause `33`, a word's address not a multiple of 8.** An address stepped by a number that is not a multiple of 8.\n- **Cause `34`, a store to the ROM or a sensor.** A stack started in the wrong place, or a store to the log, which is in the ROM.\n\nThe instruction that halts is rarely the one that is wrong. Find which earlier line set the value it used.",
  generalisation:
    "A mistake hides until a test reaches it. The count one short was right on two logs of five.\n\nSo test on logs chosen to reach the edges: an empty log; one reading; the reading that decides the answer first or last; a reading equal to the limit; readings of both signs.\n\nFix one mistake at a time, and run every test again after each. A mended halt can uncover a second mistake behind it.\n\nThe method does not depend on the program: what each part should leave, a pause before it, and the first value that differs.",
  c2Task:
    "The program counts readings above the limit using `overBy`. For each reading it calls `overBy` and counts it when the result is not 0. The registers:\n\n- R10: log address\n- R11: readings left\n- R12: limit\n- R13: count\n\nThe program has two mistakes. Find and mend both. `overBy` is right: do not change it.\n\nThe tests add `count`, `limit` and `log` after your program. All 5 tests use limit -180:\n- -190, -181, -175, -170\n- empty log\n- -170\n- -200, 25, -150, 30\n- -185, -190\n\nEach checks the display and that the program ends at `stop`.",
  c2Hints: [
    "The idea: run, read how the run ends, find the line, mend it. Then run every log again: the second mistake shows only once the first is mended.",
    "A common mistake: stopping once the program reaches its `stop`. After the first mend it stops on every log, with a wrong count.",
    "A smaller example: the readings are words, 8 bytes apart, so an address that walks them goes up by 8 each time round.",
    "Part of the answer: the first run halts with cause `33` at `018`, the load, when R10 holds `074`. After that is mended, a breakpoint on `next` shows R11 holding 96 where the count is 4: `R11 <= count` puts the address of `count` in R11, not the word stored there.",
    "The whole answer: change `R10 <= R10 + 4` to `R10 <= R10 + 8`, and `R11 <= count` to `R11 <= word[count]`.",
  ],
  reflection:
    "You can now write a program as text, walk a log, write functions that keep the calling convention, use the stack and recursion, and find a mistake with the debugger.\n\nThe office wants a report on each day's log, from one program it can rely on.\n\nCan you write a program the shop can use?",
  modelVsReality:
    "The course's debugger can step back, because it keeps the states of the model. Most debuggers for real machines cannot; some record a run so it can be replayed.\n\nOn a real machine, a mistake like the stack started at `400` would write over the memory below it without a halt, and fail later, far from the line that is wrong. The course's machine halts at the first store to the ROM.",
  mendOverLead: "Use the method to find each mistake in turn, mend it, then run the tests.",
} as const;
