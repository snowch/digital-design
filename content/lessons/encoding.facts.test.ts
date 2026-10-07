// Copyright © 2026 Christopher Snow

// Facts the encoding lesson's prose states, read off the reference's field split, the packed
// layout, the calculator's run of Module 7's ALU, the decoder's map and the lesson's challenges.

import { describe, expect, it } from "vitest";

import { assemble, calculate, instructionHex, meaningOf, packedLayout } from "@dd/dd-model";
import { grade, kindMap, layoutAnswer } from "@dd/dd-views";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { encoding } from "./encoding";

const lesson = parseLesson(encoding);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const word = (text: string) => assemble(text).lines[0]!.instruction!;
const hex = (w: number) => instructionHex(w);

describe("facts for the encoding lesson", () => {
  it("the words: 13123000, 22102064 and 380027D8", () => {
    expect(
      ["R3 <= R1 - R2", "R2 <= R1 + 100", "R2 <= word[sensorA]"].map((t) => hex(word(t))),
    ).toEqual(["13123000", "22102064", "380027D8"]);
  });

  it("the prediction: Y moves, and R2 <- R1 + 100 becomes 22120064", () => {
    expect(layoutAnswer({ instructions: [{ text: "R2 <= R1 + 100" }] })).toBe("Y");
    const p = packedLayout(word("R2 <= R1 + 100"));
    expect([hex(p.word), p.constantBits, p.min, p.max]).toEqual(["22120064", 16, -32768, 32767]);
  });

  it("each kind's packed layout: widths, ranges and the fields that move", () => {
    const of = (w: number) => {
      const p = packedLayout(w);
      return [p.constantBits, p.moved.join(",")];
    };
    expect(of(word("R2 <= word[sensorA]"))).toEqual([16, "Y"]);
    expect(of(0x56230002)).toEqual([16, ""]);
    expect(hex(packedLayout(0x56230002).word)).toBe("56230002");
    expect(of(0x6000f005)).toEqual([20, "Y"]);
    expect([packedLayout(0x6000f005).min, packedLayout(0x6000f005).max]).toEqual([-524288, 524287]);
    expect(of(0x70f00000)).toEqual([20, ""]);
    expect(of(0x13123000)).toEqual([12, ""]);
    expect(of(word("word[R1 + 8] <= R2"))).toEqual([16, ""]);
  });

  it("the calculator's start: -184 - (-250) is 66, with ZERO 0, MINUS 0, COUT 1, OVER 0", () => {
    const r = calculate(64, 3, -184n, -250n);
    expect([r.y.value, r.zero, r.minus, r.cout, r.over]).toEqual([66n, 0, 0, 1, 0]);
  });

  it("packed words read the course's way each write R0", () => {
    expect(meaningOf(0x22120064)).toEqual({ form: "constant", y: 0, a: 1, c: 100, job: 2 });
    expect(meaningOf(0x380207d8)).toEqual({ form: "load", y: 0, c: 0x7d8, byte: false });
    expect(meaningOf(0x60f00001)).toEqual({ form: "call", y: 0, c: 1 });
    expect(packedLayout(word("call there, R15\nthere: stop")).word).toBe(0x60f00001);
  });

  it("37 pairs of K and J are instructions; kind 8's jobs 2 and 3 depend on the constant", () => {
    const map = kindMap(false);
    expect(map.flat().filter((x) => x === "legal").length).toBe(37);
    expect(map[8]?.[2]).toBe("depends");
    expect(map[8]?.[3]).toBe("depends");
    expect(map.flat().filter((x) => x === "depends").length).toBe(2);
  });

  it("the challenges: 3 words, 23205007, 30104010 and 53360FFD; 11 tests, the start fails 6", () => {
    expect(testCount(challenge("encode-words"))).toBe(3);
    expect(challenge("encode-words").reference.answers).toEqual({
      sub: "23205007",
      load: "30104010",
      branch: "53360FFD",
    });
    expect(testCount(challenge("ydigit-text"))).toBe(11);
    const start = grade(challenge("ydigit-text"), challenge("ydigit-text").initial!);
    expect([start.failures.length, start.failures[0]?.label]).toEqual([6, "22120064"]);
    for (const c of lesson.challenges) expect(grade(c, c.reference).passed, c.id).toBe(true);
  });
});
