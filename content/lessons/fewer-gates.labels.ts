// Titles, objectives, captions and labels of the lesson "How do you build a circuit with fewer gates?", drafted by the prose process
// from a brief of facts (brief E, docs/notes/module-2-boolean-logic.md) and checked against the
// lesson's structure.

export const LABELS = {
  title: "How do you build a circuit with fewer gates?",
  objectives: [
    "Find rows that differ in one input and build a simpler circuit.",
    "Check a simplified circuit against every row.",
    "Measure a circuit's depth and say why it matters.",
    "Share a gate between two lamps.",
  ],
  titles: {
    question: "Eight gates, room for four",
    motivation: "Why fewer gates matter",
    prediction: "One row of the manager's circuit",
    investigation: "Reading rows in pairs",
    construction: "CALL in four gates",
    failureExperiment: "The simplified circuit",
    explanation: "Steps and depth",
    generalisation: "Sharing a gate",
    challenge: "XOR in four NAND gates",
    reflection: "Fewer gates, shorter paths",
  },
  challengeTitles: {
    c1: "CALL in four gates",
    c2: "XOR in four NAND gates",
  },
  captions: {
    predictWarm: "Predict CALL when WARM changes to 0, door open, shop closed.",
    callPairs: "Choose an input and read rows in pairs.",
    buildCall: "Draw CALL with at most 4 gates and run tests.",
    tooShort: "Does the simplified circuit match the manager's in every row?",
    chainSteps: "Press ROOM1 to ROOM4 and read the steps.",
    treeSteps: "Press each input and read the steps of three OR gates.",
    twoLamps: "ALARM and CALL: gate counts and depth.",
    buildXorFour: "Draw XOR from at most 4 NAND gates and run tests.",
  },
  options: {
    call0: "CALL is 0",
    call1: "CALL is 1",
    same: "light CALL in the same rows",
    different: "light CALL in different rows",
  },
  sides: {
    rows: "Manager's circuit",
    tooShort: "Simplified circuit",
    separate: "Separate gates",
    shared: "Shared gate",
  },
  steps: {
    allOne: "WARM 1, DOOR 1, CLOSED 1",
    warmFalls: "WARM to 0",
  },
} as const;
