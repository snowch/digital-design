// Copyright © 2026 Christopher Snow

// A large drawing wider than its box (LARGE_DRAWING, 1,000 pixels: Module 7's ALU and Module 8's
// datapath from the fetch stage on): the whole drawing small above it, which moves the drawing from
// a press, a drag or the keys, and a zoom from fitting the box to twice its size, from the buttons,
// from two fingers and from a trackpad's pinch. The branches lesson's loop stands for them all.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { LARGE_DRAWING } from "@dd/dd-views";

import { V, openLesson } from "./helpers";

const WIDTH = 2099;

const figure = (page: Page) => page.locator('[data-interactive="sum"]');
const drawing = (page: Page) => figure(page).locator(".circuit-scroll > svg.circuit");
const box = (page: Page) => figure(page).locator(".circuit-scroll");

async function drawnWidth(page: Page): Promise<number> {
  return (await drawing(page).boundingBox())?.width ?? 0;
}

/**
 * Whether `part` lies across the drawing's box `scroll`, left to right, as shown now: all of it but
 * the halo round its words, 4 pixels at most (`FIT_SLACK`).
 */
async function inBox(scroll: Locator, part: Locator): Promise<boolean> {
  const b = await scroll.boundingBox();
  const p = await part.boundingBox();
  if (!b || !p) return false;
  return p.x >= b.x - 4 && p.x + p.width <= b.x + b.width + 4;
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
    // Nor does it answer a query meant for the drawing: a part's path or kind, a wire's net.
    await expect(
      f.locator(
        ".overview-copy [data-path], .overview-copy [data-net], .overview-copy .part-composite",
      ),
    ).toHaveCount(0);
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

  test("steps down to half its size, back through its own size, and up to twice", async ({
    page,
  }) => {
    await openLesson(page, "branches");
    const f = figure(page);
    const out = f.getByRole("button", { name: V.circuit.zoomOut });
    const into = f.getByRole("button", { name: V.circuit.zoomIn });
    const sizes: number[] = [];
    for (let i = 0; i < 6 && (await out.isEnabled()); i++) {
      await out.click();
      sizes.push(Math.round(((await drawnWidth(page)) / WIDTH) * 100));
    }
    await expect(out).toBeDisabled();
    expect(sizes).toEqual([75, 50]);
    // At half its size the drawing's words would be 6 pixels high, so they are hidden.
    const seen = () =>
      drawing(page)
        .locator("text")
        .first()
        .evaluate((t) => getComputedStyle(t).visibility);
    expect(await seen()).toBe("hidden");
    sizes.length = 0;
    for (let i = 0; i < 6 && (await into.isEnabled()); i++) {
      await into.click();
      sizes.push(Math.round(((await drawnWidth(page)) / WIDTH) * 100));
    }
    await expect(into).toBeDisabled();
    expect(sizes).toEqual([75, 100, 150, 200]);
    expect(await seen()).toBe("visible");
  });

  test("a drag in the strip moves the drawing across and never moves the page", async ({
    page,
  }) => {
    await openLesson(page, "branches");
    // The strip in its own place, above the drawing, not yet held at the top of the window.
    const strip = figure(page).getByRole("slider", { name: V.circuit.overviewName });
    await strip.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -120));
    const r = (await strip.boundingBox())!;
    const y = r.y + r.height - 4;
    await page.mouse.move(r.x + 10, y);
    await page.mouse.down();
    const pressed = await page.evaluate(() => window.scrollY);
    for (let x = 20; x < r.width - 10; x += 20) await page.mouse.move(r.x + x, y);
    await page.mouse.up();
    expect(await page.evaluate(() => window.scrollY)).toBe(pressed);
    expect(await box(page).evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
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
    for (const apart of [190, 175, 160, 140]) await touch("touchMove", apart);
    await touch("touchEnd", 0);
    // Fingers 200 pixels apart, then 140: the drawing at about 0.7 of its size.
    const w = await drawnWidth(page);
    expect(w).toBeGreaterThan(WIDTH * 0.6);
    expect(w).toBeLessThan(WIDTH * 0.8);
  });

  test("zooms with a trackpad's pinch, which comes as the wheel with Ctrl held", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "a wheel needs a mouse or a trackpad");
    await openLesson(page, "branches");
    const b = await boxAt(page, 300);
    await page.mouse.move(b.x + b.width / 2, b.y + 200);
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, 30);
    await page.keyboard.up("Control");
    await expect.poll(() => drawnWidth(page)).toBeLessThan(WIDTH * 0.85);
    expect(await drawnWidth(page)).toBeGreaterThan(WIDTH * 0.6);
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

test.describe("a wide drawing opens on what its words name", () => {
  test("the loop opens on the blocks that make NEXT, with the strip's frame on them", async ({
    page,
  }) => {
    await openLesson(page, "branches");
    await figure(page).scrollIntoViewIfNeeded();
    for (const name of ["condition", "next"])
      await expect
        .poll(() => inBox(box(page), drawing(page).locator(`[data-path="${name}"]`)), name)
        .toBe(true);
    // The box is scrolled, at a phone's width and a desktop's, and the frame stands where it is.
    expect(await box(page).evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect
      .poll(() =>
        figure(page)
          .locator(".overview-frame")
          .evaluate((f) => f.style.transform),
      )
      .not.toMatch(/^translate\(0px/);
  });

  test("the 64-bit ALU opens on two of the groups its lead asks the learner to press", async ({
    page,
  }) => {
    await openLesson(page, "wide-alu");
    const f = page.locator('[data-interactive="levels-64"]');
    await f.scrollIntoViewIfNeeded();
    const scroll = f.locator(".circuit-scroll");
    for (const name of ["g0", "g1"])
      await expect
        .poll(() => inBox(scroll, scroll.locator(`svg.circuit [data-path="${name}"]`)), name)
        .toBe(true);
  });

  test("a fault chosen far along the drawing comes into view, held wire and all", async ({
    page,
  }) => {
    await openLesson(page, "alu-jobs");
    const f = page.locator('[data-interactive="job-faults"]');
    await f.scrollIntoViewIfNeeded();
    const scroll = f.locator(".circuit-scroll");
    await f.getByRole("radio", { name: "C2 stuck at 0" }).check();
    // C2 runs from bit1's carry out to bit2's carry in, 600 pixels in: off a phone's first view.
    const held = scroll.locator('svg.circuit .wire-held[data-net="C2"]').first();
    await expect.poll(() => inBox(scroll, held)).toBe(true);
    for (const name of ["bit1", "bit2"])
      expect(await inBox(scroll, scroll.locator(`svg.circuit [data-path="${name}"]`)), name).toBe(
        true,
      );
    // A datapath figure brings its fault first, then its own parts as far as they fit.
    await openLesson(page, "memory-access");
    const m = page.locator('[data-interactive="memory-faults"]');
    await m.scrollIntoViewIfNeeded();
    await m.getByRole("radio", { name: "LOAD stuck at 0" }).check();
    const mScroll = m.locator(".circuit-scroll");
    for (const name of ["memory", "pickLoad"])
      await expect
        .poll(() => inBox(mScroll, mScroll.locator(`svg.circuit [data-path="${name}"]`)), name)
        .toBe(true);
  });
});
