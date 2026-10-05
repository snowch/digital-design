// Module 3's challenges and figures, driven through the page as the earlier lessons' are: every
// challenge built with its reference through the drawing editor itself (part buttons and ports,
// as a learner draws it; block challenges cannot be imported from text, which has no blocks), a
// plausible wrong attempt rejected with the failing test named, saved work graded again on load,
// a reset that clears the work, and hints one rung at a time. Each runs at desktop and phone widths.

import { expect, test, type Locator } from "@playwright/test";

import { libraryCircuit } from "@dd/dd-model";
import { circuitToDrawing, labelFor, type Drawing } from "@dd/dd-views";
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
} from "./helpers";

const MODULE_3 = ["selectors", "decoders", "adders", "alu"] as const;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The name the editor gives a port in its accessible label: a pin's name, or "part input a". */
function portName(drawing: Drawing, ids: Map<string, string>, ref: { part: string; port: string }) {
  const part = drawing.parts.find((p) => p.id === ref.part)!;
  if (part.kind === "input" || part.kind === "output") return part.name ?? part.id;
  const outputs = drawing.wires.some((w) => w.from.part === ref.part && w.from.port === ref.port);
  return `${ids.get(ref.part)} ${outputs ? V.builder.output : V.builder.input} ${ref.port}`;
}

/**
 * Draws `drawing` in a challenge's editor the way a learner does: one press of a part button per
 * part, then one press on each end of every wire. The editor names a new part by its kind and a
 * number (and1, and2), so the drawing's own names are mapped to the editor's in order.
 */
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

/** The reference solution as the drawing a learner would make. */
function referenceDrawing(lessonId: string, challengeId: string): Drawing {
  const c = challengeData(challengeId, lessonData(lessonId));
  return circuitToDrawing(libraryCircuit(c.reference.libraryId!));
}

for (const lessonId of MODULE_3) {
  const lesson = lessonData(lessonId);
  test.describe(`the ${lessonId} lesson's challenges`, () => {
    for (const c of lesson.challenges) {
      test(`${c.id} is completable with its reference solution, drawn through the page`, async ({
        page,
      }) => {
        test.setTimeout(120_000);
        await openLesson(page, lessonId);
        const section = challenge(page, c.id);
        await section.scrollIntoViewIfNeeded();
        await expect(status(section)).toHaveText(S.challenge.notRun);
        await draw(section, referenceDrawing(lessonId, c.id));
        await runTests(section);
        await expect(status(section)).toHaveText(
          format(S.challenge.passing, { total: testCount(c) }),
        );
        await expect(section.locator(".challenge-complete")).toHaveText(S.challenge.complete);
      });
    }
  });
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

test.describe("Module 3's wrong attempts are rejected with the failing test named", () => {
  test("a 2-way selector with S on both AND gates fails where S is 0 and A is 1", async ({
    page,
  }) => {
    await openLesson(page, "selectors");
    const section = challenge(page, "selector-2");
    const ref = referenceDrawing("selectors", "selector-2");
    await draw(section, rewired(ref, { part: "andA", port: "b" }, { part: "input:S", port: "y" }));
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "S 0, A 1, B 0",
    );
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
  });

  test("a 4-way selector with S1 and S0 swapped fails at S1 0, S0 1", async ({ page }) => {
    test.setTimeout(120_000);
    await openLesson(page, "selectors");
    const section = challenge(page, "selector-4");
    let d = referenceDrawing("selectors", "selector-4");
    d = rewired(d, { part: "selAB", port: "S" }, { part: "input:S1", port: "y" });
    d = rewired(d, { part: "selCD", port: "S" }, { part: "input:S1", port: "y" });
    d = rewired(d, { part: "selOut", port: "S" }, { part: "input:S0", port: "y" });
    await draw(section, d);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "S1 0, S0 1, only B at 1",
    );
    // The part named is the 2-way selector block the learner placed.
    await expect(section.locator(".verdict-failure").first()).toContainText(labelFor("selector-2"));
  });

  test("a ripple adder that gives every full adder CIN fails where a carry must pass", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "adders");
    const section = challenge(page, "ripple-adder");
    let d = referenceDrawing("adders", "ripple-adder");
    for (const fa of ["fa1", "fa2", "fa3"])
      d = rewired(d, { part: fa, port: "CIN" }, { part: "input:CIN", port: "y" });
    await draw(section, d);
    await runTests(section);
    await expect(section.locator(".verdict-failure").first().locator("h4")).toHaveText(
      "A 0001, B 0001, CIN 0",
    );
  });

  test("an ALU slice with the selector's inputs in the wrong order fails, naming the slice", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLesson(page, "alu");
    const section = challenge(page, "alu-slice");
    let d = referenceDrawing("alu", "alu-slice");
    d = rewired(d, { part: "pick", port: "A" }, { part: "xorAB", port: "y" });
    d = rewired(d, { part: "pick", port: "B" }, { part: "andAB", port: "y" });
    await draw(section, d);
    await runTests(section);
    const first = section.locator(".verdict-failure").first();
    await expect(first.locator("h4")).toHaveText("1 slice: A 1 AND B 1");
    await expect(first).toContainText(`${labelFor("slice")} bit0`);
  });
});

