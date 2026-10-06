// Copyright © 2026 Christopher Snow

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
import { Prose, type InteractiveProps } from "@platform/lesson-runtime";
import { FaultInjector } from "@platform/primitives";
import { formatWord, runSuite, type Diagnosis, type SequenceStep } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { useSettleSim } from "../useSim";
import { withProps } from "./props";
import { Step, outputsPerStep } from "./script";

// A lesson may name a fault and say what it models in its own words; otherwise the fault
// library's label and explanation show (Module 2 added `explanation`).
const label = {
  label: z.string().optional(),
  explanation: z.string().optional(),
  /** Module 8: what this fault does, shown only once the learner has run it. */
  outcome: z.string().optional(),
};
export const FaultSpec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("broken-wire"), net: z.string(), ...label }),
  z.object({ kind: z.literal("inverted"), net: z.string(), ...label }),
  z.object({
    kind: z.literal("stuck-at"),
    net: z.string(),
    value: z.union([z.literal(0), z.literal(1)]),
    /** Module 8: where the fixed value is drawn, in grid cells, in a hand-placed drawing. */
    at: z.tuple([z.number(), z.number()]).optional(),
    ...label,
  }),
  z.object({ kind: z.literal("wrong-gate"), path: z.string(), gate: z.string(), ...label }),
]);

const Props = z.object({
  libraryId: z.string(),
  faults: z.array(FaultSpec).min(1),
  run: z.array(Step).min(1),
  scope: z.string().default(""),
  /** Inputs as first drawn, where all zeros would show a figure unlike its neighbours'. */
  initial: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  /** Offer "Release all at once": only where two inputs pressed together are the experiment. */
  releaseAll: z.boolean().default(false),
  /**
   * Module 2: what the faults do, in the lesson's words, shown only once the checks have been
   * run, so a lead that asks the learner to say first is not answered under the figure. Where the
   * faults carry their own `outcome`, each shown once that fault has run, this is the closing text
   * about all of them, shown once every fault has run.
   */
  outcomes: z.string().optional(),
  /**
   * What the circuit with no fault does in the lead's own experiment, shown once the learner has
   * pressed "Release all at once" with no fault chosen.
   */
  noFaultOutcome: z.string().optional(),
  /** Module 7: let the learner open a block; off where the inside is a later challenge's answer. */
  canOpen: z.boolean().default(true),
});

/**
 * What a fault acts on, as a path from the top of the circuit: its wire's net, or its gate. A wide
 * drawing moves there when the fault is chosen, so a learner on a phone sees what broke.
 */
export function faultPlace(spec: z.infer<typeof FaultSpec>): string {
  return spec.kind === "wrong-gate" ? spec.path : spec.net;
}

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
      return stuckAt(spec.net, spec.value, spec.at);
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
    const spec = data.faults[chosen];
    const circuit = useMemo(
      () => (fault ? applyFaults(healthy, [fault]) : healthy),
      [healthy, fault],
    );
    const sim = useSettleSim(circuit, data.initial);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | undefined>();
    const [ran, setRan] = useState(false);
    // The faults the learner has run, each shown its own outcome only once it has been run, as the
    // datapath figure does (Module 8): a run of one fault no longer answers the others.
    const [ranFaults, setRanFaults] = useState<ReadonlySet<number>>(new Set());
    const [releasedHealthy, setReleasedHealthy] = useState(false);
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
      if (chosen >= 0) setRanFaults((was) => new Set([...was, chosen]));
    };
    const perFault = data.faults.some((f) => f.outcome !== undefined);
    const own = chosen >= 0 && ranFaults.has(chosen) ? data.faults[chosen]?.outcome : undefined;
    const noFault = chosen < 0 && releasedHealthy ? data.noFaultOutcome : undefined;
    const closing = (perFault ? ranFaults.size === data.faults.length : ran)
      ? data.outcomes
      : undefined;
    const name = `${interactive.id}-fault`;

    return (
      <div className="fault-lab" data-interactive={interactive.id}>
        <FaultInjector
          name={name}
          legend={strings.fault.choose}
          noneLabel={strings.fault.healthy}
          faults={faults}
          chosen={chosen}
          onChoose={(i) => {
            setChosen(i);
            setDiagnosis(undefined);
          }}
        />
        {fault && <p className="fault-explanation">{fault.explanation}</p>}
        <CircuitView
          circuit={circuit}
          values={sim.values}
          title={strings.fault.title}
          onToggleInput={(n) => sim.toggle(n)}
          scope={scope}
          {...(spec ? { focus: [faultPlace(spec)] } : {})}
          {...(data.canOpen ? { onScope: setScope } : {})}
        />
        <div className="fault-actions">
          {data.releaseAll && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                sim.releaseAll();
                if (chosen < 0) setReleasedHealthy(true);
              }}
            >
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
        {(own || noFault || closing) && (
          <div className="fault-outcomes">
            {own && <Prose markdown={own} />}
            {noFault && <Prose markdown={noFault} />}
            {closing && <Prose markdown={closing} />}
          </div>
        )}
      </div>
    );
  },
);
