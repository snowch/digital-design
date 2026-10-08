// Copyright © 2026 Christopher Snow

// The numbers lesson whole-machine states, read off the final machine: the shop's program edge by
// edge, the joins its words cross, the call through a register, and the three broken joins.

import { describe, expect, it } from "vitest";

import {
  datapathState,
  edgeView,
  libraryCircuit,
  netWord,
  recordRun,
  stuckAt,
  type RecordedRun,
} from "@dd/dd-model";
import { MACHINE13_STRINGS, compareText, makerText } from "@dd/dd-views";
import type { Word } from "@dd/sim";

import { SHOP, SHOP_INPUTS } from "./module13";
import { JOIN_ANSWERS } from "./whole-machine";

const hex = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? w.value.toString(16).toUpperCase() : "X";
const run = recordRun({ libraryId: "machine-final", program: SHOP, inputs: SHOP_INPUTS });
const at = (r: RecordedRun, frame: number, name: string) =>
  hex(netWord(r.circuit, r.frames[frame] ?? [], name));
const state = (r: RecordedRun, frame: number) => edgeView(r.circuit, r.frames[frame] ?? []).state;
const regs = (r: RecordedRun, frame: number) =>
  datapathState(r.circuit, r.frames[frame] ?? []).regs.map((v) =>
    v === undefined ? undefined : BigInt.asIntN(64, v),
  );

