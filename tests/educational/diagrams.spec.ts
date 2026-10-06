// The diagrams, checked as drawings: no label in any timing diagram or circuit drawing on the
// page overlaps another or leaves its drawing, at desktop and phone widths, before and after the
// figures have been used. A diagram whose text collides fails a learner however right its data.

import { expect, test, type Page } from "@playwright/test";

import { LESSONS, V, format, openLesson } from "./helpers";

interface Collision {
  readonly figure: string;
  readonly problem: string;
}

/** Every pair of overlapping text labels and every label outside its drawing, by figure. */
async function textCollisions(page: Page): Promise<Collision[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
    const svgs = document.querySelectorAll<SVGSVGElement>(
      "svg.timing-diagram, svg.timing-lanes, svg.circuit, svg.signal-plot, svg.signal-path, svg.scene, svg.column-sum, svg.state-diagram",
    );
    for (const svg of svgs) {
      const figure = svg.closest("figure")?.id ?? svg.className.baseVal;
      const box = svg.getBoundingClientRect();
      const labels = [...svg.querySelectorAll("text")]
        .filter((t) => (t.textContent ?? "").trim() !== "")
        .map((t) => ({ text: (t.textContent ?? "").trim(), r: t.getBoundingClientRect() }));
      for (let i = 0; i < labels.length; i++) {
        const a = labels[i]!;
        if (
          a.r.left < box.left - 1 ||
          a.r.right > box.right + 1 ||
          a.r.top < box.top - 1 ||
          a.r.bottom > box.bottom + 1
        ) {
          out.push({ figure, problem: `"${a.text}" leaves the drawing` });
        }
        for (let j = i + 1; j < labels.length; j++) {
          const b = labels[j]!;
          const overlap =
            a.r.left < b.r.right - 1 &&
            b.r.left < a.r.right - 1 &&
            a.r.top < b.r.bottom - 1 &&
            b.r.top < a.r.bottom - 1;
          if (overlap) out.push({ figure, problem: `"${a.text}" overlaps "${b.text}"` });
        }
      }
    }
    return out;
  });
}

interface WireFault {
  readonly figure: string;
  readonly problem: string;
}

/**
 * Every place a circuit drawing's wires look broken: a wire that meets a gate off the gate's
 * drawn body or off its output lead; a wire that steps up or down by less than a grid cell
 * (20 pixels) where it could run straight; a wire that passes through a part, which looks like a
 * connection that is not there; and a wire through a part's label or name, which strikes it out.
 * Measured on the rendered page, in the drawing's own units, so it checks what a learner sees.
 */
