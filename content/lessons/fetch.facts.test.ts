// Copyright © 2026 Christopher Snow

// Facts the fetch lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { assemble, figureState, instructionHex } from "@dd/dd-model";

import { fetch, MARGIN } from "./fetch";
import { figureAnswer, figureSim, runToStop, signed } from "./module8-facts";
import { grade, valueLabel } from "@dd/dd-views";
import { parseLesson } from "@dd/lesson-schema";

import { CHECKS_REFERENCE } from "./module8";
import { testCountOf } from "./module3-facts";

describe("facts for the fetch lesson", () => {
  it("the margin program's words and addresses", () => {
    const lines = assemble(MARGIN).lines.map((l) => [
      l.address.toString(16).toUpperCase().padStart(3, "0"),
      instructionHex(l.instruction ?? 0),
    ]);
    expect(lines).toEqual([
      ["000", "25001F48"],
      ["004", "25002F06"],
      ["008", "13123000"],
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
    expect(r.state.regs.slice(1, 5).map(signed)).toEqual(["-184", "-250", "66", "132"]);
  });

  it("the faults: PC4 at 0 runs 000 for ever; STOP at 0 runs on to 014 and stops with 21", () => {
    const stuck = runToStop(fetch, "fetch-faults", 0, 20);
    expect(stuck.reason).toBe("go");
    expect(stuck.state.pc).toBe(0n);
    expect(stuck.state.regs.slice(1, 3).map(signed)).toEqual(["-184", "X"]);
    const runsOn = runToStop(fetch, "fetch-faults", 1);
    expect(runsOn.reason).toBe("21");
    expect(runsOn.state.pc).toBe(0x14n);
    expect(runsOn.edges).toBe(6);
  });

  it("stepped: at each edge PC changes at step 2 and IR at step 4", () => {
    const sim = figureSim(fetch, "margin");
    const c = sim.circuit;
    const net = (n: string) => c.nets.find((x) => x.name === n)!.id;
    for (let e = 0; e < 3; e++) {
      const { high } = sim.clockCycle("CLK");
      const changes = (n: string) =>
        high.history.flatMap((h, i) =>
          i && valueLabel(h[net(n)]) !== valueLabel(high.history[i - 1]![net(n)]) ? [i] : [],
        );
      expect([changes("PC"), changes("IR")]).toEqual([[2], [4]]);
    }
  });

  it("the challenges' test counts", () => {
    expect([testCountOf(fetch, "pc-text"), testCountOf(fetch, "checks-text")]).toEqual([10, 11]);
  });

  it("a check of PC's bits 11 and 10 alone fails at the addresses with one higher bit set", () => {
    const c = parseLesson(fetch).challenges.find((x) => x.id === "checks-text");
    const short = CHECKS_REFERENCE.replace("PC[63:10] != 54'h0", "PC[11:10] != 2'b00");
    expect(short).not.toBe(CHECKS_REFERENCE);
    expect(c && grade(c, { hdl: short }).failures.map((f) => f.label)).toEqual([
      "PC 1000",
      "PC 8000000000000000",
    ]);
  });
});
