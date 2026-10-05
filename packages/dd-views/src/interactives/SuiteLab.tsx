// Module 7: a generated test suite run against the ALU, healthy or with a fault put in on
// purpose. The cases come from the generator in dd-model (normal, boundary, random with a recorded
// seed, adversarial), every expected value is worked out in bigints, and the page counts, group by
// group, how many cases the ALU got wrong, with the first few of each. "New random cases" draws
// with the next seed, so every run can be repeated from the seed it shows. With a question, the
// learner commits to which group catches the fault first, before the suite runs.

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  CASE_GROUPS,
  aluSuite,
  applyFaults,
  hexWord,
  libraryCircuit,
  opBits,
  type AluCase,
  type CaseGroup,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@dd/lesson-runtime";
import { Simulator, formatWord, word, type Circuit } from "@dd/sim";

import { format, useViewStrings } from "../strings";
import { FaultSpec, toFault } from "./FaultLab";
import { withProps } from "./props";

const Props = z.object({
  /** An ALU with flags and inputs A, B, OP2, OP1, OP0 (alu8-flags-16-row). */
  libraryId: z.string(),
  faults: z.array(FaultSpec).default([]),
  /** The random group's first seed. */
  seed: z.number().int().nonnegative().default(1),
  randomPerJob: z.number().int().min(1).max(8).default(2),
  /** A prediction asked before the suite's controls appear, with its options and explanation. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /** Shown once the suite has run, so the counts do not answer the lead's question first. */
  outcomes: z.string().optional(),
  /** For a question: the fault it asks about, by index. */
  askFault: z.number().int().nonnegative().default(0),
});
type Data = z.infer<typeof Props>;

export interface CaseOutcome {
  readonly c: AluCase;
  readonly got: Readonly<Record<string, string>>;
  readonly want: Readonly<Record<string, string>>;
  readonly passed: boolean;
}

function widthOf(circuit: Circuit): number {
  const a = circuit.inputs.find((i) => i.name === "A");
  return a ? (circuit.nets[a.net]?.width ?? 1) : 1;
}

/** Every case of the suite run against `circuit`; expected values come from the bigint reference. */
export function runAluSuite(
  circuit: Circuit,
  seed: number,
  randomPerJob: number,
): readonly CaseOutcome[] {
  const width = widthOf(circuit);
  const sim = new Simulator(circuit);
  return aluSuite({ width, seed, randomPerJob }).map((c) => {
    sim.setInput("A", word(width, c.a));
    sim.setInput("B", word(width, c.b));
    for (const [port, v] of Object.entries(opBits(c.job))) sim.setInput(port, word(1, v));
    sim.settle();
    const got: Record<string, string> = {};
    for (const o of circuit.outputs) {
      const w = sim.read(o.name);
      got[o.name] =
        w.width > 1 ? formatWord(w, 16).replace(/^0x/, "").toUpperCase() : formatWord(w);
    }
    const want: Record<string, string> = {
      Y: hexWord(c.expect.Y, width),
      ZERO: String(c.expect.ZERO),
      MINUS: String(c.expect.MINUS),
      COUT: String(c.expect.COUT),
      OVER: String(c.expect.OVER),
    };
    const passed = Object.keys(want).every((k) => got[k] === undefined || got[k] === want[k]);
    return { c, got, want, passed };
  });
}

/** The first group, in the generator's order, with a case the circuit gets wrong; `none` if none. */
export function firstCatch(outcomes: readonly CaseOutcome[]): CaseGroup | "none" {
  return CASE_GROUPS.find((g) => outcomes.some((o) => o.c.group === g && !o.passed)) ?? "none";
}

interface Stored {
  readonly choice?: string;
  /** The seed of the random cases on show. */
  readonly seed?: number;
}

const differs = (o: CaseOutcome) =>
  Object.keys(o.want)
    .filter((k) => o.got[k] !== o.want[k])
    .map((k) => k);

