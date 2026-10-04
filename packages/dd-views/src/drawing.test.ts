import { describe, expect, it } from "vitest";

import { elaborate } from "@dd/hdl";
import { Simulator, bit0, bit1, runSuite } from "@dd/sim";

import {
  circuitToDrawing,
  compileDrawing,
  drawingWarnings,
  emptyDrawing,
  pinId,
  undrivenOutputs,
  type Drawing,
} from "./drawing";

const SR = { inputs: [{ name: "S" }, { name: "R" }], outputs: [{ name: "Q" }] };

/** Two NOR gates cross-coupled, drawn by hand. */
function srDrawing(): Drawing {
  const base = emptyDrawing(SR);
  return {
    parts: [
      ...base.parts,
      { id: "nor1", kind: "nor", x: 6, y: 1 },
      { id: "nor2", kind: "nor", x: 6, y: 5 },
    ],
    wires: [
      { from: { part: pinId("input", "R"), port: "y" }, to: { part: "nor1", port: "a" } },
      { from: { part: "nor2", port: "y" }, to: { part: "nor1", port: "b" } },
      { from: { part: pinId("input", "S"), port: "y" }, to: { part: "nor2", port: "b" } },
      { from: { part: "nor1", port: "y" }, to: { part: "nor2", port: "a" } },
      { from: { part: "nor1", port: "y" }, to: { part: pinId("output", "Q"), port: "a" } },
    ],
  };
}

const SR_TESTS = {
  kind: "sequence" as const,
  steps: [
    { label: "press S", set: { S: 1, R: 0 }, expect: { Q: 1 } },
    { label: "release", set: { S: 0, R: 0 }, expect: { Q: 1 } },
    { label: "press R", set: { S: 0, R: 1 }, expect: { Q: 0 } },
    { label: "release again", set: { S: 0, R: 0 }, expect: { Q: 0 } },
  ],
};

describe("compiling a drawing", () => {
  it("names an output nothing drives, and warns about an unconnected input", () => {
    const empty = compileDrawing(emptyDrawing(SR));
    expect(empty.errors).toEqual([]);
    expect(empty.warnings).toEqual(["output Q is not driven by anything"]);
    expect(undrivenOutputs(empty.circuit!)).toEqual(["Q"]);
    const half: Drawing = {
      parts: [...emptyDrawing(SR).parts, { id: "nor1", kind: "nor", x: 6, y: 1 }],
      wires: [{ from: { part: "nor1", port: "y" }, to: { part: pinId("output", "Q"), port: "a" } }],
    };
    expect(drawingWarnings(half)).toEqual([
      "nor1 input a is not connected",
      "nor1 input b is not connected",
    ]);
    const compiled = compileDrawing(half);
    expect(compiled.circuit).toBeDefined();
    const sim = new Simulator(compiled.circuit!);
    sim.settle();
    expect(sim.read("Q").known).toBe(0n);
  });

  it("makes a working SR latch from two drawn NOR gates", () => {
    const compiled = compileDrawing(srDrawing(), "mine");
    expect(compiled.errors).toEqual([]);
    expect(compiled.warnings).toEqual([]);
    const diagnosis = runSuite(compiled.circuit!, SR_TESTS);
    expect(diagnosis.passed).toBe(true);
  });

  it("keeps positions through the netlist and back", () => {
    const drawing = srDrawing();
    const circuit = compileDrawing(drawing).circuit!;
    const back = circuitToDrawing(circuit);
    const byId = (d: Drawing) => new Map(d.parts.map((p) => [p.id, p]));
    const a = byId(drawing);
    const b = byId(back);
    expect([...b.keys()].sort()).toEqual([...a.keys()].sort());
    for (const [id, part] of a)
      expect(b.get(id)).toMatchObject({ kind: part.kind, x: part.x, y: part.y });
    const key = (d: Drawing) =>
      d.wires.map((w) => `${w.from.part}.${w.from.port}>${w.to.part}.${w.to.port}`).sort();
    expect(key(back)).toEqual(key(drawing));
  });

  it("turns an elaborated text into a drawing that compiles to the same behaviour", () => {
    const text = `module latch(input logic S, input logic R, output logic Q);
  logic Qb;
  assign Q = ~(R | Qb);
  assign Qb = ~(S | Q);
endmodule`;
    const { circuit } = elaborate(text);
    const drawing = circuitToDrawing(circuit!);
    // The elaborator writes ~(a | b) as an OR and a NOT; the drawing shows what the text said.
    expect(drawing.parts.filter((p) => p.kind === "or")).toHaveLength(2);
    expect(drawing.parts.filter((p) => p.kind === "not")).toHaveLength(2);
    // Laid out: inputs in column 0, outputs to the right of every gate.
    const xs = new Map(drawing.parts.map((p) => [p.id, p.x]));
    expect(xs.get(pinId("input", "S"))).toBe(0);
    const gates = drawing.parts.filter((p) => p.kind === "or" || p.kind === "not");
    expect(xs.get(pinId("output", "Q"))!).toBeGreaterThan(Math.max(...gates.map((p) => p.x)));
    const compiled = compileDrawing(drawing);
    expect(compiled.errors).toEqual([]);
    expect(runSuite(compiled.circuit!, SR_TESTS).passed).toBe(true);
  });

  it("places library composites and wires them through their ports", () => {
    const iface = { inputs: [{ name: "D" }, { name: "CLK" }], outputs: [{ name: "Q" }] };
    const base = emptyDrawing(iface);
    const drawing: Drawing = {
      parts: [
        ...base.parts,
        { id: "inv", kind: "not", x: 4, y: 4 },
        { id: "master", kind: "d-latch", x: 8, y: 1 },
        { id: "slave", kind: "d-latch", x: 13, y: 1 },
      ],
      wires: [
        { from: { part: pinId("input", "CLK"), port: "y" }, to: { part: "inv", port: "a" } },
        { from: { part: pinId("input", "D"), port: "y" }, to: { part: "master", port: "D" } },
        { from: { part: "inv", port: "y" }, to: { part: "master", port: "EN" } },
        { from: { part: "master", port: "Q" }, to: { part: "slave", port: "D" } },
        { from: { part: pinId("input", "CLK"), port: "y" }, to: { part: "slave", port: "EN" } },
        { from: { part: "slave", port: "Q" }, to: { part: pinId("output", "Q"), port: "a" } },
      ],
    };
    const compiled = compileDrawing(drawing, "my-dff");
    expect(compiled.errors).toEqual([]);
    const circuit = compiled.circuit!;
    expect(
      circuit.composites
        .filter((c) => !c.path.includes("/"))
        .map((c) => c.path)
        .sort(),
    ).toEqual(["master", "slave"]);
    const sim = new Simulator(circuit);
    sim.setInput("CLK", bit0);
    sim.setInput("D", bit1);
    sim.clockCycle("CLK");
    expect(sim.read("Q")).toEqual(bit1);
    sim.setInput("D", bit0);
    sim.settle();
    expect(sim.read("Q")).toEqual(bit1); // only the edge moves Q
    sim.clockCycle("CLK");
    expect(sim.read("Q")).toEqual(bit0);
    // And back to a drawing with the composites as parts in their places.
    const back = circuitToDrawing(circuit);
    expect(back.parts.find((p) => p.id === "slave")).toMatchObject({
      kind: "d-latch",
      x: 13,
      y: 1,
    });
    expect(back.wires).toHaveLength(6);
  });
});
