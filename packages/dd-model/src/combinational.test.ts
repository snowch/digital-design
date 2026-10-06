// Copyright © 2026 Christopher Snow

// Module 3's blocks against what each is for, every input pattern where there are few enough, and
// the chain a slice is tested in against the ALU built in one piece.

import { describe, expect, it } from "vitest";

import { Simulator, formatWord, parseWord, type Circuit } from "@dd/sim";

import { chainSlices } from "./chain";
import { libraryCircuit } from "./library";

/** Settles the circuit with the inputs given (numbers, read at each input's width). */
function run(circuit: Circuit, inputs: Record<string, number>): Record<string, bigint> {
  const sim = new Simulator(circuit);
  for (const p of circuit.inputs) {
    const width = circuit.nets[p.net]?.width ?? 1;
    sim.setInput(p.name, parseWord(String(inputs[p.name] ?? 0), width));
  }
  sim.settle();
  const out: Record<string, bigint> = {};
  for (const o of circuit.outputs) {
    const w = sim.read(o.name);
    expect(formatWord(w), `${circuit.name}.${o.name}`).not.toContain("X");
    out[o.name] = w.value;
  }
  return out;
}

/** Every pattern of the named one-bit inputs. */
function* patterns(names: readonly string[]): Generator<Record<string, number>> {
  for (let n = 0; n < 1 << names.length; n++)
    yield Object.fromEntries(names.map((name, i) => [name, (n >> (names.length - 1 - i)) & 1]));
}

describe("the selectors", () => {
  for (const id of ["selector-2-block", "selector-2-gates"]) {
    it(`${id}: Y is A while S is 0 and B while S is 1`, () => {
      const c = libraryCircuit(id);
      for (const p of patterns(["S", "A", "B"]))
        expect(run(c, p)["Y"]).toBe(BigInt(p["S"] ? p["B"]! : p["A"]!));
    });
  }
  for (const id of ["selector-4-block", "selector-4-blocks"]) {
    it(`${id}: S1 S0 read as a number picks A, B, C or D`, () => {
      const c = libraryCircuit(id);
      for (const p of patterns(["S1", "S0", "A", "B", "C", "D"])) {
        const k = p["S1"]! * 2 + p["S0"]!;
        expect(run(c, p)["Y"]).toBe(BigInt(p[["A", "B", "C", "D"][k]!]!));
      }
    });
  }
  it("the word selector picks a whole 4-bit word with one S", () => {
    const c = libraryCircuit("selector-word");
    for (let a = 0; a < 16; a += 3)
      for (let b = 0; b < 16; b += 5)
        for (const s of [0, 1]) expect(run(c, { A: a, B: b, S: s })["Y"]).toBe(BigInt(s ? b : a));
  });
});

describe("decoders, encoders, the demultiplexer and the comparator", () => {
  for (const id of ["decoder-block", "decoder-gates"]) {
    it(`${id}: exactly one output, the one S1 S0 names`, () => {
      const c = libraryCircuit(id);
      for (const p of patterns(["S1", "S0"])) {
        const k = p["S1"]! * 2 + p["S0"]!;
        const out = run(c, p);
        for (let j = 0; j < 4; j++) expect(out[`Y${j}`]).toBe(j === k ? 1n : 0n);
      }
    });
  }
  it("the demultiplexer sends IN to the output S1 S0 names, and 0 to the others", () => {
    const c = libraryCircuit("demux-block");
    for (const p of patterns(["IN", "S1", "S0"])) {
      const k = p["S1"]! * 2 + p["S0"]!;
      const out = run(c, p);
      for (let j = 0; j < 4; j++) expect(out[`Y${j}`]).toBe(j === k ? BigInt(p["IN"]!) : 0n);
    }
  });
  it("the encoder gives the number of the one line at 1, and mixes two lines' numbers", () => {
    const c = libraryCircuit("encoder-block");
    for (let k = 0; k < 4; k++) {
      const out = run(c, Object.fromEntries([0, 1, 2, 3].map((j) => [`L${j}`, j === k ? 1 : 0])));
      expect(out["S1"]! * 2n + out["S0"]!).toBe(BigInt(k));
    }
    const two = run(c, { L1: 1, L2: 1 });
    expect(two["S1"]! * 2n + two["S0"]!).toBe(3n);
    const none = run(c, {});
    expect(none["S1"]! * 2n + none["S0"]!).toBe(0n);
  });
  it("the comparator is 1 exactly when the two words are equal", () => {
    const c = libraryCircuit("comparator-parts");
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++) expect(run(c, { A: a, B: b })["EQ"]).toBe(a === b ? 1n : 0n);
  });
});

