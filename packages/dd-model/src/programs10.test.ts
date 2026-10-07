// Copyright © 2026 Christopher Snow

// Module 10: every comparison said by one of the machine's branches, swapped or not, and programs
// counted on the reference.

import { describe, expect, it } from "vitest";

import { comparisons, runProgram } from "./programs10";

describe("the comparisons with their registers swapped", () => {
  it("each branch is taken exactly when its comparison holds, on words that test the edges", () => {
    const words = [0n, 1n, -1n, 5n, -3n, 7n, (1n << 63n) - 1n, -(1n << 63n), 66n];
    for (const a of words)
      for (const b of words)
        for (const c of comparisons(a, b)) expect(c.taken, `${a} ${c.relation} ${b}`).toBe(c.holds);
  });
});

describe("programs counted", () => {
  it("5000 from three constant jobs, or one load of a word kept in the ROM", () => {
    const sums = runProgram("R1 <= 2047\nR1 <= R1 + 2047\nR1 <= R1 + 906\nstop");
    expect([sums.written, sums.ran, sums.romBytes, sums.state.regs[1]]).toEqual([4, 4, 16, 5000n]);
    const kept = runProgram("R1 <= word[big]\nstop\nbig: word 5000");
    expect([kept.written, kept.ran, kept.romBytes, kept.state.regs[1]]).toEqual([2, 2, 16, 5000n]);
  });
});
