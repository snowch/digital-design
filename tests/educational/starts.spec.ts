// Copyright © 2026 Christopher Snow

// The three earlier graded projects with a second way in (docs/notes/real-tools/second-way-in.md):
// 2.2 nand-xor and 6.4 shop-memory (drawn, parts placed and not joined), 5.5 defrost (written, the
// frame). Each is completable from the second start, keyboard-buildable, graded again on load,
// resettable to the blank start, and asks before it replaces work. The blank start stays the
// first way in. Each runs at desktop and phone widths.

import { expect, test, type Locator } from "@playwright/test";

import { libraryCircuit } from "@dd/dd-model";
import { elaborate } from "@dd/hdl";
import { circuitToDrawing } from "@dd/dd-views";
import { testCount } from "@platform/lesson-schema";

import {
  S,
  V,
  challenge,
  challengeData,
  draw,
  format,
  lessonData,
  openLesson,
  runTests,
  status,
  storageKey,
  writeText,
} from "./helpers";

interface Second {
  label: string;
  parts?: string[];
  hdl?: string;
}
const secondOf = (lesson: string, id: string) =>
  (challengeData(id, lessonData(lesson)).initial.data as { second: Second }).second;

async function passes(section: Locator, lesson: string, id: string) {
  const c = challengeData(id, lessonData(lesson));
  await expect(status(section)).toHaveText(format(S.challenge.passing, { total: testCount(c) }));
  await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
}

async function reset(section: Locator) {
  await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
  await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
  await expect(status(section)).toHaveText(S.challenge.resetDone);
}

test.describe("5.5 defrost: start from the frame", () => {
  const lesson = "state-encoding";
  const c = challengeData("defrost", lessonData(lesson));
  const second = secondOf(lesson, "defrost");

  test("the blank start is first; the frame replaces it, and work is asked about", async ({
    page,
  }) => {
    await openLesson(page, lesson);
    const section = challenge(page, "defrost");
    await section.scrollIntoViewIfNeeded();
    const box = section.locator("textarea.hdl-text").first();
    const buttons = section.locator(".explorer-actions button");
    await expect(buttons).toHaveText([V.editor.startBlankText, second.label]);
    await expect(box).toHaveValue(c.initial.hdl ?? "");
    await section.getByRole("button", { name: second.label }).click();
    await expect(box).toHaveValue(second.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await box.fill(`${second.hdl}\n// mine`);
    await section.getByRole("button", { name: V.editor.startBlankText }).click();
    await section.getByRole("button", { name: V.editor.keepText }).click();
    await expect(box).toHaveValue(/\/\/ mine/);
    await section.getByRole("button", { name: V.editor.startBlankText }).click();
    await section.getByRole("button", { name: V.editor.replaceText }).click();
    await expect(box).toHaveValue(c.initial.hdl ?? "");
  });

  test("is completable from the frame, graded again on load, and resets to the blank start", async ({
    page,
  }) => {
    await openLesson(page, lesson);
    const section = challenge(page, "defrost");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: second.label }).click();
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await passes(section, lesson, "defrost");
    await page.reload();
    await passes(challenge(page, "defrost"), lesson, "defrost");
    await reset(challenge(page, "defrost"));
    await expect(challenge(page, "defrost").locator("textarea.hdl-text").first()).toHaveValue(
      c.initial.hdl ?? "",
    );
  });

  test("a start button is reachable and pressable from the keyboard", async ({ page }) => {
    await openLesson(page, lesson);
    const section = challenge(page, "defrost");
    await section.scrollIntoViewIfNeeded();
    const button = section.getByRole("button", { name: second.label });
    await button.focus();
    await button.press("Enter");
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(second.hdl!);
  });
});

const DRAWN: [string, string, () => ReturnType<typeof circuitToDrawing>][] = [
  [
    "nand",
    "nand-xor",
    () => {
      const r = elaborate(challengeData("nand-xor", lessonData("nand")).reference.hdl!);
      return circuitToDrawing(r.circuit!);
    },
  ],
  ["memory-map", "shop-memory", () => circuitToDrawing(libraryCircuit("shop-parts"))],
];

for (const [lesson, id, reference] of DRAWN) {
  test.describe(`${lesson} ${id}: the placed start`, () => {
    const second = secondOf(lesson, id);

    test("offers the blank start first, then the placed parts, with none joined", async ({
      page,
    }) => {
      await openLesson(page, lesson);
      const section = challenge(page, id);
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator(".explorer-actions button")).toHaveText([
        V.editor.startBlankDrawing,
        second.label,
      ]);
      await section.getByRole("button", { name: second.label }).click();
      // Each placed part shows its ports, named by its own name: nothing is joined.
      for (const kind of new Set(second.parts)) {
        await expect(
          section.getByRole("button", { name: new RegExp(`^${kind}_?1 (input|output) `) }).first(),
        ).toBeVisible();
      }
      await runTests(section);
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });

    test("is completable from the placed parts, by the keyboard, graded again on load, and resets", async ({
      page,
    }) => {
      test.setTimeout(240_000);
      await openLesson(page, lesson);
      const section = challenge(page, id);
      await section.scrollIntoViewIfNeeded();
      await section.getByRole("button", { name: second.label }).click();
      await draw(section, reference(), "keyboard", second.parts);
      await runTests(section);
      await passes(section, lesson, id);
      await page.reload();
      await passes(challenge(page, id), lesson, id);
      await reset(challenge(page, id));
      await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
      const stored = await page.evaluate((key) => localStorage.getItem(key), storageKey(lesson));
      expect(JSON.parse(stored ?? "{}").challenges?.[id]).toBeUndefined();
    });

    test("asks before it replaces a drawing the learner has joined", async ({ page }) => {
      test.skip(id !== "nand-xor", "the wire is named for the NAND start");
      await openLesson(page, lesson);
      const section = challenge(page, id);
      await section.scrollIntoViewIfNeeded();
      await section.getByRole("button", { name: second.label }).click();
      await section.getByRole("button", { name: /^A\./ }).press("Enter");
      await section.getByRole("button", { name: /^nand1 input a\./ }).press("Enter");
      await section.getByRole("button", { name: V.editor.startBlankDrawing }).click();
      await section.getByRole("button", { name: V.editor.keepDrawing }).click();
      await expect(section.getByRole("button", { name: /^nand1 input a\./ })).toBeVisible();
      await section.getByRole("button", { name: V.editor.startBlankDrawing }).click();
      await section.getByRole("button", { name: V.editor.replaceDrawing }).click();
      await expect(section.getByRole("button", { name: /^nand1 input a\./ })).toHaveCount(0);
    });
  });
}
