// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson debugging, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 6L) and checked against
// the lesson.

export const LABELS = {
  title: "How do you find the mistake in a program that runs and gives a wrong answer?",
  objectives: [
    "Find a mistake by saying what each part should leave and watching for the first value that differs.",
    "Read how a run ended and where to look.",
    "Choose test logs that reach the edges.",
    "Mend a program with more than one mistake, one at a time.",
  ],
  titles: {
    question: "A count that is sometimes wrong",
    motivation: "A method in five steps",
    prediction: "What R2 should hold",
    investigation: "The reading never loaded",
    construction: "Mending the count",
    failureExperiment: "A halt far from the mistake",
    explanation: "How a run ends",
    generalisation: "Tests that reach the edges",
    challenge: "Two mistakes",
    reflection: "A program the shop can use",
  },
  challengeTitles: {
    c1: "Mending the count",
    c2: "Two mistakes in a count over the limit",
  },
  captions: {
    results: "The count run on five logs beside what each should show.",
    predict: "The count's listing with log 1, with a question about R2.",
    find: "The count, run on log 1, with a breakpoint and a watch.",
    mendCount: "Mend the program and run the tests.",
    stackInRom: "sumOver in the debugger with the stack starting at 400.",
    mendOver: "The count with two mistakes and its tests.",
  },
  displayCheck: "Display",
  logTitle: "Log",
  logPrefix: "Log",
  limitPrefix: "limit",
  emptyLog: "empty",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
} as const;
