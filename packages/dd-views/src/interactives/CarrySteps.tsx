// Copyright © 2026 Christopher Snow

// Module 7: the carry, stepped from slice to slice. A row of the ALU's slices, never drawn as
// gates: the figure sets one pair of words, lets the circuit settle, changes them, and records
// every step of the settle model. A cursor moves through those steps, and each slice shows its
// carry out and its bit of Y at that step, so the learner sees a carry made in bit 0 reach the top
// one slice at a time, and counts the steps until nothing changes. With a question, the learner
// commits to an answer first. The values are the simulator's; the view computes none.

import { useMemo, useState } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge, Stepper } from "@platform/primitives";
import { Simulator, bitAt, parseWord, type Circuit, type Word } from "@dd/sim";

import { valueLabel } from "../CircuitView";
import { format, useViewStrings, youChose } from "../strings";
import { withProps } from "./props";

const Inputs = z.record(z.string(), z.union([z.string(), z.number()]));

const Props = z.object({
  /** A row of slices with carries on nets C1, C2, ... and COUT, and Y (alu8-flags-16-row). */
  libraryId: z.string(),
  /** Each case: the words before, and the change the figure makes, in the lesson's words. */
  cases: z.array(z.object({ label: z.string(), from: Inputs.default({}), to: Inputs })).min(1),
  /** Optional: commit to an answer before the steps show. Values are case indices or `same`. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
});
type Data = z.infer<typeof Props>;

export interface CarryRun {
  readonly width: number;
  /** Every step of the settle after the change, the values before it first. */
  readonly history: readonly (readonly Word[])[];
  /** How many steps the circuit took to settle after the change. */
  readonly steps: number;
}

function setAll(
  sim: Simulator,
  circuit: Circuit,
  values: Readonly<Record<string, string | number>>,
) {
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    const v = values[input.name];
    if (v !== undefined) sim.setInput(input.name, parseWord(String(v), width));
  }
}

/** One case run in the settle model: `from` settled first, then `to` applied and settled. */
export function carryRun(
  circuit: Circuit,
  from: Readonly<Record<string, string | number>>,
  to: Readonly<Record<string, string | number>>,
): CarryRun {
  const sim = new Simulator(circuit);
  for (const input of circuit.inputs) {
    const width = circuit.nets[input.net]?.width ?? 1;
    sim.setInput(input.name, parseWord("0", width));
  }
  setAll(sim, circuit, from);
  sim.settle();
  setAll(sim, circuit, to);
  const r = sim.settle();
  const a = circuit.inputs.find((i) => i.name === "A");
  const width = a ? (circuit.nets[a.net]?.width ?? 1) : 1;
  return { width, history: r.history, steps: r.history.length - 1 };
}

/** The question's answer: the case that takes the most steps, or `same` if two tie for most. */
export function carryAnswer(runs: readonly CarryRun[]): string {
  const most = Math.max(...runs.map((r) => r.steps));
  const at = runs.flatMap((r, i) => (r.steps === most ? [i] : []));
  return at.length === 1 ? String(at[0]) : "same";
}

/** Slice k's carry out: the net C(k+1), or COUT for the top slice. */
function carryNet(circuit: Circuit, k: number, width: number): number | undefined {
  const name = k === width - 1 ? "COUT" : `C${k + 1}`;
  return (
    circuit.nets.find((n) => n.name === name)?.id ??
    circuit.outputs.find((o) => o.name === name)?.net
  );
}

interface Stored {
  readonly choice?: string;
}

export const CarrySteps = withProps(
  Props,
  function CarrySteps({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.carrySteps;
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const runs = useMemo(
      () => data.cases.map((c) => carryRun(circuit, c.from, c.to)),
      [circuit, data.cases],
    );
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const [chosen, setChosen] = useState(0);
    const [step, setStep] = useState(0);
    const run = runs[chosen] ?? runs[0];
    const asking = data.question !== undefined && data.options !== undefined;
    const open = !asking || stored?.choice !== undefined;
    const name = `${interactive.id}-case`;
    if (!run) return null;
    const last = run.steps;
    const at = Math.min(step, last);
    const values = run.history[at] ?? [];
    const before = run.history[Math.max(0, at - 1)] ?? [];
    const yNet = circuit.outputs.find((o) => o.name === "Y")?.net;
    const y = yNet !== undefined ? values[yNet] : undefined;
    const rows: number[][] = [];
    for (let top = run.width - 1; top >= 0; top -= 16)
      rows.push(Array.from({ length: Math.min(16, top + 1) }, (_, i) => top - i));
    const answer = carryAnswer(runs);
    const optionLabel = (v: string) => data.options?.find((o) => o.value === v)?.label ?? v;

    return (
      <div className="carry-steps" data-interactive={interactive.id}>
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
                    {youChose(strings.prediction.youSaid, optionLabel(stored.choice))}{" "}
                    {format(t.answer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
          </div>
        )}
        {open && (
          <>
            <fieldset className="carry-cases">
              <legend>{t.cases}</legend>
              {data.cases.map((c, i) => (
                <label key={c.label} className="fault-choice">
                  <input
                    type="radio"
                    name={name}
                    checked={chosen === i}
                    onChange={() => {
                      setChosen(i);
                      setStep(0);
                    }}
                  />
                  <span>{format(t.caseSteps, { label: c.label, n: runs[i]?.steps ?? 0 })}</span>
                </label>
              ))}
            </fieldset>
            <div className="carry-grid" role="group" aria-label={t.gridLabel}>
              {rows.map((bits) => (
                <div key={bits[0]} className="carry-row">
                  <p className="carry-row-label">
                    {format(t.rowLabel, { hi: bits[0] ?? 0, lo: bits[bits.length - 1] ?? 0 })}
                  </p>
                  <ol className="carry-cells">
                    {bits.map((k) => {
                      const net = carryNet(circuit, k, run.width);
                      const c = net !== undefined ? values[net] : undefined;
                      const was = net !== undefined ? before[net] : undefined;
                      const changed =
                        at > 0 &&
                        c !== undefined &&
                        was !== undefined &&
                        valueLabel(c) !== valueLabel(was);
                      const yBit = y ? bitAt(y, k) : "X";
                      return (
                        <li
                          key={k}
                          className={changed ? "carry-cell changed" : "carry-cell"}
                          aria-label={format(t.cellLabel, {
                            k,
                            carry: c ? valueLabel(c) : "X",
                            y: yBit,
                          })}
                        >
                          <span className="carry-c" aria-hidden="true">
                            {c ? valueLabel(c) : "X"}
                          </span>
                          <span className="carry-y" aria-hidden="true">
                            {yBit}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
              <p className="carry-key">{t.key}</p>
            </div>
            <Stepper
              step={at}
              last={last}
              onStep={setStep}
              label={strings.explorer.step}
              position={format(strings.explorer.stepOf, { k: at, n: last })}
              buttons={{ back: t.back, next: t.next, end: t.end }}
              status={
                <>
                  {format(t.result, { y: y ? valueLabel(y) : "X" })}{" "}
                  {at === last ? format(t.settled, { n: last }) : ""}
                </>
              }
            />
            {asking && data.explain && <Prose markdown={data.explain} />}
          </>
        )}
      </div>
    );
  },
);
