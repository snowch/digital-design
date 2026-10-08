// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson recursion, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 5L) and checked against
// the lesson.

export const LABELS = {
  title: "Can a function call itself?",
  objectives: [
    "Write a function that calls itself, with a last case that calls nothing.",
    "Follow the calls of such a function and the words each pushes on the stack.",
    "Work out how deep the stack goes from the longest way in.",
    "Say when recursion is the right tool and when a loop is.",
  ],
  titles: {
    question: "The cold store's rooms",
    motivation: "A function that calls itself",
    prediction: "How many calls",
    investigation: "Calls in progress",
    construction: "A second store",
    failureExperiment: "A door that leads back",
    explanation: "Why recursion works",
    generalisation: "When recursion fits",
    challenge: "The function farthest",
    reflection: "A wrong answer",
  },
  challengeTitles: {
    c1: "The second store's stack",
    c2: "The function farthest",
  },
  captions: {
    depth: "The words on the stack over the whole run from the hall.",
    predict: "The program's listing, with a question about its calls.",
    frames: "The calls of warmRooms and the stack, in the debugger.",
    rooms: "The cold store's rooms as words in memory.",
    longStore: "The second store's rooms as words in memory.",
    storeDepth: "Three questions about a run on the second store.",
    wayBack: "warmRooms on rooms where the icebox leads back to the vault.",
    farthest: "The function farthest and its tests.",
  },
  fields: {
    words: "The most words on the stack",
    lowest: "R14 at the deepest",
    calls: "Calls of warmRooms",
  },
  roomsTitle: "The cold store's rooms",
  longStoreTitle: "The second store's rooms",
  layouts: {
    store: "The lesson's store",
    long: "The second store",
    hall: "A hall alone",
    second: "A hall with rooms behind second doors",
    both: "A hall with a room behind each door",
  },
  callPrefix: "Call farthest with",
  roomsDrawn: "[draft] roomsDrawn",
} as const;
