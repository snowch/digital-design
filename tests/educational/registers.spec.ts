// Copyright © 2026 Christopher Snow

// The registers lesson's challenges and figures, driven through the page as the first lesson's
// are in lesson.spec.ts: every challenge completable with its reference, a plausible wrong
// attempt rejected with the step and the part where it went wrong, saved work graded again on
// load, a reset that clears the work, and hints one rung at a time. Each runs at desktop and
// phone widths.

import { expect, test } from "@playwright/test";

import { testCount } from "@platform/lesson-schema";

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

const LESSON = lessonData("registers");
const data = (id: string) => challengeData(id, LESSON);
const total = (id: string) => testCount(data(id));

/** The construction challenge's tempting wrong answer: EN switches the clock off. */
const GATED_CLOCK = `module keep_bit(input logic D, input logic EN, input logic CLK, output logic Q);
  logic GCLK;
  assign GCLK = CLK & EN;
  always_ff @(posedge GCLK) Q <= D;
endmodule
`;

/** The text challenge with the reset tested second, so it no longer wins over EN. */
const RESET_SECOND = `module register4(input logic [3:0] D, input logic EN, input logic RST, input logic CLK, output logic [3:0] Q);
  always_ff @(posedge CLK) begin
    if (EN) Q <= D;
    else if (RST) Q <= 4'b0000;
  end
endmodule
`;

