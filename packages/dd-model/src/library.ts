// The canonical circuits lessons refer to by id.
//
// A lesson's data names a circuit from this library rather than building one, so the lesson stays
// data and the circuit stays testable here. Each entry is a function, so every caller gets a fresh
// netlist to simulate, break or compare.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { dFlipFlop, type FlipFlopOptions } from "./flipflop";
import { dLatch, gatedSrLatch, srLatch } from "./latches";
import { register } from "./register";

/**
 * A loop of `n` inverters with a `kick` input ORed into it. While kick is 1 the loop is forced;
 * when kick returns to 0, an even loop keeps what it was forced to (it remembers) and an odd loop
 * can find no stable state (it oscillates in the delay model and is undecidable in the settle
 * model). The first circuit of the course: feedback, and the two things it can do.
 */
export function inverterLoop(n: number, delay?: number): Circuit {
  if (n < 1) throw new RangeError("a loop needs at least one inverter");
  const b = new CircuitBuilder(`inverter-loop-${n}`);
  const kick = b.input("kick");
  const q = b.net("q");
  const g = delay !== undefined ? { delay } : {};
  let wire = b.or([kick, q], { name: "or", ...g });
  for (let i = 1; i <= n; i++) {
    wire = b.not(wire, i === n ? { name: `not${i}`, output: q, ...g } : { name: `not${i}`, ...g });
  }
  b.output("q", q);
  return b.build();
}

/**
 * The first lesson's circuit: two buttons, A and B, and a light that shows which was pressed
 * last. It is an SR latch with the lesson's names on it and its two NOR gates at the top level,
 * so the first view of it shows the gates and not a box: `norLight` drives LIGHT from B and the
 * other gate's output, DARK; `norDark` drives DARK from A and LIGHT.
 */
export function twoButtonsCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("two-buttons");
  const a = b.input("A");
  const bPress = b.input("B");
  const light = b.net("LIGHT");
  const dark = b.net("DARK");
  const g = delay !== undefined ? { delay } : {};
  b.nor([bPress, dark], { output: light, name: "norLight", ...g });
  b.nor([a, light], { output: dark, name: "norDark", ...g });
  b.output("LIGHT", light);
  return b.build();
}

export function srLatchCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("sr-latch");
  const s = b.input("S");
  const r = b.input("R");
  const { q, qb } = srLatch(b, s, r, delay !== undefined ? { delay } : {});
  b.output("Q", q);
  b.output("Qb", qb);
  return b.build();
}

export function gatedSrLatchCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("gated-sr-latch");
  const s = b.input("S");
  const r = b.input("R");
  const en = b.input("EN");
  const { q, qb } = gatedSrLatch(b, s, r, en, delay !== undefined ? { delay } : {});
  b.output("Q", q);
  b.output("Qb", qb);
  return b.build();
}

export function dLatchCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("d-latch");
  const d = b.input("D");
  const en = b.input("EN");
  const { q, qb } = dLatch(b, d, en, delay !== undefined ? { delay } : {});
  b.output("Q", q);
  b.output("Qb", qb);
  return b.build();
}

export interface FlipFlopCircuitOptions {
  reset?: boolean;
  resetTo?: 0 | 1;
  enable?: boolean;
  delay?: number;
}

export function dFlipFlopCircuit(options: FlipFlopCircuitOptions = {}): Circuit {
  const parts = ["dff", options.reset ? "reset" : "", options.enable ? "enable" : ""].filter(
    Boolean,
  );
  const b = new CircuitBuilder(parts.join("-"));
  const d = b.input("D");
  const clk = b.input("CLK");
  const ff: FlipFlopOptions = {};
  if (options.reset) ff.reset = b.input("RST");
  if (options.resetTo !== undefined) ff.resetTo = options.resetTo;
  if (options.enable) ff.enable = b.input("EN");
  if (options.delay !== undefined) ff.delay = options.delay;
  const { q, qb } = dFlipFlop(b, d, clk, ff);
  b.output("Q", q);
  b.output("Qb", qb);
  return b.build();
}

/** The flip-flop with Q as its only output: as text, one always_ff line and nothing else. */
export function dFlipFlopQOnlyCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("dff-q");
  const d = b.input("D");
  const clk = b.input("CLK");
  const { q } = dFlipFlop(b, d, clk, delay !== undefined ? { delay } : {});
  b.output("Q", q);
  return b.build();
}

