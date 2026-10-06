// Copyright © 2026 Christopher Snow

// A circuit drawn small and without words: its parts as outlines and the wires between them, from
// the same scene a figure draws. The course's cover shows the whole machine this way.

import { useMemo } from "react";

import type { Circuit } from "@dd/sim";

import { drawingAt, netOfWire, sceneOf } from "./scene";
import { straighten } from "./straighten";
import { GateSymbol, isShaped } from "./symbols";

export function CircuitThumbnail({ circuit, label }: { circuit: Circuit; label: string }) {
  const { scene, sub } = useMemo(() => {
    const at = drawingAt(circuit, "");
    return { scene: sceneOf(straighten(at.drawing)), sub: at.circuit };
  }, [circuit]);
  return (
    <svg
      className="circuit circuit-overview circuit-thumbnail"
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      role="img"
      aria-label={label}
    >
      <g className="wires">
        {scene.wires.map((w, i) => {
          const net = netOfWire(sub, w.from);
          const wide = net !== undefined && (sub.nets[net]?.width ?? 1) > 1;
          return (
            <g key={i} className={`wire${wide ? " wire-word" : ""}`}>
              <path d={w.d} fill="none" />
            </g>
          );
        })}
      </g>
      <g className="parts">
        {scene.boxes.map(({ part, x, y, w, h }) => {
          const pin = part.kind === "input" || part.kind === "output";
          return (
            <g
              key={part.id}
              className={pin ? `pin pin-${part.kind}` : `part part-${part.kind}`}
              transform={`translate(${x} ${y})`}
            >
              {pin ? (
                <rect width={w} height={h} rx={4} />
              ) : isShaped(part.kind) ? (
                <GateSymbol kind={part.kind} h={h} />
              ) : (
                <rect x={2} y={2} width={w - 4} height={h - 4} rx={4} className="box" />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
