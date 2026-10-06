// Copyright © 2026 Christopher Snow

// Automatic placement for a drawing without positions: inputs on the left, outputs on the right,
// everything else in columns by its distance from the inputs. Feedback (a loop) is broken at the
// edge that closes it, so a latch lays out as two gates side by side with the cross wires going
// back. Positions are grid cells; the view decides the cell size.

import type { Drawing, Part } from "./drawing";

export const COLUMN_STEP = 5;
export const ROW_STEP = 3;

/** How many grid rows a part takes in its column, or columns across. */
export type RowsOf = (part: Part) => number;
export type ColsOf = (part: Part) => number;
/**
 * Where the labels go in a column: the rows a part's label takes above it, and the whole rows a
 * part leaves free at its foot, under its body and its name, where the label of the part below it
 * may go.
 */
export interface LabelRows {
  readonly above: (part: Part) => number;
  readonly foot: (part: Part) => number;
}

/**
 * The room between one column's widest part and the next column, in cells: at least three, and
 * otherwise two, for a value written past a port and a wire's turn into the next part, and half a
 * cell for each signal crossing the gap, which may need a turn of its own half a cell from the
 * others.
 */
const WIRE_ROOM = 3;
const roomFor = (signals: number) => Math.max(WIRE_ROOM, Math.ceil(2 + signals / 2));

/**
 * Places the parts in `only` (or every part when omitted), leaving the rest where they are. Each
 * column is stacked by `rowsOf`, so a tall block takes the rows it needs and nothing overlaps, and
 * by `labelRows`, so a block's label has its rows free.
 */
