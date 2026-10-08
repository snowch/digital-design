// Copyright © 2026 Christopher Snow

// Module 8: the modules the course supplies to a text that describes the machine's datapath, each
// built from the same parts as the drawn datapath (packages/dd-model: datapath.ts), so the text
// and the drawing are the same circuit and a test runs one suite through both.
//
// - `registers`: the register file, 16 registers of 64 bits, two reads and one write.
// - `alu`: Module 7's ALU with its four flags, at the width its parameter N gives (64 by default).
// - `memory`: the memory map whole, the ROM holding the program a challenge gives.
// - `decoder`: the control signals from the kind and job digits, closed until Module 9.
// - `stops`: whether this edge stops the machine, and its cause.
// - `condition`: whether a branch is taken, from the flags and the job digit.

import {
  DECODER_OUTPUTS,
  DECODER_WIDTHS,
  aluParts,
  branchCondition,
  decoder,
  machineMemory,
  registerFile64,
  stopLogic,
  type MemoryPorts,
} from "@dd/dd-model";
import type { NetId } from "@dd/sim";

import type { CourseModule } from "./elaborate";

export interface MachineContext {
  /** The ROM's bytes. */
  readonly rom?: Uint8Array | readonly number[];
  /** The registers' words as the machine starts; `undefined` is unknown. */
  readonly registers?: readonly (bigint | undefined)[];
}

const need = (nets: Readonly<Record<string, NetId>>, name: string) => {
  const n = nets[name];
  if (n === undefined) throw new RangeError(`no net for ${name}`);
  return n;
};

const MEMORY_INPUTS: Record<
  Exclude<keyof MemoryPorts, "FETCHING" | "ENDS" | "USER" | "TICK">,
  number
> = {
  PC: 64,
  ADDR: 64,
  D: 64,
  LOAD: 1,
  STORE: 1,
  BYTE: 1,
  GO: 1,
  RST: 1,
  CLK: 1,
  DOOR: 1,
  WARM: 1,
  SENSORA: 64,
  SENSORB: 64,
};

const MEMORY_OUTPUTS = {
  IR: 32,
  CAUSEF: 8,
  MQ: 64,
  CAUSEM: 8,
  DISPLAY: 64,
  LAMPS: 3,
};

/** The course's modules for a datapath text, with the program and registers it starts from. */
export function machineModules(context: MachineContext = {}): Record<string, CourseModule> {
  return {
    registers: {
      ports: () => ({
        inputs: { RA: 4, RB: 4, WA: 4, D: 64, WE: 1, CLK: 1 },
        outputs: { QA: 64, QB: 64 },
      }),
      build: (b, ins, outs) => {
        registerFile64(
          b,
          {
            RA: need(ins, "RA"),
            RB: need(ins, "RB"),
            WA: need(ins, "WA"),
            D: need(ins, "D"),
            WE: need(ins, "WE"),
            CLK: need(ins, "CLK"),
          },
          context.registers,
          { outs, scoped: false },
        );
      },
    },
    alu: {
      parameters: { N: 64 },
      ports: (p) => {
        const n = p["N"] ?? 64;
        return {
          inputs: { A: n, B: n, OP2: 1, OP1: 1, OP0: 1 },
          outputs: { Y: n, ZERO: 1, MINUS: 1, COUT: 1, OVER: 1 },
        };
      },
      build: (b, ins, outs, p) => {
        aluParts(
          b,
          {
            A: need(ins, "A"),
            B: need(ins, "B"),
            OP2: need(ins, "OP2"),
            OP1: need(ins, "OP1"),
            OP0: need(ins, "OP0"),
          },
          { width: p["N"] ?? 64, flags: true, outs },
        );
      },
    },
    memory: {
      ports: () => ({ inputs: MEMORY_INPUTS, outputs: MEMORY_OUTPUTS }),
      build: (b, ins, outs) => {
        const port = (n: string) => need(ins, n);
        machineMemory(
          b,
          Object.fromEntries(
            Object.keys(MEMORY_INPUTS).map((n) => [n, port(n)]),
          ) as unknown as MemoryPorts,
          context.rom,
          Object.fromEntries(Object.keys(MEMORY_OUTPUTS).map((n) => [n, need(outs, n)])) as never,
          false,
        );
      },
    },
    decoder: {
      ports: () => ({
        inputs: { K: 4, J: 4 },
        outputs: Object.fromEntries(DECODER_OUTPUTS.full.map((n) => [n, DECODER_WIDTHS[n] ?? 1])),
      }),
      build: (b, ins, outs) => {
        decoder(b, { K: need(ins, "K"), J: need(ins, "J") }, DECODER_OUTPUTS.full, {
          outs,
          scoped: false,
        });
      },
    },
    stops: {
      ports: () => ({
        inputs: { CAUSEF: 8, CAUSED: 8, CAUSEM: 8, STOP: 1, WRITEY: 1 },
        outputs: { HALT: 1, CAUSE: 8, WREG: 1, GO: 1 },
      }),
      build: (b, ins, outs) => {
        stopLogic(
          b,
          { CAUSEF: need(ins, "CAUSEF"), CAUSED: need(ins, "CAUSED"), CAUSEM: need(ins, "CAUSEM") },
          { STOP: need(ins, "STOP"), WRITEY: need(ins, "WRITEY") },
          { HALT: need(outs, "HALT"), GO: need(outs, "GO"), WREG: need(outs, "WREG") },
          { outs, scoped: false },
        );
      },
    },
    condition: {
      ports: () => ({
        inputs: { J: 4, ZERO: 1, MINUS: 1, COUT: 1, OVER: 1 },
        outputs: { MET: 1 },
      }),
      build: (b, ins, outs) => {
        branchCondition(
          b,
          {
            J: need(ins, "J"),
            ZERO: need(ins, "ZERO"),
            MINUS: need(ins, "MINUS"),
            COUT: need(ins, "COUT"),
            OVER: need(ins, "OVER"),
          },
          { outs, scoped: false },
        );
      },
    },
  };
}
