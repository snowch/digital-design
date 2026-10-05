// Module 2's three lessons, driven through the page as the other lessons' are: every challenge
// completable with its reference, plausible wrong attempts rejected with the row or the limit
// named, a drawn challenge built with the keyboard alone, saved work graded again on load and
// not bypassed by a tampered store, a reset in two steps, hints one rung at a time, and the
// figures answering with what the simulator does. Each runs at desktop and phone widths.

import { expect, test } from "@playwright/test";

import { testCount } from "@dd/lesson-schema";

import {
  S,
  V,
  challenge,
  challengeData,
  format,
  importText,
  lessonData,
  openLesson,
  runTests,
  status,
  storageKey,
  writeText,
} from "./helpers";

const LESSONS = ["gates", "nand", "fewer-gates"].map(lessonData);
const byChallenge = (id: string) => LESSONS.find((l) => l.challenges.some((c) => c.id === id))!;
const data = (id: string) => challengeData(id, byChallenge(id));
const total = (id: string) => testCount(data(id));

const XOR_FIVE = `module clash(input logic A, input logic B, output logic Y);
  logic NA;
  logic NB;
  logic P;
  logic Q;
  assign NA = ~(A & A);
  assign NB = ~(B & B);
  assign P = ~(A & NB);
  assign Q = ~(NA & B);
  assign Y = ~(P & Q);
endmodule
`;

