// Copyright © 2026 Christopher Snow

// Facts the several-edges lesson's prose states, read off the machine of several edges as the
// figures build it, the controller and the lesson's challenges.

import { describe, expect, it } from "vitest";

import { MACHINE_NETS, libraryCircuit, stateSequence } from "@dd/dd-model";
import { figureSim, grade, kindSequences, type PrimeStep } from "@dd/dd-views";
import { parseLesson, testCount } from "@dd/lesson-schema";

import { figureAnswer, runToStop, signed } from "./module8-facts";
import { severalEdges } from "./several-edges";

const lesson = parseLesson(severalEdges);
const challenge = (id: string) => lesson.challenges.find((c) => c.id === id)!;

describe("facts for the several-edges lesson", () => {
  it("the prediction: the first load takes 5 edges", () => {
    expect(figureAnswer(severalEdges, "predict-load-edges")).toBe("5");
  });

  it("the controller's figure starts after a reset, in FETCH, where its first edge moves it", () => {
    const figure = lesson.sections
      .flatMap((s) => s.interactives)
      .find((i) => i.id === "controller");
    const prime = (figure?.props as { prime?: PrimeStep[] } | undefined)?.prime ?? [];
    const s = figureSim(libraryCircuit("controller"), {}, prime).outputs()[
      MACHINE_NETS.stateOutput
    ];
    expect(s && s.known === 7n ? s.value : "unknown").toBe(0n);
  });

  it("which room is colder: 23 edges to the stop, -250 on the display", () => {
    const r = runToStop(severalEdges, "colder-edges");
    expect([r.reason, r.edges, signed(r.state.display)]).toEqual(["stop", 23, "-250"]);
  });

  it("each kind's edges: loads 5, jobs and stores 4, branches, jumps and calls 3, a stop 2", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((k) => stateSequence(k).length)).toEqual([
      4, 4, 5, 4, 3, 3, 3,
    ]);
    expect(stateSequence(8)).toEqual(["FETCH", "READ"]);
    expect(kindSequences([1, 2, 3, 4, 5, 6, 7]).map((s) => s.states.join(" "))).toEqual([
      "FETCH READ ALU WRITE",
      "FETCH READ ALU WRITE",
      "FETCH READ ALU MEMORY WRITE",
      "FETCH READ ALU MEMORY",
      "FETCH READ ALU",
      "FETCH READ WRITE",
      "FETCH READ ALU",
    ]);
  });

  it("the faults on the margin: 18 edges and 66 healthy; cause 33 at 16; nothing stored at 17", () => {
    const healthy = runToStop(severalEdges, "edge-faults");
    expect([healthy.reason, healthy.edges, signed(healthy.state.display)]).toEqual([
      "stop",
      18,
      "66",
    ]);
    const fetching = runToStop(severalEdges, "edge-faults", 0);
    expect([
      fetching.reason,
      fetching.edges,
      fetching.state.pc,
      signed(fetching.state.display),
    ]).toEqual(["33", 16, 0xcn, "0"]);
    expect([1, 2, 3].map((r) => signed(fetching.state.regs[r]))).toEqual(["-184", "-250", "66"]);
    const row = runToStop(severalEdges, "edge-faults", 1);
    expect([row.reason, row.edges, signed(row.state.display)]).toEqual(["stop", 17, "0"]);
  });

  it("the challenges: 8 and 44 tests; each start fails, each reference passes", () => {
    expect(testCount(challenge("fetchport-text"))).toBe(8);
    expect(testCount(challenge("states-text"))).toBe(44);
    for (const c of lesson.challenges) {
      expect(grade(c, c.reference).passed, c.id).toBe(true);
      expect(grade(c, c.initial!).passed, c.id).toBe(false);
    }
  });
});
