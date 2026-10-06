// Copyright © 2026 Christopher Snow

// A recording from a sensor line, read against a threshold the learner moves. Below the plot:
// how many samples read wrong, and how near the threshold the nearest sample of each kind came.
// Optionally a choice of recordings, a noise control that scales the same noise up, the band of
// thresholds that read every sample right, and the sent and read bits as a number. Every value
// is the model's (dd-model/signals and bits).

import { useMemo } from "react";
import { z } from "zod";

import {
  RECORDING_IDS,
  readBits,
  readingOf,
  recording,
  safeBand,
  volts,
  type RecordingId,
} from "@dd/dd-model";
import { useSlot, type InteractiveProps } from "@dd/lesson-runtime";

import { SignalPlot } from "../SignalPlot";
import { format, useViewStrings } from "../strings";
import { withProps } from "./props";

const RecordingIdSchema = z.enum(RECORDING_IDS as [RecordingId, ...RecordingId[]]);

const Props = z.object({
  /** The recordings the learner may choose between, with the label each is shown under. */
  recordings: z.array(z.object({ id: RecordingIdSchema, label: z.string() })).min(1),
  /** The threshold to start from, and its range, in hundredths of a volt. */
  threshold: z.number().int().default(240),
  range: z.tuple([z.number().int(), z.number().int()]).default([0, 330]),
  step: z.number().int().positive().default(5),
  /** A noise control from 1 to `max` times the recording, in tenths. */
  noise: z.object({ max: z.number().min(1).max(5) }).optional(),
  /** Shade the thresholds that read every sample right. */
  showBand: z.boolean().default(false),
  /** Show the sent and the read bits as a number, read this way. */
  reading: z.enum(["unsigned", "signed"]).optional(),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly recording?: RecordingId;
  readonly threshold?: number;
  readonly noise?: number;
}

export const NoisySignal = withProps(
  Props,
  function NoisySignal({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const first = data.recordings[0]!.id;
    const id =
      stored?.recording && data.recordings.some((r) => r.id === stored.recording)
        ? stored.recording
        : first;
    const threshold = stored?.threshold ?? data.threshold;
    const noise = data.noise ? (stored?.noise ?? 10) : 10;
    const rec = useMemo(() => recording(id, noise / 10), [id, noise]);
    const result = useMemo(() => readBits(rec, threshold), [rec, threshold]);
    const band = useMemo(() => safeBand(rec), [rec]);
    const set = (patch: Stored) => setStored({ ...stored, ...patch });
    const name = `${interactive.id}-recording`;

    return (
      <div
        className="noisy-signal"
        data-interactive={interactive.id}
        data-recording={id}
        data-threshold={threshold}
        data-noise={noise}
        data-wrong={result.wrong.length}
      >
        {data.recordings.length > 1 && (
          <fieldset className="noisy-recordings">
            <legend>{strings.signal.recording}</legend>
            {data.recordings.map((r) => (
              <label key={r.id} className="noisy-recording">
                <input
                  type="radio"
                  name={name}
                  value={r.id}
                  checked={id === r.id}
                  onChange={() => set({ recording: r.id })}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </fieldset>
        )}
        <label className="noisy-slider">
          <span>{format(strings.signal.threshold, { value: volts(threshold) })}</span>
          <input
            type="range"
            min={data.range[0]}
            max={data.range[1]}
            step={data.step}
            value={threshold}
            onChange={(e) => set({ threshold: Number(e.target.value) })}
          />
        </label>
        {data.noise && (
          <label className="noisy-slider">
            <span>{format(strings.signal.noise, { scale: (noise / 10).toFixed(1) })}</span>
            <input
              type="range"
              min={10}
              max={Math.round(data.noise.max * 10)}
              step={1}
              value={noise}
              onChange={(e) => set({ noise: Number(e.target.value) })}
            />
          </label>
        )}
        <SignalPlot
          rec={rec}
          threshold={threshold}
          result={result}
          band={data.showBand ? band : undefined}
        />
        <div className="noisy-readout" role="status">
          <p className={result.wrong.length ? "noisy-wrong" : "noisy-right"}>
            {result.wrong.length === 0
              ? strings.signal.allRight
              : format(strings.signal.someWrong, {
                  n: result.wrong.length,
                  total: rec.samples.length,
                  list: result.wrong.map((i) => i + 1).join(", "),
                })}
          </p>
          {result.nearest0 && (
            <p>
              {format(
                result.nearest0.gap > 0 ? strings.signal.nearest0 : strings.signal.nearest0Wrong,
                { index: result.nearest0.index + 1, gap: volts(Math.abs(result.nearest0.gap)) },
              )}
            </p>
          )}
          {result.nearest1 && (
            <p>
              {format(
                result.nearest1.gap >= 0 ? strings.signal.nearest1 : strings.signal.nearest1Wrong,
                { index: result.nearest1.index + 1, gap: volts(Math.abs(result.nearest1.gap)) },
              )}
            </p>
          )}
          {data.showBand && (
            <p>
              {band
                ? format(strings.signal.band, { from: volts(band.from), to: volts(band.to) })
                : strings.signal.noBand}
            </p>
          )}
          {data.reading && (
            <p>
              {format(strings.signal.words, {
                sent: readingOf(rec.sent, data.reading),
                read: readingOf(result.read, data.reading),
              })}
            </p>
          )}
        </div>
      </div>
    );
  },
);
