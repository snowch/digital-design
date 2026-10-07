// Copyright © 2026 Christopher Snow

// Facts the instruction-set lesson's prose states, read off the two machines side by side, the
// reference and the lesson's challenges.

import { describe, expect, it } from "vitest";

import { edgePair, pairView, runPair, startPair, stuckAt } from "@dd/dd-model";
import { grade, machineCompareAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { instructionSet } from "./instruction-set";
import { COLDER } from "./module9";
import { SHORT_JOBS_FROM, SHORT_JOBS_TO } from "./module10";

const lesson = parseLesson(instructionSet);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const ROOMS = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;

describe("facts for the instruction-set lesson", () => {
  it("the prediction: mid-load the machines differ on nothing; IR holds the load, HR 7D8", () => {
    expect(machineCompareAnswer(props("predict-mid"))).toBe("nothing");
    const p = startPair(COLDER, ROOMS);
    for (let k = 0; k < 3; k++) edgePair(p);
    const v = pairView(p);
    expect([v.own.state, v.own.ir, v.own.hr, v.single.pc, v.multi.pc]).toEqual([
      "MEMORY",
      0x380027d8n,
      0x7d8n,
      0n,
      0n,
    ]);
    expect([v.multi.regs[2], v.multi.regs[3], v.single.display, v.multi.display]).toEqual([
      undefined,
      undefined,
      0n,
      0n,
    ]);
  });

  it("side by side: 5 instructions in 5, 5, 3, 4, 4 edges, the stop in 1; they agree; -250", () => {
    const p = startPair(COLDER, ROOMS);
    runPair(p);
    expect(p.log.map((l) => l.edges)).toEqual([5, 5, 3, 4, 4, 1]);
    expect(p.log.slice(0, 5).reduce((n, l) => n + l.edges, 0)).toBe(21);
    expect(p.log.every((l) => l.differ.length === 0)).toBe(true);
    expect(p.log.at(-1)?.stops).toBe(true);
    const v = pairView(p);
    expect([BigInt.asIntN(64, v.single.display!), BigInt.asIntN(64, v.multi.display!)]).toEqual([
      -250n,
      -250n,
    ]);
  });

  it("HOLDR stuck at 1 keeps the agreement; PCEN stuck at 1 differs on R2 after one edge, writes R2 and skips to the stop", () => {
    const kept = startPair(COLDER, ROOMS, [stuckAt("control/HOLDR", 1)]);
    runPair(kept);
    expect(kept.log.every((l) => l.differ.length === 0)).toBe(true);
    expect(BigInt.asIntN(64, pairView(kept).multi.display!)).toBe(-250n);
    const broken = startPair(COLDER, ROOMS, [stuckAt("control/PCEN", 1)]);
    runPair(broken);
    expect(broken.log[0]?.differ).toEqual(["R2"]);
    expect(broken.log.slice(0, -1).every((l) => l.edges === 1)).toBe(true);
    const v = pairView(broken);
    expect([v.multi.regs[2], v.multi.regs[3], v.multi.display, v.single.pc, v.multi.pc]).toEqual([
      -184n & ((1n << 64n) - 1n),
      undefined,
      0n,
      0x14n,
      0x18n,
    ]);
  });

  it("the challenges: 9 and 16 tests; the second's start fails 13, first at the ALU edge", () => {
    expect(testCount(challenge("sort-parts"))).toBe(9);
    expect(testCount(challenge("short-jobs"))).toBe(16);
    const start = grade(challenge("short-jobs"), challenge("short-jobs").initial!);
    expect([start.failures.length, start.failures[0]?.label]).toEqual([
      13,
      "000, edge 3 (ALU): FETCH after it, PC 004",
    ]);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });

  it("hint 2: changing only the next state leaves the display unknown, not 66", () => {
    const c = challenge("short-jobs");
    const only = c.initial!.hdl!.replace(SHORT_JOBS_FROM.alu, SHORT_JOBS_TO.alu);
    const g = grade(c, { hdl: only });
    expect(g.failures.map((f) => f.label)).toEqual([
      "at the stop: HALT is 1, the display shows 66",
    ]);
  });
});
