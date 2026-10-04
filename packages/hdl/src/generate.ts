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
  const clocked = circuit.composites.filter((c) => c.kind === "dff" || c.kind === "register");
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
    const owner = under(c.path);
    if (owner) {
      if (emittedBehavioural.has(owner.path)) continue;
      emittedBehavioural.add(owner.path);
      body.push(...alwaysFf(owner, names, declare, width, readOutside));
      continue;
    }
    const out = c.outputs["y"];
    if (out === undefined) continue;
    declare(out);
    body.push(`  assign ${names.get(out)} = ${expr(c)};`);
  }

  const loops = combinationalLoops(circuit, (path) => under(path) !== undefined, names);
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
