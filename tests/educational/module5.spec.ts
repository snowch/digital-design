// Module 5 after the registers lesson: counters, register transfer and state machines, driven
// through the page as the registers lesson's spec drives its own. Every challenge completable with
// its reference, a plausible wrong attempt rejected at the test a learner would look at, saved
// work graded again on load, a reset that clears the work, hints one rung at a time, and the
// state-machine figure moving its views together. Each runs at desktop and phone widths.

import { expect, test } from "@playwright/test";

import { MACHINES, machineText } from "@dd/dd-model";
import { testCount } from "@dd/lesson-schema";

import {
  S,
  V,
  challenge,
  format,
  importText,
  lessonData,
  openLesson,
  runTests,
  status,
  storageKey,
  writeText,
} from "./helpers";
import * as W from "./module5-wrong";

const LESSONS = ["counters", "register-transfer", "state-machines", "state-encoding"].map(
  lessonData,
);

test.describe("Module 5's challenges", () => {
  for (const lesson of LESSONS)
    for (const c of lesson.challenges) {
      test(`${lesson.id} ${c.id} is completable with its reference through the page`, async ({
        page,
      }) => {
        await openLesson(page, lesson.id);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
        else await importText(section, c.reference.hdl!);
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }

  const wrong: [string, string, string, string][] = [
    ["counters", "count-two", W.COUNT_TWO_EN_TWICE, "edge 1"],
    ["counters", "count-tick", W.COUNT_TICK_NO_EN, "EN falls with the count at 1111"],
    ["register-transfer", "now-prev", W.NOW_PREV_BOTH_IN, "edge saving 0011"],
    ["register-transfer", "readings", W.READINGS_UNDO_FIRST, "edge with NEW 1 and UNDO 1"],
    [
      "state-machines",
      "late-ok",
      machineText(MACHINES.retry, { style: "codes" }),
      "edge in WAIT with OK 1",
    ],
  ];
  for (const [lessonId, id, text, label] of wrong) {
    test(`${lessonId} ${id} rejects a plausible wrong attempt at "${label}"`, async ({ page }) => {
      await openLesson(page, lessonId);
      const c = lessonData(lessonId).challenges.find((x) => x.id === id)!;
      const section = challenge(page, id);
      await section.scrollIntoViewIfNeeded();
      if (c.gradedDirection === "write") await writeText(section, text);
      else await importText(section, text);
      await runTests(section);
      await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label);
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }

  test("the drawn next-state bit without NOT FAIL is rejected", async ({ page }) => {
    await openLesson(page, "state-machines");
    const section = challenge(page, "next-one");
    await importText(section, W.NEXT_ONE_NO_NOT_FAIL);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first()).toBeVisible();
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    const lesson = lessonData("state-machines");
    const c = lesson.challenges.find((x) => x.id === "late-ok")!;
    await openLesson(page, lesson.id);
    await writeText(challenge(page, c.id), c.reference.hdl!);
    await runTests(challenge(page, c.id));
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await page.evaluate(
      ([key, id, hdl]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[id].artifact = { hdl };
        stored.challenges[id].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey(lesson.id), c.id, c.initial.hdl ?? ""] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    const lesson = lessonData("state-encoding");
    const c = lesson.challenges.find((x) => x.id === "defrost")!;
    await openLesson(page, lesson.id);
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(c.initial.hdl ?? "");
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, "counters");
    const section = challenge(page, "count-two");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "count-two").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 5's figures", () => {
  test("the state-machine figure moves its diagram, table and status together", async ({
    page,
  }) => {
    await openLesson(page, "state-machines");
    const figure = page.locator("#ix-retry-machine");
    await figure.scrollIntoViewIfNeeded();
    const node = figure.locator(".state-node-current");
    await expect(node).toHaveAttribute("data-state", "IDLE");
    await figure
      .getByRole("button", {
        name: format(V.machine.inputButton, { name: "GO", value: 0 }),
        exact: true,
      })
      .click();
    await expect(figure.locator(".state-arrow-next")).toHaveAttribute("data-rows", "1");
    await expect(figure.locator("tr[aria-current]")).toContainText("TRY 01");
    await figure.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    await expect(node).toHaveAttribute("data-state", "TRY");
    await expect(figure.locator("[role=status]")).toContainText("TRY");
  });

  test("the predictions answer with what the simulator did", async ({ page }) => {
    const answers: [string, string, string, string][] = [
      ["counters", "predict-wrap", "Q", "0000"],
      ["counters", "predict-no-reset", "Q", "XXXX"],
      ["register-transfer", "predict-prev", "PREV", "0011"],
      ["register-transfer", "predict-swap", "X", "0101"],
      ["state-machines", "predict-give-up", "S", "11"],
      ["state-encoding", "predict-one-hot-reset", "S", "0000"],
    ];
    for (const [lesson, id, signal, value] of answers) {
      await openLesson(page, lesson);
      const figure = page.locator(`#ix-${id}`);
      await figure.getByRole("radio").first().check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("[role=status]")).toContainText(
        format(V.prediction.circuitDid, { signal, value }),
      );
    }
  });

  test("the save-once figure saves once however long SAVE is held", async ({ page }) => {
    await openLesson(page, "register-transfer");
    const figure = page.locator("#ix-save-once");
    await figure.scrollIntoViewIfNeeded();
    const value = (name: string) =>
      figure.locator("table.signal-table tr", { has: page.locator(`th:text-is("${name}")`) });
    await figure.getByRole("button", { name: /^SAVE = 0\./ }).click();
    const clock = figure.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) });
    for (let i = 0; i < 3; i++) await clock.click();
    await expect(value("NOW")).toContainText("0101");
    await expect(value("PREV")).toContainText("0011");
  });
});
