// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson system-call-mechanism, drafted by the
// prose process from a brief of facts (docs/notes/module-12-traps/briefs, brief 8L) and
// checked against the lesson.

export const LABELS = {
  title: "Can you write the handler that runs the shop's programs?",
  objectives: [
    "Run a table of programs one after another, each in user mode.",
    "Offer jobs 1 to 4 by call system.",
    "End a program that faults, and record why.",
    "Keep the handler's own state where no program can change it by accident.",
  ],
  titles: {
    question: "A handler for the shop",
    motivation: "The handler's parts",
    prediction: "A program's record",
    investigation: "The whole handler at work",
    construction: "Building it in steps",
    failureExperiment: "A handler that skips",
    explanation: "Two ways to end",
    generalisation: "The program that runs the others",
    challenge: "The shop's handler",
    reflection: "One machine, top to bottom",
  },
  challengeTitles: {
    c1: "The shop's handler",
  },
  captions: {
    asks: "The six runs the tests use, with what a guided start leaves.",
    predict: "The whole handler and two programs, listed, with a question about a record.",
    walk: "The whole handler running two programs, in the debugger.",
    skipping: "The six runs, with a handler that skips faulting instructions.",
    run: "The shop's handler to write, and its tests.",
  },
  checks: {
    shown: "Words shown",
    lamps: "Lamps",
    first: "First program's record",
    second: "Second program's record",
    end: "How the run ends",
  },
  runLabels: [
    "Two programs that end with job 4",
    "A program that stores to the display itself",
    "The lamps, then a program that runs stop",
    "A word kept in R10 across a job",
    "Room 5, and a program that is not instructions",
    "No programs",
  ],
  runNotes: [
    "One program shows 25, and the other shows room B's reading.",
    "One program stores 7 to the display, and the other shows 8.",
    "One program lights NIGHT, and the other runs stop.",
    "One program keeps 77 in R10, shows 5, then shows 77.",
    "One program asks job 2 for room 5 and shows R1, and the table names a word that is not an instruction.",
    "The table names no program.",
  ],
  recordsTitle: "The records at 400 and 408",
  numberTitle: "The program's number at 480",
} as const;
