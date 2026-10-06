// Plausible wrong attempts at Module 5's challenges fail, at the test a learner would expect.

import { describe, expect, it } from "vitest";

import { MACHINES, machineText } from "@dd/dd-model";
import { grade } from "@dd/dd-views";

import * as W from "../../tests/educational/module5-wrong";
import { counters } from "./counters";
import { registerTransfer } from "./register-transfer";
import { stateEncoding } from "./state-encoding";
import { stateMachines } from "./state-machines";

type Lesson = typeof counters;
const verdict = (l: Lesson, id: string, hdl: string) => {
  const c = l.challenges!.find((x) => x.id === id)!;
  return grade({ ...c, gradedDirection: "write" } as never, { hdl });
};

/** The defrost controller with CLEAR tested before WARM. */
export const DEFROST_CLEAR_FIRST = machineText(
  {
    ...MACHINES.defrost,
    rows: MACHINES.defrost.rows.map((r) =>
      r.from !== "DEFROST"
        ? r
        : r.to === "COOL"
          ? { ...r, when: { WARM: 1, CLEAR: 0 } }
          : r.to === "DRAIN"
            ? { ...r, when: { CLEAR: 1 } }
            : r,
    ),
  },
  { style: "enum" },
);

describe("plausible wrong attempts at Module 5's challenges", () => {
  it("fail where the learner would look", () => {
    const first = (v: ReturnType<typeof verdict>) => v.failures[0]?.label;
    expect(first(verdict(counters, "count-two", W.COUNT_TWO_EN_TWICE))).toBe("edge 1");
    expect(first(verdict(counters, "count-tick", W.COUNT_TICK_NO_EN))).toBe(
      "EN falls with the count at 1111",
    );
    expect(first(verdict(registerTransfer, "now-prev", W.NOW_PREV_BOTH_IN))).toBe(
      "edge saving 0011",
    );
    expect(first(verdict(registerTransfer, "readings", W.READINGS_UNDO_FIRST))).toBe(
      "edge with NEW 1 and UNDO 1",
    );
    expect(verdict(stateMachines, "next-one", W.NEXT_ONE_NO_NOT_FAIL).passed).toBe(false);
    expect(
      first(verdict(stateMachines, "late-ok", machineText(MACHINES.retry, { style: "codes" }))),
    ).toBe("edge in WAIT with OK 1");
    expect(first(verdict(stateEncoding, "defrost", DEFROST_CLEAR_FIRST))).toBe(
      "edge in DEFROST with WARM 1 and CLEAR 1",
    );
  });
});
