// Copyright © 2026 Christopher Snow

// The words of the lesson lists.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 2A to 2C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 ended on a question: how does a program work through a list of readings kept in memory? The shop keeps a log of room A's readings: six readings today. The office asks how many of them are warmer than -180.",
  logLead:
    'The program\'s log holds six readings, stored after the program. `count: word 6` at `038` tells how many readings there are. `log:` at `040` holds the readings themselves, oldest first, each one word, 8 bytes on from the one before.\n\nThe figure runs the program this lesson builds, and pauses each time it is about to load a reading. It draws the log as boxes, one for each word, at its address. An arrow from R1 points at the word whose address R1 holds. Press "Next reading" and watch R1 move down the log, to the last reading.',
  motivation:
    "One line for each reading makes the program as long as the log, and you need a new program for each new log. Instead, the same lines run once for each reading: a loop, as in Module 8's programs that went back with a branch.\n\nThree registers do the work:\n\n- R1 holds the address of the next reading. `R5 <= word[R1]` loads it. `R1 <= R1 + 8` moves R1 on to the next word.\n- R2 counts the readings left. It starts at `word[count]` and goes down by 1 each time round.\n- R3 counts the readings warmer than the limit.\n\n`if R2 == R0 goto done` leaves the loop when no readings are left. R0 holds 0, because a branch compares two registers.",
  prediction:
    'The figure lists the program. Make your prediction, then press "Check my prediction". The listing\'s words then show.',
  p1Question: "When the program stops, what address does R1 hold?",
  p1Explain:
    "R1 holds `070`, the address just past the log. It starts at `040`. Each time the loop runs, after the reading loads, `R1 <= R1 + 8` moves it on.\n\nThe loop runs six times, once for each reading. After the last reading at `068`, R1 moves on to `070`. Then R2 is 0, so `if R2 == R0 goto done` leaves the loop. Nothing reads the word at `070`. `068` is the last reading's address, where R1 was while that reading was loaded.",
  investigation:
    'A mark on a line that makes the run pause before that line runs is a **breakpoint**. The round mark beside each line in the figure sets or clears one.\n\nPress "Run to a breakpoint". The program runs until the next instruction is on a breakpoint line, or stops. A watch shows values you choose. If a value changed since the run last paused, the watch shows what it was before. A number in a watch is read as a program reads one: decimal, or hexadecimal after `0x`, as in `word[0x048]`. A view of the log shows seven words as boxes: the six readings, and the word after them at `070`. An arrow from each register that holds an address points at that word, and the word the last step stored has a thick outline.',
  walkLead:
    'The watch starts with R1, R2, R3 and `word[R1]`. R1 holds an address, so the watch shows R1 in hexadecimal first.\n\nA breakpoint is set on `next`. At each pause there, R1 already holds the address of the reading the next time round will load. So `word[R1]` shows that reading, not the one just counted.\n\nSo when R3 goes up, the reading that made it go up is the one before. The watch shows it as what `word[R1]` "was", and R1\'s arrow in the drawing of the log points at the word R1 has moved on to.\n\nTo add a watch, type a register or `word[...]` with an address, and press "Watch".\n\nPress "Run to a breakpoint" repeatedly. See R3 go up for each reading warmer than -180.',
  walkAfter:
    "The run pauses at `next` seven times: once before each of the six readings, and once when R2 reaches 0. The display shows 2: the readings -176 and -172 are warmer than -180. The program stops at `034` after 46 instructions run. After the last reading, at `068`, R1 moves on to `070`, the word after the log, and its arrow points there when the run stops.",
  construction:
    "A loop can leave early, as soon as it finds what it is looking for. In the challenge, the tests add data after your program: a `count` of how many readings, a `limit`, and the readings themselves at `log`.",
  firstLead: "Write the program, pause it in the loop to check your work, then run the tests.",
  c1Task:
    "Show on the display the position of the first reading warmer than the limit: 1 for the first, 2 for the second, and so on. Show 0 if no reading is warmer. A reading equal to the limit is not warmer.\n\nYour program must use three words the tests provide:\n\n- `count`: how many readings the log has\n- `limit`: the limit to compare against\n- `log`: the readings, one word each\n\nSeven tests check your program. Each gives a log and a limit:\n\n- -190, -181, -175, -170, limit -180\n- -190, -195, -200, limit -180\n- -170, -190, limit -180\n- -185, -180, -179, limit -180\n- an empty log, limit -180\n- -200, 25, -150, 30, limit -150\n- -181, -182, -183, -184, -185, -186, -170, limit -180\n\nEach checks that the display shows the right position and that your program ends at its `stop`. The starting text shows 0 and stops.",
  c1Hints: [
    "The idea: walk the log as the lesson's program does, counting positions. Leave the loop with a branch as soon as a reading is warmer.",
    "A common mistake: leaving the loop when the count reaches 0 with the last position still in the register. If no reading is warmer, the display must show 0.",
    "A smaller example: in the lesson's program, `if R4 >= R5 signed goto skip` compares the limit (R4) against the reading (R5).",
    "Part of the answer: with the limit in R3 and the reading in R5, `if R3 < R5 signed goto found` leaves the loop when the reading is warmer.",
    "The whole answer:\n\n```\n       R1 <= log\n       R2 <= word[count]\n       R3 <= word[limit]\n       R4 <= 0\n       R0 <= 0\nnext:  if R2 == R0 goto none\n       R4 <= R4 + 1\n       R5 <= word[R1]\n       if R3 < R5 signed goto found\n       R1 <= R1 + 8\n       R2 <= R2 - 1\n       goto next\nnone:  R4 <= 0\nfound: word[display] <= R4\n       stop\n```",
  ],
  failureExperiment:
    "In a defrost, a room warms above 0 for a while, so a log can hold readings of both signs. The figure runs the lesson's program twice on such a log: -184, 35, -176, 12, -190. The two programs differ in one word: one compares `signed`, the other `unsigned`.",
  signsLead: 'Predict what each program shows, then press "Run the programs".',
  signsAfter:
    "The signed program shows 3: the readings 35, -176 and 12 are all warmer than -180.\n\nRead unsigned, -180 becomes a very large number, since its top bit is 1. It is larger than 35 and 12, so they do not count as warmer. Two negative readings keep their relative order when read unsigned, so -176 still counts. This is why the unsigned program shows 1.",
  explanation:
    "A loop that processes a list has five parts.\n\n1. Set up. R1 takes the address of the first reading, R2 the count of readings, R3 the answer so far (0), R4 the limit, -180, and R0 holds 0 for comparison.\n2. Test at the top. `if R2 == R0 goto done` leaves the loop when no readings remain. An empty log with count 0 skips the body entirely, so the test comes first.\n3. Body. `R5 <= word[R1]` loads the reading, and a branch decides what to do with it.\n4. Move on. `R1 <= R1 + 8` moves to the next word (each word is 8 bytes), and `R2 <= R2 - 1` counts one done.\n5. Back. `goto next` returns to the test.",
  generalisation:
    "Every question about a list fits one pattern. Only the body changes: it can count, find or compare.\n\nOne register walks the list by address, and another tracks when to stop. In this program, the count is kept before the log. A list could end with a marker word instead, and the test would look for that word.\n\nThe body can keep a value from one time round to the next in a register. One example is the reading before.\n\nReadings are signed, so when you compare two readings you write `signed`. A count or an address is never below 0. Whether you read it as signed or unsigned, the result is the same.",
  riseLead: "Write the program, check it with breakpoints and the watch, then run the tests.",
  c2Task:
    "A sudden rise in a room's readings can mean a door left open. Show on the display the largest rise from one reading to the next: the later reading minus the earlier, for each pair of neighbours in the log.\n\nIf the readings only fall, every rise is below 0, and the largest is still the one to show.\n\nThe tests add `count` and `log` after your program. Every log has at least two readings.\n\nThere are six test logs:\n\n- -190, -181, -175, -170\n- -190, -195, -200\n- -170, -190\n- -185, -180, -179\n- -200, 25, -150, 30\n- -181, -182, -183, -184, -185, -186, -170\n\nEach checks the display and that your program ends at its `stop`.\n\nThe starting text shows 0 and stops.",
  c2Hints: [
    "The idea: walk the log keeping the earlier reading of each pair in one register and the largest rise so far in another.",
    "A common mistake: starting the largest rise at 0. A log that only falls, such as -190, -195, -200, has a largest rise of -5, and starting at 0 would show 0.",
    "A smaller example: for the log -190, -181, the only pair's rise is -181 minus -190, which is 9.",
    "Part of the answer: start the largest rise at the first pair's rise, `R3 <= R6 - R5`, with R5 the first reading and R6 the second. There is one pair fewer than readings.",
    "The whole answer:\n\n```\n         R1 <= log\n         R2 <= word[count]\n         R2 <= R2 - 1\n         R0 <= 0\n         R5 <= word[R1]\n         R6 <= word[R1 + 8]\n         R3 <= R6 - R5\nnext:    if R2 == R0 goto done\n         R6 <= word[R1 + 8]\n         R7 <= R6 - R5\n         if R7 < R3 signed goto smaller\n         R3 <= R7\nsmaller: R5 <= R6\n         R1 <= R1 + 8\n         R2 <= R2 - 1\n         goto next\ndone:    word[display] <= R3\n         stop\n```",
  ],
  reflection:
    "The office needs two temperature checks: room A's reading against its limit, -180, and room B's against -200.\n\nThe lines you write for one check work for the other, with only the reading and the limit changed. But the two checks sit in different places in the program, and each leads to different work after it, so one loop cannot run them both.\n\nWritten out twice, a mistake must be found and fixed twice.\n\nHow could a program use one piece of program from two places without writing it twice?",
  modelVsReality:
    "The log here is `word` data the assembler puts in the ROM with the program. A real shop's log would be written to RAM by a recorder, one reading at a time as each arrives.\n\nA real debugger sets a breakpoint by putting a special instruction in place of the line's word, or by having the machine compare the PC with an address. The course's debugger checks the PC before each instruction.\n\nA watch on a real machine reads registers and memory each time the machine pauses. The course's watch reads the model after every instruction.",
} as const;
