// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson encoding, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "Why does every field keep one place in every instruction, and what does that cost?",
  objectives: [
    "Explain what the course's layout gives and what it costs.",
    "Compare the course's layout with a packed layout.",
    "Write instructions as eight hexadecimal digits.",
    "Write the selector a packed layout needs.",
  ],
  titles: {
    question: "A layout is a choice",
    motivation: "One layout for every instruction",
    prediction: "A packed layout",
    investigation: "Two layouts and an explorer",
    construction: "Writing an instruction's word",
    failureExperiment: "Packed words read the course's way",
    explanation: "What a layout costs",
    generalisation: "Choosing an encoding",
    challenge: "A field that moves",
    reflection: "What 12 bits say",
  },
  challengeTitles: {
    c1: "Instruction words, written",
    c2: "Y digit, packed",
  },
  captions: {
    oneLayout: "Choose an instruction and read its fields.",
    predictMoved: "Predict which field moves, then check.",
    layouts: "Choose an instruction and compare the two layouts.",
    explorer: "Take a word apart and run the ALU.",
    writeWords: "Write each word and run the tests.",
    packedRead: "Choose a packed word and read what the machine makes of it.",
    writeYdigit: "Write the module and run the tests.",
  },
  options: {
    p1Y: "Y",
    p1A: "A",
    p1None: "None",
  },
  words: {
    subtract: "13123000: R3 ← R1 - R2",
    addConstant: "22102064: R2 ← R1 + 100",
    load: "380027D8: R2 ← memory[7D8]",
    branch: "56230002: the colder-room branch",
    call: "6000F005: a call, R15 ← PC + 4",
    jump: "70F00000: a jump, PC ← R15",
    stop: "84000000: stop",
    zeros: "00000000: a word of zeros",
    packedAdd: "22120064: R2 ← R1 + 100, packed",
    packedLoad: "380207D8: R2 ← memory[7D8], packed",
    packedCall: "60F00001: a call, packed",
  },
  encode: {
    sub: "R5 ← R2 - 7 (subtract)",
    load: "R4 ← memory[R1 + 16] (a word)",
    branch: "if R3 != R6, PC ← PC + 4 × (-3)",
  },
  unusedNotes: {
    registerC: "Unused: a register job reads no constant",
    constantB: "Unused: the ALU's B takes the constant instead",
    loadA: "Unused: the address is the constant alone, and the ALU's A takes 0",
    loadB: "Unused: a load reads no register as B",
    branchY: "Unused: a branch writes no register",
  },
  fieldNotes: {
    K: "The kind, selecting the instruction",
    J: "The job, what the instruction does",
    A: "The register read as A",
    B: "The register read as B",
    Y: "The register written",
    C: "A 12-bit signed constant",
  },
} as const;
