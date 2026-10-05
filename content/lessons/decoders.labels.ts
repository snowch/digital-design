// Titles, objectives, captions and labels of the lesson on decoders, drafted by the prose
// process from a brief of facts (see CLAUDE.md and docs/notes/module-3-combinational.md) and
// checked against the lesson's structure.

export const LABELS = {
  title: "How can a circuit tell which one of several things is chosen?",
  objectives: [
    "Build a circuit that lights one of four lamps, the one whose number two select inputs spell.",
    "Explain each output as the answer to: do the select inputs equal my number?",
    "Send one input to one of four outputs, and turn one of four signals into its number.",
    "Build a circuit that shows whether two 4-bit words are equal.",
  ],
  titles: {
    question: "Four lamps",
    motivation: "What each lamp checks",
    prediction: "One lamp's logic",
    investigation: "The decoder block",
    construction: "Building the decoder",
    failureExperiment: "Breaking the decoder with faults",
    explanation: "One output per number",
    generalisation: "Doors and sensors",
    challenge: "The equal-words circuit",
    reflection: "What you built",
  },
  challengeTitles: {
    c1: "The four-lamp decoder, drawn",
    c2: "The equality comparator, drawn",
  },
  captions: {
    scene: "Two input switches connect to a circuit box that has four lamp outputs.",
    predictLamp: "Predict: when S1 is 1 and S0 is 1, is the lamp on or off? Then check.",
    decoderBlock: "Change S1 and S0. Watch which output turns to 1.",
    buildDecoder: "Draw the four-lamp circuit and run the tests.",
    decoderFaults: "Choose a fault and run the checks.",
    demuxBlock: "Change IN, S1 and S0. Watch which output IN reaches.",
    predictDoors: "Predict the room number when doors B and C are open. Then check.",
    comparatorBlock: "Change A or B. Watch EQ turn to 0.",
    buildComparator: "Draw the equal-words circuit and run the tests.",
  },
  options: {
    p1Off: "Y2 is 0, the lamp is off",
    p1On: "Y2 is 1, the lamp is on",
    p2Room1: "S is 01, room B",
    p2Room2: "S is 10, room C",
    p2Room3: "S is 11, room D",
  },
  faults: {
    ns0High: "NS0 stuck at 1",
    and3ToOr: "AND gate and3 changed to OR",
    ns1Cut: "NOT gate notS1 becomes a wire",
  },
  /** The drawing under the question; the lamps from top to bottom, for Y0 to Y3. */
  scene: {
    switch: "Switch",
    circuit: "?",
    lamps: ["Room A", "Room B", "Room C", "Room D"],
    title: "Two switches, four lamps",
    summary:
      "Two input switches, S1 and S0, connect to a circuit box marked with a question mark. The box stands for the circuit the question asks you to build. Y0 drives room A's lamp, Y1 room B's, Y2 room C's and Y3 room D's.",
  },
} as const;
