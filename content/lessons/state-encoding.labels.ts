// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson on state encoding, drafted by the
// prose process from a brief of facts (docs/notes/module-5-state-machines/briefs/NE.md).

export const LABELS = {
  captions: {
    defrostMachine: "Press the inputs and clock the controller.",
    predictOneHotReset: "Predict the state's code after a reset, then check.",
    predictShortOk: "Predict the state after a short OK, then check.",
    predictTryZero: "Predict what SEND does after a reset, then check.",
    retryEnum: "Compare the state diagram with the text that names the states.",
    tryZeroTable: "The table is the same, but TRY has code 00.",
    writeDefrost: "Write the defrost controller and run the tests.",
    writeZeroIdle: "Change the codes as shown and run the tests.",
    zeroIdleMachine: "Open the next-state logic and clock the controller.",
  },
  challengeTitles: {
    c1: "The controller with IDLE at zero",
    c2: "The defrost controller",
  },
  objectives: [
    "Predict where a reset leads for a given set of codes.",
    "Build a state machine with one flip-flop per state and explain what it costs and saves.",
    "Explain why an input that changes between two edges can be missed.",
    "Write a state machine from its state diagram and give each state a name.",
  ],
  options: {
    p1One: "SEND is 1",
    p1X: "The simulator cannot know SEND (X)",
    p1Zero: "SEND is 0",
    p2Idle: "IDLE (0001)",
    p2None: "0000",
    p2Try: "TRY (0010)",
    p3Idle: "IDLE (00)",
    p3Try: "TRY (01)",
    p3Wait: "WAIT (10)",
  },
  title: "Which codes for each state, and how do you write a state machine?",
  titles: {
    challenge: "The defrost controller",
    construction: "Changing the codes",
    explanation: "Synchronous design",
    failureExperiment: "One flip-flop per state, answers between edges",
    generalisation: "States named in the text",
    investigation: "Three flip-flops for four states, IDLE at zero",
    motivation: "What the codes decide",
    prediction: "When TRY has code 00",
    question: "Different codes, same table",
    reflection: "What the module built",
  },
} as const;
