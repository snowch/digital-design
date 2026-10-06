// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson micro-operations, drafted by the prose process from
// a brief of facts (docs/notes/module-9-control.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "What happens at each instruction edge?",
  objectives: [
    "Predict which register an edge writes.",
    "Follow one edge in four linked views.",
    "Write the controller's output logic.",
    "Write the controller as text.",
  ],
  titles: {
    question: "What each edge does",
    motivation: "Transfers edge by edge",
    prediction: "The third edge",
    investigation: "Four views of one run",
    construction: "Each signal from the state",
    failureExperiment: "A moving PC and a lost store",
    explanation: "Signals that wait for the edge",
    generalisation: "A list of micro-operations",
    challenge: "The controller as text",
    reflection: "The control unit, complete",
  },
  challengeTitles: {
    c1: "Output logic, written",
    c2: "Controller, written",
  },
  captions: {
    predictTook: "Predict the register the next edge writes, then check.",
    fourViews: "Clock edges and watch the four views move.",
    writeOutputs: "Write the output logic and run the tests.",
    signalFaults: "Choose a fault and run the margin.",
    writeController: "Complete the controller and run the tests.",
  },
  options: {
    p1Ir: "IR, the instruction register.",
    p1Hr: "HR, the ALU's result.",
    p1R1: "R1, the instruction's Y.",
  },
  faults: {
    pcenHigh: "PCEN stuck at 1",
    mstoreLow: "MSTORE stuck at 0",
  },
  checks: {},
} as const;
