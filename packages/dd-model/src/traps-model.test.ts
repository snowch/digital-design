// Copyright © 2026 Christopher Snow

// Module 12: the reference's traps, control registers, user mode and interrupts
// (docs/machine.md, "Traps and interrupts"), on small programs written in the course's assembly.

import { describe, expect, it } from "vitest";

import { assemble, assembleChecked } from "./assemble";
import { debugFinish, debugStart, debugStep, type DebugState, type InputPlan } from "./debugger";
import { CAUSES, MODULE_9, MODULE_12, QUIET_INPUTS, resetMachine, run, step } from "./machine";
import { gradeProgramCase } from "./program-tests";

const start = (src: string) => debugStart(assemble(src).rom);
const finish = (src: string, plan: InputPlan = QUIET_INPUTS) =>
  debugFinish(start(src), plan, MODULE_12);
const steps = (src: string, n: number, plan: InputPlan = QUIET_INPUTS) => {
  let s: DebugState = start(src);
  for (let i = 0; i < n; i++) s = debugStep(s, plan, MODULE_12);
  return s;
};

// A program that stores to room A's sensor at 00C (cause 34), with a handler at `handler`.
const STORE_TO_SENSOR = `
        R1 <= handler
        C4 <= R1
        R2 <= 7
        word[sensorA] <= R2
        word[display] <= R2
        stop
handler: R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        resume`;

describe("a trap goes to the handler (Module 12)", () => {
  it("with no handler, as at reset, a trap halts the machine with its cause", () => {
    const s = finish("R2 <= 7\nword[sensorA] <= R2\nstop");
    expect(s.stopped).toMatchObject({ kind: "machine", reason: { kind: "trap", cause: 0x34 } });
    expect(s.cpu.control).toEqual([1n, 0n, 0n, 0n, 0n]);
  });

  it("at the trap's edge C2, C1, C0, C3 and the PC change, and nothing else", () => {
    const before = steps(STORE_TO_SENSOR, 3);
    const after = debugStep(before, QUIET_INPUTS, MODULE_12);
    expect(after.last?.trap).toEqual({ cause: 0x34, returnPoint: 0xcn });
    expect(after.cpu.pc).toBe(BigInt(assemble(STORE_TO_SENSOR).labels["handler"]!));
    expect(after.cpu.control).toEqual([1n, 1n, 0xcn, 0x34n, after.cpu.pc]);
    expect(after.cpu.regs).toEqual(before.cpu.regs);
    expect(after.cpu.ram).toEqual(before.cpu.ram);
    expect(after.ran).toBe(before.ran);
    expect(after.traps).toMatchObject([{ at: 0xcn, cause: 0x34, returnPoint: 0xcn, after: 3 }]);
    expect(after.traps[0]?.regs).toEqual(after.cpu.regs);
  });

  it("a handler that adds 4 to C2 skips the instruction, and the program goes on", () => {
    const s = finish(STORE_TO_SENSOR);
    expect(s.stopped).toMatchObject({ reason: { kind: "stop" } });
    expect(s.cpu.display).toBe(7n);
    expect(s.traps).toHaveLength(1);
  });

  it("a handler that only resumes runs the instruction again, for ever", () => {
    const s = finish(STORE_TO_SENSOR.replace("R5 <= R5 + 4", "nothing"));
    expect(s.stopped?.kind).toBe("cutOff");
  });

  it("a trap at the handler's own address halts the machine", () => {
    const s = finish("R1 <= h\nC4 <= R1\nR2 <= 7\nh: word[sensorA] <= R2\nstop");
    // The first trap goes to h; h traps again, at the address C4 holds.
    expect(s.traps).toHaveLength(0);
    expect(s.stopped).toMatchObject({ reason: { kind: "trap", cause: 0x34 }, pc: 0xcn });
  });

  it("call system returns to the next instruction; R3 <= C3 reads the cause", () => {
    const s = finish(
      "R1 <= h\nC4 <= R1\ncall system\nword[display] <= R3\nstop\nh: R3 <= C3\nresume",
    );
    expect(s.traps[0]).toMatchObject({ cause: 0x41, returnPoint: 0xcn });
    expect(s.cpu.display).toBe(0x41n);
  });

  it("the control registers keep their own widths when written", () => {
    const s = finish("R1 <= -1\nC0 <= R1\nC1 <= R1\nC2 <= R1\nC3 <= R1\nC4 <= R1\nstop");
    // C0 keeps bits 1 and 0, so 3: system mode, interrupts on; C3 keeps 8 bits.
    expect(s.cpu.control).toEqual([3n, 3n, (1n << 64n) - 1n, 0xffn, (1n << 64n) - 1n]);
  });
});

