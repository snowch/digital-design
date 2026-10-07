// Copyright © 2026 Christopher Snow

// Facts the log-report lesson's prose states (briefs 7A to 7C), read off runs of the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugFinish, debugStart, debugStep } from "@dd/dd-model";
import { debuggerAnswer, resultsOf } from "@dd/dd-views";
import { grade } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { REPORT_LOGS, logReport, reportOf } from "./log-report";
import { LOWEST_DEMO, REPORT_EMPTY } from "./module11";

const lesson = parseLesson(logReport);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const DEFROST = [-184, 35, -176, 12, -190];

describe("facts for the log-report lesson", () => {
  it("each log's report", () => {
    expect(REPORT_LOGS.map(({ log, limit }) => reportOf(log, limit))).toEqual([
      { display: 2, lamps: 1, lowest: -190, highest: -172, warm: 2 },
      { display: 0, lamps: 0, lowest: -200, highest: -191, warm: 0 },
      { display: 1, lamps: 1, lowest: -175, highest: -175, warm: 1 },
      { display: 0, lamps: 0, lowest: 0, highest: 0, warm: 0 },
      { display: 3, lamps: 1, lowest: -190, highest: 35, warm: 3 },
      { display: 0, lamps: 0, lowest: -160, highest: -150, warm: 0 },
    ]);
  });

  it("the starting text: the lowest right on every log; highest, display and lamps 0", () => {
    const rows = resultsOf(props("asks"));
    for (const { log, left } of rows) {
      expect(left["word:400"]).toBe(log.asks["word:400"]);
      expect([left["word:408"], left["display"], left["lamps"]]).toEqual(["0", "0", "0"]);
    }
    // Right only for the empty log, log 4, and for the counts of logs 2 and 6.
    const whole = rows.map(({ log, left }) =>
      Object.keys(log.asks).every((k) => left[k] === log.asks[k]),
    );
    expect(whole).toEqual([false, false, false, true, false, false]);
  });

  it("lowest on log 5 returns -190, keeping -184 past 35, -176 and 12", () => {
    expect(debuggerAnswer(props("predict-lowest"))).toBe("-190");
    let s = debugStart(assembleChecked(LOWEST_DEMO(DEFROST)).program!.rom);
    const lowest: bigint[] = [];
    while (!s.stopped) {
      s = debugStep(s);
      const r5 = s.cpu.regs[5];
      if (r5 !== undefined && lowest.at(-1) !== r5) lowest.push(r5);
    }
    expect(lowest.map((v) => BigInt.asIntN(64, v))).toEqual([-184n, -190n]);
    expect(BigInt.asIntN(64, debugFinish(s).cpu.display)).toBe(-190n);
  });

  it("a highest started at 0 leaves 0 at 408 for logs 1, 2, 3 and 6, and is right for 4 and 5", () => {
    const rows = resultsOf(props("from-zero"));
    expect(rows.map(({ log, left }) => left["word:408"] === log.asks["word:408"])).toEqual([
      false,
      false,
      false,
      true,
      true,
      false,
    ]);
  });

  it("15 tests: six whole runs and nine calls; the empty start fails them", () => {
    const c = lesson.challenges[0]!;
    expect(testCount(c)).toBe(15);
    expect(grade(c, { text: REPORT_EMPTY }).passed).toBe(false);
  });
});
