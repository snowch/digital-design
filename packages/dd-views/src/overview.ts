// Copyright © 2026 Christopher Snow

// The geometry of a drawing much wider than its box: how far it may be zoomed, which part of it is
// on screen, and where to scroll so that a point of it lands under a finger. Pure, so it is tested
// without a browser; `Overview.tsx` measures the page and applies these.

/** A rectangle on the screen, as `getBoundingClientRect` gives it. */
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Part of a drawing, in the drawing's own units. */
export interface Region {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}

/** The largest zoom: twice the drawing's own size, for words a learner wants larger. */
export const MOST_ZOOM = 2;

/**
 * The smallest zoom: half the drawing's size. Smaller, a phone's box shows less than the strip
 * above it already does (a learner's walk of the branches lesson found the fitted drawing, 285
 * pixels across, under the strip's 350).
 */
export const LEAST_ZOOM = 0.5;

/**
 * Below this zoom the drawing's words would be under about 7 pixels high, so they are hidden. Above
 * it they show smaller than the page's 11-pixel rule, which holds for the page as it loads: a
 * learner who zooms a drawing out chooses smaller words, as with the browser's own zoom.
 */
export const WORDS_HIDDEN_BELOW = 0.6;

/** How far a drawing `width` units wide may be zoomed in a box with `room` pixels across. */
export function zoomLimits(
  width: number,
  room: number,
): { readonly min: number; readonly max: number } {
  const fit = width > 0 && room > 0 ? room / width : 1;
  return { min: Math.min(1, Math.max(fit, LEAST_ZOOM)), max: MOST_ZOOM };
}

/** The zooms the buttons step through, the drawing's own size among them. */
export function zoomSteps(limits: { readonly min: number; readonly max: number }): number[] {
  const rungs = [0.5, 0.75, 1, 1.5, 2].filter((z) => z > limits.min + 1e-6 && z <= limits.max);
  return [limits.min, ...rungs];
}

/** The next zoom a button gives from `zoom`, larger (1) or smaller (-1), from a pinch's too. */
export function nextZoom(
  zoom: number,
  limits: { readonly min: number; readonly max: number },
  direction: 1 | -1,
): number {
  const steps = zoomSteps(limits);
  if (direction > 0) return steps.find((z) => z > zoom + 0.001) ?? limits.max;
  return [...steps].reverse().find((z) => z < zoom - 0.001) ?? limits.min;
}

export function clampZoom(
  zoom: number,
  limits: { readonly min: number; readonly max: number },
): number {
  return Math.min(limits.max, Math.max(limits.min, zoom));
}

/**
 * The part of a drawing on screen, in its own units: across, what the box shows of it; down, what
 * lies between the strip's bottom (or the box's top) and the bottom of the window. Where none of it
 * is on screen down the page, the whole height counts.
 */
export function visibleRegion(
  drawing: Rect,
  box: Rect,
  stripBottom: number,
  windowHeight: number,
  width: number,
  height: number,
): Region {
  const scale = (drawing.right - drawing.left) / width || 1;
  const clamp = (v: number, hi: number) => Math.min(hi, Math.max(0, v));
  const x0 = clamp((box.left - drawing.left) / scale, width);
  const x1 = clamp((box.right - drawing.left) / scale, width);
  const top = Math.max(box.top, stripBottom, 0);
  const bottom = Math.min(box.bottom, windowHeight);
  const y0 = clamp((top - drawing.top) / scale, height);
  const y1 = clamp((bottom - drawing.top) / scale, height);
  return y1 - y0 < 1 ? { x0, x1, y0: 0, y1: height } : { x0, x1, y0, y1 };
}

/**
 * How far to scroll, across and down, so that the drawing's point (`x`, `y`, in its own units)
 * comes under the screen point (`toX`, `toY`), with the drawing where `drawing` says it is now.
 */
export function scrollToPut(
  drawing: Rect,
  width: number,
  x: number,
  y: number,
  toX: number,
  toY: number,
): { readonly dx: number; readonly dy: number } {
  const scale = (drawing.right - drawing.left) / width || 1;
  return { dx: drawing.left + x * scale - toX, dy: drawing.top + y * scale - toY };
}

/** The drawing's point (in its own units) under a screen point. */
export function pointAt(drawing: Rect, width: number, screenX: number, screenY: number) {
  const scale = (drawing.right - drawing.left) / width || 1;
  return { x: (screenX - drawing.left) / scale, y: (screenY - drawing.top) / scale };
}
