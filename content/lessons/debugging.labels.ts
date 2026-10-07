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
    question: "A counting program that is sometimes wrong",
    motivation: "A method in five steps",
    prediction: "What R2 should hold",
    investigation: "The reading never loaded",
    construction: "Mending the counting program",
    failureExperiment: "A halt far from the mistake",
    explanation: "How a run ends",
    generalisation: "Tests that reach the edges",
    challenge: "Two mistakes",
    reflection: "A program the shop can use",
  },
  challengeTitles: {
    c1: "Mending the counting program",
    c2: "Two mistakes in a program that counts readings above the limit",
    edge: "The log that shows the mistake",
  },
  captions: {
    results: "The counting program run on five logs, beside what each should show.",
    predict: "The counting program's listing with log 4, and a question about R2.",
    find: "The counting program run on log 4, with a breakpoint and a watch.",
    mendCount: "The counting program to mend, and its tests.",
    mendOver: "The program with two mistakes, and its tests.",
    countToLog:
      "A program that keeps its number of warm readings at the wrong address, in the debugger.",
    edgeListing: "A counting program that counts a reading equal to the limit.",
    edgeLog: "A question: which log shows that program's mistake.",
  },
  displayCheck: "Display",
  logTitle: "Log",
  logPrefix: "Log",
  limitPrefix: "limit",
  emptyLog: "empty",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
  edgeField: "The log that shows the mistake",
  edgeLogs: {
    below: "-190 and -185",
    above: "-170, -175 and -160",
    equal: "-180 and -190",
    empty: "An empty log",
  },
} as const;
