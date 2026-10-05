// A lesson, rendered from its data: the header, the ten sections with their interactives, the
// model note and the model-versus-reality note. Interactives come from the book's registry by
// kind; the `challenge` kind is the runtime's own.

import { Component, useState, type ErrorInfo, type ReactNode } from "react";

import type { Interactive, Lesson } from "@dd/lesson-schema";
import { timeModelsUsed } from "@dd/lesson-schema";

import type { Book } from "./book";
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

/** A figure that throws shows its error where it would have been; the lesson around it stands. */
class FigureBoundary extends Component<
  { children: ReactNode; fallback: (message: string) => ReactNode },
  { error?: string }
> {
  override state: { error?: string } = {};
  static getDerivedStateFromError(error: unknown): { error: string } {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  override componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // The message is already on the page.
  }
  override render(): ReactNode {
    return this.state.error !== undefined
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
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
  const simulated = interactive.timeModel !== "none";
  const badge = strings.lesson.timeModel[interactive.timeModel] ?? interactive.timeModel;
  const note = simulated
    ? book.timeModelNotes[interactive.timeModel as keyof Book["timeModelNotes"]]
    : undefined;
  const [noteOpen, setNoteOpen] = useState(false);
  const noteId = `ix-${interactive.id}-model`;
  return (
    <figure
      className="interactive"
      id={`ix-${interactive.id}`}
      data-kind={interactive.kind}
      data-time-model={interactive.timeModel}
    >
      {interactive.lead && <Prose markdown={interactive.lead} className="figure-lead" />}
      <figcaption>
        {simulated &&
          (note !== undefined ? (
            <button
              type="button"
              className="time-model-toggle"
              aria-expanded={noteOpen}
              aria-controls={noteId}
              aria-label={format(strings.lesson.badgeLabel, { model: badge })}
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
      <FigureBoundary
        fallback={(message) => (
          <p role="note" className="interactive-problem">
            {format(strings.lesson.brokenInteractive, { kind: interactive.kind, message })}
          </p>
        )}
      >
        {body}
      </FigureBoundary>
      {interactive.after && <Prose markdown={interactive.after} className="figure-after" />}
    </figure>
  );
}

function LessonBody({ book, lesson, storage, lessonHref }: Omit<LessonViewProps, "strings">) {
  const strings = useStrings();
  const store = useLessonStore(storage, book.id, lesson.id);
  const models = timeModelsUsed(lesson);
  const byId = new Map(book.lessons.map((l) => [l.id, l]));
  return (
    <article className="lesson" aria-labelledby="lesson-title" data-lesson={lesson.id}>
      <header className="lesson-header">
        <h1 id="lesson-title">{lesson.title}</h1>
        <section className="lesson-objectives" aria-labelledby="lesson-objectives">
          <h2 id="lesson-objectives">{strings.lesson.objectives}</h2>
          <ul>
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
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
      {models.length > 0 && (
        <aside className="lesson-model-note" aria-labelledby="lesson-model-note">
          <h2 id="lesson-model-note">{strings.lesson.modelNote}</h2>
          {models.map((m) => {
            const note = book.timeModelNotes[m as keyof Book["timeModelNotes"]];
            return note ? <Prose key={m} markdown={note} /> : null;
          })}
        </aside>
      )}
      <aside className="lesson-model-vs-reality" aria-labelledby="lesson-model-vs-reality">
        <h2 id="lesson-model-vs-reality">{strings.lesson.modelVsReality}</h2>
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
