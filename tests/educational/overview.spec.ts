// Copyright © 2026 Christopher Snow

// A large drawing wider than its box (LARGE_DRAWING, 1,000 pixels: Module 7's ALU and Module 8's
// datapath from the fetch stage on): the whole drawing small above it, which moves the drawing from
// a press, a drag or the keys, and a zoom from fitting the box to twice its size, from the buttons,
// from two fingers and from a trackpad's pinch. The branches lesson's loop stands for them all.

import { expect, test, type Page } from "@playwright/test";

import { LARGE_DRAWING } from "@dd/dd-views";

import { V, openLesson } from "./helpers";

const WIDTH = 2099;

const figure = (page: Page) => page.locator('[data-interactive="sum"]');
const drawing = (page: Page) => figure(page).locator(".circuit-scroll > svg.circuit");
const box = (page: Page) => figure(page).locator(".circuit-scroll");

async function drawnWidth(page: Page): Promise<number> {
  return (await drawing(page).boundingBox())?.width ?? 0;
}

/** Scrolls the page so the drawing's box starts `y` pixels below the window's top. */
async function boxAt(page: Page, y: number) {
  const b = await box(page).boundingBox();
  await page.evaluate((dy) => window.scrollBy(0, dy), (b?.y ?? 0) - y);
  return (await box(page).boundingBox())!;
}

