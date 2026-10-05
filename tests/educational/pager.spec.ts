// Copyright © 2026 Chris Snow

// The links at the bottom of a lesson, in the browser, at both widths: from the keyboard they lead
// on to the next lesson and back again, each opening at its top; the first lesson leads back to
// the page before it, and the last lesson written so far leads back to the list of lessons.

import { expect, test, type Page } from "@playwright/test";

import { STRINGS } from "../../apps/course/src/strings";
import { LESSONS, openLesson } from "./helpers";

function pager(page: Page) {
  return page.getByRole("navigation", { name: STRINGS.pager.label, exact: true });
}

async function press(page: Page, rel: "prev" | "next" | "back") {
  const link =
    rel === "back"
      ? pager(page).getByRole("link", { name: STRINGS.backToLessons })
      : pager(page).locator(`a[rel="${rel}"]`);
  await link.focus();
  await page.keyboard.press("Enter");
}

test("the links at the bottom of a lesson lead on and back, from the keyboard", async ({
  page,
}) => {
  const [first, second] = LESSONS;
  await openLesson(page, first!.id);
  await expect(pager(page).getByRole("link")).toHaveCount(2);

  await press(page, "next");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(second!.title);
  await expect(page.locator("section.lesson-section")).toHaveCount(10);
  // The next lesson starts at its top, not where the last one was left.
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await press(page, "prev");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first!.title);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10);

  // Before the first lesson is the page before it.
  await press(page, "prev");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(STRINGS.preface.title);
});

test("the last lesson written so far leads back to the list of lessons", async ({ page }) => {
  const last = LESSONS[LESSONS.length - 1]!;
  await openLesson(page, last.id);
  await expect(pager(page)).toContainText(STRINGS.pager.notYet);
  await press(page, "back");
  // The list of lessons is the one page that links to the page before the first lesson this way.
  await expect(page.getByRole("link", { name: STRINGS.prefaceLink })).toBeVisible();
  await expect(page.getByRole("link", { name: last.title })).toBeVisible();
});
