// Copyright © 2026 Christopher Snow

// Module 0: the machine at work, for a learner with no terms yet. Module 8's finished machine
// (`datapath-full`) runs a program of the shop's own in the simulator, and this figure shows it as
// a beginner can read it: the program as numbered lines in plain words, each with the number the
// machine keeps it as; the line it runs next, marked; the numbers it keeps, by name, with the ones
// the last line changed marked; the shop's display and lamps; and the two rooms' readings, which
// the learner sets. One press runs one line (one edge of the machine); Run runs a line at a time
// slowly enough to watch, until the program stops or the learner pauses it.
//
// With a question, the learner commits to an answer before any value shows or the machine can
// run; the answer is read off a copy of the simulator, never off the reference. A wire stuck deep
// inside the machine may be chosen, and a drawing of the place it is stuck shown beside.
//
// The words are Module 0's own (strings.ts, `meet`), held to the term gate by a test.

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import {
  LAMP_NAMES,
  MEET_PLACES,
  MEET_STUCK,
  datapathState,
  meetAnswer,
  meetLines,
  meetMachine,
  meetStart,
  nextLine,
  numberOf,
  programText,
  registerWords,
  setShopInput,
  stuckAt,
  type MeetLine,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { FaultInjector, PredictionChallenge } from "@platform/primitives";
import type { Simulator, Word } from "@dd/sim";

import { CircuitView } from "../CircuitView";
import { format, useViewStrings, type MeetStrings, youChose } from "../strings";
import { withProps } from "./props";

/** How many lines Run makes before it gives up on a program that never stops. */
const RUN_LIMIT = 500;
/** The pause between two lines of a run, so the learner can watch the marks move. */
export const RUN_DELAY_MS = 450;

const Props = z.object({
  /** The program, in `docs/isa.md`'s assembly. */
  program: z.string().min(1),
  /** The shop's inputs: SENSORA and SENSORB in tenths of a degree. */
  inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** Lines run before the figure first shows. */
  lines: z.number().int().nonnegative().default(0),
  /** The rooms whose readings the learner may set. */
  readings: z.array(z.enum(["SENSORA", "SENSORB"])).default(["SENSORA", "SENSORB"]),
  /** The numbers the table shows, by number; by default those the program names. */
  shown: z.array(z.number().int().min(0).max(15)).optional(),
  /** The column of the numbers each line is kept as. */
  stored: z.boolean().default(false),
  /** Run, which runs a line at a time to the stop, and Pause. */
  run: z.boolean().default(true),
  /** Any button at all: false shows the machine paused, for a challenge that asks about it. */
  controls: z.boolean().default(true),
  /** Wires stuck deep inside, one at a time, each with its outcome, shown once it has run. */
  faults: z
    .array(
      z.object({
        /** The wire, by its key in the model's `MEET_STUCK`. */
        stuck: z.string(),
        label: z.string(),
        outcome: z.string().optional(),
      }),
    )
    .default([]),
  /**
   * The machine's drawing, opened at a place (a key of the model's `MEET_PLACES`), showing the
   * values of the moment the figure starts at.
   */
  drawing: z.string().optional(),
  /** Shown once the learner has run a line (or, with faults, once every fault has run). */
  outcomes: z.string().optional(),
  /** Shown once the program has stopped after the learner changed a room's reading. */
  outcomesChanged: z.string().optional(),
  /**
   * A box for the number in the line the program leaves as `{limit}`, which the learner may
   * change: the machine is the program with that number, and the "Kept as" column follows it.
   */
  limit: z.number().int().min(-2048).max(2047).optional(),
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  ask: z.enum(["lines", "display", "lamps", "changed", "next", "value"]).default("display"),
  register: z.number().int().min(0).max(15).default(0),
  /** The fault, by its index, the prediction's answer is read off: a stuck wire's effect. */
  askFault: z.number().int().nonnegative().optional(),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

/** The registers a program names, in order: the numbers worth showing a beginner. */
function namedRegisters(program: string): number[] {
  const found = new Set<number>();
  for (const m of program.matchAll(/\bR(\d{1,2})\b/g)) found.add(Number(m[1]));
  return [...found].filter((n) => n <= 15).sort((a, b) => a - b);
}

/** A line in the learner's words. */
export function lineText(t: MeetStrings, l: MeetLine): string {
  if (l.plain.key === "other") return l.text;
  const values = { ...l.plain.values };
  if (values["device"] !== undefined) values["device"] = t.devices[values["device"]] ?? "";
  return format(t.lines[l.plain.key], values);
}

/** A register's word as the figure writes it: signed, or "not set" while any digit is unknown. */
const numberText = (t: MeetStrings, w: Word | undefined) =>
  w === undefined || w.known !== (1n << 64n) - 1n ? t.notSet : (numberOf(w.value) ?? t.notSet);

export const MachineAtWork = withProps(
  Props,
  function MachineAtWork({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.meet;
    // The program as the machine runs it: a `{limit}` left in it is the learner's number.
    const [limit, setLimit] = useState(String(data.limit ?? ""));
    const [limitUsed, setLimitUsed] = useState(data.limit);
    const program = useMemo(
      () =>
        limitUsed === undefined
          ? data.program
          : programText(data.program).replace("{limit}", String(limitUsed)),
      [data.program, limitUsed],
    );
    const lines = useMemo(() => meetLines(program), [program]);
    const [faultAt, setFaultAt] = useState(-1);
    const fault = data.faults[faultAt];
    const built = useMemo(
      () =>
        meetMachine({
          program,
          ...(fault && MEET_STUCK[fault.stuck] ? { stuck: MEET_STUCK[fault.stuck] } : {}),
        }),
      [program, fault],
    );
    const { circuit } = built;
    const [readings, setReadings] = useState<Record<string, string>>(() =>
      Object.fromEntries(Object.entries(data.inputs).map(([k, v]) => [k, String(v)])),
    );
    const start = (inputs = readings) => meetStart(built, { program, inputs, lines: data.lines });
    const [sim, setSim] = useState<Simulator>(() => start());
    const [generation, setGeneration] = useState(0);
    const bump = () => setGeneration((g) => g + 1);
    const [before, setBefore] = useState<readonly Word[] | undefined>();
    const [stopped, setStopped] = useState(false);
    const [running, setRunning] = useState(false);
    const [gaveUp, setGaveUp] = useState(false);
    const [ran, setRan] = useState(false);
    // The stops the texts below the figure wait for: a run to the end, with each fault, and after
    // the learner changed a reading, so no text tells the learner what a run has not yet shown.
    const [ranFaults, setRanFaults] = useState<ReadonlySet<number>>(new Set());
    const [stoppedOnce, setStoppedOnce] = useState(false);
    const readingChanged = useRef(false);
    const [stoppedChanged, setStoppedChanged] = useState(false);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const live = useMemo(() => sim.snapshotValues(), [sim, generation]);
    // The drawing shows the machine as the figure starts it (paused before a line), whatever the
    // run has done since: later lines move the part's numbers on, to numbers the page does not
    // talk about, and the stop line reads a number nothing set (X).
    const paused = useMemo(() => sim.snapshotValues(), [sim]);
    const state = datapathState(circuit, live);

    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    // The answer is read off the figure as it first shows, whatever the learner has done since.
    // Worked out once the learner has committed, the only time it is shown: a run to the stop on
    // the gates costs about half a second, which every page would otherwise pay as it loads.
    const answer = useMemo(
      () =>
        asking && committed
          ? meetAnswer(
              meetStart(
                meetMachine({
                  program: data.program,
                  ...(data.askFault !== undefined &&
                  MEET_STUCK[data.faults[data.askFault]?.stuck ?? ""]
                    ? { stuck: MEET_STUCK[data.faults[data.askFault]?.stuck ?? ""] }
                    : {}),
                }),
                {
                  program: data.program,
                  inputs: data.inputs,
                  lines: data.lines,
                },
              ),
              data.ask,
              data.register,
            )
          : "",
      [
        asking,
        committed,
        data.program,
        data.inputs,
        data.lines,
        data.ask,
        data.register,
        data.askFault,
        data.faults,
      ],
    );
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");

    // A run moves a line at a time on a timer; a new start, a pause or leaving the page ends it.
    const runToken = useRef(0);
    useEffect(() => () => void (runToken.current += 1), []);
    const noteStop = () => {
      setStoppedOnce(true);
      if (readingChanged.current) setStoppedChanged(true);
      if (faultAt >= 0) setRanFaults((was) => new Set([...was, faultAt]));
    };
    /** One line: one edge of the machine. True when the machine has now stopped. */
    const edge = (): boolean => {
      const was = sim.snapshotValues();
      const halting = datapathState(circuit, was).halt === 1;
      sim.clockCycle("CLK");
      setBefore(was);
      if (halting) {
        setStopped(true);
        noteStop();
      }
      setRan(true);
      bump();
      return halting;
    };
    const step = () => {
      if (!stopped) edge();
    };
    const run = () => {
      const token = (runToken.current += 1);
      let count = 0;
      setRunning(true);
      setGaveUp(false);
      const next = () => {
        if (token !== runToken.current) return;
        if (edge()) return setRunning(false);
        count += 1;
        if (count >= RUN_LIMIT) {
          setGaveUp(true);
          return setRunning(false);
        }
        window.setTimeout(next, RUN_DELAY_MS);
      };
      next();
    };
    const pause = () => {
      runToken.current += 1;
      setRunning(false);
    };
    const restart = (from = built, inputs = readings) => {
      runToken.current += 1;
      setRunning(false);
      setSim(meetStart(from, { program, inputs, lines: data.lines }));
      setBefore(undefined);
      setStopped(false);
      setGaveUp(false);
      // A text about a run waits for the next run: Start again, or a new choice, clears it.
      setRanFaults(new Set());
      setStoppedOnce(false);
      setStoppedChanged(false);
      // A reading or line 5's number changed before Start again still counts as changed.
      readingChanged.current =
        limitUsed !== data.limit ||
        Object.entries(inputs).some(([k, v]) => String(data.inputs[k] ?? "") !== v);
      bump();
    };
    // A new fault is a new machine: start again on it.
    const firstBuild = useRef(built);
    useEffect(() => {
      if (firstBuild.current === built) return;
      firstBuild.current = built;
      restart(built);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [built]);
    const setReading = (name: string, text: string) => {
      setReadings((was) => ({ ...was, [name]: text }));
      // A room's reading changes while the machine runs, as a sensor's does; an unfinished
      // number ("-", "") waits until it is a number.
      if (/^-?\d+$/.test(text.trim())) {
        setShopInput(sim, name, Number(text));
        readingChanged.current = true;
        bump();
      }
    };
    const changeLimit = (text: string) => {
      setLimit(text);
      // A whole number that fits a line; anything else waits, as a half-typed reading does.
      if (/^-?\d+$/.test(text.trim()) && Math.abs(Number(text)) <= 2047) {
        setLimitUsed(Number(text));
        readingChanged.current = true;
      }
    };

    const drawing = data.drawing === undefined ? undefined : MEET_PLACES[data.drawing];
    const words = registerWords(circuit, live);
    const was = before ? registerWords(circuit, before) : [];
    const shown = data.shown ?? namedRegisters(programText(program));
    const next = nextLine(state);
    const lastRun = before ? nextLine(datapathState(circuit, before)) : undefined;
    const trapped = stopped && state.cause !== undefined && state.cause !== 0;
    const status = stopped
      ? format(trapped ? t.status.trapped : t.status.stopped, { line: lastRun ?? "" })
      : gaveUp
        ? format(t.status.gaveUp, { lines: RUN_LIMIT, line: next ?? "" })
        : running
          ? format(t.status.running, { line: next ?? "" })
          : next !== undefined
            ? format(t.status.next, { line: next })
            : "";

    return (
      <div className="explorer meet-figure" data-interactive={interactive.id}>
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
        {data.faults.length > 0 && (
          <FaultInjector
            name={`${interactive.id}-fault`}
            legend={t.faultLegend}
            noneLabel={t.healthy}
            faults={data.faults.map((f) => {
              const w = MEET_STUCK[f.stuck];
              return { ...stuckAt(w?.net ?? f.stuck, w?.value ?? 0), label: f.label };
            })}
            chosen={faultAt}
            onChoose={setFaultAt}
          />
        )}
        {data.limit !== undefined && (
          <fieldset className="meet-readings">
            <label className="meet-reading">
              <span>{t.limitLabel}</span>
              <input
                type="number"
                inputMode="numeric"
                min={-2048}
                max={2047}
                step={1}
                value={limit}
                disabled={!committed}
                onChange={(e) => changeLimit(e.target.value)}
              />
            </label>
          </fieldset>
        )}
        {data.readings.length > 0 && (
          <fieldset className="meet-readings">
            <legend>{t.readingsLegend}</legend>
            {data.readings.map((name) => (
              <label key={name} className="meet-reading">
                <span>{name === "SENSORA" ? t.roomA : t.roomB}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={-500}
                  max={500}
                  step={1}
                  value={readings[name] ?? "0"}
                  disabled={!committed}
                  onChange={(e) => setReading(name, e.target.value)}
                />
              </label>
            ))}
          </fieldset>
        )}
        <div className="truth-table-wrap">
          <table className="truth-table meet-program">
            <caption>{t.programCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.line}</th>
                <th scope="col">{t.does}</th>
                {data.stored && <th scope="col">{t.stored}</th>}
                <th scope="col">{t.marks}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => {
                const here = committed && (stopped ? l.line === lastRun : l.line === next);
                return (
                  <tr
                    key={l.line}
                    className={here ? "row-current" : ""}
                    aria-current={here ? "true" : undefined}
                  >
                    <th scope="row">{l.line}</th>
                    <td>{lineText(t, l)}</td>
                    {data.stored && <td className="memory-word">{l.stored}</td>}
                    <td className="cell-now">{here ? (stopped ? t.stoppedHere : t.next) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {committed && status && (
          <p role="status" className="datapath-status">
            {status}
          </p>
        )}
        {committed && data.controls && (
          <div className="explorer-actions">
            <button type="button" className="button" disabled={stopped || running} onClick={step}>
              {t.step}
            </button>
            {data.run &&
              (running ? (
                <button type="button" className="button secondary" onClick={pause}>
                  {t.pause}
                </button>
              ) : (
                <button type="button" className="button secondary" disabled={stopped} onClick={run}>
                  {t.run}
                </button>
              ))}
            <button type="button" className="button secondary" onClick={() => restart()}>
              {t.reset}
            </button>
          </div>
        )}
        <div className="datapath-tables" hidden={!committed}>
          <div className="truth-table-wrap">
            <table className="truth-table meet-numbers">
              <caption>{t.numbersCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.name}</th>
                  <th scope="col">{t.number}</th>
                  <th scope="col">{t.marks}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((k) => {
                  const now = numberText(t, words[k]);
                  const changed = before !== undefined && numberText(t, was[k]) !== now;
                  return (
                    <tr key={k} className={changed ? "row-current" : ""}>
                      <th scope="row">{`R${k}`}</th>
                      <td className="memory-word">{now}</td>
                      <td className="cell-now">{changed ? t.changed : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="truth-table-wrap">
            <table className="truth-table meet-shop">
              <caption>{t.shopCaption}</caption>
              <tbody>
                <tr>
                  <th scope="row">{t.display}</th>
                  <td className="memory-word">{numberOf(state.display) ?? t.notSet}</td>
                </tr>
                {LAMP_NAMES.map((name, k) => (
                  <tr key={name}>
                    <th scope="row">{format(t.lamp, { name })}</th>
                    <td>
                      {state.lamps === undefined
                        ? t.notSet
                        : (state.lamps >> k) & 1
                          ? t.lit
                          : t.dark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {drawing && (
          <CircuitView
            circuit={circuit}
            {...(committed ? { values: paused } : {})}
            title={t.drawingTitle}
            scope={drawing.scope ?? ""}
            table={false}
            writtenWidth={4}
            {...(drawing.focus ? { focus: drawing.focus } : {})}
          />
        )}
        {asking && committed && ran && data.explain && <Prose markdown={data.explain} />}
        {fault?.outcome && ranFaults.has(faultAt) && <Prose markdown={fault.outcome} />}
        {data.outcomes &&
          (data.faults.length === 0 ? stoppedOnce : ranFaults.size === data.faults.length) && (
            <Prose markdown={data.outcomes} />
          )}
        {data.outcomesChanged && stoppedChanged && <Prose markdown={data.outcomesChanged} />}
      </div>
    );
  },
);
