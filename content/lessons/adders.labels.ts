// Titles, objectives, captions and labels of the lesson on adders, drafted by the prose
// process from a brief of facts (see CLAUDE.md and docs/notes/module-3-combinational.md) and
// checked against the lesson's structure.

export const LABELS = {
  title: "How does a circuit add two words?",
  objectives: [
    "Add two bits with gates and explain what the carry is.",
    "Build a full adder from two half adders and an OR gate.",
    "Build a 4-bit adder from four full adders.",
    "Tell when a sum does not fit in a word, unsigned and signed.",
  ],
  titles: {
    question: "The correction",
    motivation: "Adding on paper",
    prediction: "Predicting one column",
    investigation: "Two bits and two columns",
    construction: "The full adder",
    failureExperiment: "Faults in the adder",
    explanation: "Unsigned and signed",
    generalisation: "The full correction",
    challenge: "Build the 4-bit adder and overflow lamp",
    reflection: "What the adder does",
  },
  challengeTitles: {
    c1: "Full adder from two half adders, drawn",
    c2: "4-bit adder from full adders, drawn",
    c3: "Overflow lamp from top bits, drawn",
  },
  captions: {
    predictSum: "Predict the sum bit when both bits are 1, then check",
    halfAdder: "Press A and B and watch SUM and CARRY",
    columnsAlone: "Add two 2-bit words one column at a time and find what is lost",
    buildFullAdder: "Draw the full adder and run the tests",
    fullAdderFaults: "Choose a fault and run the checks",
    adder4: "Change the two 4-bit words and read the sum both ways",
    predictSigned: "Predict what 1000 reads as signed, then check",
    correction: "Add -6 to room B's word and read the sum both ways",
    buildRipple: "Draw the 4-bit adder and run the tests",
    buildOverflow: "Draw the overflow lamp and run the tests",
  },
  options: {
    p1Zero: "SUM is 0",
    p1One: "SUM is 1",
    p2Eight: "1000 reads 8 signed",
    p2MinusEight: "1000 reads -8 signed",
    p2Zero: "1000 reads 0 signed",
  },
  faults: {
    orToXor: "OR to XOR on carry",
    cinLow: "Carry in stuck at 0",
    sumToOr: "XOR to OR in ha2's sum",
  },
} as const;
