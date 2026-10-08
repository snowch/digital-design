// Copyright © 2026 Christopher Snow

// Facts the capstone's prose states (briefs 8A to 8C), read off the runs of the guided start, the
// whole handler and the skipping handler on the tests' programs.

import { describe, expect, it } from "vitest";

import { assembleChecked, endOf, leftFor, runScenario } from "@dd/dd-model";
import { grade, listingAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import {
  RECORD_ONE,
  RUN_CASES,
  RUN_EMPTY,
  RUN_REFERENCE,
  RUN_SKELETON,
  RUN_SKIPPING,
} from "./module12";
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

/** The construction's steps: the outline with the start written, then job 4's end, then all. */
const START_BODY = RUN_REFERENCE.slice(
  RUN_REFERENCE.indexOf("start:"),
  RUN_REFERENCE.indexOf("done:   stop") + "done:   stop".length,
);
const ENDING = RUN_REFERENCE.slice(RUN_REFERENCE.indexOf("finish:"));
const STEP1 = RUN_SKELETON.replace("start:  stop", START_BODY);
const STEP2 = STEP1.replace(
  "finish: stop\nended:  stop",
  `${ENDING.replace("ended:  R8 <= word[0x480]", "        R8 <= word[0x480]")}\nended:  stop`,
);
const STEP3 = STEP1.replace("finish: stop\nended:  stop", ENDING);

describe("facts for the capstone", () => {
  it("the whole handler passes every run; done is at 044", () => {
    expect(matches(RUN_REFERENCE)).toEqual([true, true, true, true, true, true, true]);
    expect(assembleChecked(`${RUN_REFERENCE}\n${RUN_CASES[0]!.data}`).program!.labels["done"]).toBe(
      0x44,
    );
  });

  it("the outline: every run stops at once, after 5 instructions; only the empty table matches", () => {
    const left = RUN_CASES.map((_, k) => {
      const r = run(RUN_SKELETON, k);
      return `${leftFor("shown", r)}|${leftFor("word:400", r)}|${r.state!.ran}`;
    });
    expect(left).toEqual(RUN_CASES.map(() => "|X|5"));
    expect(matches(RUN_SKELETON)).toEqual([false, false, false, false, false, false, true]);
  });

  it("the construction's steps: 25 then a stop; runs 1, 4, 6 and 7; then every run", () => {
    const one = run(STEP1, 0);
    expect([leftFor("shown", one), endOf(one.state!.stopped).key]).toEqual(["25", "stop"]);
    expect(matches(STEP1)).toEqual([false, false, false, false, false, false, true]);
    expect(matches(STEP2)).toEqual([true, false, false, true, false, true, true]);
    expect(leftFor("word:400", run(STEP2, 1))).toBe("X");
    expect(matches(STEP3)).toEqual([true, true, true, true, true, true, true]);
  });

  it("the prediction: one program's load faults with 33; the record at 400 is 51; 11 instructions", () => {
    expect(listingAnswer(props("predict-record"))).toBe("51");
    const r = runScenario(RECORD_ONE, { traps: true, inputs: ROOMS });
    expect([leftFor("word:400", r), r.state!.ran, r.state!.traps.length, leftFor("C2", r)]).toEqual(
      ["51", 11, 1, "02C"],
    );
    expect(RUN_CASES.flatMap((c) => c.records)).toEqual([0, 0, 0x32, 0, 0, 0x22, 0, 0, 0x21, 0, 0]);
    expect([0x33, 0x32]).toEqual([51, 50]);
  });

  it("the skipping handler: runs 1, 4, 6 and 7 match; run 2 records 0; runs 3 and 5 are cut off", () => {
    expect(matches(RUN_SKIPPING)).toEqual([true, false, false, true, false, true, true]);
    const two = run(RUN_SKIPPING, 1);
    expect([leftFor("word:400", two), leftFor("shown", two)]).toEqual(["0", "8"]);
    expect([run(RUN_SKIPPING, 2).state!.stopped, run(RUN_SKIPPING, 4).state!.stopped]).toEqual([
      { kind: "cutOff", ran: 5000 },
      { kind: "cutOff", ran: 5000 },
    ]);
  });

  it("the challenge fails the outline, the empty start and each shortcut the review found", () => {
    const c = lesson.challenges.find((x) => x.id === "shop-handler")!;
    const shortcuts = [
      // No save of R8 and R9.
      RUN_REFERENCE.replace(
        "handler: word[0x488] <= R8      // save R8 and R9\n        word[0x490] <= R9\n        R9 <= C3",
        "handler: R9 <= C3",
      ).replace(
        "back:   R8 <= word[0x488]       // put R8 and R9 back\n        R9 <= word[0x490]\n        resume",
        "back:   resume",
      ),
      // The program's number kept in R12, not in the RAM.
      RUN_REFERENCE.replace(
        "        R1 <= 0\n        word[0x480] <= R1       // the first program is number 0",
        "        R12 <= 0",
      )
        .replace("start:  R1 <= word[0x480]", "start:  R1 <= R12")
        .replace("ended:  R8 <= word[0x480]", "ended:  R8 <= R12")
        .replace("        word[0x480] <= R8       // the next program", "        R12 <= R8"),
      // Each program started with interrupts on: C1 2.
      RUN_REFERENCE.replace(
        "        R1 <= 0\n        C1 <= R1                // user mode, interrupts off",
        "        R1 <= 2\n        C1 <= R1",
      ),
    ];
    for (const text of shortcuts) expect(text).not.toBe(RUN_REFERENCE);
    for (const text of [RUN_SKELETON, RUN_EMPTY, ...shortcuts])
      expect(grade(c, { text }).passed, text).toBe(false);
    expect(grade(c, { text: RUN_REFERENCE }).passed).toBe(true);
  });
});