async function wireFaults(page: Page): Promise<WireFault[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
    const SHAPED = /\bpart-(and|nand|or|nor|xor|xnor|not|buf)\b/;
    // A wire's path is M x y, then H x and V y steps; feedback adds a channel under the parts.
    const points = (d: string) => {
      const t = d.trim().split(/\s+/);
      const pts: { x: number; y: number }[] = [];
      let x = 0;
      let y = 0;
      for (let i = 0; i < t.length;) {
        const c = t[i++];
        if (c === "M") {
          x = Number(t[i++]);
          y = Number(t[i++]);
        } else if (c === "H") x = Number(t[i++]);
        else if (c === "V") y = Number(t[i++]);
        pts.push({ x, y });
      }
      return pts;
    };
    for (const svg of document.querySelectorAll<SVGSVGElement>("svg.circuit")) {
      const figure = svg.closest("figure")?.id ?? svg.closest("section")?.id ?? "drawing";
      const toSvg = svg.getScreenCTM()?.inverse();
      if (!toSvg) continue;
      const wires = [...svg.querySelectorAll("g.wires > g.wire")].map((g) => {
        const path = g.querySelector("path:not(.wire-hit):not(.wire-halo)");
        return {
          net: (g as SVGGElement).dataset["net"] ?? "a wire",
          pts: points(path?.getAttribute("d") ?? ""),
        };
      });
      for (const w of wires)
        for (let k = 1; k < w.pts.length; k++) {
          const a = w.pts[k - 1]!;
          const b = w.pts[k]!;
          const step = Math.abs(b.y - a.y);
          if (a.x === b.x && step > 0 && step < 20)
            out.push({ figure, problem: `${w.net} steps ${step} px instead of running straight` });
        }
      // Each part's top-left corner, so a wire's end can be given to the part it reaches: the
      // nearest part at or above it in the same column.
      const parts = [...svg.querySelectorAll<SVGGElement>("g.part, g.pin")].map((g) => {
        const at = toSvg.multiply(g.getScreenCTM()!);
        return { g, x: at.e, y: at.f };
      });
      const owner = (x: number, y: number) =>
        parts
          .filter((p) => Math.abs(p.x - x) < 0.5 && p.y <= y + 1)
          .reduce<(typeof parts)[number] | undefined>(
            (a, p) => (!a || p.y > a.y ? p : a),
            undefined,
          );
      // A part's outline, 3 pixels inside its edge: a wire that crosses it seems to connect there.
      const outlines = parts.map(({ g, x, y }) => {
        const shape =
          g.querySelector<SVGGraphicsElement>("rect.box") ??
          g.querySelector<SVGGraphicsElement>(":scope > rect:not(.mark)") ??
          [...g.querySelectorAll<SVGPathElement>("path")].find(
            (p) => p.getAttribute("fill") !== "none",
          );
        const b = shape?.getBBox();
        const name = g.getAttribute("aria-label") ?? "a part";
        return b
          ? {
              name,
              x1: x + b.x + 3,
              y1: y + b.y + 3,
              x2: x + b.x + b.width - 3,
              y2: y + b.y + b.height - 3,
            }
          : undefined;
      });
      for (const w of wires)
        for (let k = 1; k < w.pts.length; k++) {
          const a = w.pts[k - 1]!;
          const b = w.pts[k]!;
          for (const o of outlines) {
            if (!o) continue;
            const across =
              a.y === b.y
                ? a.y > o.y1 && a.y < o.y2 && Math.max(a.x, b.x) > o.x1 && Math.min(a.x, b.x) < o.x2
                : a.x > o.x1 &&
                  a.x < o.x2 &&
                  Math.max(a.y, b.y) > o.y1 &&
                  Math.min(a.y, b.y) < o.y2;
            if (across) out.push({ figure, problem: `${w.net} passes through ${o.name}` });
          }
        }
      // A part's label or name that a wire runs through is struck out. A value written on its
      // own wire is placed there on purpose, so it is not counted.
      const words = [
        ...svg.querySelectorAll<SVGTextElement>("text.part-label, text.part-name, text.pin-name"),
      ].map((t) => {
        const r = t.getBoundingClientRect();
        const a = new DOMPoint(r.left, r.top).matrixTransform(toSvg);
        const b = new DOMPoint(r.right, r.bottom).matrixTransform(toSvg);
        return { text: t.textContent ?? "", x1: a.x + 1, y1: a.y + 2, x2: b.x - 1, y2: b.y - 2 };
      });
      for (const w of wires)
        for (let k = 1; k < w.pts.length; k++) {
          const a = w.pts[k - 1]!;
          const b = w.pts[k]!;
          for (const o of words) {
            const across =
              a.y === b.y
                ? a.y > o.y1 && a.y < o.y2 && Math.max(a.x, b.x) > o.x1 && Math.min(a.x, b.x) < o.x2
                : a.x > o.x1 &&
                  a.x < o.x2 &&
                  Math.max(a.y, b.y) > o.y1 &&
                  Math.min(a.y, b.y) < o.y2;
            if (across)
              out.push({ figure, problem: `${w.net} runs through the words "${o.text}"` });
          }
        }
      for (const { g, y } of parts) {
        if (!SHAPED.test(g.getAttribute("class") ?? "")) continue;
        const paths = [...g.querySelectorAll<SVGPathElement>("path")];
        const body = paths.find((p) => p.getAttribute("fill") !== "none");
        const lead = paths.find((p) => /H 60$/.test((p.getAttribute("d") ?? "").trim()));
        if (!body || !lead) continue;
        const box = body.getBBox();
        const top = y + box.y;
        const bottom = y + box.y + box.height;
        const leadY = y + Number((lead.getAttribute("d") ?? "").trim().split(/\s+/)[2]);
        const name = g.querySelector(".part-name")?.textContent ?? "a gate";
        for (const w of wires) {
          const start = w.pts[0];
          const end = w.pts[w.pts.length - 1];
          if (!start || !end) continue;
          if (owner(end.x, end.y)?.g === g && (end.y < top + 2 || end.y > bottom - 2))
            out.push({ figure, problem: `${w.net} enters ${name} outside its body` });
          if (owner(start.x - 60, start.y)?.g === g && Math.abs(start.y - leadY) > 0.5)
            out.push({ figure, problem: `${w.net} leaves ${name} off its output lead` });
        }
      }
    }
    return out;
  });
}

