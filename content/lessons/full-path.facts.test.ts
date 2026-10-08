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

  it("makes A7345000 of the set if, with its signals, in four edges", () => {
    expect(word("R5 <= R3 >= R4 signed")).toBe("A7345000");
    // After 25 edges the next fetches it; the IR still holds R4 <= 100's word.
    expect([state(run, 25), at(run, 25, "PC"), at(run, 25, "IR")]).toEqual([
      "FETCH",
      "18",
      "25004064",
    ]);
    expect(levelsAnswer(run, 25, "net", "IR", "word")).toBe("A7345000");
    expect([at(run, 26, "OP2"), at(run, 26, "OP1"), at(run, 26, "OP0")]).toEqual(["0", "1", "1"]);
    expect([at(run, 26, "WRITEY"), at(run, 26, "SET")]).toEqual(["1", "1"]);
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

  it("works out the store to the lamps, edges 38 to 41", () => {
    expect(word("word[lamps] <= R5")).toBe("480507C8");
    expect(at(run, 38, "IR")).toBe("480507C8");
    expect([38, 39, 40, 41].map((e) => state(run, e - 1))).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "MEMORY",
    ]);
    expect(at(run, 39, "HB")).toBe("0");
    expect([at(run, 39, "OP2"), at(run, 39, "OP1"), at(run, 39, "OP0")]).toEqual(["0", "1", "0"]);
    expect(at(run, 40, "HR")).toBe("7C8");
    expect([at(run, 40, "ADDR"), at(run, 40, "MSTORE"), at(run, 40, "PCEN")]).toEqual([
      "7C8",
      "1",
      "1",
    ]);
    expect(at(run, 41, "PC")).toBe("28");
    expect(datapathState(run.circuit, run.frames[41]!).lamps).toBe(0);
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
    expect(word("R5 <= R3 < R4 signed")).toBe(answer("code"));
    // The line asked about is in a program no figure runs.
    const own = recordRun({ libraryId: "machine-final", program: PATH_PROGRAM, inputs: {} });
    const s = own.steps.find((x) => x.text === "R7 <= R5 | R6")!;
    expect(s.pc).toBe(0x1cn);
    expect(String(s.last - s.first)).toBe(answer("edges"));
    // Its ALU edge is its third: OP2 OP1 OP0 100, OR.
    expect(state(own, s.first + 2)).toBe("ALU");
    expect([
      at(own, s.first + 2, "OP2"),
      at(own, s.first + 2, "OP1"),
      at(own, s.first + 2, "OP0"),
    ]).toEqual(["1", "0", "0"]);
    expect(answer("job")).toBe("or");
    expect(state(own, s.first + 3)).toBe("WRITE");
    expect(BigInt(`0x${at(own, s.first + 3, "YIN")}`).toString()).toBe(answer("yin"));
    expect(at(own, s.last, "PC").padStart(3, "0")).toBe(answer("pc"));
    for (const sec of fullPath.sections)
      for (const i of sec.interactives ?? [])
        expect((i.props as { program?: string }).program).not.toBe(PATH_PROGRAM);
  });
});
