// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import { termPattern } from "@dd/lesson-schema";
import { LESSONS } from "@dd/content";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";
import { LessonList, MACHINE_PARTS } from "./LessonList";

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
      ...STRINGS.moduleNames,
    ];
    const terms = [...new Set(LESSONS.flatMap((l) => l.introduces))];
    expect(terms.length).toBeGreaterThan(50);
    const used = terms.filter((t) => cover.some((text) => termPattern(t).test(text)));
    expect(used).toEqual([]);
  });
});

describe("the course's front page: the machine, one step at a time", () => {
  it("shows each part of the machine in the order a step meets it, with the modules that build it", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const figure = screen.getByRole("figure");
    const words = STRINGS.cover.flow;
    const parts = within(figure)
      .getAllByRole("listitem")
      .filter((li) => li.classList.contains("flow-part"))
      .map((li) => li.textContent);
    const order = ["next", "program", "reading", "numbers", "arithmetic", "memory"] as const;
    expect(parts).toEqual(
      order.map((k) => `${words[k]}${STRINGS.cover.builtIn(MACHINE_PARTS[k])}`),
    );
    expect(within(figure).getByText(words.doing)).toBeInTheDocument();
    expect(within(figure).getByText(words.back)).toBeInTheDocument();
    expect(within(figure).getByText(STRINGS.cover.machine)).toBeInTheDocument();
  });

  it("names a part's modules as the course writes a list of numbers", () => {
    expect(STRINGS.cover.builtIn([6])).toBe("Module 6");
    expect(STRINGS.cover.builtIn([3, 7])).toBe("Modules 3 and 7");
    expect(STRINGS.cover.builtIn([2, 3, 6])).toBe("Modules 2, 3 and 6");
  });

  it("names only modules the plan has", () => {
    for (const modules of Object.values(MACHINE_PARTS))
      for (const m of modules) expect(STRINGS.moduleNames[m]).toBeDefined();
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
      expect(within(section).getByRole("heading")).toHaveTextContent(
        `${STRINGS.module(module)}: ${name}`,
      );
      if (withLessons.has(module)) {
        for (const l of book.lessons.filter((x) => x.module === module))
          expect(
            within(section).getByRole("link", {
              name: new RegExp(l.title.replace(/[?()]/g, "\\$&")),
            }),
          ).toHaveAttribute("href", lessonHref(l.id));
        expect(within(section).queryByText(STRINGS.cover.toWrite)).not.toBeInTheDocument();
      } else {
        expect(within(section).getByText(STRINGS.cover.toWrite)).toBeInTheDocument();
      }
    });
  });

  it("shows each lesson's progress, recomputed from stored work", () => {
    const storage = memoryStorage();
    pass(storage, first.id, 1);
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: new RegExp(`^${first.title.replace(/[?()]/g, "\\$&")}`) }),
    ).toHaveTextContent(STRINGS.progress(1, first.challenges.length));
  });
});
