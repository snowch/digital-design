// Copyright © 2026 Christopher Snow

// Module 12's figures.
//
// - `trap-timeline`: a run of the instruction-level reference on Module 12's machine, one edge at
//   a time: each edge's instruction, or the trap that took its place, and every transfer it made
//   (C2, C1, C0, C3 and the PC at a trap; C0 and the PC at `resume`), stepped by the learner, who
//   can pause at every one. The machine's own steps make the list (`timelineRun`); nothing is
//   worked out here.

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { timelineRun, type TimelineEdge, type Transfer } from "@dd/dd-model";
import { Prose, type InteractiveProps } from "@platform/lesson-runtime";

import { format, useViewStrings } from "../strings";
import type { Machine11Strings } from "../strings11";
import type { Machine12Strings } from "../strings12";
import {
  ShopInputs,
  WordValue,
  controlText,
  hex3,
  shopInputs,
  statusText,
  valueText,
} from "./Debugger";
import { withProps } from "./props";

const TimelineProps = z.object({
  program: z.string(),
  inputs: ShopInputs,
  doorOpensAt: z.number().int().min(0).optional(),
  /** Edges run before the figure's list starts: the program setting itself up. */
  from: z.number().int().min(0).default(0),
  /** The most edges the run takes. */
  edges: z.number().int().min(1).max(400).default(60),
  /** Whether each edge says the mode it leaves the machine in (lesson 3 on). */
  mode: z.boolean().default(false),
  /** Whether the mode's words say C0's bit 1 too (lesson 5 on, which names interrupts). */
  interrupts: z.boolean().default(false),
  /** Shown once the learner has stepped to the last edge. */
  outcomes: z.string().optional(),
});
type TimelineData = z.infer<typeof TimelineProps>;

/** A transfer's value as the pages write it. */
export function transferValue(x: Transfer): string {
  if (x.value === undefined) return "X";
  switch (x.form) {
    case "address":
      return hex3(BigInt.asUintN(64, x.value));
    case "cause":
      return controlText(3, x.value);
    case "bits":
      return controlText(0, x.value);
    case "number":
      return valueText(x.value);
  }
}

/**
 * A transfer's value on the page: as `transferValue` writes it, with its hexadecimal digits named
 * for a screen reader, as the debugger names them.
 */
function TransferValue({ x, t11 }: { x: Transfer; t11: Machine11Strings }) {
  if (x.value === undefined) return <>X</>;
  const hex = (digits: string) => (
    <span className="value-hex">
      <span className="visually-hidden">{`${t11.hex} `}</span>
      {digits}
    </span>
  );
  if (x.form === "address") return hex(hex3(BigInt.asUintN(64, x.value)));
  if (x.form === "cause") return hex(controlText(3, x.value));
  if (x.form === "number") return <WordValue value={x.value} t={t11} />;
  return <>{transferValue(x)}</>;
}

/** What an edge did, in the course's words. */
export function edgeText(t: Machine12Strings, e: TimelineEdge): string {
  const values = {
    line: e.line ?? t.noLine,
    address: hex3(e.pc),
    cause: e.cause === undefined ? "" : e.cause.toString(16).toUpperCase(),
  };
  switch (e.kind) {
    case "trap":
      return format((e.cause ?? 0) >= 0x80 ? t.interrupts : t.traps, values);
    case "resume":
      return format(t.resumes, values);
    case "halt":
      return format(t.halts, values);
    case "stop":
      return format(t.stopsAt, values);
    case "run":
      return format(t.runs, values);
  }
}

export const TrapTimeline = withProps(
  TimelineProps,
  function TrapTimeline({ data, interactive }: InteractiveProps & { data: TimelineData }) {
    const strings = useViewStrings();
    const t = strings.machine12;
    const t11 = strings.machine11;
    const run = useMemo(
      () =>
        timelineRun(
          data.program,
          {
            ...shopInputs(data.inputs),
            ...(data.doorOpensAt !== undefined ? { doorOpensAt: data.doorOpensAt } : {}),
          },
          data.edges,
        ),
      [data.program, data.inputs, data.doorOpensAt, data.edges],
    );
    const shown = run.edges.slice(data.from);
    // How many of the shown edges the learner has stepped through.
    const [at, setAt] = useState(0);
    const boxRef = useRef<HTMLOListElement>(null);
    useEffect(() => {
      const box = boxRef.current;
      const row = box?.querySelector<HTMLElement>("li[aria-current]");
      if (!box || !row) return;
      const top = row.offsetTop - box.offsetTop;
      if (top < box.scrollTop || top + row.offsetHeight > box.scrollTop + box.clientHeight)
        box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }, [at]);
    const current = at > 0 ? shown[at - 1] : undefined;
    const ended = at >= shown.length && shown.length > 0;
    return (
      <div className="machine-figure trap-timeline" data-interactive={interactive.id}>
        <div className="explorer-actions debugger-actions">
          <button type="button" className="button" disabled={ended} onClick={() => setAt(at + 1)}>
            {t.nextEdge}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={at === 0}
            onClick={() => setAt(at - 1)}
          >
            {t.backEdge}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={ended}
            onClick={() => setAt(shown.length)}
          >
            {t.toEnd}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={at === 0}
            onClick={() => setAt(0)}
          >
            {t.reset}
          </button>
        </div>
        <p className="debugger-status" role="status">
          {current ? `${format(t.edge, { n: current.n })}: ${edgeText(t, current)}` : t.noEdge}
        </p>
        <p className="layout-title">{t.timelineTitle}</p>
        <ol className="trap-edges" ref={boxRef}>
          {shown.slice(0, at).map((e, i) => (
            <li
              key={e.n}
              className={`trap-edge trap-edge-${e.kind}`}
              aria-current={i === at - 1 ? "step" : undefined}
            >
              <p className="trap-edge-head">
                <span className="trap-edge-n">{format(t.edge, { n: e.n })}</span> {edgeText(t, e)}
              </p>
              {e.transfers.length === 0 ? (
                <p className="trap-edge-none">{t.nothingChanges}</p>
              ) : (
                <ul className="trap-transfers" aria-label={t.transfersLabel}>
                  {e.transfers.map((x) => (
                    <li
                      key={x.target}
                      className={`memory-word${/^C\d$/.test(x.target) ? " transfer-control" : ""}`}
                    >
                      {`${x.target} ← `}
                      <TransferValue x={x} t11={t11} />
                    </li>
                  ))}
                </ul>
              )}
              {data.mode && (
                <p className="trap-edge-mode">
                  {format(t.modeAfter, { mode: statusText(t, e.control[0], data.interrupts) })}
                </p>
              )}
            </li>
          ))}
        </ol>
        {ended && data.outcomes && <Prose markdown={data.outcomes} />}
      </div>
    );
  },
);
