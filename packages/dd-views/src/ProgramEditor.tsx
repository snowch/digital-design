// Copyright © 2026 Christopher Snow

// Module 11: a challenge whose answer is a program. The learner writes the program as text; the
// learner's assembler lists every line it refuses; the debugger runs it with the data of any of
// the tests' logs, so the learner can step through the run a test makes. The grader assembles the
// text with each case's data, runs it on the reference (packages/dd-model: program-tests.ts) and
// reports what the program left, never what the test expected.
//
// A challenge says it is graded this way with `tests: { kind: "answers", grader: "program" }`, its
// cases' `given` describing each run (data, the shop's inputs, a function to call and its
// registers) and `expect` naming what a program can see. The program is the artifact's `text`.
// `initial.data` may give the debugger's options (`debugger`) and offer a skeleton or an empty
// program to start from (`tiers`: Module 11's capstone).

import { useMemo, useState } from "react";

import {
  assembleChecked,
  gradeProgramCase,
  scenarioOf,
  withData,
  type MachineInputs,
} from "@dd/dd-model";
import type { Artifact, Challenge } from "@platform/lesson-schema";
import type { ChallengeEditorProps, Verdict, VerdictFailure } from "@platform/lesson-runtime";

import {
  DebuggerView,
  ProgramText,
  refusalText,
  type DebuggerOptions,
} from "./interactives/Debugger";
import { DEFAULT_VIEW_STRINGS, format, useViewStrings, type ViewStrings } from "./strings";

export const PROGRAM_GRADER = "program";

export function isProgramChallenge(challenge: Challenge): boolean {
  return challenge.tests.kind === "answers" && challenge.tests.grader === PROGRAM_GRADER;
}

const signedOf = (v: string | number) => String(v);

/** What a failed case's run left, named as the lessons name each thing. */
function leftText(
  strings: ViewStrings,
  actual: Readonly<Record<string, string>>,
  keys: readonly string[],
): string {
  const t = strings.machine11;
  return keys
    .map((key) => {
      const value = actual[key] ?? "";
      const reg = /^R(\d{1,2})$/.exec(key);
      const word = /^word:([0-9A-Fa-f]+)$/.exec(key);
      const name = reg
        ? format(t.checkRegister, { name: key })
        : word
          ? format(t.checkWord, { address: (word[1] as string).toUpperCase() })
          : (t.checks[key] ?? key);
      if (key === "end") return format(t.checkValue, { name, value: "" }).trim();
      if (key === "kept") return value === "" ? t.keptAll : format(t.keptNot, { names: value });
      if (key === "returned") return value === "yes" ? t.returnedYes : t.returnedNo;
      if (key === "lamps")
        return format(t.checkValue, {
          name,
          value: t.lampNames
            .map((n, bit) => `${n} ${(Number(value) >> bit) & 1 ? t.lampOn : t.lampOff}`)
            .join(", "),
        });
      return format(t.checkValue, { name, value: value || t.empty });
    })
    .join("; ");
}

/** Grades a program challenge: every case run, each failure saying what the program left. */
export function gradeProgram(
  challenge: Challenge,
  artifact: Artifact,
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): Verdict {
  const t = strings.machine11;
  if (challenge.tests.kind !== "answers") throw new Error(`${challenge.id} has no answer tests`);
  const cases = challenge.tests.cases;
  const text = artifact.text ?? "";
  if (!text.trim())
    return { passed: false, total: cases.length, failures: [], blocked: t.nothingWritten };
  const failures: VerdictFailure[] = [];
  for (const [index, c] of cases.entries()) {
    const r = gradeProgramCase(text, c.given, c.expect);
    if (r.problems.length)
      return {
        passed: false,
        total: cases.length,
        failures: [],
        // A problem on line 0 is the tests' call, not the learner's text, which does assemble.
        blocked: [
          ...(r.problems.some((p) => p.line > 0) ? [t.notAssembled] : []),
          ...r.problems.map((p) => refusalText(t, p)),
        ].join("\n"),
      };
    if (r.pass) continue;
    // What the program left for every check of the case, then how the run ended, then the
    // sentence naming the part of the task that is not met.
    const keys = Object.keys(c.expect).filter((k) => k !== "end");
    const parts = [format(t.failedLeft, { left: leftText(strings, r.actual, keys) })];
    if (r.end) parts.push(format(t.stops[r.end.key] ?? r.end.key, r.end.values));
    const key = c.given["detail"];
    const sentence = key !== undefined ? t.details[String(key)] : undefined;
    if (sentence) parts.push(sentence);
    failures.push({
      index,
      label: c.label,
      inputs: {},
      actual: Object.fromEntries(Object.entries(r.actual).map(([k, v]) => [k, signedOf(v)])),
      expected: {},
      detail: parts.join(" "),
    });
  }
  return { passed: failures.length === 0, total: cases.length, failures };
}

interface ProgramStart {
  readonly debugger?: DebuggerOptions;
  /** Module 11's capstone: offer the skeleton or an empty program. */
  readonly tiers?: boolean;
  /** The empty program's text: a comment or two. */
  readonly empty?: string;
}

export function ProgramEditor({ challenge, artifact, onChange }: ChallengeEditorProps) {
  const strings = useViewStrings();
  const t = strings.machine11;
  const start = (challenge.initial.data ?? {}) as ProgramStart;
  const text = artifact.text ?? challenge.initial.text ?? "";
  // The runs a learner can try: each case that runs the whole program, by its label.
  const runs = useMemo(() => {
    if (challenge.tests.kind !== "answers") return [];
    return challenge.tests.cases.filter((c) => c.given["call"] === undefined);
  }, [challenge]);
  const [chosen, setChosen] = useState(0);
  const run = runs[chosen] ?? runs[0];
  const scenario = useMemo(() => (run ? scenarioOf(run.given) : {}), [run]);
  const checked = useMemo(() => assembleChecked(withData(text, scenario)), [text, scenario]);
  const inputs = useMemo<MachineInputs>(
    () => ({
      door: scenario.inputs?.door ?? 0,
      warm: scenario.inputs?.warm ?? 0,
      sensorA: scenario.inputs?.sensorA ?? 0n,
      sensorB: scenario.inputs?.sensorB ?? 0n,
    }),
    [scenario],
  );
  // Assembled with the data the tests add, since a program names it (`log`, `count`).
  const problems = checked.problems;
  return (
    <div className="write-editor program-editor">
      {start.tiers && (
        <div className="explorer-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onChange({ ...artifact, text: challenge.initial.text ?? "" })}
          >
            {t.startSkeleton}
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => onChange({ ...artifact, text: start.empty ?? "" })}
          >
            {t.startEmpty}
          </button>
        </div>
      )}
      <ProgramText
        text={text}
        onChange={(next) => onChange({ ...artifact, text: next })}
        problems={problems}
        {...(checked.program ? { program: checked.program } : {})}
      />
      {runs.length > 1 && (
        <label className="program-run-choice">
          <span className="hdl-label">{t.runWith}</span>
          <select value={chosen} onChange={(e) => setChosen(Number(e.target.value))}>
            {runs.map((c, k) => (
              <option key={c.label} value={k}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {scenario.data && (
        <div className="program-data">
          <p className="hdl-label">{t.dataAdded}</p>
          <pre className="hdl-generated">{scenario.data}</pre>
        </div>
      )}
      {checked.program && (
        <details className="editor-try" open>
          <summary>{strings.editor.tryIt}</summary>
          <DebuggerView
            program={checked.program}
            inputs={inputs}
            options={start.debugger ?? {}}
            id={challenge.id}
          />
        </details>
      )}
    </div>
  );
}