describe("the adders", () => {
  it("the half adder: the two bits' total, as CARRY and SUM", () => {
    const c = libraryCircuit("half-adder-gates");
    for (const p of patterns(["A", "B"])) {
      const out = run(c, p);
      expect(out["CARRY"]! * 2n + out["SUM"]!).toBe(BigInt(p["A"]! + p["B"]!));
    }
  });
  it("the full adder: the three bits' total, as COUT and SUM", () => {
    const c = libraryCircuit("full-adder-parts");
    for (const p of patterns(["A", "B", "CIN"])) {
      const out = run(c, p);
      expect(out["COUT"]! * 2n + out["SUM"]!).toBe(BigInt(p["A"]! + p["B"]! + p["CIN"]!));
    }
  });
  for (const id of ["adder-4-block", "adder-4-parts"]) {
    it(`${id}: every pair of 4-bit words and both carries in`, () => {
      const c = libraryCircuit(id);
      for (let a = 0; a < 16; a++)
        for (let b = 0; b < 16; b++)
          for (const cin of [0, 1]) {
            const out = run(c, { A: a, B: b, CIN: cin });
            expect(out["COUT"]! * 16n + out["SUM"]!).toBe(BigInt(a + b + cin));
          }
    });
  }
  it("the 16-bit adder adds the correction to the second room's word", () => {
    const out = run(libraryCircuit("adder-16-block"), { A: 0xff06, B: 0xfffa, CIN: 0 });
    expect(out["SUM"]).toBe(0xff00n);
    expect(out["COUT"]).toBe(1n);
  });
  it("the overflow lamp is 1 exactly when the signed sum of two 4-bit words does not fit", () => {
    const c = libraryCircuit("overflow-gates");
    const signed = (n: number) => (n >= 8 ? n - 16 : n);
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++) {
        const s = (a + b) & 15;
        const fits = signed(a) + signed(b) === signed(s);
        expect(run(c, { A3: a >> 3, B3: b >> 3, S3: s >> 3 })["V"]).toBe(fits ? 0n : 1n);
      }
  });
});

describe("the ALU", () => {
  const job = (op: number, a: number, b: number, width: number) => {
    const m = (1 << width) - 1;
    return [a & b, a ^ b, (a + b) & m, (a - b) & m][op]!;
  };
  it("NOT B plus 1 is the word for minus B", () => {
    const c = libraryCircuit("negate-4");
    for (let b = 0; b < 16; b++) expect(run(c, { B: b })["NEG"]).toBe(BigInt((16 - b) & 15));
  });
  it("the 4-bit add-or-subtract unit", () => {
    const c = libraryCircuit("addsub-4");
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++)
        for (const sub of [0, 1])
          expect(run(c, { A: a, B: b, SUB: sub })["SUM"]).toBe(BigInt(job(sub ? 3 : 2, a, b, 4)));
  });
  for (const width of [4, 16]) {
    it(`the ${width}-bit ALU does the job OP1 OP0 names`, () => {
      const c = libraryCircuit(`alu-${width}`);
      const words = width === 4 ? [0, 1, 5, 7, 8, 12, 15] : [0, 0x42, 0xff06, 0xff48, 0xffff];
      for (const a of words)
        for (const b of words)
          for (let op = 0; op < 4; op++)
            expect(run(c, { A: a, B: b, OP1: op >> 1, OP0: op & 1 })["Y"]).toBe(
              BigInt(job(op, a, b, width)),
            );
    });
  }
  it("a chain of the reference slice is the ALU, given bit 0's carry in", () => {
    const slice = libraryCircuit("alu-slice-parts");
    for (const width of [1, 4, 8]) {
      const c = chainSlices(slice, width, {
        bitwise: ["A", "B"],
        outputs: ["Y"],
        shared: ["OP1", "OP0"],
        carry: { in: "CIN", out: "COUT" },
      });
      const m = (1 << width) - 1;
      for (const a of [0, 1, 3, m, m >> 1])
        for (const b of [0, 1, 2, m])
          for (let op = 0; op < 4; op++)
            expect(
              run(c, { A: a & m, B: b & m, OP1: op >> 1, OP0: op & 1, CIN: op === 3 ? 1 : 0 })["Y"],
            ).toBe(BigInt(job(op, a & m, b & m, width)));
    }
  });
});
