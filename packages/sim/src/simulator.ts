// Copyright © 2026 Christopher Snow

// The simulator: two time models, one trace, snapshots and replay.
//
// **Settle** is the combinational model. Every gate takes one unit of time, and the whole
// netlist is recomputed synchronously, every gate from the values of the step before, until
// nothing changes. That is the same as a delay model in which every gate has the same delay, and
// it has two properties the course wants: it is order-independent, so a race the circuit cannot
// decide does not get decided by which gate the code happened to visit first, and it is cheap
// enough to run on every change a learner makes. A netlist that never settles is reported as
// oscillating, and the nets that keep changing are left unknown (X): the model says it cannot
// decide, which is the truth about an SR latch released from both inputs at once.
//
// **Delay** is the propagation-delay model, optional and educational. Each gate has its own
// delay; a change on a net schedules the gates that read it to produce their new outputs after
// their delays; events are processed in time order and, at the same time, in the order they were
// scheduled, so a run is deterministic. This is the model that makes setup and hold visible: the
// master and slave latches of a flip-flop open and close one gate delay apart.
//
// The clocked sequential model is a discipline on top of either: inputs change only between
// edges, and `clockCycle()` applies them, settles, raises the clock, settles, lowers it, settles.
// None of the three is transistor-level, and every lesson says so.
//
// Everything the simulator does is recorded in the trace: the stimuli it was given and every net
// change. `replay()` builds a fresh simulator and feeds it the same stimuli, and a test holds the
// two traces equal. Nothing here reads a clock or draws a random number; the metastability
// overlay is a separate module with a recorded seed.

import { driverOf, type Circuit, type Component, type NetId } from "./circuit";
import { primitive } from "./primitives";
import { equal, unknown, type Word } from "./values";

export type TimeModel = "settle" | "delay";

export interface SimulatorOptions {
  /** `settle` (the default) or `delay`. */
  timeModel?: TimeModel;
  /** Gate delay in the delay model when a component declares none. Default 10. */
  defaultDelay?: number;
  /** Settle iterations before the netlist is declared oscillating. Default 4 × components + 16. */
  maxIterations?: number;
}

export interface TraceEvent {
  readonly time: number;
  readonly net: NetId;
  readonly value: Word;
  /** `stimulus` for a change the outside made; `settle` for a change the netlist made. */
  readonly cause: "stimulus" | "settle" | "overlay";
  /** For an overlay event, what it recorded (a seed, a draw). */
  readonly note?: string;
}

export interface Stimulus {
  readonly time: number;
  /** Which settle (or run) this stimulus preceded, so a replay groups stimuli as the original did. */
  readonly phase: number;
  readonly net: NetId;
  readonly value: Word;
}

export interface Trace {
  readonly events: TraceEvent[];
  readonly stimuli: Stimulus[];
  /** Times at which the outside asked the simulator to settle or run, for a timeline's ticks. */
  readonly marks: { readonly time: number; readonly label: string }[];
}

export interface SettleResult {
  readonly converged: boolean;
  readonly iterations: number;
  /** Nets still changing when the iteration cap was reached. Empty when converged. */
  readonly oscillating: NetId[];
  /** The net values after each iteration, the step before first, for a view that shows settling. */
  readonly history: Word[][];
}

export interface Snapshot {
  readonly time: number;
  readonly values: readonly Word[];
  readonly pending: readonly ScheduledEvent[];
  readonly sequence: number;
}

interface ScheduledEvent {
  readonly time: number;
  readonly sequence: number;
  readonly net: NetId;
  readonly value: Word;
  readonly cause: TraceEvent["cause"];
  readonly note?: string;
}

export class Simulator {
  readonly circuit: Circuit;
  readonly timeModel: TimeModel;
  readonly trace: Trace = { events: [], stimuli: [], marks: [] };
  time = 0;
  lastSettle: SettleResult | undefined;

  private values: Word[];
  private readonly defaultDelay: number;
  private readonly maxIterations: number;
  private readonly readers: Map<NetId, Component[]>;
  private readonly drivers = new Map<NetId, Component[]>();
  private pending: ScheduledEvent[] = [];
  private sequence = 0;
  private phase = 0;
  /** Nets the gate model may not drive before a time: the overlay's undecided interval. */
  private holds = new Map<NetId, number>();
  /**
   * The inputs set since the last settle that ended with nothing changing, or `all` when no such
   * settle has run (Module 8). After such a settle every gate gives what its inputs make it give,
   * so only the readers of these nets can change at the next settle's first step.
   */
  private dirty: Set<NetId> | "all" = "all";

