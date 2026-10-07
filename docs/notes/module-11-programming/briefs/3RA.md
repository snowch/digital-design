# Brief 3RA: lesson `functions` (Module 11, lesson 3), revised, first part

Read `00-module.md` (the shared fact sheet) first; it applies here. You may use **assembly**,
**assembler**, **debugger** and **breakpoint**. This lesson introduces **function**,
**argument** and **calling convention**. In these keys you may use "function" and "argument":
set each in bold where it is first used, in `motivation`, plain meaning first. "Calling
convention" must not appear in these keys. No later term (stack, recursion) may appear.

The lesson's function is named `overBy`. Write it in backticks every time.

The lesson's program, as the figures show it (room A at -170, room B at -190):

```
// Room A's amount above -180 on the display; ALARM if room B is above -200.
000         R1 <= word[sensorA]
004         R2 <= -180
008         call overBy, R15
00C         word[display] <= R1
010         R1 <= word[sensorB]
014         R2 <= -200
018         call overBy, R15
01C         R0 <= 0
020         if R1 == R0 goto done
024         R3 <= 1
028         word[lamps] <= R3
02C done:   stop
// overBy: how far a reading is above a limit, or 0.
// R1: the reading. R2: the limit. The result in R1.
030 overBy: R5 <= R1 - R2
034         R0 <= 0
038         if R0 < R5 signed goto over
03C         R5 <= 0
040 over:   R1 <= R5
044         goto R15
```

Keys to write: `question`, `twoWaysLead`, `twoWaysAfter`, `motivation`, `prediction`,
`p1Question`, `p1Explain`.

## question (about 70 words, above a figure)

1. Lesson 2 ended on a question. The office wants room A's reading checked against its limit,
   -180, and room B's against its own, -200. The check is the same lines each time, with a
   different reading and limit.
2. Written out twice, a mistake in the check must be found and mended twice.
3. End on the question: how can a program use one piece of program from two places?

## twoWaysLead (about 60 words, directly above the figure)

1. The figure runs two programs that do the same work, with room A at -170 and room B at -190.
2. The first writes the check out twice.
3. The second writes it once, under the name `overBy`, and reaches it from two places with
   `call overBy, R15`.
4. Press "Run the programs" to count each.

## twoWaysAfter (about 60 words, shown once the programs have run)

1. Both show 10 on the display: room A is 10 tenths of a degree above -180. Both turn ALARM on, as
   room B is 10 above -200.
2. Written twice, the program has 15 instructions and runs 13.
3. Written once, it has 18 and runs 22: each use of `overBy` runs a call and a jump back.
4. The check now exists once. A mistake in it is mended in one place.

## motivation (about 110 words)

1. Lesson 8.5 showed the call instruction. `call overBy, R15` puts the address of the instruction
   after the call in R15, then goes to `overBy`. `goto R15` jumps to the address R15 holds.
2. A **function** is a piece of program a call runs, which goes back to the instruction after the
   call when it is done.
3. The values a function is given are its **arguments**. `overBy` takes two: a reading in R1 and a
   limit in R2.
4. It leaves its result in R1: how far the reading is above the limit, or 0 when it is not above.
5. It works out the difference in R5 first, and keeps it only if it is above 0.
6. Before each call, the program puts the arguments in R1 and R2. After the call, the result is in
   R1.

## prediction (about 40 words, above the figure)

1. The figure lists the program. It calls `overBy` twice: from `008` and from `018`.
2. Choose an answer and press "Check my prediction". The listing's words then show.
3. Do not say what R15 holds, or what a call writes to it beyond motivation's point 1.

## p1Question (one sentence)

When the program stops, what does R15 hold?

## p1Explain (about 80 words, shown once the learner has answered)

1. R15 holds `01C`.
2. Each call writes R15. The first, at `008`, wrote `00C`. The second, at `018`, wrote `01C`,
   which replaced `00C`.
3. Nothing after the second call writes R15, so it still holds `01C` when the program stops.
4. `018` is the call's own address. A call keeps the address after it, so that `goto R15` goes on
   from there.
5. The same `goto R15` went back to `00C` the first time and to `01C` the second: a function goes
   back to wherever it was called from.
6. The next figure runs the program in the debugger, so you can watch R15 change.
