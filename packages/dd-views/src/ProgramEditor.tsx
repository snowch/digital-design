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
  sharedNames,
  callStart,
  withData,
  type InputPlan,
} from "@dd/dd-model";
import type { Artifact, Challenge } from "@platform/lesson-schema";
import type { ChallengeEditorProps, Verdict, VerdictFailure } from "@platform/lesson-runtime";

import {
  DebuggerView,
  ProgramText,
  refusalText,
  valueText,
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
      const reg = /^[RC](\d{1,2})$/.exec(key);
      const atTrap = /^(R\d{1,2})@trap$/.exec(key);
      const word = /^word:([0-9A-Fa-f]+)$/.exec(key);
      const name = reg
        ? format(t.checkRegister, { name: key })
        : atTrap
          ? format(strings.machine12.atTrap, { name: atTrap[1] as string })
          : word
            ? format(t.checkWord, { address: (word[1] as string).toUpperCase() })
            : (t.checks[key] ?? strings.machine12.checks[key] ?? key);
      if (key === "end") return name;
      if (key === "kept") return value === "" ? t.keptAll : format(t.keptNot, { names: value });
      if (key === "returned") return value === "yes" ? t.returnedYes : t.returnedNo;
      if (key === "lamps")
        return format(t.checkValue, {
          name,
          value: t.lampNames
            .map((n, bit) => `${n} ${(Number(value) >> bit) & 1 ? t.lampOn : t.lampOff}`)
            .join(", "),
        });
      // A word or a register as the debugger writes it: from 10 to 7FF, its hexadecimal beside.
      // A long list (the words shown, the causes) is cut at its first eight.
      const items = value.split(", ");
      const listed =
        items.length > LIST_SHOWN ? `${items.slice(0, LIST_SHOWN).join(", ")}, …` : value;
      const said = (reg && key.startsWith("R")) || atTrap || word ? wordText(value, t) : listed;
      return format(t.checkValue, { name, value: said || t.emptyLeft });
    })
    .join("; ");
}

/** The items of a long list a failure names, from the first. */
const LIST_SHOWN = 8;

/**
 * A decimal the grader left, as the debugger writes a word: from 10 to 7FF its hexadecimal beside
 * it, named in words, since a failure is read as text, with no hidden label.
 */
