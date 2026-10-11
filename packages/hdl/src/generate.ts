// Copyright © 2026 Christopher Snow

// Generation: from a circuit to the subset's text.
//
// Each gate becomes one `assign`. A flip-flop or a register composite becomes one `always_ff`,
// and its internals are not written out, because the text is about behaviour and a flip-flop is
// behaviour the language can name. A latch composite has no such name in the synthesisable
// subset: it comes out as the `assign`s of its gates, which read each other, and the generator
// says so in a comment, because that is the warning a synthesis tool gives and the lesson wants
// the learner to meet it here.
//
// The round trip is lossy, and `notes` says how: hierarchy other than flip-flops is flattened,
// instance names and positions are dropped, and a gate with more inputs than the operator takes
// becomes a chain.

import type { Circuit, Component, CompositeDef, NetId } from "@dd/sim";

export interface Generated {
  readonly text: string;
  /** What the text does not carry from the circuit. */
  readonly notes: readonly string[];
  /** Synthesis-style warnings the text would get, as comments carry them. */
  readonly warnings: readonly string[];
}

/** What the generator says above gates that read each other, in the learner's words. */
export const LOOP_NOTE =
  "These gates form a loop. A loop like this is how a circuit holds a value. Tools that turn text into hardware warn about such loops.";

