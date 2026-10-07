// Copyright © 2026 Christopher Snow

// Facts the room-to-grow lesson's prose states, read off programs run on the reference and the
// decoder's map.

import { describe, expect, it } from "vitest";

import {
  MODULE_9,
  assemble,
  isIllegal,
  fieldsOf,
  libraryCircuit,
  meaningOf,
  runProgram,
} from "@dd/dd-model";
import { kindMap, programAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import {
  CALL_TWICE,
  CALL_TWICE_WITHOUT,
  DATA_AFTER,
  NO_STOP,
  TIMES_FIVE,
  multiplyLoop,
} from "./module10";
import { COLDER } from "./module9";
import { CODES, JOIN_PLACES, roomToGrow } from "./room-to-grow";

const lesson = parseLesson(roomToGrow);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const SHOP = { door: 0, warm: 0, sensorA: -184n, sensorB: -250n } as const;
const COPY = { ...MODULE_9, callThroughRegister: 9, setIf: 10 };

describe("facts for the room-to-grow lesson", () => {
  it("the places drawing: the ALU, the B selector, the +4 block and register Y's word", () => {
    const kinds = Object.fromEntries(
      libraryCircuit("join-places").composites.map((c) => [c.path, c.kind]),
    );
    expect(JOIN_PLACES.map((p) => kinds[p])).toEqual([
      expect.stringMatching(/alu/i),
      "yWord",
      expect.stringMatching(/selector/i),
      "plus4",
    ]);
  });

  it("the map: 37 instructions, 2 that depend on the constant; kinds 1 to 8 refuse 89 jobs", () => {
    const map = kindMap(false);
    const rows = map.slice(1, 9).flat();
    expect(map.flat().filter((x) => x === "legal").length).toBe(37);
    expect(map.flat().filter((x) => x === "depends").length).toBe(2);
    expect(rows.filter((x) => x === "illegal").length).toBe(89);
    // Kinds 9 to F: seven free kinds on the course's machine.
    expect(map.slice(9).every((row) => row.every((x) => x === "illegal"))).toBe(true);
  });

  it("a program that runs off its end halts at the first word of zeros, cause 21", () => {
    const r = runProgram(NO_STOP);
    expect([r.ran, r.state.stopped?.pc, r.stopped]).toEqual([2, 8n, { kind: "trap", cause: 0x21 }]);
  });

  it("the prediction: data 12345678 runs as R5 <- R3 + R4, then the halt at 00C", () => {
    expect(programAnswer(props("predict-data"))).toBe("00C");
    const r = runProgram(DATA_AFTER);
    expect([r.ran, r.state.stopped?.pc, r.state.display]).toEqual([3, 0xcn, 66n]);
    expect(meaningOf(0x12345678)).toMatchObject({ form: "register", y: 5, a: 3, b: 4, job: 2 });
    // Other data: 5000 reads 00001388 at 008, kind 0; -250 reads FFFFFF06, kind F.
    for (const d of ["5000", "-250"]) {
      const s = runProgram(`R1 <= 66\nword[display] <= R1\ndata: word ${d}`);
      expect([s.ran, s.state.stopped?.pc]).toEqual([2, 8n]);
    }
    expect(fieldsOf(0x00001388).k).toBe(0);
    expect(fieldsOf(0xffffff06).k).toBe(0xf);
  });

  it("7 × 5: the loop writes 9 and runs 21, 4 + 3n + 2; doubling writes 6 and runs 6", () => {
    const loop = runProgram(multiplyLoop(5));
    const doubling = runProgram(TIMES_FIVE);
    expect([loop.written, loop.ran, doubling.written, doubling.ran]).toEqual([9, 21, 6, 6]);
    expect([loop.state.display, doubling.state.display]).toEqual([35n, 35n]);
  });

  it("the codes: refused today or taken, word by word", () => {
    for (const c of CODES) {
      const illegal = isIllegal(fieldsOf(parseInt(c.word, 16)));
      expect(illegal, c.word).toBe(c.fate !== "taken");
    }
    expect(isIllegal(fieldsOf(0x9040f000), { callThroughRegister: 9 })).toBe(false);
  });

  it("an old program on the copy: the colder room shows -250 on both, in 6 instructions", () => {
    const course = runProgram(COLDER, SHOP, MODULE_9);
    const copy = runProgram(COLDER, SHOP, COPY);
    expect([course.ran, course.state.display, copy.ran, copy.state.display]).toEqual([
      6,
      BigInt.asUintN(64, -250n),
      6,
      BigInt.asUintN(64, -250n),
    ]);
  });

  it("the challenges: 6 codes; two calls run 11 instructions with the call, 13 without", () => {
    expect(testCount(lesson.challenges[0]!)).toBe(6);
    const withCall = runProgram(CALL_TWICE, SHOP, COPY);
    const without = runProgram(CALL_TWICE_WITHOUT, SHOP, MODULE_9);
    expect([withCall.written, withCall.ran, withCall.romBytes]).toEqual([11, 11, 44]);
    expect([without.written, without.ran, without.romBytes]).toEqual([13, 13, 52]);
    expect(withCall.state.display).toBe(without.state.display);
    expect(assemble(CALL_TWICE, { callThroughRegister: 9 }).lines.length).toBe(11);
  });
});
