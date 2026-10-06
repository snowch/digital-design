// Copyright © 2026 Chris Snow

// Module 5: a state machine as data, and the circuit and the text made from it.
//
// A machine is a list of states, each with a code (the bits its state register holds) and the
// outputs it sets, and an encoded table: rows that each say "in this state, with these inputs,
// the next state is that one". Nothing is minimised. The circuit is the table read row by row:
// each row is one AND gate (the line that says "the machine is in this state", and the row's
// inputs), and each bit of the next state is an OR of the rows whose next state has that bit at
// 1. That is the chain the course shows in one figure: the diagram, the table, the codes, the
// next-state logic, the state register's flip-flops, and the outputs worked out from the state
// alone.
//
// The state register is the registers lesson's register with its reset, so a reset loads all
// zeros: the state whose code is all zeros is where a reset leads, whatever the machine meant.
// A machine that gives no state the all-zero code goes nowhere at a reset, which is one of the
// faults the course shows.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { decoder2 } from "./combinational";
import { register } from "./register";

export type MachineBit = 0 | 1;
type Bit = MachineBit;

export interface MachineState {
  readonly name: string;
  /** The bits the state register holds in this state, highest bit first: `01`. */
  readonly code: string;
  /** The machine's outputs in this state; an output not listed is 0. */
  readonly outputs?: Readonly<Record<string, Bit>>;
  /** Where the state diagram draws it, in its own units. */
  readonly at?: readonly [number, number];
}

export interface MachineRow {
  readonly from: string;
  /** The inputs this row needs; an input not listed may be either value. */
  readonly when: Readonly<Record<string, Bit>>;
  readonly to: string;
  /** Where the diagram writes this row's condition, in its own units. */
  readonly labelAt?: readonly [number, number];
}

export interface Machine {
  readonly id: string;
  /** The circuit's module name in text. */
  readonly name: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly states: readonly MachineState[];
  readonly rows: readonly MachineRow[];
  /**
   * How the state register's bits are turned into one line per state: `full` reads every bit
   * (the decoder of Module 3 for two bits); `one-hot` reads the state's single 1, and the state
   * whose code is all zeros by a NOR of every bit.
   */
  readonly decode?: "full" | "one-hot";
  /** The size of the state diagram's drawing, in its own units. */
  readonly size?: readonly [number, number];
}

/** How many bits the state register has. */
export function stateBits(m: Machine): number {
  return m.states[0]?.code.length ?? 0;
}

/** The state with this code, if any. */
export function stateOfCode(m: Machine, code: string): MachineState | undefined {
  return m.states.find((s) => s.code === code);
}

export function stateNamed(m: Machine, name: string): MachineState {
  const s = m.states.find((x) => x.name === name);
  if (!s) throw new RangeError(`${m.id} has no state ${name}`);
  return s;
}

/** Whether a row applies to these input values. */
export function rowMatches(row: MachineRow, inputs: Readonly<Record<string, Bit>>): boolean {
  return Object.entries(row.when).every(([name, v]) => inputs[name] === v);
}

/** The row that applies in a state for these inputs, with its index in the table. */
export function rowFor(
  m: Machine,
  state: string,
  inputs: Readonly<Record<string, Bit>>,
): { row: MachineRow; index: number } | undefined {
  const index = m.rows.findIndex((r) => r.from === state && rowMatches(r, inputs));
  const row = m.rows[index];
  return row ? { row, index } : undefined;
}

/** Every combination of the machine's inputs. */
export function inputCombinations(m: Machine): Record<string, Bit>[] {
  const out: Record<string, Bit>[] = [];
  const n = m.inputs.length;
  for (let k = 0; k < 1 << n; k++) {
    const row: Record<string, Bit> = {};
    m.inputs.forEach((name, i) => {
      row[name] = ((k >> (n - 1 - i)) & 1) as Bit;
    });
    out.push(row);
  }
  return out;
}

/**
 * What is wrong with a machine as data, as sentences: codes of the wrong length or used twice,
 * rows naming a state or an input that does not exist, and, for each state, input values that no
 * row covers or that two rows cover.
 */
