// A drawing is what the learner edits; a circuit is what the simulator runs. This module goes
// both ways: a drawing compiles to a netlist with positions kept in the components' metadata,
// and a netlist (one the learner saved, or one elaborated from text) becomes a drawing again,
// laid out automatically where it carries no positions.

import { dFlipFlop, dLatch, gatedSrLatch, srLatch, type LatchOptions } from "@dd/dd-model";
import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { autoLayout } from "./layout";
import { partSpec, type PartSpec } from "./parts";

/** The two-button memory as a block: an SR latch whose only output is the light. */
function twoButtons(b: CircuitBuilder, a: NetId, bPress: NetId, options: LatchOptions): void {
  b.scope(
    options.name ?? "two-buttons",
    "two-buttons",
    (bb) => srLatch(bb, a, bPress, { ...options, name: "latch" }),
    (ports) => ({ inputs: { A: a, B: bPress }, outputs: { LIGHT: ports.q } }),
  );
}

export interface Part {
  readonly id: string;
  /** A primitive kind, a library id, `input` or `output`. */
  readonly kind: string;
  /** The pin's name in the interface, for `input` and `output`. */
  readonly name?: string;
  /** Position in grid cells. */
  readonly x: number;
  readonly y: number;
  /** For a gate that takes any number of inputs: how many it has here. Default 2. */
  readonly fanIn?: number;
}

export interface PortRef {
  readonly part: string;
  readonly port: string;
}

/** A wire runs from an output port (or an input pin) to an input port (or an output pin). */
export interface Wire {
  readonly from: PortRef;
  readonly to: PortRef;
}

export interface Drawing {
  readonly parts: readonly Part[];
  readonly wires: readonly Wire[];
}

export interface PortSpecIn {
  readonly name: string;
  readonly width?: number;
}

export interface Interface {
  readonly inputs: readonly PortSpecIn[];
  readonly outputs: readonly PortSpecIn[];
}

export const EMPTY_DRAWING: Drawing = { parts: [], wires: [] };

export function specOf(part: Part): PartSpec | undefined {
  return partSpec(part.kind, part.fanIn ?? 2);
}

/** The id a pin part has for an interface port. */
export function pinId(direction: "input" | "output", name: string): string {
  return `${direction}:${name}`;
}

/** A drawing with the interface's pins placed and nothing else, to start from. */
export function emptyDrawing(iface: Interface): Drawing {
  const parts: Part[] = [];
  iface.inputs.forEach((p, i) => {
    parts.push({ id: pinId("input", p.name), kind: "input", name: p.name, x: 0, y: 1 + i * 3 });
  });
  iface.outputs.forEach((p, i) => {
    parts.push({ id: pinId("output", p.name), kind: "output", name: p.name, x: 16, y: 1 + i * 3 });
  });
  return { parts, wires: [] };
}

/** Pins the interface needs that the drawing lacks are added; pins it has that are not in the interface stay. */
export function withInterface(drawing: Drawing, iface: Interface): Drawing {
  const have = new Set(drawing.parts.map((p) => p.id));
  const extra = emptyDrawing(iface).parts.filter((p) => !have.has(p.id));
  return extra.length ? { ...drawing, parts: [...drawing.parts, ...extra] } : drawing;
}

/** Problems a drawing has that the compiler can still work around, as sentences. */
export function drawingWarnings(drawing: Drawing): string[] {
  const out: string[] = [];
  const driven = new Set(drawing.wires.map((w) => `${w.to.part}.${w.to.port}`));
  for (const part of drawing.parts) {
    const spec = specOf(part);
    if (!spec) {
      out.push(`${part.id} is a kind of part this course does not know (${part.kind})`);
      continue;
    }
    for (const port of spec.inputs) {
      if (!driven.has(`${part.id}.${port}`)) {
        out.push(
          part.kind === "output"
            ? `output ${part.name ?? part.id} is not driven by anything`
            : `${part.id} input ${port} is not connected`,
        );
      }
    }
  }
  return out;
}

