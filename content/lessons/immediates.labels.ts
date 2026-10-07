// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson immediates, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "How far can 12 bits reach, and how does a program say greater than?",
  objectives: [
    "Give the range the constant holds and how far a branch reaches.",
    'Say "greater than" with the machine\'s branches.',
    "Count what it costs to build a number wider than 12 bits.",
    'Write "greater than" from the ALU\'s subtraction.',
  ],
  titles: {
    question: "What 12 bits can say",
    motivation: "Every address in one instruction",
    prediction: "No greater than",
    investigation: "Comparisons and a wide number",
    construction: "Working out a reach",
    failureExperiment: "A room at the limit",
    explanation: "The immediate",
    generalisation: "Numbers too wide",
    challenge: "Greater than, written",
    reflection: "What the machine leaves out",
  },
  challengeTitles: {
    c1: "Numbers, worked out",
    c2: "Greater than, written",
  },
  captions: {
    range: "Choose a constant and see how it widens.",
    predictGreater: "Predict which branch is taken, then verify.",
    comparisons: "Choose a pair and read each comparison's branch.",
    wide: "Run both ways to make 5000.",
    workReach: "Work out each number and run the tests.",
    colderBranch: "A loop's branch, back to 010.",
    equalTrap: "Run the two counts for warm rooms.",
    writeGreater: "Write the greater-than module and run the tests.",
  },
  constants: {
    most: "7FF, the largest",
    least: "800, the smallest",
    minusOne: "FFF, which is -1",
  },
  options: {
    p1Swap: "if R2 < R1 (signed)",
    p1NotLess: "if R1 >= R2 (signed)",
    p1NotLessSwap: "if R2 >= R1 (signed)",
    p2Three: "3 instructions",
    p2Five: "5 instructions",
    p2Six: "6 instructions",
  },
  pairs: {
    larger: "R1 5, R2 -3",
    smaller: "R1 -3, R2 5",
    equal: "R1 5, R2 5",
    overflow: "R1 the largest signed number, R2 -1",
  },
  programs: {
    sums: "5000 from three constant jobs",
    word: "5000 as a word in the ROM",
    right: "Not warmer: if R1 >= R2",
    wrong: "Colder: if R2 < R1",
    colder: "The loop for 7 × 5",
  },
  reach: {
    largest: "The largest number R1 ← c (a constant job, copy B) puts in R1",
    back: "The constant of a branch at 01C to 008",
    furthest: "The highest address a branch at 000 names",
  },
} as const;
