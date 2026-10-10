// Copyright © 2026 Christopher Snow

// The links at the bottom of a lesson: the lesson before it and the lesson after it, in the order
// the list of lessons shows them. Before the first lesson comes the page before it; after the last
// lesson written so far, the list of lessons, which says what is still to be written; after the last
// optional chapter, the last lesson of the course, the list too, with a line saying the course ends.
// An optional chapter is named by its line on the list, "Beyond the machine", not by a module.

import type { Book } from "@platform/lesson-runtime";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";
import { placeOf } from "./LessonList";

export function LessonPager({ book, lessonId }: { book: Book; lessonId: string }) {
  const at = book.lessons.findIndex((l) => l.id === lessonId);
  if (at < 0) return null;
  const before = book.lessons[at - 1];
  const after = book.lessons[at + 1];
  return (
    <nav className="lesson-pager" aria-label={STRINGS.pager.label}>
      <a
        className="lesson-link pager-before"
        rel="prev"
        href={before ? lessonHref(before.id) : PREFACE_HREF}
      >
        <span className="pager-way">{STRINGS.pager.previous}</span>
        <span className="lesson-link-title">{before ? before.title : STRINGS.preface.title}</span>
        {before && <span className="meta">{placeOf(before)}</span>}
      </a>
      {after ? (
        <a className="lesson-link pager-after" rel="next" href={lessonHref(after.id)}>
          <span className="pager-way">{STRINGS.pager.next}</span>
          <span className="lesson-link-title">{after.title}</span>
          <span className="meta">{placeOf(after)}</span>
        </a>
      ) : (
        <a className="lesson-link pager-after" href="#/">
          <span className="pager-way">
            {book.lessons[at]?.optional ? STRINGS.pager.end : STRINGS.pager.notYet}
          </span>
          <span className="lesson-link-title">{STRINGS.backToLessons}</span>
        </a>
      )}
    </nav>
  );
}
