// Copyright © 2026 Christopher Snow

// The numbers lesson tracing states, read off the final machine's run of the shop's program: the
// ALU's subtraction traced to one gate, HR's bit 1, the PC's bit 3 through the call's WRITE edge,
// the wire held at 0 in the ALU, and the challenge's five bits.

import { describe, expect, it } from "vitest";

import { parseLesson } from "@platform/lesson-schema";

import {
  bitDrive,
  bitPartOf,
  edgeView,
  libraryCircuit,
  netWord,
  recordRun,
  stuckAt,
  type RecordedRun,
} from "@dd/dd-model";
import {
  MACHINE13_STRINGS,
  compareText,
  gradeAnswers,
  levelsAnswer,
  makerText,
} from "@dd/dd-views";
import type { Word } from "@dd/sim";

import { SHOP, SHOP_INPUTS } from "./module13";
import { TRACE_ANSWERS, tracing } from "./tracing";

const run = recordRun({ libraryId: "machine-final", program: SHOP, inputs: SHOP_INPUTS });
const c = run.circuit;
const hex = (w: Word | undefined) =>
  w && w.known === (1n << BigInt(w.width)) - 1n ? w.value.toString(16).toUpperCase() : "X";
const at = (frame: number, name: string) => hex(netWord(c, run.frames[frame] ?? [], name));
const state = (frame: number) => edgeView(c, run.frames[frame] ?? []).state;
const drive = (frame: number, path: string, k: number, index = 0) =>
  bitDrive(c, run.frames[frame]!, bitPartOf(c, path)!, k, index)!;
const answer = (id: string) => TRACE_ANSWERS.find((a) => a.id === id)?.value;

