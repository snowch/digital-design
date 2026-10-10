// Copyright © 2026 Christopher Snow

// The numbers lesson tracing states, read off the final machine's run of the shop's program: the
// ALU's subtraction traced to one gate, HR's bit 1, the PC's bit 3 through the call's WRITE edge,
// the wire held at 0 in the ALU, and the challenge's four rows: each row's message names the row's
// own line, and no figure opens on an edge where a row's wires hold its answer.

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
  DEFAULT_VIEW_STRINGS,
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
const cout = (k: number) =>
  c.nets[c.composites.find((x) => x.path === `datapath/alu/g0/q0/bit${k}/fa`)!.outputs["COUT"]!]!
    .name;
/** A row the challenge asks for, read at a frame: the wires it names, highest first. */
const row = (id: string, frame: number): string => {
  const bits = (names: readonly string[]) => names.map((n) => at(frame, n)).join("");
  switch (id) {
    case "xorB":
      return bits([3, 2, 1, 0].map((k) => `datapath/alu/g0/q0/bit${k}/BX`));
    case "carry":
      return bits([3, 2, 1, 0].map(cout));
    case "pcD":
      return [5, 4, 3, 2].map((k) => String(drive(frame, "datapath/pc", k).inputs.D)).join("");
    default:
      return [7, 6, 5, 4, 3, 2, 1, 0]
        .map((r) => String(drive(frame, "datapath/registers", 0, r).inputs.EN))
        .join("");
  }
};
/** The line each row is read at. */
const ROW_LINES: Readonly<Record<string, string>> = {
  xorB: "R2 <= R3",
  carry: "R3 <= R1 - R2",
  pcD: "goto R15",
  en: "R5 <= R3 >= R4 signed",
};

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
    // R2 <= R3's ALU edge is edge 55: the frame before it is 54. The job is copy B, code 101, so
    // OP0 is 1 and each XOR turns B's bit over: B is R3, 66, whose bits 3 to 0 are 0010.
    expect([state(54), at(54, "OP0"), at(54, "HB")]).toEqual(["ALU", "1", "42"]);
    expect(row("xorB", 54)).toBe(answer("xorB"));
    // R3 <= R1 - R2's ALU edge is edge 20: A's bits 3 to 0 are 1000, B turned over 1001, plus 1.
    expect(state(19)).toBe("ALU");
    expect(row("carry", 19)).toBe(answer("carry"));
    // goto R15's last edge, its ALU edge, is edge 68: the PC takes 030. The construction traces the
    // PC at another edge, the call's WRITE edge.
    expect([state(67), at(67, "PC"), at(68, "PC")]).toEqual(["ALU", "40", "30"]);
    expect(row("pcD", 67)).toBe(answer("pcD"));
    // The set if's WRITE edge: only the register Y names, R5, is enabled.
    expect(state(28)).toBe("WRITE");
    expect(row("en", 28)).toBe(answer("en"));
  });

  it("builds its last hint from the answers, and the hint's answers pass the challenge", () => {
    const ch = parseLesson(tracing).challenges[0]!;
    const hint = ch.hints.at(-1)!;
    for (const a of TRACE_ANSWERS) expect(hint).toContain(a.value);
    const answers = Object.fromEntries(TRACE_ANSWERS.map((a) => [a.id, a.value]));
    expect(gradeAnswers(ch, { answers }).passed).toBe(true);
  });

  it("names each row's own line in its message, and in the task", () => {
    const task = parseLesson(tracing).challenges[0]!.task;
    for (const a of TRACE_ANSWERS) {
      const line = ROW_LINES[a.id]!;
      expect(DEFAULT_VIEW_STRINGS.answers.details[a.detail], a.id).toContain(`\`${line}\``);
      for (const other of Object.values(ROW_LINES))
        if (other !== line)
          expect(DEFAULT_VIEW_STRINGS.answers.details[a.detail], a.id).not.toContain(
            `\`${other}\``,
          );
      expect(task).toContain(`\`${line}\``);
    }
  });

  it("gives no two rows one answer", () => {
    const values = TRACE_ANSWERS.map((a) => a.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("opens no figure on an edge where a row's wires hold the row's answer", () => {
    const starts = parseLesson(tracing)
      .sections.flatMap((s) => s.interactives ?? [])
      .filter((i) => i.kind === "machine-levels")
      .map((i) => Number((i.props as { start?: number }).start ?? 0));
    expect(new Set(starts)).toEqual(new Set([39, 27, 47, 0]));
    for (const start of starts)
      for (const a of TRACE_ANSWERS)
        expect(row(a.id, start), `${a.id} at ${start}`).not.toBe(a.value);
  });
});
