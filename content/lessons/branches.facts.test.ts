// Copyright © 2026 Christopher Snow

// Facts the branches lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { alu64, assemble, figureState, instructionHex, registersOf } from "@dd/dd-model";
import { valueLabel } from "@dd/dd-views";

import { branches, CALL, COLDER, SUM } from "./branches";
import { figureAnswer, figureSim, runToStop, signed } from "./module8-facts";
import { testCountOf } from "./module3-facts";

const words = (source: string) =>
  assemble(source).lines.map(
    (l) =>
      `${l.address.toString(16).toUpperCase().padStart(3, "0")} ${instructionHex(l.instruction ?? 0)}`,
  );

describe("facts for the branches lesson", () => {
  it("the programs' words", () => {
    expect(words(COLDER)).toEqual([
      "000 380027D8",
      "004 380037E0",
      "008 56230002",
      "00C 15032000",
      "010 480207C0",
      "014 84000000",
    ]);
    expect(words(SUM).slice(3, 6)).toEqual(["00C 12212000", "010 17101000", "014 53100FFE"]);
    expect(words(CALL)[3]).toBe("00C 6000F003");
    expect(words(CALL)[9]).toBe("024 70F00000");
  });

  it("the prediction: -184 - (-250) = 66, MINUS 0 and OVER 0, so not taken: PC 00C", () => {
    const f = alu64(3, -184n & ((1n << 64n) - 1n), -250n & ((1n << 64n) - 1n));
    expect([f.y, f.minus, f.over]).toEqual([66n, 0, 0]);
    expect(figureAnswer(branches, "predict-branch")).toBe("00C");
    const r = runToStop(branches, "predict-branch");
    expect(signed(r.state.display)).toBe("-250");
  });

  it("the loop: 15 on the display after 20 edges", () => {
    const r = runToStop(branches, "sum");
    expect([r.reason, r.edges, r.state.pc, signed(r.state.display)]).toEqual([
      "stop",
      20,
      0x1cn,
      "15",
    ]);
  });

  it("the faults: MET at 1 never stops; MET at 0 shows 5 after 8 edges", () => {
    const high = runToStop(branches, "branch-faults", 0, 40);
    expect(high.reason).toBe("go");
    expect(high.state.regs[1]).toBeGreaterThan(1n << 63n);
    const low = runToStop(branches, "branch-faults", 1);
    expect([low.reason, low.edges, signed(low.state.regs[1]), signed(low.state.display)]).toEqual([
      "stop",
      8,
      "4",
      "5",
    ]);
  });

  it("one edge, stepped into the branch: R3 at 1, PC at 2, IR at 4, QA and QB at 7, BRANCH at 9; RESULT settles to 66 at 137, MINUS at 138, MET at 144, NEXT at 154, of 155", () => {
    const sim = figureSim(branches, "one-instruction");
    const c = sim.circuit;
    expect(figureState(sim).pc).toBe(4n);
    const { high } = sim.clockCycle("CLK");
    const net = (n: string) => c.nets.find((x) => x.name === n)!.id;
    const at = (n: string, k: number) => valueLabel(high.history[k]![net(n)]);
    const changes = (n: string) =>
      high.history.flatMap((h, i) =>
        i && valueLabel(h[net(n)]) !== valueLabel(high.history[i - 1]![net(n)]) ? [i] : [],
      );
    const first = (n: string) => changes(n)[0];
    const last = (n: string) => changes(n).at(-1);
    expect(high.history.length - 1).toBe(155);
    expect(high.history.slice(0, 2).map((h) => signed(registersOf(c, h)[3]))).toEqual([
      "X",
      "-250",
    ]);
    expect([first("PC"), first("IR"), first("QA"), first("QB"), first("BRANCH")]).toEqual([
      2, 4, 7, 7, 9,
    ]);
    expect(at("IR", 4)).toBe("56230002");
    expect([first("RESULT"), last("RESULT"), last("MINUS"), last("MET"), last("NEXT")]).toEqual([
      18, 137, 138, 144, 154,
    ]);
    expect([at("RESULT", 155), at("MET", 155), at("NEXT", 155)]).toEqual([
      "0000000000000042",
      "0",
      "000000000000000C",
    ]);
    expect(changes("MET").length).toBeGreaterThan(10);
    expect([at("HALT", 13), at("HALT", 14)]).toEqual(["1", "0"]);
    expect(last("DISPLAY")).toBeUndefined();
  });

  it("the call: 6 on the display, R15 holding 010, after 16 edges", () => {
    const r = runToStop(branches, "call");
    expect([r.reason, r.edges, signed(r.state.display), r.state.regs[15]]).toEqual([
      "stop",
      16,
      "6",
      0x10n,
    ]);
  });

  it("the challenges' test counts", () => {
    expect([testCountOf(branches, "condition-text"), testCountOf(branches, "next-text")]).toEqual([
      32, 17,
    ]);
  });
});
