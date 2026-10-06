// Copyright © 2026 Christopher Snow

// Generated test cases for a circuit that works on two words: normal, boundary, random and
// adversarial. Module 7 uses them to test the ALU at 16 and 64 bits; later modules can use the
// word helpers with a reference function of their own.
//
// - Normal cases are ordinary values, the kind a hand-written test starts with.
// - Boundary cases sit on the edges of the number range: 0, 1, the largest and smallest signed
//   words and the word of all 1s, where a result wraps, overflows or turns sign.
// - Random cases are drawn by a seeded generator. The seed is recorded with the cases, so a run
//   can be repeated exactly, and a new seed draws new cases.
// - Adversarial cases are chosen to break a particular kind of fault: a carry that must run the
//   whole width, overflow at the signed limits, every bit different from its neighbour, one bit
//   alone.
//
// Every word is a bigint and every expected value is worked out in bigints, so 64-bit words keep
// every bit.

import { SeededRandom } from "@dd/sim";

import { aluResult, hexWord, JOB_NAMES, opBits, type AluResult } from "./alu";

export const CASE_GROUPS = ["normal", "boundary", "random", "adversarial"] as const;
export type CaseGroup = (typeof CASE_GROUPS)[number];

const mask = (width: number) => (1n << BigInt(width)) - 1n;

/** The words at the edges of the range, by name. */
export function boundaryWords(width: number): {
  zero: bigint;
  one: bigint;
  signedMax: bigint;
  signedMin: bigint;
  allOnes: bigint;
} {
  return {
    zero: 0n,
    one: 1n,
    signedMax: (1n << BigInt(width - 1)) - 1n,
    signedMin: 1n << BigInt(width - 1),
    allOnes: mask(width),
  };
}

/** 1010...10 and 0101...01: every bit differs from its neighbours. */
export function alternatingWords(width: number): { high: bigint; low: bigint } {
  let low = 0n;
  for (let i = 0; i < width; i += 2) low |= 1n << BigInt(i);
  return { high: mask(width) ^ low, low };
}

/** Words with one bit set: bit 0, the bits at each quarter of the width, and the top bit. */
export function oneBitWords(width: number): bigint[] {
  const bits = [...new Set([0, width / 4, width / 2, (3 * width) / 4, width - 1])]
    .map(Math.floor)
    .filter((k, i, all) => all.indexOf(k) === i);
  return bits.map((k) => 1n << BigInt(k));
}

/** A word of `width` random bits from the generator, drawn 16 bits at a time. */
export function randomWord(rng: SeededRandom, width: number): bigint {
  let w = 0n;
  for (let done = 0; done < width; done += 16) w = (w << 16n) | BigInt(rng.int(0, 0xffff));
  return w & mask(width);
}

export interface WordCase<J> {
  readonly group: CaseGroup;
  readonly job: J;
  readonly a: bigint;
  readonly b: bigint;
}

// ---- The ALU's suite --------------------------------------------------------------------------

export interface AluCase extends WordCase<number> {
  readonly label: string;
  readonly expect: AluResult;
}

export interface AluSuiteOptions {
  readonly width: number;
  /** The random group's seed, recorded in every random case's label. */
  readonly seed: number;
  /** How many random cases each job gets. */
  readonly randomPerJob?: number;
  /** Only these groups, in this order; all four when omitted. */
  readonly groups?: readonly CaseGroup[];
}

/** A case as a learner reads it: the words in hexadecimal around the job's sign. */
export function aluCaseText(job: number, a: bigint, b: bigint, width: number): string {
  const A = hexWord(a, width);
  const B = hexWord(b, width);
  switch (job) {
    case 5:
      return `copy B ${B}`;
    case 6:
      return `${A} + 1`;
    case 7:
      return `${A} - 1`;
    default:
      return `${A} ${JOB_NAMES[job as 0]} ${B}`;
  }
}

const ARITHMETIC = [2, 3, 6, 7];
const LOGIC = [0, 1, 4, 5];

function pairsFor(group: CaseGroup, width: number, seed: number, perJob: number) {
  const out: [number, bigint, bigint][] = [];
  const w = boundaryWords(width);
  const alt = alternatingWords(width);
  const m = mask(width);
  if (group === "normal") {
    // Small, ordinary words, the same at every width: nothing wraps, nothing overflows.
    for (const job of [0, 1, 2, 3, 4, 5, 6, 7]) out.push([job, 23n, 9n], [job, 300n, 1200n]);
  } else if (group === "boundary") {
    // Each arithmetic job on each edge word, with B = 1; each bit-by-bit job on two edge pairs.
    for (const job of ARITHMETIC)
      for (const a of [w.zero, w.one, w.signedMax, w.signedMin, w.allOnes]) out.push([job, a, 1n]);
    for (const job of LOGIC) out.push([job, w.allOnes, w.signedMin], [job, w.zero, w.allOnes]);
  } else if (group === "random") {
    const rng = new SeededRandom(seed);
    for (const job of [0, 1, 2, 3, 4, 5, 6, 7])
      for (let i = 0; i < perJob; i++)
        out.push([job, randomWord(rng, width), randomWord(rng, width)]);
  } else {
    // A carry made in bit 0 and passed through every slice, without and with overflow.
    out.push([2, alt.low, alt.high | 1n], [2, alt.low, alt.low]);
    out.push(
      [2, m, m],
      [3, w.zero, m],
      [3, w.signedMin, w.signedMax],
      [3, w.signedMax, w.signedMin],
    );
    out.push([2, w.signedMin, w.signedMin], [2, w.signedMax, w.signedMax]);
    // A word minus itself: every bit of the difference 0, so ZERO must see every slice.
    out.push([3, alt.high, alt.high], [3, m, m]);
    // Every bit unlike its neighbours, for each bit-by-bit job: a bit stuck, or two bits swapped.
    for (const job of LOGIC) out.push([job, alt.high, alt.low]);
    // One bit alone in B, copied: a slice that drops or invents a bit.
    for (const bit of oneBitWords(width)) out.push([5, 0n, bit]);
  }
  return out;
}

/** The ALU's generated suite: every case with its group, its words and its expected result. */
export function aluSuite(options: AluSuiteOptions): AluCase[] {
  const { width, seed } = options;
  const perJob = options.randomPerJob ?? 2;
  const groups = options.groups ?? CASE_GROUPS;
  return groups.flatMap((group) =>
    pairsFor(group, width, seed, perJob).map(([job, a, b]) => ({
      group,
      job,
      a: a & mask(width),
      b: b & mask(width),
      label: aluCaseText(job, a, b, width),
      expect: aluResult(job, a, b, width),
    })),
  );
}

/** A case as a test vector: inputs A, B and the three select bits; Y and the flags expected. */
export function aluVector(c: AluCase, width: number, flags = true) {
  const op = opBits(c.job);
  return {
    label: c.label,
    inputs: { A: `0x${hexWord(c.a, width)}`, B: `0x${hexWord(c.b, width)}`, ...op },
    expect: {
      Y: `0x${hexWord(c.expect.Y, width)}`,
      ...(flags ? { ZERO: c.expect.ZERO, MINUS: c.expect.MINUS, OVER: c.expect.OVER } : {}),
      COUT: c.expect.COUT,
    },
  };
}
