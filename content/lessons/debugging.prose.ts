// Copyright © 2026 Christopher Snow

// The words of the lesson debugging.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 6A to 6C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 5 ended with a question: how do you find the mistake in a program that runs and gives a wrong answer?\n\nThe figure's program is the counting program. It counts the readings in a log that are warmer than the limit, -180, as lesson 2's program did. One of its lines is wrong.\n\nOn the figure's five logs, the program runs to its `stop` every time. On some logs, its answer is wrong.",
  resultsLead:
    'The figure gives five logs, each with the number it should show: press "Run all" to run the program on each, and compare.',
  resultsAfter:
    "The program shows 1 on log 1, which should show 2. It shows 0 on logs 4 and 5, which should show 1. Logs 2 and 3 are right.\n\nLogs 1, 4 and 5 end with a reading warmer than the limit. Logs 2 and 3 do not.\n\nThe wrong answers are the first clue. The last reading never counts.",
  motivation:
    "Use this method to find the mistake:\n\n1. Choose a log that fails, as short as you can, so that each run is short. Log 5 has one reading, but on it the loop never runs, so there is nothing to step through. Log 4, two readings, is the shortest log that goes round the loop.\n2. Say what each part of the program should leave. Before the loop, R1 should hold `log`'s address, `050`; R2 the number of readings, 2; R3 0. Each time round, R2 goes down by 1.\n3. Set a breakpoint before the part you doubt, here `next`, and run to it.\n4. Step and watch. The first value that differs from what you said is next to the mistake.\n5. Mend the line, then run every log again, not only the one that failed.",
  prediction:
    'The figure lists the program with log 4 after it: the readings -190 and -170.\n\nThe first time the run reaches `next`, 6 instructions have run.\n\nChoose an answer and press "Check my prediction". Then the listing shows each line\'s word.',
  p1Question: "When the run first reaches `next`, what does R2 hold?",
  p1Explain:
    "When the run reaches `next`, R2 holds 1, where the log has 2 readings. Step 2 of the method says R2 should hold 2 when the loop starts. It holds 1, so the mistake is in a line that runs before `next`.\n\nThe next figure runs the program with a breakpoint on `next`.",
  investigation:
    "The figure runs log 4 with a breakpoint on `next`. It watches R1, `word[R1]`, R2 and R3. The log is shown, and the reading that R1 points at is marked.",
  findLead:
    '1. Press "Run to a breakpoint" again and again.\n2. Before each press, say where R1 should point and what R2 should hold.\n3. At each pause, compare: which readings does R1 reach, and is each one loaded?',
  findAfter:
    "The run paused twice. After 6 instructions, R1 held `050`, R2 held 1 and R3 held 0. After 12 instructions, R1 held `058`, R2 held 0 and R3 held 0. R2 is 0, so the loop ends. R1 points at the last reading, -170, at `058`, but no instruction loads it. The display shows 0, where log 4 should show 1. The program ran 15 instructions and stopped at `038`.",
  construction:
    "Mend the counting program. Its tests run it on seven logs, among them an empty log and a log with a reading equal to the limit.",
  mendCountLead: "Find the mistake with the debugger, mend it, and run the tests.",
  c1Task:
    'The starting text is the lesson\'s counting program. It should show the number of readings warmer than the limit. One of its lines is wrong. Mend it.\n\nThe tests add `count`, `limit` and `log` after your program, all with the limit -180. "Run with" lists the 7 logs. Each test checks the display and that the program ends at its `stop`.',
  c1Hints: [
    "The idea: R2 counts the readings left. When the loop starts it must hold the number of readings, the word at `count`.",
    "A common mistake: deleting the `R2 <= R2 - 1` inside the loop, at `02C`. That line counts each reading as it is done. Without it, R2 never reaches 0, and the run keeps going past the log.",
    "A smaller example: for a log of one reading, the loop must go round once, so R2 must hold 1 when it reaches `next`.",
    "Part of the answer: the mistake is in one of the lines before `next`, which run once.",
    "The whole answer: delete the line at `008`, `R2 <= R2 - 1`. Its comment says the readings are numbered from 0.",
  ],
  failureExperiment:
    "Some mistakes halt the run instead of giving a wrong answer.\n\nThe figure's program counts the warm readings, keeps the number in a word whose address is in R6, and then shows it. Its log is the one at `050`, with four readings. The limit is -180.",
  explanation:
    "How a run ends tells you where to look.\n\n- **The program ran `stop`.** The run finished. Check what it left against what it should.\n- **The debugger cut the run off** after 5000 instructions. A loop never ends, or a return address was lost, as in lesson 4.\n- **The debugger ended the run: a register nothing has set.** A start is missing, such as `R14 <= 0x7C0`; a line names the wrong register; or a log walked past its end into RAM nothing has written, whose words are not set (the counting program as first given walks off an empty log this way: its line at `008` makes R2 start below 0).\n- **Cause `11`, an instruction's address outside the ROM.** A `goto R15` with a word in R15 that is not an address in the ROM, such as a reading or a stack address.\n- **Cause `12`, an instruction's address in the ROM but not a multiple of 4.** A `goto R15` with the wrong word in R15, as when pops run in the wrong order (lesson 4).\n- **Cause `21`, not an instruction.** The run went past the program's end into data or 0s: a missing `stop`, or a branch to the wrong name.\n- **Cause `31`, no memory at the address.** An address register went past the memory: a loop of pops that takes R14 up past `7C0` through the devices, or a log walked backwards past its first reading.\n- **Cause `33`, a word's address not a multiple of 8.** An address stepped by a number that is not a multiple of 8.\n- **Cause `34`, a store to the ROM or a sensor.** A stack started in the wrong place, or a store to the log, which is in the ROM, as in the failure experiment.\n\nThe instruction that halts is rarely the one that is wrong: find which earlier line set the value it used.",
  generalisation:
    "A mistake hides until a test reaches it. The counting program was right on two of its five logs.\n\nSo test on logs chosen to reach the edges: an empty log; one reading; a log whose first or last reading is the one that changes the answer; a reading equal to the limit; readings of both signs.\n\nMend one mistake at a time, and run every test again after each. A mended halt can uncover a second mistake behind it.\n\nThe method does not depend on the program: say what each part should leave, set a breakpoint before it, and find the first value that differs.",
  c2Task:
    "The starting text counts the log's readings above the limit with the function `overBy` from lesson 3. For each reading, it calls `overBy`, and counts the reading when the result is not 0.\n\nIt keeps the log's address in R10, the readings left in R11, the limit in R12 and the number of readings above the limit in R13.\n\nIt has two mistakes. Find and mend both. `overBy` is right: do not change it.\n\nThe tests add `count`, `limit` and `log` after your program, all with the limit -180. \"Run with\" lists the 6 logs, among them an empty log and a log with a reading equal to the limit. Each test checks the display and that the program ends at its `stop`.",
  c2Hints: [
    "The idea: run, read how the run ends, find the line, mend it. Then run every log again: one mistake can hide the other.",
    "A common mistake: stopping once the program reaches its `stop`. With one mistake mended, the other can still give a wrong number, or a halt on some logs.",
    "A smaller example: the readings are words, 8 bytes apart, so an address that walks them goes up by 8 each time round.",
    "Part of the answer: on log -190, -181, -175, -170 the first run halts with cause `33` at `018`, the load, with R10 at `074`. A breakpoint on `next` shows, at its first pause, R11 holding 96, which is `060`, the address of `count`. The log has 4 readings.",
    "The whole answer: change `R10 <= R10 + 4` to `R10 <= R10 + 8`, and `R11 <= count` to `R11 <= word[count]`.",
  ],
  reflection:
    "You can now write a program as text, walk a log, write functions that keep the calling convention, use the stack and recursion, and find a mistake with the debugger.\n\nThe office wants a report on each day's log, from one program it can rely on.\n\nCan you write a program the shop can use?",
  modelVsReality:
    "The course's debugger can step back, because it keeps the states of the model. Most debuggers for real machines cannot; some record a run so it can be replayed.\n\nReal programmers choose test inputs at the edges in the same way, and keep the ones that once found a mistake, so the mistake cannot come back unseen.",
  mendOverLead: "Use the method to find each mistake in turn, mend it, then run the tests.",
  countToLogLead: 'Predict how the run ends, then press "Run to the end".',
  countToLogAfter:
    "The machine halts with cause `34` at `034`, after 33 instructions. `034` is `word[R6] <= R3`, a store to the ROM. R6 holds `050`, the log's address, which is in the ROM.\n\nThe halt is at `034`, but the line that is wrong is at `000`. `R6 <= log` should put a word of the RAM in R6, such as `0x400`.\n\nThe display still shows 0. The store to the display comes after the halt.\n\nThe instruction that halts used a value an earlier line set. Find the line that set it.",
  edgeListingLead:
    "Another counting program, with one line wrong: it counts a reading equal to the limit as warmer. Its branch skips a reading only when the reading is colder than the limit.",
  edgeLogLead:
    "Choose the log that shows the mistake, say what a right program shows on it, then run the tests.",
  edgeTask:
    "Each log has the limit -180. Choose one of these four:\n\n1. A log of -190 and -185.\n2. A log of -170, -175 and -160.\n3. A log of -180 and -190.\n4. An empty log.\n\nThe question asks two things:\n\n1. Which one log would show the mistake?\n2. What should a right program show on the log you chose?\n\nThe second question matters because a tester chooses an input and says what the right answer is before the run.\n\nThere are 2 tests, one for each answer.",
  edgeHints: [
    "The idea: a mistake shows only on a log whose right answer differs from the program's.",
    "A common mistake: choosing a long log. Length does not matter here; the reading's value does.",
    "A smaller example: a log of one reading, -150, is warmer than -180, so both programs count it.",
    "Part of the answer: the program and a correct program differ only on a reading equal to the limit.",
    "The whole answer: the log with -180 and -190. The program shows 1, where 0 is right.",
  ],
} as const;
