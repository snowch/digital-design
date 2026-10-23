// Copyright © 2026 Christopher Snow

import { expect, test, type Page } from "./fixtures";
import { challenge } from "./helpers";
import { updateServer } from "./update-server";

test.use({ serviceWorkers: "allow" });

async function installed(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((done) =>
        navigator.serviceWorker.addEventListener("controllerchange", () => done(), { once: true }),
      );
    }
  });
}

async function checkForUpdate(page: Page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration!.update();
  });
}

const release = (page: Page) => page.locator('meta[name="test-release"]');
const updateButton = (page: Page) =>
  page.getByRole("button", { name: "Update and reload", exact: true });

test("a downloaded update waits, then reloads only the chosen tab and retains work offline", async ({
  page,
  context,
}) => {
  const server = await updateServer();
  try {
    await page.goto(`${server.url}#/lesson/remember`);
    await installed(page);
    await expect(updateButton(page)).toHaveCount(0);
    const oldAsset = await page.evaluate(async () => {
      const name = (await caches.keys()).find((key) => key.startsWith("dd-course:"))!;
      const url = new URL("assets/old-release-only.txt", window.location.href).href;
      await (await caches.open(name)).put(url, new Response("old release asset"));
      await caches.open("another-book-cache");
      return url;
    });
    const editor = challenge(page, "latch-in-text").locator("textarea");
    await editor.fill("// my unfinished circuit");
    const other = await context.newPage();
    await other.goto(`${server.url}#/lesson/remember`);
    await installed(other);

    server.next();
    await checkForUpdate(page);
    await expect(updateButton(page)).toBeVisible();
    await expect(updateButton(other)).toBeVisible();
    expect((await updateButton(page).boundingBox())!.height).toBeGreaterThanOrEqual(40);
    await test.info().attach("update-notice", {
      body: await page.locator(".update-notice").screenshot(),
      contentType: "image/png",
    });
    await page.reload();
    await expect(release(page)).toHaveAttribute("content", "1");
    await expect(editor).toHaveValue("// my unfinished circuit");
    await expect(updateButton(page)).toBeVisible();
    await updateButton(page).click();
    await expect(release(page)).toHaveAttribute("content", "2");
    await expect(editor).toHaveValue("// my unfinished circuit");
    await expect(updateButton(page)).toHaveCount(0);

    await expect(release(other)).toHaveAttribute("content", "1");
    expect(await other.evaluate(async (url) => (await fetch(url)).text(), oldAsset)).toBe(
      "old release asset",
    );
    expect(await other.evaluate(() => caches.keys())).toContain("another-book-cache");
    await expect(updateButton(other)).toBeVisible();
    await updateButton(other).click();
    await expect(release(other)).toHaveAttribute("content", "2");
    await expect(challenge(other, "latch-in-text").locator("textarea")).toHaveValue(
      "// my unfinished circuit",
    );
    await context.setOffline(true);
    await page.reload();
    await expect(release(page)).toHaveAttribute("content", "2");
    await expect(editor).toHaveValue("// my unfinished circuit");
  } finally {
    await context.setOffline(false);
    await server.close();
  }
});

test("closing every tab lets a waiting update activate without a button press", async ({
  page,
  context,
}) => {
  const server = await updateServer();
  try {
    await page.goto(server.url);
    await installed(page);
    server.next();
    const installing = context.waitForEvent("serviceworker");
    await checkForUpdate(page);
    const worker = await installing;
    await expect(updateButton(page)).toBeVisible();
    await page.close();
    await expect
      .poll(() =>
        worker.evaluate(
          "self.registration.waiting === null && self.registration.active?.state === 'activated'",
        ),
      )
      .toBe(true);
    const reopened = await context.newPage();
    await reopened.goto(server.url);
    await expect(release(reopened)).toHaveAttribute("content", "2");
    await expect(updateButton(reopened)).toHaveCount(0);
  } finally {
    await server.close();
  }
});

test("an incomplete download keeps the working release and offers no update button", async ({
  page,
}) => {
  const server = await updateServer();
  try {
    await page.goto(server.url);
    await installed(page);
    server.next();
    server.fail(true);
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const failed = new Promise<void>((done) => {
        registration!.addEventListener(
          "updatefound",
          () => {
            const worker = registration!.installing!;
            worker.addEventListener("statechange", () => {
              if (worker.state === "redundant") done();
            });
          },
          { once: true },
        );
      });
      await registration!.update();
      await failed;
    });
    await expect(updateButton(page)).toHaveCount(0);
    await page.reload();
    await expect(release(page)).toHaveAttribute("content", "1");
    server.fail(false);
    await checkForUpdate(page);
    await expect(updateButton(page)).toBeVisible();
    await updateButton(page).click();
    await expect(release(page)).toHaveAttribute("content", "2");
  } finally {
    await server.close();
  }
});

test("an update leaves the tab open if a draft cannot be saved", async ({ page }) => {
  const server = await updateServer();
  try {
    await page.goto(`${server.url}#/lesson/remember`);
    await installed(page);
    await page.evaluate(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });
    const editor = challenge(page, "latch-in-text").locator("textarea");
    await editor.fill("// work held in this tab");
    server.next();
    await checkForUpdate(page);
    await expect(updateButton(page)).toBeVisible();
    await updateButton(page).click();
    await expect(page.getByRole("alert")).toContainText("Your work could not be saved");
    await expect(release(page)).toHaveAttribute("content", "1");
    await expect(editor).toHaveValue("// work held in this tab");
    await expect(updateButton(page)).toBeEnabled();
  } finally {
    await server.close();
  }
});
