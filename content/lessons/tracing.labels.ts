// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson tracing, drafted by the prose process
// from a brief of facts (docs/notes/module-13-machine/briefs, brief 3L) and checked against the
// lesson.

export const LABELS = {
  title: "Can you follow one value from a line of a program down to one gate?",
  objectives: [
    "Pause the whole machine before any edge of any line.",
    "Trace a value through every level down to a gate or a flip-flop.",
    "Read a part that never opens as one bit of the module that built it.",
    "Say what each level hides, and why the level above may ignore it. The name for this is abstraction.",
  ],
  titles: {
    question: "A path of your own",
    motivation: "Three tools for a trace",
    prediction: "One bit of HR",
    investigation: "From the datapath to one gate",
    construction: "Through the PC",
    failureExperiment: "A wire held at 0",
    explanation: "What each level hides",
    generalisation: "Levels and boxes",
    challenge: "Five traces",
    reflection: "Joining the parts yourself",
  },
  challengeTitles: {
    c1: "Five traces",
  },
  captions: {
    free: "The whole machine paused before the ALU edge of a set if, ready to trace.",
    predict:
      "The machine paused before the ALU edge of a set if, with a question about one bit of HR.",
    sum: "The machine paused before the ALU edge of a set if, for a trace of one bit of the ALU's result.",
    pc: "The whole machine paused before the WRITE edge of a call through a register.",
    fault: "The shop's program with one wire in the ALU held at 0.",
    answers: "Five wires to trace at named edges.",
    tool: "The whole machine, for the challenge's traces.",
  },
  faults: {
    alu: "A wire in the ALU held at 0",
  },
  fields: {
    xorB: "xorB in the slice for bit 2",
    sum1: "SUM in the slice for bit 1",
    pcD: "D of the PC's bit 3",
    r5En: "EN of R5's bit 0",
    r4En: "EN of R4's bit 0",
  },
} as const;
