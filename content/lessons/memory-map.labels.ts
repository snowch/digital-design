// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson on the memory map, drafted by the prose process
// from a brief of facts (see CLAUDE.md and docs/notes/module-6-memory.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "How do the display and sensor answer at addresses?",
  objectives: [
    "Give each part a share of the addresses with a decoder on the top bits.",
    "Make a display and a sensor answer reads and writes at addresses.",
    "Write a ROM in SystemVerilog, filled from a list of values.",
    "Build a memory from a ROM, a RAM, a display and a sensor.",
  ],
  titles: {
    question: "The display and sensor at addresses",
    motivation: "Parts that answer like memory",
    prediction: "Predicting the display",
    investigation: "Which part answers which addresses",
    construction: "A ROM filled from a list",
    failureExperiment: "A part that takes the wrong writes",
    explanation: "A decoder on the top bits",
    generalisation: "Who chooses the addresses, and which parts can be memory-mapped",
    challenge: "The shop's memory, drawn",
    reflection: "The end of Module 6",
  },
  challengeTitles: {
    c1: "Writing the limits as a ROM",
    c2: "Drawing the shop's memory",
  },
  captions: {
    scene: "Reads and writes must reach the display and the sensor as well as memory.",
    predictDisplay:
      "Predict what the display shows after writes at two of its addresses, then check.",
    explorer: "Press the pins and set A and D, and watch which part the address names.",
    writeRom: "Write the limits as a ROM and run the tests.",
    faults: "Choose a fault and run the checks.",
    opened: "The shop's memory is opened to show the decoder's path to each part.",
    predictSensor: "Predict Q after a write to the sensor's addresses, then check.",
    buildShop: "Draw the shop's memory from the blocks and run the tests.",
  },
  faults: {
    displayOr: "The AND gate andDisplay changed to an OR gate",
    ramHigh: "andRam's output, WERAM, forced to 1",
  },
  options: {
    p1First: "DISPLAY is 0012",
    p1Second: "DISPLAY is 0030",
    unknown: "The simulator cannot know it (XXXX)",
    p2Sensor: "Q is FF48",
    p2Zero: "Q is 0000",
  },
  parts: {
    rom: "ROM (the limits)",
    ram: "RAM (bytes)",
    display: "display",
    sensor: "sensor",
  },
  scene: {
    address: "Address",
    data: "Data",
    save: "Save",
    clock: "Clock",
    sensor: "Sensor",
    circuit: "?",
    display: "Display",
    read: "Read",
    title: "Shop memory",
    summary:
      "Six address switches, sixteen data switches on D, a Save button on WE, a clock on CLK and the sensor's receiver feed a box marked with a question mark. From it, sixteen wires go to the display and sixteen to a readout of what is read (Q).",
  },
} as const;