test.describe("Module 2's challenges", () => {
  for (const lesson of LESSONS) {
    for (const c of lesson.challenges) {
      test(`${lesson.id}: ${c.id} is completable with its reference solution through the page`, async ({
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
          format(S.challenge.passing, { total: total(c.id) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  }

  test("the ALARM lamp with DOOR wired straight in fails the rows the rule turns round", async ({
    page,
  }) => {
    await openLesson(page, "gates");
    const section = challenge(page, "alarm");
    await importText(
      section,
      "module alarm(input logic WARM, input logic DOOR, output logic ALARM);\n  assign ALARM = WARM & DOOR;\nendmodule\n",
    );
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 2, total: total("alarm") }),
    );
    const first = section.locator(".verdict-failure").first();
    await expect(first.locator("h4")).toHaveText("WARM 1, DOOR 0");
    await expect(first).toContainText("The AND gate");
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("NIGHT written without brackets fails the 2 rows with WARM 1 and CLOSED 0", async ({
    page,
  }) => {
    await openLesson(page, "gates");
    const c = data("night");
    const section = challenge(page, c.id);
    await writeText(
      section,
      c.initial.hdl!.replace("\n\n", "\n  assign NIGHT = CLOSED & DOOR | WARM;\n"),
    );
    await runTests(section);
    await expect(section.locator(".verdict-failure h4")).toHaveText([
      "WARM 1, DOOR 0, CLOSED 0",
      "WARM 1, DOOR 1, CLOSED 0",
    ]);
  });

  test("an AND gate imported into a NAND-only challenge fails the kind test and names it", async ({
    page,
  }) => {
    await openLesson(page, "nand");
    const section = challenge(page, "nand-and");
    await importText(
      section,
      "module m(input logic A, input logic B, output logic Y);\n  assign Y = A & B;\nendmodule\n",
    );
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 4, total: total("nand-and") }),
    );
    const failure = section.locator(".verdict-failure").first();
    await expect(failure.locator("h4")).toHaveText(format(V.limits.only, { kinds: "NAND" }));
    await expect(failure.locator(".verdict-detail")).toContainText("AND");
  });

  test("XOR in five NAND gates passes the rows and fails the gate limit, which counts them", async ({
    page,
  }) => {
    await openLesson(page, "fewer-gates");
    const section = challenge(page, "xor-four");
    await importText(section, XOR_FIVE);
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 5, total: total("xor-four") }),
    );
    const failure = section.locator(".verdict-failure");
    await expect(failure).toHaveCount(1);
    await expect(failure.locator("h4")).toHaveText(format(V.limits.gates, { limit: 4 }));
    await expect(failure.locator(".verdict-detail")).toHaveText(
      format(V.limits.gatesFound, { count: 5, limit: 4 }),
    );
  });

  test("CALL simplified one step too far is rejected in the row with the door open by day", async ({
    page,
  }) => {
    await openLesson(page, "fewer-gates");
    const section = challenge(page, "call-four");
    await importText(
      section,
      "module call(input logic WARM, input logic DOOR, input logic CLOSED, output logic CALL);\n  assign CALL = WARM | (DOOR & CLOSED);\nendmodule\n",
    );
    await runTests(section);
    await expect(section.locator(".verdict-failure h4")).toHaveText(["WARM 1, DOOR 1, CLOSED 0"]);
  });

  test("NOT from NAND can be built with the keyboard alone", async ({ page }) => {
    await openLesson(page, "nand");
    const section = challenge(page, "nand-not");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: format(V.builder.add, { label: "NAND" }) }).click();
    const wire = async (from: RegExp, to: RegExp) => {
      await section.getByRole("button", { name: from }).focus();
      await page.keyboard.press("Enter");
      await section.getByRole("button", { name: to }).focus();
      await page.keyboard.press("Enter");
    };
    await wire(/^A\./, /^nand1 input a\./);
    await wire(/^A\./, /^nand1 input b\./);
    await wire(/^nand1 output y\./, /^Y\./);
    await runTests(section);
    await expect(status(section)).toHaveText(format(S.challenge.passing, { total: 3 }));
  });

  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, "gates");
    const c = data("night");
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
      [
        storageKey("gates"),
        c.id,
        c.initial.hdl!.replace("\n\n", "\n  assign NIGHT = CLOSED;\n"),
      ] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, "fewer-gates");
    const c = data("call-four");
    const section = challenge(page, c.id);
    await importText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      storageKey("fewer-gates"),
    );
    expect(JSON.parse(stored ?? "{}").challenges?.[c.id]).toBeUndefined();
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, "nand");
    const section = challenge(page, "nand-xor");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "nand-xor").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 2's figures", () => {
  test("the predictions answer with what the simulator did", async ({ page }) => {
    const answers: [string, string, string, string][] = [
      ["gates", "predict-alarm", "ALARM", "0"],
      ["nand", "predict-tied", "Y", "0"],
      ["fewer-gates", "predict-warm", "CALL", "1"],
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

  test("the explorer's own table follows the inputs pressed", async ({ page }) => {
    await openLesson(page, "gates");
    const figure = page.locator("#ix-explore-and");
    await figure.scrollIntoViewIfNeeded();
    const current = figure.locator("tr.row-current");
    await expect(current).toContainText("000");
    await figure.getByRole("button", { name: /^A = 0\./ }).click();
    await figure.getByRole("button", { name: /^B = 0\./ }).click();
    await expect(current).toContainText("111");
  });

  test("the fault figure finds the broken door switch in one row", async ({ page }) => {
    await openLesson(page, "gates");
    const figure = page.locator("#ix-alarm-faults");
    await figure.getByRole("radio").nth(3).check();
    await figure.getByRole("button", { name: V.fault.run }).click();
    await expect(figure.locator(".fault-result [role=status]")).toHaveText(
      format(V.fault.someFail, { failed: 1, total: 4 }),
    );
  });

  test("the pairs figure counts where each input matters", async ({ page }) => {
    await openLesson(page, "fewer-gates");
    const figure = page.locator("#ix-call-pairs");
    await expect(figure.locator("[role=status]")).toHaveText(
      format(V.pairs.summary, { input: "WARM", n: 2, total: 4 }),
    );
    await figure.getByLabel("CLOSED").check();
    await expect(figure.locator("tbody tr.row-current")).toHaveCount(2);
  });

  test("the comparison shows nothing until the learner commits, then the one row that differs", async ({
    page,
  }) => {
    await openLesson(page, "fewer-gates");
    const figure = page.locator("#ix-too-short");
    await expect(figure.locator("table")).toHaveCount(0);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator(".compare-summary")).toHaveText(
      format(V.compare.someDiffer, { n: 1, total: 8 }),
    );
    await expect(figure.locator("tbody tr.row-current")).toHaveCount(1);
  });

  test("the chain settles in 3 steps from ROOM1 and the tree in 2", async ({ page }) => {
    await openLesson(page, "fewer-gates");
    for (const [id, n] of [
      ["chain-steps", 3],
      ["tree-steps", 2],
    ] as const) {
      const figure = page.locator(`#ix-${id}`);
      await figure.scrollIntoViewIfNeeded();
      await figure.getByRole("button", { name: /^ROOM1 = 0\./ }).click();
      await expect(figure.locator(".explorer-steps [role=status]")).toHaveText(
        format(V.explorer.settled, { n }),
      );
    }
  });
});