  constructor(circuit: Circuit, options: SimulatorOptions = {}) {
    this.circuit = circuit;
    this.timeModel = options.timeModel ?? "settle";
    this.defaultDelay = options.defaultDelay ?? 10;
    this.maxIterations = options.maxIterations ?? 4 * circuit.components.length + 16;
    this.values = circuit.nets.map((n) => unknown(n.width));
    this.readers = new Map();
    for (const c of circuit.components) {
      for (const net of Object.values(c.outputs)) {
        const list = this.drivers.get(net) ?? [];
        list.push(c);
        this.drivers.set(net, list);
      }
      for (const net of Object.values(c.inputs)) {
        const list = this.readers.get(net) ?? [];
        list.push(c);
        this.readers.set(net, list);
      }
    }
  }

  /** The value of a net now. */
  read(net: NetId | string): Word {
    const id = this.resolve(net);
    return this.values[id] as Word;
  }

  /** Every net's value now, by net id. */
  snapshotValues(): Word[] {
    return [...this.values];
  }

  /** Every output's value now, by output name. */
  outputs(): Record<string, Word> {
    const out: Record<string, Word> = {};
    for (const o of this.circuit.outputs) out[o.name] = this.values[o.net] as Word;
    return out;
  }

  /**
   * Drives an input net to `value` at the current time. In the settle model the change is
   * immediate and `settle()` propagates it; in the delay model it is immediate too, and the
   * gates that read it are scheduled.
   */
  setInput(net: NetId | string, value: Word): void {
    const id = this.resolve(net);
    const n = this.circuit.nets[id];
    if (!n) throw new RangeError(`no net ${String(net)}`);
    if (value.width !== n.width) {
      throw new RangeError(`${n.name} is ${n.width} bits wide; the value is ${value.width}`);
    }
    if (!this.circuit.inputs.some((i) => i.net === id)) {
      throw new Error(
        `${n.name} is not an input of ${this.circuit.name}; only inputs can be driven`,
      );
    }
    this.trace.stimuli.push({ time: this.time, phase: this.phase, net: id, value });
    if (!equal(this.values[id] as Word, value)) {
      this.values[id] = value;
      if (this.dirty !== "all") this.dirty.add(id);
      this.trace.events.push({ time: this.time, net: id, value, cause: "stimulus" });
      if (this.timeModel === "delay") this.scheduleReaders(id);
    }
  }

