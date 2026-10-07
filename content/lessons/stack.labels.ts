// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson stack, drafted by the prose process from a
// brief of facts (docs/notes/module-11-programming/briefs, brief 4L) and checked against the lesson.

export const LABELS = {
  title: "What must a function that calls another keep, and where?",
  objectives: [
    "Say why a function that calls another loses its return address.",
    "Push and pop words on a stack in the RAM with R14.",
    "Say what a function's frame holds.",
    "Write a function that keeps R15 and kept registers through its calls.",
  ],
  titles: {
    question: "A return address lost",
    motivation: "A stack in the RAM",
    prediction: "Where R14 points",
    investigation: "Pushes and pops",
    construction: "A function that keeps two words",
    failureExperiment: "A stack never started",
    explanation: "Frames and the convention's last rows",
    generalisation: "Last in, first out",
    challenge: "The stack's addresses",
    reflection: "A function that calls itself",
  },
  challengeTitles: {
    c1: "The function both",
    c2: "The stack's addresses",
  },
  captions: {
    lost: "See total with no stack in the debugger.",
    predict: "Predict R14 when above starts, then run the program.",
    pushed: "See total with a stack in the debugger.",
    both: "Write the function and run the tests.",
    noStart: "See the program with R14 never set.",
    depth: "See the words on the stack over the whole run.",
    addresses: "Work out the addresses and run the tests.",
  },
  options: {
    at7C0: "7C0: where the program started R14",
    at7B8: "7B8: one push down",
    at7B0: "7B0: two pushes down",
  },
  fields: {
    returnAt: "The word holding total's return address",
    keptAt: "The word holding what R10 held",
    inAbove: "R14 while above runs",
    after: "R14 after total returns",
  },
  callPrefix: "Call",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
} as const;
