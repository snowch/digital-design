// Shared helpers for the educational tests: the lesson page, its challenges, and the words the
// page uses, taken from the same modules the app renders from, so a wording change moves both.

import { expect, type Locator, type Page } from "@playwright/test";

import { LESSONS } from "@dd/content";
import { DEFAULT_VIEW_STRINGS as V, format } from "@dd/dd-views";
import { DEFAULT_STRINGS as S } from "@dd/lesson-runtime";

export { S, V, format, LESSONS };

export const LESSON = LESSONS.find((l) => l.id === "remember")!;

export function challengeData(id: string) {
  const c = LESSON.challenges.find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  return c;
}

export async function openLesson(page: Page, lessonId = LESSON.id): Promise<void> {
  await page.goto(`#/lesson/${lessonId}`);
  await expect(page.locator("section.lesson-section")).toHaveCount(10);
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
