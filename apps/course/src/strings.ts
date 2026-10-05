// The shell's own words. Drafted by the prose process; see CLAUDE.md.

/** Joins numbers as prose does: "2", "2 and 3", "2, 3 and 6". */
export function joinNumbers(numbers: readonly number[]): string {
  if (numbers.length <= 1) return numbers.map(String).join("");
  return `${numbers.slice(0, -1).join(", ")} and ${numbers[numbers.length - 1]}`;
}

export const STRINGS = {
  skip: "Skip to content",
  lessons: "Lessons",
  theme: "Theme",
  themeAuto: "System",
  themeLight: "Light",
  themeDark: "Dark",
  footer: "Everything runs in your browser. Nothing is sent anywhere.",
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
  // The modules missing between the first and the last lesson; the list reads "2 and 3".
  toWriteOne: (n: number) => `Module ${n} is still to be written.`,
  toWriteMany: (modules: readonly number[]) =>
    `Modules ${joinNumbers(modules)} are still to be written.`,
  progress: (passed: number, total: number) => `${passed} of ${total} challenges complete`,
  missing: (path: string) => `There is no page at ${path}.`,
  noLesson: (id: string) => `There is no lesson called ${id}.`,
  backToLessons: "Back to the lessons",
};
