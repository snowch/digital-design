// Copyright © 2026 Christopher Snow

// The D flip-flop: two D latches in series, opened on opposite halves of the clock.
//
// The master latch is transparent while CLK is 0 and holds while CLK is 1; the slave is the other
// way round. So while the clock is low the master follows D and the slave keeps the old Q; at the
// rising edge the master closes on whatever D was and the slave opens on the master's value; while
// the clock is high D can do what it likes and Q does not move. Q changes only at the rising edge.
// That is the whole trick, and every gate of it is here to be opened.
//
// Options add the two things a register needs: a synchronous reset (Q becomes `resetTo` at the
// next edge while reset is 1, with priority over D) and an enable (Q keeps its value at an edge
// where enable is 0). Both are logic in front of the master's D input, which is where a reader
// should look for them.

import type { CircuitBuilder, NetId } from "@dd/sim";

import { dLatch, type LatchOptions, type LatchPorts } from "./latches";

export interface FlipFlopOptions extends LatchOptions {
  /** A synchronous reset input: while 1, the next edge loads `resetTo`. */
  reset?: NetId;
  /** The value a reset loads. Default 0. */
  resetTo?: 0 | 1;
  /** An enable input: at an edge where it is 0, Q holds. */
  enable?: NetId;
}

/** A positive-edge-triggered D flip-flop built from two D latches and an inverter. */
export function dFlipFlop(
  b: CircuitBuilder,
  d: NetId,
  clk: NetId,
  options: FlipFlopOptions = {},
): LatchPorts {
  const name = options.name ?? "dff";
  const delay = options.delay;
  const g = (n: string) => (delay !== undefined ? { name: n, delay } : { name: n });
  const inner = delay !== undefined ? { delay } : {};
  return b.scope(
    name,
    "dff",
    (bb) => {
      let dIn = d;
      // With an enable, the master sees Q itself at an edge where enable is 0, so the old value
      // is reloaded. The hold net is driven from the slave's Q once the latches exist.
      const hold = options.enable !== undefined ? bb.net("hold") : undefined;
      if (hold !== undefined && options.enable !== undefined) {
        const selected = bb.net("dEnabled");
        bb.component(
          "mux2",
          { sel: options.enable, a: hold, b: dIn },
          { y: selected },
          g("enableMux"),
        );
        dIn = selected;
      }
      if (options.reset !== undefined) {
        if ((options.resetTo ?? 0) === 0) {
          const notReset = bb.not(options.reset, g("notReset"));
          dIn = bb.and([dIn, notReset], g("resetAnd"));
        } else {
          dIn = bb.or([dIn, options.reset], g("resetOr"));
        }
      }
      const notClk = bb.not(clk, g("notClk"));
      const master = dLatch(bb, dIn, notClk, { name: "master", ...inner });
      const slave = dLatch(bb, master.q, clk, {
        name: "slave",
        ...inner,
        ...(options.q !== undefined ? { q: options.q } : {}),
        ...(options.qb !== undefined ? { qb: options.qb } : {}),
      });
      if (hold !== undefined)
        bb.gate("buf", [slave.q], { output: hold, name: "holdBuf", ...inner });
      return { q: slave.q, qb: slave.qb };
    },
    (ports) => ({
      inputs: {
        D: d,
        CLK: clk,
        ...(options.reset !== undefined ? { RST: options.reset } : {}),
        ...(options.enable !== undefined ? { EN: options.enable } : {}),
      },
      outputs: { Q: ports.q, Qb: ports.qb },
    }),
  );
}