export function registerCircuit(width: number, options: FlipFlopCircuitOptions = {}): Circuit {
  const b = new CircuitBuilder(`register-${width}`);
  const d = b.input("D", width);
  const clk = b.input("CLK");
  const ff: FlipFlopOptions = {};
  if (options.reset) ff.reset = b.input("RST");
  if (options.enable) ff.enable = b.input("EN");
  if (options.delay !== undefined) ff.delay = options.delay;
  const { q } = register(b, d, clk, { ...ff, width });
  b.output("Q", q);
  return b.build();
}

/**
 * Hand-placed positions for a library circuit's drawing, in grid cells: parts by instance name,
 * pins as `in:NAME` and `out:NAME`. A view lays out whatever has no position; a lesson's main
 * figures are placed so the wires read in the order the lesson explains them.
 */
export function placed(
  circuit: Circuit,
  at: Readonly<Record<string, readonly [number, number]>>,
): Circuit {
  const pos = (key: string) => {
    const p = at[key];
    return p ? { x: p[0], y: p[1] } : undefined;
  };
  const outputPins = new Map<NetId, Record<string, { x: number; y: number }>>();
  for (const o of circuit.outputs) {
    const p = pos(`out:${o.name}`);
    if (p) outputPins.set(o.net, { ...(outputPins.get(o.net) ?? {}), [o.name]: p });
  }
  return {
    ...circuit,
    nets: circuit.nets.map((n) => {
      const input = circuit.inputs.find((i) => i.net === n.id);
      const pin = input ? pos(`in:${input.name}`) : undefined;
      const outs = outputPins.get(n.id);
      if (!pin && !outs) return n;
      return {
        ...n,
        meta: { ...(n.meta ?? {}), ...(pin ? { pin } : {}), ...(outs ? { outputPins: outs } : {}) },
      };
    }),
    components: circuit.components.map((c) => {
      const p = c.path.includes("/") ? undefined : pos(c.name);
      return p ? { ...c, meta: { ...(c.meta ?? {}), layout: p } } : c;
    }),
    composites: circuit.composites.map((c) => {
      const p = c.path.includes("/") ? undefined : pos(c.name);
      return p ? { ...c, meta: { ...(c.meta ?? {}), layout: p } } : c;
    }),
  };
}

/**
 * The registers lesson's first circuit: four flip-flops sharing one clock, each with its own
 * one-bit D pin and Q pin, so a learner can set the bits one by one and watch all four change at
 * the same edge. Flip-flop `ffN` holds bit N.
 */
export function fourFlipFlopsCircuit(): Circuit {
  const b = new CircuitBuilder("four-flip-flops");
  const ds = [0, 1, 2, 3].map((i) => b.input(`D${i}`));
  const clk = b.input("CLK");
  ds.forEach((d, i) => {
    const { q } = dFlipFlop(b, d, clk, { name: `ff${i}` });
    b.output(`Q${i}`, q);
  });
  const at: Record<string, [number, number]> = { "in:CLK": [0, 21] };
  for (let i = 0; i < 4; i++) {
    at[`in:D${i}`] = [0, 1 + i * 5];
    at[`ff${i}`] = [6, 1 + i * 5];
    at[`out:Q${i}`] = [12, 1 + i * 5];
  }
  return placed(b.build(), at);
}

/**
 * One bit that keeps its value at an edge where EN is 0, built from gates in front of a flip-flop:
 * NEXT = (D AND EN) OR (Q AND NOT EN). The gates sit at the top level so the view shows them; the
 * flip-flop is the course's own, to be opened. With `clear`, a RST input forces NEXT to 0 through
 * one more AND gate, so a reset wins over EN and D.
 */
export function keepBitCircuit(options: { clear?: boolean } = {}): Circuit {
  const b = new CircuitBuilder(options.clear ? "keep-clear-bit" : "keep-bit");
  const d = b.input("D");
  const en = b.input("EN");
  const rst = options.clear ? b.input("RST") : undefined;
  const clk = b.input("CLK");
  const q = b.net("Q");
  const notEn = b.not(en, { name: "notEn" });
  const load = b.and([d, en], { name: "andLoad", output: b.net("LOAD") });
  const keep = b.and([q, notEn], { name: "andKeep", output: b.net("KEEP") });
  let next = b.or([load, keep], { name: "orNext", output: b.net("NEXT") });
  if (rst !== undefined) {
    const notRst = b.not(rst, { name: "notRst" });
    next = b.and([next, notRst], { name: "andClear", output: b.net("CLEARED") });
  }
  dFlipFlop(b, next, clk, { name: "ff", q });
  b.output("Q", q);
  // The flip-flop sits low, level with CLK, so the clock runs straight in under the gates.
  const ffX = rst !== undefined ? 25 : 20;
  const ffY = rst !== undefined ? 12 : 8;
  return placed(b.build(), {
    "in:D": [0, 1],
    "in:EN": [0, 5],
    ...(rst !== undefined ? { "in:RST": [0, 10] } : {}),
    // One row below the flip-flop, so the loop's wire passes under the flip-flop's name.
    "in:CLK": [0, ffY + 2],
    notEn: [5, 5],
    andLoad: [10, 1],
    andKeep: [10, 5],
    orNext: [15, 3],
    notRst: [10, 9],
    andClear: [20, 5],
    ff: [ffX, ffY],
    "out:Q": [ffX + 6, ffY],
  });
}

