// The course's lessons, in order. Each lesson is a module in this directory; adding one here is
// what publishes it. Every lesson is parsed when the app starts, so an invalid lesson fails fast
// with its problems listed, and the content tests parse the same list.

import { parseLesson, type Lesson, type LessonInput } from "@dd/lesson-schema";

const INPUTS: readonly LessonInput[] = [];

export const LESSONS: readonly Lesson[] = INPUTS.map(parseLesson).sort(
  (a, b) => a.module - b.module || a.order - b.order,
);

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
