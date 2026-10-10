// Copyright © 2026 Christopher Snow

// The course's front page: the cover, then every module the plan has, in order, each with its
// lessons or the line that says it is still to be written. The cover says what the course is and
// where to start or go on, beside a real circuit from Module 2 that the reader can press, and then
// shows the path through the course in reading order, so the way in is never a puzzle (the author,
// 6 October 2026: a reader who met the machine's parts by module asked where Module 1 was).
// Each module's lessons show when its line is pressed, the module of the lesson the way in names,
// and of the lesson just left, already open (the author: the page had grown long). The modules sit
// inside the five stages, each stage one line until it is pressed, the stage of an open module open
// too (the author, 10 October 2026: the stages named their modules, and the list under them named
// them again). Module 0 comes before the stages, as the path's opening line says, in a line of the
// stages' own form, its mark, its number and what you do in it (the author: a bare module heading
// above the stages looked out of place).

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

/** Module 0's mark, before the stages: a glass, for looking inside a finished machine. */
const OPENING_ICON: ReactNode = <path d="M10.5 4.5a6 6 0 1 0 0 12a6 6 0 0 0 0-12zM15 15l5 5" />;

/** A module's lessons, each a link with its challenges complete. */
function LessonCards({
  lessons,
  completion,
  id,
  hidden,
}: {
  lessons: readonly Lesson[];
  completion: ReadonlyMap<string, { passed: number; total: number }>;
  id?: string;
  hidden?: boolean;
}) {
  return (
    <ol id={id} className="lesson-list" hidden={hidden}>
      {lessons.map((lesson) => {
        const c = completion.get(lesson.id);
        return (
          <li key={lesson.id}>
            <a href={lessonHref(lesson.id)} className="lesson-link">
              <span className="lesson-link-title">{lesson.title}</span>
              <span className="meta">
                {c && c.total > 0 ? STRINGS.progress(c.passed, c.total) : STRINGS.noChallenges}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A line of the path, which shows what it holds when pressed: a stage and its modules, or Module 0,
 * before the stages, and its lessons. Beside its mark, its name, the modules it covers and its
 * progress; under them, what you do in it.
 */
function PathLine({
  id,
  listId,
  mark,
  markClass,
  name,
  range,
  status,
  about,
  numberFirst = false,
  isOpen,
  onToggle,
  children,
}: {
  /** The prefix of the ids of the line's name, range and status. */
  id: string;
  /** The id of what the line shows when pressed. */
  listId: string;
  mark: ReactNode;
  markClass: string;
  name: string;
  range: string;
  status: string;
  about?: string;
  /** Read out by its number first, as a module is; a stage is read out by its name first. */
  numberFirst?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const parts = numberFirst ? ["range", "name", "status"] : ["name", "range", "status"];
  return (
    <>
      <h3 className="stage-heading">
        <button
          type="button"
          className="stage-toggle"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-labelledby={parts.map((p) => `${id}-${p}`).join(" ")}
          onClick={onToggle}
        >
          <span className="module-chevron" aria-hidden="true" />
          <span className={`stage-icon ${markClass}`} aria-hidden="true">
            <svg viewBox="0 0 24 24">{mark}</svg>
          </span>
          <span className="stage-text">
            <span className="stage-name" id={`${id}-name`}>
              {name}
            </span>
            <span className="stage-modules" id={`${id}-range`}>
              {range}
            </span>
            <span className="stage-status" id={`${id}-status`}>
              {status}
            </span>
          </span>
        </button>
      </h3>
      {about && <p className="stage-about">{about}</p>}
      <div id={listId} className="stage-list" hidden={!isOpen}>
        {children}
      </div>
    </>
  );
}

/**
 * A module's line inside its stage, which shows its lessons when pressed; a module still to be
 * written has none.
 */
function ModuleRow({
  module,
  lessons,
  isOpen,
  onToggle,
  completion,
}: {
  module: number;
  lessons: readonly Lesson[];
  isOpen: boolean;
  onToggle: () => void;
  completion: ReadonlyMap<string, { passed: number; total: number }>;
}) {
  const name = STRINGS.moduleNames[module];
  const heading = name ? `${STRINGS.module(module)}: ${name}` : STRINGS.module(module);
  if (lessons.length === 0)
    return (
      <section className="module module-to-write" aria-labelledby={`module-${module}`}>
        <h4 id={`module-${module}`}>{heading}</h4>
        <p className="meta">{STRINGS.cover.toWrite}</p>
      </section>
    );
  const counts = lessons.map((l) => completion.get(l.id));
  const passed = counts.reduce((n, c) => n + (c?.passed ?? 0), 0);
  const total = counts.reduce((n, c) => n + (c?.total ?? 0), 0);
  return (
    <section className="module" aria-labelledby={`module-${module}`}>
      <h4>
        <button
          type="button"
          className="module-toggle"
          aria-expanded={isOpen}
          aria-controls={`module-${module}-lessons`}
          aria-labelledby={`module-${module} module-${module}-summary`}
          onClick={onToggle}
        >
          <span className="module-chevron" aria-hidden="true" />
          <span className="module-name" id={`module-${module}`}>
            {heading}
          </span>
          <span className="meta" id={`module-${module}-summary`}>
            {STRINGS.cover.moduleSummary(lessons.length, passed, total)}
          </span>
        </button>
      </h4>
      <LessonCards
        id={`module-${module}-lessons`}
        lessons={lessons}
        completion={completion}
        hidden={!isOpen}
      />
    </section>
  );
}

/** The modules of a stage, in order. */
const stageModules = (stage: { from: number; to: number }) =>
  Array.from({ length: stage.to - stage.from + 1 }, (_, k) => stage.from + k);

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
  // A stage starts open when it holds a module that starts open; Module 0 is in no stage.
  const [openStages, setOpenStages] = useState<ReadonlySet<number>>(
    () =>
      new Set(
        STRINGS.cover.stages.flatMap((stage, i) =>
          stageModules(stage).some((m) => open.has(m)) ? [i] : [],
        ),
      ),
  );
  const toggleStage = (i: number) =>
    setOpenStages((was) => {
      const now = new Set(was);
      if (!now.delete(i)) now.add(i);
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
      <section className="journey" aria-labelledby="journey-heading">
        <h2 id="journey-heading">{STRINGS.cover.journeyHeading}</h2>
        <p className="journey-intro">{STRINGS.cover.journeyIntro}</p>
        {book.lessons.length === 0 && <p>{STRINGS.noLessons}</p>}
        {/* Module 0, and any module in no stage, as a line of the path's own form. */}
        {modules
          .filter((m) => !STRINGS.cover.stages.some((s) => m >= s.from && m <= s.to))
          .map((m) => {
            const lessons = byModule.get(m) ?? [];
            const name = STRINGS.moduleNames[m];
            const counts = lessons.map((l) => completion.get(l.id));
            const passed = counts.reduce((n, c) => n + (c?.passed ?? 0), 0);
            const total = counts.reduce((n, c) => n + (c?.total ?? 0), 0);
            return (
              <section
                key={m}
                className={`journey-stage journey-opening${lessons.length === 0 ? " stage-to-write" : ""}`}
                aria-label={name ? `${STRINGS.module(m)}: ${name}` : STRINGS.module(m)}
              >
                <PathLine
                  id={`module-${m}`}
                  listId={`module-${m}-lessons`}
                  mark={OPENING_ICON}
                  markClass="stage-0"
                  name={name ?? STRINGS.module(m)}
                  range={STRINGS.module(m)}
                  status={
                    lessons.length === 0
                      ? STRINGS.cover.stageToWrite
                      : STRINGS.cover.moduleSummary(lessons.length, passed, total)
                  }
                  about={m === 0 ? STRINGS.cover.openingAbout : undefined}
                  numberFirst
                  isOpen={open.has(m)}
                  onToggle={() => toggle(m)}
                >
                  {lessons.length === 0 ? (
                    <p className="meta">{STRINGS.cover.toWrite}</p>
                  ) : (
                    <LessonCards lessons={lessons} completion={completion} />
                  )}
                </PathLine>
              </section>
            );
          })}
        <ol className="journey-stages">
          {STRINGS.cover.stages.map((stage, i) => {
            const inStage = stageModules(stage);
            const toWrite = !inStage.some((m) => byModule.has(m));
            const counts = inStage.flatMap((m) =>
              (byModule.get(m) ?? []).map((l) => completion.get(l.id)),
            );
            const passed = counts.reduce((n, c) => n + (c?.passed ?? 0), 0);
            const total = counts.reduce((n, c) => n + (c?.total ?? 0), 0);
            return (
              <li key={stage.name} className={`journey-stage${toWrite ? " stage-to-write" : ""}`}>
                <PathLine
                  id={`stage-${i + 1}`}
                  listId={`stage-${i + 1}-modules`}
                  mark={STAGE_ICONS[i]}
                  markClass={`stage-${i + 1}`}
                  name={stage.name}
                  range={STRINGS.cover.stageModules(stage.from, stage.to)}
                  status={toWrite ? STRINGS.cover.stageToWrite : STRINGS.progress(passed, total)}
                  about={stage.about}
                  isOpen={openStages.has(i)}
                  onToggle={() => toggleStage(i)}
                >
                  {inStage.map((m) => (
                    <ModuleRow
                      key={m}
                      module={m}
                      lessons={byModule.get(m) ?? []}
                      isOpen={open.has(m)}
                      onToggle={() => toggle(m)}
                      completion={completion}
                    />
                  ))}
                </PathLine>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
