import { LessonStore, verifyCompletion, type Book, type Storage } from "@dd/lesson-runtime";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";

export function LessonList({ book, storage }: { book: Book; storage: Storage }) {
  const byModule = new Map<number, typeof book.lessons>();
  for (const l of book.lessons) byModule.set(l.module, [...(byModule.get(l.module) ?? []), l]);
  // The module numbers missing between the first and the last lesson, so the page says which
  // modules are still to be written instead of leaving a gap the reader has to explain.
  const present = [...byModule.keys()].sort((a, b) => a - b);
  const first = present[0];
  const last = present[present.length - 1];
  const toWrite: number[] = [];
  if (first !== undefined && last !== undefined)
    for (let m = first; m <= last; m++) if (!byModule.has(m)) toWrite.push(m);
  return (
    <>
      <h1>{book.title}</h1>
      <p className="course-assumes">{STRINGS.assumes}</p>
      <p className="course-start">
        <a href={PREFACE_HREF}>{STRINGS.prefaceLink}</a>
      </p>
      {book.lessons.length === 0 && <p>{STRINGS.noLessons}</p>}
      {toWrite.length > 0 && (
        <p className="meta to-write">
          {toWrite.length === 1 ? STRINGS.toWriteOne(toWrite[0]!) : STRINGS.toWriteMany(toWrite)}
        </p>
      )}
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
                    <span className="lesson-link-title">{lesson.title}</span>
                    <span className="meta">
                      {completion.total > 0
                        ? STRINGS.progress(completion.passed, completion.total)
                        : STRINGS.noChallenges}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
