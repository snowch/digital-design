// Latches: memory from feedback.
//
// Every function here adds a composite to a CircuitBuilder and returns the nets a caller wires
// on. The composite's internals are real gates, so a view can open it and a learner can watch the
// feedback settle. Polarity convention for the whole course: the SR latch is two cross-coupled
// NOR gates (S=1 sets, R=1 resets, both 0 holds, both 1 is the forbidden input), the D latch is
// transparent while its enable is 1, and the flip-flop (flipflop.ts) captures on the rising edge.

import type { CircuitBuilder, NetId } from "@dd/sim";

export interface LatchOptions {
  /** The instance name; defaults to the component kind. */
  name?: string;
  /** Gate delay in the delay model, for every gate inside. */
  delay?: number;
}

export interface LatchPorts {
  readonly q: NetId;
  readonly qb: NetId;
}

function gateOptions(name: string, options: LatchOptions) {
  return options.delay !== undefined ? { name, delay: options.delay } : { name };
}

/**
 * An SR latch from two cross-coupled NOR gates. `norQ` drives Q from R and Qb; `norQb` drives
 * Qb from S and Q. Internal nets are named Q and Qb inside the scope.
 */
export function srLatch(
  b: CircuitBuilder,
  s: NetId,
  r: NetId,
  options: LatchOptions = {},
): LatchPorts {
  return b.scope(
    options.name ?? "sr",
    "sr-latch",
    (bb) => {
      const q = bb.net("Q");
      const qb = bb.net("Qb");
      bb.nor([r, qb], { output: q, ...gateOptions("norQ", options) });
      bb.nor([s, q], { output: qb, ...gateOptions("norQb", options) });
      return { q, qb };
    },
    (ports) => ({ inputs: { S: s, R: r }, outputs: { Q: ports.q, Qb: ports.qb } }),
  );
}

/** An SR latch behind an enable: S and R reach the latch only while EN is 1. */
export function gatedSrLatch(
  b: CircuitBuilder,
  s: NetId,
  r: NetId,
  en: NetId,
  options: LatchOptions = {},
): LatchPorts {
  return b.scope(
    options.name ?? "gated-sr",
    "gated-sr-latch",
    (bb) => {
      const sGated = bb.and([s, en], gateOptions("andS", options));
      const rGated = bb.and([r, en], gateOptions("andR", options));
      return srLatch(bb, sGated, rGated, { ...options, name: "sr" });
    },
    (ports) => ({ inputs: { S: s, R: r, EN: en }, outputs: { Q: ports.q, Qb: ports.qb } }),
  );
}

/**
 * A D latch: a gated SR latch whose S is D and whose R is NOT D, so the forbidden input cannot
 * be given. Transparent while EN is 1, holding while EN is 0.
 */
export function dLatch(
  b: CircuitBuilder,
  d: NetId,
  en: NetId,
  options: LatchOptions = {},
): LatchPorts {
  return b.scope(
    options.name ?? "d-latch",
    "d-latch",
    (bb) => {
      const nd = bb.not(d, gateOptions("notD", options));
      const s = bb.and([d, en], gateOptions("andS", options));
      const r = bb.and([nd, en], gateOptions("andR", options));
      return srLatch(bb, s, r, { ...options, name: "sr" });
    },
    (ports) => ({ inputs: { D: d, EN: en }, outputs: { Q: ports.q, Qb: ports.qb } }),
  );
}