export function machineProblems(m: Machine): string[] {
  const out: string[] = [];
  const bits = stateBits(m);
  const names = new Set(m.states.map((s) => s.name));
  const codes = new Set<string>();
  for (const s of m.states) {
    if (s.code.length !== bits || /[^01]/.test(s.code))
      out.push(`${s.name}'s code ${s.code} is not ${bits} bits`);
    if (codes.has(s.code)) out.push(`two states have the code ${s.code}`);
    codes.add(s.code);
    for (const o of Object.keys(s.outputs ?? {}))
      if (!m.outputs.includes(o)) out.push(`${s.name} sets ${o}, which is not an output`);
  }
  for (const r of m.rows) {
    if (!names.has(r.from)) out.push(`a row starts from ${r.from}, which is not a state`);
    if (!names.has(r.to)) out.push(`a row leads to ${r.to}, which is not a state`);
    for (const i of Object.keys(r.when))
      if (!m.inputs.includes(i)) out.push(`a row reads ${i}, which is not an input`);
  }
  for (const s of m.states) {
    for (const values of inputCombinations(m)) {
      const n = m.rows.filter((r) => r.from === s.name && rowMatches(r, values)).length;
      const said = m.inputs.map((i) => `${i} ${values[i]}`).join(", ");
      if (n === 0) out.push(`in ${s.name} no row covers ${said}`);
      if (n > 1) out.push(`in ${s.name} ${n} rows cover ${said}`);
    }
  }
  return out;
}

/** The next state's name from the table, as the circuit should work it out. */
export function nextState(m: Machine, state: string, inputs: Readonly<Record<string, Bit>>) {
  return rowFor(m, state, inputs)?.row.to;
}

/** The input names a row's AND gate reads, in the machine's order. */
export function rowInputs(m: Machine, row: MachineRow): string[] {
  return m.inputs.filter((i) => row.when[i] !== undefined);
}

/** The net names the circuit gives its parts, so figures, faults and tests can name them. */
export const MACHINE_NETS = {
  /** The next state, as a word, from the next-state logic to the state register's D. */
  next: "next",
  /** The state register's output. */
  state: "state",
  /** The output port the state register's word is also given, so tests and traces can read it. */
  stateOutput: "S",
  /** The instance names of the three blocks: each its own kind, so a drawing shows one label. */
  nextBlock: "next-state-logic",
  register: "register",
  outputBlock: "output-logic",
} as const;

/** A position in a drawing, in grid cells, kept in a part's metadata as the library's are. */
/**
 * The next-state logic's inside, in cells: the rows between inverted inputs (and their NOT
 * gates), and the columns of the NOT gates, the row gates, the OR gates and the join. The gap
 * before the row gates holds a trunk for every line and inverted input, half a cell apart at
 * least; four rows between inputs keep their wires from crossing on the way to the row gates;
 * the row gates start at row 3, so a first row's input level with an input's pin runs straight
 * instead of turning beside the state word's split.
 */
const NEXT_LAYOUT = { pitch: 4, nots: 9, top: 3, rows: 19, ors: 27, join: 33 } as const;

type Cell = { readonly layout: { readonly x: number; readonly y: number } };
const cell = (x: number, y: number): Cell => ({ layout: { x, y } });

/**
 * A word split into its bits, highest at the top: the drawing's way to take a word apart. Ports
 * W in and b(n-1) to b0 out, as Module 3's split-4 has them.
 */
export function splitWord(
  b: CircuitBuilder,
  word: NetId,
  options: { name: string; outs: readonly NetId[]; meta?: Cell },
): void {
  const width = b.widthOf(word);
  const outs = Object.fromEntries(options.outs.map((n, k) => [`b${width - 1 - k}`, n]));
  b.scope(
    options.name,
    `split-${width}`,
    (bb) => {
      for (const [port, net] of Object.entries(outs))
        bb.component(
          "bit",
          { a: word },
          { y: net },
          {
            name: port,
            params: { index: Number(port.slice(1)) },
          },
        );
    },
    { inputs: { W: word }, outputs: outs, ...(options.meta ? { meta: options.meta } : {}) },
  );
}

