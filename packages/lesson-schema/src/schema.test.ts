import { describe, expect, it } from "vitest";

import { lessonJsonSchema } from "./jsonSchema";
import { SECTION_KINDS, type LessonInput } from "./schema";
import { checkLesson, parseLesson, timeModelsUsed } from "./validate";
import { termProblems } from "./vocabulary";

/** The smallest lesson the schema accepts, to vary from. */
export function minimalLesson(overrides: Partial<LessonInput> = {}): LessonInput {
  return {
    id: "a-lesson",
    title: "A lesson",
    module: 4,
    order: 1,
    objectives: ["Do a thing."],
    sections: SECTION_KINDS.map((kind) => ({
      kind,
      title: kind,
      prose: `About ${kind}.`,
      interactives:
        kind === "challenge"
          ? [
              {
                id: "ch",
                kind: "challenge",
                timeModel: "settle" as const,
                caption: "The challenge.",
                props: { challengeId: "c1" },
              },
            ]
          : [],
    })),
    challenges: [
      {
        id: "c1",
        title: "Build it",
        task: "Build the thing.",
        gradedDirection: "draw",
        interface: { inputs: [{ name: "a" }], outputs: [{ name: "y" }] },
        tests: { kind: "combinational", vectors: [{ inputs: { a: 0 }, expect: { y: 1 } }] },
        hints: ["concept", "mistake", "smaller", "partial", "full"],
        reference: { hdl: "module m(input logic a, output logic y); assign y = ~a; endmodule" },
      },
    ],
    modelVsReality: "The model is not hardware.",
    originalityNote: { textbookExample: "The usual one.", howThisDiffers: "It is different." },
    ...overrides,
  };
}

describe("the lesson schema", () => {
  it("accepts a minimal lesson and fills defaults", () => {
    const lesson = parseLesson(minimalLesson());
    expect(lesson.prerequisites).toEqual([]);
    expect(lesson.challenges[0]?.initial).toEqual({});
    expect(lesson.challenges[0]?.interface.inputs[0]?.width).toBe(1);
    expect(timeModelsUsed(lesson)).toEqual(["settle"]);
  });

  it("refuses the wrong shape with the path that is wrong", () => {
    expect(() => parseLesson(minimalLesson({ id: "Bad Id" }))).toThrow(
      /id: a lesson id is a lowercase slug/,
    );
    const fourHints = minimalLesson();
    (fourHints.challenges as { hints: string[] }[])[0]!.hints = ["a", "b", "c", "d"];
    expect(() => parseLesson(fourHints)).toThrow(/hints/);
  });

  it("holds the ten sections to the course's order", () => {
    const swapped = minimalLesson();
    const s = swapped.sections as { kind: string }[];
    [s[0], s[1]] = [s[1]!, s[0]!];
    expect(() => parseLesson(swapped)).toThrow(
      /section 1 is motivation; the course's order puts question here/,
    );
  });

  it("checks that challenges are referenced, complete and consistent with their tests", () => {
    const lesson = parseLesson(minimalLesson());
    const unreferenced = {
      ...lesson,
      sections: lesson.sections.map((s) => ({ ...s, interactives: [] })),
    };
    expect(checkLesson(unreferenced).map((p) => p.text)).toEqual([
      "challenge c1 is never mounted by a section",
      "the challenge section mounts no challenge",
    ]);

    const badPorts = {
      ...lesson,
      challenges: lesson.challenges.map((c) => ({
        ...c,
        tests: {
          kind: "combinational" as const,
          vectors: [{ inputs: { b: 0 }, expect: { y: 1 } }],
        },
      })),
    };
    expect(checkLesson(badPorts).map((p) => p.text)).toEqual([
      "challenge c1's tests use b, which its interface does not declare",
    ]);

    const noReference = {
      ...lesson,
      challenges: lesson.challenges.map((c) => ({ ...c, reference: {} })),
    };
    expect(checkLesson(noReference).map((p) => p.text)[0]).toMatch(/no reference solution/);
  });

  it("exports JSON Schema another toolchain can use", () => {
    const schema = lessonJsonSchema();
    expect(schema["type"]).toBe("object");
    const props = schema["properties"] as Record<string, unknown>;
    expect(Object.keys(props)).toContain("originalityNote");
    expect(Object.keys(props)).toContain("sections");
  });
});

describe("the term gate", () => {
  it("fails a lesson that uses a term before the lesson that introduces it, unless exempted", () => {
    const first = parseLesson(minimalLesson({ id: "first", order: 1, introduces: ["latch"] }));
    const earlier = parseLesson(
      minimalLesson({
        id: "earlier",
        order: 0,
        sections: SECTION_KINDS.map((kind) => ({
          kind,
          title: kind,
          prose: kind === "question" ? "Here the door latches shut." : "",
          interactives:
            kind === "challenge"
              ? [
                  {
                    id: "ch",
                    kind: "challenge",
                    timeModel: "none" as const,
                    caption: "c",
                    props: { challengeId: "c1" },
                  },
                ]
              : [],
        })),
      }),
    );
    const problems = termProblems([first, earlier]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ lesson: "earlier", term: "latch", home: "first" });
    expect(problems[0]?.sample).toContain("latches shut");

    const exempt = {
      ...earlier,
      termExemptions: [{ term: "latch", reason: "a door, not a circuit" }],
    };
    expect(termProblems([first, exempt])).toEqual([]);
    const later = { ...earlier, id: "later", order: 2 };
    expect(termProblems([first, later])).toEqual([]);
  });
});
