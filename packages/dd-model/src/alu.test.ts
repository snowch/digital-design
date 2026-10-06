// Copyright © 2026 Chris Snow

// Module 7's ALU against its reference in bigints: every job on every pair of 4-bit words, the
// generated suite at 16 and 64 bits in both arrangements, the slice chained by the grader's own
// chain, and the generator's groups.

import { describe, expect, it } from "vitest";

import { Simulator, word, type Circuit } from "@dd/sim";

import {
  aluCircuit,
  aluResult,
  aluSliceCircuit,
  colderCircuit,
  operandCircuit,
  opBits,
  zeroSliceCircuit,
} from "./alu";
import { chainSlices } from "./chain";
import { aluSuite, alternatingWords, boundaryWords, randomWord } from "./testcases";
import { SeededRandom } from "@dd/sim";

function run(circuit: Circuit, inputs: Record<string, bigint | number>): Record<string, bigint> {
  const sim = new Simulator(circuit);
  for (const p of circuit.inputs) {
    const width = circuit.nets[p.net]?.width ?? 1;
    sim.setInput(p.name, word(width, BigInt(inputs[p.name] ?? 0)));
  }
  sim.settle();
  const out: Record<string, bigint> = {};
  for (const o of circuit.outputs) {
    const w = sim.read(o.name);
    expect(w.known, `${circuit.name}.${o.name} known`).toBe((1n << BigInt(w.width)) - 1n);
    out[o.name] = w.value;
  }
  return out;
}

function expected(job: number, a: bigint, b: bigint, width: number) {
  const r = aluResult(job, a, b, width);
  return {
    Y: r.Y,
    ZERO: BigInt(r.ZERO),
    MINUS: BigInt(r.MINUS),
    COUT: BigInt(r.COUT),
    OVER: BigInt(r.OVER),
  };
}

describe("the reference in bigints", () => {
  it("keeps Module 3's four jobs and their codes", () => {
    expect(aluResult(0, 0b0110n, 0b0011n, 4).Y).toBe(0b0010n);
    expect(aluResult(1, 0b0110n, 0b0011n, 4).Y).toBe(0b0101n);
    expect(aluResult(2, 0b0110n, 0b0011n, 4).Y).toBe(0b1001n);
    expect(aluResult(3, 0b0110n, 0b0011n, 4)).toMatchObject({ Y: 0b0011n, COUT: 1 });
  });

  it("counts up and down, wrapping at the ends", () => {
    expect(aluResult(6, 0xffffn, 0n, 16)).toEqual({ Y: 0n, ZERO: 1, MINUS: 0, COUT: 1, OVER: 0 });
    expect(aluResult(7, 0n, 0n, 16)).toEqual({ Y: 0xffffn, ZERO: 0, MINUS: 1, COUT: 0, OVER: 0 });
    expect(aluResult(6, 0x7fffn, 0n, 16)).toMatchObject({ Y: 0x8000n, OVER: 1 });
    expect(aluResult(7, 0x8000n, 0n, 16)).toMatchObject({ Y: 0x7fffn, OVER: 1, COUT: 1 });
  });

  it("keeps every bit of a 64-bit word", () => {
    const all = (1n << 64n) - 1n;
    expect(aluResult(6, all, 0n, 64)).toMatchObject({ Y: 0n, COUT: 1, ZERO: 1 });
    expect(aluResult(2, all - 1n, 1n, 64).Y).toBe(all);
  });

  it("gives COUT and OVER 0 for every bit-by-bit job", () => {
    for (const job of [0, 1, 4, 5])
      expect(aluResult(job, 0xffffn, 0x8000n, 16)).toMatchObject({ COUT: 0, OVER: 0 });
  });
});

