// Copyright © 2026 Christopher Snow

// Module 12: the machine of several edges with its trap hardware (`docs/machine.md`, "Traps and
// interrupts"). Module 12's own copy of Module 9's machine (multicycle.ts), so Modules 8 to 11's
// figures and tests stay as they are; Module 13 takes this copy. What it adds:
//
// - In the datapath, the five control registers and the selectors in front of them
//   (`control-registers`): at the edge that traps, C2 takes the return point, C1 takes C0, C0
//   takes 01 and C3 takes the cause; at `resume`'s edge C0 takes C1; at a control-register job's
//   edge the register the constant names takes register A's held word. The block also gives the
//   word register Y takes for `R3 <= C3`, C0's two bits, and NOHANDLER: 1 when C4 is 0, or holds
//   the PC, where a trap must halt the machine rather than go to the handler. The next PC takes
//   C2 for `resume` and C4 for a trap (`next-trap`).
// - In the control unit, the system jobs Module 12 builds (`system-jobs-12`): `resume` and the two
//   control-register jobs, which now run, and user mode's refusal of every system job but
//   `call system` (cause 22); and the trap logic (`trap-logic`), where Module 9's stop logic
//   was: every step's cause, the waiting events and C0's bit 1 in; whether this edge traps, with
//   which cause, or halts, out. The lower number wins, Module 3's priority: an interrupt is taken
//   at the edge that would fetch, where only a fetch's own cause is lower.
// - The controller (`controller-traps`) takes `resume` and the control-register jobs from READ to
//   WRITE, as a call goes, and an edge that traps leads to FETCH, as a reset does. Its PC enable
//   is 1 at a trap's edge too.
// - In the memory, C0's mode refuses a device's address (cause 32), the timer counts only an
//   instruction that finished, and the waiting events go to the trap logic.
//
// An edge that traps changes nothing the instruction would have changed, as an edge that halts
// changes nothing: every enable of the instruction's own waits on GO, which is 0 at both.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { aluParts } from "./alu";
import { CONTROL_STATES, controlDecoder, type ControlState } from "./control";
import {
  anyBit,
  block,
  branchCondition,
  constant,
  datapathRegister,
  digits,
  edgeRegister,
  joinParts,
  machineMemory,
  mux,
  muxTree,
  nextPcParts,
  registerFile64,
  slicePart,
  widenBlock,
  zeroOr,
  type DatapathOptions,
} from "./datapath";
import { joinWord, splitWord, type Machine } from "./fsm";
import { CAUSES } from "./machine";
import { wordSelector } from "./memory";
import { CONTROL_BUS, EDGE_SIGNALS, held, heldRegister } from "./multicycle";

export interface TrapMachineOptions {
  readonly rom?: DatapathOptions["rom"];
  readonly registers?: DatapathOptions["registers"];
  readonly name?: string;
}

/** The controller's per-edge signals in Module 12's machine: Module 9's, and the trap's own. */
export const TRAP_EDGE_SIGNALS = [...EDGE_SIGNALS, "CWEN", "RESUMING"] as const;
export type TrapEdgeSignal = (typeof TRAP_EDGE_SIGNALS)[number];

/**
 * Module 12's control bus: Module 9's signals, then CWEN (a control register is written at this
 * edge), RESUMING (`resume`'s edge), RESUME and CREAD (the system jobs': the next PC from C2,
 * register Y's word from a control register), USER (user mode) and TRAP (this edge goes to the
 * handler), in the order their wires arrive at the bus.
 */
export const TRAP_CONTROL_BUS = [
  ...CONTROL_BUS,
  "CWEN",
  "RESUMING",
  "RESUME",
  "CREAD",
  "USER",
  "TRAP",
] as const;

/** The controller as Module 5's state machine, as data, with Module 12's way for the system jobs. */
export function trapControllerMachine(): Machine {
  return {
    id: "controller-traps",
    name: "controller",
    inputs: ["CALL", "CREG", "MEM", "WRITEY"],
    outputs: ["FETCHING"],
    states: [
      { name: "FETCH", code: CONTROL_STATES.FETCH, outputs: { FETCHING: 1 }, at: [60, 470] },
      { name: "READ", code: CONTROL_STATES.READ, at: [235, 40] },
      { name: "ALU", code: CONTROL_STATES.ALU, at: [235, 180] },
      { name: "MEMORY", code: CONTROL_STATES.MEMORY, at: [235, 330] },
      { name: "WRITE", code: CONTROL_STATES.WRITE, at: [410, 470] },
    ],
    rows: [
      { from: "FETCH", when: {}, to: "READ", labelAt: [105, 250] },
      { from: "READ", when: { CALL: 1 }, to: "WRITE", labelAt: [372, 250] },
      { from: "READ", when: { CALL: 0, CREG: 1 }, to: "WRITE", labelAt: [400, 200] },
      { from: "READ", when: { CALL: 0, CREG: 0 }, to: "ALU", labelAt: [196, 112] },
      { from: "ALU", when: { MEM: 1 }, to: "MEMORY", labelAt: [210, 262] },
      { from: "ALU", when: { MEM: 0, WRITEY: 1 }, to: "WRITE", labelAt: [345, 300] },
      { from: "ALU", when: { MEM: 0, WRITEY: 0 }, to: "FETCH", labelAt: [125, 300] },
      { from: "MEMORY", when: { WRITEY: 1 }, to: "WRITE", labelAt: [330, 430] },
      { from: "MEMORY", when: { WRITEY: 0 }, to: "FETCH", labelAt: [140, 430] },
      { from: "WRITE", when: {}, to: "FETCH", labelAt: [235, 498] },
    ],
    decode: "full",
    size: [470, 510],
  };
}

