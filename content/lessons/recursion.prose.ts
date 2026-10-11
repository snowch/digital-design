// Copyright © 2026 Christopher Snow

// The words of the lesson recursion.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-11-programming/briefs, briefs 5A to 5C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 4 asked: can a function call itself? The shop's cold store is a hall with rooms behind it, some opening onto further rooms. The office wants to know how many rooms are warmer than -180, counting every room reachable from the hall. A loop walks one list from start to end. Here each room can lead two ways, and the path back from a room must be kept until both its doors have been explored.",
  motivation:
    "The count for a room is: 1 if the room is warmer than the limit, plus the count for the room behind its first door, plus the count for the room behind its second door.\n\nThe count for a room behind a door is the same question again, for a different room. So the function `warmRooms` answers it by calling itself: it calls itself to count the rooms beyond the first door, then calls itself again for the second door.\n\nA function that calls itself is **recursion**.\n\nA door that leads nowhere holds 0. `warmRooms` on 0 calls nothing, and its result is 0: this is the last case. Every way in ends at one, so every call returns.\n\nEach call that finds a room pushes 4 words: R15, and the three kept registers it uses for the room's address, the limit and its count. So each call keeps its own room while it follows the doors.",
  prediction:
    'The figure lists the program, the function `warmRooms` and the rooms. Choose your answer for how many times `warmRooms` is called, then press "Check my prediction". The listing then shows the program\'s words alongside the room data.',
  p1Question: "In the run from the hall, how many times is `warmRooms` called?",
  p1Explain:
    "`warmRooms` is called 13 times. It is called once for each of the 6 rooms. It is called once more for each door that leads nowhere: the 6 rooms have 12 doors, 5 of which lead to a room, so 7 lead nowhere. That is 6 and 7, which make 13. When `warmRooms` is called with 0, it calls nothing, and its result is 0: this is the last case. The next figure runs the program, so you can count the calls as the run pauses.",
  investigation:
    "The figure runs the program with a breakpoint on the first line of `warmRooms`. The watch shows R1, R11 and R14, and the stack shows the words each call has pushed.",
  framesAfter:
    "1. `warmRooms` was called 13 times: the hall, the prep room, the vault, `chillA`, `icebox` and `chillB`, and 7 doors that lead nowhere.\n2. The display shows 3: the hall, the prep room and the icebox are warmer than -180.\n3. The stack was deepest, 16 words with R14 at `740`, in the calls for the icebox's doors: the hall, the vault, `chillA` and `icebox` each had 4 words on it.\n4. 223 instructions ran.",
  construction:
    "The figure shows a second cold store, which the lesson does not run. Work out a run of `warmRooms` on it from the hall, with the limit -180, as the program in the lesson does.",
  c1Task:
    "1. For a run of `warmRooms` from the hall of the second store, work out:\n   - how many times `warmRooms` is called;\n   - the most words the stack holds;\n   - what R14 holds when the stack holds the most words, in hexadecimal.\n2. There are 3 tests, one for each answer.",
  c1Hints: [
    "The idea: count a call for every room and one for every door that leads nowhere. The stack holds 4 words for each room on the way in to the deepest call.",
    "A common mistake: counting 4 words for a call on a door that leads nowhere. That call pushes nothing.",
    "A smaller example: in the lesson's store, the longest way in has 4 rooms, so the stack holds 16 words, and R14 is `7C0` less 16 × 8 bytes, which is `740`.",
    "Part of the answer: the second store has 7 rooms, and its longest way in is the hall, the lobby, `coolB`, `frost` and `blast`.",
    "The whole answer: 15 calls, 20 words, and `720`.",
  ],
  failureExperiment:
    "Someone writes the icebox's first door address wrongly as `0D0`, the vault, instead of 0. In the words, the icebox now leads back to the vault. The figure runs `warmRooms` from the hall with these rooms, with nothing else changed.",
  explanation:
    "Each call of `warmRooms` that finds a room pushes 4 words. The first is the address its `goto R15` will return to. The other three are the words R10, R11 and R12 held when it was called. Those three belong to the call that made it: that call's room address, its limit and its count so far.\n\nSo a call that has not yet returned keeps its room and its count in the words pushed by the call it made. The stack view shows those words in that later call's group, one group nearer the top. The top group is the call running now.\n\nWhen a call returns, it pops its four words, restoring R15 and R10 to R12. The call that made it then goes on with its own room and count.\n\nThe registers are shared by every call. The stack keeps, for each call not yet returned, what that call will need when it goes on.",
  generalisation:
    "Recursion fits a job whose answer is built from answers to smaller jobs of the same kind: a room's count from the counts behind its doors.\n\nWhere each part leads only one way on, as in a log, a loop does the job with no stack. Where a part leads two ways, the way back must be kept for the second door: recursion keeps it on the stack, which a loop would have to do for itself.\n\nThe stack's depth follows the longest way in, not the number of rooms. With 4 words a room, the course's 120 words of RAM hold a way in of 30 rooms.\n\nEvery recursive function needs a last case that calls nothing, reached on every way in.",
  c2Task:
    "1. Write the function `farthest`. R1 holds a room's address or 0 for no room. Its result, in R1, is how many rooms lie on the longest way in from that room, counting the room itself. It is 0 for no room.\n2. In the lesson's store, the longest way in from the hall is 4 rooms: the hall, the vault, `chillA` and the icebox. From `chillB` it is 1.\n3. `farthest` must call itself on the room behind each door.\n4. Keep the calling convention: R10 to R14 as they were when it returns, and return through R15.\n5. The starting text's main program sets R14, calls `farthest` on the hall and shows the result. The tests add the rooms after your program, each as three words: the reading, then the addresses behind the two doors.\n6. There are 9 tests. Five run the whole program on five sets of rooms: the lesson's store; the second store from the construction; a hall alone; a hall whose second door leads to a room whose second door leads to another; a hall with a room behind each door, the second of which leads to one more room. Each checks the display and that the program ends at its `stop`. Four call `farthest` alone. Before each, the test puts its own words in R10 to R13, `7C0` in R14, and in R15 the address of a `stop` it adds after your program, where the call returns. They test the lesson's store (from the vault, from `chillB`, and with R1 at 0) and the second store (from the lobby). Each checks R1, R10 to R14, and the return through R15.",
  c2Hints: [
    "The idea: the longest way in from a room is 1, for the room, plus the longer of the two ways in behind its doors.",
    "A common mistake: keeping the first door's answer in R5 or R1 through the second call. The second call changes them. Keep it in a kept register, and push that register first.",
    "A smaller example: for a hall alone, both doors give 0, the longer is 0, and the result of `farthest` is 1.",
    "Part of the answer: after the second call, `if R11 < R1 signed goto deeper` keeps the second door's answer when it is the longer; otherwise `R1 <= R11`. Then `deeper: R1 <= R1 + 1`.",
    "The whole answer:\n```\nfarthest: R0 <= 0\n        if R1 == R0 goto none\n        R14 <= R14 - 8\n        word[R14] <= R15\n        R14 <= R14 - 8\n        word[R14] <= R10\n        R14 <= R14 - 8\n        word[R14] <= R11\n        R10 <= R1\n        R1 <= word[R10 + 8]\n        call farthest, R15\n        R11 <= R1\n        R1 <= word[R10 + 16]\n        call farthest, R15\n        if R11 < R1 signed goto deeper\n        R1 <= R11\ndeeper: R1 <= R1 + 1\n        R11 <= word[R14]\n        R14 <= R14 + 8\n        R10 <= word[R14]\n        R14 <= R14 + 8\n        R15 <= word[R14]\n        R14 <= R14 + 8\n        goto R15\nnone:   R1 <= 0\n        goto R15\n```",
  ],
  reflection:
    "Two programs in this module ran to their `stop` and gave a wrong answer with no halt and no complaint: lesson 2's count compared unsigned and showed 1 where 3 was right; lesson 3's caller, whose `overBy` changed R10, showed 100 where 60 was right.\n\nThe office's programs will not always be right. A count can be one short; a list can be walked with the wrong step.\n\nHow do you find the mistake in a program that runs and gives a wrong answer?",
  modelVsReality:
    "Real records that lead two ways, rooms or anything else, are kept as this lesson keeps them: each one holds the addresses of the next.\n\nA real program that walks such records usually keeps a list of the records still to visit. It does this rather than calling itself, when the way in can be long. A call's words on the stack cost more than an address on a list.",
  roomsLead:
    "The figure shows the rooms as the program keeps them: three words per room. The first word is the reading. The second and third words hold the addresses of the rooms behind the room's two doors, or 0 where a door leads nowhere. Find the hall at `0A0`: its doors hold `0B8`, the prep room, and `0D0`, the vault.\n\nBelow the words, the same rooms are drawn from those words, and a key under the drawing says how to read it.",
  longStoreLead:
    "The second store's rooms, three words each, as the program keeps them. The hall is at `0A0` again. Follow the doors from there.",
  storeDepthLead: "Work out each answer from the rooms, then run the tests.",
  wayBackLead: 'Predict how the run ends, then press "Run to the end".',
  wayBackAfter:
    "The machine halts with cause `34` at `024`, pushing R15, after 571 instructions.\n\nFrom the icebox, the calls go back to the vault, then `chillA`, then the icebox, round and round. None of these calls reaches a door that leads nowhere, so none returns.\n\nEach call that finds a room pushes 4 words. 120 words of RAM hold 30 such calls. The next push went to `3F8`, the ROM's last word, and the ROM refuses to store there. `warmRooms` was called 34 times. The display still shows 0.",
  farthestLead:
    "Write `farthest`, step through its calls with the stack shown, then run the tests.",
  framesLead:
    "1. Press \"Run to a breakpoint\" again and again. Each pause is a new call of `warmRooms`, with the room's address in R1, or 0 for a door that leads nowhere.\n2. Watch the stack grow by 4 words each time a call finds a room, and shrink as calls return.\n3. Compare R14 at each pause with how many rooms deep the call is. At a pause where R1 holds a room's address, the number at the start of the lit room's row gives that depth.\n\nThe drawing sits under the listing on a wide screen, and after the stack on a narrow one. At a pause where R1 holds a room's address, the call is about that room, and the drawing lights it. Between pauses, the light follows R1, not the call. At the pauses where R1 holds 0, the call came through a door that leads nowhere. R10 still holds the calling room's address, and R15 holds `060` after a call through the first door and `070` after a call through the second. The drawing marks that door until the call goes back.",
  depthLead:
    "The figure counts the words on the stack after each instruction of the whole run. The stack rises and falls with the way in: it climbs as the calls go deeper, falls as they return, and climbs again for the next door.",
} as const;
