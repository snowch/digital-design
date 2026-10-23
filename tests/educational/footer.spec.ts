// Copyright © 2026 Christopher Snow

import { MAIN_REF_URL, expect, test } from "./fixtures";

test("the footer ticks an exact match and removes the tick when main advances", async ({
  page,
}) => {
  let latest = "0".repeat(40);
  await page.route(MAIN_REF_URL, (route) => route.fulfill({ json: { object: { sha: latest } } }));
  await page.goto("#/");
  const footer = page.locator("footer");
  const link = footer.locator("a");
  const href = await link.getAttribute("href");
  const commit = href!.split("/").at(-1)!;
  expect(commit).toMatch(/^[0-9a-f]{40}$/);
  await expect(link).toHaveText(commit.slice(0, 7));
  await expect(footer.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
  const tick = footer.getByRole("img", { name: "Latest commit on main" });
  await expect(tick).toHaveCount(0);

  latest = commit;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(tick).toBeVisible();

  latest = "0".repeat(40);
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(tick).toHaveCount(0);
});

test("an unavailable main ref leaves the footer usable without a tick", async ({ page }) => {
  await page.route(MAIN_REF_URL, (route) =>
    route.fulfill({ status: 403, json: { message: "API rate limit exceeded" } }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const checked = page.waitForResponse(MAIN_REF_URL);
  await page.goto("#/");
  await checked;
  const footer = page.locator("footer");
  await expect(footer.locator("a")).toBeVisible();
  await expect(footer.locator("time")).toBeVisible();
  await expect(footer.getByRole("img", { name: "Latest commit on main" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
