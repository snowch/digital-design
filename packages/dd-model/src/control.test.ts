// Copyright © 2026 Christopher Snow

// Module 9: the decoder opened, against the reference and against Module 8's closed decoder, and
// the controller's table.

import { describe, expect, it } from "vitest";

import { CircuitBuilder, Simulator, word, type Circuit } from "@dd/sim";

import {
  CONTROL_SIGNALS,
  DECODER9_OUTPUTS,
  controllerMachine,
  decoderChecksCircuit,
  decoderCircuit,
  decoderSignalsCircuit,
} from "./control";
import { DECODER_OUTPUTS, decoder } from "./datapath";
import { machineProblems } from "./fsm";
import { MODULE_9, fieldsOf, isIllegal, resetMachine, step } from "./machine";
import { assemble } from "./assemble";

/** Every output of a circuit for one setting of its inputs. */
function outputs(sim: Simulator, given: Record<string, number>): Record<string, number> {
  for (const [name, v] of Object.entries(given)) {
    const input = sim.circuit.inputs.find((i) => i.name === name);
    if (!input) continue;
    sim.setInput(name, word(sim.circuit.nets[input.net]?.width ?? 1, v));
  }
  sim.settle();
  return Object.fromEntries(
    Object.entries(sim.outputs()).map(([n, w]) => [
      n,
      w.known === (1n << BigInt(w.width)) - 1n ? Number(w.value) : -1,
    ]),
  );
}

/** Module 8's decoder alone, K and J in. */
function module8Decoder(): Circuit {
  const b = new CircuitBuilder("module8");
  const outs = decoder(b, { K: b.input("K", 4), J: b.input("J", 4) }, DECODER_OUTPUTS.full);
  for (const n of DECODER_OUTPUTS.full) b.output(n, outs[n] as number);
  return b.build();
}

const C_VALUES = [0, 1, 4, 5, 7, 8, 0x7ff, 0x800, 0xffc, 0xfff];

describe("Module 9's decoder", () => {
  it("finds illegal every instruction the reference finds illegal, and no other", () => {
    const sim = new Simulator(decoderCircuit());
    for (let k = 0; k < 16; k++)
      for (let j = 0; j < 16; j++)
        for (const c of C_VALUES) {
          const f = fieldsOf(((k << 28) | (j << 24) | c) >>> 0);
          const out = outputs(sim, { K: k, J: j, C: c });
          const illegal = isIllegal(f, MODULE_9);
          const at = `K ${k}, J ${j}, C ${c.toString(16)}`;
          expect(out["CAUSED"], at).toBe(illegal ? 0x21 : k === 8 && j === 0 ? 0x41 : 0);
          // STOP is the job alone; where the instruction is also illegal, its cause wins in the stop logic.
          expect(out["STOP"], at).toBe(k === 8 && j >= 1 && j <= 4 ? 1 : 0);
        }
  });

  it("gives every legal instruction the control signals Module 8's decoder gives", () => {
    const ours = new Simulator(decoderCircuit());
    const theirs = new Simulator(module8Decoder());
    for (let k = 1; k <= 7; k++)
      for (let j = 0; j < 16; j++) {
        if (isIllegal(fieldsOf(((k << 28) | (j << 24)) >>> 0))) continue;
        const a = outputs(ours, { K: k, J: j, C: 0 });
        const b = outputs(theirs, { K: k, J: j });
        for (const s of CONTROL_SIGNALS) expect(a[s], `K ${k}, J ${j}: ${s}`).toBe(b[s]);
      }
  });

  it("is the same circuit drawn three ways: whole, its signals and its checks", () => {
    const whole = new Simulator(decoderCircuit());
    const signals = new Simulator(decoderSignalsCircuit());
    const checks = new Simulator(decoderChecksCircuit());
    for (let k = 0; k < 16; k++)
      for (let j = 0; j < 16; j++)
        for (const c of [0, 5, 0xfff]) {
          const a = outputs(whole, { K: k, J: j, C: c });
          const s = outputs(signals, { K: k, J: j });
          const x = outputs(checks, { K: k, J: j, C: c });
          for (const n of CONTROL_SIGNALS) expect(s[n], `K ${k} J ${j} ${n}`).toBe(a[n]);
          expect(x["CAUSED"]).toBe(a["CAUSED"]);
          expect(x["STOP"]).toBe(a["STOP"]);
          expect(x["ILLEGAL"]).toBe(a["CAUSED"] === 0x21 ? 1 : 0);
        }
    expect(Object.keys(outputs(whole, {}))).toEqual([...DECODER9_OUTPUTS]);
  });

  it("with the capstone's instruction, knows kind 9 job 0 as a call and a jump that adds", () => {
    const sim = new Simulator(decoderCircuit({ callThroughRegister: true }));
    const out = outputs(sim, { K: 9, J: 0, C: 8 });
    expect(out).toMatchObject({
      CAUSED: 0,
      WRITEY: 1,
      BCONST: 1,
      OP2: 0,
      OP1: 1,
      OP0: 0,
      CALL: 1,
      JUMP: 1,
      BRANCH: 0,
    });
    expect(outputs(sim, { K: 9, J: 1, C: 0 })["CAUSED"]).toBe(0x21);
    expect(outputs(sim, { K: 6, J: 0, C: 0 })).toMatchObject({ CALL: 1, JUMP: 0 });
    expect(outputs(sim, { K: 7, J: 0, C: 0 })).toMatchObject({ CALL: 0, JUMP: 1 });
  });
});

describe("the reference as Module 9's machine", () => {
  it("makes the check on a control register's number before stopping on the job", () => {
    for (const [source, reason] of [
      ["byte 5, 0, 0, 0x82", { kind: "trap", cause: 0x21 }],
      ["byte 0xFF, 0x0F, 0, 0x83", { kind: "trap", cause: 0x21 }],
      ["byte 4, 0, 0, 0x82", { kind: "later" }],
    ] as const) {
      const s = resetMachine(assemble(source).rom);
      expect(step(s, undefined, MODULE_9).state.stopped?.reason, source).toEqual(reason);
      // Module 8's machine, which does not check the number, stops on the job.
      expect(step(s).state.stopped?.reason, source).toEqual({ kind: "later" });
    }
  });

  it("runs the capstone's call through a register in the learner's copy alone", () => {
    const source = "R4 <= 12\ncall R4, R15\nstop\nR1 <= 7\ngoto R15";
    expect(() => assemble(source)).toThrow(/no call through a register/);
    const p = assemble(source, { callThroughRegister: 9 });
    expect(p.lines[1]?.instruction).toBe(0x9040f000);
    let s = resetMachine(p.rom);
    const options = { ...MODULE_9, callThroughRegister: 9 };
    for (let i = 0; i < 5; i++) s = step(s, undefined, options).state;
    expect(s.regs[15]).toBe(8n);
    expect(s.regs[1]).toBe(7n);
    expect(s.stopped?.reason).toEqual({ kind: "stop" });
    // Without it, kind 9 is illegal.
    expect(step(step(resetMachine(p.rom)).state).state.stopped?.reason).toEqual({
      kind: "trap",
      cause: 0x21,
    });
  });
});

describe("the controller", () => {
  it("is a state machine Module 5's checks accept, with the fetch at the all-zero code", () => {
    for (const options of [{}, { callThroughRegister: true }]) {
      const m = controllerMachine(options);
      expect(machineProblems(m)).toEqual([]);
      expect(m.states.find((s) => s.code === "000")?.name).toBe("FETCH");
    }
  });
});
