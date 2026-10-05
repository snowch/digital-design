// Copyright © 2026 Chris Snow

// The signals lesson's challenges and figures, driven through the page: each answers challenge
// completable with its reference, plausible wrong attempts rejected with the failing case, what
// the answers gave and what was expected, an unanswered field blocking the run with a sentence,
// saved work graded again on load and not bypassed through storage, a reset that clears the
// work, hints one rung at a time, and the figures' controls doing what the prose says. Each
// runs at desktop and phone widths.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { testCount } from "@dd/lesson-schema";

import {
  S,
  V,
  challenge,
  challengeData,
  format,
  lessonData,
  openLesson,
  runTests,
  status,
  storageKey,
} from "./helpers";

const LESSON = lessonData("signals");
const data = (id: string) => challengeData(id, LESSON);
const total = (id: string) => testCount(data(id));
const caseLabel = (id: string, i: number) => {
  const t = data(id).tests;
  return t.kind === "answers" ? t.cases[i]!.label : "";
};

/** Types into a typed field of an answers challenge. */
async function answer(section: Locator, field: string, value: string): Promise<void> {
  await section.locator(`[data-field="${field}"] input`).fill(value);
}

/** Presses bits of a bits field until it shows `bits` (highest first). */
async function setBits(section: Locator, field: string, bits: string): Promise<void> {
  const row = section.locator(`[data-field="${field}"]`);
  const clean = bits.replace(/\s/g, "");
  for (let i = 0; i < clean.length; i++) {
    const n = clean.length - 1 - i;
    const button = row.locator(`button[data-bit="${n}"]`);
    const pressed = (await button.getAttribute("aria-pressed")) === "true";
    if (pressed !== (clean[i] === "1")) await button.click();
  }
}

async function complete(page: Page, id: string): Promise<Locator> {
  const section = challenge(page, id);
  const ref = data(id).reference.answers!;
  for (const f of data(id).fields) {
    if (f.kind === "bits") await setBits(section, f.id, ref[f.id]!);
    else await answer(section, f.id, ref[f.id]!);
  }
  return section;
}

