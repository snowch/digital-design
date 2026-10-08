// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson saving-state, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 2L)
// and checked against the lesson.

export const LABELS = {
  title: "What must a handler leave as it found it?",
  objectives: [
    "Say why a handler must leave every register as it found it.",
    "Save a register with an absolute store and put it back before `resume`.",
    "Say why a handler does not save on the program's stack.",
    "Judge whether a handler leaves a program's registers alone.",
  ],
  titles: {
    question: "A reading spoiled",
    motivation: "Save, then put back",
    prediction: "The word at 408",
    investigation: "A handler that saves R5",
    construction: "Four handlers judged",
    failureExperiment: "A stack in the ROM",
    explanation: "Where a handler keeps its words",
    generalisation: "Every register kept",
    challenge: "A handler that keeps every register",
    reflection: "Keeping a program away from the devices",
  },
  challengeTitles: {
    c1: "Four handlers",
    c2: "A handler that keeps every register",
  },
  captions: {
    spoiled: "A program keeps room A's reading in R5, with lesson 1's handler, in the debugger.",
    predict:
      "The same program with a handler that saves R5, listed, with a question about the word at 408.",
    saved: "The same program with a handler that saves R5, in the debugger.",
    choices: "Four handlers, each to be judged.",
    stack: "A handler that saves R5 below a stack in the ROM, in the debugger.",
    timeline: "The run with the saving handler, edge by edge.",
    save: "A handler that keeps every register, and its tests.",
  },
  choiceFields: {
    a: "Handler A",
    b: "Handler B",
    c: "Handler C",
    d: "Handler D",
  },
  choiceOptions: {
    leaves: "Leaves every register as it was",
    changes: "Changes a register",
  },
  saveLabels: ["One refused store", "Two refused stores", "A stack at the ROM"],
} as const;
