// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson compiler, drafted by the prose process
// from a brief of facts (docs/notes/beyond-the-machine/briefs, brief K4) and checked against the
// lesson.

export const LABELS = {
  title: "Can a program write the instructions for a line you write?",
  objectives: [
    "Apply the compiler's 5 rules to a line by hand.",
    "Say why a comparison is turned over and read signed.",
    "Follow a compiled line down to the condition block.",
    "Say what a better compiler would keep from one line to the next.",
  ],
  titles: {
    question: "The rule the assembler refuses",
    motivation: "Why a program should write the instructions",
    prediction: "Predict the branch the compiler writes",
    investigation: "Watch the compiler work",
    construction: "Follow the branch's word to the gates",
    failureExperiment: "Every piece in R1",
    explanation: "The five rules and their refusals",
    generalisation: "Beside Module 0's, and what to keep",
    challenge: "Being the compiler",
    reflection: "A line as the shop says it, and where next",
  },
  challengeTitles: {
    c1: "Being the compiler",
  },
  captions: {
    asked: "The debugger holds the shop's line and refuses it.",
    predict: "The compiler stops before it writes the CLASH line's branch.",
    steps: "The compiler at work on a choice of two lines.",
    branch: "The compiled CLASH line on the whole machine, paused before the branch's FETCH edge.",
    fault: "The compiler with every piece in R1.",
    compare: "The compiler's program for both rules beside Module 0's.",
    challenge: "The challenge asks you to write the instructions for one line.",
  },
  lines: {
    gap: "The gap rule: `display <= sensorA - sensorB`",
    clash: "The CLASH rule: `if sensorA - sensorB >= 100 then lamps <= 4`",
  },
  readings: {
    shop: "The shop's readings: room A -184, room B -250",
    warmA: "Room A -100, room B -250",
    bothSigns: "Room A -30, room B 80",
  },
  programs: {
    compiled: "The compiler's program",
    module0: "Module 0's program",
  },
  runs: [
    "Room A -184, room B -50",
    "Room A -250, room B -150",
    "Room A -250, room B -149",
    "Room A -184, room B -250",
    "Room A -30, room B 80",
    "Room A 20, room B 25",
  ],
} as const;
