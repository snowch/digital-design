// Copyright © 2026 Christopher Snow

// Module 6: the memories behave as the lessons say, as gates and as components.

import { describe, expect, it } from "vitest";

import { Simulator, formatWord, memoryWords, parseWord, runSuite, type Circuit } from "@dd/sim";

import { libraryCircuit } from "./library";

function sim(circuit: Circuit, inputs: Record<string, string | number>): Simulator {
  const s = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    s.setInput(input.net, parseWord(String(inputs[input.name] ?? 0), width));
  }
  s.settle();
  return s;
}

function set(s: Simulator, inputs: Record<string, string | number>): void {
  for (const [name, v] of Object.entries(inputs)) {
    const width = s.circuit.nets[s.resolve(name)]?.width ?? 1;
    s.setInput(name, parseWord(String(v), width));
  }
  s.settle();
}

const q = (s: Simulator, name = "Q") => formatWord(s.read(name));

describe("the four-word RAM, as gates", () => {
  it("writes one word at an edge with WE 1 and reads any word with no edge", () => {
    const s = sim(libraryCircuit("ram-block"), { A1: 1, A0: 0, D: "0110", WE: 1, CLK: 0 });
    expect(q(s)).toBe("XXXX");
    s.clockCycle("CLK");
    expect(q(s)).toBe("0110");
    set(s, { A1: 0, A0: 1, WE: 0 });
    expect(q(s)).toBe("XXXX");
    set(s, { D: "1001", WE: 1 });
    s.clockCycle("CLK");
    expect(q(s)).toBe("1001");
    set(s, { A1: 1, A0: 0, WE: 0 });
    expect(q(s)).toBe("0110");
  });

  it("writes nothing at an edge with WE 0, or when the address changes with the clock high", () => {
    const s = sim(libraryCircuit("ram-block"), { A1: 0, A0: 0, D: "0011", WE: 1, CLK: 0 });
    s.clockCycle("CLK");
    set(s, { D: "1111", WE: 0 });
    s.clockCycle("CLK");
    expect(q(s)).toBe("0011");
    set(s, { CLK: 1 });
    set(s, { A0: 1, WE: 1 });
    expect(q(s)).toBe("XXXX");
    set(s, { CLK: 0, A0: 0, WE: 0 });
    expect(q(s)).toBe("0011");
  });

  it("with a three-bit address it ignores A2: address 5 reaches word 1", () => {
    const s = sim(libraryCircuit("ram-wide"), { A2: 0, A1: 0, A0: 1, D: "0101", WE: 1, CLK: 0 });
    s.clockCycle("CLK");
    set(s, { A2: 1, D: "1110" });
    s.clockCycle("CLK");
    set(s, { A2: 0, WE: 0 });
    expect(q(s)).toBe("1110");
  });

  it("refuses a write past the end when guarded", () => {
    const steps: {
      set: Record<string, string | number>;
      expect?: Record<string, string | number>;
    }[] = [
      { set: { A2: 0, A1: 0, A0: 1, D: "0101", WE: 1, CLK: 0 } },
      { set: { CLK: 1 }, expect: { Q: "0101", OK: 1 } },
      { set: { CLK: 0, A2: 1, D: "1110" }, expect: { OK: 0 } },
      { set: { CLK: 1 } },
      { set: { CLK: 0, A2: 0, WE: 0 }, expect: { Q: "0101", OK: 1 } },
    ];
    expect(runSuite(libraryCircuit("ram-guard"), { kind: "sequence", steps }).passed).toBe(true);
    // Without the guard, the write at address 5 lands on word 1.
    const unguarded = steps.map((s) => ({
      set: s.set,
      ...(s.expect?.["Q"] !== undefined ? { expect: { Q: s.expect["Q"] } } : {}),
    }));
    expect(
      runSuite(libraryCircuit("ram-wide"), { kind: "sequence", steps: unguarded }).passed,
    ).toBe(false);
  });
});

describe("a memory as a component", () => {
  it("behaves as the gates do: write at an edge with WE 1, read with no edge", () => {
    const w = (n: number) => n.toString(2).padStart(16, "0");
    const x = "X".repeat(16);
    const s = sim(libraryCircuit("memory-16"), { A: "0101", D: w(0xa5c3), WE: 1, CLK: 0 });
    expect(q(s)).toBe(x);
    s.clockCycle("CLK");
    expect(q(s)).toBe(w(0xa5c3));
    set(s, { A: "0100", WE: 0 });
    expect(q(s)).toBe(x);
    set(s, { CLK: 1 });
    set(s, { WE: 1, D: w(0xf0f0) });
    expect(q(s)).toBe(x);
    set(s, { CLK: 0, A: "0101", WE: 0 });
    expect(q(s)).toBe(w(0xa5c3));
    const state = s.circuit.nets.find((n) => n.name === "memory/state")!;
    const words = memoryWords(s.read(state.id), 16, 16).map((v) => formatWord(v));
    expect(words[5]).toBe(w(0xa5c3));
    expect(words[4]).toBe(x);
  });
});

