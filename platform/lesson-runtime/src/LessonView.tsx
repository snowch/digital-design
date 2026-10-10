// Copyright © 2026 Christopher Snow

// A lesson, rendered from its data: the header, the ten sections with their interactives, the
// model note and the model-versus-reality note. Interactives come from the book's registry by
// kind; the `challenge` kind is the runtime's own.

import { useState } from "react";

import type { Interactive, Lesson } from "@platform/lesson-schema";
import { NO_MODEL, timeModelsUsed } from "@platform/lesson-schema";

import type { Book } from "./book";
import { Boundary } from "./Boundary";
import { ChallengeRunner } from "./ChallengeRunner";
import { Prose } from "./Prose";
import { StringsContext, useStrings } from "./StringsContext";
import { useLessonStore, type LessonStore, type Storage } from "./state";
import { DEFAULT_STRINGS, format, type Strings } from "./strings";

export interface LessonViewProps {
  readonly book: Book;
  readonly lesson: Lesson;
  readonly storage: Storage;
  /** Where a lesson id links to, for the prerequisites list. */
  readonly lessonHref?: (lessonId: string) => string;
  readonly strings?: Strings;
}

function InteractiveFigure({
  book,
  lesson,
  interactive,
  store,
}: {
  book: Book;
  lesson: Lesson;
  interactive: Interactive;
  store: LessonStore;
}) {
  const strings = useStrings();
  let body: React.ReactNode;
  if (interactive.kind === "challenge") {
    const id = interactive.props["challengeId"];
    const challenge = lesson.challenges.find((c) => c.id === id);
    body = challenge ? (
      <ChallengeRunner book={book} lesson={lesson} challenge={challenge} store={store} />
    ) : (
      <p role="note">
        {format(strings.lesson.unknownInteractive, { kind: `challenge ${String(id)}` })}
      </p>
    );
  } else {
    const View = book.interactives[interactive.kind];
    body = View ? (
      <View lesson={lesson} interactive={interactive} store={store} />
    ) : (
      <p role="note" className="interactive-missing">
        {format(strings.lesson.unknownInteractive, { kind: interactive.kind })}
      </p>
    );
  }
  // A badge only on a figure that runs the simulator: it names the rules that made what the
  // figure shows, and opens that model's note where the reader is, not at the foot of the page.
  // A figure that runs nothing gets no badge: a label saying what a figure is not tells nothing.
  // A figure that declares a role (what it asks of the reader) is badged by the role instead, and
  // its note is the role's alone: the model's note is stated once, at the foot of the lesson, not
  // again in every badge. A role with no note gets a badge that opens nothing.
  const simulated = interactive.timeModel !== NO_MODEL;
  const role = interactive.role;
  const badge =
    role !== undefined
      ? (strings.lesson.role[role] ?? role)
      : (strings.lesson.timeModel[interactive.timeModel] ?? interactive.timeModel);
  const note =
    (role !== undefined
      ? book.roleNotes?.[role]
      : simulated
        ? book.timeModelNotes[interactive.timeModel as keyof Book["timeModelNotes"]]
        : undefined) || undefined;
  const badged = simulated || role !== undefined;
  const [noteOpen, setNoteOpen] = useState(false);
  const noteId = `ix-${interactive.id}-model`;
  return (
    <figure
      className="interactive"
      id={`ix-${interactive.id}`}
      data-kind={interactive.kind}
      data-time-model={interactive.timeModel}
      data-role={role}
    >
      {interactive.lead && <Prose markdown={interactive.lead} className="figure-lead" />}
      <figcaption>
        {badged &&
          (note !== undefined ? (
            <button
              type="button"
              className="time-model-toggle"
              aria-expanded={noteOpen}
              aria-controls={noteId}
              aria-label={
                role !== undefined
                  ? format(strings.lesson.roleBadgeLabel, { role: badge })
                  : format(strings.lesson.badgeLabel, { model: badge })
              }
              onClick={() => setNoteOpen((open) => !open)}
            >
              <span className="badge time-model">
                {badge}
                <span className="badge-mark" aria-hidden="true" />
              </span>
            </button>
          ) : (
            <span className="badge time-model">{badge}</span>
          ))}{" "}
        {interactive.caption}
        {note !== undefined && (
          <div id={noteId} className="time-model-note" hidden={!noteOpen}>
            <Prose markdown={note} />
          </div>
        )}
      </figcaption>
      {/* A figure that throws shows its error where it would have been; the lesson around it stands. */}
      <Boundary
        fallback={(message) => (
          <p role="note" className="interactive-problem">
            {format(strings.lesson.brokenInteractive, { kind: interactive.kind, message })}
          </p>
        )}
      >
        {body}
      </Boundary>
      {interactive.after && <Prose markdown={interactive.after} className="figure-after" />}
    </figure>
  );
}

