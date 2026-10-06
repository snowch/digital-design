// Copyright © 2026 Christopher Snow

// Module 9's circuits, by the id a lesson names them with: the decoder opened (its control
// signals, its checks, and whole), and the machine of several edges an instruction, placed for
// the figures that draw them. A figure that runs a program builds the same machine with it
// (`placedMachine`), so the drawing is the library's.

import type { Circuit } from "@dd/sim";

import { decoderCircuit } from "./control";
import { routed } from "./library-datapath";
import { multicycleCircuit, type MulticycleOptions } from "./multicycle";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;
type Routes = Readonly<Record<string, readonly number[]>>;

/** Hand-placed drawings of Module 9's circuits' top levels, in grid cells. */
/** The decoder's control-signal gates, as the lesson's figure and the decoder's inside draw them. */
const SIGNAL_GATES: At = {
  orJobs: [12, 1],
  orMem: [12, 5],
  andOp2: [19, 1],
  andOp1: [19, 4],
  andOp0: [19, 7],
  andAzero: [19, 10],
  andByte: [19, 13],
  orWritey: [27, 1],
  orBconst: [27, 5],
  orOp1: [27, 9],
  orOp0: [27, 14],
};

export const CONTROL_AT: Readonly<Record<string, At>> = {
  decoder: {
    "in:K": [0, 5],
    "in:J": [0, 8],
    "in:C": [0, 11],
    decoder: [6, 1],
    "out:WRITEY": [13, 1],
    "out:LOAD": [18, 2],
    "out:STORE": [13, 3],
    "out:BYTE": [18, 4],
    "out:AZERO": [13, 5],
    "out:BCONST": [18, 6],
    "out:OP2": [13, 7],
    "out:OP1": [18, 8],
    "out:OP0": [13, 9],
    "out:BRANCH": [18, 10],
    "out:CALL": [13, 11],
    "out:JUMP": [18, 12],
    "out:MEM": [13, 13],
    "out:STOP": [18, 14],
    "out:CAUSED": [13, 15],
  },
  machine: {
    "in:CLK": [0, 18],
    "in:RST": [0, 20],
    control: [8, 4],
    "out:HALT": [15.5, 6],
    "out:CAUSE": [15.5, 8],
    datapath: [21, 5],
    "in:DOOR": [31, 10],
    "in:WARM": [28, 11],
    "in:SENSORA": [30.5, 12],
    "in:SENSORB": [27.5, 13],
    port: [36, 5],
    "out:LAMPS": [49, 7.5],
    "out:DISPLAY": [49, 4.5],
  },
};

/** Hand routes inside a block a learner opens, by the block's path in the machine. */
export const CONTROL_INSIDE_ROUTES: Readonly<Record<string, Routes>> = {
  control: {
    // GO from the stop logic up beside the bus, into the bus and over to the controller.
    "stops.GO>bus.GO": [28],
    "stops.GO>controller.GO": [28, 13.1, 19.75],
    // CHECKING down past the bus and under the stop logic, into it from below.
    "controller.CHECKING>stops.CHECKING": [27, 33.8, 19.6],
    // The memory's causes in under the decoder, nested.
    "input:CAUSEF.y>stops.CAUSEF": [18.5],
    "input:CAUSEM.y>stops.CAUSEM": [19.2],
  },
  datapath: {
    // The held result back along the top to the memory's address selector.
    "heldR.Q>pickAddr.A": [58.5, 1, 16.5],
    // The job digit over the register file and the ALU to the branch condition.
    "digits.J>condition.J": [24.5, 13, 53.5],
    // The ALU's result up to its held word, and over the condition to the next PC.
    "alu.Y>heldR.D": [52],
    "alu.Y>next.RESULT": [52, 14.5, 60],
    // A load's word along the bottom to the register that holds it.
    "input:MQ.y>heldM.D": [3, 32, 60.5],
  },
};

