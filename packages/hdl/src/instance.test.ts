// Copyright © 2026 Christopher Snow

// Module 8's text: one module used inside another, its ports connected by name, whether the
// module is the text's own or one the course supplies; and the refusals a learner can meet.

import { describe, expect, it } from "vitest";

import { Simulator, word, type Circuit } from "@dd/sim";

import { elaborate, type CourseModule } from "./elaborate";

function build(text: string, modules?: Record<string, CourseModule>): Circuit {
  const r = elaborate(text, modules ? { modules } : {});
  const errors = r.messages.filter((m) => m.severity !== "warning");
  expect(errors.map((m) => m.text)).toEqual([]);
  return r.circuit as Circuit;
}

function run(c: Circuit, inputs: Record<string, bigint>): Record<string, bigint> {
  const sim = new Simulator(c);
  for (const p of c.inputs)
    sim.setInput(p.name, word(c.nets[p.net]?.width ?? 1, inputs[p.name] ?? 0n));
  sim.settle();
  return Object.fromEntries(c.outputs.map((o) => [o.name, sim.read(o.name).value]));
}

const HALF = `module half(input logic A, input logic B, output logic S, output logic C);
  assign S = A ^ B;
  assign C = A & B;
endmodule`;

const FULL = `${HALF}

module full(input logic A, input logic B, input logic CIN, output logic SUM, output logic COUT);
  logic S1;
  logic C1;
  logic C2;
  half h1 (.A(A), .B(B), .S(S1), .C(C1));
  half h2 (.A(S1), .B(CIN), .S(SUM), .C(C2));
  assign COUT = C1 | C2;
endmodule`;

/** A course module for the tests: N bits turned over. */
const INVERT: CourseModule = {
  parameters: { N: 4 },
  ports: (p) => ({ inputs: { A: p["N"] ?? 4 }, outputs: { Y: p["N"] ?? 4 } }),
  build: (b, ins, outs) => {
    b.not(ins["A"] as number, { name: "not", output: outs["Y"] as number });
  },
};

describe("module instances", () => {
  it("a full adder from two half adders of the same text, the top being the module no other uses", () => {
    const c = build(FULL);
    expect(c.name).toBe("full");
    for (let k = 0; k < 8; k++) {
      const [a, b, cin] = [(k >> 2) & 1, (k >> 1) & 1, k & 1].map(BigInt) as [
        bigint,
        bigint,
        bigint,
      ];
      const out = run(c, { A: a, B: b, CIN: cin });
      expect(out["SUM"]).toBe((a + b + cin) & 1n);
      expect(out["COUT"]).toBe((a + b + cin) >> 1n);
    }
    // Each use is a block named after it, of the module's kind, with the module's parts inside.
    expect(c.composites.filter((x) => x.kind === "half").map((x) => x.path)).toEqual(["h1", "h2"]);
    expect(c.components.some((x) => x.path === "h2/" + x.name && x.kind === "xor")).toBe(true);
  });

  it("a module the course supplies, with a parameter given by name", () => {
    const c = build(
      `module top(input logic [7:0] A, output logic [7:0] Y);
  invert #(.N(8)) inv (.A(A), .Y(Y));
endmodule`,
      { invert: INVERT },
    );
    expect(run(c, { A: 0x0fn })["Y"]).toBe(0xf0n);
    expect(c.composites.map((x) => [x.path, x.kind])).toEqual([["inv", "invert"]]);
  });

  it("an output left unconnected, and an input given an expression", () => {
    const c = build(`${HALF}
module top(input logic A, input logic B, output logic Y);
  half h (.A(A & B), .B(1'b1), .S(Y), .C());
endmodule`);
    expect(run(c, { A: 1n, B: 1n })["Y"]).toBe(0n);
    expect(run(c, { A: 1n, B: 0n })["Y"]).toBe(1n);
  });

  it("refuses what it cannot build, with a sentence", () => {
    const error = (text: string, modules?: Record<string, CourseModule>) =>
      elaborate(text, modules ? { modules } : {}).messages.find((m) => m.severity === "error")
        ?.text;
    expect(
      error(`module top(input logic A, output logic Y);
  nothere n (.A(A), .Y(Y));
endmodule`),
    ).toMatch(/no module called nothere/);
    expect(
      error(`${HALF}
module top(input logic A, output logic Y);
  half h (.A(A), .S(Y));
endmodule`),
    ).toMatch(/connect half's input B/);
    expect(
      error(`${HALF}
module top(input logic [1:0] A, output logic Y);
  half h (.A(A), .B(A[0]), .S(Y));
endmodule`),
    ).toMatch(/input A is 1 bit wide; this value is 2/);
    expect(
      error(`${HALF}
module top(input logic A, output logic Y);
  half h (.A(A), .B(A), .Q(Y));
endmodule`),
    ).toMatch(/no port called Q/);
    expect(
      error(`module loop(input logic A, output logic Y);
  loop again (.A(A), .Y(Y));
endmodule`),
    ).toMatch(/cannot be used inside itself/);
    expect(
      error(
        `module top(input logic [3:0] A, output logic [3:0] Y);
  invert #(.M(4)) inv (.A(A), .Y(Y));
endmodule`,
        { invert: INVERT },
      ),
    ).toMatch(/no parameter called M/);
  });

  it("is gated: a challenge that does not use it refuses a use, or a second module", () => {
    const gated = elaborate(FULL, {
      allowed: ["module", "ports", "logic", "assign", "op-bitwise"],
    });
    expect(gated.circuit).toBeUndefined();
    expect(gated.messages.map((m) => m.text).join(" ")).toMatch(
      /This challenge does not use one module used inside another/,
    );
    const two = elaborate(
      `${HALF}\nmodule other(input logic A, output logic Y); assign Y = A; endmodule`,
      {
        allowed: ["module", "ports", "logic", "assign", "op-bitwise"],
      },
    );
    expect(two.circuit).toBeUndefined();
    expect(two.constructs).toContain("instance");
  });
});