export function generate(circuit: Circuit): Generated {
  const readOutside = (net: NetId, path: string): boolean =>
    circuit.outputs.some((o) => o.net === net) ||
    circuit.components.some(
      (c) =>
        !(c.path === path || c.path.startsWith(`${path}/`)) &&
        Object.values(c.inputs).includes(net),
    );
  const notes = new Set<string>();
  const warnings: string[] = [];
  const names = nameNets(circuit);
  const width = (net: NetId) => circuit.nets[net]?.width ?? 1;
  const decl = (net: NetId) => (width(net) === 1 ? "logic" : `logic [${width(net) - 1}:0]`);

  const header: string[] = [];
  for (const i of circuit.inputs) header.push(`  input ${decl(i.net)} ${names.get(i.net)}`);
  for (const o of circuit.outputs) header.push(`  output ${decl(o.net)} ${names.get(o.net)}`);

  // Flip-flops and registers are written as behaviour; everything under them is skipped.
  // Only the outermost: a register's flip-flops are written by the register's one `always_ff`.
  // Module 6: a memory or a ROM built as a component is written as an array, as it is read.
  // A closed block of kind `memory` or `rom` is an array only if it is one (`memoryBlock`: the
  // cells and nothing else, read at Q); the machine's memory map is also a block called `memory`,
  // and the program ROM a block of kind `rom` that holds the fetch checks too. Those are gates
  // around cells, and the cells are written as arrays of their own.
  const holdsCells = (c: CompositeDef) =>
    Object.keys(c.outputs).every((p) => /^Q\d*$/.test(p)) &&
    circuit.components.some(
      (x) => x.path === `${c.path}/cells` && (x.kind === "memory" || x.kind === "rom"),
    );
  const clocked = circuit.composites.filter(
    (c) =>
      c.kind === "dff" ||
      c.kind === "register" ||
      ((c.kind === "memory" || c.kind === "rom") && holdsCells(c)),
  );
  const behavioural = clocked.filter(
    (c) => !clocked.some((o) => o !== c && c.path.startsWith(`${o.path}/`)),
  );
  const under = (path: string) =>
    behavioural.find((c) => path === c.path || path.startsWith(`${c.path}/`));
  if (circuit.composites.some((c) => !behavioural.includes(c) && !under(c.path))) {
    notes.add(
      "hierarchy other than flip-flops and registers is flattened: the text has gates, not the boxes they were drawn in",
    );
  }
  if (circuit.components.some((c) => c.name !== c.kind && !under(c.path))) {
    notes.add("gate instance names and positions are not kept; the signals keep their names");
  }

  const body: string[] = [];
  const taken = new Set<string>(names.values());
  const declared = new Set<NetId>([
    ...circuit.inputs.map((i) => i.net),
    ...circuit.outputs.map((o) => o.net),
  ]);
  const declareLines: string[] = [];
  const declare = (net: NetId) => {
    if (declared.has(net)) return;
    declared.add(net);
    declareLines.push(`  ${decl(net)} ${names.get(net)};`);
  };

  const expr = (c: Component): string => {
    const ins = Object.keys(c.inputs)
      .sort((p, q) => portIndex(p) - portIndex(q))
      .map((k) => names.get(c.inputs[k] as NetId) as string);
    const join = (op: string) => ins.join(` ${op} `);
    switch (c.kind) {
      case "not":
        return `~${ins[0]}`;
      case "buf":
        return ins[0] as string;
      case "and":
        return join("&");
      case "or":
        return join("|");
      case "xor":
        return join("^");
      case "nand":
        return `~(${join("&")})`;
      case "nor":
        return `~(${join("|")})`;
      case "xnor":
        return `~(${join("^")})`;
      case "mux2": {
        const sel = names.get(c.inputs["sel"] as NetId);
        const a = names.get(c.inputs["a"] as NetId);
        const b = names.get(c.inputs["b"] as NetId);
        return `${sel} ? ${b} : ${a}`;
      }
      case "const": {
        const w = Number(c.params?.["width"] ?? 1);
        const v = BigInt(String(c.params?.["value"] ?? "0"));
        return `${w}'b${v.toString(2).padStart(w, "0")}`;
      }
      case "open": {
        const w = Number(c.params?.["width"] ?? 1);
        return `${w}'b${"x".repeat(w)}`;
      }
      case "bit":
        return `${ins[0]}[${Number(c.params?.["index"] ?? 0)}]`;
      case "slice":
        return `${ins[0]}[${Number(c.params?.["hi"] ?? 0)}:${Number(c.params?.["lo"] ?? 0)}]`;
      case "join":
        return `{${[...ins].reverse().join(", ")}}`;
      default:
        throw new Error(`the generator has no text for a ${c.kind}`);
    }
  };

  const emittedBehavioural = new Set<string>();
  for (const c of circuit.components) {
    // A memory or ROM placed as a bare component, in a block of some other kind (the register
    // file's two banks), is written as an array too: the generator must not drop storage.
    if ((c.kind === "memory" || c.kind === "rom") && !under(c.path)) {
      body.push(...memoryText(bareMemory(c), names, declare, taken));
      continue;
    }
    const owner = under(c.path);
    if (owner) {
      if (emittedBehavioural.has(owner.path)) continue;
      emittedBehavioural.add(owner.path);
      body.push(
        ...(owner.kind === "memory" || owner.kind === "rom"
          ? memoryText(compositeMemory(owner, circuit), names, declare, taken)
          : alwaysFf(owner, names, declare, width, readOutside)),
      );
      continue;
    }
    const out = c.outputs["y"];
    if (out === undefined) continue;
    declare(out);
    body.push(`  assign ${names.get(out)} = ${expr(c)};`);
  }

  // A memory's own state loop is storage the text writes as an array, not a loop of gates.
  const bareMemories = new Set(
    circuit.components
      .filter((c) => (c.kind === "memory" || c.kind === "rom") && !under(c.path))
      .map((c) => c.path),
  );
  const loops = combinationalLoops(
    circuit,
    (path) => under(path) !== undefined || bareMemories.has(path),
    names,
  );
  for (const loop of loops) {
    const text = `${loop.join(" and ")}: ${LOOP_NOTE}`;
    warnings.push(text);
  }

  const lines = [
    `module ${identifier(circuit.name)} (`,
    header.join(",\n"),
    ");",
    ...(declareLines.length ? ["", ...declareLines] : []),
    "",
    ...(warnings.length ? warnings.map((w) => `  // ${w}`) : []),
    ...body,
    "endmodule",
    "",
  ];
  return { text: lines.join("\n"), notes: [...notes], warnings };
}