describe("lesson tracing's facts", () => {
  it("pauses before edge 28, the set if's ALU edge: 66 minus 100, HR holding 100", () => {
    expect([state(27), at(27, "PC")]).toEqual(["ALU", "18"]);
    expect([at(27, "HA"), at(27, "HB"), at(27, "HR")]).toEqual(["42", "64", "64"]);
    expect(at(27, "RESULT")).toBe("FFFFFFFFFFFFFFDE");
  });

  it("predicts bit 1 of HR after the edge: 1, as Module 5's register bit shows it", () => {
    expect(levelsAnswer(run, 27, "net", "HR", "word", 1)).toBe("1");
    expect(drive(27, "datapath/heldR", 1)).toMatchObject({
      inputs: { D: 1, EN: 1 },
      held: 0,
      result: 1,
      module: 5,
    });
  });

  it("traces bit 1 of the result through six levels to the half adder's XOR gate", () => {
    const made = (path: string) =>
      makerText(MACHINE13_STRINGS, c.composites.find((x) => x.path === path)?.kind ?? "");
    expect(made("datapath")).toBe("Module 8, grown in 9, 10 and 12");
    expect(made("datapath/alu")).toBe("Module 7");
    expect(made("datapath/alu/g0")).toBe("Module 7");
    expect(made("datapath/alu/g0/q0")).toBe("Module 7");
    expect(made("datapath/alu/g0/q0/bit1")).toBe("Module 7");
    expect(made("datapath/alu/g0/q0/bit1/fa")).toBe("Module 3");
    expect(made("datapath/alu/g0/q0/bit1/fa/ha2")).toBe("Module 3");
    expect(at(27, "datapath/alu/g0/q0/bit1/SUM")).toBe("1");
    const xor = c.components.find((x) => x.path === "datapath/alu/g0/q0/bit1/fa/ha2/xorSum")!;
    expect(xor.kind).toBe("xor");
    expect(hex(run.frames[27]![Object.values(xor.outputs)[0]!])).toBe("1");
    // Bit 6 of the word is bit2 in the group q1.
    expect(
      libraryCircuit("machine-final").composites.some((x) => x.path === "datapath/alu/g0/q1/bit2"),
    ).toBe(true);
  });

  it("traces the PC's bit 3 through the call's WRITE edge back to the ALU", () => {
    expect([state(47), at(47, "PC"), at(48, "PC")]).toEqual(["WRITE", "2C", "34"]);
    expect(drive(47, "datapath/pc", 3)).toMatchObject({
      libraryId: "keep-clear-bit",
      inputs: { D: 0, EN: 1, RST: 0 },
      held: 1,
      result: 0,
    });
    expect([at(47, "TRAP"), at(47, "RESUME"), at(47, "JUMP")]).toEqual(["0", "0", "1"]);
    expect(drive(47, "datapath/nextTrap/pickTrap", 3).inputs.S).toBe(0);
    expect(drive(47, "datapath/nextTrap/pickResume", 3).inputs.S).toBe(0);
    expect(drive(47, "datapath/next/pickJump", 3).inputs.S).toBe(1);
    expect(at(47, "RESULT")).toBe("34");
  });

  it("finds the carry held at 0 between the ALU's first two groups of four: R3 is 50, not 66", () => {
    const r: RecordedRun = recordRun(
      {
        libraryId: "machine-final",
        program: SHOP,
        inputs: SHOP_INPUTS,
        fault: stuckAt("datapath/alu/g0/C4", 0),
      },
      300,
    );
    expect(compareText(MACHINE13_STRINGS, r, r.frames.length - 1)).toBe(
      "After `R3 <= R1 - R2` at `010`, R3 is 50 on the machine and 66 by the model.",
    );
    // Off Module 0's path: its stuck wire was SUM in the slice for bit 1.
    expect("datapath/alu/g0/C4").not.toContain("bit1");
  });

  it("answers the four traces, each a row of bits", () => {
    const bits = (frame: number, nets: readonly string[]) => nets.map((n) => at(frame, n)).join("");
    const fa = (k: number) => {
      const out = c.composites.find((x) => x.path === `datapath/alu/g0/q0/bit${k}/fa`)!.outputs[
        "COUT"
      ]!;
      return c.nets[out]!.name;
    };
    // R3 <= R1 - R2's ALU edge is edge 20: the frame before it is 19. B is R2, -250: its bits 3 to
    // 0 are 0110, which the XORs turn over for the subtraction.
    expect(state(19)).toBe("ALU");
    expect(
      bits(
        19,
        [3, 2, 1, 0].map((k) => `datapath/alu/g0/q0/bit${k}/BX`),
      ),
    ).toBe(answer("xorB"));
    // The carries are asked at another line's ALU edge, the set if's, edge 28 (frame 27): the
    // failure experiment's held carry, at R3 <= R1 - R2, gives none of them away.
    expect(state(27)).toBe("ALU");
    expect(bits(27, [3, 2, 1, 0].map(fa))).toBe(answer("carry"));
    // goto R15's last edge, its ALU edge, is edge 68: the PC takes 030. The construction traces the
    // PC at another edge, the call's WRITE edge.
    expect([state(67), at(67, "PC"), at(68, "PC")]).toEqual(["ALU", "40", "30"]);
    expect([5, 4, 3, 2].map((k) => String(drive(67, "datapath/pc", k).inputs.D)).join("")).toBe(
      answer("pcD"),
    );
    // The set if's WRITE edge: only the register Y names, R5, is enabled.
    expect(state(28)).toBe("WRITE");
    expect(
      [7, 6, 5, 4, 3, 2, 1, 0]
        .map((r) => String(drive(28, "datapath/registers", 0, r).inputs.EN))
        .join(""),
    ).toBe(answer("en"));
  });

  it("builds its last hint from the answers, and the hint's answers pass the challenge", () => {
    const ch = parseLesson(tracing).challenges[0]!;
    const hint = ch.hints.at(-1)!;
    for (const a of TRACE_ANSWERS) expect(hint).toContain(a.value);
    const answers = Object.fromEntries(TRACE_ANSWERS.map((a) => [a.id, a.value]));
    expect(gradeAnswers(ch, { answers }).passed).toBe(true);
  });
});
