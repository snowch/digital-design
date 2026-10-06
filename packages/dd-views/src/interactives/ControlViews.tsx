// Copyright © 2026 Christopher Snow

// Module 9: the control figures. The decoder's rows as a table, kind by kind; the map of every
// kind and job the decoder knows; each kind's sequence of edges through the controller; and the
// views of one edge that the datapath figure shows beside the machine of several edges: the
// instruction's micro-operations and the control signals at the next edge. Every value is the
// simulator's: the table and the map run the decoder's own circuit, the sequences run the
// controller's, and the views read the machine's nets.

import { useMemo } from "react";
import { z } from "zod";

import {
  CONTROL_SIGNALS,
  CONTROL_STATES,
  controllerMachine,
  decoderCircuit,
  machineCircuit,
  type ControlState,
  type EdgeView,
  type MicroOp,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";
import { Simulator, word, type Circuit } from "@dd/sim";

import { format, useViewStrings, type ControlStrings } from "../strings";
import { withProps } from "./props";

type Outs = Record<string, number | undefined>;

/** The decoder's outputs for one instruction's digits, run on its circuit. */
function decode(sim: Simulator, k: number, j: number, c: number): Outs {
  sim.setInput("K", word(4, k));
  sim.setInput("J", word(4, j));
  sim.setInput("C", word(12, c));
  sim.settle();
  return Object.fromEntries(
    Object.entries(sim.outputs()).map(([n, w]) => [
      n,
      w.known === (1n << BigInt(w.width)) - 1n ? Number(w.value) : undefined,
    ]),
  );
}

const ILLEGAL = 0x21;

/** The jobs of a kind the decoder takes as an instruction, with the constant 0. */
function legalJobs(sim: Simulator, k: number): number[] {
  return Array.from({ length: 16 }, (_, j) => j).filter(
    (j) => decode(sim, k, j, 0)["CAUSED"] !== ILLEGAL,
  );
}

/** A table cell: 0 or 1 for every job of the kind, or the job bit the signal follows. */
export function signalCell(sim: Simulator, k: number, signal: string): string {
  const jobs = legalJobs(sim, k);
  const values = jobs.map((j) => decode(sim, k, j, 0)[signal]);
  if (values.every((v) => v === values[0])) return String(values[0] ?? "X");
  for (const bit of [3, 2, 1, 0])
    if (jobs.every((j, i) => values[i] === ((j >> bit) & 1))) return `J${bit}`;
  return "X";
}

const TableProps = z.object({
  kinds: z.array(z.number().int().min(1).max(15)).default([1, 2, 3, 4, 5, 6, 7, 8]),
  signals: z.array(z.string()).default([...CONTROL_SIGNALS]),
  callThroughRegister: z.boolean().default(false),
});

export const ControlTable = withProps(
  TableProps,
  function ControlTable({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof TableProps> }) {
    const t = useViewStrings().control;
    const cells = useMemo(() => {
      const sim = new Simulator(decoderCircuit({ callThroughRegister: data.callThroughRegister }));
      return data.signals.map((s) => data.kinds.map((k) => signalCell(sim, k, s)));
    }, [data.kinds, data.signals, data.callThroughRegister]);
    const shown = (v: string) => (v.startsWith("J") ? format(t.jobBit, { bit: v.slice(1) }) : v);
    return (
      <div className="control-table" data-interactive={interactive.id}>
        <div className="truth-table-wrap">
          <table className="truth-table control-signals-table">
            <caption>{t.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.signal}</th>
                {data.kinds.map((k) => (
                  <th scope="col" key={k}>
                    {format(t.kindHeading, { kind: k.toString(16).toUpperCase() })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.signals.map((s, i) => (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  {data.kinds.map((k, c) => {
                    const v = cells[i]?.[c] ?? "X";
                    return (
                      <td
                        key={k}
                        className={v === "1" ? "cell-on" : v === "0" ? "cell-off" : "cell-job"}
                      >
                        {shown(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="control-legend">
          {data.kinds.map((k) => (
            <li key={k}>{t.kinds[String(k)] ?? String(k)}</li>
          ))}
          <li>{t.jobBitNote}</li>
        </ul>
      </div>
    );
  },
);

const MapProps = z.object({
  callThroughRegister: z.boolean().default(false),
});

/** Each kind and job: an instruction, illegal, or an instruction for some constants alone. */
export function kindMap(callThroughRegister = false): ("legal" | "illegal" | "depends")[][] {
  const sim = new Simulator(decoderCircuit({ callThroughRegister }));
  return Array.from({ length: 16 }, (_, k) =>
    Array.from({ length: 16 }, (_, j) => {
      const a = decode(sim, k, j, 0)["CAUSED"] === ILLEGAL;
      const b = decode(sim, k, j, 5)["CAUSED"] === ILLEGAL;
      return a && b ? "illegal" : !a && !b ? "legal" : "depends";
    }),
  );
}

export const KindMap = withProps(
  MapProps,
  function KindMap({ data, interactive }: InteractiveProps & { data: z.infer<typeof MapProps> }) {
    const t = useViewStrings().control;
    const map = useMemo(() => kindMap(data.callThroughRegister), [data.callThroughRegister]);
    const hex = (n: number) => n.toString(16).toUpperCase();
    const mark = { legal: t.legal, illegal: t.illegal, depends: t.depends };
    const meaning = { legal: t.legalMeaning, illegal: t.illegalMeaning, depends: t.dependsMeaning };
    return (
      <div className="kind-map" data-interactive={interactive.id}>
        <div className="truth-table-wrap">
          <table className="truth-table kind-map-table">
            <caption>{t.mapCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.mapCorner}</th>
                {map.map((_, j) => (
                  <th scope="col" key={j}>
                    {hex(j)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {map.map((row, k) => (
                <tr key={k}>
                  <th scope="row">{hex(k)}</th>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`kind-map-${cell}`}
                      aria-label={format(t.cellLabel, {
                        k: hex(k),
                        j: hex(j),
                        meaning: meaning[cell],
                      })}
                    >
                      {mark[cell]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="control-legend">{t.legend}</p>
      </div>
    );
  },
);

const EdgesProps = z.object({
  kinds: z.array(z.number().int().min(1).max(15)).default([1, 2, 3, 4, 5, 6, 7]),
  callThroughRegister: z.boolean().default(false),
});

/** A job of each kind the sequences run: one the kind defines. */
const SAMPLE_JOB: Readonly<Record<number, number>> = { 1: 2, 2: 2, 3: 0, 4: 0, 5: 2 };

/**
 * Each kind's states, from the fetch until the controller is back at the fetch: the decoder's
 * circuit gives the kind's signals, and the controller's circuit (Module 5's, built from the
 * same table as the machine's) is clocked through them.
 */
export function kindSequences(
  kinds: readonly number[],
  callThroughRegister = false,
): { kind: number; states: ControlState[] }[] {
  const decoder = new Simulator(decoderCircuit({ callThroughRegister }));
  const m = controllerMachine({ callThroughRegister });
  const controller = new Simulator(machineCircuit(m));
  const names = Object.fromEntries(
    Object.entries(CONTROL_STATES).map(([name, code]) => [code, name as ControlState]),
  );
  const stateNow = (c: Circuit, sim: Simulator) => {
    const w = sim.outputs()["S"];
    void c;
    return w && w.known === 7n ? names[w.value.toString(2).padStart(3, "0")] : undefined;
  };
  return kinds.map((k) => {
    const outs = decode(decoder, k, SAMPLE_JOB[k] ?? 0, 0);
    controller.setInput("CLK", word(1, 0));
    controller.setInput("RST", word(1, 1));
    for (const input of m.inputs) controller.setInput(input, word(1, outs[input] ?? 0));
    controller.settle();
    controller.clockCycle("CLK");
    controller.setInput("RST", word(1, 0));
    controller.settle();
    const states: ControlState[] = [];
    for (let n = 0; n < 8; n++) {
      const s = stateNow(controller.circuit, controller);
      if (!s || (n > 0 && s === "FETCH")) break;
      states.push(s);
      controller.clockCycle("CLK");
    }
    return { kind: k, states };
  });
}

export const KindEdges = withProps(
  EdgesProps,
  function KindEdges({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof EdgesProps> }) {
    const t = useViewStrings().control;
    const rows = useMemo(
      () => kindSequences(data.kinds, data.callThroughRegister),
      [data.kinds, data.callThroughRegister],
    );
    return (
      <div className="kind-edges" data-interactive={interactive.id}>
        <div className="truth-table-wrap">
          <table className="truth-table kind-edges-table">
            <caption>{t.edgesCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.kind}</th>
                <th scope="col">{t.states}</th>
                <th scope="col">{t.edges}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.kind}>
                  <th scope="row">{t.kinds[String(r.kind)] ?? String(r.kind)}</th>
                  <td className="kind-edges-states">{r.states.join(t.then)}</td>
                  <td>{r.states.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

/** A micro-operation in the lesson's words. */
export function opText(op: MicroOp, t: ControlStrings): string {
  switch (op.kind) {
    case "fetch":
      return t.opFetch;
    case "read":
      return format(t.opRead, { a: op.a, b: op.b });
    case "alu": {
      const slots = { left: op.a, right: op.b, job: t.jobs[String(op.job)] ?? "" };
      if (op.job === 5) return format(t.opAluCopy, slots);
      if (op.job === 6) return format(t.opAluUp, slots);
      if (op.job === 7) return format(t.opAluDown, slots);
      return format(t.opAlu, slots);
    }
    case "load":
      return op.byte ? t.opLoadByte : t.opLoadWord;
    case "store":
      return op.byte ? t.opStoreByte : t.opStoreWord;
    case "write":
      return format(t.opWrite, { y: op.y, from: t.sources[op.from] ?? op.from });
    case "pc":
      return format(t.opPc, { to: t.sources[op.to] ?? op.to });
  }
}

/** An edge's transfers, joined, or the words for an edge that changes nothing. */
export function edgeText(view: EdgeView, t: ControlStrings): string {
  return view.ops.length ? view.ops.map((op) => opText(op, t)).join(t.opJoin) : t.opNone;
}

/** The instruction's edges so far and the one to come, each with its state and transfers. */
export function MicroOps({ past, next }: { past: readonly EdgeView[]; next?: EdgeView }) {
  const t = useViewStrings().control;
  const rows = [
    ...past.map((v) => ({ v, next: false })),
    ...(next ? [{ v: next, next: true }] : []),
  ];
  return (
    <div className="truth-table-wrap">
      <table className="truth-table datapath-table micro-ops">
        <caption>{t.opsCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.edge}</th>
            <th scope="col">{t.state}</th>
            <th scope="col">{t.ops}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr
              key={k}
              className={r.next ? "row-current" : ""}
              aria-current={r.next ? "true" : undefined}
            >
              <th scope="row">{r.next ? `${k + 1} (${t.nextMark})` : k + 1}</th>
              <td>{r.v.state ?? "X"}</td>
              <td className="memory-word">{edgeText(r.v, t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The control signals at the next edge, by name, each 0 or 1. */
export function SignalsTable({ view, signals }: { view: EdgeView; signals: readonly string[] }) {
  const t = useViewStrings().control;
  return (
    <div className="truth-table-wrap">
      <table className="truth-table datapath-table edge-signals">
        <caption>{t.signalsCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.signal}</th>
            <th scope="col">{t.value}</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => {
            const v = view.signals[s];
            return (
              <tr key={s} className={v === 1 ? "row-current" : ""}>
                <th scope="row">{s}</th>
                <td className="memory-word">{v === undefined ? "X" : v}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
