// Copyright © 2026 Christopher Snow

// Module 10's challenges and figures, driven through the page as Module 9's are: every challenge
// completed with its reference (written in its text box, or answered field by field), a
// plausible wrong attempt rejected with the failing test named, saved work graded again on load,
// and the figures used as a learner uses them: two machines run side by side, a prediction
// answered by the simulators, and a fault that breaks the agreement.

import { expect, test, type Locator } from "@playwright/test";

import { grade } from "@dd/dd-views";
import { testCount, type Challenge } from "@platform/lesson-schema";

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
  writeText,
} from "./helpers";

const MODULE_10 = ["instruction-set"] as const;

/** Fills an answers challenge's fields: a choice by its option's words, any other by typing. */
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
      await field.getByRole("radio", { name: label, exact: true }).check();
    } else await field.locator("input").fill(value);
  }
}

for (const lessonId of MODULE_10) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        test.setTimeout(300_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
        else await answerAll(section, c, c.reference.answers ?? {});
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
          { timeout: 240_000 },
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

/** A wrong attempt: a text with one change, or answers with one changed, and why it is wrong. */
const WRONG: readonly {
  lesson: string;
  id: string;
  from?: string;
  to?: string;
  answers?: Readonly<Record<string, string>>;
  why: string;
}[] = [
  {
    lesson: "instruction-set",
    id: "sort-parts",
    answers: { ir: "set" },
    why: "the IR counted as a part every machine agrees on",
  },
  {
    lesson: "instruction-set",
    id: "short-jobs",
    from: "  assign WREG = ((state == WRITE) | ((state == ALU) & ~MEM)) & WRITEY & GO;",
    to: "  assign WREG = (state == WRITE) & WRITEY & GO;",
    why: "jobs that end at ALU without writing register Y",
  },
];

test.describe("Module 10's wrong attempts are rejected with the failing test named", () => {
  for (const w of WRONG) {
    test(`${w.id}: ${w.why}`, async ({ page }) => {
      test.setTimeout(240_000);
      const c = challengeData(w.id, lessonData(w.lesson));
      const answers = { ...(c.reference.answers ?? {}), ...(w.answers ?? {}) };
      const wrong = w.from ? c.reference.hdl!.replace(w.from, w.to ?? "") : undefined;
      if (wrong !== undefined) expect(wrong).not.toBe(c.reference.hdl);
      const label =
        grade(c, wrong !== undefined ? { hdl: wrong } : { answers }).failures[0]?.label ?? "";
      expect(label).not.toBe("");
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await section.scrollIntoViewIfNeeded();
      if (wrong !== undefined) await writeText(section, wrong);
      else await answerAll(section, c, answers);
      await runTests(section);
      await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label, {
        timeout: 180_000,
      });
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }
});

test.describe("Module 10's saved work", () => {
  test("saved answers are graded again on load; a saved mark alone earns nothing", async ({
    page,
  }) => {
    const id = "sort-parts";
    const c = challengeData(id, lessonData("instruction-set"));
    await openLesson(page, "instruction-set");
    await answerAll(challenge(page, id), c, c.reference.answers ?? {});
    await runTests(challenge(page, id));
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.evaluate(
      ([key, cid]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[cid].artifact.answers.hr = "set";
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("instruction-set"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });
});

test.describe("Module 10's figures", () => {
  const T = V.machine10;
  const seenRow = (figure: Locator, name: string) =>
    figure
      .locator("table.compare-seen tr")
      .filter({ has: figure.page().locator("th", { hasText: new RegExp(`^${name}$`) }) });

  test("the prediction in the middle of a load is answered by the two simulators", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-predict-mid");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: T.clock })).toHaveCount(0);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.locator("table.compare-own")).toContainText("MEMORY");
    await expect(figure.locator("table.compare-own")).toContainText("7D8");
  });

  test("both machines run the colder room to -250 and agree after every instruction", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-side-by-side");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: T.clock }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(T.statusIn, { k: 1, address: "000" }),
    );
    await figure.getByRole("button", { name: T.run }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(T.statusStopped);
    await expect(seenRow(figure, T.display).locator("td")).toHaveText(["-250", "-250", T.agree]);
    const log = figure.locator("table.compare-log tbody tr");
    await expect(log).toHaveCount(6);
    await expect(log.nth(0).locator("td").nth(2)).toHaveText("5");
    await expect(figure.getByText(/21 in all/)).toBeVisible();
  });

  test("PCEN stuck at 1 breaks the agreement at R2; its outcome shows only after its run", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-compare-faults");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("radio", { name: "PCEN stuck at 1" }).check();
    await expect(figure.getByText(/Module 9's PC has moved/)).toHaveCount(0);
    await figure.getByRole("button", { name: T.next }).click();
    await expect(seenRow(figure, format(T.register, { n: 2 }))).toContainText(T.differsMark);
    await figure.getByRole("button", { name: T.run }).click();
    await expect(figure.getByText(/Module 9's PC has moved/)).toBeVisible();
  });
});
