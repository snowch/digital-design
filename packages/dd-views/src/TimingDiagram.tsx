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
  /** The time a drawing wider than its wrapper opens on, when it is not the red line. */
  readonly focus?: number;
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

/** The widest a unit of time is drawn, in pixels, as the shared timeline draws it. */
const UNIT_MAX = 48;
const UNITS_SHOWN = 700;
/** About how wide a character of a lane's value is drawn, in pixels, and the room around it. */
const CHAR_W = 7.5;
const VALUE_PAD = 8;
/** The most room a unit of time is given for a value: a value wider than that is the table's. */
const VALUE_UNIT_MAX = 80;

/**
 * A short run whose named steps are wider than the unit of time they stand a unit apart in: the
 * run stretched in time, every time multiplied, so each step's name has room beside the next (the
 * shared timeline draws a unit at most 48 pixels wide, and a step's name can be three times that).
 */
function roomFor(trace: Trace, from: number, resetLabel: string): number {
  const marks = marksShown(trace.marks, resetLabel);
  if (marks.length < 2) return 1;
  let gap = Infinity;
  let widest = 0;
  marks.forEach((m, k) => {
    const next = marks[k + 1];
    if (next && next.time > m.time) gap = Math.min(gap, next.time - m.time);
    widest = Math.max(widest, m.label.length * 7.5 + 12);
  });
  const span = Math.max(1, traceEnd(trace) + 1 - from);
  const most = Math.max(1, Math.floor(UNITS_SHOWN / UNIT_MAX / span));
  return Math.max(1, Math.min(most, 8, Math.ceil(widest / (UNIT_MAX * gap))));
}

/** Every time in a trace multiplied from `from`. */
function stretched(trace: Trace, from: number, by: number): Trace {
  if (by === 1) return trace;
  const at = (t: number) => from + (t - from) * by;
  return {
    ...trace,
    events: trace.events.map((e) => ({ ...e, time: at(e.time) })),
    stimuli: trace.stimuli.map((e) => ({ ...e, time: at(e.time) })),
    marks: trace.marks.map((m) => ({ ...m, time: at(m.time) })),
  };
}

