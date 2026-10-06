// Copyright © 2026 Christopher Snow

// A lesson's scene, drawn: where its signals come from and where they go. The sources sit on the
// left, in the rooms the lesson names; each one's wire runs straight to a box for the circuit the
// lesson asks for, and from that box to the lamps or readout it drives. A bus, several wires
// carrying one word, is drawn thick with its count. The drawing places the lesson's names and
// nothing else: no model runs here, so it states no number of its own.
//
// Like the signal plot, it is drawn one unit per pixel so its 12-pixel text keeps its size on a
// phone. Its gaps are as narrow as their names allow, so a scene of short labels fits a phone's
// figure card; extra width lengthens the wires, up to a limit.

import { z } from "zod";

import type { InteractiveProps } from "@dd/lesson-runtime";

import { useWidth } from "../useWidth";
import { withProps } from "./props";

const wire = {
  /** The signal's name, written on its wire; left off where the lesson has not named it yet. */
  signal: z.string().min(1).optional(),
  /** How many wires carry it; more than one is drawn as a bus with its count. */
  width: z.number().int().min(1).max(64).default(1),
};
const Source = z.object({
  kind: z.enum(["switch", "sensor", "receiver", "button", "clock"]),
  label: z.string().min(1),
  ...wire,
});
const Output = z.object({
  kind: z.enum(["lamp", "readout"]),
  label: z.string().min(1),
  /** What a readout shows; without one, the readout shows its label. */
  value: z.string().min(1).optional(),
  ...wire,
});
const Props = z.object({
  /** Groups of sources, top to bottom; a group with a room is drawn inside it. */
  sources: z
    .array(z.object({ room: z.string().default(""), items: z.array(Source).min(1) }))
    .min(1),
  /** The label in the box for the circuit the lesson asks for. */
  circuit: z.string().min(1),
  outputs: z.array(Output).min(1),
  /** What a screen reader is told: the drawing's name, then what it shows. */
  labels: z.object({ title: z.string().min(1), summary: z.string().min(1) }),
});
type Data = z.infer<typeof Props>;
type Group = Data["sources"][number];
type SourceItem = z.infer<typeof Source>;
type OutputItem = z.infer<typeof Output>;

/** The advance of one character of the drawing's 12-pixel monospaced text. */
const CHAR = 7.2;
const textWidth = (s: string) => s.length * CHAR;

const PAD = 8;
const ROW = 36;
const HEAD = 22;
const GPAD = 8;
const GGAP = 12;
const SYMBOL = 18;
const SGAP = 6;
const LAMP = 16;
/** A wire's least length beyond its name: the arrowhead and a margin either side. */
const WIRE_SPARE = 24;
/** How much extra page width may lengthen the wires before the drawing stops growing. */
const STRETCH = 160;

const groupHeight = (g: Group) => (g.room ? HEAD : 0) + g.items.length * ROW + (g.room ? 4 : 0);

/** What a wire needs written over or under it: its name, or its count if it is a bus. */
const nameWidth = (w: { signal?: string | undefined; width: number }) =>
  w.signal && w.width > 1
    ? textWidth(w.signal) + 12 + textWidth(String(w.width))
    : Math.max(textWidth(w.signal ?? ""), w.width > 1 ? textWidth(String(w.width)) + 12 : 0);

const readoutWidth = (o: OutputItem) => Math.max(36, textWidth(o.value ?? o.label) + 14);

/** How far an output reaches right of its wire's arrow, label included. */
const outputWidth = (o: OutputItem) =>
  o.kind === "lamp"
    ? LAMP + SGAP + textWidth(o.label)
    : Math.max(readoutWidth(o), o.value ? textWidth(o.label) : 0);

/** A readout with a value carries its label above it. */
const labelAbove = (o: OutputItem) => o.kind === "readout" && o.value !== undefined;

