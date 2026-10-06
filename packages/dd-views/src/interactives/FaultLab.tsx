// Copyright © 2026 Chris Snow

// Break it on purpose. A named fault is applied to a library circuit; the broken circuit runs
// live, and a set of checks (the healthy circuit's own behaviour over a script) says which steps
// it now gets wrong. The healthy circuit is the oracle, so the lesson's data holds no answers.

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  applyFaults,
  brokenWire,
  invertedSignal,
  libraryCircuit,
  stuckAt,
  wrongGate,
  type Fault,
} from "@dd/dd-model";
import { Prose, type InteractiveProps } from "@dd/lesson-runtime";
import { formatWord, runSuite, type Diagnosis, type SequenceStep } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { useSettleSim } from "../useSim";
import { withProps } from "./props";
import { Step, outputsPerStep } from "./script";

// A lesson may name a fault and say what it models in its own words; otherwise the fault
// library's label and explanation show (Module 2 added `explanation`).
const label = { label: z.string().optional(), explanation: z.string().optional() };
const FaultSpec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("broken-wire"), net: z.string(), ...label }),
  z.object({ kind: z.literal("inverted"), net: z.string(), ...label }),
  z.object({
    kind: z.literal("stuck-at"),
    net: z.string(),
    value: z.union([z.literal(0), z.literal(1)]),
    ...label,
  }),
  z.object({ kind: z.literal("wrong-gate"), path: z.string(), gate: z.string(), ...label }),
]);

const Props = z.object({
  libraryId: z.string(),
  faults: z.array(FaultSpec).min(1),
  run: z.array(Step).min(1),
  scope: z.string().default(""),
  /** Offer "Release all at once": only where two inputs pressed together are the experiment. */
  releaseAll: z.boolean().default(false),
  /**
   * Module 2: what the faults do, in the lesson's words, shown only once the checks have been
   * run, so a lead that asks the learner to say first is not answered under the figure.
   */
  outcomes: z.string().optional(),
});

export function toFault(spec: z.infer<typeof FaultSpec>): Fault {
  const fault = baseFault(spec);
  return {
    ...fault,
    ...(spec.label ? { label: spec.label } : {}),
    ...(spec.explanation ? { explanation: spec.explanation } : {}),
  };
}

function baseFault(spec: z.infer<typeof FaultSpec>): Fault {
  switch (spec.kind) {
    case "broken-wire":
      return brokenWire(spec.net);
    case "inverted":
      return invertedSignal(spec.net);
    case "stuck-at":
      return stuckAt(spec.net, spec.value);
    case "wrong-gate":
      return wrongGate(spec.path, spec.gate);
  }
}

export const FaultLab = withProps(
  Props,
  function FaultLab({ data, interactive }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const healthy = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const [chosen, setChosen] = useState<number>(-1);
    const [scope, setScope] = useState(data.scope);
    const fault = faults[chosen];
    const circuit = useMemo(
      () => (fault ? applyFaults(healthy, [fault]) : healthy),
      [healthy, fault],
    );
    const sim = useSettleSim(circuit);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | undefined>();
    const [ran, setRan] = useState(false);
    const expectations = useMemo(() => outputsPerStep(healthy, data.run), [healthy, data.run]);

    const runChecks = () => {
      const steps: SequenceStep[] = data.run.map((s, i) => ({
        ...(s.label ? { label: s.label } : {}),
        ...(s.set ? { set: s.set } : {}),
        ...(s.clock ? { clock: s.clock } : {}),
        expect: Object.fromEntries(
          Object.entries(expectations[i] ?? {}).map(([k, v]) => [k, formatWord(v)]),
        ),
      }));
      setDiagnosis(runSuite(circuit, { kind: "sequence", steps }));
      setRan(true);
    };
    const name = `${interactive.id}-fault`;

    return (
      <div className="fault-lab" data-interactive={interactive.id}>
        <fieldset className="fault-choices">
          <legend>{strings.fault.choose}</legend>
          <label className="fault-choice">
            <input
              type="radio"
              name={name}
              checked={chosen === -1}
              onChange={() => {
                setChosen(-1);
                setDiagnosis(undefined);
              }}
            />
            <span>{strings.fault.healthy}</span>
          </label>
          {faults.map((f, i) => (
            <label key={f.id} className="fault-choice">
              <input
                type="radio"
                name={name}
                checked={chosen === i}
                onChange={() => {
                  setChosen(i);
                  setDiagnosis(undefined);
                }}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </fieldset>
        {fault && <p className="fault-explanation">{fault.explanation}</p>}
        <CircuitView
          circuit={circuit}
          values={sim.values}
          title={strings.fault.title}
          onToggleInput={(n) => sim.toggle(n)}
          scope={scope}
          onScope={setScope}
        />
        <div className="fault-actions">
          {data.releaseAll && (
            <button type="button" className="button secondary" onClick={() => sim.releaseAll()}>
              {strings.explorer.releaseAll}
            </button>
          )}
          <button type="button" className="button primary" onClick={runChecks}>
            {strings.fault.run}
          </button>
        </div>
        {diagnosis && (
          <div className="fault-result">
            <p role="status">
              {diagnosis.passed
                ? strings.fault.allPass
                : format(strings.fault.someFail, {
                    failed: diagnosis.failures.length,
                    total: diagnosis.total,
                  })}
            </p>
            {diagnosis.failures.length > 0 && (
              <ul className="fault-failures">
                {diagnosis.failures.map((f) => (
                  <li key={f.index}>
                    {format(strings.fault.failure, {
                      label: f.label,
                      actual: Object.entries(f.actual)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", "),
                      expected: Object.entries(f.expected)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", "),
                    })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {ran && data.outcomes && (
          <div className="fault-outcomes">
            <Prose markdown={data.outcomes} />
          </div>
        )}
      </div>
    );
  },
);
