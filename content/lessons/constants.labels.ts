// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson constants, drafted by the prose process from
// a brief of facts (docs/notes/module-8-datapath.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "How does an instruction carry a number to the ALU?",
  objectives: [
    "Read a constant job's digits and its constant, read signed.",
    "Predict the 64-bit word a 12-bit constant becomes.",
    "Write the widening as text.",
    "Add the selector for the ALU's B input to the datapath's text.",
  ],
  titles: {
    question: "Numbers no register holds",
    motivation: "The constant job, 12 bits",
    prediction: "What F9C becomes",
    investigation: "Constant jobs to clock",
    construction: "The widening written as text",
    failureExperiment: "Copied bit and BCONST at 0",
    explanation: "Why bit 11 is copied",
    generalisation: "Constants and their range",
    challenge: "The selector written as text",
    reflection: "What comes next",
  },
  challengeTitles: {
    c1: "Widening, written",
    c2: "Selector, written",
  },
  captions: {
    predictConstant: "Predict what R3 holds, then check.",
    constants: "Choose a constant job and clock the datapath.",
    writeWiden: "Write the widening and run the tests.",
    constantsFaults: "Choose a fault and an instruction, and clock it.",
    hour: "Build 3600 in two instructions.",
    writeConstants: "Write the selector and run the tests.",
    widening: "Choose a constant and compare its 12 bits with the 64-bit word.",
  },
  options: {
    p1Negative: "-100",
    p1Positive: "3996",
    p1Unknown: "X",
  },
  instructions: {
    copy: "25003F9C: R3 ← -100",
    add: "22103064: R3 ← R1 + 100",
    and: "201030FF: R3 ← R1 AND FF",
    largest: "250047FF: R4 ← 2047",
    smallest: "25004800: R4 ← -2048",
    register: "12123000: R3 ← R1 + R2; BCONST is 0",
    half: "25006708: R6 ← 1800",
    double: "12666000: R6 ← R6 + R6",
  },
  faults: {
    copyLow: "The copied bit stuck at 0",
    bconstLow: "BCONST stuck at 0",
  },
  widenings: {
    hundred: "064, which is 100",
    minusHundred: "F9C, which is -100",
    largest: "7FF, the largest, 2047",
    smallest: "800, the smallest, -2048",
  },
} as const;
