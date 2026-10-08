// Copyright © 2026 Christopher Snow

// Module 12's challenges and figures, driven through the page: every challenge completed with its
// reference, a plausible wrong handler rejected, saved work graded again on load, the debugger's
// buttons, its line about to run and the panel a lead points at kept on one screen as a run
// moves, results shown only once a run has ended, the trap timeline stepped edge by edge, the
// door's time chosen, and the capstone's three ways in.

import { expect, test, type Locator } from "@playwright/test";

import { DEFAULT_VIEW_STRINGS, grade } from "@dd/dd-views";
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

const T = DEFAULT_VIEW_STRINGS.machine11;
const T12 = DEFAULT_VIEW_STRINGS.machine12;

const MODULE_12 = [
  "traps",
  "saving-state",
  "user-mode",
  "system-calls",
  "interrupts",
  "nesting",
  "trap-hardware",
  "system-call-mechanism",
] as const;

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
    } else await field.locator("input").fill(value);
  }
}

for (const lessonId of MODULE_12) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write")
          await writeText(section, c.reference.text ?? c.reference.hdl!);
        else await answerAll(section, c, c.reference.answers ?? {});
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
}

/** A wrong handler: the reference with one change; the test it fails is read off the grader. */
const WRONG: readonly { lesson: string; id: string; from: string; to: string; why: string }[] = [
  {
    lesson: "traps",
    id: "skip-refused",
    from: "        R6 <= 0x34\n        if R5 != R6 goto other\n",
    to: "",
    why: "counts and skips every cause",
  },
  {
    lesson: "saving-state",
    id: "save-registers",
    from: "handler: word[0x408] <= R5      // save R5\n",
    to: "handler: nothing\n",
    why: "does not save R5",
  },
  {
    lesson: "user-mode",
    id: "start-user",
    from: "        R1 <= 0\n        C1 <= R1\n",
    to: "        R1 <= 1\n        C1 <= R1\n",
    why: "starts the program in system mode",
  },
  {
    lesson: "interrupts",
    id: "door-timer",
    from: "        if R8 != R9 goto back   // closed in time\n",
    to: "",
    why: "lights ALARM whether or not the door has closed",
  },
  {
    lesson: "nesting",
    id: "wait-door",
    from: "        R1 <= word[0x418]\n        C2 <= R1\n",
    to: "",
    why: "does not write C2 back",
  },
  {
    lesson: "trap-hardware",
    id: "traplogic-text",
    from: "  assign TRAP = traps & ~NOHANDLER;",
    to: "  assign TRAP = traps;",
    why: "traps with no handler",
  },
  {
    lesson: "system-call-mechanism",
    id: "shop-handler",
    from: "finish: R9 <= 0                 // job 4: the program ended; its record is 0\n",
    to: "finish: stop\n",
    why: "stops the machine at job 4",
  },
];

