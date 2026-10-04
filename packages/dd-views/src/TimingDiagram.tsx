// A timing diagram from a trace: one lane per signal, levels drawn as steps, X as a hatched band
// between the levels, bus values as text, clock edges marked on the axis. A cursor picks a time
// and the table under the diagram says every shown signal's value there, so the picture is
// never the only carrier. The cursor is a slider, which a keyboard and a finger can both move.

import { useId, useMemo } from "react";

import { formatWord, type Circuit, type Trace, type Word } from "@dd/sim";

import { levelOf } from "./CircuitView";
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
  readonly signals?: readonly (string | { readonly net: string; readonly label: string })[];
  readonly from?: number;
  readonly to?: number;
  readonly cursor?: number;
  readonly onCursor?: (time: number) => void;
  readonly shades?: readonly Shade[];
  readonly title: string;
  /** Show the table of values at the cursor. Default true. */
  readonly table?: boolean;
}

const LANE_H = 34;
const LANE_GAP = 10;
const LABEL_W = 64;
const AXIS_H = 40;

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
  const id = useId();
  const end = to ?? Math.max(traceEnd(trace), from + 1);
  const wanted = signals ?? [
    ...circuit.inputs.map((p) => p.name),
    ...circuit.outputs.map((p) => p.name),
  ];
  const lanes = wanted
    .map((w) =>
      typeof w === "string"
        ? { name: w, net: resolveNet(circuit, w) }
        : { name: w.label, net: resolveNet(circuit, w.net) },
    )
    .filter((l): l is { name: string; net: number } => l.net !== undefined);
  const span = Math.max(1, end - from);
  // Readable at one pixel per unit at the least; a long run scrolls sideways in its wrapper.
  const unit = Math.max(2, Math.min(48, 700 / span));
  const width = LABEL_W + span * unit + 16;
  const height = AXIS_H + lanes.length * (LANE_H + LANE_GAP) + 8;
  const x = (t: number) => LABEL_W + (t - from) * unit;
  const at = cursor ?? end;
  const cursorValues = useMemo(() => valuesAt(circuit, trace, at), [circuit, trace, at]);

  const laneY = (i: number) => AXIS_H + i * (LANE_H + LANE_GAP);
  const yFor = (top: number, value: Word): number => {
    const level = levelOf(value);
    if (level === "high") return top + 4;
    if (level === "low") return top + LANE_H - 4;
    return top + LANE_H / 2;
  };

  // Axis ticks: the trace's marks on their own row, staggered onto a second row when two sit
  // closer than a label's width; a number at every unit when there are few, except under a mark;
  // the first and last labels anchored inwards so nothing leaves the drawing.
  const ticks = trace.marks.filter((m) => m.time >= from && m.time <= end);
  const markTimes = new Set(ticks.map((m) => m.time));
  const plain = span <= 24 ? Array.from({ length: span + 1 }, (_, i) => from + i) : [];
  const anchorAt = (t: number) => (t <= from ? "start" : t >= end ? "end" : "middle");
  const markRows: { time: number; label: string; row: number }[] = [];
  let lastX = -Infinity;
  let lastRow = 1;
  for (const m of ticks) {
    const px = x(m.time);
    const row = px - lastX < 64 ? 1 - lastRow : 0;
    markRows.push({ time: m.time, label: m.label, row });
    lastX = px;
    lastRow = row;
  }

  return (
    <div className="timing">
      <div className="timing-scroll">
        <svg
          className="timing-diagram"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          style={{
            width: "100%",
            height: "auto",
            minWidth: `${Math.min(width, 1400)}px`,
            maxWidth: `${width * 1.4}px`,
          }}
        >
          <title id={`${id}-title`}>{title}</title>
          <defs>
            <pattern
              id={`${id}-hatch`}
              width={6}
              height={6}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1={0} y1={0} x2={0} y2={6} className="hatch" />
            </pattern>
          </defs>
          {shades.map((s, i) => (
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
          ))}
          <g className="axis">
            <line x1={LABEL_W} y1={AXIS_H - 4} x2={width - 8} y2={AXIS_H - 4} />
            {plain.map((t) => (
              <g key={t}>
                <line x1={x(t)} y1={AXIS_H - 8} x2={x(t)} y2={AXIS_H - 4} />
                {span <= 12 && !markTimes.has(t) && (
                  <text x={x(t)} y={AXIS_H - 11} textAnchor={anchorAt(t)} className="tick-label">
                    {t}
                  </text>
                )}
              </g>
            ))}
            {markRows.map((m, i) => (
              <text
                key={`m${i}`}
                x={x(m.time)}
                y={m.row === 0 ? 9 : 24}
                textAnchor={anchorAt(m.time)}
                className="mark-label"
              >
                {m.label}
              </text>
            ))}
          </g>
          {lanes.map((lane, i) => {
            const top = laneY(i);
            const segs = segmentsOf(circuit, trace, lane.net, from, end);
            const width1 = (circuit.nets[lane.net]?.width ?? 1) === 1;
            let d = "";
            segs.forEach((s, j) => {
              const y = yFor(top, s.value);
              d += `${j === 0 ? "M" : "L"} ${x(s.from)} ${y} L ${x(s.to)} ${y} `;
            });
            return (
              <g key={lane.name} className="lane" data-signal={lane.name}>
                <text
                  x={LABEL_W - 8}
                  y={top + LANE_H / 2 + 4}
                  textAnchor="end"
                  className="lane-label"
                >
                  {lane.name}
                </text>
                <line
                  x1={LABEL_W}
                  y1={top + LANE_H}
                  x2={width - 8}
                  y2={top + LANE_H}
                  className="lane-base"
                />
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
                        <text x={x(s.from) + 4} y={top + LANE_H / 2 + 4} className="bus-value">
                          {formatWord(s.value, 16)}
                        </text>
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
              </g>
            );
          })}
          <g className="cursor" aria-hidden="true">
            <line x1={x(at)} y1={AXIS_H - 4} x2={x(at)} y2={height - 4} />
          </g>
        </svg>
      </div>
      {onCursor && (
        <label className="timing-cursor">
          <span>{format(strings.timing.cursor, { time: at })}</span>
          <input
            type="range"
            min={from}
            max={end}
            step={1}
            value={at}
            onChange={(e) => onCursor(Number(e.target.value))}
          />
        </label>
      )}
      {table && (
        <table className="signal-table timing-table">
          <caption>{format(strings.timing.valuesAt, { time: at })}</caption>
          <thead>
            <tr>
              <th scope="col">{strings.circuit.signal}</th>
              <th scope="col">{strings.circuit.value}</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => {
              const v = cursorValues[lane.net];
              return (
                <tr key={lane.name}>
                  <th scope="row">{lane.name}</th>
                  <td className={`value-${levelOf(v)}`}>
                    {v ? formatWord(v, v.width === 1 ? 2 : 16) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
