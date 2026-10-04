// Titles, objectives, captions and labels of the lesson, drafted by the prose process from a brief
// of facts (see CLAUDE.md) and checked against the lesson's structure.

export const LABELS = {
  objectives: [
    "Build a circuit from NOR gates that holds a value after the input that set it is released.",
    "Say why a loop of an even number of inverters holds a value and a loop of an odd number cannot.",
    "Build a D latch and a D flip-flop from it, and say at what moment each changes its output.",
    "Find the setup time of the flip-flop in the gate-delays model, see what the model says about the hold time, and say what the simulator cannot decide about a change just before the edge.",
  ],
  titles: {
    question: "How a circuit remembers",
    motivation: "Why kept values matter",
    prediction: "Two inverter loops and what q becomes",
    investigation: "Feedback in loops and buttons",
    construction: "The two-button memory and D latch",
    failureExperiment: "Faults, transparency problems, edge timing",
    explanation: "Feedback loops, tables, two-stage latches",
    generalisation: "One line for many gates",
    challenge: "Drawing and writing circuits",
    reflection: "What changed and questions ahead",
  },
  challengeTitles: {
    c1: "The two-button light",
    c2: "The follow-and-hold circuit",
    c3: "The flip-flop, drawn",
    c4: "The D latch, as text",
  },
  captions: {
    predictTwo: "Predict what q will be in a two-inverter loop with a kick, then run.",
    predictThree: "Predict what q will be in a three-inverter loop with a kick, then run.",
    loopTwo: "Press kick to watch q and the settling steps in a two-inverter loop.",
    loopThree: "Press kick to watch q and the settling steps in a three-inverter loop.",
    twoButtons: "Press A and B to watch LIGHT and the gates in the two-button circuit.",
    buildTwoButtons: "Draw the two-button circuit and run the tests.",
    buildDLatch: "Draw the follow-and-hold circuit with the latch offered as a block.",
    faultLab: "Choose a fault, press the buttons, and run the checks.",
    dLatchExplorer: "Hold EN at 1, change D, and watch the reference table.",
    setupHold: "Move when D changes relative to the clock edge and roll the outcome.",
    tableSr: "The reference table for the latch.",
    tableD: "The reference table for the D latch.",
    internals:
      "A recorded run inside the flip-flop; move the cursor, open the master and the slave.",
    asText: "The flip-flop drawn beside the text generated from it.",
    tableDff: "The reference table for the flip-flop.",
    buildDff: "Draw the flip-flop from two D latch blocks and an inverter, then run the tests.",
    writeDLatch: "Write the D latch as text and run the tests.",
  },
  faults: {
    cut: "Feedback wire cut",
    or: "LIGHT gate changed to OR",
    stuckA: "Button A held down",
  },
  options: {
    zero: "q is 0",
    one: "q is 1",
    x: "The simulator cannot decide (X)",
  },
} as const;