test.describe("Module 12's wrong handlers", () => {
  for (const w of WRONG) {
    test(`${w.id}: a handler that ${w.why} is rejected`, async ({ page }) => {
      const c = lessonData(w.lesson).challenges.find((x) => x.id === w.id)!;
      const reference = c.reference.text ?? c.reference.hdl!;
      const wrong = reference.replace(w.from, w.to);
      expect(wrong).not.toBe(reference);
      const artifact = c.reference.text !== undefined ? { text: wrong } : { hdl: wrong };
      const label = grade(c, artifact).failures[0]?.label ?? "";
      expect(label).not.toBe("");
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await section.scrollIntoViewIfNeeded();
      await writeText(section, wrong);
      await runTests(section);
      await expect(section.locator(".verdict-failure").filter({ hasText: label })).toHaveCount(1);
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }

  test("saved work is graded again on load", async ({ page }) => {
    const c = lessonData("system-calls").challenges.find((x) => x.id === "sensor-service")!;
    await openLesson(page, "system-calls");
    await writeText(challenge(page, c.id), c.reference.text!);
    await runTests(challenge(page, c.id));
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
  });
});

/** Debuggers with a breakpoint, each with the panel its lead points at. */
const LONG_DEBUGGERS = [
  ["traps", "night-debugger", ".debugger-control"],
  // The panel's readings: the door's time below them is chosen before a run, not during it.
  ["interrupts", "door-debugger", ".debugger-events dl"],
  ["nesting", "nest-saved", ".debugger-memory"],
  ["system-call-mechanism", "run-walk", ".debugger-memory"],
] as const;

test.describe("Module 12's lab", () => {
  test("the buttons, the line about to run and the panel the lead points at stay on one screen as the run moves", async ({
    page,
  }) => {
    const height = page.viewportSize()?.height ?? 0;
    const inView = async (what: Locator, name = "") => {
      const box = await what.boundingBox();
      expect(box, `${name} is drawn`).not.toBeNull();
      expect(box!.y, `${name}: its top is on the screen`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${name}: its bottom is on the screen`).toBeLessThanOrEqual(
        height,
      );
    };
    for (const [lessonId, id, view] of LONG_DEBUGGERS) {
      await openLesson(page, lessonId);
      const figure = page.locator(`[data-interactive="${id}"]`);
      const actions = figure.locator(".debugger-actions");
      // The figure's top at the screen's: on a wide screen the panels start level with it.
      await figure.evaluate((e) => e.scrollIntoView({ block: "start" }));
      const listing = figure.locator(".debugger-listing-wrap");
      const check = async () => {
        await inView(actions, `${lessonId}'s buttons`);
        await inView(figure.locator(view).first(), `${lessonId}'s ${view}`);
        const row = await figure.locator("tr[aria-current]").boundingBox();
        const wrap = await listing.boundingBox();
        expect(row!.y).toBeGreaterThanOrEqual(wrap!.y);
        expect(row!.y + row!.height).toBeLessThanOrEqual(wrap!.y + wrap!.height);
        await inView(figure.locator("tr[aria-current]"));
      };
      const step = figure.getByRole("button", { name: T.step, exact: true });
      for (let k = 0; k < 12; k++) await step.click();
      await check();
      await figure.getByRole("button", { name: T.runToPause, exact: true }).click();
      await check();
      await figure.getByRole("button", { name: T.back, exact: true }).click();
      await check();
    }
  });

  test("a figure's result shows only once its run has ended", async ({ page }) => {
    for (const [lessonId, id] of [
      ["traps", "night-halts"],
      ["user-mode", "ram-unguarded"],
      ["interrupts", "door-no-clear"],
      ["nesting", "nest-late"],
    ] as const) {
      await openLesson(page, lessonId);
      const figure = page.locator(`[data-interactive="${id}"]`);
      const props = lessonData(lessonId)
        .sections.flatMap((x) => x.interactives)
        .find((x) => x.id === id)!.props as { outcomes: string };
      const first = props.outcomes.split(/[.:]/)[0]!.replace(/`/g, "");
      await expect(figure.getByText(first, { exact: false })).toHaveCount(0);
      await figure.getByRole("button", { name: T.run, exact: true }).click();
      await expect(figure.getByText(first, { exact: false }).first()).toBeVisible();
    }
  });

  test("the trap timeline adds one edge a press, and its result shows at the last edge", async ({
    page,
  }) => {
    await openLesson(page, "traps");
    const figure = page.locator('[data-interactive="night-timeline"]');
    await figure.scrollIntoViewIfNeeded();
    const next = figure.getByRole("button", { name: T12.nextEdge, exact: true });
    await expect(figure.locator(".trap-edge")).toHaveCount(0);
    for (let k = 0; k < 6; k++) await next.click();
    await expect(figure.locator(".trap-edge")).toHaveCount(6);
    await expect(figure.locator(".trap-edge").last()).toContainText("C2 ← 014");
    await figure.getByRole("button", { name: T12.backEdge, exact: true }).click();
    await expect(figure.locator(".trap-edge")).toHaveCount(5);
    await figure.getByRole("button", { name: T12.toEnd, exact: true }).click();
    await expect(figure.locator(".trap-edge")).toHaveCount(15);
    await expect(next).toBeDisabled();
  });

  test("the debugger shows the control registers after a trap and goes to the handler", async ({
    page,
  }) => {
    await openLesson(page, "traps");
    const figure = page.locator('[data-interactive="night-debugger"]');
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: T.runToPause, exact: true }).click();
    const control = figure.locator(".debugger-control");
    await expect(control).toContainText("014");
    await expect(control).toContainText("024");
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T12.trapped, { address: "014", cause: "34", handler: "024" }),
    );
  });

  test("choosing when the door opens changes the run", async ({ page }) => {
    await openLesson(page, "interrupts");
    const figure = page.locator('[data-interactive="door-debugger"]');
    await figure.scrollIntoViewIfNeeded();
    const choice = figure.getByRole("combobox", { name: T12.doorChoice });
    const runOut = async () => {
      const runs = figure.getByRole("button", { name: /^Run to/ });
      for (let k = 0; k < 10 && (await runs.isEnabled()); k++) await runs.click();
    };
    await choice.selectOption({ label: T12.doorNever });
    await runOut();
    await expect(figure.locator(".debugger-status")).toContainText(format(T12.trapCount, { n: 2 }));
    await choice.selectOption({ label: format(T12.doorBefore, { n: 15 }) });
    await runOut();
    await expect(figure.locator(".debugger-status")).toContainText(format(T12.trapCount, { n: 4 }));
  });

  test("the capstone offers the guided start or an empty program to start from", async ({
    page,
  }) => {
    await openLesson(page, "system-call-mechanism");
    const section = challenge(page, "shop-handler");
    await section.scrollIntoViewIfNeeded();
    const box = section.locator("textarea.program-source");
    await expect(box).toHaveValue(/handler:/);
    await section.getByRole("button", { name: T.startEmpty }).click();
    await expect(box).not.toHaveValue(/handler:/);
    await section.getByRole("button", { name: T.startSkeleton }).click();
    await expect(box).toHaveValue(/handler:/);
  });
});
