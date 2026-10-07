# Brief 3RB: lesson `functions` (Module 11, lesson 3), revised, second part

Read `00-module.md` (the shared fact sheet) first; it applies here. You may use **assembly**,
**assembler**, **debugger**, **breakpoint**, **function** and **argument** (not in bold). This
part introduces **calling convention**: set it in bold where it is first used, in
`construction`, plain meaning first. No later term (stack, recursion) may appear.

The program is brief 3RA's: the main program calls `overBy` from `008` and `018`; `overBy` is at
`030` and works in R5, then puts its result in R1.

Keys to write: `investigation`, `callLead`, `callAfter`, `construction`, `largerLead`, `c1Task`,
`c1Hints` (five).

## investigation (about 30 words)

The figure runs the program in the debugger with room A at -170 and room B at -190, and a
breakpoint on the first line of `overBy`. Each pause comes just after a call has gone to the
function.

## callLead (about 60 words, a numbered list, directly above the figure)

1. The watch shows R1, R2, R15 and the PC.
2. Press "Run to a breakpoint": the run pauses at `overBy` with the first call's arguments in R1
   and R2, and R15 holding `00C`.
3. Press "Step" until the PC is back in the main program, and watch R1 take the result.
4. Do the same for the second call.

## callAfter (about 50 words, shown once the run has ended)

1. The first call gives `overBy` -170 and -180, and it returns 10, which the program shows on the
   display.
2. The second call gives -190 and -200. It returns 10 too, so ALARM turns on.
3. 22 instructions run, and the program stops at `02C`.

## construction (about 130 words, a list allowed)

1. Which registers carry the arguments, which the result, and which a function may change is not
   up to each function. It is an agreement every program on the machine keeps: a **calling
   convention**.
2. The course's calling convention:
   - R1 to R4 carry a function's arguments, and R1 carries its result back. A function may change
     R1 to R4.
   - R5 to R9 are free: a function may change them, so a caller cannot rely on what they hold
     after a call.
   - R10 to R13 are kept: a function that changes one puts it back before it returns, so a caller
     can keep a word in one through a call.
   - R15 holds the return address. R14 gets its role in lesson 4. R0 is free.
3. The construction's program calls `overBy` twice and needs room A's result after the second
   call. Do not say which register to keep it in.

## largerLead (one sentence, directly above the challenge)

Write the main program, check it in the debugger on each pair of readings, then run the tests.

## c1Task (about 110 words, a list allowed)

1. The starting text has the function `overBy`, as the lesson gives it, and a main program that
   calls it once for room A and shows the result.
2. Change the main program so that the display shows the larger of two amounts: room A's above
   -180, and room B's above -200. Then it stops.
3. Call `overBy` for each room. Do not change `overBy`.
4. There are 5 tests. Each runs the program with a pair of readings, room A's then room B's:
   -170 and -190; -160 and -195; -175 and -170; -190 and -210; 25 and -150. Each checks the
   display and that the program ends at its `stop`.

## c1Hints (five, in this order)

1. The idea: the second call puts room B's result in R1, so room A's must wait somewhere a call
   does not change.
2. A common mistake: keeping room A's result in R5. `overBy` works in R5, which the convention
   lets it change. The result is lost on readings such as -160 and -195, where the larger is
   room A's.
3. A smaller example: `R10 <= R1` after the first call keeps room A's result in a kept register.
4. Part of the answer: after the second call, `if R10 < R1 signed goto show` jumps when room B's
   is the larger.
5. The whole answer:

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
