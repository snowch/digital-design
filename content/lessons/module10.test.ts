// Copyright © 2026 Christopher Snow

// Module 10: the machine's texts the lessons change, run against the reference instruction by
// instruction. Lesson 1's second circuit runs Module 8's suite to the same results with its jobs in
// 3 edges; the capstone's machine runs the suite and programs of set if, each in 4 edges.

import { describe, expect, it } from "vitest";

import {
  SET_IF_KIND,
  compareMulticycle,
  decoderCircuit,
  fieldsOf,
  isIllegal,
  machineSuite,
} from "@dd/dd-model";
import { Simulator, word } from "@dd/sim";

import { machineFromText } from "./module9.test";
import { COUNT_COLD_BRANCHES, COUNT_COLD_SET, setMachineText, shortJobsText } from "./module10";

const COLD = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;

describe("lesson 10.1's second circuit: jobs in 3 edges", () => {
  const seen = new Map<number, Set<number>>();
  for (const c of machineSuite(1)) {
    it(`runs as the reference does: ${c.group}, ${c.label}`, () => {
      const r = compareMulticycle(
        c.source,
        c.inputs,
        { shortJobs: true },
        400,
        machineFromText(shortJobsText()),
      );
      expect(r.differences).toEqual([]);
      for (const e of r.edges) seen.set(e.kind, (seen.get(e.kind) ?? new Set()).add(e.edges));
    }, 60_000);
  }
  it("takes 3 edges for each job, and the other kinds' edges as before", () => {
    expect([...(seen.get(1) ?? [])]).toEqual([3]);
    expect([...(seen.get(2) ?? [])]).toEqual([3]);
    expect([...(seen.get(3) ?? [])]).toEqual([5]);
  });
});

describe("the capstone's machine: set if at kind A", () => {
  it("runs the program that counts the cold rooms, set if in 4 edges", () => {
    const r = compareMulticycle(
      COUNT_COLD_SET,
      COLD,
      { callThroughRegister: true, setIf: true },
      400,
      machineFromText(setMachineText(true)),
    );
    expect(r.differences).toEqual([]);
    expect(r.edges.filter((e) => e.kind === SET_IF_KIND).map((e) => e.edges)).toEqual([4, 4]);
  }, 60_000);
  it("runs every condition, on equal, smaller and larger words", () => {
    const pairs = ["R1 <= 5\nR2 <= 5", "R1 <= -3\nR2 <= 7", "R1 <= 7\nR2 <= -3"];
    const conds = [
      ["==", ""],
      ["!=", ""],
      ["<", " unsigned"],
      [">=", " unsigned"],
      ["<", " signed"],
      [">=", " signed"],
    ];
    for (const p of pairs) {
      const source = `${p}\n${conds.map(([op, how], i) => `R${3 + i} <= R1 ${op} R2${how}`).join("\n")}\nstop`;
      const r = compareMulticycle(
        source,
        COLD,
        { callThroughRegister: true, setIf: true },
        400,
        machineFromText(setMachineText(true)),
      );
      expect(r.differences, p).toEqual([]);
    }
  }, 120_000);
  it("without the datapath's new source, writes the subtraction instead", () => {
    const r = compareMulticycle(
      COUNT_COLD_SET,
      COLD,
      { callThroughRegister: true, setIf: true },
      400,
      machineFromText(setMachineText(false)),
    );
    expect(r.differences[0]).toMatch(/R5/);
  }, 60_000);
  it("runs the program written with branches, on the course's machine too", () => {
    expect(compareMulticycle(COUNT_COLD_BRANCHES, COLD).differences).toEqual([]);
  }, 60_000);
});

describe("the decoder with set if against the reference", () => {
  it("refuses exactly the words the reference refuses, for every kind and job", () => {
    const sim = new Simulator(decoderCircuit({ callThroughRegister: true, setIf: true }));
    for (let k = 0; k < 16; k++)
      for (let j = 0; j < 16; j++)
        for (const c of [0, 4, 5, 0xfff]) {
          sim.setInput("K", word(4, k));
          sim.setInput("J", word(4, j));
          sim.setInput("C", word(12, c));
          sim.settle();
          const refused = sim.outputs()["CAUSED"]?.value === 0x21n;
          const f = fieldsOf(((k << 28) | (j << 24) | c) >>> 0);
          expect(refused, `K ${k} J ${j} C ${c}`).toBe(
            isIllegal(f, { registerCheck: true, callThroughRegister: 9, setIf: 10 }),
          );
        }
  });
});
