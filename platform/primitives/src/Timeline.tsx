// Copyright © 2026 Christopher Snow

// Lanes over a time axis, with a cursor: the frame every timeline shares. The lanes' names stand
// in a column of their own that stays put while the lanes scroll beside it; the axis writes its
// marked times on a second row where two labels would touch, and widens the drawing until every
// label has room on one of the two; a slider moves the cursor, which a keyboard and a finger can
// both do; and a drawing wider than its wrapper opens on what matters and keeps the cursor in
// view. A long run scrolls sideways rather than shrinking below what its labels, and the caller's
// values (`minUnit`), need. What a lane holds (levels, values, events) is the caller's to draw,
// given the lane's top edge and the x of a time.

import { useEffect, useId, useRef, type ReactNode } from "react";

import { useOverflows } from "./useWidth";

/** A lane's height, and the gap under it. */
export const LANE_H = 34;
const LANE_GAP = 10;
const LABEL_W_MIN = 64;
/** The axis's height, above the first lane. */
export const AXIS_H = 52;
/** The widest the axis's labels may push a drawing, which then scrolls sideways in its wrapper. */
const WIDEST = 16000;

export interface TimelineMark {
  readonly time: number;
  readonly label: string;
}

/** Where things are in the drawing, for the caller drawing into it. */
export interface TimelineGeometry {
  /** A time's x. */
  readonly x: (time: number) => number;
  /** Pixels a unit of time. */
  readonly unit: number;
  readonly width: number;
  readonly height: number;
  /** An id unique on the page, to name the drawing's own patterns and title. */
  readonly id: string;
}

export interface TimelineProps {
  readonly lanes: readonly { readonly label: string }[];
  readonly from: number;
  readonly end: number;
  /** Times named on the axis, such as the clock's edges. */
  readonly marks: readonly TimelineMark[];
  /** The time the cursor stands at. */
  readonly cursor: number;
  /**
   * The fewest pixels a unit of time gets, so that what the caller writes in its lanes fits the
   * stretch it labels. A run that needs more room than its wrapper scrolls sideways.
   */
  readonly minUnit?: number;
  /** Moves the cursor; without it the cursor has no slider. */
  readonly onCursor?: (time: number) => void;
  /** The slider's name, with the time in it. */
  readonly cursorLabel: string;
  /** The drawing's name, for a screen reader. */
  readonly title: string;
  /** Said when the drawing is wider than its wrapper, so it scrolls. */
  readonly scrollNote: string;
  /** The time the drawing opens on when it scrolls. */
  readonly focus: number;
  /** Patterns and the like, inside the drawing's `defs`. */
  readonly defs?: (g: TimelineGeometry) => ReactNode;
  /** Drawn under the axis and the lanes, such as shaded spans of time. */
  readonly background?: (g: TimelineGeometry) => ReactNode;
  /** One lane's content, given the lane's index and its top edge. */
  readonly renderLane: (index: number, top: number, g: TimelineGeometry) => ReactNode;
  /** What goes under the drawing, such as a table of the values at the cursor. */
  readonly children?: ReactNode;
}

type PlacedMark = { time: number; label: string; row: number; anchor: "start" | "middle" | "end" };

/** The axis's labels placed, and whether every one found a row where it touches no other. */
function placeMarks(
  marks: readonly TimelineMark[],
  from: number,
  end: number,
  x: (time: number) => number,
  width: number,
): { rows: PlacedMark[]; fitted: boolean } {
  // Each label's extent follows its anchor: the last mark's label runs leftwards from its time,
  // so it is checked against the one before it by its whole width, not half of it. A label too
  // long to centre near either end is anchored inwards instead.
  const anchorAt = (t: number) => (t <= from ? "start" : t >= end ? "end" : "middle");
  const rows: PlacedMark[] = [];
  const rightEdge = [-Infinity, -Infinity];
  let fitted = true;
  for (const m of marks) {
    const px = x(m.time);
    const w = m.label.length * 7.5;
    let anchor: "start" | "middle" | "end" = anchorAt(m.time);
    if (anchor === "middle" && px - w / 2 < 0) anchor = "start";
    if (anchor === "middle" && px + w / 2 > width) anchor = "end";
    const left = anchor === "start" ? px : anchor === "end" ? px - w : px - w / 2;
    const fits = (row: number) => left >= (rightEdge[row] ?? -Infinity) + 12;
    const row = fits(0) ? 0 : fits(1) ? 1 : 0;
    if (!fits(row)) fitted = false;
    rows.push({ time: m.time, label: m.label, row, anchor });
    rightEdge[row] = left + w;
  }
  return { rows, fitted };
}

/** The axis's labels, each on the first of two rows where it touches no label before it. */
export function layoutMarks(
  marks: readonly TimelineMark[],
  from: number,
  end: number,
  x: (time: number) => number,
  width: number,
): PlacedMark[] {
  return placeMarks(marks, from, end, x, width).rows;
}

/**
 * The pixels a unit of time gets: `base`, widened until every mark's label fits one of the axis's
 * two rows, unless the drawing would grow wider than any reader scrolls. Numbered edges after a
 * long run once ran into each other, a label that fitted neither row being written over the first.
 */
export function fitUnit(
  marks: readonly TimelineMark[],
  from: number,
  end: number,
  base: number,
): number {
  const span = Math.max(1, end - from);
  let unit = base;
  for (let k = 0; k < 32; k++) {
    const width = span * unit + 16;
    if (placeMarks(marks, from, end, (t) => (t - from) * unit, width).fitted) break;
    if (span * unit * 1.25 + 16 > WIDEST) break;
    unit *= 1.25;
  }
  return unit;
}

