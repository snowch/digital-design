// Copyright © 2026 Christopher Snow

// Module 13's challenges and figures, driven through the page: the three lessons of answers
// completed with their references and a wrong answer refused; the lab's outline failing every
// program with a sentence that names a line and never a join, the course's text passing, and the
// three starts swapped by their buttons, asking first over changed work; the lab's figures run;
// the capstone completed with its reference program and answers, a wrong answer told where to look
// and not the value, and its program run on the whole machine; saved work graded again on load.

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

const T = DEFAULT_VIEW_STRINGS.machine13;

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
    } else if (f.kind === "bits") {
      // A row of bits, pressed to match, highest bit first.
      for (let i = 0; i < value.length; i++) {
        const bit = field.locator(`button[data-bit="${value.length - 1 - i}"]`);
        if (((await bit.getAttribute("aria-pressed")) === "true") !== (value[i] === "1"))
          await bit.click();
      }
    } else await field.locator("input").fill(value);
  }
}

async function passes(section: Locator, c: Challenge) {
  await expect(status(section)).toHaveText(format(S.challenge.passing, { total: testCount(c) }), {
    timeout: 60_000,
  });
  await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
}

for (const lessonId of ["whole-machine", "full-path", "tracing"]) {
  const lesson = lessonData(lessonId);
  const c = lesson.challenges[0]!;
  test(`${lessonId}: ${c.id} is completable with its reference, and refuses a wrong answer`, async ({
    page,
  }) => {
    await openLesson(page, lessonId);
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    const answers = c.reference.answers ?? {};
    // A wrong answer: a typed field's answer with a digit added, or a row's first bit turned over.
    const typed = c.fields.find((f) => f.kind !== "choice")!;
    const was = answers[typed.id] ?? "";
    const wrong =
      typed.kind === "bits" ? `${was[0] === "1" ? "0" : "1"}${was.slice(1)}` : `${was}1`;
    await answerAll(section, c, { ...answers, [typed.id]: wrong });
    await runTests(section);
    await expect(status(section)).not.toHaveText(
      format(S.challenge.passing, { total: testCount(c) }),
    );
    await answerAll(section, c, answers);
    await runTests(section);
    await passes(section, c);
  });
}