/** The edges each instruction takes in Module 12's machine: the system jobs 1 to 3 go to WRITE. */
export function trapStateSequence(kind: number, job: number): ControlState[] {
  if (kind === 8 && job >= 1 && job <= 3) return ["FETCH", "READ", "WRITE"];
  const sequences: Readonly<Record<number, ControlState[]>> = {
    1: ["FETCH", "READ", "ALU", "WRITE"],
    2: ["FETCH", "READ", "ALU", "WRITE"],
    3: ["FETCH", "READ", "ALU", "MEMORY", "WRITE"],
    4: ["FETCH", "READ", "ALU", "MEMORY"],
    5: ["FETCH", "READ", "ALU"],
    6: ["FETCH", "READ", "WRITE"],
    7: ["FETCH", "READ", "ALU"],
  };
  return sequences[kind] ?? ["FETCH", "READ"];
}

/**
 * The controller of Module 12's machine: Module 9's, with its next state read off
 * `trapControllerMachine`, and two changes for traps. The state register takes FETCH at an edge
 * that traps, as at a reset, and is written at such an edge though GO is 0. PCEN is 1 at an edge
 * that traps, so the PC takes the handler's address. Two more signals for the control registers:
 * CWEN at a control-register job's WRITE edge, RESUMING at `resume`'s.
 */
export function trapController(
  b: CircuitBuilder,
  ins: {
    CLK: NetId;
    RST: NetId;
    GO: NetId;
    TRAP: NetId;
    CALL: NetId;
    CREG: NetId;
    MEM: NetId;
    LOAD: NetId;
    STORE: NetId;
    WRITEY: NetId;
    CWRITE: NetId;
    RESUME: NetId;
  },
  outs: Record<TrapEdgeSignal | "S", NetId>,
): void {
  const m = trapControllerMachine();
  const decoderIns: Record<string, NetId> = {
    CALL: ins.CALL,
    CREG: ins.CREG,
    MEM: ins.MEM,
    WRITEY: ins.WRITEY,
  };
  b.scope(
    "controller",
    "controller-traps",
    (bb) => {
      const next = bb.net("NEXTSTATE", 3);
      const ends = bb.net("ENDS");
      const s = outs.S;
      // The state register: FETCH at a reset or at an edge that traps.
      bb.scope(
        "state",
        "state-register-traps",
        (rb) => {
          const toFetch = rb.or([ins.RST, ins.TRAP], {
            name: "orFetch",
            output: rb.net("TOFETCH"),
          });
          const d = mux(rb, toFetch, next, constant(rb, "zero", 3, 0n), "pickD");
          const we = rb.or([ins.GO, toFetch], { name: "write" });
          heldRegister(rb, "register", { D: d, EN: we, CLK: ins.CLK }, s);
        },
        {
          inputs: { D: next, RST: ins.RST, TRAP: ins.TRAP, EN: ins.GO, CLK: ins.CLK },
          outputs: { Q: s },
        },
      );
      const line: Record<string, NetId> = Object.fromEntries(
        m.states.map((st) => [st.name, bb.net(st.name)]),
      );
      bb.scope(
        "lines",
        "state-lines",
        (lb) => {
          const bits = [2, 1, 0].map((k) => lb.net(`S${k}`));
          splitWord(lb, s, { name: "split", outs: bits });
          const nots = bits.map((n, i) =>
            lb.not(n, { name: `notS${2 - i}`, output: lb.net(`NS${2 - i}`) }),
          );
          for (const st of m.states)
            lb.and(
              [...st.code].map((c, i) => (c === "1" ? (bits[i] as NetId) : (nots[i] as NetId))),
              { name: `is${st.name}`, output: line[st.name] as NetId },
            );
        },
        { inputs: { S: s }, outputs: line },
      );
      bb.scope(
        "nextState",
        "controller-next-traps",
        (nb) => {
          const inverted: Record<string, NetId> = {};
          const literal = (name: string, v: 0 | 1) => {
            if (v === 1) return decoderIns[name] as NetId;
            inverted[name] ??= nb.not(decoderIns[name] as NetId, {
              name: `not${name}`,
              output: nb.net(`N${name}`),
            });
            return inverted[name];
          };
          const terms = m.rows.map((row, i) => {
            const code = CONTROL_STATES[row.to as ControlState];
            if (!code.includes("1")) return undefined;
            const reads = Object.entries(row.when).map(([n, v]) => literal(n, v as 0 | 1));
            if (reads.length === 0) return line[row.from] as NetId;
            return nb.and([line[row.from] as NetId, ...reads], {
              name: `row${i + 1}`,
              output: nb.net(`R${i + 1}`),
            });
          });
          const nextBits = [0, 1, 2].map((i) => {
            const hits = [
              ...new Set(
                m.rows.flatMap((row, r) =>
                  CONTROL_STATES[row.to as ControlState][i] === "1" ? [terms[r] as NetId] : [],
                ),
              ),
            ];
            const k = 2 - i;
            if (hits.length === 1) return hits[0] as NetId;
            return nb.or(hits, { name: `orN${k}`, output: nb.net(`N${k}`) });
          });
          joinWord(nb, nextBits, next, { name: "join" });
          nb.nor(nextBits, { name: "norEnds", output: ends });
        },
        { inputs: { ...line, ...decoderIns }, outputs: { NEXTSTATE: next, ENDS: ends } },
      );
      const L = (n: string) => line[n] as NetId;
      bb.scope(
        "outputs",
        "controller-outputs-traps",
        (ob) => {
          ob.gate("buf", [L("FETCH")], { name: "outFetching", output: outs.FETCHING });
          ob.and([L("FETCH"), ins.GO], { name: "andIren", output: outs.IREN });
          ob.gate("buf", [L("READ")], { name: "outChecking", output: outs.CHECKING });
          ob.and([L("READ"), ins.GO], { name: "andHoldab", output: outs.HOLDAB });
          ob.and([L("ALU"), ins.GO], { name: "andHoldr", output: outs.HOLDR });
          ob.and([L("MEMORY"), ins.LOAD], { name: "andMload", output: outs.MLOAD });
          ob.and([L("MEMORY"), ins.STORE], { name: "andMstore", output: outs.MSTORE });
          ob.and([outs.MLOAD, ins.GO], { name: "andHoldm", output: outs.HOLDM });
          ob.and([L("WRITE"), ins.WRITEY, ins.GO], { name: "andWreg", output: outs.WREG });
          ob.and([L("WRITE"), ins.CWRITE, ins.GO], { name: "andCwen", output: outs.CWEN });
          ob.and([L("WRITE"), ins.RESUME, ins.GO], { name: "andResuming", output: outs.RESUMING });
          const finish = ob.and([ends, ins.GO], { name: "andEnds", output: ob.net("FINISH") });
          ob.or([finish, ins.TRAP], { name: "orPcen", output: outs.PCEN });
        },
        {
          inputs: {
            ...line,
            LOAD: ins.LOAD,
            STORE: ins.STORE,
            WRITEY: ins.WRITEY,
            CWRITE: ins.CWRITE,
            RESUME: ins.RESUME,
            ENDS: ends,
            GO: ins.GO,
            TRAP: ins.TRAP,
          },
          outputs: Object.fromEntries(TRAP_EDGE_SIGNALS.map((n) => [n, outs[n]])),
        },
      );
    },
    {
      // In the order the wires arrive from: the trap logic, over the top, the unit's reset and
      // clock, the decoder, the system jobs.
      inputs: {
        GO: ins.GO,
        TRAP: ins.TRAP,
        RST: ins.RST,
        CLK: ins.CLK,
        LOAD: ins.LOAD,
        STORE: ins.STORE,
        CALL: ins.CALL,
        MEM: ins.MEM,
        WRITEY: ins.WRITEY,
        CREG: ins.CREG,
        CWRITE: ins.CWRITE,
        RESUME: ins.RESUME,
      },
      outputs: Object.fromEntries(["S", ...TRAP_EDGE_SIGNALS].map((n) => [n, outs[n as "S"]])),
    },
  );
}

