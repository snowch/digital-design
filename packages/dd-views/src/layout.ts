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

/** The room between one column's widest part and the next column: a cell for each few wires. */
const WIRE_ROOM = 3;

/**
 * Places the parts in `only` (or every part when omitted), leaving the rest where they are. Each
 * column is stacked by `rowsOf`, so a tall block takes the rows it needs and nothing overlaps.
 */
export function autoLayout(
  drawing: Drawing,
  only?: ReadonlySet<string>,
  rowsOf: RowsOf = () => ROW_STEP,
  colsOf?: ColsOf,
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
  const inner = parts.filter((p) => p.kind !== "input" && p.kind !== "output");
  const maxInner = inner.reduce((m, p) => Math.max(m, depth.get(p.id) ?? 0), 0);
  const columns = new Map<number, Part[]>();
  const columnOf = (p: Part) =>
    p.kind === "input" ? 0 : p.kind === "output" ? maxInner + 1 : Math.max(1, depth.get(p.id) ?? 1);
  for (const p of parts) {
    const c = columnOf(p);
    const list = columns.get(c) ?? [];
    list.push(p);
    columns.set(c, list);
  }
  const placed = new Map<string, { x: number; y: number }>();
  // Parts that keep their places (a hand-placed drawing with one part added, such as a fault's
  // fixed value) are left alone, and the new parts go in rows below them, so nothing lands on top.
  const kept = only ? parts.filter((p) => !only.has(p.id)) : [];
  const below = kept.length ? Math.max(...kept.map((p) => p.y + rowsOf(p))) : 0;
  // Each column starts where the one before it ends, with room for the wires between them. With
  // no widths given, or beside parts placed by hand, columns are a fixed step apart.
  const byWidth = colsOf !== undefined && kept.length === 0;
  const xOf = new Map<number, number>();
  let x = 0;
  for (const c of [...columns.keys()].sort((a, b) => a - b)) {
    xOf.set(c, byWidth ? x : c * COLUMN_STEP);
    const widest = Math.max(...(columns.get(c) ?? []).map((p) => colsOf?.(p) ?? 0));
    x += widest + WIRE_ROOM;
  }
  for (const [c, list] of columns) {
    const moving = only ? list.filter((p) => only.has(p.id)) : list;
    moving.sort((p, q) => p.id.localeCompare(q.id));
    let y = below + 1;
    for (const p of moving) {
      placed.set(p.id, { x: xOf.get(c) ?? c * COLUMN_STEP, y });
      y += rowsOf(p);
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
