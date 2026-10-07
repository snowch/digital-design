# Brief 3RC: lesson `functions` (Module 11, lesson 3), revised, third part

Read `00-module.md` (the shared fact sheet) first; it applies here. You may use **assembly**,
**assembler**, **debugger**, **breakpoint**, **function**, **argument** and **calling
convention** (none in bold). No later term (stack, recursion) may appear.

Keys to write: `failureExperiment`, `spoiledLead`, `spoiledAfter`, `explanation`,
`generalisation`, `rangeLead`, `c2Task`, `c2Hints` (five), `reflection`, `modelVsReality`.

## failureExperiment (about 70 words)

1. The figure runs two programs with room A at -170 and room B at -150. Each adds room A's amount
   above -180 to room B's above -200 and shows the sum.
2. After the first call, each keeps room A's result in R10, `R10 <= R1`, through the second call.
   R10 is kept, so the calling convention allows that.
3. In the second program, `overBy` works in R10 where the lesson's works in R5, and does not put
   R10 back.

## spoiledLead (one sentence, directly above the figure)

Predict what each program shows, then press "Run the programs".

## spoiledAfter (about 60 words, shown once the programs have run)

1. The first shows 60: room A's 10 and room B's 50. R10 still holds 10 at the end.
2. The second shows 100. Its `overBy` left room B's 50 in R10, so the program added 50 and 50.
3. The function gives the right result every time. It breaks its caller by changing a register
   the calling convention says it keeps.

## explanation (about 100 words)

1. The machine knows nothing of functions. `call overBy, R15` is kind 6: it writes the address of
   the next instruction into the register its Y digit names, and goes to `overBy`. R15 is used
   only because programs agree on it.
2. `goto R15` is a jump to the address a register holds, like any other jump.
3. Nothing in the machine checks that a function puts R10 to R13 back, or leaves its result in R1.
   The second program in the failure experiment broke the agreement, and the machine ran it to
   its `stop` with no complaint.
4. A calling convention is an agreement between programs, not a part of the machine. It lets a
   function one person wrote be called from a program another person wrote, and lets a test call
   a function on its own.

## generalisation (about 70 words)

1. A function is written once and used from anywhere a call can reach. A mistake in it is mended
   once.
2. A function can be tested alone: give it arguments, call it, and check its result and the
   registers it must keep. The challenge's tests do that.
3. Each use costs two instructions more: the call and the jump back. For a short check used
   twice, the program is no shorter. For a longer piece, or one used many times, it is.

## rangeLead (one sentence, directly above the challenge)

Write `outOfRange`, test it in the debugger, then run the tests.

## c2Task (about 140 words, a list allowed)

1. The shop's fridge must stay between 2.0 and 5.0 degrees: readings 20 to 50. Its sensor is the
   one the programs read as `sensorA`.
2. The starting text has a main program that calls `outOfRange` with the fridge's reading in R1,
   20 in R2 and 50 in R3, shows the result on the display, and turns ALARM on when the result is
   not 0. Its `outOfRange` returns 0 every time.
3. Write `outOfRange`: R1 holds a reading, R2 the range's low end, R3 its high end. Return in R1
   how far the reading is outside the range: the low end minus the reading when it is below, the
   reading minus the high end when it is above, and 0 when it is inside. A reading equal to an end
   is inside.
4. Keep the calling convention: R10 to R14 as they were when it returns, and return with
   `goto R15`.
5. There are 10 tests:
   - Seven call `outOfRange` alone, with R1, R2 and R3: 60, 20, 50; 10, 20, 50; 30, 20, 50; 20,
     20, 50; 50, 20, 50; -15, 20, 50; 75, 0, 40. Each checks R1, R10 to R14, and the return
     through R15.
   - Three run the whole program with the fridge at 60, 30 and -5. Each checks the display, the
     lamps and that the program ends at its `stop`.

## c2Hints (five, in this order)

1. The idea: two comparisons, one for each end, and three ways out of the function.
2. A common mistake: comparing `unsigned`. A reading of -15 read unsigned is larger than 50, so the
   function would say it is above the range, not below it.
3. A smaller example: for a reading of 60 and a range of 20 to 50, the result is 60 - 50, which is
   10.
4. Part of the answer: `if R1 < R2 signed goto below` jumps when the reading is below the low end.
5. The whole answer:

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

## reflection (about 70 words)

1. `overBy` calls no other function. The office now wants a function that adds both rooms' amounts
   by calling `overBy` twice.
2. Its own call to `overBy` writes R15 with a new return address. But R15 already held the address
   this function must go back to.
3. End on the question: what must a function that calls another keep, and where?

## modelVsReality (about 60 words)

1. Every real machine has a calling convention written down for its programs and tools, so that
   functions from different authors and tools work together. The course's is its own and follows
   none of them.
2. Many real machines have a call that always writes one register. The course's call writes the
   register its Y digit names, so the choice of R15 is the convention's, not the machine's.
