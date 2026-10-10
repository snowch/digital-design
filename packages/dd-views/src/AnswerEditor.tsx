// Copyright © 2026 Christopher Snow

// The editor and the grade for a challenge whose artifact is the learner's settings or answers.
//
// Each field the challenge declares is drawn by its kind: a number with its unit, a row of bits
// to change one at a time, a short text box. What the learner enters is kept as text, by field
// id, and graded case by case by the grader the challenge names (dd-model/graders). A failure
// says which case failed, what the answers gave and what was expected, in the field's terms.

import type { ComponentType, ReactNode } from "react";

import {
  ANSWER_GRADERS,
  OF_THE_MEMORY,
  OF_YOUR_BITS,
  OTHER_THAN,
  isProblem,
  parseBits,
  type Bit,
} from "@dd/dd-model";
import type { Artifact, Challenge } from "@platform/lesson-schema";
import type { ChallengeEditorProps, Verdict, VerdictFailure } from "@platform/lesson-runtime";

import { BitRow } from "./BitRow";
import { DEFAULT_VIEW_STRINGS, format, type ViewStrings } from "./strings";

/** Text with `code` in backticks, as plain text: a verdict and a select show no Markdown. */
const plain = (text: string) => text.replace(/`([^`]*)`/g, "$1");

/** A sentence's first letter in capitals, as feedback that opens on a lower-case choice needs. */
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A label with `code` in backticks, drawn as code. */
function withCodeSpans(text: string): ReactNode[] {
  return text.split(/`([^`]*)`/).map((piece, i) => (i % 2 ? <code key={i}>{piece}</code> : piece));
}

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
  // The form a field's answer takes, as its case names it: a number, hexadecimal digits, bits.
  const formOf = (id: string) => {
    const form = cases.find((c) => c.given["field"] === id)?.given["form"];
    return typeof form === "string" ? form : undefined;
  };
  const term = (key: string) => strings.answers.terms[key] ?? labelOf(key);
  // A choice is shown by what the learner read for it, not by its value.
  const shown = (key: string, v: string) =>
    challenge.fields.find((f) => f.id === key)?.options?.find((o) => o.value === v)?.label ?? v;
  const named = (values: Readonly<Record<string, string>>) =>
    Object.fromEntries(
      Object.entries(values)
        .map(([k, raw]) => [k, shown(k, raw)] as const)
        .map(([k, v]) => [
          term(k),
          v === OF_YOUR_BITS
            ? strings.answers.ofYourBits
            : v === OF_THE_MEMORY
              ? strings.answers.ofTheMemory
              : v.startsWith(OTHER_THAN)
                ? format(strings.answers.otherThan, { value: v.slice(OTHER_THAN.length) })
                : v,
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
          : strings.answers.invalidFor[r.invalid] !== undefined
            ? strings.answers.invalidFor[r.invalid]!
            : formOf(r.invalid) !== undefined &&
                strings.answers.invalidForm[formOf(r.invalid) as string] !== undefined
              ? format(strings.answers.invalidForm[formOf(r.invalid) as string]!, {
                  field: plain(labelOf(r.invalid)),
                })
              : format(strings.answers.invalid, { field: plain(labelOf(r.invalid)) });
      return { passed: false, total: cases.length, failures: [], blocked };
    }
    if (!r.pass)
      failures.push({
        index,
        label: plain(c.label),
        inputs: named(r.inputs),
        actual: named(r.actual),
        expected: named(r.expected),
        // Module 0: a sentence in place of values that would give the answer away.
        ...(r.detail && strings.answers.details[r.detail.key] !== undefined
          ? {
              detail: capital(
                plain(
                  format(
                    strings.answers.details[r.detail.key]!,
                    Object.fromEntries(
                      Object.entries(r.detail.values ?? {}).map(([k, v]) => {
                        const said = r.detail?.field ? shown(r.detail.field, v) : v;
                        // Inside a sentence, a choice's label starts in lower case.
                        return [k, said === v ? v : said.charAt(0).toLowerCase() + said.slice(1)];
                      }),
                    ),
                  ),
                ),
              ),
            }
          : {}),
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
  // Module 13: a row of wires that is not a number, as its case says: no worths, and its boxes
  // numbered from the wire the lowest holds.
  const rowOf = (id: string) => {
    const given =
      challenge.tests.kind === "answers"
        ? challenge.tests.cases.find((c) => c.given["field"] === id)?.given
        : undefined;
    return given?.["wires"] === 1 ? { showWeights: false, low: Number(given["low"] ?? 0) } : {};
  };
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
                {withCodeSpans(f.label)}
              </p>
              <BitRow
                bits={bits}
                label={plain(f.label)}
                weights={f.weights ?? "unsigned"}
                {...rowOf(f.id)}
                onFlip={(i) => set(f.id, bits.map((b, k) => (k === i ? 1 - b : b)).join(""))}
              />
            </div>
          );
        }
        // Module 0: a choice among options, the first lesson's that needs one.
        if (f.kind === "choice")
          return (
            <label key={f.id} className="answer-field" data-field={f.id}>
              <span className="answer-label">{withCodeSpans(f.label)}</span>
              <span className="answer-input">
                <select id={id} value={value} onChange={(e) => set(f.id, e.target.value)}>
                  <option value="" />
                  {(f.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {plain(o.label)}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          );
        return (
          <label key={f.id} className="answer-field" data-field={f.id}>
            <span className="answer-label">{withCodeSpans(f.label)}</span>
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
