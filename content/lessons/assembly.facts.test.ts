// Copyright © 2026 Christopher Snow

// Facts the assembly lesson's prose states (briefs 1A to 1C), read off the learner's assembler
// and runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugRun, debugStart, endOf, instructionHex } from "@dd/dd-model";
import { debuggerAnswer, listingAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { assembly, BE_ANSWERS } from "./assembly";
import { LIMIT_AS_DATA, ROOM_A_LIMIT, ROOM_A_MISTAKES } from "./module11";
import { COLDER } from "./module9";

const lesson = parseLesson(assembly);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const words = (source: string) =>
  assembleChecked(source).program!.lines.map((l) => [
    l.address,
    l.instruction === undefined ? "data" : instructionHex(l.instruction),
  ]);
const run = (source: string, a: number) =>
  debugRun(debugStart(assembleChecked(source).program!.rom), {
    inputs: { door: 0, warm: 0, sensorA: BigInt(a), sensorB: -250n },
  }).at(-1)!;

describe("facts for the assembly lesson", () => {
  it("the colder-room program names one address: show, 010", () => {
    expect(assembleChecked(COLDER).program!.labels).toEqual({ show: 0x10 });
  });

  it("the branch to fine gets the constant 003, from 008 to 014, as 56230003", () => {
    expect(listingAnswer(props("predict-constant"))).toBe("003");
    expect(words(ROOM_A_LIMIT)[2]).toEqual([0x8, "56230003"]);
    expect(assembleChecked(ROOM_A_LIMIT).program!.labels["fine"]).toBe(0x14);
  });

  it("room A at -170: ALARM on, -170 shown, stop at 018 after 7; below -180, 5 run", () => {
    const warm = run(ROOM_A_LIMIT, -170);
    expect([warm.cpu.lamps, BigInt.asIntN(64, warm.cpu.display), warm.ran]).toEqual([1, -170n, 7]);
    expect(endOf(warm.stopped)).toEqual({ key: "stop", values: { address: "018" } });
    expect(run(ROOM_A_LIMIT, -184).ran).toBe(5);
    expect(debuggerAnswer(props("room-a"))).toBe("");
  });

  it("the mistakes: the assembler refuses lines 3, 4 and 7", () => {
    expect(assembleChecked(ROOM_A_MISTAKES).problems.map((p) => [p.line, p.code])).toEqual([
      [3, "constantRange"],
      [4, "signedOrUnsigned"],
      [7, "unknownName"],
    ]);
  });

  it("the limit as data: stop at 018, 4 bytes of 0s, limit at 020, the load 38003020", () => {
    const p = assembleChecked(LIMIT_AS_DATA).program!;
    expect(p.labels["limit"]).toBe(0x20);
    expect(words(LIMIT_AS_DATA)[6]).toEqual([0x18, "84000000"]);
    expect(words(LIMIT_AS_DATA)[1]).toEqual([0x4, "38003020"]);
    expect([...p.rom.slice(0x1c, 0x20)]).toEqual([0, 0, 0, 0]);
  });

  it("being the assembler: cold 014, limit 018, the branch 56210003, the load 38001018", () => {
    expect(BE_ANSWERS.map((a) => a.value)).toEqual(["014", "018", "56210003", "38001018"]);
  });

  it("the hint's smaller example: show is the fifth instruction, at 010, with c = 002", () => {
    expect(words(COLDER)[2]).toEqual([0x8, "56230002"]);
  });
});
