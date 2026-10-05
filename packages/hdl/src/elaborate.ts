// Copyright © 2026 Chris Snow

// Elaboration: from the syntax tree to a circuit the engine runs.
//
// `assign` and `always_comb` become gates; `always_ff @(posedge clk)` becomes the course's own
// D flip-flop (or a register of them), so the circuit a learner writes drills down to the same
// latches and NOR gates as the one they drew. Everything the text gets wrong comes back as a
// message with a line and a column and a plain sentence; a construct the lesson has not met comes
// back as a gate message before anything else is looked at.
//
// Two things synthesis tools warn about are warnings here too, because the course uses them to
// teach: a combinational loop (two `assign`s that read each other make a latch, which is the point
// of the cross-coupled latch lesson), and an `always_comb` target that is not assigned on every
// path (a latch would be inferred; the course leaves the missing path unknown).

import { CircuitBuilder, driverOf, type Circuit, type NetId } from "@dd/sim";
import { dFlipFlop, memoryBlock, register, romBlock } from "@dd/dd-model";

import {
  HdlError,
  type Assignment,
  type Expression,
  type Identifier,
  type Literal,
  type Message,
  type Module,
  type Position,
  type Statement,
} from "./ast";
import { gateMessages, constructsUsed, type Construct } from "./gate";
import { LOOP_NOTE } from "./generate";
import { parse } from "./parser";
import { arrayWrite, type ArrayMemory } from "./memory";

export interface ElaborateOptions {
  /** The constructs the lesson has met. Omit to allow the whole subset. */
  readonly allowed?: readonly Construct[];
  /** Gate delay for the delay model. */
  readonly delay?: number;
}

export interface Elaboration {
  readonly circuit?: Circuit;
  readonly module?: Module;
  readonly messages: readonly Message[];
  readonly constructs: readonly Construct[];
}

interface Signal {
  readonly net: NetId;
  readonly width: number;
  readonly role: "input" | "output" | "logic";
  readonly at: Position;
}

export function elaborate(source: string, options: ElaborateOptions = {}): Elaboration {
  let module: Module;
  try {
    module = parse(source);
  } catch (error) {
    if (error instanceof HdlError)
      return {
        messages: [{ severity: "error", text: error.message, at: error.at }],
        constructs: [],
      };
    throw error;
  }
  const constructs = constructsUsed(module);
  if (options.allowed) {
    const gated = gateMessages(module, options.allowed);
    if (gated.length) return { module, messages: gated, constructs };
  }
  try {
    const { circuit, warnings } = new Elaborator(module, options).run();
    return { circuit, module, messages: warnings, constructs };
  } catch (error) {
    if (error instanceof HdlError)
      return {
        module,
        messages: [{ severity: "error", text: error.message, at: error.at }],
        constructs,
      };
    if (error instanceof Error)
      return { module, messages: [{ severity: "error", text: error.message }], constructs };
    throw error;
  }
}

class Elaborator {
  private readonly b: CircuitBuilder;
  private readonly signals = new Map<string, Signal>();
  private readonly params = new Map<string, bigint>();
  private readonly driven = new Map<NetId, Position>();
  private readonly warnings: Message[] = [];
  private readonly g: { delay?: number };
  /** Module 6: the module's memories, written as arrays, by name. */
  private readonly arrays = new Map<string, ArrayMemory>();

  constructor(
    private readonly module: Module,
    options: ElaborateOptions,
  ) {
    this.b = new CircuitBuilder(module.name);
    this.g = options.delay !== undefined ? { delay: options.delay } : {};
  }

