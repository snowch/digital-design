// Titles, objectives, captions and labels of the lesson on RAM, drafted by the prose process
// from a brief of facts (see CLAUDE.md and docs/notes/module-6-memory.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "How can a circuit store many words and find one again?",
  objectives: [
    "Explain how a decoder and AND gates with write enable let an edge write one of many words.",
    "Explain why reading a word needs no clock edge and writing one waits for an edge.",
    "Build a memory of two words from registers, a selector and gates.",
    "Explain what happens when an address uses more bits than the memory has, and how to refuse it.",
  ],
  titles: {
    question: "Keeping a setting for each room",
    motivation: "From one register to four",
    prediction: "What does the memory show?",
    investigation: "Inside the memory",
    construction: "Building a two-word memory",
    failureExperiment: "Faults and wrong addresses",
    explanation: "Writing one, reading any",
    generalisation: "More address bits, more words",
    challenge: "Guarding the memory",
    reflection: "Two words at once",
  },
  challengeTitles: {
    c1: "Build a two-word memory",
    c2: "Build a guard",
  },
  captions: {
    scene: "Two switches choose a room; the display shows its setting.",
    predictOther: "Predict Q after you write a word at address 10 and move to room 01, then check.",
    predictTwo: "Predict Q after you write two words and move back to address 10, then check.",
    explorer: "Press the pins and Clock CLK, watch the table, then press the block to open it.",
    buildTwo: "Draw a memory of two words and run the tests.",
    faults: "Choose a fault and run the checks.",
    predictWide: "Predict Q after you write at address 101, then check.",
    wideExplorer: "Try addresses from 100 to 111 and see which word each reaches.",
    opened: "Watch the decoder's outputs and the W wires as you press the pins.",
    big: "A memory of 16 words, drawn as one closed block.",
    buildGuard: "Draw a guard that refuses addresses 100 to 111 and run the tests.",
  },
  faults: {
    w2High: "W2 forced to 1",
    notS0Cut: "NOT on S0 replaced by wire",
    andW3ToOr: "andW3 changed to OR gate",
  },
  options: {
    p1Same: "Q is 0110",
    p1Zero: "Q is 0000",
    p2First: "Q is 0110",
    p2Second: "Q is 1001",
    p3Kept: "Q is 0101",
    p3Over: "Q is 1110",
    unknown: "The simulator cannot know Q (XXXX)",
  },
  scene: {
    number: "Number",
    room: "Room",
    save: "Save",
    clock: "Clock",
    circuit: "?",
    display: "Display",
    title: "Room settings circuit",
    summary:
      "Four switches set a number on four wires, and two switches on A1 and A0 choose a room. A Save button and clock on CLK feed a box marked with a question mark (the circuit to build). Four wires from the box drive a display showing that room's setting.",
  },
} as const;
