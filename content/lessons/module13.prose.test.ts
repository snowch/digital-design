// Copyright © 2026 Christopher Snow

// Module 13's prose files hold only what their lessons show: a key no lesson reads is a sentence
// that was drafted, checked and then lost from the page (as a draft's "Why:" once was).

import { describe, expect, it } from "vitest";

import { INTERACTIVES, createBook } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

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

// A verdict is plain text: a label or a sentence with code marks shows them as characters. Each
// answer is made wrong in turn, so every case's label and feedback is seen.
describe("Module 13's verdicts", () => {
  const book = createBook(
    LESSONS.map(([l]) => parseLesson(l)),
    INTERACTIVES,
  );
  for (const [lesson] of LESSONS)
    for (const c of (lesson.challenges ?? []).filter((x) => x.reference.answers))
      it(`${lesson.id}: ${c.id} writes no code marks in its verdicts`, () => {
        const reference = c.reference as { text?: string; answers?: Record<string, string> };
        const answers = reference.answers ?? {};
        const challenge = book.lessons.flatMap((l) => l.challenges).find((x) => x.id === c.id)!;
        const wrong = (field: string, value: string) => {
          const f = challenge.fields.find((x) => x.id === field);
          if (f?.kind === "bits") return `${value[0] === "1" ? "0" : "1"}${value.slice(1)}`;
          if (f?.kind === "choice")
            return f.options?.find((o) => o.value !== value)?.value ?? value;
          return /^-?\d+$/.test(value)
            ? String(Number(value) + 1)
            : value === "000"
              ? "001"
              : "000";
        };
        const seen: string[] = [];
        for (const field of Object.keys(answers)) {
          const v = book.grade(challenge, {
            ...reference,
            answers: { ...answers, [field]: wrong(field, answers[field]!) },
          });
          for (const f of v.failures) seen.push(f.label, f.detail ?? "");
          if (v.blocked) seen.push(v.blocked);
        }
        expect(seen.length).toBeGreaterThan(0);
        expect(seen.filter((t) => t.includes("could not run"))).toEqual([]);
        expect(seen.filter((t) => t.includes("`"))).toEqual([]);
      });
});
