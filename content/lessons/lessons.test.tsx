// @vitest-environment jsdom
// Every lesson in the course, checked as content: it parses, its challenges can be completed with
// their reference solutions and not with their starting points, its rationed terms are in order,
// every figure it names exists and takes the props it gives, and the whole page renders.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  INTERACTIVES,
  answerOf,
  compileDrawing,
  createBook,
  emptyDrawing,
  grade,
} from "@dd/dd-views";
import { LessonView, memoryStorage } from "@dd/lesson-runtime";
import { termProblems } from "@dd/lesson-schema";

import { LESSONS } from "./index";

const book = createBook(LESSONS, INTERACTIVES);

describe("the course's lessons", () => {
  it("has at least one lesson, each with ten sections and an originality note", () => {
    expect(LESSONS.length).toBeGreaterThan(0);
    for (const l of LESSONS) {
      expect(l.sections).toHaveLength(10);
      expect(l.originalityNote.howThisDiffers.length).toBeGreaterThan(40);
    }
  });

  it("uses no rationed term before the lesson that introduces it", () => {
    expect(termProblems(LESSONS)).toEqual([]);
  });

  it("names only figures the book has", () => {
    for (const l of LESSONS)
      for (const s of l.sections)
        for (const x of s.interactives)
          if (x.kind !== "challenge") expect(Object.keys(INTERACTIVES)).toContain(x.kind);
  });

  // A scene draws the lesson's own world, so every signal it names is one the lesson's circuits use.
  it("names in each scene only signals its lesson's challenges use", () => {
    for (const l of LESSONS)
      for (const s of l.sections)
        for (const x of s.interactives) {
          if (x.kind !== "scene") continue;
          const names = l.challenges.flatMap((c) =>
            [...c.interface.inputs, ...c.interface.outputs].map((p) => p.name),
          );
          const p = x.props as {
            sources: { items: { signal?: string }[] }[];
            outputs: { signal?: string }[];
          };
          const signals = [...p.sources.flatMap((g) => g.items), ...p.outputs].flatMap((i) =>
            i.signal ? [i.signal] : [],
          );
          expect(signals, `${l.id}: ${x.id}`).not.toEqual([]);
          for (const name of signals) expect(names, `${l.id}: ${x.id}`).toContain(name);
        }
  });

  // A figure's lead and after-text show from the start, before the learner has chosen; only the
  // explanation inside the figure waits for "Check my prediction".
  it("gives no word prediction's answer in the text a learner reads before choosing", () => {
    for (const l of LESSONS)
      for (const s of l.sections)
        for (const x of s.interactives) {
          if (x.kind !== "reading-prediction") continue;
          const p = x.props as { question: string; ask: Parameters<typeof answerOf>[0] };
          if (p.ask.kind !== "reading") continue;
          // The answer as a whole number: not inside a longer one, such as 18 in 18.4 or -18.
          const answer = new RegExp(`(?<![\\w.-])${answerOf(p.ask)}(?!\\w|\\.\\d)`);
          for (const text of [x.lead ?? "", p.question, x.after ?? ""])
            expect(text, `${l.id}: ${x.id}`).not.toMatch(answer);
        }
  });

  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      for (const c of lesson.challenges) {
        it(`${c.id}: the reference solution passes and the starting point does not`, () => {
          const passing = grade(c, c.reference);
          expect(passing.blocked).toBeUndefined();
          expect(passing.failures).toEqual([]);
          expect(passing.passed).toBe(true);
          const start =
            c.gradedDirection !== "draw"
              ? c.initial
              : { circuit: compileDrawing(emptyDrawing(c.interface)).circuit };
          expect(grade(c, start).passed).toBe(false);
        });
      }

      it("renders every section and figure without a problem note", () => {
        const { container } = render(
          <LessonView book={book} lesson={lesson} storage={memoryStorage()} />,
        );
        expect(container.querySelectorAll("section.lesson-section")).toHaveLength(10);
        const figures = lesson.sections.flatMap((s) => s.interactives);
        expect(container.querySelectorAll("figure.interactive")).toHaveLength(figures.length);
        const problems = [
          ...container.querySelectorAll(".interactive-problem, .interactive-missing"),
        ].map((e) => e.textContent);
        expect(problems).toEqual([]);
      });
    });
  }
});

describe("plausible wrong attempts at the first lesson", () => {
  const lesson = LESSONS.find((l) => l.id === "remember")!;
  it("an OR in place of a NOR fails the two-button tests at that gate", () => {
    const c = lesson.challenges.find((x) => x.id === "two-buttons")!;
    const wrong = `module two_buttons(input logic A, input logic B, output logic LIGHT);
  logic DARK;
  assign LIGHT = B | DARK;
  assign DARK = ~(A | LIGHT);
endmodule`;
    const verdict = grade({ ...c, gradedDirection: "write" }, { hdl: wrong });
    expect(verdict.passed).toBe(false);
    expect(verdict.failures[0]?.label).toBe("press A");
    expect(verdict.failures[0]?.divergence?.component?.kind).toBe("or");
  });
  it("a D latch without its enable fails where EN is low", () => {
    const c = lesson.challenges.find((x) => x.id === "latch-in-text")!;
    const wrong = `module follow_and_hold(input logic D, input logic EN, output logic Q);
  assign Q = D;
endmodule`;
    const verdict = grade(c, { hdl: wrong });
    expect(verdict.passed).toBe(false);
    expect(verdict.failures.map((f) => f.label)).toEqual(["EN low, D high", "EN low, D low"]);
  });
  it("one transparent latch is not a flip-flop", () => {
    const c = lesson.challenges.find((x) => x.id === "flip-flop")!;
    const verdict = grade({ ...c, gradedDirection: "write" }, { hdl: D_LATCH_AS_FF });
    expect(verdict.passed).toBe(false);
  });
});

const D_LATCH_AS_FF = `module flip_flop(input logic D, input logic CLK, output logic Q);
  logic ND;
  logic S;
  logic R;
  logic QB;
  assign ND = ~D;
  assign S = D & CLK;
  assign R = ND & CLK;
  assign Q = ~(R | QB);
  assign QB = ~(S | Q);
endmodule`;
