// Copyright © 2026 Christopher Snow

// The numbers lesson full-path states, read off the final machine's run of the shop's program:
// the set if's word, the system call at every level, the store worked out, the broken signals,
// and the challenge's line.

import { describe, expect, it } from "vitest";

import {
  MODULE_13_ASSEMBLY,
  assemble,
  datapathState,
  edgeView,
  netWord,
  recordRun,
  stuckAt,
  type RecordedRun,
} from "@dd/dd-model";
import { parseLesson } from "@platform/lesson-schema";
import { MACHINE13_STRINGS, compareText, levelsAnswer } from "@dd/dd-views";
import type { Word } from "@dd/sim";

import { PATH_ANSWERS, PATH_PROGRAM, fullPath } from "./full-path";
import { SHOP, SHOP_INPUTS } from "./module13";

const hex = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? w.value.toString(16).toUpperCase() : "X";
const run = recordRun({ libraryId: "machine-final", program: SHOP, inputs: SHOP_INPUTS });
const at = (r: RecordedRun, frame: number, name: string) =>
  hex(netWord(r.circuit, r.frames[frame] ?? [], name));
const state = (r: RecordedRun, frame: number) => edgeView(r.circuit, r.frames[frame] ?? []).state;
const word = (line: string) =>
  (assemble(line, MODULE_13_ASSEMBLY).lines[0]!.instruction! >>> 0).toString(16).toUpperCase();
const answer = (id: string) => PATH_ANSWERS.find((a) => a.id === id)?.value;

