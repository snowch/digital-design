// Copyright © 2026 Christopher Snow

// What the page says before any script runs, what each page calls itself in the browser's tab,
// and the icon and name a browser shows for the course, in a tab and once it is installed.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { LESSONS } from "@dd/content";

import { pageTitle } from "./route";
import { courseTitle, staticPage } from "./static-page";
import { STRINGS } from "./strings";
import { ICONS, MANIFEST_FILE, webManifest } from "./web-manifest";

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
    expect(shown).toContain(STRINGS.cover.journeyIntro);
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

describe("the course's icon, and the course installed", () => {
  const base = "/digital-design/";
  const built = staticPage(template, base);
  const manifest = webManifest(courseTitle(template));
  const folder = resolve(process.cwd(), "apps/course/public");
  /** A PNG's width and height, from its header. */
  const sizeOf = (file: string) => {
    const png = readFileSync(resolve(folder, file));
    return `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
  };

  it("names its icons and its manifest in the head, under the site's base", () => {
    expect(built).toContain(
      `<link rel="icon" href="${base}icon-32.png" sizes="32x32" type="image/png" />`,
    );
    expect(built).toContain(`<link rel="icon" href="${base}icon.svg" type="image/svg+xml" />`);
    expect(built).toContain(`<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`);
    expect(built).toContain(`<link rel="manifest" href="${base}${MANIFEST_FILE}" />`);
    expect(staticPage(template)).toContain(`<link rel="manifest" href="/${MANIFEST_FILE}" />`);
  });

  it("has every icon it names, each at the size it is named for", () => {
    expect(readFileSync(resolve(folder, ICONS.tab), "utf8")).toContain("<svg");
    expect(sizeOf(ICONS.tabPng.src)).toBe("32x32");
    expect(sizeOf(ICONS.homeScreen.src)).toBe("180x180");
    const pngs = manifest.icons.filter((i) => i.type === "image/png");
    expect(pngs).toHaveLength(3);
    for (const icon of pngs) expect(sizeOf(icon.src)).toBe(icon.sizes);
  });

  it("installs under the course's own name, with the cover's description", () => {
    expect(manifest.name).toBe(book.title);
    // The shorter name under the icon is the one every tab after the front page ends with.
    expect(STRINGS.pageTitle("A page")).toBe(`A page / ${manifest.short_name}`);
    expect(built).toContain(
      `<meta name="apple-mobile-web-app-title" content="${manifest.short_name}" />`,
    );
    expect(manifest.description).toBe(STRINGS.cover.description);
    // Paths relative to the manifest, so whatever base the site is served from holds them.
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.icons.some((i) => "purpose" in i && i.purpose === "maskable")).toBe(true);
  });
});
