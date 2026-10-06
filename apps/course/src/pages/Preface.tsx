// Copyright © 2026 Christopher Snow

// The page before the first lesson: what the course is, what it takes as known, a check the
// learner can run on themselves, and how a lesson works. It ends at the first lesson, whichever
// that is when the page is built.

import { Prose, type Book } from "@dd/lesson-runtime";

import { lessonHref } from "../route";
import { STRINGS } from "../strings";
import { SelfCheck } from "./SelfCheck";

export function Preface({ book }: { book: Book }) {
  const first = book.lessons[0];
  return (
    <article className="preface" aria-labelledby="preface-title">
      <h1 id="preface-title">{STRINGS.preface.title}</h1>
      <Prose markdown={STRINGS.preface.what} />
      <section aria-labelledby="preface-need">
        <h2 id="preface-need">{STRINGS.preface.needHeading}</h2>
        <Prose markdown={STRINGS.preface.need} />
        <SelfCheck />
      </section>
      <section aria-labelledby="preface-lessons">
        <h2 id="preface-lessons">{STRINGS.preface.lessonsHeading}</h2>
        <Prose markdown={STRINGS.preface.lessons} />
      </section>
      {first && (
        <p className="preface-start">
          <a href={lessonHref(first.id)}>{STRINGS.preface.start(first.module, first.title)}</a>
        </p>
      )}
    </article>
  );
}
