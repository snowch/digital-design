// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson instructions, drafted by the prose process from
// a brief of facts (docs/notes/module-8-datapath.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "Where do the ALU's two words come from?",
  objectives: [
    "Read an instruction's digits as the fields K, J, A, B, Y and C.",
    "Predict what the register jobs' datapath writes at one edge.",
    "Write the digits module with part selects.",
    "Write the datapath as text from the register file and ALU.",
  ],
  titles: {
    question: "Where the ALU's words come from",
    motivation: "One edge, one instruction",
    prediction: "What one edge writes",
    investigation: "Tracing the datapath",
    construction: "The digits module",
    failureExperiment: "When wires fail",
    explanation: "At the clock edge",
    generalisation: "Every job is the same",
    challenge: "Write the datapath",
    reflection: "The next question",
  },
  challengeTitles: {
    c1: "Digits, written",
    c2: "Datapath, written",
  },
  captions: {
    predictDifference: "Predict what R3 holds after one edge, then check.",
    jobs: "Choose an instruction and clock the datapath.",
    writeDigits: "Write the digits module and run the tests.",
    jobsFaults: "Choose a fault and an instruction, then clock it.",
    writeJobs: "Write the datapath and run the tests.",
    fields: "Choose an instruction and read its six fields.",
  },
  options: {
    p1Sum: "-434",
    p1Difference: "66",
    p1Other: "-66",
  },
  instructions: {
    subtract: "13123000: R3 ← R1 - R2",
    add: "12123000: R3 ← R1 + R2",
    copy: "15024000: R4 ← R2",
    countUp: "16101000: R1 ← R1 + 1",
    noWrite: "13123000: R3 ← R1 - R2. WRITEY is 0, so nothing is written.",
  },
  faults: {
    yLow: "The Y digit stuck at 0",
    op0Low: "OP0 stuck at 0",
  },
  fieldIgnored: { copyA: "Draft copy A", countUpB: "Draft count B" },
  fieldNotes: {
    K: "the kind; 1 is a register job",
    J: "the job; bits 2 to 0 are the ALU code",
    A: "read onto QA, the ALU's A",
    B: "read onto QB, the ALU's B",
    Y: "the register written",
    C: "a constant; a register job does not use it",
  },
} as const;