function alwaysFf(
  c: CompositeDef,
  names: Map<NetId, string>,
  declare: (n: NetId) => void,
  width: (n: NetId) => number,
  readOutside: (net: NetId, path: string) => boolean,
): string[] {
  const q = c.outputs["Q"] as NetId;
  const d = c.inputs["D"] as NetId;
  const clk = c.inputs["CLK"] as NetId;
  const rst = c.inputs["RST"];
  const en = c.inputs["EN"];
  declare(q);
  const qb = c.outputs["Qb"];
  const resetTo = c.meta?.["resetTo"] === 1 ? 1 : 0;
  const w = width(q);
  const resetValue = `${w}'b${String(resetTo).repeat(w)}`;
  const lines: string[] = [];
  const load = `${names.get(q)} <= ${names.get(d)};`;
  if (rst !== undefined && en !== undefined) {
    lines.push(`  always_ff @(posedge ${names.get(clk)}) begin`);
    lines.push(`    if (${names.get(rst)}) ${names.get(q)} <= ${resetValue};`);
    lines.push(`    else if (${names.get(en)}) ${load}`);
    lines.push("  end");
  } else if (rst !== undefined) {
    lines.push(`  always_ff @(posedge ${names.get(clk)}) begin`);
    lines.push(`    if (${names.get(rst)}) ${names.get(q)} <= ${resetValue};`);
    lines.push(`    else ${load}`);
    lines.push("  end");
  } else if (en !== undefined) {
    lines.push(`  always_ff @(posedge ${names.get(clk)}) begin`);
    lines.push(`    if (${names.get(en)}) ${load}`);
    lines.push("  end");
  } else {
    lines.push(`  always_ff @(posedge ${names.get(clk)}) ${load}`);
  }
  // Qb is written only when the text needs it: an output, or read by a gate outside this flip-flop.
  if (qb !== undefined && names.has(qb) && readOutside(qb, c.path)) {
    declare(qb);
    lines.push(`  assign ${names.get(qb)} = ~${names.get(q)};`);
  }
  return lines;
}

/** What the text of a memory needs: its shape, its nets by port, and a name for its array. */
interface MemoryView {
  readonly path: string;
  readonly name: string;
  readonly kind: "memory" | "rom";
  readonly words: number;
  readonly width: number;
  readonly init: string;
  /** The address of the write, if the memory can be written. */
  readonly write?: {
    readonly address: NetId;
    readonly data: NetId;
    readonly enable: NetId;
    readonly clock: NetId;
  };
  /** Each read: the output net and the address it follows. */
  readonly reads: readonly { readonly out: NetId; readonly address: NetId }[];
}

/** A memory drawn as a closed block of its own kind (`memory`, `rom`): the block's ports. */
function compositeMemory(c: CompositeDef, circuit: Circuit): MemoryView {
  const cells = circuit.components.find((x) => x.path === `${c.path}/cells`);
  const single = c.inputs["A"] !== undefined;
  const reads = Object.keys(c.outputs)
    .filter((p) => p.startsWith("Q"))
    .map((port) => ({
      out: c.outputs[port] as NetId,
      address: (single ? c.inputs["A"] : c.inputs[`R${port.slice(1)}`]) as NetId,
    }));
  const write =
    c.kind === "memory"
      ? {
          address: (single ? c.inputs["A"] : c.inputs["WA"]) as NetId,
          data: c.inputs["D"] as NetId,
          enable: c.inputs["WE"] as NetId,
          clock: c.inputs["CLK"] as NetId,
        }
      : undefined;
  return {
    path: c.path,
    name: c.name,
    kind: c.kind as "memory" | "rom",
    words: Number(cells?.params?.["words"] ?? 1),
    width: Number(cells?.params?.["width"] ?? 1),
    init: String(cells?.params?.["init"] ?? "").trim(),
    ...(write ? { write } : {}),
    reads,
  };
}

