// The geometry of a drawing on screen: where each part, port and wire goes, in pixels.
// Shared by the circuit view (read-only) and the builder (editable), so both draw the same way.

import { INSIDE, placed } from "@dd/dd-model";
import type { Circuit, NetId } from "@dd/sim";

import {
  circuitToDrawing,
  specOf,
  type Drawing,
  type Part,
  type PortRef,
  type Wire,
} from "./drawing";
import { nameRepeatsKind } from "./parts";
import { CELL, PIN_H, PORT_PITCH, isShaped, partHeight, partWidth, pinWidth } from "./symbols";

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
  /** Where this wire's net branches on its trunk: a dot there tells a branch from a crossing. */
  readonly junctions: readonly Point[];
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
  const w = isPin ? pinWidth(part.name ?? part.id) : partWidth(part.kind, inputs, outputs);
  const h = isPin ? PIN_H : partHeight(Math.max(inputs.length, outputs.length));
  const x = part.x * CELL;
  const y = part.y * CELL;
  // Ports sit a grid cell apart, centred on the part, so they all lie on one 10-pixel lattice
  // (symbols.tsx says why); on whole pixels, so a wire runs along a pixel row and draws sharp.
  const spread = (n: number, i: number) => Math.round(y + h / 2 + PORT_PITCH * (i - (n - 1) / 2));
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

/** A part's outline, a pixel inside its edge: no wire may pass through it. */
interface Obstacle {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

type Segment = readonly [Point, Point];

const segmentsOf = (points: readonly Point[]): Segment[] =>
  points.slice(1).map((b, k) => [points[k]!, b] as const);

function crossesPart(points: readonly Point[], obstacles: readonly Obstacle[]): boolean {
  for (const [a, b] of segmentsOf(points)) {
    for (const o of obstacles) {
      const across =
        a.y === b.y
          ? a.y > o.y1 && a.y < o.y2 && Math.max(a.x, b.x) > o.x1 && Math.min(a.x, b.x) < o.x2
          : a.x > o.x1 && a.x < o.x2 && Math.max(a.y, b.y) > o.y1 && Math.min(a.y, b.y) < o.y2;
      if (across) return true;
    }
  }
  return false;
}

/** Whether two straight pieces lie along the same line for more than a pixel. */
function alongside([a, b]: Segment, [c, d]: Segment): boolean {
  if (a.y === b.y && c.y === d.y && a.y === c.y)
    return (
      Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) -
        Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) >
      1
    );
  if (a.x === b.x && c.x === d.x && a.x === c.x)
    return (
      Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) -
        Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) >
      1
    );
  return false;
}

/**
 * What a wire may not pass through at a part: the part itself, and the words a drawing writes
 * beside it, a block's label above it and a part's name below it (CircuitView places both; about
 * 7.2 pixels a character in the drawing's 12-pixel mono face).
 */
function obstaclesOf(b: PartBox): Obstacle[] {
  const isPin = b.part.kind === "input" || b.part.kind === "output";
  const around = (text: string, y1: number, y2: number) => {
    const half = (text.length * 7.2) / 2 + 2;
    return { x1: b.x + b.w / 2 - half, y1, x2: b.x + b.w / 2 + half, y2 };
  };
  const named = !nameRepeatsKind(b.part.id, b.part.kind) && !b.part.id.startsWith("fault/");
  return [
    { x1: b.x + 1, y1: b.y + 1, x2: b.x + b.w - 1, y2: b.y + b.h - 1 },
    ...(!isPin && !isShaped(b.part.kind) ? [around(b.label, b.y - 20, b.y - 4)] : []),
    ...(!isPin && named ? [around(b.part.id, b.y + b.h + 1, b.y + b.h + 16)] : []),
  ];
}

/** An orthogonal path through its corners, as SVG steps: H for across, V for up or down. */
function pathOf(points: readonly Point[]): string {
  const [first, ...rest] = points;
  if (!first) return "";
  let d = `M ${first.x} ${first.y}`;
  let at = first;
  for (const p of rest) {
    if (p.x === at.x && p.y === at.y) continue;
    d += p.y === at.y ? ` H ${p.x}` : ` V ${p.y}`;
    at = p;
  }
  return d;
}

/** Every point where three or more ways meet on one net's wires: where the net branches. */
function branchPoints(routes: readonly (readonly Point[])[]): Point[] {
  const segments = routes.flatMap((r) => r.slice(1).map((b, k) => [r[k]!, b] as const));
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const p of routes.flat()) {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ways = new Set<string>();
    for (const [a, b] of segments) {
      if (a.y === b.y && a.y === p.y && Math.min(a.x, b.x) <= p.x && Math.max(a.x, b.x) >= p.x) {
        if (Math.min(a.x, b.x) < p.x) ways.add("left");
        if (Math.max(a.x, b.x) > p.x) ways.add("right");
      } else if (
        a.x === b.x &&
        a.x === p.x &&
        Math.min(a.y, b.y) <= p.y &&
        Math.max(a.y, b.y) >= p.y
      ) {
        if (Math.min(a.y, b.y) < p.y) ways.add("up");
        if (Math.max(a.y, b.y) > p.y) ways.add("down");
      }
    }
    if (ways.size >= 3) out.push(p);
  }
  return out;
}

