// Copyright © 2026 Christopher Snow

// Module 6's challenges and figures, driven through the page as the earlier lessons' are: every
// challenge completed with its reference (drawn through the editor, part by part and wire by wire;
// written as text; or answered), a plausible wrong attempt rejected with the failing test named,
// saved work graded again on load and a tampered mark earning nothing, a reset that clears the
// work, and hints one rung at a time. The memory explorer's table follows the simulator. Each runs
// at desktop and phone widths.
//
// The drawing helpers are Module 3's (module3.spec.ts), copied rather than moved, so this file
// merges without touching another module's tests.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { libraryCircuit } from "@dd/dd-model";
import { circuitToDrawing, type Drawing } from "@dd/dd-views";
import { testCount } from "@platform/lesson-schema";

import {
  S,
  V,
  challenge,
  challengeData,
  draw,
  escape,
  format,
  lessonData,
  openLesson,
  runTests,
  status,
  storageKey,
  writeText,
} from "./helpers";

const MODULE_6 = ["ram", "register-file", "bytes", "memory-map"] as const;

function referenceDrawing(lessonId: string, challengeId: string): Drawing {
  const c = challengeData(challengeId, lessonData(lessonId));
  return circuitToDrawing(libraryCircuit(c.reference.libraryId!));
}

/** A reference drawing with one wire's source changed: a plausible slip. */
function rewired(
  drawing: Drawing,
  to: { part: string; port: string },
  from: { part: string; port: string },
): Drawing {
  return {
    ...drawing,
    wires: drawing.wires.map((w) =>
      w.to.part === to.part && w.to.port === to.port ? { from, to } : w,
    ),
  };
}

async function answer(section: Locator, field: string, value: string): Promise<void> {
  await section.locator(`[data-field="${field}"] input`).fill(value);
}

/** Completes a challenge with its reference, whichever way it is graded. */
async function complete(page: Page, lessonId: string, id: string): Promise<Locator> {
  const c = challengeData(id, lessonData(lessonId));
  const section = challenge(page, id);
  await section.scrollIntoViewIfNeeded();
  if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
  else if (c.gradedDirection === "answer")
    for (const f of c.fields) await answer(section, f.id, c.reference.answers![f.id]!);
  else await draw(section, referenceDrawing(lessonId, id), "keyboard");
  return section;
}

