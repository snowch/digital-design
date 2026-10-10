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

import { useEffect, useId, useRef } from "react";

import { format, useViewStrings, type ViewStrings } from "../strings";
import { useWidth } from "../useWidth";
import { controlText, hex3, statusText, valueText } from "./Debugger";

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
  /** Whether a second band shows when interrupts are on, C0's bit 1 (lesson 5 of Module 12 on). */
  readonly interrupts?: boolean;
  /** The most edges drawn: a run that goes on past them is drawn to there, and says so. */
  readonly upTo?: number;
}

/** One stretch of the run inside one lane. */
export interface Stay {
  readonly kind: "stay";
  readonly lane: number;
  /** The edges it covers, by index into the run's edges: [first, last]. */
  readonly first: number;
  readonly last: number;
  /** C0 while it runs: bit 0 the mode, bit 1 interrupts. */
  readonly c0: number;
}

/** A move from one lane to another, at an edge. */
export interface Move {
  readonly kind: "move";
  readonly from: number;
  readonly to: number;
  readonly edge: number;
  readonly what: "call" | "back" | "trap" | "interrupt" | "resume" | "start" | "jump";
  /** What the move writes, as the pages write transfers. */
  readonly label: string;
  /** C0 once the move is made: the mode of the lane it enters. */
  readonly c0: number;
}

/**
 * Something marked inside a lane: the door opening (before the edge's instruction), the timer
 * reaching 0 (as the edge's instruction finishes), a store the lesson names, or the run stopping.
 */
export interface Mark {
  readonly kind: "mark";
  readonly lane: number;
  readonly edge: number;
  readonly what: "door" | "timer" | "store" | "stop" | "cut";
  readonly label: string;
  readonly c0: number;
}

export type LaneItem = Stay | Move | Mark;

const placeOf = (at: string, program: Program) =>
  /^0x[0-9a-f]+$/i.test(at) ? parseInt(at, 16) : program.labels[at];

/** The lanes a run went through, in order: stays, the moves between them, and its marks. */
export function lanesOf(
  allEdges: readonly TimelineEdge[],
  program: Program,
  config: LanesConfig,
): LaneItem[] {
  const edges = config.upTo !== undefined ? allEdges.slice(0, config.upTo) : allEdges;
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
  // C0 as the machine leaves reset: system mode, interrupts off.
  let c0 = 1;
  let open: { lane: number; first: number; c0: number } | undefined;
  const close = (last: number) => {
    if (open && last >= open.first) items.push({ kind: "stay", ...open, last });
    open = undefined;
  };
  const stayAt = (i: number) => {
    if (!open) open = { lane, first: i, c0 };
  };
  const mark = (i: number, what: Mark["what"], label = "") =>
    items.push({ kind: "mark", lane, edge: i, what, label, c0 });
  const pcAfter = (e: TimelineEdge) => e.transfers.find((x) => x.target === "PC")?.value;
  edges.forEach((e, i) => {
    // An event arrives when its bit of "waiting" is set at this edge and was not before it. The
    // door opened before this edge's instruction ran; the timer reached 0 as it finished.
    const arrived = e.waiting & ~(i === 0 ? 0 : edges[i - 1]!.waiting);
    if (arrived & 2) {
      close(i - 1);
      mark(i, "door");
    }
    if (e.kind === "trap") {
      close(i - 1);
      depth++;
      const to = depth >= 2 ? again : handler >= 0 ? handler : lane;
      const c2 = e.transfers.find((x) => x.target === "C2");
      const c3 = e.transfers.find((x) => x.target === "C3");
      c0 = Number(e.control[0]);
      items.push({
        kind: "move",
        from: lane,
        to,
        edge: i,
        what: (e.cause ?? 0) >= 0x80 ? "interrupt" : "trap",
        label: [c2, c3].map((x) => (x ? `${x.target} ← ${transferValue(x)}` : "")).join(", "),
        c0,
      });
      lane = to;
      return;
    }
    // A write to C0 inside a lane (job 5 letting interrupts in, or shutting them out) starts a new
    // stretch at its own step, drawn with C0 as the write leaves it.
    const written0 = Number(e.control[0]);
    if (config.interrupts && e.kind === "run" && (written0 & 2) !== (c0 & 2)) {
      close(i - 1);
      c0 = written0;
    }
    stayAt(i);
    if (arrived & 1) {
      close(i);
      mark(i, "timer");
    }
    const store = e.transfers.find((x) => /^word\[/.test(x.target));
    if (store && marks.has(parseInt(store.target.slice(5, -1), 16))) {
      close(i);
      mark(i, "store", `${store.target} ← ${transferValue(store)}`);
    }
    if (e.kind === "stop" || e.kind === "halt") {
      close(i);
      mark(i, "stop");
      return;
    }
    const next = pcAfter(e);
    if (e.kind === "resume") depth = Math.max(0, depth - 1);
    c0 = Number(e.control[0]);
    if (next === undefined) return;
    const to = laneAt(next);
    if (to === lane) return;
    close(i);
    const line = (e.line ?? "").trim();
    const call = /^call\s+(?!system)/.test(line);
    const back = /^goto\s+R\d+/.test(line);
    const written = e.transfers.find((x) => /^R\d+$/.test(x.target));
    // The start's `resume` starts a program that has not run; a handler's resumes one it left.
    const fromHandler = lane === handler || lane === again;
    const what: Move["what"] =
      e.kind === "resume"
        ? fromHandler
          ? "resume"
          : "start"
        : call
          ? "call"
          : back
            ? "back"
            : "jump";
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
      c0,
    });
    lane = to;
  });
  close(edges.length - 1);
  // A run drawn only so far, which goes on: said where the drawing stops.
  const lastEdge = edges.at(-1);
  if (
    config.upTo !== undefined &&
    allEdges.length > edges.length &&
    lastEdge &&
    lastEdge.kind !== "stop" &&
    lastEdge.kind !== "halt"
  )
    mark(edges.length - 1, "cut");
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

