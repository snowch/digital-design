// Copyright © 2026 Christopher Snow

// The course's front page: the cover (what the course is, how the machine it builds runs a step,
// where to start or go on), then every module the plan has, in order, each with its lessons or the line that says it
// is still to be written.

import { LessonStore, verifyCompletion, type Book, type Storage } from "@dd/lesson-runtime";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";

type Lesson = Book["lessons"][number];

/**
 * The machine the course builds, as the flow of one step of a program: each part, and under it the
 * modules that build it (`docs/machine.md`; the term each part's lesson introduces is in brackets).
 */
export const MACHINE_PARTS = {
  // The program counter (Module 8, fetch) is a register (Module 5); the next step's choice is
  // Module 8's (branches).
  next: [5, 8],
  // The ROM (Module 6, memory-map).
  program: [6],
  // The decoder Module 8 draws closed and Module 9 opens.
  reading: [9],
  // The register file (Module 6).
  numbers: [6],
  // The ALU (Module 3, alu; Module 7).
  arithmetic: [3, 7],
  // The RAM and the devices at addresses (Module 6, ram and memory-map).
  memory: [6],
} as const;

function MachineFlow() {
  const words = STRINGS.cover.flow;
  const part = (key: keyof typeof MACHINE_PARTS) => (
    <li className="flow-part" key={key}>
      <span className="flow-name">{words[key]}</span>
      <span className="flow-modules">{STRINGS.cover.builtIn(MACHINE_PARTS[key])}</span>
    </li>
  );
  return (
    <figure className="cover-machine">
      <ol className="machine-flow">
        {part("next")}
        {part("program")}
        {part("reading")}
        <li className="flow-group">
          <span className="flow-group-name">{words.doing}</span>
          <ul>
            {part("numbers")}
            {part("arithmetic")}
            {part("memory")}
          </ul>
        </li>
      </ol>
      <p className="flow-back">{words.back}</p>
      <figcaption>{STRINGS.cover.machine}</figcaption>
    </figure>
  );
}

export function LessonList({ book, storage }: { book: Book; storage: Storage }) {
  const ordered = [...book.lessons].sort((a, b) => a.module - b.module || a.order - b.order);
  const completion = new Map(
    ordered.map((l) => [
      l.id,
      verifyCompletion(book, l, new LessonStore(storage, book.id, l.id).get()),
    ]),
  );
  // A reader who has passed a challenge goes on from the first lesson not finished; a new reader
  // starts at the first lesson.
  const started = ordered.some((l) => (completion.get(l.id)?.passed ?? 0) > 0);
  const unfinished = ordered.find((l) => {
    const c = completion.get(l.id);
    return c !== undefined && c.total > 0 && c.passed < c.total;
  });
  const next: Lesson | undefined = started ? (unfinished ?? ordered[0]) : ordered[0];
  const byModule = new Map<number, Lesson[]>();
  for (const l of ordered) byModule.set(l.module, [...(byModule.get(l.module) ?? []), l]);
  // Every module the plan has, and any other a lesson names.
  const modules = [...new Set([...STRINGS.moduleNames.keys(), ...byModule.keys()])].sort(
    (a, b) => a - b,
  );
  return (
    <>
      <div className="cover">
        <h1>{book.title}</h1>
        <p className="cover-lead">{STRINGS.cover.lead}</p>
        <MachineFlow />
        {next && (
          <p className="cover-start">
            <a className="button primary" href={lessonHref(next.id)}>
              {started && unfinished
                ? STRINGS.cover.continueWith(next.module, next.title)
                : STRINGS.preface.start(next.module, next.title)}
            </a>
          </p>
        )}
        <p className="course-assumes">{STRINGS.assumes}</p>
        <p className="course-start">
          <a href={PREFACE_HREF}>{STRINGS.prefaceLink}</a>
        </p>
      </div>
      {book.lessons.length === 0 && <p>{STRINGS.noLessons}</p>}
      <h2 className="contents-heading">{STRINGS.cover.contents(modules.length)}</h2>
      {modules.map((module) => {
        const lessons = byModule.get(module) ?? [];
        const name = STRINGS.moduleNames[module];
        return (
          <section
            key={module}
            className={`module${lessons.length ? "" : " module-to-write"}`}
            aria-labelledby={`module-${module}`}
          >
            <h3 id={`module-${module}`}>
              {name ? `${STRINGS.module(module)}: ${name}` : STRINGS.module(module)}
            </h3>
            {lessons.length === 0 ? (
              <p className="meta">{STRINGS.cover.toWrite}</p>
            ) : (
              <ol className="lesson-list">
                {lessons.map((lesson) => {
                  const c = completion.get(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <a href={lessonHref(lesson.id)} className="lesson-link">
                        <span className="lesson-link-title">{lesson.title}</span>
                        <span className="meta">
                          {c && c.total > 0
                            ? STRINGS.progress(c.passed, c.total)
                            : STRINGS.noChallenges}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </>
  );
}
