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
});

export const SequenceStep = z.object({
  label: z.string().optional(),
  set: z.record(z.string(), VectorValue).optional(),
  clock: z.string().optional(),
  expect: z.record(z.string(), VectorValue).optional(),
  internal: z.record(z.string(), VectorValue).optional(),
});

export const TestSuite = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("combinational"), vectors: z.array(CombinationalVector).min(1) }),
  z.object({ kind: z.literal("sequence"), steps: z.array(SequenceStep).min(1) }),
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

export const Challenge = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Markdown: what to build or write, and what the tests check. */
  task: z.string().min(1),
  /** Which direction the grade counts; the other view stays available. */
  gradedDirection: z.enum(["draw", "write"]),
  /** The ports the learner's circuit must expose, by name and width. */
  interface: z.object({ inputs: z.array(PortSpec), outputs: z.array(PortSpec).min(1) }),
  /** What the learner starts from. */
  initial: Artifact.default({}),
  tests: TestSuite,
  /** HDL constructs this challenge's text may use. */
  allowedConstructs: z.array(z.string()).default([]),
  /** What the editor offers to build a drawn solution with, by id. The book interprets the ids. */
  palette: z.array(z.string()).default([]),
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
