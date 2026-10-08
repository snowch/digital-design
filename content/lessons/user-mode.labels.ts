// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson user-mode, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 3L)
// and checked against the lesson.

export const LABELS = {
  title: "How can the machine keep a program away from the shop's devices?",
  objectives: [
    "Say what user mode refuses, and the cause of each refusal.",
    "Start a program in user mode with `resume`.",
    "Say what the machine protects and what it does not.",
    "Tell from C1 which mode a program was in when it trapped.",
  ],
  titles: {
    question: "ALARM switched off",
    motivation: "Two modes",
    prediction: "C1 after the trap",
    investigation: "A program in user mode",
    construction: "What user mode refuses, worked out",
    failureExperiment: "The RAM is not protected",
    explanation: "The memory map in user mode",
    generalisation: "What the machine protects",
    challenge: "Starting a program in user mode",
    reflection: "Showing a reading",
  },
  challengeTitles: {
    c1: "What user mode refuses",
    c2: "Starting a program in user mode",
  },
  captions: {
    system: "The debugger shows a program that clears the lamps by mistake.",
    predict:
      "The listing gives the same program, started in user mode, and asks a question about C1.",
    timeline:
      "The timeline lists the program started in user mode edge by edge, with the mode after each edge.",
    answers: "Four lines of a program, each to be judged in user mode.",
    ram: "The debugger shows a program in user mode that writes the handler's count.",
    map: "The memory map shows each part, with what user mode does with each access.",
    user: "The figure shows a handler that starts a program in user mode, and its tests.",
  },
  fields: {
    load: "R2 <= word[sensorA]",
    ram: "word[0x400] <= R2",
    stop: "stop",
    timer: "R3 <= word[timer]",
  },
  ramTitle: "The handler's count at 410",
  userLabels: ["A store to the lamps", "stop", "A load from a sensor", "A control register read"],
} as const;
