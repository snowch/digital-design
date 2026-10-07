// Copyright © 2026 Christopher Snow

// Module 10's challenges and figures, driven through the page as Module 9's are: every challenge
// completed with its reference (written in its text box, or answered field by field), a
// plausible wrong attempt rejected with the failing test named, saved work graded again on load,
// and the figures used as a learner uses them: two machines run side by side, a prediction
// answered by the simulators, and a fault that breaks the agreement.

import { expect, test, type Locator } from "@playwright/test";

import { grade } from "@dd/dd-views";
import { testCount, type Challenge } from "@platform/lesson-schema";

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

const MODULE_10 = [
  "instruction-set",
  "encoding",
  "immediates",
  "room-to-grow",
  "design-an-instruction",
] as const;

/** Fills an answers challenge's fields: a choice by its option's words, any other by typing. */
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

for (const lessonId of MODULE_10) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference, through the page`, async ({ page }) => {
        test.setTimeout(300_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        if (c.gradedDirection === "write") await writeText(section, c.reference.hdl!);
        else await answerAll(section, c, c.reference.answers ?? {});
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

/** A wrong attempt: a text with one change, or answers with one changed, and why it is wrong. */
const WRONG: readonly {
  lesson: string;
  id: string;
  from?: string;
  to?: string;
  answers?: Readonly<Record<string, string>>;
  why: string;
}[] = [
  {
    lesson: "instruction-set",
    id: "sort-parts",
    answers: { ir: "set" },
    why: "the IR counted as a part every machine agrees on",
  },
  {
    lesson: "instruction-set",
    id: "short-jobs",
    from: "  assign WREG = ((state == WRITE) | ((state == ALU) & ~MEM)) & WRITEY & GO;",
    to: "  assign WREG = (state == WRITE) & WRITEY & GO;",
    why: "jobs that end at ALU without writing register Y",
  },
  {
    lesson: "encoding",
    id: "encode-words",
    answers: { sub: "2220500" + "7" },
    why: "a subtract written with the add job",
  },
  {
    lesson: "encoding",
    id: "ydigit-text",
    from: "      4'h3: WA = IR[19:16];\n",
    to: "",
    why: "a load's Y left in digit 3",
  },
  {
    lesson: "immediates",
    id: "reach",
    answers: { back: "FEC" },
    why: "a branch's distance counted in bytes",
  },
  {
    lesson: "immediates",
    id: "greater-text",
    from: "  assign GT = M ^ V;",
    to: "  assign GT = ~(M ^ V);",
    why: "less than turned over, which is 1 for equal words",
  },
  {
    lesson: "room-to-grow",
    id: "code-fates",
    answers: { never: "free" },
    why: "a branch that never branches thought free, though an old program may use it",
  },
  {
    lesson: "room-to-grow",
    id: "count-calls",
    answers: { withoutCall: "11" },
    why: "the call through a register counted on the course's machine, which has none",
  },
  {
    lesson: "design-an-instruction",
    id: "design",
    answers: { kind: "9" },
    why: "kind 9, which the copy's call through a register holds",
  },
  {
    lesson: "design-an-instruction",
    id: "set-decoder",
    from: "(K == 4'h5) | (K == 4'hA)) & J[3])",
    to: "(K == 4'h5)) & J[3])",
    why: "kind A's jobs 8 to F left legal",
  },
  {
    lesson: "design-an-instruction",
    id: "set-machine",
    from: "    if (SET) YIN = {63'h0, MET};\n",
    to: "",
    why: "SET joined but no new source for register Y",
  },
  {
    lesson: "design-an-instruction",
    id: "set-machine",
    from: "{63'h0, MET}",
    to: "{63'h0, MINUS}",
    why: "MINUS alone as the condition, wrong when the subtraction overflows",
  },
];

test.describe("Module 10's wrong attempts are rejected with the failing test named", () => {
  for (const w of WRONG) {
    test(`${w.id}: ${w.why}`, async ({ page }) => {
      test.setTimeout(240_000);
      const c = challengeData(w.id, lessonData(w.lesson));
      const answers = { ...(c.reference.answers ?? {}), ...(w.answers ?? {}) };
      const wrong = w.from ? c.reference.hdl!.replace(w.from, w.to ?? "") : undefined;
      if (wrong !== undefined) expect(wrong).not.toBe(c.reference.hdl);
      const label =
        grade(c, wrong !== undefined ? { hdl: wrong } : { answers }).failures[0]?.label ?? "";
      expect(label).not.toBe("");
      await openLesson(page, w.lesson);
      const section = challenge(page, w.id);
      await section.scrollIntoViewIfNeeded();
      if (wrong !== undefined) await writeText(section, wrong);
      else await answerAll(section, c, answers);
      await runTests(section);
      await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(label, {
        timeout: 180_000,
      });
      await expect(section.locator(".challenge-complete")).toHaveCount(0);
      // A wrong choice or number is answered by the rule it misses, not by the right answer.
      if (
        wrong === undefined &&
        c.tests.kind === "answers" &&
        c.tests.grader !== "instruction-word"
      )
        await expect(section.locator(".verdict-failure .verdict-detail").first()).toBeVisible();
    });
  }
});

test.describe("Module 10's saved work", () => {
  test("saved answers are graded again on load; a saved mark alone earns nothing", async ({
    page,
  }) => {
    const id = "sort-parts";
    const c = challengeData(id, lessonData("instruction-set"));
    await openLesson(page, "instruction-set");
    await answerAll(challenge(page, id), c, c.reference.answers ?? {});
    await runTests(challenge(page, id));
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();
    await page.evaluate(
      ([key, cid]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        stored.challenges[cid].artifact.answers.hr = "set";
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("instruction-set"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });
});

test.describe("Module 10's figures", () => {
  const T = V.machine10;
  const seenRow = (figure: Locator, name: string) =>
    figure
      .locator("table.compare-seen tr")
      .filter({ has: figure.page().locator("th", { hasText: new RegExp(`^${name}$`) }) });

  test("the opening drawing puts the parts a program can see inside both machines", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-parts");
    await figure.scrollIntoViewIfNeeded();
    const band = (cls: string) => figure.locator(`.${cls} [data-part]`);
    await expect(band("parts-shared")).toHaveCount(4);
    await expect(figure.locator(".parts-shared [data-part=registers] .parts-form")).toHaveText(
      format(T.forms.registers, { count: 16, width: 64 }),
    );
    // Module 8's IR is a bus; Module 9 keeps the IR, the held words and the controller's state.
    await expect(band("parts-single")).toHaveCount(1);
    await expect(figure.locator(".parts-single [data-part=ir] .parts-form")).toHaveText(
      format(T.forms.romOutput, { width: 32 }),
    );
    await expect(band("parts-multi")).toHaveCount(6);
    await expect(figure.locator(".parts-multi [data-part=state] .parts-form")).toHaveText(
      format(T.forms.register, { width: 3 }),
    );
  });

  test("the prediction in the middle of a load is answered by the two simulators", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-predict-mid");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: T.clock })).toHaveCount(0);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.locator("table.compare-own")).toContainText("MEMORY");
    await expect(figure.locator("table.compare-own")).toContainText("7D8");
  });

  test("both machines run the colder room to -250 and agree after every instruction", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-side-by-side");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("button", { name: T.clock }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(
      format(T.statusIn, { k: 1, address: "000" }),
    );
    await figure.getByRole("button", { name: T.run }).click();
    await expect(figure.locator(".datapath-status")).toHaveText(T.statusStopped);
    await expect(seenRow(figure, T.display).locator("td")).toHaveText(["-250", "-250", T.agree]);
    const log = figure.locator("table.compare-log tbody tr");
    await expect(log).toHaveCount(6);
    await expect(log.nth(0).locator("td").nth(2)).toHaveText("5");
    // The stop: Module 8's one edge, Module 9's two (its fetch, and the edge at which it halts).
    await expect(log.nth(5).locator("td").nth(1)).toHaveText("1");
    await expect(log.nth(5).locator("td").nth(2)).toHaveText("2");
    await expect(figure.getByText(/23 in all/)).toBeVisible();
  });

  test("PCEN stuck at 1 breaks the agreement at R2; its outcome shows only after its run", async ({
    page,
  }) => {
    await openLesson(page, "instruction-set");
    const figure = page.locator("#ix-compare-faults");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("radio", { name: "PCEN stuck at 1" }).check();
    await expect(figure.getByText(/Module 9's PC has moved/)).toHaveCount(0);
    await figure.getByRole("button", { name: T.next }).click();
    await expect(seenRow(figure, format(T.register, { n: 2 }))).toContainText(T.differsMark);
    await figure.getByRole("button", { name: T.run }).click();
    await expect(figure.getByText(/Module 9's PC has moved/)).toBeVisible();
  });

  test("the packed layout moves a constant job's Y, once the prediction is committed", async ({
    page,
  }) => {
    await openLesson(page, "encoding");
    const figure = page.locator("#ix-predict-moved");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".layout-row")).toHaveCount(0);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.getByText("Word: 22120064")).toBeVisible();
    await expect(figure.locator(".layout-field.moved")).toHaveText(["Y2"]);
  });

  test("the layouts open on a register job, which nothing moves; a load's Y moves", async ({
    page,
  }) => {
    await openLesson(page, "encoding");
    const figure = page.locator("#ix-layouts");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByText("Word: 13123000").first()).toBeVisible();
    await expect(figure.locator(".layout-field.moved")).toHaveCount(0);
    await expect(figure.locator(".layout-moved")).toHaveText(T.layoutStill);
    await figure.getByRole("radio").nth(4).check();
    await expect(figure.getByText("Word: 380207D8")).toBeVisible();
    await expect(figure.locator(".layout-field.moved")).toHaveText(["Y2"]);
  });

  test("the explorer reads a typed word, and the calculator runs the ALU on its job", async ({
    page,
  }) => {
    await openLesson(page, "encoding");
    const figure = page.locator("#ix-explorer");
    await figure.scrollIntoViewIfNeeded();
    const word = figure.getByRole("textbox", { name: T.wordLabel });
    await word.fill("22102064");
    await expect(figure.locator(".explorer-meaning")).toHaveText("R2 ← R1 + 100");
    await word.fill("00000000");
    await expect(figure.locator(".explorer-meaning")).toContainText("cause 21");
    await expect(figure.locator(".calculator-y")).toContainText("66");
    await expect(figure.locator(".calculator-flags")).toHaveText(
      `${T.flagsLabel}: ZERO 0, MINUS 0, COUT 1, OVER 0`,
    );
    await word.fill("22102064");
    await figure.getByRole("button", { name: T.fromWord }).click();
    await expect(figure.getByRole("textbox", { name: T.bLabel })).toHaveValue("100");
    await expect(figure.locator(".calculator-y")).toContainText("-84");
    await expect(figure.locator(".calculator-took")).toContainText(T.tookB);
    // A switch of form converts the words typed: B keeps its value, written in hexadecimal.
    await figure.getByRole("radio", { name: T.formHex }).check();
    await expect(figure.getByRole("textbox", { name: T.bLabel })).toHaveValue("64");
    await expect(figure.locator(".calculator-y")).toContainText("-84");
    // B typed by hand is no longer the word's constant.
    await figure.getByRole("textbox", { name: T.bLabel }).fill("65");
    await expect(figure.locator(".calculator-took")).not.toContainText(T.tookB);
  });

  test("the branch that says greater than is the swapped less than; the table holds for all", async ({
    page,
  }) => {
    await openLesson(page, "immediates");
    const figure = page.locator("#ix-predict-greater");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("table.swap-table")).toHaveCount(0);
    await expect(figure.locator("table.swap-pairs tbody tr")).toHaveCount(3);
    await figure.getByRole("radio").first().check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    // Only the rows asked about: R1 > R2, then each option's branch, for each pair.
    await expect(figure.locator("table.swap-pairs")).toHaveCount(0);
    await expect(figure.locator("table.swap-asked tbody tr")).toHaveCount(4);
    await expect(figure.locator("table.swap-asked tbody tr").first()).toContainText(
      [T.yes, T.no, T.no].join(""),
    );
    await expect(figure.locator("table.swap-table")).toHaveCount(0);
  });

  test("each comparison shows the subtraction its branch makes, and the overflow", async ({
    page,
  }) => {
    await openLesson(page, "immediates");
    const figure = page.locator("#ix-comparisons");
    await figure.scrollIntoViewIfNeeded();
    await figure.getByRole("radio").last().check();
    const rows = figure.locator("table.swap-table tbody tr");
    await expect(rows).toHaveCount(8);
    await expect(rows.nth(0)).toContainText(
      format(T.flagsSigned, { x: "R1", y: "R2", minus: 1, over: 1 }),
    );
    await expect(rows.nth(2)).toContainText(
      format(T.flagsSigned, { x: "R2", y: "R1", minus: 1, over: 0 }),
    );
  });

  test("the programs run on the reference, once the count is predicted, and show their counts", async ({
    page,
  }) => {
    await openLesson(page, "immediates");
    const figure = page.locator("#ix-wide");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator(".program-counts")).toHaveCount(0);
    await expect(figure.getByRole("button", { name: T.runBoth })).toHaveCount(0);
    // The sums run 5 instructions: the second option.
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await figure.getByRole("button", { name: T.runBoth }).click();
    await expect(figure.locator(".program-counts").first()).toContainText(
      format(T.romBytes, { n: 20 }),
    );
    await expect(figure.locator(".program-counts").nth(1)).toContainText(
      format(T.registerAfter, { n: 1, value: "5000" }),
    );
  });

  test("data after a program runs as one more instruction; an old program runs the same on the copy", async ({
    page,
  }) => {
    await openLesson(page, "room-to-grow");
    const figure = page.locator("#ix-predict-data");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button", { name: T.runBoth })).toHaveCount(0);
    // It halts at 00C: the second option.
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await figure.getByRole("button", { name: T.runBoth }).click();
    await expect(figure.locator(".program-counts")).toContainText(
      format(T.stoppedCause, { address: "00C", cause: "21" }),
    );
    await expect(figure.locator(".program-counts")).toContainText(format(T.ranNoStop, { n: 3 }));
    await expect(figure.locator(".program-counts")).not.toContainText(
      format(T.romBytes, { n: 16 }),
    );
    const old = page.locator("#ix-old-program");
    await old.scrollIntoViewIfNeeded();
    await expect(old.locator("table.program-listing")).toHaveCount(1);
    await old.getByRole("button", { name: T.runBoth }).click();
    for (const k of [0, 1])
      await expect(old.locator(".program-counts").nth(k)).toContainText(
        format(T.displayAfter, { value: "-250" }),
      );
  });

  test("set if's edges are predicted, then read off the decoder and controller", async ({
    page,
  }) => {
    await openLesson(page, "design-an-instruction");
    const figure = page.locator("#ix-predict-edges");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("table.kind-edges-table")).toBeHidden();
    await figure.getByRole("radio").nth(1).check();
    await figure.getByRole("button", { name: V.prediction.commit }).click();
    await expect(figure.locator("[role=status]").first()).toContainText(V.prediction.match);
    await expect(figure.locator("table.kind-edges-table tbody tr").first()).toContainText("4");
  });

  test("the constant map widens every constant; 800 to FFF reach no part", async ({ page }) => {
    await openLesson(page, "immediates");
    const figure = page.locator("#ix-constant-map");
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("[data-part]")).toHaveCount(5);
    const negative = figure.locator("[data-part=negative]");
    await expect(negative).toContainText(
      format(T.constantsWiden, { first: "FFFFFFFFFFFFF800", last: "FFFFFFFFFFFFFFFF" }),
    );
    await expect(negative).toContainText(format(T.constantsStop, { cause: "31" }));
    await expect(figure.locator("[data-part=rom]")).not.toContainText(
      format(T.constantsStop, { cause: "31" }),
    );
  });

  test("the places drawing marks four blocks and offers nothing to press", async ({ page }) => {
    await openLesson(page, "room-to-grow");
    const figure = page.locator("#ix-join-places");
    const props = lessonData("room-to-grow")
      .sections.flatMap((s) => s.interactives)
      .find((x) => x.id === "join-places")?.props as { highlightLabel: string };
    const mark = props.highlightLabel;
    await figure.scrollIntoViewIfNeeded();
    await expect(figure.locator("svg title", { hasText: mark })).toHaveCount(4);
    await expect(figure.getByRole("button", { name: / = [01]\./ })).toHaveCount(0);
    await expect(figure.getByRole("button", { name: V.explorer.reset })).toHaveCount(0);
    await expect(figure.locator("table.signal-table")).toHaveCount(0);
  });

  test("one MET picks the branch's next PC and, with SET, register Y's word", async ({ page }) => {
    await openLesson(page, "design-an-instruction");
    const figure = page.locator("#ix-condition-uses");
    await figure.scrollIntoViewIfNeeded();
    const row = (name: string) =>
      figure.locator("table.signal-table tr", { has: page.locator(`th:text-is("${name}")`) });
    // Job 0 is met always: a branch takes TARGET, and set if writes 1.
    await expect(row("NEXT")).toContainText("0000000000000010");
    await figure.getByRole("button", { name: /^BRANCH = 0\./ }).click();
    await expect(row("NEXT")).toContainText("0000000000000040");
    await expect(row("YIN")).toContainText("0000000000000042");
    await figure.getByRole("button", { name: /^SET = 0\./ }).click();
    await expect(row("YIN")).toContainText("0000000000000001");
  });
});
