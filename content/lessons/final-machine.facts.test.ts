// Copyright © 2026 Christopher Snow

// The numbers and sentences lesson final-machine states, read off runs of the course's text of
// the whole machine and of the texts its figures change: each program's edges, each changed
// text's first difference on each program, the prediction's answer, and the lab's three starts
// as the grade sees them.

import { describe, expect, it } from "vitest";

import {
  DEFAULT_VIEW_STRINGS,
  gradeLab,
  labAnswer,
  labRun,
  labText,
  labVariant,
} from "@dd/dd-views";

import { LAB_RUNS, LAB_TEXTS, finalMachine } from "./final-machine";
import { PROSE } from "./final-machine.prose";
import { MACHINE13_TEXT, emptyStart, guidedStart, partsStart } from "./module13";

type Text = { readonly label: string; readonly from?: string; readonly to?: string };

const result = (text: Text | undefined, id: string) => {
  const program = LAB_RUNS.find((p) => p.id === id)!;
  const r = labRun(text ? labVariant(MACHINE13_TEXT, text) : MACHINE13_TEXT, program);
  if ("blocked" in r) throw new Error(r.blocked);
  return { ...r, text: labText(DEFAULT_VIEW_STRINGS, r, false) };
};
const differ = (text: Text) =>
  LAB_RUNS.filter((p) => result(text, p.id).difference !== undefined).map((p) => p.id);
const all = `${Object.values(PROSE).flat().join("\n")}`;

