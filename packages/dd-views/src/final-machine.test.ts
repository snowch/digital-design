// Copyright © 2026 Christopher Snow

// Module 13: the final machine's drawing, at every level a learner can open, held to the rules
// every figure's drawing is held to (lessons.test.tsx): no wire through a part it does not join,
// no two signals along one line, and, at the top level, room between the wires.

import { describe, expect, it } from "vitest";

import { libraryCircuit } from "@dd/dd-model";

import { drawingAt, isSealed, sceneOf, sceneProblems, straighten } from "./index";

describe("the final machine's drawing", () => {
  it("draws every block a learner can open with no wire problem", () => {
    const circuit = libraryCircuit("machine-final");
    const sealed = circuit.composites.filter((c) => isSealed(c.kind)).map((c) => c.path);
    const kinds = new Set<string>();
    const scopes = circuit.composites.filter((c) => {
      if (sealed.some((s) => c.path === s || c.path.startsWith(`${s}/`))) return false;
      if (kinds.has(c.kind)) return false;
      kinds.add(c.kind);
      return true;
    });
    const found: string[] = [];
    for (const scope of ["", ...scopes.map((c) => c.path)]) {
      const scene = sceneOf(straighten(drawingAt(circuit, scope).drawing));
      found.push(
        ...sceneProblems(scene, { roomy: scope === "" }).map((p) => `${scope || "top"}: ${p}`),
      );
    }
    expect(found).toEqual([]);
  }, 60_000);
});
