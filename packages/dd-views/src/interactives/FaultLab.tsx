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
import type { InteractiveProps } from "@dd/lesson-runtime";
import { formatWord, runSuite, type Diagnosis, type SequenceStep } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { useSettleSim } from "../useSim";
import { withProps } from "./props";
import { Step, outputsPerStep } from "./script";

const FaultSpec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("broken-wire"), net: z.string() }),
  z.object({ kind: z.literal("inverted"), net: z.string() }),
  z.object({
    kind: z.literal("stuck-at"),
    net: z.string(),
    value: z.union([z.literal(0), z.literal(1)]),
  }),
  z.object({ kind: z.literal("wrong-gate"), path: z.string(), gate: z.string() }),
]);

const Props = z.object({
  libraryId: z.string(),
  faults: z.array(FaultSpec).min(1),
  run: z.array(Step).min(1),
  scope: z.string().default(""),
});

export function toFault(spec: z.infer<typeof FaultSpec>): Fault {
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
      </div>
    );
  },
);
