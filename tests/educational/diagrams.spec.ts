// The diagrams, checked as drawings: no label in any timing diagram or circuit drawing on the
// page overlaps another or leaves its drawing, at desktop and phone widths, before and after the
// figures have been used. A diagram whose text collides fails a learner however right its data.

import { expect, test, type Page } from "@playwright/test";

import { V, openLesson } from "./helpers";

interface Collision {
  readonly figure: string;
  readonly problem: string;
}

/** Every pair of overlapping text labels and every label outside its drawing, by figure. */
async function textCollisions(page: Page): Promise<Collision[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
    const svgs = document.querySelectorAll<SVGSVGElement>("svg.timing-diagram, svg.circuit");
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
});
