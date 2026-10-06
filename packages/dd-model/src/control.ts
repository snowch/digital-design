// Copyright © 2026 Christopher Snow

// Module 9: control. The decoder Module 8 drew closed, opened, and the controller that takes an
// instruction through several edges, as Module 5's state machine.
//
// The decoder is gates from the instruction's digits to the control signals, built the way
// Module 5 built next-state logic from a table: one line per kind, from Module 3's 2-to-4 decoder
// twice (K3 K2 picks one of four lines, K1 K0 another, and an AND gate joins a pair), and each
// control signal an OR of the kinds that need it, with a job bit ANDed in where the job matters.
// A kind line that is itself a control signal (kind 3 is LOAD) carries that signal's name. The
// checks are a second block: no kind line at all (kind 0, or 9 to F), a job its kind does not
// define, and, new in Module 9, a system job naming a control register outside 0 to 4, which needs
// the constant as one of the decoder's inputs (`docs/plan.md`, the decision of 6 October 2026).
//
// Module 8's decoder (datapath.ts) stays as it was, reading K and J alone, so Module 8's lessons
// and their figures are unchanged.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { decoder2, split4 } from "./combinational";
import { anyBit, block, causeWord, slicePart, type Given } from "./datapath";
import type { Machine, MachineRow } from "./fsm";
import { CAUSES } from "./machine";

export interface ControlOptions {
  /** Module 9's capstone: kind 9, job 0, is a call through a register. */
  readonly callThroughRegister?: boolean;
  /**
   * Whether the decoder gives MEM, a load or a store, for the controller of lesson 9.3 on; the
   * decoder lessons 9.1 and 9.2 draw it without. Given unless false.
   */
  readonly mem?: boolean;
}

/** The decoder's outputs, with MEM or without. */
export function decoderOutputs(options: ControlOptions = {}): readonly string[] {
  return options.mem === false ? DECODER9_OUTPUTS.filter((n) => n !== "MEM") : DECODER9_OUTPUTS;
}

/** The kind the capstone's call through a register uses: the first kind `docs/isa.md` leaves free. */
export const CALL_REGISTER_KIND = 9;

/** The control signals the decoder works out, as Module 8's full datapath reads them. */
export const CONTROL_SIGNALS = [
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
] as const;
export type ControlSignal = (typeof CONTROL_SIGNALS)[number];

/**
 * The decoder's outputs: the control signals, MEM for the controller (a load or a store, which
 * uses the memory), then `stop` and the decode step's cause.
 */
export const DECODER9_OUTPUTS = [...CONTROL_SIGNALS, "MEM", "STOP", "CAUSED"] as const;

/**
 * The name of each kind's line. A line that is a control signal on its own is named after the
 * signal, so the drawing says what it is: kind 3's line is LOAD.
 */
export function kindLineNames(options: ControlOptions = {}): Record<number, string> {
  const names: Record<number, string> = {
    1: "KIND1",
    2: "KIND2",
    3: "LOAD",
    4: "STORE",
    5: "BRANCH",
    6: "CALL",
    7: "JUMP",
    8: "KIND8",
  };
  if (options.callThroughRegister) {
    // The capstone's kind is a call and a jump at once, so CALL and JUMP are ORs of two lines.
    names[6] = "KIND6";
    names[7] = "KIND7";
    names[CALL_REGISTER_KIND] = `KIND${CALL_REGISTER_KIND}`;
  }
  return names;
}

/** The kinds the decoder knows: 1 to 8, and the capstone's. */
export function knownKinds(options: ControlOptions = {}): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, ...(options.callThroughRegister ? [CALL_REGISTER_KIND] : [])];
}

/**
 * One line per kind the machine knows, from K: Module 3's 2-to-4 decoder on K3 K2 and another on
 * K1 K0, and an AND gate per kind joining the line of its top two bits with the line of its bottom
 * two. A closed block (`kind-lines`) that opens to them.
 */
