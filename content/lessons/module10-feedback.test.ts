// Copyright © 2026 Christopher Snow

// Module 10's worked answers (decision A): a wrong choice or number is answered by a sentence on
// the rule it misses, never by the right option or value. Each case of every `choices` and
// `exact` challenge is graded with a wrong answer, and its failure must carry a sentence that
// names neither the expected value nor, for a choice, the expected option's words.

import { describe, expect, it } from "vitest";

import { grade } from "@dd/dd-views";
import { parseLesson } from "@platform/lesson-schema";

import { designAnInstruction } from "./design-an-instruction";
import { immediates } from "./immediates";
import { instructionSet } from "./instruction-set";
import { roomToGrow } from "./room-to-grow";

const LESSONS = [instructionSet, immediates, roomToGrow, designAnInstruction].map((l) =>
  parseLesson(l),
);

describe("Module 10's failures name the rule, not the answer", () => {
  for (const lesson of LESSONS)
    for (const c of lesson.challenges) {
      if (c.tests.kind !== "answers" || !["choices", "exact"].includes(c.tests.grader)) continue;
      const tests = c.tests;
      it(`${lesson.id}, ${c.id}`, () => {
        for (const k of tests.cases) {
          const field = String(k.given["field"]);
          const want = String(k.expect["value"]);
          const f = c.fields.find((x) => x.id === field)!;
          const wrong =
            f.kind === "choice"
              ? f.options!.find((o) => o.value !== want)!.value
              : want === "1"
                ? "2"
                : "1";
          const answers = { ...c.reference.answers, [field]: wrong };
          const failure = grade(c, { answers }).failures.find((x) => x.label === k.label);
          expect(failure?.detail, k.label).toBeDefined();
          const said = failure!.detail!;
          const right =
            f.kind === "choice" ? f.options!.find((o) => o.value === want)!.label : want;
          // A kind's one digit counts only where the sentence names it as a kind ("kind A").
          const named =
            right.length === 1
              ? new RegExp(`\\bkind ${right}\\b`, "i").test(said)
              : said.toLowerCase().includes(right.toLowerCase());
          expect(named, `${k.label}: ${said}`).toBe(false);
        }
      });
    }
});