/**
 * The system jobs Module 12 builds, beside the decoder: from STOP (system jobs 1 to 4, which
 * Module 9's machine stopped on) and the job's low three bits, RESUME (job 1), CREAD (job 2,
 * `R3 <= C3`), CWRITE (job 3, `C4 <= R3`) and CREG (any of the three, which go to WRITE); HALTJOB,
 * `stop`, which halts the machine only in system mode. In user mode every one of the four is
 * refused: the decode step's cause becomes 22, unless the decoder's own cause, 21, is there,
 * which is lower. CREAD writes register Y, so WRITEY takes it too.
 */
export function systemJobs12(
  b: CircuitBuilder,
  ins: { STOP: NetId; J: NetId; USER: NetId; CAUSED: NetId; WRITEY: NetId },
  outs: {
    RESUME: NetId;
    CREAD: NetId;
    CWRITE: NetId;
    CREG: NetId;
    HALTJOB: NetId;
    CAUSET: NetId;
    WRITEYT: NetId;
  },
): void {
  b.scope(
    "system",
    "system-jobs-12",
    (bb) => {
      const [j2, j1, j0] = [2, 1, 0].map((i) => {
        const n = bb.net(`J${i}`);
        slicePart(bb, ins.J, i, i, n, `jBit${i}`);
        return n;
      }) as [NetId, NetId, NetId];
      const nj2 = bb.not(j2, { name: "notJ2", output: bb.net("NJ2") });
      const nj1 = bb.not(j1, { name: "notJ1", output: bb.net("NJ1") });
      const nj0 = bb.not(j0, { name: "notJ0", output: bb.net("NJ0") });
      bb.and([ins.STOP, nj1, j0], { name: "andResume", output: outs.RESUME });
      bb.and([ins.STOP, j1, nj0], { name: "andCread", output: outs.CREAD });
      bb.and([ins.STOP, j1, j0], { name: "andCwrite", output: outs.CWRITE });
      bb.and([ins.STOP, nj2], { name: "andCreg", output: outs.CREG });
      const nUser = bb.not(ins.USER, { name: "notUser", output: bb.net("SYSTEMMODE") });
      bb.and([ins.STOP, j2, nUser], { name: "andHalt", output: outs.HALTJOB });
      bb.or([ins.WRITEY, outs.CREAD], { name: "orWritey", output: outs.WRITEYT });
      // User mode refuses all four jobs (22); the decoder's 21 is lower and wins.
      const refused = bb.and([ins.STOP, ins.USER], {
        name: "andRefused",
        output: bb.net("REFUSED"),
      });
      const anyD = anyBit(bb, ins.CAUSED, 7, 0, "anyD");
      const own = mux(
        bb,
        refused,
        constant(bb, "none", 8, 0n),
        constant(bb, "refused22", 8, BigInt(CAUSES.userRefused)),
        "pickRefused",
      );
      mux(bb, anyD, own, ins.CAUSED, "pickCause", outs.CAUSET);
    },
    {
      inputs: {
        WRITEY: ins.WRITEY,
        STOP: ins.STOP,
        CAUSED: ins.CAUSED,
        J: ins.J,
        USER: ins.USER,
      },
      outputs: {
        WRITEYT: outs.WRITEYT,
        CREG: outs.CREG,
        CWRITE: outs.CWRITE,
        RESUME: outs.RESUME,
        CREAD: outs.CREAD,
        CAUSET: outs.CAUSET,
        HALTJOB: outs.HALTJOB,
      },
    },
  );
}

