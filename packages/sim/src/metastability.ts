// The metastability overlay: the one place the deterministic engine steps aside.
//
// In the delay model, a flip-flop whose D input changes too close to the clock edge gets an
// answer from the gate model, but not one worth trusting: the model has only 0, 1 and X, it
// decides every tie by the order events were scheduled, and a real latch in that position does
// neither. Its output hovers between levels for an unpredictable time and then falls to one side,
// and which side and how long are not something a model can know.
//
// So this overlay does what a model can do honestly: it draws. Given the moment the output became
// undecided and a recorded seed, it marks the output unknown from that moment, draws a settling
// delay and a final value, schedules them, and records the seed and the draws in the trace. A
// replay with the same seed reproduces the same divergence; a new experiment gets a new seed. The
// lesson that uses it says that this is the one non-deterministic piece, that the window in which
// it applies is derived from the gate delays the course chose, and that the delay distribution is
// a teaching choice, not a measurement.

import { SeededRandom } from "./rng";
import type { Simulator } from "./simulator";
import { bit0, bit1, hasUnknown, unknown, type Word } from "./values";

export interface OverlayOptions {
  /** The flip-flop's output net. */
  readonly output: string;
  /** The seed for this experiment. Record it; replay with it. */
  readonly seed: number;
  /** Shortest and longest settling delay the draw may produce, in time units. */
  readonly settleBetween?: readonly [number, number];
  /**
   * When the output is to be declared undecided. Given, the overlay applies whatever the gate
   * model said, from this time; absent, it applies only if the output is already unknown now.
   */
  readonly from?: number;
}

export interface OverlayResult {
  readonly applied: boolean;
  readonly seed: number;
  /** When the output became unknown. */
  readonly from?: number;
  /** When the draw says it settles. */
  readonly settlesAt?: number;
  readonly settlesTo?: 0 | 1;
}

/**
 * Marks `output` unknown (from `from`, or now if it is already unknown), draws when and to what it
 * settles, schedules both, runs the queue dry again, and returns what it did. With no `from` and a
 * known output, the overlay applies nothing and says so.
 */
export function applyMetastabilityOverlay(sim: Simulator, options: OverlayOptions): OverlayResult {
  const current: Word = sim.read(options.output);
  const forced = options.from !== undefined;
  if (!forced && !hasUnknown(current)) return { applied: false, seed: options.seed };
  const [lo, hi] = options.settleBetween ?? [5, 60];
  const rng = new SeededRandom(options.seed);
  const delay = rng.int(lo, hi);
  const value: 0 | 1 = rng.next() < 0.5 ? 0 : 1;
  const from = options.from ?? sim.time;
  const at = from + delay;
  if (forced) {
    sim.scheduleAt(
      options.output,
      unknown(current.width),
      from,
      "overlay",
      `undecided from ${from}: D changed inside the flip-flop's window`,
    );
  }
  sim.scheduleAt(
    options.output,
    value === 1 ? bit1 : bit0,
    at,
    "overlay",
    `metastable from ${from}; seed ${options.seed} drew a settle after ${delay} to ${value}`,
  );
  sim.run();
  return { applied: true, seed: options.seed, from, settlesAt: at, settlesTo: value };
}
