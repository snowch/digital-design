// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson several-edges, drafted by the prose process from
// a brief of facts (docs/notes/module-9-control.md and its briefs) and checked against the lesson.

export const LABELS = {
  title: "How can one instruction use memory twice?",
  objectives: [
    "Predict how many clock edges a load instruction needs.",
    "Trace an instruction's edges through the controller's states.",
    "Write the memory's address and the instruction register.",
    "Write the logic that calculates the controller's next state.",
  ],
  titles: {
    question: "One memory, one address",
    motivation: "Instructions take several edges",
    prediction: "A load's edges",
    investigation: "The colder room, edge by edge",
    construction: "One port for two jobs",
    failureExperiment: "Stuck address, lost row",
    explanation: "The controller's states",
    generalisation: "Each kind's edges",
    challenge: "Next state, written",
    reflection: "What stays, what comes next",
  },
  challengeTitles: {
    c1: "Address and register, written",
    c2: "Next state, written",
  },
  captions: {
    onePort: "A constant job and a store, edge by edge, one lane per signal or bus.",
    predictLoadEdges: "Predict the load's edges, then check.",
    colderEdges: "Run the program edge by edge.",
    writeFetchport: "Write the address and the register and run the tests.",
    edgeFaults: "Choose a fault and run the margin.",
    controller: "Set the decoder's signals and clock the controller.",
    kindEdges: "Read each kind's states off the controller.",
    writeStates: "Complete the next-state logic and run the tests.",
  },
  options: {
    p1One: "1 edge, as in Module 8",
    p1Three: "3 edges",
    p1Five: "5 edges",
  },
  faults: {
    fetchingHigh: "FETCHING stuck at 1",
    memoryRowLow: "Row 4 stuck at 0",
  },
  checks: {},
} as const;
