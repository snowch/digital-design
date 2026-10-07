// Copyright © 2026 Christopher Snow

// Facts the recursion lesson's prose states (briefs 5A to 5C), read off the learner's assembler
// and runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugFinish, debugStart, debugStep } from "@dd/dd-model";
import { debuggerAnswer, depthRun } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { NEWEST, NEWEST_NO_LAST_CASE, newestOn } from "./module11";
import { COLDER_RUNS, DEPTH_ANSWERS, colderNewestFirst, recursion } from "./recursion";

const lesson = parseLesson(recursion);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const start = (src: string) => debugStart(assembleChecked(src).program!.rom);
const shown = (vs: readonly bigint[]) => vs.map((v) => BigInt.asIntN(64, v).toString());
const many = (n: number) => newestOn(Array.from({ length: n }, (_, k) => -150 - (k % 40)));

describe("facts for the recursion lesson", () => {
  it("newest at 014, none at 050, the log at 060", () => {
    const p = assembleChecked(NEWEST).program!;
    expect([p.labels["newest"], p.labels["none"], p.labels["log"]]).toEqual([0x14, 0x50, 0x60]);
  });

  it("five calls, R1 and R2 at each, the deepest 780 with 8 words; newest first; 72; stop at 010", () => {
    let s = start(NEWEST);
    const visits: [bigint | undefined, bigint | undefined][] = [];
    while (!s.stopped) {
      s = debugStep(s);
      if (s.cpu.pc === 0x14n) visits.push([s.cpu.regs[1], s.cpu.regs[2]]);
    }
    expect(visits).toEqual([
      [0x60n, 4n],
      [0x68n, 3n],
      [0x70n, 2n],
      [0x78n, 1n],
      [0x80n, 0n],
    ]);
    expect([s.deepest, s.callsMade, s.ran]).toEqual([0x780n, 5, 72]);
    expect(shown(s.shown)).toEqual(["-181", "-176", "-190", "-184"]);
    expect(s.stopped).toMatchObject({ pc: 0x10n });
    expect(debuggerAnswer(props("predict-order"))).toBe("-181, -176, -190, -184");
    expect(depthRun(NEWEST)!.deepest).toBe(8);
  });

  it("no last case: cause 34 at 01C after 486, 61 calls, none returned, nothing shown", () => {
    const s = debugFinish(start(NEWEST_NO_LAST_CASE));
    expect(s.stopped).toMatchObject({ kind: "machine", pc: 0x1cn, reason: { cause: 0x34 } });
    expect([s.ran, s.callsMade, s.returns, s.shown.length, s.deepest]).toEqual([
      486,
      61,
      0,
      0,
      0x3f8n,
    ]);
  });

  it("60 readings fit to 400 exactly; 61 halt with cause 34 at 020, the stack at 120 words", () => {
    const sixty = debugFinish(start(many(60)));
    expect([sixty.stopped?.kind, sixty.deepest, sixty.shown.length]).toEqual([
      "machine",
      0x400n,
      60,
    ]);
    const more = debugFinish(start(many(61)));
    expect(more.stopped).toMatchObject({ pc: 0x20n, reason: { cause: 0x34 } });
    expect(depthRun(many(61))!.deepest).toBe(120);
  });

  it("the challenges' answers", () => {
    expect(DEPTH_ANSWERS.map((a) => a.value)).toEqual(["10", "770", "60"]);
    expect((0x7c0 - 16 * 5).toString(16).toUpperCase()).toBe("770");
    expect(COLDER_RUNS.map((r) => colderNewestFirst(r.log, r.limit).join(", "))).toEqual([
      "-210, -205",
      "-215, -205",
      "",
      "-250",
      "",
      "-300, -201",
    ]);
  });
});
