// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson room-to-grow, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs, brief 4R) and
// checked against the lesson.

export const LABELS = {
  title: "What room is left in the instruction set, and what would a missing instruction cost?",
  objectives: [
    "Say why a machine refuses instructions it does not define, a word of zeros among them.",
    "Predict what the machine does with data placed after a program.",
    "Weigh what a left-out instruction costs the circuit and saves a program.",
    "Count a program's instructions with and without a left-out instruction.",
  ],
  titles: {
    question: "What is left",
    motivation: "Codes the machine refuses",
    prediction: "Data after a program",
    investigation: "Multiplying without multiply",
    construction: "Codes for later",
    failureExperiment: "An old program on the new machine",
    explanation: "What each left-out instruction costs",
    generalisation: "Why refuse",
    challenge: "Calls counted",
    reflection: "Choosing an instruction",
  },
  challengeTitles: {
    c1: "Codes, sorted",
    c2: "Calls, counted",
  },
  captions: {
    map: "Every kind and job the decoder knows.",
    predictData: "Predict where the run halts, then run it.",
    multiply: "Run both programs that work out 7 × 5.",
    sortCodes: "Sort each code and run the tests.",
    oldProgram: "Run an old program on the course's machine and on your copy.",
    countCalls: "Count both runs and run the tests.",
    joinPlaces: "Part of the datapath: where left-out instructions join.",
  },
  options: {
    p1At008: "a halt at 008, cause 21",
    p1At00C: "one more instruction, then a halt at 00C, cause 21",
    p1Never: "no halt",
  },
  programs: {
    dataAfter: "Two instructions, then data",
    loop: "7 × 5 in a loop",
    doubling: "7 × 5 by doubling",
    course: "The course's machine",
    copy: "Your copy, with kind 9",
  },
  joinNotes: {
    pickB: ["compare", "with zero"],
    alu: ["multiply", "shift"],
    yWord: ["multiply and", "shift results"],
    plus4: ["call via", "register", "already here"],
  },
  joinMark: "a place where a left-out instruction would join",
  fates: {
    free: "Free: a later instruction can take it",
    taken: "Taken: an old program may use it",
    refused: "Kept refused: it halts a program that runs off its end",
  },
  codes: {
    kind1job8: "18123000 (kind 1, job 8)",
    zeros: "00000000",
    never: "51000000 (a branch, never)",
    kindB: "B1230000 (kind B)",
    stop: "84000000 (the stop)",
    kind9: "9040F000 (kind 9, on the course's machine)",
  },
  counts: {
    withCall: "Instructions run with the call through a register",
    withoutCall: "Instructions run without it",
  },
} as const;
