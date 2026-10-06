// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson alu-jobs, drafted by the prose process from
// a brief of facts (see CLAUDE.md and docs/notes/module-7-alu.md) and checked against the lesson.

export const LABELS = {
  title: "How can the ALU take on four more jobs?",
  objectives: [
    "Choose any of the eight jobs using the select inputs OP2, OP1, OP0.",
    "Say which second word D the adder adds for each arithmetic job.",
    "Build the circuit for one bit of D.",
    "Build one slice that does all eight jobs, and chain copies of it to any width.",
  ],
  titles: {
    question: "Four more jobs",
    motivation: "Arithmetic with one adder",
    prediction: "Counting down from zero",
    investigation: "The eight jobs",
    construction: "The adder's second word",
    failureExperiment: "Faults in the ALU",
    explanation: "Carry into bit 0",
    generalisation: "Counting at 16 bits",
    challenge: "The eight-job slice",
    reflection: "The slice's eight jobs",
  },
  challengeTitles: {
    c1: "Second-word bit, drawn",
    c2: "Eight-job slice, drawn",
  },
  captions: {
    predictCountDown: "Predict what count down gives when A is 0000, then check.",
    eightJobs: "Press OP2, OP1 and OP0 through eight codes; watch Y.",
    buildOperand: "Build one bit of D and run the tests.",
    jobFaults: "Choose a fault option and run the checks.",
    operandCarry: "Change B and the select inputs; watch D and C0.",
    jobs16: "Count up and down on 16-bit words.",
    buildSlice: "Draw one slice and run the tests at four widths.",
  },
  options: {
    p1Zero: "Y is 0000",
    p1AllOnes: "Y is 1111",
    p1One: "Y is 0001",
  },
  faults: {
    c0Low: "C0 stuck at 0",
    op2Low: "OP2 stuck at 0",
    c2Low: "C2 stuck at 0",
  },
} as const;