export function kindLines(
  b: CircuitBuilder,
  k: NetId,
  lines: Readonly<Record<number, NetId>>,
): void {
  b.scope(
    "kinds",
    "kind-lines",
    (bb) => {
      const bits = split4(
        bb,
        { W: k },
        {
          name: "kBits",
          outs: { b3: bb.net("K3"), b2: bb.net("K2"), b1: bb.net("K1"), b0: bb.net("K0") },
        },
      );
      const high = decoder2(
        bb,
        { S1: bits["b3"] as NetId, S0: bits["b2"] as NetId },
        {
          name: "high",
          outs: { Y0: bb.net("H0"), Y1: bb.net("H1"), Y2: bb.net("H2"), Y3: bb.net("H3") },
        },
      );
      const low = decoder2(
        bb,
        { S1: bits["b1"] as NetId, S0: bits["b0"] as NetId },
        {
          name: "low",
          outs: { Y0: bb.net("L0"), Y1: bb.net("L1"), Y2: bb.net("L2"), Y3: bb.net("L3") },
        },
      );
      for (const [n, line] of Object.entries(lines)) {
        const v = Number(n);
        bb.and([high[`Y${v >> 2}`] as NetId, low[`Y${v & 3}`] as NetId], {
          name: `kind${v}`,
          output: line,
        });
      }
    },
    {
      inputs: { K: k },
      outputs: Object.fromEntries(Object.entries(lines).map(([n, line]) => [`KIND${n}`, line])),
    },
  );
}

/** J's four bits, as a closed block (Module 3's split). */
export function jobBits(
  b: CircuitBuilder,
  j: NetId,
): { J3: NetId; J2: NetId; J1: NetId; J0: NetId } {
  const out = { J3: b.net("J3"), J2: b.net("J2"), J1: b.net("J1"), J0: b.net("J0") };
  split4(b, { W: j }, { name: "jBits", outs: { b3: out.J3, b2: out.J2, b1: out.J1, b0: out.J0 } });
  return out;
}

type Lines = Readonly<Record<number, NetId>>;
type Bits = { readonly J3: NetId; readonly J2: NetId; readonly J1: NetId; readonly J0: NetId };

/**
 * The control signals from the kind lines and the job's bits, as gates (`docs/machine.md`, "The
 * single-cycle datapath"): JOBS for the two kinds of job and MEM for a load or a store; WRITEY for
 * the kinds that write register Y; BCONST for those whose ALU takes the constant as B; AZERO and
 * BYTE from job bits 3 and 0 of a load or store; the ALU's code from the job's low three bits for
 * the two kinds of job, add for a load, store or jump, and subtract for a branch. `outs` holds the
 * nets for the signals that are not kind lines.
 */
export function signalGates(
  b: CircuitBuilder,
  line: Lines,
  j: Bits,
  outs: Readonly<Record<string, NetId>>,
  options: ControlOptions = {},
): void {
  const k = (n: number) => line[n] as NetId;
  const out = (name: string) => outs[name] as NetId;
  const extra = options.callThroughRegister ? [k(CALL_REGISTER_KIND)] : [];
  const jobs = b.or([k(1), k(2)], { name: "orJobs", output: b.net("JOBS") });
  const mem = b.or([k(3), k(4)], { name: "orMem", output: outs["MEM"] ?? b.net("MEM") });
  b.or([jobs, k(3), k(6), ...extra], { name: "orWritey", output: out("WRITEY") });
  b.or([k(2), mem, k(7), ...extra], { name: "orBconst", output: out("BCONST") });
  b.and([mem, j.J3], { name: "andAzero", output: out("AZERO") });
  b.and([mem, j.J0], { name: "andByte", output: out("BYTE") });
  b.and([jobs, j.J2], { name: "andOp2", output: out("OP2") });
  const op1 = b.and([jobs, j.J1], { name: "andOp1", output: b.net("JOB1") });
  b.or([op1, mem, k(5), k(7), ...extra], { name: "orOp1", output: out("OP1") });
  const op0 = b.and([jobs, j.J0], { name: "andOp0", output: b.net("JOB0") });
  b.or([op0, k(5)], { name: "orOp0", output: out("OP0") });
  if (options.callThroughRegister) {
    b.or([k(6), k(CALL_REGISTER_KIND)], { name: "orCall", output: out("CALL") });
    b.or([k(7), k(CALL_REGISTER_KIND)], { name: "orJump", output: out("JUMP") });
  }
}

