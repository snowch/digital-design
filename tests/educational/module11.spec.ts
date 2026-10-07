// Copyright © 2026 Christopher Snow

// Module 11's challenges and figures, driven through the page: every challenge completed with its
// reference (a program typed into its box, or answers field by field), a plausible wrong program
// rejected with the run it failed named and what the program left, saved work graded again on
// load, and the lab used as a learner uses it: a program stepped and run, a breakpoint and a
// watch, a prediction answered by the run, and a program the assembler refuses mended.

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

const T = DEFAULT_VIEW_STRINGS.machine11;

/** Debuggers with breakpoints and a watch on a program longer than the listing's box. */
const LONG_DEBUGGERS = [
  ["lists", "walk"],
  ["stack", "pushed"],
  ["recursion", "frames"],
] as const;

const MODULE_11 = [
  "assembly",
  "lists",
  "functions",
  "stack",
  "recursion",
  "debugging",
  "log-report",
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

for (const lessonId of MODULE_11) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write") await writeText(section, c.reference.text!);
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

/** A wrong program: the reference with one change, the run it fails, and what it left. */
const WRONG: readonly {
  lesson: string;
  id: string;
  from: string;
  to: string;
  /** Every occurrence of `from`, not only the first. */
  all?: boolean;
  fails: string;
  left: string;
}[] = [
  {
    lesson: "assembly",
    id: "warmer-room",
    from: "signed goto show",
    to: "unsigned goto show",
    fails: "Room A -30, room B 15",
    left: "the display -30",
  },
  {
    lesson: "lists",
    id: "first-warmer",
    from: "if R3 < R5 signed goto found",
    to: "if R3 < R5 unsigned goto found",
    fails: "Log -200, 25, -150, 30; limit -150",
    left: "the display 0",
  },
  {
    lesson: "lists",
    id: "largest-rise",
    from: "R3 <= R6 - R5         // the largest rise so far: the first pair's",
    to: "R3 <= 0",
    fails: "Log -190, -195, -200",
    left: "the display 0",
  },
  {
    lesson: "functions",
    id: "larger",
    from: "R10",
    to: "R5",
    all: true,
    fails: "Room A -160, room B -195",
    left: "the display 5",
  },
  {
    lesson: "functions",
    id: "out-of-range",
    from: "signed goto below",
    to: "unsigned goto below",
    fails: "Call R1 -15, R2 20, R3 50",
    left: "R1 0",
  },
  {
    lesson: "stack",
    id: "rooms-over",
    from: "        R14 <= R14 - 8\n        word[R14] <= R11     // push R11\n",
    to: "",
    fails: "Call R1 -170, R2 -190",
    left: "R10, R11, R14",
  },
  {
    lesson: "recursion",
    id: "farthest",
    from: "        R1 <= R11\n",
    to: "",
    fails: "The lesson's store",
    left: "the display 3",
  },
  {
    lesson: "debugging",
    id: "mend-count",
    from: "       R2 <= R2 - 1\n",
    to: "",
    fails: "Log -190, -181, -175, -170; limit -180",
    left: "the branch compares R5, which is not set",
  },
  {
    lesson: "debugging",
    id: "mend-over",
    from: "R11 <= word[count]   //",
    to: "R11 <= count        //",
    fails: "Log -190, -181, -175, -170; limit -180",
    left: "the display 94",
  },
  {
    lesson: "log-report",
    id: "day-report",
    from: "          R5 <= word[R1]        // the highest so far: the first reading",
    to: "          R5 <= 0",
    fails: "Log 1: the whole program",
    left: "the word at 408 0",
  },
];

test.describe("Module 11's wrong programs", () => {
  for (const w of WRONG) {
    test(`${w.id}: a plausible wrong program fails ${w.fails}, leaving ${w.left}`, async ({
      page,
    }) => {
      const c = lessonData(w.lesson).challenges.find((x) => x.id === w.id)!;
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await section.scrollIntoViewIfNeeded();
      const text = c.reference.text!;
      await writeText(section, w.all ? text.replaceAll(w.from, w.to) : text.replace(w.from, w.to));
      await runTests(section);
      const failure = section.locator(".verdict-failure").filter({ hasText: w.fails });
      await expect(failure).toHaveCount(1);
      await expect(failure).toContainText(w.left);
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
    });
  }

  test("a program the assembler refuses is not run, and the refusal names its line", async ({
    page,
  }) => {
    await openLesson(page, "assembly");
    const section = challenge(page, "warmer-room");
    await writeText(section, "R2 <= word[sensorA]\nR3 <= 5000\nstop");
    await expect(section.locator(".program-text p.hdl-errors")).toHaveText(T.refusedTitleOne);
    await expect(section.locator(".program-text .hdl-errors li")).toHaveText([
      format(T.refusedLine, {
        line: 2,
        sentence: format(T.refusals.constantRange, { value: "5000" }),
      }),
    ]);
    await runTests(section);
    await expect(section.locator(".verdict-blocked")).toContainText(T.notAssembled);
  });

  test("saved work is graded again on load", async ({ page }) => {
    const c = lessonData("assembly").challenges.find((x) => x.id === "warmer-room")!;
    await openLesson(page, "assembly");
    await writeText(challenge(page, c.id), c.reference.text!);
    await runTests(challenge(page, c.id));
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(challenge(page, c.id).locator(".challenge-complete")).toBeVisible();
  });
});

test.describe("Module 11's lab", () => {
  test("the capstone offers the skeleton or an empty program to start from", async ({ page }) => {
    await openLesson(page, "log-report");
    const section = challenge(page, "day-report");
    await section.scrollIntoViewIfNeeded();
    const box = section.locator("textarea.program-source");
    await expect(box).toHaveValue(/lowestOf:/);
    await section.getByRole("button", { name: T.startEmpty }).click();
    await expect(box).not.toHaveValue(/lowestOf:/);
    await section.getByRole("button", { name: T.startSkeleton }).click();
    await expect(box).toHaveValue(/lowestOf:/);
  });

  test("a breakpoint pauses the loop each time round, and the watch shows R1 moving", async ({
    page,
  }) => {
    await openLesson(page, "lists");
    const figure = page.locator('[data-interactive="walk"]');
    await figure.scrollIntoViewIfNeeded();
    const run = figure.getByRole("button", { name: T.runToPause, exact: true });
    await run.click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.paused, { address: "014" }),
    );
    await run.click();
    await expect(figure.locator(".watch-list li").first()).toContainText("72");
    await expect(figure.locator(".watch-list li").first()).toContainText(
      format(T.watchWas, { value: "64" }),
    );
    await expect(figure.locator(".debugger-memory .row-current")).toContainText("048");
    await figure.getByRole("textbox", { name: T.watchLabel }).fill("word[log + 8]");
    await figure.getByRole("button", { name: T.watchAdd, exact: true }).click();
    await expect(figure.locator(".watch-list li")).toHaveCount(5);
    await figure.getByRole("button", { name: format(T.pauseBefore, { address: "014" }) }).click();
    // With no breakpoint left, the button runs to the end.
    await figure.getByRole("button", { name: T.run, exact: true }).click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.stops.stop!, { address: "034" }),
    );
  });

  test("the buttons, the line about to run and the watch stay on one screen as the run moves", async ({
    page,
  }) => {
    const height = page.viewportSize()?.height ?? 0;
    const inView = async (what: Locator) => {
      const box = await what.boundingBox();
      expect(box, "the element is drawn").not.toBeNull();
      expect(box!.y, "its top is on the screen").toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, "its bottom is on the screen").toBeLessThanOrEqual(height);
    };
    for (const [lessonId, id] of LONG_DEBUGGERS) {
      await openLesson(page, lessonId);
      const figure = page.locator(`[data-interactive="${id}"]`);
      const actions = figure.locator(".debugger-actions");
      await actions.evaluate((e) => {
        e.scrollIntoView({ block: "start" });
        window.scrollBy(0, -16);
      });
      const listing = figure.locator(".debugger-listing-wrap");
      const check = async () => {
        await inView(actions);
        await inView(figure.locator(".watch-list"));
        // The line about to run is inside the listing's box, not scrolled out of it.
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
      ["assembly", "room-a"],
      ["stack", "pushed"],
      ["recursion", "way-back"],
    ] as const) {
      await openLesson(page, lessonId);
      const figure = page.locator(`[data-interactive="${id}"]`);
      const props = lessonData(lessonId)
        .sections.flatMap((x) => x.interactives)
        .find((x) => x.id === id)!.props as { outcomes: string };
      const first = props.outcomes.split(/[.:]/)[0]!.replace(/`/g, "");
      await expect(figure.getByText(first, { exact: false })).toHaveCount(0);
      const runs = figure.getByRole("button", { name: /^Run to/ });
      for (let k = 0; k < 40 && (await runs.isEnabled()); k++) await runs.click();
      await expect(figure.getByText(first, { exact: false }).first()).toBeVisible();
    }
  });

  test("lesson 5 opens on the cold store's rooms as words, the hall's reading first", async ({
    page,
  }) => {
    await openLesson(page, "recursion");
    const figure = page.locator('[data-interactive="rooms"]');
    await expect(figure.locator(".debugger-memory tbody tr")).toHaveCount(18);
    await expect(figure.locator(".debugger-memory tbody tr").first()).toContainText("-150");
  });

  test("the opening figure of lesson 2 moves R1 down the log, one reading a press", async ({
    page,
  }) => {
    await openLesson(page, "lists");
    const figure = page.locator('[data-interactive="log-in-memory"]');
    await expect(figure.locator(".debugger-listing")).toHaveCount(0);
    const next = figure.getByRole("button", {
      name: lessonData("lists").sections[0]!.interactives[0]!.props!["runLabel"] as string,
    });
    await next.click();
    await expect(figure.locator(".debugger-memory .row-current")).toContainText("040");
    await next.click();
    await expect(figure.locator(".debugger-memory .row-current")).toContainText("048");
  });

  test("the debugger steps a program and says why it stopped", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="room-a"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".debugger-status")).toHaveText(T.atStart);
    await figure.getByRole("button", { name: T.step, exact: true }).click();
    await expect(figure.locator('[data-register="2"] dd')).toHaveText("-170");
    await figure.getByRole("button", { name: T.run, exact: true }).click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.stops.stop!, { address: "018" }),
    );
    await expect(figure.locator(".debugger-display")).toHaveText("-170");
    await figure.getByRole("button", { name: T.back, exact: true }).click();
    await expect(figure.locator(".debugger-status")).toContainText(
      format(T.next, { address: "018" }),
    );
  });

  test("the branch's constant shows only once the prediction is made", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="predict-constant"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).not.toContainText("56230003");
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: DEFAULT_VIEW_STRINGS.prediction.commit }).click();
    await expect(figure).toContainText("56230003");
  });

  test("the three refused lines, mended, give a listing and a debugger", async ({ page }) => {
    await openLesson(page, "assembly");
    const figure = page.locator('[data-interactive="mistakes"]');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".hdl-errors li")).toHaveCount(3);
    const box = figure.locator("textarea");
    const text = (await box.inputValue())
      .replace("-18000", "-180")
      .replace("goto fine", "signed goto fine")
      .replace("dispaly", "display");
    await box.fill(text);
    await expect(figure.locator(".hdl-errors")).toHaveCount(0);
    await expect(figure.locator(".debugger-listing")).toBeVisible();
    await figure.getByRole("button", { name: T.restore }).click();
    await expect(figure.locator(".hdl-errors li")).toHaveCount(3);
  });
});
