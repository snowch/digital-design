// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson on bytes, drafted by the prose process
// from a brief of facts (see CLAUDE.md and docs/notes/module-6-memory.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "How does one memory keep 8-bit and 16-bit things side by side?",
  objectives: [
    "Keep a 16-bit word as two bytes, the low byte at the lower address.",
    "Build the write enables that let one access write a byte or a 16-bit word.",
    "Say why a word must be aligned and what this memory does with one that is not.",
    "Read bytes and words from a table.",
  ],
  titles: {
    question: "Readings and smaller things in one memory",
    motivation: "Addresses that name 8 bits",
    prediction: "Predicting where a word's bytes go",
    investigation: "Two banks of bytes",
    construction: "Which bank a write reaches",
    failureExperiment: "A word at an odd address, and two faults",
    explanation: "Aligned words",
    generalisation: "Other widths",
    challenge: "Reading the bytes",
    reflection: "Bytes, words and what comes next",
  },
  challengeTitles: {
    c1: "Drawing the write enables and the check",
    c2: "Reading bytes and words from a table",
  },
  captions: {
    scene:
      "The display shows what is kept at the address the switches set, a 16-bit reading or a smaller number.",
    predictHigh:
      "Predict Q when a byte is read at address 0111 after a word is written at address 0110, then check.",
    predictHalf:
      "Predict the word at address 0100 after a byte is written at address 0101, then check.",
    explorer: "Press the pins, set A and D, press Clock CLK, and watch the table.",
    buildWrite: "Draw the write enables and ODD, and run the tests.",
    predictOdd: "Predict Q after a word write is tried at the odd address 0101, then check.",
    faults: "Choose a fault and run the checks.",
    opened: "The memory opened, to watch the banks' write enables.",
    readBytes: "Type the three answers and run the tests.",
  },
  faults: {
    xorToOr: "xorOdd (XOR feeding WEO) changed to an OR gate",
    notA0Cut: "notA0 (NOT feeding WEE) replaced by a wire",
  },
  options: {
    p1High: "Q is 00FF",
    p1Low: "Q is 0048",
    unknown: "The simulator cannot know Q (XXXX)",
    p2Same: "Q is FF48",
    p2Half: "Q is 1248",
    p2Whole: "Q is 0012",
    p3Below: "Q is FF48",
    p3Zero: "Q is 0000",
  },
  banks: {
    even: "the even bank",
    odd: "the odd bank",
  },
  table: {
    address: "Address",
    byte: "Byte",
  },
  fields: {
    word6: "The word at 0110",
    byte9: "The byte at 1001",
    word9: "What the memory gives for a word at 1001",
  },
  cases: {
    word6: "The word at 0110",
    byte9: "The byte at 1001",
    word9: "A word at 1001",
  },
  scene: {
    reading: "Reading",
    address: "Address",
    word: "WORD",
    save: "Save",
    clock: "Clock",
    circuit: "?",
    display: "Display",
    title: "A circuit that keeps 16-bit readings and smaller numbers",
    summary:
      "A receiver gives a 16-bit reading. Four address switches set where to keep it; a switch chooses between a 16-bit word and a smaller number; a Save button controls the write; a clock feeds a circuit marked with a question mark. Sixteen wires from that circuit drive a display.",
  },
  memoryTable: {
    caption: "Every byte the memory keeps, by address",
    kept: "Byte",
  },
} as const;
