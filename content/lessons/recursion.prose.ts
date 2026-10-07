// Copyright © 2026 Christopher Snow

// The words of the lesson recursion.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 5A to 5C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 4 asked: can a function call itself? The office wants today's log shown on the display newest first. The log records its readings oldest first: -184, -190, -176, -181. A loop that walks the log from the start meets the oldest reading first, so it cannot show them newest first. The figure shows how many words are on the stack as the program runs to display the log newest first.",
  depthLead:
    "As the program runs, the stack grows by 2 words four times, reaching 8 words at its deepest. Then it shrinks by 2 words four times, back to empty. Each time the stack shrinks by 2 words, the program shows a reading on the display.",
  motivation:
    "The function `newest` shows a list newest first. Its arguments are the list's address in R1 and the count of readings it has in R2.\n\nIf the list is empty, `newest` shows nothing and returns.\n\nOtherwise, it pushes R15 and the address of its first reading onto the stack. It then calls `newest` on the rest of the list: the address 8 bytes on, and one reading fewer. When that call returns, the rest has been shown newest first. It pops the address and R15 from the stack, and shows its first reading last.\n\nA function that calls itself is **recursion**. The call on an empty list is the last case: it calls nothing, so the calls end there. Each call has its own frame, so each keeps its own return address and its own reading's address.",
  prediction:
    'Below is the debugger on the program, showing the stack. As the program runs, watch the stack grow and shrink. Choose an answer to your prediction and press "Check my prediction". Once you do, the buttons will work.',
  p1Question: "In what order does the display show the readings?",
  p1Explain:
    "The display shows -181, -176, -190, -184: the log newest first. No call shows its reading until the call it makes for the rest returns. The deepest call shows the newest reading, which is -181, and this appears first on the display. Then, as each call at a shallower depth returns, it shows its own reading. So -176 appears next, then -190, and finally -184. The first call, on the whole list, shows the oldest reading, -184, last.",
  investigation:
    "The program runs with a breakpoint on `newest`'s first line. Watch R1, R2 and R14. The figure shows the stack with each call's frame.",
  framesLead:
    '1. Press "Run to a breakpoint" again and again. Each pause shows a new call of `newest`.\n2. At each pause, R1 holds the list\'s address and R2 its count: `060` and 4, `068` and 3, `070` and 2, `078` and 1, `080` and 0.\n3. Watch the stack grow by one frame of 2 words each time.\n4. After the fifth pause, step. Watch each reading appear as a frame is popped.',
  framesAfter:
    "1. The program calls `newest` five times: once for each of the four readings, once for the empty list after the last.\n2. At the deepest, R14 holds `780`. Four frames hold 8 words. The fifth call, on the empty list, pushes nothing.\n3. The display shows -181, -176, -190, -184. 72 instructions run, and the program stops at `010`.",
  construction:
    "Write another function that calls itself. The tests check the readings shown on the display, in order, and that the stack grew by at least one word for each reading. A loop walking the log backwards cannot pass.",
  colderLead: "Write `colder`, step through its calls with the stack shown, then run the tests.",
  c1Task:
    "1. Write the function `colder`. R1 holds the address of a list of readings, R2 how many it has, and R3 a limit. Show on the display, newest first, each reading colder than the limit. A reading equal to the limit is not colder.\n2. `colder` must call itself, once for each reading, as `newest` does.\n3. The starting text sets up R14, puts the log, count, and limit into R1, R2, and R3, calls `colder`, and stops. The `colder` function is a stub that returns at once.\n4. The tests provide 6 different logs, all with the limit -200:\n   - -190, -181, -205, -170, -210\n   - -205, -215, -190\n   - -190, -180\n   - -250\n   - an empty log\n   - -201, -200, -199, -300\n5. Each test checks that the display shows the readings in order, that the stack held at least as many words as the log has readings, and that the program ends at its `stop`.",
  c1Hints: [
    "The idea: `newest` with one more decision: show a reading only when it is colder than the limit.",
    "A common mistake: deciding before the call. The reading must be shown after the call returns, or the order is oldest first.",
    "A smaller example: for the log -190, -205 and the limit -200, only -205 is colder, and the display shows -205.",
    "Part of the answer: after the pops and `R5 <= word[R1]`, `if R5 >= R3 signed goto none` skips the store when the reading is not colder.",
    "The whole answer:\n\n```\ncolder: R0 <= 0\n        if R2 == R0 goto none\n        R14 <= R14 - 8\n        word[R14] <= R15\n        R14 <= R14 - 8\n        word[R14] <= R1\n        R1 <= R1 + 8\n        R2 <= R2 - 1\n        call colder, R15\n        R1 <= word[R14]\n        R14 <= R14 + 8\n        R15 <= word[R14]\n        R14 <= R14 + 8\n        R5 <= word[R1]\n        if R5 >= R3 signed goto none\n        word[display] <= R5\nnone:   goto R15\n```",
  ],
  failureExperiment:
    "The first figure runs `newest` without its last case: the line `if R2 == R0 goto none` is gone. R2 goes on down past 0, and every call makes another.",
  noLastLead: 'Predict how the run ends, then press "Run to the end".',
  noLastAfter:
    "1. The machine halts with cause `34` at `01C`, the push of R15, after 486 instructions.\n2. `newest` has been called 61 times, and none has returned.\n3. Each call pushed 2 words. After 60 calls the stack filled the RAM down to `400`. The 61st call's push went to `3F8`, the ROM's last word, and the ROM refuses a store.\n4. Nothing was shown.",
  tooLongLead:
    "`newest` with its last case is right, but its stack has room for only so many readings. The second figure counts the stack's words in a run on a log of 61 readings. Each reading takes 2 words. 60 readings fill the RAM's 120 words exactly; the 61st reading's push reaches the ROM, and the machine halts with cause `34` at `020`.",
  explanation:
    "Recursion works because each call has its own frame. When five calls of `newest` ran at once, the four handling readings each kept its own return address and its reading's address on the stack. Registers are shared by every call. The stack is not.\n\nEvery call but the last one:\n\n- pushes what it needs after the call;\n- calls itself on a smaller list;\n- pops and finishes.\n\nThe last case must come. It must call nothing. The list shrinks by one reading each call, so the call on the empty list is reached.\n\nThe reading shows after the call returns, so the newest shows first. For a log of n readings, `newest` is called n + 1 times. The stack holds 2n words at its deepest.",
  generalisation:
    "A recursive function suits a job whose answer for a list is built from the answer for the rest of it. Here, the rest comes newest first, then the first reading.\n\nThe same job can be done by a loop that walks the log from its end. That loop needs no stack. Recursion keeps on the stack what the loop would work out from the count.\n\nEach level of recursion costs stack. The course's machine has 120 words of RAM for the stack, so `newest` can show at most 60 readings.\n\nEvery recursive function needs a last case that calls nothing, reached for every argument.",
  depthsLead: "Work out each answer from the lesson's program, then run the tests.",
  c2Task:
    "For `newest` on a log of 5 readings, work out:\n\n- how many words the stack holds at its deepest;\n- the address R14 holds at that point, in hexadecimal;\n- the most readings a log can have for `newest` to show them all on the course's machine.\n\nThere are 3 tests, one for each.",
  c2Hints: [
    "The idea: each reading's call pushes a frame of 2 words, and the call on the empty list pushes nothing.",
    "A common mistake: counting a frame for the call on the empty list.",
    "A smaller example: for the lesson's log of 4 readings, the stack holds 8 words at its deepest, and R14 holds `780`.",
    "Part of the answer: 5 readings make 10 words, and 10 words are `050` bytes below `7C0`.",
    "The whole answer: 10 words, `770`, and 60 readings.",
  ],
  reflection:
    "Every program so far did what it was meant to or failed at once with a clear reason.\n\nThe office's programs will not always be right. A count can be one short. A push can be forgotten. A comparison can read signed readings as unsigned.\n\nSuch a program runs and gives an answer, and the answer is wrong.\n\nHow do you find the mistake in a program that runs and gives a wrong answer?",
  modelVsReality:
    "On a real machine, a stack that grows too far writes over whatever memory lies below it, often with no halt at all, and the program fails later in a way that is hard to trace.\n\nThe course's machine keeps its program in a ROM, so a stack that grows too far halts at the first push into the ROM, with cause `34`. The mistake shows where it happens.",
} as const;
