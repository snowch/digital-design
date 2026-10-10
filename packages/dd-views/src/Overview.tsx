// Copyright © 2026 Christopher Snow

// A drawing much wider than its box (Module 8's whole datapath, 2,099 pixels across, in a phone's
// box of about 350): the whole of it, small, above it, with a frame on the part on screen, and a
// zoom from half its size (or fitting the box, where that is larger) to twice its size, the
// buttons stepping through its own size on the way. Pinching zooms on a touch screen; the buttons
// do the same for one finger, a mouse or a keyboard, as every gesture of two fingers must have an
// equal of one. The browser's own zoom of the page is left alone outside the drawing.
//
// The zoom is applied without a render: the drawing's size follows the custom property `--zoom`
// on its box, so a pinch moves at the screen's rate however many parts the drawing has. The strip
// is a copy of the drawing as it is after each render, its words and its controls taken out.

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

import {
  WORDS_HIDDEN_BELOW,
  clampZoom,
  nextZoom,
  pointAt,
  scrollToPut,
  visibleRegion,
  zoomLimits,
} from "./overview";
import { format, useViewStrings } from "./strings";

/** The drawing's box has a padding of 1rem on each side (`.circuit-scroll`). */
export const BOX_PADDING = 32;

/**
 * A drawing at least this wide, in pixels at its own size, is large: three phone screens across,
 * and wider than the page on a desktop. Of the course's drawings, those of Module 7's ALU and of
 * Module 8's datapath from the fetch stage on; the next widest, 932, scrolls in under three.
 */
export const LARGE_DRAWING = 1000;

/** The strip's greatest height, in pixels; a wide screen gets a strip narrower than the card. */
const STRIP_HEIGHT = 150;

export interface ZoomControl {
  /** The zoom as last settled: after a button, a pinch or a turn of the wheel. */
  readonly zoom: number;
  readonly min: number;
  readonly max: number;
  /** Zooms one step larger (1) or smaller (-1) about the middle of what is on screen. */
  readonly step: (direction: 1 | -1) => void;
}

function drawingIn(box: HTMLElement | null): SVGSVGElement | null {
  return box?.querySelector<SVGSVGElement>("svg.circuit") ?? null;
}

/** The middle of the part of an element that is on screen. */
function middleOnScreen(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  const top = Math.max(r.top, 0);
  const bottom = Math.min(r.bottom, window.innerHeight);
  return {
    x: (r.left + r.right) / 2,
    y: bottom > top ? (top + bottom) / 2 : (r.top + r.bottom) / 2,
  };
}

/**
 * Zoom for the drawing in `box` (null: none): two fingers on a touch screen, a pinch on a
 * trackpad (the browser sends it as the wheel with Ctrl held), and `by` for the buttons. The
 * drawing's point under the fingers stays under them.
 */