  /**
   * Settle model: recompute every gate synchronously until nothing changes. Returns what
   * happened. Nets that never stop changing are set to X. Time does not advance; call `tick()`
   * to move the clock of the timeline on.
   */
  settle(): SettleResult {
    if (this.timeModel !== "settle") {
      throw new Error("settle() belongs to the settle model; use run() in the delay model");
    }
    this.phase++;
    // The history is kept as the state before the first step and, for each step, the nets that
    // changed (Module 8: copying every net's value at every step was most of a 64-bit datapath's
    // settle). A step's whole state is put together only when something asks for it.
    const base = [...this.values];
    const deltas: (readonly [NetId, Word])[][] = [];
    const stateAt = (step: number): Word[] => {
      const out = [...base];
      for (let i = 0; i < step; i++) for (const [net, w] of deltas[i] ?? []) out[net] = w;
      return out;
    };
    const result = (converged: boolean, iterations: number, oscillating: NetId[]): SettleResult => {
      let history: Word[][] | undefined;
      return {
        converged,
        iterations,
        oscillating,
        get history() {
          if (!history) {
            history = [[...base]];
            const now = [...base];
            for (const changes of deltas) {
              for (const [net, w] of changes) now[net] = w;
              history.push([...now]);
            }
          }
          return history;
        },
      };
    };
    // A state is looked up by a hash of every net's value, kept up to date from the nets that
    // change, and confirmed against the stored state, so a repeat is found exactly as a full
    // comparison would find it without writing every value out at every step.
    let hash = 0;
    for (let net = 0; net < this.values.length; net++)
      hash = (hash + this.netHash(net, this.values[net] as Word)) >>> 0;
    const seen = new Map<number, number[]>([[hash, [0]]]);
    let iterations = 0;
    let changes: [NetId, Word][] = [];
    // Every gate is worked out at the first step. After that a gate whose inputs did not change
    // gives what it gave a step ago, which its output already shows, so only the readers of the
    // nets that changed are worked out again. The result is the same as working out every gate.
    let due: readonly Component[] = this.circuit.components;
    // Module 8: after a settle that ended with nothing changing, only the readers of the inputs
    // set since can change at the first step, so only they are worked out; the steps, the history
    // and the result are the same as working out every gate.
    if (this.dirty !== "all") {
      const readers = new Set<Component>();
      for (const net of this.dirty) {
        for (const c of this.readers.get(net) ?? []) readers.add(c);
        // An input a fault holds (a fixed value driving the input's own net) is driven as well
        // as set: its driver is worked out again, as a full first step would.
        for (const c of this.drivers.get(net) ?? []) readers.add(c);
      }
      due = [...readers];
    }
    this.dirty = "all";
    while (iterations < this.maxIterations) {
      // Every gate due at this step reads the values of the step before: the changes are
      // gathered first and made together. Each net has one driver, so no net changes twice.
      changes = [];
      for (const c of due) {
        const outputs = this.evaluate(c, this.values);
        for (const port in c.outputs) {
          const net = c.outputs[port] as NetId;
          const v = outputs[port];
          if (v && !equal(this.values[net] as Word, v)) changes.push([net, v]);
        }
      }
      iterations++;
      if (changes.length === 0) {
        this.dirty = new Set();
        this.lastSettle = result(true, iterations, []);
        return this.lastSettle;
      }
      for (const [net, v] of changes) {
        this.trace.events.push({ time: this.time, net, value: v, cause: "settle" });
        hash =
          (hash -
            this.netHash(net, this.values[net] as Word) +
            this.netHash(net, v) +
            0x100000000) >>>
          0;
      }
      for (const [net, v] of changes) this.values[net] = v;
      deltas.push(changes);
      const step = deltas.length;
      const earlier = (seen.get(hash) ?? []).find((i) =>
        stateAt(i).every((w, net) => equal(w, this.values[net] as Word)),
      );
      if (earlier !== undefined) {
        // The state repeated: a cycle. Every net that varies within the cycle is undecidable.
        const states = Array.from({ length: step - earlier + 1 }, (_, k) => stateAt(earlier + k));
        const oscillating = this.varyingWithin(states);
        this.markUnknown(oscillating);
        this.lastSettle = result(false, iterations, oscillating);
        return this.lastSettle;
      }
      seen.set(hash, [...(seen.get(hash) ?? []), step]);
      const readers = new Set<Component>();
      for (const [net] of changes) for (const c of this.readers.get(net) ?? []) readers.add(c);
      due = [...readers];
    }
    const oscillating = changes.map(([net]) => net);
    this.markUnknown(oscillating);
    this.lastSettle = result(false, iterations, oscillating);
    return this.lastSettle;
  }

  /** Settle model: advances the timeline by one unit and marks it, for a timing diagram. */
  tick(label = ""): void {
    this.time += 1;
    this.trace.marks.push({ time: this.time, label });
  }

  /**
   * Settle model: marks the present time with a step's label, where its inputs changed and the
   * circuit settled, then advances the timeline by one unit for the next step.
   */
  step(label = ""): void {
    if (label) this.trace.marks.push({ time: this.time, label });
    this.time += 1;
  }

  /**
   * Settle model, clocked discipline: with the inputs already set for this cycle, settle at the
   * low phase, raise `clock`, settle, advance, lower it, settle, advance. One cycle is two time
   * units: the rising edge falls on an odd time. The rise is marked `rise`: a step's own label, or
   * the bare arrow a figure numbers.
   */
  clockCycle(clock: NetId | string, rise = "↑"): { low: SettleResult; high: SettleResult } {
    const id = this.resolve(clock);
    const low = this.settle();
    this.tick(rise);
    this.setInput(id, { width: 1, value: 1n, known: 1n });
    const high = this.settle();
    this.tick("↓");
    this.setInput(id, { width: 1, value: 0n, known: 1n });
    this.settle();
    return { low, high };
  }

