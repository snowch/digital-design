// Copyright © 2026 Christopher Snow

// Collects every piece of SystemVerilog the course shows or accepts and writes it to files, so
// real tools can read it (docs/simulator.md, "Real tools"). The set is computed from the course,
// never listed by hand:
//
// - every HDL challenge's reference solution and starting text, from the lessons;
// - every figure's own text (`props.hdl`, and the variants of it a figure runs);
// - the text a drawing is written out as: the generator's output for every circuit in the
//   library, every circuit a challenge gives or draws as its answer, and the state machines in
//   both of the styles the course writes them in;
// - the modules the course supplies to a text (registers, alu, memory ...), as the generator
//   writes them, so a text that uses one has something real tools can read it against.
//
// Usage: npx vite-node scripts/real-tools/collect.mts [outDir]   (default: real-tools-out)
// It writes `<outDir>/sv/...` and `<outDir>/manifest.json`; run.py reads the manifest.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

import { LESSONS } from "@dd/content";
import { LIBRARY, MACHINES, machineText } from "@dd/dd-model";
import {
  elaborate,
  expressionModule,
  generate,
  machine13Modules,
  machine9Modules,
  machineModules,
  type CourseModule,
} from "@dd/hdl";
import { parseModules } from "../../packages/hdl/src/parser";
import { assemble } from "@dd/dd-model";
import { Simulator, parseWord, unknown, type Circuit, type VectorValue, type Word } from "@dd/sim";

const OUT = process.argv[2] ?? "real-tools-out";

/** One file the tools read. `deps` are the course modules the text uses and defines nowhere. */
interface Entry {
  readonly id: string;
  readonly category: string;
  readonly source: string;
  readonly file: string;
  readonly top: string;
  readonly deps: string[];
  /** Whether the course itself says this text holds gates that read each other (a latch). */
  readonly loop: boolean;
  /** For the meaning check: the challenge it came from, if its tests can drive it. */
  readonly challenge?: { lesson: string; id: string };
  /** For the meaning check: the stimulus and what the course's engine gave, in `traces/`. */
  readonly trace?: string;
}

const entries: Entry[] = [];
const files = new Map<string, string>();
const problems: string[] = [];

const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

function write(file: string, text: string) {
  if (files.has(file) && files.get(file) !== text) throw new Error(`two texts for ${file}`);
  files.set(file, text.endsWith("\n") ? text : `${text}\n`);
}

// ---- the course's modules, as the generator writes them ---------------------------------------

type ModuleSet = Record<string, CourseModule>;
const contexts = new Map<string, ModuleSet>();
const supplied = new Map<string, Map<string, string>>(); // context -> module -> file

function contextOf(given: {
  set: string;
  program?: string | undefined;
  registers?: Record<string, string> | undefined;
}): { key: string; modules: ModuleSet } {
  const digest = createHash("sha1")
    .update(`${given.program ?? ""}|${JSON.stringify(given.registers ?? {})}`)
    .digest("hex")
    .slice(0, 8);
  const key = `${given.set}-${digest}`;
  const cached = contexts.get(key);
  if (cached) return { key, modules: cached };
  const assembly =
    given.set === "machine9-call"
      ? { callThroughRegister: 9 }
      : given.set === "machine9-set"
        ? { callThroughRegister: 9, setIf: 10 }
        : {};
  const rom = given.program !== undefined ? assemble(given.program, assembly).rom : undefined;
  const context = rom ? { rom } : {};
  const modules =
    given.set === "machine"
      ? machineModules(context)
      : given.set === "machine13"
        ? machine13Modules(context)
        : machine9Modules(context);
  contexts.set(key, modules);
  return { key, modules };
}

