// Reading a trace: the value of a net at a time, and the segments of a lane for drawing.

import { unknown, type Circuit, type NetId, type Trace, type Word } from "@dd/sim";

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
