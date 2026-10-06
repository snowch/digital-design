// Copyright © 2026 Christopher Snow

// Facts the micro-operations lesson's prose states, read off the machine of several edges as the
// figures build it and the lesson's challenges.

import { describe, expect, it } from "vitest";

import { edgeView } from "@dd/dd-model";
import { DEFAULT_VIEW_STRINGS, edgeText, grade } from "@dd/dd-views";
import { parseLesson, testCount } from "@dd/lesson-schema";

import { microOperations } from "./micro-operations";
import { figureAnswer, figureSim, runToStop, signed } from "./module8-facts";

const lesson = parseLesson(microOperations);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;
const t = DEFAULT_VIEW_STRINGS.control;

/** Each edge's state and transfers, from the figure's start, until the machine halts. */
function edges(id: string, fault = -1, limit = 40): string[] {
  const sim = figureSim(microOperations, id, fault);
  const out: string[] = [];
  for (let n = 0; n < limit; n++) {
    const v = edgeView(sim.circuit, sim.snapshotValues());
    out.push(`${v.state} ${edgeText(v, t)}`);
    if (v.halts) break;
    sim.clockCycle("CLK");
  }
  return out;
}

describe("facts for the micro-operations lesson", () => {
  it("the prediction: the third edge of R1 ← -184 writes HR, with the constant", () => {
    expect(figureAnswer(microOperations, "predict-took")).toBe("HR");
    expect(edges("predict-took").slice(0, 2)).toEqual(["ALU HR ← c", "WRITE R1 ← HR; PC ← PC + 4"]);
  });

  it("the four views: the load's edges, and the branch's ALU edge", () => {
    const e = edges("four-views");
    expect(e.slice(0, 5)).toEqual([
      "FETCH IR ← memory[PC]",
      "READ HA ← R0, HB ← R0",
      "ALU HR ← 0 + c",
      "MEMORY HM ← word[HR]",
      "WRITE R2 ← HM; PC ← PC + 4",
    ]);
    expect(e[12]).toBe("ALU HR ← HA - HB; PC ← PC + 4");
  });

  it("the faults on the margin: PCEN at 1 stops after 6 edges; MSTORE at 0 stores nothing", () => {
    expect(runToStop(microOperations, "signal-faults").edges).toBe(18);
    const pc = runToStop(microOperations, "signal-faults", 0);
    expect([pc.reason, pc.edges, signed(pc.state.regs[1]), signed(pc.state.display)]).toEqual([
      "stop",
      6,
      "-184",
      "0",
    ]);
    expect([pc.state.regs[2], pc.state.regs[3]]).toEqual([undefined, undefined]);
    expect(edges("signal-faults", 0).map((e) => e.split(" ")[0])).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "WRITE",
      "FETCH",
      "READ",
    ]);
    const store = runToStop(microOperations, "signal-faults", 1);
    expect([store.edges, signed(store.state.regs[3]), signed(store.state.display)]).toEqual([
      18,
      "66",
      "0",
    ]);
    expect(edges("signal-faults", 1)[15]).toBe("MEMORY PC ← PC + 4");
  });

  it("the challenges: 40 and 35 tests; each start fails, each reference passes", () => {
    expect(testCount(challenge("outputs-text"))).toBe(40);
    expect(testCount(challenge("controller-text"))).toBe(35);
    for (const c of lesson.challenges) {
      expect(grade(c, c.reference).passed, c.id).toBe(true);
      expect(grade(c, c.initial!).passed, c.id).toBe(false);
    }
  });
});
