// Copyright © 2026 Christopher Snow

// Facts the capstone's prose states (briefs 8A to 8C), read off the runs of the guided start, the
// whole handler and the skipping handler on the tests' programs.

import { describe, expect, it } from "vitest";

import { assembleChecked, endOf, leftFor, runScenario } from "@dd/dd-model";
import { listingAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { RUN_CASES, RUN_REFERENCE, RUN_SKELETON, RUN_SKIPPING } from "./module12";
import { runAsks, systemCallMechanism } from "./system-call-mechanism";

const lesson = parseLesson(systemCallMechanism);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const ROOMS = { sensorA: -184n, sensorB: -250n };
const run = (src: string, k: number) =>
  runScenario(src, { data: RUN_CASES[k]!.data, traps: true, inputs: ROOMS });
const matches = (src: string) =>
  RUN_CASES.map((c, k) =>
    Object.entries(runAsks(c)).every(([key, want]) => leftFor(key, run(src, k)) === want),
  );

describe("facts for the capstone", () => {
  it("the whole handler passes every run; done is at 044", () => {
    expect(matches(RUN_REFERENCE)).toEqual([true, true, true, true, true, true]);
    expect(assembleChecked(`${RUN_REFERENCE}\n${RUN_CASES[0]!.data}`).program!.labels["done"]).toBe(
      0x44,
    );
  });

  it("the guided start: 25 then a stop, nothing, lamps 0, no records, 0 then a stop; the empty table matches", () => {
    const left = RUN_CASES.map((_, k) => {
      const r = run(RUN_SKELETON, k);
      return `${leftFor("shown", r)}|${leftFor("lamps", r)}|${leftFor("word:400", r)}`;
    });
    expect(left).toEqual(["25|0|X", "|0|X", "|0|X", "5, 77|0|X", "0|0|X", "|0|X"]);
    expect(matches(RUN_SKELETON)).toEqual([false, false, false, false, false, true]);
  });

  it("the prediction: the first record is 50, cause 32", () => {
    expect(listingAnswer(props("predict-record"))).toBe("50");
    expect(RUN_CASES.flatMap((c) => c.records)).toEqual([0, 0, 0x32, 0, 0, 0x22, 0, 0, 0x21]);
    expect([0x32, 0x22, 0x21]).toEqual([50, 34, 33]);
  });

  it("the whole handler on the first run: 128 instructions, 5 calls, 25 and -250, 480 at 2", () => {
    const r = run(RUN_REFERENCE, 0);
    const s = r.state!;
    expect([s.ran, s.traps.length, leftFor("shown", r), leftFor("word:480", r)]).toEqual([
      128,
      5,
      "25, -250",
      "2",
    ]);
    expect(s.traps.every((t) => t.cause === 0x41)).toBe(true);
    expect(endOf(s.stopped)).toEqual({ key: "stop", values: { address: "044" } });
  });

  it("the skipping handler: runs 1, 4 and 6 match; run 2 records 0; runs 3 and 5 are cut off", () => {
    expect(matches(RUN_SKIPPING)).toEqual([true, false, false, true, false, true]);
    const two = run(RUN_SKIPPING, 1);
    expect([leftFor("word:400", two), leftFor("shown", two)]).toEqual(["0", "8"]);
    expect([run(RUN_SKIPPING, 2).state!.stopped, run(RUN_SKIPPING, 4).state!.stopped]).toEqual([
      { kind: "cutOff", ran: 5000 },
      { kind: "cutOff", ran: 5000 },
    ]);
  });
});
