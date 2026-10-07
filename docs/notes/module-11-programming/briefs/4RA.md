# Brief 4RA: lesson `stack` (Module 11, lesson 4), revised, first part

Read `00-module.md` (the shared fact sheet) first; it applies here. You may use every term of
lessons 1 to 3 (not in bold): assembly, assembler, debugger, breakpoint, function, argument,
calling convention. This lesson introduces **stack**: set it in bold where it is first used, in
`motivation`, plain meaning first. "Stack" must not appear in `question`, `lostLead` or
`lostAfter`. No later term (recursion) may appear. Never write "frame".

The lesson's functions are `sumOver` and `overBy` (lesson 3's, which works in R5 and returns how
far a reading is above a limit, or 0). Write them in backticks.

Keys to write: `question`, `lostLead`, `lostAfter`, `motivation`, `prediction`, `p1Question`,
`p1Explain`.

## question (about 80 words, above a figure)

1. Lesson 3 asked: what must a function that calls another keep, and where?
2. The figure's program adds both rooms' amounts above their limits. Its function `sumOver` takes
   room A's reading in R1 and room B's in R2, calls `overBy` twice, and returns the sum in R1. It
   keeps the words it needs between the calls in R10.
3. The main program calls `sumOver` from `008`, shows R1 on the display and stops.
4. Room A reads -170 and room B -190: each is 10 above its limit, so the display should show 20.

## lostLead (one sentence, directly above the figure)

Predict what the display shows, then press "Run to the end".

## lostAfter (about 80 words, shown once the run has ended)

1. The debugger cuts the run off after 5000 instructions. The display still shows 0.
2. The call at `008` put `00C`, the return address in the main program, into R15.
3. `sumOver`'s own calls to `overBy` wrote R15 too. After the second, at `030`, R15 holds `034`.
4. `sumOver`'s `goto R15`, at `038`, goes to `034`. That adds R10 to R1 again and comes back to
   `038`.
5. R1 grows by 10 each time round, and the run never goes back to the main program.

## motivation (about 120 words, a list allowed)

1. A function that calls another must keep its own return address where a call cannot write it:
   in memory.
2. It keeps it on a **stack**: words in the RAM that a program takes back in the opposite order
   to the order it put them there. The last word put on is the first taken off.
3. R14 holds the address of the word last put on.
   - A push puts a word on: `R14 <= R14 - 8`, then `word[R14] <= R15`.
   - A pop takes it off: `R15 <= word[R14]`, then `R14 <= R14 + 8`.
4. The stack grows down from `7C0`, the first address past the RAM's last word. A program starts
   with `R14 <= 0x7C0`, so its first push writes `7B8`.
5. The new `sumOver` pushes R15 and R10 when it starts, and pops them in the opposite order
   before `goto R15`.
6. The new main program also keeps a word of its own in R10 through the call: 1, ALARM's bit. It
   stores R10 to the lamps when the sum is not 0.

## prediction (about 40 words, above the figure)

1. The figure lists the new program. The main program calls `sumOver` from `010`.
2. Choose an answer and press "Check my prediction". The listing's words then show.
3. Do not give any of the stack's addresses beyond motivation's.

## p1Question (one sentence)

While `overBy` runs for the first time, what does the word at `7B8` hold?

## p1Explain (about 80 words, shown once the learner has answered)

1. The word at `7B8` holds `014`: the address of the instruction after the main program's call.
2. The call at `010` put `014` in R15. `sumOver`'s first push wrote R15 to `7B8`.
3. `010` is the call's own address, not the one the call keeps.
4. `sumOver`'s second push wrote R10, which held 1, to `7B0`.
5. `sumOver`'s own call then wrote `044` to R15, but the `014` it needs is safe at `7B8`.
6. The next figure runs the program, so you can watch the pushes.
