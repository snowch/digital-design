// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { lessonJsonSchema } from "./jsonSchema";
import { NO_MODEL, SECTION_KINDS, type LessonInput } from "./schema";
import { checkLesson, modelProblems, parseLesson, testCount, timeModelsUsed } from "./validate";
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
  it("marks a lesson as an optional chapter only when it says so", () => {
    expect(parseLesson(minimalLesson()).optional).toBe(false);
    expect(parseLesson(minimalLesson({ optional: true })).optional).toBe(true);
  });

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

  it("takes a section's details only with words on its control and in its body", () => {
    const base = minimalLesson();
    const withDetails = (details: { summary: string; prose: string }): LessonInput => ({
      ...base,
      sections: base.sections.map((s) => (s.kind === "question" ? { ...s, details } : s)),
    });
    const ok = parseLesson(withDetails({ summary: "About the model", prose: "It is **small**." }));
    expect(ok.sections[0]?.details).toEqual({
      summary: "About the model",
      prose: "It is **small**.",
    });
    expect(ok.sections[1]?.details).toBeUndefined();
    expect(() => parseLesson(withDetails({ summary: "", prose: "Text." }))).toThrow(/summary/);
    expect(() => parseLesson(withDetails({ summary: "About", prose: "" }))).toThrow(/prose/);
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

  it("takes a challenge whose artifact is answers, and holds it to its own rules", () => {
    const answers = {
      id: "c1",
      title: "Pick a level",
      task: "Pick one.",
      gradedDirection: "answer" as const,
      fields: [{ id: "level", label: "Level", kind: "number" as const, min: 0, max: 3 }],
      tests: {
        kind: "answers" as const,
        grader: "level",
        cases: [{ label: "reads it", expect: { wrong: 0 } }],
      },
      hints: ["concept", "mistake", "smaller", "partial", "full"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      reference: { answers: { level: "1.5" } },
    };
    const lesson = parseLesson(minimalLesson({ challenges: [answers] }));
    expect(lesson.challenges[0]?.interface).toEqual({ inputs: [], outputs: [] });
    expect(lesson.challenges[0]?.tests.kind).toBe("answers");

    const unanswered = { ...lesson.challenges[0]!, reference: { answers: {} } };
    expect(checkLesson({ ...lesson, challenges: [unanswered] }).map((p) => p.text)).toEqual([
      "challenge c1's reference does not answer level",
    ]);
    const noFields = { ...lesson.challenges[0]!, fields: [] };
    expect(checkLesson({ ...lesson, challenges: [noFields] }).map((p) => p.text)).toEqual([
      "challenge c1 grades answers but asks for none",
    ]);
    const circuitTests = {
      ...lesson.challenges[0]!,
      gradedDirection: "draw" as const,
      reference: { hdl: "module m(); endmodule" },
    };
    expect(checkLesson({ ...lesson, challenges: [circuitTests] }).map((p) => p.text)).toEqual([
      "challenge c1 has answer tests but grades a circuit",
      "challenge c1 grades a circuit but its interface declares no output",
    ]);
  });

  // Module 2
  it("counts each limit on a circuit as one more test, and refuses limits on answers", () => {
    const lesson = parseLesson(minimalLesson());
    const c = lesson.challenges[0]!;
    expect(testCount(c)).toBe(1);
    expect(testCount({ ...c, limits: { gates: 4 } })).toBe(2);
    expect(testCount({ ...c, limits: { gates: 4, depth: 2, only: ["nand"] } })).toBe(4);
    const answers = {
      ...c,
      gradedDirection: "answer" as const,
      limits: { gates: 1 },
      fields: [{ id: "f", label: "F", kind: "text" as const }],
      tests: {
        kind: "answers" as const,
        grader: "g",
        cases: [{ label: "l", given: {}, expect: {} }],
      },
      reference: { answers: { f: "x" } },
    };
    expect(checkLesson({ ...lesson, challenges: [answers] }).map((p) => p.text)).toEqual([
      "challenge c1 grades answers but sets limits on a circuit",
    ]);
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
    // Order counts within a module: an earlier module's lesson with the same order is earlier.
    const earlierModule = { ...earlier, id: "earlier-module", module: first.module - 1, order: 1 };
    const laterModule = { ...earlier, id: "later-module", module: first.module + 1, order: 0 };
    expect(termProblems([{ ...first, order: 1 }, earlierModule]).map((p) => p.lesson)).toEqual([
      "earlier-module",
    ]);
    expect(termProblems([first, laterModule])).toEqual([]);
  });

  it("reads a section's details as well as its prose", () => {
    const first = parseLesson(minimalLesson({ id: "first", order: 1, introduces: ["latch"] }));
    const base = minimalLesson({ id: "earlier", order: 0 });
    const withDetails = (details: { summary: string; prose: string }) =>
      parseLesson({
        ...base,
        sections: base.sections.map((s) => (s.kind === "question" ? { ...s, details } : s)),
      });
    expect(
      termProblems([first, withDetails({ summary: "More", prose: "The door latches." })]),
    ).toHaveLength(1);
    expect(
      termProblems([first, withDetails({ summary: "About the latch", prose: "A door." })]),
    ).toHaveLength(1);
    expect(termProblems([first, withDetails({ summary: "More", prose: "A door." })])).toEqual([]);
  });
});

// The second book (snowch/metadata-systems) needed three general shapes beside the first book's.
describe("what a second book needs", () => {
  it("takes a choice field and holds its reference to the options", () => {
    const choice = {
      id: "c1",
      title: "Pick the source",
      task: "Pick the table the figures come from.",
      gradedDirection: "answer" as const,
      fields: [
        {
          id: "source",
          label: "Read from",
          kind: "choice" as const,
          options: [
            { value: "orders", label: "orders" },
            { value: "clean_orders", label: "clean_orders" },
          ],
        },
      ],
      tests: {
        kind: "answers" as const,
        grader: "reproduces",
        cases: [{ label: "every day", expect: { rows: "same" } }],
      },
      hints: ["concept", "mistake", "smaller", "partial", "full"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      reference: { answers: { source: "clean_orders" } },
    };
    const lesson = parseLesson(minimalLesson({ challenges: [choice] }));
    expect(lesson.challenges[0]?.fields[0]?.kind).toBe("choice");

    const notAnOption = { ...lesson.challenges[0]!, reference: { answers: { source: "x" } } };
    expect(checkLesson({ ...lesson, challenges: [notAnOption] }).map((p) => p.text)).toEqual([
      "challenge c1's reference answers source with x, which is not an option",
    ]);
    const noOptions = {
      ...lesson.challenges[0]!,
      fields: [{ id: "source", label: "Read from", kind: "choice" as const }],
    };
    expect(checkLesson({ ...lesson, challenges: [noOptions] }).map((p) => p.text)).toEqual([
      "challenge c1's field source is a choice with no options",
    ]);
  });

  it("grades written text or built data case by case, with no circuit rules", () => {
    const written = {
      id: "c1",
      title: "Write the record",
      task: "Write the record for the table.",
      gradedDirection: "write" as const,
      allowedConstructs: ["name", "owner"],
      initial: { text: "" },
      tests: {
        kind: "answers" as const,
        grader: "record",
        cases: [{ label: "names an owner", expect: { owner: "present" } }],
      },
      hints: ["concept", "mistake", "smaller", "partial", "full"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      reference: { text: "name: daily_sales\nowner: finance" },
    };
    const lesson = parseLesson(minimalLesson({ challenges: [written] }));
    expect(lesson.challenges[0]?.reference.text).toContain("owner");
    expect(testCount(lesson.challenges[0]!)).toBe(1);

    const drawn = {
      ...lesson.challenges[0]!,
      gradedDirection: "draw" as const,
      initial: { data: { nodes: [] } },
      reference: { data: { nodes: ["a", "b"], edges: [["a", "b"]] } },
    };
    expect(checkLesson({ ...lesson, challenges: [drawn] })).toEqual([]);

    const limited = { ...lesson.challenges[0]!, limits: { gates: 2 } };
    expect(checkLesson({ ...lesson, challenges: [limited] }).map((p) => p.text)).toEqual([
      "challenge c1 is graded case by case but sets limits on a circuit",
    ]);
    // Without a text or data reference, answer tests on a written challenge are still refused.
    const noReference = { ...lesson.challenges[0]!, reference: {} };
    expect(checkLesson({ ...lesson, challenges: [noReference] }).map((p) => p.text)).toEqual([
      "challenge c1 has answer tests but grades a circuit",
      "challenge c1 grades a circuit but its interface declares no output",
      "challenge c1 has no reference solution, so nothing can prove it is completable",
    ]);
  });

  it("lets a book name its own models, and holds its lessons to them", () => {
    const own = minimalLesson();
    const sections = own.sections as { interactives?: { timeModel: string }[] }[];
    sections[8]!.interactives![0]!.timeModel = "lab";
    const lesson = parseLesson(own);
    expect(timeModelsUsed(lesson)).toEqual(["lab"]);
    expect(modelProblems([lesson], ["lab", "replay"])).toEqual([]);
    expect(modelProblems([lesson], ["settle"]).map((p) => p.text)).toEqual([
      "interactive ch runs the model lab, which the book does not have",
    ]);
    // "none" is always allowed and names no model.
    sections[8]!.interactives![0]!.timeModel = NO_MODEL;
    const plain = parseLesson(own);
    expect(timeModelsUsed(plain)).toEqual([]);
    expect(modelProblems([plain], [])).toEqual([]);
  });

  it("refuses an empty model name", () => {
    const own = minimalLesson();
    const sections = own.sections as { interactives?: { timeModel: string }[] }[];
    sections[8]!.interactives![0]!.timeModel = "";
    expect(() => parseLesson(own)).toThrow(/timeModel/);
  });
});
