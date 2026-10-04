// Automatic placement for a drawing without positions: inputs on the left, outputs on the right,
// everything else in columns by its distance from the inputs. Feedback (a loop) is broken at the
// edge that closes it, so a latch lays out as two gates side by side with the cross wires going
// back. Positions are grid cells; the view decides the cell size.

import type { Drawing, Part } from "./drawing";

export const COLUMN_STEP = 5;
export const ROW_STEP = 3;

/** Places the parts in `only` (or every part when omitted), leaving the rest where they are. */
export function autoLayout(drawing: Drawing, only?: ReadonlySet<string>): Drawing {
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
  // Longest path from any input pin, ignoring edges that close a cycle (found by DFS).
  const depth = new Map<string, number>();
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (id: string): number => {
    const s = state.get(id);
    if (s === 2) return depth.get(id) ?? 0;
    if (s === 1) return -1; // back edge: ignore
    state.set(id, 1);
    let d = 0;
    for (const p of pred.get(id) ?? []) {
      const pd = visit(p);
      if (pd >= 0) d = Math.max(d, pd + 1);
    }
    const part = byId.get(id);
    if (part?.kind === "input") d = 0;
    state.set(id, 2);
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
  for (const [c, list] of columns) {
    list.sort((p, q) => p.id.localeCompare(q.id));
    list.forEach((p, i) => placed.set(p.id, { x: c * COLUMN_STEP, y: 1 + i * ROW_STEP }));
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
