// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson instruction-set, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "What must every machine running a program agree on?",
  objectives: [
    "Compare two machines after every instruction of one program.",
    "Say which parts every machine must agree on.",
    "Tell a fault that keeps the agreement from one that breaks it.",
    "Write a circuit whose jobs take 3 edges.",
  ],
  titles: {
    question: "Two machines, one program",
    motivation: "The shared parts",
    prediction: "The middle of an instruction",
    investigation: "Side by side",
    construction: "What instructions name",
    failureExperiment: "Two faults",
    explanation: "The instruction set",
    generalisation: "A third circuit",
    challenge: "Jobs in three edges",
    reflection: "What the layout costs",
  },
  challengeTitles: {
    c1: "Parts, sorted",
    c2: "Jobs, three edges",
  },
  captions: {
    parts: "The parts of the two machines, read from their circuits.",
    predictMid: "Predict what the machines differ on, then check.",
    sideBySide: "Run both machines and compare them.",
    sortParts: "Sort each part and run the tests.",
    compareFaults: "Choose a fault and run the program.",
    writeShortJobs: "Change the machine's text and run it.",
  },
  options: {
    p1Nothing: "Nothing",
    p1R2: "R2",
    p1Pc: "The PC",
  },
  sort: {
    set: "Every machine agrees on it",
    own: "One circuit's own",
  },
  parts: {
    r7: "R7",
    pc: "The PC",
    ir: "The IR",
    hr: "HR",
    state: "The controller's state",
    ram: "The word at `400`",
    display: "The display",
    ha: "HA",
    timer: "The timer's count",
  },
  faults: {
    holdr: "HOLDR stuck at 1",
    pcen: "PCEN stuck at 1",
  },
} as const;
