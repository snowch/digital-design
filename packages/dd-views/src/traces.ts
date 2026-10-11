// Copyright © 2026 Christopher Snow

// Reading a trace: the value of a net at a time, and the segments of a lane for drawing.

import {
  RESET_RISE,
  equal,
  unknown,
  type Circuit,
  type NetId,
  type Trace,
  type Word,
} from "@dd/sim";

/** The value of every net at time `t`: the last change at or before `t`, else X. */
export function valuesAt(circuit: Circuit, trace: Trace, t: number): Word[] {
  const values = circuit.nets.map((n) => unknown(n.width));
  for (const e of trace.events) {
    if (e.time > t) break;
    values[e.net] = e.value;
  }
  return values;
}

export interface Segment {
  readonly from: number;
  readonly to: number;
  readonly value: Word;
  /** Set on the segment an overlay produced (the recorded draw). */
  readonly overlay?: boolean;
}

/** The lane of one net between `from` and `to`, as segments of constant value. */
export function segmentsOf(
  circuit: Circuit,
  trace: Trace,
  net: NetId,
  from: number,
  to: number,
): Segment[] {
  const width = circuit.nets[net]?.width ?? 1;
  let value: Word = unknown(width);
  let start = from;
  let overlay = false;
  const out: Segment[] = [];
  for (const e of trace.events) {
    if (e.net !== net) continue;
    if (e.time <= from) {
      value = e.value;
      overlay = e.cause === "overlay";
      continue;
    }
    if (e.time > to) break;
    if (e.time > start)
      out.push({ from: start, to: e.time, value, ...(overlay ? { overlay: true } : {}) });
    start = e.time;
    value = e.value;
    overlay = e.cause === "overlay";
  }
  if (to > start) out.push({ from: start, to, value, ...(overlay ? { overlay: true } : {}) });
  // A value that changed and changed back within one settle leaves two stretches of one value:
  // drawn as one, so its label is written once, where the value differs from the stretch before.
  const merged: Segment[] = [];
  for (const sg of out) {
    const last = merged.at(-1);
    if (last && equal(last.value, sg.value) && !last.overlay === !sg.overlay)
      merged[merged.length - 1] = { ...last, to: sg.to };
    else merged.push(sg);
  }
  return merged;
}

/**
 * The mark a rise of the clock gets while the reset is held: the diagram names it as the reset.
 * The simulator's `clockCycle` marks it so, whoever clocks it.
 */
export { RESET_RISE };

/**
 * The marks as a diagram writes them: each bare rise numbered from the last reset (↑1, ↑2), the
 * reset's rise named, a fall left unnamed, a step's own label kept.
 */
export function marksShown(
  marks: readonly { readonly time: number; readonly label: string }[],
  resetLabel: string,
): { time: number; label: string }[] {
  let n = 0;
  const out: { time: number; label: string }[] = [];
  for (const m of marks) {
    if (m.label === "↓" || m.label === "") continue;
    if (m.label === RESET_RISE) {
      n = 0;
      out.push({ time: m.time, label: resetLabel });
    } else if (m.label === "↑") out.push({ time: m.time, label: `↑${++n}` });
    else out.push({ time: m.time, label: m.label });
  }
  return out;
}

/** The last time anything happened in the trace. */
export function traceEnd(trace: Trace): number {
  let end = 0;
  for (const e of trace.events) end = Math.max(end, e.time);
  for (const s of trace.stimuli) end = Math.max(end, s.time);
  for (const m of trace.marks) end = Math.max(end, m.time);
  return end;
}
