// Copyright © 2026 Christopher Snow

// Module 13: the joins a text of the whole machine makes between the course's parts, read from the
// parsed text alone, so a text that does not yet elaborate (the lab's parts start, a port not
// joined) still has its joins. For each of the nine parts the text places: each input port and
// what feeds it (another part's output, one of the machine's inputs, a constant, something the
// text works out itself, or nothing), and each output port and the parts and machine outputs that
// read it. Two ports are joined when the text names the same wire at both. Nothing here compares
// the text with the course's: it shows what the learner wrote.

import type { Expression, Instance, Module } from "./ast";
import { parse } from "./parser";
import { machine13Modules } from "./machine13-modules";

/** What feeds an input port. */
export type JoinSource =
  | { readonly kind: "part"; readonly part: string; readonly port: string }
  | { readonly kind: "input"; readonly name: string }
  | { readonly kind: "constant"; readonly text: string }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "open" };

/** What reads an output port. */
export type JoinReader =
  | { readonly kind: "part"; readonly part: string; readonly port: string }
  | { readonly kind: "output"; readonly name: string };

export interface JoinPort {
  readonly port: string;
  readonly width: number;
  /** The text at the port, as written ("" when nothing is joined). */
  readonly written: string;
  /** The line of the text that joins it, from 1. */
  readonly line?: number;
}

export interface JoinPart {
  /** The course's module: memory, decoder, system, … */
  readonly module: string;
  /** The instance's own name in the text. */
  readonly name: string;
  readonly inputs: readonly (JoinPort & { readonly source: JoinSource })[];
  readonly outputs: readonly (JoinPort & {
    readonly readers: readonly JoinReader[];
    /** Whether the text reads the wire in its own logic, beyond the parts and the outputs. */
    readonly readByText: boolean;
  })[];
}

export interface LabJoins {
  readonly parts: readonly JoinPart[];
  /** Why the text has no joins to draw: it does not parse. */
  readonly problem?: string;
}

/** The nine parts the course supplies to the lab, in the order a drawing lists them. */
export const LAB_PART_MODULES = [
  "memory",
  "decoder",
  "system",
  "controller",
  "traplogic",
  "cregs",
  "registers",
  "alu",
  "condition",
] as const;

/** An expression as the text writes it. */
export function expressionText(e: Expression): string {
  switch (e.kind) {
    case "identifier":
      return e.name;
    case "literal":
      return e.text;
    case "unary":
      return `${e.operator}${expressionText(e.operand)}`;
    case "binary":
      return `${expressionText(e.left)} ${e.operator} ${expressionText(e.right)}`;
    case "ternary":
      return `${expressionText(e.condition)} ? ${expressionText(e.then)} : ${expressionText(e.otherwise)}`;
    case "index":
      return expressionText(e.lo) === expressionText(e.hi)
        ? `${expressionText(e.subject)}[${expressionText(e.hi)}]`
        : `${expressionText(e.subject)}[${expressionText(e.hi)}:${expressionText(e.lo)}]`;
    case "concat":
      return `{${e.parts.map(expressionText).join(", ")}}`;
  }
}

/** The names a module body reads outside the parts' connections: in its own logic. */
function namesReadByText(m: Module): Set<string> {
  const out = new Set<string>();
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    const n = node as Record<string, unknown>;
    if (n["kind"] === "instance") return;
    if (n["kind"] === "identifier" && typeof n["name"] === "string") {
      out.add(n["name"]);
      return;
    }
    for (const [k, v] of Object.entries(n)) if (k !== "target" && k !== "targets") walk(v);
  };
  walk(m.items);
  return out;
}

/** The joins a text of the whole machine makes between the course's parts. */
export function labJoins(text: string): LabJoins {
  let m: Module;
  try {
    m = parse(text);
  } catch (e) {
    return { parts: [], problem: e instanceof Error ? e.message : String(e) };
  }
  const modules = machine13Modules({});
  const instances = m.items.filter(
    (i): i is Instance =>
      i.kind === "instance" && (LAB_PART_MODULES as readonly string[]).includes(i.module),
  );
  const ports = (module: string) => modules[module]?.ports({ N: 64 });
  const inputsOfMachine = new Set(
    m.ports.filter((p) => p.direction === "input").map((p) => p.name),
  );
  const outputsOfMachine = new Set(
    m.ports.filter((p) => p.direction === "output").map((p) => p.name),
  );
  // Which part output drives a wire, by the wire's name, and which part inputs read it.
  const drivers = new Map<string, { part: string; port: string }>();
  const readers = new Map<string, { part: string; port: string }[]>();
  for (const inst of instances) {
    const p = ports(inst.module);
    if (!p) continue;
    for (const c of inst.connections) {
      if (c.value?.kind !== "identifier") continue;
      const name = c.value.name;
      if (c.port in p.outputs) drivers.set(name, { part: inst.name, port: c.port });
      else if (c.port in p.inputs)
        readers.set(name, [...(readers.get(name) ?? []), { part: inst.name, port: c.port }]);
    }
  }
  const byText = namesReadByText(m);
  const parts: JoinPart[] = instances.map((inst) => {
    const p = ports(inst.module) ?? { inputs: {}, outputs: {} };
    const conn = (port: string) => inst.connections.find((c) => c.port === port);
    const port = (name: string, width: number): JoinPort => {
      const c = conn(name);
      return {
        port: name,
        width,
        written: c?.value ? expressionText(c.value) : "",
        ...(c ? { line: c.at.line } : {}),
      };
    };
    return {
      module: inst.module,
      name: inst.name,
      inputs: Object.entries(p.inputs).map(([name, width]) => {
        const value = conn(name)?.value;
        const source: JoinSource = !value
          ? { kind: "open" }
          : value.kind === "literal"
            ? { kind: "constant", text: value.text }
            : value.kind === "identifier" && drivers.has(value.name)
              ? { kind: "part", ...(drivers.get(value.name) as { part: string; port: string }) }
              : value.kind === "identifier" && inputsOfMachine.has(value.name)
                ? { kind: "input", name: value.name }
                : { kind: "text", text: expressionText(value) };
        return { ...port(name, width), source };
      }),
      outputs: Object.entries(p.outputs).map(([name, width]) => {
        const value = conn(name)?.value;
        const wire = value?.kind === "identifier" ? value.name : undefined;
        const read: JoinReader[] = wire
          ? [
              ...(readers.get(wire) ?? []).map((r) => ({ kind: "part" as const, ...r })),
              ...(outputsOfMachine.has(wire) ? [{ kind: "output" as const, name: wire }] : []),
            ]
          : [];
        return { ...port(name, width), readers: read, readByText: wire ? byText.has(wire) : false };
      }),
    };
  });
  return { parts };
}