  run(): { circuit: Circuit; warnings: Message[] } {
    const m = this.module;
    for (const p of m.parameters) this.params.set(p.name, this.constant(p.value));
    for (const port of m.ports) {
      const width = port.range ? this.rangeWidth(port.range, port.at) : 1;
      if (this.signals.has(port.name))
        throw new HdlError(port.at, `${port.name} is declared twice`);
      const net =
        port.direction === "input" ? this.b.input(port.name, width) : this.b.net(port.name, width);
      if (port.direction === "input") this.driven.set(net, port.at);
      this.signals.set(port.name, { net, width, role: port.direction, at: port.at });
    }
    for (const d of m.declarations) {
      const width = d.range ? this.rangeWidth(d.range, d.at) : 1;
      if (this.signals.has(d.name) || this.arrays.has(d.name))
        throw new HdlError(d.at, `${d.name} is declared twice`);
      if (d.array) {
        this.declareArray(d.name, width, d.array, d.init, d.at);
        continue;
      }
      this.signals.set(d.name, { net: this.b.net(d.name, width), width, role: "logic", at: d.at });
    }
    for (const item of m.items) {
      switch (item.kind) {
        case "assign": {
          const target = this.target(
            item.target.name,
            item.target.at,
            item.target.select !== undefined,
          );
          this.claim(target.net, item.at, target.width);
          this.into(item.value, target.net, target.width);
          break;
        }
        case "always_comb": {
          const env = new Map<string, NetId>();
          this.exec(item.body, env, "=", new Set());
          for (const [name, net] of env) {
            const target = this.target(name, item.at, false);
            this.claim(target.net, item.at, target.width);
            this.b.gate("buf", [net], { output: target.net, name: `${name}_comb`, ...this.g });
          }
          break;
        }
        case "always_ff": {
          const clock = this.signals.get(item.clock);
          if (!clock)
            throw new HdlError(item.at, `${item.clock} is not declared, so it cannot be a clock`);
          if (clock.width !== 1)
            throw new HdlError(item.at, `a clock is one bit; ${item.clock} is ${clock.width}`);
          const targets = new Set<string>();
          this.collectTargets(item.body, targets);
          // Module 6: an always_ff that writes a memory writes that memory alone.
          const array = [...targets].find((t) => this.arrays.has(t));
          if (array !== undefined) {
            this.writeArray(
              this.arrays.get(array) as ArrayMemory,
              targets,
              item.body,
              clock.net,
              item.at,
            );
            break;
          }
          // The shapes the generator writes for a flip-flop or register with a reset, an enable
          // or both come back as that block with those ports, not as selectors in front of it.
          const shape = targets.size === 1 ? registerShape(item.body) : undefined;
          if (shape) {
            this.clocked(shape, clock.net, item.at);
            break;
          }
          const env = new Map<string, NetId>();
          for (const name of targets) env.set(name, this.target(name, item.at, false).net);
          this.exec(item.body, env, "<=", targets);
          for (const name of targets) {
            const target = this.target(name, item.at, false);
            const next = env.get(name) as NetId;
            this.claim(target.net, item.at, target.width);
            if (target.width === 1) {
              dFlipFlop(this.b, next, clock.net, { name: `${name}_ff`, q: target.net, ...this.g });
            } else {
              register(this.b, next, clock.net, {
                name: `${name}_reg`,
                q: target.net,
                width: target.width,
                ...this.g,
              });
            }
          }
          break;
        }
      }
    }
    for (const memory of this.arrays.values()) this.buildArray(memory);
    for (const [name, s] of this.signals) {
      if (s.role === "output") {
        this.b.output(name, s.net);
        if (!this.driven.has(s.net))
          throw new HdlError(s.at, `the output ${name} is never assigned`);
      }
    }
    const circuit = this.b.build();
    this.loopWarnings(circuit);
    return { circuit, warnings: this.warnings };
  }

  /** A flip-flop or register with the reset and enable a recognised shape names. */
  private clocked(shape: RegisterShape, clock: NetId, at: Position): void {
    const target = this.target(
      shape.target.name,
      shape.target.at,
      shape.target.select !== undefined,
    );
    const load = this.expression(shape.load, target.width);
    if (this.b.widthOf(load) !== target.width)
      this.widthMismatch(shape.load.at, this.b.widthOf(load), target.width);
    if (shape.zero && shape.zero.width !== undefined && shape.zero.width !== target.width)
      this.widthMismatch(shape.zero.at, shape.zero.width, target.width);
    const options = {
      ...(shape.reset ? { reset: this.expression(shape.reset, 1) } : {}),
      ...(shape.enable ? { enable: this.expression(shape.enable, 1) } : {}),
      q: target.net,
      ...this.g,
    };
    this.claim(target.net, at, target.width);
    if (target.width === 1)
      dFlipFlop(this.b, load, clock, { name: `${shape.target.name}_ff`, ...options });
    else
      register(this.b, load, clock, {
        name: `${shape.target.name}_reg`,
        width: target.width,
        ...options,
      });
  }

  private readonly used = new Map<string, number>();

  /** A part name not used before in this module: two selectors for one signal are two parts. */
  private unique(name: string): string {
    const n = (this.used.get(name) ?? 0) + 1;
    this.used.set(name, n);
    return n === 1 ? name : `${name}${n}`;
  }

