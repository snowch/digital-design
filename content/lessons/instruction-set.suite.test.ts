// Copyright © 2026 Christopher Snow

// The counts lesson 10.1 states about Module 8's 37 programs, read off the two machines side by
// side: a program differs under a fault when, after some instruction, the machines differ on a
// part a program can see, or Module 9's machine never stops. Edge counts are not compared: they
// are outside the agreement. Each fault runs the 37 programs, so each has its own long test.

import { describe, expect, it } from "vitest";

import { machineSuite, pairView, runPair, startPair, stuckAt, type Fault } from "@dd/dd-model";

const SUITE = machineSuite(1);

function differing(faults: readonly Fault[]): number {
  let n = 0;
  for (const c of SUITE) {
    const pair = startPair(c.source, c.inputs, faults);
    runPair(pair, 400);
    const stopped = pair.log.at(-1)?.stops === true;
    if (pair.log.some((l) => l.differ.length > 0) || !stopped || pairView(pair).differ.length > 0)
      n++;
  }
  return n;
}

describe("Module 8's 37 programs on both machines, by what a program can see", () => {
  it("there are 37", () => expect(SUITE.length).toBe(37));
  it("HOLDR stuck at 1: none differs", () => {
    expect(differing([stuckAt("control/HOLDR", 1)])).toBe(0);
  }, 300_000);
  it("PCEN stuck at 1: all 37 differ", () => {
    expect(differing([stuckAt("control/PCEN", 1)])).toBe(37);
  }, 300_000);
  it("HOLDR stuck at 0: 29 differ", () => {
    expect(differing([stuckAt("control/HOLDR", 0)])).toBe(29);
  }, 300_000);
});
