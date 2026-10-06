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
import type { Machine } from "./fsm";
import { wordSelector } from "./memory";

export interface MulticycleOptions extends ControlOptions {
  readonly rom?: DatapathOptions["rom"];
  readonly registers?: DatapathOptions["registers"];
  readonly name?: string;
}

/** The controller's per-edge signals, in the order its block lists them. */
export const EDGE_SIGNALS = [
  "FETCHING",
  "IREN",
  "CHECKING",
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
 * The controller: the state register (Module 5's, written at an edge where GO is 1, so an edge
 * that halts keeps the state), one line per state, the next-state logic read off the machine's
 * table row by row (one AND gate per row, one OR gate per bit of the next state), and the output
 * logic: each edge's signals, the state's line AND what the kind needs, with every enable ANDed
 * with GO.
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
      const s = outs.S;
      // One line per state, from the state's three bits.
      const bits = [2, 1, 0].map((k) => {
        const n = bb.net(`S${k}`);
        slicePart(bb, s, k, k, n, `sBit${k}`);
        return n;
      });
      const nots = bits.map((n, i) =>
        bb.not(n, { name: `notS${2 - i}`, output: bb.net(`NS${2 - i}`) }),
      );
      const line: Record<string, NetId> = {};
      for (const st of m.states) {
        line[st.name] = bb.and(
          [...st.code].map((c, i) => (c === "1" ? (bits[i] as NetId) : (nots[i] as NetId))),
          { name: `is${st.name}`, output: bb.net(st.name) },
        );
      }
      // The next-state logic: one AND gate per row whose next state has a 1 in it.
      const inverted: Record<string, NetId> = {};
      const literal = (name: string, v: 0 | 1) => {
        if (v === 1) return decoderIns[name] as NetId;
        inverted[name] ??= bb.not(decoderIns[name] as NetId, {
          name: `not${name}`,
          output: bb.net(`N${name}`),
        });
        return inverted[name];
      };
      const terms = m.rows.map((row, i) => {
        const code = CONTROL_STATES[row.to as ControlState];
        if (!code.includes("1")) return undefined;
        const reads = Object.entries(row.when).map(([n, v]) => literal(n, v as 0 | 1));
        if (reads.length === 0) return line[row.from] as NetId;
        return bb.and([line[row.from] as NetId, ...reads], {
          name: `row${i + 1}`,
          output: bb.net(`R${i + 1}`),
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
        return bb.or(hits, { name: `orN${k}`, output: bb.net(`N${k}`) });
      });
      bb.component(
        "join",
        { a: nextBits[2] as NetId, b: nextBits[1] as NetId, c: nextBits[0] as NetId },
        { y: next },
        { name: "joinNext", params: { width: 3 } },
      );
      // The state register: 000 at a reset, the next state at an edge where GO is 1.
      const d = mux(bb, ins.RST, next, constant(bb, "stateZero", 3, 0n), "stateD");
      const we = bb.or([ins.GO, ins.RST], { name: "stateWrite" });
      const state = bb.net("stateState", 4);
      const last = bb.net("stateLast");
      bb.component(
        "memory",
        {
          CLK: ins.CLK,
          WE: we,
          WA: constant(bb, "stateAt", 1, 0n),
          D: d,
          R0: constant(bb, "stateRead", 1, 0n),
          state,
          last,
        },
        { Q0: s, stateNext: state, lastNext: last },
        { name: "state", params: { words: 1, width: 3, reads: 1 } },
      );
      // The output logic.
      const L = (n: string) => line[n] as NetId;
      bb.gate("buf", [L("FETCH")], { name: "outFetching", output: outs.FETCHING });
      bb.and([L("FETCH"), ins.GO], { name: "andIren", output: outs.IREN });
      bb.gate("buf", [L("READ")], { name: "outChecking", output: outs.CHECKING });
      bb.and([L("READ"), ins.GO], { name: "andHoldab", output: outs.HOLDAB });
      bb.and([L("ALU"), ins.GO], { name: "andHoldr", output: outs.HOLDR });
      bb.and([L("MEMORY"), ins.LOAD], { name: "andMload", output: outs.MLOAD });
      bb.and([L("MEMORY"), ins.STORE], { name: "andMstore", output: outs.MSTORE });
      bb.and([outs.MLOAD, ins.GO], { name: "andHoldm", output: outs.HOLDM });
      bb.and([L("WRITE"), ins.WRITEY, ins.GO], { name: "andWreg", output: outs.WREG });
      // The edge ends the instruction when the next state is the fetch.
      const ends = bb.nor([nextBits[0] as NetId, nextBits[1] as NetId, nextBits[2] as NetId], {
        name: "norEnds",
        output: bb.net("ENDS"),
      });
      // The fetch's own next state is READ, never FETCH, so ENDS is never 1 in it.
      bb.and([ends, ins.GO], { name: "andPcen", output: outs.PCEN });
    },
    {
      inputs: { ...decoderIns, GO: ins.GO, RST: ins.RST, CLK: ins.CLK },
      outputs: outs,
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

/** The machine of several edges an instruction, as a circuit. */
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
  // Nets made ahead of the parts that drive them: the loops through the registers.
  const pc = b.net("PC", 64);
  const ir = b.net("IR", 32);
  const ha = b.net("HA", 64);
  const hb = b.net("HB", 64);
  const hr = b.net("HR", 64);
  const hm = b.net("HM", 64);
  const result = b.net("RESULT", 64);
  const yIn = b.net("YIN", 64);
  const next = b.net("NEXT", 64);
  const pc4 = b.net("PC4", 64);
  const halt = b.net("HALT");
  const cause = b.net("CAUSE", 8);
  const go = b.net("GO");
  const fetched = b.net("FETCHED", 32);
  const mq = b.net("MQ", 64);
  const causef = b.net("CAUSEF", 8);
  const causem = b.net("CAUSEM", 8);
  const display = b.net("DISPLAY", 64);
  const lamps = b.net("LAMPS", 3);
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

  // The PC, and the one address the memory is given.
  datapathRegister(b, "pc", { D: next, EN: edge.PCEN, RST: rst, CLK: clk }, pc);
  const addr = wordSelector(
    b,
    { A: hr, B: pc, S: edge.FETCHING },
    { name: "pickAddr", outs: { Y: b.net("ADDR", 64) } },
  ).Y;
  machineMemory(
    b,
    {
      PC: addr,
      ADDR: addr,
      D: hb,
      LOAD: edge.MLOAD,
      STORE: edge.MSTORE,
      BYTE: sig("BYTE"),
      GO: go,
      RST: rst,
      CLK: clk,
      ...shop,
      FETCHING: edge.FETCHING,
      ENDS: edge.PCEN,
    },
    options.rom,
    { CAUSEF: causef, CAUSEM: causem, MQ: mq, DISPLAY: display, LAMPS: lamps, IR: fetched },
  );
  // The IR: the instruction the memory gave at the fetch edge, held for the rest of it.
  b.scope(
    "ir",
    "held-32",
    (bb) => heldRegister(bb, "register", { D: fetched, EN: edge.IREN, CLK: clk }, ir),
    { inputs: { D: fetched, EN: edge.IREN, CLK: clk }, outputs: { Q: ir } },
  );
  const d = digits(b, ir);
  controlDecoder(b, { K: d.K, J: d.J, C: d.C }, { outs: signals }, options);
  controller(
    b,
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

  // The registers, read into HA and HB at the read edge.
  const regs = registerFile64(
    b,
    { RA: d.A, RB: d.B, WA: d.Y, D: yIn, WE: edge.WREG, CLK: clk },
    options.registers,
  );
  b.scope(
    "hold",
    "hold-ab",
    (bb) => {
      heldRegister(bb, "heldA", { D: regs.QA, EN: edge.HOLDAB, CLK: clk }, ha);
      heldRegister(bb, "heldB", { D: regs.QB, EN: edge.HOLDAB, CLK: clk }, hb);
    },
    {
      inputs: { QA: regs.QA, QB: regs.QB, EN: edge.HOLDAB, CLK: clk },
      outputs: { HA: ha, HB: hb },
    },
  );
  const wide = widenBlock(b, d.C);
  const aluA = zeroOr(b, ha, sig("AZERO"));
  const aluB = wordSelector(
    b,
    { A: hb, B: wide, S: sig("BCONST") },
    { name: "pickB", outs: { Y: b.net("ALUB", 64) } },
  ).Y;
  const flags = aluParts(
    b,
    { A: aluA, B: aluB, OP2: sig("OP2"), OP1: sig("OP1"), OP0: sig("OP0") },
    { width: 64, flags: true, closed: true, outs: { Y: result } },
  );
  held(b, "heldR", { D: result, EN: edge.HOLDR, CLK: clk }, hr);
  held(b, "heldM", { D: mq, EN: edge.HOLDM, CLK: clk }, hm);

  // What register Y takes: the held result, the held word a load read, or PC + 4 for a call.
  const yIns = { HR: hr, HM: hm, PC4: pc4, LOAD: sig("LOAD"), CALL: sig("CALL") };
  b.scope(
    "yWord",
    "yWord",
    (bb) => {
      const loaded = wordSelector(
        bb,
        { A: hr, B: hm, S: yIns.LOAD },
        { name: "pickLoad", outs: { Y: bb.net("LOADED", 64) } },
      ).Y;
      wordSelector(bb, { A: loaded, B: pc4, S: yIns.CALL }, { name: "pickCall", outs: { Y: yIn } });
    },
    { inputs: yIns, outputs: { YIN: yIn } },
  );

  // The next PC, from the ALU's own result and flags, as Module 8's.
  const met = branchCondition(b, {
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
    BRANCH: sig("BRANCH"),
    CALL: sig("CALL"),
    JUMP: sig("JUMP"),
    WIDE: wide,
  };
  b.scope("next", "next", (bb) => nextPcParts(bb, nextIns, { NEXT: next, PC4: pc4 }), {
    inputs: nextIns,
    outputs: { NEXT: next, PC4: pc4 },
  });

  edgeStops(
    b,
    {
      CAUSEF: causef,
      CAUSED: sig("CAUSED"),
      CAUSEM: causem,
      STOP: sig("STOP"),
      CHECKING: edge.CHECKING,
    },
    { HALT: halt, CAUSE: cause, GO: go },
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
