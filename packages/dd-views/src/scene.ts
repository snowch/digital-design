// The geometry of a drawing on screen: where each part, port and wire goes, in pixels.
// Shared by the circuit view (read-only) and the builder (editable), so both draw the same way.

import type { Circuit, NetId } from "@dd/sim";

import {
  circuitToDrawing,
  specOf,
  type Drawing,
  type Part,
  type PortRef,
  type Wire,
} from "./drawing";
import { PART_W, partHeight } from "./symbols";

export const CELL = 20;
export const PIN_W = 44;
export const PIN_H = 24;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PartBox {
  readonly part: Part;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly label: string;
  readonly inputs: readonly { readonly port: string; readonly at: Point }[];
  readonly outputs: readonly { readonly port: string; readonly at: Point }[];
}

export interface WirePath {
  readonly from: PortRef;
  readonly to: PortRef;
  readonly d: string;
  readonly start: Point;
  readonly end: Point;
}

export interface Scene {
  readonly boxes: readonly PartBox[];
  readonly wires: readonly WirePath[];
  readonly width: number;
  readonly height: number;
}

export function partBox(part: Part): PartBox {
  const spec = specOf(part);
  const inputs = spec?.inputs ?? [];
  const outputs = spec?.outputs ?? [];
  const isPin = part.kind === "input" || part.kind === "output";
  const w = isPin ? PIN_W : PART_W;
  const h = isPin ? PIN_H : partHeight(part.kind, Math.max(inputs.length, outputs.length));
  const x = part.x * CELL;
  const y = part.y * CELL;
  // Ports sit on whole pixels, so a wire runs along a pixel row and draws sharp.
  const spread = (n: number, i: number) => Math.round(y + (h * (i + 1)) / (n + 1));
  return {
    part,
    x,
    y,
    w,
    h,
    label: isPin ? (part.name ?? part.id) : (spec?.label ?? part.kind),
    inputs: inputs.map((port, i) => ({ port, at: { x, y: spread(inputs.length, i) } })),
    outputs: outputs.map((port, i) => ({ port, at: { x: x + w, y: spread(outputs.length, i) } })),
  };
}

export function portPoint(boxes: ReadonlyMap<string, PartBox>, ref: PortRef): Point | undefined {
  const box = boxes.get(ref.part);
  if (!box) return undefined;
  return (
    box.outputs.find((p) => p.port === ref.port)?.at ??
    box.inputs.find((p) => p.port === ref.port)?.at
  );
}

/**
 * An orthogonal route from an output to an input. A forward wire goes right to its own vertical
 * track, down or up, then right; a backward wire (feedback) drops to its own channel under the
 * parts, runs left, and rises. Tracks and channels are allotted so that no two wires share a
 * segment: wires leaving the same column take verticals 6 pixels apart, and every backward wire
 * has a channel of its own, 8 pixels apart.
 */
export function route(
  from: Point,
  to: Point,
  track: number,
  channel: number | undefined,
  floor: number,
): string {
  if (channel === undefined) {
    const midX = Math.min(from.x + 8 + track * 6, to.x - 4);
    return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`;
  }
  const dropX = from.x + 8 + track * 6;
  const channelY = floor + 14 + channel * 8;
  const riseX = to.x - 8 - channel * 6;
  return `M ${from.x} ${from.y} H ${dropX} V ${channelY} H ${riseX} V ${to.y} H ${to.x}`;
}

export function sceneOf(drawing: Drawing): Scene {
  const boxes = drawing.parts.map(partBox);
  const byId = new Map(boxes.map((b) => [b.part.id, b]));
  const floor = boxes.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const placed = drawing.wires
    .map((w) => {
      const start = portPoint(byId, w.from);
      const end = portPoint(byId, w.to);
      return start && end ? { w, start, end } : undefined;
    })
    .filter((x): x is { w: Wire; start: Point; end: Point } => x !== undefined);
  // Vertical tracks: wires leaving the same column, in order of where they start and end.
  const byColumn = new Map<number, typeof placed>();
  for (const p of placed) {
    const list = byColumn.get(p.start.x) ?? [];
    list.push(p);
    byColumn.set(p.start.x, list);
  }
  const track = new Map<(typeof placed)[number], number>();
  for (const list of byColumn.values()) {
    list.sort((a, b) => a.start.y - b.start.y || a.end.y - b.end.y);
    list.forEach((p, i) => track.set(p, i));
  }
  let channels = 0;
  const wires: WirePath[] = placed.map((p) => {
    const backward = p.end.x < p.start.x + 20;
    const channel = backward ? channels++ : undefined;
    return {
      from: p.w.from,
      to: p.w.to,
      start: p.start,
      end: p.end,
      d: route(p.start, p.end, track.get(p) ?? 0, channel, floor),
    };
  });
  const width = boxes.reduce((m, b) => Math.max(m, b.x + b.w), 0) + 40;
  const height = floor + 14 + channels * 8 + 16;
  return { boxes, wires, width, height };
}

/** The circuit seen from inside a composite (or the top level when `scope` is empty). */
export function subCircuit(circuit: Circuit, scope: string): Circuit {
  if (scope === "") return circuit;
  const composite = circuit.composites.find((c) => c.path === scope);
  if (!composite) return circuit;
  const prefix = `${scope}/`;
  const strip = (path: string) => path.slice(prefix.length);
  // Pin positions belong to the drawing they were placed in: a block's ports are the outer
  // circuit's nets, and the outer pins' places mean nothing inside the block.
  const unplaced = circuit.nets.map((n) => {
    if (!n.meta || !("pin" in n.meta || "outputPins" in n.meta)) return n;
    const { pin: _pin, outputPins: _outputPins, ...meta } = n.meta;
    return { ...n, meta };
  });
  return {
    name: composite.name,
    nets: unplaced,
    components: circuit.components
      .filter((c) => c.path.startsWith(prefix))
      .map((c) => ({ ...c, path: strip(c.path) })),
    composites: circuit.composites
      .filter((c) => c.path.startsWith(prefix))
      .map((c) => ({ ...c, path: strip(c.path) })),
    inputs: Object.entries(composite.inputs).map(([name, net]) => ({ name, net })),
    outputs: Object.entries(composite.outputs).map(([name, net]) => ({ name, net })),
  };
}

/** The net a drawn wire carries, from the sub-circuit it was drawn from. */
export function netOfWire(circuit: Circuit, from: PortRef): NetId | undefined {
  if (from.part.startsWith("input:")) {
    return circuit.inputs.find((i) => i.name === from.part.slice("input:".length))?.net;
  }
  const component = circuit.components.find((c) => c.path === from.part);
  if (component) return component.outputs[from.port];
  const composite = circuit.composites.find((c) => c.path === from.part);
  return composite?.outputs[from.port];
}

/** A drawing of the circuit at `scope`, laid out where it carries no positions. */
export function drawingAt(circuit: Circuit, scope: string): { drawing: Drawing; circuit: Circuit } {
  const sub = subCircuit(circuit, scope);
  return { drawing: circuitToDrawing(sub), circuit: sub };
}
