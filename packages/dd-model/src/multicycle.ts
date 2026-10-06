// Copyright © 2026 Christopher Snow

// Module 9: the course machine taking several edges an instruction (`docs/machine.md`, "Control:
// one cycle, then several"). The same instruction set as Module 8's machine, with:
//
// - one memory port: one address, the PC's while the instruction is fetched and the ALU's held
//   result while a load or a store uses the memory, chosen by a selector in front of the memory;
// - an IR that is a register: it takes the instruction at the fetch edge and holds it while the
//   memory's address moves on to the data;
// - registers that hold each step's words for the next edge: HA and HB the words of registers A
//   and B, HR the ALU's result, HM the word a load read;
// - a controller, Module 5's state machine (control.ts), whose state says which step the edge
//   makes, and whose output logic turns the decoder's signals into the signals of that edge.
//
// The PC keeps the instruction's address until the edge that ends it, where it takes the next PC
// as Module 8's machine does, from the same next-PC block: a branch and a jump end at their ALU
// edge, where the flags and the result are the ALU's own; the rest end at the edge after it. So
// an instruction that stops the machine stops with the PC on it, having changed nothing the
// single-cycle machine would have kept. Every register's enable waits on GO, NOT HALT, so an edge
// that halts changes nothing at all.
//
// The timer counts an instruction as it ends (ENDS, given the PC's enable), not every edge, so
// this machine and Module 8's reach the same count at the same instruction (`docs/machine.md`,
// "Devices"). The door's register takes DOOR at the same edges, so the door's event is seen as an
// instruction ends, as Module 8's machine sees it (the module's note asks the author about it).

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { aluParts } from "./alu";
import {
  CONTROL_STATES,
  controlDecoder,
  controllerMachine,
  type ControlOptions,
  type ControlState,
} from "./control";
import {
  block,
  branchCondition,
  constant,
  datapathRegister,
  digits,
  machineMemory,
  mux,
  nextPcParts,
  registerFile64,
  slicePart,
  widenBlock,
  zeroOr,
  anyBit,
  type DatapathOptions,
  type Given,
} from "./datapath";
import { joinWord, splitWord, type Machine } from "./fsm";
import { wordSelector } from "./memory";

export interface MulticycleOptions extends ControlOptions {
  readonly rom?: DatapathOptions["rom"];
  readonly registers?: DatapathOptions["registers"];
  readonly name?: string;
}

/** The controller's per-edge signals, in the order its block lists them. */
export const EDGE_SIGNALS = [
  "CHECKING",
  "FETCHING",
  "IREN",
  "HOLDAB",
  "HOLDR",
  "MLOAD",
  "MSTORE",
  "HOLDM",
  "WREG",
  "PCEN",
] as const;
export type EdgeSignal = (typeof EDGE_SIGNALS)[number];

/** A register of `width` bits written at a rising edge where EN is 1, with no reset. */
function heldRegister(
  b: CircuitBuilder,
  name: string,
  ins: { D: NetId; EN: NetId; CLK: NetId },
  q: NetId,
) {
  const width = b.widthOf(q);
  const state = b.net(`${name}State`, width + 1);
  const last = b.net(`${name}Last`);
  b.component(
    "memory",
    {
      CLK: ins.CLK,
      WE: ins.EN,
      WA: constant(b, `${name}At`, 1, 0n),
      D: ins.D,
      R0: constant(b, `${name}Read`, 1, 0n),
      state,
      last,
    },
    { Q0: q, stateNext: state, lastNext: last },
    { name, params: { words: 1, width, reads: 1 } },
  );
}

/** A held word as a closed block: `held-64` or `held-32`. */
function held(
  b: CircuitBuilder,
  name: string,
  ins: { D: NetId; EN: NetId; CLK: NetId },
  q: NetId,
): void {
  b.scope(name, `held-${b.widthOf(q)}`, (bb) => heldRegister(bb, "register", ins, q), {
    inputs: { D: ins.D, EN: ins.EN, CLK: ins.CLK },
    outputs: { Q: q },
  });
}

/**
 * The controller, Module 5's state machine in four blocks: the state register (written at an edge
 * where GO is 1, so an edge that halts keeps the state; 000, FETCH, at a reset); one line per
 * state; the next-state logic, read off the machine's table row by row (one AND gate per row, one
 * OR gate per bit of the next state), with ENDS, 1 when the next state is the fetch, the edge that
 * ends the instruction; and the output logic, each edge's signals, the state's line AND what the
 * kind needs, with every enable ANDed with GO.
 */
