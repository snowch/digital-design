// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson "Can you build every gate from NAND alone?", drafted by the prose process
// from a brief of facts (brief E, docs/notes/module-2-boolean-logic.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "Can you build every gate from NAND alone?",
  objectives: [
    "Build NOT and AND from NAND gates alone.",
    "Explain why NAND alone can build any truth table.",
    "Explain why NOR is a universal gate.",
    "Build XOR from NAND gates.",
  ],
  titles: {
    question: "One kind of chip",
    motivation: "Why one kind matters",
    prediction: "Both inputs on A",
    investigation: "NAND's truth table",
    construction: "NOT and AND from NAND",
    failureExperiment: "Three NAND gates broken three ways",
    explanation: "Why NAND is universal",
    generalisation: "Why NOR is universal",
    challenge: "XOR from NAND",
    reflection: "Universality and efficiency",
  },
  challengeTitles: {
    c1: "NOT from NAND",
    c2: "AND from NAND",
    c3: "XOR from NAND",
  },
  captions: {
    predictTied: "Predict Y: A is 1, both inputs on A.",
    exploreNand: "Press A and B; watch Y and the shaded row.",
    buildNot: "Draw NOT from NAND gates and run the tests.",
    buildAnd: "Draw AND from NAND gates and run the tests.",
    orFaults: "Choose a fault in the OR, run the checks.",
    clashExpression: "CLASH circuit as one expression.",
    exploreNor: "Press A and B; watch Y and the shaded row.",
    exploreNorTied: "NOR gate: both inputs on A; press A.",
    buildXor: "Draw XOR from NAND gates and run the tests.",
  },
  faults: {
    cutNa: "Wire NA is cut",
    nandAToAnd: "Gate nandA is AND instead of NAND",
    nandYToAnd: "Gate nandY is AND instead of NAND",
  },
  options: {
    y0: "Y is 0",
    y1: "Y is 1",
  },
  steps: {
    a1: "A 1",
  },
} as const;
