// Copyright © 2026 Christopher Snow

// The numbers lesson whole-machine states, read off the final machine: the shop's program edge by
// edge, the joins its words cross, the call through a register, and the three broken joins.

import { describe, expect, it } from "vitest";

import {
  edgeUses,
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
import { PROSE } from "./whole-machine.prose";
import { EDGES_PROGRAM, JOIN_ANSWERS, wholeMachine } from "./whole-machine";

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
    const made = (path: string) => makerText(t, kind(path), path)?.replace(/\[draft\] /g, "");
    expect(made("control")).toBe("Module 9, grown in 10 and 12");
    expect(made("datapath")).toBe("Module 8, grown in 9, 10 and 12");
    expect(made("port")).toBe("Module 9, grown in 12");
    expect(made("datapath/registers")).toBe("Module 6");
    expect(made("datapath/alu")).toBe("Module 7");
    // The PC: Module 8 introduced it, though its kind of register is Module 5's.
    expect(made("datapath/pc")).toBe("Module 8");
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
    const answer = (id: string) => JOIN_ANSWERS.find((a) => a.id === id)?.value;
    // The part inside the datapath or the control unit at each bus's end: the drawing opened.
    const inside = (bus: string, end: "inputs" | "outputs", block = "(control|datapath)") => {
      const net = top.nets.find((n) => n.name === bus)?.id ?? -1;
      return top.composites
        .filter((c) => c.path.split("/").length === 2 && new RegExp(`^${block}/`).test(c.path))
        .filter((c) => Object.values(c[end]).includes(net))
        .map((c) => c.name);
    };
    expect(inside("HB", "outputs")).toEqual([answer("hb")]);
    expect(inside("IR", "inputs", "control")).toEqual([answer("irIn")]);
    expect(inside("WAITING", "inputs")).toEqual([answer("waiting")]);
    expect(inside("STATUS", "outputs")).toEqual([answer("status")]);
    // The two ends the page leaves to the drawing: no section's words, and no hint but the last,
    // name the part that drives HB or the part inside the control unit that takes IR.
    const words = [
      ...wholeMachine.sections.flatMap((s) => [
        s.prose,
        ...(s.interactives ?? []).flatMap((i) => [i.lead ?? "", i.caption ?? ""]),
      ]),
      ...Object.values(PROSE as Readonly<Record<string, unknown>>).filter(
        (v): v is string => typeof v === "string",
      ),
      ...PROSE.c1Hints.slice(0, -1),
    ].join("\n");
    for (const id of ["hb", "irIn"]) expect(words, id).not.toContain(`\`${answer(id)}\``);
    expect(words).not.toMatch(/\bhold\b[^.]*\bHB\b|\bHB\b[^.]*\bhold\b/);
    // The edges of a program no figure runs: resume's FETCH is edge 15, where the IR takes
    // 81000000; its WRITE edge, 17, gives the PC the return point, 010.
    const edges = recordRun({
      libraryId: "machine-final",
      program: EDGES_PROGRAM,
      inputs: SHOP_INPUTS,
    });
    expect(edges.steps.map((s) => s.last - s.first)).toEqual([4, 3, 5, 2, 3, 1]);
    expect(edges.steps[3]?.trap).toBe(0x41);
    expect([state(edges, 14), at(edges, 15, "IR")]).toEqual(["FETCH", "81000000"]);
    expect(answer("irEdge")).toBe("15");
    expect([state(edges, 16), at(edges, 17, "PC")]).toEqual(["WRITE", "10"]);
    expect(answer("pcEdge")).toBe("17");
    // No figure runs it.
    for (const s of wholeMachine.sections)
      for (const i of s.interactives ?? [])
        expect((i.props as { program?: string }).program).not.toBe(EDGES_PROGRAM);
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

  it("marks the joins each edge of the load uses, at the top level", () => {
    // The joins the drawing marks before each edge of `R1 <= word[sensorA]`, edges 8 to 12: the
    // wires the edge uses, back from what it writes along each selector's chosen input.
    const c = run.circuit;
    const top = new Set<number>([...c.inputs, ...c.outputs].map((p) => p.net));
    for (const b of c.composites)
      if (!b.path.includes("/"))
        for (const n of [...Object.values(b.inputs), ...Object.values(b.outputs)]) top.add(n);
    const marked = (frame: number) => {
      const used = edgeUses(c, run.frames[frame] ?? []);
      return [...top]
        .filter((n) => used.has(n))
        .map((n) => c.nets[n]!.name)
        .sort();
    };
    expect([7, 8, 9, 10, 11].map(marked)).toEqual([
      ["ADDR", "FETCHED"],
      ["IR"],
      ["CONTROL", "IR"],
      ["ADDR", "MQ", "SENSORA"],
      [],
    ]);
  });

  it("states the machine's sizes and sources as the motivation and generalisation do", () => {
    const c = libraryCircuit("machine-final");
    const block = (path: string) => c.composites.find((b) => b.path === path)!;
    // The word register Y takes has five sources, MET the fifth, chosen by SET.
    const y = Object.keys(block("datapath/yWord").inputs);
    for (const source of ["HR", "HM", "PC4", "CWORD", "MET", "SET"]) expect(y).toContain(source);
    expect(PROSE.motivation).toContain("fifth source");
    // Sixteen registers of 64 bits: a 4-bit write address and 64-bit words.
    const regs = block("datapath/registers");
    expect([c.nets[regs.inputs["WA"]!]!.width, c.nets[regs.inputs["D"]!]!.width]).toEqual([4, 64]);
    expect(PROSE.motivation).toContain("sixteen registers of 64 bits");
    // Eight buses between the CPU and the memory port: three out, five back.
    const port = block("port");
    const cpu = ["control", "datapath"].map(block);
    const drives = (net: number) => cpu.some((b) => Object.values(b.outputs).includes(net));
    const reads = (net: number) => cpu.some((b) => Object.values(b.inputs).includes(net));
    const out = Object.entries(port.inputs)
      .filter(([, n]) => drives(n))
      .map(([k]) => k);
    const back = Object.entries(port.outputs)
      .filter(([, n]) => reads(n))
      .map(([k]) => k);
    expect(out.sort()).toEqual(["ADDR", "CONTROL", "D"]);
    expect(back.sort()).toEqual(["CAUSEF", "CAUSEM", "FETCHED", "MQ", "WAITING"]);
    expect(PROSE.generalisation).toContain("Here there are eight");
  });
});