  private target(name: string, at: Position, selected: boolean): Signal {
    if (this.arrays.has(name))
      throw new HdlError(
        at,
        `${name} is a memory; write one word at a clock edge in an \`always_ff\` of its own, like \`if (WE) ${name}[A] <= D;\`.`,
      );
    const s = this.signals.get(name);
    if (!s)
      throw new HdlError(at, `${name} is not declared; declare it as a port or with \`logic\``);
    if (s.role === "input")
      throw new HdlError(at, `${name} is an input, so nothing inside the module may assign it`);
    if (selected)
      throw new HdlError(
        at,
        `assign the whole of ${name}; assigning one bit of it comes in a later module`,
      );
    return s;
  }

  private claim(net: NetId, at: Position, _width: number): void {
    const earlier = this.driven.get(net);
    if (earlier) {
      const name = this.b["nets" as keyof CircuitBuilder] as unknown;
      void name;
      throw new HdlError(
        at,
        `this signal is assigned twice (the first time at line ${earlier.line}); one driver per signal`,
      );
    }
    this.driven.set(net, at);
  }

  /** Every name assigned anywhere in a statement. */
  private collectTargets(s: Statement, out: Set<string>): void {
    switch (s.kind) {
      case "block":
        s.statements.forEach((x) => this.collectTargets(x, out));
        return;
      case "assignment":
        out.add(s.target.name);
        return;
      case "if":
        this.collectTargets(s.then, out);
        if (s.otherwise) this.collectTargets(s.otherwise, out);
        return;
      case "case":
        s.arms.forEach((a) => this.collectTargets(a.body, out));
        if (s.defaultArm) this.collectTargets(s.defaultArm, out);
        return;
    }
  }

  /**
   * Symbolic execution of a block: `env` maps each assigned name to the net holding its value so
   * far. A branch assigns into copies; afterwards each name gets a selector between the copies.
   */
  private exec(
    s: Statement,
    env: Map<string, NetId>,
    operator: "=" | "<=",
    held: Set<string>,
  ): void {
    switch (s.kind) {
      case "block":
        for (const x of s.statements) this.exec(x, env, operator, held);
        return;
      case "assignment": {
        const target = this.target(s.target.name, s.target.at, s.target.select !== undefined);
        const value = this.expression(s.value, target.width);
        // Inside always_ff or always_comb, as in an assign: a value of the wrong width is the
        // learner's mistake to be told about, not a fault for the simulator to stumble on.
        if (this.b.widthOf(value) !== target.width)
          this.widthMismatch(s.value.at, this.b.widthOf(value), target.width);
        env.set(s.target.name, value);
        return;
      }
      case "if": {
        const cond = this.expression(s.condition, 1);
        const thenEnv = new Map(env);
        this.exec(s.then, thenEnv, operator, held);
        const elseEnv = new Map(env);
        if (s.otherwise) this.exec(s.otherwise, elseEnv, operator, held);
        this.merge(cond, thenEnv, elseEnv, env, operator, held, s.at);
        return;
      }
      case "case": {
        // Arms in order: the first matching label wins, so build from the last arm inwards.
        const subjectWidth = this.widthOf(s.subject) ?? 1;
        const subject = this.expression(s.subject, subjectWidth);
        let fallEnv = new Map(env);
        if (s.defaultArm) this.exec(s.defaultArm, fallEnv, operator, held);
        for (let i = s.arms.length - 1; i >= 0; i--) {
          const arm = s.arms[i] as (typeof s.arms)[number];
          const matches = arm.labels.map((label) =>
            this.equal(subject, this.expression(label, subjectWidth), subjectWidth),
          );
          const cond = matches.length === 1 ? (matches[0] as NetId) : this.b.or(matches, this.g);
          const armEnv = new Map(env);
          this.exec(arm.body, armEnv, operator, held);
          const merged = new Map(env);
          this.merge(cond, armEnv, fallEnv, merged, operator, held, arm.at);
          fallEnv = merged;
        }
        for (const [k, v] of fallEnv) env.set(k, v);
        return;
      }
    }
  }

  private merge(
    cond: NetId,
    thenEnv: Map<string, NetId>,
    elseEnv: Map<string, NetId>,
    env: Map<string, NetId>,
    operator: "=" | "<=",
    held: Set<string>,
    at: Position,
  ): void {
    const names = new Set([...thenEnv.keys(), ...elseEnv.keys()]);
    for (const name of names) {
      const t = thenEnv.get(name);
      const e = elseEnv.get(name);
      if (t !== undefined && e !== undefined && t === e) {
        env.set(name, t);
        continue;
      }
      const width = this.signals.get(name)?.width ?? 1;
      const missing = (branch: string): NetId => {
        if (operator === "<=" && held.has(name)) return this.signals.get(name)?.net as NetId;
        this.warnings.push({
          severity: "warning",
          text: `${name} is not assigned on every path of this ${operator === "=" ? "always_comb" : "always_ff"} (the ${branch} branch leaves it out). Synthesis would infer a latch to hold the old value; the course leaves it unknown instead.`,
          at,
        });
        const x = this.b.net(`${name}_unassigned`, width);
        this.b.component("open", {}, { y: x }, { name: `${name}_open`, params: { width } });
        return x;
      };
      const thenNet = t ?? missing("else");
      const elseNet = e ?? missing("then");
      const y = this.b.net(`${name}_sel`, width);
      this.b.component(
        "mux2",
        { sel: cond, a: elseNet, b: thenNet },
        { y },
        { name: this.unique(`${name}_mux`), ...this.g },
      );
      env.set(name, y);
    }
  }

