// Copyright © 2026 Christopher Snow

// The course's front page: the cover (what the course is, where to start or go on, and how the
// machine it builds runs a step), then every module the plan has, in order, each with its lessons
// or the line that says it is still to be written. The way in comes before the machine: the
// machine's parts are built across the modules out of reading order, and a reader who meets them
// first asks where to start (the author, 6 October 2026). Each module's lessons show when its line
// is pressed, the module of the lesson the way in names already open.

import { useState } from "react";

import { LessonStore, verifyCompletion, type Book, type Storage } from "@dd/lesson-runtime";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";

type Lesson = Book["lessons"][number];

/**
 * The machine the course builds, as the flow of one step of a program, part by part
 * (`docs/machine.md`): the PC and the next step's choice, the ROM, the decoder, then the register
 * file, the ALU, and the RAM with the devices. No part names its modules: the list below gives the
 * order to read them in.
 */
type FlowPart = "next" | "program" | "reading" | "numbers" | "arithmetic" | "memory";

function MachineFlow() {
  const words = STRINGS.cover.flow;
  const part = (key: FlowPart) => (
    <li className="flow-part" key={key}>
      <span className="flow-name">{words[key]}</span>
    </li>
  );
  return (
    <figure className="cover-machine">
      {/* Above the boxes, as a lesson's captions are: what the picture is, before it is read. */}
      <figcaption>{STRINGS.cover.machine}</figcaption>
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
  // The page lists every module, each one line until it is pressed; the module of the lesson the
  // button above names starts open (the author: the page had grown long with every lesson shown).
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set(next ? [next.module] : []));
  const toggle = (module: number) =>
    setOpen((was) => {
      const now = new Set(was);
      if (!now.delete(module)) now.add(module);
      return now;
    });
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
        <MachineFlow />
      </div>
      {book.lessons.length === 0 && <p>{STRINGS.noLessons}</p>}
      <h2 className="contents-heading">{STRINGS.cover.contents(modules.length)}</h2>
      {modules.map((module) => {
        const lessons = byModule.get(module) ?? [];
        const name = STRINGS.moduleNames[module];
        const heading = name ? `${STRINGS.module(module)}: ${name}` : STRINGS.module(module);
        if (lessons.length === 0)
          return (
            <section
              key={module}
              className="module module-to-write"
              aria-labelledby={`module-${module}`}
            >
              <h3 id={`module-${module}`}>{heading}</h3>
              <p className="meta">{STRINGS.cover.toWrite}</p>
            </section>
          );
        const isOpen = open.has(module);
        const counts = lessons.map((l) => completion.get(l.id));
        const passed = counts.reduce((n, c) => n + (c?.passed ?? 0), 0);
        const total = counts.reduce((n, c) => n + (c?.total ?? 0), 0);
        return (
          <section key={module} className="module" aria-labelledby={`module-${module}`}>
            <h3>
              <button
                type="button"
                className="module-toggle"
                aria-expanded={isOpen}
                aria-controls={`module-${module}-lessons`}
                onClick={() => toggle(module)}
              >
                <span className="module-chevron" aria-hidden="true" />
                <span className="module-name" id={`module-${module}`}>
                  {heading}
                </span>
                <span className="meta">
                  {STRINGS.cover.moduleSummary(lessons.length, passed, total)}
                </span>
              </button>
            </h3>
            <ol id={`module-${module}-lessons`} className="lesson-list" hidden={!isOpen}>
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
          </section>
        );
      })}
    </>
  );
}
