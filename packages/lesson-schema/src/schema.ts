// The lesson data format: the platform contract.
//
// A lesson is data, not a page. It declares what it teaches, the ten sections in the course's
// fixed order, the interactives each section mounts (by kind, so the runtime looks each up in a
// registry a book supplies), the challenges with their tests, hints and reference solutions, the
// model-versus-reality note, and the originality note. The runtime renders it; another book can
// supply its own interactives and render its own lessons with the same runtime.
//
// Zod is the single source: TypeScript types are inferred from these schemas and the JSON Schema
// another toolchain would validate against is exported from them (jsonSchema.ts).

import { z } from "zod";

/** The ten sections, in the order every lesson has them. */
export const SECTION_KINDS = [
  "question",
  "motivation",
  "prediction",
  "investigation",
  "construction",
  "failureExperiment",
  "explanation",
  "generalisation",
  "challenge",
  "reflection",
] as const;

export const SectionKind = z.enum(SECTION_KINDS);
export type SectionKind = z.infer<typeof SectionKind>;

/** Which of the engine's time models an interactive runs. None is transistor-level. */
export const TimeModel = z.enum(["settle", "clocked", "delay", "none"]);
export type TimeModel = z.infer<typeof TimeModel>;

/** A value in a test vector as lesson data carries it: a number, or bits with X. */
const VectorValue = z.union([
  z.number().int().nonnegative(),
  z.string().regex(/^([01X]+|0x[0-9a-fA-F]+|\d+|X)$/),
]);

export const CombinationalVector = z.object({
  label: z.string().optional(),
  inputs: z.record(z.string(), VectorValue),
  expect: z.record(z.string(), VectorValue),
  internal: z.record(z.string(), VectorValue).optional(),
  /** Module 3: for a suite with a `chain`, how many copies of the slice this vector tests. */
  slices: z.number().int().min(1).max(64).optional(),
});

/**
 * Module 3: a slice tested at widths its tests choose. The grader makes as many copies of the
 * learner's one-bit circuit as a vector's `slices` says and wires them into a circuit for words:
 * copy k takes bit k of each `bitwise` input and gives bit k of each `outputs` output, `shared`
 * inputs reach every copy, and each copy's carry out drives the next copy's carry in.
 */
export const ChainSpec = z.object({
  bitwise: z.array(z.string()).min(1),
  outputs: z.array(z.string()).min(1),
  shared: z.array(z.string()).default([]),
  carry: z.object({ in: z.string(), out: z.string() }).optional(),
});

export const SequenceStep = z.object({
  label: z.string().optional(),
  set: z.record(z.string(), VectorValue).optional(),
  clock: z.string().optional(),
  expect: z.record(z.string(), VectorValue).optional(),
  internal: z.record(z.string(), VectorValue).optional(),
});

/**
 * One case of an answers challenge: what the book's grader is given besides the learner's
 * answers (a recording, a number to encode), and what it must produce. The grader, not the
 * lesson, decides whether the answers meet `expect`, so a case can ask for "at least".
 */
export const AnswerCase = z.object({
  label: z.string().min(1),
  given: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  expect: z.record(z.string(), z.union([z.string(), z.number()])),
});

export const TestSuite = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("combinational"),
    vectors: z.array(CombinationalVector).min(1),
    chain: ChainSpec.optional(),
  }),
  z.object({ kind: z.literal("sequence"), steps: z.array(SequenceStep).min(1) }),
  /** The learner's settings or answers, checked case by case by a grader the book names. */
  z.object({
    kind: z.literal("answers"),
    grader: z.string().min(1),
    cases: z.array(AnswerCase).min(1),
  }),
]);
export type TestSuite = z.infer<typeof TestSuite>;

/** A circuit as plain data: the engine's netlist, which is already JSON. */
export const CircuitData = z.object({
  name: z.string(),
  nets: z
    .array(
      z.object({
        id: z.number().int().nonnegative(),
        name: z.string(),
        width: z.number().int().min(1),
        meta: z.record(z.string(), z.unknown()).readonly().optional(),
      }),
    )
    .readonly(),
  components: z
    .array(
      z.object({
        id: z.number().int().nonnegative(),
        kind: z.string(),
        name: z.string(),
        path: z.string(),
        inputs: z.record(z.string(), z.number().int().nonnegative()).readonly(),
        outputs: z.record(z.string(), z.number().int().nonnegative()).readonly(),
        delay: z.number().nonnegative().optional(),
        params: z
          .record(z.string(), z.union([z.number(), z.string(), z.boolean()]))
          .readonly()
          .optional(),
        meta: z.record(z.string(), z.unknown()).readonly().optional(),
      }),
    )
    .readonly(),
  inputs: z.array(z.object({ name: z.string(), net: z.number().int().nonnegative() })).readonly(),
  outputs: z.array(z.object({ name: z.string(), net: z.number().int().nonnegative() })).readonly(),
  composites: z
    .array(
      z.object({
        path: z.string(),
        kind: z.string(),
        name: z.string(),
        inputs: z.record(z.string(), z.number().int().nonnegative()).readonly(),
        outputs: z.record(z.string(), z.number().int().nonnegative()).readonly(),
        meta: z.record(z.string(), z.unknown()).readonly().optional(),
      }),
    )
    .readonly(),
});
export type CircuitData = z.infer<typeof CircuitData>;

