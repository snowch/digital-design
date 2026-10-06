// Copyright © 2026 Christopher Snow

// Facts the gates lesson's prose states, read off the figures that show them.

import { describe, expect, it } from "vitest";

import { libraryCircuit, truthTableOf } from "@dd/dd-model";
import { grade } from "@dd/dd-views";
import { expressionModule } from "@dd/hdl";
import { parseLesson, testCount } from "@platform/lesson-schema";

import { gates } from "./gates";
import { faultChecks, figureOf, predictionAnswer } from "./module2.facts";

const lesson = parseLesson(gates);
const outputs = (id: string) => truthTableOf(libraryCircuit(id)).rows.map((r) => r.outputs[0]);

describe("the gates lesson's facts", () => {
  it("prediction: the first try, with an OR, lights ALARM with the freezer cold and the door shut", () => {
    expect(figureOf(gates, "predict-alarm")["libraryId"]).toBe("alarm-try");
    expect(predictionAnswer(gates, "predict-alarm")).toBe("1");
    expect(outputs("alarm-try")).toEqual(["1", "0", "1", "1"]);
  });

  it("investigation: NOT has 2 rows, AND gives 1 in 1 row of 4, OR in 3 of 4", () => {
    expect(figureOf(gates, "explore-not")["libraryId"]).toBe("not-gate");
    expect(outputs("not-gate")).toEqual(["1", "0"]);
    expect(outputs("and-gate")).toEqual(["0", "0", "0", "1"]);
    expect(outputs("or-gate")).toEqual(["0", "1", "1", "1"]);
  });

  it("the ALARM rule is 1 in the row WARM 1, DOOR 0 alone, and its challenge has 4 tests", () => {
    expect(outputs("alarm")).toEqual(["0", "0", "1", "0"]);
    expect(testCount(lesson.challenges.find((c) => c.id === "alarm")!)).toBe(4);
  });

  it("failure experiment: what each fault breaks", () => {
    expect(faultChecks(gates, "alarm-faults", 0)).toEqual({
      total: 4,
      failed: [
        { label: "WARM 1, DOOR 0", got: { ALARM: "0" }, expected: { ALARM: "1" } },
        { label: "WARM 1, DOOR 1", got: { ALARM: "1" }, expected: { ALARM: "0" } },
      ],
    });
    expect(faultChecks(gates, "alarm-faults", 1)).toEqual({
      total: 4,
      failed: [
        { label: "WARM 1, DOOR 0", got: { ALARM: "X" }, expected: { ALARM: "1" } },
        { label: "WARM 1, DOOR 1", got: { ALARM: "X" }, expected: { ALARM: "0" } },
      ],
    });
    expect(faultChecks(gates, "alarm-faults", 2)).toEqual({
      total: 4,
      failed: [{ label: "WARM 1, DOOR 1", got: { ALARM: "1" }, expected: { ALARM: "0" } }],
    });
  });

  it("explanation: the figure prints ALARM as one expression", () => {
    expect(figureOf(gates, "alarm-expression")["form"]).toBe("expression");
    expect(expressionModule(libraryCircuit("alarm"))).toContain("assign ALARM = WARM & ~DOOR;");
  });

  it("generalisation: CLASH from five gates and from one XOR has the same table", () => {
    expect(outputs("clash-gates")).toEqual(["0", "1", "1", "0"]);
    expect(outputs("clash-xor")).toEqual(outputs("clash-gates"));
    expect(libraryCircuit("clash-gates").components).toHaveLength(5);
    expect(expressionModule(libraryCircuit("clash-gates"))).toContain(
      "assign CLASH = (WARM1 & ~WARM2) | (~WARM1 & WARM2);",
    );
  });

  it("challenge: NIGHT has 8 tests, and without brackets the 2 rows with WARM 1 and CLOSED 0 fail", () => {
    const night = lesson.challenges.find((c) => c.id === "night")!;
    expect(testCount(night)).toBe(8);
    const header = night.initial.hdl!.split("\n")[0];
    const verdict = grade(night, {
      hdl: `${header}\n  assign NIGHT = CLOSED & DOOR | WARM;\nendmodule\n`,
    });
    expect(verdict.failures.map((f) => f.label)).toEqual([
      "WARM 1, DOOR 0, CLOSED 0",
      "WARM 1, DOOR 1, CLOSED 0",
    ]);
  });
});