describe("lesson final-machine's facts", () => {
  it("runs every program on the course's text as the model does, in the edges it states", () => {
    const edges = Object.fromEntries(LAB_RUNS.map((p) => [p.id, result(undefined, p.id)]));
    for (const r of Object.values(edges)) expect(r.difference).toBeUndefined();
    expect(Object.fromEntries(Object.entries(edges).map(([k, r]) => [k, r.edges]))).toEqual({
      shop: 69,
      user: 36,
      timer: 53,
      door: 31,
      rom: 7,
    });
    for (const n of [69, 36, 53, 31, 7]) expect(PROSE.motivation).toContain(`${n} edges`);
  }, 120_000);

  it("ends each program with the cause the prose names", () => {
    expect(result(undefined, "rom").difference).toBeUndefined();
    // The causes are the model's: a device read in user mode, the timer, the door, the ROM.
    for (const cause of ["`32`", "`81`", "`82`", "`34`"]) expect(PROSE.motivation).toContain(cause);
  });

  it("the prediction: a timer that counts a trap's edge differs on the timer program alone", () => {
    const programs = LAB_RUNS.filter((p) => ["shop", "timer"].includes(p.id));
    expect(labAnswer(labVariant(MACHINE13_TEXT, LAB_TEXTS.tick), programs)).toBe("timer");
    const sentence =
      "After `call system` at `018`, the timer is 1 on the machine and 2 by the model.";
    expect(result(LAB_TEXTS.tick, "timer").text).toBe(sentence);
    expect(PROSE.p1Explain).toContain(sentence);
  }, 60_000);

  it("the investigation: each wrong line, and the programs that find it", () => {
    expect(differ(LAB_TEXTS.branch)).toEqual(["timer"]);
    expect(differ(LAB_TEXTS.ie)).toEqual(["timer", "door"]);
    expect(differ(LAB_TEXTS.call)).toEqual(["shop"]);
    expect(result(LAB_TEXTS.branch, "timer").text).toBe(
      "After `if R5 == R6 goto back` at `038`, the PC is 044 on the machine and 03C by the model.",
    );
    expect(result(LAB_TEXTS.ie, "timer").text).toBe(
      "After `if R5 == R6 goto back` at `038`, the PC is 030 on the machine and 044 by the model.",
    );
    expect(result(LAB_TEXTS.ie, "door").text).toBe(
      "At `R5 <= C3` at `020`, the machine halts with cause `82`; the model does not halt.",
    );
    expect(result(LAB_TEXTS.call, "shop").text).toBe(
      "After `call R6, R15` at `02C`, R15 is 44 on the machine and 48 by the model.",
    );
    for (const s of [
      "044 on the machine and 03C",
      "030 on the machine and 044",
      "44 on the machine and 48",
    ])
      expect(PROSE.invAfter).toContain(s);
  }, 180_000);

  it("the failure experiment: DOOR held at 0 differs on the door program alone", () => {
    expect(differ(LAB_TEXTS.door)).toEqual(["door"]);
    expect(result(LAB_TEXTS.door, "door").text).toBe(
      'After `R2 <= R2 + 1` at `014`, "waiting" is 00 on the machine and 10 by the model.',
    );
    expect(PROSE.failAfter).toContain('"waiting" is 00 on the machine and 10 by the model');
  }, 120_000);

  it("never shows a line the outline leaves out", () => {
    const guided = guidedStart();
    for (const t of Object.values(LAB_TEXTS)) {
      expect(guided).toContain(t.from);
      expect(all).not.toContain(t.from);
    }
  });

  it("finds each of the outline's six joins, left out alone, on at least one program", () => {
    const guided = guidedStart().split("\n");
    const course = MACHINE13_TEXT.split("\n");
    const joins = course.flatMap((line, k) => (guided[k] !== line ? [k] : []));
    expect(joins).toHaveLength(6);
    for (const k of joins) {
      const one = course.map((line, j) => (j === k ? guided[j]! : line)).join("\n");
      const found = LAB_RUNS.some((p) => {
        const r = labRun(one, p);
        return "blocked" in r || r.difference !== undefined;
      });
      expect(found, course[k]).toBe(true);
    }
  }, 300_000);

  it("finds each of the outline's six joins filled wrongly, and the review's wrong texts", () => {
    const wrong: readonly (readonly [string, readonly string[]])[] = [
      [
        "assign USER = ~STATUS[0];",
        ["assign USER = STATUS[0];", "assign USER = ~STATUS[1];", "assign USER = 1'b1;"],
      ],
      [".WAITING(WAITING),  //", [".WAITING(2'b11),  //", ".WAITING(STATUS),  //"]],
      [".NOHANDLER(NOHANDLER),  //", [".NOHANDLER(1'b1),  //", ".NOHANDLER(TRAP),  //"]],
      [".CAUSE(CAUSE),  //", [".CAUSE(CAUSET),  //", ".CAUSE(CAUSEM),  //", ".CAUSE(CAUSEF),  //"]],
      [
        "if (SET) YIN = {63'h0, MET};",
        [
          "if (SET) YIN = {63'h0, ZERO};",
          "if (SET) YIN = {63'h0, OVER};",
          "if (SET) YIN = {63'h0, COUT};",
          "if (SET) YIN = 64'h0;",
        ],
      ],
      ["if (TRAP) NEXTT = C4;", ["if (TRAP) NEXTT = C2;", "if (TRAP) NEXTT = PC4;"]],
      // The review's: a join whose own wire has the same name, inputs held at 0, a lost sign.
      [".CAUSED(CAUSET), .CAUSEM", [".CAUSED(CAUSED), .CAUSEM"]],
      [".WARM(WARM)", [".WARM(1'b0)"]],
      [".STORE(MSTORE), .BYTE(BYTE)", [".STORE(MSTORE), .BYTE(1'b0)"]],
      [
        ".COUT(COUT), .OVER(OVER),\n    .MET(MET));",
        [
          ".COUT(1'b0), .OVER(OVER),\n    .MET(MET));",
          ".COUT(COUT), .OVER(1'b0),\n    .MET(MET));",
        ],
      ],
      ["1'b1: WIDE = {52'hFFFFFFFFFFFFF, IR[11:0]};", ["1'b1: WIDE = {52'h0, IR[11:0]};"]],
    ];
    for (const [from, tos] of wrong) {
      expect(MACHINE13_TEXT, from).toContain(from);
      for (const to of tos) {
        const text = MACHINE13_TEXT.replace(from, to);
        const found = LAB_RUNS.some((p) => {
          const r = labRun(text, p);
          return "blocked" in r || r.difference !== undefined;
        });
        expect(found, to).toBe(true);
      }
    }
  }, 600_000);

  const challenge = finalMachine.challenges![0]!;
  it("grades the course's text as passing and the outline as failing every test", () => {
    expect(gradeLab(challenge as never, { hdl: MACHINE13_TEXT }).passed).toBe(true);
    const outline = gradeLab(challenge as never, { hdl: guidedStart() });
    expect(outline.blocked).toBeUndefined();
    expect(outline.failures.map((f) => f.index)).toEqual([0, 1, 2, 3, 4]);
  }, 180_000);

  it("blocks the parts start at its first port, and the empty start", () => {
    expect(gradeLab(challenge as never, { hdl: partsStart() }).blocked).toContain(
      "connect memory's input ADDR",
    );
    expect(gradeLab(challenge as never, { hdl: emptyStart() }).blocked).toBeTruthy();
  });
});
