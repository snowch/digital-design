// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson full-path, drafted by the prose process
// from a brief of facts (docs/notes/module-13-machine/briefs, brief 2L) and checked against the
// lesson.

export const LABELS = {
  title: "Can you watch one line of a program at every level, edge by edge?",
  objectives: [
    "Work out an instruction's machine code from its line.",
    "Say at which edge each stage of an instruction happens: fetch, register read, ALU, memory, register write and PC update.",
    "Read one instruction at every level of the run, at one edge.",
    "Explain why the levels agree, and what the comparison with the instruction-level model shows when the machine goes wrong.",
  ],
  titles: {
    question: "The final demonstration",
    motivation: "From a line to the gates",
    prediction: "The word a set if becomes",
    investigation: "A system call at every level",
    construction: "One store, worked out",
    failureExperiment: "A broken signal",
    explanation: "One circuit, many levels",
    generalisation: "Every program as machine code",
    challenge: "One line, every level",
    reflection: "A value of your own",
  },
  challengeTitles: {
    c1: "One line, every level",
  },
  captions: {
    whole: "The whole machine runs the shop's program, with the instruction shown at every level.",
    predict:
      "The shop's program is paused before the FETCH edge of a set if, and asks what the IR takes.",
    call: "The shop's program is stopped before its system call, with the control registers shown.",
    store: "The shop's program is paused before the handler's store to the display.",
    faults: "The shop's program runs with one control signal broken, and you choose which.",
    answers: "Five questions ask about one line at every level.",
  },
  faults: {
    bconst: "BCONST held at 1",
    set: "SET held at 0",
  },
  fields: {
    code: "The word of `R9 <= R2 >= R7 unsigned`",
    edges: "The edges that `R4 <= word[R2]` takes",
    job: "The ALU's job at its ALU edge",
    yin: "The word register Y takes at its WRITE edge",
    pc: "The PC after its last edge",
  },
  jobs: {
    add: "add",
    subtract: "subtract",
    copy: "copy B",
    or: "OR",
  },
} as const;
