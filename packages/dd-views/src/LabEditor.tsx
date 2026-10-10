// Copyright © 2026 Christopher Snow

// Module 13: the lab, the whole machine joined as text. One challenge with three ways in, offered
// by its own buttons as Module 11's capstone offers its own: the outline (the machine's text with
// its joins left out, each marked), the parts (their ports, with the joins said in words) and
// nothing (the requirements and the tests alone). The text is graded by running programs on it
// and on the instruction-level model, compared after every instruction and every trap; a failure
// names the first instruction that disagreed, and how, never the join.

import { useState } from "react";

import { QUIET_INPUTS, compareFinalCircuit, type TextComparison } from "@dd/dd-model";
import { elaborate, machine13Modules, type Construct } from "@dd/hdl";
import type { Challenge } from "@platform/lesson-schema";
import type { ChallengeEditorProps, Verdict, VerdictFailure } from "@platform/lesson-runtime";
import type { Circuit } from "@dd/sim";

import { WriteEditor, portProblem } from "./book";
import { LabJoins } from "./interactives/LabJoins";
import { ProgramListing } from "./interactives/ProgramListing";
import { DEFAULT_VIEW_STRINGS, format, useViewStrings, type ViewStrings } from "./strings";

export const LAB_GRADER = "machine13-lab";

/** Whether a challenge is Module 13's lab: a text of the whole machine, graded by running it. */
export function isLabChallenge(challenge: Challenge): boolean {
  return challenge.tests.kind === "answers" && challenge.tests.grader === LAB_GRADER;
}

/** The ways into the lab besides the challenge's starting text, as its `initial.data` gives them. */
interface LabStarts {
  readonly parts?: string;
  readonly empty?: string;
}

const hex3 = (v: bigint) => BigInt.asUintN(64, v).toString(16).toUpperCase().padStart(3, "0");

/** A text's circuit, elaborated once with the course's parts: the same text grades every case. */
const ELABORATED = new Map<string, { circuit?: Circuit; blocked?: string }>();

/** The circuit of a text of the whole machine, or why it has none. */
export function labCircuit(
  hdl: string,
  allowed?: readonly string[],
  check?: (circuit: Circuit) => string | undefined,
): { circuit?: Circuit; blocked?: string } {
  const key = `${allowed?.join(",") ?? ""}\n${hdl}`;
  const known = ELABORATED.get(key);
  if (known) return known;
  const result = elaborate(hdl, {
    ...(allowed ? { allowed: allowed as Construct[] } : {}),
    modules: machine13Modules({}),
  });
  const errors = result.messages.filter((m) => m.severity !== "warning");
  const problem = !errors.length && result.circuit ? check?.(result.circuit) : undefined;
  const out =
    errors.length || !result.circuit
      ? {
          blocked: errors.map((m) => (m.at ? `${m.text} (line ${m.at.line})` : m.text)).join("\n"),
        }
      : problem
        ? { blocked: problem }
        : { circuit: result.circuit };
  if (ELABORATED.size >= 8) ELABORATED.delete(ELABORATED.keys().next().value as string);
  ELABORATED.set(key, out);
  return out;
}

/**
 * What a comparison found, in words: on the learner's own machine (`mine`, the lab's grade) or
 * on a text a figure runs.
 */
export function labText(strings: ViewStrings, c: TextComparison, mine = true): string {
  const t = strings.machine13;
  const d = c.difference;
  if (!d) return format(t.labRunAgrees, { n: c.steps });
  const slots = { line: d.line, address: hex3(d.pc) };
  if (d.what === "stop") {
    if (d.machineStop?.kind === "trap")
      return format(mine ? t.labHalts : t.haltsAlone, {
        ...slots,
        cause: d.machineStop.cause.toString(16).toUpperCase(),
      });
    if (d.machineStop) return format(mine ? t.labStopsOnly : t.labRunStops, slots);
    // The model stopped at `stop`, or halted with a cause; the machine went on.
    if (d.modelStop?.kind === "trap")
      return format(mine ? t.labRunsOnHalt : t.labRunGoesOnHalt, {
        ...slots,
        cause: d.modelStop.cause.toString(16).toUpperCase().padStart(2, "0"),
      });
    return format(mine ? t.labRunsOnStop : t.labRunGoesOnStop, slots);
  }
  const value = (v: bigint | undefined) =>
    v === undefined
      ? t.unknown
      : /^C[24]$|^PC$/.test(d.what)
        ? hex3(v)
        : d.what === "C3"
          ? v.toString(16).toUpperCase().padStart(2, "0")
          : /^C[01]$|^waiting$/.test(d.what)
            ? v.toString(2).padStart(2, "0")
            : d.what === "lamps"
              ? v.toString(2).padStart(3, "0")
              : // A register's small word, an address most often, with its hexadecimal beside it;
                // below 10 the two read the same, and the hexadecimal adds nothing.
                /^R\d+$/.test(d.what) && v >= 10n && v < 0x800n
                ? format(t.labWordHex, { n: v.toString(), hex: hex3(v) })
                : BigInt.asIntN(64, v).toString();
  return format(mine ? t.labDiffers : t.differs, {
    ...slots,
    what: t.what[d.what] ?? d.what,
    machine: value(d.machine),
    model: value(d.model),
  });
}