/** Bits joined into a word, highest at the top: ports b(n-1) to b0 in and W out. */
export function joinWord(
  b: CircuitBuilder,
  bitsHighFirst: readonly NetId[],
  word: NetId,
  options: { name: string; meta?: Cell },
): void {
  const width = bitsHighFirst.length;
  const ins = Object.fromEntries(bitsHighFirst.map((n, k) => [`b${width - 1 - k}`, n]));
  b.scope(
    options.name,
    `join-${width}`,
    (bb) => {
      const ports = Object.fromEntries(
        [...bitsHighFirst].reverse().map((n, i) => [String.fromCharCode(97 + i), n]),
      );
      bb.component("join", ports, { y: word }, { name: "join", params: { width } });
    },
    { inputs: ins, outputs: { W: word }, ...(options.meta ? { meta: options.meta } : {}) },
  );
}

/**
 * One line per state, inside a block: 1 while the state register holds that state's code. The
 * word is split into bits S(n-1) to S0 at column 4; the lines are worked out at column 9 (Module
 * 3's decoder for two bits, a NOR for an all-zero code, gates otherwise). Returns the lines and
 * the first free row under what it placed.
 */
function stateLines(
  bb: CircuitBuilder,
  m: Machine,
  s: NetId,
): { lines: Map<string, NetId>; below: number } {
  const bits = stateBits(m);
  // Bit k of the word, named S1, S0 and so on, highest first.
  const bit = new Map<number, NetId>();
  for (let k = bits - 1; k >= 0; k--) bit.set(k, bb.net(`S${k}`));
  splitWord(bb, s, {
    name: `split-${bits}`,
    outs: [...bit.entries()].map(([, n]) => n),
    meta: cell(4, 1),
  });
  const lines = new Map<string, NetId>();
  const decode = m.decode ?? "full";
  if (decode === "full" && bits === 2) {
    // Module 3's decoder: output Yk is 1 when S1 S0 spells k.
    const outs: Record<string, NetId> = {};
    for (const st of m.states) {
      const k = parseInt(st.code, 2);
      const net = bb.net(st.name);
      outs[`Y${k}`] = net;
      lines.set(st.name, net);
    }
    for (let k = 0; k < 4; k++) if (!outs[`Y${k}`]) outs[`Y${k}`] = bb.net(`unused${k}`);
    decoder2(bb, { S1: bit.get(1) as NetId, S0: bit.get(0) as NetId }, { outs });
    return { lines, below: 7 };
  }
  if (decode === "one-hot") {
    let y = 1;
    for (const st of m.states) {
      const one = st.code.indexOf("1");
      if (one < 0) {
        lines.set(
          st.name,
          bb.nor([...bit.values()], {
            name: `nor${st.name}`,
            output: bb.net(st.name),
            meta: cell(9, y),
          }),
        );
        y += bits + 1;
      } else {
        // The state's own bit is its line; the bit's net already carries the value.
        lines.set(st.name, bit.get(bits - 1 - one) as NetId);
      }
    }
    return { lines, below: Math.max(y, bits * 2 + 2) };
  }
  const inverted = new Map<number, NetId>();
  let y = 1;
  const not = (k: number) => {
    let n = inverted.get(k);
    if (n === undefined) {
      n = bb.not(bit.get(k) as NetId, { name: `notS${k}`, output: bb.net(`NS${k}`) });
      inverted.set(k, n);
    }
    return n;
  };
  for (const st of m.states) {
    const literals = [...st.code].map((c, i) => {
      const k = bits - 1 - i;
      return c === "1" ? (bit.get(k) as NetId) : not(k);
    });
    lines.set(
      st.name,
      bb.and(literals, { name: `is${st.name}`, output: bb.net(st.name), meta: cell(12, y) }),
    );
    y += bits + 1;
  }
  return { lines, below: y };
}

