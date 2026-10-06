// Copyright © 2026 Christopher Snow

// Shared helpers for the educational tests: the lesson page, its challenges, and the words the
// page uses, taken from the same modules the app renders from, so a wording change moves both.

import { expect, type Locator, type Page } from "@playwright/test";

import { LESSONS } from "@dd/content";
import { DEFAULT_VIEW_STRINGS as V, format, labelFor, partName, type Drawing } from "@dd/dd-views";
import { DEFAULT_STRINGS as S } from "@dd/lesson-runtime";

export { S, V, format, LESSONS };

export const LESSON = LESSONS.find((l) => l.id === "remember")!;

export function lessonData(id: string) {
  const l = LESSONS.find((x) => x.id === id);
  if (!l) throw new Error(`no lesson ${id}`);
  return l;
}

export function challengeData(id: string, lesson = LESSON) {
  const c = lesson.challenges.find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  return c;
}

export async function openLesson(page: Page, lessonId = LESSON.id): Promise<void> {
  await page.goto(`#/lesson/${lessonId}`);
  await expect(page.locator("section.lesson-section")).toHaveCount(10);
  await fontsLoaded(page);
}

/**
 * Waits for the typefaces the site ships. Until one arrives, its text is drawn in a fallback
 * face, whose glyph boxes are smaller: on a cold first load in CI, every label in the signals
 * lesson's figures measured 10.9 pixels high, under the aesthetics test's 11, before the fonts
 * came.
 */
export async function fontsLoaded(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** The challenge's section on the page, by challenge id. */
export function challenge(page: Page, id: string): Locator {
  return page.locator(`section.challenge[data-challenge="${id}"]`);
}

export function status(c: Locator): Locator {
  return c.locator(".challenge-status");
}

/** Types text into a write-graded challenge's editor. */
export async function writeText(c: Locator, text: string): Promise<void> {
  const box = c.locator("textarea.hdl-text").first();
  await box.fill(text);
}

/** Puts text into a draw-graded challenge through its import panel, which draws it. */
export async function importText(c: Locator, text: string): Promise<void> {
  const details = c.locator("details.editor-import");
  if (!(await details.evaluate((d) => (d as HTMLDetailsElement).open))) {
    await details.locator("summary").click();
  }
  await details.locator("textarea").fill(text);
  await details.getByRole("button", { name: V.editor.importButton }).click();
  await expect(details.locator(".editor-import-note")).toContainText(V.editor.imported);
}

export async function runTests(c: Locator): Promise<void> {
  await c.getByRole("button", { name: S.challenge.run }).click();
}

export function storageKey(lessonId = LESSON.id): string {
  return `dd:v1:${lessonId}`;
}

/** A string as a regular expression that matches it exactly. */
export const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The name the editor gives a port in its accessible label: a pin's name, or "part input a". */
function portName(drawing: Drawing, ids: Map<string, string>, ref: { part: string; port: string }) {
  const part = drawing.parts.find((p) => p.id === ref.part)!;
  if (part.kind === "input" || part.kind === "output") return part.name ?? part.id;
  const outputs = drawing.wires.some((w) => w.from.part === ref.part && w.from.port === ref.port);
  return `${ids.get(ref.part)} ${outputs ? V.builder.output : V.builder.input} ${ref.port}`;
}

/**
 * Draws `drawing` in a challenge's editor the way a learner does: one press of a part button per
 * part, then one press on each end of every wire, with a pointer or, where a part placed over
 * another's port would take a pointer's press, with the keyboard. The editor names a new part as
 * `partName` does (and1, and2, selector-4_1), so the drawing's own names are mapped to the
 * editor's in order.
 */
export async function draw(
  section: Locator,
  drawing: Drawing,
  by: "pointer" | "keyboard" = "pointer",
): Promise<void> {
  const ids = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const part of drawing.parts) {
    if (part.kind === "input" || part.kind === "output") continue;
    const n = (counts.get(part.kind) ?? 0) + 1;
    counts.set(part.kind, n);
    ids.set(part.id, partName(part.kind, n));
    await section
      .getByRole("button", { name: format(V.builder.add, { label: labelFor(part.kind) }) })
      .click();
  }
  for (const w of drawing.wires) {
    for (const end of [w.from, w.to]) {
      const port = section.getByRole("button", {
        name: new RegExp(`^${escape(portName(drawing, ids, end))}\\.`),
      });
      if (by === "keyboard") await port.press("Enter");
      else await port.click();
    }
  }
  await expect(section.locator(".builder-status")).toContainText(
    V.builder.connected.split(" ")[0]!,
  );
}