export function controller(
  b: CircuitBuilder,
  ins: {
    CLK: NetId;
    RST: NetId;
    GO: NetId;
    CALL: NetId;
    JUMP?: NetId;
    LOAD: NetId;
    STORE: NetId;
    WRITEY: NetId;
  },
  given: Given = {},
  options: ControlOptions = {},
): Record<EdgeSignal | "S", NetId> {
  const m = controllerMachine(options);
  const outs = Object.fromEntries(
    [...EDGE_SIGNALS, "S"].map((n) => [n, given.outs?.[n] ?? b.net(n, n === "S" ? 3 : 1)]),
  ) as Record<EdgeSignal | "S", NetId>;
  const decoderIns: Record<string, NetId> = {
    CALL: ins.CALL,
    ...(options.callThroughRegister && ins.JUMP !== undefined ? { JUMP: ins.JUMP } : {}),
    LOAD: ins.LOAD,
    STORE: ins.STORE,
    WRITEY: ins.WRITEY,
  };
  block(
    b,
    given.scoped ?? true,
    "controller",
    "controller",
    (bb) => {
      const next = bb.net("NEXTSTATE", 3);
      const ends = bb.net("ENDS");
      const s = outs.S;
      // The state register.
      bb.scope(
        "state",
        "word-register-3",
        (rb) => {
          const d = mux(rb, ins.RST, next, constant(rb, "zero", 3, 0n), "pickD");
          const we = rb.or([ins.GO, ins.RST], { name: "write" });
          const state = rb.net("registerState", 4);
          const last = rb.net("registerLast");
          rb.component(
            "memory",
            {
              CLK: ins.CLK,
              WE: we,
              WA: constant(rb, "at", 1, 0n),
              D: d,
              R0: constant(rb, "read", 1, 0n),
              state,
              last,
            },
            { Q0: s, stateNext: state, lastNext: last },
            { name: "register", params: { words: 1, width: 3, reads: 1 } },
          );
        },
        { inputs: { D: next, RST: ins.RST, EN: ins.GO, CLK: ins.CLK }, outputs: { Q: s } },
      );
      // One line per state, from the state's three bits.
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
      // The next-state logic: one AND gate per row whose next state has a 1 in it.
      bb.scope(
        "nextState",
        "controller-next",
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
          // The edge ends the instruction when the next state is the fetch, 000.
          nb.nor(nextBits, { name: "norEnds", output: ends });
        },
        {
          inputs: { ...line, ...decoderIns },
          outputs: { NEXTSTATE: next, ENDS: ends },
        },
      );
      // The output logic.
      const L = (n: string) => line[n] as NetId;
      bb.scope(
        "outputs",
        "controller-outputs",
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
          ob.and([ends, ins.GO], { name: "andPcen", output: outs.PCEN });
        },
        {
          inputs: {
            ...line,
            LOAD: ins.LOAD,
            STORE: ins.STORE,
            WRITEY: ins.WRITEY,
            ENDS: ends,
            GO: ins.GO,
          },
          outputs: Object.fromEntries(EDGE_SIGNALS.map((n) => [n, outs[n]])),
        },
      );
    },
    {
      inputs: { ...decoderIns, GO: ins.GO, RST: ins.RST, CLK: ins.CLK },
      // The state first, then CHECKING, then the signals in the control bus's order.
      outputs: Object.fromEntries(["S", ...EDGE_SIGNALS].map((n) => [n, outs[n as EdgeSignal]])),
    },
  );
  return outs;
}

/**
 * Whether an edge stops the machine, and why, for the machine of several edges: Module 8's stop
 * logic, with the decode step's cause and STOP counted only while CHECKING is 1, the edge after
 * the fetch, when IR holds the new instruction. HALT is 1 when a counted step's cause is not 00 or
 * the instruction stops the machine; GO is NOT HALT.
 */
