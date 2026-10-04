import { describe, expect, it } from "vitest";

import {
  CircuitBuilder,
  componentsUnder,
  driverOf,
  hierarchy,
  readersOf,
  validate,
} from "./circuit";

describe("the circuit builder", () => {
  it("builds a netlist with named nets, auto-named gates and paths", () => {
    const b = new CircuitBuilder("half-adder");
    const a = b.input("a");
    const c = b.input("b");
    const sum = b.xor([a, c], { name: "sum" });
    const carry = b.and([a, c]);
    b.output("sum", sum);
    b.output("carry", carry);
    const circuit = b.build();
    expect(circuit.nets.map((n) => n.name)).toEqual(["a", "b", "sum.y", "and1.y"]);
    expect(circuit.components.map((c) => c.path)).toEqual(["sum", "and1"]);
    expect(circuit.inputs.map((i) => i.name)).toEqual(["a", "b"]);
    expect(driverOf(circuit, carry)?.kind).toBe("and");
    expect(readersOf(circuit, a).map((c) => c.kind)).toEqual(["xor", "and"]);
  });

  it("nests paths inside scopes and records the composite", () => {
    const b = new CircuitBuilder("two-latches");
    const d = b.input("d");
    const en = b.input("en");
    const q = b.scope(
      "latch",
      "d-latch",
      (bb) => {
        const nd = bb.not(d);
        const s = bb.and([d, en]);
        const r = bb.and([nd, en]);
        const qOut = bb.net("q");
        const qb = bb.nor([r, qOut]);
        bb.nor([s, qb], { output: qOut });
        return qOut;
      },
      { inputs: { d, en }, outputs: {} },
    );
    b.output("q", q);
    const circuit = b.build();
    expect(circuit.components.every((c) => c.path.startsWith("latch/"))).toBe(true);
    expect(circuit.composites.map((c) => c.path)).toEqual(["latch"]);
    const tree = hierarchy(circuit);
    expect(tree.children.map((c) => c.path)).toEqual(["latch"]);
    expect(tree.children[0]?.children.map((c) => c.name)).toEqual([
      "not1",
      "and1",
      "and2",
      "nor1",
      "nor2",
    ]);
    expect(componentsUnder(circuit, "latch")).toHaveLength(5);
  });

  it("makes repeated names unique", () => {
    const b = new CircuitBuilder("names");
    const x = b.input("x");
    b.scope("inv", "inverter", (bb) => bb.not(x));
    b.scope("inv", "inverter", (bb) => bb.not(x));
    const circuit = b.build();
    expect(circuit.composites.map((c) => c.path)).toEqual(["inv", "inv2"]);
  });

  it("refuses a net with two drivers and a read of nothing", () => {
    const b = new CircuitBuilder("bad");
    const a = b.input("a");
    const y = b.not(a);
    b.not(a, { output: y });
    expect(() => b.build()).toThrow(/two drivers/);

    const c = new CircuitBuilder("undriven");
    const floating = c.net("floating");
    c.output("y", c.not(floating));
    const problems = validate({
      name: "undriven",
      nets: [
        { id: 0, name: "floating", width: 1 },
        { id: 1, name: "not1.y", width: 1 },
      ],
      components: [
        { id: 0, kind: "not", name: "not1", path: "not1", inputs: { a: 0 }, outputs: { y: 1 } },
      ],
      inputs: [],
      outputs: [{ name: "y", net: 1 }],
      composites: [],
    });
    expect(problems).toEqual(["net floating is read but nothing drives it"]);
  });

  it("refuses gates whose inputs differ in width", () => {
    const b = new CircuitBuilder("widths");
    const a = b.input("a", 4);
    const c = b.input("b", 2);
    expect(() => b.and([a, c])).toThrow(/width/);
  });
});
