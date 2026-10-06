// Copyright © 2026 Christopher Snow

// The settle model works out only the gates whose inputs changed after its first step, and finds a
// repeated state by a hash. Both are meant to change nothing: this test holds every step of the
// history, the iteration count and the oscillating nets to a plain settle that works out every
// gate at every step and compares whole states.

import { describe, expect, it } from "vitest";

import { CircuitBuilder, type Circuit } from "./circuit";
import { primitive } from "./primitives";
import { Simulator } from "./simulator";
import { equal, unknown, word, type Word } from "./values";

function plainSettle(circuit: Circuit, start: Word[]) {
  let values = [...start];
  const history: Word[][] = [[...values]];
  for (let i = 0; i < 4 * circuit.components.length + 16; i++) {
    const next = [...values];
    let changed = false;
    for (const c of circuit.components) {
      const ins: Record<string, Word> = {};
      for (const [p, n] of Object.entries(c.inputs)) ins[p] = values[n] as Word;
      const out = primitive(c.kind).evaluate(ins, c.params);
      for (const [p, n] of Object.entries(c.outputs)) {
        const v = out[p];
        if (v && !equal(next[n] as Word, v)) {
          next[n] = v;
          changed = true;
        }
      }
    }
    if (!changed) return { history, iterations: i + 1, repeated: false };
    values = next;
    history.push([...next]);
    const k = history.slice(0, -1).findIndex((h) => h.every((w, n) => equal(w, next[n] as Word)));
    if (k >= 0) return { history, iterations: i + 1, repeated: true };
  }
  return { history, iterations: -1, repeated: false };
}

function ring(n: number): Circuit {
  const b = new CircuitBuilder(`ring-${n}`);
  const nets = Array.from({ length: n }, (_, i) => b.net(`n${i}`));
  nets.forEach((net, i) => b.not(nets[(i + n - 1) % n] as number, { output: net }));
  return b.build();
}

function chain(): Circuit {
  const b = new CircuitBuilder("chain");
  const a = b.input("A", 8);
  const c = b.input("C");
  let carry = c;
  for (let i = 0; i < 8; i++) {
    const bit = b.net(`a${i}`);
    b.component("bit", { a }, { y: bit }, { params: { index: i } });
    const s = b.xor([bit, carry]);
    b.output(`S${i}`, s);
    carry = b.and([bit, carry]);
  }
  b.output("COUT", carry);
  return b.build();
}

describe("the settle model's shortcuts change nothing", () => {
  for (const circuit of [ring(1), ring(2), ring(3), ring(4), chain()]) {
    it(circuit.name, () => {
      const sim = new Simulator(circuit);
      for (const i of circuit.inputs) {
        const w = circuit.nets[i.net]?.width ?? 1;
        sim.setInput(i.name, word(w, w === 1 ? 1 : 0xff));
      }
      const start = sim.snapshotValues();
      const plain = plainSettle(circuit, start);
      const r = sim.settle();
      expect(r.iterations).toBe(plain.iterations);
      expect(r.history.length).toBe(plain.history.length);
      r.history.forEach((h, k) =>
        h.forEach((w, n) => expect(equal(w, plain.history[k]?.[n] ?? unknown(1))).toBe(true)),
      );
      expect(!r.converged).toBe(plain.repeated);
    });
  }
});

// Module 8: after a settle that ended with nothing changing, the next settle's first step works out
// only the readers of the inputs set since, and the history is kept as the nets each step changed.
// Over a run of input changes, every settle must still match the plain one step for step.
describe("a settle after a settled state changes nothing either", () => {
  it("matches a plain settle at every change of a carry chain's inputs", () => {
    const circuit = chain();
    const sim = new Simulator(circuit);
    const values = [0x00, 0xff, 0x0f, 0x80, 0xff, 0x01, 0x7f];
    sim.setInput("A", word(8, 0));
    sim.setInput("C", word(1, 0));
    sim.settle();
    values.forEach((v, i) => {
      sim.setInput("A", word(8, v));
      sim.setInput("C", word(1, i % 2));
      const start = sim.snapshotValues();
      const plain = plainSettle(circuit, start);
      const r = sim.settle();
      expect(r.iterations).toBe(plain.iterations);
      expect(r.history.length).toBe(plain.history.length);
      r.history.forEach((h, k) =>
        h.forEach((w, n) => expect(equal(w, plain.history[k]?.[n] ?? unknown(1))).toBe(true)),
      );
    });
  });

  it("works out every gate again after a restore", () => {
    const circuit = ring(3);
    const sim = new Simulator(circuit);
    const snap = sim.snapshot();
    const first = sim.settle();
    sim.restore(snap);
    const again = sim.settle();
    expect(again.iterations).toBe(first.iterations);
    expect(again.converged).toBe(first.converged);
  });
});
