// The page before the first lesson, in the browser: the front page leads to it, its self-check
// marks each answer and shows the model's working under a wrong one, and it ends at the first
// lesson.

import { expect, test } from "@playwright/test";

import { STRINGS } from "../../apps/course/src/strings";
import { LESSONS } from "./helpers";

test("the front page leads to a self-check that marks answers, and on to the first lesson", async ({
  page,
}) => {
  await page.goto("#/");
  await page.getByRole("link", { name: STRINGS.prefaceLink }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(STRINGS.preface.title);

  const fields = page.getByRole("textbox");
  await expect(fields).toHaveCount(4);
  await fields.nth(0).fill("178");
  await fields.nth(1).fill("100100");
  await page.getByRole("button", { name: STRINGS.selfCheck.check }).click();
  await expect(page.getByRole("status")).toHaveText(STRINGS.selfCheck.score(1, 4));
  await expect(page.getByText(STRINGS.selfCheck.right, { exact: true })).toHaveCount(1);
  await expect(
    page.getByText(STRINGS.selfCheck.workingBinary(37, "32 + 4 + 1", "0010 0101")),
  ).toBeVisible();
  await expect(page.getByText(STRINGS.selfCheck.blank, { exact: true })).toHaveCount(2);

  // Correcting an answer clears the marks until the learner checks again.
  await fields.nth(1).fill("0010 0101");
  await expect(page.getByRole("status")).toHaveText("");
  await page.getByRole("button", { name: STRINGS.selfCheck.check }).click();
  await expect(page.getByRole("status")).toHaveText(STRINGS.selfCheck.score(2, 4));

  const first = LESSONS[0]!;
  await page.getByRole("link", { name: STRINGS.preface.start(first.module, first.title) }).click();
  await expect(page.locator("section.lesson-section")).toHaveCount(10);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
});