/**
 * The decoder's checks, each a block that opens to its gates: `kindCheck`, NOKIND when no kind
 * line is 1 (kind 0, or a kind the machine does not know); `jobCheck`, BADJOB when the job is one
 * its kind does not define; `numberCheck`, BADNUMBER when a system job names a control register
 * outside 0 to 4 (the constant, read signed); ILLEGAL, any of the three. `systemJobs` gives SYSTEM
 * for `call system` and STOP for system jobs 1 to 4, the jobs that stop the machine until Module 12
 * builds what 1 to 3 do. CAUSED is the decode step's cause: 21 for an illegal instruction, 41 for
 * `call system`, 00 otherwise.
 */
export function checkGates(
  b: CircuitBuilder,
  line: Lines,
  j: Bits,
  c: NetId,
  outs: { readonly CAUSED: NetId; readonly STOP: NetId; readonly ILLEGAL: NetId },
  options: ControlOptions = {},
): void {
  const k = (n: number) => line[n] as NetId;
  const names = kindLineNames(options);
  const known = knownKinds(options);
  const lineIns = (kinds: readonly number[]) =>
    Object.fromEntries(kinds.map((n) => [names[n] as string, k(n)]));
  const noKind = b.net("NOKIND");
  b.scope(
    "kindCheck",
    options.callThroughRegister ? "kind-check-call" : "kind-check",
    (bb) => {
      bb.nor(
        known.map((n) => k(n)),
        { name: "norKinds", output: noKind },
      );
    },
    { inputs: lineIns(known), outputs: { NOKIND: noKind } },
  );
  const badJob = b.net("BADJOB");
  const jobKinds = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    ...(options.callThroughRegister ? [CALL_REGISTER_KIND] : []),
  ];
  b.scope(
    "jobCheck",
    options.callThroughRegister ? "job-check-call" : "job-check",
    (bb) => {
      const anyJob = bb.or([j.J3, j.J2, j.J1, j.J0], {
        name: "orAnyJob",
        output: bb.net("ANYJOB"),
      });
      // Kinds 1, 2 and 5 have jobs 0 to 7: job bit 3 is never 1.
      const eight = bb.or([k(1), k(2), k(5)], { name: "orEight", output: bb.net("EIGHTJOBS") });
      const badEight = bb.and([eight, j.J3], { name: "andBadEight", output: bb.net("BADEIGHT") });
      // Loads and stores have jobs 0, 1, 8 and 9: job bits 2 and 1 are never 1.
      const mem = bb.or([k(3), k(4)], { name: "orMemKinds", output: bb.net("MEMKINDS") });
      const twoOne = bb.or([j.J2, j.J1], { name: "orJ2J1", output: bb.net("J2ORJ1") });
      const badMem = bb.and([mem, twoOne], { name: "andBadMem", output: bb.net("BADMEM") });
      // A call and a jump have job 0 alone.
      const one = bb.or(
        [k(6), k(7), ...(options.callThroughRegister ? [k(CALL_REGISTER_KIND)] : [])],
        { name: "orOneJob", output: bb.net("ONEJOB") },
      );
      const badOne = bb.and([one, anyJob], { name: "andBadOne", output: bb.net("BADONE") });
      // System jobs 0 to 4: 5 to F are J3, or J2 with J1 or J0.
      const tail = bb.or([j.J1, j.J0], { name: "orJ1J0", output: bb.net("J1ORJ0") });
      const five = bb.and([j.J2, tail], { name: "andFiveUp", output: bb.net("J5TO7") });
      const high = bb.or([j.J3, five], { name: "orHighJob", output: bb.net("JOB5UP") });
      const badSystem = bb.and([k(8), high], { name: "andBadSystem", output: bb.net("BADSYSTEM") });
      bb.or([badEight, badMem, badOne, badSystem], { name: "orBadJob", output: badJob });
    },
    { inputs: { ...lineIns(jobKinds), ...j }, outputs: { BADJOB: badJob } },
  );
  const badNumber = b.net("BADNUMBER");
  b.scope(
    "numberCheck",
    "number-check",
    (bb) => {
      // The constant's bits: any of 11 to 3, and 2, 1 and 0, as one closed block.
      const cHigh = bb.net("CHIGH");
      const c2 = bb.net("C2");
      const c1 = bb.net("C1");
      const c0 = bb.net("C0");
      bb.scope(
        "cBits",
        "constant-bits",
        (cb) => {
          anyBit(cb, c, 11, 3, "high", cHigh);
          slicePart(cb, c, 2, 2, c2, "bit2");
          slicePart(cb, c, 1, 1, c1, "bit1");
          slicePart(cb, c, 0, 0, c0, "bit0");
        },
        { inputs: { C: c }, outputs: { CHIGH: cHigh, C2: c2, C1: c1, C0: c0 } },
      );
      // Read signed, 0 to 4 are the registers: any of bits 11 to 3, or bit 2 with bit 1 or bit
      // 0, is outside.
      const cTail = bb.or([c1, c0], { name: "orC1C0", output: bb.net("C1ORC0") });
      const fiveUp = bb.and([c2, cTail], { name: "andC5to7", output: bb.net("C5TO7") });
      const outside = bb.or([cHigh, fiveUp], { name: "orOutside", output: bb.net("OUTSIDE") });
      // Jobs 2 and 3 name a register: J3 and J2 0, J1 1.
      const notJ3 = bb.not(j.J3, { name: "notJ3", output: bb.net("NJ3") });
      const notJ2 = bb.not(j.J2, { name: "notJ2", output: bb.net("NJ2") });
      const names2 = bb.and([notJ3, notJ2, j.J1, k(8)], {
        name: "andNames",
        output: bb.net("NAMESC"),
      });
      bb.and([outside, names2], { name: "andBadNumber", output: badNumber });
    },
    {
      inputs: { [names[8] as string]: k(8), J3: j.J3, J2: j.J2, J1: j.J1, C: c },
      outputs: { BADNUMBER: badNumber },
    },
  );
  b.or([noKind, badJob, badNumber], { name: "orIllegal", output: outs.ILLEGAL });
  const system = b.net("SYSTEM");
  b.scope(
    "systemJobs",
    "system-jobs",
    (bb) => {
      const anyJob = bb.or([j.J3, j.J2, j.J1, j.J0], {
        name: "orAnyJob",
        output: bb.net("ANYJOB"),
      });
      const noJob = bb.not(anyJob, { name: "notAnyJob", output: bb.net("JOBZERO") });
      bb.and([k(8), noJob], { name: "andSystem", output: system });
      const tail = bb.or([j.J1, j.J0], { name: "orJ1J0", output: bb.net("J1ORJ0") });
      const five = bb.and([j.J2, tail], { name: "andFiveUp", output: bb.net("J5TO7") });
      const high = bb.or([j.J3, five], { name: "orHighJob", output: bb.net("JOB5UP") });
      const notHigh = bb.not(high, { name: "notHighJob", output: bb.net("JOB4DOWN") });
      bb.and([k(8), anyJob, notHigh], { name: "andStop", output: outs.STOP });
    },
    {
      inputs: { [names[8] as string]: k(8), ...j },
      outputs: { SYSTEM: system, STOP: outs.STOP },
    },
  );
  // The cause as a byte: a closed block of selectors, as every cause word in the machine is.
  b.scope(
    "causeWord",
    "cause-word",
    (bb) =>
      causeWord(
        bb,
        [
          [outs.ILLEGAL, CAUSES.illegal],
          [system, CAUSES.system],
        ],
        "caused",
        outs.CAUSED,
      ),
    { inputs: { ILLEGAL: outs.ILLEGAL, SYSTEM: system }, outputs: { CAUSED: outs.CAUSED } },
  );
}

