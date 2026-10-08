// Copyright © 2026 Christopher Snow

// Module 13's capstone: a program of the learner's own for the shop, and questions about its run
// on the whole machine that only a trace answers. The editor holds the program, a button that
// runs it on the whole machine in the trace figure of lesson 3, and the answers. The grade runs
// the program on the instruction-level model for each case of the task, then reads each
// question's answer off the recorded run of the learner's own program (`capstoneAnswer`), so the
// answers are the learner's program's. A wrong answer is told which level to look at, never the
// value.

import { useMemo, useState } from "react";

import {
  CAPSTONE_TRACE_INPUTS,
  capstoneAnswer,
  capstoneProgram,
  capstoneRun,
  modelEnd,
  readCapstoneAnswer,
  type CapstoneQuestion,
} from "@dd/dd-model";
import type { Challenge, Interactive, Lesson } from "@platform/lesson-schema";
import {
  LessonStore,
  memoryStorage,
  type ChallengeEditorProps,
  type Verdict,
  type VerdictFailure,
} from "@platform/lesson-runtime";

import { AnswerEditor, answersOf } from "./AnswerEditor";
import { ProgramText, refusalText } from "./interactives/Debugger";
import { MachineLevels } from "./interactives/Module13Figures";
import { DEFAULT_VIEW_STRINGS, format, useViewStrings, type ViewStrings } from "./strings";

export const CAPSTONE_GRADER = "machine13-capstone";

/** Whether a challenge is Module 13's capstone. */
export function isCapstoneChallenge(challenge: Challenge): boolean {
  return challenge.tests.kind === "answers" && challenge.tests.grader === CAPSTONE_GRADER;
}

/** The run each program's questions are read from, kept for the last few programs graded. */
const RUNS = new Map<string, ReturnType<typeof capstoneRun>>();
function runOf(source: string) {
  const known = RUNS.get(source);
  if (known) return known;
  const run = capstoneRun(source);
  if (RUNS.size >= 4) RUNS.delete(RUNS.keys().next().value as string);
  RUNS.set(source, run);
  return run;
}

const lampsText = (n: number) => n.toString(2).padStart(3, "0");

export function gradeCapstone(
  challenge: Challenge,
  artifact: { readonly text?: string; readonly answers?: Readonly<Record<string, string>> },
  strings: ViewStrings = DEFAULT_VIEW_STRINGS,
): Verdict {
  if (challenge.tests.kind !== "answers") throw new Error(`${challenge.id} has no cases`);
  const t = strings.machine13;
  const cases = challenge.tests.cases;
  const total = cases.length;
  const text = artifact.text ?? "";
  if (!text.trim())
    return { passed: false, total, failures: [], blocked: strings.machine11.nothingWritten };
  const { program, problems } = capstoneProgram(text);
  if (!program || problems.length)
    return {
      passed: false,
      total,
      failures: [],
      blocked: [
        strings.machine11.notAssembled,
        ...problems.map((p) => refusalText(strings.machine11, p)),
      ].join("\n"),
    };
  const answers = answersOf(challenge, artifact as never);
  const failures: VerdictFailure[] = [];
  const fail = (index: number, label: string, detail: string) =>
    failures.push({ index, label, inputs: {}, actual: {}, expected: {}, detail });
  cases.forEach((c, index) => {
    if (c.given["kind"] === "program") {
      const a = BigInt(c.given["sensorA"] as number);
      const b = BigInt(c.given["sensorB"] as number);
      const end = modelEnd(program, { sensorA: a, sensorB: b });
      const rooms = { a: String(a), b: String(b) };
      if (end.end.kind === "halt")
        return fail(
          index,
          c.label,
          format(t.capHalts, { ...rooms, cause: end.end.cause.toString(16).toUpperCase() }),
        );
      if (end.end.kind === "limit") return fail(index, c.label, format(t.capNoStop, rooms));
      const want = { display: String(c.expect["display"]), lamps: Number(c.expect["lamps"]) };
      if (String(end.display) !== want.display || end.lamps !== want.lamps)
        fail(
          index,
          c.label,
          format(t.capWrong, {
            ...rooms,
            display: String(end.display),
            lamps: lampsText(end.lamps),
            wantDisplay: want.display,
            wantLamps: lampsText(want.lamps),
          }),
        );
      return;
    }
    const question = String(c.given["question"]) as CapstoneQuestion;
    const given = readCapstoneAnswer(question, answers[question] ?? "");
    if (given === undefined) return fail(index, c.label, t.capUnanswered);
    const found = capstoneAnswer(runOf(text), question);
    if ("missing" in found)
      return fail(
        index,
        c.label,
        found.missing === "setIf"
          ? t.capNoSetIf
          : found.missing === "store"
            ? t.capNoStore
            : t.capNoEdge,
      );
    if (given !== found.answer) fail(index, c.label, t.capLevels[question] ?? "");
  });
  return { passed: failures.length === 0, total, failures };
}

/** The capstone's editor: the program, its run on the whole machine, and the answers. */
export function CapstoneEditor(props: ChallengeEditorProps) {
  const { challenge, artifact, onChange, lesson } = props;
  const strings = useViewStrings();
  const t = strings.machine13;
  const text = artifact.text ?? challenge.initial.text ?? "";
  const checked = useMemo(() => capstoneProgram(text), [text]);
  // The run shows the program as it was when the learner pressed the button.
  const [traced, setTraced] = useState<string | undefined>();
  const store = useMemo(
    () => new LessonStore(memoryStorage(), "capstone", challenge.id),
    [challenge.id],
  );
  const interactive = useMemo(
    () =>
      traced === undefined
        ? undefined
        : ({
            id: `${challenge.id}-trace`,
            kind: "machine-levels",
            timeModel: "settle",
            caption: t.capTraceCaption,
            props: {
              program: traced,
              inputs: CAPSTONE_TRACE_INPUTS,
              trace: true,
              shown: [1, 2, 3, 4, 5, 6, 7],
              devices: true,
            },
          } as unknown as Interactive),
    [traced, challenge.id, t.capTraceCaption],
  );
  const runnable = checked.program !== undefined && checked.problems.length === 0;
  return (
    <div className="write-editor capstone-editor">
      <ProgramText
        text={text}
        onChange={(next) => onChange({ ...artifact, text: next })}
        problems={checked.problems}
        {...(checked.program ? { program: checked.program } : {})}
      />
      <div className="explorer-actions">
        <button
          type="button"
          className="button secondary"
          disabled={!runnable || traced === text}
          onClick={() => setTraced(text)}
        >
          {t.capTrace}
        </button>
      </div>
      {interactive && (
        <section className="capstone-trace" aria-label={t.capTraceCaption}>
          <MachineLevels
            key={traced}
            lesson={lesson as Lesson}
            interactive={interactive}
            store={store}
          />
        </section>
      )}
      <AnswerEditor {...props} />
    </div>
  );
}
