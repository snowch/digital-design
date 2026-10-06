// Copyright © 2026 Christopher Snow

// Where the things a lesson names lie across a drawing wider than its box, so the drawing can open
// with them in the middle of the box: the parts its words point at, or the fault a learner has just
// chosen. Pure, so it is tested without a browser; `CircuitView.tsx` scrolls to what it gives.

import type { PartBox, Scene } from "./scene";

/** A stretch of a drawing from left to right, in the drawing's own pixels. */
export interface Span {
  readonly left: number;
  readonly right: number;
}

/**
 * A stretch this much wider than the box still fits: what falls outside is a few pixels of the
 * halo round a word at each end (a phone 375 pixels wide holds the memory and pickLoad, 318
 * pixels as drawn, in 317).
 */
export const FIT_SLACK = 8;

const across = (b: PartBox): Span => ({ left: b.x, right: b.x + b.w });
const join = (a: Span, b: Span): Span => ({
  left: Math.min(a.left, b.left),
  right: Math.max(a.right, b.right),
});
const width = (s: Span) => s.right - s.left;

/**
 * Where one name lies, best first: a signal, by its net's name, from its driver to its nearest
 * reader, or, where that is too long to show or the driver is a fault's own fixed value, at that
 * reader; a part, by its name or its path; a name inside a block (a gate, a signal), at that
 * block, so a fault deep in the control unit finds the control unit. A signal comes before a pin
 * of the same name, which a fault on it cuts off. None when the drawing does not hold the name.
 */
function placesOf(
  scene: Scene,
  nets: readonly (string | undefined)[],
  scope: string,
  name: string,
  measure: (b: PartBox) => Span,
): Span[] {
  const wires = scene.wires.filter((_, i) => nets[i] === name);
  const first = wires[0];
  if (first) {
    const from = first.start.x;
    const nearest = wires.reduce((a, b) =>
      Math.abs(b.end.x - from) < Math.abs(a.end.x - from) ? b : a,
    );
    const reader = scene.boxes.find((b) => b.part.id === nearest.to.part);
    const end = nearest.end.x;
    const atReader = reader ? measure(reader) : { left: end, right: end };
    // A wire a fault's own fixed value drives starts wherever the layout put that value, which
    // says nothing: the fault acts where the wire is read.
    if (first.from.part.includes("fault/")) return [atReader];
    return [{ left: Math.min(from, end), right: Math.max(from, end) }, atReader];
  }
  // A name outside the block on show has no part here.
  const local =
    scope === "" ? name : name.startsWith(`${scope}/`) ? name.slice(scope.length + 1) : undefined;
  if (local === undefined) return [];
  const part = scene.boxes.find((b) => b.part.id === local || b.part.name === local);
  if (part) return [measure(part)];
  const block = scene.boxes
    .filter((b) => local.startsWith(`${b.part.id}/`))
    .sort((a, b) => b.part.id.length - a.part.id.length)[0];
  return block ? [measure(block)] : [];
}

/**
 * The stretch of the drawing to put in the middle of a box `room` pixels across (in the drawing's
 * own pixels): the places of `names`, each a path from the top of the circuit, taken in order for
 * as long as they fit together (`FIT_SLACK`), so a lesson lists first what matters most. A first name that
 * does not fit alone is shown anyway, as much of it as the box holds. `nets` gives each of the
 * scene's wires the name of the net it is drawn as carrying (a held wire carries the held net);
 * `scope` is the block the drawing shows. `measure` gives a part's stretch as drawn, with its
 * words and the values written at its outputs, which can reach past its box. Undefined when the
 * drawing holds no name.
 */
export function focusSpan(
  scene: Scene,
  nets: readonly (string | undefined)[],
  scope: string,
  names: readonly string[],
  room = Number.POSITIVE_INFINITY,
  measure: (b: PartBox) => Span = across,
): Span | undefined {
  let shown: Span | undefined;
  for (const name of names) {
    const places = placesOf(scene, nets, scope, name, measure);
    const last = places[places.length - 1];
    if (!last) continue;
    const fits = places
      .map((p) => (shown ? join(shown, p) : p))
      .find((s) => width(s) <= room + FIT_SLACK);
    if (fits) shown = fits;
    else if (shown) break;
    else shown = last;
  }
  return shown;
}

/**
 * The scroll that puts `span` in the middle of a box `room` pixels across, for a drawing shown at
 * `scale` of its own size that starts `inset` pixels into the box's scrolled content (its
 * padding); never before the start. A span wider than the box keeps its middle in the middle.
 */
export function scrollToCentre(span: Span, scale: number, room: number, inset = 0): number {
  return Math.max(0, inset + ((span.left + span.right) / 2) * scale - room / 2);
}