test.describe("a drawing much wider than its box", () => {
  test("every large drawing wider than its box has the strip and the zoom, and no other does", async ({
    page,
  }) => {
    // A lesson whose drawings are all under the line, and two with drawings over it.
    for (const lesson of ["instructions", "fetch", "alu-jobs"]) {
      await openLesson(page, lesson);
      const views = await page.evaluate(() =>
        [...document.querySelectorAll(".circuit-view")].map((v) => {
          const scroll = v.querySelector<HTMLElement>(".circuit-scroll");
          const svg = scroll?.querySelector<SVGSVGElement>(":scope > svg.circuit");
          return {
            width: svg?.viewBox.baseVal.width ?? 0,
            room: (scroll?.clientWidth ?? 0) - 32,
            strip: v.querySelector('[role="slider"]') !== null,
          };
        }),
      );
      expect(views.length, lesson).toBeGreaterThan(0);
      for (const v of views)
        expect(v.strip, `${lesson}: a drawing ${v.width} wide in ${v.room}`).toBe(
          v.width >= LARGE_DRAWING && v.width > v.room,
        );
    }
  });

  test("has the strip and the zoom on the branches lesson's loop", async ({ page }) => {
    await openLesson(page, "branches");
    const f = figure(page);
    await expect(f.getByRole("slider", { name: V.circuit.overviewName })).toBeVisible();
    await expect(f.getByRole("button", { name: V.circuit.zoomOut })).toBeVisible();
    await expect(f.getByRole("button", { name: V.circuit.zoomIn })).toBeVisible();
    await expect(f.getByText(V.circuit.zoomNote)).toBeVisible();
    // The copy in the strip has no words, and nothing in it can be focused or named.
    await expect(f.locator(".overview-copy svg")).toHaveCount(1);
    await expect(f.locator(".overview-copy text")).toHaveCount(0);
    await expect(f.locator(".overview-copy [tabindex], .overview-copy [role]")).toHaveCount(0);
    expect(await drawnWidth(page)).toBeCloseTo(WIDTH, 0);
  });

  test("moves the drawing from the keys and from a press in the strip", async ({ page }) => {
    await openLesson(page, "branches");
    const strip = figure(page).getByRole("slider", { name: V.circuit.overviewName });
    const scrolled = () => box(page).evaluate((el) => el.scrollLeft);
    await strip.focus();
    await page.keyboard.press("End");
    const end = await scrolled();
    expect(end).toBeGreaterThan(0);
    expect(
      await box(page).evaluate((el) => el.scrollWidth - el.clientWidth - el.scrollLeft),
    ).toBeLessThanOrEqual(1);
    const last = new RegExp(
      V.circuit.overviewValue.replace("{from}", "\\d+").replace("{to}", "100"),
    );
    await expect(strip).toHaveAttribute("aria-valuetext", last);
    await page.keyboard.press("Home");
    expect(await scrolled()).toBe(0);
    await page.keyboard.press("ArrowRight");
    const half = await box(page).evaluate((el) => el.clientWidth / 2);
    expect(Math.abs((await scrolled()) - half)).toBeLessThanOrEqual(1);
    // A press near the strip's right end brings the drawing's right end into the box.
    await page.keyboard.press("Home");
    const r = (await strip.boundingBox())!;
    await strip.click({ position: { x: r.width - 3, y: r.height / 2 } });
    expect(await scrolled()).toBeGreaterThan(end - 2);
    // Scrolling the drawing moves the frame.
    await box(page).evaluate((el) => {
      el.scrollLeft = 0;
    });
    await expect
      .poll(() =>
        figure(page)
          .locator(".overview-frame")
          .evaluate((f) => f.style.transform),
      )
      .toMatch(/^translate\(0px/);
  });

  test("zooms out until the whole drawing fits its box, and in to twice its size", async ({
    page,
  }) => {
    await openLesson(page, "branches");
    const f = figure(page);
    const out = f.getByRole("button", { name: V.circuit.zoomOut });
    const into = f.getByRole("button", { name: V.circuit.zoomIn });
    for (let i = 0; i < 12 && (await out.isEnabled()); i++) await out.click();
    await expect(out).toBeDisabled();
    expect(await box(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    // Below half its size the drawing's words would be under 6 pixels, so they are hidden.
    const zoom = (await drawnWidth(page)) / WIDTH;
    const seen = await drawing(page)
      .locator("text")
      .first()
      .evaluate((t) => getComputedStyle(t).visibility);
    expect(seen).toBe(zoom < 0.5 ? "hidden" : "visible");
    for (let i = 0; i < 12 && (await into.isEnabled()); i++) await into.click();
    await expect(into).toBeDisabled();
    expect(await drawnWidth(page)).toBeCloseTo(WIDTH * 2, 0);
  });

  test("zooms with two fingers on a touch screen", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "two fingers need a touch screen");
    await openLesson(page, "branches");
    const b = await boxAt(page, 300);
    const cdp = await page.context().newCDPSession(page);
    const x = b.x + b.width / 2;
    const y = b.y + 200;
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", apart: number) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints:
          type === "touchEnd"
            ? []
            : [
                { x: x - apart / 2, y },
                { x: x + apart / 2, y },
              ],
      });
    await touch("touchStart", 200);
    for (const apart of [180, 150, 120, 90, 60]) await touch("touchMove", apart);
    await touch("touchEnd", 0);
    const w = await drawnWidth(page);
    expect(w).toBeGreaterThan(WIDTH * 0.2);
    expect(w).toBeLessThan(WIDTH * 0.5);
  });

  test("zooms with a trackpad's pinch, which comes as the wheel with Ctrl held", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "a wheel needs a mouse or a trackpad");
    await openLesson(page, "branches");
    const b = await boxAt(page, 300);
    await page.mouse.move(b.x + b.width / 2, b.y + 200);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, 50);
    await page.mouse.wheel(0, 50);
    await page.keyboard.up("Control");
    await expect.poll(() => drawnWidth(page)).toBeLessThan(WIDTH * 0.5);
    // The page itself did not move sideways, and the browser did not zoom it.
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
  });

  test("keeps the strip at the top of the window while the drawing is on screen", async ({
    page,
  }) => {
    await openLesson(page, "branches");
    await boxAt(page, -300);
    const bar = (await figure(page).locator(".overview-bar").boundingBox())!;
    expect(Math.abs(bar.y)).toBeLessThan(2);
  });
});