test.describe("the signals lesson's challenges", () => {
  for (const c of LESSON.challenges) {
    test(`${c.id} is completable with its reference answers through the page`, async ({ page }) => {
      await openLesson(page, LESSON.id);
      const section = challenge(page, c.id);
      await section.scrollIntoViewIfNeeded();
      await expect(status(section)).toHaveText(S.challenge.notRun);
      await complete(page, c.id);
      await runTests(section);
      await expect(status(section)).toHaveText(format(S.challenge.passing, { total: total(c.id) }));
      await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
    });
  }

  test("a threshold too near the 0 side fails the compressor's noise margin, with the gap shown", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "set-threshold");
    await answer(section, "threshold", "1.40");
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 3, total: total("set-threshold") }),
    );
    const failure = section.locator(".verdict-failure");
    await expect(failure).toHaveCount(1);
    await expect(failure.locator("h4")).toHaveText(caseLabel("set-threshold", 3));
    await expect(failure).toContainText("0.29 V");
    await expect(failure).toContainText("≥ 0.30 V");
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a threshold near the 1 side reads the compressor's samples wrong, and says which", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "set-threshold");
    await answer(section, "threshold", "2.40");
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 2, total: total("set-threshold") }),
    );
    const first = section.locator(".verdict-failure").first();
    await expect(first.locator("h4")).toHaveText(caseLabel("set-threshold", 1));
    await expect(first).toContainText("5, 6, 13");
  });

  test("the bits for +250 fail the signed test with what they gave and what was expected", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "freezer-word");
    await setBits(section, "bits", "0000 0000 1111 1010");
    await answer(section, "unsigned", "250");
    await answer(section, "hex", "00FA");
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 2, total: total("freezer-word") }),
    );
    const failure = section.locator(".verdict-failure");
    await expect(failure).toHaveCount(1);
    await expect(failure.locator("h4")).toHaveText(caseLabel("freezer-word", 0));
    await expect(failure.locator(".verdict-values")).toContainText("=250");
    await expect(failure.locator(".verdict-values")).toContainText("=-250");
  });

  test("empty answers block the run with a sentence naming every empty field", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "freezer-word");
    await runTests(section);
    await expect(status(section)).toHaveText(S.challenge.blocked);
    // Both empty fields are named at once, not one per run.
    for (const f of data("freezer-word").fields.slice(1))
      await expect(section.locator(".verdict-blocked")).toContainText(f.label);
  });

  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const id = "set-threshold";
    await complete(page, id);
    await runTests(challenge(page, id));
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();

    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();

    await page.evaluate(
      ([key, cid]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[cid].artifact = { answers: { threshold: "2.40" } };
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey(LESSON.id), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
    await expect(status(challenge(page, id))).toHaveText(
      format(S.challenge.failing, { passed: 2, total: total(id) }),
    );
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const id = "freezer-word";
    const section = await complete(page, id);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator('[data-field="hex"] input')).toHaveValue("");
    await expect(section.locator('[data-field="bits"] button[aria-pressed="true"]')).toHaveCount(0);
    const stored = await page.evaluate((key) => localStorage.getItem(key), storageKey(LESSON.id));
    expect(JSON.parse(stored ?? "{}").challenges?.[id]).toBeUndefined();
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "set-threshold");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await expect(section.locator(".hints-list li").first()).toContainText(S.hints.rung[0]);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "set-threshold").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("the signals lesson's figures", () => {
  test("the drawing of the sensor, the cable and the display comes first, inside the page", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const figures = page.locator("figure.interactive");
    await expect(figures.first()).toHaveAttribute("id", "ix-signal-path");
    const drawing = page.locator("#ix-signal-path svg.signal-path");
    await expect(drawing).toBeVisible();
    await expect(drawing.locator("g.step")).toHaveCount(16);
    await expect(drawing).toHaveAttribute("data-sends", "-184");
    // Drawn at the width of its box, so a phone gets the whole drawing, not a scrolling one.
    const box = await page.locator("#ix-signal-path .signal-path-wrap").boundingBox();
    const svg = await drawing.boundingBox();
    expect(svg!.width).toBeLessThanOrEqual(box!.width + 1);
  });

  test("the threshold prediction must be committed before the model answers", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-predict-threshold");
    // The samples are drawn above the question before the commit, with no threshold, no bits
    // read and no rings: nothing that answers it.
    const before = figure.locator("svg.signal-plot[data-plain]");
    await expect(before).toHaveCount(1);
    await expect(before.locator("line.threshold, .wrong-ring")).toHaveCount(0);
    await expect(figure.locator("svg.signal-plot[data-wrong]")).toHaveCount(0);
    await expect(figure.getByRole("button", { name: V.prediction.commit })).toBeDisabled();
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator(".prediction-match")).toBeVisible();
    await expect(figure.locator("svg.signal-plot[data-wrong]")).toHaveCount(2);
    await expect(before).toHaveCount(0);
    await expect(figure.locator("svg.signal-plot[data-wrong]").first()).toHaveAttribute(
      "data-wrong",
      "4,5,12",
    );
    // The plots fit the page: a drawing that took its width from itself widened the whole page on
    // a phone. Measured against the viewport, which a phone's emulation does not stretch.
    const width = page.viewportSize()!.width;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });

  test("the word's bits are drawn above the reading question, without their worths", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-predict-top");
    await expect(figure.locator(".bit-row .bit")).toHaveCount(16);
    await expect(figure.locator(".bit-row .bit-weight")).toHaveCount(0);
    await expect(figure.locator(".bit-row .bit-value").first()).toHaveText("1");
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator(".prediction-outcome .bit-weight")).toHaveCount(16);
  });

  test("the investigation's threshold and recording change what is read", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-explore-signal");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".noisy-right")).toHaveText(V.signal.allRight);
    await figure.getByRole("radio").nth(1).check();
    await expect(figure.locator(".noisy-wrong")).toContainText("5, 6, 13");
    await figure.getByRole("slider").fill("170");
    await expect(figure.locator(".noisy-right")).toHaveText(V.signal.allRight);
    await expect(figure.locator(".noisy-readout")).toContainText("0.59 V");
    await expect(figure.locator(".noisy-readout")).toContainText("0.55 V");
  });

  test("turning the noise up to 1.6 times leaves no threshold that reads every sample", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-break-signal");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".noisy-readout")).toContainText("1.12 V");
    const noise = figure.getByRole("slider").nth(1);
    await noise.fill("15");
    await expect(figure.locator(".noisy-readout")).toContainText("1.67 V");
    await noise.fill("16");
    await expect(figure.locator(".noisy-readout")).toContainText(V.signal.noBand);
    await expect(figure.locator(".noisy-readout")).toContainText("63305");
  });

  test("the display's sum of the bits is asked for first, then the same bits read signed give the sensor's reading", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const sum = page.locator("#ix-predict-sum");
    await sum.scrollIntoViewIfNeeded();
    // The bits are drawn above the question without their worths, so the sum is the reader's.
    await expect(sum.locator(".bit-row .bit")).toHaveCount(16);
    await expect(sum.locator(".bit-row .bit-weight")).toHaveCount(0);
    await sum.getByRole("radio", { name: "-184", exact: true }).check();
    await sum.getByRole("button", { name: V.prediction.commit }).click();
    await expect(sum.locator(".prediction-outcome")).toContainText("65352");
    await expect(sum.locator(".prediction-outcome .bit-weight")).toHaveCount(16);
    const signed = page.locator("#ix-signed-word");
    await expect(signed.locator('[data-reading="unsigned"] .bit-reading-value')).toHaveText(
      "65352",
    );
    await expect(signed.locator('[data-reading="signed"] .bit-reading-value')).toHaveText("-184");
    const many = page.locator("#ix-many-readings");
    await many.scrollIntoViewIfNeeded();
    await many.getByRole("radio", { name: V.readings.names.hex }).check();
    await expect(many.locator(".interp-value-number")).toHaveText("FF48");
    await many.getByRole("radio", { name: V.readings.names.lamps }).check();
    await expect(many.locator(".lamp-on")).toHaveCount(10);
  });
});
