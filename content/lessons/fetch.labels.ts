// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson fetch, drafted by the prose process from
// a brief of facts (docs/notes/module-8-datapath.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "How does the machine know which instruction comes next?",
  objectives: [
    "Follow the program counter through a program's edges.",
    "Predict when and why the machine stops.",
    "Write the program counter with reset and GO.",
    "Write the ROM's fetch checks as a module.",
  ],
  titles: {
    question: "The machine, so far",
    motivation: "The program counter",
    prediction: "When does the machine stop?",
    investigation: "Step by step",
    construction: "Write the program counter",
    failureExperiment: "When PC4 breaks",
    explanation: "Fetch and its signals",
    generalisation: "What every fetch checks",
    challenge: "Write the checks",
    reflection: "What comes next",
  },
  challengeTitles: {
    c1: "Program counter, written",
    c2: "Fetch checks, written",
  },
  captions: {
    predictEnd: "Predict what happens next, then check.",
    margin: "Step through the program.",
    writePc: "Write the program counter and run the tests.",
    fetchFaults: "Choose a fault and run it.",
    writeChecks: "Write the checks and run the tests.",
  },
  options: {
    p1On: "Runs on to address 00C",
    p1Stops: "Stops, cause 21",
    p1Stop: "Stops at the end, cause 00",
  },
  faults: {
    pc4Low: "PC4 held at 0",
    stopLow: "STOP held at 0",
  },
} as const;
