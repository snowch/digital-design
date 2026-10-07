// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson what-computers-do.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const LABELS = {
  title: "What does a computer do?",
  objectives: [
    "Run a program a line at a time and say what each line changed.",
    "Predict which lines of a program run for given readings.",
    "Change a number in a line to change what the program does.",
    "Explain that a program is lines kept as numbers in the machine's memory.",
  ],
  titles: {
    question: "The shop and its machine",
    motivation: "A program of lines",
    prediction: "Which lines run?",
    investigation: "One line at a time",
    construction: "Changing the limit",
    failureExperiment: "Room B fails",
    explanation: "Lines kept as numbers",
    generalisation: "What every computer does",
    challenge: "Work it out by hand",
    reflection: "Reading, keeping, running, setting",
  },
  challengeTitles: {
    c1: "Changing the limit",
    c2: "Work it out by hand",
  },
  captions: {
    shop: "The shop's rooms, the machine, the display and the lamps",
    predictLines: "Choose which lines run, then check",
    run: "Run the program a line at a time and change a reading",
    limit: "Type line 5's number and run the tests",
    roomBFails: "Predict the lamp when room B fails",
    kept: "The program with the number each line is kept as",
    inYourHead: "Answer, then run the tests",
  },
  scene: {
    roomA: "Room A",
    roomB: "Room B",
    sensor: "Sensor",
    machine: "Machine",
    display: "Display",
    title: "The shop and the machine",
    summary:
      "Each room has a sensor that sends its reading to the machine. The machine controls the office display and the three lamps.",
  },
  options: {
    p1All: "All nine lines, 1 to 9",
    p1Skip: "Lines 1 to 6, then line 9",
    p1Stop: "Lines 1 to 6, then it stops",
    p2Lit: "Lit",
    p2Dark: "Dark",
  },
  cases: {
    gap60: "A gap of 60: CLASH lit",
    gap50: "A gap of 50: CLASH lit",
    gap49: "A gap of 49: CLASH dark",
    display: "The display shows your number",
    lamp: "CLASH is as you said",
  },
  fields: {
    limit: "The limit",
    display: "Display value",
    lamp: "CLASH lamp",
    lit: "Lit",
    dark: "Dark",
  },
} as const;
