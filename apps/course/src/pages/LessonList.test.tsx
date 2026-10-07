// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import { termPattern } from "@platform/lesson-schema";
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

  it("takes a returning reader on from the furthest lesson they passed a challenge in", () => {
    // A reader who began in Module 2 before Module 0 existed is not sent back to Module 0.
    const later = ordered.find((l) => l.module === 2 && l.challenges.length > 1)!;
    const after = ordered[ordered.indexOf(later) + 1]!;
    const storage = memoryStorage();
    pass(storage, later.id, 1);
    const { unmount } = render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(later.module, later.title) }),
    ).toHaveAttribute("href", lessonHref(later.id));
    unmount();
    // That lesson finished, the way on is the next lesson, though Module 0 is still unfinished.
    pass(storage, later.id, later.challenges.length);
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(after.module, after.title) }),
    ).toHaveAttribute("href", lessonHref(after.id));
  });

  it("shows the way in before the path, so a reader knows where to start", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const start = screen.getByRole("link", {
      name: STRINGS.preface.start(first.module, first.title),
    });
    // The link reads as the module, then the first lesson's question under it.
    expect(start).toHaveTextContent(STRINGS.cover.startLine(first.module));
    expect(start).toHaveTextContent(first.title);
    const path = screen.getByRole("heading", { name: STRINGS.cover.journeyHeading });
    expect(start.compareDocumentPosition(path) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(first.module).toBe(0);
  });

  it("puts a real circuit beside the opening words, which the reader can press", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const figure = screen.getByRole("figure");
    expect(within(figure).getByText(STRINGS.cover.heroCaption)).toBeInTheDocument();
    // Module 2's alarm, warm with the door shut: the lamp is lit at first.
    const svg = figure.querySelector("svg.circuit");
    expect(svg).not.toBeNull();
    expect(figure.textContent).toMatch(/WARM/);
    expect(figure.textContent).toMatch(/DOOR/);
    expect(figure.textContent).toMatch(/ALARM/);
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
      STRINGS.cover.tagline,
      STRINGS.cover.lead,
      STRINGS.cover.description,
      STRINGS.cover.heroTitle,
      STRINGS.cover.heroCaption,
      STRINGS.cover.journeyHeading,
      ...STRINGS.cover.stages.flatMap((s) => [s.name, s.about]),
      STRINGS.cover.stageToWrite,
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

describe("the course's front page: the path through the course", () => {
  it("gives every module from 1 to 13 to one stage, in reading order, with no gap", () => {
    const covered = STRINGS.cover.stages.flatMap((s) =>
      Array.from({ length: s.to - s.from + 1 }, (_, k) => s.from + k),
    );
    expect(covered).toEqual(Array.from({ length: 13 }, (_, k) => k + 1));
    expect(STRINGS.moduleNames.length - 1).toBe(13);
  });

  it("names each stage's modules, and marks a stage with no lessons yet", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const path = screen.getByRole("heading", { name: STRINGS.cover.journeyHeading })
      .parentElement as HTMLElement;
    const stages = within(path).getAllByRole("listitem");
    expect(stages).toHaveLength(STRINGS.cover.stages.length);
    const withLessons = new Set(book.lessons.map((l) => l.module));
    STRINGS.cover.stages.forEach((s, i) => {
      const li = stages[i] as HTMLElement;
      expect(li).toHaveTextContent(s.name);
      expect(li).toHaveTextContent(STRINGS.cover.stageModules(s.from, s.to));
      const written = Array.from({ length: s.to - s.from + 1 }, (_, k) => s.from + k).some((m) =>
        withLessons.has(m),
      );
      if (written) expect(li).not.toHaveTextContent(STRINGS.cover.stageToWrite);
      else expect(li).toHaveTextContent(STRINGS.cover.stageToWrite);
    });
  });

  it("writes a stage's modules as the course writes a run of numbers", () => {
    expect(STRINGS.cover.stageModules(1, 3)).toBe("Modules 1 to 3");
    expect(STRINGS.cover.stageModules(10, 11)).toBe("Modules 10 and 11");
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
    // The module list's regions: the cover's band and its path are regions of their own.
    const sections = screen.getAllByRole("region").filter((r) => r.classList.contains("module"));
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

  it("opens the module of the lesson the reader has just left, as well as the way in's", () => {
    const last = ordered[ordered.length - 1]!;
    expect(last.module).not.toBe(first.module);
    render(<LessonList book={book} storage={memoryStorage()} from={last.id} />);
    for (const module of [first.module, last.module])
      expect(
        screen.getByRole("button", { name: new RegExp(`^${STRINGS.module(module)}: `) }),
      ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("link", { name: new RegExp(last.title.replace(/[?()]/g, "\\$&")) }),
    ).toHaveAttribute("href", lessonHref(last.id));
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
