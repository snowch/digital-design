investigation: The figure runs the program in the debugger with room A at -170 and room B at -190. A breakpoint stops the program on the first line of `overBy`. Each time it pauses, a call has just reached that line.

callLead: 1. The watch shows R1, R2, R15 and the PC.
2. Press "Run to a breakpoint": the program pauses at `overBy` with the first call's arguments in R1 and R2, and R15 holding `00C`.
3. Press "Step" until the PC is back in the main program, and watch R1 take the result.
4. Do the same for the second call.

callAfter: The first call gives `overBy` -170 and -180. It returns 10, shown on the display. The second call gives -190 and -200. It returns 10 too, so ALARM turns on. The program runs 22 instructions and stops at `02C`.

construction: Which registers carry a function's arguments, which carries the result, and which a function may change is not up to each function. It is an agreement every program on the machine keeps: a **calling convention**.

The course's calling convention:

- R1 to R4 carry a function's arguments, and R1 carries the result back. A function may change R1 to R4.
- R5 to R9 are free: a function may change them, so a caller cannot rely on what they hold after a call.
- R10 to R13 are kept: a function that changes one puts it back before it returns, so a caller can keep a word in one through a call.
- R15 holds the return address. R14 gets its role in lesson 4. R0 is free.

The construction's program calls `overBy` twice and needs room A's result after the second call.

largerLead: Write the main program, check it in the debugger on each pair of readings, then run the tests.

c1Task: The starting text has the function `overBy`, as the lesson gives it, and a main program that calls it once for room A and shows the result.

Change the main program so that the display shows the larger of two amounts: room A's above -180, and room B's above -200. The program then stops.

Call `overBy` for each room. Do not change `overBy`.

There are 5 tests. Each runs the program with a pair of readings, room A's then room B's: -170 and -190; -160 and -195; -175 and -170; -190 and -210; 25 and -150. Each checks the display and that the program ends at its `stop`.

c1Hints.1: The second call puts room B's result in R1, so room A's must wait somewhere a call does not change.

c1Hints.2: A common mistake: keeping room A's result in R5. `overBy` works in R5, which the convention lets it change. The result is lost on readings such as -160 and -195, where the larger is room A's.

c1Hints.3: A smaller example: `R10 <= R1` after the first call keeps room A's result in a kept register.

c1Hints.4: Part of the answer: after the second call, `if R10 < R1 signed goto show` jumps when room B's is the larger.

c1Hints.5: The whole answer:

```
        R1 <= word[sensorA]
        R2 <= -180
        call overBy, R15
        R10 <= R1
        R1 <= word[sensorB]
        R2 <= -200
        call overBy, R15
        if R10 < R1 signed goto show
        R1 <= R10
show:   word[display] <= R1
        stop
```
