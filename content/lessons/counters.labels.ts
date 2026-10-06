// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson on counters, drafted by the prose
// process from a brief of facts (docs/notes/module-5-state-machines/briefs/CE.md).

export const LABELS = {
  captions: {
    addOne: "Press EN and move the slider to see the carry pass along.",
    buildCountTick: "Draw a 4-bit counter with TICK and run the tests.",
    buildCountTwo: "Draw a 2-bit counter and run the tests.",
    countToFive: "Press Clock CLK and watch TICK light at 0101.",
    counterExplorer: "Press Clock CLK and watch Q go up by one.",
    counterFaults: "Choose a fault and run the checks.",
    predictNoReset: "Predict Q after three edges with no reset, then check.",
    predictPause: "Predict Q when EN stops after two edges, then check.",
    predictWrap: "Predict Q after 16 edges from 0000, then check.",
    scene: "Count edges while the switch is on.",
  },
  challengeTitles: {
    c1: "A 2-bit counter",
    c2: "A 4-bit counter with TICK",
  },
  faults: {
    carryCut: "C2 forced to 0",
    enHigh: "EN forced to 1",
    xorToOr: "ha0's XOR gate changed to OR",
  },
  objectives: [
    "Build a counter from a register and half adders and say why it counts.",
    "Say what happens after 1111 and why a counter needs a reset.",
    "Make a counter start again at a chosen number with a comparator.",
  ],
  options: {
    p1Stop: "Q is 1111",
    p1Zero: "Q is 0000",
    p2Counted: "Q is 0101",
    p2Kept: "Q is 0010",
    p2Zero: "Q is 0000",
    p3Three: "Q is 0011",
    p3Zero: "Q is 0000",
    unknown: "The simulator cannot know Q (XXXX)",
  },
  scene: {
    circuit: "?",
    clock: "Clock",
    count: "Count",
    display: "Display",
    reset: "Reset",
    summary:
      "A Count switch on wire EN, a Reset button on wire RST and a clock on wire CLK go into a box marked with a question mark. Four wires go to a display, and wire TICK goes to a lamp.",
    tick: "Lamp",
    title: "Count edges",
  },
  title: "How does a circuit count?",
  titles: {
    challenge: "Build a counter with TICK",
    construction: "Draw a 2-bit counter",
    explanation: "How the carry spreads",
    failureExperiment: "Three faults and no reset",
    generalisation: "Counting to any number",
    investigation: "Running the counter",
    motivation: "Working out the next number",
    prediction: "Wrapping and pausing",
    question: "Measuring a wait",
    reflection: "What decides the next number",
  },
} as const;
