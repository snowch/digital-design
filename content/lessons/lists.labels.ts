// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson lists, drafted by the prose process from a
// brief of facts (docs/notes/module-11-programming/briefs, brief 2L) and checked against the lesson.

export const LABELS = {
  title: "How does a program work through a list of readings kept in memory?",
  objectives: [
    "Walk a list of readings in memory with a register that holds an address and steps by 8, and a count.",
    "Leave a loop early when it finds what it looks for.",
    "Pause a run with breakpoints and watch registers and words change.",
    "Say why readings of both signs need a signed comparison.",
  ],
  titles: {
    question: "A log of readings",
    motivation: "The same lines for every reading",
    prediction: "Where R1 points",
    investigation: "Watching the loop go round",
    construction: "Leaving a loop early",
    failureExperiment: "Readings above and below 0",
    explanation: "A loop's five parts",
    generalisation: "Any list, the same shape",
    challenge: "The largest rise",
    reflection: "The same check twice",
  },
  challengeTitles: {
    c1: "The first warm reading",
    c2: "The largest rise",
  },
  captions: {
    logInMemory: "Today's log as words in memory, with its count first.",
    predict: "Predict where R1 points at the fourth pause, then run the program.",
    walk: "The loop in the debugger, with a breakpoint, a watch and a view of the log.",
    first: "Write the program and run the tests.",
    signs: "The same loop, comparing signed and unsigned, on a log with a defrost.",
    rise: "Write the program and run the tests.",
  },
  memoryTitle: "Memory: count and log",
  logTitle: "Log",
  options: {
    at040: "040 (the first reading)",
    at058: "058 (the fourth reading)",
    at070: "070 (just past the log)",
  },
  programs: {
    signed: "Compared signed",
    unsigned: "Compared unsigned",
  },
  logPrefix: "Log",
  limitPrefix: "limit",
  emptyLog: "empty",
} as const;