  /** Elaborates `e` so that its final gate drives `target`. */
  private into(e: Expression, target: NetId, width: number): void {
    if (e.kind === "index" && e.subject.kind === "identifier" && this.arrays.has(e.subject.name)) {
      this.readArray(this.arrays.get(e.subject.name) as ArrayMemory, e, target);
      return;
    }
    switch (e.kind) {
      case "identifier":
      case "literal":
      case "index":
      case "concat": {
        const src = this.expression(e, width);
        if (this.b.widthOf(src) !== width) this.widthMismatch(e.at, this.b.widthOf(src), width);
        this.b.gate("buf", [src], { output: target, ...this.g });
        return;
      }
      default: {
        const src = this.expression(e, width, target);
        if (src !== target) {
          if (this.b.widthOf(src) !== width) this.widthMismatch(e.at, this.b.widthOf(src), width);
          this.b.gate("buf", [src], { output: target, ...this.g });
        }
      }
    }
  }

  /**
   * Elaborates an expression to a net. `want` is the width an unsized literal takes here; `output`
   * is a net the top-level gate should drive instead of a fresh one.
   */
  private expression(e: Expression, want: number | undefined, output?: NetId): NetId {
    switch (e.kind) {
      case "identifier": {
        const p = this.params.get(e.name);
        if (p !== undefined) return this.constant_(p, 0n, want ?? 32, e.at, output);
        if (this.arrays.has(e.name))
          throw new HdlError(
            e.at,
            `${e.name} is a memory; read one word by its address, like \`${e.name}[A]\`.`,
          );
        const s = this.signals.get(e.name);
        if (!s) throw new HdlError(e.at, `${e.name} is not declared`);
        if (output !== undefined) {
          this.b.gate("buf", [s.net], { output, ...this.g });
          return output;
        }
        return s.net;
      }
      case "literal": {
        const width = e.width ?? want;
        if (width === undefined)
          throw new HdlError(
            e.at,
            `give ${e.text} a width, such as 1'b${e.text}, or use it where the width is known`,
          );
        if (e.width === undefined && e.value >= 1n << BigInt(width))
          throw new HdlError(
            e.at,
            `${e.text} does not fit in ${width} bit${width === 1 ? "" : "s"}`,
          );
        return this.constant_(e.value, e.unknown, width, e.at, output);
      }
      case "unary": {
        if (e.operator === "~") {
          const inner = e.operand;
          if (
            inner.kind === "binary" &&
            (inner.operator === "|" || inner.operator === "&" || inner.operator === "^")
          ) {
            // ~(a | b) is one NOR gate, as a drawing has it; likewise NAND and XNOR. One assign
            // with one operator is one gate, which is what the lesson says of an assign.
            const width = this.widthOf(inner.left) ?? this.widthOf(inner.right) ?? want;
            const l = this.expression(inner.left, width);
            const r = this.expression(inner.right, width);
            const lw = this.b.widthOf(l);
            const rw = this.b.widthOf(r);
            if (lw !== rw)
              throw new HdlError(
                inner.at,
                `the two sides of ${inner.operator} differ in width: ${lw} and ${rw} bits`,
              );
            const kind = inner.operator === "|" ? "nor" : inner.operator === "&" ? "nand" : "xnor";
            return this.b.gate(kind, [l, r], {
              ...(output !== undefined ? { output } : {}),
              ...this.g,
            });
          }
          const a = this.expression(e.operand, want);
          return this.b.not(a, { ...(output !== undefined ? { output } : {}), ...this.g });
        }
        const a = this.expression(e.operand, 1);
        if (this.b.widthOf(a) !== 1)
          throw new HdlError(
            e.at,
            "`!` works on a one-bit value; for a wider signal write `x == 0`",
          );
        return this.b.not(a, { ...(output !== undefined ? { output } : {}), ...this.g });
      }
      case "binary": {
        const op = e.operator;
        if (op === "+" || op === "-") {
          throw new HdlError(
            e.at,
            "arithmetic on signals comes in a later module; here `+` and `-` work on constants such as widths",
          );
        }
        if (op === "&&" || op === "||") {
          const l = this.expression(e.left, 1);
          const r = this.expression(e.right, 1);
          if (this.b.widthOf(l) !== 1 || this.b.widthOf(r) !== 1)
            throw new HdlError(e.at, `${op} works on one-bit values; use & or | for wider signals`);
          return this.b.gate(op === "&&" ? "and" : "or", [l, r], {
            ...(output !== undefined ? { output } : {}),
            ...this.g,
          });
        }
        const width = this.widthOf(e.left) ?? this.widthOf(e.right) ?? want;
        const l = this.expression(e.left, width);
        const r = this.expression(e.right, width);
        const lw = this.b.widthOf(l);
        const rw = this.b.widthOf(r);
        if (lw !== rw)
          throw new HdlError(e.at, `the two sides of ${op} differ in width: ${lw} and ${rw} bits`);
        if (op === "==" || op === "!=") {
          const eq = this.equal(l, r, lw, output !== undefined && op === "==" ? output : undefined);
          if (op === "==") return eq;
          return this.b.not(eq, { ...(output !== undefined ? { output } : {}), ...this.g });
        }
        const kind = op === "&" ? "and" : op === "|" ? "or" : "xor";
        return this.b.gate(kind, [l, r], {
          ...(output !== undefined ? { output } : {}),
          ...this.g,
        });
      }
      case "ternary": {
        const cond = this.expression(e.condition, 1);
        if (this.b.widthOf(cond) !== 1)
          throw new HdlError(e.at, "the condition of `? :` must be one bit");
        const width = this.widthOf(e.then) ?? this.widthOf(e.otherwise) ?? want;
        const t = this.expression(e.then, width);
        const o = this.expression(e.otherwise, width);
        if (this.b.widthOf(t) !== this.b.widthOf(o))
          throw new HdlError(e.at, "both arms of `? :` must have the same width");
        const y = output ?? this.b.net(`sel${e.at.line}_${e.at.column}`, this.b.widthOf(t));
        this.b.component("mux2", { sel: cond, a: o, b: t }, { y }, { ...this.g });
        return y;
      }
      case "index": {
        if (e.subject.kind === "identifier" && this.arrays.has(e.subject.name))
          return this.readArray(this.arrays.get(e.subject.name) as ArrayMemory, e, output);
        const subject = this.expression(e.subject, undefined);
        const hi = Number(this.constant(e.hi));
        const lo = Number(this.constant(e.lo));
        const sw = this.b.widthOf(subject);
        if (lo < 0 || hi < lo || hi >= sw)
          throw new HdlError(e.at, `bits ${hi}:${lo} are outside a ${sw}-bit signal`);
        const y = output ?? this.b.net(`bits${e.at.line}_${e.at.column}`, hi - lo + 1);
        if (hi === lo)
          this.b.component("bit", { a: subject }, { y }, { params: { index: lo }, ...this.g });
        else this.b.component("slice", { a: subject }, { y }, { params: { hi, lo }, ...this.g });
        return y;
      }
      case "concat": {
        const parts = e.parts.map((p) => {
          const w = this.widthOf(p);
          if (w === undefined)
            throw new HdlError(p.at, "every part of a concatenation needs a known width");
          return this.expression(p, w);
        });
        const width = parts.reduce((sum, n) => sum + this.b.widthOf(n), 0);
        const y = output ?? this.b.net(`cat${e.at.line}_${e.at.column}`, width);
        const ports: Record<string, NetId> = {};
        // `{a, b}` puts a in the high bits; the join primitive's port a is the low bits.
        [...parts].reverse().forEach((n, i) => {
          ports[String.fromCharCode(97 + i)] = n;
        });
        this.b.component("join", ports, { y }, { params: { width }, ...this.g });
        return y;
      }
    }
  }

