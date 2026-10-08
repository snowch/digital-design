// Copyright © 2026 Christopher Snow

// The run as lanes (Modules 11 and 12): one lane for each part of the program that runs (the
// main program, a function, the start, the handler, the handler again), the run drawn moving
// down its lanes as it goes and across between them. Each move is an arrow labelled with what it
// writes: a call with its register's new value, a jump back with the PC, a trap with C2 and C3,
// `resume` with the PC. A band beside the lanes shows the mode (Module 12), and an event that
// arrives between two instructions, or a store a lesson names, is marked where it happens.
//
// It draws a run the machine made: the trap timeline's edges (`timelineRun`), each the
// reference's own step. Nothing is worked out here but where each edge's address lies.

import type { Program, TimelineEdge, Transfer } from "@dd/dd-model";

import { format, useViewStrings } from "../strings";
import { useWidth } from "../useWidth";
import { controlText, hex3, valueText } from "./Debugger";

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

/** A part of the program that runs, from the address a line's name gives. */
export interface LaneSpec {
  /** A line's name, or an address as `0x0A4`. */
  readonly at: string;
  /** The lane's name on the page. */
  readonly name: string;
  /** The handler: a trap goes to this lane, and a trap inside it to `again`. */
  readonly handler?: boolean;
}

export interface LanesConfig {
  readonly lanes: readonly LaneSpec[];
  /** The handler's lane for a trap that comes while the handler runs. */
  readonly again?: string;
  /** Stores to these addresses (`0x410`) marked where they happen. */
  readonly marks?: readonly string[];
  /** Whether a band shows the mode (lesson 3 of Module 12 on). */
  readonly mode?: boolean;
}

/** One stretch of the run inside one lane. */
export interface Stay {
  readonly kind: "stay";
  readonly lane: number;
  /** The edges it covers, by index into the run's edges: [first, last]. */
  readonly first: number;
  readonly last: number;
  /** Whether the machine was in system mode for it. */
  readonly system: boolean;
}

/** A move from one lane to another, at an edge. */
export interface Move {
  readonly kind: "move";
  readonly from: number;
  readonly to: number;
  readonly edge: number;
  readonly what: "call" | "back" | "trap" | "interrupt" | "resume" | "jump";
  /** What the move writes, as the pages write transfers. */
  readonly label: string;
}

/** Something marked inside a lane: the door opening, or a store the lesson names. */
export interface Mark {
  readonly kind: "mark";
  readonly lane: number;
  readonly edge: number;
  readonly what: "door" | "timer" | "store";
  readonly label: string;
}

export type LaneItem = Stay | Move | Mark;

const placeOf = (at: string, program: Program) =>
  /^0x[0-9a-f]+$/i.test(at) ? parseInt(at, 16) : program.labels[at];

