// Gate symbols in SVG, drawn in a box 60 wide with the origin at the top left, as tall as the part:
// a gate with more inputs is taller, and its body is drawn to span every one of them. The shapes
// are the standard distinctive-shape symbols; a composite is a labelled box with its port names.

import type { ReactElement } from "react";

/** The grid parts are placed on, in pixels. */
export const CELL = 20;
export const PART_W = 60;
export const PART_H = 44;
/**
 * Ports sit one grid cell (20 pixels) apart, centred on the part, and a part's first port 12
 * pixels below its top, as a pin's port is. So every port in a drawing lies on one 10-pixel
 * lattice, and any two ports can be lined up by placing their parts a whole or half cell apart.
 */
export const PORT_PITCH = 20;
export const PORT_TOP = 12;

export const PIN_W = 44;
export const PIN_H = 24;

/** A pin is wide enough for its name in the drawing's 12-pixel mono face, with room either side. */
export function pinWidth(name: string): number {
  return Math.max(PIN_W, Math.ceil(name.length * 7.2 + 14));
}

/**
 * A box part is wide enough for its longest input name and longest output name side by side, at
 * the drawing's 12-pixel mono face (about 7.2 pixels a character), in whole grid cells. Every
 * block before Module 3 fits the standard width, so their drawings do not move; a full adder's
 * CIN beside COUT does not. A gate keeps its symbol's width.
 */
export function partWidth(
  kind: string,
  inputs: readonly string[],
  outputs: readonly string[],
): number {
  if (isShaped(kind)) return PART_W;
  const longest = (names: readonly string[]) => Math.max(0, ...names.map((n) => n.length));
  const needed = (longest(inputs) + longest(outputs)) * 7.2 + 12 + 4;
  return needed <= PART_W ? PART_W : Math.ceil(needed / CELL) * CELL;
}

/** A part is tall enough for its longest side of ports, and never shorter than a gate. */
export function partHeight(ports: number): number {
  return Math.max(PART_H, 2 * PORT_TOP + (Math.max(ports, 1) - 1) * PORT_PITCH);
}

const stroke = { fill: "var(--gate-fill)", stroke: "var(--gate-stroke)", strokeWidth: 2 };

function bubble(x: number, y: number): ReactElement {
  return <circle cx={x} cy={y} r={4} {...stroke} />;
}

/**
 * A short lead from the tip of a shape to the output pin at x=60, so the wire that starts at the
 * pin visibly leaves the gate.
 */
function lead(from: number, y: number): ReactElement {
  return (
    <path
      d={`M ${from} ${y} H ${PART_W}`}
      fill="none"
      stroke="var(--gate-stroke)"
      strokeWidth={2}
    />
  );
}

/**
 * The symbol for a gate kind, `h` pixels tall. The body runs from 4 pixels below the top to 4
 * above the bottom, so it spans every input port; the output pin sits at (60, h/2), where the
 * lead ends; inputs are at x=0.
 */
export function GateSymbol({ kind, h = PART_H }: { kind: string; h?: number }): ReactElement {
  const mid = h / 2;
  const bottom = h - 4;
  switch (kind) {
    case "not":
    case "buf":
      return (
        <g>
          <path d={`M 6 6 L 46 ${mid} L 6 ${h - 6} Z`} {...stroke} />
          {kind === "not" && bubble(50, mid)}
          {lead(kind === "not" ? 54 : 46, mid)}
        </g>
      );
    case "and":
    case "nand":
      return (
        <g>
          <path
            d={`M 6 4 L 28 4 A 16 ${(bottom - 4) / 2} 0 0 1 28 ${bottom} L 6 ${bottom} Z`}
            {...stroke}
          />
          {kind === "nand" && bubble(50, mid)}
          {lead(kind === "nand" ? 54 : 44, mid)}
        </g>
      );
    case "or":
    case "nor":
      return (
        <g>
          <path
            d={`M 4 4 Q 16 ${mid} 4 ${bottom} Q 26 ${bottom} 46 ${mid} Q 26 4 4 4 Z`}
            {...stroke}
          />
          {kind === "nor" && bubble(50, mid)}
          {lead(kind === "nor" ? 54 : 46, mid)}
        </g>
      );
    case "xor":
    case "xnor":
      return (
        <g>
          <path
            d={`M 0 4 Q 12 ${mid} 0 ${bottom}`}
            fill="none"
            stroke="var(--gate-stroke)"
            strokeWidth={2}
          />
          <path
            d={`M 6 4 Q 18 ${mid} 6 ${bottom} Q 28 ${bottom} 46 ${mid} Q 28 4 6 4 Z`}
            {...stroke}
          />
          {kind === "xnor" && bubble(50, mid)}
          {lead(kind === "xnor" ? 54 : 46, mid)}
        </g>
      );
    case "mux2":
      return (
        <g>
          <path d={`M 6 2 L 46 12 L 46 ${h - 12} L 6 ${h - 2} Z`} {...stroke} />
          {lead(46, mid)}
        </g>
      );
    default:
      return <rect x={2} y={2} width={PART_W - 4} height={h - 4} rx={4} {...stroke} />;
  }
}

/** Whether a kind is drawn with a distinctive shape (no label needed) or as a labelled box. */
export function isShaped(kind: string): boolean {
  return ["not", "buf", "and", "nand", "or", "nor", "xor", "xnor", "mux2"].includes(kind);
}
