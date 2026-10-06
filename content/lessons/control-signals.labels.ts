// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson control-signals, drafted by the prose
// process from a brief of facts (docs/notes/module-9-control.md and its briefs) and checked
// against the lesson.

export const LABELS = {
  title: "TODO",
  objectives: ["TODO"],
  titles: {
    question: "TODO q",
    motivation: "TODO m",
    prediction: "TODO p",
    investigation: "TODO i",
    construction: "TODO c",
    failureExperiment: "TODO f",
    explanation: "TODO e",
    generalisation: "TODO g",
    challenge: "TODO ch",
    reflection: "TODO r",
  },
  challengeTitles: { c1: "TODO c1", c2: "TODO c2" },
  captions: {
    signalsTable: "TODO",
    predictJump: "TODO",
    decoderOpen: "TODO",
    writeWrites: "TODO",
    decoderFaults: "TODO",
    writeSignals: "TODO",
  },
  options: { p1Zero: "TODO 0", p1One: "TODO 1" },
  faults: { op0And: "TODO a", loadLow: "TODO b" },
  checks: {
    subtract: "c1",
    addConstant: "c2",
    load: "c3",
    store: "c4",
    branch: "c5",
    call: "c6",
    jump: "c7",
  },
} as const;