/**
 * Where the next-state logic's own pins sit when it is opened: the state word level with the
 * split, each input that is read at 0 level with its NOT gate, the others under them, and the
 * next state to the right of the join.
 */
function nextStatePins(m: Machine): Record<string, readonly [number, number]> {
  const bits = stateBits(m);
  const below = (m.decode ?? "full") === "full" && bits === 2 ? 7 : undefined;
  const pins: Record<string, readonly [number, number]> = { "in:state": [0, 1] };
  const gated = m.rows.filter((r) => stateNamed(m, r.to).code.includes("1"));
  const inverted = m.inputs.filter((i) => gated.some((r) => r.when[i] === 0));
  // The NOT gates start under the lines, as stateLines reports; recomputed here the same way.
  const start = below ?? oneHotBelow(m);
  let y = start;
  for (const name of inverted) {
    pins[`in:${name}`] = [0, y];
    y += NEXT_LAYOUT.pitch;
  }
  // An input read only at 1 goes above the NOT gates where there is room, so its wire runs
  // along the top to its gates and crosses none of theirs lengthwise.
  m.inputs
    .filter((i) => !inverted.includes(i))
    .forEach((name, i) => {
      if (i === 0 && start - 3 >= 4) pins[`in:${name}`] = [0, start - 3];
      else {
        pins[`in:${name}`] = [0, y];
        y += NEXT_LAYOUT.pitch;
      }
    });
  pins["out:next"] = [NEXT_LAYOUT.join + 5, 1];
  return pins;
}

/** The first free row under a one-hot or gate-decoded machine's lines (see stateLines). */
function oneHotBelow(m: Machine): number {
  const bits = stateBits(m);
  if ((m.decode ?? "full") === "one-hot") {
    const zeros = m.states.filter((s) => !s.code.includes("1")).length;
    return Math.max(1 + zeros * (bits + 1), bits * 2 + 2);
  }
  return 1 + m.states.length * (bits + 1);
}

export interface MachineCircuitOptions {
  /** Override the instance and circuit name. */
  readonly name?: string;
}

/**
 * The machine as a circuit: the next-state logic, the state register and the output logic, as
 * three blocks a figure can open. Inputs are the machine's inputs, then RST and CLK; outputs are
 * the machine's outputs, then the state register's word S. Inside the next-state logic the parts
 * are placed in columns, as the lesson reads them: the state's bits, a line per state and the
 * inverted inputs, one AND gate per row of the table, one OR gate per bit of the next state.
 */