/** A lane's name inside a sentence: "The handler" becomes "the handler". */
const inSentence = (name: string) => name.replace(/^The /, "the ");
const capitalised = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** An item in words, for a screen reader and for a status line: what happened, and where. */
export function laneItemText(
  t: ViewStrings["machine11"]["lanes"],
  names: readonly string[],
  it: Move | Mark,
): string {
  const lane = (k: number) => inSentence(names[k] ?? "");
  if (it.kind === "mark") {
    const where = { lane: lane(it.lane), label: it.label };
    const template = {
      door: t.markDoor,
      timer: t.markTimer,
      store: t.markStore,
      stop: t.markStop,
      cut: t.markCut,
    }[it.what];
    return capitalised(format(template, where));
  }
  const template = {
    call: t.moveCall,
    back: t.moveBack,
    trap: t.moveTrap,
    interrupt: t.moveInterrupt,
    resume: t.moveResume,
    start: t.moveStart,
    jump: t.moveJump,
  }[it.what];
  return capitalised(
    format(template, { from: lane(it.from), to: lane(it.to), transfer: it.label }),
  );
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
  const strings = useViewStrings();
  const t = strings.machine11.lanes;
  const t12 = strings.machine12;
  const [ref, width] = useWidth<HTMLDivElement>(560);
  const boxRef = useRef<HTMLDivElement>(null);
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
  // A band for the mode, and one for interrupts beside it.
  const bandW = 8;
  const bands = (config.mode ? 1 : 0) + (config.interrupts ? 1 : 0);
  const left = bands * (bandW + 3) + 6;
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
  const last = drawn.at(-1);
  // The box keeps its newest row in view as the run grows.
  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [now.length, shown]);
  const said = now.filter((it): it is Move | Mark => it.kind !== "stay");
  const hatchId = `lanes-hatch-${useId().replace(/:/g, "")}`;
  const modeOf = (c0: number) =>
    format(t12.modeAfter, { mode: statusText(t12, BigInt(c0), config.interrupts === true) });
  return (
    <div className="run-lanes" ref={ref}>
      <ol className="run-lanes-names" aria-hidden="true" style={{ paddingLeft: `${left}px` }}>
        {columns.map((i) => (
          <li key={i} style={{ width: `${colW}px` }}>
            {names[i]}
          </li>
        ))}
      </ol>
      <div className="run-lanes-box" ref={boxRef}>
        <svg
          className="run-lanes-drawing"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t.title}
        >
          {/* The interrupts band is hatched: no bar, band or mark in the drawing is drawn so. */}
          {config.interrupts && (
            <defs>
              <pattern
                id={hatchId}
                width={4}
                height={4}
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect className="lane-hatch-ground" width={4} height={4} />
                <line className="lane-hatch" x1={0} y1={0} x2={0} y2={4} />
              </pattern>
            </defs>
          )}
          {columns.map((i) => (
            <line key={i} className="lane-rule" x1={x(i)} x2={x(i)} y1={0} y2={H} />
          ))}
          {drawn.map(({ it, y0, y1 }, k) => (
            <g key={`band-${k}`} className="lane-bands">
              {config.mode && (
                <rect
                  className={(it.c0 & 1) === 1 ? "lane-mode-system" : "lane-mode-user"}
                  x={0}
                  y={y0}
                  width={bandW}
                  height={y1 - y0}
                />
              )}
              {config.interrupts && (it.c0 & 2) !== 0 && (
                <rect
                  className="lane-interrupts-on"
                  fill={`url(#${hatchId})`}
                  x={config.mode ? bandW + 3 : 0}
                  y={y0}
                  width={bandW}
                  height={y1 - y0}
                />
              )}
            </g>
          ))}
          {drawn.map(({ it, y0, y1 }, k) => {
            if (it.kind === "stay")
              return (
                <rect
                  key={k}
                  className="lane-stay"
                  x={x(it.lane) - 4}
                  y={y0}
                  width={8}
                  height={y1 - y0}
                />
              );
            if (it.kind === "mark") {
              const label = {
                door: t.doorOpens,
                timer: t.timerReaches,
                store: it.label,
                stop: t.stops,
                cut: t.cut,
              }[it.what];
              const cx = x(it.lane);
              // Beside the mark, to its right where there is room, else to its left.
              const right = cx + 9 + label.length * CHAR <= W - 4;
              return (
                <g key={k} className={`lane-mark lane-mark-${it.what}`}>
                  {it.what === "stop" ? (
                    <rect x={cx - 6} y={y0 + ROW / 2 - 3} width={12} height={10} />
                  ) : it.what === "cut" ? (
                    // A break across the lane: the drawing ends here and the run goes on.
                    <path
                      d={`M ${cx - 8} ${y0 + ROW / 2 + 2} l 4 -5 l 4 10 l 4 -10 l 4 5`}
                      fill="none"
                    />
                  ) : (
                    <circle cx={cx} cy={y0 + ROW / 2 + 2} r={5} />
                  )}
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
          {/* The dot follows the run; once the drawing has stopped following it, there is none. */}
          {last && !(last.it.kind === "mark" && last.it.what === "cut") && (
            <circle
              className="lane-now"
              cx={last.it.kind === "move" ? x(last.it.to) : x(last.it.lane)}
              cy={last.y1}
              r={4}
            />
          )}
        </svg>
      </div>
      <ul className="run-lanes-legend" aria-hidden="true">
        <li>
          <span className="lane-key lane-key-now" />
          {t.nowKey}
        </li>
        {config.mode && (
          <li>
            <span className="lane-key lane-mode-system" />
            {t.systemBand}
          </li>
        )}
        {config.mode && (
          <li>
            <span className="lane-key lane-mode-user" />
            {t.userBand}
          </li>
        )}
        {config.interrupts && (
          <li>
            <span className="lane-key lane-interrupts-on" />
            {t.interruptsBand}
          </li>
        )}
      </ul>
      {said.length > 0 && (
        <ol className="visually-hidden">
          {said.map((it) => (
            <li key={`${it.kind}-${it.edge}-${it.kind === "mark" ? it.what : ""}`}>
              {laneItemText(t, names, it)}
              {config.mode ? ` ${modeOf(it.c0)}` : ""}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