  /**
   * Delay model: processes events in time order until the queue is empty or `until` is reached.
   * Returns false if the queue was still busy at `until` (an oscillation never empties it).
   */
  run(until = Number.POSITIVE_INFINITY, maxEvents = 100_000): boolean {
    if (this.timeModel !== "delay") {
      throw new Error("run() belongs to the delay model; use settle() in the settle model");
    }
    let processed = 0;
    while (this.pending.length > 0) {
      this.pending.sort((p, q) => p.time - q.time || p.sequence - q.sequence);
      const next = this.pending[0] as ScheduledEvent;
      if (next.time > until) {
        this.time = until;
        return false;
      }
      this.pending.shift();
      this.time = next.time;
      if (next.cause === "settle" && (this.holds.get(next.net) ?? -Infinity) > next.time) continue;
      if (!equal(this.values[next.net] as Word, next.value)) {
        this.values[next.net] = next.value;
        this.trace.events.push({
          time: next.time,
          net: next.net,
          value: next.value,
          cause: next.cause,
          ...(next.note !== undefined ? { note: next.note } : {}),
        });
        this.scheduleReaders(next.net);
      }
      if (++processed > maxEvents) return false;
    }
    if (Number.isFinite(until) && until > this.time) this.time = until;
    return true;
  }

  /** Delay model: schedules a change on a net at an absolute time, for an overlay. */
  scheduleAt(
    net: NetId | string,
    value: Word,
    time: number,
    cause: TraceEvent["cause"] = "stimulus",
    note?: string,
  ): void {
    const id = this.resolve(net);
    this.pending.push({
      time,
      sequence: this.sequence++,
      net: id,
      value,
      cause,
      ...(note !== undefined ? { note } : {}),
    });
  }

  /**
   * Delay model: keeps the gate model off `net` until `until`, dropping what it had scheduled
   * there. The metastability overlay holds the flip-flop's output while it is undecided; the
   * overlay's own events are not held.
   */
  holdNet(net: NetId | string, until: number): void {
    const id = this.resolve(net);
    this.holds.set(id, until);
    this.pending = this.pending.filter(
      (e) => !(e.net === id && e.cause === "settle" && e.time < until),
    );
  }

  /** Delay model: the time at which an input will change, so a stimulus can be timed ahead. */
  setInputAt(net: NetId | string, value: Word, time: number): void {
    const id = this.resolve(net);
    this.trace.stimuli.push({ time, phase: this.phase, net: id, value });
    this.scheduleAt(id, value, time, "stimulus");
  }

  mark(label: string): void {
    this.trace.marks.push({ time: this.time, label });
  }

  snapshot(): Snapshot {
    return {
      time: this.time,
      values: [...this.values],
      pending: [...this.pending],
      sequence: this.sequence,
    };
  }

  restore(snapshot: Snapshot): void {
    this.time = snapshot.time;
    this.values = [...snapshot.values];
    this.dirty = "all";
    this.pending = [...snapshot.pending];
    this.sequence = snapshot.sequence;
  }

  /** The delay of a component in the delay model. */
  delayOf(c: Component): number {
    return c.delay ?? this.defaultDelay;
  }

  private evaluate(c: Component, values: readonly Word[]): Record<string, Word> {
    const p = primitive(c.kind);
    const inputs: Record<string, Word> = {};
    for (const [port, net] of Object.entries(c.inputs)) inputs[port] = values[net] as Word;
    return p.evaluate(inputs, c.params);
  }

  private scheduleReaders(net: NetId): void {
    for (const c of this.readers.get(net) ?? []) {
      const outputs = this.evaluate(c, this.values);
      const at = this.time + this.delayOf(c);
      for (const [port, outNet] of Object.entries(c.outputs)) {
        const v = outputs[port];
        if (!v) continue;
        // Inertial behaviour: a later-scheduled change on the same net replaces an earlier one
        // still pending, so a glitch shorter than the gate's delay is swallowed, as in a real gate.
        this.pending = this.pending.filter((e) => !(e.net === outNet && e.cause === "settle"));
        const current = this.values[outNet] as Word;
        if ((this.holds.get(outNet) ?? -Infinity) > at) continue;
        if (!equal(current, v)) {
          this.pending.push({
            time: at,
            sequence: this.sequence++,
            net: outNet,
            value: v,
            cause: "settle",
          });
        }
      }
    }
  }

