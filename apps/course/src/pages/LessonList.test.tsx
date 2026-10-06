// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import { termPattern } from "@dd/lesson-schema";
import { LESSONS } from "@dd/content";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";
import { LessonList } from "./LessonList";

const book = createBook(LESSONS, INTERACTIVES);
const ordered = [...book.lessons].sort((a, b) => a.module - b.module || a.order - b.order);
const first = ordered[0]!;

/** Stores a challenge's reference answer as the learner's work, so it passes when re-checked. */
function pass(storage: ReturnType<typeof memoryStorage>, lessonId: string, count: number) {
  const lesson = book.lessons.find((l) => l.id === lessonId)!;
  const store = new LessonStore(storage, book.id, lessonId);
  for (const c of lesson.challenges.slice(0, count))
    store.setChallenge(c.id, (x) => ({ ...x, artifact: c.reference }));
}

describe("the course's front page: the cover", () => {
  it("starts a new reader at the first lesson", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    expect(
      screen.getByRole("link", { name: STRINGS.preface.start(first.module, first.title) }),
    ).toHaveAttribute("href", lessonHref(first.id));
  });

  it("takes a reader who has passed a challenge to the first lesson not finished", () => {
    const storage = memoryStorage();
    pass(storage, first.id, 1);
    const { unmount } = render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(first.module, first.title) }),
    ).toHaveAttribute("href", lessonHref(first.id));
    unmount();
    // With the first lesson finished, the way on is the second.
    pass(storage, first.id, first.challenges.length);
    const second = ordered[1]!;
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(second.module, second.title) }),
    ).toHaveAttribute("href", lessonHref(second.id));
  });

  it("shows the way in before the machine, so a reader knows where to start", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const start = screen.getByRole("link", {
      name: STRINGS.preface.start(first.module, first.title),
    });
    // The machine's parts are built across the modules out of reading order.
    const figure = screen.getByRole("figure");
    expect(start.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(first.module).toBe(1);
  });

  it("says what the course takes as known, and links to the page before the first lesson", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    expect(screen.getByText(STRINGS.assumes)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: STRINGS.prefaceLink })).toHaveAttribute(
      "href",
      PREFACE_HREF,
    );
  });

  it("uses no term that a lesson introduces, since a reader meets it before every lesson", () => {
    const cover = [
      STRINGS.cover.lead,
      STRINGS.cover.machine,
      ...Object.values(STRINGS.cover.flow),
      STRINGS.cover.contents(STRINGS.moduleNames.length),
      STRINGS.cover.toWrite,
      STRINGS.cover.moduleSummary(5, 3, 12),
      STRINGS.cover.moduleSummary(1, 0, 2),
      STRINGS.cover.moduleSummary(3, 0, 0),
      ...STRINGS.moduleNames,
    ];
    const terms = [...new Set(LESSONS.flatMap((l) => l.introduces))];
    expect(terms.length).toBeGreaterThan(50);
    const used = terms.filter((t) => cover.some((text) => termPattern(t).test(text)));
    expect(used).toEqual([]);
  });
});

describe("the course's front page: the machine, one step at a time", () => {
  it("shows each part of the machine in the order a step meets it, and no module numbers", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const figure = screen.getByRole("figure");
    const words = STRINGS.cover.flow;
    const parts = within(figure)
      .getAllByRole("listitem")
      .filter((li) => li.classList.contains("flow-part"))
      .map((li) => li.textContent);
    const order = ["next", "program", "reading", "numbers", "arithmetic", "memory"] as const;
    expect(parts).toEqual(order.map((k) => words[k]));
    expect(within(figure).getByText(words.doing)).toBeInTheDocument();
    expect(within(figure).getByText(words.back)).toBeInTheDocument();
    expect(within(figure).getByText(STRINGS.cover.machine)).toBeInTheDocument();
    // The list of modules gives the order to read them in; the machine names none.
    expect(figure.textContent).not.toMatch(/Module/);
  });
});

