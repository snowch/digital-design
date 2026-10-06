// Copyright © 2026 Christopher Snow

// Where a wide drawing opens: on the parts its lesson names, on a signal by its wire, and on the
// block that holds a name from deeper in.

import { describe, expect, it } from "vitest";

import { applyFaults, libraryCircuit, stuckAt } from "@dd/dd-model";
import type { Circuit } from "@dd/sim";

import { focusSpan, scrollToCentre, type Span } from "./focus";
import { drawingAt, netOfWire, sceneOf, type PartBox } from "./scene";

/** Module 7's 4-bit ALU, 1,244 pixels across: four slices, bit0 to bit3, from left to right. */
function at(
  circuit: Circuit,
  scope: string,
  names: readonly string[],
  room?: number,
  measure?: (b: PartBox) => Span,
) {
  const { drawing, circuit: sub } = drawingAt(circuit, scope);
  const scene = sceneOf(drawing);
  const nets = scene.wires.map((w) => {
    const net = netOfWire(sub, w.from);
    return net === undefined ? undefined : sub.nets[net]?.name;
  });
  return focusSpan(scene, nets, scope, names, room, measure);
}

const alu = libraryCircuit("alu8-4");

describe("where a wide drawing opens", () => {
  it("finds a part by its name, and several parts as the stretch that holds them all", () => {
    expect(at(alu, "", ["bit2"])).toEqual({ left: 700, right: 780 });
    expect(at(alu, "", ["xorC0", "bit0"])).toEqual({ left: 160, right: 420 });
    // An output named as its signal is found by the signal: COUT from bit3 to its pin.
    expect(at(alu, "", ["COUT"])).toEqual({ left: 960, right: 1160 });
  });

  it("finds a signal by its wire, from its driver to its nearest reader, held by a fault too", () => {
    // C2 runs from bit1's carry out to bit2's carry in.
    expect(at(alu, "", ["C2"])).toEqual({ left: 600, right: 700 });
    expect(at(applyFaults(alu, [stuckAt("C2", 0)]), "", ["C2"])).toEqual({ left: 600, right: 700 });
    // C0 held: its gate's output is cut, and the fixed value is drawn where the layout puts it, so
    // C0 is found at bit0, its reader. Unheld, it runs from andC0 to bit0.
    expect(at(alu, "", ["C0"])).toEqual({ left: 300, right: 340 });
    expect(at(applyFaults(alu, [stuckAt("C0", 0)]), "", ["C0"])).toEqual({ left: 340, right: 420 });
  });

  it("finds a name from deeper in by the block that holds it, and by itself once opened", () => {
    expect(at(alu, "", ["bit2/fa"])).toEqual({ left: 700, right: 780 });
    expect(at(alu, "bit2", ["bit2/fa"])).toEqual({ left: 420, right: 500 });
    // Inside bit2, C2 comes in at the CIN pin and runs to the adder.
    expect(at(alu, "bit2", ["C2"])).toEqual({ left: 44, right: 420 });
  });

  it("takes the names in order for as long as they fit the box together", () => {
    // A phone's box holds 332 pixels of the drawing: bit0 and bit3 together are 620.
    expect(at(alu, "", ["bit0", "bit3"], 332)).toEqual({ left: 340, right: 420 });
    expect(at(alu, "", ["bit3", "bit0"], 332)).toEqual({ left: 880, right: 960 });
    expect(at(alu, "", ["xorC0", "bit0", "bit3"], 332)).toEqual({ left: 160, right: 420 });
    expect(at(alu, "", ["nowhere", "bit2"], 332)).toEqual({ left: 700, right: 780 });
    // b2 runs 560 pixels from splitA to bit2: too long for the box, it is shown at its reader.
    expect(at(alu, "", ["b2"])).toEqual({ left: 140, right: 700 });
    expect(at(alu, "", ["b2"], 332)).toEqual({ left: 700, right: 780 });
    // A part wider than the box is still the place to show.
    expect(at(alu, "", ["bit2"], 40)).toEqual({ left: 700, right: 780 });
  });

  it("measures a part as drawn, where its words and values reach past its box", () => {
    // Values written 30 pixels past each slice's right edge: bit0 and bit1 no longer fit 260.
    const drawn = (b: PartBox) => ({ left: b.x, right: b.x + b.w + 30 });
    expect(at(alu, "", ["bit0", "bit1"], 260)).toEqual({ left: 340, right: 600 });
    expect(at(alu, "", ["bit0", "bit1"], 260, drawn)).toEqual({ left: 340, right: 450 });
  });

  it("finds nothing for a name the drawing does not hold", () => {
    expect(at(alu, "", ["nowhere"])).toBeUndefined();
    expect(at(alu, "bit2", ["bit1/fa"])).toBeUndefined();
  });

  it("scrolls the stretch to the middle of the box, never before the drawing's left edge", () => {
    expect(scrollToCentre({ left: 600, right: 700 }, 1, 332)).toBe(484);
    expect(scrollToCentre({ left: 600, right: 700 }, 0.5, 332)).toBe(159);
    expect(scrollToCentre({ left: 0, right: 44 }, 1, 332)).toBe(0);
    // A drawing 16 pixels into its box, past the box's padding, is scrolled 16 pixels further.
    expect(scrollToCentre({ left: 600, right: 700 }, 1, 332, 16)).toBe(500);
  });
});
