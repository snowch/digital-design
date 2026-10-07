// Copyright © 2026 Christopher Snow

// Module 10, lesson 2: what the machine makes of a word, the packed layout, and the calculator
// running Module 7's ALU.

import { describe, expect, it } from "vitest";

import { assemble } from "./assemble";
import { calculate, courseLayout, meaningOf, packedLayout } from "./encoding";

const word = (text: string) => assemble(text).lines[0]!.instruction!;

describe("what the machine makes of a word", () => {
  it("reads each kind as the reference does, and says why a word is illegal", () => {
    expect(meaningOf(0x13123000)).toEqual({ form: "register", y: 3, a: 1, b: 2, job: 3 });
    expect(meaningOf(0x380027d8)).toEqual({ form: "load", y: 2, c: 0x7d8, byte: false });
    expect(meaningOf(0x56230002)).toEqual({ form: "branch", a: 2, b: 3, cond: 6, c: 2 });
    expect(meaningOf(0x00000000)).toEqual({ form: "illegal", why: "kind" });
    expect(meaningOf(0x98000000)).toEqual({ form: "illegal", why: "kind" });
    expect(meaningOf(0x18000000)).toEqual({ form: "illegal", why: "job" });
    expect(meaningOf(0x82000009)).toEqual({ form: "illegal", why: "number" });
    expect(meaningOf(0xa4123000, { setIf: 10 })).toEqual({
      form: "setIf",
      y: 3,
      a: 1,
      b: 2,
      cond: 4,
    });
  });
});

describe("the packed layout", () => {
  it("gives a constant job's unused digit to the constant, and moves Y", () => {
    const p = packedLayout(word("R2 <= R1 + 100"));
    expect(p.word.toString(16).toUpperCase()).toBe("22120064");
    expect([p.constantBits, p.min, p.max, p.moved]).toEqual([16, -32768, 32767, ["Y"]]);
  });
  it("keeps a branch's and a jump's words, with longer constants and nothing moved", () => {
    expect(packedLayout(0x56230002).word).toBe(0x56230002);
    expect(packedLayout(0x56230002).moved).toEqual([]);
    expect(packedLayout(0x70f00000).constantBits).toBe(20);
  });
  it("moves a call's Y two digits, and leaves a register job as it was", () => {
    const call = packedLayout(word("call there, R15\nthere: stop"));
    expect(call.word.toString(16).toUpperCase()).toBe("60F00001");
    expect(call.moved).toEqual(["Y"]);
    expect(packedLayout(0x13123000)).toEqual({ ...courseLayout(0x13123000) });
  });
});

describe("the calculator", () => {
  it("runs Module 7's ALU: -184 - (-250) is 66, flags as Module 7 gives them", () => {
    const r = calculate(64, 3, -184n, -250n);
    expect([r.y.value, r.zero, r.minus, r.cout, r.over]).toEqual([66n, 0, 0, 1, 0]);
    const s = calculate(16, 2, 0x7fffn, 1n);
    expect([s.y.value, s.minus, s.over]).toEqual([0x8000n, 1, 1]);
  });
});
