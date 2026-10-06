// Copyright © 2026 Chris Snow

// The netlist.
//
// A circuit is plain data: nets (named wires of a width), components (a kind, a name, a path in
// the hierarchy, and which net each port is on), and which nets are the circuit's inputs and
// outputs. Plain data so it can be stored in the learner's browser, sent to the HDL generator,
// drawn by a view, and compared with a reference, all without the simulator.
//
// The hierarchy is in the paths. A D flip-flop built from two latches built from gates has
// components at `dff/master/nor1` and so on; `hierarchy()` turns the paths back into a tree, which
// is what a drill-down view walks. The simulator sees only the leaves.

import type { Width } from "./values";

export type NetId = number;
export type ComponentId = number;

export interface Net {
  readonly id: NetId;
  readonly name: string;
  readonly width: Width;
  /** Where a view may put the label, and anything else a view wants to remember. */
  readonly meta?: Readonly<Record<string, unknown>>;
}

export interface Component {
  readonly id: ComponentId;
  /** A primitive kind the simulator evaluates (see primitives.ts). */
  readonly kind: string;
  /** The instance name within its parent: `nor1`. */
  readonly name: string;
  /** The full path in the hierarchy: `dff/master/nor1`. The leaf is `name`. */
  readonly path: string;
  readonly inputs: Readonly<Record<string, NetId>>;
  readonly outputs: Readonly<Record<string, NetId>>;
  /** Propagation delay in the delay time model, in time units. Absent means the default. */
  readonly delay?: number;
  readonly params?: Readonly<Record<string, number | string | boolean>>;
  /** Position and anything else a view wants to remember. The simulator never reads it. */
  readonly meta?: Readonly<Record<string, unknown>>;
}

export interface PortRef {
  readonly name: string;
  readonly net: NetId;
}

export interface Circuit {
  readonly name: string;
  readonly nets: readonly Net[];
  readonly components: readonly Component[];
  /** Nets driven from outside the circuit. */
  readonly inputs: readonly PortRef[];
  /** Nets the outside reads. */
  readonly outputs: readonly PortRef[];
  /**
   * Composite instances in the hierarchy, by path, with the kind of thing each is (`dff`,
   * `d-latch`) and the ports it exposes, so a view can draw a composite closed, as one box.
   */
  readonly composites: readonly CompositeDef[];
}

export interface CompositeDef {
  readonly path: string;
  readonly kind: string;
  readonly name: string;
  readonly inputs: Readonly<Record<string, NetId>>;
  readonly outputs: Readonly<Record<string, NetId>>;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/** The nets a composite exposes, so a view can draw it closed, as one box. */
export interface ScopePorts {
  inputs?: Record<string, NetId>;
  outputs?: Record<string, NetId>;
  meta?: Record<string, unknown>;
}

export interface GateOptions {
  name?: string;
  delay?: number;
  width?: Width;
  meta?: Record<string, unknown>;
  /** Reuse an existing net as the output instead of creating one. */
  output?: NetId;
}

/**
 * Builds a circuit. Nets are created first or on the fly; gates and other primitives connect
 * them; `scope` opens a level of hierarchy so paths nest. `build()` validates: one driver per
 * net, every net either driven or an input, widths that agree.
 */
export class CircuitBuilder {
  private nets: Net[] = [];
  private components: Component[] = [];
  private inputs: PortRef[] = [];
  private outputs: PortRef[] = [];
  private composites: CompositeDef[] = [];
  private prefix: string[] = [];
  private counters = new Map<string, number>();

  constructor(readonly name: string) {}

  /** A new net. Names are made unique within the circuit by suffixing when they repeat. */
  net(name: string, width: Width = 1, meta?: Record<string, unknown>): NetId {
    const id = this.nets.length;
    const full = this.unique(this.qualify(name));
    this.nets.push(meta ? { id, name: full, width, meta } : { id, name: full, width });
    return id;
  }

  /** A primary input: a net driven from outside. */
  input(name: string, width: Width = 1, meta?: Record<string, unknown>): NetId {
    const id = this.net(name, width, meta);
    this.inputs.push({ name: this.qualify(name), net: id });
    return id;
  }

  /** Marks a net as a primary output, under `name`. */
  output(name: string, net: NetId): void {
    this.outputs.push({ name: this.qualify(name), net });
  }

