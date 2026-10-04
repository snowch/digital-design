import { dFlipFlopCircuit, glitchCircuit, srLatchCircuit } from "@dd/dd-model";
import { CircuitBuilder, runSuite, type Circuit, type TestSuite } from "@dd/sim";
import { describe, expect, it } from "vitest";

import { elaborate } from "./elaborate";
import { generate } from "./generate";
import { parse } from "./parser";

function back(circuit: Circuit): {
  circuit: Circuit;
  text: string;
  notes: readonly string[];
  warnings: readonly string[];
} {
  const gen = generate(circuit);
  parse(gen.text);
  const r = elaborate(gen.text);
  if (!r.circuit) throw new Error(`${gen.text}\n${r.messages.map((m) => m.text).join("\n")}`);
  return { circuit: r.circuit, text: gen.text, notes: gen.notes, warnings: gen.warnings };
}

function agree(a: Circuit, b: Circuit, suite: TestSuite) {
  const da = runSuite(a, suite);
  const db = runSuite(b, suite);
  expect(da.failures).toEqual([]);
  expect(db.failures).toEqual([]);
}

describe("the round trip", () => {
  it("a hand-built half adder becomes assigns and comes back passing the same vectors", () => {
    const b = new CircuitBuilder("half_adder");
    const x = b.input("a");
    const y = b.input("b");
    b.output("sum", b.xor([x, y], { name: "sum" }));
    b.output("carry", b.and([x, y], { name: "carry" }));
    const original = b.build();
    const { circuit, text, notes } = back(original);
    expect(text).toContain("assign sum = a ^ b;");
    expect(text).toContain("assign carry = a & b;");
    expect(notes).toEqual([
      "gate instance names and positions are not kept; the signals keep their names",
    ]);
    agree(original, circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { a: 0, b: 0 }, expect: { sum: 0, carry: 0 } },
        { inputs: { a: 1, b: 0 }, expect: { sum: 1, carry: 0 } },
        { inputs: { a: 1, b: 1 }, expect: { sum: 0, carry: 1 } },
      ],
    });
  });

  it("the glitch circuit keeps its structure: an inverter and an AND", () => {
    const original = glitchCircuit();
    const { circuit, text } = back(original);
    expect(text).toMatch(/assign notB_y = ~B;/);
    expect(text).toMatch(/assign Y = A & notB_y;/);
    expect(circuit.components.map((c) => c.kind).sort()).toEqual(["and", "not"]);
  });

  it("a drawn flip-flop becomes one always_ff, and the text drills down to the same gates", () => {
    const original = dFlipFlopCircuit({ reset: true, enable: true });
    const { circuit, text, notes } = back(original);
    expect(text).toContain("always_ff @(posedge CLK) begin");
    expect(text).toContain("if (RST) Q <= 1'b0;");
    expect(text).toContain("else if (EN) Q <= D;");
    expect(text).toContain("assign Qb = ~Q;");
    expect(notes.some((n) => n.includes("flattened"))).toBe(false);
    expect(circuit.components.some((c) => c.path.endsWith("/master/sr/norQ"))).toBe(true);
    agree(original, circuit, {
      kind: "sequence",
      steps: [
        { set: { D: 1, CLK: 0, RST: 1, EN: 1 }, clock: "CLK", expect: { Q: 0, Qb: 1 } },
        { set: { RST: 0 }, clock: "CLK", expect: { Q: 1, Qb: 0 } },
        { set: { EN: 0, D: 0 }, clock: "CLK", expect: { Q: 1 } },
        { set: { EN: 1 }, clock: "CLK", expect: { Q: 0 } },
      ],
    });
  });

  it("the cross-coupled latch is the awkward case: assigns that read each other, with the warning", () => {
    const original = srLatchCircuit();
    const gen = generate(original);
    expect(gen.warnings).toHaveLength(1);
    expect(gen.warnings[0]).toMatch(/combinational loop/);
    expect(gen.text).toContain("// synthesis warning:");
    expect(gen.notes.some((n) => n.includes("flattened"))).toBe(true);
    const r = elaborate(gen.text);
    expect(r.messages.map((m) => m.severity)).toEqual(["warning"]);
    agree(original, r.circuit as Circuit, {
      kind: "sequence",
      steps: [
        { set: { S: 1, R: 0 }, expect: { Q: 1, Qb: 0 } },
        { set: { S: 0 }, expect: { Q: 1 } },
        { set: { R: 1 }, expect: { Q: 0, Qb: 1 } },
        { set: { R: 0 }, expect: { Q: 0 } },
      ],
    });
  });

  it("text written by a learner generates back to text that parses", () => {
    const r = elaborate(`
      module m(input logic [1:0] a, input logic s, output logic [1:0] y);
        assign y = s ? {a[0], a[1]} : a;
      endmodule`);
    const gen = generate(r.circuit as Circuit);
    expect(() => parse(gen.text)).not.toThrow();
    const again = elaborate(gen.text);
    expect(again.circuit).toBeDefined();
    agree(r.circuit as Circuit, again.circuit as Circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { a: "10", s: 1 }, expect: { y: "01" } },
        { inputs: { a: "10", s: 0 }, expect: { y: "10" } },
      ],
    });
  });
});