/** A circuit with hand routes on the parts one level inside the blocks the routes name. */
function routedInside(circuit: Circuit, routes: Readonly<Record<string, Routes>>): Circuit {
  const at = (path: string) => {
    const cut = path.lastIndexOf("/");
    if (cut < 0) return undefined;
    const r = routes[path.slice(0, cut)];
    const name = path.slice(cut + 1);
    const mine =
      r && Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith(`${name}.`)));
    return mine && Object.keys(mine).length ? mine : undefined;
  };
  const inputRoutes = (name: string) => {
    const found: Record<string, readonly number[]> = {};
    for (const r of Object.values(routes))
      for (const [k, v] of Object.entries(r)) if (k.startsWith(`input:${name}.`)) found[k] = v;
    return Object.keys(found).length ? found : undefined;
  };
  const withRoutes = <T extends { path?: string; meta?: Readonly<Record<string, unknown>> }>(
    x: T,
    r: Record<string, readonly number[]> | undefined,
  ): T =>
    r
      ? {
          ...x,
          meta: { ...(x.meta ?? {}), routes: { ...((x.meta?.["routes"] as object) ?? {}), ...r } },
        }
      : x;
  return {
    ...circuit,
    components: circuit.components.map((c) => withRoutes(c, at(c.path))),
    composites: circuit.composites.map((c) => withRoutes(c, at(c.path))),
    nets: circuit.nets.map((n) =>
      withRoutes(n, inputRoutes(n.name.slice(n.name.lastIndexOf("/") + 1))),
    ),
  };
}

/** Hand routes, where the router alone cannot keep a drawing clear. */
export const CONTROL_ROUTES: Readonly<Record<string, Routes>> = {
  machine: {
    // The control bus straight into the datapath, and over it into the memory.
    "control.CONTROL>datapath.CONTROL": [19],
    "control.CONTROL>port.CONTROL": [19, 3, 35],
    // The loops back, nested: the IR to the control unit along the lowest channel, then the
    // memory's causes to the control unit, then the instruction and a load's word to the datapath.
    "datapath.IR>control.IR": [27, 27, 3],
    "port.CAUSEF>control.CAUSEF": [47, 26, 4],
    "port.CAUSEM>control.CAUSEM": [46, 25, 5],
    "port.FETCHED>datapath.FETCHED": [45, 24, 18.5],
    "port.MQ>datapath.MQ": [44, 23, 19],
    // The clock and the reset along the bottom, up into each block's last two ports.
    "input:CLK.y>control.CLK": [6],
    "input:CLK.y>datapath.CLK": [19.5],
    "input:CLK.y>port.CLK": [34],
    "input:RST.y>control.RST": [7],
    "input:RST.y>datapath.RST": [20],
    "input:RST.y>port.RST": [35],
  },
};