  /** a == b as a one-bit net: XOR the words, then NOR the bits together. */
  private equal(a: NetId, b: NetId, width: number, output?: NetId): NetId {
    const diff = this.b.xor([a, b], this.g);
    if (width === 1)
      return this.b.not(diff, { ...(output !== undefined ? { output } : {}), ...this.g });
    const bits: NetId[] = [];
    for (let i = 0; i < width; i++) {
      const bit = this.b.net(
        `${this.b.name}_eqbit${this.b["components" as keyof CircuitBuilder] ? "" : ""}${i}_${diff}`,
      );
      this.b.component("bit", { a: diff }, { y: bit }, { params: { index: i }, ...this.g });
      bits.push(bit);
    }
    return this.b.nor(bits, { ...(output !== undefined ? { output } : {}), ...this.g });
  }

  private constant_(
    value: bigint,
    unknown: bigint,
    width: number,
    _at: Position,
    output?: NetId,
  ): NetId {
    const y = output ?? this.b.net(`const${this.counter++}`, width);
    if (unknown !== 0n) {
      // A literal with x bits: known bits as a constant, unknown bits open, joined per bit.
      const ports: Record<string, NetId> = {};
      for (let i = 0; i < width; i++) {
        const bitNet = this.b.net(`constbit${this.counter++}`);
        const mask = 1n << BigInt(i);
        if ((unknown & mask) !== 0n)
          this.b.component("open", {}, { y: bitNet }, { params: { width: 1 } });
        else
          this.b.component(
            "const",
            {},
            { y: bitNet },
            { params: { width: 1, value: (value & mask) !== 0n ? "1" : "0" } },
          );
        ports[String.fromCharCode(97 + i)] = bitNet;
      }
      this.b.component("join", ports, { y }, { params: { width } });
      return y;
    }
    this.b.component("const", {}, { y }, { params: { width, value: value.toString() } });
    return y;
  }

