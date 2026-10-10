// Copyright © 2026 Christopher Snow

// Module 13: the modules the course supplies to a text that joins the final machine's parts, each
// built from the same functions as the drawn final machine (packages/dd-model: traps.ts), so the
// text and the drawing are the same parts and one comparison with the model runs both. The lab's
// learner writes the top module: the joins between these parts, and the small parts between them
// (the PC, the IR, the held words, the selectors and the next PC's choice).
//
// - `registers`, `alu` and `condition`: Module 8's, as `machineModules` gives them.
// - `memory`: the memory of one port with Module 12's user mode, timer tick and waiting events.
// - `decoder`: Module 10's capstone's decoder, which knows kind 9 and kind A (SET).
// - `system`: Module 12's system jobs beside the decoder.
// - `controller`: Module 12's controller.
// - `traplogic`: Module 12's trap logic.
// - `cregs`: Module 12's control registers.

import {
  controlDecoder,
  controlRegisters,
  decoderOutputs,
  machineMemory,
  systemJobs12,
  trapController,
  trapLogic,
  type MemoryPorts,
} from "@dd/dd-model";
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
  TICK: 1,
  USER: 1,
  RST: 1,
  CLK: 1,
  DOOR: 1,
  WARM: 1,
  SENSORA: 64,
  SENSORB: 64,
};

const MEMORY_OUTPUTS = {
  FETCHED: 32,
  CAUSEF: 8,
  MQ: 64,
  CAUSEM: 8,
  DISPLAY: 64,
  LAMPS: 3,
  WAITING: 2,
};

/** The final decoder's options: the call through a register and set if. */
const FINAL = { callThroughRegister: true, setIf: true } as const;

/** The ports of each module, by name: the lab's specification lists these. */
export const MACHINE13_PORTS: Readonly<
  Record<
    string,
    {
      readonly inputs: Readonly<Record<string, number>>;
      readonly outputs: Readonly<Record<string, number>>;
    }
  >
> = {
  memory: { inputs: MEMORY_INPUTS, outputs: MEMORY_OUTPUTS },
  decoder: {
    inputs: { K: 4, J: 4, C: 12 },
    outputs: Object.fromEntries(decoderOutputs(FINAL).map((n) => [n, n === "CAUSED" ? 8 : 1])),
  },
  system: {
    inputs: { STOP: 1, J: 4, USER: 1, CAUSED: 8, WRITEY: 1 },
    outputs: { RESUME: 1, CREAD: 1, CWRITE: 1, CREG: 1, HALTJOB: 1, CAUSET: 8, WRITEYT: 1 },
  },
  controller: {
    inputs: {
      CLK: 1,
      RST: 1,
      GO: 1,
      TRAP: 1,
      CALL: 1,
      CREG: 1,
      MEM: 1,
      LOAD: 1,
      STORE: 1,
      WRITEY: 1,
      CWRITE: 1,
      RESUME: 1,
    },
    outputs: {
      S: 3,
      CHECKING: 1,
      FETCHING: 1,
      IREN: 1,
      HOLDAB: 1,
      HOLDR: 1,
      MLOAD: 1,
      MSTORE: 1,
      HOLDM: 1,
      WREG: 1,
      PCEN: 1,
      CWEN: 1,
      RESUMING: 1,
    },
  },
  traplogic: {
    inputs: {
      CAUSEF: 8,
      CAUSED: 8,
      CAUSEM: 8,
      STOP: 1,
      CHECKING: 1,
      FETCHING: 1,
      WAITING: 2,
      IE: 1,
      NOHANDLER: 1,
    },
    outputs: { HALT: 1, CAUSE: 8, GO: 1, TRAP: 1 },
  },
  cregs: {
    inputs: {
      HA: 64,
      C: 12,
      PC: 64,
      PC4: 64,
      CAUSE: 8,
      TRAP: 1,
      RESUMING: 1,
      CWEN: 1,
      RST: 1,
      CLK: 1,
    },
    outputs: { CWORD: 64, C2: 64, C4: 64, STATUS: 2, NOHANDLER: 1 },
  },
};

const ports = (name: string) => () => MACHINE13_PORTS[name] as (typeof MACHINE13_PORTS)[string];

/** Every net of a module's ports, by name, for a builder that takes them as one record. */
const all = (
  ins: Readonly<Record<string, NetId>>,
  names: Readonly<Record<string, number>>,
): Record<string, NetId> => Object.fromEntries(Object.keys(names).map((n) => [n, need(ins, n)]));

/** The course's modules for a text of the final machine, with the program it starts from. */
export function machine13Modules(context: MachineContext = {}): Record<string, CourseModule> {
  const { registers, alu, condition } = machineModules(context);
  const p = MACHINE13_PORTS;
  return {
    registers: registers as CourseModule,
    alu: alu as CourseModule,
    condition: condition as CourseModule,
    memory: {
      ports: ports("memory"),
      build: (b, ins, outs) => {
        const port = all(ins, MEMORY_INPUTS);
        machineMemory(
          b,
          { ...port, PC: need(ins, "ADDR") } as unknown as MemoryPorts,
          context.rom,
          {
            IR: need(outs, "FETCHED"),
            CAUSEF: need(outs, "CAUSEF"),
            MQ: need(outs, "MQ"),
            CAUSEM: need(outs, "CAUSEM"),
            DISPLAY: need(outs, "DISPLAY"),
            LAMPS: need(outs, "LAMPS"),
            WAITING: need(outs, "WAITING"),
          },
          false,
        );
      },
    },
    decoder: {
      ports: ports("decoder"),
      build: (b, ins, outs) => {
        controlDecoder(
          b,
          { K: need(ins, "K"), J: need(ins, "J"), C: need(ins, "C") },
          { outs: all(outs, p["decoder"]!.outputs), scoped: false },
          FINAL,
        );
      },
    },
    system: {
      ports: ports("system"),
      build: (b, ins, outs) => {
        systemJobs12(
          b,
          all(ins, p["system"]!.inputs) as Parameters<typeof systemJobs12>[1],
          all(outs, p["system"]!.outputs) as Parameters<typeof systemJobs12>[2],
        );
      },
    },
    controller: {
      ports: ports("controller"),
      build: (b, ins, outs) => {
        trapController(
          b,
          all(ins, p["controller"]!.inputs) as Parameters<typeof trapController>[1],
          all(outs, p["controller"]!.outputs) as Parameters<typeof trapController>[2],
        );
      },
    },
    traplogic: {
      ports: ports("traplogic"),
      build: (b, ins, outs) => {
        trapLogic(
          b,
          all(ins, p["traplogic"]!.inputs) as Parameters<typeof trapLogic>[1],
          all(outs, p["traplogic"]!.outputs) as Parameters<typeof trapLogic>[2],
          false,
        );
      },
    },
    cregs: {
      ports: ports("cregs"),
      build: (b, ins, outs) => {
        controlRegisters(
          b,
          all(ins, p["cregs"]!.inputs) as Parameters<typeof controlRegisters>[1],
          all(outs, p["cregs"]!.outputs) as Parameters<typeof controlRegisters>[2],
        );
      },
    },
  };
}
