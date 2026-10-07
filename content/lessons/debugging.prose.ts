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
    'The figure is the debugger on the program, with log 1 after it. The first time the run reaches `next`, 6 instructions have run. Choose an answer and press "Check my prediction". The buttons then work.',
  p1Question: "When the run first reaches `next`, what does R2 hold?",
  p1Explain:
    "R2 holds 3, where the count is 4. Step 2 of the method says R2 should hold the count, 4. It holds 3, so the mistake is before `next`. Line `008`, `R2 <= R2 - 1`, takes one off. Its comment says the readings are numbered from 0, but R2 is a count of readings, not a reading's number. With 3 left to count, the loop stops one reading early.",
  investigation:
    "The figure runs log 1 with a breakpoint on `next` and watches on R1, R2 and R3. It shows the log and which reading R1 points to.",
  findLead:
    'Press "Run to a breakpoint" again and again. Before each press, predict where in the log R1 should point and what value R2 should hold. After each pause, watch the readings carefully. Which readings does R1 reach, and does it advance?',
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
    "Some mistakes stop the run instead of giving a wrong answer. The figure shows lesson 4's `total` program with one change: the first line is `R14 <= 0x400` instead of `R14 <= 0x7C0`. `400` is the start of the RAM. Run it to see what happens.",
  stackInRomLead: 'Predict how the run ends, then press "Run to the end".',
  stackInRomAfter:
    "The machine halts with cause `34` at `01C` after 5 instructions: a store to the ROM. `01C` is `total`'s first push. R14 holds `3F8`: the push took 8 off `400` before it stored, and `3F8` is the ROM's last word. The halt is at `01C`, but the mistake is at `000`. The stack must start past the RAM's last word, at `7C0`, because it grows down. Which earlier line set the value that the halting instruction used?",
  explanation:
    "How a run ends tells you where to look. The debugger says one of these:\n\n- **The program ran `stop`.** The run finished. Check what it left against what it should.\n- **The debugger cut the run off.** A loop never ends, or a return address was lost, as in lesson 4.\n- **The debugger paused: a register nothing has set.** A start is missing, such as `R14 <= 0x7C0`, or a line names the wrong register.\n- **Cause `21`, not an instruction.** The run went past the program's end into data or 0s: a missing `stop`, or a branch to the wrong name.\n- **Cause `31`, no memory at the address.** An address register went too far: a list walked past its end, or more pops than pushes.\n- **Cause `33`, a word's address not a multiple of 8.** An address stepped by 4 where a word needs 8.\n- **Cause `34`, a store to the ROM or a sensor.** A stack started in the wrong place, or a store to the log, which is in the ROM.\n\nThe instruction that halts is rarely the one that is wrong. Find which earlier line set the value it used.",
  generalisation:
    "A mistake hides until a test reaches it. The count one short was right on two logs of five.\n\nSo test on logs chosen to reach the edges: an empty log; one reading; the reading that decides the answer first or last; a reading equal to the limit; readings of both signs.\n\nFix one mistake at a time, and run every test again after each. A mended halt can uncover a second mistake behind it.\n\nThe method does not depend on the program: what each part should leave, a pause before it, and the first value that differs.",
  mendTotalLead: "Use the method to find each mistake in turn, mend it, then run the tests.",
  c2Task:
    "The starting text is lesson 4's program with `total` and `above`, with two mistakes in it. It should show on the display both rooms' amounts above their limits, added: room A's above -180 and room B's above -200.\n\nFind and mend both mistakes.\n\nThere are 4 tests, each a pair of readings for room A and room B: -170 and -190; 25 and -210; -185 and 30; -185 and -210. Each checks the display and that the program ends at its `stop`.",
  c2Hints: [
    "The idea: run, read how the run ends, find the line, mend it; then run again for the next mistake.",
    "A common mistake: stopping when the program stops at its `stop`. The second mistake shows only on readings above 0.",
    "A smaller example: lesson 4's `total` pushes R15 before R10, and pops R15 after R10.",
    "Part of the answer: every run halts with cause `31` at `044`. `total` never pushes R15, so its `goto R15` goes back into `total`, and each pop takes R14 another word up, past the RAM and the devices, until it reads `7F8`, where there is no memory.",
    "The whole answer: add `R14 <= R14 - 8` and `word[R14] <= R15` at the start of `total`, and `R15 <= word[R14]` and `R14 <= R14 + 8` after the pop of R10. Then in `above`, change `unsigned` to `signed`.",
  ],
  reflection:
    "You can now write a program as text, walk a log, write functions that keep the calling convention, use the stack and recursion, and find a mistake with the debugger.\n\nThe office wants a report on each day's log, from one program it can rely on.\n\nCan you write a program the shop can use?",
  modelVsReality:
    "The course's debugger can step back, because it keeps the states of the model. Most debuggers for real machines cannot; some record a run so it can be replayed.\n\nOn a real machine, a mistake like the stack started at `400` would write over the memory below it without a halt, and fail later, far from the line that is wrong. The course's machine halts at the first store to the ROM.",
} as const;
