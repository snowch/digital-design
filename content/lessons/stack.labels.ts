// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson stack, drafted by the prose process from a
// brief of facts (docs/notes/module-11-programming/briefs, brief 4L) and checked against the lesson.

export const LABELS = {
  title: "What must a function that calls another keep, and where?",
  objectives: [
    "Say why a function that calls another loses its return address.",
    "Push and pop words on a stack in the RAM with R14.",
    "Say what each word a function pushes holds, and where.",
    "Write a function that keeps R15 and kept registers through its calls.",
  ],
  titles: {
    question: "A return address lost",
    motivation: "A stack in the RAM",
    prediction: "The word at 7B8",
    investigation: "Pushes and pops",
    construction: "The stack's addresses, worked out",
    failureExperiment: "Pops in the wrong order",
    explanation: "The calling convention's last rows",
    generalisation: "Last in, first out",
    challenge: "The function roomsOver",
    reflection: "A function that calls itself",
  },
  challengeTitles: {
    c1: "The stack's addresses",
    c2: "The function roomsOver",
  },
  captions: {
    lost: "sumOver with no stack, in the debugger.",
    predict: "The program's listing, with a question about the word at 7B8.",
    pushed: "sumOver with a stack, in the debugger.",
    depth: "The words on the stack over the lesson's whole run.",
    addresses: "Four questions about the stack in a run of check.",
    checkListing: "The program with check, which the lesson does not run.",
    popsSwapped: "sumOver with its pops in the order of its pushes, in the debugger.",
    rooms: "The function roomsOver and its tests.",
  },
  fields: {
    returnAt: "Where check's return address is kept",
    r10At: "Where R10's word is kept",
    inOverBy: "R14 while overBy runs",
    leftAt7B8: "The word at 7B8 after check returns",
  },
  callPrefix: "Call",
  roomPrefixA: "Room A",
  roomPrefixB: "room B",
} as const;
