// Copyright © 2026 Christopher Snow

import { expect, test } from "./fixtures";

test("reading marks persist, update the contents, and never change challenge results", async ({
  page,
  context,
}) => {
  await page.goto("#/lesson/signals");
  const checkbox = page.getByRole("checkbox", { name: "Mark lesson as done" });
  await expect(checkbox).not.toBeChecked();
  const work = await page.evaluate(() => localStorage.getItem("dd:v1:signals"));
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem("dd:v1:signals"))).toBe(work);
  expect((await checkbox.locator("..").boundingBox())!.height).toBeGreaterThanOrEqual(40);
  await page.reload();
  await expect(checkbox).toBeChecked();

  const other = await context.newPage();
  await other.goto(page.url());
  const otherCheckbox = other.getByRole("checkbox", { name: "Mark lesson as done" });
  await expect(otherCheckbox).toBeChecked();
  await otherCheckbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(otherCheckbox).toBeChecked();
  await other.close();

  await page.getByRole("link", { name: "Lessons", exact: true }).click();
  const entry = page.locator('.lesson-list a[href="#/lesson/signals"]');
  await expect(entry.getByRole("img", { name: "Lesson done" })).toBeVisible();
  await entry.click();
  await checkbox.uncheck();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
  await page.getByRole("link", { name: "Lessons", exact: true }).click();
  await expect(entry.getByRole("img", { name: "Lesson done" })).toHaveCount(0);
});

test("going to the next lesson does not mark a lesson as done", async ({ page }) => {
  await page.goto("#/lesson/signals");
  await page.locator('.lesson-pager a[rel="next"]').click();
  await expect(page.getByRole("checkbox", { name: "Mark lesson as done" })).not.toBeChecked();
  expect(
    await page.evaluate(() => localStorage.getItem("dd:v1:manual-completion:signals")),
  ).toBeNull();
});
