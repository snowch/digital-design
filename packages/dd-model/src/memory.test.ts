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
    const s = sim(libraryCircuit("memory-16"), { A: "0101", D: "10100101", WE: 1, CLK: 0 });
    expect(q(s)).toBe("XXXXXXXX");
    s.clockCycle("CLK");
    expect(q(s)).toBe("10100101");
    set(s, { A: "0100", WE: 0 });
    expect(q(s)).toBe("XXXXXXXX");
    set(s, { CLK: 1 });
    set(s, { WE: 1, D: "11110000" });
    expect(q(s)).toBe("XXXXXXXX");
    set(s, { CLK: 0, A: "0101", WE: 0 });
    expect(q(s)).toBe("10100101");
    const state = s.circuit.nets.find((n) => n.name === "memory/state")!;
    const words = memoryWords(s.read(state.id), 16, 8).map((w) => formatWord(w));
    expect(words[5]).toBe("10100101");
    expect(words[4]).toBe("XXXXXXXX");
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
