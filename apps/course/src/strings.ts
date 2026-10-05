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
