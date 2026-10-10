// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson capstone, drafted by the prose process
// from a brief of facts (docs/notes/module-13-machine/briefs, brief 5L) and checked against the
// lesson.

export const LABELS = {
  title: "Can you write a program of your own and trace its run down to the gates?",
  objectives: [
    "Write a program of your own for the shop that uses set if.",
    "Run it on the whole machine.",
    "Answer questions about a word or a row of wires, all at one edge of the run.",
    "Say at which level each question's wire is drawn.",
  ],
  titles: {
    question: "A program of your own",
    motivation: "Questions about your own run",
    prediction: "COUT after the ALU edge",
    investigation: "MET beside COUT",
    construction: "Answering from your own run",
    failureExperiment: "MET held at 0",
    explanation: "Where each answer is drawn",
    generalisation: "Tracing a failed test on a real design",
    challenge: "Your program, traced",
    reflection: "From a box to a gate",
  },
  challengeTitles: {
    c1: "Your program, traced",
  },
  captions: {
    free: "The figure's program on the whole machine, paused before the ALU edge of its set if, ready to trace.",
    predict:
      "The same program, paused before the ALU edge of its set if, with a question about COUT.",
    carry: "The same program, paused before the ALU edge of its set if, for COUT and MET.",
    fault: "The same program with MET held at 0, beside the model.",
    cap: "The challenge: your program, its tests and questions about its run.",
  },
  faults: {
    met: "MET held at 0",
  },
  fields: {
    result: "RESULT, paused before the ALU edge of your first set if, signed decimal",
    flags: "The row ZERO, MINUS, COUT, OVER, MET, paused before the ALU edge of your first set if",
    carry:
      "The carry out of the slices for bits 7 to 4, paused before the ALU edge of your first set if",
    held: "HM, paused before the ALU edge of your first set if, signed decimal",
  },
  cases: {
    mixed: "Room A -184, room B -250",
    both: "Both rooms -250",
    neither: "Room A -150, room B -100",
    edge: "Room A -200, room B -201",
    warm: "Room A 50, room B -250",
    warmB: "Room A -250, room B 50",
    edgeB: "Room A -201, room B -200",
    result: "RESULT, paused before the ALU edge of your first set if, signed decimal",
    flags: "The row ZERO, MINUS, COUT, OVER, MET, paused before the ALU edge of your first set if",
    carry:
      "The carry out of the slices for bits 7 to 4, paused before the ALU edge of your first set if",
    held: "HM, paused before the ALU edge of your first set if, signed decimal",
  },
} as const;
