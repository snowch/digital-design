// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson log-report, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 7L) and checked against
// the lesson.

export const LABELS = {
  title: "Can you write a program the shop can use?",
  objectives: [
    "Write a program from requirements and tests.",
    "Build it from functions that keep the calling convention.",
    "Test each function alone and the whole program on logs that reach the edges.",
    "Find and mend mistakes with the debugger.",
  ],
  titles: {
    question: "The day's report",
    motivation: "What the report must show",
    prediction: "The lowest of log 5",
    investigation: "The given function at work",
    construction: "The specification",
    failureExperiment: "A highest started at 0",
    explanation: "The module's lessons in one program",
    generalisation: "A program the shop can rely on",
    challenge: "Three ways in",
    reflection: "When a program does wrong",
  },
  challengeTitles: {
    c1: "The day's report",
  },
  captions: {
    asks: "Run the starting text on six logs to see what each report shows.",
    predict: "Predict what lowest returns for log 5, then run it.",
    walk: "Step through the lowest function on log 5 with a breakpoint and a watch.",
    fromZero: "Run this report on the six logs, starting its highest at 0.",
    report: "Write the report and run the tests.",
  },
  options: {
    first: "-184: the first reading",
    lowest: "-190: the last reading",
    nearest: "12: the reading nearest 0",
  },
  checks: {
    display: "Display",
    lamps: "Lamps",
    lowest: "Word at 400, the lowest",
    highest: "Word at 408, the highest",
  },
  logTitle: "Log",
  logPrefix: "Log",
  wholeProgram: "the whole program",
} as const;
