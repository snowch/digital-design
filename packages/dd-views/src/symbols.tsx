// Gate symbols in SVG, drawn in a 60 by 40 box with the origin at the top left. The shapes are the
// standard distinctive-shape symbols; a composite is a labelled box with its port names.

import type { ReactElement } from "react";

export const PART_W = 60;
export const PART_H = 40;
/** A box part (mux, composite) is taller when it has many ports. */
export function partHeight(kind: string, ports: number): number {
  if (kind === "mux2") return 48;
  return Math.max(PART_H, 16 + ports * 16);
}

const stroke = { fill: "var(--gate-fill)", stroke: "var(--gate-stroke)", strokeWidth: 2 };

function bubble(x: number, y: number): ReactElement {
  return <circle cx={x} cy={y} r={4} {...stroke} />;
}

/** The symbol for a gate kind. The output pin sits at (60, 20); inputs at x=0. */
export function GateSymbol({ kind }: { kind: string }): ReactElement {
  switch (kind) {
    case "not":
    case "buf":
      return (
        <g>
          <path d="M 6 4 L 46 20 L 6 36 Z" {...stroke} />
          {kind === "not" && bubble(50, 20)}
        </g>
      );
    case "and":
    case "nand":
      return (
        <g>
          <path d="M 6 4 L 28 4 A 16 16 0 0 1 28 36 L 6 36 Z" {...stroke} />
          {kind === "nand" && bubble(50, 20)}
        </g>
      );
    case "or":
    case "nor":
      return (
        <g>
          <path d="M 4 4 Q 16 20 4 36 Q 26 36 46 20 Q 26 4 4 4 Z" {...stroke} />
          {kind === "nor" && bubble(50, 20)}
        </g>
      );
    case "xor":
    case "xnor":
      return (
        <g>
          <path d="M 0 4 Q 12 20 0 36" fill="none" stroke="var(--gate-stroke)" strokeWidth={2} />
          <path d="M 6 4 Q 18 20 6 36 Q 28 36 46 20 Q 28 4 6 4 Z" {...stroke} />
          {kind === "xnor" && bubble(50, 20)}
        </g>
      );
    case "mux2":
      return <path d="M 6 2 L 46 12 L 46 36 L 6 46 Z" {...stroke} />;
    default:
      return <rect x={2} y={2} width={PART_W - 4} height={PART_H - 4} rx={4} {...stroke} />;
  }
}

/** Whether a kind is drawn with a distinctive shape (no label needed) or as a labelled box. */
export function isShaped(kind: string): boolean {
  return ["not", "buf", "and", "nand", "or", "nor", "xor", "xnor", "mux2"].includes(kind);
}
