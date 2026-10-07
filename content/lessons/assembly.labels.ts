// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson assembly, drafted by the prose process
// from a brief of facts (docs/notes/module-11-programming/briefs, brief 1L) and checked against
// the lesson.

export const LABELS = {
  title: "How can you write a program as text and let a tool make the words?",
  objectives: [
    "Write a program as lines of text with names for addresses.",
    "Say what the assembler makes of each line, a branch's constant and a word of data among them.",
    "Read why the assembler refuses a line and mend it.",
    "Step through a run in the debugger and say what each instruction changed.",
  ],
  titles: {
    question: "Words or text?",
    motivation: "What the assembler does",
    prediction: "A branch's constant",
    investigation: "Stepping through a run",
    construction: "Your first program",
    failureExperiment: "When the assembler refuses",
    explanation: "How the assembler works",
    generalisation: "Every line becomes a word",
    challenge: "Being the assembler",
    reflection: "More than one reading",
  },
  challengeTitles: {
    c1: "The warmer room",
    c2: "Being the assembler",
  },
  captions: {
    listing:
      "The listing shows each line of the colder-room program with its address and eight-digit word.",
    predictListing:
      "Predict the constant this branch needs, then check the words the assembler made.",
    debugger: "Room A's program runs in the debugger, one instruction at a time.",
    warmer: "Write the warmer-room program and pass the tests.",
    mistakes: "Mend the lines the assembler refuses.",
    dataListing: "A word of data follows the program, and the assembler places it at an address.",
    beAssembler: "Work out the address and word for each line, then run the tests.",
  },
  options: {
    c003: "003: instructions from the branch to fine",
    c014: "014: the address fine names",
    c005: "005: the position of fine counting from 000's line as 1",
  },
  fields: {
    cold: "the address cold names",
    limit: "the address limit names",
    branch: "the word of if R2 < R1 signed goto cold",
    load: "the word of R1 <= word[limit]",
  },
  runs: [
    "Room A -184, room B -250",
    "Room A -250, room B -184",
    "Both rooms -200",
    "Room A -30, room B 15",
    "Room A 20, room B -5",
  ],
} as const;
