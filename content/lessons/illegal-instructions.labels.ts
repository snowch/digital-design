// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson illegal-instructions, drafted by the
// prose process from a brief of facts (docs/notes/module-9-control.md and its briefs) and checked
// against the lesson.

export const LABELS = {
  title: "What does the machine do with an unknown instruction?",
  objectives: [
    "Name the three reasons a word is illegal.",
    "Predict the cause the decoder gives for a system job.",
    "Write the check on a control register's number.",
    "Write the whole check as text.",
  ],
  titles: {
    question: "Words that are no instruction",
    motivation: "Why words are refused",
    prediction: "The stop code",
    investigation: "Opening the checks",
    construction: "The number written as text",
    failureExperiment: "Faults: checks stuck at 0",
    explanation: "Every kind and job",
    generalisation: "One check per kind",
    challenge: "Write the check as text",
    reflection: "One memory, used twice",
  },
  challengeTitles: {
    c1: "Number check, written",
    c2: "Full check, written",
  },
  captions: {
    kindMap: "Kinds and jobs in the decoder.",
    predictNumber: "Predict the stop cause code.",
    checksOpen: "Open the checks and try other words.",
    writeOutside: "Write OUTSIDE and run the tests.",
    checkFaults: "Choose a fault and test.",
    writeChecks: "Write ILLEGAL and run the tests.",
  },
  options: {
    p1Stop: "CAUSED `00`: stop halts the machine.",
    p1Illegal: "CAUSED `21`: the word is illegal.",
  },
  faults: {
    noKindLow: "NOKIND stuck at 0",
    numberLow: "BADNUMBER stuck at 0",
  },
  checks: {
    zeros: "All-zero word",
    kindNine: "Kind 9 job 0",
    jobEight: "Kind 1 job 8",
    numberFive: "Kind 8 job 2 constant 5",
    numberMinusOne: "Kind 8 job 3 constant -1",
    numberFour: "Kind 8 job 2 constant 4",
    add: "Kind 1 job 2 add",
  },
} as const;
