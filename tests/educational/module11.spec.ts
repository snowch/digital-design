// Copyright © 2026 Christopher Snow

// Module 11's challenges and figures, driven through the page: every challenge completed with its
// reference (a program typed into its box, or answers field by field), a plausible wrong program
// rejected with the run it failed named and what the program left, saved work graded again on
// load, and the lab used as a learner uses it: a program stepped and run, a breakpoint and a
// watch, a prediction answered by the run, and a program the assembler refuses mended.

import { expect, test, type Locator } from "@playwright/test";

import { DEFAULT_VIEW_STRINGS } from "@dd/dd-views";
import { testCount, type Challenge } from "@platform/lesson-schema";

import {
  S,
  challenge,
  format,
  lessonData,
  openLesson,
  runTests,
  status,
  writeText,
} from "./helpers";

const T = DEFAULT_VIEW_STRINGS.machine11;

const MODULE_11 = ["assembly"] as const;

async function answerAll(
  section: Locator,
  c: Challenge,
  answers: Readonly<Record<string, string>>,
) {
  for (const f of c.fields) {
    const value = answers[f.id];
    if (value === undefined) continue;
    const field = section.locator(`[data-field="${f.id}"]`);
    if (f.kind === "choice") {
      const label = f.options?.find((o) => o.value === value)?.label ?? value;
      await field.locator("select").selectOption({ label });
    } else await field.locator("input").fill(value);
  }
}

for (const lessonId of MODULE_11) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write") await writeText(section, c.reference.text!);
        else await answerAll(section, c, c.reference.answers ?? {});
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

/** A wrong program: the reference with one change, the run it fails, and what it left. */
const WRONG: readonly {
  lesson: string;
  id: string;
  from: string;
  to: string;
  fails: string;
  left: string;
}[] = [
  {
    lesson: "assembly",
    id: "warmer-room",
    from: "signed goto show",
    to: "unsigned goto show",
    fails: "Room A -30, room B 15",
    left: "the display -30",
  },
];

test.describe("Module 11's wrong programs", () => {
  for (const w of WRONG) {
    test(`${w.id}: a plausible wrong program fails ${w.fails}`, async ({ page }) => {
      const c = lessonData(w.lesson).challenges.find((x) => x.id === w.id)!;
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await section.scrollIntoViewIfNeeded();
      await writeText(section, c.reference.text!.replace(w.from, w.to));
      await runTests(section);
      const failure = section.locator(".verdict-failure").filter({ hasText: w.fails });
      await expect(failure).toHaveCount(1);
      await expect(failure).toContainText(w.left);
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }

  test("a program the assembler refuses is not run, and the refusal names its line", async ({
    page,
  }) => {
    await openLesson(page, "assembly");
    const section = challenge(page, "warmer-room");
    await writeText(section, "R2 <= word[sensorA]\nR3 <= 5000\nstop");
    await expect(section.locator(".program-text .hdl-errors li")).toHaveText([
      format(T.refusedLine, {
        line: 2,
        sentence: format(T.refusals.constantRange, { value: "5000" }),
      }),
    ]);
    await runTests(section);
    await expect(section.locator(".verdict-blocked")).toContainText(T.notAssembled);
  });

  test("saved work is graded again on load", async ({ page }) => {
    const c = lessonData("assembly").challenges.find((x) => x.id === "warmer-room")!;
    await openLesson(page, "assembly");
    await writeText(challenge(page, c.id), c.reference.text!);
    await runTests(challenge(page, c.id));
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
  });
});

test.describe("Module 11's lab", () => {
  test("the debugger steps a program and says why it stopped", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="room-a"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".debugger-status")).toHaveText(T.atStart);
    await figure.getByRole("button", { name: T.step, exact: true }).click();
    await expect(figure.locator('[data-register="2"] dd')).toHaveText("-170");
    await figure.getByRole("button", { name: T.run, exact: true }).click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.stops.stop!, { address: "018" }),
    );
    await expect(figure.locator(".debugger-display")).toHaveText("-170");
    await figure.getByRole("button", { name: T.back, exact: true }).click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.next, { address: "018" }),
    );
  });

  test("the branch's constant shows only once the prediction is made", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="predict-constant"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).not.toContainText("56230003");
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: DEFAULT_VIEW_STRINGS.prediction.commit }).click();
    await expect(figure).toContainText("56230003");
  });

  test("the three refused lines, mended, give a listing and a debugger", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="mistakes"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".hdl-errors li")).toHaveCount(3);
    const box = figure.locator("textarea");
    const text = (await box.inputValue())
      .replace("-18000", "-180")
      .replace("goto fine", "signed goto fine")
      .replace("dispaly", "display");
    await box.fill(text);
    await expect(figure.locator(".hdl-errors")).toHaveCount(0);
    await expect(figure.locator(".debugger-listing")).toBeVisible();
    await figure.getByRole("button", { name: T.restore }).click();
    await expect(figure.locator(".hdl-errors li")).toHaveCount(3);
  });
});