describe("lesson full-path's facts", () => {
  it("stops at 030 after 69 edges, the display at 66 and the lamps at 000", () => {
    expect(run.frames.length - 1).toBe(69);
    const end = datapathState(run.circuit, run.frames[69]!);
    expect([end.pc, end.display, end.lamps]).toEqual([0x30n, 66n, 0]);
  });

  it("makes A7345000 of the set if, in four edges", () => {
    expect(word("R5 <= R3 >= R4 signed")).toBe("A7345000");
    // After 25 edges the next fetches it; the IR still holds R4 <= 100's word.
    expect([state(run, 25), at(run, 25, "PC"), at(run, 25, "IR")]).toEqual([
      "FETCH",
      "18",
      "25004064",
    ]);
    expect(levelsAnswer(run, 25, "net", "IR", "word")).toBe("A7345000");
    expect([26, 27, 28, 29].map((e) => state(run, e - 1))).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "WRITE",
    ]);
    expect(word("R5 <= R3 >= R5 signed")).not.toBe("A7435000");
    expect(word("R5 <= R4 >= R3 signed")).toBe("A7435000");
  });

  it("follows the system call at every level, edges 57 and 58", () => {
    expect(at(run, 57, "IR")).toBe("80000000");
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
    expect(state(run, 58)).toBe("FETCH");
  });

  it("states the motivation's subtraction: 13123000, OP 011, WRITEY 1, SET 0, four edges", () => {
    expect(word("R3 <= R1 - R2")).toBe("13123000");
    const step = run.steps.find((x) => x.text === "R3 <= R1 - R2")!;
    const fetched = step.first + 1;
    expect(at(run, fetched, "IR")).toBe("13123000");
    expect(["OP2", "OP1", "OP0", "WRITEY", "SET"].map((n) => at(run, fetched, n))).toEqual([
      "0",
      "1",
      "1",
      "1",
      "0",
    ]);
    expect(
      Array.from({ length: step.last - step.first }, (_, i) => state(run, step.first + i)),
    ).toEqual(["FETCH", "READ", "ALU", "WRITE"]);
  });

  it("works out the handler's store to the display, edges 59 to 62", () => {
    expect(word("word[display] <= R2")).toBe("480207C0");
    expect(at(run, 59, "IR")).toBe("480207C0");
    // The figure pauses before edge 57, the call's FETCH edge, where no wire of any width holds
    // the store's word: from the next frame MQ and the ROM's reads do, then FETCHED.
    const figures = parseLesson(fullPath).sections.flatMap((s) => s.interactives ?? []);
    const props = (id: string) =>
      figures.find((i) => i.id === id)!.props as {
        start: number;
        holdRom?: { line: string; fetch: number };
      };
    const start = props("path-store").start;
    expect(start).toBe(56);
    expect(state(run, start)).toBe("FETCH");
    const holding = (frame: number) =>
      run.frames[frame]!.flatMap((w, n) =>
        w.known === (1n << BigInt(w.width)) - 1n &&
        w.value.toString(16).toUpperCase().includes("480207C0")
          ? [run.circuit.nets[n]!.name]
          : [],
      );
    expect(holding(start)).toEqual([]);
    expect(holding(start + 1)).toContain("MQ");
    expect(at(run, start + 2, "FETCHED")).toBe("480207C0");
    // At frame 58, where the investigation's lead ends and the PC is at the store, both figures'
    // ROM row keeps the word back until the store's FETCH edge, 59.
    const store = run.program.lines.find((l) => l.address === 0x44)!;
    for (const id of ["path-call", "path-store"])
      expect(props(id).holdRom, id).toEqual({ line: store.text, fetch: 59 });
    expect([state(run, 58), at(run, 58, "PC")]).toEqual(["FETCH", "44"]);
    expect([59, 60, 61, 62].map((e) => state(run, e - 1))).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "MEMORY",
    ]);
    expect(at(run, 60, "HB")).toBe("42");
    expect([at(run, 60, "OP2"), at(run, 60, "OP1"), at(run, 60, "OP0")]).toEqual(["0", "1", "0"]);
    expect(at(run, 61, "HR")).toBe("7C0");
    expect([at(run, 61, "ADDR"), at(run, 61, "MSTORE"), at(run, 61, "PCEN")]).toEqual([
      "7C0",
      "1",
      "1",
    ]);
    expect(at(run, 62, "PC")).toBe("48");
    expect(datapathState(run.circuit, run.frames[61]!).display).toBe(0n);
    expect(datapathState(run.circuit, run.frames[62]!).display).toBe(66n);
  });

  describe("the broken signals", () => {
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
    const said = (r: RecordedRun) => compareText(MACHINE13_STRINGS, r, r.frames.length - 1);

    it("BCONST at 1: R3 is -184 after R3 <= R1 - R2; the run stops showing 0", () => {
      const r = broken("control/BCONST", 1);
      expect(said(r)).toBe(
        "After `R3 <= R1 - R2` at `010`, R3 is -184 on the machine and 66 by the model.",
      );
      expect(r.stopped?.reason).toEqual({ kind: "stop" });
      expect(datapathState(r.circuit, r.frames.at(-1)!).display).toBe(0n);
    });

    it("SET at 0: the set if is refused (21), the PC is 044 not 01C, and the run is cut off", () => {
      const r = broken("control/SET", 0);
      expect(said(r)).toBe(
        "After `R5 <= R3 >= R4 signed` at `018`, the PC is 044 on the machine and 01C by the model.",
      );
      expect(r.steps.find((s) => s.trap !== undefined)?.trap).toBe(0x21);
      expect(r.cutOff).toBe(true);
      expect(r.frames.length - 1).toBe(300);
      expect(BigInt.asIntN(64, datapathState(r.circuit, r.frames.at(-1)!).display!)).toBe(-250n);
    });
  });

  it("answers the challenge", () => {
    expect(word("R9 <= R2 >= R7 unsigned")).toBe(answer("code"));
    // The line asked about is in a program no figure runs.
    const own = recordRun({ libraryId: "machine-final", program: PATH_PROGRAM, inputs: {} });
    const s = own.steps.find((x) => x.text === "R4 <= word[R2]")!;
    expect(s.pc).toBe(0x1cn);
    expect(String(s.last - s.first)).toBe(answer("edges"));
    // Its ALU edge is its third: OP2 OP1 OP0 010, add, for the address R2 + 0.
    expect(state(own, s.first + 2)).toBe("ALU");
    expect([
      at(own, s.first + 2, "OP2"),
      at(own, s.first + 2, "OP1"),
      at(own, s.first + 2, "OP0"),
    ]).toEqual(["0", "1", "0"]);
    expect(answer("job")).toBe("add");
    // Y takes the word the load fetched, 25, not the ALU's address.
    expect(state(own, s.first + 4)).toBe("WRITE");
    expect(BigInt(`0x${at(own, s.first + 4, "YIN")}`).toString()).toBe(answer("yin"));
    expect(at(own, s.last, "PC").padStart(3, "0")).toBe(answer("pc"));
    for (const sec of fullPath.sections)
      for (const i of sec.interactives ?? [])
        expect((i.props as { program?: string }).program).not.toBe(PATH_PROGRAM);
  });
});
