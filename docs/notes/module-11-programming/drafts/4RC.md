failureExperiment: The figure runs the lesson's program with one change: `sumOver` pops R15 first, then R10, the same order as its pushes. Room A is at -170 and room B is at -190, as before.

popsSwappedLead: Predict how the run ends, then press "Run to the end".

popsSwappedAfter: The machine halts with cause `12` at `001`: an instruction's address must be a multiple of 4, and `001` is not. 33 instructions ran. The pushes put R15's `014` at `7B8`, then R10's 1 at `7B0`. R14 held `7B0`. The first pop took the word at `7B0`, the 1, into R15. The second took `014` into R10. `goto R15` went to `001`. The last word pushed is the first popped, so the pops must run in the opposite order to the pushes.

explanation: The words one call of a function pushes stay on the stack until that call pops them. While `overBy` runs, `sumOver`'s two words sit under it: its return address at `7B8` and the word R10 held at `7B0`. `overBy` pushes nothing.

The debugger's stack view groups the words by the call that pushed them and names the function and where it was called from. The machine knows nothing of this: the debugger works it out from the calls it has run.

The calling convention's last rows say how a function uses the stack:

- R14 holds the address of the word last pushed. A function leaves R14 as it found it by popping everything it pushed.
- R10 to R13 are kept: a function that changes one pushes it first and pops it before it returns.
- A function that calls another pushes R15 first and pops it before `goto R15`.

depthLead: The figure counts the words on the stack after each instruction of the lesson's run. The marks show the three calls: `sumOver`, then `overBy` twice. The stack holds at most 2 words, while `sumOver` runs, and is empty again at the end.

generalisation: The last word pushed is the first popped. So a call made inside another ends first, and its words lie on top of the words of the call that made it. Calls can go as deep as the RAM allows. The RAM holds 960 bytes, from `400` to `7BF`, which is 120 words, and the stack grows down from `7C0`. A function that calls nothing and changes no kept register needs no stack. Whatever pushes a word must pop it, on every way out of the function.

roomsLead: Write `roomsOver`, step through it with the stack shown, then run the tests.

c2Task: 1. Write the function `roomsOver`. R1 holds room A's reading and R2 holds room B's reading. Return in R1 how many rooms are above their limits: 0, 1 or 2. Room A's limit is -180 and room B's is -200. A reading equal to its limit is not above it.
2. Use the function `overBy`, which the starting text gives. It returns 0 when a reading is not above its limit.
3. Keep the calling convention: R10 to R14 as they were when `roomsOver` returns, and return through R15.
4. The starting text's main program sets R14, calls `roomsOver` and shows the result. Its `roomsOver` returns 0.
5. There are 9 tests. Six call `roomsOver` alone, with R1 and R2 at: -170 and -190; -185 and -210; -170 and -210; -185 and -190; 25 and 30; -180 and -200. Each checks R1, R10 to R14, and the return through R15. Three run the whole program with room A and room B at -170 and -190; -185 and -210; -170 and -210. Each checks the display and that the program ends at its `stop`.

c2Hints.1: The idea: push R15 and every kept register you use when `roomsOver` starts. Pop them in the opposite order before `goto R15`.

c2Hints.2: A common mistake: keeping room B's reading in R2 or R5 through the first call. `overBy` may change them both, as the calling convention allows.

c2Hints.3: A smaller example: `sumOver` in this lesson pushes R15 and R10, and pops R10 first.

c2Hints.4: Part of the answer: keep room B's reading in R11 and the count in R10. After each call of `overBy`, `if R1 == R0 goto` skips the count when the result is 0. Set R0 to 0 after each call, since `overBy` may change R0.

c2Hints.5: The whole answer:

```
roomsOver: R14 <= R14 - 8
        word[R14] <= R15
        R14 <= R14 - 8
        word[R14] <= R10
        R14 <= R14 - 8
        word[R14] <= R11
        R11 <= R2
        R10 <= 0
        R2 <= -180
        call overBy, R15
        R0 <= 0
        if R1 == R0 goto roomB
        R10 <= R10 + 1
roomB:  R1 <= R11
        R2 <= -200
        call overBy, R15
        R0 <= 0
        if R1 == R0 goto done
        R10 <= R10 + 1
done:   R1 <= R10
        R11 <= word[R14]
        R14 <= R14 + 8
        R10 <= word[R14]
        R14 <= R14 + 8
        R15 <= word[R14]
        R14 <= R14 + 8
        goto R15
```

reflection: Each call of a function keeps its own words on the stack. So a function's calls do not get in each other's way, even when one call of a function is still in progress as another call of the same function starts. The shop's cold store has rooms that open onto further rooms, and the office wants a count over all of them. Can a function call itself?

modelVsReality: Real machines keep a stack in memory as this one does. Most give one register the stack's address by agreement. Some have push and pop instructions; this one uses two ordinary instructions for each. A real stack can grow until it writes over other data, with no warning. On this course's machine, a stack that grows past `400` reaches the ROM, and the store halts the machine with cause `34`.