export const SceneFigure = withProps(
  Props,
  function SceneFigure({ data, interactive }: InteractiveProps & { data: Data }) {
    const [ref, available] = useWidth<HTMLDivElement>(640);
    const { sources, outputs } = data;
    const items = sources.flatMap((g) => g.items);
    // A count under one wire would meet what is written over the next row's wire, a name or
    // another count, so in a column where any wire is named, every bus writes its count over its
    // wire (Module 6's shop scene: an unnamed address above the named data bus D).
    const countsOver = {
      sources: items.some((i) => i.signal),
      outputs: outputs.some((o) => o.signal),
    };

    // The left column: as wide as its widest room or item.
    const left =
      Math.max(
        ...sources.map((g) =>
          Math.max(textWidth(g.room), ...g.items.map((i) => SYMBOL + SGAP + textWidth(i.label))),
        ),
      ) +
      2 * GPAD;
    const gap0 = Math.max(48, ...items.map((i) => nameWidth(i) + WIRE_SPARE));
    const inner0 = Math.max(40, ...outputs.map((o) => nameWidth(o) + WIRE_SPARE));
    const circuitW = Math.max(40, textWidth(data.circuit) + 24);
    const outputsW = Math.max(...outputs.map(outputWidth));
    const natural = PAD + left + gap0 + circuitW + inner0 + outputsW + PAD;
    const extra = Math.max(0, Math.min(available - natural, STRETCH));
    const gap = gap0 + extra * 0.6;
    const inner = inner0 + extra * 0.4;

    // Rows, top to bottom, before the whole drawing is moved down to clear its top edge.
    let y = 0;
    const groups = sources.map((g) => {
      const top = y;
      y += groupHeight(g) + GGAP;
      const first = top + (g.room ? HEAD : 0);
      return { g, top, rows: g.items.map((_, k) => first + k * ROW + ROW / 2) };
    });
    const leftBottom = y - GGAP;
    const inputYs = groups.flatMap((r) => r.rows);
    const mid = (Math.min(...inputYs) + Math.max(...inputYs)) / 2;
    const m = outputs.length;
    const outputYs = outputs.map((_, k) => mid + (k - (m - 1) / 2) * ROW);
    const all = [...inputYs, ...outputYs];
    const circuitTop = Math.min(...all) - 18;
    const circuitBottom = Math.max(...all) + 18;
    // A label above a readout reaches nearly 30 above its row.
    const top = Math.min(
      0,
      circuitTop,
      ...outputs.map((o, k) => outputYs[k]! - (labelAbove(o) ? 30 : 12)),
    );
    const shift = PAD - top;
    const height = Math.max(leftBottom, circuitBottom) + shift + PAD;

    const leftEdge = PAD + left;
    const circuitX = leftEdge + gap;
    const outputX = circuitX + circuitW + inner;
    const width = Math.ceil(outputX + outputsW + PAD);

    // Module 5: a named bus writes its count above the wire, right of the slash, with its name
    // left of it; a count below the wire would meet the name over the next row's wire.
    const busMark = (x: number, yy: number, n: number, over = false) =>
      n > 1 ? (
        <g className="bus-mark">
          <line className="slash" x1={x - 4} x2={x + 4} y1={yy + 6} y2={yy - 6} />
          <text className="bus-count" x={x + 6} y={over ? yy - 7 : yy + 16}>
            {n}
          </text>
        </g>
      ) : null;
    // The slash moves so that the name, the slash and the count are centred on the wire together.
    const slashX = (x: number, w: { signal?: string | undefined; width: number }) =>
      w.signal && w.width > 1 ? x + (textWidth(w.signal) - textWidth(String(w.width))) / 2 : x;
    const nameX = (x: number, w: { signal?: string | undefined; width: number }) =>
      w.width > 1 ? slashX(x, w) - 6 : x;
    const nameAnchor = (w: { width: number }) => (w.width > 1 ? "end" : "middle");
    const arrow = (x: number, yy: number) => (
      <polygon className="arrow" points={`${x},${yy} ${x - 8},${yy - 4.5} ${x - 8},${yy + 4.5}`} />
    );

    // A drawing a little wider than its card, as on a phone, is drawn a little smaller, never so
    // small that its 12-pixel text falls under the course's 11 pixels; a wider one still scrolls.
    const scale = width > available && available / width >= 11 / 12 ? available / width : 1;

    return (
      // The outer element is the figure's card; the inner one is measured, inside its padding.
      <div className="scene-figure" data-interactive={interactive.id}>
        <div className="scene-wrap" ref={ref}>
          <svg
            className="scene"
            width={width * scale}
            height={height * scale}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${data.labels.title}. ${data.labels.summary}`}
            data-sources={items.map((i) => i.signal ?? "").join(",")}
            data-outputs={outputs.map((o) => o.signal ?? "").join(",")}
          >
            <g transform={`translate(0 ${shift})`}>
              {groups.map(({ g, top: groupTop, rows }, gi) => (
                <g key={gi} className="source-group">
                  {g.room && (
                    <>
                      <rect
                        className="room"
                        x={PAD}
                        y={groupTop}
                        width={left}
                        height={groupHeight(g)}
                        rx={6}
                      />
                      <text className="room-name" x={PAD + GPAD} y={groupTop + 16}>
                        {g.room}
                      </text>
                    </>
                  )}
                  {g.items.map((item, k) => {
                    const yy = rows[k]!;
                    const sx = leftEdge - GPAD - SYMBOL;
                    return (
                      <g key={k} className="source" data-signal={item.signal}>
                        <text className="part-name" x={sx - SGAP} y={yy + 4} textAnchor="end">
                          {item.label}
                        </text>
                        <SourceSymbol kind={item.kind} x={sx} y={yy} />
                        <line
                          className={item.width > 1 ? "bus" : "wire"}
                          x1={sx + SYMBOL}
                          x2={circuitX - 6}
                          y1={yy}
                          y2={yy}
                        />
                        {arrow(circuitX, yy)}
                        {item.signal && (
                          <text
                            className="signal-name"
                            x={nameX((leftEdge + circuitX) / 2, item)}
                            y={yy - 7}
                            textAnchor={nameAnchor(item)}
                          >
                            {item.signal}
                          </text>
                        )}
                        {busMark(
                          slashX((leftEdge + circuitX) / 2, item),
                          yy,
                          item.width,
                          !!item.signal || countsOver.sources,
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
              <rect
                className="circuit"
                x={circuitX}
                y={circuitTop}
                width={circuitW}
                height={circuitBottom - circuitTop}
                rx={4}
              />
              <text
                className="circuit-name"
                x={circuitX + circuitW / 2}
                y={(circuitTop + circuitBottom) / 2 + 5}
                textAnchor="middle"
              >
                {data.circuit}
              </text>
              {outputs.map((o, k) => {
                const yy = outputYs[k]!;
                const wireMid = (circuitX + circuitW + outputX) / 2;
                return (
                  <g key={k} className="output" data-signal={o.signal}>
                    <line
                      className={o.width > 1 ? "bus" : "wire"}
                      x1={circuitX + circuitW}
                      x2={outputX - 6}
                      y1={yy}
                      y2={yy}
                    />
                    {arrow(outputX, yy)}
                    {o.signal && (
                      <text
                        className="signal-name"
                        x={nameX(wireMid, o)}
                        y={yy - 7}
                        textAnchor={nameAnchor(o)}
                      >
                        {o.signal}
                      </text>
                    )}
                    {busMark(slashX(wireMid, o), yy, o.width, !!o.signal || countsOver.outputs)}
                    {o.kind === "lamp" ? (
                      <>
                        <g className="lamp">
                          <circle cx={outputX + LAMP / 2} cy={yy} r={7.5} />
                          <line x1={outputX + 3} x2={outputX + 13} y1={yy - 5} y2={yy + 5} />
                          <line x1={outputX + 3} x2={outputX + 13} y1={yy + 5} y2={yy - 5} />
                        </g>
                        <text className="part-name" x={outputX + LAMP + SGAP} y={yy + 4}>
                          {o.label}
                        </text>
                      </>
                    ) : (
                      <Readout o={o} x={outputX} y={yy} />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    );
  },
);

/** A readout: a box showing its value, with its label above; or, with no value, its label. */
function Readout({ o, x, y }: { o: OutputItem; x: number; y: number }) {
  const w = readoutWidth(o);
  return (
    <g className="readout">
      <rect x={x} y={y - 11} width={w} height={22} rx={3} />
      <text className="readout-value" x={x + w / 2} y={y + 4} textAnchor="middle">
        {o.value ?? o.label}
      </text>
      {o.value !== undefined && (
        <text className="part-name" x={x + w / 2} y={y - 16} textAnchor="middle">
          {o.label}
        </text>
      )}
    </g>
  );
}

/** A source's symbol, SYMBOL wide, centred on its row; its wire leaves from the right edge. */
function SourceSymbol({ kind, x, y }: { kind: SourceItem["kind"]; x: number; y: number }) {
  switch (kind) {
    case "switch":
      return (
        <g className="symbol switch">
          <circle cx={x + 3} cy={y} r={2.5} />
          <line x1={x + 3} y1={y} x2={x + 15} y2={y - 8} />
          <circle cx={x + 16} cy={y} r={2.5} />
        </g>
      );
    // The signals lesson draws a sensor and a receiver as the same box; so does a scene.
    case "sensor":
    case "receiver":
      return (
        <rect className={`symbol ${kind}`} x={x} y={y - 7} width={SYMBOL} height={14} rx={3} />
      );
    case "button":
      return (
        <g className="symbol button">
          <circle cx={x + 9} cy={y} r={7} />
          <circle className="button-top" cx={x + 9} cy={y} r={3} />
        </g>
      );
    case "clock":
      return (
        <polyline
          className="symbol clock"
          points={`${x},${y + 5} ${x + 4},${y + 5} ${x + 4},${y - 5} ${x + 9},${y - 5} ${x + 9},${y + 5} ${x + 14},${y + 5} ${x + 14},${y - 5} ${x + 18},${y - 5} ${x + 18},${y}`}
        />
      );
  }
}
