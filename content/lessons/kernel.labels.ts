// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson kernel, drafted by the prose process from a
// brief of facts (docs/notes/beyond-the-machine/briefs, brief L4) and checked against the lesson.

export const LABELS = {
  title: "How can one machine run two programs at once?",
  objectives: [
    "Say what a program is to the machine between two instructions.",
    "Follow a system call and a timer's interrupt through the kernel.",
    "Work out what a switch saves, and where.",
    "Set up a program for the kernel.",
  ],
  titles: {
    question: "The runner stalls on the report",
    motivation: "Why the runner needs a kernel",
    prediction: "Predicting R5 after a switch",
    investigation: "Running the kernel with both programs",
    construction: "Working out the report's save area",
    failureExperiment: "Setting the timer to 40",
    explanation: "How the kernel switches programs",
    generalisation: "What the kernel is for",
    challenge: "Two programs, set up",
    reflection: "Looking back at the kernel",
  },
  challengeTitles: {
    c1: "The save areas, worked out",
    c2: "Two programs, set up",
  },
  captions: {
    runner: "The runner from lesson 12.8, with the gap program first and the report second.",
    predict:
      "The kernel runs both programs: predict what R5 holds when the gap program next subtracts.",
    switch: "The kernel's switch from one program to the other, with the save areas drawn.",
    save: "The three words the construction asks you to find.",
    short: "The kernel with a count of 40.",
    lanes: "The kernel's run as lanes, over its first switches.",
    challenge: "The kernel with its start, where you set up the second program's save area.",
  },
  lanes: {
    start: "The start",
    handler: "The handler",
    kernel: "The kernel's handler",
    gap: "The gap program",
    report: "The report",
  },
  memory: {
    records: "The records",
    areas: "Running, waiting",
    gap: "The gap program's save area",
    report: "The report's save area",
    first: "The first program's save area",
    second: "The second program's save area",
  },
  options: {
    roomA: "-184, room A's reading",
    reportZero: "0, as the report left it",
    roomB: "-250, room B's reading",
    unknown: "X: not known",
    both: "66: both programs get on",
    never: "0: the gap is never shown",
  },
  fields: {
    c2: "The report's C2 word",
    r13: "The address of the report's R13 word",
    c1: "The report's C1 word, as two bits",
  },
  runs: [
    "The gap program for three rounds, then the report on its own readings.",
    "Two programs that call one function.",
    "As run 1, with the second program storing to the display itself.",
  ],
} as const;
