// Copyright © 2026 Christopher Snow

// A drawing nudged so its wires run straight. Every port lies on one 10-pixel lattice (symbols.tsx),
// so a wire whose two ends are a half or a whole cell apart can be made straight by moving the part
// it feeds up or down by that much. Parts are taken left to right, and each moves to whichever of
// its nearby rows makes the most of its incoming wires straight, or stays where its author put it
// when no move helps. A part moves at most one cell, never onto another part or its name, and
// only up or down, so the drawing keeps its shape. Input pins stay put: everything lines up to
// them.
//
// Only read-only drawings are straightened. In the builder a part stays where the learner put it.

import type { Drawing, Part, Wire } from "./drawing";
import { partBox, type PartBox } from "./scene";
import { CELL, isShaped } from "./symbols";

/** The rows a part may move to, in cells, the smallest move first, so ties keep it near home. */
const MOVES = [0, -0.5, 0.5, -1, 1];
/** Room kept clear around a part: its outline, and the name a drawing writes under a gate. */
const MARGIN = 4;
const NAME_BELOW = 16;
/** The room a block's name takes above it. */
const LABEL_ABOVE = 20;

/** The highest point a part's drawing reaches, a block's name included. */
function topOf(part: Part): number {
  const block = !isShaped(part.kind) && part.kind !== "input" && part.kind !== "output";
  return part.y * CELL - (block ? LABEL_ABOVE : 0);
}

function clearance(box: PartBox): { top: number; bottom: number; left: number; right: number } {
  const isPin = box.part.kind === "input" || box.part.kind === "output";
  return {
    top: box.y - MARGIN,
    bottom: box.y + box.h + (isPin ? MARGIN : NAME_BELOW),
    left: box.x - MARGIN,
    right: box.x + box.w + MARGIN,
  };
}

function overlaps(a: PartBox, b: PartBox): boolean {
  const p = clearance(a);
  const q = clearance(b);
  return p.left < q.right && q.left < p.right && p.top < q.bottom && q.top < p.bottom;
}

export function straighten(drawing: Drawing): Drawing {
  // Module 8: a drawing whose wires are routed by hand is drawn where its author put it.
  if (drawing.routes && Object.keys(drawing.routes).length) return drawing;
  const at = new Map<string, Part>(drawing.parts.map((p) => [p.id, p]));
  const box = (id: string) => {
    const p = at.get(id);
    return p ? partBox(p) : undefined;
  };
  const into = new Map<string, Wire[]>();
  for (const w of drawing.wires) into.set(w.to.part, [...(into.get(w.to.part) ?? []), w]);
  const order = drawing.parts
    .filter((p) => p.kind !== "input")
    .sort((a, b) => a.x - b.x || a.y - b.y);
  for (const part of order) {
    const wires = into.get(part.id) ?? [];
    // Only wires from parts to the left: a wire fed back from the right runs under the parts.
    const fromLeft = wires.filter((w) => {
      const from = box(w.from.part);
      return from !== undefined && from.x + from.w <= part.x * CELL;
    });
    if (fromLeft.length === 0) continue;
    const straightAt = (moved: PartBox) =>
      fromLeft.filter((w) => {
        const start = box(w.from.part)?.outputs.find((p) => p.port === w.from.port)?.at.y;
        const end = moved.inputs.find((p) => p.port === w.to.port)?.at.y;
        return start !== undefined && start === end;
      }).length;
    // Where its author put it is always allowed; a move must straighten more, and be clear.
    let best = { move: 0, straight: straightAt(partBox(part)) };
    for (const move of MOVES) {
      if (move === 0) continue;
      const moved = partBox({ ...part, y: part.y + move });
      const blocked = drawing.parts.some((other) => {
        if (other.id === part.id) return false;
        const b = box(other.id);
        return b !== undefined && overlaps(moved, b);
      });
      if (blocked) continue;
      const straight = straightAt(moved);
      if (straight > best.straight) best = { move, straight };
    }
    if (best.move !== 0) at.set(part.id, { ...part, y: part.y + best.move });
  }
  // A part moved up so far that its label would leave the top of the drawing takes the whole
  // drawing down with it; everything moves together, so nothing comes out of line.
  const before = Math.min(0, ...drawing.parts.map(topOf));
  const after = Math.min(...[...at.values()].map(topOf));
  const down = Math.max(0, before - after) / CELL;
  return {
    ...drawing,
    parts: drawing.parts.map((p) => {
      const q = at.get(p.id) ?? p;
      return down ? { ...q, y: q.y + down } : q;
    }),
  };
}
