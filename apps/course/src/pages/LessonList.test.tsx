// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { memoryStorage } from "@dd/lesson-runtime";
import { LESSONS } from "@dd/content";

import { STRINGS, joinNumbers } from "../strings";
import { LessonList } from "./LessonList";

const book = createBook(LESSONS, INTERACTIVES);

describe("the lesson list", () => {
  it("names the modules missing between its first and last lesson, computed from the lessons", () => {
    const without4 = { ...book, lessons: book.lessons.filter((l) => l.module !== 4) };
    const modules = [...new Set(without4.lessons.map((l) => l.module))].sort((a, b) => a - b);
    const first = modules[0]!;
    const last = modules[modules.length - 1]!;
    const missing: number[] = [];
    for (let m = first; m <= last; m++) if (!modules.includes(m)) missing.push(m);
    expect(missing.length).toBeGreaterThan(1);
    render(<LessonList book={without4} storage={memoryStorage()} />);
    expect(screen.getByText(STRINGS.toWriteMany(missing))).toBeInTheDocument();
    expect(screen.getByText(STRINGS.toWriteMany(missing))).toHaveTextContent(joinNumbers(missing));
  });

  it("says nothing about missing modules when the modules run without a gap", () => {
    const contiguous = {
      ...book,
      lessons: book.lessons.map((l, i) => ({ ...l, module: i + 1 })),
    };
    render(<LessonList book={contiguous} storage={memoryStorage()} />);
    expect(screen.queryByText(/still to be written/)).not.toBeInTheDocument();
  });

  it("uses the singular for one missing module", () => {
    const [a, ...rest] = book.lessons;
    const one = {
      ...book,
      lessons: [{ ...a!, module: 1 }, ...rest.map((l) => ({ ...l, module: 3 }))],
    };
    render(<LessonList book={one} storage={memoryStorage()} />);
    expect(screen.getByText(STRINGS.toWriteOne(2))).toBeInTheDocument();
  });
});

describe("the course's front page", () => {
  it("says what the course takes as known before Module 1", () => {
    render(<LessonList book={book} storage={memoryStorage()} />);
    expect(screen.getByText(STRINGS.assumes)).toBeInTheDocument();
  });
});

describe("joinNumbers", () => {
  it("joins as prose does", () => {
    expect(joinNumbers([])).toBe("");
    expect(joinNumbers([2])).toBe("2");
    expect(joinNumbers([2, 3])).toBe("2 and 3");
    expect(joinNumbers([2, 3, 6])).toBe("2, 3 and 6");
  });
});
