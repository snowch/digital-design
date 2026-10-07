// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson log-report, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, briefs 7L and 7R2) and checked against
// the lesson.

export const LABELS = {
  title: "Can you write a program the shop can use?",
  objectives: [
    "Write a program from requirements and tests.",
    "Build it from functions that keep the calling convention, one of which calls the others and keeps what it needs on the stack.",
    "Test each function alone, and the whole program, on logs that reach the edges.",
    "Find and mend mistakes with the debugger.",
  ],
  titles: {
    question: "The day's report",
    motivation: "What the report must show",
    prediction: "R2 after lowestOf returns",
    investigation: "lowestOf at work",
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
    asks: "The outline runs on six logs, beside the report each log asks for.",
    predict: "The listing of a program that calls lowestOf on log 5, with a question about R2.",
    walk: "The same program in the debugger, with a breakpoint on lowNext and a watch.",
    fromZero: "A report whose highestOf starts at 0, run on the six logs.",
    report: "The day's report, with its tests.",
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
