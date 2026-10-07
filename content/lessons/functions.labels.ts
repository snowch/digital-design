// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson functions, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 3L) and checked against
// the lesson.

export const LABELS = {
  title: "How can a program use one piece of program from two places?",
  objectives: [
    "Call a function and return from it with R15.",
    "Pass arguments in R1 to R4 and take the result from R1.",
    "Keep a word through a call in a register the calling convention keeps.",
    "Write a function a test can call on its own.",
  ],
  titles: {
    question: "One check, two rooms",
    motivation: "A call and its return",
    prediction: "What R15 holds when the program stops",
    investigation: "A function called twice",
    construction: "An agreement on registers",
    failureExperiment: "A function that spoils its caller",
    explanation: "What the machine knows",
    generalisation: "Written once, tested alone",
    challenge: "The function outOfRange",
    reflection: "A function that calls another",
  },
  challengeTitles: {
    c1: "The larger amount",
    c2: "The function outOfRange",
  },
  captions: {
    twoWays: "The same work, written twice, then written once and called twice.",
    predict: "The program's listing, with a question about R15.",
    callReturn: "The function overBy, called twice, in the debugger.",
    spoiled: "Two programs, one whose overBy changes R10.",
    larger: "The larger amount: a main program that calls overBy twice, and its tests.",
    range: "The function outOfRange and its tests.",
  },
  programs: {
    twice: "Written out twice",
    once: "Written once, called twice",
    keeps: "Its overBy keeps R10.",
    spoils: "Its overBy changes R10.",
  },
  callPrefix: "Call",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
  fridgePrefix: "Fridge at",
} as const;
