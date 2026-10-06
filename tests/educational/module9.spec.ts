// Copyright © 2026 Christopher Snow

// Module 9's challenges and figures, driven through the page as Module 8's are: every challenge
// completed with its reference written in its text box, a plausible wrong attempt rejected with
// the failing test named, saved work graded again on load, a reset in two steps, hints one rung
// at a time, and the figures used as a learner uses them: the decoder's table and map read off
// its circuit, a prediction answered by the simulator, a program run edge by edge with the views
// of each edge, and a fault that changes where a run ends.

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

const MODULE_9 = [
  "control-signals",
  "illegal-instructions",
  "several-edges",
  "micro-operations",
  "new-instruction",
] as const;

for (const lessonId of MODULE_9) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        test.setTimeout(300_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        await writeText(section, c.reference.hdl!);
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

/** A wrong text: the reference with one change, and the first test the grader says it fails. */
const WRONG: readonly { lesson: string; id: string; from: string; to: string; why: string }[] = [
  {
    lesson: "control-signals",
    id: "writes-text",
    from: "(K == 4'h3) | (K == 4'h6);",
    to: "(K == 4'h3) | (K == 4'h7);",
    why: "a jump that writes register Y",
  },
  {
    lesson: "illegal-instructions",
    id: "checks-text",
    from: "(K == 4'h8) & (J[3:1] == 3'b001) & ",
    to: "",
    why: "the number's check ORed in on its own",
  },
  {
    lesson: "several-edges",
    id: "states-text",
    from: "if (MEM) next = MEMORY;\n        else if (WRITEY) next = WRITE;",
    to: "if (WRITEY) next = WRITE;\n        else if (MEM) next = MEMORY;",
    why: "WRITEY tested before MEM",
  },
  {
    lesson: "micro-operations",
    id: "controller-text",
    from: "assign CHECKING = (state == READ);",
    to: "assign CHECKING = (state == READ) & GO;",
    why: "CHECKING that falls with GO",
  },
  {
    lesson: "new-instruction",
    id: "decoder-text",
    from: "4'h9: begin WRITEY = 1'b1; BCONST = 1'b1;",
    to: "4'h9: begin WRITEY = 1'b1;",
    why: "kind 9 without the constant",
  },
];

test.describe("Module 9's wrong attempts are rejected with the failing test named", () => {
  for (const w of WRONG) {
    test(`${w.id}: ${w.why}`, async ({ page }) => {
      test.setTimeout(240_000);
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
        timeout: 180_000,
      });
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }
});

test.describe("Module 9's saved work", () => {
  test("saved text is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    test.setTimeout(120_000);
    const id = "outputs-text";
    const c = challengeData(id, lessonData("micro-operations"));
    await openLesson(page, "micro-operations");
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
          "& WRITEY & GO",
          "& GO",
        );
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("micro-operations"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    test.setTimeout(120_000);
    const id = "writes-text";
    const c = challengeData(id, lessonData("control-signals"));
    await openLesson(page, "control-signals");
    const section = challenge(page, id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(c.initial.hdl ?? "");
  });

  test("hints come one rung at a time", async ({ page }) => {
    await openLesson(page, "several-edges");
    const c = challengeData("states-text", lessonData("several-edges"));
    const section = challenge(page, c.id);
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await expect(section.locator(".hints-list li").first()).toContainText(c.hints[0]!.slice(0, 30));
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 9's figures", () => {
  test("the decoder's table and the map are read off its circuit", async ({ page }) => {
    await openLesson(page, "control-signals");
    const table = page.locator("#ix-signals-table table.control-signals-table");
    await table.scrollIntoViewIfNeeded();
    const writey = table.locator("tr").filter({ has: page.locator("th", { hasText: /^WRITEY$/ }) });
    await expect(writey.locator("td")).toHaveText(["1", "1", "1", "0", "0", "1", "0", "0"]);
    await openLesson(page, "illegal-instructions");
    const map = page.locator("#ix-kind-map table.kind-map-table");
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator("td.kind-map-legal")).toHaveCount(37);
    await expect(map.locator("td.kind-map-depends")).toHaveCount(2);
    await expect(map.locator("td.kind-map-illegal")).toHaveCount(217);
  });

  test("a prediction of a load's edges is answered by the simulator", async ({ page }) => {
    await openLesson(page, "several-edges");
    const figure = page.locator("#ix-predict-load-edges");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: V.datapath.clock })).toHaveCount(0);
    await figure.getByRole("radio").nth(2).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.getByRole("button", { name: V.datapath.clock })).toBeVisible();
  });

  test("an edge clocked moves the four views together", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, "micro-operations");
    const figure = page.locator("#ix-four-views");
    await figure.scrollIntoViewIfNeeded();
    const ops = figure.locator("table.micro-ops");
    await expect(ops.locator("tr.row-current")).toContainText(V.control.opFetch);
    await figure.getByRole("button", { name: V.datapath.clock }).click();
    await expect(ops.locator("tbody tr")).toHaveCount(2);
    await expect(ops.locator("tr.row-current")).toContainText("HA ← R0, HB ← R0");
    const holdab = figure
      .locator("table.edge-signals tr")
      .filter({ has: page.locator("th", { hasText: /^HOLDAB$/ }) });
    await expect(holdab).toContainText("1");
  });

  test("a run to the stop, and a fault that changes where it ends", async ({ page }) => {
    test.setTimeout(180_000);
    await openLesson(page, "several-edges");
    const colder = page.locator("#ix-colder-edges");
    await colder.scrollIntoViewIfNeeded();
    await colder.getByRole("button", { name: V.datapath.run }).click();
    await expect(row(colder, V.datapath.devicesCaption, V.datapath.display)).toContainText("-250");
    const faults = page.locator("#ix-edge-faults");
    await faults.scrollIntoViewIfNeeded();
    await faults.getByRole("radio").nth(1).check();
    await faults.getByRole("button", { name: V.datapath.run }).click();
    await expect(faults.locator(".datapath-status")).toHaveText(
      format(V.datapath.stopped, { reason: V.datapath.reasons["33"]! }),
    );
  });
});

test.describe("Module 9's machine figures", () => {
  // The register file sits inside the machine's datapath block; a write is read off its enable
  // and address, so a register given the word it already held is still marked written.
  test("a register written with the word it held is marked written", async ({ page }) => {
    await openLesson(page, "new-instruction");
    const figure = page.locator("#ix-call-faults");
    await figure.scrollIntoViewIfNeeded();
    const faults = lessonData("new-instruction")
      .sections.flatMap((s) => s.interactives)
      .find((i) => i.id === "call-faults")?.props["faults"] as { label: string }[];
    // orJump made an AND: the call through R4 calls itself, R15 ← 008 at every pass.
    await figure.getByLabel(faults[1]!.label).check();
    const clock = figure.getByRole("button", { name: V.datapath.clock });
    const r15 = row(figure, V.datapath.registersCaption, "R15");
    for (let edge = 1; edge <= 7; edge++) await clock.click();
    await expect(r15).toContainText(V.datapath.written);
    await clock.click();
    await expect(r15).not.toContainText(V.datapath.written);
    await clock.click();
    await clock.click();
    // The second pass's WRITE edge: the same word, 008, written again.
    await expect(r15).toContainText("0000000000000008");
    await expect(r15).toContainText(V.datapath.written);
  });
});
