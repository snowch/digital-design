// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson wide-alu, drafted by the prose process from
// a brief of facts (see CLAUDE.md and docs/notes/module-7-alu.md) and checked against the lesson.

export const LABELS = {
  title: "How does the same ALU work at 64 bits?",
  objectives: [
    "Say how far a carry travels, and what it costs in steps.",
    "Open a 64-bit ALU, one level at a time.",
    "Write an adder whose width is a parameter, with a carry out.",
    "Write the adder's second word for the eight jobs, at any width.",
  ],
  titles: {
    question: "When 16 bits run out",
    motivation: "What width costs",
    prediction: "Two counts compared",
    investigation: "The carry, step by step",
    construction: "An adder of any width, written",
    failureExperiment: "A carry lost between groups",
    explanation: "One level at a time",
    generalisation: "The carry at 64 bits",
    challenge: "The second word, written",
    reflection: "One design, any width",
  },
  challengeTitles: {
    c1: "Adder, written",
    c2: "Adder's second word, written",
  },
  captions: {
    predictSteps: "Predict which change takes more steps, then check.",
    carry16: "Step through each change and watch the carries.",
    writeAdder: "Write the adder and run the tests.",
    wideFaults: "Choose a fault option and run the checks.",
    levels64: "Open the 64-bit ALU one level at a time.",
    carry64: "Step through the carry at 64 bits.",
    writeOperand: "Write the second word and run the tests.",
  },
  options: {
    p1First: "The first change",
    p1Second: "The second change",
    p1Same: "The same number",
  },
  cases: {
    oneUp: "A from 0000 to 0001",
    byteUp: "A from 0000 to 00FF",
    allUp: "A from 0000 to FFFF",
    oneUp64: "A from all 0s to 1",
    allUp64: "A from all 0s to all 1s",
  },
  faults: {
    c32Low: "C32 stuck at 0",
    c16High: "C16 stuck at 1",
  },
} as const;