export interface Compiled {
  readonly circuit?: Circuit;
  /** Why no circuit could be made, as sentences. */
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * The netlist for a drawing. An unconnected gate input or an undriven output pin reads X (an
 * `open`), so the circuit still runs, can be stored half-finished, and the diagnosis can point at
 * the gate; `undrivenOutputs` names the pins a grader must refuse to test.
 */
export function compileDrawing(drawing: Drawing, name = "drawing"): Compiled {
  const errors: string[] = [];
  const warnings = drawingWarnings(drawing);
  const b = new CircuitBuilder(name);
  const parts = new Map(drawing.parts.map((p) => [p.id, p]));
  const sourceOf = new Map<string, PortRef>();
  for (const w of drawing.wires) {
    const key = `${w.to.part}.${w.to.port}`;
    if (sourceOf.has(key)) errors.push(`${key} is driven by two wires`);
    sourceOf.set(key, w.from);
    if (!parts.has(w.from.part) || !parts.has(w.to.part)) {
      errors.push(`a wire refers to a part that is not in the drawing`);
    }
  }
  // Every output port gets its net first, so wires can be resolved in any order, loops included.
  const outputNet = new Map<string, NetId>();
  for (const part of drawing.parts) {
    const spec = specOf(part);
    if (!spec) {
      errors.push(`${part.id} is a kind of part this course does not know (${part.kind})`);
      continue;
    }
    if (part.kind === "input") {
      const pinName = part.name ?? part.id;
      outputNet.set(`${part.id}.y`, b.input(pinName, 1, { pin: { x: part.x, y: part.y } }));
    } else {
      for (const port of spec.outputs) {
        outputNet.set(`${part.id}.${port}`, b.net(`${part.id}.${port}`));
      }
    }
  }
  if (errors.length) return { errors, warnings };

  const inputNet = (part: Part, port: string): NetId => {
    const src = sourceOf.get(`${part.id}.${port}`);
    const net = src ? outputNet.get(`${src.part}.${src.port}`) : undefined;
    if (net !== undefined) return net;
    const open = b.net(`${part.id}.${port}.open`);
    b.component("open", {}, { y: open }, { name: `open_${part.id}_${port}`, params: { width: 1 } });
    return open;
  };

  for (const part of drawing.parts) {
    const spec = specOf(part);
    if (!spec || part.kind === "input") continue;
    const meta = { layout: { x: part.x, y: part.y } };
    if (part.kind === "output") {
      const pinName = part.name ?? part.id;
      const src = sourceOf.get(`${part.id}.a`);
      const net = src ? outputNet.get(`${src.part}.${src.port}`) : undefined;
      if (net === undefined) {
        // Nothing drives the pin: it reads X, and the grader refuses to test it. The drawing is
        // still a circuit, so half-finished work can be stored and shown.
        const open = b.net(`${pinName}.open`);
        b.component(
          "open",
          {},
          { y: open },
          { name: `open_output_${pinName}`, params: { width: 1 } },
        );
        b.output(pinName, open);
        continue;
      }
      b.output(pinName, net);
      continue;
    }
    if (spec.role === "gate") {
      const inputs: Record<string, NetId> = {};
      for (const port of spec.inputs) inputs[port] = inputNet(part, port);
      const y = outputNet.get(`${part.id}.y`) as NetId;
      b.component(part.kind, inputs, { y }, { name: part.id, meta });
      continue;
    }
    // A composite from the library, wired through its ports.
    const ins = Object.fromEntries(spec.inputs.map((port) => [port, inputNet(part, port)]));
    const q = outputNet.get(`${part.id}.Q`) ?? outputNet.get(`${part.id}.LIGHT`);
    const qb = outputNet.get(`${part.id}.Qb`);
    const outs = { ...(q !== undefined ? { q } : {}), ...(qb !== undefined ? { qb } : {}) };
    const opts = { name: part.id, ...outs };
    switch (part.kind) {
      case "sr-latch":
        srLatch(b, ins["S"] as NetId, ins["R"] as NetId, opts);
        break;
      case "two-buttons":
        twoButtons(b, ins["A"] as NetId, ins["B"] as NetId, opts);
        break;
      case "gated-sr-latch":
        gatedSrLatch(b, ins["S"] as NetId, ins["R"] as NetId, ins["EN"] as NetId, opts);
        break;
      case "d-latch":
        dLatch(b, ins["D"] as NetId, ins["EN"] as NetId, opts);
        break;
      case "dff":
        dFlipFlop(b, ins["D"] as NetId, ins["CLK"] as NetId, opts);
        break;
      case "dff-reset":
        dFlipFlop(b, ins["D"] as NetId, ins["CLK"] as NetId, {
          ...opts,
          reset: ins["RST"] as NetId,
        });
        break;
      case "dff-reset-enable":
        dFlipFlop(b, ins["D"] as NetId, ins["CLK"] as NetId, {
          ...opts,
          reset: ins["RST"] as NetId,
          enable: ins["EN"] as NetId,
        });
        break;
      default:
        errors.push(`${part.id} (${part.kind}) cannot be placed in a drawing`);
        continue;
    }
  }
  if (errors.length) return { errors, warnings };
  let circuit: Circuit;
  try {
    circuit = b.build();
  } catch (error) {
    return { errors: [error instanceof Error ? error.message : String(error)], warnings };
  }
  return { circuit: withPositions(circuit, drawing), errors: [], warnings };
}

/** The outputs of a compiled drawing that nothing drives, by name. */
export function undrivenOutputs(circuit: Circuit): string[] {
  return circuit.outputs
    .filter((o) => circuit.components.some((c) => c.kind === "open" && c.outputs["y"] === o.net))
    .map((o) => o.name);
}

/** Writes the parts' positions into the composites' and output pins' metadata. */
function withPositions(circuit: Circuit, drawing: Drawing): Circuit {
  const at = new Map(drawing.parts.map((p) => [p.id, { x: p.x, y: p.y }]));
  const outputPins = new Map(
    drawing.parts
      .filter((p) => p.kind === "output")
      .map((p) => [p.name ?? p.id, { x: p.x, y: p.y }]),
  );
  return {
    ...circuit,
    composites: circuit.composites.map((c) => {
      const pos = c.path.includes("/") ? undefined : at.get(c.path);
      return pos ? { ...c, meta: { ...(c.meta ?? {}), layout: pos } } : c;
    }),
    nets: circuit.nets.map((n) => {
      const pins: Record<string, { x: number; y: number }> = {};
      for (const o of circuit.outputs) {
        const pos = o.net === n.id ? outputPins.get(o.name) : undefined;
        if (pos) pins[o.name] = pos;
      }
      return Object.keys(pins).length ? { ...n, meta: { ...(n.meta ?? {}), outputPins: pins } } : n;
    }),
  };
}

/**
 * The drawing for a circuit: its top-level components and composites as parts, its interface as
 * pins, its nets as wires. Positions come from the metadata when present, else from the layout.
 */
export function circuitToDrawing(circuit: Circuit): Drawing {
  const parts: Part[] = [];
  const wires: Wire[] = [];
  const driverPort = new Map<NetId, PortRef>();
  const readerPorts = new Map<NetId, PortRef[]>();
  const addReader = (net: NetId, ref: PortRef) => {
    const list = readerPorts.get(net) ?? [];
    list.push(ref);
    readerPorts.set(net, list);
  };
  const topComposites = circuit.composites.filter((c) => !c.path.includes("/"));
  const layoutOf = (meta: Readonly<Record<string, unknown>> | undefined) => {
    const l = meta?.["layout"] as { x?: number; y?: number } | undefined;
    return l && typeof l.x === "number" && typeof l.y === "number" ? { x: l.x, y: l.y } : undefined;
  };
  const unplaced: Part[] = [];
  const push = (part: Omit<Part, "x" | "y">, at: { x: number; y: number } | undefined) => {
    const p: Part = { ...part, x: at?.x ?? 0, y: at?.y ?? 0 };
    parts.push(p);
    if (!at) unplaced.push(p);
  };

  for (const input of circuit.inputs) {
    const id = pinId("input", input.name);
    const pin = circuit.nets[input.net]?.meta?.["pin"] as { x?: number; y?: number } | undefined;
    push(
      { id, kind: "input", name: input.name },
      pin && typeof pin.x === "number" && typeof pin.y === "number"
        ? { x: pin.x, y: pin.y }
        : undefined,
    );
    driverPort.set(input.net, { part: id, port: "y" });
  }
  for (const c of circuit.components) {
    if (c.path.includes("/")) continue;
    // An open is an unconnected input: in a drawing that is simply no wire.
    if (c.kind === "open") continue;
    const fanIn = Object.keys(c.inputs).length;
    push({ id: c.name, kind: c.kind, ...(fanIn > 2 ? { fanIn } : {}) }, layoutOf(c.meta));
    for (const [port, net] of Object.entries(c.outputs))
      driverPort.set(net, { part: c.name, port });
    for (const [port, net] of Object.entries(c.inputs)) addReader(net, { part: c.name, port });
  }
  for (const c of topComposites) {
    push({ id: c.name, kind: c.kind }, layoutOf(c.meta));
    for (const [port, net] of Object.entries(c.outputs))
      driverPort.set(net, { part: c.name, port });
    for (const [port, net] of Object.entries(c.inputs)) addReader(net, { part: c.name, port });
  }
  for (const output of circuit.outputs) {
    const id = pinId("output", output.name);
    const meta = circuit.nets[output.net]?.meta?.["outputPins"] as
      Record<string, { x?: number; y?: number }> | undefined;
    const pin = meta?.[output.name];
    push(
      { id, kind: "output", name: output.name },
      pin && typeof pin.x === "number" && typeof pin.y === "number"
        ? { x: pin.x, y: pin.y }
        : undefined,
    );
    addReader(output.net, { part: id, port: "a" });
  }
  for (const [net, readers] of readerPorts) {
    const from = driverPort.get(net);
    if (!from) continue;
    for (const to of readers) wires.push({ from, to });
  }
  const drawing: Drawing = { parts, wires };
  return unplaced.length ? autoLayout(drawing, new Set(unplaced.map((p) => p.id))) : drawing;
}