describe("the register file", () => {
  it("gives two words at once, each at its own address", () => {
    const s = sim(libraryCircuit("regfile-block"), { WA1: 0, WA0: 1, D: "0111", WE: 1, CLK: 0 });
    s.clockCycle("CLK");
    set(s, { WA1: 1, WA0: 1, D: "1000" });
    s.clockCycle("CLK");
    set(s, { WE: 0, RA1: 0, RA0: 1, RB1: 1, RB0: 1 });
    expect(q(s, "QA")).toBe("0111");
    expect(q(s, "QB")).toBe("1000");
  });
});

describe("the memory of bytes", () => {
  it("keeps a word as two bytes, the low byte at the even address", () => {
    const s = sim(libraryCircuit("byte-memory-block"), {
      A: "0110",
      D: "1111111101001000",
      WORD: 1,
      WE: 1,
      CLK: 0,
    });
    s.clockCycle("CLK");
    expect(q(s)).toBe("1111111101001000");
    set(s, { WE: 0, WORD: 0, A: "0111" });
    expect(q(s)).toBe("0000000011111111");
    set(s, { A: "0110" });
    expect(q(s)).toBe("0000000001001000");
  });

  it("writes one byte at an odd address from D's low byte", () => {
    const s = sim(libraryCircuit("byte-memory-block"), {
      A: "0100",
      D: "1111111101001000",
      WORD: 1,
      WE: 1,
      CLK: 0,
    });
    s.clockCycle("CLK");
    set(s, { A: "0101", WORD: 0, D: "0000000000010010" });
    s.clockCycle("CLK");
    set(s, { A: "0100", WORD: 1, WE: 0 });
    expect(q(s)).toBe("0001001001001000");
  });

  it("refuses a word at an odd address: ODD is 1, a write changes nothing, a read gives the word below", () => {
    const s = sim(libraryCircuit("byte-memory-block"), {
      A: "0100",
      D: "1111111101001000",
      WORD: 1,
      WE: 1,
      CLK: 0,
    });
    s.clockCycle("CLK");
    set(s, { A: "0101", D: "0000000000000000" });
    expect(formatWord(s.read("ODD"))).toBe("1");
    s.clockCycle("CLK");
    set(s, { WE: 0 });
    expect(q(s)).toBe("1111111101001000");
  });

  it("can be filled from a list", () => {
    const s = sim(libraryCircuit("byte-memory-filled"), { A: "0010", WORD: 1 });
    expect(q(s)).toBe("1111111101001000");
  });
});

describe("the shop's memory", () => {
  const start = {
    A5: 0,
    A4: 0,
    A: "0000",
    D: "0",
    WORD: 1,
    WE: 0,
    CLK: 0,
    SENSOR: "1111111101001000",
  };
  for (const id of ["shop-memory-block", "shop-parts"]) {
    it(`${id}: gives each part a quarter of the addresses`, () => {
      const s = sim(libraryCircuit(id), start);
      expect(q(s)).toBe("1111111100000110");
      set(s, { A: "0110" });
      expect(q(s)).toBe("0000000000110010");
      set(s, { A5: 1, A4: 1 });
      expect(q(s)).toBe("1111111101001000");
      set(s, { A5: 1, A4: 0, D: "0000000000010010", WE: 1 });
      s.clockCycle("CLK");
      expect(q(s, "DISPLAY")).toBe("0000000000010010");
      set(s, { A: "1111", WE: 0 });
      expect(q(s)).toBe("0000000000010010");
      set(s, { A5: 0, A4: 1, A: "0100", WE: 1, D: "0000001111101000" });
      s.clockCycle("CLK");
      set(s, { WE: 0 });
      expect(q(s)).toBe("0000001111101000");
      expect(q(s, "DISPLAY")).toBe("0000000000010010");
      set(s, { A5: 1, A4: 1, WE: 1, D: "0" });
      s.clockCycle("CLK");
      expect(q(s)).toBe("1111111101001000");
    });
  }
});
