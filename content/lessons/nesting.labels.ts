// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson nesting, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 6L) and checked
// against the lesson.

export const LABELS = {
  title: "What if a trap comes while the handler runs?",
  objectives: [
    "Say what a trap inside the handler writes over.",
    "Give the control registers just after a trap inside the handler.",
    "Save C1 and C2 before letting interrupts in, and put them back before resume.",
    "Say why a handler must not fault.",
  ],
  titles: {
    question: "A door kept waiting",
    motivation: "A trap inside the handler",
    prediction: "C2 after the handler faults",
    investigation: "Two traps, edge by edge",
    construction: "The registers inside the wait, worked out",
    failureExperiment: "Interrupts let in, nothing saved",
    explanation: "Saving C1 and C2",
    generalisation: "When to let interrupts in",
    challenge: "A count the door can interrupt",
    reflection: "Where a trap happens",
  },
  challengeTitles: {
    c1: "The registers inside the wait",
    c2: "A count the door can interrupt",
  },
  captions: {
    late: "The debugger shows a handler whose long job keeps the door waiting.",
    predict: "The handler's listing shows job 2 faulting on room 5, with a question about C2.",
    timeline:
      "The timeline shows the run from the program's call, edge by edge, with the mode after each.",
    savedListing: "The listing shows the handler with job 5 saving C1 and C2.",
    answers:
      "Four questions ask about the registers when the door's interrupt comes in during the wait.",
    unsaved: "The debugger shows a job 5 that lets interrupts in without saving C1 and C2.",
    saved: "The debugger shows job 5 saving C1 and C2, with the door's time to choose.",
    wait: "The handler's job 6 is yours to change, with its tests.",
  },
  keptTitle: "C1 and C2 saved at 410 and 418",
  fields: {
    c1: "C1 after the door's interrupt",
    c3: "C3 after the door's interrupt",
    saved: "The word at 418",
    c0: "C0 after the door part's resume",
  },
  waitLabels: [
    "The door opens in the count, and the program ends after it",
    "Show 5, count, show 6, the door open",
    "Show 5, count, show 6, the door shut",
    "Count 30, interrupts off, the door opening during the count",
  ],
  lanes: {
    start: "[draft] lanes.start",
    handler: "[draft] lanes.handler",
    program: "[draft] lanes.program",
    again: "[draft] lanes.again",
  },
} as const;
