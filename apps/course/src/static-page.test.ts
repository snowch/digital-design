// Copyright © 2026 Christopher Snow

// What the page says before any script runs, and what each page calls itself in the browser's tab.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LESSONS } from "@dd/content";

import { pageTitle } from "./route";
import { staticPage } from "./static-page";
import { STRINGS } from "./strings";

const book = createBook(LESSONS, INTERACTIVES);
const template = readFileSync(resolve(process.cwd(), "apps/course/index.html"), "utf8");
const page = staticPage(template);
/** The page's text with its tags taken out, as a program that reads it without scripts gets it. */
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");

describe("the page before any script runs", () => {
  it("is named as the book names the course", () => {
    expect(template).toContain(`<title>${book.title}</title>`);
    expect(page).toContain(`<meta property="og:title" content="${book.title}" />`);
  });

  it("gives search results and shared links the cover's description", () => {
    const description = STRINGS.cover.description.replace(/"/g, "&quot;");
    expect(page).toContain(`<meta name="description" content="${description}" />`);
    expect(page).toContain(`<meta property="og:description" content="${description}" />`);
    expect(STRINGS.cover.description.length).toBeLessThanOrEqual(155);
  });

  it("shows a reader with no scripts the cover: its opening, its path and what it assumes", () => {
    const noscript = /<noscript>([\s\S]*)<\/noscript>/.exec(page)?.[1] ?? "";
    const shown = text(noscript);
    expect(shown).toContain(book.title);
    expect(shown).toContain(STRINGS.cover.tagline);
    expect(shown).toContain(STRINGS.cover.lead);
    expect(shown).toContain(STRINGS.cover.journeyHeading);
    for (const s of STRINGS.cover.stages) {
      expect(shown).toContain(s.name);
      expect(shown).toContain(STRINGS.cover.stageModules(s.from, s.to));
      expect(shown).toContain(s.about);
    }
    expect(shown).toContain(STRINGS.assumes);
    expect(shown).toContain(STRINGS.noScript);
    // After the root the scripts draw into, so a browser that runs them never shows it.
    expect(page.indexOf("<noscript>")).toBeGreaterThan(page.indexOf(`<div id="root">`));
  });

  it("refuses a page with no name", () => {
    expect(() => staticPage("<html><head></head><body></body></html>")).toThrow();
  });
});

describe("a page's name in the browser's tab", () => {
  const lessonTitle = (id: string) => book.lessons.find((l) => l.id === id)?.title;
  const first = book.lessons[0]!;

  it("is the course's full title on the front page, and the page's own name elsewhere", () => {
    expect(pageTitle({ kind: "list" }, book.title, lessonTitle)).toBe(book.title);
    expect(pageTitle({ kind: "lesson", id: first.id }, book.title, lessonTitle)).toBe(
      STRINGS.pageTitle(first.title),
    );
    expect(pageTitle({ kind: "preface" }, book.title, lessonTitle)).toBe(
      STRINGS.pageTitle(STRINGS.preface.title),
    );
  });

  it("names a page that is not there as the page itself says it", () => {
    expect(pageTitle({ kind: "lesson", id: "nowhere" }, book.title, lessonTitle)).toBe(
      STRINGS.pageTitle(STRINGS.noLesson("nowhere")),
    );
    expect(pageTitle({ kind: "missing", path: "/x" }, book.title, lessonTitle)).toBe(
      STRINGS.pageTitle(STRINGS.missing("/x")),
    );
  });

  it("tells every lesson apart", () => {
    const titles = book.lessons.map((l) =>
      pageTitle({ kind: "lesson", id: l.id }, book.title, lessonTitle),
    );
    expect(new Set(titles).size).toBe(book.lessons.length);
  });
});
