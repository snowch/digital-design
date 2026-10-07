// Copyright © 2026 Christopher Snow

// The course's front page: the cover, then every module the plan has, in order, each with its
// lessons or the line that says it is still to be written. The cover says what the course is and
// where to start or go on, beside a real circuit from Module 2 that the reader can press, and then
// shows the path through the course in reading order, so the way in is never a puzzle (the author,
// 6 October 2026: a reader who met the machine's parts by module asked where Module 1 was).
// Each module's lessons show when its line is pressed, the module of the lesson the way in names,
// and of the lesson just left, already open (the author: the page had grown long).

import { useMemo, useState, type ReactNode } from "react";

import { libraryCircuit, placed } from "@dd/dd-model";
import { CircuitView, useSettleSim } from "@dd/dd-views";
import { LessonStore, verifyCompletion, type Book, type Storage } from "@platform/lesson-runtime";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";

type Lesson = Book["lessons"][number];

/**
 * Module 2's freezer-room alarm, live: warm with the door shut, so the lamp is lit at first. Placed
 * closer than the gates lesson places it, so the whole circuit, lamp and all, fits a phone without
 * shrinking its words.
 */
function HeroCircuit() {
  const circuit = useMemo(
    () =>
      placed(libraryCircuit("alarm"), {
        "in:WARM": [0, 1],
        "in:DOOR": [0, 5],
        notDoor: [4, 5],
        andAlarm: [8, 1],
        "out:ALARM": [12, 1],
      }),
    [],
  );
  const sim = useSettleSim(circuit, { WARM: 1, DOOR: 0 });
  return (
    <figure className="hero-circuit">
      <CircuitView
        circuit={circuit}
        values={sim.values}
        title={STRINGS.cover.heroTitle}
        onToggleInput={(name) => sim.toggle(name)}
        table={false}
      />
      <figcaption>{STRINGS.cover.heroCaption}</figcaption>
    </figure>
  );
}

/** A small mark for each stage of the path, drawn in the stage's colour. */
const STAGE_ICONS: readonly ReactNode[] = [
  // Signals: an AND symbol with its two inputs and its output.
  <path key="s" d="M3 9h3M3 15h3M6 6h5a6 6 0 0 1 0 12H6zM17 12h4" />,
  // Memory: three stored words, one above another.
  <path key="m" d="M5 4h14v4H5zM5 10h14v4H5zM5 16h14v4H5z" />,
  // The machine: a part with pins on every side.
  <path key="c" d="M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />,
  // Programs: lines of text.
  <path key="p" d="M8 7l-4 5 4 5M16 7l4 5-4 5M13.5 5l-3 14" />,
  // The whole machine: a screen on its stand.
  <path key="w" d="M3 4h18v12H3zM8 20h8M12 16v4" />,
];

function Journey({ written }: { written: (module: number) => boolean }) {
  return (
    <section className="journey" aria-labelledby="journey-heading">
      <h2 id="journey-heading">{STRINGS.cover.journeyHeading}</h2>
      <ol className="journey-stages">
        {STRINGS.cover.stages.map((stage, i) => {
          const modules = Array.from(
            { length: stage.to - stage.from + 1 },
            (_, k) => stage.from + k,
          );
          const toWrite = !modules.some(written);
          return (
            <li key={stage.name} className={`journey-stage${toWrite ? " stage-to-write" : ""}`}>
              <span className={`stage-icon stage-${i + 1}`} aria-hidden="true">
                <svg viewBox="0 0 24 24">{STAGE_ICONS[i]}</svg>
              </span>
              <span className="stage-text">
                <span className="stage-name">{stage.name}</span>
                <span className="stage-modules">
                  {STRINGS.cover.stageModules(stage.from, stage.to)}
                </span>
                <span className="stage-about">{stage.about}</span>
                {toWrite && <span className="stage-status">{STRINGS.cover.stageToWrite}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function LessonList({
  book,
  storage,
  from,
}: {
  book: Book;
  storage: Storage;
  /** The lesson the reader has just left, whose module opens too. */
  from?: string;
}) {
  const ordered = [...book.lessons].sort((a, b) => a.module - b.module || a.order - b.order);
  const completion = new Map(
    ordered.map((l) => [
      l.id,
      verifyCompletion(book, l, new LessonStore(storage, book.id, l.id).get()),
    ]),
  );
  // A reader who has passed a challenge goes on from the furthest lesson in which they have passed
  // one, to the first lesson from there not finished; a new reader starts at the first lesson.
  // Module 0 came after some readers began: one who was in Module 3 goes on in Module 3, not back
  // to Module 0, which the list still shows unfinished. Only when every lesson from there on is
  // finished does the way in go back to the first one not finished.
  const furthest = ordered.reduce(
    (at, l, i) => ((completion.get(l.id)?.passed ?? 0) > 0 ? i : at),
    -1,
  );
  const notFinished = (l: Lesson) => {
    const c = completion.get(l.id);
    return c !== undefined && c.total > 0 && c.passed < c.total;
  };
  const unfinished =
    ordered.slice(Math.max(0, furthest)).find(notFinished) ?? ordered.find(notFinished);
  const started = furthest >= 0;
  const next: Lesson | undefined = started ? (unfinished ?? ordered[0]) : ordered[0];
  // The page lists every module, each one line until it is pressed; the module of the lesson the
  // button above names starts open, and so does the module of the lesson the reader has just left
  // (the author: the page had grown long with every lesson shown).
  const [open, setOpen] = useState<ReadonlySet<number>>(() => {
    const left = book.lessons.find((l) => l.id === from)?.module;
    return new Set([next?.module, left].filter((m): m is number => m !== undefined));
  });
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
  // "Digital Design: From Bits to a Working Computer", set as a name and a line under it.
  const [titleMain, titleSub] = book.title.includes(": ")
    ? [
        `${book.title.slice(0, book.title.indexOf(": ") + 1)}`,
        book.title.slice(book.title.indexOf(": ") + 2),
      ]
    : [book.title, ""];
  return (
    <>
      <section className="cover-hero" aria-labelledby="course-title">
        <svg
          className="hero-traces"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M380 0v60h80v70h140M440 300v-90h-60v-50h-90M600 40h-70v60h-60M520 300v-40h80" />
        </svg>
        <div className="hero-text">
          <h1 id="course-title">
            {titleMain}
            {titleSub && <span className="hero-title-sub">{titleSub}</span>}
          </h1>
          <p className="cover-tagline">{STRINGS.cover.tagline}</p>
          <p className="cover-lead">{STRINGS.cover.lead}</p>
          {next && (
            <p className="cover-start">
              <a
                className="hero-start"
                href={lessonHref(next.id)}
                aria-label={
                  started && unfinished
                    ? STRINGS.cover.continueWith(next.module, next.title)
                    : STRINGS.preface.start(next.module, next.title)
                }
              >
                <span className="hero-start-arrow" aria-hidden="true">
                  {"\u2192"}
                </span>
                <span className="hero-start-text">
                  <strong>
                    {started && unfinished
                      ? STRINGS.cover.continueLine(next.module)
                      : STRINGS.cover.startLine(next.module)}
                  </strong>
                  <span>{next.title}</span>
                </span>
              </a>
            </p>
          )}
          <p className="course-assumes">{STRINGS.assumes}</p>
          <p className="course-start">
            <a href={PREFACE_HREF}>{STRINGS.prefaceLink}</a>
          </p>
        </div>
        <HeroCircuit />
      </section>
      <Journey written={(m) => byModule.has(m)} />
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
