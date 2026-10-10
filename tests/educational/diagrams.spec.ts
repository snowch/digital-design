// Copyright © 2026 Christopher Snow

// The diagrams, checked as drawings: no label in any timing diagram or circuit drawing on the
// page overlaps another or leaves its drawing, at desktop and phone widths, before and after the
// figures have been used. A diagram whose text collides fails a learner however right its data.

import { expect, test, type Page } from "@playwright/test";

import { libraryCircuit } from "@dd/dd-model";
import { circuitToDrawing, labelFor } from "@dd/dd-views";

import { LESSONS, V, challenge, format, openLesson } from "./helpers";

interface Collision {
  readonly figure: string;
  readonly problem: string;
}

/** Every pair of overlapping text labels and every label outside its drawing, by figure. */
async function textCollisions(page: Page): Promise<Collision[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
    const svgs = document.querySelectorAll<SVGSVGElement>(
      "svg.timing-diagram, svg.timing-lanes, svg.circuit:not(.circuit-overview), svg.signal-plot, svg.signal-path, svg.scene, svg.column-sum, svg.state-diagram, svg.stack-depth",
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
 * connection that is not there; a wire through a part's label or name, which strikes it out; and
 * a wire that leaves the drawing, which is cut off where it turns outside, so it seems to end.
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
    for (const svg of document.querySelectorAll<SVGSVGElement>(
      "svg.circuit:not(.circuit-overview)",
    )) {
      const figure = svg.closest("figure")?.id ?? svg.closest("section")?.id ?? "drawing";
      const toSvg = svg.getScreenCTM()?.inverse();
      if (!toSvg) continue;
      const wires = [...svg.querySelectorAll("g.wires > g.wire")].map((g) => {
        const path = g.querySelector("path:not(.wire-hit):not(.wire-halo):not(.wire-route)");
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
      const box = svg.viewBox.baseVal;
      for (const w of wires)
        if (w.pts.some((p) => p.x < 0 || p.y < 0 || p.x > box.width || p.y > box.height))
          out.push({ figure, problem: `${w.net} leaves the drawing` });
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

/**
 * What makes wires hard to tell apart, as first drawn: two signals side by side closer than half
 * a cell (10 pixels), which read as one thick line; two wires that leave one column and enter
 * another in the same order yet cross, which a better order of turns would not; and a wire that
 * touches or runs within 3 pixels of a value written on the drawing. Measured on the rendered page,
 * in the drawing's own units.
 */
async function crowding(page: Page): Promise<WireFault[]> {
  return page.evaluate(() => {
    const out: { figure: string; problem: string }[] = [];
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
    type Pt = { x: number; y: number };
    type Seg = { a: Pt; b: Pt };
    const overlap = (p: number, q: number, r: number, t: number) =>
      Math.min(Math.max(p, q), Math.max(r, t)) - Math.max(Math.min(p, q), Math.min(r, t));
    const through = (h: Seg, v: Seg) =>
      h.a.y === h.b.y &&
      v.a.x === v.b.x &&
      v.a.x > Math.min(h.a.x, h.b.x) &&
      v.a.x < Math.max(h.a.x, h.b.x) &&
      h.a.y > Math.min(v.a.y, v.b.y) &&
      h.a.y < Math.max(v.a.y, v.b.y);
    for (const svg of document.querySelectorAll<SVGSVGElement>(
      "svg.circuit:not(.circuit-overview)",
    )) {
      const figure = svg.closest("figure")?.id ?? svg.closest("section")?.id ?? "drawing";
      const toSvg = svg.getScreenCTM()?.inverse();
      if (!toSvg) continue;
      const wires = [...svg.querySelectorAll("g.wires > g.wire")].map((g) => {
        const path = g.querySelector("path:not(.wire-hit):not(.wire-halo):not(.wire-route)");
        const pts = points(path?.getAttribute("d") ?? "");
        return {
          net: (g as SVGGElement).dataset["net"] ?? "a wire",
          pts,
          segs: pts.slice(1).map((b, k) => ({ a: pts[k]!, b })),
        };
      });
      const reported = new Set<string>();
      const report = (key: string, problem: string) => {
        if (reported.has(key)) return;
        reported.add(key);
        out.push({ figure, problem });
      };
      wires.forEach((w, i) =>
        wires.slice(i + 1).forEach((v) => {
          if (w.net === v.net) return;
          for (const s of w.segs)
            for (const t of v.segs) {
              const sv = s.a.x === s.b.x && s.a.y !== s.b.y;
              const tv = t.a.x === t.b.x && t.a.y !== t.b.y;
              const sh = s.a.y === s.b.y && s.a.x !== s.b.x;
              const th = t.a.y === t.b.y && t.a.x !== t.b.x;
              let gap = 0;
              let along = 0;
              if (sv && tv) {
                gap = Math.abs(s.a.x - t.a.x);
                along = overlap(s.a.y, s.b.y, t.a.y, t.b.y);
              } else if (sh && th) {
                gap = Math.abs(s.a.y - t.a.y);
                along = overlap(s.a.x, s.b.x, t.a.x, t.b.x);
              } else continue;
              if (gap > 1 && gap < 10 && along > 2)
                report(
                  `${w.net}|${v.net}|near`,
                  `${w.net} and ${v.net} run ${gap} px apart, closer than half a cell`,
                );
            }
          const [w0, w1] = [w.pts[0], w.pts[w.pts.length - 1]];
          const [v0, v1] = [v.pts[0], v.pts[v.pts.length - 1]];
          if (!w0 || !w1 || !v0 || !v1) return;
          const sameOrder = w0.x === v0.x && w1.x === v1.x && (w0.y - v0.y) * (w1.y - v1.y) > 0;
          if (sameOrder && w.segs.some((s) => v.segs.some((t) => through(s, t) || through(t, s))))
            report(
              `${w.net}|${v.net}|cross`,
              `${w.net} and ${v.net} cross though they keep their order`,
            );
        }),
      );
      const values = [...svg.querySelectorAll<SVGTextElement>("text.value-label")].map((t) => {
        const r = t.getBoundingClientRect();
        const a = new DOMPoint(r.left, r.top).matrixTransform(toSvg);
        const b = new DOMPoint(r.right, r.bottom).matrixTransform(toSvg);
        return { text: t.textContent ?? "", x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      });
      for (const w of wires)
        for (const s of w.segs) {
          if (s.a.x !== s.b.x || s.a.y === s.b.y) continue;
          for (const l of values)
            if (
              s.a.x > l.x1 - 3 &&
              s.a.x < l.x2 + 3 &&
              Math.max(s.a.y, s.b.y) > l.y1 + 1 &&
              Math.min(s.a.y, s.b.y) < l.y2 - 1
            )
              report(
                `${w.net}|${l.text}|${l.x1}`,
                `${w.net} touches the value "${l.text}" written beside it`,
              );
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

  test("Module 7: no label overlaps another or leaves its drawing, before and after use", async ({
    page,
  }) => {
    for (const lesson of ["alu-jobs", "flags", "wide-alu", "alu-tests"]) {
      await openLesson(page, lesson);
      expect(await textCollisions(page), lesson).toEqual([]);
      for (const figure of await page
        .locator("figure.interactive")
        .filter({ has: page.getByRole("button", { name: V.prediction.commit }) })
        .all()) {
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

  // Module 13's datapath holds most of the final machine's blocks, each drawn only once a learner
  // opens it, so each is opened in turn and held to the rules every drawing is held to.
  test("Module 13: every block inside the datapath is clear when opened", async ({ page }) => {
    test.setTimeout(300_000);
    await openLesson(page, "capstone");
    const figure = page.locator("#ix-cap-carry");
    await figure.scrollIntoViewIfNeeded();
    const open = figure.getByRole("button", { name: new RegExp(`${V.circuit.open}$`) });
    const crumbs = figure.getByRole("navigation", { name: V.circuit.where }).getByRole("button");
    // The figure opens on the whole machine; opening the datapath is the lead's first step.
    await figure.getByRole("button", { name: /^datapath datapath\. / }).click();
    expect(await textCollisions(page), "datapath").toEqual([]);
    expect(await wireFaults(page), "datapath").toEqual([]);
    const names = await open.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")!));
    expect(names.length).toBeGreaterThan(5);
    for (const name of names) {
      await figure.getByRole("button", { name, exact: true }).click();
      expect(await textCollisions(page), name).toEqual([]);
      expect(await wireFaults(page), name).toEqual([]);
      // Back to the datapath: the trail's second button, after the whole machine.
      await crumbs.nth(1).click();
    }
  });

  test("the drawing editor: parts tidied before any wire is drawn keep their words apart", async ({
    page,
  }) => {
    // The memory-map lesson's capstone with every part placed and no wire yet, then tidied, as a
    // learner may do: the parts stack in one column, a gate's name above a block's label.
    await openLesson(page, "memory-map");
    const section = challenge(page, "shop-memory");
    await section.scrollIntoViewIfNeeded();
    for (const part of circuitToDrawing(libraryCircuit("shop-parts")).parts) {
      if (part.kind === "input" || part.kind === "output") continue;
      await section
        .getByRole("button", { name: format(V.builder.add, { label: labelFor(part.kind) }) })
        .click();
    }
    await section.getByRole("button", { name: V.builder.tidy }).click();
    expect(await textCollisions(page)).toEqual([]);
  });

  // Module 0's ladder draws the machine at a new level at each press, so each level is checked as
  // it is drawn, and the stuck wire's drawing once the machine has run with it.
  test("Module 0: every level of the ladder, and the stuck wire's drawing, is clear", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await openLesson(page, "inside-the-machine");
    const ladder = page.locator("#ix-ladder");
    await ladder.scrollIntoViewIfNeeded();
    const down = ladder.getByRole("button", { name: V.meet.ladder.down });
    // Each level as the learner opens it, held to what every opened block is held to; the
    // roomy-wire rules hold for the page as first drawn, which the tests below check.
    for (let level = 1; ; level++) {
      expect(await textCollisions(page), `level ${level}`).toEqual([]);
      expect(await wireFaults(page), `level ${level}`).toEqual([]);
      if (await down.isDisabled()) break;
      await down.click();
    }
    const stuck = page.locator("#ix-stuck");
    await stuck.scrollIntoViewIfNeeded();
    // Its prediction first (64, read off the stuck machine), then the stuck wire.
    const props = LESSONS.find((l) => l.id === "inside-the-machine")!
      .sections.flatMap((s) => s.interactives)
      .find((x) => x.id === "stuck")!.props as {
      options: { value: string; label: string }[];
      faults: { label: string }[];
    };
    await stuck
      .getByRole("radio", { name: props.options.find((o) => o.value === "64")!.label, exact: true })
      .check();
    await stuck.getByRole("button", { name: V.prediction.commit }).click();
    await stuck.getByRole("radio", { name: props.faults[0]!.label, exact: true }).check();
    await stuck.getByRole("button", { name: V.meet.run, exact: true }).click();
    await expect(stuck.locator(".datapath-status")).toHaveText(
      format(V.meet.status.stopped, { line: 9 }),
      { timeout: 30_000 },
    );
    expect(await textCollisions(page)).toEqual([]);
    expect(await wireFaults(page)).toEqual([]);
    expect(await crowding(page)).toEqual([]);
  });

  test("every wire meets its gate on the gate's body and runs straight or turns by a cell", async ({
    page,
  }) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await wireFaults(page), lesson.id).toEqual([]);
    }
  });

  test("no two wires run closer than half a cell, cross needlessly, or touch a written value", async ({
    page,
  }) => {
    for (const lesson of LESSONS) {
      await openLesson(page, lesson.id);
      expect(await crowding(page), lesson.id).toEqual([]);
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
