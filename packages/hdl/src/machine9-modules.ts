// Copyright © 2026 Christopher Snow

// Module 9: the modules the course supplies to a text that describes the machine of several edges
// an instruction, each built from the same parts as the drawn machine (packages/dd-model:
// multicycle.ts), so the text and the drawing are the same circuit and one comparison runs both.
// The decoder and the controller are the learner's to write, so they are not here.
//
// - `registers`, `alu` and `condition`: Module 8's, as `machineModules` gives them.
// - `memory`: the memory of one port: one address, the instruction at it given as FETCHED, the
//   fetch checks counted while FETCHING is 1, and the timer moved at an edge where ENDS is 1.
// - `stops`: whether an edge stops the machine, with the decoder's cause and STOP counted only
//   while CHECKING is 1.

import { edgeStops, machineMemory, type MemoryPorts } from "@dd/dd-model";
import type { NetId } from "@dd/sim";

import type { CourseModule } from "./elaborate";
import { machineModules, type MachineContext } from "./machine-modules";

const need = (nets: Readonly<Record<string, NetId>>, name: string) => {
  const n = nets[name];
  if (n === undefined) throw new RangeError(`no net for ${name}`);
  return n;
};

const MEMORY_INPUTS = {
  ADDR: 64,
  FETCHING: 1,
  LOAD: 1,
  STORE: 1,
  BYTE: 1,
  D: 64,
  GO: 1,
  ENDS: 1,
  RST: 1,
  CLK: 1,
  DOOR: 1,
  WARM: 1,
  SENSORA: 64,
  SENSORB: 64,
};

const MEMORY_OUTPUTS = { FETCHED: 32, CAUSEF: 8, MQ: 64, CAUSEM: 8, DISPLAY: 64, LAMPS: 3 };

/** The course's modules for a text of Module 9's machine, with the program and registers it starts from. */
export function machine9Modules(context: MachineContext = {}): Record<string, CourseModule> {
  const { registers, alu, condition } = machineModules(context);
  return {
    registers: registers as CourseModule,
    alu: alu as CourseModule,
    condition: condition as CourseModule,
    memory: {
      ports: () => ({ inputs: MEMORY_INPUTS, outputs: MEMORY_OUTPUTS }),
      build: (b, ins, outs) => {
        const port = (n: string) => need(ins, n);
        const ports: MemoryPorts = {
          PC: port("ADDR"),
          ADDR: port("ADDR"),
          D: port("D"),
          LOAD: port("LOAD"),
          STORE: port("STORE"),
          BYTE: port("BYTE"),
          GO: port("GO"),
          RST: port("RST"),
          CLK: port("CLK"),
          DOOR: port("DOOR"),
          WARM: port("WARM"),
          SENSORA: port("SENSORA"),
          SENSORB: port("SENSORB"),
          FETCHING: port("FETCHING"),
          ENDS: port("ENDS"),
        };
        machineMemory(
          b,
          ports,
          context.rom,
          {
            IR: need(outs, "FETCHED"),
            CAUSEF: need(outs, "CAUSEF"),
            MQ: need(outs, "MQ"),
            CAUSEM: need(outs, "CAUSEM"),
            DISPLAY: need(outs, "DISPLAY"),
            LAMPS: need(outs, "LAMPS"),
          },
          false,
        );
      },
    },
    stops: {
      ports: () => ({
        inputs: { CAUSEF: 8, CAUSED: 8, CAUSEM: 8, STOP: 1, CHECKING: 1 },
        outputs: { HALT: 1, CAUSE: 8, GO: 1 },
      }),
      build: (b, ins, outs) => {
        edgeStops(
          b,
          {
            CAUSEF: need(ins, "CAUSEF"),
            CAUSED: need(ins, "CAUSED"),
            CAUSEM: need(ins, "CAUSEM"),
            STOP: need(ins, "STOP"),
            CHECKING: need(ins, "CHECKING"),
          },
          { HALT: need(outs, "HALT"), CAUSE: need(outs, "CAUSE"), GO: need(outs, "GO") },
          false,
        );
      },
    },
  };
}
