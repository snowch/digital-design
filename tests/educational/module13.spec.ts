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
      // A choice shows its label as plain text: code marks go.
      const label = (f.options?.find((o) => o.value === value)?.label ?? value).replace(/`/g, "");
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
    // The run that differs offers the changed line; nothing shows it, or reasons to it, before
    // the press.
    await expect(figure.locator(".lab-run-change")).toHaveCount(0);
    await figure.getByRole("button", { name: T.labShowChange }).click();
    await expect(figure.locator(".lab-run-change")).toBeVisible();
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

// The step controls and the status line stay at the top of the window over the whole figure,
// tables included: with the drawing, a row of the levels table or the last table centred, "Next
// edge" is the element under its own centre. They leave at least half the window to the page, with
// a three-line status on a 375 by 812 phone, where the drawing's overview scrolls away with the
// page; in a tall window the overview sticks under them, over the drawing only.
test("the step controls stay pressable over the whole figure", async ({ page }) => {
  for (const [width, height] of [
    [375, 812],
    [844, 390],
    [1280, 900],
  ] as const) {
    await page.setViewportSize({ width, height });
    await openLesson(page, "full-path");
    const figure = page.locator('[data-interactive="path-call"]');
    await figure.scrollIntoViewIfNeeded();
    const next = figure.getByRole("button", { name: T.nextEdge });
    await next.click();
    for (const target of [
      figure.locator("svg.circuit:not(.circuit-overview)").first(),
      figure.locator(".machine-levels-table tr").nth(3),
      figure.locator(".datapath-tables table").last(),
    ]) {
      await target.evaluate((el) => el.scrollIntoView({ block: "center" }));
      const box = (await next.boundingBox())!;
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x!, y!)?.closest("button")?.textContent ?? "",
        [box.x + box.width / 2, box.y + box.height / 2],
      );
      expect(hit, `${width}x${height}`).toBe(T.nextEdge);
      const steps = (await figure.locator(".machine-steps").boundingBox())!;
      const bar = (await figure.locator(".overview-bar").boundingBox())!;
      // What stays at the top: the controls, and the overview when it is stuck under them.
      const sticky = await figure
        .locator(".overview-bar")
        .evaluate((el) => getComputedStyle(el).position === "sticky");
      expect(sticky, `${width}x${height}`).toBe(height > 860);
      const covered =
        sticky && bar.y <= steps.y + steps.height + 1 ? bar.y + bar.height : steps.y + steps.height;
      expect(covered, `${width}x${height}`).toBeLessThanOrEqual(height / 2);
    }
    const lines = await figure
      .locator(".machine-steps .debugger-status")
      .evaluate((el) =>
        Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)),
      );
    if (width === 375) expect(lines).toBeGreaterThanOrEqual(3);
    const before = await figure.locator(".debugger-status").textContent();
    await next.click();
    await expect(figure.locator(".debugger-status")).not.toHaveText(before ?? "");
  }
});

// 13.2's investigation ends where the PC is at the store the construction asks for: while the ROM
// row keeps its word back, the wire that holds it says so too, and no title gives it.
test("a held word stays held on its wires", async ({ page }) => {
  await openLesson(page, "full-path");
  const figure = page.locator('[data-interactive="path-call"]');
  await figure.scrollIntoViewIfNeeded();
  const next = figure.getByRole("button", { name: T.nextEdge });
  await next.click();
  await next.click();
  await expect(figure.locator(".machine-levels-table")).toContainText(T.romLater);
  await figure
    .getByRole("button", { name: format(T.rowPin, { row: T.machineCode, wire: "FETCHED" }) })
    .click();
  // The drawing scrolls to the wire under the pointer: move it off, so the readout is the pin's.
  await page.mouse.move(0, 0);
  await expect(figure.locator(".wire-readout")).toHaveText(`FETCHED = ${T.romLater}`);
  const titles = await figure
    .locator("svg.circuit:not(.circuit-overview) .wire title")
    .allTextContents();
  expect(titles.filter((x) => x.includes("480207C0"))).toEqual([]);
});

// 13.5's question figure opens on the frame its prediction asks about, where one step would show
// the answer: its values and its steps wait until that prediction is checked.
test("the capstone's question figure waits for the prediction", async ({ page }) => {
  await openLesson(page, "capstone");
  const figure = page.locator('[data-interactive="cap-free"]');
  await figure.scrollIntoViewIfNeeded();
  await expect(figure.locator(".machine-quiet-note")).toHaveText(T.heldNote);
  await expect(figure.locator(".datapath-tables")).toBeHidden();
  await expect(figure.getByRole("button", { name: T.nextEdge })).toBeDisabled();
  const predict = page.locator('[data-interactive="cap-predict"]');
  await predict.scrollIntoViewIfNeeded();
  await predict.getByLabel("1", { exact: true }).check();
  await predict.getByRole("button", { name: DEFAULT_VIEW_STRINGS.prediction.commit }).click();
  await expect(figure.locator(".machine-quiet-note")).toHaveCount(0);
  await expect(figure.locator(".datapath-tables")).toBeVisible();
  await expect(figure.getByRole("button", { name: T.nextEdge })).toBeEnabled();
});

// A control that takes focus from the keyboard is never left under the stuck band: tabbing
// backwards from the levels table into the strip under the drawing, each edge button and each
// row's button lands below the band, inside the window (WCAG 2.4.11).
test("keyboard focus never lands under the stuck band", async ({ page }) => {
  for (const [width, height] of [
    [1280, 900],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await openLesson(page, "full-path");
    const figure = page.locator('[data-interactive="path-call"]');
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: T.nextEdge }).click();
    // Over the drawing, what is stuck is the band and, in a tall window, the overview too, from
    // the first load on.
    const [top, drawing] = await figure.evaluate((el) =>
      ["--sticky-top", "--sticky-drawing"].map((v) =>
        parseFloat((el as HTMLElement).style.getPropertyValue(v)),
      ),
    );
    if (height > 860) expect(drawing!, `${width}x${height}`).toBeGreaterThan(top! + 100);
    else expect(drawing, `${width}x${height}`).toBe(top);
    // From the last row's button of the levels table, backwards through the rows and the strip.
    await figure.locator(".machine-row-wire").last().focus();
    for (let k = 0; k < 14; k++) {
      await page.keyboard.press("Shift+Tab");
      const where = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const band = el?.closest(".machine-levels")?.querySelector(".machine-steps");
        if (!el || !band || band.contains(el) || !el.closest(".machine-levels")) return undefined;
        const r = el.getBoundingClientRect();
        return {
          top: r.top,
          bottom: r.bottom,
          band: band.getBoundingClientRect().bottom,
          text: el.textContent ?? "",
        };
      });
      if (!where) continue;
      expect(where.top, `${width}x${height}: ${where.text}`).toBeGreaterThanOrEqual(where.band - 1);
      expect(where.bottom, `${width}x${height}: ${where.text}`).toBeLessThanOrEqual(height + 1);
    }
  }
});

// The levels table is an index into the drawing: a row's heading pins the wire it reads.
test("a row of the levels table pins its wire on the drawing", async ({ page }) => {
  await openLesson(page, "full-path");
  const figure = page.locator('[data-interactive="path-whole"]');
  await figure.scrollIntoViewIfNeeded();
  const row = figure.getByRole("button", { name: format(T.rowPin, { row: T.inIr, wire: "IR" }) });
  await row.click();
  await expect(row).toHaveAttribute("aria-pressed", "true");
  await expect(figure.locator(".machine-row-pinned")).toHaveCount(1);
  await expect(
    figure.locator("svg.circuit:not(.circuit-overview) .wire-pinned").first(),
  ).toBeVisible();
});
