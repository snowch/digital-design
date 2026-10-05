// Titles, objectives, captions and labels of the lesson on selectors, drafted by the prose
// process from a brief of facts (see CLAUDE.md and docs/notes/module-3-combinational.md) and
// checked against the lesson's structure.

export const LABELS = {
  title: "How can one circuit pick one of several words?",
  objectives: [
    "Build a circuit from AND, OR and NOT gates that passes one of two inputs to its output, chosen by a select input.",
    "Explain why only one of the two AND gates passes at a time.",
    "Extend the 2-way selector to a whole word, using one circuit per bit.",
    "Build a 4-way selector from three 2-way ones, and say which input each S1 and S0 pattern selects.",
  ],
  titles: {
    question: "Two rooms, one display",
    motivation: "Why not join two cables",
    prediction: "Predict with OR and AND",
    investigation: "Press the selector block",
    construction: "Build the selector from gates",
    failureExperiment: "Break the circuit with faults",
    explanation: "Why it works: bits to words",
    generalisation: "Four rooms, two selects",
    challenge: "Four-way selector from three",
    reflection: "What selectors do",
  },
  challengeTitles: {
    c1: "2-way selector from gates, drawn",
    c2: "4-way selector from three 2-way ones, drawn",
  },
  captions: {
    scene:
      "Each small box on the left is a receiver for one room's cable. A wide line marked 16 carries one word on 16 wires.",
    predictOr: "Predict what an OR gate joining room A's bit and room B's bit gives, then check.",
    predictAnd:
      "Predict what an AND gate gives when its control input S is 0 and A changes, then check.",
    selectorBlock: "Press A, B and S on a closed block and find its rule.",
    buildSelector2: "Draw the 2-way selector from gates and run the tests.",
    selectorFaults: "Choose a fault and run the checks.",
    wordSelector: "Change the two 4-bit words and S, and watch Y.",
    fourWayBlock: "Press S1 and S0 on a closed 4-way selector and find which input reaches Y.",
    buildSelector4: "Draw the 4-way selector from three 2-way selectors and run the tests.",
  },
  options: {
    p1RoomA: "Y is 0, room A's bit",
    p1RoomB: "Y is 1, room B's bit",
    p2Zero: "Y is 0",
    p2One: "Y is 1",
  },
  faults: {
    noNot: "NOT gate notS becomes a wire",
    sHigh: "Input S is stuck at 1",
    orToXor: "OR gate orY becomes XOR",
  },
  /** The drawing under the question. */
  scene: {
    receiverA: "Room A",
    receiverB: "Room B",
    switch: "Switch",
    circuit: "?",
    display: "Display",
    title: "Choosing which receiver feeds the display",
    summary:
      "On the left, a receiver for room A is above a receiver for room B. Each has a wide line marked 16 running right into a box marked with a question mark, which represents the circuit the question asks you to build. A switch output named S also runs into the box, and from the box a wide line marked 16 runs to the display.",
  },
} as const;
