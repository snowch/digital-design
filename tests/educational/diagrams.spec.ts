// The diagrams, checked as drawings: no label in any timing diagram or circuit drawing on the
// page overlaps another or leaves its drawing, at desktop and phone widths, before and after the
// figures have been used. A diagram whose text collides fails a learner however right its data.

import { expect, test, type Page } from "@playwright/test";

import { LESSONS, V, format, openLesson } from "./helpers";

interface Collision {
  readonly figure: string;
  readonly problem: string;
}

/** Every pair of overlapping text labels and every label outside its drawing, by figure. */
async function textCollisions(page: Page): Promise<Collision[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
    const svgs = document.querySelectorAll<SVGSVGElement>(
      "svg.timing-diagram, svg.timing-lanes, svg.circuit",
    );
    for (const svg of svgs) {
      const figure = svg.closest("figure")?.id ?? svg.className.baseVal;
      const box = svg.getBoundingClientRect();
      const labels = [...svg.querySelectorAll("text")]
        .filter((t) => (t.textContent ?? "").trim() !== "")
        .map((t) => ({ text: (t.textContent ?? "").trim(), r: t.getBoundingClientRect() }));
      for (let i = 0; i < labels.length; i++) {
        const a = labels[i]!;
        if (
          a.r.left < box.left - 1 ||
          a.r.right > box.right + 1 ||
          a.r.top < box.top - 1 ||
          a.r.bottom > box.bottom + 1
        ) {
          out.push({ figure, problem: `"${a.text}" leaves the drawing` });
        }
        for (let j = i + 1; j < labels.length; j++) {
          const b = labels[j]!;
          const overlap =
            a.r.left < b.r.right - 1 &&
            b.r.left < a.r.right - 1 &&
            a.r.top < b.r.bottom - 1 &&
            b.r.top < a.r.bottom - 1;
          if (overlap) out.push({ figure, problem: `"${a.text}" overlaps "${b.text}"` });
        }
      }
    }
    return out;
  });
}

test.describe("the diagrams", () => {
  test("no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    await openLesson(page);
    expect(await textCollisions(page)).toEqual([]);

    // Use the figures: commit both predictions so their timing diagrams appear, press the
    // two-button circuit, move the stepper, move D in the setup-and-hold figure, and open a block.
    for (const id of ["ix-predict-two", "ix-predict-three"]) {
      const figure = page.locator(`#${id}`);
      await figure.getByRole("radio").nth(1).check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("svg.timing-diagram")).toBeVisible();
    }
    const buttons = page.locator("#ix-two-buttons");
    await buttons.getByRole("button", { name: /^A = 0\./ }).click();
    const internals = page.locator("#ix-internals");
    await internals.scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++)
      await internals.getByRole("button", { name: V.internals.next }).click();
    await internals.getByRole("button", { name: /master\. / }).click();
    const setupHold = page.locator("#ix-setup-hold");
    await setupHold.getByRole("slider").fill("-20");
    await setupHold.getByRole("button", { name: V.setupHold.draw }).click();
    expect(await textCollisions(page)).toEqual([]);
  });

  test("the registers lesson: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    await openLesson(page, "registers");
    expect(await textCollisions(page)).toEqual([]);

    // Commit the three predictions, press pins and the clock, open a flip-flop, run the faults.
    for (const id of ["ix-predict-word", "ix-predict-keep", "ix-predict-chain"]) {
      const figure = page.locator(`#${id}`);
      await figure.getByRole("radio").nth(1).check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("svg.timing-diagram")).toBeVisible();
    }
    const four = page.locator("#ix-four-flip-flops");
    await four.getByRole("button", { name: /^D1 = 0\./ }).click();
    await four.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    const bit = page.locator("#ix-keep-clear-bit");
    await bit.getByRole("button", { name: /^RST = 0\./ }).click();
    await bit.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    const faults = page.locator("#ix-keep-faults");
    await faults.getByRole("radio").nth(3).check();
    await faults.getByRole("button", { name: V.fault.run }).click();
    expect(await textCollisions(page)).toEqual([]);
    await four.getByRole("button", { name: /ff2\. / }).click();
    expect(await textCollisions(page)).toEqual([]);
  });

  test("every lesson's diagrams are clear as first drawn", async ({ page }) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await textCollisions(page), lesson.id).toEqual([]);
    }
  });
});
