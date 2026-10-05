// Copyright © 2026 Chris Snow

// The look of the page, held to rules a design review would apply and to screenshots of the
// figures that matter most. The rules: no visible text smaller than 11 pixels, every control at
// least 40 pixels tall on a phone, and no line of prose longer than about 80 characters. The
// screenshots: the typefaces ship with the site and Playwright pins its Chromium, so the same
// commit renders the same everywhere; a change that alters a figure's look fails here until its
// baseline is updated on purpose (`npx playwright test --update-snapshots`).

import { expect, test, type Page } from "@playwright/test";

import { LESSONS, openLesson } from "./helpers";

async function designProblems(page: Page, phone: boolean): Promise<string[]> {
  return page.evaluate((isPhone) => {
    const out: string[] = [];
    const visible = (el: Element) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    // Text size: CSS text by its font size, SVG text by its rendered height.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set<Element>();
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      if (!el || !(node.textContent ?? "").trim() || seen.has(el)) continue;
      seen.add(el);
      if (el.closest(".visually-hidden, title")) continue;
      if (!visible(el)) continue;
      let px = parseFloat(getComputedStyle(el).fontSize);
      if (el instanceof SVGElement) px = el.getBoundingClientRect().height * 0.78;
      if (px < 11)
        out.push(`text ${px.toFixed(1)}px: "${(node.textContent ?? "").trim().slice(0, 30)}"`);
    }
    // Touch targets on a phone.
    if (isPhone) {
      for (const c of document.querySelectorAll(
        "button, select, input[type=range], a.lesson-link, label.prediction-option, label.fault-choice",
      )) {
        if (!visible(c)) continue;
        const r = c.getBoundingClientRect();
        if (r.height < 40)
          out.push(
            `control ${Math.round(r.height)}px tall: "${(c.textContent ?? "").trim().slice(0, 30)}"`,
          );
      }
    }
    // A reference table that scrolls sideways hides its last column, which says what the row does.
    for (const wrap of document.querySelectorAll(".truth-table-wrap")) {
      if (!visible(wrap)) continue;
      if (wrap.scrollWidth > wrap.clientWidth + 1)
        out.push(
          `table ${wrap.scrollWidth - wrap.clientWidth}px too wide: "${(wrap.querySelector("caption")?.textContent ?? "").slice(0, 30)}"`,
        );
    }
    // Line length of prose.
    for (const p of document.querySelectorAll(".prose p")) {
      if (!visible(p)) continue;
      const r = p.getBoundingClientRect();
      const chars = r.width / (parseFloat(getComputedStyle(p).fontSize) * 0.5);
      if (chars > 85)
        out.push(
          `line of ${Math.round(chars)} characters: "${(p.textContent ?? "").trim().slice(0, 30)}"`,
        );
    }
    return out;
  }, phone);
}

test.describe("the look of the page", () => {
  test("text is legible, controls are reachable, and prose keeps its measure", async ({
    page,
  }, info) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await designProblems(page, info.project.name === "phone"), lesson.id).toEqual([]);
    }
    // The front page and the page before the first lesson are held to the same rules.
    for (const path of ["#/", "#/start"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await designProblems(page, info.project.name === "phone"), path).toEqual([]);
    }
  });

  test("the figures that matter most look as designed", async ({ page }) => {
    await openLesson(page);
    await expect(page.locator(".lesson-header")).toHaveScreenshot("lesson-header.png", {
      maxDiffPixelRatio: 0.02,
    });
    for (const id of ["ix-two-buttons", "ix-build-two-buttons", "ix-setup-hold", "ix-table-sr"]) {
      const figure = page.locator(`#${id}`);
      await figure.scrollIntoViewIfNeeded();
      await expect(figure).toHaveScreenshot(`${id}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });
    }
  });

  test("the registers lesson's main figure looks as designed", async ({ page }) => {
    await openLesson(page, "registers");
    const figure = page.locator("#ix-keep-clear-bit");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveScreenshot("ix-keep-clear-bit.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("the signals lesson's noisy-signal figure looks as designed", async ({ page }) => {
    await openLesson(page, "signals");
    const figure = page.locator("#ix-break-signal");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveScreenshot("ix-break-signal.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  // The drawings of a lesson's question and of a sum on paper. Between them the two scenes have
  // every mark a scene draws: a room, a sensor and a lamp (gates); receivers, word wires, a
  // switch and a readout (selectors).
  test("the scenes and a sum on paper look as designed", async ({ page }) => {
    for (const [lesson, id] of [
      ["gates", "ix-alarm-scene"],
      ["selectors", "ix-rooms-scene"],
      ["adders", "ix-column-sum"],
    ] as const) {
      await openLesson(page, lesson);
      const figure = page.locator(`#${id}`);
      await figure.scrollIntoViewIfNeeded();
      await expect(figure).toHaveScreenshot(`${id}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });
    }
  });

  // Module 2
  test("Module 2's pairs figure looks as designed", async ({ page }) => {
    await openLesson(page, "fewer-gates");
    const figure = page.locator("#ix-call-pairs");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveScreenshot("ix-call-pairs.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
});