export function machineCircuit(m: Machine, options: MachineCircuitOptions = {}): Circuit {
  const problems = machineProblems(m);
  if (problems.length) throw new Error(`${m.id} is not a machine:\n  ${problems.join("\n  ")}`);
  const bits = stateBits(m);
  const b = new CircuitBuilder(options.name ?? m.id);
  const ins = new Map(m.inputs.map((n) => [n, b.input(n)] as const));
  const rst = b.input("RST");
  const clk = b.input("CLK");
  const s = b.net(MACHINE_NETS.state, bits);
  const nextWord = b.net(MACHINE_NETS.next, bits);

  b.scope(
    MACHINE_NETS.nextBlock,
    "next-state-logic",
    (bb) => {
      const { lines, below } = stateLines(bb, m, s);
      const inverted = new Map<string, NetId>();
      // The inverted inputs sit under the lines, in the inputs' order.
      let notY = below;
      // Only an input some gate reads at 0 needs one: a row that leads to all zeros has no gate.
      const gated = m.rows.filter((r) => stateNamed(m, r.to).code.includes("1"));
      for (const name of m.inputs) {
        if (!gated.some((r) => r.when[name] === 0)) continue;
        inverted.set(
          name,
          bb.not(ins.get(name) as NetId, {
            name: `not${name}`,
            output: bb.net(`N${name}`),
            // Half a cell up: a NOT gate's input sits half a cell lower than a pin's centre.
            meta: cell(NEXT_LAYOUT.nots, notY - 0.5),
          }),
        );
        notY += NEXT_LAYOUT.pitch;
      }
      const literal = (name: string, v: Bit) =>
        v === 1 ? (ins.get(name) as NetId) : (inverted.get(name) as NetId);
      // One term per row, numbered as the table numbers its rows. A row whose next state is
      // all zeros needs no gate: a 0 is what every bit gets when no row gives it a 1.
      let rowY = NEXT_LAYOUT.top;
      const terms = m.rows.map((row, i) => {
        if (!stateNamed(m, row.to).code.includes("1")) return undefined;
        const line = lines.get(row.from) as NetId;
        const reads = rowInputs(m, row).map((n) => literal(n, row.when[n] as Bit));
        if (reads.length === 0) return line;
        const net = bb.and([line, ...reads], {
          name: `row${i + 1}`,
          output: bb.net(`R${i + 1}`),
          meta: cell(NEXT_LAYOUT.rows, rowY),
        });
        rowY += reads.length + 2;
        return net;
      });
      const nextBits: NetId[] = [];
      let orY = 1;
      for (let i = 0; i < bits; i++) {
        const k = bits - 1 - i;
        const hits = m.rows.flatMap((row, r) =>
          stateNamed(m, row.to).code[i] === "1" ? [terms[r] as NetId] : [],
        );
        const unique = [...new Set(hits)];
        let net: NetId;
        if (unique.length === 0) {
          net = bb.net(`N${k}`);
          bb.component(
            "const",
            {},
            { y: net },
            {
              name: `zeroN${k}`,
              params: { width: 1, value: "0" },
              meta: cell(NEXT_LAYOUT.ors, orY),
            },
          );
          orY += 3;
        } else if (unique.length === 1) net = unique[0] as NetId;
        else {
          net = bb.or(unique, {
            name: `orN${k}`,
            output: bb.net(`N${k}`),
            meta: cell(NEXT_LAYOUT.ors, orY),
          });
          orY += unique.length + 2;
        }
        nextBits.push(net);
      }
      joinWord(bb, nextBits, nextWord, { name: `join-${bits}`, meta: cell(NEXT_LAYOUT.join, 1) });
    },
    {
      inputs: { ...Object.fromEntries(ins), state: s },
      outputs: { next: nextWord },
      meta: { pins: nextStatePins(m) },
    },
  );

  register(b, nextWord, clk, { name: MACHINE_NETS.register, width: bits, reset: rst, q: s });

  const outNets = new Map<string, NetId>();
  b.scope(
    MACHINE_NETS.outputBlock,
    "output-logic",
    (bb) => {
      const { lines } = stateLines(bb, m, s);
      let y = 1;
      for (const o of m.outputs) {
        const on = m.states.filter((st) => st.outputs?.[o] === 1).map((st) => st.name);
        let net: NetId;
        if (on.length === 1) {
          // Set in one state alone: the output is that state's line itself.
          net = lines.get(on[0] as string) as NetId;
        } else if (on.length === 0) {
          net = bb.net(o);
          bb.component(
            "const",
            {},
            { y: net },
            { name: `zero${o}`, params: { width: 1, value: "0" }, meta: cell(17, y) },
          );
          y += 3;
        } else {
          net = bb.or(
            on.map((n) => lines.get(n) as NetId),
            { name: `or${o}`, output: bb.net(o), meta: cell(17, y) },
          );
          y += on.length + 2;
        }
        outNets.set(o, net);
      }
    },
    // A function, so the ports are read after the body has made the outputs' nets.
    () => ({
      inputs: { state: s },
      outputs: Object.fromEntries(m.outputs.map((o) => [o, outNets.get(o) as NetId])),
      meta: {
        pins: {
          "in:state": [0, 1],
          ...Object.fromEntries(m.outputs.map((o, i) => [`out:${o}`, [24, 1 + 3 * i]])),
        },
      },
    }),
  );
  for (const o of m.outputs) b.output(o, outNets.get(o) as NetId);
  b.output(MACHINE_NETS.stateOutput, s);
  const built = b.build();
  // Module 3's decoder takes no position of its own; it sits beside the split, in column 9.
  return {
    ...built,
    composites: built.composites.map((c) =>
      c.kind === "decoder-2" ? { ...c, meta: { ...(c.meta ?? {}), ...cell(9, 1) } } : c,
    ),
  };
}

