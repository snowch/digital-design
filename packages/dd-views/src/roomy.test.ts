// Copyright © 2026 Chris Snow

// Wires kept apart: how the router turns a fan of wires, and what sceneProblems says of two wires
// too close together or crossing where a better order of turns would not.

import { describe, expect, it } from "vitest";

import { libraryCircuit } from "@dd/dd-model";

import { drawingAt, sceneOf, sceneProblems, straighten, type Scene, type WirePath } from "./index";

/** Where a wire first turns up or down: the x of its first `V` step. */
function turnOf(w: WirePath | undefined): number {
  const m = /H (-?[\d.]+) V/.exec(w?.d ?? "");
  return m ? Number(m[1]) : NaN;
}

describe("a fan of wires", () => {
  const scene = sceneOf(straighten(drawingAt(libraryCircuit("demux-block"), "").drawing));
  const toPin = (port: string) =>
    scene.wires.find((w) => w.from.port === port && w.to.part.startsWith("output:"));
  const fromPin = (name: string) => scene.wires.find((w) => w.from.part === `input:${name}`);

  it("turns the wire with furthest to go first, a cell apart, so none crosses another", () => {
    const [y1, y2, y3] = ["Y1", "Y2", "Y3"].map((p) => turnOf(toPin(p)));
    expect(y3! + 20).toBeLessThanOrEqual(y2!);
    expect(y2! + 20).toBeLessThanOrEqual(y1!);
    expect(sceneProblems(scene)).toEqual([]);
  });

  it("turns a cell past the port it leaves, clear of the value written there", () => {
    for (const name of ["S1", "S0"]) {
      const w = fromPin(name);
      expect(turnOf(w) - (w?.start.x ?? 0)).toBeGreaterThanOrEqual(20);
    }
  });
});

describe("what makes two wires hard to tell apart", () => {
  const wire = (part: string, start: [number, number], end: [number, number], d: string) =>
    ({
      from: { part, port: "y" },
      to: { part: `${part}-end`, port: "a" },
      start: { x: start[0], y: start[1] },
      end: { x: end[0], y: end[1] },
      d,
      junctions: [],
    }) satisfies WirePath;
  const sceneWith = (...wires: WirePath[]): Scene => ({
    boxes: [],
    wires,
    width: 200,
    height: 200,
  });

  it("names two signals side by side closer than half a cell, unless asked only for the rest", () => {
    const scene = sceneWith(
      wire("a", [0, 0], [100, 100], "M 0 0 H 50 V 100 H 100"),
      wire("b", [0, 10], [100, 120], "M 0 10 H 56 V 120 H 100"),
    );
    expect(sceneProblems(scene)).toContain("a.y and b.y run closer than half a cell");
    expect(sceneProblems(scene, { roomy: false })).toEqual([]);
  });

  it("names two wires that cross though they leave and arrive in the same order", () => {
    // a starts above b and ends above it, but turns first, so b's way out runs through a's turn.
    const crossing = sceneWith(
      wire("a", [0, 0], [100, 50], "M 0 0 H 40 V 50 H 100"),
      wire("b", [0, 20], [100, 80], "M 0 20 H 60 V 80 H 100"),
    );
    expect(sceneProblems(crossing)).toContain("a.y and b.y cross though they keep their order");
    // The other order of turns: no crossing, and nothing to say.
    const apart = sceneWith(
      wire("a", [0, 0], [100, 50], "M 0 0 H 60 V 50 H 100"),
      wire("b", [0, 20], [100, 80], "M 0 20 H 40 V 80 H 100"),
    );
    expect(sceneProblems(apart)).toEqual([]);
  });
});
