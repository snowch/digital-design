// Copyright © 2026 Christopher Snow

// A timing diagram from a trace: one lane per signal, levels drawn as steps, X as a hatched band
// between the levels, bus values as text, clock edges marked on the axis. A cursor picks a time
// and the table under the diagram says every shown signal's value there, so the picture is
// never the only carrier. The cursor is a slider, which a keyboard and a finger can both move.

import { useMemo } from "react";

import { AXIS_H, LANE_H, StateInspector, Timeline } from "@platform/primitives";
import { formatWord, type Circuit, type Trace, type Word } from "@dd/sim";

import { levelOf, valueLabel } from "./CircuitView";
import { format, useViewStrings } from "./strings";
import { marksShown, segmentsOf, traceEnd, valuesAt } from "./traces";

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
        /**
         * Module 8: the text written for some values of a word in place of its digits, such as a
         * 64-bit word read signed; written only where it fits its stretch of the lane.
         */
        readonly labels?: Readonly<Record<string, string>>;
      }
  )[];
  readonly from?: number;
  readonly to?: number;
  readonly cursor?: number;
  readonly onCursor?: (time: number) => void;
  readonly shades?: readonly Shade[];
  /**
   * Time in units, for the gate-delay figures of the lesson that defines them (4.1): the red line
   * and the table say the time, and the axis is marked every `ticks` units. Otherwise they say
   * where the red line stands among the steps the axis names.
   */
  readonly units?: {
    readonly ticks?: number;
    /** Where the ticks count from, written as 0: the clock's edge in 4.1's setup and hold. */
    readonly origin?: number;
    readonly marks?: readonly number[];
  };
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
  units,
  table = true,
}: TimingDiagramProps) {
  const strings = useViewStrings();
  // The run's last instant, where the red line stands by default; the drawing runs one unit past
  // it, so the values the last step left are drawn, not only listed.
  const last = to ?? traceEnd(trace);
  const end = to ?? Math.max(last + 1, from + 1);
  const wanted = signals ?? [
    ...circuit.inputs.map((p) => p.name),
    ...circuit.outputs.map((p) => p.name),
  ];
  const lanes = wanted
    .map((w) =>
      typeof w === "string"
        ? { name: w, net: resolveNet(circuit, w) }
        : {
            name: w.label,
            net: resolveNet(circuit, w.net),
            names: w.names,
            labels: "labels" in w ? w.labels : undefined,
          },
    )
    .filter(
      (
        l,
      ): l is {
        name: string;
        net: number;
        names: Readonly<Record<string, string>> | undefined;
        labels: Readonly<Record<string, string>> | undefined;
      } => l.net !== undefined,
    );
  // Module 5: a word written with its name where the lane gives one: `TRY 01`.
  const laneValue = (
    names: Readonly<Record<string, string>> | undefined,
    v: Word | undefined,
    labels?: Readonly<Record<string, string>>,
  ) => {
    const label = v && labels ? labels[formatWord(v)] : undefined;
    if (label !== undefined) return label;
    const named = v && names ? names[formatWord(v)] : undefined;
    return named ? `${named} ${valueLabel(v)}` : valueLabel(v);
  };
  const at = cursor ?? last;
  // The axis's marks: the run's steps as the lesson counts them, or, in units, a mark every
  // `ticks` units from the start and at each time the figure names.
  const stepMarks = marksShown(trace.marks, strings.timing.resetRise);
  const unitMarks = units
    ? [
        ...(units.ticks
          ? (() => {
              const step = units.ticks;
              const origin = units.origin ?? from;
              const first = origin + Math.ceil((from - origin) / step) * step;
              return Array.from({ length: Math.floor((end - first) / step) + 1 }, (_, k) => {
                const t = first + k * step;
                return { time: t, label: String(t - origin) };
              });
            })()
          : []),
        ...(units.marks ?? []).map((t) => ({ time: t, label: String(t) })),
      ].sort((a, b) => a.time - b.time)
    : [];
  const shownMarks = units ? unitMarks : stepMarks;
  // Where the red line stands, in the run's own steps.
  const where = (t: number) => {
    if (t >= last) return strings.timing.afterRun;
    const before = stepMarks.filter((m) => m.time <= t).at(-1);
    return before
      ? format(strings.timing.afterMark, { mark: before.label })
      : strings.timing.atStart;
  };
  // A running figure grows its trace in place, and a press between edges moves no time: the event
  // count tells the table that the trace changed.
  const events = trace.events.length;
  const cursorValues = useMemo(() => valuesAt(circuit, trace, at), [circuit, trace, at, events]);
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
      marks={shownMarks}
      cursor={at}
      {...(onCursor ? { onCursor } : {})}
      cursorLabel={
        units
          ? format(strings.timing.cursor, { time: at })
          : format(strings.timing.cursorAt, { where: where(at) })
      }
      title={strings.timing.title}
      scrollNote={strings.circuit.scrollNote}
      // A drawing wider than its wrapper opens on the first shaded band, or else on the red line,
      // and follows the red line as a running figure grows: a figure with no cursor has it at the
      // trace's end, the moment its question asks about.
      focus={shades[0]?.from ?? at}
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
                // The value's forms, longest first: its label, or its name with its code, then the
                // name alone, then the code alone. The longest that fits its stretch is written,
                // clear of the red line; where none fits, the table gives it.
                const full = laneValue(lane.names, s.value, lane.labels);
                const named = lane.names ? lane.names[formatWord(s.value)] : undefined;
                const forms = [full, ...(named ? [named, valueLabel(s.value)] : [])];
                const x0 = x(s.from) + 4;
                const x1 = x(s.to) - 4;
                const red = x(at);
                const placed = forms
                  .map((text) => {
                    const w = text.length * 7.5;
                    // Before the red line where it falls inside the stretch, else after it.
                    const startAt = red > x0 && red < x0 + w ? red + 4 : x0;
                    return { text, startAt, fits: startAt + w <= x1 + 4 };
                  })
                  .find((f) => f.fits);
                return (
                  <g key={j} className="bus-segment">
                    <rect
                      x={x(s.from)}
                      y={top + 4}
                      width={(s.to - s.from) * unit}
                      height={LANE_H - 8}
                    />
                    {placed && (
                      <text x={placed.startAt} y={top + LANE_H / 2 + 4} className="bus-value">
                        {placed.text}
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
          caption={
            // In units the slider gives the time; the caption does not give it again.
            units
              ? strings.timing.valuesHere
              : format(strings.timing.valuesAfter, { where: where(at) })
          }
          headings={[strings.circuit.signal, strings.circuit.value]}
          rows={lanes.map((lane) => {
            const v = cursorValues[lane.net];
            return {
              key: lane.name,
              name: lane.name,
              cells: [
                { text: laneValue(lane.names, v, lane.labels), className: `value-${levelOf(v)}` },
              ],
            };
          })}
        />
      )}
    </Timeline>
  );
}
