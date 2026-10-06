// Copyright © 2026 Christopher Snow

// A recording drawn against a threshold: one dot per sample at the voltage the receiver
// measured, a stick from the level the sender drove to the dot (the noise), the threshold as a
// line, and under the plot the sample numbers, the bits sent and the bits read. Every value is
// the model's (dd-model/signals); the drawing computes positions and nothing else.
//
// The drawing is as wide as its box, one unit per pixel, so its text stays at the size the
// stylesheet sets on a phone and on a desktop. Where the columns are too narrow for two digits
// side by side, the even samples' numbers drop to a second line, each still over its column.

import type { ReadResult, Recording } from "@dd/dd-model";
import { volts } from "@dd/dd-model";

import { format, useViewStrings } from "./strings";
import { useWidth } from "./useWidth";

const LEFT = 86;
const RIGHT = 10;
const TOP = 12;
const PLOT = 180;
const ROW = 22;

export function SignalPlot({
  rec,
  threshold,
  result,
  band,
  title,
  plain = false,
}: {
  rec: Recording;
  threshold: number;
  result: ReadResult;
  band?: { from: number; to: number } | undefined;
  title?: string;
  /**
   * The samples alone, before a question about reading them is answered: no threshold line, no
   * row of bits read, no rings on the samples read wrong, and every dot one colour.
   */
  plain?: boolean;
}) {
  const strings = useViewStrings();
  const [ref, width] = useWidth<HTMLDivElement>(640);
  const n = rec.samples.length;
  const lo = Math.min(-1, Math.floor(Math.min(...rec.samples, plain ? 0 : threshold) / 100));
  const hi = Math.max(4, Math.ceil(Math.max(...rec.samples, plain ? 0 : threshold) / 100));
  const w = Math.max(width, 260);
  const col = (w - LEFT - RIGHT) / n;
  const x = (i: number) => LEFT + (i + 0.5) * col;
  const y = (cv: number) => TOP + ((hi * 100 - cv) / ((hi - lo) * 100)) * PLOT;
  const rows = TOP + PLOT + 10;
  // Two digits side by side need about 24 pixels; narrower, even samples go on a second line.
  const stagger = col < 24;
  const numbers = stagger ? 2 * ROW - 6 : ROW;
  const height = rows + numbers + (plain ? 1 : 2) * ROW + 4;
  const ticks = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
  const wrong = new Set(plain ? [] : result.wrong);
  const range = { n, low: volts(Math.min(...rec.samples)), high: volts(Math.max(...rec.samples)) };
  const summary = plain
    ? format(strings.signal.plainSummary, range)
    : format(strings.signal.plotSummary, {
        ...range,
        threshold: volts(threshold),
        wrong: result.wrong.length,
      });

  return (
    <div className="signal-plot-wrap" ref={ref}>
      <svg
        className="signal-plot"
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label={`${title ?? strings.signal.plotTitle}. ${summary}`}
        {...(plain
          ? { "data-plain": "true" }
          : { "data-threshold": threshold, "data-wrong": result.wrong.join(",") })}
      >
        {ticks.map((v) => (
          <g key={v} className="tick">
            <line x1={LEFT} x2={w - RIGHT} y1={y(v * 100)} y2={y(v * 100)} />
            <text x={LEFT - 8} y={y(v * 100) + 4} textAnchor="end">
              {`${v} V`}
            </text>
          </g>
        ))}
        {band && (
          <rect
            className="band"
            x={LEFT}
            width={w - LEFT - RIGHT}
            y={y(band.to)}
            height={Math.max(1, y(band.from) - y(band.to))}
          />
        )}
        <line className="level" x1={LEFT} x2={w - RIGHT} y1={y(rec.low)} y2={y(rec.low)} />
        <line className="level" x1={LEFT} x2={w - RIGHT} y1={y(rec.high)} y2={y(rec.high)} />
        {rec.samples.map((s, i) => {
          const level = rec.sent[i] ? rec.high : rec.low;
          const one = result.read[i] === 1;
          return (
            <g
              key={i}
              className={`sample ${plain ? "unread" : one ? "read-1" : "read-0"}${wrong.has(i) ? " wrong" : ""}`}
              data-sample={i + 1}
              data-volts={s}
            >
              <line className="noise" x1={x(i)} x2={x(i)} y1={y(level)} y2={y(s)} />
              {wrong.has(i) && <circle className="wrong-ring" cx={x(i)} cy={y(s)} r={9} />}
              <circle className="dot" cx={x(i)} cy={y(s)} r={5} />
            </g>
          );
        })}
        {!plain && (
          <line
            className="threshold"
            x1={LEFT}
            x2={w - RIGHT}
            y1={y(threshold)}
            y2={y(threshold)}
          />
        )}
        <g className="rows">
          {/* Between its two lines of numbers when they are staggered, so it names both. */}
          <text className="row-name" x={4} y={rows + 15 + (stagger ? (ROW - 6) / 2 : 0)}>
            {strings.signal.sample}
          </text>
          <text className="row-name" x={4} y={rows + numbers + 15}>
            {strings.signal.sent}
          </text>
          {!plain && (
            <text className="row-name" x={4} y={rows + numbers + ROW + 15}>
              {strings.signal.read}
            </text>
          )}
          {rec.samples.map((_, i) => (
            <g key={i}>
              <text
                className="row-number"
                x={x(i)}
                y={rows + 15 + (stagger && i % 2 === 1 ? ROW - 6 : 0)}
                textAnchor="middle"
              >
                {i + 1}
              </text>
              <text className="row-bit" x={x(i)} y={rows + numbers + 15} textAnchor="middle">
                {rec.sent[i]}
              </text>
              {!plain && (
                <text
                  className={`row-bit${wrong.has(i) ? " wrong" : ""}`}
                  x={x(i)}
                  y={rows + numbers + ROW + 15}
                  textAnchor="middle"
                >
                  {result.read[i]}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
