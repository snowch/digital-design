// @vitest-environment jsdom
// The links at the bottom of a lesson, worked out from the list of lessons, so they stay right as
// lessons are added: the lesson before and the lesson after in the list's order, the page before
// the first lesson, and the way back to the list after the last.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LESSONS } from "@dd/content";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";
import { LessonPager } from "./LessonPager";

const book = createBook(LESSONS, INTERACTIVES);
const lessons = book.lessons;

function pager(lessonId: string) {
  render(<LessonPager book={book} lessonId={lessonId} />);
  const nav = screen.getByRole("navigation", { name: STRINGS.pager.label });
  const [before, after] = within(nav).getAllByRole("link");
  return { before: before!, after: after! };
}

describe("the links at the bottom of a lesson", () => {
  it("lead to the lessons before and after it, across a change of module", () => {
    // The first lesson of a module after the first: its lesson before is in the module before.
    const at = lessons.findIndex((l, i) => i > 0 && l.module !== lessons[i - 1]!.module);
    expect(at).toBeGreaterThan(0);
    const lesson = lessons[at]!;
    const previous = lessons[at - 1]!;
    const next = lessons[at + 1]!;
    const { before, after } = pager(lesson.id);
    expect(before).toHaveAttribute("href", lessonHref(previous.id));
    expect(before).toHaveAttribute("rel", "prev");
    expect(before).toHaveTextContent(STRINGS.pager.previous);
    expect(before).toHaveTextContent(previous.title);
    expect(before).toHaveTextContent(STRINGS.module(previous.module));
    expect(after).toHaveAttribute("href", lessonHref(next.id));
    expect(after).toHaveAttribute("rel", "next");
    expect(after).toHaveTextContent(STRINGS.pager.next);
    expect(after).toHaveTextContent(next.title);
    expect(after).toHaveTextContent(STRINGS.module(next.module));
  });

  it("lead from the first lesson back to the page before it", () => {
    const { before } = pager(lessons[0]!.id);
    expect(before).toHaveAttribute("href", PREFACE_HREF);
    expect(before).toHaveTextContent(STRINGS.pager.previous);
    expect(before).toHaveTextContent(STRINGS.preface.title);
  });

  it("lead from the last lesson written so far back to the list, saying the next is not written", () => {
    const { after } = pager(lessons[lessons.length - 1]!.id);
    expect(after).toHaveAttribute("href", "#/");
    expect(after).not.toHaveAttribute("rel");
    expect(after).toHaveTextContent(STRINGS.pager.notYet);
    expect(after).toHaveTextContent(STRINGS.backToLessons);
  });

  it("draw nothing for a lesson the list does not have", () => {
    const { container } = render(<LessonPager book={book} lessonId="no-such-lesson" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("are named apart from the bar at the top of the page", () => {
    expect(STRINGS.pager.label).not.toBe(STRINGS.lessons);
    expect(STRINGS.pager.label.toLowerCase()).not.toContain(STRINGS.lessons.toLowerCase());
  });
});
