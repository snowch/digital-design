// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson on alu, drafted by the prose
// process from a brief of facts (see CLAUDE.md and docs/notes/module-3-combinational.md) and
// checked against the lesson's structure.

export const LABELS = {
  title: "How can one block do four jobs on two words?",
  objectives: [
    "Subtract using an adder by turning B over and setting the carry into bit 0 to 1.",
    "Build one bit of an add-or-subtract unit and say what a chain does.",
    "Choose one of four jobs using OP1 and OP0 and a 4-way selector, one bit at a time.",
    "Build one slice of the ALU that works at any width.",
  ],
  titles: {
    question: "Four jobs",
    motivation: "One adder, both jobs",
    prediction: "NOT B plus one",
    investigation: "The four-job block",
    construction: "Building one bit",
    failureExperiment: "Faults in the unit",
    explanation: "Negation in binary",
    generalisation: "The rooms at 16 bits",
    challenge: "The four-job slice",
    reflection: "What you have built",
  },
  challengeTitles: {
    c1: "Add-or-subtract bit, drawn",
    c2: "The ALU slice, drawn",
  },
  captions: {
    predictMinus: "Predict what NOT B plus 1 gives for B = 0011, then check.",
    aluBlock: "Press OP1 and OP0 to change which job the block does, and watch Y.",
    buildAddsub: "Build one bit of the add-or-subtract unit and run the tests.",
    addsubFaults: "Choose a fault option and run the checks.",
    addsubRow: "Change A, B and SUB, then read the result as a signed word.",
    alu16: "Try the four jobs on the two rooms' words.",
    buildAluSlice: "Draw one slice and run the tests at four widths.",
  },
  options: {
    p1NotB: "NEG is 1100",
    p1NotBPlusOne: "NEG is 1101",
    p1Same: "NEG is 0011",
  },
  faults: {
    c0Low: "C0 stuck at 0",
    xorToOr: "Bit 1's xorB changed to OR",
    c2Low: "C2 stuck at 0",
  },
} as const;
