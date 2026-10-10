// Copyright © 2026 Christopher Snow

// Module 13: the wires the next edge uses, so a drawing can mark the route a value takes at one
// edge. The edge writes some registers, held words, memories and devices (each a `memory`
// primitive whose WE is 1). From the word each one takes, the route runs back through the gates
// that make it, through each selector along the input it has chosen, to where the value starts:
// a register's or a memory's output, read at the address its read port is given, or a pin. The
// control unit's own state register is left out: every edge writes it, so it would mark the IR
// at every edge and say nothing about the instruction's route.

import type { Circuit, NetId, Word } from "@dd/sim";

/** Whether a one-bit value is known to be 1. */
const isOne = (w: Word | undefined) =>
  w !== undefined && (w.known & 1n) === 1n && (w.value & 1n) === 1n;
const isZero = (w: Word | undefined) =>
  w !== undefined && (w.known & 1n) === 1n && (w.value & 1n) === 0n;

/**
 * The parts whose writes do not count as the instruction's: the controller's state, and the
 * memory port's record of the door and of the events waiting, which every instruction's end
 * writes whatever the instruction.
 */
const OWN_STATE = /^control\/controller\/|^port\/memory\/(doorBefore|waiting\d)/;

/**
 * The selectors built as blocks of gates (Modules 3 and 8): the input each chooses, by the values
 * on its select lines, or none where it chooses a fixed 0. Their gates read the select lines too,
 * so the route is taken at the block, or it would run back through every select line.
 */
const SELECTORS: Readonly<
  Record<string, (sel: (port: string) => Word | undefined) => readonly string[]>
> = {
  "selector-2": (sel) => chosen2(sel("S")),
  "word-selector-2": (sel) => chosen2(sel("S")),
  "selector-4": (sel) => {
    const hi = sel("S1");
    const lo = sel("S0");
    const highs = isOne(hi) ? ["1"] : isZero(hi) ? ["0"] : ["0", "1"];
    const lows = isOne(lo) ? ["1"] : isZero(lo) ? ["0"] : ["0", "1"];
    const by: Record<string, string> = { "00": "A", "01": "B", "10": "C", "11": "D" };
    return highs.flatMap((h) => lows.map((l) => by[h + l]!));
  },
  "zero-or-word": (sel) => (isOne(sel("AZERO")) ? [] : ["A"]),
};
/** A join's inputs in the order of their bits, port a lowest (`@dd/sim`'s variadic ports). */
function joinInputs(c: Circuit["components"][number]): string[] {
  const rank = (p: string) => (/^[a-z]$/.test(p) ? p.charCodeAt(0) - 97 : Number(p.slice(2)));
  return Object.keys(c.inputs).sort((x, y) => rank(x) - rank(y));
}

function chosen2(s: Word | undefined): readonly string[] {
  return isOne(s) ? ["B"] : isZero(s) ? ["A"] : ["A", "B"];
}

/**
 * The memory block's words read by address: the ROM's word for the IR and the word a load takes.
 * Its address chooses the word through selectors whose select lines the route does not follow, so
 * the address is added here.
 */
const readsOf = new WeakMap<Circuit, Map<NetId, NetId>>();
function readMap(circuit: Circuit) {
  let map = readsOf.get(circuit);
  if (!map) {
    map = new Map();
    for (const c of circuit.composites)
      if (c.kind === "memory" && c.inputs["ADDR"] !== undefined)
        for (const port of ["FETCHED", "MQ"])
          if (c.outputs[port] !== undefined) map.set(c.outputs[port]!, c.inputs["ADDR"]!);
    readsOf.set(circuit, map);
  }
  return map;
}

const drivers = new WeakMap<Circuit, Map<NetId, Circuit["components"][number]>>();
const selectors = new WeakMap<Circuit, Map<NetId, Circuit["composites"][number]>>();
function selectorMap(circuit: Circuit) {
  let map = selectors.get(circuit);
  if (!map) {
    map = new Map();
    for (const c of circuit.composites)
      if (SELECTORS[c.kind]) for (const n of Object.values(c.outputs)) map.set(n, c);
    selectors.set(circuit, map);
  }
  return map;
}
function driverMap(circuit: Circuit) {
  let map = drivers.get(circuit);
  if (!map) {
    map = new Map();
    for (const c of circuit.components) for (const n of Object.values(c.outputs)) map.set(n, c);
    drivers.set(circuit, map);
  }
  return map;
}

/** The nets the next edge uses, given the values on every net before it. */
export function edgeUses(circuit: Circuit, values: readonly (Word | undefined)[]): Set<NetId> {
  const driver = driverMap(circuit);
  const selector = selectorMap(circuit);
  const reads = readMap(circuit);
  const used = new Set<NetId>();
  const queue: NetId[] = [];
  const visit = (n: NetId | undefined) => {
    if (n === undefined || used.has(n)) return;
    used.add(n);
    queue.push(n);
  };
  for (const c of circuit.components)
    if (c.kind === "memory" && !OWN_STATE.test(c.path) && isOne(values[c.inputs["WE"]!]))
      visit(c.inputs["D"]);
  while (queue.length) {
    const net = queue.pop()!;
    const read = reads.get(net);
    if (read) visit(read);
    const block = selector.get(net);
    if (block) {
      const ports = SELECTORS[block.kind]!((port) => values[block.inputs[port]!]);
      for (const port of ports) visit(block.inputs[port]);
      continue;
    }
    const c = driver.get(net);
    if (!c) continue;
    if (c.kind === "memory" || c.kind === "rom") {
      // A stored value starts here; the route goes on only through the address that reads it.
      const port = Object.entries(c.outputs).find(([, n]) => n === net)?.[0] ?? "";
      if (/^Q\d+$/.test(port)) visit(c.inputs[`R${port.slice(1)}`]);
      continue;
    }
    if (c.kind === "bit" || c.kind === "slice") {
      // A bit or bits taken from a word: where the word is a join (a bus such as CONTROL), the
      // route goes back through the joined parts those bits came from, not through every part.
      const word = c.inputs["a"]!;
      const join = driver.get(word);
      if (join?.kind === "join") {
        used.add(word);
        const lo = Number(c.params?.["lo"] ?? c.params?.["index"] ?? 0);
        const hi = Number(c.params?.["hi"] ?? c.params?.["index"] ?? 0);
        let at = 0;
        for (const port of joinInputs(join)) {
          const n = join.inputs[port]!;
          const width = circuit.nets[n]?.width ?? 1;
          if (at <= hi && at + width - 1 >= lo) visit(n);
          at += width;
        }
        continue;
      }
    }
    if (c.kind === "mux2") {
      const sel = values[c.inputs["sel"]!];
      if (!isOne(sel)) visit(c.inputs["a"]);
      if (!isZero(sel)) visit(c.inputs["b"]);
      continue;
    }
    for (const n of Object.values(c.inputs)) visit(n);
  }
  return used;
}
