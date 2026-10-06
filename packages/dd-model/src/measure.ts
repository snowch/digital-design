// Copyright © 2026 Christopher Snow

// Module 2: measures of a combinational circuit that a challenge can grade besides its truth
// table: how many gates it has, how deep it is, and which kinds of gate it uses.
//
// Depth is the number of gates on the longest path from any input to any output. In the stepped
// model every gate takes one step, so a change at an input can take as many steps as the depth to
// reach an output, and no more. A loop has no longest path; a path that would go round a loop is
// cut where it meets itself, so a circuit with feedback still gets a number, but the lessons that
// grade depth have no loops.

import type { Circuit, Component, NetId } from "@dd/sim";

/** The kinds the simulator evaluates as gates. Pins, constants and cut wires are not gates. */
export const GATE_KINDS: readonly string[] = [
  "not",
  "buf",
  "and",
  "or",
  "nand",
  "nor",
  "xor",
  "xnor",
];

export const isGate = (c: Component): boolean => GATE_KINDS.includes(c.kind);

/** Every gate in the circuit, inside blocks too, in the circuit's order. */
export function gatesOf(circuit: Circuit): Component[] {
  return circuit.components.filter(isGate);
}

/** The gates whose kind is not one of `allowed`. */
export function gatesNotOf(circuit: Circuit, allowed: readonly string[]): Component[] {
  return gatesOf(circuit).filter((c) => !allowed.includes(c.kind));
}

export interface Depth {
  /** Gates on the longest path from an input to an output; 0 for a circuit of wires alone. */
  readonly depth: number;
  /** That path's gates by path, from the input end to the output end. */
  readonly path: readonly string[];
  /** The output the path ends at. */
  readonly output?: string;
}

/** The longest path, in gates, from any input to any output. Ties go to the earlier output. */
export function depthOf(circuit: Circuit): Depth {
  const drivers = new Map<NetId, Component>();
  for (const c of circuit.components)
    for (const net of Object.values(c.outputs)) drivers.set(net, c);
  const memo = new Map<NetId, readonly string[]>();
  const onStack = new Set<NetId>();
  const longest = (net: NetId): readonly string[] => {
    const known = memo.get(net);
    if (known) return known;
    const driver = drivers.get(net);
    if (!driver || onStack.has(net)) return [];
    onStack.add(net);
    let best: readonly string[] = [];
    for (const input of Object.values(driver.inputs)) {
      const p = longest(input);
      if (p.length > best.length) best = p;
    }
    onStack.delete(net);
    const path = isGate(driver) ? [...best, driver.path] : best;
    memo.set(net, path);
    return path;
  };
  let result: Depth = { depth: 0, path: [] };
  for (const o of circuit.outputs) {
    const path = longest(o.net);
    if (path.length > result.depth) result = { depth: path.length, path, output: o.name };
  }
  return result;
}
