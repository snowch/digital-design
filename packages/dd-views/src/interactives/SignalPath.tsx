// The scene the signals lesson starts from, drawn: the sensor in the freezer room, the cable that
// runs past the compressor, and the display in the office with its receiver where the cable
// ends; under it, the steps the sensor drives onto the cable. The steps, their two levels and the
// number the sensor sends are the model's (dd-model: signals and bits); the drawing places the
// lesson's names and computes positions, nothing else.
//
// Like the signal plot, the drawing is as wide as its box, one unit per pixel, so its 12-pixel
// text stays that size on a phone. The strip of steps uses the plot's margins, so each step sits
// over the same column as its sample in the plots further down the page.

import { useMemo } from "react";
import { z } from "zod";

import {
  RECORDING_IDS,
  bitsText,
  readingOf,
  recording,
  volts,
  type RecordingId,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { format, useViewStrings } from "../strings";
import { useWidth } from "../useWidth";
import { withProps } from "./props";

const RecordingIdSchema = z.enum(RECORDING_IDS as [RecordingId, ...RecordingId[]]);

const Props = z.object({
  /** The recording whose sent steps the strip draws. */
  recording: RecordingIdSchema,
  /** The lesson's names for the parts of the drawing, and what a screen reader is told. */
  labels: z.object({
    fromRoom: z.string().min(1),
    sensor: z.string().min(1),
    /** Under the sensor; {value} is the number the steps carry, read as the sensor wrote it. */
    sends: z.string().includes("{value}"),
    cable: z.string().min(1),
    compressor: z.string().min(1),
    toRoom: z.string().min(1),
    display: z.string().min(1),
    receiver: z.string().min(1),
    /** Beside the jagged line from the compressor to the cable. */
    noise: z.string().min(1),
    /** Over the strip; {n} is the number of steps. */
    steps: z.string().includes("{n}"),
    title: z.string().min(1),
    /** {value}, {n}, {low}, {high} and {levels} are filled from the model. */
    summary: z.string().min(1),
  }),
});
type Data = z.infer<typeof Props>;

/** The advance of one character of the drawing's 12-pixel monospaced text. */
const CHAR = 7.2;
const textWidth = (s: string) => s.length * CHAR;

/** The two levels as the lesson writes them: "0 V" and "3.30 V". */
const levelText = (cv: number) => (cv === 0 ? "0 V" : volts(cv));

const PAD = 8;
// The setup.
const ROOM_TOP = 6;
const ROOM_BOTTOM = 124;
const COMPRESSOR_TOP = 112;
const CABLE_Y = 70;
// The strip: the signal plot's margins and row height.
const LEFT = 86;
const RIGHT = 10;
const ROW = 22;
const STRIP_TOP = 164;

export const SignalPath = withProps(
  Props,
  function SignalPath({ data, interactive }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [ref, width] = useWidth<HTMLDivElement>(640);
    const rec = useMemo(() => recording(data.recording), [data.recording]);
    const L = data.labels;
    const w = Math.max(width, 300);
    const n = rec.sent.length;
    const value = readingOf(rec.sent, "signed");
    const sends = format(L.sends, { value });
    const low = levelText(rec.low);
    const high = levelText(rec.high);

    // Two rooms at the ends, each as wide as what it holds; the cable in the gap between them.
    const room = (...needs: number[]) =>
      Math.min(190, Math.max(Math.round(w * 0.22), ...needs.map(Math.ceil)));
    const leftW = room(textWidth(L.fromRoom) + 20, textWidth(sends) + 16, textWidth(L.sensor) + 40);
    // The office holds the display, and the display holds the receiver with room either side.
    const rightW = room(
      textWidth(L.toRoom) + 20,
      textWidth(L.display) + 32,
      textWidth(L.receiver) + 44,
    );
    const left = { x0: PAD, x1: PAD + leftW };
    const right = { x0: w - PAD - rightW, x1: w - PAD };
    const leftCx = (left.x0 + left.x1) / 2;
    const gapCx = (left.x1 + right.x0) / 2;

    const sensorW = Math.min(leftW - 20, textWidth(L.sensor) + 32);
    const sensor = { x: leftCx - sensorW / 2, y: CABLE_Y - 18, w: sensorW, h: 36 };
    const display = { x: right.x0 + 8, y: 30, w: rightW - 16, h: 82 };
    const receiver = { x: display.x + 6, y: CABLE_Y - 13, w: display.w - 12, h: 26 };
    // The compressor hangs below the rooms' lower edge, so it does not read as a third room.
    const compressorW = textWidth(L.compressor) + 12;
    const compressor = { x: gapCx - compressorW / 2, y: COMPRESSOR_TOP, w: compressorW, h: 24 };
    const arrowTip = right.x0 - 6;
    // A jagged line from the compressor up to the cable: the noise it puts on the line.
    const jagSteps = Math.floor((compressor.y - CABLE_Y - 6) / 4);
    const jag = Array.from({ length: jagSteps + 1 }, (_, k) => k)
      .map((k) => `${gapCx + (k % 2 === 0 ? -5 : 5)},${compressor.y - k * 4}`)
      .join(" ");

    // The strip of steps, column for column with the signal plot.
    const col = (w - LEFT - RIGHT) / n;
    const yHigh = STRIP_TOP + 26;
    const yLow = STRIP_TOP + 66;
    const yOf = (bit: number) => (bit ? yHigh : yLow);
    const rows = yLow + 10;
    const stagger = col < 24;
    const numbers = stagger ? 2 * ROW - 6 : ROW;
    const height = rows + numbers + ROW + 4;

    const summary = format(L.summary, {
      value,
      n,
      low,
      high,
      levels: bitsText(rec.sent),
    });

    return (
      // The outer element is the figure's card; the inner one is measured, inside its padding.
      <div className="signal-path-figure" data-interactive={interactive.id}>
        <div className="signal-path-wrap" ref={ref}>
          <svg
            className="signal-path"
            width={w}
            height={height}
            viewBox={`0 0 ${w} ${height}`}
            role="img"
            aria-label={`${L.title}. ${summary}`}
            data-steps={rec.sent.join("")}
            data-sends={value}
          >
            <g className="setup">
              <rect
                className="room"
                x={left.x0}
                y={ROOM_TOP}
                width={leftW}
                height={ROOM_BOTTOM - ROOM_TOP}
                rx={6}
              />
              <rect
                className="room"
                x={right.x0}
                y={ROOM_TOP}
                width={rightW}
                height={ROOM_BOTTOM - ROOM_TOP}
                rx={6}
              />
              <text className="room-name" x={left.x0 + 8} y={ROOM_TOP + 16}>
                {L.fromRoom}
              </text>
              <text className="room-name" x={right.x0 + 8} y={ROOM_TOP + 16}>
                {L.toRoom}
              </text>
              <line
                className="cable"
                x1={sensor.x + sensor.w}
                x2={receiver.x}
                y1={CABLE_Y}
                y2={CABLE_Y}
              />
              <polygon
                className="arrow"
                points={`${arrowTip},${CABLE_Y} ${arrowTip - 9},${CABLE_Y - 5} ${arrowTip - 9},${CABLE_Y + 5}`}
              />
              <text className="cable-name" x={gapCx} y={CABLE_Y - 10} textAnchor="middle">
                {L.cable}
              </text>
              <polyline className="interference" points={jag} />
              <text className="noise-name" x={gapCx + 10} y={compressor.y - 10}>
                {L.noise}
              </text>
              <rect
                className="machine"
                x={compressor.x}
                y={compressor.y}
                width={compressor.w}
                height={compressor.h}
                rx={4}
              />
              <text className="part-name" x={gapCx} y={compressor.y + 16} textAnchor="middle">
                {L.compressor}
              </text>
              <rect
                className="device"
                x={sensor.x}
                y={sensor.y}
                width={sensor.w}
                height={sensor.h}
                rx={4}
              />
              <text className="part-name" x={leftCx} y={CABLE_Y + 4} textAnchor="middle">
                {L.sensor}
              </text>
              <text className="sends" x={leftCx} y={sensor.y + sensor.h + 20} textAnchor="middle">
                {sends}
              </text>
              <rect
                className="display"
                x={display.x}
                y={display.y}
                width={display.w}
                height={display.h}
                rx={4}
              />
              <text
                className="part-name"
                x={display.x + display.w / 2}
                y={display.y + 16}
                textAnchor="middle"
              >
                {L.display}
              </text>
              <rect
                className="device"
                x={receiver.x}
                y={receiver.y}
                width={receiver.w}
                height={receiver.h}
                rx={3}
              />
              <text
                className="part-name"
                x={receiver.x + receiver.w / 2}
                y={CABLE_Y + 4}
                textAnchor="middle"
              >
                {L.receiver}
              </text>
            </g>
            <g className="strip">
              <text className="strip-title" x={PAD} y={STRIP_TOP}>
                {format(L.steps, { n })}
              </text>
              <line className="level" x1={LEFT} x2={w - RIGHT} y1={yHigh} y2={yHigh} />
              <line className="level" x1={LEFT} x2={w - RIGHT} y1={yLow} y2={yLow} />
              <text className="tick" x={LEFT - 8} y={yHigh + 4} textAnchor="end">
                {format(strings.path.level, { digit: 1, volts: high })}
              </text>
              <text className="tick" x={LEFT - 8} y={yLow + 4} textAnchor="end">
                {format(strings.path.level, { digit: 0, volts: low })}
              </text>
              {rec.sent.map((bit, i) => {
                const x0 = LEFT + i * col;
                const prev = rec.sent[i - 1];
                return (
                  <g key={i} className="step" data-step={i + 1} data-level={bit}>
                    {bit === 1 && (
                      <rect
                        className="step-fill"
                        x={x0 + 1}
                        y={yHigh}
                        width={Math.max(1, col - 2)}
                        height={yLow - yHigh}
                      />
                    )}
                    {prev !== undefined && prev !== bit && (
                      <line className="step-edge" x1={x0} x2={x0} y1={yHigh} y2={yLow} />
                    )}
                    <line
                      className={bit ? "step-high" : "step-low"}
                      x1={x0}
                      x2={x0 + col}
                      y1={yOf(bit)}
                      y2={yOf(bit)}
                    />
                    <text
                      className="row-number"
                      x={x0 + col / 2}
                      y={rows + 15 + (stagger && i % 2 === 1 ? ROW - 6 : 0)}
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                    <text
                      className="row-bit"
                      x={x0 + col / 2}
                      y={rows + numbers + 15}
                      textAnchor="middle"
                    >
                      {bit}
                    </text>
                  </g>
                );
              })}
              <text className="row-name" x={4} y={rows + 15 + (stagger ? (ROW - 6) / 2 : 0)}>
                {strings.path.step}
              </text>
              <text className="row-name" x={4} y={rows + numbers + 15}>
                {strings.signal.sent}
              </text>
            </g>
          </svg>
        </div>
      </div>
    );
  },
);
