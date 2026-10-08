// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson final-machine, drafted by the prose
// process from a brief of facts (docs/notes/module-13-machine/briefs, brief 4L) and checked
// against the lesson.

export const LABELS = {
  title: "Can you join the parts into the whole machine?",
  objectives: [
    "Write the top module that joins the course's parts into the whole machine.",
    "Run programs on it against the model after every instruction and trap.",
    "Read a failed comparison to find the join it points at.",
    "Say why a test finds a wrong join only where its program reaches it.",
  ],
  titles: {
    question: "The whole machine as text",
    motivation: "The parts and the joins",
    prediction: "A timer that counts a trap",
    investigation: "Which program finds which line",
    construction: "Three ways in",
    failureExperiment: "A door that never opens",
    explanation: "Reading a failure",
    generalisation: "How a CPU is checked",
    challenge: "The whole machine",
    reflection: "A program of your own",
  },
  challengeTitles: {
    c1: "The whole machine",
  },
  captions: {
    course: "The course's text of the whole machine, run on five programs against the model.",
    predict: "A text whose timer counts a trap's edge, run on two programs.",
    lines: "Three texts, each with one line changed, run on five programs.",
    door: "A text whose memory never sees the door, run on five programs.",
    lab: "Your text of the whole machine, run on five programs against the model.",
  },
  texts: {
    course: "The course's text",
    tick: "The timer counts a trap's edge",
    branch: "Every branch taken",
    ie: "Interrupts on in system mode",
    call: "A call keeps the PC",
    door: "DOOR held at 0",
  },
  programs: {
    shop: "The shop's program",
    user: "A fault in user mode",
    timer: "A system call, then the timer",
    door: "The door",
    rom: "A store to the ROM",
  },
  options: {
    shop: "Only the shop's program",
    timer: "Only the timer program",
    both: "Both",
    none: "Neither",
  },
} as const;