  private counter = 0;

  /** The width an expression will have, if it can be told without elaborating it. */
  private widthOf(e: Expression): number | undefined {
    switch (e.kind) {
      case "identifier":
        return this.params.has(e.name) ? undefined : this.signals.get(e.name)?.width;
      case "literal":
        return e.width;
      case "unary":
        return e.operator === "!" ? 1 : this.widthOf(e.operand);
      case "binary":
        if (
          e.operator === "&&" ||
          e.operator === "||" ||
          e.operator === "==" ||
          e.operator === "!="
        )
          return 1;
        return this.widthOf(e.left) ?? this.widthOf(e.right);
      case "ternary":
        return this.widthOf(e.then) ?? this.widthOf(e.otherwise);
      case "index":
        if (e.subject.kind === "identifier" && this.arrays.has(e.subject.name))
          return this.arrays.get(e.subject.name)?.width;
        return Number(this.constant(e.hi)) - Number(this.constant(e.lo)) + 1;
      case "concat": {
        let sum = 0;
        for (const p of e.parts) {
          const w = this.widthOf(p);
          if (w === undefined) return undefined;
          sum += w;
        }
        return sum;
      }
    }
  }

  /** A constant expression: literals, parameters, and the operators on them. */
  private constant(e: Expression): bigint {
    switch (e.kind) {
      case "literal":
        return e.value;
      case "identifier": {
        const p = this.params.get(e.name);
        if (p === undefined)
          throw new HdlError(
            e.at,
            `${e.name} is not a constant; a width or an index needs a number or a parameter`,
          );
        return p;
      }
      case "unary":
        return e.operator === "~"
          ? ~this.constant(e.operand)
          : this.constant(e.operand) === 0n
            ? 1n
            : 0n;
      case "binary": {
        const l = this.constant(e.left);
        const r = this.constant(e.right);
        switch (e.operator) {
          case "+":
            return l + r;
          case "-":
            return l - r;
          case "&":
            return l & r;
          case "|":
            return l | r;
          case "^":
            return l ^ r;
          case "&&":
            return l !== 0n && r !== 0n ? 1n : 0n;
          case "||":
            return l !== 0n || r !== 0n ? 1n : 0n;
          case "==":
            return l === r ? 1n : 0n;
          case "!=":
            return l !== r ? 1n : 0n;
        }
        break;
      }
      case "ternary":
        return this.constant(e.condition) !== 0n
          ? this.constant(e.then)
          : this.constant(e.otherwise);
      default:
        break;
    }
    throw new HdlError(e.at, "this must be a constant expression");
  }

  private rangeWidth(range: { hi: Expression; lo: Expression }, at: Position): number {
    const hi = Number(this.constant(range.hi));
    const lo = Number(this.constant(range.lo));
    if (lo !== 0) throw new HdlError(at, `ranges in this course end at 0: write [${hi - lo}:0]`);
    if (hi < 0) throw new HdlError(at, "a range's high bit must be 0 or more");
    return hi - lo + 1;
  }

  // ---- Module 6: memories written as arrays ------------------------------------------------