function wordText(value: string, t: ViewStrings["machine11"]): string {
  if (!/^-?\d+$/.test(value)) return value;
  const v = BigInt(value);
  if (v < 10n || v > 0x7ffn) return valueText(v);
  return format(t.wordInText, {
    decimal: value,
    hex: v.toString(16).toUpperCase().padStart(3, "0"),
  });
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
    // The tests' lines and the learner's are assembled as one text: a name both use is refused
    // with its own sentence, naming the test, not as a line the learner never wrote.
    const shared = sharedNames(text, c.given);
    if (shared.length) {
      failures.push({
        index,
        label: c.label,
        inputs: {},
        actual: {},
        expected: {},
        detail: format(t.nameShared, { name: shared[0] as string, test: c.label }),
      });
      continue;
    }
    const r = gradeProgramCase(text, c.given, c.expect);
    // The tests' call to a name the program lacks fails that case alone; the program assembles.
    const missing = r.problems.filter((p) => p.code === "noFunction");
    if (r.problems.length > missing.length)
      return {
        passed: false,
        total: cases.length,
        failures: [],
        blocked: [t.notAssembled, ...r.problems.map((p) => refusalText(t, p))].join("\n"),
      };
    if (missing.length) {
      failures.push({
        index,
        label: c.label,
        inputs: {},
        actual: {},
        expected: {},
        detail: missing.map((p) => refusalText(t, p)).join(" "),
      });
      continue;
    }
    if (r.pass) continue;
    // One sentence for each check that failed: what the program left; how the run ended, when that
    // was not a stop of the program's or a return; the task's own sentence for what was wrong.
    // Module 12 (a run with traps) says how its run ended in its own words, the handler's `stop`
    // never "the program's", and how a run must end in the task's own sentence.
    const traps = c.given["traps"] !== undefined;
    const m12 = strings.machine12;
    const endWrong = r.wrong.includes("end") || r.wrong.includes("stopAt");
    // 12.8: a stop of the learner's own that is not the start's, and why; the sentence before it
    // has said which stop it was.
    const stopIn = r.wrong.includes("stopIn") ? r.actual["stopIn"] : undefined;
    const wrongLeft = r.wrong.filter((k) => k !== "end" && k !== "stopAt" && k !== "stopIn");
    const parts: string[] = [];
    const endKey = r.end?.key;
    const ended = (key: string) =>
      traps ? (m12.stops[key] ?? t.stops[key]) : (t.stops[key] ?? m12.stops[key]);
    // Module 12: every failed run says first where it stopped and how, and names a fault at one
    // of the learner's own lines.
    if (traps && r.end) parts.push(format(ended(r.end.key) ?? r.end.key, r.end.values));
    if (traps && r.ownFault) parts.push(format(m12.ownFault, r.ownFault));
    if (wrongLeft.length)
      parts.push(
        format(traps ? m12.failedLeft : t.failedLeft, {
          left: leftText(strings, r.actual, wrongLeft),
        }),
      );
    if (!traps && r.end && (endWrong || (endKey !== "stop" && endKey !== "returned")))
      parts.push(format(ended(r.end.key) ?? r.end.key, r.end.values));
    const key = c.given["detail"];
    const sentence =
      key !== undefined ? (t.details[String(key)] ?? m12.details[String(key)]) : undefined;
    if (sentence && wrongLeft.length) parts.push(sentence);
    if (traps) {
      const must = key !== undefined ? m12.ends[String(key)] : undefined;
      if (stopIn === "unnamed") parts.push(m12.stopUnnamed);
      else if (stopIn === "handler") parts.push(m12.stopInHandler);
      else if (stopIn === "below") parts.push(m12.stopBelow);
      if ((endWrong || stopIn !== undefined) && must) parts.push(must);
    } else if (r.wrong.includes("end") && endKey !== "stop") parts.push(t.mustStop);
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
  // The runs a learner can try: every case, a whole run or a test's call of a function, by its
  // label, so a function can be tried alone as its tests call it.
  const runs = useMemo(() => {
    if (challenge.tests.kind !== "answers") return [];
    return challenge.tests.cases;
  }, [challenge]);
  const [chosen, setChosen] = useState(0);
  const [asking, setAsking] = useState<"skeleton" | "empty" | undefined>(undefined);
  const run = runs[chosen] ?? runs[0];
  const traps = runs.some((c) => c.given["traps"] !== undefined);
  const scenario = useMemo(() => (run ? scenarioOf(run.given) : {}), [run]);
  const checked = useMemo(() => assembleChecked(withData(text, scenario)), [text, scenario]);
  const inputs = useMemo<InputPlan>(
    () => ({
      door: scenario.inputs?.door ?? 0,
      warm: scenario.inputs?.warm ?? 0,
      sensorA: scenario.inputs?.sensorA ?? 0n,
      sensorB: scenario.inputs?.sensorB ?? 0n,
      // Module 12: a test's door that opens before an instruction.
      ...(scenario.doorOpensAt !== undefined ? { doorOpensAt: scenario.doorOpensAt } : {}),
      ...(scenario.doorClosesAt !== undefined ? { doorClosesAt: scenario.doorClosesAt } : {}),
    }),
    [scenario],
  );
  const callAt = useMemo(
    () => (checked.program ? callStart(checked.program, scenario) : undefined),
    [checked.program, scenario],
  );
  // Assembled with the data the tests add, since a program names it (`log`, `count`).
  const problems = checked.problems;
  return (
    <div className="write-editor program-editor">
      {start.tiers && (
        <div className="explorer-actions">
          {(
            [
              ["skeleton", t.startSkeleton, challenge.initial.text ?? ""],
              ["empty", t.startEmpty, start.empty ?? ""],
            ] as const
          ).map(([which, label, next]) =>
            asking === which ? (
              <span key={which} className="challenge-reset-confirm" role="group" aria-label={label}>
                <button
                  type="button"
                  className="button danger"
                  onClick={() => {
                    setAsking(undefined);
                    onChange({ ...artifact, text: next });
                  }}
                >
                  {t.replaceConfirm}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setAsking(undefined)}
                >
                  {t.replaceCancel}
                </button>
              </span>
            ) : (
              <button
                key={which}
                type="button"
                className="button secondary"
                onClick={() =>
                  // Replacing a program the learner has changed asks first, as clearing work does.
                  text.trim() &&
                  text !== next &&
                  text !== challenge.initial.text &&
                  text !== start.empty
                    ? setAsking(which)
                    : onChange({ ...artifact, text: next })
                }
              >
                {label}
              </button>
            ),
          )}
        </div>
      )}
      <ProgramText
        // Module 12's challenges write a start and a handler, not a program: the box says so.
        {...(traps ? { label: strings.machine12.handlerLabel, traps: true } : {})}
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
          <p className="hdl-label">{traps ? strings.machine12.dataAdded : t.dataAdded}</p>
          <pre className="hdl-generated">{scenario.data}</pre>
        </div>
      )}
      {checked.program && (
        <details className="editor-try" open>
          <summary>{strings.editor.tryIt}</summary>
          <DebuggerView
            program={checked.program}
            inputs={inputs}
            options={{
              ...(start.debugger ?? {}),
              ...(callAt ? { start: callAt } : {}),
              ...(scenario.traps ? { traps: true } : {}),
            }}
            id={challenge.id}
          />
        </details>
      )}
    </div>
  );
}