export function useZoom(
  box: HTMLDivElement | null,
  width: number,
  height: number,
  room: number,
): ZoomControl {
  const limits = zoomLimits(width, room);
  const [zoom, setZoom] = useState(1);
  const current = useRef(1);
  const bounds = useRef(limits);
  bounds.current = limits;

  const apply = useCallback(
    (z: number) => {
      const next = clampZoom(z, bounds.current);
      current.current = next;
      if (box) {
        box.style.setProperty("--zoom", String(next));
        box.classList.toggle("words-hidden", next < WORDS_HIDDEN_BELOW);
      }
      return next;
    },
    [box],
  );

  /** Zooms to `z`, then scrolls so the drawing's point (`x`, `y`) is under the screen point. */
  const zoomTo = useCallback(
    (z: number, x: number, y: number, toX: number, toY: number) => {
      const next = apply(z);
      const svg = drawingIn(box);
      if (box && svg) {
        const { dx, dy } = scrollToPut(svg.getBoundingClientRect(), width, x, y, toX, toY);
        box.scrollLeft += dx;
        if (Math.abs(dy) >= 1) window.scrollBy(0, dy);
      }
      return next;
    },
    [apply, box, width],
  );

  // A new drawing (a block opened, or the page laid out again) starts at its own size.
  useEffect(() => {
    apply(1);
    setZoom(1);
    return () => {
      box?.style.removeProperty("--zoom");
      box?.classList.remove("words-hidden");
    };
  }, [apply, box, width, height]);

  useEffect(() => {
    if (!box) return;
    let pinch: { d0: number; z0: number; x: number; y: number } | undefined;
    const spread = (t: TouchList) => {
      const a = t[0];
      const b = t[1];
      if (!a || !b) return undefined;
      return {
        d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
      };
    };
    const start = (e: TouchEvent) => {
      const s = spread(e.touches);
      const svg = drawingIn(box);
      if (e.touches.length !== 2 || !s || !svg || s.d === 0) return;
      e.preventDefault();
      const p = pointAt(svg.getBoundingClientRect(), width, s.x, s.y);
      pinch = { d0: s.d, z0: current.current, x: p.x, y: p.y };
    };
    const move = (e: TouchEvent) => {
      const s = spread(e.touches);
      if (!pinch || e.touches.length !== 2 || !s) return;
      if (e.cancelable) e.preventDefault();
      zoomTo((pinch.z0 * s.d) / pinch.d0, pinch.x, pinch.y, s.x, s.y);
    };
    const end = (e: TouchEvent) => {
      if (pinch && e.touches.length < 2) {
        pinch = undefined;
        setZoom(current.current);
      }
    };
    // A trackpad's pinch, and a wheel turned with Ctrl held: zoom about the pointer.
    let settle: ReturnType<typeof setTimeout> | undefined;
    const wheel = (e: WheelEvent) => {
      const svg = drawingIn(box);
      if (!e.ctrlKey || !svg) return;
      e.preventDefault();
      const p = pointAt(svg.getBoundingClientRect(), width, e.clientX, e.clientY);
      const step = Math.max(-50, Math.min(50, e.deltaY));
      zoomTo(current.current * Math.exp(-step / 100), p.x, p.y, e.clientX, e.clientY);
      clearTimeout(settle);
      settle = setTimeout(() => setZoom(current.current), 150);
    };
    // Safari zooms the page on its own gesture events unless they are stopped.
    const stop = (e: Event) => e.preventDefault();
    box.addEventListener("touchstart", start, { passive: false });
    box.addEventListener("touchmove", move, { passive: false });
    box.addEventListener("touchend", end);
    box.addEventListener("touchcancel", end);
    box.addEventListener("wheel", wheel, { passive: false });
    box.addEventListener("gesturestart", stop);
    box.addEventListener("gesturechange", stop);
    return () => {
      clearTimeout(settle);
      box.removeEventListener("touchstart", start);
      box.removeEventListener("touchmove", move);
      box.removeEventListener("touchend", end);
      box.removeEventListener("touchcancel", end);
      box.removeEventListener("wheel", wheel);
      box.removeEventListener("gesturestart", stop);
      box.removeEventListener("gesturechange", stop);
    };
  }, [box, width, zoomTo]);

  const step = useCallback(
    (direction: 1 | -1) => {
      const svg = drawingIn(box);
      if (!box || !svg) return;
      const at = middleOnScreen(box);
      const p = pointAt(svg.getBoundingClientRect(), width, at.x, at.y);
      const z = nextZoom(current.current, bounds.current, direction);
      setZoom(zoomTo(z, p.x, p.y, at.x, at.y));
    },
    [box, width, zoomTo],
  );

  return { zoom, min: limits.min, max: limits.max, step };
}

/**
 * How far down the window a band stuck above the strip reaches (`--sticky-top`, set by a figure
 * that keeps its own controls stuck over the whole figure), 0 when there is none.
 */
function stickyTop(bar: HTMLElement): number {
  return parseFloat(getComputedStyle(bar).getPropertyValue("--sticky-top")) || 0;
}

/** The bottom of what covers the top of the window: the strip, or a band stuck above it. */
function coveredTo(bar: HTMLElement): number {
  return Math.max(bar.getBoundingClientRect().bottom, stickyTop(bar));
}

/**
 * The strip: the whole drawing in `box`, small, without its words, with a frame on the part on
 * screen. Pressing or dragging in it moves the drawing there; from a keyboard it is one control
 * whose arrow keys move the drawing half a box at a time. It stays at the top of the window while
 * the drawing is on screen.
 */