/** The inputs a case or a figure's program gives, as the model and the machine take them. */
export function labPlan(given: Readonly<Record<string, string | number | undefined>>) {
  const n = (k: string) => (given[k] === undefined ? undefined : BigInt(given[k] as number));
  return {
    ...QUIET_INPUTS,
    ...(n("sensorA") !== undefined ? { sensorA: n("sensorA") as bigint } : {}),
    ...(n("sensorB") !== undefined ? { sensorB: n("sensorB") as bigint } : {}),
    ...(given["door"] !== undefined ? { doorOpensAt: Number(given["door"]) } : {}),
    ...(given["warm"] !== undefined
      ? { warm: Number(given["warm"]) ? (1 as const) : (0 as const) }
      : {}),
  };
}

export function gradeLab(
  challenge: Challenge,
  artifact: { readonly hdl?: string },
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): Verdict {
  if (challenge.tests.kind !== "answers") throw new Error(`${challenge.id} has no cases`);
  const cases = challenge.tests.cases;
  const hdl = artifact.hdl ?? challenge.initial.hdl ?? "";
  const total = cases.length;
  if (!hdl.trim())
    return { passed: false, total, failures: [], blocked: strings.grade.nothingWritten };
  const { circuit, blocked } = labCircuit(hdl, challenge.allowedConstructs, (c) =>
    portProblem(c, challenge, strings),
  );
  if (!circuit) return { passed: false, total, failures: [], blocked: blocked ?? "" };
  const failures: VerdictFailure[] = [];
  cases.forEach((c, index) => {
    const source = String(c.given["source"] ?? "");
    const result = compareFinalCircuit(circuit, source, labPlan(c.given));
    if (result.difference)
      failures.push({
        index,
        label: c.label,
        inputs: {},
        actual: {},
        expected: {},
        detail: labText(strings, result),
      });
  });
  return { passed: failures.length === 0, total, failures };
}

/** The lab's editor: the three ways in, then the text, as every written challenge has it. */
export function LabEditor(props: ChallengeEditorProps) {
  const { challenge, artifact, onChange } = props;
  const t = useViewStrings().machine13;
  const starts = (challenge.initial.data ?? {}) as LabStarts;
  const text = artifact.hdl ?? challenge.initial.hdl ?? "";
  const [asking, setAsking] = useState<string | undefined>();
  const ways: readonly (readonly [string, string, string])[] = [
    ["outline", t.labOutline, challenge.initial.hdl ?? ""],
    ["parts", t.labParts, starts.parts ?? ""],
    ["empty", t.labEmpty, starts.empty ?? ""],
  ];
  const isStart = (x: string) => ways.some(([, , start]) => start === x);
  return (
    <div className="lab-editor">
      <div className="explorer-actions">
        {ways.map(([which, label, next]) =>
          asking === which ? (
            <span key={which} className="challenge-reset-confirm" role="group" aria-label={label}>
              <button
                type="button"
                className="button danger"
                onClick={() => {
                  setAsking(undefined);
                  onChange({ ...artifact, hdl: next });
                }}
              >
                {t.labReplace}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => setAsking(undefined)}
              >
                {t.labKeep}
              </button>
            </span>
          ) : (
            <button
              key={which}
              type="button"
              className="button secondary"
              onClick={() =>
                // Replacing a text the learner has changed asks first, as clearing work does.
                text.trim() && text !== next && !isStart(text)
                  ? setAsking(which)
                  : onChange({ ...artifact, hdl: next })
              }
            >
              {label}
            </button>
          ),
        )}
      </div>
      <WriteEditor {...props} />
      <LabJoins text={text} />
      {challenge.tests.kind === "answers" && (
        <div className="lab-listings">
          <p className="lab-run-change-heading">{t.labPrograms}</p>
          {challenge.tests.cases.map((c) => (
            <ProgramListing
              key={c.label}
              source={String(c.given["source"] ?? "")}
              label={c.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}
