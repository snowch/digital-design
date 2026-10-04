// The shell's own words. Drafted by the prose process; see CLAUDE.md.

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
  module: (n: number) => `Module ${n}`,
  progress: (passed: number, total: number) => `${passed} of ${total} challenges complete`,
  missing: (path: string) => `There is no page at ${path}.`,
  noLesson: (id: string) => `There is no lesson called ${id}.`,
  backToLessons: "Back to the lessons",
};
