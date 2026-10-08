// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson trap-hardware, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 7L) and checked
// against the lesson.

export const LABELS = {
  title: "Where in the machine does a trap happen?",
  objectives: [
    "Name the parts that make a trap's edge, and what each does.",
    "Count the edges a trap, a call system, a resume and an interrupt take.",
    "Say which cause the trap logic chooses when there are several.",
    "Write the trap logic.",
  ],
  titles: {
    question: "A trap, edge by edge",
    motivation: "Four parts and a rule",
    prediction: "The PC after the trapping edge",
    investigation: "The night program on this machine",
    construction: "Counting edges, worked out",
    failureExperiment: "A broken trap",
    explanation: "Which cause wins",
    generalisation: "A trap costs no state",
    challenge: "The trap logic",
    reflection: "A handler for the shop",
  },
  challengeTitles: {
    c1: "Counting edges",
    c2: "The trap logic",
  },
  captions: {
    edges: "A timing diagram of a program that traps within 12 edges.",
    predict:
      "The machine's drawing, stopped before the store's last edge, with a question about the PC.",
    night: "The night program on the machine of several edges, with its control registers.",
    answers: "Four questions about the edges a trap takes.",
    faults: "The night program with a fault you choose.",
    traplogic: "The trap logic to write, and its tests.",
  },
  faults: {
    trapLow: "TRAP stuck at 0",
    cwenLow: "The control registers' write enable stuck at 0",
  },
  fields: {
    call: "Edges of a call system",
    resume: "Edges of a resume",
    interrupt: "Edges of an interrupt",
    store: "Edges of a refused store",
  },
} as const;
