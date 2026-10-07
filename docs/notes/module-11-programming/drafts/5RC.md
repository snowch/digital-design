failureExperiment: Someone writes the deep freeze's first door address wrongly as `0D0`, the store, instead of 0. In the words, the deep freeze now leads back to the store. The figure runs `warmRooms` from the hall with these rooms, with nothing else changed.

wayBackLead: Predict how the run ends, then press "Run to the end".

wayBackAfter: The machine halts with cause `34` at `024`, pushing R15, after 571 instructions. From the deep freeze, the calls go back to the store, then `chillA`, then the deep freeze, round and round. None of these calls reaches a door that leads nowhere, so none returns. Each call that finds a room pushes 4 words. 120 words of RAM hold 30 such calls. The next push would go to `3F8`, the ROM's last word, and the ROM refuses to store there. `warmRooms` was called 34 times. The display still shows 0.

explanation: Recursion works because each call keeps its own words on the stack. When `warmRooms` follows the deep freeze's doors, the calls for the hall, the store and `chillA` have not yet returned. Each call has its own room's address, its count so far and its return address on the stack.

The registers are shared by every call. The calls take turns with them: each pushes the kept registers it uses, and pops them before it returns.

Every call that finds a room pushes what it needs, calls itself on the room behind each door, and pops before it returns.

The last case must come on every way in: a door that leads nowhere.

generalisation: Recursion fits a job whose answer is built from answers to smaller jobs of the same kind: a room's count from the counts behind its doors.

Where each part leads only one way on, as in a log, a loop does the job with no stack. Where a part leads two ways, the way back must be kept for the second door: recursion keeps it on the stack, which a loop would have to do for itself.

The stack's depth follows the longest way in, not the number of rooms. With 4 words a room, the course's 120 words of RAM hold a way in of 30 rooms.

Every recursive function needs a last case that calls nothing, reached on every way in.

farthestLead: Write `farthest`, step through its calls with the stack shown, then run the tests.

c2Task: 1. Write the function `farthest`. R1 holds a room's address or 0 for no room. Return in R1 how many rooms lie on the longest way in from that room, counting the room itself. Return 0 for no room.
2. In the lesson's store, `farthest` from the hall is 4: the hall, the store, `chillA` and the deep freeze. From `chillB` it is
1. 3. `farthest` must call itself on the room behind each door.
4. Keep the calling convention: R10 to R14 as they were when it returns, and return through R15.
5. The starting text's main program sets R14, calls `farthest` on the hall and shows the result. The tests add the rooms after your program, each as three words: the reading, then the addresses behind the two doors.
6. There are 9 tests. Five run the whole program on five sets of rooms: the lesson's store; the second store from the construction; a hall alone; a hall whose second door leads to a room whose second door leads to another; a hall with a room behind each door, the second of which leads to one more room. Each checks the display and that the program ends at its `stop`. Four call `farthest` alone, testing the lesson's store (from the store, from `chillB`, and with R1 at 0) and the second store (from the lobby). Each checks R1, R10 to R14, and the return through R15.

c2Hints.1: The longest way in from a room is 1, for the room, plus the longer of the two ways in behind its doors.

c2Hints.2: A common mistake: keeping the first door's answer in R5 or R1 through the second call. The second call changes them. Keep it in a kept register, and push that register first.

c2Hints.3: For a hall alone, both doors give 0, the longer is 0, and `farthest` returns 1.

c2Hints.4: Part of the answer: after the second call, `if R11 < R1 signed goto deeper` keeps the second door's answer when it is the longer; otherwise `R1 <= R11`. Then `deeper: R1 <= R1 + 1`.

c2Hints.5: The whole answer:
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

reflection: Two programs in this module ran to their `stop` and gave a wrong answer with no halt and no complaint: lesson 2's count compared unsigned and showed 1 where 3 was right; lesson 3's caller, whose `overBy` changed R10, showed 100 where 60 was right. The office's programs will not always be right. A count can be one short; a list can be walked with the wrong step. How do you find the mistake in a program that runs and gives a wrong answer?

modelVsReality: On a real machine, a stack that grows too far writes over whatever memory lies below it, often without halting, and the program fails later in a way that is hard to trace. The course's machine keeps its program in a ROM, so a stack that grows too far halts at the first push into the ROM with cause `34`, where the mistake shows. Real records of rooms, or of anything that leads two ways, are kept the same way: each holds the addresses of the next.