test.describe("the diagrams", () => {
  test("no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    await openLesson(page);
    expect(await textCollisions(page)).toEqual([]);

    // Use the figures: commit both predictions so their timing diagrams appear, press the
    // two-button circuit, move the stepper, move D in the setup-and-hold figure, and open a block.
    for (const id of ["ix-predict-two", "ix-predict-three"]) {
      const figure = page.locator(`#${id}`);
      await figure.getByRole("radio").nth(1).check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("svg.timing-diagram")).toBeVisible();
    }
    const buttons = page.locator("#ix-two-buttons");
    await buttons.getByRole("button", { name: /^A = 0\./ }).click();
    const internals = page.locator("#ix-internals");
    await internals.scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i++)
      await internals.getByRole("button", { name: V.internals.next }).click();
    await internals.getByRole("button", { name: /master\. / }).click();
    const setupHold = page.locator("#ix-setup-hold");
    await setupHold.getByRole("slider").fill("-20");
    await setupHold.getByRole("button", { name: V.setupHold.draw }).click();
    expect(await textCollisions(page)).toEqual([]);
  });

  test("the registers lesson: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    await openLesson(page, "registers");
    expect(await textCollisions(page)).toEqual([]);

    // Commit the three predictions, press pins and the clock, open a flip-flop, run the faults.
    for (const id of ["ix-predict-word", "ix-predict-keep", "ix-predict-chain"]) {
      const figure = page.locator(`#${id}`);
      await figure.getByRole("radio").nth(1).check();
      await figure.getByRole("button", { name: V.prediction.commit }).click();
      await expect(figure.locator("svg.timing-diagram")).toBeVisible();
    }
    const four = page.locator("#ix-four-flip-flops");
    await four.getByRole("button", { name: /^D1 = 0\./ }).click();
    await four.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    const bit = page.locator("#ix-keep-clear-bit");
    await bit.getByRole("button", { name: /^RST = 0\./ }).click();
    await bit.getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) }).click();
    const faults = page.locator("#ix-keep-faults");
    await faults.getByRole("radio").nth(3).check();
    await faults.getByRole("button", { name: V.fault.run }).click();
    expect(await textCollisions(page)).toEqual([]);
    await four.getByRole("button", { name: /ff2\. / }).click();
    expect(await textCollisions(page)).toEqual([]);
  });

  test("the signals lesson: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    await openLesson(page, "signals");
    expect(await textCollisions(page)).toEqual([]);

    // Commit the threshold prediction (two plots appear), move every slider to both ends, and
    // switch the investigation figure to the compressor recording.
    const predict = page.locator("#ix-predict-threshold");
    await predict.getByRole("radio").nth(1).check();
    await predict.getByRole("button", { name: V.prediction.commit }).click();
    await expect(predict.locator("svg.signal-plot")).toHaveCount(2);
    const explore = page.locator("#ix-explore-signal");
    await explore.getByRole("radio").nth(1).check();
    for (const id of ["ix-explore-signal", "ix-break-signal"]) {
      for (const slider of await page.locator(`#${id}`).getByRole("slider").all()) {
        for (const end of ["min", "max"] as const) {
          const v = await slider.getAttribute(end);
          await slider.fill(v ?? "0");
          expect(await textCollisions(page), `${id} at ${end}`).toEqual([]);
        }
      }
    }
  });

  // Module 2
  // Module 5: every prediction committed, and every state-machine figure clocked through its
  // states, so the diagrams' marked arrows and the timing diagrams' named values are measured.
  test("Module 5: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    for (const lesson of ["counters", "register-transfer", "state-machines", "state-encoding"]) {
      await openLesson(page, lesson);
      expect(await textCollisions(page), lesson).toEqual([]);
      for (const figure of await page.locator(".prediction").all()) {
        await figure.getByRole("radio").nth(1).check();
        await figure.getByRole("button", { name: V.prediction.commit }).click();
      }
      for (const figure of await page.locator(".state-machine").all()) {
        for (const name of ["GO", "FAIL", "TICK"]) {
          const button = figure.getByRole("button", {
            name: format(V.machine.inputButton, { name, value: 0 }),
            exact: true,
          });
          if ((await button.count()) === 0) continue;
          await button.click();
          await figure
            .getByRole("button", { name: format(V.explorer.clock, { name: "CLK" }) })
            .click();
        }
      }
      expect(await textCollisions(page), `${lesson}, used`).toEqual([]);
    }
  });

  test("Module 2: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    for (const [lesson, predictions] of [
      ["gates", ["ix-predict-alarm"]],
      ["nand", ["ix-predict-tied"]],
      ["fewer-gates", ["ix-predict-warm", "ix-too-short"]],
    ] as const) {
      await openLesson(page, lesson);
      expect(await textCollisions(page), lesson).toEqual([]);
      for (const id of predictions) {
        const figure = page.locator(`#${id}`);
        await figure.getByRole("radio").nth(1).check();
        await figure.getByRole("button", { name: V.prediction.commit }).click();
      }
      for (const faults of await page.locator(".fault-lab").all()) {
        await faults.getByRole("radio").nth(2).check();
        await faults.getByRole("button", { name: V.fault.run }).click();
      }
      for (const pins of await page.locator(".explorer").all())
        await pins
          .getByRole("button", { name: new RegExp(`${V.circuit.toggle}$`) })
          .first()
          .click();
      expect(await textCollisions(page), `${lesson} after use`).toEqual([]);
    }
  });

  test("every wire meets its gate on the gate's body and runs straight or turns by a cell", async ({
    page,
  }) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await wireFaults(page), lesson.id).toEqual([]);
    }
  });

  // A scene or a sum on paper is read whole, so on a phone it must fit its card: its labels are
  // kept short for that, and this holds them to it.
  test("every lesson's diagrams are clear as first drawn, and its scenes fit without scrolling", async ({
    page,
  }) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await textCollisions(page), lesson.id).toEqual([]);
      const scrolling = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>(".scene-wrap, .column-sum-figure")]
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.closest("figure")?.id ?? el.className),
      );
      expect(scrolling, lesson.id).toEqual([]);
    }
  });
});
