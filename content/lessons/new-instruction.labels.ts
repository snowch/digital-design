// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson new-instruction, drafted by the prose process from
// a brief of facts (docs/notes/module-9-control.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "What does it take to add an instruction?",
  objectives: [
    "Predict how many edges the new instruction takes.",
    "Follow a call through a register edge by edge.",
    "Add kind 9 to the decoder's text.",
    "Run the whole machine with the new instruction.",
  ],
  titles: {
    question: "One new instruction",
    motivation: "A call through a register",
    prediction: "The new instruction's edges",
    investigation: "Choosing a room",
    construction: "A new decoder column",
    failureExperiment: "ORs become ANDs",
    explanation: "Call and jump",
    generalisation: "Adding an instruction",
    challenge: "The machine in text",
    reflection: "Two machines, one program",
  },
  challengeTitles: {
    c1: "Decoder column, text",
    c2: "Complete machine, text",
  },
  captions: {
    callAndJump: "Decoder columns for a call and a jump.",
    predictCallEdges: "Predict the new instruction's edges, then check.",
    choose: "Run the program that chooses a room.",
    writeDecoder: "Add kind 9 and run the tests.",
    callFaults: "Choose a fault and run the program.",
    newColumn: "The new column beside the call and jump.",
    newEdges: "Edges of a call, jump, and the new instruction.",
    writeMachine: "Change the machine's text and run it.",
  },
  options: {
    p1Three: "3 edges, as a call.",
    p1Four: "4 edges, with an ALU edge.",
    p1Five: "5 edges, as a load.",
  },
  faults: {
    callAnd: "orCall made an AND",
    jumpAnd: "orJump made an AND",
  },
  checks: {},
} as const;
