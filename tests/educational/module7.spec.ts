// Copyright © 2026 Chris Snow

// Module 7's challenges and figures, driven through the page as the earlier modules' are: every
// challenge completed with its reference through the page (drawn with the editor's own buttons,
// written in its text box, or answered in its fields), a plausible wrong attempt rejected with
// the failing test named, saved work graded again on load, a reset that clears the work, hints one
// rung at a time, and the module's new figures used as a learner uses them.

import { expect, test, type Locator } from "@playwright/test";

import { libraryCircuit } from "@dd/dd-model";
import { circuitToDrawing, compileDrawing, grade, labelFor, type Drawing } from "@dd/dd-views";
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

const MODULE_7 = ["alu-jobs", "flags", "wide-alu", "alu-tests"] as const;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function portName(drawing: Drawing, ids: Map<string, string>, ref: { part: string; port: string }) {
  const part = drawing.parts.find((p) => p.id === ref.part)!;
  if (part.kind === "input" || part.kind === "output") return part.name ?? part.id;
  const outputs = drawing.wires.some((w) => w.from.part === ref.part && w.from.port === ref.port);
  return `${ids.get(ref.part)} ${outputs ? V.builder.output : V.builder.input} ${ref.port}`;
}

/** Draws `drawing` with the editor's part buttons and port buttons, as a learner does. */
async function draw(section: Locator, drawing: Drawing): Promise<void> {
  const ids = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const part of drawing.parts) {
    if (part.kind === "input" || part.kind === "output") continue;
    const n = (counts.get(part.kind) ?? 0) + 1;
    counts.set(part.kind, n);
    ids.set(part.id, `${part.kind}${n}`);
    await section
      .getByRole("button", { name: format(V.builder.add, { label: labelFor(part.kind) }) })
      .click();
  }
  for (const w of drawing.wires) {
    for (const end of [w.from, w.to]) {
      const name = portName(drawing, ids, end);
      await section.getByRole("button", { name: new RegExp(`^${escape(name)}\\.`) }).click();
    }
  }
  await expect(section.locator(".builder-status")).toContainText(
    V.builder.connected.split(" ")[0]!,
  );
}

function referenceDrawing(lessonId: string, challengeId: string): Drawing {
  const c = challengeData(challengeId, lessonData(lessonId));
  return circuitToDrawing(libraryCircuit(c.reference.libraryId!));
}

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

/** The label of the first test a drawing fails, as the grader the page runs gives it. */
function firstFailure(lessonId: string, challengeId: string, d: Drawing): string {
  const c = challengeData(challengeId, lessonData(lessonId));
  const v = grade(c, { circuit: compileDrawing(d).circuit });
  return v.failures[0]?.label ?? "";
}

for (const lessonId of MODULE_7) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        test.setTimeout(180_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "draw") await draw(section, referenceDrawing(lessonId, c.id));
        else if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
        else
          for (const [field, value] of Object.entries(c.reference.answers ?? {}))
            await section.locator(`[data-field="${field}"] input`).fill(value);
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
          { timeout: 30_000 },
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

test.describe("Module 7's wrong attempts are rejected with the failing test named", () => {
  test("an eight-job slice that adds B instead of D fails, naming the test", async ({ page }) => {
    test.setTimeout(180_000);
    await openLesson(page, "alu-jobs");
    const section = challenge(page, "eight-job-slice");
    const d = rewired(
      referenceDrawing("alu-jobs", "eight-job-slice"),
      { part: "fa", port: "B" },
      { part: "input:B", port: "y" },
    );
    const label = firstFailure("alu-jobs", "eight-job-slice", d);
    expect(label).not.toBe("");
    await draw(section, d);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a colder lamp that is MINUS alone fails where the subtraction overflows", async ({
    page,
  }) => {
    await openLesson(page, "flags");
    const section = challenge(page, "colder");
    // The lamp drawn as MINUS XOR ZERO: ZERO is 0 wherever the words differ, so it gives MINUS.
    const d = rewired(
      referenceDrawing("flags", "colder"),
      { part: "xorColder", port: "b" },
      { part: "input:ZERO", port: "y" },
    );
    const label = firstFailure("flags", "colder", d);
    expect(label).not.toBe("");
    await draw(section, d);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label);
  });

  test("an adder written into SUM alone loses its carry out", async ({ page }) => {
    await openLesson(page, "wide-alu");
    const section = challenge(page, "adder-text");
    const c = challengeData("adder-text", lessonData("wide-alu"));
    await writeText(
      section,
      c.reference.hdl!.replace(
        "assign {COUT, SUM} = A + B + CIN;",
        "assign SUM = A + B + CIN;\n  assign COUT = 0;",
      ),
    );
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "N = 4: F + 1 + 0",
    );
  });

  test("two small words expose none of the lost carries", async ({ page }) => {
    await openLesson(page, "alu-tests");
    const section = challenge(page, "expose-carries");
    await section.locator('[data-field="a"] input').fill("0001");
    await section.locator('[data-field="b"] input').fill("0001");
    await runTests(section);
    await expect(section.locator(".verdict-failure")).toHaveCount(3);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "C4 stuck at 0",
    );
  });

  test("an ALU that reads OVER from B fails the suite where a subtraction overflows", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "alu-tests");
    const section = challenge(page, "alu-text");
    const c = challengeData("alu-text", lessonData("alu-tests"));
    const wrong = c.reference.hdl!.replace("~(A[N-1] ^ D[N-1])", "~(A[N-1] ^ B[N-1])");
    const label = grade(c, { hdl: wrong }).failures[0]?.label ?? "";
    expect(label).toContain("N = 16");
    await writeText(section, wrong);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label, {
      timeout: 30_000,
    });
  });
});

