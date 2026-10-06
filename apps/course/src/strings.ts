// Copyright © 2026 Christopher Snow

// The shell's own words. Drafted by the prose process; see CLAUDE.md.

export const STRINGS = {
  skip: "Skip to content",
  lessons: "Lessons",
  theme: "Theme",
  themeAuto: "System",
  themeLight: "Light",
  themeDark: "Dark",
  footer: "Everything runs in your browser. Nothing is sent anywhere.",
  /** Under the footer's line, on every page. */
  copyright: "© 2026 Christopher Snow",
  noLessons: "No lessons are published yet.",
  noChallenges: "No challenges",
  /** Under the course title: what the course takes as known before Module 1. */
  assumes:
    "The course assumes you can turn a binary number into decimal and a decimal number into binary.",
  /** Under the line above: the link to the page before the first lesson. */
  prefaceLink: "Check if you are ready and see how a lesson works.",
  preface: {
    title: "Before you start",
    /** What the course is. */
    what: "You build a working computer from its parts, one module at a time, starting from two voltages on a wire. You test everything you build in the page, with tests you can read. Everything runs in your browser, and your work stays there. Each new browser or device starts from nothing.",
    needHeading: "What you should know",
    /** What the learner needs, above the self-check. */
    need: "You need to know how to turn a binary number into decimal, and a decimal number into binary. The course uses both from its first lesson and does not teach them. You need everyday arithmetic. You do not need to know anything about electronics, circuits or programming.\n\nThe check below takes a minute or two. If it takes you longer, learn binary first, then come back.",
    lessonsHeading: "How a lesson works",
    /** How a lesson works, under the self-check. */
    lessons:
      "Each lesson starts from a question about something real. It has ten sections, each labelled: Question, Motivation, Prediction, Investigation, Construction, Failure experiment, Explanation, Generalisation, Challenge, Reflection. Before the course shows you an answer, it asks you to predict it. You choose an answer and press \"Check my prediction\". The course's model gives its answer and the working. You can predict again.\n\nYou build circuits and other answers in the page and run their tests. A failed test shows its inputs, what your work gave and what was expected. Each challenge has five hints, shown one at a time, and the last hint gives the answer. When you open a lesson, the course checks your saved work again. A figure that runs the course's simulator has a badge naming how it counts time. Press it to read how.",
    start: (module: number, title: string) => `Start with Module ${module}: ${title}`,
  },
  selfCheck: {
    title: "Ready to start?",
    intro: "There are four questions. Type each answer, then press the check button.",
    check: "Check my answers",
    right: "Correct",
    blank: "Please answer",
    toDecimal: (binary: string) => `What is ${binary} in decimal?`,
    toBinary: (n: number) => `What is ${n} in 8-digit binary?`,
    workingDecimal: (binary: string, terms: string, value: number) =>
      `${binary} = ${terms} = ${value}`,
    workingBinary: (n: number, terms: string, binary: string) =>
      `${n} = ${terms} = ${binary} in binary`,
    score: (right: number, total: number) => `${right} of ${total} correct`,
  },
  module: (n: number) => `Module ${n}`,
  /**
   * The cover, at the top of the front page. A reader meets it before every lesson, so it uses no
   * term a lesson introduces (a test holds it to the term gate).
   */
  cover: {
    /** Under the course title: what the course is. */
    lead: "You build a working computer from its parts, starting from two voltages on a wire, and for each circuit you predict what will happen, build it, run it, break it, and explain what happened. Everything runs in your browser, your work stays in your browser, and every simulation shows the real circuit, not an animation.",
    /** How the machine the course builds runs one step: its parts, read from the top. */
    flow: {
      next: "Next step",
      program: "The program",
      reading: "What to do",
      doing: "Running the step",
      numbers: "Sixteen stored numbers",
      arithmetic: "Arithmetic and logic",
      memory: "Memory, display, sensors and lamps",
      back: "Then the machine goes back to the first box for the next step",
    },
    /** Under the flow of one step. */
    machine: "The machine the course builds runs each step of a program this way.",
    /** Above the list of every module the plan has. */
    contents: (count: number) => `All ${count} modules`,
    /** Under a module with no lessons yet. */
    toWrite: "This module is still to be written.",
    /** The way on for a reader who has passed a challenge: the first lesson not finished. */
    continueWith: (module: number, title: string) => `Continue with Module ${module}: ${title}`,
  },
  /** Every module the plan has (`docs/plan.md`), by number from 0, in plain words. */
  moduleNames: [
    "What computers do",
    "Voltage to numbers",
    "Learning AND, OR, NOT",
    "Selecting, comparing, adding",
    "Memory and time",
    "Counting and sequences",
    "Accessing many numbers",
    "Arithmetic and logic",
    "Putting pieces together",
    "Control and sequencing",
    "The machine's vocabulary",
    "Programming and debugging",
    "Errors and responses",
    "The whole machine",
  ] as readonly string[],
  progress: (passed: number, total: number) => `${passed} of ${total} challenges complete`,
  missing: (path: string) => `There is no page at ${path}.`,
  noLesson: (id: string) => `There is no lesson called ${id}.`,
  backToLessons: "Back to the lessons",
  /** The links at the bottom of a lesson to the lesson before it and the lesson after it. */
  pager: {
    /** What a screen reader calls the links' bar; the bar at the top of the page is "Lessons". */
    label: "Next and previous lesson",
    previous: "Previous",
    next: "Next",
    /** On the last lesson written so far, above "Back to the lessons". */
    notYet: "Next lesson is still to be written.",
  },
};