/** A memory placed as a bare component: its own inputs and outputs are the ports. */
function bareMemory(c: Component): MemoryView {
  const reads = Object.keys(c.outputs)
    .filter((p) => /^Q\d*$/.test(p))
    .map((port) => ({
      out: c.outputs[port] as NetId,
      address: c.inputs[`R${port.slice(1) || "0"}`] as NetId,
    }));
  return {
    path: c.path,
    name: c.path.replace(/\//g, "_"),
    kind: c.kind as "memory" | "rom",
    words: Number(c.params?.["words"] ?? 1),
    width: Number(c.params?.["width"] ?? 1),
    init: String(c.params?.["init"] ?? "").trim(),
    ...(c.kind === "memory" && c.inputs["WE"] !== undefined
      ? {
          write: {
            address: c.inputs["WA"] as NetId,
            data: c.inputs["D"] as NetId,
            enable: c.inputs["WE"] as NetId,
            clock: c.inputs["CLK"] as NetId,
          },
        }
      : {}),
    reads,
  };
}

/**
 * Module 6: a memory as an array. Its words are declared after its name, filled from a list of
 * values if it was made with one, each read is an `assign` of one word by its address, and the
 * write is an `always_ff` of its own. The list names every word, as a list must: the engine's
 * words past the end of a list are 0, so the text writes them, and a word given as `x` is `'bx`.
 */
function memoryText(
  m: MemoryView,
  names: Map<NetId, string>,
  declare: (n: NetId) => void,
  taken: Set<string>,
): string[] {
  let name = identifier(m.name);
  for (let i = 2; taken.has(name); i++) name = `${identifier(m.name)}_${i}`;
  taken.add(name);
  const digits = Math.ceil(m.width / 4);
  const given = m.init ? m.init.split(/[\s,]+/) : [];
  const word = (v: string | undefined) =>
    v === undefined
      ? `${m.width}'h${"0".repeat(digits)}`
      : v.toLowerCase() === "x"
        ? `${m.width}'bx`
        : `${m.width}'h${v.toUpperCase().padStart(digits, "0")}`;
  const list = m.init
    ? ` = '{${Array.from({ length: m.words }, (_, k) => word(given[k])).join(", ")}}`
    : "";
  const vector = m.width === 1 ? "logic" : `logic [${m.width - 1}:0]`;
  const lines = [`  ${vector} ${name} [0:${m.words - 1}]${list};`];
  for (const read of m.reads) {
    declare(read.out);
    lines.push(`  assign ${names.get(read.out)} = ${name}[${names.get(read.address)}];`);
  }
  if (m.write) {
    const g = (n: NetId) => names.get(n);
    lines.push(
      `  always_ff @(posedge ${g(m.write.clock)}) if (${g(m.write.enable)}) ${name}[${g(m.write.address)}] <= ${g(m.write.data)};`,
    );
  }
  return lines;
}

/** Unique SystemVerilog identifiers for every net, ports keeping their port names. */
function nameNets(circuit: Circuit): Map<NetId, string> {
  const names = new Map<NetId, string>();
  const taken = new Set<string>();
  const claim = (net: NetId, wanted: string) => {
    let name = identifier(wanted);
    let i = 2;
    while (taken.has(name)) name = `${identifier(wanted)}_${i++}`;
    taken.add(name);
    names.set(net, name);
  };
  for (const i of circuit.inputs) claim(i.net, i.name);
  for (const o of circuit.outputs) if (!names.has(o.net)) claim(o.net, o.name);
  for (const n of circuit.nets) if (!names.has(n.id)) claim(n.id, n.name);
  return names;
}

function identifier(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_]/g, "_").replace(/^(\d)/, "_$1");
  return cleaned.length ? cleaned : "_";
}

function portIndex(port: string): number {
  if (port.length === 1) return port.charCodeAt(0) - 97;
  if (port.startsWith("in")) return Number(port.slice(2));
  return 1000;
}

/** Cycles among the gates not inside a flip-flop, as lists of net names. */
function combinationalLoops(
  circuit: Circuit,
  skip: (path: string) => boolean,
  names: Map<NetId, string>,
): string[][] {
  const gates = circuit.components.filter((c) => !skip(c.path));
  const ids = new Set(gates.map((g) => g.id));
  const loops: string[][] = [];
  const seen = new Set<string>();
  const visiting = new Set<number>();
  const done = new Set<number>();
  const visit = (id: number, stack: number[]) => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      const cycle = stack.slice(stack.indexOf(id));
      const loopNames = cycle
        .flatMap((cid) => Object.values(circuit.components[cid]?.outputs ?? {}))
        .map((n) => names.get(n) ?? String(n));
      const key = [...loopNames].sort().join(",");
      if (!seen.has(key)) {
        seen.add(key);
        loops.push(loopNames);
      }
      return;
    }
    visiting.add(id);
    stack.push(id);
    const c = circuit.components[id];
    if (c) {
      for (const out of Object.values(c.outputs)) {
        for (const r of circuit.components) {
          if (ids.has(r.id) && Object.values(r.inputs).includes(out)) visit(r.id, stack);
        }
      }
    }
    stack.pop();
    visiting.delete(id);
    done.add(id);
  };
  for (const g of gates) visit(g.id, []);
  return loops;
}
