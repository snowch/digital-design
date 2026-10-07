// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson room-to-grow, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "What room is left in the instruction set?",
  objectives: [
    "Say which instruction words are illegal and why they are rejected.",
    "Predict what happens when a program runs without a stop instruction.",
    "Weigh what a left-out instruction costs and saves.",
    "Count how many instructions a loop runs.",
  ],
  titles: {
    question: "Words with no instruction",
    motivation: "Illegal words",
    prediction: "Program with no stop",
    investigation: "Multiplying without multiply",
    construction: "The free kinds",
    failureExperiment: "New kind on old machine",
    explanation: "Cost of each left-out instruction",
    generalisation: "Room for later",
    challenge: "Counting a loop",
    reflection: "Choosing an instruction",
  },
  challengeTitles: {
    c1: "Words checked, decoded",
    c2: "Loop counted",
  },
  captions: {
    map: "Every kind and job the decoder recognises.",
    predictNoStop: "Predict how the run ends without a stop, then check.",
    multiply: "Run both programs that calculate 7 × 5.",
    sortWords: "For each word, choose what the machine does.",
    newWords: "Run the same program on the copy and on the course's machine.",
    countLoop: "Count the loop's instructions, then run the tests.",
  },
  does: {
    runs: "Runs it",
    stop: "Stops at it: stop",
    illegal: "Stops with cause 21",
  },
  options: {
    p1Illegal: "It stops at 008, cause 21",
    p1RomEnd: "It runs to the ROM's end and stops, cause 11",
    p1Never: "It never stops",
  },
  programs: {
    noStop: "Two instructions, no stop",
    loop: "7 × 5 in a loop",
    doubling: "7 × 5 by doubling",
    copy: "The copy with kind 9",
    course: "The course's machine",
  },
  words: {
    zeros: "00000000",
    kind9: "9040F000 (call through R4)",
    job8: "18123000",
    never: "51000000",
    stop: "84000000",
    add: "22102064",
  },
  counts: {
    times9: "Instructions run for 7 × 9",
    times50: "Instructions run for 7 × 50",
  },
} as const;
