// Copyright © 2026 Christopher Snow

// Module 8's circuits, by the id a lesson names them with: the datapath at each stage, placed for
// the figures that draw it. A figure that runs a program or starts from given registers builds the
// same circuit with them (`placedDatapath`), so the drawing is the library's.

import type { Circuit } from "@dd/sim";

import { datapathCircuit, type DatapathOptions, type Stage } from "./datapath";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;
/** Wires routed by hand, keyed `from.port>to.port`: where each turns, across then up or down. */
type Routes = Readonly<Record<string, readonly number[]>>;

/**
 * A circuit's wires routed by hand where its drawing gives a route: each route is kept on the
 * part (or the input pin's net) the wire leaves, where the drawing reads it.
 */
export function routed(circuit: Circuit, routes: Routes): Circuit {
  const bySource = new Map<string, Record<string, readonly number[]>>();
  for (const [key, route] of Object.entries(routes)) {
    const source = key.slice(0, key.indexOf("."));
    bySource.set(source, { ...(bySource.get(source) ?? {}), [key]: route });
  }
  const withRoutes = <T extends { meta?: Readonly<Record<string, unknown>> }>(
    x: T,
    source: string,
  ): T => {
    const r = bySource.get(source);
    return r ? { ...x, meta: { ...(x.meta ?? {}), routes: r } } : x;
  };
  return {
    ...circuit,
    components: circuit.components.map((c) => (c.path.includes("/") ? c : withRoutes(c, c.name))),
    composites: circuit.composites.map((c) => (c.path.includes("/") ? c : withRoutes(c, c.name))),
    nets: circuit.nets.map((n) => {
      const input = circuit.inputs.find((i) => i.net === n.id);
      return input ? withRoutes(n, `input:${input.name}`) : n;
    }),
  };
}

/** Hand-placed drawings of each stage's top level, in grid cells. */
export const DATAPATH_AT: Readonly<Record<Stage, At>> = {
  jobs: {
    "in:IR": [3, 5],
    "in:WRITEY": [3, 13.5],
    "in:CLK": [8, 14.5],
    digits: [8, 2.5],
    jobBits: [16, 2],
    registers: [16, 9.5],
    alu: [24, 1],
    "out:RESULT": [33, 1],
  },
  constants: {
    "in:IR": [3, 5],
    "in:WRITEY": [3, 13.5],
    "in:CLK": [8, 14.5],
    "in:BCONST": [3, 20],
    digits: [8, 2.5],
    jobBits: [16, 2],
    registers: [16, 9.5],
    widen: [16, 18],
    pickB: [22, 12.5],
    alu: [28, 1],
    "out:RESULT": [37, 1],
  },
  fetch: {
    "in:RST": [0, 9],
    "in:CLK": [0, 11],
    pc: [8, 8],
    rom: [15, 8.5],
    plus4: [15, 14],
    digits: [25, 8],
    decoder: [32, 5],
    stops: [41, 0],
    registers: [32, 16],
    widen: [32, 24],
    pickB: [41, 15],
    alu: [49, 9],
    "out:HALT": [54, 1],
    "out:CAUSE": [54, 3],
  },
  memory: {
    "in:RST": [0, 13],
    "in:CLK": [0, 15],
    pc: [6, 12],
    plus4: [12, 17],
    digits: [19, 12],
    decoder: [26, 7.5],
    registers: [26, 21],
    widen: [26, 29],
    pickA: [35, 23],
    pickB: [35, 27],
    alu: [43, 15.5],
    "in:DOOR": [50, 19.5],
    "in:WARM": [50, 21.5],
    "in:SENSORA": [50, 23.5],
    "in:SENSORB": [50, 25.5],
    memory: [61, 10.5],
    stops: [73, 2],
    pickLoad: [73, 15],
    "out:HALT": [83, 1.5],
    "out:CAUSE": [83, 3.5],
    "out:DISPLAY": [83, 21],
    "out:LAMPS": [83, 23],
  },
  full: {
    "in:RST": [0, 14],
    "in:CLK": [0, 16],
    pc: [6, 13],
    digits: [19, 13],
    decoder: [26, 7],
    registers: [26, 23.5],
    widen: [26, 31.5],
    pickA: [35, 25.5],
    pickB: [35, 29.5],
    alu: [43, 14.5],
    condition: [49, 14.5],
    next: [57, 14.5],
    "in:DOOR": [67, 19],
    "in:WARM": [67, 21],
    "in:SENSORA": [67, 23],
    "in:SENSORB": [67, 25],
    memory: [74, 10],
    stops: [85, 1.5],
    yWord: [85, 14.5],
    "out:HALT": [95, 2],
    "out:CAUSE": [95, 4],
    "out:DISPLAY": [95, 21.5],
    "out:LAMPS": [95, 23.5],
  },
};

