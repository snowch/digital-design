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

/** The decoder's outputs: the decode step's cause, `stop`, and the control signals. */
export const DECODER9_OUTPUTS = ["CAUSED", "STOP", ...CONTROL_SIGNALS] as const;

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
 * single-cycle datapath"): WRITEY for the kinds that write register Y; BCONST for those whose
 * ALU takes the constant as B; AZERO and BYTE from job bits 3 and 0 of a load or store; the ALU's
 * code from the job's low three bits for the two kinds of job, add for a load, store or jump, and
 * subtract for a branch. `outs` holds the nets for the signals that are not kind lines.
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
  b.or([k(1), k(2), k(3), k(6), ...extra], { name: "orWritey", output: out("WRITEY") });
  b.or([k(2), k(3), k(4), k(7), ...extra], { name: "orBconst", output: out("BCONST") });
  const mem = b.or([k(3), k(4)], { name: "orMem", output: b.net("MEM") });
  const jobs = b.or([k(1), k(2)], { name: "orJobs", output: b.net("JOBS") });
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
 * The decoder's checks, as gates: ILLEGAL when no kind line is 1 (kind 0, or a kind the machine
 * does not know), when the job is one its kind does not define, or when a system job names a
 * control register outside 0 to 4; SYSTEM for `call system`; STOP for system jobs 1 to 4, the
 * jobs that stop the machine until Module 12 builds what 1 to 3 do. CAUSED is the decode step's
 * cause: 21 for an illegal instruction, 41 for `call system`, 00 otherwise.
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
  const known = b.or(
    knownKinds(options).map((n) => k(n)),
    { name: "orKnown", output: b.net("KNOWN") },
  );
  const noKind = b.not(known, { name: "notKnown", output: b.net("NOKIND") });
  const anyJob = b.or([j.J3, j.J2, j.J1, j.J0], { name: "orAnyJob", output: b.net("ANYJOB") });
  // Kinds 1, 2 and 5 have jobs 0 to 7: job bit 3 is never 1.
  const eight = b.or([k(1), k(2), k(5)], { name: "orEight", output: b.net("EIGHTJOBS") });
  const badEight = b.and([eight, j.J3], { name: "andBadEight", output: b.net("BADEIGHT") });
  // Loads and stores have jobs 0, 1, 8 and 9: job bits 2 and 1 are never 1.
  const mem = b.or([k(3), k(4)], { name: "orMemKinds", output: b.net("MEMKINDS") });
  const twoOne = b.or([j.J2, j.J1], { name: "orJ2J1", output: b.net("J2ORJ1") });
  const badMem = b.and([mem, twoOne], { name: "andBadMem", output: b.net("BADMEM") });
  // A call and a jump have job 0 alone.
  const one = b.or([k(6), k(7), ...(options.callThroughRegister ? [k(CALL_REGISTER_KIND)] : [])], {
    name: "orOneJob",
    output: b.net("ONEJOB"),
  });
  const badOne = b.and([one, anyJob], { name: "andBadOne", output: b.net("BADONE") });
  // System jobs 0 to 4: 5 to F are J3, or J2 with J1 or J0.
  const tail = b.or([j.J1, j.J0], { name: "orJ1J0", output: b.net("J1ORJ0") });
  const fiveToSeven = b.and([j.J2, tail], { name: "andFiveToSeven", output: b.net("FIVETO7") });
  const high = b.or([j.J3, fiveToSeven], { name: "orHighJob", output: b.net("JOB5UP") });
  const badSystem = b.and([k(8), high], { name: "andBadSystem", output: b.net("BADSYSTEM") });
  // Jobs 2 and 3 name a control register with the constant, read signed: 0 to 4 are the
  // registers, so any of bits 11 to 3, or bit 2 with bit 1 or bit 0, is outside.
  const cHigh = anyBit(b, c, 11, 3, "cHigh");
  const c2 = b.net("C2");
  const c1 = b.net("C1");
  const c0 = b.net("C0");
  slicePart(b, c, 2, 2, c2, "cBit2");
  slicePart(b, c, 1, 1, c1, "cBit1");
  slicePart(b, c, 0, 0, c0, "cBit0");
  const cTail = b.or([c1, c0], { name: "orC1C0", output: b.net("C1ORC0") });
  const fiveUp = b.and([c2, cTail], { name: "andC5to7", output: b.net("C5TO7") });
  const outside = b.or([cHigh, fiveUp], { name: "orOutside", output: b.net("OUTSIDE") });
  const notJ3 = b.not(j.J3, { name: "notJ3", output: b.net("NJ3") });
  const notJ2 = b.not(j.J2, { name: "notJ2", output: b.net("NJ2") });
  const names = b.and([k(8), notJ3, notJ2, j.J1], { name: "andNames", output: b.net("NAMESC") });
  const badNumber = b.and([names, outside], { name: "andBadNumber", output: b.net("BADNUMBER") });
  b.or([noKind, badEight, badMem, badOne, badSystem, badNumber], {
    name: "orIllegal",
    output: outs.ILLEGAL,
  });
  const noJob = b.not(anyJob, { name: "notAnyJob", output: b.net("JOB0") });
  const system = b.and([k(8), noJob], { name: "andSystem", output: b.net("SYSTEM") });
  const notHigh = b.not(high, { name: "notHighJob", output: b.net("JOB4DOWN") });
  b.and([k(8), anyJob, notHigh], { name: "andStop", output: outs.STOP });
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
    DECODER9_OUTPUTS.map((n) => [n, given.outs?.[n] ?? b.net(n, n === "CAUSED" ? 8 : 1)]),
  );
  block(
    b,
    given.scoped ?? true,
    "decoder",
    "control-decoder",
    (bb) => {
      const names = kindLineNames(options);
      const lines: Record<number, NetId> = Object.fromEntries(
        Object.entries(names).map(([n, name]) => [n, outs[name] ?? bb.net(name)]),
      );
      kindLines(bb, ins.K, lines);
      const j = jobBits(bb, ins.J);
      const signalOuts = CONTROL_SIGNALS.filter((s) => !Object.values(names).includes(s));
      const lineIns = Object.fromEntries(
        Object.entries(lines).map(([n, line]) => [names[Number(n)] as string, line]),
      );
      bb.scope(
        "signals",
        "control-signals",
        (sb) =>
          signalGates(
            sb,
            lines,
            j,
            Object.fromEntries(signalOuts.map((s) => [s, outs[s] as NetId])),
            options,
          ),
        {
          inputs: { ...lineIns, ...j },
          outputs: Object.fromEntries(signalOuts.map((s) => [s, outs[s] as NetId])),
        },
      );
      const illegal = bb.net("ILLEGAL");
      bb.scope(
        "checks",
        "decode-checks",
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
  for (const n of DECODER9_OUTPUTS) b.output(n, outs[n] as NetId);
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
 * The controller as Module 5's state machine, as data: its next state from the state and four of
 * the decoder's signals. Every instruction is fetched and then read; a call goes straight to
 * writing; a load or a store uses the memory; a job, a load and a call write register Y; a branch
 * and a jump end at the ALU, where their next PC is worked out from the ALU's result and flags.
 * The edge whose next state is FETCH ends the instruction.
 */
export function controllerMachine(options: ControlOptions = {}): Machine {
  const read: MachineRow[] = options.callThroughRegister
    ? [
        // The capstone's kind calls through a register: it needs the ALU for RA + c first.
        { from: "READ", when: { CALL: 1, JUMP: 0 }, to: "WRITE" },
        { from: "READ", when: { CALL: 1, JUMP: 1 }, to: "ALU" },
        { from: "READ", when: { CALL: 0 }, to: "ALU" },
      ]
    : [
        { from: "READ", when: { CALL: 1 }, to: "WRITE" },
        { from: "READ", when: { CALL: 0 }, to: "ALU" },
      ];
  return {
    id: options.callThroughRegister ? "controller-call-register" : "controller",
    name: "controller",
    inputs: ["CALL", ...(options.callThroughRegister ? ["JUMP"] : []), "LOAD", "STORE", "WRITEY"],
    outputs: ["FETCHING"],
    states: [
      { name: "FETCH", code: CONTROL_STATES.FETCH, outputs: { FETCHING: 1 }, at: [80, 70] },
      { name: "READ", code: CONTROL_STATES.READ, at: [300, 70] },
      { name: "ALU", code: CONTROL_STATES.ALU, at: [300, 240] },
      { name: "MEMORY", code: CONTROL_STATES.MEMORY, at: [300, 410] },
      { name: "WRITE", code: CONTROL_STATES.WRITE, at: [80, 410] },
    ],
    rows: [
      { from: "FETCH", when: {}, to: "READ" },
      ...read,
      { from: "ALU", when: { LOAD: 1 }, to: "MEMORY" },
      { from: "ALU", when: { LOAD: 0, STORE: 1 }, to: "MEMORY" },
      { from: "ALU", when: { LOAD: 0, STORE: 0, WRITEY: 1 }, to: "WRITE" },
      { from: "ALU", when: { LOAD: 0, STORE: 0, WRITEY: 0 }, to: "FETCH" },
      { from: "MEMORY", when: { LOAD: 1 }, to: "WRITE" },
      { from: "MEMORY", when: { LOAD: 0 }, to: "FETCH" },
      { from: "WRITE", when: {}, to: "FETCH" },
    ],
    decode: "full",
    size: [400, 480],
  };
}

/** The edges each kind takes, from its fetch to the edge that ends it (the sequence above). */
export function edgesOfKind(kind: number, options: ControlOptions = {}): number | undefined {
  if (options.callThroughRegister && kind === CALL_REGISTER_KIND) return 4;
  return { 1: 4, 2: 4, 3: 5, 4: 4, 5: 3, 6: 3, 7: 3 }[kind];
}