function LessonBody({ book, lesson, storage, lessonHref }: Omit<LessonViewProps, "strings">) {
  const strings = useStrings();
  const store = useLessonStore(storage, book.id, lesson.id);
  const models = timeModelsUsed(lesson);
  // The note on each model the lesson's figures run, once, at its foot. A book that explains its
  // model in the lessons' own prose gives no note for it, and then the heading goes too.
  const modelNotes = models.flatMap((model) => {
    const note = book.timeModelNotes[model as keyof Book["timeModelNotes"]];
    return note ? [{ model, note }] : [];
  });
  const byId = new Map(book.lessons.map((l) => [l.id, l]));
  return (
    <article className="lesson" aria-labelledby="lesson-title" data-lesson={lesson.id}>
      <header className="lesson-header">
        <h1 id="lesson-title">{lesson.title}</h1>
        <section className="lesson-objectives" aria-labelledby="lesson-objectives">
          <h2 id="lesson-objectives">{strings.lesson.objectives}</h2>
          <ul>
            {lesson.objectives.map((o) => (
              <li key={o}>
                <Prose markdown={o} inline />
              </li>
            ))}
          </ul>
        </section>
        {lesson.prerequisites.length > 0 && (
          <section className="lesson-prerequisites" aria-labelledby="lesson-prerequisites">
            <h2 id="lesson-prerequisites">{strings.lesson.prerequisites}</h2>
            <ul>
              {lesson.prerequisites.map((id) => (
                <li key={id}>
                  {lessonHref ? (
                    <a href={lessonHref(id)}>{byId.get(id)?.title ?? id}</a>
                  ) : (
                    (byId.get(id)?.title ?? id)
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </header>
      {lesson.sections.map((section) => {
        const headingId = `section-${section.kind}`;
        return (
          <section
            key={section.kind}
            className="lesson-section"
            data-kind={section.kind}
            aria-labelledby={headingId}
          >
            <h2 id={headingId}>
              <span className="section-kind">{strings.section[section.kind] ?? section.kind}</span>
              <span className="section-title">{section.title}</span>
            </h2>
            {section.prose && <Prose markdown={section.prose} />}
            {section.details && (
              <details className="lesson-details">
                <summary>{section.details.summary}</summary>
                <Prose markdown={section.details.prose} />
              </details>
            )}
            {section.interactives.map((x) => (
              <InteractiveFigure
                key={x.id}
                book={book}
                lesson={lesson}
                interactive={x}
                store={store}
              />
            ))}
          </section>
        );
      })}
      {modelNotes.length > 0 && (
        <aside className="lesson-model-note" aria-labelledby="lesson-model-note">
          <h2 id="lesson-model-note">{strings.lesson.modelNote}</h2>
          {modelNotes.map(({ model, note }) => (
            <Prose key={model} markdown={note} />
          ))}
        </aside>
      )}
      <aside className="lesson-model-vs-reality" aria-labelledby="lesson-model-vs-reality">
        <h2 id="lesson-model-vs-reality">
          {models.length > 0
            ? strings.lesson.modelVsReality
            : strings.lesson.modelVsRealityNoSimulator}
        </h2>
        <Prose markdown={lesson.modelVsReality} />
      </aside>
    </article>
  );
}

export function LessonView(props: LessonViewProps) {
  const { strings = DEFAULT_STRINGS, ...rest } = props;
  return (
    <StringsContext.Provider value={strings}>
      <LessonBody {...rest} />
    </StringsContext.Provider>
  );
}