/**
 * Module 9's decoder: K, J and the constant C in; the decode step's cause, STOP and the control
 * signals out. It opens to the kind lines, J's bits, the control signals and the checks, each a
 * block that opens to its gates.
 */
export function controlDecoder(
  b: CircuitBuilder,
  ins: { K: NetId; J: NetId; C: NetId },
  given: Given = {},
  options: ControlOptions = {},
): Record<string, NetId> {
  const outs = Object.fromEntries(
    decoderOutputs(options).map((n) => [n, given.outs?.[n] ?? b.net(n, n === "CAUSED" ? 8 : 1)]),
  );
  block(
    b,
    given.scoped ?? true,
    "decoder",
    // Each variant has a kind of its own, since each is drawn by hand with its own ports.
    options.callThroughRegister
      ? "control-decoder-call"
      : options.mem === false
        ? "control-decoder"
        : "control-decoder-mem",
    (bb) => {
      const names = kindLineNames(options);
      const lines: Record<number, NetId> = Object.fromEntries(
        Object.entries(names).map(([n, name]) => [n, outs[name] ?? bb.net(name)]),
      );
      kindLines(bb, ins.K, lines);
      const j = jobBits(bb, ins.J);
      const signalOuts = [
        ...CONTROL_SIGNALS.filter((s) => !Object.values(names).includes(s)),
        ...(options.mem === false ? [] : ["MEM"]),
      ];
      const lineIns = Object.fromEntries(
        Object.entries(lines).map(([n, line]) => [names[Number(n)] as string, line]),
      );
      // Kind 8's line is the checks' alone.
      const signalLines = Object.fromEntries(
        Object.entries(lineIns).filter(([name]) => name !== names[8]),
      );
      bb.scope(
        "signals",
        options.callThroughRegister ? "control-signals-call" : "control-signals",
        (sb) =>
          signalGates(
            sb,
            lines,
            j,
            Object.fromEntries(signalOuts.map((s) => [s, outs[s] as NetId])),
            options,
          ),
        {
          inputs: { ...signalLines, ...j },
          outputs: Object.fromEntries(signalOuts.map((s) => [s, outs[s] as NetId])),
        },
      );
      const illegal = bb.net("ILLEGAL");
      bb.scope(
        "checks",
        options.callThroughRegister ? "decode-checks-call" : "decode-checks",
        (cb) =>
          checkGates(
            cb,
            lines,
            j,
            ins.C,
            { CAUSED: outs["CAUSED"] as NetId, STOP: outs["STOP"] as NetId, ILLEGAL: illegal },
            options,
          ),
        {
          inputs: { ...lineIns, ...j, C: ins.C },
          outputs: {
            ILLEGAL: illegal,
            CAUSED: outs["CAUSED"] as NetId,
            STOP: outs["STOP"] as NetId,
          },
        },
      );
    },
    { inputs: { K: ins.K, J: ins.J, C: ins.C }, outputs: outs },
  );
  return outs;
}