  /** A primitive with named ports, returning the component id. */
  component(
    kind: string,
    inputs: Record<string, NetId>,
    outputs: Record<string, NetId>,
    options: {
      name?: string;
      delay?: number;
      params?: Component["params"];
      meta?: Record<string, unknown>;
    } = {},
  ): ComponentId {
    const id = this.components.length;
    const name = options.name ?? this.autoName(kind);
    const path = this.qualify(name);
    const component: Component = {
      id,
      kind,
      name,
      path,
      inputs: { ...inputs },
      outputs: { ...outputs },
      ...(options.delay !== undefined ? { delay: options.delay } : {}),
      ...(options.params ? { params: { ...options.params } } : {}),
      ...(options.meta ? { meta: { ...options.meta } } : {}),
    };
    this.components.push(component);
    return id;
  }

  /**
   * A gate: inputs named `a`, `b`, ... in order, one output named `y`. Returns the output net.
   * The gate's width is the inputs' width.
   */
  gate(kind: string, inputs: readonly NetId[], options: GateOptions = {}): NetId {
    if (inputs.length === 0) throw new RangeError(`a ${kind} gate needs at least one input`);
    const width = options.width ?? this.widthOf(inputs[0] as NetId);
    for (const n of inputs) {
      if (this.widthOf(n) !== width) {
        throw new RangeError(`${kind} gate inputs differ in width (${this.nets[n]?.name})`);
      }
    }
    const name = options.name ?? this.autoName(kind);
    const out = options.output ?? this.net(`${name}.y`, width);
    const ports: Record<string, NetId> = {};
    inputs.forEach((n, i) => {
      ports[portName(i)] = n;
    });
    this.component(
      kind,
      ports,
      { y: out },
      {
        name,
        ...(options.delay !== undefined ? { delay: options.delay } : {}),
        ...(options.meta ? { meta: options.meta } : {}),
      },
    );
    return out;
  }

  not(a: NetId, options?: GateOptions): NetId {
    return this.gate("not", [a], options);
  }
  and(inputs: readonly NetId[], options?: GateOptions): NetId {
    return this.gate("and", inputs, options);
  }
  or(inputs: readonly NetId[], options?: GateOptions): NetId {
    return this.gate("or", inputs, options);
  }
  nand(inputs: readonly NetId[], options?: GateOptions): NetId {
    return this.gate("nand", inputs, options);
  }
  nor(inputs: readonly NetId[], options?: GateOptions): NetId {
    return this.gate("nor", inputs, options);
  }
  xor(inputs: readonly NetId[], options?: GateOptions): NetId {
    return this.gate("xor", inputs, options);
  }

  /**
   * Opens a level of hierarchy. Everything created inside `body` has `name` prefixed to its
   * path; `ports` names the nets the composite exposes, so a view can draw it as one box.
   */
  scope<T>(
    name: string,
    kind: string,
    body: (b: this) => T,
    ports: ScopePorts | ((result: T) => ScopePorts) = {},
  ): T {
    const unique = this.unique(this.qualify(name)).split("/").pop() ?? name;
    this.prefix.push(unique);
    const path = this.prefix.join("/");
    const result = body(this);
    this.prefix.pop();
    const resolved = typeof ports === "function" ? ports(result) : ports;
    this.composites.push({
      path,
      kind,
      name: unique,
      inputs: { ...(resolved.inputs ?? {}) },
      outputs: { ...(resolved.outputs ?? {}) },
      ...(resolved.meta ? { meta: { ...resolved.meta } } : {}),
    });
    return result;
  }

  /** Attaches view metadata (a position, a label) to an existing component by id. */
  place(component: ComponentId, meta: Record<string, unknown>): void {
    const c = this.components[component];
    if (!c) throw new RangeError(`no component ${component}`);
    this.components[component] = { ...c, meta: { ...(c.meta ?? {}), ...meta } };
  }

  widthOf(net: NetId): Width {
    const n = this.nets[net];
    if (!n) throw new RangeError(`no net ${net}`);
    return n.width;
  }

  build(): Circuit {
    const circuit: Circuit = {
      name: this.name,
      nets: [...this.nets],
      components: [...this.components],
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      composites: [...this.composites],
    };
    const problems = validate(circuit);
    if (problems.length) {
      throw new Error(`circuit ${this.name} is not well formed:\n  ${problems.join("\n  ")}`);
    }
    return circuit;
  }

  private qualify(name: string): string {
    return this.prefix.length ? `${this.prefix.join("/")}/${name}` : name;
  }

