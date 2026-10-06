// Copyright © 2026 Christopher Snow

// Facts Module 8's focused figures show and the prose states, read off the same functions the
// figures read: the instruction's fields, the widen block's output, a run of the datapath edge by
// edge, the memory's verdicts, and where a run of the reference went from each line.

import { describe, expect, it } from "vitest";

import {
  accessVerdict,
  buildDatapath,
  instructionFields,
  instructionWord,
  memoryMapParts,
  programFlow,
  startDatapath,
  widening,
} from "@dd/dd-model";
import { valueLabel } from "@dd/dd-views";

import { CALL, SUM } from "./branches";
import { MARGIN } from "./fetch";

describe("facts for Module 8's focused figures", () => {
  it("the fields of 13123000: K 1, J 3, A R1, B R2, Y R3, C 000", () => {
    const f = instructionFields(instructionWord("R3 <= R1 - R2"));
    expect(f.map((x) => [x.name, x.hi, x.lo, x.digits, x.bits])).toEqual([
      ["K", 31, 28, "1", "0001"],
      ["J", 27, 24, "3", "0011"],
      ["A", 23, 20, "1", "0001"],
      ["B", 19, 16, "2", "0010"],
      ["Y", 15, 12, "3", "0011"],
      ["C", 11, 0, "000", "000000000000"],
    ]);
  });

  it("the widening, simulated: 064 is 100, F9C is -100, 7FF is 2047, 800 is -2048", () => {
    const w = (c: number) => widening(c);
    expect([w(0x064).w, w(0x064).wSigned]).toEqual([0x64n, 100n]);
    expect([w(0xf9c).w, w(0xf9c).wSigned, w(0xf9c).cSigned]).toEqual([
      0xffffffffffffff9cn,
      -100n,
      -100,
    ]);
    expect([w(0x7ff).wSigned, w(0x800).wSigned, w(0x800).w]).toEqual([
      2047n,
      -2048n,
      0xfffffffffffff800n,
    ]);
  });

  it("the margin program edge by edge: PC, IR and RESULT before each edge, WREG 0 at the stop", () => {
    const built = buildDatapath({ libraryId: "datapath-fetch", program: MARGIN });
    const sim = startDatapath(built);
    const read = (n: string) => sim.read(n);
    const seen: string[][] = [];
    for (let k = 0; k < 5; k++) {
      const r = read("RESULT");
      const signed = r.value >= 1n << 63n ? r.value - (1n << 64n) : r.value;
      seen.push([
        valueLabel(read("PC")).slice(-3),
        valueLabel(read("IR")),
        r.known === (1n << 64n) - 1n ? signed.toString() : "X",
        valueLabel(read("WREG")),
      ]);
      sim.clockCycle("CLK");
    }
    expect(seen).toEqual([
      ["000", "25001F48", "-184", "1"],
      ["004", "25002F06", "-250", "1"],
      ["008", "13123000", "66", "1"],
      ["00C", "12334000", "132", "1"],
      ["010", "84000000", "X", "0"],
    ]);
  });

  it("the memory map: ten parts, and the machine's verdict for each access", () => {
    const parts = memoryMapParts();
    expect(parts.map((p) => p.part)).toEqual([
      "rom",
      "ram",
      "display",
      "lamps",
      "signals",
      "sensorA",
      "sensorB",
      "timer",
      "waiting",
      "none",
    ]);
    const row = (name: string) => {
      const p = parts.find((x) => x.part === name)!;
      return (["load-word", "load-byte", "store-word", "store-byte"] as const).map((a) =>
        accessVerdict(p, a).toString(16),
      );
    };
    expect(row("rom")).toEqual(["0", "0", "34", "34"]);
    expect(row("ram")).toEqual(["0", "0", "0", "0"]);
    expect(row("display")).toEqual(["0", "33", "0", "33"]);
    expect(row("sensorA")).toEqual(["0", "33", "34", "33"]);
    expect(row("timer")).toEqual(["0", "33", "0", "33"]);
    expect(row("none")).toEqual(["31", "31", "31", "31"]);
  });

  it("the loop went back to 00C 4 times; the call to 018, the loop twice, the jump back to 010", () => {
    const went = (source: string, at: number) =>
      programFlow(source).find((l) => l.address === at)?.went;
    expect(went(SUM, 0x14)).toEqual([
      { to: 0x0c, times: 4 },
      { to: 0x18, times: 1 },
    ]);
    expect(went(CALL, 0x0c)).toEqual([{ to: 0x18, times: 1 }]);
    expect(went(CALL, 0x20)).toEqual([
      { to: 0x18, times: 2 },
      { to: 0x24, times: 1 },
    ]);
    expect(went(CALL, 0x24)).toEqual([{ to: 0x10, times: 1 }]);
  });
});
