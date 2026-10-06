// Copyright © 2026 Christopher Snow

// Fixtures for the runtime's own tests: a small lesson and a book whose grader is a string match.
// Not exported from the package.

import type { ComponentType } from "react";

import { SECTION_KINDS, parseLesson, type Lesson, type LessonInput } from "@platform/lesson-schema";

import type { Book, ChallengeEditorProps, InteractiveProps, Verdict } from "./book";

export function fixtureLesson(overrides: Partial<LessonInput> = {}): Lesson {
  return parseLesson({
    id: "remember",
    title: "How does a circuit remember?",
    module: 4,
    order: 1,
    objectives: ["Build a latch.", "Say what feedback does."],
    introduces: ["latch"],
    sections: SECTION_KINDS.map((kind) => ({
      kind,
      title: `The ${kind} title`,
      prose: `Prose for **${kind}**.`,
      interactives:
        kind === "investigation"
          ? [
              {
                id: "loop",
                kind: "demo",
                timeModel: "settle" as const,
                caption: "A loop of inverters.",
                props: { n: 2 },
              },
              {
                id: "mystery",
                kind: "nothing-has-this",
                timeModel: "none" as const,
                caption: "A figure the book cannot show.",
              },
            ]
          : kind === "challenge"
            ? [
                {
                  id: "ch1",
                  kind: "challenge",
                  timeModel: "settle" as const,
                  caption: "Build the latch.",
                  props: { challengeId: "latch" },
                },
              ]
            : [],
    })),
    challenges: [
      {
        id: "latch",
        title: "Remember a press",
        task: "Write the word *right*.",
        gradedDirection: "write",
        interface: { inputs: [{ name: "S" }, { name: "R" }], outputs: [{ name: "Q" }] },
        tests: { kind: "combinational", vectors: [{ inputs: { S: 1, R: 0 }, expect: { Q: 1 } }] },
        allowedConstructs: ["module"],
        hints: ["Think.", "Most people forget.", "Try one wire.", "Half of it.", "All of it."],
        reference: { hdl: "right" },
      },
    ],
    modelVsReality: "Gates here have no delay.",
    originalityNote: { textbookExample: "The usual latch.", howThisDiffers: "Two buttons." },
    ...overrides,
  });
}

/** Passes when the text is exactly "right"; otherwise one failure with a divergence. */
export function gradeByText(_challenge: unknown, artifact: { hdl?: string }): Verdict {
  if (artifact.hdl === "right") return { passed: true, total: 1, failures: [] };
  if (artifact.hdl === "broken")
    return { passed: false, total: 1, failures: [], blocked: "the text does not parse" };
  return {
    passed: false,
    total: 1,
    failures: [
      {
        index: 0,
        label: "press S",
        inputs: { S: "1", R: "0" },
        actual: { Q: "0" },
        expected: { Q: "1" },
        divergence: {
          net: "Q",
          actual: "0",
          expected: "1",
          component: { kind: "nor", path: "norQ" },
          inputsSeen: { "a (R)": "0", "b (Qb)": "1" },
          cone: ["norQ", "norQb"],
        },
      },
    ],
  };
}

export const TextEditor: ComponentType<ChallengeEditorProps> = ({ artifact, onChange }) => (
  <label>
    Your text
    <textarea value={artifact.hdl ?? ""} onChange={(e) => onChange({ hdl: e.target.value })} />
  </label>
);

export const Demo: ComponentType<InteractiveProps> = ({ interactive }) => (
  <p data-testid="demo">demo with n={String(interactive.props["n"])}</p>
);

export function fixtureBook(lessons: readonly Lesson[]): Book {
  return {
    id: "fx",
    title: "Fixture book",
    lessons,
    interactives: { demo: Demo },
    ChallengeEditor: TextEditor,
    grade: gradeByText,
    timeModelNotes: {
      settle: "Every gate takes one step; the circuit is recomputed until nothing changes.",
    },
  };
}
