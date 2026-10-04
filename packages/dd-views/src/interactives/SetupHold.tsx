// Move D across the clock edge and watch what the flip-flop captures. Inside the window where
// the gate model's answer is not to be trusted, the overlay can draw what a real flip-flop might
// do; every draw is recorded with its seed, and a replay with the same seed gives the same
// picture. This is the one place in the course where two runs can differ, and the page says so.

import { useMemo } from "react";
import { z } from "zod";

import { dFlipFlopCircuit } from "@dd/dd-model";
import { useSlot, type InteractiveProps } from "@dd/lesson-runtime";
import {
  Simulator,
  applyMetastabilityOverlay,
  bit0,
  bit1,
  formatWord,
  type OverlayResult,
} from "@dd/sim";

import { format, useViewStrings } from "../strings";
import { TimingDiagram, type Shade } from "../TimingDiagram";
import { withProps } from "./props";

const Props = z.object({
  delay: z.number().positive().default(10),
  edgeAt: z.number().positive().default(1000),
  offsets: z.tuple([z.number(), z.number()]).default([-80, 40]),
  window: z.tuple([z.number(), z.number()]).default([-35, 0]),
  settleBetween: z.tuple([z.number(), z.number()]).default([5, 60]),
  undecidedFrom: z.number().default(20),
  show: z.tuple([z.number(), z.number()]).default([-120, 160]),
});
type Data = z.infer<typeof Props>;

export interface Draw {
  readonly seed: number;
  readonly offset: number;
  readonly from: number;
  readonly settlesAt: number;
  readonly settlesTo: 0 | 1;
}

interface Stored {
  readonly offset: number;
  readonly draws: readonly Draw[];
}

export interface Experiment {
  readonly sim: Simulator;
  readonly qEvents: { time: number; value: string }[];
  readonly overlay?: OverlayResult;
}

/** One run: Q known 0, then D rises `offset` units from the edge. With a seed, the overlay draws. */
export function experiment(data: Data, offset: number, seed?: number): Experiment {
  const circuit = dFlipFlopCircuit({ delay: data.delay });
  const sim = new Simulator(circuit, { timeModel: "delay" });
  sim.setInput("D", bit0);
  sim.setInput("CLK", bit0);
  sim.setInputAt("CLK", bit1, 100);
  sim.setInputAt("CLK", bit0, 200);
  sim.setInputAt("D", bit1, data.edgeAt + offset);
  sim.setInputAt("CLK", bit1, data.edgeAt);
  sim.setInputAt("CLK", bit0, data.edgeAt + 100);
  let overlay: OverlayResult | undefined;
  if (seed !== undefined) {
    sim.run(data.edgeAt + data.undecidedFrom);
    overlay = applyMetastabilityOverlay(sim, {
      output: "Q",
      seed,
      settleBetween: data.settleBetween,
      from: data.edgeAt + data.undecidedFrom,
    });
  }
  sim.run(data.edgeAt + data.show[1]);
  const q = sim.resolve("Q");
  const qEvents = sim.trace.events
    .filter((e) => e.net === q && e.time >= data.edgeAt)
    .map((e) => ({ time: e.time, value: formatWord(e.value) }));
  return { sim, qEvents, ...(overlay ? { overlay } : {}) };
}

export const SetupHold = withProps(
  Props,
  function SetupHold({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const offset = stored?.offset ?? data.offsets[0];
    const draws = stored?.draws ?? [];
    const inWindow = offset >= data.window[0] && offset <= data.window[1];
    const lastDraw = draws.find((d) => d.offset === offset);
    const result = useMemo(
      () => experiment(data, offset, lastDraw?.seed),
      [data, offset, lastDraw?.seed],
    );
    const circuit = result.sim.circuit;

    const describe = (): string => {
      if (result.overlay?.applied && lastDraw) {
        return format(strings.setupHold.drawn, {
          seed: lastDraw.seed,
          from: lastDraw.from,
          value: lastDraw.settlesTo,
          time: lastDraw.settlesAt,
        });
      }
      const events = result.qEvents;
      if (events.length === 0) return strings.setupHold.ignored;
      const last = events[events.length - 1] as { time: number; value: string };
      if (last.time === data.edgeAt + 3 * data.delay)
        return format(strings.setupHold.captured, { value: last.value, time: last.time });
      return format(strings.setupHold.late, { time: last.time, value: last.value });
    };

    const draw = () => {
      const seed = draws.length + 1;
      const r = experiment(data, offset, seed);
      if (
        !r.overlay?.applied ||
        r.overlay.settlesAt === undefined ||
        r.overlay.settlesTo === undefined
      )
        return;
      const next: Draw = {
        seed,
        offset,
        from: r.overlay.from ?? data.edgeAt + data.undecidedFrom,
        settlesAt: r.overlay.settlesAt,
        settlesTo: r.overlay.settlesTo,
      };
      setStored({ offset, draws: [...draws.filter((d) => d.offset !== offset), next] });
    };
    const replay = (d: Draw) =>
      setStored({ offset: d.offset, draws: [...draws.filter((x) => x.offset !== d.offset), d] });

    const shades: Shade[] = [
      {
        from: data.edgeAt + data.window[0],
        to: data.edgeAt + data.window[1],
        label: strings.setupHold.window,
        kind: "setup",
      },
    ];
    const relation = offset < 0 ? strings.setupHold.before : strings.setupHold.after;

    return (
      <div className="setup-hold" data-interactive={interactive.id} data-offset={offset}>
        <label className="setup-hold-offset">
          <span>{format(strings.setupHold.offset, { offset: Math.abs(offset), relation })}</span>
          <input
            type="range"
            min={data.offsets[0]}
            max={data.offsets[1]}
            step={5}
            value={offset}
            onChange={(e) => setStored({ offset: Number(e.target.value), draws })}
          />
        </label>
        <TimingDiagram
          circuit={circuit}
          trace={result.sim.trace}
          signals={["CLK", "D", "Q"]}
          from={data.edgeAt + data.show[0]}
          to={data.edgeAt + data.show[1]}
          shades={shades}
          title={strings.setupHold.diagramTitle}
          table={false}
        />
        <p role="status" className="setup-hold-result">
          {describe()}
        </p>
        {inWindow && (
          <div className="setup-hold-overlay">
            <p>{strings.setupHold.inWindow}</p>
            <button type="button" className="button primary" onClick={draw}>
              {strings.setupHold.draw}
            </button>
          </div>
        )}
        {draws.length > 0 && (
          <div className="setup-hold-draws">
            <h4>{strings.setupHold.draws}</h4>
            <ul>
              {draws.map((d) => (
                <li key={d.seed}>
                  {format(strings.setupHold.drawn, {
                    seed: d.seed,
                    from: d.from,
                    value: d.settlesTo,
                    time: d.settlesAt,
                  })}{" "}
                  <button type="button" className="button secondary" onClick={() => replay(d)}>
                    {format(strings.setupHold.replay, { seed: d.seed })}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
);
