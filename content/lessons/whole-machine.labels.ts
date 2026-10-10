// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson whole-machine, drafted by the prose
// process from a brief of facts (docs/notes/module-13-machine/briefs, brief 1L) and checked
// against the lesson.

export const LABELS = {
  listing: "The shop's program, line by line",
  title: "Which parts make the whole machine, and where do they meet?",
  objectives: [
    "Name the three blocks of the whole machine, and the module that built each part.",
    "Say what a join is, and open the blocks to find the part at a bus's end, inside the control unit or the datapath.",
    "Follow the words of a load across the joins, edge by edge.",
    "Explain why a join can break the whole machine although every part works alone.",
  ],
  titles: {
    question: "The whole machine",
    motivation: "Parts and joins",
    prediction: "Where a call through a register goes",
    investigation: "A system call across the joins",
    construction: "One load across the joins",
    failureExperiment: "A broken join",
    explanation: "The CPU and the memory",
    generalisation: "Testing the joins",
    challenge: "Where the parts meet",
    reflection: "Every level at once",
  },
  challengeTitles: {
    c1: "Where the parts meet",
  },
  cpuMark: "part of the CPU",
  captions: {
    makers:
      "The whole machine running the shop's program, with a table of which module built each part.",
    predict:
      "The shop's program is paused before the WRITE edge of a call through a register, with a question about the PC.",
    timeline: "A timing diagram of signals crossing joins, from edge 57 to edge 64.",
    cpu: "The whole machine, with the two blocks that make up the CPU marked.",
    tool: "The whole machine running the shop's program, for the challenge's four buses.",
    load: "The shop's program is paused before a load, with the signals of its edges.",
    answers: "Six questions about the joins and the edges.",
    faults: "The shop's program with one join held at a fixed value, which you choose.",
  },
  faults: {
    mq: "MQ held at 0",
    noHandler: "NOHANDLER held at 1",
    cause: "CAUSE held at `00`",
  },
  fields: {
    hb: "The part inside the datapath that drives the word a store writes",
    irIn: "The part inside the control unit that takes the instruction word it decodes",
    waiting: "The part inside the control unit that reads the events waiting for an interrupt",
    status: "The part inside the datapath that drives C0's two bits",
    irEdge: "The edge at which the IR takes the word of `resume`",
    pcEdge: "The edge at which the PC takes `010`",
  },
} as const;
