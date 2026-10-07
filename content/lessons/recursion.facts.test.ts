// Copyright © 2026 Christopher Snow

// Facts the recursion lesson's prose states (briefs 5RA to 5RC), read off the learner's assembler
// and runs of the debugger on the reference.

import { describe, expect, it } from "vitest";

import {
  assembleChecked,
  debugFinish,
  debugStart,
  debugStep,
  endOf,
  memoryWord,
} from "@dd/dd-model";
import { depthRun, listingAnswer } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import {
  COLD_STORE,
  FARTHEST_REFERENCE,
  LONG_STORE,
  WARM_ROOMS,
  WARM_ROOMS_LOOP,
  warmRoomsOn,
} from "./module11";
import { FARTHEST_CALLS, HALL, LAYOUTS, STORE_ANSWERS, recursion } from "./recursion";

const lesson = parseLesson(recursion);
const props = (id: string) =>
  lesson.sections.flatMap((s) => s.interactives).find((x) => x.id === id)!.props as never;
const QUIET = { door: 0, warm: 0, sensorA: 0n, sensorB: 0n } as const;
const start = (src: string) => debugStart(assembleChecked(src).program!.rom);
const hex = (v: bigint | number | undefined) =>
  v === undefined ? "X" : BigInt(v).toString(16).toUpperCase().padStart(3, "0");

/** Each pause at warmRooms: R1 and R14, in hexadecimal. */
function pauses(src: string) {
  const p = assembleChecked(src).program!;
  let s = debugStart(p.rom);
  const out: [string, string][] = [];
  while (!s.stopped) {
    if (s.cpu.pc === BigInt(p.labels["warmRooms"]!))
      out.push([hex(s.cpu.regs[1]), hex(s.cpu.regs[14])]);
    s = debugStep(s, QUIET);
  }
  return { out, end: s };
}

describe("facts for the recursion lesson", () => {
  it("the rooms at 0A0 to 118, 24 bytes apart, the hall's doors holding 0B8 and 0D0", () => {
    const p = assembleChecked(WARM_ROOMS).program!;
    const at = ["hall", "prep", "store", "chillA", "chillB", "deep"].map((n) => hex(p.labels[n]));
    expect(at).toEqual([HALL, "0B8", "0D0", "0E8", "100", "118"]);
    const s = debugStart(p.rom);
    expect([memoryWord(s.cpu, 0xa8), memoryWord(s.cpu, 0xb0)]).toEqual([0xb8n, 0xd0n]);
    expect(assembleChecked(warmRoomsOn(LONG_STORE)).program!.labels["hall"]).toBe(0xa0);
  });

  it("13 calls; the pauses' R1 and R14; 3 shown; 223 run; stop at 014; 16 words at 740", () => {
    expect(listingAnswer(props("predict-calls"))).toBe("13");
    const { out, end } = pauses(WARM_ROOMS);
    expect(out).toEqual([
      ["0A0", "7C0"],
      ["0B8", "7A0"],
      ["000", "780"],
      ["000", "780"],
      ["0D0", "7A0"],
      ["0E8", "780"],
      ["118", "760"],
      ["000", "740"],
      ["000", "740"],
      ["000", "760"],
      ["100", "780"],
      ["000", "760"],
      ["000", "760"],
    ]);
    expect([end.cpu.display, end.ran, end.callsMade, hex(end.deepest)]).toEqual([
      3n,
      223,
      13,
      "740",
    ]);
    expect(end.stopped).toMatchObject({ pc: 0x14n });
  });

  it("the depth rises and falls: 16 words at most, empty at the end", () => {
    const d = depthRun(WARM_ROOMS)!;
    expect([d.deepest, d.depths.at(-1)]).toEqual([16, 0]);
  });

  it("a door back to the store: cause 34 at 024 after 571, 34 calls, R14 at 3F8, 0 shown", () => {
    const s = debugFinish(start(WARM_ROOMS_LOOP), QUIET);
    expect(endOf(s.stopped)).toEqual({ key: "cause34", values: { address: "024", cause: "34" } });
    expect([s.ran, s.callsMade, hex(s.cpu.regs[14]), s.cpu.display]).toEqual([571, 34, "3F8", 0n]);
    expect(assembleChecked(WARM_ROOMS).program!.lines.find((l) => l.address === 0x24)?.text).toBe(
      "word[R14] <= R15",
    );
  });

  it("the construction's answers: 15 calls, 20 words, 720", () => {
    const s = debugFinish(start(warmRoomsOn(LONG_STORE)), QUIET);
    expect(STORE_ANSWERS.map((a) => a.value)).toEqual([
      String(s.callsMade),
      String((0x7c0n - s.deepest!) / 8n),
      hex(s.deepest),
    ]);
  });

  it("farthest on each set of rooms, and called alone", () => {
    for (const l of LAYOUTS) {
      const s = debugFinish(start(`${FARTHEST_REFERENCE}\n${l.rooms}`), QUIET);
      expect(s.cpu.display).toBe(BigInt(l.farthest));
    }
    expect(FARTHEST_CALLS.map((c) => c.farthest)).toEqual([3, 1, 0, 4]);
    expect(LAYOUTS[0].rooms).toBe(COLD_STORE);
  });
});
