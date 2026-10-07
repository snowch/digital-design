// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson inside-the-machine.
// Drafted by the course's prose process from briefs of checked facts
// (docs/notes/module-0-machine/briefs), checked for facts only and placed by
// docs/notes/module-0-machine/scripts/place.py with the fixes in fixes.json.

export const LABELS = {
  title: "What is the machine made of?",
  objectives: [
    "Go down the machine a level at a time, from a line of the program to one wire.",
    "Read the 1s and 0s the slices give as the number.",
    "Explain how one stuck wire changes what the shop's display shows.",
    "Trace one line: the number it changes, the new number, the next line and the part that works it out.",
  ],
  challengeTitles: {
    c1: "Slices for a number",
    c2: "Trace line 3",
  },
  captions: {
    predictSlices: "Choose which slices show 1.",
    ladder: "Open each level to see 66.",
    slices: "Type the 1s and 0s the eight slices give.",
    stuck: "Choose whether a wire is stuck.",
    tracePaused: "See what the new rooms read.",
    trace: "Trace line 3.",
    question: "The machine from the last lesson, with 66 on the display.",
  },
  levels: {
    line: "The line",
    parts: "The machine's parts",
    adder: "The part that adds",
    four: "Four slices",
    slice: "One slice",
    smallest: "The smallest parts",
    wire: "One wire",
    sixteen: "Sixteen slices",
    adding: "The adding part",
  },
  options: {
    p1Two: "The slices worth 64 and 2",
    p1One: "One slice worth 66",
    p1All: "All 64 slices",
    stuck66: "66",
    stuck64: "64",
    stuckStops: "The machine stops at line 3.",
  },
  fields: {
    slices: "Eight 1s and 0s, the slice worth 128 first",
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
    slicesHigh: "Slices worth 128, 64, 32 and 16.",
    slicesLow: "Slices worth 8, 4, 2 and 1.",
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
