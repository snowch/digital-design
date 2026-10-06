// Copyright © 2026 Christopher Snow

// Facts the control-signals lesson's prose states, read off the decoder's circuit and the
// lesson's figures and challenges.

import { describe, expect, it } from "vitest";

import { decoderCircuit } from "@dd/dd-model";
import { grade, signalCell } from "@dd/dd-views";
import { parseLesson, testCount } from "@dd/lesson-schema";
import { Simulator } from "@dd/sim";

import { controlSignals } from "./control-signals";
import { LABELS } from "./control-signals.labels";
import { explorerOutputs, faultChecks, predictionAnswer } from "./module3-facts";

const lesson = parseLesson(controlSignals);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;

describe("facts for the control-signals lesson", () => {
  it("the decoder's table, kind by kind", () => {
    const sim = new Simulator(decoderCircuit({ mem: false }));
    const row = (s: string) => [1, 2, 3, 4, 5, 6, 7, 8].map((k) => signalCell(sim, k, s));
    expect(row("WRITEY")).toEqual(["1", "1", "1", "0", "0", "1", "0", "0"]);
    expect(row("BCONST")).toEqual(["0", "1", "1", "1", "0", "0", "1", "0"]);
    expect(row("OP2")).toEqual(["J2", "J2", "0", "0", "0", "0", "0", "0"]);
    expect(row("OP1")).toEqual(["J1", "J1", "1", "1", "1", "0", "1", "0"]);
    expect(row("OP0")).toEqual(["J0", "J0", "0", "0", "1", "0", "0", "0"]);
    expect(row("AZERO")).toEqual(["0", "0", "J3", "J3", "0", "0", "0", "0"]);
    expect(row("BYTE")).toEqual(["0", "0", "J0", "J0", "0", "0", "0", "0"]);
    for (const [s, k] of [
      ["LOAD", 3],
      ["STORE", 4],
      ["BRANCH", 5],
      ["CALL", 6],
      ["JUMP", 7],
    ] as const)
      expect(row(s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map((n) => (n === k ? "1" : "0")));
    // Kind 8 sets every signal to 0.
    for (const s of ["WRITEY", "LOAD", "STORE", "BYTE", "AZERO", "BCONST", "OP2", "OP1", "OP0"])
      expect(signalCell(sim, 8, s)).toBe("0");
  });

  it("the prediction: a jump's BCONST is 1, with add and no write", () => {
    expect(predictionAnswer(controlSignals, "predict-jump")).toBe("1");
    const out = explorerOutputs(controlSignals, "decoder-open", { K: 7, J: 0 });
    expect([out["OP2"], out["OP1"], out["OP0"], out["WRITEY"], out["JUMP"]]).toEqual([
      "0",
      "1",
      "0",
      "0",
      "1",
    ]);
  });

  it("the opened decoder starts on a subtract: WRITEY 1, OP 011", () => {
    const out = explorerOutputs(controlSignals, "decoder-open");
    expect([out["WRITEY"], out["OP2"], out["OP1"], out["OP0"], out["BCONST"]]).toEqual([
      "1",
      "0",
      "1",
      "1",
      "0",
    ]);
  });

  it("the faults: OP0's AND fails the subtract and the branch; LOAD at 0 fails the load", () => {
    expect(faultChecks(controlSignals, "decoder-faults", 0)).toEqual({
      failed: [LABELS.checks.subtract, LABELS.checks.branch],
      total: 7,
    });
    expect(faultChecks(controlSignals, "decoder-faults", 1)).toEqual({
      failed: [LABELS.checks.load],
      total: 7,
    });
  });

  it("the challenges: 16 and 39 tests; each start fails, each reference passes", () => {
    expect(testCount(challenge("writes-text"))).toBe(16);
    expect(testCount(challenge("signals-text"))).toBe(39);
    for (const c of lesson.challenges) {
      expect(grade(c, c.reference).passed, c.id).toBe(true);
      expect(grade(c, c.initial!).passed, c.id).toBe(false);
    }
  });
});