/**
 * The decoder's control signals as a lesson's circuit (lesson 9.1): K and J in, the kind lines and
 * J's bits as blocks, the gates at the top level, and every control signal out.
 */
export function decoderSignalsCircuit(options: ControlOptions = {}): Circuit {
  const b = new CircuitBuilder("decoder-signals");
  const k = b.input("K", 4);
  const jIn = b.input("J", 4);
  const names = kindLineNames(options);
  const lines: Record<number, NetId> = Object.fromEntries(
    Object.entries(names).map(([n, name]) => [n, b.net(name)]),
  );
  // Kind 8's line is a check's, not a control signal's: this circuit leaves it out.
  delete lines[8];
  kindLines(b, k, lines);
  const j = jobBits(b, jIn);
  const outs = Object.fromEntries(
    CONTROL_SIGNALS.filter((s) => !Object.values(names).includes(s)).map((s) => [s, b.net(s)]),
  );
  signalGates(b, lines, j, outs, options);
  for (const s of CONTROL_SIGNALS)
    b.output(s, (outs[s] ?? lines[Number(kindOf(names, s))]) as NetId);
  return b.build();
}

function kindOf(names: Record<number, string>, signal: string): string | undefined {
  return Object.entries(names).find(([, n]) => n === signal)?.[0];
}

