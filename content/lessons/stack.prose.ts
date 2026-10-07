// Copyright © 2026 Christopher Snow

// The words of the lesson stack.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 4A to 4C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 3 asked: what must a function that calls another keep, and where? The figure's program adds both rooms' amounts above their limits. Its function `sumOver` takes room A's reading in R1 and room B's in R2, calls `overBy` twice, and returns the sum in R1. It keeps the words it needs between the calls in R10. The main program calls `sumOver` from `008`, shows R1 on the display and stops. Room A reads -170 and room B -190: each is 10 above its limit, so the display should show 20.",
  lostLead: 'Predict what the display shows, then press "Run to the end".',
  lostAfter:
    "The debugger cuts the run off after 5000 instructions. The display still shows 0.\n\nThe call at `008` put `00C` into R15, the return address in the main program. When `sumOver` calls `overBy`, that call overwrites R15. After the second call at `030`, R15 holds `034` instead of `00C`. When `sumOver` does `goto R15` at `038`, it goes to `034`. The instruction there adds R10 to R1, then comes back to `038`. But R15 still holds `034`, so `goto R15` goes there again. Each time, R1 grows by 10. The run never goes back to the main program.",
  motivation:
    "A function that calls another must keep its return address where a call cannot write it. It keeps it on a **stack**: words in RAM that a program takes back in reverse order. The last word put on is the first taken off.\n\nR14 holds the address of the word last put on the stack.\n- A push puts a word on: `R14 <= R14 - 8`, then `word[R14] <= R15`.\n- A pop takes a word off: `R15 <= word[R14]`, then `R14 <= R14 + 8`.\n\nThe stack grows down from `7C0`, the first address past the RAM's last word. A program starts with `R14 <= 0x7C0`, so its first push writes `7B8`.\n\nThe new `sumOver` pushes R15 and R10 when it starts, and pops them in the opposite order before `goto R15`. The new main program also keeps a word of its own in R10 through the call: 1, ALARM's bit. It stores R10 to the lamps when the sum is not 0.",
  prediction:
    'The figure shows the new program with its addresses. The main program calls `sumOver` from `010`. Choose an answer and press "Check my prediction". The listing shows what instruction each line becomes.',
  p1Question: "While `overBy` runs for the first time, what does the word at `7B8` hold?",
  p1Explain:
    "The word at `7B8` holds `014`: the address of the next instruction after the call at `010`. The call put `014` in R15. `sumOver`'s first push wrote R15 to `7B8`. The address `010` is where the call is, not the return address. `sumOver`'s second push wrote R10, which held 1, to `7B0`. When `sumOver` made its call to `overBy`, R15 became `044`. But `014` stays safe at `7B8`. The next figure runs the program so you can watch the pushes.",
  investigation:
    "The program runs with room A at -170 and room B at -190. The figure shows a breakpoint on `overBy`, with the stack visible.",
  pushedLead:
    '1. The watch shows R10, R14, R15 and `word[R14]`, the word on top of the stack.\n2. Press "Step" through `sumOver`\'s first four lines. At each push, R14 goes down by 8 and a word goes into the RAM.\n3. Press "Run to a breakpoint" to reach each call of `overBy`. Watch R10 take room B\'s reading, then room A\'s amount.\n4. Step through the pops at the end of `sumOver`, and watch R10 and R15 take back their words.',
  pushedAfter:
    "`sumOver` used R10 to hold -190, then 10. The first pop restored R10 to its original value of 1. The pop of R15 restored `014`. `goto R15` returned to `014`, after the main program's call. The display shows 20 and ALARM is on because the main program stored R10's 1 to the lamps. The program executed 38 instructions and stopped at `024`. R14 is back at `7C0`.",
  construction:
    "You can work out where a function pushes words without running the program. Start from `7C0` and go down by 8 for each push, following the order of the pushes and the calls in the listing. The program includes a function `check` that keeps three registers as well as R15. The lesson does not run this function.",
  c1Task:
    "In a run of the program with `check`, room A reads -170 and room B reads -190. Give these answers in hexadecimal:\n- the address of the word that holds `check`'s return address;\n- the address of the word that holds what R10 held when `check` started;\n- what R14 holds while `overBy` runs;\n- the word at `7B8` once `check` has returned to the main program.\n\nWrite each as three hexadecimal digits. There are 4 tests, one for each answer.",
  c1Hints: [
    "The idea: start R14 at `7C0` and subtract 8 for each push, in the order they run.",
    "A common mistake: thinking a pop clears the word it takes. It copies the word into a register and adds 8 to R14. The word stays in the RAM until a push writes over it.",
    "A smaller example: in the lesson's run, `sumOver` pushed R15 to `7B8` and R10 to `7B0`. R14 held `7B0` while `overBy` ran.",
    "Part of the answer: `check` pushes R15, R10, R11 and R12, in that order, before its first call.",
    "The whole answer: `7B8`, `7B0`, `7A0` and `010`.",
  ],
  failureExperiment:
    "The figure runs the lesson's program with one change: `sumOver` pops R15 first, then R10, the same order as its pushes. Room A is at -170 and room B is at -190, as before.",
  explanation:
    "The words one call of a function pushes stay on the stack until that call pops them. While `overBy` runs, `sumOver`'s two words sit under it: its return address at `7B8` and the word R10 held at `7B0`. `overBy` pushes nothing.\n\nThe debugger's stack view groups the words by the call that pushed them and names the function and where it was called from. The machine knows nothing of this: the debugger works it out from the calls it has run.\n\nThe calling convention's last rows say how a function uses the stack:\n\n- R14 holds the address of the word last pushed. A function leaves R14 as it found it by popping everything it pushed.\n- R10 to R13 are kept: a function that changes one pushes it first and pops it before it returns.\n- A function that calls another pushes R15 first and pops it before `goto R15`.",
  depthLead:
    "The figure counts the words on the stack after each instruction of the lesson's run. The marks show the three calls: `sumOver`, then `overBy` twice. The stack holds at most 2 words, while `sumOver` runs, and is empty again at the end.",
  generalisation:
    "The last word pushed is the first popped. So a call made inside another ends first, and its words lie on top of the words of the call that made it.\n\nCalls can go as deep as the RAM allows. The RAM holds 960 bytes, from `400` to `7BF`, which is 120 words, and the stack grows down from `7C0`.\n\nA function that calls nothing and changes no kept register needs no stack. Whatever pushes a word must pop it, on every way out of the function.",
  addressesLead: "Work out each answer from the listing, then run the tests.",
  c2Task:
    "1. Write the function `roomsOver`. R1 holds room A's reading and R2 holds room B's reading. Return in R1 how many rooms are above their limits: 0, 1 or 2. Room A's limit is -180 and room B's is -200. A reading equal to its limit is not above it.\n2. Use the function `overBy`, which the starting text gives. It returns 0 when a reading is not above its limit.\n3. Keep the calling convention: R10 to R14 as they were when `roomsOver` returns, and return through R15.\n4. The starting text's main program sets R14, calls `roomsOver` and shows the result. Its `roomsOver` returns 0.\n5. There are 9 tests. Six call `roomsOver` alone, with R1 and R2 at: -170 and -190; -185 and -210; -170 and -210; -185 and -190; 25 and 30; -180 and -200. Each checks R1, R10 to R14, and the return through R15. Three run the whole program with room A and room B at -170 and -190; -185 and -210; -170 and -210. Each checks the display and that the program ends at its `stop`.",
  c2Hints: [
    "The idea: push R15 and every kept register you use when `roomsOver` starts. Pop them in the opposite order before `goto R15`.",
    "A common mistake: keeping room B's reading in R2 or R5 through the first call. `overBy` may change them both, as the calling convention allows.",
    "A smaller example: `sumOver` in this lesson pushes R15 and R10, and pops R10 first.",
    "Part of the answer: keep room B's reading in R11 and the count in R10. After each call of `overBy`, `if R1 == R0 goto` skips the count when the result is 0. Set R0 to 0 after each call, since `overBy` may change R0.",
    "The whole answer:\n\n```\nroomsOver: R14 <= R14 - 8\n        word[R14] <= R15\n        R14 <= R14 - 8\n        word[R14] <= R10\n        R14 <= R14 - 8\n        word[R14] <= R11\n        R11 <= R2\n        R10 <= 0\n        R2 <= -180\n        call overBy, R15\n        R0 <= 0\n        if R1 == R0 goto roomB\n        R10 <= R10 + 1\nroomB:  R1 <= R11\n        R2 <= -200\n        call overBy, R15\n        R0 <= 0\n        if R1 == R0 goto done\n        R10 <= R10 + 1\ndone:   R1 <= R10\n        R11 <= word[R14]\n        R14 <= R14 + 8\n        R10 <= word[R14]\n        R14 <= R14 + 8\n        R15 <= word[R14]\n        R14 <= R14 + 8\n        goto R15\n```",
  ],
  reflection:
    "Each call of a function keeps its own words on the stack. So a function's calls do not get in each other's way, even when one call of a function is still in progress as another call of the same function starts.\n\nThe shop's cold store has rooms that open onto further rooms, and the office wants a count over all of them.\n\nCan a function call itself?",
  modelVsReality:
    "Real machines keep a stack in memory as this one does. Most give one register the stack's address by agreement. Some have push and pop instructions; this one uses two ordinary instructions for each.\n\nA real stack can grow until it writes over other data, with no warning. On this course's machine, a stack that grows past `400` reaches the ROM, and the store halts the machine with cause `34`.",
  checkListingLead: "Below is the program with `check`, as the assembler lists it.",
  popsSwappedLead: 'Predict how the run ends, then press "Run to the end".',
  popsSwappedAfter:
    "The machine halts with cause `12` at `001`: an instruction's address must be a multiple of 4, and `001` is not. 33 instructions ran.\n\nThe pushes put R15's `014` at `7B8`, then R10's 1 at `7B0`. R14 held `7B0`. The first pop took the word at `7B0`, the 1, into R15. The second took `014` into R10. `goto R15` went to `001`. The last word pushed is the first popped, so the pops must run in the opposite order to the pushes.",
  roomsLead: "Write `roomsOver`, step through it with the stack shown, then run the tests.",
} as const;
