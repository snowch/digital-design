// Copyright © 2026 Christopher Snow

// Module 8: the instruction-level reference and the authors' assembler, against docs/isa.md.

import { describe, expect, it } from "vitest";

import { assemble, listing } from "./assemble";
import {
  CAUSES,
  DEVICES,
  MASK64,
  fieldsOf,
  instructionHex,
  isIllegal,
  memoryCheck,
  ramWord,
  resetMachine,
  run,
  step,
  widen,
} from "./machine";

/** docs/isa.md's worked example: which room is colder? */
export const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`;

const signed = (n: number) => BigInt(n) & MASK64;

describe("the authors' assembler", () => {
  it("gives the worked example's six encodings", () => {
    const p = assemble(COLDER);
    expect(p.lines.map((l) => instructionHex(l.instruction ?? 0))).toEqual([
      "380027D8",
      "380037E0",
      "56230002",
      "15032000",
      "480207C0",
      "84000000",
    ]);
    expect(p.labels["show"]).toBe(0x10);
    expect(listing(p)[2]).toBe("008  56230002  if R2 < R3 signed goto show");
  });

  it("reads every form of docs/isa.md's table", () => {
    const cases: [string, string][] = [
      ["R3 <= R1 + R2", "12123000"],
      ["R3 <= R1 - R2", "13123000"],
      ["R3 <= R1 & R2", "10123000"],
      ["R3 <= R1 | R2", "14123000"],
      ["R3 <= R1 ^ R2", "11123000"],
      ["R3 <= R2", "15023000"],
      ["R3 <= R1 + 1", "16103000"],
      ["R3 <= R1 - 1", "17103000"],
      ["R3 <= R1 + 100", "22103064"],
      ["R3 <= R1 - 8", "23103008"],
      ["R3 <= R1 & 0xFF", "201030FF"],
      ["R3 <= 25", "25003019"],
      ["R1 <= -184", "25001F48"],
      ["R3 <= word[R1 + 8]", "30103008"],
      ["R3 <= byte[R1]", "31103000"],
      ["word[R1 + 8] <= R2", "40120008"],
      ["byte[R1] <= R2", "41120000"],
      ["goto R15", "70F00000"],
      ["goto R3 + 16", "70300010"],
      ["call system", "80000000"],
      ["resume", "81000000"],
      ["R3 <= C3", "82003003"],
      ["C4 <= R3", "83300004"],
      ["stop", "84000000"],
      ["nothing", "51000000"],
    ];
    for (const [text, hex] of cases)
      expect(instructionHex(assemble(text).lines[0]?.instruction ?? 0), text).toBe(hex);
  });

  it("counts a branch's and a call's constant in instructions from itself", () => {
    const p = assemble("top: nothing\nif R1 != R2 goto top\ncall top, R15\ngoto top");
    expect(p.lines.map((l) => instructionHex(l.instruction ?? 0))).toEqual([
      "51000000",
      "53120FFF",
      "6000FFFE",
      "50000FFD",
    ]);
  });

  it("puts words at a multiple of 8, low byte first, and refuses what it cannot write", () => {
    const p = assemble("stop\nlimits: word -250, -184");
    expect(p.labels["limits"]).toBe(8);
    expect(Array.from(p.rom.slice(8, 10))).toEqual([0x06, 0xff]);
    expect(() => assemble("if R1 > R2 goto x")).toThrow(/swap/);
    expect(() => assemble("R1 <= 5000")).toThrow(/-2048 to 2047/);
  });
});

describe("the instruction-level reference", () => {
  it("runs the worked example: room B is colder, and the display shows -250", () => {
    const { state, records } = run(resetMachine(assemble(COLDER).rom), 20, {
      door: 0,
      warm: 0,
      sensorA: signed(-184),
      sensorB: signed(-250),
    });
    expect(records).toHaveLength(6);
    expect(records[2]?.nextPc).toBe(0x00cn);
    expect(state.display).toBe(signed(-250));
    expect(state.stopped?.reason).toEqual({ kind: "stop" });
    expect(state.stopped?.pc).toBe(0x014n);
  });

  it("widens the constant by copying bit 11", () => {
    expect(widen(0xf48)).toBe(signed(-184));
    expect(widen(0x7ff)).toBe(2047n);
    expect(fieldsOf(0x25001f48).c).toBe(-184);
  });

  it("knows the illegal instructions", () => {
    for (const hex of [
      0x00000000, 0x18000000, 0x32000000, 0x61000000, 0x85000000, 0x82000005, 0x82000fff,
      0x90000000,
    ])
      expect(isIllegal(fieldsOf(hex)), instructionHex(hex)).toBe(true);
    for (const hex of [0x12123000, 0x39000000, 0x57000000, 0x82000004, 0x84000000])
      expect(isIllegal(fieldsOf(hex)), instructionHex(hex)).toBe(false);
  });

  it("checks memory in the order the causes are numbered", () => {
    expect(memoryCheck(0x800n, false, false)).toBe(CAUSES.noMemory);
    expect(memoryCheck(0x7f8n, false, false)).toBe(CAUSES.noMemory);
    expect(memoryCheck(1n << 40n, true, true)).toBe(CAUSES.noMemory);
    expect(memoryCheck(0x404n, false, false)).toBe(CAUSES.misaligned);
    expect(memoryCheck(0x7c1n, true, true)).toBe(CAUSES.misaligned);
    expect(memoryCheck(0x7c0n, false, true)).toBe(CAUSES.misaligned);
    expect(memoryCheck(0x003n, true, false)).toBe(CAUSES.misaligned);
    expect(memoryCheck(0x003n, true, true)).toBe(CAUSES.readOnly);
    expect(memoryCheck(0x7d8n, true, false)).toBe(CAUSES.readOnly);
    expect(memoryCheck(0x7e8n, true, false)).toBeUndefined();
    expect(memoryCheck(0x7bfn, true, true)).toBeUndefined();
  });

  it("stops at a fetch outside the ROM or not at a multiple of 4, changing nothing", () => {
    const off = run(resetMachine(assemble("R1 <= 0x400\ngoto R1").rom)).state;
    expect(off.stopped?.reason).toEqual({ kind: "trap", cause: CAUSES.outsideRom });
    expect(off.stopped?.pc).toBe(0x400n);
    const odd = run(resetMachine(assemble("R1 <= 6\ngoto R1").rom)).state;
    expect(odd.stopped?.reason).toEqual({ kind: "trap", cause: CAUSES.notMultipleOf4 });
    const zero = run(resetMachine(assemble("R1 <= 5").rom)).state;
    expect(zero.stopped).toEqual({ reason: { kind: "trap", cause: CAUSES.illegal }, pc: 4n });
    expect(zero.regs[1]).toBe(5n);
  });

  it("stores bytes and words little-endian and reads them back", () => {
    const p = assemble(`R1 <= 0x400