export function edgeStops(
  b: CircuitBuilder,
  ins: { CAUSEF: NetId; CAUSED: NetId; CAUSEM: NetId; STOP: NetId; CHECKING: NetId },
  outs: { HALT: NetId; CAUSE: NetId; GO: NetId },
  scoped = true,
): void {
  block(
    b,
    scoped,
    "stops",
    "stops",
    (bb) => {
      const failedF = anyBit(bb, ins.CAUSEF, 7, 0, "failedF");
      const anyD = anyBit(bb, ins.CAUSED, 7, 0, "anyD");
      const failedD = bb.and([anyD, ins.CHECKING], {
        name: "andFailedD",
        output: bb.net("FAILEDD"),
      });
      const failedM = anyBit(bb, ins.CAUSEM, 7, 0, "failedM");
      const stop = bb.and([ins.STOP, ins.CHECKING], { name: "andStop", output: bb.net("STOPNOW") });
      bb.or([failedF, failedD, failedM, stop], { name: "orHalt", output: outs.HALT });
      const dm = mux(bb, failedD, ins.CAUSEM, ins.CAUSED, "pickD");
      mux(bb, failedF, dm, ins.CAUSEF, "pickF", outs.CAUSE);
      bb.not(outs.HALT, { name: "notHalt", output: outs.GO });
    },
    {
      inputs: {
        CAUSEF: ins.CAUSEF,
        CAUSED: ins.CAUSED,
        CAUSEM: ins.CAUSEM,
        STOP: ins.STOP,
        CHECKING: ins.CHECKING,
      },
      outputs: { HALT: outs.HALT, CAUSE: outs.CAUSE, GO: outs.GO },
    },
  );
}

/**
 * The control bus: every control signal the control unit gives the datapath and the memory, side
 * by side on one bus, in this order from bit 0. The drawing's top level is then three blocks and
 * the few buses between them; each block opens, and a figure's table names every signal.
 */
