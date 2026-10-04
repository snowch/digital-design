import { LessonStore, verifyCompletion, type Book, type Storage } from "@dd/lesson-runtime";

import { lessonHref } from "../route";
import { STRINGS } from "../strings";

export function LessonList({ book, storage }: { book: Book; storage: Storage }) {
  const byModule = new Map<number, typeof book.lessons>();
  for (const l of book.lessons) byModule.set(l.module, [...(byModule.get(l.module) ?? []), l]);
  return (
    <>
      <h1>{book.title}</h1>
      {book.lessons.length === 0 && <p>{STRINGS.noLessons}</p>}
      {[...byModule.entries()].map(([module, lessons]) => (
        <section key={module} aria-labelledby={`module-${module}`}>
          <h2 id={`module-${module}`}>{STRINGS.module(module)}</h2>
          <ol className="lesson-list">
            {lessons.map((lesson) => {
              const completion = verifyCompletion(
                book,
                lesson,
                new LessonStore(storage, book.id, lesson.id).get(),
              );
              return (
                <li key={lesson.id}>
                  <a href={lessonHref(lesson.id)} className="lesson-link">
                    {lesson.title}
                  </a>
                  <p className="meta">
                    {completion.total > 0
                      ? STRINGS.progress(completion.passed, completion.total)
                      : STRINGS.noChallenges}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
