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