/**
 * The trap logic, where Module 9's stop logic was: each step's cause (fetch while FETCHING, the
 * decode step's while CHECKING, the memory's), the waiting events and IE, C0's bit 1, in. An
 * interrupt waits for the edge that would fetch, while IE is 1: the timer's (81) before the
 * door's (82). The cause is the lowest of those there: fetch, interrupt, decode, memory, which is
 * the order the steps run in. TRAPS is 1 when any is there. With no handler (NOHANDLER), a trap
 * halts the machine, as `stop` does in system mode; otherwise TRAP is 1 and the machine goes to
 * the handler. GO, 1 when the edge neither traps nor halts, lets the instruction do its work.
 */
export function trapLogic(
  b: CircuitBuilder,
  ins: {
    CAUSEF: NetId;
    CAUSED: NetId;
    CAUSEM: NetId;
    STOP: NetId;
    CHECKING: NetId;
    FETCHING: NetId;
    WAITING: NetId;
    IE: NetId;
    NOHANDLER: NetId;
  },
  outs: { HALT: NetId; CAUSE: NetId; GO: NetId; TRAP: NetId },
  scoped = true,
): void {
  block(
    b,
    scoped,
    "trapLogic",
    "trap-logic",
    (bb) => {
      const failedF = anyBit(bb, ins.CAUSEF, 7, 0, "failedF");
      const anyD = anyBit(bb, ins.CAUSED, 7, 0, "anyD");
      const failedD = bb.and([anyD, ins.CHECKING], {
        name: "andFailedD",
        output: bb.net("FAILEDD"),
      });
      const failedM = anyBit(bb, ins.CAUSEM, 7, 0, "failedM");
      const w0 = bb.net("W0");
      const w1 = bb.net("W1");
      slicePart(bb, ins.WAITING, 0, 0, w0, "waitBit0");
      slicePart(bb, ins.WAITING, 1, 1, w1, "waitBit1");
      const waits = bb.or([w0, w1], { name: "orWaits", output: bb.net("WAITS") });
      const intr = bb.and([ins.FETCHING, ins.IE, waits], {
        name: "andInterrupt",
        output: bb.net("INTERRUPT"),
      });
      const causeI = mux(
        bb,
        w0,
        constant(bb, "door82", 8, BigInt(CAUSES.door)),
        constant(bb, "timer81", 8, BigInt(CAUSES.timer)),
        "pickEvent",
      );
      // From the last step to the first, each selector lets an earlier one's cause win.
      const dm = mux(bb, failedD, ins.CAUSEM, ins.CAUSED, "pickD");
      const idm = mux(bb, intr, dm, causeI, "pickI");
      mux(bb, failedF, idm, ins.CAUSEF, "pickF", outs.CAUSE);
      const traps = bb.or([failedF, intr, failedD, failedM], {
        name: "orTraps",
        output: bb.net("TRAPS"),
      });
      const stopNow = bb.and([ins.STOP, ins.CHECKING], {
        name: "andStop",
        output: bb.net("STOPNOW"),
      });
      const stuck = bb.and([traps, ins.NOHANDLER], { name: "andStuck", output: bb.net("STUCK") });
      bb.or([stopNow, stuck], { name: "orHalt", output: outs.HALT });
      const hasHandler = bb.not(ins.NOHANDLER, { name: "notNoHandler", output: bb.net("HANDLER") });
      bb.and([traps, hasHandler], { name: "andTrap", output: outs.TRAP });
      bb.nor([traps, stopNow], { name: "norGo", output: outs.GO });
    },
    {
      // In the order the wires arrive from: the controller above, the system jobs, the mode, then
      // the unit's own inputs.
      inputs: {
        CHECKING: ins.CHECKING,
        FETCHING: ins.FETCHING,
        CAUSED: ins.CAUSED,
        STOP: ins.STOP,
        IE: ins.IE,
        CAUSEF: ins.CAUSEF,
        CAUSEM: ins.CAUSEM,
        WAITING: ins.WAITING,
        NOHANDLER: ins.NOHANDLER,
      },
      outputs: { GO: outs.GO, TRAP: outs.TRAP, CAUSE: outs.CAUSE, HALT: outs.HALT },
    },
  );
}