export function TimingDiagram({
  circuit,
  trace: given,
  signals,
  from = 0,
  to,
  cursor,
  onCursor,
  focus,
  shades = [],
  units,
  table = true,
}: TimingDiagramProps) {
  const strings = useViewStrings();
  // A figure with no slider, whose times nobody reads, gets room for its steps' names.
  const by =
    onCursor || units || to !== undefined ? 1 : roomFor(given, from, strings.timing.resetRise);
  const trace = useMemo(() => stretched(given, from, by), [given, from, by, given.events.length]);
  // The run's last instant, where the red line stands by default; the drawing runs one step past
  // it (an edge, or a setting), so the values the last step left are drawn, not only listed. A
  // window that ends before the run does (`to`) draws its last values, not what comes after.
  const last = to ?? traceEnd(trace);
  const stepMarks = marksShown(trace.marks, strings.timing.resetRise);
  const gaps = stepMarks.slice(1).map((m, k) => m.time - (stepMarks[k]?.time ?? m.time));
  const tail = Math.max(1, Math.min(2, ...gaps.filter((g) => g > 0)));
  const end = Math.max(last + tail, from + 1);
  const drawn = useMemo(
    () =>
      to === undefined ? trace : { ...trace, events: trace.events.filter((e) => e.time <= to) },
    [trace, to, trace.events.length],
  );
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
  // One form per lane, the one the prose uses: a state by its name alone (TRY, FETCH), a word by
  // the figure's own label for it, else its digits.
  const laneValue = (
    names: Readonly<Record<string, string>> | undefined,
    v: Word | undefined,
    labels?: Readonly<Record<string, string>>,
  ) => {
    const label = v && labels ? labels[formatWord(v)] : undefined;
    if (label !== undefined) return label;
    const named = v && names ? names[formatWord(v)] : undefined;
    return named ?? valueLabel(v);
  };
  const at = cursor ?? last;
  // A slider on a run in steps stops at the run's last change: past it nothing changes. The drawing
  // runs on one step further, so the newest box is a full one.
  const lastChange = Math.max(
    from,
    ...trace.events.filter((e) => e.time <= last).map((e) => e.time),
    ...stepMarks.filter((m) => m.time <= last).map((m) => m.time),
  );
  const moveCursor = onCursor
    ? units
      ? onCursor
      : (t: number) => onCursor(Math.min(t, lastChange))
    : undefined;
  // The axis's marks: the run's steps as the lesson counts them, or, in units, a mark every
  // `ticks` units from the start and at each time the figure names.
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
  // In units, the trace's own named marks (4.1's edge) stand with the ticks, a tick at a named
  // time left out.
  const named = new Set(stepMarks.map((m) => m.time));
  const shownMarks = units
    ? [
        // A tick at a named time is left out; the shared timeline gives the rest their rows.
        ...unitMarks.filter((m) => !named.has(m.time)),
        ...stepMarks,
      ].sort((a, b) => a.time - b.time)
    : stepMarks;
  // Where the red line stands, by the run's own marks: at a mark, after the last one before it,
  // or before the first; "after the run" only where the run has no marks.
  const where = (t: number) => {
    const on = stepMarks.find((m) => m.time === t);
    if (on) return format(strings.timing.atMark, { mark: on.label });
    const before = stepMarks.filter((m) => m.time < t).at(-1);
    if (before) return format(strings.timing.afterMark, { mark: before.label });
    const next = stepMarks.find((m) => m.time > t);
    if (next) return format(strings.timing.beforeMark, { mark: next.label });
    return t >= last ? strings.timing.afterRun : strings.timing.atStart;
  };
  // Room for every value: the fewest pixels a unit needs so that each word's stretch holds it. With
  // a slider the red line may stand anywhere, so a stretch must hold the word on one side of the
  // line at the worst place, its middle: the scale then does not change as the slider moves.
  const minUnit = useMemo(() => {
    let need = 0;
    for (const lane of lanes) {
      if ((circuit.nets[lane.net]?.width ?? 1) === 1) continue;
      for (const sg of segmentsOf(circuit, drawn, lane.net, from, end)) {
        if (levelOf(sg.value) === "unknown") continue;
        const w = laneValue(lane.names, sg.value, lane.labels).length * CHAR_W + VALUE_PAD;
        const whole = sg.to - sg.from;
        const room = onCursor
          ? whole / 2
          : at >= sg.from && at < sg.to
            ? Math.max(sg.to - at, at - sg.from)
            : whole;
        if (room > 0) need = Math.max(need, w / room);
      }
    }
    return Math.min(VALUE_UNIT_MAX, need);
  }, [circuit, drawn, lanes, from, end, at, onCursor, drawn.events.length]);
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
      minUnit={minUnit}
      {...(moveCursor ? { onCursor: moveCursor } : {})}
      cursorLabel={
        units
          ? format(strings.timing.cursor, { time: at })
          : format(strings.timing.cursorAt, { where: where(at) })
      }
      title={strings.timing.title}
      scrollNote={strings.circuit.scrollNote}
      // A drawing wider than its wrapper opens on the red line and follows it, as a slider moves it
      // or a running figure grows: a figure with no cursor has it at the trace's end, the moment
      // its question asks about. With no slider, a shaded band is what it opens on.
      focus={focus ?? (onCursor ? at : (shades[0]?.from ?? at))}
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
            <text x={x(Math.max(s.from, from)) + 3} y={AXIS_H - 5} className="shade-label">
              {s.label}
            </text>
          </g>
        ))
      }
      renderLane={(i, top, { x, unit, id }) => {
        const lane = lanes[i];
        if (!lane) return null;
        const segs = segmentsOf(circuit, drawn, lane.net, from, end);
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
                // The value in the lane's one form, at its stretch's start; in the stretch the red
                // line stands in, beside the line, where a drawing that opens on the line shows it.
                // Where it does not fit, the table gives it.
                const text = laneValue(lane.names, s.value, lane.labels);
                const w = text.length * CHAR_W;
                const x0 = x(s.from) + 4;
                const x1 = x(s.to) - 4;
                const red = x(at);
                const holds = at >= s.from && at < s.to;
                const starts = holds ? [red + 4, red - 4 - w, x0] : [x0];
                const startAt = starts.find((a) => a >= x0 && a + w <= x1 + 0.5);
                const placed = startAt === undefined ? undefined : { text, startAt };
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