export const CONTROL_BUS = [
  "FETCHING",
  "IREN",
  "HOLDAB",
  "HOLDR",
  "MLOAD",
  "MSTORE",
  "HOLDM",
  "WREG",
  "PCEN",
  "GO",
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

/** The control bus's signals, split out of it by name inside a block (a closed `split-control`). */
function splitControl(
  b: CircuitBuilder,
  bus: NetId,
  names: readonly string[],
  name = "signals",
): Record<string, NetId> {
  const outs = Object.fromEntries(names.map((n) => [n, b.net(n)]));
  b.scope(
    name,
    "split-control",
    (bb) => {
      for (const n of names)
        slicePart(
          bb,
          bus,
          CONTROL_BUS.indexOf(n as never),
          CONTROL_BUS.indexOf(n as never),
          outs[n] as NetId,
          `bit${n}`,
        );
    },
    { inputs: { CONTROL: bus }, outputs: outs },
  );
  return outs;
}

/**
 * The machine of several edges an instruction, as a circuit of three blocks: the control unit
 * (the decoder, the controller and the stop logic), the datapath (the PC, the IR, the register
 * file, the held words, the ALU and the next PC) and the memory of one port. The control unit
 * gives the control bus; the datapath gives the memory its address and the word to store, and the
 * control unit the IR; the memory gives back the instruction, a load's word and its causes.
 */
export function multicycleCircuit(options: MulticycleOptions = {}): Circuit {
  const b = new CircuitBuilder(options.name ?? "machine");
  const clk = b.input("CLK");
  const rst = b.input("RST");
  const shop = {
    DOOR: b.input("DOOR"),
    WARM: b.input("WARM"),
    SENSORA: b.input("SENSORA", 64),
    SENSORB: b.input("SENSORB", 64),
  };
  // The nets between the blocks, and the ones the figures and the comparison read by name.
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
  const halt = b.net("HALT");
  const cause = b.net("CAUSE", 8);
  const control = b.net("CONTROL", CONTROL_BUS.length);
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
    ].map((n) => [n, b.net(n, n === "CAUSED" ? 8 : 1)]),
  );
  const sig = (n: string) => signals[n] as NetId;
  const edge = Object.fromEntries(
    [...EDGE_SIGNALS, "S"].map((n) => [n, b.net(n, n === "S" ? 3 : 1)]),
  ) as Record<EdgeSignal | "S", NetId>;
  const go = b.net("GO");

  // The control unit.
  b.scope(
    "control",
    "control-unit",
    (cb) => {
      const d = digits(cb, ir);
      controlDecoder(cb, { K: d.K, J: d.J, C: d.C }, { outs: signals }, options);
      controller(
        cb,
        {
          CLK: clk,
          RST: rst,
          GO: go,
          CALL: sig("CALL"),
          ...(options.callThroughRegister ? { JUMP: sig("JUMP") } : {}),
          LOAD: sig("LOAD"),
          STORE: sig("STORE"),
          WRITEY: sig("WRITEY"),
        },
        { outs: edge },
        options,
      );
      edgeStops(
        cb,
        {
          CAUSEF: causef,
          CAUSED: sig("CAUSED"),
          CAUSEM: causem,
          STOP: sig("STOP"),
          CHECKING: edge.CHECKING,
        },
        { HALT: halt, CAUSE: cause, GO: go },
      );
      const bits = CONTROL_BUS.map((n) =>
        n === "GO" ? go : ((edge as Record<string, NetId>)[n] ?? sig(n)),
      );
      // The control bus: every signal joined into one word, in CONTROL_BUS's order, from bit 0.
      cb.scope(
        "bus",
        "join-control",
        (jb) =>
          jb.component(
            "join",
            Object.fromEntries(bits.map((n, i) => [String.fromCharCode(97 + i), n])),
            { y: control },
            { name: "join", params: { width: CONTROL_BUS.length } },
          ),
        {
          inputs: Object.fromEntries(CONTROL_BUS.map((n, i) => [n, bits[i] as NetId])),
          outputs: { CONTROL: control },
        },
      );
    },
    {
      inputs: { IR: ir, CAUSEF: causef, CAUSEM: causem, CLK: clk, RST: rst },
      outputs: { CONTROL: control, HALT: halt, CAUSE: cause },
    },
  );

  // The datapath.
  b.scope(
    "datapath",
    "datapath-edges",
    (db) => {
      // The control bus split beside the parts each part of it drives.
      const c = {
        ...splitControl(db, control, ["FETCHING", "IREN", "PCEN"], "toFetch"),
        ...splitControl(db, control, ["HOLDAB", "WREG"], "toRegisters"),
        ...splitControl(db, control, ["AZERO", "BCONST", "OP2", "OP1", "OP0", "HOLDR"], "toAlu"),
        ...splitControl(db, control, ["HOLDM", "LOAD", "CALL", "BRANCH", "JUMP"], "toNext"),
      };
      const s = (n: string) => c[n] as NetId;
      const ha = db.net("HA", 64);
      const hr = db.net("HR", 64);
      const hm = db.net("HM", 64);
      const result = db.net("RESULT", 64);
      const yIn = db.net("YIN", 64);
      const next = db.net("NEXT", 64);
      const pc4 = db.net("PC4", 64);
      datapathRegister(db, "pc", { D: next, EN: s("PCEN"), RST: rst, CLK: clk }, pc);
      wordSelector(db, { A: hr, B: pc, S: s("FETCHING") }, { name: "pickAddr", outs: { Y: addr } });
      db.scope(
        "ir",
        "held-32",
        (bb) => heldRegister(bb, "register", { D: fetched, EN: s("IREN"), CLK: clk }, ir),
        { inputs: { D: fetched, EN: s("IREN"), CLK: clk }, outputs: { Q: ir } },
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
      // What register Y takes: the held result, the held word a load read, or PC + 4 for a call.
      const yIns = { HR: hr, HM: hm, PC4: pc4, LOAD: s("LOAD"), CALL: s("CALL") };
      db.scope(
        "yWord",
        "yWord",
        (bb) => {
          const loaded = wordSelector(
            bb,
            { A: hr, B: hm, S: yIns.LOAD },
            { name: "pickLoad", outs: { Y: bb.net("LOADED", 64) } },
          ).Y;
          wordSelector(
            bb,
            { A: loaded, B: pc4, S: yIns.CALL },
            { name: "pickCall", outs: { Y: yIn } },
          );
        },
        { inputs: yIns, outputs: { YIN: yIn } },
      );
      // The next PC, from the ALU's own result and flags, as Module 8's.
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
    },
    {
      inputs: { CONTROL: control, FETCHED: fetched, MQ: mq, CLK: clk, RST: rst },
      outputs: { ADDR: addr, HB: hb, IR: ir },
    },
  );

  // The memory of one port.
  // Named "port" so its drawing's hand routes do not meet those of the memory inside it.
  b.scope(
    "port",
    "memory-port",
    (mb) => {
      const c = splitControl(mb, control, ["FETCHING", "MLOAD", "MSTORE", "BYTE", "GO", "PCEN"]);
      const s = (n: string) => c[n] as NetId;
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
        },
        options.rom,
        { CAUSEF: causef, CAUSEM: causem, MQ: mq, DISPLAY: display, LAMPS: lamps, IR: fetched },
      );
    },
    {
      inputs: { CONTROL: control, ADDR: addr, D: hb, CLK: clk, RST: rst, ...shop },
      outputs: {
        DISPLAY: display,
        LAMPS: lamps,
        CAUSEF: causef,
        CAUSEM: causem,
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

/** The controller's machine, for a figure's diagram and table. */
export function multicycleController(options: ControlOptions = {}): Machine {
  return controllerMachine(options);
}