/**
 * The decoder's checks as a lesson's circuit (lesson 9.2): K, J and C in, the kind lines and J's
 * bits as blocks, the check's gates at the top level, and ILLEGAL, STOP and CAUSED out.
 */
export function decoderChecksCircuit(options: ControlOptions = {}): Circuit {
  const b = new CircuitBuilder("decoder-checks");
  const k = b.input("K", 4);
  const jIn = b.input("J", 4);
  const c = b.input("C", 12);
  const names = kindLineNames(options);
  const lines: Record<number, NetId> = Object.fromEntries(
    Object.entries(names).map(([n, name]) => [n, b.net(name)]),
  );
  kindLines(b, k, lines);
  const j = jobBits(b, jIn);
  const outs = { CAUSED: b.net("CAUSED", 8), STOP: b.net("STOP"), ILLEGAL: b.net("ILLEGAL") };
  checkGates(b, lines, j, c, outs, options);
  b.output("ILLEGAL", outs.ILLEGAL);
  b.output("STOP", outs.STOP);
  b.output("CAUSED", outs.CAUSED);
  return b.build();
}

/** The whole decoder as a circuit of its own: K, J and C in, its outputs out. */
export function decoderCircuit(options: ControlOptions = {}): Circuit {
  const b = new CircuitBuilder("decoder");
  const ins = { K: b.input("K", 4), J: b.input("J", 4), C: b.input("C", 12) };
  const outs = controlDecoder(b, ins, {}, options);
  for (const n of decoderOutputs(options)) b.output(n, outs[n] as NetId);
  return b.build();
}

// ---- The controller -------------------------------------------------------------------------

/**
 * The states an instruction goes through, one edge each, with their codes. A reset makes the
 * state register 000, so the first state is the fetch, as Module 5's reset leads to the all-zero
 * code.
 */
export const CONTROL_STATES = {
  FETCH: "000",
  READ: "001",
  ALU: "010",
  MEMORY: "011",
  WRITE: "100",
} as const;
export type ControlState = keyof typeof CONTROL_STATES;

/**
 * The controller as Module 5's state machine, as data: its next state from the state and three of
 * the decoder's signals. Every instruction is fetched and then read; a call (CALL) goes straight to
 * writing; a load or a store (MEM) uses the memory; a job, a load and a call write register Y
 * (WRITEY); a branch and a jump end at the ALU, where their next PC is worked out from the ALU's
 * result and flags.
 * The edge whose next state is FETCH ends the instruction.
 */
export function controllerMachine(): Machine {
  // The capstone's call through a register needs no row of its own: it sets CALL, so it takes the
  // call's way, FETCH, READ, WRITE, and its WRITE edge takes the PC from the ALU, whose inputs, HA
  // and the constant, are ready from READ on.
  const read: MachineRow[] = [
    { from: "READ", when: { CALL: 1 }, to: "WRITE", labelAt: [372, 250] },
    { from: "READ", when: { CALL: 0 }, to: "ALU", labelAt: [196, 112] },
  ];
  return {
    id: "controller",
    name: "controller",
    inputs: ["CALL", "MEM", "WRITEY"],
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
      ...read,
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

/** The states each kind passes through, from its fetch, one edge each (the table above). */
export function stateSequence(kind: number, options: ControlOptions = {}): ControlState[] {
  if (options.callThroughRegister && kind === CALL_REGISTER_KIND) return ["FETCH", "READ", "WRITE"];
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

/** The edges each kind takes, from its fetch to the edge that ends it (the sequence above). */
export function edgesOfKind(kind: number, options: ControlOptions = {}): number | undefined {
  if (!(options.callThroughRegister && kind === CALL_REGISTER_KIND) && (kind < 1 || kind > 7))
    return undefined;
  return stateSequence(kind, options).length;
}
