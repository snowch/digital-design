failureExperiment: Two programs both add room A's amount above -180 to room B's above -200. After calling `overBy` the first time, the first program keeps room A's result in R10 for the second call: `R10 <= R1`. The calling convention allows this. In the second program, `overBy` uses R10 instead of R5, and does not restore it before returning. The function changes a register the calling convention says it must keep.

spoiledLead: Predict what each program shows on the display, then press "Run the programs".

spoiledAfter: The first program shows 60 on the display: room A's 10 and room B's 50 above their limits. R10 still holds 10 at the end. The second shows 100. Its `overBy` left room B's 50 in R10, so the program added 50 and 50 instead of 10 and 50. The function computes the right amount each time. It breaks the program by overwriting a register the calling convention says it must preserve.

explanation: The machine has no notion of a function. `call overBy, R15` is an instruction of kind 6: it puts the address of the next instruction into R15 and goes to `overBy`. R15 is chosen only because programs agree on it. `goto R15` is a jump to an address a register holds, like any other jump. The machine does not check whether a function preserves R10 to R13 or leaves its answer in R1. The second program broke the agreement, and the machine ran to its `stop` without complaint. A calling convention is an agreement between programs, not part of the machine. It lets a function one person wrote be called from programs another person wrote, and lets a test call a function alone.

generalisation: A function is written once and used from any call that can reach it. A mistake in it is fixed in one place. A function can be tested by itself: give it arguments, call it, check its answer and the registers it must keep. The challenge tests do that. Each call costs two instructions more: the call and the jump back. For a short piece used twice, the program is no shorter. For a longer piece or one used many times, it saves space.

rangeLead: Write `outOfRange`, test it in the debugger, then run the tests.

c2Task: The shop's fridge must stay between 2.0 and 5.0 degrees (readings 20 to 50). Its sensor is the one programs read as `sensorA`. A program calls `outOfRange` with the fridge's reading in R1, 20 in R2 and 50 in R3, shows the result on the display, and turns ALARM on when the result is not 0. The starting program's `outOfRange` returns 0 every time. Write `outOfRange`. R1 holds a reading, R2 the low end of its range, R3 the high end. Return in R1 how far the reading is outside the range: the low end minus the reading when below, the reading minus the high end when above, and 0 when inside. A reading equal to an end is inside. Keep the calling convention: R10 to R14 as they were when it returns, and return with `goto R15`. The test suite includes seven calls to `outOfRange` alone with different values for R1, R2 and R3, checking R1, R10 to R14, and the return. Three runs test the whole program with the fridge at 60, 30 and -5, checking the display, the lamps and the program's end.

c2Hints.1: The idea is two comparisons, one for each end of the range, and three paths out of the function.

c2Hints.2: A common mistake is to compare unsigned. A reading of -15 read unsigned is larger than 50, so the function would say it is above the range instead of below.

c2Hints.3: A smaller example: for a reading of 60 and a range of 20 to 50, the result is 60 - 50, which is 10.

c2Hints.4: Part of the answer: `if R1 < R2 signed goto below` jumps when the reading is below the low end.

c2Hints.5: The whole answer:
```
outOfRange: if R1 < R2 signed goto below
        if R3 < R1 signed goto above
        R1 <= 0
        goto R15
below:  R1 <= R2 - R1
        goto R15
above:  R1 <= R1 - R3
        goto R15
```

reflection: `overBy` calls no other function. The office now wants a function that adds both rooms' amounts by calling `overBy` twice. Its own call to `overBy` writes a new return address into R15. But R15 already holds the address this function must return to. What must a function that calls another function keep, and where must it keep it?

modelVsReality: Every real machine has a calling convention written down for its programs and tools, so functions from different authors and tools work together. The course's is its own and follows no real machine's. Many real machines have one call instruction that always writes one register. The course's call writes whichever register its Y digit names, so the choice of R15 is the convention's choice, not the machine's.