  /** An array's shape and list of values, checked: words from 0, every value fitting a word. */
  private declareArray(
    name: string,
    width: number,
    dims: { from: Expression; to?: Expression },
    init: readonly Expression[] | undefined,
    at: Position,
  ): void {
    const from = Number(this.constant(dims.from));
    let words = from;
    if (dims.to !== undefined) {
      if (from !== 0)
        throw new HdlError(
          at,
          `Arrays start at 0 in this course; write \`[0:${Number(this.constant(dims.to)) - from}]\` instead.`,
        );
      words = Number(this.constant(dims.to)) + 1;
    }
    if (!Number.isInteger(words) || words < 1)
      throw new HdlError(at, `${name} needs at least one word`);
    if (words * width + 1 > 1024)
      throw new HdlError(
        at,
        `${name} is ${words} words of ${width} bits; the course's memories hold at most 1023 bits`,
      );
    let values: bigint[] | undefined;
    if (init) {
      if (init.length !== words)
        throw new HdlError(
          at,
          `${name} has ${words} words, but the list has ${init.length} value${init.length === 1 ? "" : "s"}; give one value per word.`,
        );
      values = init.map((v) => {
        const n = this.constant(v);
        if (n < 0n || n >= 1n << BigInt(width))
          throw new HdlError(
            v.at,
            `\`${v.kind === "literal" ? v.text : "this value"}\` does not fit in a word of ${width} bits.`,
          );
        if (v.kind === "literal" && v.width !== undefined && v.width !== width)
          this.widthMismatch(v.at, v.width, width);
        return n;
      });
    }
    this.arrays.set(name, {
      name,
      width,
      words,
      ...(values ? { init: values } : {}),
      reads: [],
      at,
    });
  }

  /** A read of one word: a read port on the memory, its output a fresh net. */
  private readArray(
    memory: ArrayMemory,
    e: Extract<Expression, { kind: "index" }>,
    output: NetId | undefined,
  ): NetId {
    if (e.hi !== e.lo)
      throw new HdlError(
        e.at,
        `Read or write one word of ${memory.name} at a time, like \`${memory.name}[A]\`.`,
      );
    const address = this.expression(e.hi, undefined);
    // The memory drives the signal the read is assigned to, as `assign Q = mem[A]` says.
    if (output !== undefined && this.b.widthOf(output) !== memory.width)
      this.widthMismatch(e.at, memory.width, this.b.widthOf(output));
    const q = output ?? this.b.net(`${memory.name}_q${memory.reads.length}`, memory.width);
    memory.reads.push({ address, q });
    return q;
  }

  /** The always_ff that writes a memory: one word, at an address, while a condition holds. */
  private writeArray(
    memory: ArrayMemory,
    targets: ReadonlySet<string>,
    body: Statement,
    clock: NetId,
    at: Position,
  ): void {
    const shape = arrayWrite(body);
    if (targets.size !== 1 || !shape || shape.target.name !== memory.name)
      throw new HdlError(
        at,
        `Write ${memory.name} in an \`always_ff\` of its own, one word at a time: \`if (WE) ${memory.name}[A] <= D;\`.`,
      );
    if (memory.write)
      throw new HdlError(
        at,
        `${memory.name} is written in two places; write it in one \`always_ff\`.`,
      );
    const select = shape.target.select as NonNullable<typeof shape.target.select>;
    if (select.hi !== select.lo)
      throw new HdlError(
        at,
        `Read or write one word of ${memory.name} at a time, like \`${memory.name}[A]\`.`,
      );
    const address = this.expression(select.hi, undefined);
    const data = this.expression(shape.value, memory.width);
    if (this.b.widthOf(data) !== memory.width)
      this.widthMismatch(shape.value.at, this.b.widthOf(data), memory.width);
    const enable = shape.enable ? this.expression(shape.enable, 1) : this.constant_(1n, 0n, 1, at);
    if (this.b.widthOf(enable) !== 1)
      throw new HdlError(at, "the condition that writes a memory must be one bit");
    memory.write = { clock, enable, address, data };
  }

  /** The memory itself, once every read and the write are known. */
  private buildArray(memory: ArrayMemory): void {
    const outs = Object.fromEntries(memory.reads.map((r, i) => [`Q${i}`, r.q]));
    if (memory.write) {
      const w = memory.write;
      memoryBlock(
        this.b,
        {
          CLK: w.clock,
          WE: w.enable,
          WA: w.address,
          D: w.data,
          reads: memory.reads.map((r) => r.address),
        },
        {
          name: memory.name,
          words: memory.words,
          width: memory.width,
          ...(memory.init ? { init: memory.init } : {}),
          outs,
        },
      );
      return;
    }
    if (!memory.init)
      throw new HdlError(
        memory.at,
        `${memory.name} is never written and has no list of values; every word would be unknown.`,
      );
    romBlock(
      this.b,
      { reads: memory.reads.map((r) => r.address) },
      { name: memory.name, words: memory.words, width: memory.width, init: memory.init, outs },
    );
  }