export function autoLayout(
  drawing: Drawing,
  only?: ReadonlySet<string>,
  rowsOf: RowsOf = () => ROW_STEP,
  colsOf?: ColsOf,
  labelRows?: LabelRows,
): Drawing {
  const parts = drawing.parts;
  const byId = new Map(parts.map((p) => [p.id, p]));
  const succ = new Map<string, Set<string>>();
  const pred = new Map<string, Set<string>>();
  for (const p of parts) {
    succ.set(p.id, new Set());
    pred.set(p.id, new Set());
  }
  for (const w of drawing.wires) {
    if (!byId.has(w.from.part) || !byId.has(w.to.part)) continue;
    succ.get(w.from.part)?.add(w.to.part);
    pred.get(w.to.part)?.add(w.from.part);
  }
  // Edges that close a cycle, found by walking forwards from the inputs: in a loop of inverters
  // kicked by an OR gate, the edge back into the OR gate is the one to ignore, so the loop lays
  // out as a chain. Then the longest path from the inputs over the remaining edges.
  const back = new Set<string>();
  const state = new Map<string, 0 | 1 | 2>();
  const walk = (id: string): void => {
    state.set(id, 1);
    for (const next of succ.get(id) ?? []) {
      const s = state.get(next);
      if (s === 1) back.add(`${id}>${next}`);
      else if (s === undefined) walk(next);
    }
    state.set(id, 2);
  };
  const inputsFirst = [...parts].sort((p, q) =>
    p.kind === "input" && q.kind !== "input"
      ? -1
      : q.kind === "input" && p.kind !== "input"
        ? 1
        : 0,
  );
  for (const p of inputsFirst) if (state.get(p.id) === undefined) walk(p.id);
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const visit = (id: string): number => {
    const known = depth.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    let d = 0;
    for (const p of pred.get(id) ?? []) {
      if (back.has(`${p}>${id}`)) continue;
      d = Math.max(d, visit(p) + 1);
    }
    const part = byId.get(id);
    if (part?.kind === "input") d = 0;
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };
  for (const p of parts) visit(p.id);
  const columns = new Map<number, Part[]>();
  const kept = only ? parts.filter((p) => !only.has(p.id)) : [];
  // A fixed value is a source like an input, so in a drawing laid out whole it goes below the
  // inputs: placed in the first column of gates, its kind label above it lands on the name under
  // the gate above. A fault's value added to a placed drawing stays beside what it drives.
  const isSource = (p: Part) =>
    kept.length === 0 && p.kind === "const" && (pred.get(p.id)?.size ?? 0) === 0;
  const innerColumn = (p: Part) => (isSource(p) ? 0 : Math.max(1, depth.get(p.id) ?? 1));
  // The outputs go after every other part's column, even where no wire gives a part a depth: a
  // drawing tidied before any wire is drawn has its parts in one column and its outputs after it.
  const inner = parts.filter((p) => p.kind !== "input" && p.kind !== "output");
  const maxInner = inner.reduce((m, p) => Math.max(m, innerColumn(p)), 0);
  const columnOf = (p: Part) =>
    p.kind === "input" ? 0 : p.kind === "output" ? maxInner + 1 : innerColumn(p);
  for (const p of parts) {
    const c = columnOf(p);
    const list = columns.get(c) ?? [];
    list.push(p);
    columns.set(c, list);
  }
  const placed = new Map<string, { x: number; y: number }>();
  // Parts that keep their places (a hand-placed drawing with one part added, such as a fault's
  // fixed value) are left alone, and the new parts go in rows below them, so nothing lands on top.
  const below = kept.length ? Math.max(...kept.map((p) => p.y + rowsOf(p))) : 0;
  // Each column starts where the one before it ends, with room for the wires between them. With
  // no widths given, or beside parts placed by hand, columns are a fixed step apart.
  const byWidth = colsOf !== undefined && kept.length === 0;
  // The signals crossing the gap after column c: each port with a wire from c or before to a part
  // after it.
  const crossing = (c: number) => {
    const ports = new Set<string>();
    for (const w of drawing.wires) {
      const from = byId.get(w.from.part);
      const to = byId.get(w.to.part);
      if (from && to && columnOf(from) <= c && columnOf(to) > c)
        ports.add(`${w.from.part}.${w.from.port}`);
    }
    return ports.size;
  };
  const xOf = new Map<number, number>();
  let x = 0;
  for (const c of [...columns.keys()].sort((a, b) => a - b)) {
    xOf.set(c, byWidth ? x : c * COLUMN_STEP);
    const widest = Math.max(...(columns.get(c) ?? []).map((p) => colsOf?.(p) ?? 0));
    x += widest + roomFor(crossing(c));
  }
  // Outputs stack in the order of the parts that drive them, so their wires do not cross.
  const driverRow = (p: Part) =>
    Math.min(...[...(pred.get(p.id) ?? [])].map((d) => placed.get(d)?.y ?? Infinity), Infinity);
  for (const c of [...columns.keys()].sort((a, b) => a - b)) {
    const list = columns.get(c) ?? [];
    const moving = only ? list.filter((p) => only.has(p.id)) : list;
    moving.sort(
      (p, q) =>
        (p.kind === "output" && q.kind === "output" ? driverRow(p) - driverRow(q) : 0) ||
        Number(isSource(p)) - Number(isSource(q)) ||
        p.id.localeCompare(q.id),
    );
    let y = below + 1;
    // A block's label is drawn in the row above it. The column's first part has a row above it,
    // and a block or a pin leaves one at its foot, but a two-input gate leaves none: its name is
    // written under it, so a block after it starts a row lower. Before, an AND gate's name and the
    // label "memory of bytes" landed on each other when the shop's memory was tidied before any
    // wire was drawn.
    let room = 1;
    for (const p of moving) {
      if (labelRows) y += Math.max(0, labelRows.above(p) - room);
      placed.set(p.id, { x: xOf.get(c) ?? c * COLUMN_STEP, y });
      y += rowsOf(p);
      room = labelRows?.foot(p) ?? 0;
    }
  }
  return {
    ...drawing,
    parts: parts.map((p) => {
      if (only && !only.has(p.id)) return p;
      const at = placed.get(p.id);
      return at ? { ...p, x: at.x, y: at.y } : p;
    }),
  };
}