export function Timeline({
  lanes,
  from,
  end,
  marks,
  cursor,
  minUnit = 0,
  onCursor,
  cursorLabel,
  title,
  scrollNote,
  focus,
  defs,
  background,
  renderLane,
  children,
}: TimelineProps) {
  const id = useId();
  const span = Math.max(1, end - from);
  const ticks = marks.filter((m) => m.time >= from && m.time <= end);
  // Readable at two pixels per unit at the least, and at the caller's own least; a long run
  // scrolls sideways in its wrapper. A short run is stretched until its longest mark label fits
  // inside it: a one-step prediction labelled "WARM 1, DOOR 1" once drew a label wider than its
  // whole drawing. Then every mark's label is given room on the axis's two rows.
  const longestMark = Math.max(0, ...ticks.map((m) => m.label.length * 7.5));
  const unit = fitUnit(
    ticks,
    from,
    end,
    Math.max(2, Math.min(48, 700 / span), longestMark / span, minUnit),
  );
  // The lane names are a drawing of their own that stays put while the lanes scroll beside it,
  // sized to the longest name at about 7.5 pixels a character.
  const labelW = Math.max(LABEL_W_MIN, Math.max(0, ...lanes.map((l) => l.label.length)) * 7.5 + 16);
  const width = span * unit + 16;
  const height = AXIS_H + lanes.length * (LANE_H + LANE_GAP) + 8;
  const x = (t: number) => (t - from) * unit;
  const g: TimelineGeometry = { x, unit, width, height, id };

  // A drawing wider than its wrapper opens on what matters, and scrolls to keep it in view as
  // it moves.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [overflowRef, overflows] = useOverflows<HTMLDivElement>();
  const focusX = x(focus);
  useEffect(() => {
    const el = scrollRef.current;
    const svg = el?.querySelector("svg.timing-diagram");
    if (!el || !svg || el.scrollWidth <= el.clientWidth + 1) return;
    const offset =
      svg.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
    const px = offset + focusX;
    const seen = el.clientWidth - labelW;
    if (px < el.scrollLeft + labelW + 24 || px > el.scrollLeft + el.clientWidth - 24) {
      el.scrollLeft = Math.max(0, px - labelW - seen / 2);
    }
  }, [focusX, width, labelW]);

  const laneY = (i: number) => AXIS_H + i * (LANE_H + LANE_GAP);

  // Axis ticks: the marks on their own row, staggered onto a second row when two would touch (a
  // mark's label is about 7.5 pixels a character at the drawing's 12 pixel type); a number at
  // every unit when there are few, except under a mark; the first and last labels anchored
  // inwards so nothing leaves the drawing. The drawing is never shown smaller than its own size:
  // a long run scrolls sideways in its wrapper, so no label shrinks below legibility.
  const markTimes = new Set(ticks.map((m) => m.time));
  const plain = span <= 24 ? Array.from({ length: span + 1 }, (_, i) => from + i) : [];
  const anchorAt = (t: number) => (t <= from ? "start" : t >= end ? "end" : "middle");
  const markRows = layoutMarks(ticks, from, end, x, width);

  return (
    <div className="timing">
      {overflows && <p className="scroll-note">{scrollNote}</p>}
      <div
        className="timing-scroll"
        ref={(el) => {
          scrollRef.current = el;
          overflowRef(el);
        }}
      >
        <svg
          className="timing-lanes"
          viewBox={`0 0 ${labelW} ${height}`}
          aria-hidden="true"
          style={{ width: `${labelW}px`, height: `${height}px` }}
        >
          {lanes.map((lane, i) => (
            <text
              key={lane.label}
              x={labelW - 8}
              y={laneY(i) + LANE_H / 2 + 4}
              textAnchor="end"
              className="lane-label"
            >
              {lane.label}
            </text>
          ))}
          <line
            x1={labelW - 0.5}
            y1={AXIS_H - 4}
            x2={labelW - 0.5}
            y2={height - 4}
            className="lane-edge"
          />
        </svg>
        <svg
          className="timing-diagram"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <title id={`${id}-title`}>{title}</title>
          <defs>{defs?.(g)}</defs>
          {background?.(g)}
          <g className="axis">
            <line x1={0} y1={AXIS_H - 4} x2={width - 8} y2={AXIS_H - 4} />
            {plain.map((t) => (
              <g key={t}>
                <line x1={x(t)} y1={AXIS_H - 8} x2={x(t)} y2={AXIS_H - 4} />
                {span <= 12 && !markTimes.has(t) && (
                  <text x={x(t)} y={AXIS_H - 10} textAnchor={anchorAt(t)} className="tick-label">
                    {t}
                  </text>
                )}
              </g>
            ))}
            {markRows.map((m, i) => (
              <text
                key={`m${i}`}
                x={x(m.time)}
                y={m.row === 0 ? 14 : 31}
                textAnchor={m.anchor}
                className="mark-label"
              >
                {m.label}
              </text>
            ))}
          </g>
          {lanes.map((lane, i) => {
            const top = laneY(i);
            return (
              <g key={lane.label} className="lane" data-signal={lane.label}>
                <line
                  x1={0}
                  y1={top + LANE_H}
                  x2={width - 8}
                  y2={top + LANE_H}
                  className="lane-base"
                />
                {renderLane(i, top, g)}
              </g>
            );
          })}
          <g className="cursor" aria-hidden="true">
            <line x1={x(cursor)} y1={AXIS_H - 4} x2={x(cursor)} y2={height - 4} />
          </g>
        </svg>
      </div>
      {onCursor && (
        <label className="timing-cursor">
          <span>{cursorLabel}</span>
          <input
            type="range"
            min={from}
            max={end}
            step={1}
            value={cursor}
            onChange={(e) => onCursor(Number(e.target.value))}
          />
        </label>
      )}
      {children}
    </div>
  );
}