/** A course module as SystemVerilog: a wrapper that uses it, elaborated and generated. */
function suppliedModule(key: string, modules: ModuleSet, name: string): string {
  const known = supplied.get(key) ?? new Map<string, string>();
  supplied.set(key, known);
  const have = known.get(name);
  if (have) return have;
  const mod = modules[name];
  if (!mod) throw new Error(`no course module ${name}`);
  const parameters = mod.parameters ?? {};
  const { inputs, outputs } = mod.ports(parameters);
  const decl = (w: number) => (w === 1 ? "logic" : `logic [${w - 1}:0]`);
  const ports = [
    ...Object.entries(inputs).map(([n, w]) => `input ${decl(w)} ${n}`),
    ...Object.entries(outputs).map(([n, w]) => `output ${decl(w)} ${n}`),
  ];
  const connect = [...Object.keys(inputs), ...Object.keys(outputs)].map((n) => `.${n}(${n})`);
  const params = Object.keys(parameters).length
    ? ` #(${Object.entries(parameters)
        .map(([n, v]) => `.${n}(${v})`)
        .join(", ")})`
    : "";
  const wrapper = `module wrap_${name}(${ports.join(", ")});\n  ${name}${params} u (${connect.join(", ")});\nendmodule\n`;
  const r = elaborate(wrapper, { modules });
  if (!r.circuit)
    throw new Error(`wrapper for ${name}: ${r.messages.map((m) => m.text).join("; ")}`);
  let text = generate(r.circuit).text.replace(`module wrap_${name} (`, `module ${name} (`);
  // The generated body is at the parameters' values; the header says so, so that a text which
  // passes the parameter by name (`alu #(.N(64))`) is a legal use.
  const header = Object.entries(parameters)
    .map(([n, v]) => `parameter ${n} = ${v}`)
    .join(", ");
  if (header) text = text.replace(`module ${name} (`, `module ${name} #(${header}) (`);
  known.set(name, text);
  return text;
}

// ---- what the course's own engine does, for the meaning check ----------------------------------

interface TraceStep {
  /** Inputs to set: name -> [value, known] as decimal strings. */
  set: Record<string, [string, string]>;
  /** The clock input to pulse low-high-low after setting, if any. */
  clock?: string;
  /** What the engine gave, for every output, after the step: [value, known]. */
  read: Record<string, [string, string]>;
}
interface Trace {
  inputs: { name: string; width: number }[];
  outputs: { name: string; width: number }[];
  steps: TraceStep[];
}

const pair = (w: Word): [string, string] => [w.value.toString(), w.known.toString()];

/** Runs steps on the engine exactly as the lesson's tests do (vectors.ts) and records outputs. */
function traceOf(
  circuit: Circuit,
  steps: readonly {
    set?: Readonly<Record<string, VectorValue>>;
    clock?: string;
    fresh?: boolean;
  }[],
): Trace {
  const width = (id: number) => circuit.nets[id]?.width ?? 1;
  const inputs = circuit.inputs.map((i) => ({ name: i.name, width: width(i.net) }));
  const outputs = circuit.outputs.map((o) => ({ name: o.name, width: width(o.net) }));
  const widthOf = (n: string) => inputs.find((i) => i.name === n)?.width ?? 1;
  const toWord = (n: string, v: VectorValue): Word => {
    const w = widthOf(n);
    const full = (1n << BigInt(w)) - 1n;
    if (typeof v === "string") return parseWord(v, w);
    if (typeof v === "number" && Number.isNaN(v)) return unknown(w);
    return { width: w, value: BigInt(v) & full, known: full };
  };
  let sim = new Simulator(circuit, { timeModel: "settle" });
  const out: TraceStep[] = [];
  for (const step of steps) {
    if (step.fresh) sim = new Simulator(circuit, { timeModel: "settle" });
    const set: Record<string, [string, string]> = {};
    for (const [n, v] of Object.entries(step.set ?? {})) {
      const w = toWord(n, v);
      sim.setInput(n, w);
      set[n] = pair(w);
    }
    if (step.clock) sim.clockCycle(step.clock);
    else {
      sim.settle();
      sim.tick();
    }
    const read: Record<string, [string, string]> = {};
    for (const o of outputs) read[o.name] = pair(sim.read(o.name));
    out.push({ set, ...(step.clock ? { clock: step.clock } : {}), read });
  }
  return { inputs, outputs, steps: out };
}

/** A fixed pseudo-random sequence, so a run is the same every time. */
function lcg(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x;
  };
}

/** Steps that exercise a circuit by itself: every input row if small, else seeded random ones. */
function exerciseSteps(circuit: Circuit) {
  const clock = circuit.inputs.find((i) => i.name === "CLK")?.name;
  const data = circuit.inputs.filter((i) => i.name !== clock);
  const width = (id: number) => circuit.nets[id]?.width ?? 1;
  const bits = data.reduce((n, i) => n + width(i.net), 0);
  const rows: Record<string, bigint>[] = [];
  const next = lcg(12345);
  const count = clock ? 48 : bits <= 10 ? 1 << bits : 128;
  for (let r = 0; r < count; r++) {
    const row: Record<string, bigint> = {};
    let rest = BigInt(r);
    for (const i of data) {
      const w = BigInt(width(i.net));
      // A reset held at the first step and now and then: held half the time, a machine never moves.
      const v =
        i.name === "RST"
          ? r === 0 || next() % 8 === 0
            ? 1n
            : 0n
          : clock || bits > 10
            ? (BigInt(next()) << 32n) | BigInt(next())
            : rest;
      row[i.name] = v & ((1n << w) - 1n);
      rest >>= w;
    }
    rows.push(row);
  }
  return rows.map((set) => ({ set, ...(clock ? { clock } : {}) }));
}