test.describe("Module 3's saved work, reset and hints", () => {
  test("saved work is graded again on load; a saved mark alone earns nothing", async ({ page }) => {
    await openLesson(page, "decoders");
    const id = "decoder";
    await draw(challenge(page, id), referenceDrawing("decoders", id));
    await runTests(challenge(page, id));
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();

    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toBeVisible();

    // A stored drawing with its last wire removed, marked as passed long ago.
    await page.evaluate(
      ([key, cid]) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "{}");
        const circuit = stored.challenges[cid].artifact.circuit;
        circuit.outputs = circuit.outputs.map((o: { name: string; net: number }) =>
          o.name === "Y3" ? { ...o, net: circuit.outputs[0].net } : o,
        );
        stored.challenges[cid].firstPassedAt = "2020-01-01T00:00:00.000Z";
        localStorage.setItem(key, JSON.stringify(stored));
      },
      [storageKey("decoders"), id] as const,
    );
    await page.reload();
    await expect(page.locator("section.lesson-section")).toHaveCount(10);
    await expect(challenge(page, id).locator(".challenge-complete")).toHaveCount(0);
  });

  test("a reset clears the work in two steps", async ({ page }) => {
    await openLesson(page, "selectors");
    const id = "selector-2";
    const section = challenge(page, id);
    await draw(section, referenceDrawing("selectors", id));
    await runTests(section);
    await expect(section.locator(".challenge-complete")).toBeVisible();
    await section.getByRole("button", { name: new RegExp(`^${S.challenge.reset}`) }).click();
    await section.getByRole("button", { name: S.challenge.resetConfirm }).click();
    await expect(status(section)).toHaveText(S.challenge.resetDone);
    await expect(section.locator(".challenge-complete")).toHaveCount(0);
    await expect(section.locator(".builder g.part")).toHaveCount(0);
  });

  test("hints come one rung at a time and the ladder is remembered", async ({ page }) => {
    await openLesson(page, "alu");
    const section = challenge(page, "alu-slice");
    await expect(section.locator(".hints-list li")).toHaveCount(0);
    await section.getByRole("button", { name: format(S.hints.show, { n: 1, total: 5 }) }).click();
    await expect(section.locator(".hints-list li")).toHaveCount(1);
    await section.getByRole("button", { name: format(S.hints.show, { n: 2, total: 5 }) }).click();
    await page.reload();
    await expect(challenge(page, "alu-slice").locator(".hints-list li")).toHaveCount(2);
  });
});

test.describe("Module 3's figures", () => {
  test("the predictions answer with what the simulator did", async ({ page }) => {
    const answers: Record<string, Record<string, [string, string]>> = {
      selectors: { "predict-or": ["Y", "1"], "predict-and": ["Y", "0"] },
      decoders: { "predict-lamp": ["Y2", "0"], "predict-doors": ["S", "11"] },
      adders: { "predict-sum": ["SUM", "0"] },
      alu: { "predict-minus": ["NEG", "1101"] },
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

  test("a word input's bits are buttons, and the table reads the words both ways", async ({
    page,
  }) => {
    await openLesson(page, "adders");
    const figure = page.locator("#ix-adder-4");
    await figure.scrollIntoViewIfNeeded();
    const row = (name: string) =>
      figure.locator("table.signal-table tr", { has: page.locator(`th:text-is("${name}")`) });
    // It starts at 0011 + 0010, so the prediction's 1000 is not on show.
    await expect(row("SUM")).toContainText("0101");
    await expect(row("SUM")).toContainText("5");
    const press = (word: string, bit: number) =>
      figure
        .getByRole("group", { name: format(V.words.row, { name: word }) })
        .locator(`[data-bit="${bit}"]`)
        .click();
    // The lead's first sum, 1111 + 0001: press A's bits 3 and 2, and B's bits 1 and 0.
    await press("A", 3);
    await press("A", 2);
    await press("B", 1);
    await press("B", 0);
    await expect(row("A")).toContainText("1111");
    await expect(row("A")).toContainText("-1");
    await expect(row("B")).toContainText("0001");
    await expect(row("SUM")).toContainText("0000");
    await expect(row("COUT")).toContainText("1");
  });

  test("the word selector's block opens to the gates the learner built", async ({ page }) => {
    await openLesson(page, "selectors");
    const figure = page.locator("#ix-word-selector");
    await figure.scrollIntoViewIfNeeded();
    await figure.locator('g.part-composite[data-path="sel2"]').click();
    await expect(figure.locator("g.part-and")).toHaveCount(2);
    await expect(figure.locator("g.part-or")).toHaveCount(1);
  });

  test("the drawing editor refuses a wire between a word and a bit, and says why", async ({
    page,
  }) => {
    await openLesson(page, "decoders");
    const section = challenge(page, "comparator");
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: format(V.builder.add, { label: "XOR" }) }).click();
    await section.getByRole("button", { name: /^A\./ }).click();
    await section.getByRole("button", { name: /^xor1 input a\./ }).click();
    await expect(section.locator(".builder-status")).toContainText("4");
    await expect(section.locator(".builder g.wire")).toHaveCount(0);
  });
});
