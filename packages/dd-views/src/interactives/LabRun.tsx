// Copyright © 2026 Christopher Snow

// Module 13's lab, run in a figure: `lab-run`. A text of the whole machine, the course's own or
// one with a line changed, runs a program the learner chooses, and the run is compared with the
// instruction-level model after every step, as the lab's grade compares the learner's text. The
// figure shows only the line a text changes, never the course's own line in its place, and a
// result only after the run that makes it. A prediction may come first: on which of the
// programs the first text's run differs from the model, worked out by running them.

import { useMemo, useState } from "react";
import { z } from "zod";

import { compareFinalCircuit, type TextComparison } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";

import { labCircuit, labPlan, labText } from "../LabEditor";
import { LabJoins, partNamed } from "./LabJoins";
import { ProgramListing } from "./ProgramListing";
import { format, useViewStrings } from "../strings";
import { withCode } from "./Module13Figures";
import { withProps } from "./props";

const Props = z.object({
  /** The course's text of the whole machine. */
  hdl: z.string(),
  /** The texts the learner may run: the course's, or the course's with one line changed. */
  texts: z
    .array(
      z.object({
        label: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
        /** The changed line shows only once this text has run: a failure read before its join. */
        hidden: z.boolean().default(false),
      }),
    )
    .min(1),
  /** The programs, each with the inputs it runs with (`sensorA`, `sensorB`, `door`). */
  programs: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        source: z.string(),
        inputs: z.record(z.string(), z.number()).default({}),
      }),
    )
    .min(1),
  /** Before any run: on which programs the first text differs from the model. */
  question: z.string().optional(),
  /** Each option's value is the ids of the programs that differ, joined by "+", or "none". */
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /**
   * A paragraph shown once the runs it reports are made, as the figure's own runs, never at load;
   * with `afterChange`, only once the learner has also pressed to see the line the text changes,
   * so its reasoning never decides for them.
   */
  reveal: z
    .object({
      text: z.string(),
      afterChange: z.boolean().default(false),
      /**
       * Every run the paragraph reports, each a text (by its place in `texts`) and a program: it
       * shows once all of them are made, so it never quotes a run the learner has not made.
       */
      runs: z.array(z.tuple([z.number().int().min(0), z.string()])).default([]),
    })
    .optional(),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

/** A text of the figure: the course's with its one change made. */
export function labVariant(
  hdl: string,
  text: { readonly from?: string; readonly to?: string },
): string {
  if (text.from === undefined) return hdl;
  if (!hdl.includes(text.from)) throw new Error(`lab-run: no ${JSON.stringify(text.from)}`);
  return hdl.replace(text.from, text.to ?? "");
}

/** Run a program on a text, compared with the model. */
export function labRun(
  hdl: string,
  program: Data["programs"][number],
): TextComparison | { blocked: string } {
  const { circuit, blocked } = labCircuit(hdl);
  if (!circuit) return { blocked: blocked ?? "" };
  return compareFinalCircuit(circuit, program.source, labPlan(program.inputs));
}

/** The prediction's answer: the programs on which a text's run differs, joined by "+". */
export function labAnswer(hdl: string, programs: Data["programs"]): string {
  const differ = programs.filter((p) => {
    const r = labRun(hdl, p);
    return "blocked" in r || r.difference !== undefined;
  });
  return differ.length ? differ.map((p) => p.id).join("+") : "none";
}

