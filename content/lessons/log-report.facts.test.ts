// Copyright © 2026 Christopher Snow

// Facts the log-report lesson's prose states (briefs 7A to 7C), read off runs of the reference.

import { describe, expect, it } from "vitest";

import { assembleChecked, debugFinish, debugStart, debugStep, runScenario } from "@dd/dd-model";
import { listingAnswer, resultsOf } from "@dd/dd-views";
import { grade } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { REPORT_LOGS, logReport, reportOf } from "./log-report";
import { LOWEST_DEMO, REPORT_EMPTY, REPORT_REFERENCE, REPORT_SKELETON, logData } from "./module11";

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

  it("the outline: display 0 and no lamp on every log, X at 400 and 408; no log right as a whole", () => {
    const rows = resultsOf(props("asks"));
    for (const { left } of rows) {
      expect([left["display"], left["lamps"], left["word:400"], left["word:408"]]).toEqual([
        "0",
        "0",
        "X",
        "X",
      ]);
    }
    // The display and the lamps are right only for logs 2, 4 and 6.
    expect(rows.map(({ log, left }) => left.display === log.asks.display)).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
    ]);
    expect(
      rows.some(({ log, left }) => Object.keys(log.asks).every((k) => left[k] === log.asks[k])),
    ).toBe(false);
  });

  it("lowestOf on log 5 leaves R2 at 0 and -190 in R1; five pauses at lowNext, 35 run", () => {
    expect(listingAnswer(props("predict-lowest"))).toBe("0");
    const program = assembleChecked(LOWEST_DEMO(DEFROST)).program!;
    const at = BigInt(program.labels["lowNext"]!);
    let s = debugStart(program.rom);
    const pauses: string[] = [];
    const sg = (v: bigint | undefined) => (v === undefined ? "X" : String(BigInt.asIntN(64, v)));
    while (!s.stopped) {
      if (s.cpu.pc === at)
        pauses.push(`${sg(s.cpu.regs[5])} ${sg(s.cpu.regs[6])} ${sg(s.cpu.regs[2])}`);
      s = debugStep(s);
    }
    expect(pauses).toEqual(["-184 X 5", "-184 35 4", "-184 -176 3", "-184 12 2", "-190 -190 1"]);
    const end = debugFinish(s);
    expect(BigInt.asIntN(64, end.cpu.display)).toBe(-190n);
    expect(end.cpu.regs[2]).toBe(0n);
    expect(end.ran).toBe(35);
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

  it("18 tests: six whole runs and twelve calls; the empty start and the outline fail them", () => {
    const c = lesson.challenges[0]!;
    expect(testCount(c)).toBe(18);
    expect(grade(c, { text: REPORT_EMPTY }).passed).toBe(false);
    expect(grade(c, { text: REPORT_SKELETON }).passed).toBe(false);
  });

  it("the last hint, pasted over the outline's three stubs, passes every test", () => {
    const c = lesson.challenges[0]!;
    const hint = c.hints.at(-1)!;
    const code = /```\n([\s\S]*?)```/.exec(hint)![1]!;
    // The outline's stubs: two lines each, under a comment.
    let text = REPORT_SKELETON;
    for (const name of ["report", "highestOf", "warmCount"]) {
      const stub = new RegExp(`${name}:\\s+R1 <= 0\\n\\s+goto R15`);
      expect(stub.test(text)).toBe(true);
      text = text.replace(stub, "");
    }
    expect(grade(c, { text: `${text}\n${code}` }).passed).toBe(true);
  });

  it("report keeps what it needs: 4 words pushed, 3 calls, R14 back at 7C0", () => {
    const run = runScenario(REPORT_REFERENCE, { data: logData([-184, 35, -176, 12, -190], -180) });
    expect(run.state!.deepest).toBe(0x7a0n);
    expect(run.state!.cpu.regs[14]).toBe(0x7c0n);
  });
});