/** Hand-placed insides of Module 9's blocks a learner opens, by kind. */
export const CONTROL_INSIDE: Readonly<Record<string, At>> = {
  // The capstone's: kind 9's line joins WRITEY, BCONST and OP1, and CALL and JUMP are ORs.
  "control-signals-call": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:KIND6": [0, 11],
    "in:KIND7": [0, 13],
    "in:J3": [0, 15],
    "in:J2": [0, 17],
    "in:J1": [0, 19],
    "in:J0": [0, 21],
    "in:KIND9": [0, 23],
    ...SIGNAL_GATES,
    orWritey: [27, 1],
    orBconst: [27, 6],
    orOp1: [27, 11],
    orOp0: [27, 17],
    orCall: [27, 20],
    orJump: [27, 23],
    "out:WRITEY": [35, 2],
    "out:BCONST": [35, 7],
    "out:OP2": [35, 4.5],
    "out:OP1": [35, 13],
    "out:OP0": [35, 17],
    "out:AZERO": [35, 9.5],
    "out:BYTE": [35, 15],
    "out:CALL": [35, 20],
    "out:JUMP": [35, 23],
    "out:MEM": [35, 25],
  },
  "controller-outputs": {
    "in:FETCH": [0, 4],
    "in:READ": [0, 1],
    "in:ALU": [0, 13],
    "in:MEMORY": [0, 16],
    "in:WRITE": [0, 22],
    "in:LOAD": [0, 18],
    "in:STORE": [0, 20],
    "in:WRITEY": [0, 24],
    "in:ENDS": [0, 27],
    "in:GO": [0, 30],
    outChecking: [9, 1],
    outFetching: [9, 4],
    andIren: [9, 7],
    andHoldab: [9, 10],
    andHoldr: [9, 13],
    andMload: [9, 16],
    andMstore: [9, 19],
    andHoldm: [16, 16],
    andWreg: [9, 22],
    andPcen: [9, 26],
    "out:CHECKING": [23, 1],
    "out:FETCHING": [23, 4],
    "out:IREN": [23, 7],
    "out:HOLDAB": [23, 10],
    "out:HOLDR": [23, 13],
    "out:MLOAD": [23, 15],
    "out:HOLDM": [23, 17.5],
    "out:MSTORE": [23, 20],
    "out:WREG": [23, 23],
    "out:PCEN": [23, 26],
  },
  "control-unit": {
    "in:CLK": [0, 6],
    "in:RST": [0, 8],
    "in:IR": [0, 18.5],
    "in:CAUSEF": [0, 29],
    "in:CAUSEM": [0, 31],
    controller: [20, 1],
    bus: [33, 3],
    digits: [4, 15.5],
    decoder: [12, 13],
    stops: [20, 27],
    "out:CONTROL": [43, 13.5],
    "out:HALT": [30, 28],
    "out:CAUSE": [30, 30],
  },
  "number-check": {
    "in:C": [0, 2.5],
    "in:J3": [0, 7],
    "in:J2": [0, 10],
    "in:J1": [0, 12],
    "in:KIND8": [0, 14],
    cBits: [5, 1],
    orC1C0: [11, 3],
    andC5to7: [16, 2],
    orOutside: [21, 1],
    notJ3: [5, 6.5],
    notJ2: [5, 9.5],
    andNames: [11, 7],
    andBadNumber: [27, 1.5],
    "out:BADNUMBER": [32, 2],
  },
  "control-signals": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:CALL": [0, 11],
    "in:JUMP": [0, 13],
    "in:J3": [0, 15],
    "in:J2": [0, 17],
    "in:J1": [0, 19],
    "in:J0": [0, 21],
    ...SIGNAL_GATES,
    "out:WRITEY": [34, 1],
    "out:BCONST": [34, 5],
    "out:OP2": [34, 9],
    "out:OP1": [34, 11],
    "out:OP0": [34, 14],
    "out:AZERO": [34, 17],
    "out:BYTE": [34, 19],
    "out:MEM": [34, 21],
  },
  "memory-port": {
    "in:CONTROL": [0, 5.5],
    "in:ADDR": [3, 1],
    "in:D": [16, 2],
    "in:RST": [18.5, 9],
    "in:CLK": [16, 10],
    "in:DOOR": [18.5, 11],
    "in:WARM": [15.5, 12],
    "in:SENSORA": [17.5, 13],
    "in:SENSORB": [14, 14],
    signals: [8, 3],
    memory: [22, 1],
    "out:FETCHED": [33, 5],
    "out:CAUSEF": [38, 6],
    "out:MQ": [33, 7],
    "out:CAUSEM": [38, 8],
    "out:DISPLAY": [33, 9],
    "out:LAMPS": [38, 10],
  },
  "datapath-edges": {
    "in:CONTROL": [0, 3],
    "in:FETCHED": [0, 14],
    "in:MQ": [0, 30],
    "in:CLK": [0, 33],
    "in:RST": [0, 35],
    toFetch: [4, 3],
    pickAddr: [18, 3],
    pc: [12, 8],
    ir: [12, 14],
    digits: [20, 12.5],
    registers: [27, 14.5],
    toRegisters: [12, 23],
    widen: [27, 26],
    hold: [33, 16.5],
    toAlu: [33, 3],
    pickA: [40, 15],
    pickB: [40, 19],
    alu: [47, 15.5],
    heldR: [54, 7],
    condition: [54, 15.5],
    next: [61, 15.5],
    toNext: [54, 24],
    heldM: [61, 28],
    yWord: [69, 20],
    "out:ADDR": [76, 4],
    "out:HB": [76, 11],
    "out:IR": [76, 13],
  },
};

let placeFn: Place | undefined;

function laid(circuit: Circuit, key: string): Circuit {
  const at = CONTROL_AT[key] ?? {};
  const placedCircuit = placeFn && Object.keys(at).length ? placeFn(circuit, at) : circuit;
  const routes = CONTROL_ROUTES[key] ?? {};
  return Object.keys(routes).length ? routed(placedCircuit, routes) : placedCircuit;
}

/** The machine of several edges, placed as its figure draws it, with a program and registers. */
export function placedMachine(options: MulticycleOptions): Circuit {
  return routedInside(laid(multicycleCircuit(options), "machine"), CONTROL_INSIDE_ROUTES);
}

export function controlLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  placeFn = place;
  return {
    decoder: () => laid(decoderCircuit({ mem: false }), "decoder"),
    "decoder-call-register": () => laid(decoderCircuit({ callThroughRegister: true }), "decoder"),
    "machine-edges": () => placedMachine({ name: "machine" }),
    "machine-edges-call": () => placedMachine({ name: "machine", callThroughRegister: true }),
  };
}
