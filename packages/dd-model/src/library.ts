// The canonical circuits lessons refer to by id.
//
// A lesson's data names a circuit from this library rather than building one, so the lesson stays
// data and the circuit stays testable here. Each entry is a function, so every caller gets a fresh
// netlist to simulate, break or compare.

import { CircuitBuilder, type Circuit } from "@dd/sim";

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
 * last. It is an SR latch with the lesson's names on it: A sets, B resets, the light is Q.
 */
export function twoButtonsCircuit(delay?: number): Circuit {
  const b = new CircuitBuilder("two-buttons");
  const a = b.input("A");
  const bPress = b.input("B");
  const { q } = srLatch(b, a, bPress, { name: "latch", ...(delay !== undefined ? { delay } : {}) });
  b.output("LIGHT", q);
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
  "dff-reset": () => dFlipFlopCircuit({ reset: true }),
  "dff-reset-enable": () => dFlipFlopCircuit({ reset: true, enable: true }),
  "register-4": () => registerCircuit(4, { reset: true }),
  "glitch-and-not": () => glitchCircuit(),
};

export function libraryCircuit(id: string): Circuit {
  const make = LIBRARY[id];
  if (!make) throw new RangeError(`the library has no circuit called ${JSON.stringify(id)}`);
  return make();
}