describe("user mode (Module 12)", () => {
  // The handler drops to user mode at `user` with resume; the user program's fault traps back.
  const inUser = (body: string) => `
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1
        R1 <= user
        C2 <= R1
        resume
handler: R9 <= C3
        word[display] <= R9
        stop
user:   ${body}`;

  it("refuses stop, resume and the control-register jobs (22)", () => {
    for (const body of ["stop", "resume", "R1 <= C0", "C4 <= R1"]) {
      const s = finish(inUser(body));
      expect(s.cpu.display, body).toBe(0x22n);
      expect(s.cpu.control[1], body).toBe(0n);
    }
  });

  it("refuses a device's address (32), even a load, and lets the RAM be", () => {
    expect(finish(inUser("R2 <= word[sensorA]")).cpu.display).toBe(0x32n);
    expect(finish(inUser("word[display] <= R1")).cpu.display).toBe(0x32n);
    const ram = finish(inUser("R2 <= 5\nword[0x400] <= R2\nword[display] <= R2"));
    expect(ram.cpu.display).toBe(0x32n);
    expect(ram.traps[0]?.at).toBe(
      BigInt(
        assemble(inUser("R2 <= 5\nword[0x400] <= R2\nword[display] <= R2")).labels["user"]! + 8,
      ),
    );
  });

  it("an illegal word wins over 22; no memory wins over 32", () => {
    expect(finish(inUser("word 0")).cpu.display).toBe(0x21n);
    expect(finish(inUser("R2 <= word[0x7F8]")).cpu.display).toBe(0x31n);
  });

  it("call system is allowed in user mode", () => {
    const s = finish(inUser("call system"));
    expect(s.cpu.display).toBe(0x41n);
  });
});

describe("interrupts (Module 12)", () => {
  // The timer set to 3; interrupts on in user mode (C1 = 2); the handler counts and clears.
  const TIMED = `
        R1 <= handler
        C4 <= R1
        R1 <= 3
        word[timer] <= R1
        R1 <= 2
        C1 <= R1
        R1 <= user
        C2 <= R1
        resume
handler: R9 <= C3
        word[display] <= R9
        R8 <= C2
        word[0x400] <= R8
        stop
user:   R2 <= 1
        R2 <= R2 + 1
        R2 <= R2 + 1
        R2 <= R2 + 1
        R2 <= R2 + 1`;

  it("the timer's interrupt is taken between two instructions; the next is not run", () => {
    const s = finish(TIMED);
    const user = assemble(TIMED).labels["user"]!;
    // The count, written as 3, goes down as each later instruction finishes.
    expect(s.cpu.display).toBe(0x81n);
    expect(s.traps[0]?.cause).toBe(0x81);
    expect(s.traps[0]?.returnPoint).toBe(s.traps[0]?.at);
    expect(Number(s.traps[0]!.at)).toBeGreaterThanOrEqual(user);
  });

  it("with interrupts off, a waiting event waits", () => {
    const s = finish(TIMED.replace("R1 <= 2\n", "R1 <= 0\n"));
    // The user program runs off its end into a word of 0s (21); the timer's event still waits.
    expect(s.traps.map((t) => t.cause)).toEqual([0x21]);
    expect(s.cpu.waiting).toBe(1);
  });

  it("the door opens before a chosen instruction and traps with 82", () => {
    const quiet = TIMED.replace("R1 <= 3\n        word[timer] <= R1\n", "");
    const s = finish(quiet, { ...QUIET_INPUTS, doorOpensAt: 9 });
    // The door is seen at the edge that ends the instruction it opened before; the interrupt is
    // taken at the next edge.
    expect(s.traps[0]).toMatchObject({ cause: 0x82, after: 10 });
  });

  it("the timer first when both wait; a fetch's own cause first of all", () => {
    let st = resetMachine([]);
    st = { ...st, pc: 0x400n, waiting: 3, control: [2n, 0n, 0n, 0n, 0x100n] };
    expect(step(st, QUIET_INPUTS, MODULE_12).record.trap?.cause).toBe(CAUSES.outsideRom);
    st = { ...st, pc: 0x0n };
    expect(step(st, QUIET_INPUTS, MODULE_12).record.trap?.cause).toBe(CAUSES.timer);
  });

  it("a trap's edge does not count the timer down", () => {
    let st = resetMachine(assemble("R2 <= 7\nword[sensorA] <= R2").rom);
    st = {
      ...st,
      pc: 4n,
      regs: st.regs.map(() => 7n),
      timer: 5n,
      control: [1n, 0n, 0n, 0n, 0x40n],
    };
    expect(step(st, QUIET_INPUTS, MODULE_12).state.timer).toBe(5n);
  });
});

describe("Modules 8 to 11 are unchanged", () => {
  it("system jobs 1 to 3 stop as a later module's without the traps option", () => {
    const rom = assemble("R1 <= C3").rom;
    expect(run(resetMachine(rom), 5, QUIET_INPUTS, MODULE_9).state.stopped?.reason).toEqual({
      kind: "later",
    });
  });
});

describe("the learner's assembler and the grader (Module 12)", () => {
  it("refuses a control register outside C0 to C4; the authors' tool still makes it", () => {
    expect(assembleChecked("R1 <= C5\nC7 <= R2").problems.map((p) => p.code)).toEqual([
      "controlRegister",
      "controlRegister",
    ]);
    expect(assemble("R0 <= C5").rom.length).toBeGreaterThan(0);
  });

  it("checks the control registers, the mode, the traps and a door", () => {
    const r = gradeProgramCase(
      STORE_TO_SENSOR,
      { traps: "yes" },
      { C2: "010", C3: "34", C0: "01", mode: "system", traps: "1", causes: "34", display: "7" },
    );
    expect(r.wrong).toEqual([]);
  });
});