/** What a learner produces for a challenge, or what a lesson hands them to start from. */
export const Artifact = z.object({
  /** A drawn circuit, or the id of one in the domain's library. */
  circuit: CircuitData.optional(),
  libraryId: z.string().optional(),
  /** Text in the course's hardware description language. */
  hdl: z.string().optional(),
  /** Settings or answers, by field id, as the learner entered them. */
  answers: z.record(z.string(), z.string()).optional(),
});
export type Artifact = z.infer<typeof Artifact>;

export const PortSpec = z.object({
  name: z.string().min(1),
  width: z.number().int().min(1).default(1),
});

/** An interactive a section mounts. The runtime looks `kind` up in the book's registry. */
export const Interactive = z.object({
  id: z.string().min(1),
  kind: z.string().min(1),
  /** Which time model it runs, said on the page. */
  timeModel: TimeModel,
  /** A caption a screen reader and the page both get. */
  caption: z.string().min(1),
  /** Markdown shown directly above the figure, inside its section. */
  lead: z.string().optional(),
  /** Markdown shown directly below the figure. */
  after: z.string().optional(),
  props: z.record(z.string(), z.unknown()).default({}),
});
export type Interactive = z.infer<typeof Interactive>;

export const Section = z.object({
  kind: SectionKind,
  title: z.string().min(1),
  /** Markdown. */
  prose: z.string(),
  interactives: z.array(Interactive).default([]),
});
export type Section = z.infer<typeof Section>;

/** The five rungs, in order: concept, mistake class, smaller example, partial solution, full. */
export const Hints = z.tuple([
  z.string().min(1),
  z.string().min(1),
  z.string().min(1),
  z.string().min(1),
  z.string().min(1),
]);

/**
 * A field of an answers challenge. The book draws each kind: a number with a unit, a row of
 * bits the learner flips, a short piece of text. `label` is what the learner reads beside it.
 */
export const AnswerField = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["number", "bits", "text"]),
  /** For a number: its range, step and unit. */
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  unit: z.string().optional(),
  /** For bits: how many, and which worths label them. */
  width: z.number().int().min(1).max(32).optional(),
  weights: z.enum(["unsigned", "signed"]).optional(),
});
export type AnswerField = z.infer<typeof AnswerField>;

/**
 * Module 2: what a drawn or written circuit may use besides passing its tests. Each limit set is
 * one more test: at most `gates` gates, at most `depth` gates on any path from an input to an
 * output, and gates of the kinds in `only` and no others.
 */
export const Limits = z.object({
  gates: z.number().int().min(1).optional(),
  depth: z.number().int().min(1).optional(),
  only: z.array(z.string().min(1)).min(1).optional(),
});
export type Limits = z.infer<typeof Limits>;

export const Challenge = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Markdown: what to build or write, and what the tests check. */
  task: z.string().min(1),
  /**
   * What is graded: a drawn circuit, written text (the other view stays available), or the
   * learner's answers to the challenge's `fields`.
   */
  gradedDirection: z.enum(["draw", "write", "answer"]),
  /** The ports the learner's circuit must expose, by name and width. None for answers. */
  interface: z
    .object({ inputs: z.array(PortSpec).default([]), outputs: z.array(PortSpec).default([]) })
    .default({ inputs: [], outputs: [] }),
  /** What an answers challenge asks for, in order. */
  fields: z.array(AnswerField).default([]),
  /** What the learner starts from. */
  initial: Artifact.default({}),
  tests: TestSuite,
  /** HDL constructs this challenge's text may use. */
  allowedConstructs: z.array(z.string()).default([]),
  /** What the editor offers to build a drawn solution with, by id. The book interprets the ids. */
  palette: z.array(z.string()).default([]),
  /** Module 2: a gate budget, a depth and the kinds of gate allowed, each graded as a test. */
  limits: Limits.optional(),
  hints: Hints,
  /** The reference solution: what the educational tests complete the challenge with, and what rung five offers. */
  reference: Artifact,
});
export type Challenge = z.infer<typeof Challenge>;

export const OriginalityNote = z.object({
  /** The obvious textbook example for this topic. */
  textbookExample: z.string().min(1),
  /** How this lesson's example deliberately differs. */
  howThisDiffers: z.string().min(1),
});

export const Lesson = z.object({
  /** The slug: identity everywhere. Never a number. */
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, "a lesson id is a lowercase slug"),
  title: z.string().min(1),
  /** The curriculum module this lesson belongs to. */
  module: z.number().int().min(0),
  /** Order within the course. */
  order: z.number().int().min(0),
  objectives: z.array(z.string().min(1)).min(1),
  /** Lesson ids a learner should have done first. */
  prerequisites: z.array(z.string()).default([]),
  /** Rationed terms this lesson is the first to use. */
  introduces: z.array(z.string().min(1)).default([]),
  /** Words that look like rationed terms but are used in another sense here, with the reason. */
  termExemptions: z.array(z.object({ term: z.string(), reason: z.string() })).default([]),
  sections: z.array(Section).length(SECTION_KINDS.length),
  challenges: z.array(Challenge).default([]),
  /** Markdown: what the simulator does and how hardware differs. */
  modelVsReality: z.string().min(1),
  originalityNote: OriginalityNote,
});
export type Lesson = z.infer<typeof Lesson>;
export type LessonInput = z.input<typeof Lesson>;
