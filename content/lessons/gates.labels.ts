// Copyright © 2026 Chris Snow

// Titles, objectives, captions and labels of the lesson "How do you build a circuit from a rule?", drafted by the prose process
// from a brief of facts (brief E, docs/notes/module-2-boolean-logic.md) and checked against the
// lesson's structure.

import { LABELS as SIGNALS } from "./signals.labels";

export const LABELS = {
  title: "How do you build a circuit from a rule?",
  objectives: [
    "Read a truth table and say what a gate does from it.",
    "Build a circuit of NOT, AND and OR from a rule stated in words.",
    "Find which rows a fault breaks.",
    "Write a circuit as a Boolean expression.",
  ],
  titles: {
    question: "The ALARM lamp's rule",
    motivation: "One rule, many cases",
    prediction: "The first ALARM circuit",
    investigation: "NOT, AND and OR",
    construction: "Build the ALARM circuit",
    failureExperiment: "Three faults, broken rows",
    explanation: "Tables and expressions",
    generalisation: "Two sensors and XOR",
    challenge: "The NIGHT lamp",
    reflection: "How many kinds of gate?",
  },
  challengeTitles: {
    c1: "ALARM lamp",
    c2: "NIGHT lamp",
  },
  captions: {
    scene: "WARM and DOOR from the freezer room enter a circuit that sends ALARM to a lamp.",
    predictAlarm: "Predict ALARM: freezer cold, door shut.",
    exploreNot: "Press A and watch Y and the shaded row.",
    exploreAnd: "Press A and B and watch Y and the shaded row.",
    exploreOr: "Press A and B and watch Y and the shaded row.",
    buildAlarm: "Draw the ALARM circuit and run the tests.",
    alarmFaults: "Choose a fault, press the inputs, run the checks.",
    alarmExpression: "ALARM circuit and its expression.",
    clashGates: "CLASH lamp from NOT, AND and OR; press WARM1 and WARM2.",
    clashXor: "CLASH lamp from one XOR gate; press WARM1 and WARM2.",
    writeNight: "Write the NIGHT lamp's circuit as text and run tests.",
  },
  faults: {
    extraNot: "An extra NOT gate is in the wire SHUT",
    cutShut: "The wire SHUT from NOT to AND is cut",
    doorStuck: "The door switch is broken and DOOR stays 0 even when open",
  },
  options: {
    alarm0: "ALARM is 0",
    alarm1: "ALARM is 1",
  },
  steps: {
    coldShut: "WARM 0, DOOR 0",
  },
  /** The drawing under the question. The room is the one the signals lesson's drawing names. */
  scene: {
    room: SIGNALS.path.fromRoom,
    sensor: "Sensor",
    door: "Door",
    circuit: "?",
    lamp: "Lamp",
    title: "Freezer room alarm circuit",
    summary:
      "Inside the freezer room, a sensor sends WARM and a door switch sends DOOR. Both wires go into a box marked with a question mark, which is the circuit you need to build. From the box, the wire ALARM goes to a lamp.",
  },
} as const;
