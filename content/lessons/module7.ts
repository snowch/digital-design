// Copyright © 2026 Christopher Snow

// Module 7's shared data: the words its figures start from and the test vectors its challenges
// grade with, every expected value worked out in bigints by the ALU's reference (`aluResult` in
// packages/dd-model/src/alu.ts), so a 64-bit word keeps every bit.

import { aluResult, aluSuite, aluVector, hexWord, JOB_NAMES, opBits } from "@dd/dd-model";

/** Module 1's two freezer rooms, as 16-bit words: -184 and -250 tenths of a degree. */
export const ROOM_A = 0xff48n;
export const ROOM_B = 0xff06n;

/** The first lesson's 4-bit words, 3 and 5: the eight jobs give eight different words. */
export const JOBS_A = "0011";
export const JOBS_B = "0101";

/** The capstone suite's seed, recorded here and in the challenge's task. */
export const SUITE_SEED = 2026;

const bin = (w: bigint, n: number) => w.toString(2).padStart(n, "0");

/** A word as a test writes it: bits up to 8 wide, hexadecimal above. */
export function wordText(w: bigint, n: number): string {
  return n <= 8 ? bin(w, n) : `0x${hexWord(w, n)}`;
}

/** A job on two words as a test's label reads: "4 slices: 0011 + 0101". */
export function jobLabel(job: number, a: bigint, b: bigint, n: number): string {
  const show = (w: bigint) => (n <= 8 ? bin(w, n) : hexWord(w, n));
  const slices = `${n} slice${n === 1 ? "" : "s"}`;
  if (job === 5) return `${slices}: copy B ${show(b)}`;
  if (job === 6) return `${slices}: ${show(a)} + 1`;
  if (job === 7) return `${slices}: ${show(a)} - 1`;
  return `${slices}: ${show(a)} ${JOB_NAMES[job as 0]} ${show(b)}`;
}

/**
 * Vectors for a slice chained to the widths given: each job on each pair, with copy 0's carry in
 * set as the ALU's two gates set it (1 for subtract and count up), Y and COUT expected.
 */
export function sliceVectors(cases: readonly (readonly [number, bigint, bigint, number])[]) {
  return cases.map(([job, a, b, n]) => {
    const r = aluResult(job, a, b, n);
    const op = opBits(job);
    return {
      label: jobLabel(job, a, b, n),
      slices: n,
      inputs: {
        A: wordText(a, n),
        B: wordText(b, n),
        ...op,
        CIN: op.OP1 & (op.OP2 ^ op.OP0),
      },
      expect: { Y: wordText(r.Y, n), COUT: r.COUT },
    };
  });
}

/** The capstone's vectors: the generated suite at each width, the text's N set to that width. */
export function suiteVectors(widths: readonly number[], seed: number) {
  return widths.flatMap((n) =>
    aluSuite({ width: n, seed }).map((c) => {
      const v = aluVector(c, n);
      return { ...v, label: `N = ${n}, ${c.group}: ${v.label}`, parameters: { N: n } };
    }),
  );
}
