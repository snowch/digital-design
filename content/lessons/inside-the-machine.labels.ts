// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson inside-the-machine.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const LABELS = {
  title: "What is the machine made of?",
  objectives: [
    "Go down the machine a level at a time, from a line of the program to one wire.",
    "Read a number the part that adds gives as the 1s and 0s of its slices.",
    "Explain how one stuck wire changes what the shop's display shows.",
    "Trace one line: the number it changes, the new number, the next line and the part that works it out.",
  ],
  challengeTitles: {
    c1: "Slices for a number",
    c2: "Trace line 3",
  },
  captions: {
    predictSlices: "Choose which slices give a 1.",
    ladder: 'Press "Down a level" to go down from line 3 to one wire.',
    slices: "Type the 1s and 0s the eight lowest slices give, then run the test.",
    stuck: "Choose the stuck wire and decide what the display will show before you run.",
    tracePaused: "The machine is paused before line 3.",
    trace: "Trace the next line from what the machine shows, then run the tests.",
  },
  levels: {
    line: "The line",
    parts: "The machine's parts",
    adder: "The part that adds",
    four: "Four slices",
    slice: "One slice",
    smallest: "The smallest parts",
    wire: "One wire",
  },
  options: {
    p1Two: "The slices worth 64 and 2",
    p1One: "One slice worth 66",
    p1All: "All 64 slices",
  },
  fields: {
    slices: "Eight slices, 128 first",
    changed: "Number that changes",
    none: "None",
    value: "New number",
    next: "Next line",
    part: "Part that works it out",
    memory: "The memory",
    adder: "The part that adds",
  },
  cases: {
    slices: "The eight slices",
    changed: "Which number changes",
    value: "New number",
    next: "Next line",
    part: "Part that works it out",
  },
  titles: {
    question: "Where 66 comes from",
    motivation: "Parts inside parts",
    prediction: "Which slices give a 1",
    investigation: "Down the ladder",
    construction: "A number on the slices",
    failureExperiment: "One wire stuck",
    explanation: "One machine at every level",
    generalisation: "The course's ladder",
    challenge: "Tracing one line",
    reflection: "From the top to one wire",
  },
  faults: {
    stuck: "The wire in the slice worth 2, stuck low",
  },
} as const;
