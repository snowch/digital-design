// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson system-calls, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 4L)
// and checked against the lesson.

export const LABELS = {
  title: "How does a user program show a reading if it may not touch the display?",
  objectives: [
    "Make a system call with the job in R1 and its word in R2.",
    "Say where a system call returns, and how that differs from a fault.",
    "Tell a system call from a fault in a handler, by C3.",
    "Add a job to a handler.",
  ],
  titles: {
    question: "A store the display refuses",
    motivation: "Asking the handler",
    prediction: "C2 after call system",
    investigation: "Three calls, edge by edge",
    construction: "A call's registers, worked out",
    failureExperiment: "A handler that skips a line",
    explanation: "Two return points",
    generalisation: "Like a function call, across modes",
    challenge: "Reading a room's sensor",
    reflection: "A door that does not ask",
  },
  challengeTitles: {
    c1: "A call's registers",
    c2: "Reading a room's sensor",
  },
  captions: {
    direct: "A user program that stores to the display, in the debugger.",
    predict:
      "A handler with two jobs and a program that uses them, listed, with a question about C2.",
    timeline: "The program's three calls, edge by edge, with the mode after each.",
    answers: "Three questions about a system call's registers and results.",
    skipping: "The same program with a handler that adds 4 to C2, in the debugger.",
    services: "The same program in the debugger, with a breakpoint on the handler.",
    sensor: "A handler that reads a room's sensor for a user program, and its tests.",
  },
  fields: {
    lamps: "R2 to light NIGHT and CLASH with job 3",
    shown: "What the program shows",
    c2: "C2 after a call system at 0A0",
  },
  sensorLabels: [
    "Room A, then room B",
    "Room B, kept in R5 across a call",
    "The difference between the rooms",
  ],
} as const;
