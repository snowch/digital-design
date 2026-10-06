// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson flags, drafted by the prose process from
// a brief of facts (see CLAUDE.md and docs/notes/module-7-alu.md) and checked against the lesson.

export const LABELS = {
  title: "How can four flags answer questions about a result?",
  objectives: [
    "Read ZERO, MINUS, COUT and OVER after any job.",
    "Build ZERO from slices, as the carry is built.",
    "Say what MINUS and OVER tell you after A - B.",
    "Build a lamp that says whether one word reads less than another, signed.",
  ],
  titles: {
    question: "Yes-or-no questions",
    motivation: "What the flags answer",
    prediction: "7 - (-8) in four bits",
    investigation: "Four flags on 3 - 5",
    construction: "The ZERO chain",
    failureExperiment: "Faults in the flags",
    explanation: "When MINUS is wrong",
    generalisation: "Rooms at 16 bits",
    challenge: "The COLDER lamp",
    reflection: "Four bits beside Y",
  },
  challengeTitles: {
    c1: "Zero-check bit, drawn",
    c2: "COLDER lamp, drawn",
  },
  captions: {
    predictMinus: "Predict MINUS for 0111 - 1000, then check.",
    fourFlags: "Change A, B and the code; watch the four flags.",
    buildZero: "Build the zero slice and run the tests.",
    flagFaults: "Choose a fault option and run the checks.",
    overflowLimit: "Read MINUS and OVER for 0111 - 1000.",
    roomsFlags: "Subtract the rooms' words and read the flags.",
    buildColder: "Draw the COLDER lamp from the flags.",
  },
  options: {
    p1Zero: "MINUS is 0",
    p1One: "MINUS is 1",
  },
  faults: {
    z2High: "Z2 stuck at 1",
    z0Low: "Z0 stuck at 0",
    c3Low: "C3 stuck at 0",
  },
} as const;