  private widthMismatch(at: Position, got: number, want: number): never {
    throw new HdlError(
      at,
      `this expression is ${got} bit${got === 1 ? "" : "s"} wide but the signal it is assigned to is ${want}`,
    );
  }

  /** A combinational loop among the module's own gates (not inside a flip-flop) is a latch. */
  private loopWarnings(circuit: Circuit): void {
    const insideFlipFlop = (path: string) =>
      circuit.composites.some(
        (c) =>
          // Module 6: a memory's loop holds its words, as a flip-flop's holds its bit.
          (c.kind === "dff" || c.kind === "register" || c.kind === "memory") &&
          (path === c.path || path.startsWith(`${c.path}/`)),
      );
    const gates = circuit.components.filter((c) => !insideFlipFlop(c.path));
    const gateIds = new Set(gates.map((c) => c.id));
    const visiting = new Set<number>();
    const done = new Set<number>();
    const reported = new Set<string>();
    const visit = (id: number, stack: number[]): void => {
      if (done.has(id)) return;
      if (visiting.has(id)) {
        const cycle = stack.slice(stack.indexOf(id));
        const allNames = cycle
          .flatMap((cid) => Object.values(circuit.components[cid]?.outputs ?? {}))
          .map((n) => circuit.nets[n]?.name ?? String(n));
        // The learner's own signals, where the loop has any; the gates' nets otherwise.
        const declared = allNames.filter((n) => this.signals.has(n));
        const names = declared.length ? declared : allNames;
        const key = [...names].sort().join(",");
        if (!reported.has(key)) {
          reported.add(key);
          this.warnings.push({
            severity: "warning",
            text: `${names.join(" and ")}: ${LOOP_NOTE}`,
          });
        }
        return;
      }
      visiting.add(id);
      stack.push(id);
      const c = circuit.components[id];
      if (c) {
        for (const out of Object.values(c.outputs)) {
          for (const reader of circuit.components) {
            if (!gateIds.has(reader.id)) continue;
            if (Object.values(reader.inputs).includes(out)) visit(reader.id, stack);
          }
        }
      }
      stack.pop();
      visiting.delete(id);
      done.add(id);
    };
    for (const g of gates) visit(g.id, []);
    void driverOf;
  }
}

interface RegisterShape {
  readonly target: Assignment["target"];
  readonly load: Expression;
  readonly reset?: Identifier;
  /** The reset's value as written, all zeros. */
  readonly zero?: Literal;
  readonly enable?: Identifier;
}

/** A statement with any single-statement `begin ... end` around it taken off. */
function bare(s: Statement): Statement {
  return s.kind === "block" && s.statements.length === 1 ? bare(s.statements[0] as Statement) : s;
}

function assignment(s: Statement | undefined): Assignment | undefined {
  const b = s ? bare(s) : undefined;
  return b?.kind === "assignment" && b.operator === "<=" && b.target.select === undefined
    ? b
    : undefined;
}

function zero(e: Expression): Literal | undefined {
  return e.kind === "literal" && e.value === 0n && e.unknown === 0n ? e : undefined;
}

/**
 * The three shapes the generator writes for a clocked block with a reset or an enable:
 * `if (R) Q <= 0; else if (E) Q <= D;`, `if (R) Q <= 0; else Q <= D;` and `if (E) Q <= D;`, with
 * R and E plain names. Anything else is elaborated as written, through selectors.
 */
export function registerShape(body: Statement): RegisterShape | undefined {
  const top = bare(body);
  if (top.kind !== "if" || top.condition.kind !== "identifier") return undefined;
  const first = assignment(top.then);
  if (!first) return undefined;
  if (top.otherwise === undefined) {
    return { target: first.target, load: first.value, enable: top.condition };
  }
  const reset = zero(first.value);
  if (!reset) return undefined;
  const rest = bare(top.otherwise);
  const plain = assignment(rest);
  if (plain && plain.target.name === first.target.name) {
    return { target: first.target, load: plain.value, reset: top.condition, zero: reset };
  }
  if (rest.kind !== "if" || rest.otherwise !== undefined || rest.condition.kind !== "identifier")
    return undefined;
  const loaded = assignment(rest.then);
  if (!loaded || loaded.target.name !== first.target.name) return undefined;
  return {
    target: first.target,
    load: loaded.value,
    reset: top.condition,
    zero: reset,
    enable: rest.condition,
  };
}
