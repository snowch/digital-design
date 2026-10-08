// Copyright © 2026 Christopher Snow

// Titles, objectives, captions and labels of the lesson interrupts, drafted by the prose
// process from a brief of facts (docs/notes/module-12-traps/briefs, brief 5L) and checked
// against the lesson.

export const LABELS = {
  title: "How can the machine answer the door while a program runs?",
  objectives: [
    "Say when the machine takes an interrupt, and with which cause.",
    "Give an interrupt's return point.",
    "Clear an event's bit in a handler.",
    "Write a handler's part that answers the timer.",
  ],
  titles: {
    question: "A door nobody watches",
    motivation: "An event between two instructions",
    prediction: "C2 after the door's interrupt",
    investigation: "The door and the timer, edge by edge",
    construction: "The next edge, worked out",
    failureExperiment: "An event never cleared",
    explanation: "Three ways into the handler",
    generalisation: "Answering without asking",
    challenge: "The door left open",
    reflection: "A trap inside the handler",
  },
  challengeTitles: {
    c1: "The next edge",
    c2: "The door left open",
  },
  captions: {
    unseen: "Lesson 4's handler and a counting program, in the debugger, while the door opens.",
    predict:
      "The handler for the door and the timer, with the counting program, listed, with a question about C2.",
    timeline:
      "The run with the door opening, edge by edge, showing the mode and the interrupts after each edge.",
    answers: 'Four cases of C0 and "waiting".',
    noClear: "A handler that does not clear the door's bit, in the debugger.",
    debugger:
      "The handler and the counting program in the debugger, with the door's time to choose.",
    timer: "A handler whose timer part you write, with its tests.",
  },
  fields: {
    door: "C0 10, waiting 10",
    off: "C0 00, waiting 10",
    both: "C0 10, waiting 11",
    handler: "C0 01, waiting 01",
  },
  timerLabels: [
    "The door left open",
    "The door closed in time",
    "The door shut all night",
    "The door opened late and left open",
    "The door left open on a warm night",
  ],
  storedTitle: "[draft] storedTitle",
} as const;
