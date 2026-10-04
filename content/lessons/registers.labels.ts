// Titles, objectives, captions and labels of the lesson on registers, drafted by the prose
// process from a brief of facts (see CLAUDE.md) and checked against the lesson's structure.

export const LABELS = {
  title: "How does a circuit keep several bits together?",
  objectives: [
    "Build a register from flip-flops sharing one clock, and say why all bits change at the same moment.",
    "Build one bit with a load enable, and say why the clock must reach the flip-flop unchanged.",
    "Add a reset so a register starts at 0, and write it with reset and load enable as text.",
    "Build a shift register, and say where a bit is after each clock edge.",
  ],
  titles: {
    question: "Saving and keeping four bits",
    motivation: "From one bit to four",
    prediction: "Predicting four bits",
    investigation: "Four flip-flops on one clock",
    construction: "One bit with load enable",
    failureExperiment: "Faults and an AND gate on the clock",
    explanation: "The keep path and reset",
    generalisation: "Registers as blocks and text",
    challenge: "Chains and registers",
    reflection: "Registers and what's next",
  },
  challengeTitles: {
    c1: "One bit with a load enable, drawn",
    c2: "The shift register, drawn",
    c3: "The four-bit register, as text",
  },
  captions: {
    predictWord: "Predict Q after one edge and a later change of D, then check.",
    predictKeep: "Predict Q after three edges with EN at 0 from a fresh start, then check.",
    fourFlipFlops: "Change the D pins and press Clock CLK to watch all four Q bits change at once.",
    buildKeepBit: "Draw one bit with a load enable and run the tests.",
    keepFaults: "Choose a fault and run the checks.",
    gatedClock: "Press D, CLK and EN; watch an edge appear that the clock never made.",
    keepClearBit: "Press RST and Clock CLK, then compare Q with the table.",
    registerAsText: "Compare the register drawn as a block with its text form.",
    predictChain: "Predict where a 1 will be after three edges in a chain, then check.",
    buildShift: "Draw four flip-flops in a chain and run the tests.",
    writeRegister: "Write the four-bit register in text and run the tests.",
  },
  faults: {
    keepCut: "KEEP wire forced to 0",
    enHigh: "EN forced to 1",
    orToAnd: "OR gate changed to AND",
  },
  options: {
    p1Old: "Q is 0110",
    p1New: "Q is 1111",
    p2Zero: "Q is 0000",
    p2D: "Q is 0110",
    unknown: "The simulator cannot know Q (XXXX)",
    p3Zero: "Q2 is 0",
    p3One: "Q2 is 1",
    p3X: "The simulator cannot know Q2 (X)",
  },
} as const;
