// Copyright © 2026 Christopher Snow

// A register: one D flip-flop per bit, sharing a clock, so every bit changes at the same edge.
//
// The bus is split into bits in front of the flip-flops and joined again behind them, so a view can
// show the register closed as one box with a wide D and Q, or open as a row of flip-flops, each
// one the component from flipflop.ts with its own latches and gates underneath.

import type { CircuitBuilder, NetId } from "@dd/sim";

import { dFlipFlop, type FlipFlopOptions } from "./flipflop";

export interface RegisterPorts {
  /** The register's value, `width` bits wide. */
  readonly q: NetId;
  /** Each bit's flip-flop output, least significant first. */
  readonly bits: readonly NetId[];
}

export function register(
  b: CircuitBuilder,
  d: NetId,
  clk: NetId,
  options: FlipFlopOptions & { width?: number } = {},
): RegisterPorts {
  const width = options.width ?? b.widthOf(d);
  const name = options.name ?? "reg";
  return b.scope(
    name,
    "register",
    (bb) => {
      const bits: NetId[] = [];
      for (let i = 0; i < width; i++) {
        const dBit = bb.net(`d${i}`);
        bb.component("bit", { a: d }, { y: dBit }, { name: `bit${i}`, params: { index: i } });
        const { name: _ignored, q: _q, qb: _qb, width: _w, ...rest } = options;
        const ff = dFlipFlop(bb, dBit, clk, { ...rest, name: `ff${i}` });
        bits.push(ff.q);
      }
      const q = options.q ?? bb.net("Q", width);
      const ports: Record<string, NetId> = {};
      bits.forEach((bit, i) => {
        ports[String.fromCharCode(97 + i)] = bit;
      });
      bb.component("join", ports, { y: q }, { name: "join", params: { width } });
      return { q, bits };
    },
    (ports) => ({
      inputs: {
        D: d,
        CLK: clk,
        ...(options.reset !== undefined ? { RST: options.reset } : {}),
        ...(options.enable !== undefined ? { EN: options.enable } : {}),
      },
      outputs: { Q: ports.q },
    }),
  );
}