export function OverviewStrip({
  box,
  width,
  height,
  zoom,
}: {
  box: HTMLDivElement | null;
  width: number;
  height: number;
  zoom: ZoomControl;
}) {
  const strings = useViewStrings().circuit;
  const id = useId();
  const bar = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  const region = useCallback(() => {
    const svg = drawingIn(box);
    if (!box || !svg || !bar.current) return undefined;
    return visibleRegion(
      svg.getBoundingClientRect(),
      box.getBoundingClientRect(),
      coveredTo(bar.current),
      window.innerHeight,
      width,
      height,
    );
  }, [box, width, height]);

  const paint = useCallback(() => {
    const view = region();
    const s = strip.current;
    const f = frame.current;
    if (!view || !s || !f || !box || !bar.current) return;
    const k = s.clientWidth / width;
    f.style.transform = `translate(${view.x0 * k}px, ${view.y0 * k}px)`;
    f.style.width = `${Math.max(6, (view.x1 - view.x0) * k)}px`;
    f.style.height = `${Math.max(6, (view.y1 - view.y0) * k)}px`;
    const from = Math.round((view.x0 / width) * 100);
    const to = Math.round((view.x1 / width) * 100);
    s.setAttribute("aria-valuenow", String(from));
    s.setAttribute("aria-valuetext", format(strings.overviewValue, { from, to }));
    const top = bar.current.getBoundingClientRect();
    bar.current.classList.toggle(
      "stuck",
      top.top <= stickyTop(bar.current) + 1 && box.getBoundingClientRect().top < top.bottom,
    );
  }, [region, box, width, strings.overviewValue]);

  // The copy, after every render of the drawing: its colours are the drawing's own, its words
  // and its controls are taken out, and nothing in it can be focused.
  useLayoutEffect(() => {
    const svg = drawingIn(box);
    if (!svg || !copy.current) return;
    const c = svg.cloneNode(true) as SVGSVGElement;
    c.setAttribute("class", "circuit circuit-overview");
    for (const a of ["style", "role", "aria-labelledby", "aria-label"]) c.removeAttribute(a);
    c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("title, text").forEach((n) => n.remove());
    c.querySelectorAll("[tabindex], [role], [aria-label], [id]").forEach((n) => {
      for (const a of ["tabindex", "role", "aria-label", "id"]) n.removeAttribute(a);
    });
    // The copy is a picture: nothing in it answers a query meant for the drawing (a part's path or
    // kind, a wire's net, an input to press), so a figure's blocks are counted once.
    c.querySelectorAll("[data-path], [data-net], [data-port]").forEach((n) => {
      for (const a of ["data-path", "data-net", "data-port"]) n.removeAttribute(a);
    });
    c.querySelectorAll("[class]").forEach((n) => {
      const kept = [...n.classList].filter((k) => !/^part-|^pin-button$|^selected$/.test(k));
      n.setAttribute("class", kept.join(" "));
    });
    copy.current.replaceChildren(c);
    paint();
  });

  useEffect(() => {
    if (!box) return;
    let queued = 0;
    const later = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        paint();
      });
    };
    box.addEventListener("scroll", later, { passive: true });
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    const ro = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(later);
    const svg = drawingIn(box);
    if (ro && svg) ro.observe(svg);
    if (ro && strip.current) ro.observe(strip.current);
    return () => {
      cancelAnimationFrame(queued);
      box.removeEventListener("scroll", later);
      window.removeEventListener("scroll", later);
      window.removeEventListener("resize", later);
      ro?.disconnect();
    };
  }, [box, paint]);

  // Moves the drawing so that the point under the finger is in the middle of the box. A press also
  // brings the point's row on screen when it is off screen now; a drag never moves the page, or the
  // strip would move under a still finger and each move would scroll it again (a learner's walk
  // found a drag from the strip's own place running to the end of the page).
  const goTo = (clientX: number, clientY: number, press: boolean) => {
    const s = strip.current;
    const svg = drawingIn(box);
    const view = region();
    if (!s || !svg || !box || !view || !bar.current) return;
    const r = s.getBoundingClientRect();
    const k = r.width / width;
    const x = (clientX - r.left) / k;
    const y = (clientY - r.top) / k;
    const d = svg.getBoundingClientRect();
    const scale = (d.right - d.left) / width;
    box.scrollLeft += (x - (view.x0 + view.x1) / 2) * scale;
    if (press && (y < view.y0 + 20 || y > view.y1 - 20)) {
      const top = Math.max(coveredTo(bar.current), 0);
      window.scrollBy(0, d.top + y * scale - (top + window.innerHeight) / 2);
    }
    paint();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    goTo(e.clientX, e.clientY, true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) goTo(e.clientX, e.clientY, false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!box) return;
    const half = box.clientWidth / 2;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") box.scrollLeft += half;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") box.scrollLeft -= half;
    else if (e.key === "Home") box.scrollLeft = 0;
    else if (e.key === "End") box.scrollLeft = box.scrollWidth;
    else return;
    e.preventDefault();
    paint();
  };

  return (
    <div className="overview-bar" ref={bar}>
      <div className="overview-head">
        <span className="overview-label" id={`${id}-label`}>
          {strings.overviewLabel}
        </span>
        <span className="overview-zoom">
          <button
            type="button"
            className="button"
            disabled={zoom.zoom <= zoom.min + 0.001}
            onClick={() => zoom.step(-1)}
          >
            {strings.zoomOut}
          </button>
          <button
            type="button"
            className="button"
            disabled={zoom.zoom >= zoom.max - 0.001}
            onClick={() => zoom.step(1)}
          >
            {strings.zoomIn}
          </button>
        </span>
      </div>
      <div
        className="overview"
        ref={strip}
        role="slider"
        tabIndex={0}
        aria-label={strings.overviewName}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        style={{ maxWidth: `${(STRIP_HEIGHT * width) / height}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <div className="overview-copy" ref={copy} aria-hidden="true" inert />
        <div className="overview-frame" ref={frame} />
      </div>
    </div>
  );
}