/** Each state's code as a SystemVerilog literal: `2'b01`. */
export function codeLiteral(m: Machine, state: string): string {
  return `${stateBits(m)}'b${stateNamed(m, state).code}`;
}

export interface MachineTextOptions {
  /** `codes`: states written as their codes with a comment; `enum`: states as an enumerated type. */
  readonly style: "codes" | "enum";
}

/**
 * The machine as the course's SystemVerilog: the state register in `always_ff` with its reset,
 * the next state worked out in `always_comb` with one `case` arm per state, and the outputs set
 * from the state alone. Each arm's `if` chain is that state's rows in the table's order, so the
 * text and the table say the same thing line for line.
 */
export function machineText(m: Machine, options: MachineTextOptions): string {
  const bits = stateBits(m);
  const range = bits > 1 ? `[${bits - 1}:0] ` : "";
  const zeros = `${bits}'b${"0".repeat(bits)}`;
  const enumStyle = options.style === "enum";
  const value = (state: string) => (enumStyle ? state : codeLiteral(m, state));
  const ports = [
    ...m.inputs.map((i) => `input logic ${i}`),
    "input logic RST",
    "input logic CLK",
    ...m.outputs.map((o) => `output logic ${o}`),
    `output logic ${range}S`,
  ];
  const lines: string[] = [`module ${m.name}(${ports.join(", ")});`];
  if (enumStyle) {
    const members = m.states.map((s) => `${s.name} = ${codeLiteral(m, s.name)}`).join(", ");
    lines.push(`  typedef enum logic ${range}{${members}} state_t;`);
    lines.push("  state_t state;", "  state_t next;");
  } else {
    lines.push(`  logic ${range}state;`, `  logic ${range}next;`);
  }
  const zero = stateOfCode(m, "0".repeat(bits));
  const resetTo = enumStyle && zero ? zero.name : zeros;
  lines.push("  always_ff @(posedge CLK) begin");
  lines.push(`    if (RST) state <= ${resetTo};`, "    else state <= next;", "  end");
  lines.push("  always_comb begin", "    case (state)");
  // Every pattern of the bits names a state: the last state's arm is the default, so no pattern
  // is left without a next state. Otherwise the patterns no state uses go to the all-zero code.
  const full = m.states.length === 1 << bits;
  m.states.forEach((st, si) => {
    const rows = m.rows.filter((r) => r.from === st.name);
    const label = full && si === m.states.length - 1 ? "default" : value(st.name);
    const comment = enumStyle ? "" : ` // ${st.name}`;
    const branch = (r: MachineRow) => {
      const cond = rowInputs(m, r).map((i) => (r.when[i] === 1 ? i : `~${i}`));
      return { cond: cond.join(" & "), to: `next = ${value(r.to)};` };
    };
    if (rows.length === 1) {
      lines.push(`      ${label}: ${branch(rows[0] as MachineRow).to}${comment}`);
      return;
    }
    lines.push(`      ${label}: begin${comment}`);
    rows.forEach((r, i) => {
      const { cond, to } = branch(r);
      const last = i === rows.length - 1;
      const head = i === 0 ? "if" : "else if";
      lines.push(last ? `        else ${to}` : `        ${head} (${cond}) ${to}`);
    });
    lines.push("      end");
  });
  if (!full) lines.push(`      default: next = ${resetTo};`);
  lines.push("    endcase", "  end");
  for (const o of m.outputs) {
    const on = m.states
      .filter((s) => s.outputs?.[o] === 1)
      .map((s) => `(state == ${value(s.name)})`);
    lines.push(`  assign ${o} = ${on.length ? on.join(" | ") : "1'b0"};`);
  }
  lines.push("  assign S = state;", "endmodule", "");
  return lines.join("\n");
}
