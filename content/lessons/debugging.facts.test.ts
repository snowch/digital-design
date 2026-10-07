// Copyright © 2026 Christopher Snow

// Facts the debugging lesson's prose states (briefs 6A to 6C, then 6R2A to 6R2C), read off runs of the debugger on
// the reference.

import { describe, expect, it } from "vitest";

import {
  assembleChecked,
  debugFinish,
  debugStart,
  debugStep,
  endOf,
  runScenario,
} from "@dd/dd-model";
import { grade, listingAnswer, resultsOf } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { COUNT_RUNS, EDGE_LOGS, OVER_RUNS, debugging, warmerCount } from "./debugging";
import {
  COUNT_OVER_MISTAKES,
  OFF_BY_ONE,
  OFF_BY_ONE_MENDED,
  COUNT_TO_LOG,
  COUNT_WITH_LIMIT,
  logData,
} from "./module11";

const lesson = parseLesson(debugging);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const LOG4 = `${OFF_BY_ONE}\n${logData([-190, -170], -180)}`;

describe("facts for the debugging lesson", () => {
  it("the five logs: 1 for log 1's 2, 0 for logs 4 and 5's 1, logs 2 and 3 right", () => {
    expect(
      resultsOf(props("count-results")).map((r) => [r.log.asks["display"], r.left["display"]]),
    ).toEqual([
      ["2", "1"],
      ["1", "1"],
      ["1", "1"],
      ["1", "0"],
      ["1", "0"],
    ]);
  });

  it("log 4: R2 1 at the first pause after 6; pauses at 050 and 058; 0 shown; 15 run; stop at 038", () => {
    expect(listingAnswer(props("predict-count"))).toBe("1");
    const p = assembleChecked(LOG4).program!;
    expect([p.labels["next"], p.labels["log"]]).toEqual([0x18, 0x50]);
    let s = debugStart(p.rom);
    const pauses: [number, bigint | undefined, bigint | undefined, bigint | undefined][] = [];
    while (!s.stopped) {
      s = debugStep(s);
      if (s.cpu.pc === 0x18n) pauses.push([s.ran, s.cpu.regs[1], s.cpu.regs[2], s.cpu.regs[3]]);
    }
    expect(pauses).toEqual([
      [6, 0x50n, 1n, 0n],
      [12, 0x58n, 0n, 0n],
    ]);
    expect([s.cpu.display, s.ran]).toEqual([0n, 15]);
    expect(s.stopped).toMatchObject({ pc: 0x38n });
  });

  it("the number kept at R6: cause 34 at 034 after 33, R6 050, display still 0", () => {
    const s = debugFinish(start(`${COUNT_TO_LOG}\n${logData([-190, -181, -175, -170], -180)}`));
    expect(s.stopped).toMatchObject({ pc: 0x34n, reason: { cause: 0x34 } });
    expect([s.ran, s.cpu.regs[6], s.cpu.display]).toEqual([33, 0x50n, 0n]);
  });

  it("the edge logs: only -180 and -190 shows the mistake, 1 where 0 is right", () => {
    for (const { value, log } of EDGE_LOGS) {
      const shown = runScenario(COUNT_WITH_LIMIT, { data: logData(log, -180) }).state!.cpu.display;
      expect(shown === BigInt(warmerCount(log, -180))).toBe(value !== "equal");
      if (value === "equal") expect(shown).toBe(1n);
    }
  });

  it("the edge-log question: 2 tests; a right program shows 0 on -180 and -190; the reference passes, no answer fails", () => {
    const c = lesson.challenges.find((x) => x.id === "edge-log")!;
    expect(testCount(c)).toBe(2);
    expect(c.reference.answers).toEqual({ log: "equal", shows: "0" });
    expect(grade(c, { answers: c.reference.answers! }).passed).toBe(true);
    expect(grade(c, { answers: {} }).passed).toBe(false);
    expect(grade(c, { answers: { log: "equal", shows: "1" } }).passed).toBe(false);
  });

  it("two mistakes: cause 33 at 018 with R10 074; mended, R11 starts at 96 and the run stops", () => {
    for (const { log, limit } of OVER_RUNS) {
      const data = logData(log, limit);
      const first = runScenario(COUNT_OVER_MISTAKES, { data }).state!;
      expect(first.stopped).toMatchObject({ pc: 0x18n, reason: { cause: 0x33 } });
      expect(first.cpu.regs[10]).toBe(0x74n);
      const stepMended = COUNT_OVER_MISTAKES.replace("R10 <= R10 + 4", "R10 <= R10 + 8");
      const second = runScenario(stepMended, { data }).state!;
      expect(endOf(second.stopped).key).toBe("stop");
      expect(second.cpu.display).not.toBe(BigInt(warmerCount(log, limit)));
    }
    const p = assembleChecked(`${COUNT_OVER_MISTAKES}\n${logData([-190], -180)}`).program!;
    expect(p.labels["count"]).toBe(96);
  });

  it("the challenges' specifications, and the mended count on the empty log", () => {
    expect(COUNT_RUNS.map((r) => warmerCount(r.log, r.limit))).toEqual([2, 1, 1, 1, 0, 3, 1]);
    expect(OVER_RUNS.map((r) => warmerCount(r.log, r.limit))).toEqual([2, 0, 1, 3, 0, 1]);
    const empty = runScenario(OFF_BY_ONE_MENDED, { data: logData([], -180) }).state!;
    expect(empty.cpu.display).toBe(0n);
  });

  it("the counting program as first given walks off an empty log into words nothing has set", () => {
    const run = runScenario(OFF_BY_ONE, { data: logData([], -180) }).state!;
    expect(endOf(run.stopped).key).toBe("unknown-branch");
  });
});

function start(src: string) {
  return debugStart(assembleChecked(src).program!.rom);
}
