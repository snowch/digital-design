// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson capstone, drafted by the prose process
// from a brief of facts (docs/notes/module-13-machine/briefs, brief 5L) and checked against the
// lesson.

export const LABELS = {
  title: "Can you write a program of your own and trace its run down to the gates?",
  objectives: [
    "Write a program of your own for the shop that uses set if.",
    "Run it on the whole machine.",
    "Answer questions about one wire at one edge of its run, by tracing it.",
    "Say at which level each question's wire is drawn and where a held word's value comes from.",
  ],
  titles: {
    question: "A program of your own",
    motivation: "Questions only a trace answers",
    prediction: "MET after the ALU edge",
    investigation: "COUT beside MET",
    construction: "Answering from your own run",
    failureExperiment: "MET held at 0",
    explanation: "The five wires sit at different depths",
    generalisation: "Tracing a failed test on a real design",
    challenge: "Your program, traced",
    reflection: "From a box to a gate",
  },
  challengeTitles: {
    c1: "Your program, traced",
  },
  captions: {
    free: "The figure's program on the whole machine, ready to trace.",
    predict:
      "The same program, paused before the ALU edge of its set if, with a question about MET.",
    carry: "The same program, paused before the ALU edge of its set if, for COUT and MET",
    fault: "The same program with MET held at 0, beside the model.",
    cap: "The challenge: your program, its five tests and five questions about its run",
  },
  faults: {
    met: "MET held at 0",
  },
  fields: {
    result: "RESULT, paused before the ALU edge of your first set if, signed decimal",
    carry: "COUT, paused before that edge",
    met: "MET, paused before that edge",
    xorB: "The output of `xorB` in the slice `bit0`, paused before that edge",
    held: "HM, paused before that edge, signed decimal",
  },
  cases: {
    mixed: "Room A -184, room B -250",
    both: "Both rooms -250",
    neither: "Room A -150, room B -100",
    edge: "Room A -200, room B -201",
    warm: "Room A 50, room B -250",
    result: "RESULT, paused before the ALU edge of your first set if, signed decimal",
    carry: "COUT, paused before that edge",
    met: "MET, paused before that edge",
    xorB: "The output of `xorB` in the slice `bit0`, paused before that edge",
    held: "HM, paused before that edge, signed decimal",
  },
} as const;
