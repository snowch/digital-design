// Copyright © 2026 Christopher Snow

// The words of the lesson stack.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 4A to 4C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 3 asked: what must a function that calls another keep, and where? This program adds how much both rooms exceed their limits. It uses a function, `total`, that takes room A's reading in R1 and room B's in R2, then returns the sum in R1. `total` calls `above` twice and keeps the words it needs through these calls in R10. The main program calls `total` from `008`, shows R1 on the display and stops. Room A reads -170 and room B -190: each is 10 above its limit, so the display should show 20.",
  lostLead: 'Predict what the display shows, then press "Run to the end".',
  lostAfter:
    "The debugger cuts the run off after 5000 instructions. The display still shows 0. The call at `008` put `00C`, the return address in the main program, into R15. `total`'s own calls to `above` wrote R15 too. After the second call, R15 holds `034`, the instruction after that call. `total`'s `goto R15`, at `038`, goes to `034`. That adds R10 to R1 again and comes back to `038`. R1 grows by 10 each time round, and the run never reaches the main program again.",
  motivation:
    "A function that calls another must keep its own return address where a call cannot write it: in memory.\n\nIt keeps it on a **stack**: words in the RAM that a program takes back in the opposite order it put them there. The last word put on is the first taken off.\n\nR14 holds the address of the word last put on.\n\n- A push puts a word on: `R14 <= R14 - 8`, then `word[R14] <= R15`.\n- A pop takes it off: `R15 <= word[R14]`, then `R14 <= R14 + 8`.\n\nThe stack grows down from `7C0`, the first address past the RAM's last word. A program starts with `R14 <= 0x7C0`, so its first push writes `7B8`.\n\nThe new `total` pushes R15 and R10 when it starts, and pops them in the opposite order before `goto R15`.",
  prediction:
    'The figure shows the debugger on the new program, with the stack shown under the registers. `total` pushes two words before its first call to `above`. Choose an answer and press "Check my prediction". The buttons then work.',
  p1Question: "When `above` starts for the first time, what address does R14 hold?",
  p1Explain:
    "R14 holds `7B0`. The program started R14 at `7C0`. `total` pushed R15 at `7B8`, then R10 at `7B0`, taking 8 off R14 for each. `above` pushes nothing, so R14 stays at `7B0` while it runs. The debugger shows R14 as 1968, with `7B0` under it in hexadecimal.",
  investigation:
    "The figure runs the new program with room A at -170 and room B at -190. A breakpoint is set on `above`. The stack is shown under the registers.",
  pushedLead:
    '1. The watch shows R14, R15 and `word[R14]`, the word on top of the stack.\n2. Press Step through the first four lines of `total` and watch what happens at each push: R14 decreases by 8 and the word goes into the RAM.\n3. Then press "Run to a breakpoint" to reach each call of `above`.\n4. Step through the two pops at the end of `total` and watch R15 take back `010`.',
  pushedAfter:
    "1. `7B8` holds `010`: the address after the main program's call to `total`. When `total` returns, it will jump back to `010`.\n2. `7B0` holds what R10 contained when `total` started. The main program never set R10, so it holds X. The pop restores that value.\n3. The display shows 20 as the result. 30 instructions run before the program stops at `014`.\n4. At the end of the run, R14 returns to `7C0` where it started.",
  construction:
    "The challenge's function calls `above` twice and must keep two words through both calls. Two kept registers hold the words, so the function must push both registers and R15 at the start, then pop them before it returns.",
  bothLead: "Write `both`, step through it with the stack shown, then run the tests.",
  c1Task:
    "1. Write the function `both`. R1 holds room A's reading and R2 holds room B's. Return how many rooms are above their limits in R1: 0, 1 or 2. Room A's limit is -180 and room B's is -200. A reading equal to its limit is not above it.\n2. Use the `above` function, which the starting text gives. It returns 0 when a reading is not above its limit.\n3. Keep the calling convention: R10 to R14 unchanged when `both` returns, and return through R15.\n4. The starting text's main program sets R14, calls `both` and shows the result. Its `both` returns 0.\n5. There are 9 tests. Six call `both` alone, with R1 and R2: -170 and -190; -185 and -210; -170 and -210; -185 and -190; 25 and 30; -180 and -200. Each checks R1, R10 to R14, and the return through R15. Three run the whole program with room A and room B at -170 and -190; -185 and -210; -170 and -210. Each checks the display and that the program ends at its `stop`.",
  c1Hints: [
    "The idea: push R15 and every register you keep when `both` starts. Pop them in the opposite order before `goto R15`.",
    "A common mistake: popping in the order you pushed reverses what you get. The first pop gives R15 the word you pushed last.",
    "A smaller example: `total` in this lesson pushes R15 and R10, and pops R10 first.",
    "Part of the answer: keep room B's reading in R11 and the count in R10. After each call of `above`, use `if R1 == R0 goto` to skip incrementing the count when the result is 0.",
    "The whole answer:\n\n```\nboth:   R14 <= R14 - 8\n        word[R14] <= R15\n        R14 <= R14 - 8\n        word[R14] <= R10\n        R14 <= R14 - 8\n        word[R14] <= R11\n        R11 <= R2\n        R10 <= 0\n        R0 <= 0\n        R2 <= -180\n        call above, R15\n        if R1 == R0 goto roomB\n        R10 <= R10 + 1\nroomB:  R1 <= R11\n        R2 <= -200\n        call above, R15\n        if R1 == R0 goto done\n        R10 <= R10 + 1\ndone:   R1 <= R10\n        R11 <= word[R14]\n        R14 <= R14 + 8\n        R10 <= word[R14]\n        R14 <= R14 + 8\n        R15 <= word[R14]\n        R14 <= R14 + 8\n        goto R15\n```",
  ],
  failureExperiment:
    "The figure shows the new program without its first line, which sets R14. R14 holds X, making the push's address unknown. When the first store tries to run, it has no valid address in R14.",
  noStartLead: "Predict where the run pauses, then press Run to the end.",
  noStartAfter:
    "The debugger pauses before running `word[R14] <= R15` at `018`. This store needs an address in R14, which nothing has set. Four instructions ran, the last `R14 <= R14 - 8` at `014`. Since R14 held X, it still held X. Every program using the stack starts by setting R14.",
  explanation:
    "The words one call of a function pushes are its **frame**. In the run of this lesson, `total` pushes two words, so its frame takes two words. Its return address sits at `7B8`, and the word that R10 held sits at `7B0`. The function `above` pushes nothing, so it has no frame.\n\nThe debugger's stack view groups the words by frame, naming each function and where it was called from. The machine knows nothing of frames: the debugger works them out from the calls it has run.\n\nThe calling convention's last rows govern how frames are built:\n\n- R14 holds the stack's address, the word last pushed. A function leaves R14 as it found it, by popping everything it pushed.\n- R10 to R13 are kept: a function that changes one pushes it first and pops it before it returns.\n- A function that calls another pushes R15 first, and pops it before `goto R15`.",
  depthLead:
    "The figure counts the words on the stack after each instruction. The marks show the three calls: `total`, then `above` twice. The stack holds at most 2 words while `total` runs, and is empty again at the end.",
  generalisation:
    "The last word pushed is the first popped. So a call made inside another call ends first, and each frame lies under the frame of the call made after it.\n\nCalls can go as deep as the RAM allows. The RAM holds 960 bytes, from `400` to `7BF`, which is 120 words. The stack grows down from `7C0`.\n\nA function that calls nothing and changes no kept register needs no frame. Whatever pushes a word must pop it, on every path through the function.",
  addressesLead: "Work out each address from the program in this lesson, then run the tests.",
  c2Task:
    "In the run of this lesson's program, with `total` and `above`, give four addresses in hexadecimal:\n\n- the address of the word that holds `total`'s return address;\n- the address of the word that holds what R10 held when `total` started;\n- what R14 holds while `above` runs;\n- what R14 holds after `total` returns.\n\nThere are 4 tests, one for each address.",
  c2Hints: [
    "The idea: start R14 at `7C0` and take 8 off for each push.",
    "A common mistake: writing to `7C0` for the first push. A push takes 8 off R14 before it stores, so the first word goes to `7B8`.",
    "A smaller example: a function that pushes only R15 keeps its return address at `7B8`, and R14 is `7B8` while it runs.",
    "Part of the answer: `total` pushes R15 first, then R10.",
    "The whole answer: `7B8`, `7B0`, `7B0` and `7C0`.",
  ],
  reflection:
    "Each call of a function has its own frame, so the same function could run in two calls at once, each with its own return address on the stack.\n\nThe office wants the log shown newest first. A function could show the rest of the log first, then its own reading.\n\nCan a function call itself?",
  modelVsReality:
    "Real machines keep a stack in memory as this one does. Most give one register the stack's address by agreement. Some machines have push and pop instructions; this one uses two ordinary instructions each.\n\nA real stack can grow until it overwrites other data, with no warning. On this course's machine, a stack that grows past `400` reaches the ROM, and the store halts the machine with cause `34`.",
} as const;