/** A text on its own, run through the steps that exercise a circuit by itself. */
function exercised(text: string): Trace {
  const r = elaborate(text);
  if (!r.circuit) throw new Error("it does not elaborate on its own");
  return traceOf(r.circuit, exerciseSteps(r.circuit));
}

function writeTrace(id: string, trace: Trace): string {
  const file = join("traces", `${slug(id)}.json`);
  write(file, JSON.stringify(trace));
  return file;
}

// ---- adding a text ----------------------------------------------------------------------------

function addText(
  category: string,
  id: string,
  source: string,
  text: string,
  context?: { key: string; modules: ModuleSet },
  challenge?: Entry["challenge"],
  loopOf?: Circuit,
  trace?: () => Trace,
) {
  let modules;
  try {
    modules = parseModules(text);
  } catch (e) {
    problems.push(`${id}: the course's own parser rejects it: ${(e as Error).message}`);
    return;
  }
  const defined = new Set(modules.map((m) => m.name));
  const used = new Set(
    modules.flatMap((m) => m.items.flatMap((i) => (i.kind === "instance" ? [i.module] : []))),
  );
  const top = [...modules].reverse().find((m) => !used.has(m.name))?.name ?? modules.at(-1)?.name;
  if (!top) {
    problems.push(`${id}: no module`);
    return;
  }
  const deps: string[] = [];
  for (const u of used) {
    if (defined.has(u)) continue;
    if (!context) {
      problems.push(`${id}: uses ${u}, which nothing supplies`);
      continue;
    }
    const file = join("supplied", context.key, `${u}.sv`);
    write(file, suppliedModule(context.key, context.modules, u));
    deps.push(file);
  }
  const file = join("sv", category, `${slug(id)}.sv`);
  write(file, text);
  // The course's own generator finds the loops a text holds; a text that uses the course's
  // modules is not elaborated here, and none of them holds a loop in its own gates.
  const circuit = loopOf ?? (context ? undefined : elaborate(text).circuit);
  const loop = circuit ? generate(circuit).warnings.length > 0 : false;
  let tracePath: string | undefined;
  if (trace && !loop) {
    try {
      tracePath = writeTrace(id, trace());
    } catch (e) {
      problems.push(
        `${id}: the engine cannot run it for the meaning check: ${(e as Error).message}`,
      );
    }
  }
  entries.push({
    id,
    category,
    source,
    file,
    top,
    deps,
    loop,
    ...(challenge ? { challenge } : {}),
    ...(tracePath ? { trace: tracePath } : {}),
  });
}

function addCircuit(category: string, id: string, source: string, circuit: Circuit) {
  try {
    addText(category, id, source, generate(circuit).text, undefined, undefined, circuit, () =>
      traceOf(circuit, exerciseSteps(circuit)),
    );
  } catch (e) {
    problems.push(`${id}: the generator cannot write it: ${(e as Error).message}`);
  }
}

/** The (machine, style) pairs the figures show, from the lessons. */
const shown = new Set<string>();

// ---- the lessons ------------------------------------------------------------------------------

