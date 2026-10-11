// Copyright © 2026 Christopher Snow

// Beyond the machine, the compiler chapter: the compiler at work, read off the compiler's own steps
// (`compile` in dd-model), so nothing in it is scripted. The line with the piece the compiler takes
// next marked; the rule that applies; the instruction written, added to a listing that grows; the
// line rewritten with the register in place of the piece. Each instruction in the listing, pressed,
// marks the piece of the line as first written it came from, and every instruction that piece
// became. At the end, the listing with addresses, and the program's run on the shop's readings. No
// words: the chapter's construction has the learner work the branch's word out. With a question, the figure waits before the step it asks about until the learner
// commits, and hides that step's rule meanwhile, since the rule would give the answer.

import { useMemo, useState } from "react";
import { z } from "zod";

import { assemble, compile, runCompiled } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";

import { format, useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  /** One to four choices, each one or two of the compiler's lines. */
  lines: z
    .array(z.object({ label: z.string(), text: z.string() }))
    .min(1)
    .max(4),
  /** One to three choices of the shop's readings for the run after the last step. */
  readings: z
    .array(z.object({ label: z.string(), sensorA: z.number(), sensorB: z.number() }))
    .min(1)
    .max(3),
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /** The step the question asks about, counted from 0, on the first choice of lines. */
  ask: z.object({ step: z.number().int().min(0) }).optional(),
  /** The failure experiment's compiler: every piece in R1. */
  fault: z.literal("oneRegister").optional(),
  /** Shown once the last step and its run have been made. */
  outcomes: z.string().optional(),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

const hex3 = (v: number) => v.toString(16).toUpperCase().padStart(3, "0");

/** The question's answer: the instruction the compiler writes at the step asked about. */
export function compileAnswer(given: z.input<typeof Props>): string {
  const data = Props.parse(given);
  if (!data.ask) return "";
  const c = compile(data.lines[0]?.text ?? "", data.fault ? { fault: data.fault } : {});
  return c.steps[data.ask.step]?.instruction ?? "";
}

/** The line with a span marked, as three parts. */
function Marked({ text, span }: { text: string; span?: readonly [number, number] }) {
  if (!span) return <code>{text}</code>;
  return (
    <code>
      {text.slice(0, span[0])}
      <mark className="compile-piece">{text.slice(span[0], span[1])}</mark>
      {text.slice(span[1])}
    </code>
  );
}

export const CompileSteps = withProps(
  Props,
  function CompileSteps({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.beyond;
    const [chosen, setChosen] = useState(0);
    const [reading, setReading] = useState(0);
    const asking = data.question !== undefined && data.options !== undefined && !!data.ask;
    const askAt = asking ? (data.ask?.step ?? 0) : 0;
    const [at, setAt] = useState(askAt);
    const [pressed, setPressed] = useState<number | undefined>(undefined);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const committed = !asking || stored?.choice !== undefined;
    const choice = data.lines[chosen] ?? data.lines[0];
    const compiled = useMemo(
      () => compile(choice?.text ?? "", data.fault ? { fault: data.fault } : {}),
      [choice, data.fault],
    );
    const words = useMemo(() => {
      try {
        return assemble(compiled.program).lines.flatMap((l) =>
          l.instruction === undefined ? [] : [{ address: l.address }],
        );
      } catch {
        return [];
      }
    }, [compiled]);
    const readings = data.readings[reading] ?? data.readings[0];
    const run = useMemo(
      () => (readings ? runCompiled(compiled, readings.sensorA, readings.sensorB) : undefined),
      [compiled, readings],
    );
    const answer = useMemo(() => (asking ? compileAnswer(data) : ""), [asking, data]);
    const steps = compiled.steps;
    const total = steps.length;
    const done = at >= total;
    const step = steps[at];
    /** On the question's own lines, the figure waits at the step asked about until a commit. */
    const waiting = asking && !committed && chosen === 0 && at === askAt;
    const shownRows = done ? compiled.instructions.length : at;
    const marked = pressed !== undefined ? steps[pressed] : undefined;
    const first = steps.find((s) => s.line === (step ?? steps.at(-1))?.line);
    const optionLabel = (v: string) => data.options?.find((o) => o.value === v)?.label ?? v;
    const lampsText = (lamps: number) =>
      lamps & 4 ? t.lampsLit : lamps === 0 ? t.lampsDark : String(lamps);
    const restart = (to = 0) => {
      setAt(to);
      setPressed(undefined);
    };

    return (
      <div className="machine-figure compile-steps" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <PredictionChallenge
              name={`${interactive.id}-question`}
              options={data.options ?? []}
              committed={stored?.choice}
              onCommit={(c) => setStored({ choice: c })}
              onAgain={() => setStored(undefined)}
              legend={strings.prediction.legend}
              commitLabel={strings.prediction.commit}
              againLabel={strings.prediction.again}
              verdict={
                stored?.choice !== undefined && (
                  <>
                    <p
                      role="status"
                      className={
                        stored.choice === answer ? "prediction-match" : "prediction-nomatch"
                      }
                    >
                      {format(strings.prediction.youSaid, { choice: optionLabel(stored.choice) })}{" "}
                      {format(t.answer, { answer })}{" "}
                      {stored.choice === answer
                        ? strings.prediction.match
                        : strings.prediction.noMatch}
                    </p>
                    {data.explain && <Prose markdown={data.explain} />}
                  </>
                )
              }
            />
          </div>
        )}
        {data.lines.length > 1 && (
          <fieldset className="carry-cases">
            <legend>{t.linesLegend}</legend>
            {data.lines.map((l, i) => (
              <label key={l.label} className="fault-choice">
                <input
                  type="radio"
                  name={`${interactive.id}-lines`}
                  checked={chosen === i}
                  onChange={() => {
                    setChosen(i);
                    restart(0);
                  }}
                />
                <span>{l.label}</span>
              </label>
            ))}
          </fieldset>
        )}
        {first && (
          <div className="compile-line">
            <p className="layout-title">{t.written}</p>
            <p className="compile-text">
              <Marked text={first.before} span={marked?.source} />
            </p>
          </div>
        )}
        <div className="compile-line compile-now">
          <p className="layout-title">
            {format(t.lineNow, { line: step?.line ?? first?.line ?? 1 })}
          </p>
          <p className="compile-text">
            {step ? (
              <Marked text={step.before} span={step.piece} />
            ) : (
              <span className="meta">{t.nothingLeft}</span>
            )}
          </p>
          {step && (
            <p className="sr-only">
              {format(t.pieceLabel, { piece: step.before.slice(step.piece[0], step.piece[1]) })}
            </p>
          )}
          {step && (
            <p className="compile-rule">
              <strong>{t.ruleHeading}</strong> {waiting ? t.ruleHidden : t.rules[step.rule]}
            </p>
          )}
        </div>
        <p role="status" className="datapath-status">
          {format(t.progress, { n: Math.min(at, total), total })}
        </p>
        <div className="explorer-actions">
          <button
            type="button"
            className="button"
            disabled={done || waiting}
            onClick={() => setAt((a) => a + 1)}
          >
            {t.next}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={at === 0}
            onClick={() => setAt((a) => Math.max(0, a - 1))}
          >
            {t.back}
          </button>
          <button type="button" className="button secondary" onClick={() => restart(0)}>
            {t.again}
          </button>
        </div>
        <div className="truth-table-wrap">
          <table className="truth-table datapath-table compile-listing">
            <caption>{t.listingCaption}</caption>
            <thead>
              <tr>
                {done && <th scope="col">{t.address}</th>}
                <th scope="col">{t.instruction}</th>
              </tr>
            </thead>
            <tbody>
              {compiled.instructions.slice(0, shownRows).map((ins, i) => {
                const w = words[i];
                const fromStep = steps.findIndex((s) => s.made.at(-1) === i);
                const lit = marked?.made.includes(i) ?? false;
                const name = compiled.program.split("\n")[i]?.match(/^(\w+): /)?.[1];
                return (
                  <tr key={i} className={lit ? "compile-made" : undefined}>
                    {done && <td className="memory-word">{w ? hex3(w.address) : ""}</td>}
                    <td className="memory-word">
                      {fromStep >= 0 ? (
                        <button
                          type="button"
                          className="compile-row"
                          aria-pressed={pressed === fromStep}
                          aria-label={format(t.rowLabel, { instruction: ins.text })}
                          onClick={() => setPressed((p) => (p === fromStep ? undefined : fromStep))}
                        >
                          {name ? `${name}: ` : ""}
                          {ins.text}
                        </button>
                      ) : (
                        <span>
                          {name ? `${name}: ` : ""}
                          {ins.text}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {shownRows > 0 && <p className="meta">{t.linkHint}</p>}
        {done && (
          <>
            <p>{t.ended}</p>
            {data.readings.length > 1 && (
              <fieldset className="carry-cases">
                <legend>{t.readingsLegend}</legend>
                {data.readings.map((r, i) => (
                  <label key={r.label} className="fault-choice">
                    <input
                      type="radio"
                      name={`${interactive.id}-readings`}
                      checked={reading === i}
                      onChange={() => setReading(i)}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            {run && readings && (
              <p role="status" className="compile-run">
                {format(t.run, {
                  a: readings.sensorA,
                  b: readings.sensorB,
                  display: run.display === "X" ? t.displayNothing : run.display,
                  lamps: lampsText(run.lamps),
                })}
              </p>
            )}
            {data.outcomes && <Prose markdown={data.outcomes} />}
          </>
        )}
      </div>
    );
  },
);
