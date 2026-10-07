// Copyright © 2026 Christopher Snow

// Module 0, meet the machine, in a browser: every challenge completed with its reference through
// the page and a wrong answer rejected naming the failing test; saved work graded again on load;
// the machine at work used as a learner uses it (a prediction committed, a line run, a reading
// changed, a run paused and finished, a stuck wire chosen); the ladder walked to its foot. Each
// runs at desktop and phone widths. A run of the whole machine is a run on its gates, so these
// tests keep to what only a browser shows.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { testCount } from "@platform/lesson-schema";

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
} from "./helpers";

const FIRST = lessonData("what-computers-do");
const SECOND = lessonData("inside-the-machine");
const M = V.meet;

/** Fills an answers challenge's fields: a typed number or text, or a chosen option. */
async function fill(section: Locator, answers: Readonly<Record<string, string>>): Promise<void> {
  for (const [field, value] of Object.entries(answers)) {
    const at = section.locator(`[data-field="${field}"]`);
    if ((await at.locator("select").count()) > 0) await at.locator("select").selectOption(value);
    else await at.locator("input").fill(value);
  }
}

/** Runs a challenge with answers and waits for its verdict. */
async function attempt(page: Page, id: string, answers: Readonly<Record<string, string>>) {
  const section = challenge(page, id);
  await section.scrollIntoViewIfNeeded();
  await fill(section, answers);
  await runTests(section);
  return section;
}

for (const lesson of [FIRST, SECOND]) {
  test.describe(`${lesson.id}'s challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference through the page`, async ({ page }) => {
        test.setTimeout(120_000);
        await openLesson(page, lesson.id);
        const section = await attempt(page, c.id, c.reference.answers!);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
          { timeout: 30_000 },
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

test.describe("Module 0's challenges reject a wrong answer and re-grade on load", () => {
  test("the limit: 51 leaves CLASH dark at a gap of 50, and that test is named", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, FIRST.id);
    const c = challengeData("limit", FIRST);
    const section = await attempt(page, c.id, { limit: "51" });
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 2, total: testCount(c) }),
      { timeout: 30_000 },
    );
    const t = c.tests.kind === "answers" ? c.tests.cases : [];
    await expect(section.locator(".verdict-failure h4")).toHaveText(t[1]!.label);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("the trace: the memory named as the part fails one test; the right answer survives a reload", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, SECOND.id);
    const c = challengeData("trace", SECOND);
    let section = await attempt(page, c.id, { ...c.reference.answers!, part: "memory" });
    await expect(status(section)).toHaveText(format(S.challenge.failing, { passed: 3, total: 4 }), {
      timeout: 30_000,
    });
    await fill(section, { part: "adder" });
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible({ timeout: 30_000 });
    await page.reload();
    section = challenge(page, c.id);
    await expect(section.locator(".challenge-complete")).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("the machine at work", () => {
  test("a prediction hides the values and the buttons until it is committed", async ({ page }) => {
    await openLesson(page, FIRST.id);
    const figure = page.locator("#ix-predict-lines");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: M.step })).toHaveCount(0);
    await expect(figure.locator(".meet-numbers")).toBeHidden();
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.getByRole("button", { name: M.step })).toBeVisible();
  });

  test("a line at a time: the next line moves, the changed number is marked, the display shows 66", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, FIRST.id);
    const figure = page.locator("#ix-run");
    await figure.scrollIntoViewIfNeeded();
    const step = figure.getByRole("button", { name: M.step });
    await expect(figure.locator(".datapath-status")).toHaveText(format(M.status.next, { line: 1 }));
    await step.click();
    await expect(figure.locator(".datapath-status")).toHaveText(format(M.status.next, { line: 2 }));
    await expect(figure.locator(".meet-numbers tr.row-current th")).toHaveText("R1");
    await expect(figure.locator(".meet-numbers tr.row-current td").first()).toHaveText("-184");
    for (let k = 0; k < 3; k++) await step.click();
    await expect(figure.locator(".meet-shop tr").first()).toContainText("66");
    // The run goes on a line at a time and can be paused, then finished.
    await figure.getByRole("button", { name: M.run, exact: true }).click();
    await figure.getByRole("button", { name: M.pause, exact: true }).click();
    await figure.getByRole("button", { name: M.run, exact: true }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(M.status.stopped, { line: 9 }),
      { timeout: 30_000 },
    );
    await expect(figure.locator(".meet-shop")).toContainText(format(M.lamp, { name: "CLASH" }));
    await expect(step).toBeDisabled();
  });

  test("a reading changed, the same program lights CLASH and shows 200", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, FIRST.id);
    const figure = page.locator("#ix-run");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("spinbutton", { name: M.roomA }).fill("-50");
    await figure.getByRole("button", { name: M.run, exact: true }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(M.status.stopped, { line: 9 }),
      { timeout: 30_000 },
    );
    const shop = figure.locator(".meet-shop tr");
    await expect(shop.first()).toContainText("200");
    await expect(shop.last()).toContainText(M.lit);
  });

  test("the stuck wire puts 64 on the display, and its outcome shows once it has run", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, SECOND.id);
    const figure = page.locator("#ix-stuck");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: M.run, exact: true }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(M.status.stopped, { line: 9 }),
      { timeout: 30_000 },
    );
    await expect(figure.locator(".meet-shop tr").first()).toContainText("64");
  });
});

test.describe("lines kept as numbers", () => {
  test("changing line 5's number changes line 5's kept number, and only that", async ({ page }) => {
    await openLesson(page, FIRST.id);
    const figure = page.locator("#ix-kept");
    await figure.scrollIntoViewIfNeeded();
    const row = figure.locator(".meet-program tbody tr").nth(4);
    await expect(row).toContainText("620773476");
    await figure.getByRole("spinbutton", { name: M.limitLabel }).fill("101");
    await expect(row).toContainText("620773477");
    await expect(figure.locator(".meet-program tbody tr").nth(5)).toContainText("1446248451");
  });
});

test.describe("the ladder", () => {
  test("goes down from line 3 to one wire, high, a level at a time", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, SECOND.id);
    const figure = page.locator("#ix-ladder");
    await figure.scrollIntoViewIfNeeded();
    const levels = (
      SECOND.sections.flatMap((s) => s.interactives).find((x) => x.id === "ladder")!.props as {
        levels: unknown[];
      }
    ).levels;
    await expect(figure.locator(".ladder-reading")).toHaveText(
      format(M.ladder.number, { value: "66" }),
    );
    const down = figure.getByRole("button", { name: M.ladder.down });
    for (let k = 1; k < levels.length; k++) await down.click();
    await expect(figure.locator(".ladder-position")).toHaveText(
      format(M.ladder.position, { k: levels.length, n: levels.length }),
    );
    await expect(figure.locator(".ladder-reading")).toHaveText(M.ladder.high);
    await expect(down).toBeDisabled();
  });

  test("the prediction's levels say nothing until the learner commits", async ({ page }) => {
    await openLesson(page, SECOND.id);
    const figure = page.locator("#ix-predict-slices");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".ladder-reading")).toHaveCount(0);
    await expect(figure.locator(".ladder-level .prose")).toHaveCount(0);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.locator(".ladder-reading")).toContainText("01000010");
  });
});
