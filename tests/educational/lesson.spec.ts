// The educational tests: every lesson renders whole; every challenge is completable through the
// page with its reference solution and rejects a wrong attempt with a diagnosis; completion is
// recomputed on load and cannot be bypassed through storage; a reset clears the work; the one
// random element replays identically. Each runs at desktop and phone widths.

import { expect, test, type Page } from "@playwright/test";

import {
  LESSON,
  LESSONS,
  S,
  V,
  challenge,
  challengeData,
  format,
  importText,
  openLesson,
  runTests,
  status,
  storageKey,
  writeText,
} from "./helpers";

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test.describe("the lesson pages", () => {
  for (const lesson of LESSONS) {
    test(`${lesson.id} renders its ten sections and every figure, with no errors`, async ({
      page,
    }) => {
      const errors = watchConsole(page);
      await openLesson(page, lesson.id);
      const figures = lesson.sections.flatMap((s) => s.interactives);
      await expect(page.locator("figure.interactive")).toHaveCount(figures.length);
      await expect(page.locator(".interactive-problem, .interactive-missing")).toHaveCount(0);
      await expect(page.locator("section.challenge")).toHaveCount(lesson.challenges.length);
      // The page fits the viewport: no horizontal scroll.
      const [scrollWidth, clientWidth] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ]);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      expect(errors).toEqual([]);
    });
  }

  test("the lesson list shows progress recomputed from stored work", async ({ page }) => {
    await page.goto("#/");
    await expect(page.getByRole("link", { name: LESSON.title })).toBeVisible();
    await expect(page.locator(".lesson-list .meta").first()).toContainText(
      `0 of ${LESSON.challenges.length}`,
    );
  });
});

