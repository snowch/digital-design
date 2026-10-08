// Copyright © 2026 Christopher Snow

// Module 9's circuits, by the id a lesson names them with: the decoder opened (its control
// signals, its checks, and whole), and the machine of several edges an instruction, placed for
// the figures that draw them. A figure that runs a program builds the same machine with it
// (`placedMachine`), so the drawing is the library's.

import type { Circuit } from "@dd/sim";

import { decoderCircuit } from "./control";
import { routed } from "./library-datapath";
import { multicycleCircuit, type MulticycleOptions } from "./multicycle";
import { trapsCircuit, type TrapMachineOptions } from "./traps";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;
type Routes = Readonly<Record<string, readonly number[]>>;

/** Hand-placed drawings of Module 9's circuits' top levels, in grid cells. */
export const CONTROL_AT: Readonly<Record<string, At>> = {
  // Module 12: the machine with its trap hardware, Module 9's three blocks wider for it.
  "machine-traps": {
    "in:CLK": [0, 25],
    "in:RST": [0, 27],
    control: [8, 4],
    "out:CAUSE": [17, 1.5],
    "out:HALT": [17, 12.5],
    datapath: [22, 6.5],
    "in:DOOR": [33, 11],
    "in:WARM": [33, 12],
    "in:SENSORA": [32, 13],
    "in:SENSORB": [32, 14],
    port: [38, 6],
    "out:DISPLAY": [51, 4.5],
    "out:LAMPS": [51, 6.5],
  },
  decoder: {
    "in:K": [0, 5],
    "in:J": [0, 8],
    "in:C": [0, 11],
    decoder: [6, 1],
    "out:WRITEY": [13, 1.5],
    "out:LOAD": [18, 2.5],
    "out:STORE": [13, 3.5],
    "out:BYTE": [18, 4.5],
    "out:AZERO": [13, 5.5],
    "out:BCONST": [18, 6.5],
    "out:OP2": [13, 7.5],
    "out:OP1": [18, 8.5],
    "out:OP0": [13, 9.5],
    "out:BRANCH": [18, 10.5],
    "out:CALL": [13, 11.5],
    "out:JUMP": [18, 12.5],
    "out:STOP": [18, 13.5],
    "out:CAUSED": [13, 14.5],
  },
  machine: {
    "in:CLK": [0, 18],
    "in:RST": [0, 20],
    control: [8, 4],
    "out:HALT": [15, 6],
    "out:CAUSE": [15, 8],
    datapath: [21, 5],
    "in:DOOR": [30, 10],
    "in:WARM": [27.5, 11],
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

/**
 * Wires from a block's pins into the parts inside it, each down a vertical of its own: `columns`
 * gives each pin's column in grid cells, `feeds` the ports each part takes, named as the pins.
 */
function bus(
  columns: Readonly<Record<string, number>>,
  feeds: Readonly<Record<string, readonly string[]>>,
): Routes {
  const out: Record<string, readonly number[]> = {};
  for (const [part, ports] of Object.entries(feeds))
    for (const port of ports) {
      const x = columns[port];
      if (x !== undefined) out[`input:${port}.y>${part}.${port}`] = [x];
    }
  return out;
}

const CHECK_KINDS = ["KIND1", "KIND2", "LOAD", "STORE", "BRANCH", "CALL", "JUMP", "KIND8"];
const CHECK_KINDS_CALL = [
  "KIND1",
  "KIND2",
  "LOAD",
  "STORE",
  "BRANCH",
  "KIND6",
  "KIND7",
  "KIND8",
  "KIND9",
];
const JOB_BITS = ["J3", "J2", "J1", "J0"];

/**
 * A column for each of a block's pins, the top pin's furthest right, half a cell apart, ending a
 * cell before `x`: every wire runs down to the parts below its pin, so none crosses another that
 * keeps its order.
 */
function columns(pins: readonly string[], x: number): Record<string, number> {
  return Object.fromEntries(pins.map((p, i) => [p, x - 1 - i / 2]));
}

/** Hand routes inside every block of a kind a learner opens, by the block's kind. */
/** The decoder's lines down a bus into its control signals and its checks. */
const DECODER_BUS: Routes = {
  "kinds.KIND1>signals.KIND1": [14],
  "kinds.KIND1>checks.KIND1": [14],
  "kinds.KIND2>signals.KIND2": [13.5],
  "kinds.KIND2>checks.KIND2": [13.5],
  "kinds.KIND3>signals.LOAD": [13],
  "kinds.KIND3>checks.LOAD": [13],
  "kinds.KIND4>signals.STORE": [12.5],
  "kinds.KIND4>checks.STORE": [12.5],
  "kinds.KIND5>signals.BRANCH": [12],
  "kinds.KIND5>checks.BRANCH": [12],
  "kinds.KIND6>signals.CALL": [11.5],
  "kinds.KIND6>checks.CALL": [11.5],
  "kinds.KIND7>signals.JUMP": [11],
  "kinds.KIND7>checks.JUMP": [11],
  "kinds.KIND8>checks.KIND8": [10.5],
  "jBits.b3>signals.J3": [10],
  "jBits.b3>checks.J3": [10],
  "jBits.b2>signals.J2": [9.5],
  "jBits.b2>checks.J2": [9.5],
  "jBits.b1>signals.J1": [9],
  "jBits.b1>checks.J1": [9],
  "jBits.b0>signals.J0": [8.5],
  "jBits.b0>checks.J0": [8.5],
  "input:C.y>checks.C": [8],
};

/** The job check's wires, the job's bits down a bus and its conditions up to their ANDs. */
const JOB_CHECK_ROUTES: Routes = {
  // The job's bits down a bus, the top bit's furthest right.
  "input:J3.y>orAnyJob.a": [5.5],
  "input:J2.y>orJ2J1.a": [5],
  "input:J2.y>orAnyJob.b": [5],
  "input:J1.y>orJ2J1.b": [4.5],
  "input:J1.y>orAnyJob.c": [4.5],
  "input:J1.y>orJ1J0.a": [4.5],
  "input:J0.y>orAnyJob.d": [4],
  "input:J0.y>orJ1J0.b": [4],
  // J2 and J3 over the gates above them, down into the first input of their gates.
  "input:J2.y>andFiveUp.a": [5, 35.1, 10.5],
  "input:J3.y>orHighJob.a": [5.5, 34.6, 14.5],
  // The job conditions up to their ANDs, nested: the top group's furthest left.
  "input:J3.y>andBadEight.b": [19],
  "orJ2J1.y>andBadMem.b": [19.5],
  "orAnyJob.y>andBadOne.b": [20],
  "orHighJob.y>andBadSystem.b": [20.5],
  // The four ANDs into their OR, nested from above and below.
  "andBadEight.y>orBadJob.a": [26.5],
  "andBadMem.y>orBadJob.b": [25.5],
  "andBadOne.y>orBadJob.c": [25.5],
  "andBadSystem.y>orBadJob.d": [26.5],
};

export const CONTROL_KIND_ROUTES: Readonly<Record<string, Routes>> = {
  // Module 12's controller: RESUME up into its output logic.
  "controller-traps": { "input:RESUME.y>outputs.RESUME": [50.5] },
  // Module 12's datapath: the words up into the next PC's choice and register Y's word, the
  // lower source turning further right.
  "datapath-traps": {
    "toNext.RESUME>nextTrap.RESUME": [67.5],
    "toNext.TRAP>nextTrap.TRAP": [68],
    "heldM.Q>yWord.HM": [68.5],
    "cregs.CWORD>yWord.CWORD": [69.5],
    "cregs.C2>nextTrap.C2": [70.5],
    "cregs.C4>nextTrap.C4": [71],
    "toNext.CALL>yWord.CALL": [70],
    "toNext.CREAD>yWord.CREAD": [71.5],
  },
  // Module 12's control unit: the unit's own inputs up into the trap logic, the lower ones
  // turning further right.
  "control-unit-traps": {
    "input:CAUSEF.y>trapLogic.CAUSEF": [28],
    "input:CAUSEM.y>trapLogic.CAUSEM": [28.5],
    "input:WAITING.y>trapLogic.WAITING": [29],
    "input:NOHANDLER.y>trapLogic.NOHANDLER": [29.5],
    // User mode up between the system jobs and the trap logic, and over to the bus.
    "mode.USER>bus.USER": [31.5, 31.6],
    // GO and TRAP up past the controller and over its top, into it from the left.
    "trapLogic.GO>controller.GO": [44, 1.6, 32],
    "trapLogic.TRAP>controller.TRAP": [44.5, 1.1, 31.5],
    "input:RST.y>controller.RST": [26],
  },

  // Down the bus, the line from higher up further right.
  "control-decoder": DECODER_BUS,
  "control-decoder-mem": DECODER_BUS,

  // Down a column each, the line from higher up further right.
  "kind-lines": {
    "kBits.b1>low.S1": [11],
    "kBits.b0>low.S0": [10.5],
    "high.Y0>kind1.a": [20.5],
    "low.Y1>kind1.b": [18.5],
    "high.Y0>kind2.a": [20.5],
    "low.Y2>kind2.b": [18],
    "high.Y0>kind3.a": [20.5],
    "low.Y3>kind3.b": [17.5],
    "high.Y1>kind4.a": [20],
    "low.Y0>kind4.b": [19],
    "high.Y1>kind5.a": [20],
    "low.Y1>kind5.b": [18.5],
    "high.Y1>kind6.a": [20],
    "low.Y2>kind6.b": [18],
    "high.Y1>kind7.a": [20],
    "low.Y3>kind7.b": [17.5],
    "high.Y2>kind8.a": [19.5],
    "low.Y0>kind8.b": [19],
    "high.Y2>kind9.a": [19.5],
    "low.Y1>kind9.b": [18.5],
  },
  "kind-check": {
    "input:KIND1.y>norKinds.a": [6],
    "input:KIND2.y>norKinds.b": [5],
    "input:LOAD.y>norKinds.c": [4],
    "input:BRANCH.y>norKinds.e": [4],
    "input:CALL.y>norKinds.f": [5],
    "input:JUMP.y>norKinds.g": [6],
    "input:KIND8.y>norKinds.h": [7],
  },
  "job-check": JOB_CHECK_ROUTES,

  "number-check": {
    // C2 and C1 OR C0 down into their AND, nested; the bits above 2 down into the OR.
    "cBits.C2>andC5to7.a": [15],
    "orC1C0.y>andC5to7.b": [14.5],
    "cBits.CHIGH>orOutside.a": [20],
    "andNames.y>andBadNumber.b": [26],
    // Up into the AND that names a register, the lowest furthest right.
    "notJ2.y>andNames.b": [9],
    "input:J1.y>andNames.c": [9.5],
    "input:KIND8.y>andNames.d": [10],
  },
  "system-jobs": {
    "input:J3.y>orAnyJob.a": [4.5],
    "input:J2.y>orAnyJob.b": [4],
    "input:J1.y>orAnyJob.c": [3.5],
    "input:J1.y>orJ1J0.a": [3.5],
    "input:J0.y>orAnyJob.d": [3],
    "input:J0.y>orJ1J0.b": [3],
    "input:J2.y>andFiveUp.a": [4, 16.1, 9.5],
    "input:J3.y>orHighJob.a": [4.5, 15.6, 13.5],
    "input:KIND8.y>andSystem.a": [13.5],
    "input:KIND8.y>andStop.a": [23.5],
    "orAnyJob.y>andStop.b": [9, 14.6, 23],
  },
  "control-signals": {
    // Before the ORs of kind lines: KIND2 up into JOBS, STORE up into MEM, LOAD over MEM.
    "input:KIND2.y>orJobs.b": [4],
    "input:STORE.y>orMem.b": [4],
    "input:LOAD.y>orWritey.b": [3.5, 5.6, 9],
    // Down the bus, the higher line further right; up it, the lower line further right.
    "orJobs.y>andOp2.a": [13.5],
    "orJobs.y>andOp1.a": [13.5],
    "orJobs.y>andOp0.a": [13.5],
    "input:KIND2.y>orBconst.a": [13],
    "orMem.y>andAzero.a": [12.5],
    "orMem.y>orBconst.b": [12.5],
    "orMem.y>orOp1.b": [12.5],
    "orMem.y>output:MEM.a": [12.5],
    "input:BRANCH.y>orOp1.c": [12],
    "input:BRANCH.y>orOp0.b": [12],
    "input:JUMP.y>orBconst.c": [11.5],
    "input:JUMP.y>orOp1.d": [11.5],
    "input:J1.y>andOp1.b": [11],
    "input:J0.y>andOp0.b": [11],
    "input:CALL.y>orWritey.c": [9.5],
    "input:J3.y>andAzero.b": [10],
    "input:J0.y>andByte.b": [10.5],
    // Each job AND down into its OR.
    "andOp1.y>orOp1.a": [18.5],
    "andOp0.y>orOp0.a": [18.5],
  },
  "control-signals-call": {
    "input:KIND2.y>orJobs.b": [4],
    "input:STORE.y>orMem.b": [4],
    "input:LOAD.y>orWritey.b": [3.5, 5.6, 8.5],
    "orJobs.y>andOp2.a": [14.5],
    "orJobs.y>andOp1.a": [14.5],
    "orJobs.y>andOp0.a": [14.5],
    "input:KIND2.y>orBconst.a": [14],
    "orMem.y>andAzero.a": [13.5],
    "orMem.y>orBconst.b": [13.5],
    "orMem.y>orOp1.b": [13.5],
    "orMem.y>output:MEM.a": [13.5],
    "input:BRANCH.y>orOp1.c": [13],
    "input:BRANCH.y>orOp0.b": [13],
    "input:KIND6.y>orCall.a": [12.5],
    "input:KIND7.y>orBconst.c": [12],
    "input:KIND7.y>orOp1.d": [12],
    "input:KIND7.y>orJump.a": [12],
    "input:KIND9.y>orBconst.d": [11.5],
    "input:KIND9.y>orOp1.e": [11.5],
    "input:KIND9.y>orCall.b": [11.5],
    "input:KIND9.y>orJump.b": [11.5],
    "input:J1.y>andOp1.b": [11],
    "input:J0.y>andOp0.b": [10.5],
    "input:KIND6.y>orWritey.c": [9],
    "input:KIND9.y>orWritey.d": [9.5],
    "input:J3.y>andAzero.b": [10],
    "input:J0.y>andByte.b": [10.5],
    "andOp1.y>orOp1.a": [19.5],
    "andOp0.y>orOp0.a": [19.5],
  },
  "control-decoder-call": {
    "kinds.KIND1>signals.KIND1": [14.5],
    "kinds.KIND1>checks.KIND1": [14.5],
    "kinds.KIND2>signals.KIND2": [14],
    "kinds.KIND2>checks.KIND2": [14],
    "kinds.KIND3>signals.LOAD": [13.5],
    "kinds.KIND3>checks.LOAD": [13.5],
    "kinds.KIND4>signals.STORE": [13],
    "kinds.KIND4>checks.STORE": [13],
    "kinds.KIND5>signals.BRANCH": [12.5],
    "kinds.KIND5>checks.BRANCH": [12.5],
    "kinds.KIND6>signals.KIND6": [12],
    "kinds.KIND6>checks.KIND6": [12],
    "kinds.KIND7>signals.KIND7": [11.5],
    "kinds.KIND7>checks.KIND7": [11.5],
    "kinds.KIND8>checks.KIND8": [11],
    "kinds.KIND9>signals.KIND9": [10.5],
    "kinds.KIND9>checks.KIND9": [10.5],
    "jBits.b3>signals.J3": [10],
    "jBits.b3>checks.J3": [10],
    "jBits.b2>signals.J2": [9.5],
    "jBits.b2>checks.J2": [9.5],
    "jBits.b1>signals.J1": [9],
    "jBits.b1>checks.J1": [9],
    "jBits.b0>signals.J0": [8.5],
    "jBits.b0>checks.J0": [8.5],
    "input:C.y>checks.C": [8],
  },
  "kind-check-call": {
    "input:KIND1.y>norKinds.a": [7],
    "input:KIND2.y>norKinds.b": [6],
    "input:LOAD.y>norKinds.c": [5],
    "input:STORE.y>norKinds.d": [4],
    "input:KIND6.y>norKinds.f": [4],
    "input:KIND7.y>norKinds.g": [5],
    "input:KIND8.y>norKinds.h": [6],
    "input:KIND9.y>norKinds.i": [7],
  },
  "job-check-call": {
    ...JOB_CHECK_ROUTES,
    "input:J2.y>andFiveUp.a": [5, 37.1, 10.5],
    "input:J3.y>orHighJob.a": [5.5, 36.6, 14.5],
  },
  "decode-checks-call": {
    ...bus(columns([...CHECK_KINDS_CALL, ...JOB_BITS, "C"], 12), {
      kindCheck: CHECK_KINDS_CALL,
      jobCheck: [...CHECK_KINDS_CALL, ...JOB_BITS],
      numberCheck: ["KIND8", "J3", "J2", "J1", "C"],
      systemJobs: ["KIND8", ...JOB_BITS],
    }),
    "kindCheck.NOKIND>orIllegal.a": [19],
    "jobCheck.BADJOB>orIllegal.b": [19],
    "numberCheck.BADNUMBER>orIllegal.c": [19],
    "orIllegal.y>output:ILLEGAL.a": [23.5],
    "orIllegal.y>causeWord.ILLEGAL": [23.5],
    "systemJobs.SYSTEM>causeWord.SYSTEM": [23],
    "systemJobs.STOP>output:STOP.a": [23],
    "causeWord.CAUSED>output:CAUSED.a": [31.5],
  },
  "decode-checks": {
    ...bus(columns([...CHECK_KINDS, ...JOB_BITS, "C"], 11), {
      kindCheck: CHECK_KINDS,
      jobCheck: [...CHECK_KINDS, ...JOB_BITS],
      numberCheck: ["KIND8", "J3", "J2", "J1", "C"],
      systemJobs: ["KIND8", ...JOB_BITS],
    }),
    "kindCheck.NOKIND>orIllegal.a": [18],
    "jobCheck.BADJOB>orIllegal.b": [18],
    "numberCheck.BADNUMBER>orIllegal.c": [18],
    "orIllegal.y>output:ILLEGAL.a": [22.5],
    "orIllegal.y>causeWord.ILLEGAL": [22.5],
    "systemJobs.SYSTEM>causeWord.SYSTEM": [22],
    "systemJobs.STOP>output:STOP.a": [22],
    "causeWord.CAUSED>output:CAUSED.a": [30.5],
  },
};

/** A circuit with hand routes inside every block whose kind `routes` names. */
function routedByKind(circuit: Circuit, routes: Readonly<Record<string, Routes>>): Circuit {
  const forParts = new Map<string, Record<string, readonly number[]>>();
  const forNets = new Map<number, Record<string, readonly number[]>>();
  for (const block of circuit.composites) {
    const r = routes[block.kind];
    if (!r) continue;
    for (const [key, route] of Object.entries(r)) {
      // A wire from a pin carries its route on the part it enters: the pin's net enters other
      // blocks too, whose parts may share the names.
      const source = key.slice(0, key.indexOf("."));
      const target = key.slice(key.indexOf(">") + 1, key.lastIndexOf("."));
      const holder = source.startsWith("input:") ? target : source;
      if (holder.startsWith("output:")) {
        const net = block.inputs[source.slice("input:".length)];
        if (net !== undefined) forNets.set(net, { ...(forNets.get(net) ?? {}), [key]: route });
      } else {
        const path = `${block.path}/${holder}`;
        forParts.set(path, { ...(forParts.get(path) ?? {}), [key]: route });
      }
    }
  }
  const withRoutes = <T extends { meta?: Readonly<Record<string, unknown>> }>(
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
    components: circuit.components.map((c) => withRoutes(c, forParts.get(c.path))),
    composites: circuit.composites.map((c) => withRoutes(c, forParts.get(c.path))),
    nets: circuit.nets.map((n) => withRoutes(n, forNets.get(n.id))),
  };
}

/** Hand routes, where the router alone cannot keep a drawing clear. */
export const CONTROL_ROUTES: Readonly<Record<string, Routes>> = {
  // Module 12: the loops back nested, the memory's outermost; the datapath's below the memory's
  // loops to the datapath, so each crosses only wires of another block.
  "machine-traps": {
    "control.CAUSE>output:CAUSE.a": [16, 2.1],
    "control.HALT>output:HALT.a": [16],
    "control.CONTROL>port.CONTROL": [19, 3, 36],
    "port.CAUSEF>control.CAUSEF": [47, 24, 3],
    "port.CAUSEM>control.CAUSEM": [46.5, 23.5, 3.5],
    "port.WAITING>control.WAITING": [46, 23, 4],
    "port.FETCHED>datapath.FETCHED": [45.5, 20, 19.5],
    "port.MQ>datapath.MQ": [45, 19.5, 20],
    "datapath.IR>control.IR": [31, 22, 4.5],
    "datapath.STATUS>control.STATUS": [30.5, 21.5, 5],
    "datapath.NOHANDLER>control.NOHANDLER": [30, 21, 5.5],
    "input:CLK.y>control.CLK": [6.5],
    "input:CLK.y>datapath.CLK": [20.5],
    "input:CLK.y>port.CLK": [36.5],
    "input:RST.y>control.RST": [7],
    "input:RST.y>datapath.RST": [21],
    "input:RST.y>port.RST": [37],
  },
  machine: {
    // The control bus straight into the datapath, and over it into the memory.
    "control.CONTROL>datapath.CONTROL": [19],
    "control.CONTROL>port.CONTROL": [19, 3, 35],
    // The loops back, nested: the IR to the control unit along the lowest channel, then the
    // memory's causes to the control unit, then the instruction and a load's word to the datapath.
    "datapath.IR>control.IR": [27, 27, 3.5],
    "port.CAUSEF>control.CAUSEF": [47, 26, 4.5],
    "port.CAUSEM>control.CAUSEM": [46, 25, 5.5],
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
  // Module 12's control unit: Module 9's, with the mode's bits and the system jobs beside the
  // decoder, and the trap logic where the stop logic was.
  "control-unit-traps": {
    "in:RST": [0, 4],
    "in:CLK": [0, 6.5],
    "in:IR": [0, 20.5],
    "in:STATUS": [0, 39.5],
    "in:CAUSEF": [0, 43],
    "in:CAUSEM": [0, 44.5],
    "in:WAITING": [0, 46],
    "in:NOHANDLER": [0, 47.5],
    digits: [4, 17.5],
    decoder: [12, 15],
    system: [21, 31],
    mode: [8, 39],
    controller: [33, 3],
    trapLogic: [33, 36],
    bus: [52, 5],
    "out:CONTROL": [62, 18.5],
    "out:CAUSE": [45, 41],
    "out:HALT": [45, 43],
  },
  // The capstone's: kind 9's line joins WRITEY, BCONST and OP1, and CALL and JUMP are ORs.
  // The capstone's, drawn as the decoder without it: kind 9's line joins WRITEY, BCONST and OP1,
  // and CALL and JUMP are ORs below the rest.
  "control-signals-call": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 4],
    "in:LOAD": [0, 6],
    "in:STORE": [0, 8],
    "in:BRANCH": [0, 10],
    "in:KIND6": [0, 12],
    "in:KIND7": [0, 14],
    "in:KIND9": [0, 16],
    "in:J3": [0, 18],
    "in:J2": [0, 20],
    "in:J1": [0, 22],
    "in:J0": [0, 24],
    orJobs: [5, 1],
    orMem: [5, 6],
    andByte: [15.5, 6.5],
    andAzero: [15.5, 10],
    andOp2: [15.5, 19],
    andOp1: [15.5, 22.5],
    andOp0: [15.5, 31],
    orWritey: [20.5, 1.5],
    orBconst: [20.5, 13],
    orOp1: [20.5, 25],
    orOp0: [20.5, 33.5],
    orCall: [20.5, 37],
    orJump: [20.5, 40],
    "out:WRITEY": [26, 3],
    "out:BYTE": [26, 7],
    "out:AZERO": [26, 10.5],
    "out:BCONST": [26, 14.5],
    "out:OP2": [26, 19.5],
    "out:OP1": [26, 27],
    "out:OP0": [26, 34],
    "out:CALL": [26, 37.5],
    "out:JUMP": [26, 40.5],
    "out:MEM": [26, 43],
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
  // Module 9's decoder opened, for lesson 9.1 (without MEM) and for the machine (with it): K's
  // kind lines and J's bits down a bus into the control signals and the checks below them, the
  // higher line further right; the kind lines that are signals on their own straight out above.
  "control-decoder": {
    "in:K": [0, 4.5],
    "in:J": [0, 13.5],
    "in:C": [0, 17],
    kinds: [4, 1],
    jBits: [4, 12],
    signals: [15, 9],
    checks: [15, 23],
    "out:LOAD": [23, 3],
    "out:STORE": [27, 4],
    "out:BRANCH": [23, 5],
    "out:CALL": [27, 6],
    "out:JUMP": [23, 7],
    "out:WRITEY": [27, 11],
    "out:BYTE": [23, 12],
    "out:AZERO": [27, 13],
    "out:BCONST": [23, 14],
    "out:OP2": [27, 15],
    "out:OP1": [23, 16],
    "out:OP0": [27, 17],
    "out:CAUSED": [23, 29],
    "out:STOP": [27, 30],
  },
  "control-decoder-mem": {
    "in:K": [0, 4.5],
    "in:J": [0, 13.5],
    "in:C": [0, 17],
    kinds: [4, 1],
    jBits: [4, 12],
    signals: [15, 9],
    checks: [15, 23],
    "out:LOAD": [23, 3],
    "out:STORE": [27, 4],
    "out:BRANCH": [23, 5],
    "out:CALL": [27, 6],
    "out:JUMP": [23, 7],
    "out:WRITEY": [27, 10.5],
    "out:BYTE": [23, 11.5],
    "out:AZERO": [27, 12.5],
    "out:BCONST": [23, 13.5],
    "out:OP2": [27, 14.5],
    "out:OP1": [23, 15.5],
    "out:OP0": [27, 16.5],
    "out:MEM": [23, 17.5],
    "out:CAUSED": [23, 29],
    "out:STOP": [27, 30],
  },
  "control-decoder-call": {
    "in:K": [0, 5],
    "in:J": [0, 14.5],
    "in:C": [0, 18],
    kinds: [4, 1],
    jBits: [4, 13],
    signals: [15.5, 8],
    checks: [15.5, 23],
    "out:LOAD": [23.5, 3],
    "out:STORE": [27.5, 4],
    "out:BRANCH": [23.5, 5],
    "out:WRITEY": [27.5, 9],
    "out:BYTE": [23.5, 10],
    "out:AZERO": [27.5, 11],
    "out:BCONST": [23.5, 12],
    "out:OP2": [27.5, 13],
    "out:OP1": [23.5, 14],
    "out:OP0": [27.5, 15],
    "out:CALL": [23.5, 16],
    "out:JUMP": [27.5, 17],
    "out:MEM": [23.5, 18],
    "out:CAUSED": [23.5, 29.5],
    "out:STOP": [27.5, 30.5],
  },
  "decode-checks-call": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:KIND6": [0, 11],
    "in:KIND7": [0, 13],
    "in:KIND8": [0, 15],
    "in:KIND9": [0, 17],
    "in:J3": [0, 19],
    "in:J2": [0, 21],
    "in:J1": [0, 23],
    "in:J0": [0, 25],
    "in:C": [0, 27],
    kindCheck: [12, 9],
    jobCheck: [12, 20],
    numberCheck: [12, 35],
    systemJobs: [12, 42],
    orIllegal: [20, 25],
    causeWord: [24.5, 39],
    "out:ILLEGAL": [33, 26],
    "out:CAUSED": [31.5, 39.5],
    "out:STOP": [33, 44.5],
  },
  "kind-check-call": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:KIND6": [0, 11],
    "in:KIND7": [0, 13],
    "in:KIND8": [0, 15],
    "in:KIND9": [0, 17],
    norKinds: [8, 5],
    "out:NOKIND": [12, 9],
  },
  "job-check-call": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:BRANCH": [0, 5],
    "in:LOAD": [0, 7],
    "in:STORE": [0, 9],
    "in:KIND6": [0, 11],
    "in:KIND7": [0, 13],
    "in:KIND9": [0, 15],
    "in:KIND8": [0, 17],
    "in:J3": [0, 20],
    "in:J2": [0, 22],
    "in:J1": [0, 24],
    "in:J0": [0, 26],
    orEight: [4, 2],
    orMemKinds: [4, 7],
    orOneJob: [4, 11],
    orJ2J1: [6.5, 28],
    orAnyJob: [6.5, 31],
    orJ1J0: [6.5, 38],
    andFiveUp: [11, 37.5],
    orHighJob: [15, 37],
    andBadEight: [21.5, 3],
    andBadMem: [21.5, 7.5],
    andBadOne: [21.5, 12],
    andBadSystem: [21.5, 17],
    orBadJob: [27.5, 8.5],
    "out:BADJOB": [31.5, 10],
  },
  // The checks in the order the lesson names them, the kind check, the job check and the number
  // check, their OR beside them, then the system jobs and the cause.
  "decode-checks": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:CALL": [0, 11],
    "in:JUMP": [0, 13],
    "in:KIND8": [0, 15],
    "in:J3": [0, 17],
    "in:J2": [0, 19],
    "in:J1": [0, 21],
    "in:J0": [0, 23],
    "in:C": [0, 25],
    kindCheck: [11, 8],
    jobCheck: [11, 19],
    numberCheck: [11, 33],
    systemJobs: [11, 40],
    orIllegal: [19, 23.5],
    causeWord: [23.5, 37],
    // CAUSED a cell and a half in from the others, so its eight bits fit inside the drawing.
    "out:ILLEGAL": [32, 24.5],
    "out:CAUSED": [30.5, 37.5],
    "out:STOP": [32, 42.5],
  },
  // The decoder on K3 K2 above the one on K1 K0, then an AND per kind in order, below both, so
  // every line runs down to its ANDs (kind 9's is the capstone's).
  "kind-lines": {
    "in:K": [0, 3.5],
    kBits: [5, 2],
    high: [13, 1],
    low: [13, 8],
    kind1: [22, 12],
    kind2: [22, 15],
    kind3: [22, 18],
    kind4: [22, 21],
    kind5: [22, 24],
    kind6: [22, 27],
    kind7: [22, 30],
    kind8: [22, 33],
    kind9: [22, 36],
    "out:KIND1": [27, 12.5],
    "out:KIND2": [27, 15.5],
    "out:KIND3": [27, 18.5],
    "out:KIND4": [27, 21.5],
    "out:KIND5": [27, 24.5],
    "out:KIND6": [27, 27.5],
    "out:KIND7": [27, 30.5],
    "out:KIND8": [27, 33.5],
    "out:KIND9": [27, 36.5],
  },
  // Module 3's 2-to-4 decoder, opened inside the kind lines, drawn as Module 3's figure of its
  // gates ("decoder-gates" in library-combinational.ts) draws them.
  "decoder-2": {
    "in:S1": [0, 3],
    notS1: [5, 2.5],
    "in:S0": [0, 7],
    notS0: [5, 6.5],
    and0: [12, 1],
    and1: [12, 5],
    and2: [12, 9],
    and3: [12, 13],
    "out:Y0": [17, 1],
    "out:Y1": [17, 5],
    "out:Y2": [17, 9],
    "out:Y3": [17, 13],
  },
  // One NOR gate, its inputs fanned in from both sides of its middle.
  "kind-check": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:LOAD": [0, 5],
    "in:STORE": [0, 7],
    "in:BRANCH": [0, 9],
    "in:CALL": [0, 11],
    "in:JUMP": [0, 13],
    "in:KIND8": [0, 15],
    norKinds: [8, 4],
    "out:NOKIND": [12, 7.5],
  },
  // The groups of kinds in the order the lesson names them, each OR beside the AND that takes
  // its job condition; the job's bits below, the conditions worked out from them rising to the ANDs.
  "job-check": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 3],
    "in:BRANCH": [0, 5],
    "in:LOAD": [0, 7],
    "in:STORE": [0, 9],
    "in:CALL": [0, 11],
    "in:JUMP": [0, 13],
    "in:KIND8": [0, 15],
    "in:J3": [0, 18],
    "in:J2": [0, 20],
    "in:J1": [0, 22],
    "in:J0": [0, 24],
    orEight: [4, 2],
    orMemKinds: [4, 7],
    orOneJob: [4, 11],
    orJ2J1: [6.5, 26],
    orAnyJob: [6.5, 29],
    orJ1J0: [6.5, 36],
    andFiveUp: [11, 35.5],
    orHighJob: [15, 35],
    andBadEight: [21.5, 3],
    andBadMem: [21.5, 7.5],
    andBadOne: [21.5, 11.5],
    andBadSystem: [21.5, 15],
    orBadJob: [27.5, 8],
    "out:BADJOB": [31.5, 9.5],
  },
  "number-check": {
    "in:C": [0, 2.5],
    "in:J3": [0, 7],
    "in:J2": [0, 10],
    "in:J1": [0, 12],
    "in:KIND8": [0, 14],
    cBits: [5, 1],
    orC1C0: [11, 3],
    andC5to7: [16, 4.5],
    orOutside: [21, 4],
    notJ3: [5, 6.5],
    notJ2: [5, 9.5],
    andNames: [11, 7],
    andBadNumber: [27, 4.5],
    "out:BADNUMBER": [32, 5],
  },
  // SYSTEM above STOP, as the lesson names them; the job's bits down a bus, as in the job check.
  "system-jobs": {
    "in:KIND8": [0, 1],
    "in:J3": [0, 3],
    "in:J2": [0, 5],
    "in:J1": [0, 7],
    "in:J0": [0, 9],
    orAnyJob: [5.5, 10],
    notAnyJob: [9.5, 11],
    andSystem: [14, 10.5],
    orJ1J0: [5.5, 17],
    andFiveUp: [10, 16.5],
    orHighJob: [14, 16],
    notHighJob: [18, 16],
    andStop: [24, 14.5],
    "out:SYSTEM": [18.5, 11],
    "out:STOP": [28, 15.5],
  },
  // JOBS and MEM first; then each signal in the order of the block's outputs, the ANDs that take a
  // job bit beside the ORs, every line down or up a bus of its own between them.
  "control-signals": {
    "in:KIND1": [0, 1],
    "in:KIND2": [0, 4],
    "in:LOAD": [0, 6],
    "in:STORE": [0, 8],
    "in:BRANCH": [0, 10],
    "in:CALL": [0, 12],
    "in:JUMP": [0, 14],
    "in:J3": [0, 16],
    "in:J2": [0, 18],
    "in:J1": [0, 20],
    "in:J0": [0, 22],
    orJobs: [5, 1],
    orMem: [5, 6],
    andByte: [14.5, 6.5],
    andAzero: [14.5, 10],
    andOp2: [14.5, 17],
    andOp1: [14.5, 20.5],
    andOp0: [14.5, 28],
    orWritey: [19.5, 1.5],
    orBconst: [19.5, 13],
    orOp1: [19.5, 23],
    orOp0: [19.5, 30.5],
    "out:WRITEY": [25, 2.5],
    "out:BYTE": [25, 7],
    "out:AZERO": [25, 10.5],
    "out:BCONST": [25, 14],
    "out:OP2": [25, 17.5],
    "out:OP1": [25, 24.5],
    "out:OP0": [25, 31],
    "out:MEM": [25, 34],
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
  // Module 12's datapath: Module 9's, with the control registers below the ALU and the next PC's
  // choice of C2 or C4 after the next-PC block.
  "datapath-traps": {
    "in:CONTROL": [0, 3],
    "in:CAUSE": [0, 38],
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
    toNext: [54, 22.5],
    heldM: [61, 33],
    toControlRegisters: [33, 36],
    cregs: [47, 34],
    nextTrap: [72, 18],
    yWord: [72, 25],
    "out:ADDR": [82, 4],
    "out:HB": [82, 11],
    "out:IR": [82, 13],
    "out:STATUS": [82, 39.5],
    "out:NOHANDLER": [82, 41.5],
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

/** Module 12's machine with its trap hardware, placed as its figure draws it. */
export function placedTrapMachine(options: TrapMachineOptions): Circuit {
  return routedByKind(
    routedInside(laid(trapsCircuit(options), "machine-traps"), CONTROL_INSIDE_ROUTES),
    CONTROL_KIND_ROUTES,
  );
}

/** The machine of several edges, placed as its figure draws it, with a program and registers. */
export function placedMachine(options: MulticycleOptions): Circuit {
  return routedByKind(
    routedInside(laid(multicycleCircuit(options), "machine"), CONTROL_INSIDE_ROUTES),
    CONTROL_KIND_ROUTES,
  );
}

export function controlLibrary(place: Place): Readonly<Record<string, () => Circuit>> {
  placeFn = place;
  return {
    decoder: () =>
      routedByKind(laid(decoderCircuit({ mem: false }), "decoder"), CONTROL_KIND_ROUTES),
    "decoder-call-register": () =>
      routedByKind(
        laid(decoderCircuit({ callThroughRegister: true }), "decoder"),
        CONTROL_KIND_ROUTES,
      ),
    "machine-edges": () => placedMachine({ name: "machine" }),
    "machine-edges-call": () => placedMachine({ name: "machine", callThroughRegister: true }),
    // Module 12: the machine with its trap hardware.
    "machine-traps": () => placedTrapMachine({ name: "machine" }),
  };
}