/** A register of `width` bits written at an edge where EN is 1, taking `reset` at a reset. */
function resetRegister(
  b: CircuitBuilder,
  name: string,
  ins: { D: NetId; EN: NetId; RST: NetId; CLK: NetId },
  q: NetId,
  reset: bigint,
): void {
  const width = b.widthOf(q);
  const d = mux(b, ins.RST, ins.D, constant(b, `${name}Reset`, width, reset), `${name}D`);
  const we = b.or([ins.EN, ins.RST], { name: `${name}Write` });
  heldRegister(b, name, { D: d, EN: we, CLK: ins.CLK }, q);
}

/** A word widened to 64 bits with 0s above it. */
function zeroWiden(b: CircuitBuilder, w: NetId, name: string): NetId {
  const out = b.net(name, 64);
  joinParts(b, [w, constant(b, `${name}Zeros`, 64 - b.widthOf(w), 0n)], out, `join${name}`);
  return out;
}

/**
 * The five control registers and the selectors in front of them (`docs/machine.md`): at a trap's
 * edge C0 takes 01, C1 takes C0, C2 takes the return point (PC + 4 after `call system`, whose
 * cause alone has bit 6 set, and the PC after every other cause) and C3 the cause; at `resume`'s
 * edge C0 takes C1; at a control-register job's WRITE edge the register the constant names takes
 * HA, register A's held word, cut to its width. Out: CWORD, the register the constant names, for
 * register Y; C2 and C4 for the next PC; C0's two bits; and NOHANDLER, 1 when C4 is 0 or the PC.
 */
export function controlRegisters(
  b: CircuitBuilder,
  ins: {
    HA: NetId;
    C: NetId;
    PC: NetId;
    PC4: NetId;
    CAUSE: NetId;
    TRAP: NetId;
    RESUMING: NetId;
    CWEN: NetId;
    RST: NetId;
    CLK: NetId;
  },
  outs: { CWORD: NetId; C2: NetId; C4: NetId; STATUS: NetId; NOHANDLER: NetId },
): void {
  b.scope(
    "cregs",
    "control-registers",
    (bb) => {
      // Which register a control-register job names: the constant's low three bits.
      const n = bb.net("N", 3);
      slicePart(bb, ins.C, 2, 0, n, "number");
      const lines = Array.from({ length: 5 }, (_, k) => bb.net(`WRITE${k}`));
      bb.scope(
        "pick",
        "control-number",
        (pb) => {
          const bits = [2, 1, 0].map((i) => {
            const x = pb.net(`N${i}`);
            slicePart(pb, n, i, i, x, `nBit${i}`);
            return x;
          });
          const nots = bits.map((x, i) => pb.not(x, { name: `notN${2 - i}` }));
          for (let k = 0; k < 5; k++)
            pb.and(
              [
                ins.CWEN,
                ...[2, 1, 0].map((i, at) =>
                  (k >> i) & 1 ? (bits[at] as NetId) : (nots[at] as NetId),
                ),
              ],
              { name: `write${k}`, output: lines[k] as NetId },
            );
        },
        {
          inputs: { N: n, CWEN: ins.CWEN },
          outputs: Object.fromEntries(lines.map((l, k) => [`W${k}`, l])),
        },
      );
      const ha2 = bb.net("HA2", 2);
      slicePart(bb, ins.HA, 1, 0, ha2, "haLow2");
      const ha8 = bb.net("HA8", 8);
      slicePart(bb, ins.HA, 7, 0, ha8, "haLow8");
      const c0 = outs.STATUS;
      const c1 = bb.net("C1", 2);
      const c3 = bb.net("C3", 8);
      const line = (k: number) => lines[k] as NetId;
      // C0: 01 at a trap, C1 at resume, else the written bits.
      const c0Own = mux(bb, ins.RESUMING, ha2, c1, "c0Resume");
      const c0D = mux(bb, ins.TRAP, c0Own, constant(bb, "system01", 2, 1n), "c0Trap");
      const c0En = bb.or([ins.TRAP, ins.RESUMING, line(0)], { name: "c0Enable" });
      resetRegister(bb, "c0", { D: c0D, EN: c0En, RST: ins.RST, CLK: ins.CLK }, c0, 1n);
      // C1: C0 at a trap.
      const c1D = mux(bb, ins.TRAP, ha2, c0, "c1Trap");
      const c1En = bb.or([ins.TRAP, line(1)], { name: "c1Enable" });
      resetRegister(bb, "c1", { D: c1D, EN: c1En, RST: ins.RST, CLK: ins.CLK }, c1, 0n);
      // C2: the return point at a trap.
      const sys = bb.net("SYSCALL");
      slicePart(bb, ins.CAUSE, 6, 6, sys, "causeBit6");
      const back = mux(bb, sys, ins.PC, ins.PC4, "returnPoint");
      const c2D = mux(bb, ins.TRAP, ins.HA, back, "c2Trap");
      const c2En = bb.or([ins.TRAP, line(2)], { name: "c2Enable" });
      resetRegister(bb, "c2", { D: c2D, EN: c2En, RST: ins.RST, CLK: ins.CLK }, outs.C2, 0n);
      // C3: the cause at a trap.
      const c3D = mux(bb, ins.TRAP, ha8, ins.CAUSE, "c3Trap");
      const c3En = bb.or([ins.TRAP, line(3)], { name: "c3Enable" });
      resetRegister(bb, "c3", { D: c3D, EN: c3En, RST: ins.RST, CLK: ins.CLK }, c3, 0n);
      // C4: written only.
      resetRegister(bb, "c4", { D: ins.HA, EN: line(4), RST: ins.RST, CLK: ins.CLK }, outs.C4, 0n);
      // The word register Y takes for R3 <= C3, by the constant's number.
      const zero = constant(bb, "noRegister", 64, 0n);
      muxTree(
        bb,
        n,
        [
          zeroWiden(bb, c0, "C0WORD"),
          zeroWiden(bb, c1, "C1WORD"),
          outs.C2,
          zeroWiden(bb, c3, "C3WORD"),
          outs.C4,
          zero,
          zero,
          zero,
        ],
        "read",
        outs.CWORD,
      );
      // No handler: C4 is 0, or C4 is the PC.
      bb.scope(
        "noHandler",
        "no-handler",
        (hb) => {
          const none = hb.not(anyBit(hb, outs.C4, 63, 0, "anyC4"), { name: "noC4" });
          const diff = hb.xor([outs.C4, ins.PC], { name: "xorPc", output: hb.net("DIFF", 64) });
          const same = hb.not(anyBit(hb, diff, 63, 0, "anyDiff"), { name: "samePc" });
          hb.or([none, same], { name: "orNoHandler", output: outs.NOHANDLER });
        },
        { inputs: { C4: outs.C4, PC: ins.PC }, outputs: { NOHANDLER: outs.NOHANDLER } },
      );
    },
    {
      inputs: {
        HA: ins.HA,
        C: ins.C,
        PC: ins.PC,
        PC4: ins.PC4,
        CAUSE: ins.CAUSE,
        TRAP: ins.TRAP,
        RESUMING: ins.RESUMING,
        CWEN: ins.CWEN,
        RST: ins.RST,
        CLK: ins.CLK,
      },
      outputs: outs,
    },
  );
}

