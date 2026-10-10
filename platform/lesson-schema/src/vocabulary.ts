// Copyright © 2026 Christopher Snow

// The term gate: a rationed word may appear only in the lesson that introduces it and after.
//
// Each lesson lists the terms it introduces. This check reads every lesson's prose, hints, tasks
// and captions in course order and fails any lesson that uses a term before its home lesson,
// unless the lesson lists the word as an exemption with a reason (a word used in another sense).
// It is the course's version of Sizing and TCO's tests/test_vocabulary.py.

import type { Lesson } from "./schema";

export interface TermProblem {
  readonly lesson: string;
  readonly term: string;
  readonly home: string;
  readonly sample: string;
}

/** Every learner-facing string of a lesson, for a scan. */
export function learnerText(lesson: Lesson): string[] {
  const out: string[] = [lesson.title, ...lesson.objectives, lesson.modelVsReality];
  for (const s of lesson.sections) {
    out.push(s.title, s.prose);
    if (s.details) out.push(s.details.summary, s.details.prose);
    for (const x of s.interactives) {
      out.push(x.caption);
      if (x.lead) out.push(x.lead);
      if (x.after) out.push(x.after);
      // Words inside an interactive's props that a learner reads: questions, options, phases.
      out.push(...stringsIn(x.props));
    }
  }
  for (const c of lesson.challenges) out.push(c.title, c.task, ...c.hints);
  return out;
}

/** Every string nested anywhere in a props object, for the scan. */
function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

/**
 * A word's forms: the stem followed by letters, so "latch" also catches "latches" and "latched".
 * Exported so a page that comes before every lesson (the course's cover) can be held to the gate.
 */
export function termPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\w*`, "i");
}

/**
 * Lessons in course order: by module, then by order within the module. A term is at home in the
 * first lesson that lists it under `introduces`; a use before that is a problem.
 */
export function termProblems(lessons: readonly Lesson[]): TermProblem[] {
  const ordered = [...lessons].sort((a, b) => a.module - b.module || a.order - b.order);
  const position = new Map(ordered.map((l, i) => [l.id, i]));
  const home = new Map<string, string>();
  for (const l of ordered) for (const t of l.introduces) if (!home.has(t)) home.set(t, l.id);
  const problems: TermProblem[] = [];
  for (const l of ordered) {
    const exempt = new Set(l.termExemptions.map((e) => e.term.toLowerCase()));
    for (const [term, homeId] of home) {
      if (homeId === l.id) continue;
      if (exempt.has(term.toLowerCase())) continue;
      if ((position.get(l.id) ?? 0) >= (position.get(homeId) ?? 0)) continue;
      const re = termPattern(term);
      for (const text of learnerText(l)) {
        const m = re.exec(text);
        if (m) {
          const start = Math.max(0, m.index - 40);
          problems.push({
            lesson: l.id,
            term,
            home: homeId,
            sample: text.slice(start, m.index + m[0].length + 40).replace(/\s+/g, " "),
          });
          break;
        }
      }
    }
  }
  return problems;
}