/**
 * The tempting wrong way to keep a value: switch the clock off. GCLK = CLK AND EN drives the
 * flip-flop's clock, so with EN at 0 no edge reaches it. But EN rising while CLK is 1 makes a
 * rising edge on GCLK that the clock never made, and the flip-flop takes D at that moment.
 */
export function gatedClockCircuit(): Circuit {
  const b = new CircuitBuilder("gated-clock-bit");
  const d = b.input("D");
  const en = b.input("EN");
  const clk = b.input("CLK");
  const gclk = b.and([clk, en], { name: "andClk", output: b.net("GCLK") });
  const { q } = dFlipFlop(b, d, gclk, { name: "ff" });
  b.output("Q", q);
  return placed(b.build(), {
    "in:D": [0, 1],
    "in:CLK": [0, 4],
    "in:EN": [0, 7],
    andClk: [5, 4],
    ff: [10, 1],
    "out:Q": [16, 1],
  });
}

/**
 * Four flip-flops in a chain on one clock: IN feeds the first, and each flip-flop's Q feeds the
 * next one's D. At every edge each flip-flop takes what the one before it held, so the bits move
 * one place along. Q0 is the newest bit, Q3 the oldest.
 */
export function shiftFourCircuit(): Circuit {
  const b = new CircuitBuilder("shift-4");
  let wire = b.input("IN");
  const clk = b.input("CLK");
  const qs: NetId[] = [];
  for (let i = 0; i < 4; i++) {
    const { q } = dFlipFlop(b, wire, clk, { name: `ff${i}`, q: b.net(`Q${i}`) });
    qs.push(q);
    wire = q;
  }
  qs.forEach((q, i) => b.output(`Q${i}`, q));
  return b.build();
}

/** Y = A AND NOT B: the glitch example, when A and B rise together. */
export function glitchCircuit(delay = 10): Circuit {
  const b = new CircuitBuilder("glitch-and-not");
  const a = b.input("A");
  const bb = b.input("B");
  const nb = b.not(bb, { name: "notB", delay });
  b.output("Y", b.and([a, nb], { name: "and", delay }));
  return b.build();
}

export const LIBRARY: Readonly<Record<string, () => Circuit>> = {
  "inverter-loop-2": () => inverterLoop(2),
  "inverter-loop-3": () => inverterLoop(3),
  "two-buttons": () => twoButtonsCircuit(),
  "sr-latch": () => srLatchCircuit(),
  "gated-sr-latch": () => gatedSrLatchCircuit(),
  "d-latch": () => dLatchCircuit(),
  dff: () => dFlipFlopCircuit(),
  "dff-q": () => dFlipFlopQOnlyCircuit(),
  "dff-reset": () => dFlipFlopCircuit({ reset: true }),
  "dff-reset-enable": () => dFlipFlopCircuit({ reset: true, enable: true }),
  "register-4": () => registerCircuit(4, { reset: true }),
  "register-4-plain": () => registerCircuit(4),
  "register-4-enable": () => registerCircuit(4, { enable: true }),
  "register-4-reset-enable": () =>
    placed(registerCircuit(4, { reset: true, enable: true }), {
      "in:D": [0, 0],
      "in:CLK": [0, 3],
      "in:RST": [0, 6],
      "in:EN": [0, 9],
      reg: [6, 1],
      "out:Q": [12, 1],
    }),
  "four-flip-flops": () => fourFlipFlopsCircuit(),
  "keep-bit": () => keepBitCircuit(),
  "keep-clear-bit": () => keepBitCircuit({ clear: true }),
  "shift-4": () => shiftFourCircuit(),
  "gated-clock-bit": () => gatedClockCircuit(),
  "glitch-and-not": () => glitchCircuit(),
};

export function libraryCircuit(id: string): Circuit {
  const make = LIBRARY[id];
  if (!make) throw new RangeError(`the library has no circuit called ${JSON.stringify(id)}`);
  return make();
}
