// Titles, objectives, captions and labels of the lesson on the register file, drafted by the prose process
// from a brief of facts (see CLAUDE.md and docs/notes/module-6-memory.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "How can a memory give out two words at once?",
  objectives: [
    "Add a second read with its own address to a memory of registers.",
    "Explain why reads can share registers and why this circuit takes one write per rising edge.",
    "Build a register file of two words.",
    "Write a register file as SystemVerilog text using an array.",
  ],
  titles: {
    question: "Two displays at once",
    motivation: "A second selector on the same registers",
    prediction: "Predicting two reads",
    investigation: "The register file opened",
    construction: "A register file of two words",
    failureExperiment: "Faults in the write and the reads",
    explanation: "Reads only look, writes change",
    generalisation: "A memory as an array",
    challenge: "The register file as text",
    reflection: "One write, many reads",
  },
  challengeTitles: {
    c1: "Drawing a two-word register file",
    c2: "Writing the four-word register file as text",
  },
  captions: {
    scene: "Each display must show the setting of the room its own switches choose.",
    predictSame: "Predict QB after two writes, with both reads at address 01, then check.",
    predictBefore: "Predict QA when D changes but no edge comes, then check.",
    explorer: "Press the pins and Clock CLK, watch QA and QB in the table, and open the block.",
    buildTwoReads: "Draw a register file of two words and run the tests.",
    faults: "Choose a fault and run the checks.",
    opened: "The register file opened, to watch both selectors follow their addresses.",
    ramText: "Compare the RAM drawn as a block with its text form.",
    writeRegfile: "Write the register file as text and run the tests.",
  },
  faults: {
    andW2ToOr: "andW2 changed to an OR gate",
    w1Low: "W1 forced to 0",
    notS1Cut: "NOT on S1 replaced by wire",
  },
  options: {
    p1First: "QB is 0101",
    p1Second: "QB is 1100",
    unknownB: "The simulator cannot know QB (XXXX)",
    p2Old: "QA is 0101",
    p2New: "QA is 1111",
    unknownA: "The simulator cannot know QA (XXXX)",
  },
  scene: {
    number: "Number",
    saveRoom: "Save room",
    save: "Save",
    clock: "Clock",
    leftRoom: "Left",
    rightRoom: "Right",
    circuit: "?",
    left: "Left",
    right: "Right",
    title: "Two displays choosing their own setting",
    summary:
      "Switches setting a 4-bit number on D, two switches choosing the room to save on WA (2 bits), a Save button, a clock on CLK, two switches for the left display's room on RA (2 bits) and two for the right display's room on RB (2 bits). All feed a circuit box marked with a question mark. Four wires from the box carry QA to the left display and four carry QB to the right display.",
  },
} as const;
