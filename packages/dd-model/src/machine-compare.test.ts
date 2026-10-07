// Copyright © 2026 Christopher Snow

// Module 10, lesson 1: the two machines side by side agree after every instruction, differ while
// Module 9's runs the middle of one only in what it keeps of its own, and part when a fault breaks
// the agreement.

import { describe, expect, it } from "vitest";

import { stuckAt } from "./faults";
import {
  edgePair,
  instructionPair,
  machineParts,
  pairView,
  runPair,
  startPair,
} from "./machine-compare";

const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`;
const ROOMS = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;

describe("two machines, one program", () => {
  it("agree after every instruction, each in its own count of edges", () => {
    const pair = startPair(COLDER, ROOMS);
    runPair(pair);
    expect(pair.log.map((l) => [l.address, l.edges, l.differ.length, l.stops])).toEqual([
      [0x000, 5, 0, false],
      [0x004, 5, 0, false],
      [0x008, 3, 0, false],
      [0x00c, 4, 0, false],
      [0x010, 4, 0, false],
      [0x014, 1, 0, true],
    ]);
    const v = pairView(pair);
    expect(BigInt.asIntN(64, v.single.display ?? 0n)).toBe(-250n);
    expect(v.multi.display).toBe(v.single.display);
  });
  it("keep their seen state between the edges of one instruction", () => {
    const pair = startPair(COLDER, ROOMS);
    edgePair(pair);
    edgePair(pair);
    edgePair(pair);
    const v = pairView(pair);
    expect(v.own.state).toBe("MEMORY");
    expect(v.differ).toEqual([]);
    expect(v.multi.regs[2]).toBeUndefined();
    expect(v.own.hr).toBe(0x7d8n);
  });
  it("still agree with HOLDR stuck at 1, and part at once with PCEN stuck at 1", () => {
    const kept = startPair(COLDER, ROOMS, [stuckAt("control/HOLDR", 1)]);
    runPair(kept);
    expect(kept.log.every((l) => l.differ.length === 0)).toBe(true);
    const broken = startPair(COLDER, ROOMS, [stuckAt("control/PCEN", 1)]);
    instructionPair(broken);
    expect(broken.log[0]?.edges).toBe(1);
    expect(broken.log[0]?.differ).toContain("R2");
  });
});

describe("machineParts", () => {
  const rows = Object.fromEntries(machineParts().map((r) => [r.part, r]));

  it("both machines have sixteen 64-bit registers, a PC, the memory and the shop's devices", () => {
    for (const m of ["single", "multi"] as const) {
      expect(rows.registers?.[m]).toEqual({ kind: "registers", count: 16, width: 64 });
      expect(rows.pc?.[m]).toEqual({ kind: "register", width: 64 });
      expect(rows.memory?.[m]).toEqual({ kind: "memory" });
      expect(rows.devices?.[m]).toEqual({ kind: "devices", names: ["display", "lamps", "timer"] });
    }
  });

  it("Module 8's IR is the ROM's output; Module 9 keeps it, the held words and a state", () => {
    expect(rows.ir?.single).toEqual({ kind: "rom-output", width: 32 });
    expect(rows.ir?.multi).toEqual({ kind: "register", width: 32 });
    for (const p of ["ha", "hb", "hr", "hm"] as const) {
      expect(rows[p]?.single).toEqual({ kind: "none" });
      expect(rows[p]?.multi).toEqual({ kind: "register", width: 64 });
    }
    expect(rows.state?.single).toEqual({ kind: "none" });
    expect(rows.state?.multi).toEqual({ kind: "register", width: 3 });
  });
});