test.describe("the final-machine lab", () => {
  const lesson = lessonData("final-machine");
  const c = lesson.challenges[0]!;

  test("the outline fails every program, naming a line and never a join", async ({ page }) => {
    await openLesson(page, "final-machine");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    await runTests(section);
    const details = section.locator(".verdict-detail");
    await expect(details).toHaveCount(7, { timeout: 60_000 });
    for (const d of await details.allTextContents()) {
      expect(d).toMatch(/^(After|At) "/);
      expect(d).not.toContain("JOIN");
      expect(d).not.toContain("`");
    }
  });

  test("the course's text passes, and is graded again on load", async ({ page }) => {
    await openLesson(page, "final-machine");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await passes(section, c);
    await page.reload();
    await passes(challenge(page, c.id), c);
  });

  test("the three starts swap by their buttons, asking first over changed work", async ({
    page,
  }) => {
    await openLesson(page, "final-machine");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    const box = section.locator("textarea.hdl-text").first();
    await expect(box).toHaveValue(/JOIN: /);
    await section.getByRole("button", { name: T.labParts }).click();
    await expect(box).toHaveValue(/\.ADDR\(\)/);
    await section.getByRole("button", { name: T.labEmpty }).click();
    await expect(box).not.toHaveValue(/memory mem/);
    await box.fill(`${await box.inputValue()}\n// mine`);
    await section.getByRole("button", { name: T.labOutline }).click();
    await section.getByRole("button", { name: T.labKeep }).click();
    await expect(box).toHaveValue(/\/\/ mine/);
    await section.getByRole("button", { name: T.labOutline }).click();
    await section.getByRole("button", { name: T.labReplace }).click();
    await expect(box).toHaveValue(/JOIN: /);
  });

  test("the drawing follows the text: open ports in the parts start, joins as they are written", async ({
    page,
  }) => {
    await openLesson(page, "final-machine");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    const map = section.locator(".lab-joins-map");
    const trap = map.locator("button", { has: page.locator("code", { hasText: /^traplogic$/ }) });
    await expect(trap).toContainText(T.joinsAllJoined);
    // The parts the chosen part joins to are marked on the map.
    await expect(map.locator(".lab-joins-linked code")).toHaveText([
      "system",
      "controller",
      "cregs",
      "memory",
    ]);
    await section.getByRole("button", { name: T.labParts }).click();
    await expect(trap).toContainText(format(T.joinsOpenCount, { n: 13 }));
    await trap.click();
    await expect(section.locator(".lab-joins-open")).toHaveCount(13);
    const box = section.locator("textarea.hdl-text").first();
    await box.fill((await box.inputValue()).replace(".WAITING(),", ".WAITING(WAITING),"));
    await expect(trap).toContainText(format(T.joinsOpenCount, { n: 12 }));
  });

  test("a lab figure draws no join, and marks the part a run names only after it", async ({
    page,
  }) => {
    await openLesson(page, "final-machine");
    const figure = page.locator('[data-interactive="lab-door"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".lab-joins-map")).toBeVisible();
    await expect(figure.locator(".lab-joins-row")).toHaveCount(0);
    await expect(figure.locator(".lab-joins-marked")).toHaveCount(0);
    await figure.locator("select").selectOption({ index: 3 });
    await figure.getByRole("button", { name: T.labRun }).click();
    await expect(figure.locator(".lab-run-results li")).toContainText('"waiting"', {
      timeout: 30_000,
    });
    await expect(figure.locator(".lab-joins-marked code")).toHaveText(["memory"]);
  });

  test("the prediction is answered by running the programs", async ({ page }) => {
    await openLesson(page, "final-machine");
    const figure = page.locator('[data-interactive="lab-predict"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: T.labRun })).toHaveCount(0);
    await figure.getByLabel(/timer program/).check();
    await figure.getByRole("button", { name: DEFAULT_VIEW_STRINGS.prediction.commit }).click();
    await expect(figure.locator(".prediction-match")).toBeVisible({ timeout: 30_000 });
    await figure.locator("select").selectOption({ index: 1 });
    await figure.getByRole("button", { name: T.labRun }).click();
    await expect(figure.locator(".lab-run-results li")).toContainText("the timer is 1", {
      timeout: 30_000,
    });
  });
});

test.describe("the capstone", () => {
  const lesson = lessonData("capstone");
  const c = lesson.challenges[0]!;

  test("is completable with its reference program and answers", async ({ page }) => {
    await openLesson(page, "capstone");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    await writeText(section, c.reference.text!);
    await answerAll(section, c, c.reference.answers ?? {});
    await runTests(section);
    await passes(section, c);
  });

  test("tells a wrong answer where to look, never the value", async ({ page }) => {
    await openLesson(page, "capstone");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    await writeText(section, c.reference.text!);
    await answerAll(section, c, { ...(c.reference.answers ?? {}), result: "-16" });
    await runTests(section);
    const detail = section.locator(".verdict-detail");
    await expect(detail).toHaveCount(1, { timeout: 60_000 });
    await expect(detail).toHaveText(T.capLevels["result"]!);
    await expect(detail).not.toContainText("16");
  });

  test("runs the learner's program on the whole machine", async ({ page }) => {
    await openLesson(page, "capstone");
    const section = challenge(page, c.id);
    await section.scrollIntoViewIfNeeded();
    await writeText(section, c.reference.text!);
    await section.getByRole("button", { name: T.capTrace }).click();
    await expect(section.locator(".capstone-trace .machine-levels")).toBeVisible();
    await expect(section.getByRole("button", { name: T.capTrace })).toBeDisabled();
  });
});

// The step controls and the drawing's overview share one sticky band: with the drawing centred
// in the window, "Next edge" is the element under its own centre, and the band leaves at least
// half the screen to the drawing.
test("the step controls stay pressable with the drawing centred", async ({ page }) => {
  for (const [lessonId, id] of [
    ["whole-machine", "load-joins"],
    ["capstone", "cap-carry"],
  ] as const) {
    await openLesson(page, lessonId);
    const figure = page.locator(`[data-interactive="${id}"]`);
    const drawing = figure.locator("svg.circuit:not(.circuit-overview)").first();
    await drawing.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const next = figure.getByRole("button", { name: T.nextEdge });
    const box = (await next.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x!, y!)?.closest("button")?.textContent ?? "",
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(hit, id).toBe(T.nextEdge);
    const band = (await figure.locator(".overview-bar").first().boundingBox())!;
    expect(band.height, id).toBeLessThanOrEqual(page.viewportSize()!.height / 2);
    const before = await figure.locator(".debugger-status").textContent();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(figure.locator(".debugger-status")).not.toHaveText(before ?? "");
  }
});