test.describe("challenges", () => {
  for (const c of LESSON.challenges) {
    test(`${c.id} is completable with its reference solution through the page`, async ({
      page,
    }) => {
      await openLesson(page);
      const section = challenge(page, c.id);
      await section.scrollIntoViewIfNeeded();
      await expect(status(section)).toHaveText(S.challenge.notRun);
      const text = c.reference.hdl!;
      if (c.gradedDirection === "write") await writeText(section, text);
      else await importText(section, text);
      await runTests(section);
      const total = c.tests.kind === "sequence" ? c.tests.steps.length : c.tests.vectors.length;
      await expect(status(section)).toHaveText(format(S.challenge.passing, { total }));
      await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
    });
  }

  test("a wrong attempt is rejected with the failing step and the gate where it went wrong", async ({
    page,
  }) => {
    await openLesson(page);
    const section = challenge(page, "latch-in-text");
    await writeText(
      section,
      `module follow_and_hold(input logic D, input logic EN, output logic Q);
  assign Q = D;
endmodule`,
    );
    await runTests(section);
    await expect(status(section)).toHaveText(format(S.challenge.failing, { passed: 4, total: 6 }));
    const failures = section.locator(".verdict-failure");
    await expect(failures).toHaveCount(2);
    await expect(failures.first().locator("h4")).toHaveText("EN low, D high");
    await expect(failures.first()).toContainText("Q");
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("the two-button circuit can be drawn with the keyboard alone", async ({ page }) => {
    await openLesson(page);
    const section = challenge(page, "two-buttons");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: format(V.builder.add, { label: "NOR" }) }).click();
    await section.getByRole("button", { name: format(V.builder.add, { label: "NOR" }) }).click();
    const wire = async (from: RegExp, to: RegExp) => {
      await section.getByRole("button", { name: from }).focus();
      await page.keyboard.press("Enter");
      await section.getByRole("button", { name: to }).focus();
      await page.keyboard.press("Enter");
    };
    await wire(/^B\./, /^nor1 input a\./);
    await wire(/^nor2 output y\./, /^nor1 input b\./);
    await wire(/^A\./, /^nor2 input b\./);
    await wire(/^nor1 output y\./, /^nor2 input a\./);
    await wire(/^nor1 output y\./, /^LIGHT\./);
    await runTests(section);
    await expect(status(section)).toHaveText(format(S.challenge.passing, { total: 6 }));
  });

  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page);
    const c = challengeData("latch-in-text");
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();

    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await expect(status(challenge(page, c.id))).toHaveText(
      format(S.challenge.passing, { total: 6 }),
    );

    // Tamper: keep the mark, break the work.
    await page.evaluate(
      ([key, id]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[id].artifact = {
          hdl: "module follow_and_hold(input logic D, input logic EN, output logic Q);\n assign Q = D;\nendmodule",
        };
        stored.challenges[id].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey(), c.id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toHaveCount(0);
    await expect(status(challenge(page, c.id))).toHaveText(
      format(S.challenge.failing, { passed: 4, total: 6 }),
    );
    await expect(page.getByRole("link", { name: "Lessons" })).toBeVisible();
    await page.goto("#/");
    await expect(page.locator(".lesson-list .meta").first()).toContainText(
      `0 of ${LESSON.challenges.length}`,
    );
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page);
    const c = challengeData("latch-in-text");
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetCancel }).click();
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(c.initial.hdl ?? "");
    const stored = await page.evaluate((key) => localStorage.getItem(key), storageKey());
    expect(JSON.parse(stored ?? "{}").challenges?.[c.id]).toBeUndefined();
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page);
    const c = challengeData("two-buttons");
    const section = challenge(page, c.id);
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await expect(section.locator(".hints-list li").first()).toContainText(S.hints.rung[0]);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, c.id).locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("the figures", () => {
  test("a prediction must be committed before the simulator answers", async ({ page }) => {
    await openLesson(page);
    const figure = page.locator("#ix-predict-two");
    const commit = figure.getByRole("button", { name: V.prediction.commit });
    await expect(commit).toBeDisabled();
    await figure.getByRole("radio").nth(1).check();
    await commit.click();
    await expect(figure.locator("[role=status]")).toContainText(
      format(V.prediction.circuitDid, { signal: "q", value: "1" }),
    );
    await expect(figure.locator("[role=status]")).toContainText(V.prediction.match);
    await figure.getByRole("button", { name: V.prediction.again }).click();
    await expect(figure.locator("[role=status]")).toHaveCount(0);
  });

  test("the explorer's inputs are buttons that change the drawing and the table", async ({
    page,
  }) => {
    await openLesson(page);
    const figure = page.locator("#ix-two-buttons");
    await figure.scrollIntoViewIfNeeded();
    const table = figure.locator("table.signal-table");
    await expect(table).toContainText("LIGHT");
    await figure.getByRole("button", { name: /^A = 0\./ }).click();
    await expect(figure.getByRole("button", { name: /^A = 1\./ })).toBeVisible();
    await expect(table.locator("tbody tr").last()).toContainText("1");
  });

  test("the setup-and-hold roll is recorded and replays identically", async ({ browser }) => {
    const roll = async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("#/lesson/remember");
      await expect(page.locator("section.lesson-section")).toHaveCount(10);
      const figure = page.locator("#ix-setup-hold");
      await figure.scrollIntoViewIfNeeded();
      await figure.getByRole("slider").fill("-15");
      await figure.getByRole("button", { name: V.setupHold.draw }).click();
      const text = await figure.locator(".setup-hold-result").textContent();
      await context.close();
      return text;
    };
    const first = await roll();
    const second = await roll();
    expect(first).toBe(second);
    expect(first).toMatch(/1$|0$|at \d+\.$/);
  });

  test("the flip-flop stepper moves the cursor and shows the phase for that moment", async ({
    page,
  }) => {
    await openLesson(page);
    const figure = page.locator("#ix-internals");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".internals-phase")).toContainText("CLK is 0 from time 0");
    const next = figure.getByRole("button", { name: V.internals.next });
    for (let i = 0; i < 12; i++) {
      const t = Number((await figure.locator(".internals-time").textContent())?.replace(/\D/g, ""));
      if (t >= 100) break;
      await next.click();
    }
    await expect(figure.locator(".internals-phase")).toContainText("CLK rose at time 100");
  });
});
