// Copyright © 2026 Chris Snow

// Module 7's text: `+` and `-` on signals, a concatenation as an assignment's target, and a
// parameter set from outside, each held to what SystemVerilog gives, worked out in bigints.

import { describe, expect, it } from "vitest";

import { Simulator, word, type Circuit } from "@dd/sim";

import { elaborate } from "./elaborate";

function build(text: string, parameters?: Record<string, number>): Circuit {
  const r = elaborate(text, parameters ? { parameters } : {});
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

const ADDER = `module adder #(parameter N = 16) (
  input logic [N-1:0] A,
  input logic [N-1:0] B,
  input logic CIN,
  output logic [N-1:0] SUM,
  output logic COUT
);
  assign {COUT, SUM} = A + B + CIN;
endmodule`;

describe("+ and - on signals", () => {
  it("an adder with a carry in and a carry out, at its default width and at 4 and 64", () => {
    for (const n of [4, 16, 64]) {
      const c = build(ADDER, n === 16 ? undefined : { N: n });
      const m = (1n << BigInt(n)) - 1n;
      for (const [a, b, cin] of [
        [m, 1n, 0n],
        [m, m, 1n],
        [5n, 9n, 1n],
        [0n, 0n, 0n],
        [m >> 1n, 1n, 0n],
      ] as const) {
        const total = a + b + cin;
        expect(run(c, { A: a, B: b, CIN: cin }), `${n}: ${a} + ${b} + ${cin}`).toEqual({
          SUM: total & m,
          COUT: total >> BigInt(n),
        });
      }
    }
  });

  it("a + b + c with c one bit wide is one adder, c its carry in", () => {
    const c = build(ADDER);
    expect(c.composites.filter((x) => x.kind === "adder")).toHaveLength(1);
  });

  it("A - B keeps the low bits, and on one more bit its top bit is 1 when A < B", () => {
    const c =
      build(`module sub (input logic [7:0] A, input logic [7:0] B, output logic [7:0] D, output logic [8:0] W);
  assign D = A - B;
  assign W = A - B;
endmodule`);
    for (const [a, b] of [
      [5n, 3n],
      [3n, 5n],
      [0n, 255n],
      [200n, 200n],
    ] as const) {
      const r = run(c, { A: a, B: b });
      expect(r["D"]).toBe((a - b) & 0xffn);
      expect(r["W"]).toBe((a - b) & 0x1ffn);
    }
  });

  it("~B inside a wider sum is widened first, as SystemVerilog does", () => {
    const c =
      build(`module m (input logic [3:0] A, input logic [3:0] B, output logic [4:0] W, output logic [4:0] V);
  assign W = A + ~B + 1;
  assign V = {1'b0, A} + {1'b0, ~B} + 1;
endmodule`);
    // W: B widened to 5 bits, then turned over: A - B on 5 bits. V: B turned over at 4 bits.
    const r = run(c, { A: 5n, B: 3n });
    expect(r["W"]).toBe(2n);
    expect(r["V"]).toBe(0b10010n);
  });

  it("counts up and down at any width", () => {
    const text = `module count #(parameter N = 8) (input logic [N-1:0] A, output logic [N-1:0] UP, output logic [N-1:0] DOWN);
  assign UP = A + 1;
  assign DOWN = A - 1;
endmodule`;
    for (const n of [8, 64]) {
      const m = (1n << BigInt(n)) - 1n;
      const c = build(text, { N: n });
      expect(run(c, { A: m })).toEqual({ UP: 0n, DOWN: m - 1n });
      expect(run(c, { A: 0n })).toEqual({ UP: 1n, DOWN: m });
    }
  });

  it("a concatenation target takes the value's top bits first", () => {
    const c = build(`module m (input logic [5:0] A, output logic [1:0] H, output logic [3:0] L);
  assign {H, L} = A;
endmodule`);
    expect(run(c, { A: 0b101101n })).toEqual({ H: 0b10n, L: 0b1101n });
  });

  it("the gate refuses each construct a challenge does not allow, in a sentence", () => {
    const base = ["module", "ports", "logic", "vector", "assign", "op-bitwise"] as const;
    const texts = elaborate(ADDER, { allowed: [...base] }).messages.map((m) => m.text);
    expect(texts).toEqual([
      "This challenge does not use a `parameter`.",
      "This challenge does not use concatenation with `{a, b}`. Instead, use one-bit signals.",
      "This challenge does not use arithmetic with `+` and `-`. Instead, write the gates out; adders come in a later module.",
    ]);
    const ok = elaborate(ADDER, {
      allowed: [...base, "parameter", "concat", "op-arith"],
    }).messages.filter((m) => m.severity !== "warning");
    expect(ok).toEqual([]);
  });
});
