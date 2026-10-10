// Copyright © 2026 Christopher Snow

// Where a handler's `stop` may stand. In 12.1, 12.3 to 12.6 any `stop` of the learner's own
// ends a run as the handler's, wherever it sits in the text; 12.8 alone asks that the run end at
// the start's, the lines above the one named `handler`, and says so when it does not.

import { describe, expect, it } from "vitest";

import { DEFAULT_VIEW_STRINGS, grade } from "@dd/dd-views";
import { parseLesson, type LessonInput } from "@platform/lesson-schema";

import { interrupts } from "./interrupts";
import { nesting } from "./nesting";
import { systemCallMechanism } from "./system-call-mechanism";
import { systemCalls } from "./system-calls";
import { traps } from "./traps";
import { userMode } from "./user-mode";

const challenge = (lesson: LessonInput, id: string) =>
  parseLesson(lesson).challenges.find((c) => c.id === id)!;

/** A `stop` line, with or without a label. */
const isStop = (line: string) =>
  /^(\w+:\s*)?stop\b/.test(
    line
      .trim()
      .replace(/\/\/.*$/, "")
      .trim(),
  );

/**
 * The same program with its stop above the line `handler:`: each `stop` becomes a jump to one
 * `stop` placed there, so the run ends at the same moment and with the same words.
 */
function stopsAboveHandler(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => (isStop(l) ? l.replace(/\bstop\b/, "goto stopped") : l));
  const at = lines.findIndex((l) => /^handler:/.test(l.trim()));
  return [...lines.slice(0, at), "stopped: stop", ...lines.slice(at)].join("\n");
}

describe("where a handler's stop may stand", () => {
  for (const [lesson, id] of [
    [traps, "skip-refused"],
    [userMode, "start-user"],
    [systemCalls, "sensor-service"],
    [interrupts, "door-timer"],
    [nesting, "wait-door"],
  ] as const)
    it(`${lesson.id}: the reference passes, and so does it with its stops above handler:`, () => {
      const c = challenge(lesson, id);
      const text = c.reference.text!;
      expect(grade(c, { text }).passed).toBe(true);
      const moved = stopsAboveHandler(text);
      expect(moved).not.toBe(text);
      expect(grade(c, { text: moved }).failures).toEqual([]);
    }, 60_000);

  it("12.8: the start's stop must stand above handler:, and a text must name that line", () => {
    const c = challenge(systemCallMechanism, "shop-handler");
    const text = c.reference.text!;
    expect(grade(c, { text }).passed).toBe(true);
    // The start's stop moved to the end, below the handler's lines: the handler's, so it fails.
    const lines = text.split("\n");
    const stop = lines.find(isStop)!;
    const atEnd = [...lines.filter((l) => l !== stop), stop].join("\n");
    const late = grade(c, { text: atEnd });
    expect(late.passed).toBe(false);
    const S12 = DEFAULT_VIEW_STRINGS.machine12;
    // No stop of the learner's sits above handler:, so the feedback says to move the start's.
    expect(late.failures[0]?.detail).toContain(S12.stopBelow);
    expect(late.failures[0]?.detail).not.toContain(S12.stopInHandler);
    // The construction's step 1 done: the start written, its stop above handler:, while finish:
    // and ended: still only stop. The run ends at the handler's stop, which the feedback names
    // once, and does not ask to move the start's stop.
    const step1 = text.slice(0, text.indexOf("finish:")) + "finish: stop\nended:  stop\n";
    const given = grade(c, { text: step1 });
    expect(given.passed).toBe(false);
    const run1 = given.failures[0]?.detail ?? "";
    expect(run1).toContain(S12.stopInHandler);
    expect(run1).not.toContain(S12.stopBelow);
    expect(run1.match(/\b0[0-9A-F]{2}\b/g)?.length).toBe(1);
    // The line `handler` renamed: no line says where the handler starts, so it fails, saying so.
    const renamed = text.replace(/\bhandler\b/g, "choice");
    const unnamed = grade(c, { text: renamed });
    expect(unnamed.passed).toBe(false);
    expect(unnamed.failures.length).toBe(c.tests.kind === "answers" ? c.tests.cases.length : 0);
    expect(unnamed.failures[0]?.detail).toContain(S12.stopUnnamed);
  }, 60_000);
});