/**
 * The scene: every part's box and every wire's route. A wire takes the first route that passes
 * through no part and runs along no other net's wire: across to its net's trunk, a vertical just
 * right of the port it leaves, then up or down and across into its input; or across first and up
 * or down just before the part it enters; or a dogleg, up or down the trunk to the nearest clear
 * row, across it, and up or down just before the part it enters; or, last, down to its net's
 * channel under all the parts, along it, and up just before the part it enters. A wire fed back
 * to a part on its left always takes a channel of its own. The wires of one net leaving a port
 * share its trunk, as a schematic draws one line that branches, and a dot marks each branch; ports
 * in the same column take trunks 6 pixels apart, wires entering the same column turn 6 pixels
 * apart, and channels are 8 pixels apart.
 */
export function sceneOf(drawing: Drawing): Scene {
  const boxes = drawing.parts.map(partBox);
  const byId = new Map(boxes.map((b) => [b.part.id, b]));
  const floor = boxes.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const obstacles = boxes.flatMap(obstaclesOf);
  const placed = drawing.wires
    .map((w) => {
      const start = portPoint(byId, w.from);
      const end = portPoint(byId, w.to);
      return start && end ? { w, start, end } : undefined;
    })
    .filter((x): x is { w: Wire; start: Point; end: Point } => x !== undefined);
  type Placed = (typeof placed)[number];
  // Trunks: the wires leaving one port (one net) share a vertical; the ports leaving the same
  // column take verticals in order of where they start.
  const byColumn = new Map<number, Map<number, Placed[]>>();
  for (const p of placed) {
    const column = byColumn.get(p.start.x) ?? new Map<number, Placed[]>();
    column.set(p.start.y, [...(column.get(p.start.y) ?? []), p]);
    byColumn.set(p.start.x, column);
  }
  const track = new Map<Placed, number>();
  const groups: Placed[][] = [];
  for (const column of byColumn.values()) {
    [...column.entries()]
      .sort(([a], [b]) => a - b)
      .forEach(([, group], i) => {
        for (const p of group) track.set(p, i);
        groups.push(group);
      });
  }
  const netOf = (p: Placed) => `${p.start.x},${p.start.y}`;
  const trunkOf = (p: Placed) => p.start.x + 8 + (track.get(p) ?? 0) * 6;
  // What is drawn so far, by net: first every port's stretch out to its trunk, then each route.
  const drawn: { net: string; segment: Segment }[] = groups.flatMap((group) => {
    const first = group[0];
    if (!first) return [];
    const stub: Segment = [first.start, { x: trunkOf(first), y: first.start.y }];
    return [{ net: netOf(first), segment: stub }];
  });
  const clear = (p: Placed, points: readonly Point[]) =>
    !crossesPart(points, obstacles) &&
    !segmentsOf(points).some((s) =>
      drawn.some((d) => d.net !== netOf(p) && alongside(s, d.segment)),
    );
  let channels = 0;
  const channel = () => floor + 22 + channels++ * 8;
  const landings = new Map<number, number>();
  const landing = (x: number) => {
    const k = landings.get(x) ?? 0;
    landings.set(x, k + 1);
    return x - 8 - k * 6;
  };
  const routes = new Map<Placed, Point[]>();
  const netChannel = new Map<string, number>();
  const take = (p: Placed, points: Point[]) => {
    routes.set(p, points);
    for (const segment of segmentsOf(points)) drawn.push({ net: netOf(p), segment });
  };
  for (const p of placed) {
    const { start: from, end: to } = p;
    const trunkX = trunkOf(p);
    if (to.x < from.x + 20) {
      const y = channel();
      const riseX = landing(to.x);
      take(p, [
        from,
        { x: trunkX, y: from.y },
        { x: trunkX, y },
        { x: riseX, y },
        { x: riseX, y: to.y },
        to,
      ]);
      continue;
    }
    const turnX = Math.min(trunkX, to.x - 4);
    const early = [from, { x: turnX, y: from.y }, { x: turnX, y: to.y }, to];
    if (clear(p, early)) {
      take(p, early);
      continue;
    }
    const landX = landing(to.x);
    const late = [from, { x: landX, y: from.y }, { x: landX, y: to.y }, to];
    if (clear(p, late)) {
      take(p, late);
      continue;
    }
    // A dogleg: up or down the trunk to the nearest clear row, across it, and in. Its rows lie
    // half way between the lattice's rows, so it never runs along the row of a port it would
    // block, and at least a cell from both its ends, so each bend reads as a bend, not a kink.
    // Rows beyond the target's other inputs come first, so a detour into a gate's bottom input
    // comes from below and into its top input from above, crossing no other input's approach.
    const target = byId.get(p.w.to.part);
    const span = target?.inputs.map((q) => q.at.y) ?? [to.y];
    const inside = (y: number) => y > Math.min(...span) && y < Math.max(...span);
    const rows = [3, 4, 5, 6, 7, 8, 9, 10]
      .flatMap((k) => [
        to.y - 10 * k + 5,
        to.y + 10 * k - 5,
        from.y - 10 * k + 5,
        from.y + 10 * k - 5,
      ])
      .filter((y) => Math.abs(y - to.y) >= 20 && Math.abs(y - from.y) >= 20)
      .sort((a, b) => Number(inside(a)) - Number(inside(b)));
    const dogleg = rows
      .filter((y) => y > 0 && y < floor)
      .map((y) => [
        from,
        { x: turnX, y: from.y },
        { x: turnX, y },
        { x: landX, y },
        { x: landX, y: to.y },
        to,
      ])
      .find((route) => clear(p, route));
    if (dogleg) {
      take(p, dogleg);
      continue;
    }
    // Last, a channel under all the parts: the net's own, so a net's detours share it, or a fresh
    // one, turning in nearer the part, until one is clear.
    const viaChannel = (y: number, x: number): Point[] => [
      from,
      { x: turnX, y: from.y },
      { x: turnX, y },
      { x, y },
      { x, y: to.y },
      to,
    ];
    let route = viaChannel(netChannel.get(netOf(p)) ?? channel(), landX);
    for (let tries = 0; tries < 4 && !clear(p, route); tries++)
      route = viaChannel(channel(), landing(to.x));
    netChannel.set(netOf(p), route[2]!.y);
    take(p, route);
  }
  const junctions = new Map<Placed, Point[]>();
  for (const group of groups) {
    const first = group[0];
    if (first && group.length > 1)
      junctions.set(first, branchPoints(group.map((p) => routes.get(p) ?? [])));
  }
  const wires: WirePath[] = placed.map((p) => ({
    from: p.w.from,
    to: p.w.to,
    start: p.start,
    end: p.end,
    d: pathOf(routes.get(p) ?? []),
    junctions: junctions.get(p) ?? [],
  }));
  const width = boxes.reduce((m, b) => Math.max(m, b.x + b.w), 0) + 40;
  const height = floor + 22 + channels * 8 + 16;
  return { boxes, wires, width, height };
}

