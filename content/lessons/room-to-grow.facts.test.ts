// Copyright © 2026 Christopher Snow

// Facts the room-to-grow lesson's prose states, read off programs run on the reference and the
// decoder's map.

import { describe, expect, it } from "vitest";

import { meaningOf, runProgram } from "@dd/dd-model";
import { programAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { NO_STOP, TIMES_FIVE, multiplyLoop } from "./module10";
import { CHOOSE } from "./module9";
import { WORDS, roomToGrow } from "./room-to-grow";

const lesson = parseLesson(roomToGrow);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const SHOP = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;

describe("facts for the room-to-grow lesson", () => {
  it("a program with no stop runs into the ROM's zeros at 008 and stops, cause 21", () => {
    expect(programAnswer(props("predict-no-stop"))).toBe("21");
    const r = runProgram(NO_STOP);
    expect([r.ran, r.state.stopped?.pc, r.state.display]).toEqual([3, 8n, 66n]);
  });

  it("7 × 5: the loop runs 21 instructions of 9 written; doubling runs 6 of 6; both show 35", () => {
    const loop = runProgram(multiplyLoop(5));
    const doubling = runProgram(TIMES_FIVE);
    expect([loop.written, loop.ran, loop.state.display]).toEqual([9, 21, 35n]);
    expect([doubling.written, doubling.ran, doubling.state.display]).toEqual([6, 6, 35n]);
  });

  it("the loop runs 4 + 3n + 2 instructions: 33 for 7 × 9, 156 for 7 × 50", () => {
    for (const n of [1, 5, 9, 50]) expect(runProgram(multiplyLoop(n)).ran).toBe(4 + 3 * n + 2);
    expect(lesson.challenges.find((c) => c.id === "count-loop")?.reference.answers).toEqual({
      times9: "33",
      times50: "156",
    });
  });

  it("the copy's call through a register runs there and is refused by the course's machine", () => {
    const copy = runProgram(CHOOSE, SHOP, { registerCheck: true, callThroughRegister: 9 });
    expect([copy.state.display, copy.state.regs[15], copy.stopped]).toEqual([
      BigInt.asUintN(64, -184n),
      8n,
      { kind: "stop" },
    ]);
    const course = runProgram(CHOOSE, SHOP, { registerCheck: true }, 2000, {
      callThroughRegister: 9,
    });
    expect([course.state.display, course.state.stopped?.pc, course.stopped]).toEqual([
      0n,
      4n,
      { kind: "trap", cause: 0x21 },
    ]);
  });

  it("the words: what the course's machine makes of each", () => {
    for (const w of WORDS) {
      const m = meaningOf(Number.parseInt(w.word, 16));
      const does =
        m.form === "illegal" ? "illegal" : m.form === "system" && m.job === 4 ? "stop" : "runs";
      expect(does, w.word).toBe(w.does);
    }
    expect(testCount(lesson.challenges[0]!)).toBe(6);
  });
});
