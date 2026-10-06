// Facts the state-encoding lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { MACHINES, libraryCircuit, machineText } from "@dd/dd-model";

import { stateEncoding } from "./state-encoding";
import { predictionAnswer, testCountOf } from "./module5-facts";

describe("facts for the state-encoding lesson", () => {
  it("the predictions: TRY at 00 sends at once; one-hot after a reset is 0000; a short OK is missed", () => {
    expect(predictionAnswer(stateEncoding, "predict-try-zero")).toBe("1");
    expect(predictionAnswer(stateEncoding, "predict-one-hot-reset")).toBe("0000");
    expect(predictionAnswer(stateEncoding, "predict-short-ok")).toBe("01");
  });

  it("the codes: binary takes two flip-flops, one per state four, IDLE at zero three", () => {
    const flipFlops = (id: string) =>
      libraryCircuit(id).composites.filter((c) => c.kind === "dff").length;
    expect([flipFlops("retry"), flipFlops("retry-one-hot"), flipFlops("retry-zero-idle")]).toEqual([
      2, 4, 3,
    ]);
    expect(MACHINES["retry-zero-idle"].states.map((s) => `${s.name} ${s.code}`)).toEqual([
      "IDLE 000",
      "TRY 001",
      "WAIT 010",
      "GIVE_UP 100",
    ]);
  });

  it("the enumerated text names the codes the lesson chose", () => {
    expect(machineText(MACHINES.retry, { style: "enum" })).toContain(
      "typedef enum logic [1:0] {IDLE = 2'b00, TRY = 2'b01, WAIT = 2'b10, GIVE_UP = 2'b11} state_t;",
    );
  });

  it("the challenges' test counts, as the page states them", () => {
    expect([
      testCountOf(stateEncoding, "zero-idle"),
      testCountOf(stateEncoding, "defrost"),
    ]).toEqual([9, 10]);
  });
});
