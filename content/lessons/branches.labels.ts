// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson branches, drafted by the prose process from
// a brief of facts (docs/notes/module-8-datapath.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "How does a program choose what to run next?",
  objectives: [
    "Predict whether a branch is taken from the ALU's flags.",
    "Step one edge of the whole datapath.",
    "Write the condition block from the job digit and the flags.",
    "Complete the datapath's text with the next PC.",
  ],
  titles: {
    question: "In order no longer",
    motivation: "The branch and its conditions",
    prediction: "Which room is colder",
    investigation: "A loop that adds",
    construction: "The condition written as text",
    failureExperiment: "MET stuck at 1 and at 0",
    explanation: "One edge, step by step",
    generalisation: "Calls and jumps",
    challenge: "The next PC written as text",
    reflection: "The whole datapath and the next question",
  },
  challengeTitles: {
    c1: "The condition block, written",
    c2: "The whole datapath, written",
  },
  captions: {
    predictBranch: "Predict PC after the branch, then check.",
    sum: "Run the loop edge by edge.",
    writeCondition: "Write the condition block and run the tests.",
    branchFaults: "Choose a fault and run the loop.",
    oneInstruction: "Clock one edge and step through it.",
    call: "Run the call and the jump back.",
    writeNext: "Complete the text and run the tests.",
    flow: "Draft: the flow.",
    callFlow: "Draft: the call flow.",
  },
  options: {
    p1Next: "PC is 00C, not taken.",
    p1Target: "PC is 010, taken.",
  },
  faults: {
    metHigh: "MET stuck at 1",
    metLow: "MET stuck at 0",
  },
  programs: { sum: "Draft sum", call: "Draft call" },
} as const;
