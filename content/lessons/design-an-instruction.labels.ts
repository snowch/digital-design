// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson design-an-instruction, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "How do you design, justify and build a new instruction?",
  objectives: [
    "Design an instruction against the questions a design must answer.",
    "Justify it by a program it shortens.",
    "Predict the edges a new instruction takes.",
    "Add it to a decoder's text and a datapath's text.",
  ],
  titles: {
    question: "One instruction to add",
    motivation: "A program that needs it",
    prediction: "The course's design and its edges",
    investigation: "What set if shortens, and the parts it needs",
    construction: "The decoder",
    failureExperiment: "SET stuck",
    explanation: "How set if runs",
    generalisation: "A field read the same way twice",
    challenge: "The whole machine",
    reflection: "Programs to write",
  },
  challengeTitles: {
    c1: "Design, from choices",
    c2: "Decoder, kind A",
    c3: "Machine, set if",
  },
  conditionMark: "the condition block, which both uses share",
  captions: {
    conditionUses: "The condition block and its two uses.",
    need: "Run the count of cold rooms on the course's machine.",
    shorter: "Run the count of cold rooms two ways.",
    predictEdges: "Predict set if's edges, then check.",
    yWord: "Press the inputs and watch the word register Y takes.",
    newColumn: "Kind A's column beside a register job's and a branch's.",
    design: "Make each choice and run the tests.",
    writeDecoder: "Add kind A and run the tests.",
    setFaults: "Choose a fault and run the checks.",
    writeMachine: "Change the machine's text and run it.",
  },
  options: {
    p1Three: "3 edges, as a branch",
    p1Four: "4 edges, as a register job",
    p1Five: "5 edges, as a load",
  },
  programs: {
    branches: "Branches, on the course's machine",
    setIf: "Set if, on your copy",
  },
  faults: {
    setLow: "SET stuck at 0",
    setHigh: "SET stuck at 1",
  },
  run: {
    setOne: "set if, MET 1",
    setZero: "set if, MET 0",
    job: "a register job",
    load: "a load",
  },
  design: {
    kind: "The kind",
    result: "The field that names the register written",
    condition: "Where the condition comes from",
    program: "The program it shortens",
    cost: "What it costs the circuit",
  },
  choices: {
    kind: {
      0: "0",
      5: "5",
      9: "9",
      A: "A",
    },
    result: {
      y: "Y, digit 3",
      b: "B, digit 4",
      new: "A new digit of its own",
    },
    condition: {
      job: "The job digit, as a branch's",
      constant: "The constant",
      new: "A new field",
    },
    program: {
      count: "The count of the cold rooms",
      colder: "The display of the colder room",
      times: "7 × 5",
    },
    cost: {
      column: "A decoder column and its checks only",
      source: "A new source for register Y and a control signal",
      part: "A new part beside the ALU",
    },
  },
} as const;
