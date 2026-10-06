// Copyright © 2026 Christopher Snow

// A timing diagram from a trace: one lane per signal, levels drawn as steps, X as a hatched band
// between the levels, bus values as text, clock edges marked on the axis. A cursor picks a time
// and the table under the diagram says every shown signal's value there, so the picture is
// never the only carrier. The cursor is a slider, which a keyboard and a finger can both move.

import { useMemo } from "react";

import { AXIS_H, LANE_H, StateInspector, Timeline } from "@dd/primitives";
import { formatWord, type Circuit, type Trace, type Word } from "@dd/sim";

import { levelOf, valueLabel } from "./CircuitView";
import { format, useViewStrings } from "./strings";
import { segmentsOf, traceEnd, valuesAt } from "./traces";

export interface Shade {
  readonly from: number;
  readonly to: number;
  readonly label: string;
  readonly kind: "setup" | "hold" | "note";
}

export interface TimingDiagramProps {
  readonly circuit: Circuit;
  readonly trace: Trace;
  /** Nets to show, in order, by name or with a label to show instead. Default: inputs then outputs. */
  readonly signals?: readonly (
    | string
    | {
        readonly net: string;
        readonly label: string;
        /** Module 5: a name for some values of a word, such as a state's name for its code. */
        readonly names?: Readonly<Record<string, string>>;
      }
  )[];
  readonly from?: number;
  readonly to?: number;
  readonly cursor?: number;
  readonly onCursor?: (time: number) => void;
  readonly shades?: readonly Shade[];
  readonly title: string;
  /** Show the table of values at the cursor. Default true. */
  readonly table?: boolean;
}

/** A net by its port name (an input or output of the circuit) or by its own name. */
function resolveNet(circuit: Circuit, name: string): number | undefined {
  return (
    circuit.outputs.find((p) => p.name === name)?.net ??
    circuit.inputs.find((p) => p.name === name)?.net ??
    circuit.nets.find((n) => n.name === name)?.id
  );
}

export function TimingDiagram({
  circuit,
  trace,
  signals,
  from = 0,
  to,
  cursor,
  onCursor,
  shades = [],
  title,
  table = true,
}: TimingDiagramProps) {
  const strings = useViewStrings();
  const end = to ?? Math.max(traceEnd(trace), from + 1);
  const wanted = signals ?? [
    ...circuit.inputs.map((p) => p.name),
    ...circuit.outputs.map((p) => p.name),
  ];
  const lanes = wanted
    .map((w) =>
      typeof w === "string"
        ? { name: w, net: resolveNet(circuit, w) }
        : { name: w.label, net: resolveNet(circuit, w.net), names: w.names },
    )
    .filter(
      (
        l,
      ): l is { name: string; net: number; names: Readonly<Record<string, string>> | undefined } =>
        l.net !== undefined,
    );
  // Module 5: a word written with its name where the lane gives one: `TRY 01`.
  const laneValue = (names: Readonly<Record<string, string>> | undefined, v: Word | undefined) => {
    const named = v && names ? names[formatWord(v)] : undefined;
    return named ? `${named} ${valueLabel(v)}` : valueLabel(v);
  };
  const at = cursor ?? end;
  const cursorValues = useMemo(() => valuesAt(circuit, trace, at), [circuit, trace, at]);
  const yFor = (top: number, value: Word): number => {
    const level = levelOf(value);
    if (level === "high") return top + 4;
    if (level === "low") return top + LANE_H - 4;
    return top + LANE_H / 2;
  };

  return (
    <Timeline
      lanes={lanes.map((l) => ({ label: l.name }))}
      from={from}
      end={end}
      marks={trace.marks}
      cursor={at}
      {...(onCursor ? { onCursor } : {})}
      cursorLabel={format(strings.timing.cursor, { time: at })}
      title={title}
      scrollNote={strings.circuit.scrollNote}
      // A drawing wider than its wrapper opens on the first shaded band, or else the cursor.
      focus={shades[0]?.from ?? cursor ?? from}
      defs={({ id }) => (
        <pattern
          id={`${id}-hatch`}
          width={6}
          height={6}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={6} className="hatch" />
        </pattern>
      )}
      background={({ x, unit, height }) =>
        shades.map((s, i) => (
          <g key={i} className={`shade shade-${s.kind}`}>
            <rect
              x={x(Math.max(s.from, from))}
              y={AXIS_H - 4}
              width={Math.max(0, (Math.min(s.to, end) - Math.max(s.from, from)) * unit)}
              height={height - AXIS_H}
            />
            <text x={x(Math.max(s.from, from)) + 3} y={AXIS_H - 8} className="shade-label">
              {s.label}
            </text>
          </g>
        ))
      }
      renderLane={(i, top, { x, unit, id }) => {
        const lane = lanes[i];
        if (!lane) return null;
        const segs = segmentsOf(circuit, trace, lane.net, from, end);
        const width1 = (circuit.nets[lane.net]?.width ?? 1) === 1;
        let d = "";
        segs.forEach((s, j) => {
          const y = yFor(top, s.value);
          d += `${j === 0 ? "M" : "L"} ${x(s.from)} ${y} L ${x(s.to)} ${y} `;
        });
        return (
          <>
            {segs.map((s, j) => {
              const level = levelOf(s.value);
              if (level === "unknown") {
                return (
                  <rect
                    key={j}
                    x={x(s.from)}
                    y={top + 4}
                    width={(s.to - s.from) * unit}
                    height={LANE_H - 8}
                    fill={`url(#${id}-hatch)`}
                    className={`unknown-band${s.overlay ? " overlay-band" : ""}`}
                  />
                );
              }
              if (!width1) {
                return (
                  <g key={j} className="bus-segment">
                    <rect
                      x={x(s.from)}
                      y={top + 4}
                      width={(s.to - s.from) * unit}
                      height={LANE_H - 8}
                    />
                    {/* A named value is written only where it fits its stretch of the lane. */}
                    {(!lane.names ||
                      laneValue(lane.names, s.value).length * 7.5 + 8 <=
                        (s.to - s.from) * unit) && (
                      <text x={x(s.from) + 4} y={top + LANE_H / 2 + 4} className="bus-value">
                        {laneValue(lane.names, s.value)}
                      </text>
                    )}
                  </g>
                );
              }
              return null;
            })}
            {width1 && <path d={d} className="level" fill="none" />}
            {width1 &&
              segs.map((s, j) =>
                (s.to - s.from) * unit >= 14 ? (
                  <text
                    key={`v${j}`}
                    x={x(s.from) + 3}
                    y={yFor(top, s.value) + (levelOf(s.value) === "high" ? 12 : -5)}
                    className={`level-label level-${levelOf(s.value)}`}
                  >
                    {formatWord(s.value)}
                  </text>
                ) : null,
              )}
          </>
        );
      }}
    >
      {table && (
        <StateInspector
          className="signal-table timing-table"
          caption={format(strings.timing.valuesAt, { time: at })}
          headings={[strings.circuit.signal, strings.circuit.value]}
          rows={lanes.map((lane) => {
            const v = cursorValues[lane.net];
            return {
              key: lane.name,
              name: lane.name,
              cells: [{ text: laneValue(lane.names, v), className: `value-${levelOf(v)}` }],
            };
          })}
        />
      )}
    </Timeline>
  );
}
