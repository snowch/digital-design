// Copyright © 2026 Christopher Snow

// The words of the lesson saving-state.
//
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-12-traps/briefs, briefs 2A to 2C), checked against the simulator, and
// placed here by the lesson's structure. Edit a fact here only after checking it; the lesson's
// facts test holds the numbers.

export const PROSE = {
  question:
    "Lesson 1 asked what a handler must leave as it found it. This program keeps room A's reading in R5, makes the same mistake as the night program, and then shows R5 on the display. It uses lesson 1's handler. Room A reads -184, so the display should show -184.",
  spoiledLead: 'Press "Run to the end" and read the display.',
  spoiledAfter:
    "The display shows 20, not -184. The program stops at `018`.\n\n20 is `014` as a decimal number: the return point after the handler added 4 to C2.\n\nThe handler left that word in R5, and the program, which knew nothing of the trap, showed it.",
  motivation:
    "A handler runs in the middle of another program. That program did not call the handler, and it cannot tell that the handler ran. So the handler must leave every register, R0 to R15, as it found it. It saves each register it writes in the RAM, and it puts each one back before `resume`.\n\nC2 is the exception. The handler writes C2 on purpose, and its new word, the return point plus 4, is the skip. The program does not use C2.",
  prediction:
    'The figure lists the same program with a new handler. This handler saves R5 in the RAM and puts it back before `resume`.\n\nChoose an answer and press "Check my prediction".',
  p1Question: "When the program stops, what does the word at `408` hold, as a decimal number?",
  p1Explain:
    "The word at `408` holds -184: room A's reading, which R5 held when the handler saved it.\n\nThe handler saved R5 before its first write to R5, so 52 and 20 never reach `408`.\n\nPutting R5 back reads the word and leaves it there.",
  investigation:
    "The figure runs the program with a handler that saves R5 first and puts it back last. The watch shows R5 and the word at `408`. The control registers are shown too.",
  savedLead:
    '1. Press "Run to a breakpoint". The run pauses at the handler\'s first line, with R5 holding -184.\n2. Press "Step": the word at `408` takes -184.\n3. Keep pressing "Step" through the handler. Watch R5 change, and see it take -184 back before `resume`.\n4. Press "Run to the end".',
  savedAfter:
    "The display shows -184, and the program stops at `018`.\n\n14 instructions ran and 1 trap went to the handler. That is two more instructions than before: the save and the putting back.\n\nThe handler still wrote R5, but R5 held -184 again when `resume` ran.",
  construction:
    "Read each handler, and decide whether the program finds its registers as it left them after `resume`.",
  choicesLead: "Decide for each handler, then run the tests.",
  c1Task:
    "1. Each handler below skips the instruction that faulted. For each, choose whether the program, after `resume`, finds every register as it left it, or finds a register changed.\n2. There are 4 tests, one for each handler.\n\nThe four handlers follow, each under its letter.",
  A: "```\nhandler: word[0x408] <= R5\n        R5 <= C2\n        R5 <= R5 + 4\n        C2 <= R5\n        R5 <= word[0x408]\n        resume\n```",
  B: "```\nhandler: word[0x408] <= R5\n        R5 <= C2\n        R6 <= R5 + 4\n        C2 <= R6\n        R5 <= word[0x408]\n        resume\n```",
  C: "```\nhandler: word[0x408] <= R5\n        R5 <= C2\n        R5 <= R5 + 4\n        C2 <= R5\n        R5 <= word[0x410]\n        resume\n```",
  D: "```\nhandler: word[0x408] <= R5\n        word[0x410] <= R6\n        R5 <= C2\n        R6 <= 4\n        R5 <= R5 + R6\n        C2 <= R5\n        R6 <= word[0x410]\n        R5 <= word[0x408]\n        resume\n```",
  c1Hints: [
    "The idea: list every register the handler writes. Check that each one is saved before it is written, and put back from the same word before `resume`.",
    "A common mistake is checking only R5. A handler that writes any other register must save that one too.",
    "A smaller example: the investigation's handler writes only R5. It saves R5 at `408` and puts it back from `408`.",
    "Part of the answer: handler B writes R6 with `R6 <= R5 + 4`, and it never saves R6.",
    "The whole answer: A leaves every register as it was. B changes one. C changes one. D leaves every register as it was.",
  ],
  failureExperiment:
    "A handler could save R5 on the stack, below the word R14 names, as a function does.\n\nThe figure runs a program whose stack has grown into the ROM: R14 holds `3F8` when its push faults.\n\nThe handler's first line stores R5 at R14 minus 8.",
  stackLead: 'Predict how the run ends, then press "Run to the end".',
  stackAfter:
    "The machine halts with cause `34` at `01C`, the handler's first line.\n\nThe push at `014` trapped, and the machine went to the handler. The handler's own store, at `3F0`, is in the ROM too.\n\nA fault at the address C4 holds halts the machine, so nothing more runs.",
  explanation:
    "A handler saves each register it writes, before it writes it, and puts it back before `resume`.\n\nIt saves a register with an absolute store, at an address the instruction's constant gives: `word[0x408] <= R5`. It puts the register back with `R5 <= word[0x408]`.\n\nAn absolute store needs no register to hold its address. So the handler can save R5 before it has changed any register, as its first line.\n\nIt cannot push on the stack. The stack belongs to the program, and R14 may be what went wrong, as the last figure showed.\n\nThe handler's words live at addresses it alone uses. Here `400` holds the cause, and `408` holds R5.\n\nThe control registers are the handler's own. The program never sees them change.",
  timelineLead:
    "This is the trap timeline of the same run, with the saving handler. The first press of \"Next edge\" shows edge 4, `R0 <= 0`, the edge before the trap. Only the timeline shows each edge's transfers. Look for these:\n\n1. Edge 5: the store at `010` traps. That one edge makes five transfers: C2 ← `010`, C1 ← `01`, C0 ← `01`, C3 ← `34` and PC ← `01C`.\n2. Edge 13: `resume` makes two transfers: C0 ← `01` (C1's word) and PC ← `014`.\n3. Each edge between them makes one or two transfers: a register or a word, and the PC.",
  generalisation:
    "The calling convention lets a function change R0 to R9. That is R0, R1 to R4 for the arguments, R1 for the result, and R5 to R9 as free registers. The caller made the function call, so it knows those registers may change.\n\nA program never knows a trap happened. So a handler keeps every register, R0 to R15, as it was.\n\nEach register a handler writes costs two more instructions: a save and a put back. So a handler writes as few registers as it can.",
  saveLead: "Write the handler, step through it on the tests' programs, then run the tests.",
  c2Task:
    "1. The starting text's handler counts each refused store in the word at `400` (`word[0x400]`) and skips it. It writes R5 and does not save it.\n2. Change the handler so that every register, R0 to R15, holds after `resume` what it held before the trap. The count and the skip must still work.\n3. There are 3 tests. Each test adds a program after yours, named `program`. Each program puts its own words in R0 to R15 (11, 22 and so on up to 176), then makes one or two stores the machine refuses, then stops at its last line, `end: stop`.\n4. One program first sets R14 to `0x400` and pushes, so its push faults in the ROM; its R14 then holds `3F8`.\n5. Each test checks the count at `400`, every register from R0 to R15, the causes in order, and that the run stops at the program's `end`.",
  c2Hints: [
    "The idea: save R5 with an absolute store before the handler's first write, and put it back just before `resume`.",
    "A common mistake: saving R5 on the stack. One test's stack has reached the ROM, and the save would fault.",
    "A smaller example: a handler that writes R7 alone saves R7 with `word[0x410] <= R7` as its first line, and puts it back with `R7 <= word[0x410]` just before `resume`.",
    "Part of the answer: the count lives at `400`, so the saved word needs an address of its own, such as `408`.",
    "The whole answer:\n\n```\n        R1 <= handler\n        C4 <= R1\n        R1 <= 0\n        word[0x400] <= R1       // the count of refused stores\n        goto program\nhandler: word[0x408] <= R5      // save R5\n        R5 <= word[0x400]\n        R5 <= R5 + 1\n        word[0x400] <= R5\n        R5 <= C2\n        R5 <= R5 + 4\n        C2 <= R5\n        R5 <= word[0x408]       // put R5 back\n        resume\n```",
  ],
  reflection:
    "The handler keeps the program's registers safe, and skips the program's mistakes.\n\nBut the program in this lesson ran with the machine's full reach. A stray store could change the lamps or the timer, and a stray `C4 <= R1` the handler's address, before anything faulted.\n\nHow could the machine keep a faulty program away from the shop's devices, and away from the handler?",
  modelVsReality:
    "Real handlers save registers as this one does, in memory set aside for them.\n\nMany real machines give the handler a stack of its own, separate from the program's. This machine does not have one.",
} as const;
