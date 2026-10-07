// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson recursion, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 5L) and checked against
// the lesson.

export const LABELS = {
  title: "Can a function call itself?",
  objectives: [
    "Write a function that calls itself on the rest of a list.",
    "Say what each call's frame holds and how deep the stack goes.",
    "Give a function a last case that calls nothing.",
    "Say what happens when the stack runs into the ROM.",
  ],
  titles: {
    question: "The log newest first",
    motivation: "A function that calls itself",
    prediction: "The order shown",
    investigation: "Five calls, four frames",
    construction: "Colder readings, newest first",
    failureExperiment: "A stack with no end",
    explanation: "Why recursion works",
    generalisation: "When recursion fits",
    challenge: "How deep the stack goes",
    reflection: "A wrong answer",
  },
  challengeTitles: {
    c1: "Colder readings, newest first",
    c2: "How deep the stack goes",
  },
  captions: {
    depth: "The stack's words over a run that shows the log newest first.",
    predict: "Predict the order of the readings, then run the program.",
    frames: "The function's calls and frames in the debugger.",
    colder: "Write the function and run the tests.",
    noLast: "The function without its last case.",
    tooLong: "The stack's words over a run on a log of 61 readings.",
    depths: "Work out the answers and run the tests.",
  },
  options: {
    oldest: "-184, -190, -176, -181: oldest first",
    newest: "-181, -176, -190, -184: newest first",
    one: "-184: the first reading only",
  },
  fields: {
    words: "Words on the stack at its deepest, for 5 readings",
    lowest: "R14 then, in hexadecimal",
    longest: "The most readings newest can show",
  },
  logPrefix: "Log",
  limitPrefix: "limit",
  emptyLog: "empty",
} as const;
