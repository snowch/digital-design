// Copyright © 2026 Christopher Snow

// Module 8: the datapath built from the learner's parts, against the instruction-level reference,
// instruction by instruction, on the generated suite: every kind, every job, every branch condition
// at its boundaries, and every check that stops the machine.

import { describe, expect, it } from "vitest";

import { CircuitBuilder, Simulator, word } from "@dd/sim";

import { datapathCircuit, registerFile64 } from "./datapath";
import { compareWithReference, registersOf } from "./datapath-run";
import { MASK64, alu64 } from "./machine";
import { machineSuite } from "./machine-suite";
import { registerFile } from "./memory";

describe("the datapath against the reference", () => {
  for (const c of machineSuite(1)) {
    it(`${c.group}: ${c.label}`, () => {
      const result = compareWithReference("full", c.source, c.inputs);
      expect(result.differences).toEqual([]);
      expect(result.instructions).toBeGreaterThan(0);
    }, 60_000);
  }
});

describe("the earlier stages", () => {
  const regs = [
    undefined,
    23n,
    BigInt.asUintN(64, -9n),
    ...Array.from({ length: 13 }, () => undefined),
  ];

  it("jobs: the instruction set by hand, the job digit as the ALU's code", () => {
    const circuit = datapathCircuit({ stage: "jobs", registers: regs });
    const sim = new Simulator(circuit);
    sim.setInput("CLK", word(1, 0));
    sim.setInput("WRITEY", word(1, 1));
    for (const [hex, reg, expected] of [
      [0x12123000, 3, alu64(2, 23n, BigInt.asUintN(64, -9n)).y],
      [0x13214000, 4, alu64(3, BigInt.asUintN(64, -9n), 23n).y],
      [0x16305000, 5, 15n],
    ] as const) {
      sim.setInput("IR", word(32, hex));
      sim.settle();
      sim.clockCycle("CLK");
      expect(registersOf(circuit, sim.snapshotValues())[reg]).toBe(expected);
    }
    // WRITEY at 0: nothing is written.
    sim.setInput("WRITEY", word(1, 0));
    sim.setInput("IR", word(32, 0x12126000));
    sim.clockCycle("CLK");
    expect(registersOf(circuit, sim.snapshotValues())[6]).toBeUndefined();
  });

  it("constants: B takes the widened constant while BCONST is 1", () => {
    const circuit = datapathCircuit({ stage: "constants", registers: regs });
    const sim = new Simulator(circuit);
    sim.setInput("CLK", word(1, 0));
    sim.setInput("WRITEY", word(1, 1));
    sim.setInput("BCONST", word(1, 1));
    sim.setInput("IR", word(32, 0x25001f48));
    sim.clockCycle("CLK");
    expect(registersOf(circuit, sim.snapshotValues())[1]).toBe(BigInt.asUintN(64, -184n));
    sim.setInput("BCONST", word(1, 0));
    sim.setInput("IR", word(32, 0x25023000));
    sim.clockCycle("CLK");
    expect(registersOf(circuit, sim.snapshotValues())[3]).toBe(BigInt.asUintN(64, -9n));
  });

  it("fetch: register and constant jobs, stop and an illegal instruction, from the ROM", () => {
    for (const source of [
      "R1 <= 5\nR2 <= R1 + R1\nR3 <= R2 - 1\nR4 <= R3 ^ -1\nstop",
      "R1 <= 5\nR1 <= R1 + 1",
    ]) {
      expect(compareWithReference("fetch", source).differences).toEqual([]);
    }
  });

  it("memory: loads and stores, devices and the memory checks", () => {
    for (const c of machineSuite(1).filter(
      (x) => x.group === "stops" && !/goto|call/.test(x.source),
    ))
      expect(compareWithReference("memory", c.source, c.inputs).differences, c.label).toEqual([]);
  }, 60_000);
});

describe("the register file of two banks", () => {
  it("keeps what Module 6's register file keeps, a bank at a time", () => {
    // Module 6's component and this one's low bank, given the same writes, hold the same words.
    const b = new CircuitBuilder("compare");
    const clk = b.input("CLK");
    const we = b.input("WE");
    const wa = b.input("WA", 4);
    const d = b.input("D", 64);
    const ra = b.input("RA", 4);
    const rb = b.input("RB", 4);
    const ours = registerFile64(b, { RA: ra, RB: rb, WA: wa, D: d, WE: we, CLK: clk });
    const low = b.net("DLOW", 32);
    b.component("slice", { a: d }, { y: low }, { name: "low", params: { hi: 31, lo: 0 } });
    const theirs = registerFile(
      b,
      { CLK: clk, WE: we, WA: wa, D: low, RA: ra, RB: rb },
      { name: "old", words: 16, width: 32 },
    );
    b.output("QA", ours.QA);
    b.output("OLDA", theirs.QA);
    const circuit = b.build();
    const sim = new Simulator(circuit);
    sim.setInput("CLK", word(1, 0));
    sim.setInput("WE", word(1, 1));
    for (let k = 0; k < 16; k++) {
      sim.setInput("WA", word(4, k));
      sim.setInput("D", word(64, (BigInt(k) << 40n) | BigInt(1000 + k)));
      sim.clockCycle("CLK");
    }
    for (let k = 0; k < 16; k++) {
      sim.setInput("RA", word(4, k));
      sim.settle();
      const out = sim.outputs();
      expect(out["QA"]?.value).toBe((BigInt(k) << 40n) | BigInt(1000 + k));
      expect(out["OLDA"]?.value).toBe(BigInt(1000 + k));
    }
  });

  it("starts with the words a figure gives it, and X where it gives none", () => {
    const circuit = datapathCircuit({ stage: "jobs", registers: [7n, undefined, MASK64] });
    const sim = new Simulator(circuit);
    sim.setInput("CLK", word(1, 0));
    sim.setInput("WRITEY", word(1, 0));
    sim.setInput("IR", word(32, 0));
    sim.settle();
    const r = registersOf(circuit, sim.snapshotValues());
    expect(r.slice(0, 4)).toEqual([7n, undefined, MASK64, undefined]);
  });
});