/** The lanes a run went through, in order: stays, the moves between them, and its marks. */
export function lanesOf(
  edges: readonly TimelineEdge[],
  program: Program,
  config: LanesConfig,
): LaneItem[] {
  const starts = config.lanes
    .map((l, i) => ({ i, at: placeOf(l.at, program) }))
    .filter((x): x is { i: number; at: number } => x.at !== undefined)
    .sort((a, b) => a.at - b.at);
  const regionOf = (pc: bigint) => {
    let lane = starts[0]?.i ?? 0;
    for (const s of starts) if (Number(pc) >= s.at) lane = s.i;
    return lane;
  };
  const handler = config.lanes.findIndex((l) => l.handler);
  const again = config.again !== undefined ? config.lanes.length : handler;
  const marks = new Set((config.marks ?? []).map((m) => parseInt(m, 16)));
  // How many traps have gone to the handler and not yet resumed.
  let depth = 0;
  const laneAt = (pc: bigint) => {
    const r = regionOf(pc);
    return r === handler && depth >= 2 ? again : r;
  };
  const items: LaneItem[] = [];
  const first = edges[0];
  if (!first) return items;
  let lane = regionOf(first.pc);
  let system = true;
  let open: { lane: number; first: number; system: boolean } | undefined;
  const close = (last: number) => {
    if (open && last >= open.first) items.push({ kind: "stay", ...open, last });
    open = undefined;
  };
  const stayAt = (i: number) => {
    if (!open) open = { lane, first: i, system };
  };
  const pcAfter = (e: TimelineEdge) => e.transfers.find((x) => x.target === "PC")?.value;
  edges.forEach((e, i) => {
    // An event arrives when its bit of "waiting" is set at this edge and was not before it.
    const arrived = e.waiting & ~(i === 0 ? 0 : edges[i - 1]!.waiting);
    for (const [bit, what] of [
      [2, "door"],
      [1, "timer"],
    ] as const)
      if (arrived & bit) {
        close(i - 1);
        items.push({ kind: "mark", lane, edge: i, what, label: "" });
      }
    if (e.kind === "trap") {
      close(i - 1);
      depth++;
      const to = depth >= 2 ? again : handler >= 0 ? handler : lane;
      const c2 = e.transfers.find((x) => x.target === "C2");
      const c3 = e.transfers.find((x) => x.target === "C3");
      items.push({
        kind: "move",
        from: lane,
        to,
        edge: i,
        what: (e.cause ?? 0) >= 0x80 ? "interrupt" : "trap",
        label: [c2, c3].map((x) => (x ? `${x.target} ← ${transferValue(x)}` : "")).join(", "),
      });
      lane = to;
      system = true;
      return;
    }
    stayAt(i);
    const store = e.transfers.find((x) => /^word\[/.test(x.target));
    if (store && marks.has(parseInt(store.target.slice(5, -1), 16))) {
      close(i);
      items.push({
        kind: "mark",
        lane,
        edge: i,
        what: "store",
        label: `${store.target} ← ${transferValue(store)}`,
      });
    }
    const next = pcAfter(e);
    if (e.kind === "resume") depth = Math.max(0, depth - 1);
    if (next === undefined || e.kind === "stop" || e.kind === "halt") return;
    const to = laneAt(next);
    if (e.kind === "resume") system = (e.control[0] & 1n) === 1n;
    if (to === lane) return;
    close(i);
    const line = (e.line ?? "").trim();
    const call = /^call\s+(?!system)/.test(line);
    const back = /^goto\s+R\d+/.test(line);
    const written = e.transfers.find((x) => /^R\d+$/.test(x.target));
    const what: Move["what"] =
      e.kind === "resume" ? "resume" : call ? "call" : back ? "back" : "jump";
    items.push({
      kind: "move",
      from: lane,
      to,
      edge: i,
      what,
      label:
        call && written?.value !== undefined
          ? `${written.target} ← ${hex3(BigInt.asUintN(64, written.value))}`
          : `PC ← ${hex3(BigInt.asUintN(64, next))}`,
    });
    lane = to;
  });
  close(edges.length - 1);
  return items;
}

/** The items as they stand once `shown` edges have been run: later ones left out, a stay cut. */
export function itemsShown(items: readonly LaneItem[], shown: number): LaneItem[] {
  const out: LaneItem[] = [];
  for (const it of items) {
    if (it.kind === "stay") {
      if (it.first >= shown) break;
      out.push({ ...it, last: Math.min(it.last, shown - 1) });
    } else {
      if (it.edge >= shown) break;
      out.push(it);
    }
  }
  return out;
}

/** The lane names, the handler's again last when there is one. */
export function laneNames(config: LanesConfig): string[] {
  const names = config.lanes.map((l) => l.name);
  return config.again !== undefined ? [...names, config.again] : names;
}

const CHAR = 7.3;
const ROW = 18;

/** The drawing: lanes as columns, time running down, each move an arrow across. */
export function RunLanesDrawing({
  items,
  config,
  shown,
}: {
  items: readonly LaneItem[];
  config: LanesConfig;
  /** How many of the run's edges have been run. */
  shown: number;
}) {
  const t = useViewStrings().machine11.lanes;
  const [ref, width] = useWidth<HTMLDivElement>(560);
  const names = laneNames(config);
  // Only the lanes the run reaches: a lane named but never entered takes no column.
  const used = names.map((_, i) =>
    items.some(
      (it) =>
        (it.kind === "move" && (it.from === i || it.to === i)) || ("lane" in it && it.lane === i),
    ),
  );
  const columns = names.map((_, i) => i).filter((i) => used[i]);
  const W = Math.max(260, Math.min(width, 640));
  const band = config.mode ? 12 : 0;
  const left = band + 6;
  const colW = (W - left - 4) / Math.max(1, columns.length);
  const x = (lane: number) => left + colW * (columns.indexOf(lane) + 0.5);
  const now = itemsShown(items, shown);
  // Each item takes its own rows, so no two labels share a line.
  let y = 6;
  const drawn: { it: LaneItem; y0: number; y1: number }[] = [];
  for (const it of now) {
    const y0 = y;
    if (it.kind === "stay") y += 10 + 3 * Math.min(12, it.last - it.first + 1);
    else y += ROW + 4;
    drawn.push({ it, y0, y1: y });
  }
  const H = y + 8;
  const clampText = (from: number, text: string) => {
    const w = text.length * CHAR;
    return Math.max(left, Math.min(from, W - 4 - w));
  };
  const moveText = (m: Move) =>
    format(t.move, { from: names[m.from] ?? "", to: names[m.to] ?? "", transfer: m.label });
  const last = drawn.at(-1);
  return (
    <div className="run-lanes" ref={ref}>
      <ol className="run-lanes-names" aria-hidden="true" style={{ paddingLeft: `${left}px` }}>
        {columns.map((i) => (
          <li key={i} style={{ width: `${colW}px` }}>
            {names[i]}
          </li>
        ))}
      </ol>
      <svg
        className="run-lanes-drawing"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t.title}
      >
        {columns.map((i) => (
          <line key={i} className="lane-rule" x1={x(i)} x2={x(i)} y1={0} y2={H} />
        ))}
        {drawn.map(({ it, y0, y1 }, k) => {
          if (it.kind === "stay")
            return (
              <g key={k}>
                {config.mode && (
                  <rect
                    className={it.system ? "lane-mode-system" : "lane-mode-user"}
                    x={0}
                    y={y0}
                    width={band - 4}
                    height={y1 - y0}
                  />
                )}
                <rect className="lane-stay" x={x(it.lane) - 4} y={y0} width={8} height={y1 - y0} />
              </g>
            );
          if (it.kind === "mark") {
            const label =
              it.what === "door" ? t.doorOpens : it.what === "timer" ? t.timerReaches : it.label;
            const cx = x(it.lane);
            // Beside the mark, to its right where there is room, else to its left.
            const right = cx + 9 + label.length * CHAR <= W - 4;
            return (
              <g key={k} className={`lane-mark lane-mark-${it.what}`}>
                <circle cx={cx} cy={y0 + ROW / 2 + 2} r={5} />
                <text
                  x={right ? cx + 9 : Math.max(left, cx - 9 - label.length * CHAR)}
                  y={y0 + ROW / 2 + 6}
                >
                  {label}
                </text>
              </g>
            );
          }
          const xa = x(it.from);
          const xb = x(it.to);
          const ly = y0 + ROW - 2;
          const dir = xb >= xa ? 1 : -1;
          return (
            <g key={k} className={`lane-move lane-move-${it.what}`}>
              <text x={clampText(Math.min(xa, xb) + 6, it.label)} y={y0 + 11}>
                {it.label}
              </text>
              <line x1={xa} x2={xb - dir * 6} y1={ly} y2={ly} />
              <path d={`M ${xb} ${ly} l ${-dir * 7} -4 v 8 z`} />
            </g>
          );
        })}
        {last && (
          <circle
            className="lane-now"
            cx={last.it.kind === "move" ? x(last.it.to) : x(last.it.lane)}
            cy={last.y1}
            r={4}
          />
        )}
      </svg>
      {config.mode && (
        <ul className="run-lanes-legend">
          <li>
            <span className="lane-key lane-mode-system" aria-hidden="true" />
            {t.systemBand}
          </li>
          <li>
            <span className="lane-key lane-mode-user" aria-hidden="true" />
            {t.userBand}
          </li>
        </ul>
      )}
      <ol className="visually-hidden">
        {now
          .filter((it): it is Move => it.kind === "move")
          .map((m) => (
            <li key={m.edge}>{moveText(m)}</li>
          ))}
      </ol>
    </div>
  );
}
