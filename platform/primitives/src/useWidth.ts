// Copyright © 2026 Christopher Snow

// The width an element has on the page, so a drawing can use one pixel per unit and keep its
// text at the size the stylesheet sets, at any width. Falls back to `fallback` where nothing
// measures (a test without layout).

import { useCallback, useEffect, useState } from "react";

export function useWidth<T extends Element>(fallback: number): [(el: T | null) => void, number] {
  const [el, setEl] = useState<T | null>(null);
  const [width, setWidth] = useState(fallback);
  const ref = useCallback((node: T | null) => setEl(node), []);
  useEffect(() => {
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.floor(w));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [ref, width];
}

/** How far, in pixels, content may pass its box's edge before it counts as out of sight. */
const MARGIN = 24;

/**
 * Whether an element's content is wider than the element, so it scrolls sideways: a drawing on a
 * phone. False where nothing measures (a test without layout).
 */
export function useOverflows<T extends Element>(): [(el: T | null) => void, boolean] {
  const [el, setEl] = useState<T | null>(null);
  const [overflows, setOverflows] = useState(false);
  const ref = useCallback((node: T | null) => setEl(node), []);
  useEffect(() => {
    if (!el) return;
    // A drawing's own margin may pass the edge by a few pixels with nothing in it: the note
    // speaks only when more than that is out of sight.
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth + MARGIN);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [el]);
  return [ref, overflows];
}
