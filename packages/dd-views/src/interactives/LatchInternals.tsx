// Copyright © 2026 Christopher Snow

// Inside a flip-flop, in time. A scripted run in the delay model; a cursor moves through it,
// event by event or freely, and the drawing shows every net's value at that moment, the master
// and slave open to look inside. The words for each phase come from the lesson's data.

import { useMemo, useState } from "react";
import { z } from "zod";

import { dFlipFlopCircuit, dLatchCircuit, libraryCircuit, srLatchCircuit } from "@dd/dd-model";
import { Prose, type InteractiveProps } from "@dd/lesson-runtime";
import { Simulator, bit0, bit1, type Circuit } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { TimingDiagram } from "../TimingDiagram";
import { valuesAt } from "../traces";
import { withProps } from "./props";

const Props = z.object({
  libraryId: z.string().default("dff"),
  delay: z.number().positive().default(10),
  script: z
    .array(
      z.object({
        time: z.number().nonnegative(),
        input: z.string(),
        value: z.union([z.literal(0), z.literal(1)]),
      }),
    )
    .min(1),
  until: z.number().positive(),
  signals: z
    .array(z.union([z.string(), z.object({ net: z.string(), label: z.string() })]))
    .optional(),
  scope: z.string().default(""),
  phases: z.array(z.object({ from: z.number(), to: z.number(), text: z.string() })).default([]),
});

/** A library circuit with every gate at the given delay. */
export function delayedCircuit(libraryId: string, delay: number): Circuit {
  switch (libraryId) {
    case "dff":
      return dFlipFlopCircuit({ delay });
    case "d-latch":
      return dLatchCircuit(delay);
    case "sr-latch":
      return srLatchCircuit(delay);
    default:
      return libraryCircuit(libraryId);
  }
}

export const LatchInternals = withProps(
  Props,
  function LatchInternals({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const { circuit, sim, times } = useMemo(() => {
      const circuit = delayedCircuit(data.libraryId, data.delay);
      const sim = new Simulator(circuit, { timeModel: "delay" });
      for (const s of data.script) {
        const value = s.value === 1 ? bit1 : bit0;
        if (s.time === 0) sim.setInput(s.input, value);
        else sim.setInputAt(s.input, value, s.time);
      }
      sim.run(data.until);
      const times = [...new Set([0, ...sim.trace.events.map((e) => e.time), data.until])].sort(
        (a, b) => a - b,
      );
      return { circuit, sim, times };
    }, [data]);
    const [cursor, setCursor] = useState(0);
    const [scope, setScope] = useState(data.scope);
    const values = useMemo(
      () => valuesAt(circuit, sim.trace, cursor),
      [circuit, sim.trace, cursor],
    );
    const phase = data.phases.find((p) => cursor >= p.from && cursor < p.to);
    const next = times.find((t) => t > cursor);
    const prev = [...times].reverse().find((t) => t < cursor);

    return (
      <div className="internals" data-interactive={interactive.id}>
        <TimingDiagram
          circuit={circuit}
          trace={sim.trace}
          to={data.until}
          cursor={cursor}
          onCursor={setCursor}
          title={strings.internals.diagramTitle}
          {...(data.signals ? { signals: data.signals } : {})}
        />
        <div className="internals-actions">
          <button
            type="button"
            className="button secondary"
            disabled={prev === undefined}
            onClick={() => prev !== undefined && setCursor(prev)}
          >
            {strings.internals.previous}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={next === undefined}
            onClick={() => next !== undefined && setCursor(next)}
          >
            {strings.internals.next}
          </button>
          <span className="internals-time">{format(strings.internals.time, { time: cursor })}</span>
        </div>
        {phase && <Prose markdown={phase.text} className="internals-phase" />}
        <CircuitView
          circuit={circuit}
          values={values}
          title={strings.internals.title}
          scope={scope}
          onScope={setScope}
        />
      </div>
    );
  },
);
