// Copyright © 2026 Chris Snow

// Facts the state-machines lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { MACHINES, libraryCircuit } from "@dd/dd-model";

import { stateMachines } from "./state-machines";
import { faultRun, healthyRun, predictionAnswer, testCountOf } from "./module5-facts";

const states = (rows: Record<string, string>[]) => rows.map((r) => r["S"]);

describe("facts for the state-machines lesson", () => {
  it("the predictions: TRY stays TRY; GIVE_UP ignores OK; a reset wins over TICK in WAIT", () => {
    expect(predictionAnswer(stateMachines, "predict-stay")).toBe("01");
    expect(predictionAnswer(stateMachines, "predict-give-up")).toBe("11");
    expect(predictionAnswer(stateMachines, "predict-reset")).toBe("00");
  });

  it("the table has nine rows; rows 2 and 3 lead to IDLE, so they have no gate", () => {
    expect(MACHINES.retry.rows).toHaveLength(9);
    const gates = libraryCircuit("retry")
      .components.filter((c) => c.path.startsWith("next-state-logic/row"))
      .map((c) => c.name);
    expect(gates).toEqual(["row1", "row4", "row5", "row6", "row7", "row8"]);
    // Row 9 (GIVE_UP, any inputs) reads no input: its term is GIVE_UP's line itself.
    expect(MACHINES.retry.rows[8]!.when).toEqual({});
  });

  it("the fault lab: the healthy run, and where each fault goes instead", () => {
    expect(states(healthyRun(stateMachines, "retry-faults"))).toEqual([
      "00",
      "01",
      "10",
      "10",
      "01",
      "11",
    ]);
    const r4 = faultRun(stateMachines, "retry-faults", 0);
    expect(r4.failed).toEqual(["FAIL 1", "waiting", "TICK 1", "no answer by the next TICK"]);
    expect(states(r4.seen)).toEqual(["00", "01", "00", "00", "00", "00"]);
    const r8 = faultRun(stateMachines, "retry-faults", 1);
    expect(r8.failed).toEqual(["waiting", "TICK 1", "no answer by the next TICK"]);
    expect(states(r8.seen)).toEqual(["00", "01", "10", "00", "00", "00"]);
    const r5 = faultRun(stateMachines, "retry-faults", 2);
    expect(r5.failed).toEqual(["GO 1", "FAIL 1", "waiting", "TICK 1"]);
    expect(states(r5.seen)).toEqual(["00", "11", "11", "11", "11", "11"]);
    expect(r4.total).toBe(6);
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([testCountOf(stateMachines, "next-one"), testCountOf(stateMachines, "late-ok")]).toEqual(
      [32, 13],
    );
  });
});