export const SuiteLab = withProps(
  Props,
  function SuiteLab({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.suite;
    const healthy = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const [chosen, setChosen] = useState(asking ? data.askFault : -1);
    const [pick, setPick] = useState<string | undefined>();
    const [ran, setRan] = useState<readonly CaseOutcome[] | undefined>();
    const seed = stored?.seed ?? data.seed;
    const fault = faults[chosen];
    const circuit = useMemo(
      () => (fault ? applyFaults(healthy, [fault]) : healthy),
      [healthy, fault],
    );
    const width = widthOf(healthy);
    const asked = useMemo(() => {
      if (!asking) return undefined;
      const f = faults[data.askFault];
      return f
        ? firstCatch(runAluSuite(applyFaults(healthy, [f]), data.seed, data.randomPerJob))
        : undefined;
    }, [asking, faults, data.askFault, healthy, data.seed, data.randomPerJob]);
    const committed = !asking || stored?.choice !== undefined;
    const name = `${interactive.id}-fault`;
    const optionLabel = (v: string) => data.options?.find((o) => o.value === v)?.label ?? v;
    const [hasRun, setHasRun] = useState(false);
    const run = () => {
      setRan(runAluSuite(circuit, seed, data.randomPerJob));
      setHasRun(true);
    };

    return (
      <div className="suite-lab" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <fieldset className="prediction-options" disabled={stored?.choice !== undefined}>
              <legend className="visually-hidden">{strings.prediction.legend}</legend>
              {(data.options ?? []).map((o) => (
                <label key={o.value} className="prediction-option">
                  <input
                    type="radio"
                    name={`${interactive.id}-choice`}
                    checked={(stored?.choice ?? pick) === o.value}
                    onChange={() => setPick(o.value)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </fieldset>
            {stored?.choice === undefined ? (
              <button
                type="button"
                className="button primary"
                disabled={pick === undefined}
                onClick={() => {
                  if (pick === undefined) return;
                  setStored({ ...stored, choice: pick });
                  setChosen(data.askFault);
                  setRan(undefined);
                }}
              >
                {strings.prediction.commit}
              </button>
            ) : (
              <>
                <p
                  role="status"
                  className={stored.choice === asked ? "prediction-match" : "prediction-nomatch"}
                >
                  {format(strings.prediction.youSaid, { choice: optionLabel(stored.choice) })}{" "}
                  {format(t.answer, { answer: optionLabel(asked ?? "none") })}{" "}
                  {stored.choice === asked ? strings.prediction.match : strings.prediction.noMatch}
                </p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setStored({ ...stored, choice: undefined });
                    setPick(undefined);
                    setRan(undefined);
                  }}
                >
                  {strings.prediction.again}
                </button>
              </>
            )}
          </div>
        )}
        {committed && (
          <>
            {faults.length > 0 && (
              <fieldset className="fault-choices">
                <legend>{strings.fault.choose}</legend>
                {[-1, ...faults.map((_, i) => i)].map((i) => (
                  <label key={i} className="fault-choice">
                    <input
                      type="radio"
                      name={name}
                      checked={chosen === i}
                      onChange={() => {
                        setChosen(i);
                        setRan(undefined);
                      }}
                    />
                    <span>{i < 0 ? strings.fault.healthy : faults[i]?.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <p className="suite-seed">{format(t.seed, { seed, width })}</p>
            <div className="explorer-actions">
              <button type="button" className="button primary" onClick={run}>
                {t.run}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setStored({ ...stored, seed: seed + 1 });
                  setRan(undefined);
                }}
              >
                {t.newSeed}
              </button>
            </div>
            {ran && (
              <div className="suite-result">
                <p role="status">
                  {ran.every((o) => o.passed)
                    ? format(t.allPass, { total: ran.length })
                    : format(t.someFail, {
                        failed: ran.filter((o) => !o.passed).length,
                        total: ran.length,
                      })}
                </p>
                <div className="table-wrap">
                  <table className="suite-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.group}</th>
                        <th scope="col">{t.cases}</th>
                        <th scope="col">{t.wrong}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CASE_GROUPS.map((g) => {
                        const of = ran.filter((o) => o.c.group === g);
                        return (
                          <tr key={g}>
                            <th scope="row">{t.groups[g]}</th>
                            <td>{of.length}</td>
                            <td>{of.filter((o) => !o.passed).length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {CASE_GROUPS.map((g) => {
                  const wrong = ran.filter((o) => o.c.group === g && !o.passed);
                  if (!wrong.length) return null;
                  return (
                    <div key={g} className="suite-failures">
                      <p>{format(t.firstWrong, { group: t.groups[g] })}</p>
                      <ul>
                        {wrong.slice(0, 3).map((o) => (
                          <li key={o.c.label}>
                            {format(t.failure, {
                              label: o.c.label,
                              got: differs(o)
                                .map((k) => `${k}=${o.got[k]}`)
                                .join(", "),
                              want: differs(o)
                                .map((k) => `${k}=${o.want[k]}`)
                                .join(", "),
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
            {asking && data.explain && stored?.choice !== undefined && (
              <Prose markdown={data.explain} />
            )}
          </>
        )}
        {hasRun && data.outcomes && (
          <div className="fault-outcomes">
            <Prose markdown={data.outcomes} />
          </div>
        )}
      </div>
    );
  },
);