/** The control bus's signals, split out of it by name inside a block. */
function splitBus(
  b: CircuitBuilder,
  bus: NetId,
  names: readonly string[],
  name = "signals",
  suffix = "",
): Record<string, NetId> {
  // A signal split out twice in one block takes a suffix on its second net's name.
  const outs = Object.fromEntries(names.map((n) => [n, b.net(`${n}${suffix}`)]));
  b.scope(
    name,
    "split-control",
    (bb) => {
      for (const n of names) {
        const at = TRAP_CONTROL_BUS.indexOf(n as never);
        slicePart(bb, bus, at, at, outs[n] as NetId, `bit${n}`);
      }
    },
    { inputs: { CONTROL: bus }, outputs: outs },
  );
  return outs;
}

/**
 * Module 12's machine of several edges: Module 9's three blocks, with the trap hardware inside
 * them. New wires between the blocks: the cause into the datapath, for C3; C0's two bits and
 * NOHANDLER from the datapath to the control unit; the waiting events from the memory to the
 * control unit.
 */
export function trapsCircuit(options: TrapMachineOptions = {}): Circuit {
  const b = new CircuitBuilder(options.name ?? "machine");
  const clk = b.input("CLK");
  const rst = b.input("RST");
  const shop = {
    DOOR: b.input("DOOR"),
    WARM: b.input("WARM"),
    SENSORA: b.input("SENSORA", 64),
    SENSORB: b.input("SENSORB", 64),
  };
  const pc = b.net("PC", 64);
  const ir = b.net("IR", 32);
  const addr = b.net("ADDR", 64);
  const hb = b.net("HB", 64);
  const fetched = b.net("FETCHED", 32);
  const mq = b.net("MQ", 64);
  const causef = b.net("CAUSEF", 8);
  const causem = b.net("CAUSEM", 8);
  const display = b.net("DISPLAY", 64);
  const lamps = b.net("LAMPS", 3);
  const waiting = b.net("WAITING", 2);
  const status = b.net("STATUS", 2);
  const noHandler = b.net("NOHANDLER");
  const halt = b.net("HALT");
  const cause = b.net("CAUSE", 8);
  const control = b.net("CONTROL", TRAP_CONTROL_BUS.length);
  const signals = Object.fromEntries(
    [
      "CAUSED",
      "STOP",
      "WRITEY",
      "LOAD",
      "STORE",
      "BYTE",
      "AZERO",
      "BCONST",
      "OP2",
      "OP1",
      "OP0",
      "BRANCH",
      "CALL",
      "JUMP",
      "MEM",
      "RESUME",
      "CREAD",
      "CWRITE",
      "CREG",
      "HALTJOB",
      "CAUSET",
      "WRITEYT",
      "USER",
      "IE",
      "TRAP",
    ].map((n) => [n, b.net(`control/${n}`, n === "CAUSED" || n === "CAUSET" ? 8 : 1)]),
  );
  const sig = (n: string) => signals[n] as NetId;
  const edge = Object.fromEntries(
    [...TRAP_EDGE_SIGNALS, "S"].map((n) => [n, b.net(`control/${n}`, n === "S" ? 3 : 1)]),
  ) as Record<TrapEdgeSignal | "S", NetId>;
  const go = b.net("control/GO");

  // The control unit.
  b.scope(
    "control",
    "control-unit-traps",
    (cb) => {
      const d = digits(cb, ir);
      // C0's two bits: user mode is bit 0 at 0; interrupts on is bit 1.
      cb.scope(
        "mode",
        "mode-bits",
        (mb) => {
          const b0 = mb.net("B0");
          slicePart(mb, status, 0, 0, b0, "bit0");
          mb.not(b0, { name: "notSystem", output: sig("USER") });
          slicePart(mb, status, 1, 1, sig("IE"), "bit1");
        },
        { inputs: { STATUS: status }, outputs: { USER: sig("USER"), IE: sig("IE") } },
      );
      controlDecoder(cb, { K: d.K, J: d.J, C: d.C }, { outs: signals });
      systemJobs12(
        cb,
        {
          STOP: sig("STOP"),
          J: d.J,
          USER: sig("USER"),
          CAUSED: sig("CAUSED"),
          WRITEY: sig("WRITEY"),
        },
        {
          RESUME: sig("RESUME"),
          CREAD: sig("CREAD"),
          CWRITE: sig("CWRITE"),
          CREG: sig("CREG"),
          HALTJOB: sig("HALTJOB"),
          CAUSET: sig("CAUSET"),
          WRITEYT: sig("WRITEYT"),
        },
      );
      trapController(
        cb,
        {
          CLK: clk,
          RST: rst,
          GO: go,
          TRAP: sig("TRAP"),
          CALL: sig("CALL"),
          CREG: sig("CREG"),
          MEM: sig("MEM"),
          LOAD: sig("LOAD"),
          STORE: sig("STORE"),
          WRITEY: sig("WRITEYT"),
          CWRITE: sig("CWRITE"),
          RESUME: sig("RESUME"),
        },
        edge,
      );
      trapLogic(
        cb,
        {
          CAUSEF: causef,
          CAUSED: sig("CAUSET"),
          CAUSEM: causem,
          STOP: sig("HALTJOB"),
          CHECKING: edge.CHECKING,
          FETCHING: edge.FETCHING,
          WAITING: waiting,
          IE: sig("IE"),
          NOHANDLER: noHandler,
        },
        { HALT: halt, CAUSE: cause, GO: go, TRAP: sig("TRAP") },
      );
      const bits = TRAP_CONTROL_BUS.map((n) =>
        n === "GO"
          ? go
          : n === "WRITEY"
            ? sig("WRITEYT")
            : ((edge as Record<string, NetId>)[n] ?? sig(n)),
      );
      cb.scope(
        "bus",
        "join-control-traps",
        (jb) =>
          jb.component(
            "join",
            Object.fromEntries(
              bits.map((n, i) => [i < 26 ? String.fromCharCode(97 + i) : `in${i}`, n]),
            ),
            { y: control },
            { name: "join", params: { width: TRAP_CONTROL_BUS.length } },
          ),
        {
          inputs: Object.fromEntries(TRAP_CONTROL_BUS.map((n, i) => [n, bits[i] as NetId])),
          outputs: { CONTROL: control },
        },
      );
    },
    {
      // The loops back from the memory first, then the datapath's, so the wires nest.
      inputs: {
        CAUSEF: causef,
        CAUSEM: causem,
        WAITING: waiting,
        IR: ir,
        STATUS: status,
        NOHANDLER: noHandler,
        CLK: clk,
        RST: rst,
      },
      outputs: { CONTROL: control, CAUSE: cause, HALT: halt },
    },
  );

  // The datapath.
  b.scope(
    "datapath",
    "datapath-traps",
    (db) => {
      const c = {
        ...splitBus(db, control, ["FETCHING", "IREN", "PCEN"], "toFetch"),
        ...splitBus(db, control, ["HOLDAB", "WREG"], "toRegisters"),
        ...splitBus(db, control, ["AZERO", "BCONST", "OP2", "OP1", "OP0", "HOLDR"], "toAlu"),
        ...splitBus(
          db,
          control,
          ["BRANCH", "CALL", "JUMP", "HOLDM", "LOAD", "CREAD", "RESUME", "TRAP"],
          "toNext",
        ),
      };
      const s = (n: string) => c[n] as NetId;
      // TRAP again for the control registers, from a split of their own beside them.
      const cr = splitBus(db, control, ["TRAP", "RESUMING", "CWEN"], "toControlRegisters", "2");
      const ha = db.net("HA", 64);
      const hr = db.net("HR", 64);
      const hm = db.net("HM", 64);
      const result = db.net("RESULT", 64);
      const yIn = db.net("YIN", 64);
      const next = db.net("NEXT", 64);
      const nextT = db.net("NEXTT", 64);
      const pc4 = db.net("PC4", 64);
      const cword = db.net("CWORD", 64);
      const c2 = db.net("C2", 64);
      const c4 = db.net("C4", 64);
      datapathRegister(db, "pc", { D: nextT, EN: s("PCEN"), RST: rst, CLK: clk }, pc);
      wordSelector(db, { A: hr, B: pc, S: s("FETCHING") }, { name: "pickAddr", outs: { Y: addr } });
      db.scope(
        "ir",
        "word-register-32",
        (bb) => edgeRegister(bb, "register", { D: fetched, EN: s("IREN"), RST: rst, CLK: clk }, ir),
        { inputs: { D: fetched, RST: rst, EN: s("IREN"), CLK: clk }, outputs: { Q: ir } },
      );
      const d = digits(db, ir);
      const regs = registerFile64(
        db,
        { RA: d.A, RB: d.B, WA: d.Y, D: yIn, WE: s("WREG"), CLK: clk },
        options.registers,
      );
      db.scope(
        "hold",
        "hold-ab",
        (bb) => {
          heldRegister(bb, "heldA", { D: regs.QA, EN: s("HOLDAB"), CLK: clk }, ha);
          heldRegister(bb, "heldB", { D: regs.QB, EN: s("HOLDAB"), CLK: clk }, hb);
        },
        {
          inputs: { QA: regs.QA, QB: regs.QB, EN: s("HOLDAB"), CLK: clk },
          outputs: { HA: ha, HB: hb },
        },
      );
      const wide = widenBlock(db, d.C);
      const aluA = zeroOr(db, ha, s("AZERO"));
      const aluB = wordSelector(
        db,
        { A: hb, B: wide, S: s("BCONST") },
        { name: "pickB", outs: { Y: db.net("ALUB", 64) } },
      ).Y;
      const flags = aluParts(
        db,
        { A: aluA, B: aluB, OP2: s("OP2"), OP1: s("OP1"), OP0: s("OP0") },
        { width: 64, flags: true, closed: true, outs: { Y: result } },
      );
      held(db, "heldR", { D: result, EN: s("HOLDR"), CLK: clk }, hr);
      held(db, "heldM", { D: mq, EN: s("HOLDM"), CLK: clk }, hm);
      controlRegisters(
        db,
        {
          HA: ha,
          C: d.C,
          PC: pc,
          PC4: pc4,
          CAUSE: cause,
          TRAP: cr["TRAP"] as NetId,
          RESUMING: cr["RESUMING"] as NetId,
          CWEN: cr["CWEN"] as NetId,
          RST: rst,
          CLK: clk,
        },
        { CWORD: cword, C2: c2, C4: c4, STATUS: status, NOHANDLER: noHandler },
      );
      // What register Y takes: the held result, a load's word, PC + 4, or a control register.
      const yIns = {
        HR: hr,
        HM: hm,
        PC4: pc4,
        CWORD: cword,
        LOAD: s("LOAD"),
        CALL: s("CALL"),
        CREAD: s("CREAD"),
      };
      db.scope(
        "yWord",
        "yWord-traps",
        (bb) => {
          const loaded = mux(bb, yIns.LOAD, hr, hm, "pickLoad");
          const called = mux(bb, yIns.CALL, loaded, pc4, "pickCall");
          mux(bb, yIns.CREAD, called, cword, "pickControl", yIn);
        },
        { inputs: yIns, outputs: { YIN: yIn } },
      );
      const met = branchCondition(db, {
        ZERO: flags["ZERO"] as NetId,
        MINUS: flags["MINUS"] as NetId,
        COUT: flags["COUT"] as NetId,
        OVER: flags["OVER"] as NetId,
        J: d.J,
      });
      const nextIns = {
        PC: pc,
        RESULT: result,
        MET: met,
        BRANCH: s("BRANCH"),
        CALL: s("CALL"),
        JUMP: s("JUMP"),
        WIDE: wide,
      };
      db.scope("next", "next", (bb) => nextPcParts(bb, nextIns, { NEXT: next, PC4: pc4 }), {
        inputs: nextIns,
        outputs: { NEXT: next, PC4: pc4 },
      });
      // The next PC: C2 for resume, and C4 at a trap, last, so a trap wins.
      const trapIns = { NEXT: next, C2: c2, C4: c4, RESUME: s("RESUME"), TRAP: s("TRAP") };
      db.scope(
        "nextTrap",
        "next-trap",
        (bb) => {
          const resumed = mux(bb, trapIns.RESUME, next, c2, "pickResume");
          mux(bb, trapIns.TRAP, resumed, c4, "pickTrap", nextT);
        },
        { inputs: trapIns, outputs: { NEXTT: nextT } },
      );
    },
    {
      inputs: { CONTROL: control, CAUSE: cause, FETCHED: fetched, MQ: mq, CLK: clk, RST: rst },
      outputs: { ADDR: addr, HB: hb, IR: ir, STATUS: status, NOHANDLER: noHandler },
    },
  );

  // The memory of one port.
  b.scope(
    "port",
    "memory-port-traps",
    (mb) => {
      const c = splitBus(mb, control, [
        "FETCHING",
        "MLOAD",
        "MSTORE",
        "BYTE",
        "GO",
        "PCEN",
        "USER",
      ]);
      const s = (n: string) => c[n] as NetId;
      // The timer counts an instruction that finished: the PC's enable where GO is 1. At a trap's
      // edge the PC's enable is 1 and GO is 0.
      const tick = mb.and([s("PCEN"), s("GO")], { name: "andTick", output: mb.net("TICK") });
      machineMemory(
        mb,
        {
          PC: addr,
          ADDR: addr,
          D: hb,
          LOAD: s("MLOAD"),
          STORE: s("MSTORE"),
          BYTE: s("BYTE"),
          GO: s("GO"),
          RST: rst,
          CLK: clk,
          ...shop,
          FETCHING: s("FETCHING"),
          ENDS: s("PCEN"),
          TICK: tick,
          USER: s("USER"),
        },
        options.rom,
        {
          CAUSEF: causef,
          CAUSEM: causem,
          MQ: mq,
          DISPLAY: display,
          LAMPS: lamps,
          IR: fetched,
          WAITING: waiting,
        },
      );
    },
    {
      inputs: { CONTROL: control, ADDR: addr, D: hb, CLK: clk, RST: rst, ...shop },
      outputs: {
        DISPLAY: display,
        LAMPS: lamps,
        CAUSEF: causef,
        CAUSEM: causem,
        WAITING: waiting,
        FETCHED: fetched,
        MQ: mq,
      },
    },
  );
  b.output("HALT", halt);
  b.output("CAUSE", cause);
  b.output("DISPLAY", display);
  b.output("LAMPS", lamps);
  return b.build();
}
