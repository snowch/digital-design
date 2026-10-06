// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson on register transfer, drafted by the
// prose process from a brief of facts (docs/notes/module-5-state-machines/briefs/RE.md).

export const LABELS = {
  captions: {
    buildNowPrev: "Draw NOW and PREV and run the tests.",
    nowPrevAsText: "Compare the two registers drawn as blocks with their text.",
    nowPrevExplorer: "Set IN, press SAVE and Clock CLK, and watch both displays.",
    predictLongPress: "Predict PREV after a press that lasts three edges, then check.",
    predictPrev: "Predict PREV after two saves, then check.",
    predictSwap: "Predict X after one edge with each register's D from the other's Q, then check.",
    saveOnce: "Keep SAVE pressed for several edges and watch it save once.",
    scene: "The second display shows the number saved before the latest one.",
    writeReadings: "Write the two 16-bit registers with an undo and run the tests.",
  },
  challengeTitles: {
    c1: "Draw NOW and PREV",
    c2: "Two readings with undo",
  },
  objectives: [
    "Predict which word a register takes when its D comes from a register that changes at the same edge.",
    "Make a button press act only once, across multiple edges.",
    "Write 16-bit registers that pass words to each other as text.",
  ],
  options: {
    p1New: "PREV is 0101",
    p1Old: "PREV is 0011",
    p1Zero: "PREV is 0000",
    p2New: "PREV is 0101",
    p2Old: "PREV is 0011",
    p2Zero: "PREV is 0000",
    p3Same: "X is 0011",
    p3Swapped: "X is 0101",
    unknown: "The simulator cannot know X (XXXX)",
  },
  scene: {
    circuit: "?",
    clock: "Clock",
    now: "NOW",
    prev: "PREV",
    save: "Save",
    summary:
      "Switches on four wires IN, a Save button on wire SAVE and a clock on wire CLK go into a box marked with a question mark; four wires go to display NOW and four to display PREV.",
    switches: "Switches",
    title: "Switches with two displays",
  },
  title: "How do registers pass words to each other?",
  titles: {
    challenge: "Swap and undo",
    construction: "Build NOW and PREV",
    explanation: "Words move at each edge",
    failureExperiment: "What happens with a long press",
    generalisation: "Registers as text",
    investigation: "Watch NOW and PREV change",
    motivation: "One register's value from another",
    prediction: "Which word does PREV take?",
    question: "A new display",
    reflection: "Deciding the job",
  },
} as const;
