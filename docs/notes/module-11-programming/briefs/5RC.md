# Brief 5RC: lesson `recursion` (Module 11, lesson 5), rebuilt, third part

Read `00-module.md` (the shared fact sheet) and briefs `5RA.md` and `5RB.md` (the cold store,
`warmRooms` and its run) first. You may use every term of lessons 1 to 5 (not in bold). Never
write "frame", "tree", "node", "child" or "parent".

Keys to write: `failureExperiment`, `wayBackLead`, `wayBackAfter`, `explanation`,
`generalisation`, `farthestLead`, `c2Task`, `c2Hints` (five), `reflection`, `modelVsReality`.

## failureExperiment (about 50 words)

1. Someone records the deep freeze's first door wrongly: it holds the store's address, `0D0`, not
   0. In the words, the deep freeze now leads back to the store.
2. The figure runs `warmRooms` from the hall on these rooms. Nothing else changed.

## wayBackLead (one sentence, directly above the figure)

Predict how the run ends, then press "Run to the end".

## wayBackAfter (about 90 words, shown once the run has ended)

1. The machine halts with cause `34` at `024`, the push of R15, after 571 instructions.
2. From the deep freeze, the calls go back to the store, then `chillA`, then the deep freeze, round
   and round. None of these calls reaches a door that leads nowhere, so none returns.
3. Each call that finds a room pushes 4 words. 120 words of RAM hold 30 such calls. The next push
   went to `3F8`, the ROM's last word, and the ROM refuses a store.
4. `warmRooms` was called 34 times, and the display still shows 0.

## explanation (about 110 words, a list allowed)

1. Recursion works because each call keeps its own words on the stack. When `warmRooms` is
   following the deep freeze's doors, the calls for the hall, the store and `chillA` have not yet
   returned. Each of them has its own room's address, its count so far and its return address on
   the stack.
2. The registers are shared by every call. The calls take turns with them: each pushes the kept
   registers it uses, and pops them before it returns.
3. Every call that finds a room: pushes what it needs after its calls; calls itself on the room
   behind each door; pops and returns.
4. The last case must come on every way in: here, a door that leads nowhere.

## generalisation (about 90 words)

1. Recursion fits a job whose answer is built from answers to smaller jobs of the same kind: a
   room's count from the counts behind its doors.
2. Where each part leads only one way on, as in a log, a loop does the job with no stack. Where a
   part leads two ways, the way back must be kept for the second door: recursion keeps it on the
   stack, which a loop would have to do for itself.
3. The stack's depth follows the longest way in, not the number of rooms. With 4 words a room,
   the course's 120 words of RAM hold a way in of 30 rooms.
4. Every recursive function needs a last case that calls nothing, reached on every way in.

## farthestLead (one sentence, directly above the challenge)

Write `farthest`, step through its calls with the stack shown, then run the tests.

## c2Task (about 150 words, a numbered list)

1. Write the function `farthest`. R1 holds a room's address, or 0 for no room. Return in R1 how
   many rooms lie on the longest way in from that room, counting the room itself. Return 0 for no
   room.
2. In the lesson's store, `farthest` from the hall is 4: the hall, the store, `chillA` and the
   deep freeze. From `chillB` it is 1.
3. `farthest` must call itself on the room behind each door.
4. Keep the calling convention: R10 to R14 as they were when it returns, and return through R15.
5. The starting text's main program sets R14, calls `farthest` on the hall and shows the result.
   The tests add the rooms after your program, each as three words: the reading, then the
   addresses behind the two doors.
6. There are 9 tests. Five run the whole program on five sets of rooms: the lesson's store; the
   second store from the construction; a hall alone; a hall whose second door leads to a room,
   whose second door leads to another; a hall with a room behind each door, the second of which
   leads to one more room. Each checks the display and that the program ends at its `stop`. Four
   call `farthest` alone: on the lesson's store, from the store, from `chillB`, and with R1 at 0;
   on the second store, from the lobby. Each checks R1, R10 to R14, and the return through R15.

## c2Hints (five, in this order)

1. The idea: the longest way in from a room is 1, for the room, plus the longer of the two ways in
   behind its doors.
2. A common mistake: keeping the first door's answer in R5 or R1 through the second call. The
   second call changes them. Keep it in a kept register, and push that register first.
3. A smaller example: for a hall alone, both doors give 0, the longer is 0, and `farthest` returns
   1.
4. Part of the answer: after the second call, `if R11 < R1 signed goto deeper` keeps the second
   door's answer when it is the longer; otherwise `R1 <= R11`. Then `deeper: R1 <= R1 + 1`.
5. The whole answer:

```
farthest: R0 <= 0
        if R1 == R0 goto none
        R14 <= R14 - 8
        word[R14] <= R15
        R14 <= R14 - 8
        word[R14] <= R10
        R14 <= R14 - 8
        word[R14] <= R11
        R10 <= R1
        R1 <= word[R10 + 8]
        call farthest, R15
        R11 <= R1
        R1 <= word[R10 + 16]
        call farthest, R15
        if R11 < R1 signed goto deeper
        R1 <= R11
deeper: R1 <= R1 + 1
        R11 <= word[R14]
        R14 <= R14 + 8
        R10 <= word[R14]
        R14 <= R14 + 8
        R15 <= word[R14]
        R14 <= R14 + 8
        goto R15
none:   R1 <= 0
        goto R15
```

## reflection (about 80 words)

1. Two programs in this module ran to their `stop` and gave a wrong answer with no halt and no
   complaint: lesson 2's count compared unsigned and showed 1 where 3 was right; lesson 3's caller,
   whose `overBy` changed R10, showed 100 where 60 was right.
2. The office's programs will not always be right. A count can be one short; a list can be walked
   with the wrong step.
3. End on the question: how do you find the mistake in a program that runs and gives a wrong
   answer?

## modelVsReality (about 70 words)

1. On a real machine, a stack that grows too far writes over whatever memory lies below it, often
   with no halt at all, and the program fails later in a way that is hard to trace.
2. The course's machine keeps its program in a ROM, so a stack that grows too far halts at the
   first push into the ROM, with cause `34`, where the mistake shows.
3. Real records of rooms, or of anything that leads two ways, are kept the same way: each holds
   the addresses of the next.
