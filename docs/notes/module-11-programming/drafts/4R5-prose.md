c1Task: 1. In a run of the program with `sumKept`, with room A at -170 and room B at -190, give in hexadecimal:
   - the address of the word that holds what R11 held when `sumKept` started;
   - the address of the word that holds what R12 held;
   - what R14 holds while `overBy` runs;
   - the word at `7B8` once `sumKept` has returned to the main program.
2. Write each as three hexadecimal digits. There are 4 tests, one for each answer.

c1Hints.1: The idea: start R14 at `7C0` and take 8 off for each push, in the order the pushes run.

c1Hints.2: A common mistake: thinking a pop clears the word it takes. A pop copies the word into a register and adds 8 to R14. The word stays in the RAM until a push writes over it.

c1Hints.3: A smaller example: in the lesson's run, `sumOver` pushes R15 to `7B8` and R10 to `7B0`.

c1Hints.4: Part of the answer: `sumKept` pushes R15 to `7B8` and R10 to `7B0`, then R11 and R12. `overBy` pushes nothing.

c1Hints.5: The whole answer: `7A8`, `7A0`, `7A0` and `010`.

c2Task: 1. Write the function `roomsOver`. R1 holds room A's reading and R2 holds room B's. Its result, in R1, is how many rooms are above their limits: 0, 1 or 2. Room A's limit is -180 and room B's is -200. A reading equal to its limit is not above it.
2. Use the function `overBy`, which the starting text gives. Its result is 0 when a reading is not above its limit. Call it once for each room.
3. Keep the calling convention. When `roomsOver` returns, R10 to R14 hold what they held before the call, and it returns through R15.
4. The starting text's main program sets R14, calls `roomsOver` and shows the result. Its `roomsOver` gives 0.
5. There are 9 tests. Six call `roomsOver` alone. Before each, the test puts its own words in R10 to R13, `7C0` in R14, and in R15 the address of a `stop` the test adds after your program, where the call returns. The six cases set R1 and R2 to: -170 and -190; -185 and -210; -170 and -210; -185 and -190; 25 and 30; -180 and -200. Each checks the result in R1, that two calls of `overBy` returned, that the stack held at least 3 words, that R10 to R14 are as they were, and that the call returned through R15.
6. Three run the whole program. Their room A and room B readings are -170 and -190; -185 and -210; -170 and -210. Each checks the display and that the program ends at its `stop`.

