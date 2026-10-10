// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook, grade, rememberVerdicts } from "@dd/dd-views";
import { LessonStore, LessonView, memoryStorage } from "@platform/lesson-runtime";
import { termPattern, type Artifact, type Challenge } from "@platform/lesson-schema";
import { LESSONS } from "@dd/content";

import { PREFACE_HREF, lessonHref } from "../route";
import { STRINGS } from "../strings";
import { LessonList, placeOf } from "./LessonList";

const book = createBook(LESSONS, INTERACTIVES);
const ordered = [...book.lessons].sort((a, b) => a.module - b.module || a.order - b.order);
const first = ordered[0]!;

/** The stage that holds a module, or none for Module 0. */
const stageOf = (module: number) =>
  STRINGS.cover.stages.find((s) => module >= s.from && module <= s.to);

/** A stage's line on the front page, by the stage's name. */
const stageLine = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name} `) });

/**
 * A module's line, which a closed stage hides from the reader. Inside a stage it reads "Module 7:
 * Arithmetic and logic …"; Module 0's, in the stages' form, reads "Module 0 What computers do …".
 */
const moduleLine = (module: number) =>
  screen.getByRole("button", { name: new RegExp(`^${STRINGS.module(module)}\\b`), hidden: true });

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
      screen.getByRole("link", { name: STRINGS.cover.continueWith(placeOf(first), first.title) }),
    ).toHaveAttribute("href", lessonHref(first.id));
    unmount();
    // With the first lesson finished, the way on is the second.
    pass(storage, first.id, first.challenges.length);
    const second = ordered[1]!;
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(placeOf(second), second.title) }),
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
      screen.getByRole("link", { name: STRINGS.cover.continueWith(placeOf(later), later.title) }),
    ).toHaveAttribute("href", lessonHref(later.id));
    unmount();
    // That lesson finished, the way on is the next lesson, though Module 0 is still unfinished.
    pass(storage, later.id, later.challenges.length);
    render(<LessonList book={book} storage={storage} />);
    expect(
      screen.getByRole("link", { name: STRINGS.cover.continueWith(placeOf(after), after.title) }),
    ).toHaveAttribute("href", lessonHref(after.id));
  });

  it("shows the way in before the path, so a reader knows where to start", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    const start = screen.getByRole("link", {
      name: STRINGS.preface.start(first.module, first.title),
    });
    // The link reads as the module, then the first lesson's question under it.
    expect(start).toHaveTextContent(STRINGS.cover.startLine(placeOf(first)));
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
      STRINGS.cover.journeyIntro,
      STRINGS.cover.openingAbout,
      ...STRINGS.cover.stages.flatMap((s) => [s.name, s.about]),
      STRINGS.cover.stageToWrite,
      STRINGS.cover.toWrite,
      STRINGS.cover.moduleSummary(5, 3, 12),
      STRINGS.cover.moduleSummary(1, 0, 2),
      STRINGS.cover.moduleSummary(3, 0, 0),
      ...STRINGS.moduleNames,
      STRINGS.cover.beyond.name,
      STRINGS.cover.beyond.range,
      STRINGS.cover.beyond.about,
      STRINGS.cover.startLine(STRINGS.cover.beyond.name),
      STRINGS.cover.continueLine(STRINGS.cover.beyond.name),
      STRINGS.pager.notYet,
      STRINGS.pager.end,
    ];
    // The optional chapters' own terms too, which the cover's line for them may not use.
    const terms = [...new Set([...LESSONS.flatMap((l) => l.introduces), "compiler", "kernel"])];
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
    const stages = [...path.querySelectorAll(":scope > ol > li")];
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

  it("holds each module in its stage, every stage one closed line for a new reader", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    STRINGS.cover.stages.forEach((stage, i) => {
      const line = stageLine(stage.name);
      expect(line).toHaveAttribute("aria-expanded", "false");
      const lessons = book.lessons.filter((l) => stageOf(l.module) === stage);
      const total = lessons.reduce((n, l) => n + l.challenges.length, 0);
      expect(line).toHaveTextContent(STRINGS.progress(0, total));
      // The stage's own list holds its modules' lines, in order, and nothing else.
      const list = document.getElementById(`stage-${i + 1}-modules`)!;
      expect(line).toHaveAttribute("aria-controls", list.id);
      const held = [...list.querySelectorAll("section.module")].map((m) =>
        m.getAttribute("aria-labelledby"),
      );
      expect(held).toEqual(
        Array.from({ length: stage.to - stage.from + 1 }, (_, k) => `module-${stage.from + k}`),
      );
    });
    // Module 0 stands before the stages, open, as the way in.
    const zero = moduleLine(0);
    expect(zero).toHaveAttribute("aria-expanded", "true");
    expect(
      zero.compareDocumentPosition(stageLine(STRINGS.cover.stages[0]!.name)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("draws Module 0's line in the stages' form, with what you do in it, open for a new reader", async () => {
    const user = userEvent.setup();
    render(<LessonList book={book} storage={memoryStorage()} />);
    const zero = moduleLine(0);
    const lessons = book.lessons.filter((l) => l.module === 0);
    const total = lessons.reduce((n, l) => n + l.challenges.length, 0);
    // The same line as a stage's: a mark, a name, what it covers and its progress.
    expect(zero).toHaveClass("stage-toggle");
    expect(zero.querySelector(".stage-icon")).not.toBeNull();
    expect(zero).toHaveTextContent(STRINGS.moduleNames[0]!);
    expect(zero).toHaveTextContent(STRINGS.module(0));
    expect(zero).toHaveTextContent(STRINGS.cover.moduleSummary(lessons.length, 0, total));
    const region = screen.getByRole("region", {
      name: `${STRINGS.module(0)}: ${STRINGS.moduleNames[0]}`,
    });
    expect(within(region).getByText(STRINGS.cover.openingAbout)).toBeInTheDocument();
    // Open, it shows Module 0's lessons, and pressed, it hides them.
    const link = () =>
      within(region).queryByRole("link", {
        name: new RegExp(first.title.replace(/[?()]/g, "\\$&")),
      });
    expect(zero).toHaveAttribute("aria-expanded", "true");
    expect(link()).toHaveAttribute("href", lessonHref(first.id));
    await user.click(zero);
    expect(zero).toHaveAttribute("aria-expanded", "false");
    expect(link()).not.toBeInTheDocument();
  });

  it("opens the stage of a returning reader's module, with that module open in it", () => {
    const later = ordered.find((l) => l.module === 2 && l.challenges.length > 1)!;
    const storage = memoryStorage();
    pass(storage, later.id, 1);
    render(<LessonList book={book} storage={storage} />);
    for (const stage of STRINGS.cover.stages)
      expect(stageLine(stage.name)).toHaveAttribute(
        "aria-expanded",
        String(stage === stageOf(later.module)),
      );
    expect(moduleLine(later.module)).toHaveAttribute("aria-expanded", "true");
    const lessons = document.getElementById(`module-${later.module}-lessons`)!;
    expect(
      within(lessons).getByRole("link", {
        name: new RegExp(later.title.replace(/[?()]/g, "\\$&")),
      }),
    ).toHaveAttribute("href", lessonHref(later.id));
  });

  it("shows and hides a stage's modules when its line is pressed", async () => {
    const user = userEvent.setup();
    render(<LessonList book={book} storage={memoryStorage()} />);
    const stage = STRINGS.cover.stages[1]!;
    const line = stageLine(stage.name);
    const module = () =>
      screen.queryByRole("button", { name: new RegExp(`^${STRINGS.module(stage.from)}: `) });
    expect(module()).not.toBeInTheDocument();
    await user.click(line);
    expect(line).toHaveAttribute("aria-expanded", "true");
    expect(module()).toHaveAttribute("aria-expanded", "false");
    await user.click(line);
    expect(line).toHaveAttribute("aria-expanded", "false");
    expect(module()).not.toBeInTheDocument();
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
    const sections = screen
      .getAllByRole("region", { hidden: true })
      .filter((r) => r.classList.contains("module") || r.classList.contains("journey-opening"));
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
      const line = moduleLine(module);
      expect(line).toHaveTextContent(STRINGS.cover.moduleSummary(lessons.length, 0, total));
      expect(line).toHaveAttribute("aria-expanded", String(module === first.module));
      const shown = screen.queryAllByRole("link", {
        name: new RegExp(lessons[0]!.title.replace(/[?()]/g, "\\$&")),
      });
      expect(shown.length > 0, `Module ${module}`).toBe(module === first.module);
    }
  });

  it("opens the module of the lesson the reader has just left, as well as the way in's", () => {
    const last = ordered.filter((l) => !l.optional).at(-1)!;
    expect(last.module).not.toBe(first.module);
    render(<LessonList book={book} storage={memoryStorage()} from={last.id} />);
    for (const module of [first.module, last.module])
      expect(moduleLine(module)).toHaveAttribute("aria-expanded", "true");
    // The stage that holds it opens too, and no other.
    for (const stage of STRINGS.cover.stages)
      expect(stageLine(stage.name)).toHaveAttribute(
        "aria-expanded",
        String(stage === stageOf(last.module)),
      );
    expect(
      screen.getByRole("link", { name: new RegExp(last.title.replace(/[?()]/g, "\\$&")) }),
    ).toHaveAttribute("href", lessonHref(last.id));
  });

  it("shows and hides a module's lessons when its line is pressed", async () => {
    const user = userEvent.setup();
    render(<LessonList book={book} storage={memoryStorage()} />);
    const later = ordered.find((l) => l.module !== first.module)!;
    await user.click(stageLine(stageOf(later.module)!.name));
    const line = moduleLine(later.module);
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

  it("checks saved work once, not again each time a module is opened or closed", async () => {
    // The book's grader is remembered (rememberVerdicts): a press re-renders the page, and the
    // checks that run a whole machine take a second or more each.
    const runs: string[] = [];
    const counted = {
      ...book,
      grade: rememberVerdicts((c: Challenge, a: Artifact) => {
        runs.push(c.id);
        return grade(c, a);
      }),
    };
    const storage = memoryStorage();
    pass(storage, first.id, first.challenges.length);
    const user = userEvent.setup();
    render(<LessonList book={counted} storage={storage} />);
    expect(runs).toHaveLength(first.challenges.length);
    const later = ordered.find((l) => l.module !== first.module)!;
    await user.click(stageLine(stageOf(later.module)!.name));
    const line = moduleLine(later.module);
    await user.click(line);
    await user.click(line);
    expect(runs).toHaveLength(first.challenges.length);
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
    expect(moduleLine(first.module)).toHaveTextContent(
      STRINGS.cover.moduleSummary(lessons.length, 1, total),
    );
  });
});

// A grader that stops with an error once took the whole site down: the capstone's model refused a
// program that branched on a register it never set, the lesson graded the saved program on load,
// and the list graded it as it drew. The work fails with a sentence instead, everywhere.
describe("saved work a grader cannot run", () => {
  const capstone = book.lessons.find((l) => l.id === "capstone")!;
  const challenge = capstone.challenges[0]!;
  const broken = "        R1 <= word[sensorA]\n        if R1 == R7 goto done\ndone:   stop";
  const stored = () => {
    const storage = memoryStorage();
    new LessonStore(storage, book.id, capstone.id).setChallenge(challenge.id, (x) => ({
      ...x,
      artifact: { text: broken, answers: {} },
    }));
    return storage;
  };

  it("fails, naming the line and the register that holds no value", () => {
    const v = book.grade(challenge, { text: broken, answers: {} });
    expect(v.passed).toBe(false);
    expect(v.failures[0]?.detail).toContain("if R1 == R7 goto done");
    expect(v.failures[0]?.detail).toContain("R7");
  });

  it("turns any grader's throw into a failed verdict that says why", () => {
    // A grader the book does not have throws; the guarded grade fails the work instead.
    const unknown = {
      ...challenge,
      tests: { ...challenge.tests, grader: "no-such-grader" },
    } as Challenge;
    expect(() => grade(unknown, { text: broken, answers: {} })).toThrow();
    const v = book.grade(unknown, { text: broken, answers: {} });
    expect(v.passed).toBe(false);
    expect(v.blocked).toMatch(/^The tests could not run: /);
  });

  it("keeps the list and the lesson drawn over such saved work", () => {
    render(<LessonList book={book} storage={stored()} />);
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
    const { container } = render(<LessonView book={book} lesson={capstone} storage={stored()} />);
    expect(container.querySelector(`[data-challenge="${challenge.id}"] textarea`)).not.toBeNull();
  });
});

/**
 * A book with one optional chapter after every lesson: a copy of the first lesson, flagged, at
 * module 14, as the course plan numbers the chapters "Beyond the machine".
 */
function withChapter() {
  const chapter = {
    ...LESSONS[0]!,
    id: "fixture-chapter",
    title: "A chapter after the machine?",
    module: 14,
    order: 1,
    optional: true,
    introduces: [],
  };
  const fixture = createBook([...LESSONS, chapter], INTERACTIVES);
  const numbered = fixture.lessons.filter((l) => !l.optional);
  return { fixture, chapter: fixture.lessons.find((l) => l.id === chapter.id)!, numbered };
}

const beyondLine = () =>
  screen.getByRole("button", { name: new RegExp(`^${STRINGS.cover.beyond.name} `) });

describe("the course's front page: the optional chapters", () => {
  it("lists them after the five stages, in a line of their own, counted in no module", () => {
    const { fixture, chapter } = withChapter();
    render(<LessonList book={fixture} storage={memoryStorage()} />);
    const line = beyondLine();
    expect(line).toHaveTextContent(STRINGS.cover.beyond.range);
    expect(line).toHaveTextContent(STRINGS.progress(0, chapter.challenges.length));
    expect(line).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(STRINGS.cover.beyond.about)).toBeInTheDocument();
    // After the last stage's line, and no line names its module.
    const lastStage = stageLine(STRINGS.cover.stages.at(-1)!.name);
    expect(lastStage.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: new RegExp(`^${STRINGS.module(14)}\\b`), hidden: true }),
    ).not.toBeInTheDocument();
    const modules = screen
      .getAllByRole("region", { hidden: true })
      .filter((r) => r.classList.contains("module") || r.classList.contains("journey-opening"));
    expect(modules).toHaveLength(STRINGS.moduleNames.length);
    // Its lesson is listed under it, shown when the line is pressed.
    const link = screen.getByRole("link", {
      name: new RegExp(chapter.title.replace("?", "\\?")),
      hidden: true,
    });
    expect(link).toHaveAttribute("href", lessonHref(chapter.id));
    expect(link).not.toBeVisible();
  });

  it("marks the line still to be written while no chapter is", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    if (book.lessons.some((l) => l.optional)) return;
    expect(beyondLine()).toHaveTextContent(STRINGS.cover.stageToWrite);
  });

  it("shows and hides the chapters when the line is pressed", async () => {
    const { fixture, chapter } = withChapter();
    render(<LessonList book={fixture} storage={memoryStorage()} />);
    const link = () =>
      screen.getByRole("link", {
        name: new RegExp(chapter.title.replace("?", "\\?")),
        hidden: true,
      });
    await userEvent.click(beyondLine());
    expect(beyondLine()).toHaveAttribute("aria-expanded", "true");
    expect(link()).toBeVisible();
    await userEvent.click(beyondLine());
    expect(link()).not.toBeVisible();
  });

  it("opens the line for a chapter the reader has just left", () => {
    const { fixture, chapter } = withChapter();
    render(<LessonList book={fixture} storage={memoryStorage()} from={chapter.id} />);
    expect(beyondLine()).toHaveAttribute("aria-expanded", "true");
    for (const stage of STRINGS.cover.stages)
      expect(stageLine(stage.name)).toHaveAttribute("aria-expanded", "false");
  });

  it("offers the first chapter, by the line's name, to a reader who has finished the last module", () => {
    const { fixture, chapter, numbered } = withChapter();
    const last = numbered.at(-1)!;
    const storage = memoryStorage();
    const store = new LessonStore(storage, fixture.id, last.id);
    for (const c of last.challenges)
      store.setChallenge(c.id, (x) => ({ ...x, artifact: c.reference }));
    render(<LessonList book={fixture} storage={storage} />);
    const way = screen.getByRole("link", {
      name: STRINGS.cover.continueWith(STRINGS.cover.beyond.name, chapter.title),
    });
    expect(way).toHaveAttribute("href", lessonHref(chapter.id));
    expect(way).toHaveTextContent(STRINGS.cover.continueLine(STRINGS.cover.beyond.name));
    expect(beyondLine()).toHaveAttribute("aria-expanded", "true");
  });
});
