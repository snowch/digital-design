// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson functions, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 3L) and checked against
// the lesson.

export const LABELS = {
  title: "How can a program use one piece of program from two places?",
  objectives: [
    "Call a function and return from it with R15.",
    "Pass arguments in R1 to R4 and take the result from R1.",
    "Say what the calling convention lets a function do with each register.",
    "Write a function a test can call on its own.",
  ],
  titles: {
    question: "One check, two rooms",
    motivation: "A call and its return",
    prediction: "Where R15 points",
    investigation: "A function called twice",
    construction: "An agreement on registers",
    failureExperiment: "A function that spoils its caller",
    explanation: "What the machine knows",
    generalisation: "Written once, tested alone",
    challenge: "Writing above",
    reflection: "A function that calls another",
  },
  challengeTitles: {
    c1: "Each register's role",
    c2: "The function above",
  },
  captions: {
    twoWays: "The same work: written twice, then written once and called twice.",
    predict: "Predict what R15 holds after the second call, then run the program.",
    callReturn: "The function above, called twice, shown in the debugger.",
    roles: "Choose each register's role and run the tests.",
    spoiled: "Two programs: one whose function changes R10.",
    above: "Write the function and run the tests.",
  },
  programs: {
    twice: "Written out twice",
    once: "Written once, called twice",
    keeps: "Its function keeps R10",
    spoils: "Its function changes R10",
  },
  options: {
    r00C: "00C: after the first call",
    r018: "018: the second call",
    r01C: "01C: after the second call",
  },
  registers: {
    r1: "R1",
    r3: "R3",
    r7: "R7",
    r12: "R12",
  },
  roles: {
    result: "Carries the result back",
    free: "The function may change it",
    kept: "The function must put it back",
  },
  callPrefix: "Call",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
} as const;