for (const lessonId of MODULE_6) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference through the page`, async ({ page }) => {
        test.setTimeout(240_000);
        await openLesson(page, lessonId);
        await expect(status(challenge(page, c.id))).toHaveText(S.challenge.notRun);
        const section = await complete(page, lessonId, c.id);
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

/** The first failing test's name, and no completion. */
async function failsAt(section: Locator, label: string): Promise<void> {
  await runTests(section);
  await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label);
  await expect(section.locator(".challenge-complete")).toHaveCount(0);
}

test.describe("Module 6's wrong attempts are rejected with the failing test named", () => {
  test("a two-word memory whose words ignore WE is rejected at the edge with WE 0", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "ram");
    const section = challenge(page, "two-words");
    let d = referenceDrawing("ram", "two-words");
    d = rewired(d, { part: "andW0", port: "b" }, { part: "notA", port: "y" });
    d = rewired(d, { part: "andW1", port: "b" }, { part: "input:A", port: "y" });
    await draw(section, d, "keyboard");
    await failsAt(section, "edge with WE 0");
  });

  test("an unguarded memory is rejected where the write at 101 lands on word 001", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "ram");
    const section = challenge(page, "guard");
    const d = rewired(
      referenceDrawing("ram", "guard"),
      { part: "andWE", port: "b" },
      { part: "input:WE", port: "y" },
    );
    await draw(section, d, "keyboard");
    await failsAt(section, "A2 falls while the clock is high");
  });

  test("a register file whose second read uses the first address fails at the first edge", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "register-file");
    const section = challenge(page, "two-reads");
    const d = rewired(
      referenceDrawing("register-file", "two-reads"),
      { part: "selectB", port: "S" },
      { part: "input:RA", port: "y" },
    );
    await draw(section, d, "keyboard");
    await failsAt(section, "edge: write at 0");
  });

  test("a register file written with both reads at RA fails at the first edge", async ({
    page,
  }) => {
    await openLesson(page, "register-file");
    const c = challengeData("regfile-text", lessonData("register-file"));
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!.replace("words[RB]", "words[RA]"));
    await failsAt(section, "edge: write at 10");
  });

  test("a byte write that forgets WORD is rejected at WE 1, WORD 1, A0 0", async ({ page }) => {
    await openLesson(page, "bytes");
    const section = challenge(page, "byte-write");
    const d = rewired(
      referenceDrawing("bytes", "byte-write"),
      { part: "andOddWE", port: "b" },
      { part: "input:A0", port: "y" },
    );
    await draw(section, d, "keyboard");
    await failsAt(section, "WE 1, WORD 1, A0 0");
  });

  test("a word read with its bytes the wrong way round is rejected", async ({ page }) => {
    await openLesson(page, "bytes");
    const c = challengeData("read-bytes", lessonData("bytes"));
    const section = challenge(page, c.id);
    for (const f of c.fields) await answer(section, f.id, c.reference.answers![f.id]!);
    const word6 = c.reference.answers!["word6"]!;
    await answer(section, "word6", word6.slice(2) + word6.slice(0, 2));
    await runTests(section);
    await expect(section.locator(".verdict-failure")).toHaveCount(1);
    await expect(section.locator(".verdict-failure").first()).toContainText(V.answers.ofTheMemory);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a ROM filled in the wrong order is rejected at its first word", async ({ page }) => {
    await openLesson(page, "memory-map");
    const c = challengeData("rom-table", lessonData("memory-map"));
    const section = challenge(page, c.id);
    const text = c.reference.hdl!;
    const list = /'\{(.*)\}/.exec(text)![1]!;
    await writeText(section, text.replace(list, list.split(", ").reverse().join(", ")));
    await failsAt(section, "A 00");
  });

  test("a shop memory whose display takes every write is rejected", async ({ page }) => {
    test.setTimeout(240_000);
    await openLesson(page, "memory-map");
    const section = challenge(page, "shop-memory");
    const d = rewired(
      referenceDrawing("memory-map", "shop-memory"),
      { part: "andDisplay", port: "a" },
      { part: "input:WE", port: "y" },
    );
    await draw(section, d, "keyboard");
    await failsAt(section, "A5 rises while the clock is high");
  });
});

test.describe("Module 6's saved work, resets and hints", () => {
  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, "register-file");
    const c = challengeData("regfile-text", lessonData("register-file"));
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
        storageKey("register-file"),
        c.id,
        c.reference.hdl!.replace("words[RB]", "words[RA]"),
      ] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, "memory-map");
    const c = challengeData("rom-table", lessonData("memory-map"));
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(c.initial?.hdl ?? "");
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      storageKey("memory-map"),
    );
    expect(JSON.parse(stored ?? "{}").challenges?.[c.id]).toBeUndefined();
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, "ram");
    const section = challenge(page, "two-words");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "two-words").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 6's memory explorer", () => {
  test("writes the word at the address at an edge with WE 1, and marks the word Q reads", async ({
    page,
  }) => {
    await openLesson(page, "ram");
    const figure = page.locator("#ix-ram-explorer");
    await figure.scrollIntoViewIfNeeded();
    const row = (k: number) => figure.locator(`tr[data-address="${k}"]`);
    await expect(row(0)).toHaveAttribute("aria-current", "true");
    await figure.getByRole("button", { name: /^A1 = 0\./ }).click();
    await expect(row(2)).toHaveAttribute("aria-current", "true");
    await figure.locator(".word-input").getByRole("button").first().click();
    await figure.getByRole("button", { name: /^WE = 0\./ }).click();
    await expect(row(2).locator(".memory-word")).toHaveText("XXXX");
    await figure.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    await expect(row(2).locator(".memory-word")).toHaveText("1000");
    await expect(row(0).locator(".memory-word")).toHaveText("XXXX");
  });

  test("opens from the memory to a word to its flip-flops", async ({ page }) => {
    await openLesson(page, "ram");
    const figure = page.locator("#ix-ram-explorer");
    await figure.scrollIntoViewIfNeeded();
    const open = (id: string) =>
      figure.getByRole("button", { name: new RegExp(` ${id}\\. ${escape(V.circuit.open)}`) });
    await open("ram").click();
    await open("word2").click();
    await open("ff0").click();
    await expect(figure.locator(".circuit-crumbs")).toContainText("word2");
  });
});