  private unique(full: string): string {
    const taken = new Set(this.nets.map((n) => n.name));
    for (const c of this.composites) taken.add(c.path);
    if (!taken.has(full)) return full;
    let i = 2;
    while (taken.has(`${full}${i}`)) i++;
    return `${full}${i}`;
  }

  private autoName(kind: string): string {
    const key = `${this.prefix.join("/")}:${kind}`;
    const n = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, n);
    return `${kind}${n}`;
  }
}

/** Gate input ports are a, b, c, ... */
export function portName(index: number): string {
  if (index < 26) return String.fromCharCode(97 + index);
  return `in${index}`;
}

/** Every reason a circuit cannot be simulated, as plain sentences. Empty when it can. */
export function validate(circuit: Circuit): string[] {
  const problems: string[] = [];
  const drivers = new Map<NetId, string>();
  for (const port of circuit.inputs) drivers.set(port.net, `input ${port.name}`);
  for (const c of circuit.components) {
    for (const [port, net] of Object.entries(c.outputs)) {
      const who = `${c.path}.${port}`;
      const existing = drivers.get(net);
      if (existing !== undefined) {
        problems.push(
          `net ${circuit.nets[net]?.name ?? net} has two drivers: ${existing} and ${who}`,
        );
      } else {
        drivers.set(net, who);
      }
    }
  }
  for (const net of circuit.nets) {
    if (!drivers.has(net.id)) {
      const read = circuit.components.some((c) => Object.values(c.inputs).includes(net.id));
      const isOutput = circuit.outputs.some((o) => o.net === net.id);
      if (read || isOutput) problems.push(`net ${net.name} is read but nothing drives it`);
    }
  }
  for (const c of circuit.components) {
    for (const [port, net] of [...Object.entries(c.inputs), ...Object.entries(c.outputs)]) {
      if (!circuit.nets[net]) problems.push(`${c.path}.${port} names a net that does not exist`);
    }
  }
  return problems;
}

export interface HierarchyNode {
  readonly path: string;
  readonly name: string;
  /** A composite's kind, or a primitive's kind at a leaf. */
  readonly kind: string;
  readonly leaf: boolean;
  readonly component?: Component;
  readonly composite?: CompositeDef;
  readonly children: HierarchyNode[];
}

/** The component tree a drill-down walks, from the paths. */
export function hierarchy(circuit: Circuit): HierarchyNode {
  const root: HierarchyNode = {
    path: "",
    name: circuit.name,
    kind: "circuit",
    leaf: false,
    children: [],
  };
  const byPath = new Map<string, HierarchyNode>([["", root]]);
  const composites = new Map(circuit.composites.map((c) => [c.path, c]));
  const ensure = (path: string): HierarchyNode => {
    const found = byPath.get(path);
    if (found) return found;
    const parts = path.split("/");
    const name = parts[parts.length - 1] ?? path;
    const parent = ensure(parts.slice(0, -1).join("/"));
    const composite = composites.get(path);
    const node: HierarchyNode = {
      path,
      name,
      kind: composite?.kind ?? "group",
      leaf: false,
      ...(composite ? { composite } : {}),
      children: [],
    };
    parent.children.push(node);
    byPath.set(path, node);
    return node;
  };
  for (const c of circuit.composites) ensure(c.path);
  for (const c of circuit.components) {
    const parentPath = c.path.split("/").slice(0, -1).join("/");
    const parent = ensure(parentPath);
    parent.children.push({
      path: c.path,
      name: c.name,
      kind: c.kind,
      leaf: true,
      component: c,
      children: [],
    });
  }
  return root;
}

/** The components whose path starts with `path/`, or every component for the root. */
export function componentsUnder(circuit: Circuit, path: string): Component[] {
  if (path === "") return [...circuit.components];
  return circuit.components.filter((c) => c.path === path || c.path.startsWith(`${path}/`));
}

/** The net named `name`, or undefined. */
export function netByName(circuit: Circuit, name: string): Net | undefined {
  return circuit.nets.find((n) => n.name === name);
}

/** The component that drives `net`, or undefined for an input. */
export function driverOf(circuit: Circuit, net: NetId): Component | undefined {
  return circuit.components.find((c) => Object.values(c.outputs).includes(net));
}

/** The components that read `net`. */
export function readersOf(circuit: Circuit, net: NetId): Component[] {
  return circuit.components.filter((c) => Object.values(c.inputs).includes(net));
}
