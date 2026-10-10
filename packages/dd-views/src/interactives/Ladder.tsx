// Copyright © 2026 Christopher Snow

// Module 0: the ladder, one level at a time. The finished machine runs a program to a line and
// pauses there; the figure then goes down from that line of the program to the voltage on one
// wire, one real level at a time: the machine's parts, the part that adds opened, a group of its
// slices, one slice, the smallest parts inside it, and one wire. Every level is the real circuit
// opened as the course opens every block (`CircuitView` at a scope), and every level shows the
// same number in its own form: the number the part gives at the top, the 1s and 0s on its wires
// further down, and the level of one wire at the bottom. Each level names the module that builds
// it.
//
// With a question, the learner commits before any value shows; the answer is read off the
// simulator (`meetAnswer`, "ones").

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  MEET_PLACES,
  meetAnswer,
  meetLines,
  meetMachine,
  meetNet,
  meetStart,
  nextLine,
  datapathState,
  numberOf,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";
import type { Word } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings, youChose } from "../strings";
import { lineText } from "./MachineAtWork";
import { withProps } from "./props";

const Level = z.object({
  title: z.string().min(1),
  /** What this level shows, in the lesson's words. */
  caption: z.string().min(1),
  /** The module that builds this level, and its name on the cover. */
  module: z.number().int().min(0),
  moduleName: z.string().min(1),
  /** Where the machine is opened at this level, by its key in the model's `MEET_PLACES`. */
  place: z.string().min(1),
});

const Props = z.object({
  program: z.string().min(1),
  inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** Lines run before the pause: the ladder follows the line the machine runs next. */
  lines: z.number().int().nonnegative().default(0),
  levels: z.array(Level).min(2),
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /** Shown once the learner has reached the bottom level. */
  outcomes: z.string().optional(),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

/** A word's 1s and 0s, in groups of eight from the right, so a long row wraps between groups. */
export function digitsText(w: Word | undefined): string {
  if (!w) return "";
  let out = "";
  for (let k = w.width - 1; k >= 0; k--) {
    const known = (w.known >> BigInt(k)) & 1n;
    out += known ? String((w.value >> BigInt(k)) & 1n) : "X";
    if (k > 0 && k % 8 === 0) out += " ";
  }
  return out;
}

export const Ladder = withProps(
  Props,
  function Ladder({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.meet;
    const built = useMemo(() => meetMachine({ program: data.program }), [data.program]);
    const sim = useMemo(
      () => meetStart(built, { program: data.program, inputs: data.inputs, lines: data.lines }),
      [built, data.program, data.inputs, data.lines],
    );
    const values = useMemo(() => sim.snapshotValues(), [sim]);
    const [at, setAt] = useState(0);
    const [reached, setReached] = useState(false);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(
      () => (asking && committed ? meetAnswer(sim, "ones") : ""),
      [asking, committed, sim],
    );
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");

    const level = data.levels[at] ?? data.levels[0];
    const place = level ? MEET_PLACES[level.place] : undefined;
    const last = data.levels.length - 1;
    const go = (k: number) => {
      const to = Math.max(0, Math.min(last, k));
      setAt(to);
      if (to === last) setReached(true);
    };
    const line = meetLines(data.program).find(
      (l) => l.line === nextLine(datapathState(built.circuit, values)),
    );
    const w = place ? meetNet(sim, place.net) : undefined;
    const reading =
      !place || !w
        ? ""
        : place.show === "number"
          ? format(t.ladder.number, { value: numberOf(w.value) ?? "X" })
          : place.show === "digits"
            ? format(t.ladder.digits, { digits: digitsText(w) })
            : w.known !== 1n
              ? ""
              : w.value === 1n
                ? t.ladder.high
                : t.ladder.low;

    return (
      <div className="explorer ladder-figure" data-interactive={interactive.id}>
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
            {committed && data.explain && <Prose markdown={data.explain} />}
          </div>
        )}
        {line && (
          <p className="ladder-line">
            {format(t.ladder.paused, { line: line.line, text: lineText(t, line) })}
          </p>
        )}
        <nav className="ladder-steps" aria-label={t.ladder.levelsName}>
          <button
            type="button"
            className="button secondary"
            disabled={at === 0}
            onClick={() => go(at - 1)}
          >
            {t.ladder.up}
          </button>
          <span className="ladder-position" aria-live="polite">
            {format(t.ladder.position, { k: at + 1, n: data.levels.length })}
          </span>
          <button
            type="button"
            className="button"
            disabled={at === last}
            onClick={() => go(at + 1)}
          >
            {t.ladder.down}
          </button>
        </nav>
        {level && (
          <section className="ladder-level" aria-label={level.title}>
            <h4 className="ladder-title">{level.title}</h4>
            <p className="ladder-module">
              {format(t.ladder.builtIn, { module: level.module, name: level.moduleName })}
            </p>
            <Prose markdown={level.caption} />
            {committed && reading && (
              <p role="status" className="ladder-reading">
                {reading}
              </p>
            )}
            {place?.scope !== undefined && (
              <CircuitView
                circuit={built.circuit}
                {...(committed ? { values } : {})}
                title={t.ladder.drawingTitle}
                scope={place.scope}
                table={false}
                writtenWidth={4}
                {...(place.focus ? { focus: place.focus } : {})}
                {...(place.highlight ? { highlight: place.highlight } : {})}
              />
            )}
          </section>
        )}
        {reached && data.outcomes && <Prose markdown={data.outcomes} />}
      </div>
    );
  },
);