describe("lesson whole-machine's facts", () => {
  it("runs the shop's program in 69 edges, to its stop, showing 66 with CLASH off", () => {
    expect(run.frames.length - 1).toBe(69);
    expect(run.stopped?.reason).toEqual({ kind: "stop" });
    expect(run.difference).toBeUndefined();
    const end = datapathState(run.circuit, run.frames[69]!);
    expect([end.display, end.lamps]).toEqual([66n, 0]);
  });

  it("names each block's maker, as the table and the motivation say", () => {
    const t = MACHINE13_STRINGS;
    const kind = (path: string) =>
      libraryCircuit("machine-final").composites.find((c) => c.path === path)?.kind ?? "";
    const made = (path: string) => makerText(t, kind(path))?.replace(/\[draft\] /g, "");
    expect(made("control")).toBe("Module 9, grown in 10 and 12");
    expect(made("datapath")).toBe("Module 8, grown in 9, 10 and 12");
    expect(made("port")).toBe("Module 9, grown in 12");
    expect(made("datapath/registers")).toBe("Module 6");
    expect(made("datapath/alu")).toBe("Module 7");
    expect(made("datapath/pc")).toBe("Module 5");
    expect(made("datapath/ir")).toBe("Module 9");
    expect(made("datapath/cregs")).toBe("Module 12");
    expect(made("control/decoder")).toBe("Module 9, grown in 10");
    expect(made("control/controller")).toBe("Module 9, grown in 12");
    expect(made("control/trapLogic")).toBe("Module 12");
    expect(made("port/memory")).toBe("Module 6, grown in 8, 9 and 12");
  });

  it("predicts the call through a register: after edge 48 the PC is 034 and R15 is 030", () => {
    // After 47 edges the next is the WRITE edge of call R6, R15, at 02C.
    expect([state(run, 47), at(run, 47, "PC")]).toEqual(["WRITE", "2C"]);
    expect(regs(run, 47)[6]).toBe(0x34n);
    expect([at(run, 48, "PC"), regs(run, 48)[15]]).toEqual(["34", 0x30n]);
  });

  it("follows the system call across the joins, edges 57 to 62", () => {
    // Edge 57, FETCH: ADDR carries the PC, FETCHED brings 80000000, and the IR takes it.
    expect([state(run, 56), at(run, 56, "ADDR"), at(run, 56, "FETCHED")]).toEqual([
      "FETCH",
      "3C",
      "80000000",
    ]);
    expect(at(run, 57, "IR")).toBe("80000000");
    // Before edge 58, READ: TRAP is 1 and CAUSE is 41; at edge 58 the PC, C3 and C2 take theirs.
    expect([state(run, 57), at(run, 57, "TRAP"), at(run, 57, "CAUSE")]).toEqual([
      "READ",
      "1",
      "41",
    ]);
    expect([
      at(run, 58, "PC"),
      at(run, 58, "datapath/cregs/C3"),
      at(run, 58, "datapath/C2"),
    ]).toEqual(["44", "41", "40"]);
    // Edges 59 to 62, the handler's store: at its MEMORY edge ADDR carries the display's address.
    expect([59, 60, 61, 62].map((e) => state(run, e - 1))).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "MEMORY",
    ]);
    expect(at(run, 61, "ADDR")).toBe("7C0");
  });

  it("follows the load R1 <= word[sensorA] across five joins, edges 8 to 12", () => {
    expect([8, 9, 10, 11, 12].map((e) => state(run, e - 1))).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "MEMORY",
      "WRITE",
    ]);
    expect([at(run, 7, "FETCHING"), at(run, 7, "ADDR"), at(run, 7, "FETCHED")]).toEqual([
      "1",
      "8",
      "380017D8",
    ]);
    expect(at(run, 8, "IR")).toBe("380017D8");
    expect(at(run, 10, "HR")).toBe("7D8");
    expect([at(run, 10, "ADDR"), at(run, 10, "MLOAD"), at(run, 10, "HOLDM")]).toEqual([
      "7D8",
      "1",
      "1",
    ]);
    expect(BigInt.asIntN(64, BigInt(`0x${at(run, 10, "MQ")}`))).toBe(-184n);
    expect(at(run, 11, "WREG")).toBe("1");
    expect(regs(run, 12)[1]).toBe(-184n);
  });

  it("answers the challenge from the drawing and the timing diagram", () => {
    const top = libraryCircuit("machine-final");
    const driver = (bus: string) => {
      const net = top.nets.find((n) => n.name === bus)?.id;
      return top.composites.find(
        (c) => !c.path.includes("/") && Object.values(c.outputs).includes(net ?? -1),
      )?.path;
    };
    const answer = (id: string) => JOIN_ANSWERS.find((a) => a.id === id)?.value;
    expect(driver("HB")).toBe(answer("hb"));
    expect(driver("WAITING")).toBe(answer("waiting"));
    expect(driver("STATUS")).toBe(answer("status"));
    expect(driver("CAUSEM")).toBe(answer("causem"));
    // resume's FETCH is edge 63, where the IR takes 81000000; its WRITE edge, 65, takes C2.
    expect([state(run, 62), at(run, 62, "PC"), at(run, 63, "IR")]).toEqual([
      "FETCH",
      "48",
      "81000000",
    ]);
    expect(answer("irEdge")).toBe("63");
    expect([state(run, 64), at(run, 65, "PC")]).toEqual(["WRITE", "40"]);
    expect(answer("pcEdge")).toBe("65");
  });

  describe("the broken joins", () => {
    const broken = (net: string, value: 0 | 1) =>
      recordRun(
        {
          libraryId: "machine-final",
          program: SHOP,
          inputs: SHOP_INPUTS,
          fault: stuckAt(net, value),
        },
        300,
      );
    const said = (r: RecordedRun) =>
      compareText(MACHINE13_STRINGS, r, r.frames.length - 1).replace(/\[draft\] /g, "");

    it("MQ at 0: R1 is 0 after the first load, and the run stops showing 0", () => {
      const r = broken("MQ", 0);
      expect(said(r)).toContain("After `R1 <= word[sensorA]` at `008`, R1 is 0 on the machine");
      expect(said(r)).toContain("-184 by the model");
      expect(r.stopped?.reason).toEqual({ kind: "stop" });
      const end = datapathState(r.circuit, r.frames.at(-1)!);
      expect([end.display, end.lamps]).toEqual([0n, 0]);
    });

    it("NOHANDLER at 1: the machine halts at call system with cause 41", () => {
      const r = broken("NOHANDLER", 1);
      expect(r.stopped?.reason).toEqual({ kind: "trap", cause: 0x41 });
      expect(said(r)).toContain("At `call system` at `03C`");
      expect(said(r)).toContain("cause `41`");
    });

    it("CAUSE at 00: C2 takes 03C, not 040, C3 takes 00, and the run is cut off at 300", () => {
      const r = broken("CAUSE", 0);
      expect(said(r)).toContain("After `call system` at `03C`, C2 is 03C on the machine and 040");
      expect(r.cutOff).toBe(true);
      expect(r.frames.length - 1).toBe(300);
      const trap = r.steps.find((s) => s.text === "call system")!;
      expect(at(r, trap.last, "datapath/cregs/C3")).toBe("0");
      // resume goes back to call system, over and over.
      expect(r.steps.filter((s) => s.text === "call system").length).toBeGreaterThan(5);
    });
  });
});