describe("the course's front page: every module of the plan", () => {
  it("names each module the plan has, numbered from 0, as docs/plan.md's table does", () => {
    // The check runs from the repository's root, as CI does.
    const plan = readFileSync(resolve(process.cwd(), "docs/plan.md"), "utf8");
    const rows = [...plan.matchAll(/^\| (\d+) [^|]+\|/gm)].map((m) => Number(m[1]));
    expect(rows).toEqual(STRINGS.moduleNames.map((_, i) => i));
  });

  it("lists every module in order, with its lessons or a line saying it is still to be written", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const sections = screen.getAllByRole("region");
    const withLessons = new Set(book.lessons.map((l) => l.module));
    expect(sections).toHaveLength(STRINGS.moduleNames.length);
    STRINGS.moduleNames.forEach((name, module) => {
      const section = sections[module]!;
      expect(section).toHaveAccessibleName(`${STRINGS.module(module)}: ${name}`);
      if (withLessons.has(module)) {
        // Shown or not, each lesson is listed under its module, with its link.
        for (const l of book.lessons.filter((x) => x.module === module))
          expect(
            within(section).getByRole("link", {
              name: new RegExp(l.title.replace(/[?()]/g, "\\$&")),
              hidden: true,
            }),
          ).toHaveAttribute("href", lessonHref(l.id));
        expect(within(section).queryByText(STRINGS.cover.toWrite)).not.toBeInTheDocument();
      } else {
        expect(within(section).getByText(STRINGS.cover.toWrite)).toBeInTheDocument();
        expect(within(section).queryByRole("button")).not.toBeInTheDocument();
      }
    });
  });

  it("shows one line for each module, with only the module of the way in open", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    for (const module of new Set(book.lessons.map((l) => l.module))) {
      const lessons = book.lessons.filter((l) => l.module === module);
      const total = lessons.reduce((n, l) => n + l.challenges.length, 0);
      const line = screen.getByRole("button", {
        name: new RegExp(`^${STRINGS.module(module)}: `),
      });
      expect(line).toHaveTextContent(STRINGS.cover.moduleSummary(lessons.length, 0, total));
      expect(line).toHaveAttribute("aria-expanded", String(module === first.module));
      const shown = screen.queryAllByRole("link", {
        name: new RegExp(lessons[0]!.title.replace(/[?()]/g, "\\$&")),
      });
      expect(shown.length > 0, `Module ${module}`).toBe(module === first.module);
    }
  });

  it("shows and hides a module's lessons when its line is pressed", async () => {
    const user = userEvent.setup();
    render(<LessonList book={book} storage={memoryStorage()} />);
    const later = ordered.find((l) => l.module !== first.module)!;
    const line = screen.getByRole("button", {
      name: new RegExp(`^${STRINGS.module(later.module)}: `),
    });
    const link = () =>
      screen.queryByRole("link", { name: new RegExp(later.title.replace(/[?()]/g, "\\$&")) });
    expect(link()).not.toBeInTheDocument();
    await user.click(line);
    expect(line).toHaveAttribute("aria-expanded", "true");
    expect(link()).toHaveAttribute("href", lessonHref(later.id));
    await user.click(line);
    expect(line).toHaveAttribute("aria-expanded", "false");
    expect(link()).not.toBeInTheDocument();
  });

  it("shows each lesson's progress, and its module's, recomputed from stored work", () => {
    const storage = memoryStorage();
    pass(storage, first.id, 1);
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: new RegExp(`^${first.title.replace(/[?()]/g, "\\$&")}`) }),
    ).toHaveTextContent(STRINGS.progress(1, first.challenges.length));
    const lessons = book.lessons.filter((l) => l.module === first.module);
    const total = lessons.reduce((n, l) => n + l.challenges.length, 0);
    expect(
      screen.getByRole("button", { name: new RegExp(`^${STRINGS.module(first.module)}: `) }),
    ).toHaveTextContent(STRINGS.cover.moduleSummary(lessons.length, 1, total));
  });
});
