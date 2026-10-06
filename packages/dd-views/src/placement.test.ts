// Copyright © 2026 Christopher Snow

// The lesson's central drawings are placed by hand so that the wires read as the prose says. These
// tests hold the placements to that: no wire runs through a part it does not connect to, no two
// different signals share a stretch of wire, and a fault leaves every gate where it was.

import { describe, expect, it } from "vitest";

import { LIBRARY, applyFaults, brokenWire, libraryCircuit, stuckAt, wrongGate } from "@dd/dd-model";

import { nameRepeatsKind } from "./parts";
import { drawingAt, partBox, sceneOf, type PartBox, type WirePath } from "./scene";
import { netOfWire } from "./scene";
import { straighten } from "./straighten";
import { isShaped } from "./symbols";

interface Segment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** The straight pieces of an orthogonal path written as `M x y H x V y ...`. */
function segments(d: string): Segment[] {
  const tokens = d.trim().split(/\s+/);
  const out: Segment[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "M") {
      x = Number(tokens[++i]);
      y = Number(tokens[++i]);
    } else if (t === "H") {
      const nx = Number(tokens[++i]);
      out.push({ x1: x, y1: y, x2: nx, y2: y });
      x = nx;
    } else if (t === "V") {
      const ny = Number(tokens[++i]);
      out.push({ x1: x, y1: y, x2: x, y2: ny });
      y = ny;
    }
  }
  return out;
}

/** Whether a segment passes through the inside of a box (its edge, where ports sit, is allowed). */
function crosses(s: Segment, b: PartBox): boolean {
  const left = Math.min(s.x1, s.x2);
  const right = Math.max(s.x1, s.x2);
  const top = Math.min(s.y1, s.y2);
  const bottom = Math.max(s.y1, s.y2);
  return right > b.x + 1 && left < b.x + b.w - 1 && bottom > b.y + 1 && top < b.y + b.h - 1;
}

/** Whether two segments lie along the same line for more than a pixel. */
function overlap(a: Segment, b: Segment): boolean {
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1) {
    const lo = Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2));
    const hi = Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2));
    return hi - lo > 1;
  }
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1) {
    const lo = Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2));
    const hi = Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2));
    return hi - lo > 1;
  }
  return false;
}

function problems(
  circuitId: string,
  scope: string,
  faults = [] as Parameters<typeof applyFaults>[1],
) {
  // As a figure shows it: straightened.
  const at = drawingAt(applyFaults(libraryCircuit(circuitId), faults), scope);
  const { circuit } = at;
  const drawing = straighten(at.drawing);
  const scene = sceneOf(drawing);
  const found: string[] = [];
  const net = (w: WirePath) => netOfWire(circuit, w.from);
  for (const w of scene.wires) {
    for (const s of segments(w.d)) {
      for (const b of scene.boxes) {
        if (b.part.id === w.from.part || b.part.id === w.to.part) continue;
        if (crosses(s, b)) found.push(`${w.from.part} to ${w.to.part} runs through ${b.part.id}`);
      }
    }
  }
  scene.wires.forEach((a, i) =>
    scene.wires.slice(i + 1).forEach((b) => {
      if (net(a) === net(b)) return;
      const shared = segments(a.d).some((s) => segments(b.d).some((t) => overlap(s, t)));
      if (shared) found.push(`${a.from.part} and ${b.from.part} share a track`);
    }),
  );
  return { found, drawing };
}

describe("the drawing's geometry", () => {
  it("puts every port of every library drawing on one 10-pixel lattice, so any two line up", () => {
    const off = Object.keys(LIBRARY).flatMap((id) =>
      sceneOf(drawingAt(libraryCircuit(id), "").drawing).boxes.flatMap((b) =>
        [...b.inputs, ...b.outputs]
          .filter((p) => (((p.at.y - b.y) % 10) + 10) % 10 !== 2)
          .map((p) => `${id}: ${b.part.id}.${p.port} at ${p.at.y - b.y}`),
      ),
    );
    expect(off).toEqual([]);
  });

  it("draws a gate tall enough that its body spans every input", () => {
    for (const fanIn of [1, 2, 3, 4, 5]) {
      const box = partBox({ id: "g", kind: fanIn === 1 ? "not" : "and", x: 0, y: 0, fanIn });
      expect(isShaped(box.part.kind)).toBe(true);
      for (const p of box.inputs) {
        expect(p.at.y).toBeGreaterThanOrEqual(box.y + 4);
        expect(p.at.y).toBeLessThanOrEqual(box.y + box.h - 4);
      }
      // The output lead is drawn at half the height, where the output pin is.
      expect(box.outputs[0]?.at.y).toBe(box.y + box.h / 2);
    }
  });
});

describe("the hand-placed drawings", () => {
  it("draws the two-button circuit with each button's wire to its own gate", () => {
    expect(problems("two-buttons", "").found).toEqual([]);
  });

  it("keeps the two-button circuit's gates in place under every fault", () => {
    const healthy = problems("two-buttons", "").drawing;
    const at = (d: typeof healthy, id: string) => d.parts.find((p) => p.id === id);
    for (const fault of [brokenWire("DARK"), wrongGate("norLight", "or"), stuckAt("A", 1)]) {
      const { found, drawing } = problems("two-buttons", "", [fault]);
      expect(found).toEqual([]);
      for (const gate of ["norLight", "norDark"]) {
        expect(at(drawing, gate)).toMatchObject({
          x: at(healthy, gate)?.x,
          y: at(healthy, gate)?.y,
        });
      }
    }
  });

  it("draws a cut wire as a part where the cut acts", () => {
    const { drawing } = problems("two-buttons", "", [brokenWire("DARK")]);
    expect(drawing.parts.some((p) => p.kind === "open")).toBe(true);
  });

  it("draws the inside of the flip-flop with no wire through the master or the inverter", () => {
    expect(problems("dff", "dff").found).toEqual([]);
    expect(problems("four-flip-flops", "ff3").found).toEqual([]);
  });

  it("lists the four flip-flops' pins from bit 3 down, the order a word is written", () => {
    const c = libraryCircuit("four-flip-flops");
    expect(c.inputs.map((i) => i.name)).toEqual(["D3", "D2", "D1", "D0", "CLK"]);
    expect(c.outputs.map((o) => o.name)).toEqual(["Q3", "Q2", "Q1", "Q0"]);
  });

  it("draws a register block with its label alone, not the library's short name for it", () => {
    expect(nameRepeatsKind("reg", "register")).toBe(true);
    expect(nameRepeatsKind("ff0", "dff")).toBe(false);
  });
});
