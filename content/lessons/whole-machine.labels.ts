// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson whole-machine, drafted by the prose
// process from a brief of facts (docs/notes/module-13-machine/briefs, brief 1L) and checked
// against the lesson.

export const LABELS = {
  listing: "The shop's program, line by line",
  title: "Which parts make the whole machine, and where do they meet?",
  objectives: [
    "Name the three blocks of the whole machine, and the module that built each part.",
    "Say what a join is, and find the block that drives a bus.",
    "Follow the words of a load across the joins, edge by edge.",
    "Explain why a join can break the whole machine although every part works alone.",
  ],
  titles: {
    question: "The whole machine",
    motivation: "Parts and joins",
    prediction: "Where a call through a register goes",
    investigation: "A system call across the joins",
    construction: "One load, five joins",
    failureExperiment: "A broken join",
    explanation: "The CPU and the memory",
    generalisation: "Testing the joins",
    challenge: "Where the parts meet",
    reflection: "Every level at once",
  },
  challengeTitles: {
    c1: "Where the parts meet",
  },
  captions: {
    makers:
      "The whole machine running the shop's program, with a table of which module built each part.",
    predict:
      "The shop's program stopped before the WRITE edge of a call through a register, with a question about the PC.",
    timeline: "A timing diagram of signals crossing joins, from edge 57 to edge 64.",
    load: "The shop's program stopped before a load, with the signals of its edges.",
    answers: "Six questions about the joins and the edges.",
    faults: "The shop's program with one join held at a fixed value, which you choose.",
  },
  faults: {
    mq: "MQ held at 0",
    noHandler: "NOHANDLER held at 1",
    cause: "CAUSE held at `00`",
  },
  fields: {
    mq: "[draft] mq",
    addr: "[draft] addr",
    waiting: "[draft] waiting",
    status: "[draft] status",
    irEdge: "The edge at which the IR takes the word of `resume`",
    pcEdge: "The edge at which the PC takes `010`",
  },
} as const;
