// Copyright © 2026 Chris Snow

// The editor and the grade for a challenge whose artifact is the learner's settings or answers.
//
// Each field the challenge declares is drawn by its kind: a number with its unit, a row of bits
// to change one at a time, a short text box. What the learner enters is kept as text, by field
// id, and graded case by case by the grader the challenge names (dd-model/graders). A failure
// says which case failed, what the answers gave and what was expected, in the field's terms.

import type { ComponentType } from "react";

import { ANSWER_GRADERS, OF_YOUR_BITS, isProblem, parseBits, type Bit } from "@dd/dd-model";
import type { Artifact, Challenge } from "@dd/lesson-schema";
import type { ChallengeEditorProps, Verdict, VerdictFailure } from "@dd/lesson-runtime";

import { BitRow } from "./BitRow";
import { DEFAULT_VIEW_STRINGS, format, type ViewStrings } from "./strings";

/** The answers as graded: a row of bits nobody has touched counts as all 0, as it is shown. */
export function answersOf(challenge: Challenge, artifact: Artifact): Record<string, string> {
  const out: Record<string, string> = { ...(challenge.initial.answers ?? {}) };
  Object.assign(out, artifact.answers ?? {});
  for (const f of challenge.fields)
    if (f.kind === "bits" && out[f.id] === undefined) out[f.id] = "0".repeat(f.width ?? 1);
  return out;
}

export function gradeAnswers(
  challenge: Challenge,
  artifact: Artifact,
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): Verdict {
  if (challenge.tests.kind !== "answers") throw new Error(`${challenge.id} has no answer tests`);
  const { grader: graderId, cases } = challenge.tests;
  const grader = ANSWER_GRADERS[graderId];
  if (!grader) throw new Error(`no answer grader ${graderId}`);
  const answers = answersOf(challenge, artifact);
  const labelOf = (id: string) => challenge.fields.find((f) => f.id === id)?.label ?? id;
  const term = (key: string) => strings.answers.terms[key] ?? labelOf(key);
  const named = (values: Readonly<Record<string, string>>) =>
    Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        term(k),
        v === OF_YOUR_BITS ? strings.answers.ofYourBits : v,
      ]),
    );
  const failures: VerdictFailure[] = [];
  const results = cases.map((c) => grader(answers, c.given, c.expect));
  // Every field missing anywhere is named at once, in the order the challenge asks for them.
  const gone = new Set(results.flatMap((r) => ("missing" in r ? r.missing : [])));
  if (gone.size) {
    const fields = challenge.fields.filter((f) => gone.has(f.id)).map((f) => f.label);
    const blocked = format(strings.answers.unanswered, { fields: fields.join(", ") });
    return { passed: false, total: cases.length, failures: [], blocked };
  }
  for (const [index, c] of cases.entries()) {
    const r = results[index]!;
    if (isProblem(r)) {
      const blocked =
        "missing" in r
          ? format(strings.answers.unanswered, { fields: r.missing.map(labelOf).join(", ") })
          : format(strings.answers.invalid, { field: labelOf(r.invalid) });
      return { passed: false, total: cases.length, failures: [], blocked };
    }
    if (!r.pass)
      failures.push({
        index,
        label: c.label,
        inputs: named(r.inputs),
        actual: named(r.actual),
        expected: named(r.expected),
      });
  }
  return { passed: failures.length === 0, total: cases.length, failures };
}

export const AnswerEditor: ComponentType<ChallengeEditorProps> = ({
  challenge,
  artifact,
  onChange,
}) => {
  const answers = answersOf(challenge, artifact);
  const set = (id: string, value: string) =>
    onChange({ ...artifact, answers: { ...(artifact.answers ?? {}), [id]: value } });
  return (
    <div className="answer-editor">
      {challenge.fields.map((f) => {
        const id = `answer-${challenge.id}-${f.id}`;
        const value = answers[f.id] ?? "";
        if (f.kind === "bits") {
          let bits: Bit[];
          try {
            bits = parseBits(value);
          } catch {
            bits = parseBits("0".repeat(f.width ?? 1));
          }
          return (
            <div key={f.id} className="answer-field answer-bits" data-field={f.id}>
              <p className="answer-label" id={`${id}-label`}>
                {f.label}
              </p>
              <BitRow
                bits={bits}
                label={f.label}
                weights={f.weights ?? "unsigned"}
                onFlip={(i) => set(f.id, bits.map((b, k) => (k === i ? 1 - b : b)).join(""))}
              />
            </div>
          );
        }
        return (
          <label key={f.id} className="answer-field" data-field={f.id}>
            <span className="answer-label">{f.label}</span>
            <span className="answer-input">
              <input
                id={id}
                type={f.kind === "number" ? "number" : "text"}
                inputMode={f.kind === "number" ? "decimal" : "text"}
                autoComplete="off"
                spellCheck={false}
                value={value}
                {...(f.min !== undefined ? { min: f.min } : {})}
                {...(f.max !== undefined ? { max: f.max } : {})}
                {...(f.step !== undefined ? { step: f.step } : {})}
                onChange={(e) => set(f.id, e.target.value)}
              />
              {f.unit && <span className="answer-unit">{f.unit}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
};
