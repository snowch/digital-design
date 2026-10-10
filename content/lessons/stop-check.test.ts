// Copyright © 2026 Christopher Snow

// Where a handler's `stop` may stand. In 12.1, 12.4, 12.5 and 12.6 any `stop` of the learner's own
// ends a run as the handler's, wherever it sits in the text; 12.8 alone asks that the run end at
// the start's, the lines above the one named `handler`, and says so when it does not.

import { describe, expect, it } from "vitest";

import { DEFAULT_VIEW_STRINGS, format, grade } from "@dd/dd-views";
import { parseLesson, type LessonInput } from "@platform/lesson-schema";

import { interrupts } from "./interrupts";
import { nesting } from "./nesting";
import { systemCallMechanism } from "./system-call-mechanism";
import { systemCalls } from "./system-calls";
import { traps } from "./traps";

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

/** The text with its `stop` lines moved to just above the line `handler:`. */
function stopsAboveHandler(text: string): string {
  const lines = text.split("\n");
  const stops = lines.filter(isStop);
  const rest = lines.filter((l) => !isStop(l));
  const at = rest.findIndex((l) => /^handler:/.test(l.trim()));
  return [...rest.slice(0, at), ...stops, ...rest.slice(at)].join("\n");
}

describe("where a handler's stop may stand", () => {
  for (const [lesson, id] of [
    [traps, "skip-refused"],
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
    const address = /at ([0-9A-F]{3})\./.exec(late.failures[0]?.detail ?? "")?.[1] ?? "";
    expect(late.failures[0]?.detail).toContain(format(S12.stopAfterHandler, { address }));
    // The line `handler` renamed: no line says where the handler starts, so it fails, saying so.
    const renamed = text.replace(/\bhandler\b/g, "choice");
    const unnamed = grade(c, { text: renamed });
    expect(unnamed.passed).toBe(false);
    expect(unnamed.failures.length).toBe(c.tests.kind === "answers" ? c.tests.cases.length : 0);
    expect(unnamed.failures[0]?.detail).toContain(S12.stopUnnamed);
  }, 60_000);
});
