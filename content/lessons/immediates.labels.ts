// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson immediates, drafted by the prose
// process from a brief of facts (docs/notes/module-10-instruction-set/briefs) and checked
// against the lesson.

export const LABELS = {
  title: "How far can one instruction reach?",
  objectives: [
    "Identify the range the constant holds and how far branches reach.",
    "Say greater than with the machine's branches.",
    "Build a number wider than 12 bits from instructions.",
    "Write greater than using the ALU's subtraction operation.",
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
    workReach: "Work out each reach value and run the tests.",
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
  },
  reach: {
    largest: "The largest number one constant job puts in a register",
    back: "The constant of a branch at 01C to 008",
    furthest: "The highest address a branch at 000 names",
  },
} as const;