/**
 * What makes a drawing misleading, in words: a wire that passes through a part it does not
 * connect to, which looks like a connection that is not there; a wire through a part's label or
 * name, which strikes it out; and two signals drawn along one stretch of line, which look like
 * one signal. The router avoids all three; a test holds it to that.
 */
export function sceneProblems(scene: Scene): string[] {
  const found: string[] = [];
  const pieces = scene.wires.map((w) => segmentsOf(cornersOf(w.d)));
  scene.wires.forEach((w, i) => {
    for (const [a, b] of pieces[i] ?? [])
      for (const box of scene.boxes) {
        const [body, ...words] = obstaclesOf(box);
        const own = box.part.id === w.from.part || box.part.id === w.to.part;
        if (!own && body && crossesPart([a, b], [body]))
          found.push(`${w.from.part} to ${w.to.part} runs through ${box.part.id}`);
        if (crossesPart([a, b], words))
          found.push(`${w.from.part} to ${w.to.part} runs through the words at ${box.part.id}`);
      }
  });
  const netOf = (w: WirePath) => `${w.from.part}.${w.from.port}`;
  scene.wires.forEach((w, i) =>
    scene.wires.slice(i + 1).forEach((v, k) => {
      if (netOf(w) === netOf(v)) return;
      const shared = (pieces[i] ?? []).some((s) =>
        (pieces[i + 1 + k] ?? []).some((t) => alongside(s, t)),
      );
      if (shared) found.push(`${netOf(w)} and ${netOf(v)} share a stretch of wire`);
    }),
  );
  return found;
}

/** The corners of a path written as `M x y`, then `H x` and `V y` steps. */
function cornersOf(d: string): Point[] {
  const t = d.trim().split(/\s+/);
  const out: Point[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < t.length;) {
    const c = t[i++];
    if (c === "M") {
      x = Number(t[i++]);
      y = Number(t[i++]);
    } else if (c === "H") x = Number(t[i++]);
    else if (c === "V") y = Number(t[i++]);
    else continue;
    out.push({ x, y });
  }
  return out;
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

/**
 * The inside of a block placed by hand, when the library has a drawing for its kind and that
 * drawing names every part inside it. Otherwise the block is laid out automatically.
 */
function placedInside(sub: Circuit, circuit: Circuit, scope: string): Circuit {
  const kind = circuit.composites.find((c) => c.path === scope)?.kind;
  const at = kind ? INSIDE[kind] : undefined;
  if (!at) return sub;
  const names = [
    ...sub.components.filter((c) => !c.path.includes("/")).map((c) => c.path),
    ...sub.composites.filter((c) => !c.path.includes("/")).map((c) => c.path),
  ];
  return names.every((n) => n in at) ? placed(sub, at) : sub;
}

/** A drawing of the circuit at `scope`, laid out where it carries no positions. */
export function drawingAt(circuit: Circuit, scope: string): { drawing: Drawing; circuit: Circuit } {
  const sub = placedInside(subCircuit(circuit, scope), circuit, scope);
  return { drawing: circuitToDrawing(sub), circuit: sub };
}
