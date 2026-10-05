// Copyright © 2026 Chris Snow

// A small seeded random number generator, for the one place the engine is not deterministic by
// design: the metastability overlay. Its draws are recorded in the trace, so a replay reproduces
// them; the generator exists so that an experiment can be re-created from its seed alone.
//
// mulberry32: 32-bit state, good enough for a teaching draw and small enough to read.

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** The next number in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** A whole number from `min` to `max` inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** The generator's state, so a snapshot can carry it. */
  save(): number {
    return this.state;
  }

  restore(state: number): void {
    this.state = state >>> 0;
  }
}