for (const lesson of LESSONS) {
  for (const c of lesson.challenges) {
    const context = c.courseModules ? contextOf(c.courseModules) : undefined;
    const where = (what: string) => `${lesson.id} › ${c.id} › ${what}`;
    for (const which of ["reference", "initial"] as const) {
      const a = c[which];
      const id = `${lesson.id}.${c.id}.${which}`;
      if (a.hdl?.trim()) {
        addText(
          which,
          id,
          where(which),
          a.hdl,
          context,
          which === "reference" ? { lesson: lesson.id, id: c.id } : undefined,
          undefined,
          which === "reference" && !context && a.hdl
            ? () => {
                const text = a.hdl as string;
                const r = elaborate(text);
                if (!r.circuit) throw new Error("it does not elaborate on its own");
                const t = c.tests;
                if (t.kind === "combinational")
                  return traceOf(
                    r.circuit,
                    t.vectors.map((v) => ({ set: v.inputs, fresh: true })),
                  );
                if (t.kind === "sequence")
                  return traceOf(
                    r.circuit,
                    t.steps.map((st) => ({
                      ...(st.set ? { set: st.set } : {}),
                      ...(st.clock ? { clock: st.clock } : {}),
                    })),
                  );
                throw new Error("its tests are not a suite");
              }
            : undefined,
        );
      }
      if (a.circuit)
        addCircuit(`${which}-circuit`, id, where(`${which} (a drawing)`), a.circuit as Circuit);
      if (a.libraryId)
        addCircuit(
          `${which}-circuit`,
          id,
          where(`${which} (library ${a.libraryId})`),
          LIBRARY[a.libraryId]!(),
        );
      const data = a.data as Record<string, unknown> | undefined;
      for (const part of ["parts", "empty"]) {
        const t = data?.[part];
        if (typeof t === "string" && /^\s*(\/\/[^\n]*\n\s*)*module\b/.test(t))
          addText(which, `${id}.${part}`, where(`${which} data.${part}`), t, context);
      }
    }
  }
  for (const s of lesson.sections) {
    for (const f of s.interactives) {
      const p = f.props as Record<string, unknown>;
      const where = `${lesson.id} › figure ${f.id}`;
      if (f.kind === "state-machine" && Array.isArray(p["show"]) && p["show"].includes("text"))
        shown.add(`${String(p["machine"])}.${String(p["textStyle"] ?? "codes")}`);
      if (f.kind === "circuit-text") {
        const circuit = LIBRARY[String(p["libraryId"])]!();
        if (p["form"] === "expression")
          addText("figure", `${lesson.id}.${f.id}`, where, expressionModule(circuit));
        else addCircuit("figure", `${lesson.id}.${f.id}`, where, circuit);
      }
      if (typeof p["hdl"] === "string") {
        const context = contextOf({ set: "machine13" });
        const base = p["hdl"];
        addText("figure", `${lesson.id}.${f.id}`, where, base, context);
        const texts = (p["texts"] as { from?: string; to?: string }[] | undefined) ?? [];
        texts.forEach((t, i) => {
          if (t.from === undefined) return;
          addText(
            "figure",
            `${lesson.id}.${f.id}.text${i + 1}`,
            `${where} › text ${i + 1}`,
            base.replace(t.from, t.to ?? ""),
            context,
          );
        });
      }
    }
  }
}

// ---- everything a drawing can be written out as ----------------------------------------------

for (const [id, make] of Object.entries(LIBRARY)) {
  addCircuit("library", id, `the library's ${id}`, make());
}
// The state machines, in the style each is written in: every machine in `codes`; in `enum` the
// machines the lessons show so (a figure's `textStyle`), and every other machine that can be.
for (const [id, m] of Object.entries(MACHINES)) {
  addText(
    "machine",
    `${id}.codes`,
    `state machine ${id}, written with codes`,
    machineText(m, { style: "codes" }),
    undefined,
    undefined,
    undefined,
    () => exercised(machineText(m, { style: "codes" })),
  );
  try {
    addText(
      "machine",
      `${id}.enum`,
      `state machine ${id}, written with names`,
      machineText(m, { style: "enum" }),
      undefined,
      undefined,
      undefined,
      () => exercised(machineText(m, { style: "enum" })),
    );
  } catch {
    // No all-zero state: the generator refuses the style, and no figure asks for it (checked below).
    if (shown.has(`${id}.enum`))
      problems.push(`${id}.enum: a figure shows it, and the generator refuses it`);
  }
}

// ---- write ------------------------------------------------------------------------------------

rmSync(OUT, { recursive: true, force: true });
for (const [file, text] of files) {
  const path = join(OUT, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ entries, problems }, null, 1) + "\n");
const by = new Map<string, number>();
for (const e of entries) by.set(e.category, (by.get(e.category) ?? 0) + 1);
console.log(
  `${entries.length} texts, ${[...files.keys()].filter((f) => f.startsWith("supplied")).length} supplied modules, ${[...files.keys()].filter((f) => f.startsWith("traces")).length} traces`,
  Object.fromEntries(by),
);
for (const p of problems) console.log(`problem: ${p}`);
