// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson control-signals, drafted by the prose
// process from a brief of facts (docs/notes/module-9-control.md and its briefs) and checked
// against the lesson.

export const LABELS = {
  title: "How does the decoder work out the control signals?",
  objectives: [
    "Predict a control signal for a given instruction kind.",
    "Trace an instruction kind to the control signals it sets.",
    "Write two control signals as OR gates over instruction kinds.",
    "Write all twelve signals as a SystemVerilog `case` statement.",
  ],
  titles: {
    question: "The decoder, closed until now",
    motivation: "A control unit of gates",
    prediction: "A jump's B input",
    investigation: "The decoder opened",
    construction: "Two signals written as text",
    failureExperiment: "A wrong gate and a lost line",
    explanation: "The decoder's rows as a table",
    generalisation: "One line per kind",
    challenge: "Every signal written as text",
    reflection: "Gates, and words that are no instruction",
  },
  challengeTitles: {
    c1: "WRITEY and BCONST, written",
    c2: "Control signals, written",
  },
  captions: {
    signalsTable: "Read each instruction kind's control signals from the decoder.",
    predictJump: "Predict BCONST for a jump instruction, then check.",
    decoderOpen: "Open the decoder's blocks and change K and J.",
    writeWrites: "Write the two signals and run the tests.",
    decoderFaults: "Choose a fault and run the checks.",
    writeSignals: "Complete the `case` and run the tests.",
  },
  options: {
    p1Zero: "BCONST is 0, B takes RB.",
    p1One: "BCONST is 1, B takes the constant.",
  },
  faults: {
    op0And: "orOp0 made an AND",
    loadLow: "LOAD stuck at 0",
  },
  checks: {
    subtract: "Subtract, kind 1 job 3",
    addConstant: "Add constant, kind 2 job 2",
    load: "Load, kind 3 job 0",
    store: "Store, kind 4 job 8",
    branch: "Branch, kind 5 job 6",
    call: "Call, kind 6 job 0",
    jump: "Jump, kind 7 job 0",
  },
} as const;
