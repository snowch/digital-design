// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson traps, drafted by the prose process from a
// brief of facts (docs/notes/module-12-traps/briefs, brief 1L) and checked against the lesson.

export const LABELS = {
  title: "What if the machine went to a program of its own instead of halting?",
  objectives: [
    "Say which registers change at the edge where an instruction traps, and what each takes.",
    "Read the cause and the return point in a handler.",
    "Skip a faulting instruction by adding 4 to C2 before resume.",
    "Write a handler that treats one cause differently from the others.",
  ],
  titles: {
    question: "The night program halting",
    motivation: "A program of the machine's own",
    prediction: "C2 after the trap",
    investigation: "The trap, edge by edge",
    construction: "The registers after a trap, worked out",
    failureExperiment: "A handler that only resumes",
    explanation: "The return point",
    generalisation: "One handler for every cause",
    challenge: "Skipping refused stores",
    reflection: "What the handler must leave alone",
  },
  challengeTitles: {
    c1: "The registers after a trap",
    c2: "Skipping refused stores",
  },
  captions: {
    halts: "The night program with no handler, run in the debugger until the machine halts.",
    predict:
      "The night program with a handler, as a listing, with a question about C2 before the run.",
    timeline:
      "The timeline of the night program's run with its handler, one edge at a time, drawn as lanes too.",
    quizListing: "A program with a word load that faults, which this lesson does not run.",
    answers: "Four questions about the registers after the trap in that program.",
    noSkip: "The night program with a handler that only resumes, run in the debugger.",
    debugger: "The night program with its handler in the debugger, with the control registers.",
    skip34: "A handler that skips refused stores, with its four tests.",
  },
  fields: {
    c2: "C2 after the trap",
    c3: "C3 after the trap",
    c1: "C1 after the trap",
    pc: "PC after the trap",
  },
  skip34Labels: [
    "two refused stores",
    "a store to the ROM",
    "a word that is not an instruction",
    "a word load not at a multiple of 8",
    "a load from an address where there is no memory",
  ],
  countTitle: "The word at 400",
  lanes: {
    program: "The night program",
    handler: "The handler",
  },
} as const;
