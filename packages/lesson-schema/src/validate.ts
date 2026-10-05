// Copyright © 2026 Chris Snow

// Checks a lesson beyond its shape: the ten sections in order, challenge ids unique and
// referenced, hints complete, and the words each lesson is allowed to introduce.
//
// Every check here is a sentence a test prints, so a lesson that fails says why in the words an
// author needs. The runtime calls `parseLesson` once per lesson at startup and the content tests
// call it for every lesson in the course.

import { Lesson, SECTION_KINDS, type Lesson as LessonType, type LessonInput } from "./schema";

export interface LessonProblem {
  readonly lesson: string;
  readonly text: string;
}

/** Parses and checks one lesson. Throws with every problem listed if any. */
export function parseLesson(input: LessonInput): LessonType {
  const parsed = Lesson.safeParse(input);
  if (!parsed.success) {
    const where =
      typeof input === "object" && input !== null && "id" in input
        ? String((input as { id?: unknown }).id)
        : "a lesson";
    const lines = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new Error(`${where} is not a valid lesson:\n  ${lines.join("\n  ")}`);
  }
  const problems = checkLesson(parsed.data);
  if (problems.length) {
    throw new Error(
      `${parsed.data.id} is not a valid lesson:\n  ${problems.map((p) => p.text).join("\n  ")}`,
    );
  }
  return parsed.data;
}

/** The problems with a lesson whose shape is already right. Empty when none. */
export function checkLesson(lesson: LessonType): LessonProblem[] {
  const problems: LessonProblem[] = [];
  const problem = (text: string) => problems.push({ lesson: lesson.id, text });

  lesson.sections.forEach((s, i) => {
    const want = SECTION_KINDS[i];
    if (s.kind !== want)
      problem(`section ${i + 1} is ${s.kind}; the course's order puts ${want} here`);
  });

  const challengeIds = new Set<string>();
  for (const c of lesson.challenges) {
    if (challengeIds.has(c.id)) problem(`two challenges are called ${c.id}`);
    challengeIds.add(c.id);
    if (c.gradedDirection === "answer") {
      if (c.limits) problem(`challenge ${c.id} grades answers but sets limits on a circuit`);
      problems.push(...answerProblems(lesson.id, c));
      continue;
    }
    if (c.tests.kind === "answers")
      problem(`challenge ${c.id} has answer tests but grades a circuit`);
    if (c.interface.outputs.length === 0)
      problem(`challenge ${c.id} grades a circuit but its interface declares no output`);
    if (!c.reference.circuit && !c.reference.hdl && !c.reference.libraryId) {
      problem(
        `challenge ${c.id} has no reference solution, so nothing can prove it is completable`,
      );
    }
    if (c.gradedDirection === "write" && c.allowedConstructs.length === 0) {
      problem(`challenge ${c.id} grades the written text but allows no HDL constructs`);
    }
    const ports = new Set([...c.interface.inputs, ...c.interface.outputs].map((p) => p.name));
    const names = new Set<string>();
    if (c.tests.kind === "combinational") {
      for (const v of c.tests.vectors)
        for (const n of [...Object.keys(v.inputs), ...Object.keys(v.expect)]) names.add(n);
    } else if (c.tests.kind === "sequence") {
      for (const s of c.tests.steps) {
        for (const n of [...Object.keys(s.set ?? {}), ...Object.keys(s.expect ?? {})]) names.add(n);
        if (s.clock) names.add(s.clock);
      }
    }
    for (const n of names)
      if (!ports.has(n))
        problem(`challenge ${c.id}'s tests use ${n}, which its interface does not declare`);
  }

  const referenced = new Set<string>();
  const interactiveIds = new Set<string>();
  for (const s of lesson.sections) {
    for (const x of s.interactives) {
      if (interactiveIds.has(x.id)) problem(`two interactives are called ${x.id}`);
      interactiveIds.add(x.id);
      const ref = x.props["challengeId"];
      if (typeof ref === "string") {
        referenced.add(ref);
        if (!challengeIds.has(ref))
          problem(`interactive ${x.id} refers to challenge ${ref}, which does not exist`);
      }
    }
  }
  for (const id of challengeIds)
    if (!referenced.has(id)) problem(`challenge ${id} is never mounted by a section`);

  const challengeSection = lesson.sections.find((s) => s.kind === "challenge");
  if (
    lesson.challenges.length &&
    challengeSection &&
    !challengeSection.interactives.some((x) => typeof x.props["challengeId"] === "string")
  ) {
    problem("the challenge section mounts no challenge");
  }

  return problems;
}

/** An answers challenge needs fields, answer tests, and a reference that answers every field. */
function answerProblems(lessonId: string, c: LessonType["challenges"][number]): LessonProblem[] {
  const out: string[] = [];
  if (c.tests.kind !== "answers")
    out.push(`challenge ${c.id} grades answers but its tests are not answer tests`);
  if (c.fields.length === 0) out.push(`challenge ${c.id} grades answers but asks for none`);
  const ids = new Set<string>();
  for (const f of c.fields) {
    if (ids.has(f.id)) out.push(`challenge ${c.id} has two fields called ${f.id}`);
    ids.add(f.id);
    if (f.kind === "bits" && f.width === undefined)
      out.push(`challenge ${c.id}'s field ${f.id} is a row of bits with no width`);
  }
  const answers = c.reference.answers;
  if (!answers) {
    out.push(`challenge ${c.id} has no reference answers, so nothing can prove it is completable`);
  } else {
    for (const f of c.fields)
      if (answers[f.id] === undefined)
        out.push(`challenge ${c.id}'s reference does not answer ${f.id}`);
  }
  return out.map((text) => ({ lesson: lessonId, text }));
}

/**
 * How many tests a challenge counts: rows, steps that expect something, or cases, and one more
 * for each limit it sets (Module 2's gate budget, depth and kinds of gate).
 */
export function testCount(c: LessonType["challenges"][number]): number {
  const t = c.tests;
  const suite =
    t.kind === "combinational"
      ? t.vectors.length
      : t.kind === "sequence"
        ? t.steps.filter((s) => s.expect).length
        : t.cases.length;
  return suite + limitCount(c);
}

/** How many limits a challenge sets: each is graded as one test. */
export function limitCount(c: LessonType["challenges"][number]): number {
  const l = c.limits;
  if (!l) return 0;
  return (l.gates !== undefined ? 1 : 0) + (l.depth !== undefined ? 1 : 0) + (l.only ? 1 : 0);
}

/** The time models a lesson's interactives use, for the note every lesson states. */
export function timeModelsUsed(lesson: LessonType): string[] {
  const models = new Set<string>();
  for (const s of lesson.sections)
    for (const x of s.interactives) if (x.timeModel !== "none") models.add(x.timeModel);
  return [...models];
}
