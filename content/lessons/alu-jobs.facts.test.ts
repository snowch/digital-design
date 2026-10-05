// Facts the eight-jobs lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { readingOf, parseBits } from "@dd/dd-model";

import { aluJobs } from "./alu-jobs";
import { PROSE } from "./alu-jobs.prose";
import {
  explorerOutputs,
  faultChecks,
  predictionAnswer,
  sliceCounts,
  testCountOf,
} from "./module3-facts";

const op = (job: number) => ({ OP2: job >> 2, OP1: (job >> 1) & 1, OP0: job & 1 });

describe("facts for the eight-jobs lesson", () => {
  it("the prediction: count down from 0000 gives 1111, which reads -1 signed", () => {
    expect(predictionAnswer(aluJobs, "predict-count-down")).toBe("1111");
    expect(readingOf(parseBits("1111"), "signed")).toBe("-1");
  });

  it("the eight jobs on 3 and 5 give eight different words, COUT 1 for count down only", () => {
    const out = [0, 1, 2, 3, 4, 5, 6, 7].map((j) => explorerOutputs(aluJobs, "eight-jobs", op(j)));
    expect(out.map((o) => o["Y"])).toEqual([
      "0001",
      "0110",
      "1000",
      "1110",
      "0111",
      "0101",
      "0100",
      "0010",
    ]);
    expect(out.map((o) => o["COUT"])).toEqual(["0", "0", "0", "0", "0", "0", "0", "1"]);
    expect(readingOf(parseBits("1000"), "signed")).toBe("-8");
    expect(readingOf(parseBits("1110"), "signed")).toBe("-2");
  });

  it("the fault lab: what each fault makes the checks report", () => {
    expect(faultChecks(aluJobs, "job-faults", 0)).toEqual({ failed: ["3 - 5", "3 + 1"], total: 8 });
    expect(faultChecks(aluJobs, "job-faults", 1)).toEqual({
      failed: ["3 OR 5", "copy 5", "3 + 1", "3 - 1"],
      total: 8,
    });
    expect(faultChecks(aluJobs, "job-faults", 2)).toEqual({
      failed: ["3 + 5", "3 - 5", "3 + 1", "3 - 1"],
      total: 8,
    });
  });

  it("the second word and the carry in, code by code", () => {
    const at = (B: number, job: number) =>
      explorerOutputs(aluJobs, "operand-carry", { B, ...op(job) });
    expect(explorerOutputs(aluJobs, "operand-carry")).toEqual({ D: "1", C0: "0" });
    for (const B of [0, 1]) {
      expect(at(B, 3)).toEqual({ D: String(1 - B), C0: "1" });
      expect(at(B, 6)).toEqual({ D: "0", C0: "1" });
      expect(at(B, 7)).toEqual({ D: "1", C0: "0" });
      for (const j of [0, 1, 4, 5]) expect(at(B, j)).toEqual({ D: "0", C0: "0" });
    }
  });

  it("counting at 16 bits: 00FF up is 0100; FFFF up wraps with COUT 1; 0000 down with COUT 0", () => {
    expect(explorerOutputs(aluJobs, "jobs-16")).toEqual({ Y: "0100", COUT: "0" });
    expect(explorerOutputs(aluJobs, "jobs-16", { A: "0xFFFF" })).toEqual({ Y: "0000", COUT: "1" });
    expect(explorerOutputs(aluJobs, "jobs-16", { A: "0x0000", OP0: 1 })).toEqual({
      Y: "FFFF",
      COUT: "0",
    });
  });

  it("the challenges' test counts and widths", () => {
    expect([testCountOf(aluJobs, "operand-bit"), testCountOf(aluJobs, "eight-job-slice")]).toEqual([
      16, 34,
    ]);
    expect(sliceCounts(aluJobs, "eight-job-slice")).toEqual([1, 4, 8, 16]);
    expect(PROSE.c2Task).toContain("34 tests");
  });
});
