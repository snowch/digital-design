// Copyright © 2026 Christopher Snow

// The geometry of a drawing much wider than its box: its zoom's limits, the part of it on screen,
// and the scroll that puts a point of it under a finger.

import { describe, expect, it } from "vitest";

import { MOST_ZOOM, clampZoom, pointAt, scrollToPut, visibleRegion, zoomLimits } from "./overview";

// The branches lesson's whole datapath, 2,099 by 806, in a phone's box of 322 pixels inside.
const W = 2099;
const H = 806;

describe("a wide drawing's zoom", () => {
  it("goes down until its whole width fits the box, and up to twice its size", () => {
    const limits = zoomLimits(W, 322);
    expect(limits.min).toBeCloseTo(322 / W);
    expect(limits.max).toBe(MOST_ZOOM);
    expect(clampZoom(0.01, limits)).toBeCloseTo(322 / W);
    expect(clampZoom(5, limits)).toBe(2);
    expect(clampZoom(0.5, limits)).toBe(0.5);
  });

  it("never goes below its own size in a box it already fits", () => {
    expect(zoomLimits(300, 322).min).toBe(1);
  });
});

describe("the part of the drawing on screen", () => {
  it("is what the box shows across, at the drawing's own size", () => {
    // Scrolled 900 pixels along: the drawing's left edge is 900 pixels left of the box's.
    const drawing = { left: 16 - 900, top: 300, right: 16 - 900 + W, bottom: 300 + H };
    const box = { left: 0, top: 288, right: 354, bottom: 288 + H + 24 };
    const view = visibleRegion(drawing, box, 120, 800, W, H);
    expect(view.x0).toBeCloseTo(884);
    expect(view.x1).toBeCloseTo(1238);
    // Down, from the drawing's top (below the strip) to the window's bottom.
    expect(view.y0).toBe(0);
    expect(view.y1).toBe(500);
  });

  it("is counted in the drawing's own units when the drawing is zoomed", () => {
    // At half size, the box's 354 pixels show 708 of the drawing's units.
    const drawing = { left: 0, top: 0, right: W / 2, bottom: H / 2 };
    const box = { left: 0, top: 0, right: 354, bottom: H / 2 };
    const view = visibleRegion(drawing, box, 0, 2000, W, H);
    expect(view.x1 - view.x0).toBeCloseTo(708);
    expect(view.y1).toBeCloseTo(H);
  });

  it("starts below the strip while the strip stays at the top of the window", () => {
    // The drawing's top has scrolled 400 pixels above the window; the strip covers 0 to 210.
    const drawing = { left: 0, top: -400, right: W, bottom: -400 + H };
    const box = { left: 0, top: -412, right: 354, bottom: -412 + H + 24 };
    const view = visibleRegion(drawing, box, 210, 800, W, H);
    expect(view.y0).toBe(610);
    expect(view.y1).toBe(H);
  });

  it("counts the whole height when none of the drawing is on screen down the page", () => {
    const drawing = { left: 0, top: 2000, right: W, bottom: 2000 + H };
    const box = { left: 0, top: 1990, right: 354, bottom: 2000 + H + 10 };
    const view = visibleRegion(drawing, box, 0, 800, W, H);
    expect([view.y0, view.y1]).toEqual([0, H]);
  });
});

describe("putting a point of the drawing under a finger", () => {
  it("scrolls by how far the point is from the finger, at any zoom", () => {
    const drawing = { left: -200, top: 100, right: -200 + W * 0.5, bottom: 100 + H * 0.5 };
    // The drawing's point (1000, 400) is at (300, 300) on the screen at half size.
    expect(pointAt(drawing, W, 300, 300)).toEqual({ x: 1000, y: 400 });
    expect(scrollToPut(drawing, W, 1000, 400, 300, 300)).toEqual({ dx: 0, dy: 0 });
    // To put it at (100, 250) instead: scroll 200 along and 50 down.
    expect(scrollToPut(drawing, W, 1000, 400, 100, 250)).toEqual({ dx: 200, dy: 50 });
  });
});