test.describe("Module 7's saved work, reset and hints", () => {
  test("saved text is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, "wide-alu");
    const id = "adder-text";
    const c = challengeData(id, lessonData("wide-alu"));
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
          "A + B + CIN",
          "A + B",
        );
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("wide-alu"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, "flags");
    const id = "zero-slice";
    const section = challenge(page, id);
    await draw(section, referenceDrawing("flags", id));
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator(".builder g.part")).toHaveCount(0);
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, "alu-tests");
    const section = challenge(page, "alu-text");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "alu-text").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 7's figures", () => {
  test("the predictions answer with what the simulator did", async ({ page }) => {
    const answers: Record<string, Record<string, [string, string]>> = {
      "alu-jobs": { "predict-count-down": ["Y", "1111"] },
      flags: { "predict-minus": ["MINUS", "1"] },
    };
    for (const [lessonId, figures] of Object.entries(answers)) {
      await openLesson(page, lessonId);
      for (const [id, [signal, value]] of Object.entries(figures)) {
        const figure = page.locator(`#ix-${id}`);
        await figure.getByRole("radio").first().check();
        await figure.getByRole("button", { name: V.prediction.commit }).click();
        await expect(figure.locator("[role=status]")).toContainText(
          format(V.prediction.circuitDid, { signal, value }),
        );
      }
    }
  });

  test("the carry figure asks first, then steps the carry to the end", async ({ page }) => {
    await openLesson(page, "wide-alu");
    const figure = page.locator("#ix-predict-steps");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".carry-grid")).toHaveCount(0);
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await figure.getByRole("radio", { name: /FFFF/ }).check();
    await figure.getByRole("button", { name: V.carrySteps.end }).click();
    await expect(figure.locator(".explorer-steps [role=status]")).toContainText(
      format(V.carrySteps.settled, { n: 36 }),
    );
    await figure.getByRole("button", { name: V.carrySteps.back }).click();
    await expect(figure.locator(".explorer-steps")).toContainText(
      format(V.explorer.stepOf, { k: 35, n: 36 }),
    );
  });

  test("the suite runs, counts its failures by kind, and draws new random tests", async ({
    page,
  }) => {
    await openLesson(page, "alu-tests");
    const figure = page.locator("#ix-suite-faults");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: V.suite.run }).click();
    await expect(figure.locator(".suite-result [role=status]")).toHaveText(
      format(V.suite.allPass, { total: 79 }),
    );
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.suite.run }).click();
    await expect(figure.locator(".suite-result [role=status]")).toHaveText(
      format(V.suite.someFail, { failed: 10, total: 79 }),
    );
    await figure.getByRole("button", { name: V.suite.newSeed }).click();
    await expect(figure.locator(".suite-seed")).toContainText("2");
  });

  test("the 64-bit ALU opens one level at a time, down to a slice's gates", async ({ page }) => {
    await openLesson(page, "wide-alu");
    const figure = page.locator("#ix-levels-64");
    await figure.scrollIntoViewIfNeeded();
    // The four groups open; "join" and "top bit" are sealed.
    await expect(figure.locator("g.part-composite")).toHaveCount(4);
    await figure.locator('g.part-composite[data-path="g1"]').click();
    await figure.locator('g.part-composite[data-path="g1/q2"]').click();
    await figure.locator('g.part-composite[data-path="g1/q2/bit3"]').click();
    await expect(figure.locator("g.part-and")).toHaveCount(4);
    await expect(figure.locator(".circuit-crumbs button")).toHaveCount(4);
  });
});