R2 <= -2
word[R1 + 8] <= R2
R3 <= 0x41
byte[R1 + 9] <= R3
R4 <= word[R1 + 8]
R5 <= byte[R1 + 8]
stop`);
    const { state } = run(resetMachine(p.rom));
    expect(ramWord(state, 0x408)).toBe((signed(-2) & ~0xff00n) | 0x4100n);
    expect(state.regs[4]).toBe(ramWord(state, 0x408));
    expect(state.regs[5]).toBe(0xfen);
  });

  it("runs the devices: the lamps, the timer and waiting, and the door's event", () => {
    const p = assemble(`R1 <= 2
word[timer] <= R1
R2 <= 7
word[lamps] <= R2
R3 <= word[waiting]
stop`);
    const { state } = run(resetMachine(p.rom), 20, { door: 0, warm: 1, sensorA: 0n, sensorB: 0n });
    // The write sets 2; the next two instructions count it down to 0, and bit 0 is set.
    expect(state.timer).toBe(0n);
    expect(state.waiting & 1).toBe(1);
    expect(state.lamps).toBe(7);
    expect(state.regs[3]).toBe(1n);
    let s = resetMachine(assemble("nothing\nnothing\nstop").rom);
    s = step(s, { door: 0, warm: 0, sensorA: 0n, sensorB: 0n }).state;
    s = step(s, { door: 1, warm: 0, sensorA: 0n, sensorB: 0n }).state;
    expect(s.waiting).toBe(2);
    // A reset counts the door as closed, so a door already open sets the bit at the first edge.
    const first = step(resetMachine(assemble("stop").rom), {
      door: 1,
      warm: 0,
      sensorA: 0n,
      sensorB: 0n,
    });
    expect(first.state.waiting).toBe(2);
  });

  it("calls and jumps back", () => {
    const p = assemble(`call twice, R15
word[display] <= R1
stop
twice: R1 <= 21
R1 <= R1 + R1
goto R15`);
    const { state } = run(resetMachine(p.rom));
    expect(state.display).toBe(42n);
    expect(state.regs[15]).toBe(4n);
    expect(DEVICES.display).toBe(0x7c0);
  });
});