describe("the circuits", () => {
  it("the 4-bit ALU with flags: every job on every pair of words", () => {
    const c = aluCircuit({ width: 4, flags: true });
    for (let job = 0; job < 8; job++)
      for (let a = 0n; a < 16n; a++)
        for (let b = 0n; b < 16n; b++)
          expect(run(c, { A: a, B: b, ...opBits(job) }), `${job} ${a} ${b}`).toEqual(
            expected(job, a, b, 4),
          );
  });

  it("the 4-bit ALU without flags, closed: Y and COUT", () => {
    const c = aluCircuit({ width: 4, closed: true });
    for (let job = 0; job < 8; job++)
      for (const [a, b] of [
        [5n, 9n],
        [15n, 1n],
        [0n, 1n],
        [8n, 7n],
      ] as const) {
        const e = expected(job, a, b, 4);
        expect(run(c, { A: a, B: b, ...opBits(job) })).toEqual({ Y: e.Y, COUT: e.COUT });
      }
  });

  for (const [width, arrange] of [
    [16, "groups"],
    [16, "row"],
    [64, "groups"],
    [64, "row"],
  ] as const) {
    it(`the ${width}-bit ALU with flags (${arrange}) passes the generated suite`, () => {
      const c = aluCircuit({ width, flags: true, arrange });
      for (const k of aluSuite({ width, seed: 7 }))
        expect(run(c, { A: k.a, B: k.b, ...opBits(k.job) }), k.label).toEqual(
          expected(k.job, k.a, k.b, width),
        );
    });
  }

  it("the slice, chained as the grader chains it, is the ALU", () => {
    const chain = chainSlices(aluSliceCircuit(), 8, {
      bitwise: ["A", "B"],
      outputs: ["Y"],
      shared: ["OP2", "OP1", "OP0"],
      carry: { in: "CIN", out: "COUT" },
    });
    const rng = new SeededRandom(3);
    for (let job = 0; job < 8; job++)
      for (let i = 0; i < 6; i++) {
        const a = randomWord(rng, 8);
        const b = randomWord(rng, 8);
        const { OP2, OP1, OP0 } = opBits(job);
        const cin = OP1 & (OP2 ^ OP0);
        const e = expected(job, a, b, 8);
        expect(run(chain, { A: a, B: b, OP2, OP1, OP0, CIN: cin })).toEqual({
          Y: e.Y,
          COUT: e.COUT,
        });
      }
  });

  it("the operand bit: B, NOT B, 0 or 1, and 0 for a bit-by-bit job", () => {
    const c = operandCircuit(true);
    for (let job = 0; job < 8; job++)
      for (const b of [0n, 1n]) {
        const { OP2, OP1, OP0 } = opBits(job);
        const d = !OP1 ? 0n : OP2 ? BigInt(OP0) : b ^ BigInt(OP0);
        expect(run(c, { B: b, OP2, OP1, OP0 })).toEqual({
          D: d,
          C0: BigInt(OP1 & (OP2 ^ OP0)),
        });
      }
  });

  it("the zero slice, chained, says whether a word is all 0s", () => {
    const chain = chainSlices(zeroSliceCircuit(), 16, {
      bitwise: ["Y"],
      outputs: [],
      shared: [],
      carry: { in: "ZIN", out: "ZOUT" },
    });
    for (const y of [0n, 1n, 0x8000n, 0x0100n, 0xffffn])
      expect(run(chain, { Y: y, ZIN: 1 })["ZOUT"]).toBe(y === 0n ? 1n : 0n);
  });

  it("the colder lamp is MINUS XOR OVER of A - B", () => {
    const c = colderCircuit();
    const w = boundaryWords(16);
    const alt = alternatingWords(16);
    for (const [a, b] of [
      [w.signedMax, w.signedMin],
      [w.signedMin, w.signedMax],
      [0xff48n, 0xff06n],
      [0xff06n, 0xff48n],
      [alt.high, alt.low],
      [5n, 5n],
    ] as const) {
      const r = aluResult(3, a, b, 16);
      const signed = (x: bigint) => (x >= 0x8000n ? x - 0x10000n : x);
      expect(run(c, { ZERO: r.ZERO, MINUS: r.MINUS, COUT: r.COUT, OVER: r.OVER })["COLDER"]).toBe(
        signed(a) < signed(b) ? 1n : 0n,
      );
    }
  });
});

describe("the generated suite", () => {
  it("is the same for the same seed and different for another", () => {
    const one = aluSuite({ width: 16, seed: 11 }).map((c) => c.label);
    expect(aluSuite({ width: 16, seed: 11 }).map((c) => c.label)).toEqual(one);
    expect(aluSuite({ width: 16, seed: 12 }).map((c) => c.label)).not.toEqual(one);
  });

  it("changes only its random group with the seed", () => {
    const a = aluSuite({ width: 16, seed: 1 }).filter((c) => c.group !== "random");
    const b = aluSuite({ width: 16, seed: 2 }).filter((c) => c.group !== "random");
    expect(a).toEqual(b);
  });

  it("has every group, and adversarial cases that run the carry the whole width", () => {
    const suite = aluSuite({ width: 64, seed: 5 });
    const groups = new Set(suite.map((c) => c.group));
    expect([...groups]).toEqual(["normal", "boundary", "random", "adversarial"]);
    const adv = suite.filter((c) => c.group === "adversarial");
    expect(adv.some((c) => c.job === 2 && c.expect.Y === 0n && c.expect.COUT === 1)).toBe(true);
    expect(adv.some((c) => c.expect.OVER === 1)).toBe(true);
    expect(suite.some((c) => c.label.includes("8000000000000000"))).toBe(true);
  });
});
