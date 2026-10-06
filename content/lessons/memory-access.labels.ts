// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson memory-access, drafted by the prose process from
// a brief of facts (docs/notes/module-8-datapath.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "How does an instruction read or write memory?",
  objectives: [
    "Read a load's and a store's digits and their address.",
    "Predict what a load writes into a register.",
    "Write the checks the memory makes on a load or store.",
    "Complete the datapath's text with its two new selectors.",
  ],
  titles: {
    question: "Words at addresses",
    motivation: "Loads and stores",
    prediction: "Load from a sensor",
    investigation: "The display's margin",
    construction: "The checks written",
    failureExperiment: "When LOAD and STORE break",
    explanation: "One memory, two reads",
    generalisation: "Bytes, RAM and devices",
    challenge: "Complete the datapath",
    reflection: "What comes next",
  },
  challengeTitles: {
    c1: "Memory checks, written",
    c2: "Datapath, complete",
  },
  captions: {
    predictLoad: "Predict what R2 holds after the next edge, then check.",
    showMargin: "Run the program and watch the memory.",
    writeMemcheck: "Write the checks and run the tests.",
    memoryFaults: "Choose a fault and run the program.",
    writeMemory: "Complete the text and run the tests.",
    map: "What each part of the memory accepts and refuses.",
  },
  options: {
    p1Reading: "-184",
    p1Address: "2008",
    p1Unknown: "X",
  },
  faults: {
    loadLow: "LOAD stuck at 0",
    storeHigh: "STORE stuck at 1",
  },
} as const;