export const LabRunFigure = withProps(
  Props,
  function LabRunFigure({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.machine13;
    const [which, setWhich] = useState(0);
    const [program, setProgram] = useState(0);
    const [running, setRunning] = useState(false);
    const [runs, setRuns] = useState<readonly string[]>([]);
    // Which text has run which program, for a paragraph that reports them.
    const [made, setMade] = useState<ReadonlySet<string>>(new Set());
    // A hidden line shows on a press, once a run of its text has differed from the model, whichever
    // program made it: the page never names the program that finds it.
    const [shown, setShown] = useState(false);
    const [differed, setDiffered] = useState<ReadonlySet<number>>(new Set());
    // The part the last run's sentence names, for the text it ran; nothing before a run.
    const [named, setNamed] = useState<{ which: number; part?: string } | undefined>();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    // The answer is worked out by running the programs, once the learner has committed.
    const answer = useMemo(
      () =>
        asking && stored?.choice !== undefined
          ? labAnswer(labVariant(data.hdl, data.texts[0] as Data["texts"][number]), data.programs)
          : "",
      [asking, stored?.choice, data.hdl, data.texts, data.programs],
    );
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    const text = data.texts[which];
    const chosen = data.programs[program];
    const run = () => {
      if (!text || !chosen) return;
      setRunning(true);
      // The run blocks while it goes; the pause lets "Running" show first.
      setTimeout(() => {
        const r = labRun(labVariant(data.hdl, text), chosen);
        const result = "blocked" in r ? r.blocked : labText(strings, r, false);
        const d = "blocked" in r ? undefined : r.difference;
        const part = partNamed(d?.what, d?.machineStop?.kind === "trap");
        setNamed({ which, ...(part ? { part } : {}) });
        setMade((old) => new Set([...old, `${which}:${chosen.id}`]));
        if ("blocked" in r || d !== undefined) setDiffered((old) => new Set([...old, which]));
        setRuns((old) => [
          format(t.labRunLine, { text: text.label, program: chosen.label, result }),
          ...old,
        ]);
        setRunning(false);
      }, 20);
    };
    return (
      <div className="explorer lab-run" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <PredictionChallenge
              name={`${interactive.id}-choice`}
              options={data.options ?? []}
              committed={stored?.choice}
              onCommit={(choice) => setStored({ choice })}
              onAgain={() => setStored(undefined)}
              legend={strings.prediction.legend}
              commitLabel={strings.prediction.commit}
              againLabel={strings.prediction.again}
              verdict={
                stored?.choice !== undefined && (
                  <p
                    role="status"
                    className={stored.choice === answer ? "prediction-match" : "prediction-nomatch"}
                  >
                    {format(strings.prediction.youSaid, { choice: optionLabel(stored.choice) })}{" "}
                    {format(t.labAnswer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
            {committed && data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
        {committed && (
          <>
            <div className="lab-run-choices">
              {data.texts.length > 1 && (
                <label className="lab-run-choice">
                  <span>{t.labTextLegend}</span>
                  <select
                    value={which}
                    onChange={(e) => setWhich(Number(e.target.value))}
                    disabled={running}
                  >
                    {data.texts.map((x, k) => (
                      <option key={k} value={k}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {data.programs.length > 1 && (
                <label className="lab-run-choice">
                  <span>{t.labProgramLegend}</span>
                  <select
                    value={program}
                    onChange={(e) => setProgram(Number(e.target.value))}
                    disabled={running}
                  >
                    {data.programs.map((p, k) => (
                      <option key={p.id} value={k}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {chosen && (
              <ProgramListing
                source={chosen.source}
                label={format(t.labListing, { program: chosen.label })}
              />
            )}
            {text?.hidden &&
              text.to !== undefined &&
              !shown &&
              differed.has(which) && (
                <div className="explorer-actions">
                  <button type="button" className="button secondary" onClick={() => setShown(true)}>
                    {t.labShowChange}
                  </button>
                </div>
              )}
            {text?.to !== undefined && (!text.hidden || shown) && (
              <div className="lab-run-change">
                <p className="lab-run-change-heading">{t.labChange}</p>
                <pre className="hdl-code">
                  <code>{text.to.trim()}</code>
                </pre>
              </div>
            )}
            {text && (
              <LabJoins
                text={labVariant(data.hdl, text)}
                mapOnly
                counts={false}
                {...(named?.which === which && named.part ? { marked: named.part } : {})}
              />
            )}
            {/* Only a figure whose text has a wrong line can mark a part. */}
            {data.texts.some((x) => x.to !== undefined) && (
              <p className="lab-joins-note">{t.joinsMarkNote}</p>
            )}
            <div className="explorer-actions">
              <button type="button" className="button" disabled={running} onClick={run}>
                {running ? t.labRunning : t.labRun}
              </button>
            </div>
            {runs.length > 0 && (
              <div className="lab-run-results" aria-live="polite">
                <p className="lab-run-change-heading">{t.labRunsCaption}</p>
                <ul>
                  {runs.map((r, k) => (
                    <li key={runs.length - k}>{withCode(r)}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* What the runs show, after them, once every run it reports is made. */}
            {data.reveal &&
              (!data.reveal.afterChange || shown) &&
              data.reveal.runs.every(([k, id]) => made.has(`${k}:${id}`)) &&
              made.size > 0 && <Prose markdown={data.reveal.text} />}
          </>
        )}
      </div>
    );
  },
);
