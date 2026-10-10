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
  type Program,
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

/** The model's refusal, in words: the line, its address, and the registers that hold nothing. */
function unknownText(
  t: ViewStrings["machine13"],
  rooms: { readonly a: string; readonly b: string },
  end: { readonly line: string; readonly address: number; readonly registers: readonly number[] },
): string {
  const names = end.registers.map((r) => `R${r}`);
  return format(t.capUnknown, {
    ...rooms,
    line: end.line,
    address: end.address.toString(16).toUpperCase().padStart(3, "0"),
    registers:
      names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? ""),
  });
}

/** Why the trace cannot run the program at the trace's readings, or nothing if it can. */
function traceRefusal(program: Program, t: ViewStrings["machine13"]): string | undefined {
  const a = BigInt(CAPSTONE_TRACE_INPUTS.SENSORA);
  const b = BigInt(CAPSTONE_TRACE_INPUTS.SENSORB);
  const end = modelEnd(program, { sensorA: a, sensorB: b });
  return end.end.kind === "unknown"
    ? unknownText(t, { a: String(a), b: String(b) }, end.end)
    : undefined;
}

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
  // A verdict is plain text: a label's or a sentence's code marks go, as in every answer's verdict.
  const plain = (text: string) => text.replace(/`([^`]*)`/g, "$1");
  const fail = (index: number, label: string, detail: string) =>
    failures.push({
      index,
      label: plain(label),
      inputs: {},
      actual: {},
      expected: {},
      detail: plain(detail),
    });
  // The program's cases first; a trace question is graded only against a program that does the
  // task, since its answers are read off that program's run.
  const programCase = (c: (typeof cases)[number]): string | undefined => {
    const a = BigInt(c.given["sensorA"] as number);
    const b = BigInt(c.given["sensorB"] as number);
    const end = modelEnd(program, { sensorA: a, sensorB: b });
    const rooms = { a: String(a), b: String(b) };
    if (end.end.kind === "halt")
      return format(t.capHalts, { ...rooms, cause: end.end.cause.toString(16).toUpperCase() });
    if (end.end.kind === "limit") return format(t.capNoStop, rooms);
    if (end.end.kind === "unknown") return unknownText(t, rooms, end.end);
    const want = { display: String(c.expect["display"]), lamps: Number(c.expect["lamps"]) };
    if (String(end.display) === want.display && end.lamps === want.lamps) return undefined;
    return format(t.capWrong, {
      ...rooms,
      display: String(end.display),
      lamps: lampsText(end.lamps),
      wantDisplay: want.display,
      wantLamps: lampsText(want.lamps),
    });
  };
  const traceCase = (c: (typeof cases)[number]): string | undefined => {
    const question = String(c.given["question"]) as CapstoneQuestion;
    const given = readCapstoneAnswer(question, answers[question] ?? "");
    if (given === undefined) return t.capUnanswered;
    const found = capstoneAnswer(runOf(text), question);
    if ("missing" in found) return found.missing === "setIf" ? t.capNoSetIf : t.capNoEdge;
    return given === found.answer ? undefined : (t.capLevels[question] ?? "");
  };
  const programDetails = cases.map((c) =>
    c.given["kind"] === "program" ? programCase(c) : undefined,
  );
  const doesTask = programDetails.every((d) => d === undefined);
  cases.forEach((c, index) => {
    const detail =
      c.given["kind"] === "program" ? programDetails[index] : doesTask ? traceCase(c) : t.capFirst;
    if (detail !== undefined) fail(index, c.label, detail);
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
              // The questions' wires: the ALU, the condition block and HM, in the datapath.
              focus: ["datapath/alu", "datapath/condition", "datapath/heldM"],
              devices: true,
            },
          } as unknown as Interactive),
    [traced, challenge.id, t.capTraceCaption],
  );
  const runnable = checked.program !== undefined && checked.problems.length === 0;
  // A program the model refuses at the trace's readings is not traced: the sentence says why.
  const [refused, setRefused] = useState<string | undefined>();
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
          onClick={() => {
            const why = checked.program ? traceRefusal(checked.program, t) : undefined;
            setRefused(why);
            if (why === undefined) setTraced(text);
          }}
        >
          {t.capTrace}
        </button>
      </div>
      {refused !== undefined && <p className="capstone-refused">{refused}</p>}
      {interactive && refused === undefined && (
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