test.describe("the registers lesson's challenges", () => {
  for (const c of LESSON.challenges) {
    test(`${c.id} is completable with its reference solution through the page`, async ({
      page,
    }) => {
      await openLesson(page, LESSON.id);
      const section = challenge(page, c.id);
      await section.scrollIntoViewIfNeeded();
      await expect(status(section)).toHaveText(S.challenge.notRun);
      if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
      else await importText(section, c.reference.hdl!);
      await runTests(section);
      await expect(status(section)).toHaveText(format(S.challenge.passing, { total: total(c.id) }));
      await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
    });
  }

  test("a clock switched off by EN is rejected where EN rises with the clock high", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "keep-bit");
    await importText(section, GATED_CLOCK);
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 6, total: total("keep-bit") }),
    );
    const first = section.locator(".verdict-failure").first();
    await expect(first.locator("h4")).toHaveText("EN rises while the clock is high");
    // The part named is the flip-flop block the learner placed, not a gate inside it.
    await expect(first).toContainText("The D flip-flop");
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a chain wired from IN to every flip-flop is rejected at the second edge", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "shift-four");
    await importText(
      section,
      `module shift_four(input logic IN, input logic CLK, output logic Q0, output logic Q1, output logic Q2, output logic Q3);
  always_ff @(posedge CLK) Q0 <= IN;
  always_ff @(posedge CLK) Q1 <= IN;
  always_ff @(posedge CLK) Q2 <= IN;
  always_ff @(posedge CLK) Q3 <= IN;
endmodule
`,
    );
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText("edge 2");
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset tested after EN is rejected at the edge where both are 1", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "register-in-text");
    await writeText(section, RESET_SECOND);
    await runTests(section);
    await expect(status(section)).toHaveText(
      format(S.challenge.failing, { passed: 6, total: total("register-in-text") }),
    );
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "edge with RST 1 and EN 1",
    );
  });

  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const c = data("register-in-text");
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
      [storageKey(LESSON.id), c.id, RESET_SECOND] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, c.id).locator(".challenge-complete")).toHaveCount(0);
    await expect(status(challenge(page, c.id))).toHaveText(
      format(S.challenge.failing, { passed: 6, total: total(c.id) }),
    );
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const c = data("register-in-text");
    const section = challenge(page, c.id);
    await writeText(section, c.reference.hdl!);
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator("textarea.hdl-text").first()).toHaveValue(c.initial.hdl ?? "");
    const stored = await page.evaluate((key) => localStorage.getItem(key), storageKey(LESSON.id));
    expect(JSON.parse(stored ?? "{}").challenges?.[c.id]).toBeUndefined();
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "keep-bit");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await expect(section.locator(".hints-list li").first()).toContainText(S.hints.rung[0]);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "keep-bit").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("the registers lesson's figures", () => {
  test("the four flip-flops take their D pins at one press of the clock, and only then", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-four-flip-flops");
    await figure.scrollIntoViewIfNeeded();
    const value = (name: string) =>
      figure.locator("table.signal-table tr", { has: page.locator(`th:text-is("${name}")`) });
    await expect(value("Q0")).toContainText("X");
    await figure.getByRole("button", { name: /^D0 = 0\./ }).click();
    await figure.getByRole("button", { name: /^D2 = 0\./ }).click();
    await expect(value("Q0")).toContainText("X");
    await figure.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    await expect(value("Q0")).toContainText("1");
    await expect(value("Q1")).toContainText("0");
    await expect(value("Q2")).toContainText("1");
    await figure.getByRole("button", { name: /^D1 = 0\./ }).click();
    await expect(value("Q1")).toContainText("0");
  });

  test("raising EN while CLK is 1 makes the gated flip-flop take D", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-gated-clock");
    await figure.scrollIntoViewIfNeeded();
    const q = figure.locator("table.signal-table tr", { has: page.locator('th:text-is("Q")') });
    await figure.getByRole("button", { name: /^D = 0\./ }).click();
    await figure.getByRole("button", { name: /^CLK = 0\./ }).click();
    await expect(q).toContainText("X");
    await figure.getByRole("button", { name: /^EN = 0\./ }).click();
    await expect(q).toContainText("1");
  });

  test("the predictions answer with what the simulator did", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const answers: Record<string, [string, string]> = {
      "predict-word": ["Q", "0110"],
      "predict-keep": ["Q", "XXXX"],
      "predict-chain": ["Q2", "1"],
    };
    for (const [id, [signal, value]] of Object.entries(answers)) {
      const figure = page.locator(`#ix-${id}`);
      await figure.getByRole("radio").first().check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("[role=status]")).toContainText(
        format(V.prediction.circuitDid, { signal, value }),
      );
    }
  });

  test("a press or a tap on a wire shows its name and value, and a second press keeps them", async ({
    page,
    isMobile,
  }) => {
    await openLesson(page, LESSON.id);
    const figure = page.locator("#ix-gated-clock");
    const gclk = figure.locator('g.wire[data-net="GCLK"] path.wire-hit');
    await gclk.scrollIntoViewIfNeeded();
    // A point on the wire itself, halfway along it, in the page's coordinates.
    const at = await gclk.evaluate((el) => {
      const path = el as SVGPathElement;
      const p = path.getPointAtLength(path.getTotalLength() / 2);
      const m = path.getScreenCTM()!;
      return { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
    });
    const press = () =>
      isMobile ? page.touchscreen.tap(at.x, at.y) : page.mouse.click(at.x, at.y);
    await press();
    await expect(figure.locator(".wire-readout")).toHaveText("GCLK = 0");
    await press();
    await expect(figure.locator(".wire-readout")).toHaveText("GCLK = 0");
  });

  test("the text box shows <= as the two characters a learner types", async ({ page }) => {
    await openLesson(page, LESSON.id);
    const box = challenge(page, "register-in-text").locator("textarea.hdl-text").first();
    await expect(box).toHaveCSS("font-variant-ligatures", "none");
  });

  test("the register written as text is drawn as one register block with RST and EN", async ({
    page,
  }) => {
    await openLesson(page, LESSON.id);
    const section = challenge(page, "register-in-text");
    await section.scrollIntoViewIfNeeded();
    await writeText(section, data("register-in-text").reference.hdl!);
    const drawn = section.locator(".hdl-panel svg.circuit");
    await expect(drawn.locator("text.part-label")).toHaveText(["register"]);
    await expect(drawn.locator("text.port-label")).toContainText(["D", "CLK", "RST", "EN", "Q"]);
  });
});
