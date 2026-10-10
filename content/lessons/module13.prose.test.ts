// Copyright © 2026 Christopher Snow

// Module 13's prose files hold only what their lessons show: a key no lesson reads is a sentence
// that was drafted, checked and then lost from the page (as a draft's "Why:" once was).

import { describe, expect, it } from "vitest";

import type { LessonInput } from "@platform/lesson-schema";

import { capstone } from "./capstone";
import { PROSE as CAPSTONE } from "./capstone.prose";
import { finalMachine } from "./final-machine";
import { PROSE as FINAL } from "./final-machine.prose";
import { fullPath } from "./full-path";
import { PROSE as FULL } from "./full-path.prose";
import { tracing } from "./tracing";
import { PROSE as TRACING } from "./tracing.prose";
import { wholeMachine } from "./whole-machine";
import { PROSE as WHOLE } from "./whole-machine.prose";

const LESSONS: readonly (readonly [LessonInput, Readonly<Record<string, unknown>>])[] = [
  [wholeMachine, WHOLE],
  [fullPath, FULL],
  [tracing, TRACING],
  [finalMachine, FINAL],
  [capstone, CAPSTONE],
];

describe("Module 13's prose", () => {
  for (const [lesson, prose] of LESSONS)
    it(`${lesson.id} reads every key of its prose`, () => {
      const shown = JSON.stringify(lesson);
      const texts = Object.entries(prose).flatMap(([key, v]) =>
        Array.isArray(v) ? v.map((s, i) => [`${key}.${i + 1}`, s as string]) : [[key, v as string]],
      );
      // A text with a slot is filled before it is shown: its words up to the first slot are.
      const unread = texts
        .filter(([, text]) => !shown.includes(JSON.stringify(text!.split("{")[0]!).slice(1, -1)))
        .map(([key]) => key);
      expect(unread).toEqual([]);
    });
});
