// Copyright © 2026 Christopher Snow

// Module 8's challenges and figures, driven through the page as the earlier modules' are: every
// challenge completed with its reference written in its text box, a plausible wrong attempt
// rejected with the failing test named, saved work graded again on load, and the datapath figure
// used as a learner uses it: an instruction chosen, an edge clocked, a program run to its stop, a
// fault put in, a prediction committed and answered by the simulator, and one edge stepped.

import { expect, test, type Locator } from "@playwright/test";

import { grade } from "@dd/dd-views";
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
  writeText,
} from "./helpers";

/** A row of one of the datapath figure's tables, found by its caption and its first cell. */
function row(figure: Locator, caption: string, first: string): Locator {
  return figure
    .locator("table.datapath-table")
    .filter({ has: figure.page().locator("caption", { hasText: caption }) })
    .locator("tr")
    .filter({ has: figure.page().locator("th", { hasText: new RegExp(`^${first}$`) }) });
}

const MODULE_8 = ["instructions", "constants", "fetch", "memory-access", "branches"] as const;

for (const lessonId of MODULE_8) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        test.setTimeout(240_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        await writeText(section, c.reference.hdl!);
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
          { timeout: 120_000 },
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

/** A wrong text: the reference with one change, and the first test the grader says it fails. */
const WRONG: readonly {
  lesson: string;
  id: string;
  from: string;
  to: string;
  why: string;
}[] = [
  {
    lesson: "instructions",
    id: "jobs-text",
    from: ".OP2(IR[26]), .OP1(IR[25]), .OP0(IR[24])",
    to: ".OP2(IR[27]), .OP1(IR[26]), .OP0(IR[25])",
    why: "the ALU's code taken from J's top three bits",
  },
  {
    lesson: "constants",
    id: "widen-text",
    from: "1'b1: W = {52'hFFFFFFFFFFFFF, C};",
    to: "1'b1: W = {52'h0, C};",
    why: "a widening that fills with 0s",
  },
  {
    lesson: "fetch",
    id: "pc-text",
    from: "if (RST) PC <= 64'h0;\n    else if (GO) PC <= PC + 64'h4;",
    to: "if (GO) PC <= PC + 64'h4;\n    else if (RST) PC <= 64'h0;",
    why: "GO tested before RST",
  },
  {
    lesson: "branches",
    id: "condition-text",
    from: "4'h4: MET = ~COUT;",
    to: "4'h4: MET = COUT;",
    why: "COUT for less, unsigned",
  },
];

test.describe("Module 8's wrong attempts are rejected with the failing test named", () => {
  for (const w of WRONG) {
    test(`${w.id}: ${w.why}`, async ({ page }) => {
      test.setTimeout(120_000);
      const c = challengeData(w.id, lessonData(w.lesson));
      const wrong = c.reference.hdl!.replace(w.from, w.to);
      expect(wrong).not.toBe(c.reference.hdl);
      const label = grade(c, { hdl: wrong }).failures[0]?.label ?? "";
      expect(label).not.toBe("");
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await writeText(section, wrong);
      await runTests(section);
      await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label, {
        timeout: 60_000,
      });
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }

  test("a next PC that never jumps fails at the jump back from the call", async ({ page }) => {
    test.setTimeout(240_000);
    const c = challengeData("next-text", lessonData("branches"));
    const wrong = c.reference.hdl!.replace("    if (JUMP) NEXT = RESULT;\n", "");
    const label = grade(c, { hdl: wrong }).failures[0]?.label ?? "";
    expect(label).toContain("after 024");
    await openLesson(page, "branches");
    const section = challenge(page, "next-text");
    await writeText(section, wrong);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label, {
      timeout: 120_000,
    });
  });
});

test.describe("Module 8's saved work", () => {
  test("saved text is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, "instructions");
    const id = "digits-text";
    const c = challengeData(id, lessonData("instructions"));
    await writeText(challenge(page, id), c.reference.hdl!);
    await runTests(challenge(page, id));
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.evaluate(
      ([key, cid]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[cid].artifact.hdl = stored.challenges[cid].artifact.hdl.replace(
          "IR[15:12]",
          "IR[3:0]",
        );
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("instructions"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });
});

test.describe("Module 8's datapath figure", () => {
  test("a prediction is answered with what one edge of the simulator did", async ({ page }) => {
    await openLesson(page, "instructions");
    const figure = page.locator("#ix-predict-difference");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: V.datapath.clock })).toHaveCount(0);
    await figure.getByRole("radio", { name: "66", exact: true }).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await figure.getByRole("button", { name: V.datapath.clock }).click();
    const r3 = row(figure, V.datapath.registersCaption, "R3");
    await expect(r3).toContainText("0000000000000042");
    await expect(r3).toContainText(V.datapath.written);
  });

  test("an instruction chosen, WRITEY at 0, and the edge writes nothing", async ({ page }) => {
    await openLesson(page, "instructions");
    const figure = page.locator("#ix-jobs");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("radio").nth(3).check();
    await figure.getByRole("button", { name: V.datapath.clock }).click();
    const r1 = row(figure, V.datapath.registersCaption, "R1");
    await expect(r1).toContainText("-183");
    await figure.getByRole("button", { name: V.datapath.reset }).click();
    await expect(r1).toContainText("-184");
    await figure.getByRole("radio").nth(4).check();
    await figure.getByRole("button", { name: V.datapath.clock }).click();
    await expect(row(figure, V.datapath.registersCaption, "R3")).toContainText("XXXXXXXXXXXXXXXX");
  });

  test("a program runs to its stop, and a fault changes where it stops", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, "fetch");
    const figure = page.locator("#ix-fetch-faults");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: V.datapath.run }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(V.datapath.stopped, { reason: V.datapath.reasons["stop"]! }),
    );
    await expect(figure.getByRole("button", { name: V.datapath.clock })).toBeDisabled();
    await figure.getByRole("radio").nth(2).check();
    await expect(figure.getByRole("button", { name: V.datapath.clock })).toBeEnabled();
    await figure.getByRole("button", { name: V.datapath.run }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(V.datapath.stopped, { reason: V.datapath.reasons["21"]! }),
    );
  });

  test("the shop's display shows the margin the program stores", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, "memory-access");
    const figure = page.locator("#ix-show-margin");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: V.datapath.run }).click();
    await expect(row(figure, V.datapath.devicesCaption, V.datapath.display)).toContainText("66");
    await expect(row(figure, V.datapath.devicesCaption, V.datapath.lamps)).toContainText("101");
  });

  test("one edge of the whole datapath, stepped from the clock's rise to the last change", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "branches");
    const figure = page.locator("#ix-one-instruction");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".datapath-steps")).toContainText(V.datapath.stepsNone);
    await figure.getByRole("button", { name: V.datapath.clock }).click();
    await expect(figure.locator(".explorer-steps")).toContainText(
      format(V.explorer.stepOf, { k: 79, n: 79 }),
    );
    const slider = figure.locator(".explorer-steps input[type=range]");
    await slider.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(figure.locator(".explorer-steps")).toContainText(
      format(V.explorer.stepOf, { k: 1, n: 79 }),
    );
    await expect(row(figure, V.datapath.registersCaption, "R2")).toContainText("-250");
    await figure.getByRole("button", { name: V.datapath.back }).click();
    await expect(figure.locator(".explorer-steps")).toContainText(V.datapath.stepNothing);
    await expect(row(figure, V.datapath.registersCaption, "R2")).toContainText("-184");
  });
});
