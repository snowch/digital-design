// Titles, objectives, captions and labels of the lesson alu-tests, drafted by the prose process from
// a brief of facts (see CLAUDE.md and docs/notes/module-7-alu.md) and checked against the lesson.

export const LABELS = {
  title: "How do you know the ALU is right?",
  objectives: [
    "Say what normal, boundary, random and adversarial tests are for.",
    "Choose words that expose a given fault.",
    "Repeat a random run from its seed.",
    "Write the whole ALU, with its flags, at any width.",
  ],
  titles: {
    question: "Too many pairs to try",
    motivation: "Four kinds of test",
    prediction: "A fault the normal tests miss",
    investigation: "The suite on a healthy ALU",
    construction: "Words that expose a fault",
    failureExperiment: "Faults put in on purpose",
    explanation: "Where faults hide",
    generalisation: "The suite at 64 bits",
    challenge: "The whole ALU, written",
    reflection: "The ALU, built and tested",
  },
  challengeTitles: {
    c1: "Hidden fault, answered",
    c2: "Complete ALU, written",
  },
  captions: {
    predictCatch: "Predict which kind of test catches the fault first.",
    suiteHealthy: "Run the suite, then draw new random tests.",
    findPair: "Give two words that expose all three faults.",
    suiteFaults: "Choose a fault and run the suite.",
    suite64: "Run the suite on the 64-bit ALU.",
    writeAlu: "Write the ALU and run the suite at two widths.",
  },
  options: {
    normal: "Normal tests",
    boundary: "Boundary tests",
    random: "Random tests",
    none: "None of them",
  },
  faults: {
    overLow: "OVER stuck at 0",
    y9Low: "Y9 stuck at 0",
    c8Low: "C8 stuck at 0",
    z8High: "Z8 stuck at 1",
    c40Low: "C40 stuck at 0",
  },
  fields: {
    a: "Word A, in hexadecimal",
    b: "Word B, in hexadecimal",
  },
} as const;