/** Hand routes for the stages whose drawings the router alone cannot keep clear. */
export const DATAPATH_ROUTES: Readonly<Record<Stage, Routes>> = {
  jobs: {},
  constants: {},
  fetch: {},
  memory: {
    // The PC along the top to the memory's fetch port, and down to +4.
    "pc.Q>memory.PC": [10.5, 5.5, 60.5],
    "pc.Q>plus4.PC": [10.5],
    // PC + 4 back over the top of the PC into its D.
    "plus4.SUM>pc.D": [16, 10.5, 5.5],
    // The decoder's stop signals up to the stop logic.
    "decoder.AZERO>pickA.AZERO": [33.5],
    "decoder.BCONST>pickB.S": [33],
    "widen.W>pickB.B": [34],
    "decoder.CAUSED>stops.CAUSED": [30.5],
    "decoder.STOP>stops.STOP": [31],
    "decoder.WRITEY>stops.WRITEY": [31.5],
    // The ALU's result: the address, and over the memory to the selector for register Y.
    "alu.Y>memory.ADDR": [49],
    "alu.Y>pickLoad.A": [49, 8, 72],
    "decoder.LOAD>pickLoad.S": [59, 8.5, 71],
    // The memory's causes up to the stop logic, and its devices out to their pins.
    "memory.CAUSEF>stops.CAUSEF": [68.5],
    "memory.CAUSEM>stops.CAUSEM": [69.5],
    "memory.DISPLAY>output:DISPLAY.a": [70.5],
    "memory.LAMPS>output:LAMPS.a": [70],
    // The shop's inputs up into the memory.
    "input:WARM.y>memory.WARM": [54],
    "input:SENSORA.y>memory.SENSORA": [54.5],
    "input:SENSORB.y>memory.SENSORB": [55],
    // Register B's word along the bottom to the memory, and down to the selector for B.
    "registers.QB>memory.D": [31.5, 31.5, 59.5],
    "registers.QB>pickB.A": [31.5],
    // The loops back, each in a channel of its own under the parts.
    "stops.GO>memory.GO": [79, 32, 58.5],
    "stops.GO>pc.EN": [79, 32, 4.5],
    "stops.WREG>registers.WE": [79.5, 32.5, 25],
    "pickLoad.Y>registers.D": [77, 33, 24.5],
    "memory.IR>digits.IR": [68.5, 33.5, 18],
    // The reset and the clock along the bottom to the memory and the register file.
    "input:RST.y>memory.RST": [3.5, 34, 57],
    "input:CLK.y>memory.CLK": [3, 34.5, 57.5],
    "input:CLK.y>registers.CLK": [3, 34.5, 25.5],
  },
  full: {
    // The PC along the top: to the next-PC block, and down into the memory's fetch port.
    "pc.Q>memory.PC": [10.5, 5, 73],
    "pc.Q>next.PC": [10.5, 5, 56],
    // The next PC back along the bottom into the PC's D.
    "next.NEXT>pc.D": [63, 38, 4],
    // The job digit over the decoder to the branch condition.
    "digits.J>condition.J": [23, 5.5, 48.5],
    // The decoder's stop signals up to the stop logic, and its signals for the ALU's inputs.
    "decoder.CAUSED>stops.CAUSED": [30.5],
    "decoder.STOP>stops.STOP": [31],
    "decoder.WRITEY>stops.WRITEY": [31.5],
    "decoder.AZERO>pickA.AZERO": [34],
    "decoder.BCONST>pickB.S": [33.5],
    "widen.W>pickB.B": [34],
    "pickA.Y>alu.A": [39.5],
    "pickB.Y>alu.B": [40],
    "decoder.OP2>alu.OP2": [42],
    "decoder.OP1>alu.OP1": [41.5],
    "decoder.OP0>alu.OP0": [41],
    // The branch, the call and the jump under the ALU to the next-PC block.
    "decoder.BRANCH>next.BRANCH": [33, 23, 55],
    "decoder.CALL>next.CALL": [32.5, 23.5, 55.5],
    "decoder.JUMP>next.JUMP": [32, 24, 56],
    "widen.W>next.WIDE": [34, 34.5, 56.5],
    // The ALU's result along the top: the address, the next PC, and the word for register Y.
    "alu.Y>memory.ADDR": [48, 8, 72.5],
    "alu.Y>next.RESULT": [48, 8, 55.5],
    "alu.Y>yWord.RESULT": [48, 8, 84],
    "decoder.LOAD>yWord.LOAD": [70, 8.5, 83.5],
    "decoder.CALL>yWord.CALL": [32.5, 23.5, 55.5, 28, 84.5],
    "next.PC4>yWord.PC4": [63.5, 27, 84],
    // The memory's causes up to the stop logic, and its devices out to their pins.
    "memory.CAUSEF>stops.CAUSEF": [82],
    "memory.CAUSEM>stops.CAUSEM": [82.5],
    "memory.DISPLAY>output:DISPLAY.a": [82, 22.1],
    "memory.LAMPS>output:LAMPS.a": [81.5, 24.1],
    // The shop's inputs up into the memory.
    "input:WARM.y>memory.WARM": [71],
    "input:SENSORA.y>memory.SENSORA": [71.5],
    "input:SENSORB.y>memory.SENSORB": [72],
    // Register B's word along the bottom to the memory, and down to the selector for B.
    "registers.QB>memory.D": [31.5, 35.5, 65],
    "registers.QB>pickB.A": [31.5],
    // The loops back, each in a channel of its own under the parts.
    "yWord.YIN>registers.D": [90.5, 36, 24.5],
    "stops.WREG>registers.WE": [91, 36.5, 25],
    "stops.GO>memory.GO": [91.5, 37, 65.5],
    "stops.GO>pc.EN": [91.5, 37, 4.5],
    "memory.IR>digits.IR": [81, 37.5, 18],
    // The reset and the clock along the bottom to the memory and the register file.
    "input:RST.y>memory.RST": [3.5, 38.5, 66],
    "input:CLK.y>memory.CLK": [3, 39, 66.5],
    "input:CLK.y>registers.CLK": [3, 39, 25.5],
  },
};

/** Hand-placed insides of Module 8's blocks a learner opens, by kind. */
export const DATAPATH_INSIDE: Readonly<Record<string, At>> = {};

let placeFn: Place | undefined;

/** The datapath at a stage, placed as its figure draws it, with a program and registers. */
export function placedDatapath(options: DatapathOptions): Circuit {
  const circuit = datapathCircuit(options);
  const at = DATAPATH_AT[options.stage];
  const placedCircuit = placeFn && Object.keys(at).length ? placeFn(circuit, at) : circuit;
  const routes = DATAPATH_ROUTES[options.stage];
  return Object.keys(routes).length ? routed(placedCircuit, routes) : placedCircuit;
}

export function datapathLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  placeFn = place;
  return {
    "datapath-jobs": () => placedDatapath({ stage: "jobs" }),
    "datapath-constants": () => placedDatapath({ stage: "constants" }),
    "datapath-fetch": () => placedDatapath({ stage: "fetch" }),
    "datapath-memory": () => placedDatapath({ stage: "memory" }),
    "datapath-full": () => placedDatapath({ stage: "full" }),
  };
}
