// Copyright © 2026 Christopher Snow

// Module 13: each part of the final machine that never opens, read as one bit of the drawing the
// module that built it drew, gives what the machine itself gives: a register's bit holds after
// the next edge what the next frame holds, a selector's and an adder's give the bit their word
// gives now, and the library's drawing of that bit, run in the simulator, agrees.

import { describe, expect, it } from "vitest";
import { Simulator, word, type Word } from "@dd/sim";

import { bitDrive, bitPartOf, type BitDrive } from "./bit-views";
import { FINAL_PROGRAMS } from "./final-programs";
import { recordRun } from "./final-run";
import { libraryCircuit } from "./library";
import { ramBytesOf, registersOf } from "./datapath-run";

const run = recordRun({
  libraryId: "machine-final",
  program: `${FINAL_PROGRAMS[0]!.source}
R7 <= 0x7FF
word[0x400] <= R7
byte[0x40B] <= R7`.replace(
    "stop\nshow:",
    "R7 <= 0x7FF\nword[0x408] <= R7\nbyte[0x401] <= R7\nstop\nshow:",
  ),
  inputs: { SENSORA: -184, SENSORB: -250 },
});
const c = run.circuit;
const bitOf = (w: Word | undefined, k: number) =>
  w && ((w.known >> BigInt(k)) & 1n) === 1n ? Number((w.value >> BigInt(k)) & 1n) : undefined;

/** The library's drawing of the bit, driven, and what it gives: after a clock edge for a register. */
function simulated(d: BitDrive): number | undefined {
  const lc = libraryCircuit(d.libraryId);
  const sim = new Simulator(lc);
  const set = (n: string, v: 0 | 1 | undefined) => {
    if (lc.inputs.some((i) => i.name === n) && v !== undefined) sim.setInput(n, word(1, v));
  };
  for (const i of lc.inputs) sim.setInput(i.name, word(1, 0));
  sim.settle();
  if (d.held !== undefined) {
    set("D", d.held);
    set("EN", 1);
    sim.settle();
    sim.clockCycle("CLK");
  }
  for (const [n, v] of Object.entries(d.inputs)) set(n, v);
  sim.settle();
  if (d.held !== undefined) sim.clockCycle("CLK");
  const out = lc.outputs[0]?.name === "Q" || d.held !== undefined ? "Q" : lc.outputs[0]?.name;
  return bitOf(sim.read(out === "SUM" || out === "Y" ? out : (lc.outputs[0]?.name ?? "Q")), 0);
}

describe("the bits of the parts that never open", () => {
  it("classifies the parts a trace meets", () => {
    expect(bitPartOf(c, "datapath/pc")).toMatchObject({
      bit: "registerReset",
      width: 64,
      module: 5,
    });
    expect(bitPartOf(c, "datapath/registers")).toMatchObject({
      bit: "registerFile",
      choices: 16,
      module: 6,
    });
    expect(bitPartOf(c, "port/memory")).toMatchObject({ bit: "ram", width: 8, module: 6 });
    expect(bitPartOf(c, "datapath/cregs/c2")).toMatchObject({ bit: "register", width: 64 });
    expect(bitPartOf(c, "control/controller/state/register")).toMatchObject({
      bit: "register",
      width: 3,
    });
    expect(bitPartOf(c, "datapath/yWord/pickSet")).toMatchObject({ bit: "selector" });
    expect(bitPartOf(c, "datapath/next/target")).toMatchObject({ bit: "adder" });
    expect(bitPartOf(c, "datapath/digits")).toMatchObject({ bit: "wiring" });
    expect(bitPartOf(c, "datapath/alu")).toBeUndefined();
  });

  const registers = [
    "datapath/pc",
    "datapath/ir",
    "datapath/heldR",
    "datapath/heldM",
    "datapath/cregs/c0",
    "datapath/cregs/c2",
    "datapath/cregs/c3",
    "control/controller/state/register",
  ];
  it("gives, for a register's bit, what the register holds after the next edge", () => {
    let checked = 0;
    for (let f = 0; f + 1 < run.frames.length; f++)
      for (const path of registers) {
        const part = bitPartOf(c, path)!;
        const outNet =
          c.composites.find((x) => x.path === path)?.outputs["Q"] ??
          c.components.find((x) => x.path === path)?.outputs["Q0"];
        for (const k of [0, 1, 2]) {
          const d = bitDrive(c, run.frames[f]!, part, k)!;
          const next = bitOf(run.frames[f + 1]![outNet!], k);
          if (d.result === undefined || next === undefined) continue;
          expect(d.result, `${path} bit ${k} at frame ${f}`).toBe(next);
          checked++;
        }
      }
    expect(checked).toBeGreaterThan(1000);
  });

  it("gives the register file's and the RAM's bits after the next edge", () => {
    const file = bitPartOf(c, "datapath/registers")!;
    const ram = bitPartOf(c, "port/memory")!;
    let written = 0;
    for (let f = 0; f + 1 < run.frames.length; f++) {
      const after = registersOf(c, run.frames[f + 1]!);
      for (const r of [1, 2, 3, 5, 7, 15])
        for (const k of [0, 3, 63]) {
          const d = bitDrive(c, run.frames[f]!, file, k, r)!;
          const next = after[r] === undefined ? undefined : Number((after[r]! >> BigInt(k)) & 1n);
          if (d.inputs["EN"] === 1) written++;
          if (d.result !== undefined && next !== undefined) expect(d.result).toBe(next);
        }
      const bytes = ramBytesOf(c, run.frames[f + 1]!)!;
      for (const offset of [0, 1, 2, 8, 9, 11])
        for (const k of [0, 7]) {
          const d = bitDrive(c, run.frames[f]!, ram, k, offset)!;
          if (d.inputs["EN"] === 1) written++;
          const b = bytes[offset];
          if (d.result !== undefined && b !== undefined) expect(d.result).toBe((b >> k) & 1);
        }
    }
    expect(written).toBeGreaterThan(20);
  });

  it("gives a selector's and an adder's bit as their word gives it now", () => {
    for (const f of [10, 28, 47, 58])
      for (const [path, out] of [
        ["datapath/yWord/pickSet", "y"],
        ["datapath/pickB", "Y"],
        ["datapath/pickA", "Y"],
        ["datapath/next/target", "SUM"],
        ["datapath/next/plus4", "SUM"],
      ] as const) {
        const part = bitPartOf(c, path)!;
        const net =
          c.components.find((x) => x.path === path)?.outputs[out] ??
          c.composites.find((x) => x.path === path)?.outputs[out];
        for (const k of [0, 2, 5]) {
          const d = bitDrive(c, run.frames[f]!, part, k)!;
          const now = bitOf(run.frames[f]![net!], k);
          if (now !== undefined && d.result !== undefined)
            expect(d.result, `${path} ${k}`).toBe(now);
        }
      }
  });

  it("runs the library's drawing of the bit to the same result", () => {
    for (const f of [7, 10, 28, 40, 47])
      for (const path of [
        "datapath/pc",
        "datapath/heldR",
        "datapath/yWord/pickSet",
        "datapath/next/target",
      ]) {
        const part = bitPartOf(c, path)!;
        for (const k of [0, 2, 3]) {
          const d = bitDrive(c, run.frames[f]!, part, k)!;
          if (Object.values(d.inputs).some((v) => v === undefined) || d.result === undefined)
            continue;
          expect(simulated(d), `${path} bit ${k} at frame ${f}`).toBe(d.result);
        }
      }
  });
});
