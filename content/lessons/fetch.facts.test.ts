// Copyright © 2026 Christopher Snow

// Facts the fetch lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { assemble, figureState, instructionHex } from "@dd/dd-model";

import { fetch, MARGIN } from "./fetch";
import { figureAnswer, figureSim, runToStop, signed } from "./module8-facts";
import { testCountOf } from "./module3-facts";

describe("facts for the fetch lesson", () => {
  it("the margin program's words and addresses", () => {
    const lines = assemble(MARGIN).lines.map((l) => [
      l.address.toString(16).toUpperCase().padStart(3, "0"),
      instructionHex(l.instruction ?? 0),
    ]);
    expect(lines).toEqual([
      ["000", "25001F06"],
      ["004", "25002F48"],
      ["008", "13213000"],
      ["00C", "12334000"],
      ["010", "84000000"],
    ]);
  });

  it("the prediction: the edge at 008, an all-zero word, stops the machine with cause 21", () => {
    expect(figureAnswer(fetch, "predict-end")).toBe("21");
    const state = figureState(figureSim(fetch, "predict-end"));
    expect([state.pc, signed(state.regs[1]), state.ir]).toEqual([8n, "6", 0]);
    expect(instructionHex(assemble("R1 <= 5").lines[0]!.instruction ?? 0)).toBe("25001005");
  });

  it("the margin program: 66 and 132, stopped by stop after 5 edges with the PC at 010", () => {
    const r = runToStop(fetch, "margin");
    expect(r.reason).toBe("stop");
    expect(r.edges).toBe(5);
    expect(r.state.pc).toBe(0x10n);
    expect(r.state.regs.slice(1, 5).map(signed)).toEqual(["-250", "-184", "66", "132"]);
  });

  it("the faults: PC4 at 0 runs 000 for ever; STOP at 0 runs on to 014 and stops with 21", () => {
    const stuck = runToStop(fetch, "fetch-faults", 0, 20);
    expect(stuck.reason).toBe("go");
    expect(stuck.state.pc).toBe(0n);
    expect(stuck.state.regs.slice(1, 3).map(signed)).toEqual(["-250", "X"]);
    const runsOn = runToStop(fetch, "fetch-faults", 1);
    expect(runsOn.reason).toBe("21");
    expect(runsOn.state.pc).toBe(0x14n);
    expect(runsOn.edges).toBe(6);
  });

  it("the challenges' test counts", () => {
    expect([testCountOf(fetch, "pc-text"), testCountOf(fetch, "checks-text")]).toEqual([10, 9]);
  });
});
