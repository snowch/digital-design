// A signal on a wire, sampled, and read against a threshold.
//
// The lesson's recordings are what a receiver at the end of a long cable measures once per bit:
// the level the sender drove, plus noise. The noise is generated once from a seed, so a
// recording is the same on every page and in every test; it is a teaching recording, not a
// measurement, and the lesson says so. Voltages are kept in hundredths of a volt as whole
// numbers, so a threshold exactly on a sample is decided by one rule and not by rounding.
//
// Reading: a sample at or above the threshold reads 1; below it reads 0.

import { SeededRandom } from "@dd/sim";

import { bitsOf, type Bit } from "./bits";

/** Hundredths of a volt. */
export type Centivolts = number;

export interface RecordingSpec {
  /** The bits the sender sent, highest first. */
  readonly sent: readonly Bit[];
  /** The levels the sender drives for 0 and for 1. */
  readonly low: Centivolts;
  readonly high: Centivolts;
  /** Random noise: its spread (one standard deviation) and the seed it is drawn from. */
  readonly spread: Centivolts;
  readonly seed: number;
  /** A slow wobble on top (mains hum from a motor): its size and its period in samples. */
  readonly hum?: { readonly size: Centivolts; readonly period: number; readonly phase: number };
}

/** The word the freezer-room sensor sends: -184 (it counts tenths of a degree, so -18.4), as 16 bits. */
export const SENSOR_WORD: readonly Bit[] = bitsOf(-184, 16);

export const RECORDINGS = {
  /** The compressor is off: a little noise from the cable. */
  quiet: { sent: SENSOR_WORD, low: 0, high: 330, spread: 8, seed: 11 },
  /** The compressor is running: its hum rides on the line, with more random noise. */
  compressor: {
    sent: SENSOR_WORD,
    low: 0,
    high: 330,
    spread: 20,
    seed: 9,
    hum: { size: 90, period: 7, phase: 0.6 },
  },
} as const satisfies Record<string, RecordingSpec>;

export type RecordingId = keyof typeof RECORDINGS;
export const RECORDING_IDS = Object.keys(RECORDINGS) as RecordingId[];

export interface Recording {
  readonly id: RecordingId;
  readonly sent: readonly Bit[];
  readonly low: Centivolts;
  readonly high: Centivolts;
  /** One sample per bit, in hundredths of a volt. */
  readonly samples: readonly Centivolts[];
}

/** A normal draw by the Box-Muller method. */
function normal(rng: SeededRandom): number {
  const u = Math.max(rng.next(), 1e-12);
  const v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * The recording, with its noise multiplied by `noiseScale` (1 is the recording as made). The
 * noise is the same draw at every scale, so turning it up makes the same wobbles bigger.
 */
export function recording(id: RecordingId, noiseScale = 1): Recording {
  return sampled(id, RECORDINGS[id], noiseScale);
}

/** The samples a spec makes; `recording` names the lesson's two. */
export function sampled(id: RecordingId, spec: RecordingSpec, noiseScale = 1): Recording {
  const rng = new SeededRandom(spec.seed);
  const samples = spec.sent.map((bit, i) => {
    const level = bit ? spec.high : spec.low;
    const hum = spec.hum
      ? spec.hum.size * Math.sin((2 * Math.PI * i) / spec.hum.period + spec.hum.phase)
      : 0;
    const noise = hum + spec.spread * normal(rng);
    return Math.round(level + noiseScale * noise);
  });
  return { id, sent: spec.sent, low: spec.low, high: spec.high, samples };
}

/** The sample of one kind that came nearest the threshold, and how far it was on its own side. */
export interface Nearest {
  readonly index: number;
  /**
   * For a 0 sample, how far below the threshold; for a 1 sample, how far at or above it. A
   * negative gap means the sample is on the wrong side, and is read wrong.
   */
  readonly gap: Centivolts;
}

export interface ReadResult {
  readonly read: readonly Bit[];
  /** The samples read differently from what was sent, by index. */
  readonly wrong: readonly number[];
  /** The highest 0 sample, and the lowest 1 sample: the two the threshold must fall between. */
  readonly nearest0?: Nearest;
  readonly nearest1?: Nearest;
}

export function readBits(rec: Recording, threshold: Centivolts): ReadResult {
  const read: Bit[] = rec.samples.map((s) => (s >= threshold ? 1 : 0));
  const wrong: number[] = [];
  let nearest0: Nearest | undefined;
  let nearest1: Nearest | undefined;
  rec.samples.forEach((s, i) => {
    if (read[i] !== rec.sent[i]) wrong.push(i);
    if (rec.sent[i] === 0) {
      const gap = threshold - s;
      if (!nearest0 || gap < nearest0.gap) nearest0 = { index: i, gap };
    } else {
      const gap = s - threshold;
      if (!nearest1 || gap < nearest1.gap) nearest1 = { index: i, gap };
    }
  });
  return {
    read,
    wrong,
    ...(nearest0 ? { nearest0 } : {}),
    ...(nearest1 ? { nearest1 } : {}),
  };
}

/**
 * The thresholds that read every sample as sent: above the highest 0 sample, and at or below
 * the lowest 1 sample. Undefined when there are none, because some 0 sample is at or above
 * some 1 sample.
 */
export function safeBand(rec: Recording): { from: Centivolts; to: Centivolts } | undefined {
  const zeros = rec.samples.filter((_, i) => rec.sent[i] === 0);
  const ones = rec.samples.filter((_, i) => rec.sent[i] === 1);
  const from = Math.max(...zeros) + 1;
  const to = Math.min(...ones);
  return from <= to ? { from, to } : undefined;
}

/** The smallest noise scale, in steps of `step`, at which no threshold reads every sample. */
export function breakingScale(id: RecordingId, step = 0.1, max = 5): number | undefined {
  for (let k = 1; k * step <= max + 1e-9; k++) {
    const scale = Math.round(k * step * 100) / 100;
    if (!safeBand(recording(id, scale))) return scale;
  }
  return undefined;
}

/** Hundredths of a volt as the page writes them: "1.65 V". */
export function volts(cv: Centivolts): string {
  return `${(cv / 100).toFixed(2)} V`;
}