  private markUnknown(nets: readonly NetId[]): void {
    for (const net of nets) {
      const n = this.circuit.nets[net];
      if (!n) continue;
      const x = unknown(n.width);
      if (!equal(this.values[net] as Word, x)) {
        this.values[net] = x;
        this.trace.events.push({
          time: this.time,
          net,
          value: x,
          cause: "settle",
          note: "oscillation",
        });
      }
    }
  }

  private varyingWithin(states: readonly Word[][]): NetId[] {
    const out: NetId[] = [];
    const first = states[0];
    if (!first) return out;
    for (let net = 0; net < first.length; net++) {
      const v = first[net] as Word;
      if (states.some((s) => !equal(s[net] as Word, v))) out.push(net);
    }
    return out;
  }

  /** A net's share of a state's hash: its id, and the low bits of its value and of its mask. */
  private netHash(net: NetId, w: Word): number {
    // Every bit counts (Module 8): a hash of a word's low bits alone made two states of a
    // 64-bit datapath that differ above them collide, and each collision compares whole states.
    const fold = (x: bigint) => {
      let h = 0;
      for (let rest = x; rest > 0n; rest >>= 32n)
        h = (Math.imul(h, 0x01000193) ^ Number(rest & 0xffffffffn)) >>> 0;
      return h;
    };
    const v = w.width <= 24 ? Number(w.value) : fold(w.value);
    const k = w.width <= 24 ? Number(w.known) : fold(w.known);
    return (
      (Math.imul(net + 1, 0x9e3779b1) ^
        Math.imul(v + 1, 0x85ebca6b) ^
        Math.imul(k + 7, 0xc2b2ae35)) >>>
      0
    );
  }

  resolve(net: NetId | string): NetId {
    if (typeof net === "number") return net;
    const found = this.circuit.nets.find((n) => n.name === net);
    if (!found) {
      const asInput = this.circuit.inputs.find((i) => i.name === net);
      if (asInput) return asInput.net;
      const asOutput = this.circuit.outputs.find((o) => o.name === net);
      if (asOutput) return asOutput.net;
      throw new RangeError(`${this.circuit.name} has no net called ${JSON.stringify(net)}`);
    }
    return found.id;
  }
}

/**
 * Replays a trace's stimuli into a fresh simulator of the same circuit, in the same model, and
 * returns it. The caller compares traces. In the settle model the replay settles after each
 * distinct stimulus time, as the original must have; in the delay model it runs the queue dry.
 */
export function replay(circuit: Circuit, trace: Trace, options: SimulatorOptions = {}): Simulator {
  const sim = new Simulator(circuit, options);
  if (sim.timeModel === "settle") {
    let group: { time: number; phase: number } | undefined;
    for (const s of trace.stimuli) {
      if (group && (group.time !== s.time || group.phase !== s.phase)) sim.settle();
      while (sim.time < s.time) sim.tick();
      sim.setInput(s.net, s.value);
      group = { time: s.time, phase: s.phase };
    }
    sim.settle();
  } else {
    for (const s of trace.stimuli) sim.setInputAt(s.net, s.value, s.time);
    sim.run();
  }
  return sim;
}

/**
 * A trace reduced to what must be equal between an original and its replay: every net change,
 * ordered by time then net, with values as text. Event order within one instant is not part of
 * the claim; the values are.
 */
export function traceSignature(trace: Trace): string[] {
  return trace.events
    .filter((e) => e.cause !== "stimulus")
    .map((e) => ({
      t: e.time,
      n: e.net,
      v: `${e.value.value.toString(16)}/${e.value.known.toString(16)}`,
    }))
    .sort((p, q) => p.t - q.t || p.n - q.n || p.v.localeCompare(q.v))
    .map((e) => `${e.t}:${e.n}=${e.v}`);
}

/** The fan-in cone of a net: every component whose output reaches it, nearest first. */
export function cone(circuit: Circuit, net: NetId, limit = 64): Component[] {
  const out: Component[] = [];
  const seen = new Set<NetId>();
  const frontier: NetId[] = [net];
  while (frontier.length && out.length < limit) {
    const n = frontier.shift() as NetId;
    if (seen.has(n)) continue;
    seen.add(n);
    const d = driverOf(circuit, n);
    if (!d) continue;
    out.push(d);
    for (const input of Object.values(d.inputs)) frontier.push(input);
  }
  return out;
}
