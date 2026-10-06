// Copyright © 2026 Christopher Snow

// Module 8: the datapath figure. The machine's datapath at one stage of its building, running in
// the simulator: the drawing opens one level at a time, every wire answers a press with its name
// and value, and beside it are the tables a lesson chooses (the program in the ROM with the PC's
// row marked, the registers with the ones the last edge wrote, the buses too wide to write on the
// drawing, the devices and the RAM's words). The learner clocks it an edge at a time, or runs it
// until it stops. Before the ROM exists, the lesson offers instructions to put on the IR bus, and
// the control signals it teaches are set by hand.
//
// With a question, the learner says what the next edge will do before the clock can be pressed;
// the answer is read off a copy of the simulator after a real edge. With steps, the last edge can
// be stepped through, the drawing and the tables showing each step of the settle, and the buses
// that changed at it named: an instruction run by stepping every change it makes.
//
// Every value is the simulator's: the views read nets and the memories' state nets, never the
// reference.

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import {
  applyFaults,
  buildDatapath,
  datapathRamWord,
  datapathState,
  edgeAnswer,
  giveInstruction,
  instructionHex,
  registerWords,
  startDatapath,
  stopReasonOf,
  type DatapathState,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@dd/lesson-runtime";
import { FaultInjector, PredictionChallenge, Stepper } from "@dd/primitives";
import { type Simulator, type Word } from "@dd/sim";

import { CircuitView, valueLabel } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { FaultSpec, toFault } from "./FaultLab";
import { withProps } from "./props";

/** How many edges "Run until it stops" makes before it gives up on a machine that never stops. */
const RUN_LIMIT = 500;
/** Edges a run makes between two redraws. */
const RUN_SLICE = 20;

const Inputs = z.record(z.string(), z.union([z.string(), z.number()]));

const Props = z.object({
  /** The stage's drawing: datapath-jobs, -constants, -fetch, -memory or -full. */
  libraryId: z.string(),
  /** The program in the ROM, in `docs/isa.md`'s assembly (the fetch stage on). */
  program: z.string().optional(),
  /** Registers' first words by name; every other register starts unknown. */
  registers: z.record(z.string(), z.string()).default({}),
  /** The shop's inputs and any other input the figure starts with. */
  inputs: Inputs.default({}),
  /** Before the fetch stage: the instructions the learner may put on the IR bus, the first given. */
  instructions: z
    .array(z.object({ label: z.string(), text: z.string(), set: Inputs.default({}) }))
    .optional(),
  /** Edges run before the figure first shows (after reset, from the fetch stage on). */
  edges: z.number().int().nonnegative().default(0),
  /** The registers the table shows, by number; all sixteen by default. */
  shown: z.array(z.number().int().min(0).max(15)).optional(),
  /** Buses too wide to write on the drawing, shown in a table by name. */
  buses: z.array(z.string()).default([]),
  /** RAM words the table shows, by address. */
  ram: z.array(z.number().int()).default([]),
  devices: z.boolean().default(false),
  /** A button that runs edges until the machine stops. */
  run: z.boolean().default(false),
  /** The last edge, step by step. */
  steps: z.boolean().default(false),
  canOpen: z.boolean().default(true),
  /** The whole drawing small above it, and zoom, when it is wider than its box (a trial). */
  overview: z.boolean().default(false),
  /** The parts, by name, the drawing opens on when it is wider than its box. */
  focus: z.array(z.string()).optional(),
  /** Faults the learner may put in, one at a time; the figure starts again with each. */
  faults: z.array(FaultSpec).default([]),
  /** Shown once the learner has made an edge, so the results do not answer the lead's question. */
  outcomes: z.string().optional(),
  /** A prediction of the next edge, asked before the clock can be pressed. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  ask: z.enum(["changed", "pc", "stop", "value"]).default("changed"),
  /** For `value`: the register asked about. */
  register: z.number().int().min(0).max(15).default(0),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

/** A register's word read signed, or X while any bit is unknown. */
function signedText(w: Word): string {
  if (w.known !== (1n << 64n) - 1n) return "X";
  return (w.value >= 1n << 63n ? w.value - (1n << 64n) : w.value).toString();
}

const hex3 = (v: bigint | number) => v.toString(16).toUpperCase().padStart(3, "0");

/** The reason a halted machine stops, as the strings key it: a cause, `stop` or `later`. */
function reasonKey(state: DatapathState): string | undefined {
  const r = stopReasonOf(state);
  if (!r) return undefined;
  return r.kind === "trap" ? r.cause.toString(16).toUpperCase() : r.kind;
}

/** The last edge: the values before it, and every step of its settle. */
interface Edge {
  readonly before: readonly Word[];
  readonly history: readonly (readonly Word[])[];
}

export const DatapathFigure = withProps(
  Props,
  function DatapathFigure({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.datapath;
    const healthy = useMemo(
      () =>
        buildDatapath({
          libraryId: data.libraryId,
          ...(data.program !== undefined ? { program: data.program } : {}),
          registers: data.registers,
        }),
      [data.libraryId, data.program, data.registers],
    );
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const [faultAt, setFaultAt] = useState(-1);
    const fault = faults[faultAt];
    const built = useMemo(
      () => (fault ? { ...healthy, circuit: applyFaults(healthy.circuit, [fault]) } : healthy),
      [healthy, fault],
    );
    const { circuit, program } = built;
    const start = (from = built) =>
      startDatapath(from, {
        inputs: data.inputs,
        ...(data.instructions?.[0] ? { instruction: data.instructions[0] } : {}),
        edges: data.edges,
      });
    const [sim, setSim] = useState<Simulator>(start);
    const [generation, setGeneration] = useState(0);
    const [chosen, setChosen] = useState(0);
    const [edge, setEdge] = useState<Edge | undefined>();
    const [stopped, setStopped] = useState(false);
    const [ran, setRan] = useState(false);
    // The faults the learner has run, each shown its own outcome only once it has been run.
    const [ranFaults, setRanFaults] = useState<ReadonlySet<number>>(new Set());
    // A run that reached 500 edges without stopping says so, rather than looking as if nothing ran.
    const [gaveUp, setGaveUp] = useState(false);
    const [step, setStep] = useState(Number.POSITIVE_INFINITY);
    const [scope, setScope] = useState("");
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const live = useMemo(() => sim.snapshotValues(), [sim, generation]);
    const state = datapathState(circuit, live);

    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    // The answer is worked out on the figure as it first shows, whatever the learner did since.
    const answer = useMemo(
      () => (asking ? edgeAnswer(start(healthy), data.ask, data.register) : ""),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [asking, healthy, data.ask, data.register],
    );
    // An option's label inside a sentence that ends with its own full stop: "taken." ends once.
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");

    const last = edge ? edge.history.length - 1 : 0;
    const at = Math.min(step, last);
    const stepping = data.steps && edge !== undefined;
    const values = stepping ? (edge.history[at] ?? live) : live;
    const shownState = stepping ? datapathState(circuit, values) : state;
    const bump = () => setGeneration((g) => g + 1);

    const noteRun = () => {
      if (faults.length === 0 || faultAt >= 0) setRan(true);
      if (faultAt >= 0) setRanFaults((was) => new Set([...was, faultAt]));
    };
    const clock = () => {
      if (stopped) return;
      const before = sim.snapshotValues();
      const halting = datapathState(circuit, before).halt === 1;
      const { high } = sim.clockCycle("CLK");
      setEdge({ before, history: high.history });
      setStep(Number.POSITIVE_INFINITY);
      if (halting) setStopped(true);
      noteRun();
      bump();
    };
    // A run goes in slices of edges with a redraw between them, so a machine that never stops
    // shows its edges climbing instead of freezing the page; a new start cancels it.
    const [running, setRunning] = useState<number | undefined>();
    const runToken = useRef(0);
    useEffect(() => () => void (runToken.current += 1), []);
    const run = () => {
      const token = (runToken.current += 1);
      let k = 0;
      const slice = () => {
        if (token !== runToken.current) return;
        let before = sim.snapshotValues();
        for (const end = Math.min(k + RUN_SLICE, RUN_LIMIT); k < end; k++) {
          before = sim.snapshotValues();
          const halting = datapathState(circuit, before).halt === 1;
          const { high } = sim.clockCycle("CLK");
          if (halting) {
            setEdge({ before, history: high.history });
            setStopped(true);
            finish(false);
            return;
          }
          if (k + 1 === end) setEdge({ before, history: high.history });
        }
        if (k >= RUN_LIMIT) return finish(true);
        setRunning(k);
        bump();
        window.setTimeout(slice, 0);
      };
      const finish = (gaveUp: boolean) => {
        setRunning(undefined);
        setGaveUp(gaveUp);
        setStep(Number.POSITIVE_INFINITY);
        noteRun();
        bump();
      };
      setRunning(0);
      slice();
    };
    const restart = (from: typeof built) => {
      runToken.current += 1;
      setRunning(undefined);
      setSim(start(from));
      setChosen(0);
      setEdge(undefined);
      setStopped(false);
      setGaveUp(false);
      bump();
    };
    const reset = () => {
      runToken.current += 1;
      setRunning(undefined);
      setSim(start());
      setChosen(0);
      setEdge(undefined);
      setStopped(false);
      setGaveUp(false);
      bump();
    };
    const choose = (k: number) => {
      const given = data.instructions?.[k];
      if (!given) return;
      setChosen(k);
      giveInstruction(sim, circuit, given);
      setEdge(undefined);
      bump();
    };
    // The clock's pin is the clock button's twin: a press is one edge.
    const toggle = (name: string) => {
      if (name === "CLK") return clock();
      const w = sim.read(name);
      sim.setInput(name, { width: 1, value: w.value === 1n ? 0n : 1n, known: 1n });
      sim.settle();
      setEdge(undefined);
      bump();
    };

    const words = registerWords(circuit, values);
    // The register the last edge wrote, read off the register file's write enable and write
    // address just before it: a write of the value a register already held is still a write.
    const writtenAt = useMemo(() => {
      if (!edge) return undefined;
      const file = circuit.composites.find((c) => c.path === "registers");
      const we = file?.inputs["WE"];
      const wa = file?.inputs["WA"];
      if (we === undefined || wa === undefined) return undefined;
      const enable = edge.before[we];
      const address = edge.before[wa];
      if (
        !enable ||
        !address ||
        enable.known !== 1n ||
        address.known !== (1n << BigInt(address.width)) - 1n
      )
        return undefined;
      return enable.value === 1n ? Number(address.value) : -1;
    }, [edge, circuit]);
    const before = edge ? registerWords(circuit, edge.before) : [];
    const shown = data.shown ?? Array.from({ length: 16 }, (_, k) => k);
    const netValue = (name: string) => {
      const id = circuit.nets.find((n) => n.name === name)?.id;
      return id === undefined ? undefined : values[id];
    };
    const changedAt = (k: number): string[] => {
      if (!edge || k === 0) return [];
      const now = edge.history[k];
      const was = edge.history[k - 1];
      if (!now || !was) return [];
      return circuit.nets
        .filter((n) => !n.name.includes("/"))
        .filter((n) => valueLabel(now[n.id]) !== valueLabel(was[n.id]))
        .map((n) => n.name);
    };
    const reason = reasonKey(state);
    const status = stopped
      ? format(t.stopped, { reason: t.reasons[reason ?? ""] ?? "" })
      : running !== undefined
        ? format(t.runningEdges, { edges: running })
        : gaveUp
          ? format(t.gaveUp, { edges: RUN_LIMIT, pc: hex3(state.pc ?? 0) })
          : reason !== undefined
            ? format(t.halting, { reason: t.reasons[reason] ?? reason })
            : // While the learner steps through an edge, the PC the steps show, not the edge's end.
              shownState.pc !== undefined
              ? format(t.running, { pc: hex3(shownState.pc) })
              : "";

    return (
      <div className="explorer datapath-figure" data-interactive={interactive.id}>
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
                    {format(strings.prediction.youSaid, { choice: optionLabel(stored.choice) })}{" "}
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
        {data.instructions && (
          <fieldset className="carry-cases">
            <legend>{t.instructions}</legend>
            {data.instructions.map((given, k) => (
              <label key={given.label} className="fault-choice">
                <input
                  type="radio"
                  name={`${interactive.id}-instruction`}
                  checked={chosen === k}
                  onChange={() => choose(k)}
                />
                <span>{given.label}</span>
              </label>
            ))}
          </fieldset>
        )}
        {faults.length > 0 && (
          <FaultInjector
            name={`${interactive.id}-fault`}
            legend={strings.fault.choose}
            noneLabel={strings.fault.healthy}
            faults={faults}
            chosen={faultAt}
            onChoose={(i) => {
              setFaultAt(i);
              const f = faults[i];
              restart(f ? { ...healthy, circuit: applyFaults(healthy.circuit, [f]) } : healthy);
            }}
          />
        )}
        <CircuitView
          circuit={circuit}
          {...(committed ? { values } : {})}
          title={strings.explorer.title}
          // Before a prediction is committed the pins clock nothing: an edge would answer it.
          onToggleInput={committed ? toggle : () => undefined}
          scope={scope}
          table={false}
          writtenWidth={4}
          overview={data.overview}
          {...(data.focus ? { focus: data.focus } : {})}
          {...(data.canOpen ? { onScope: setScope } : {})}
        />
        {committed && status && (
          <p role="status" className="datapath-status">
            {status}
          </p>
        )}
        {committed && (
          <div className="explorer-actions">
            <button
              type="button"
              className="button"
              disabled={stopped || running !== undefined}
              onClick={clock}
            >
              {t.clock}
            </button>
            {data.run && (
              <button
                type="button"
                className="button secondary"
                disabled={stopped || running !== undefined}
                onClick={run}
              >
                {t.run}
              </button>
            )}
            <button type="button" className="button secondary" onClick={reset}>
              {t.reset}
            </button>
          </div>
        )}
        {/* The why comes after the learner's own edge has shown the what: before it, the
            explanation would describe an edge the drawing has not made. */}
        {asking && committed && ran && data.explain && <Prose markdown={data.explain} />}
        {data.steps && (
          <section className="datapath-steps" aria-label={t.stepsHeading}>
            <p className="datapath-steps-heading">{t.stepsHeading}</p>
            {edge ? (
              <Stepper
                step={at}
                last={last}
                onStep={setStep}
                label={strings.explorer.step}
                position={format(strings.explorer.stepOf, { k: at, n: last })}
                buttons={{ back: t.back, next: t.next, end: t.end }}
                status={
                  at === 0
                    ? t.stepNothing
                    : changedAt(at).length > 0
                      ? format(t.stepChanged, { nets: changedAt(at).join(", ") })
                      : t.stepInside
                }
              />
            ) : (
              <p>{t.stepsNone}</p>
            )}
          </section>
        )}
        {/* Before a prediction is committed the figure shows the circuit, not its values: the
            tables and the drawing's values would answer the question. */}
        <div className="datapath-tables" hidden={!committed}>
          {program && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{t.programCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.address}</th>
                    <th scope="col">{t.instruction}</th>
                    <th scope="col">{t.transfer}</th>
                    <th scope="col">{t.marks}</th>
                  </tr>
                </thead>
                <tbody>
                  {program.lines
                    .filter((l) => l.instruction !== undefined)
                    .map((l) => {
                      const current = shownState.pc === BigInt(l.address);
                      return (
                        <tr
                          key={l.address}
                          className={current ? "row-current" : ""}
                          aria-current={current ? "true" : undefined}
                        >
                          <th scope="row">{hex3(l.address)}</th>
                          <td className="memory-word">{instructionHex(l.instruction ?? 0)}</td>
                          <td className="memory-word">{l.text}</td>
                          <td className="cell-now">{current ? t.atPc : ""}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table">
              <caption>{t.registersCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.register}</th>
                  <th scope="col">{t.word}</th>
                  <th scope="col">{t.signed}</th>
                  <th scope="col">{t.marks}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((k) => {
                  const w = words[k];
                  if (!w) return null;
                  const was = before[k];
                  const written =
                    writtenAt !== undefined
                      ? writtenAt === k
                      : was !== undefined && valueLabel(was) !== valueLabel(w);
                  return (
                    <tr key={k} className={written ? "row-current" : ""}>
                      <th scope="row">{`R${k}`}</th>
                      <td className="memory-word">{valueLabel(w)}</td>
                      <td className="memory-word">{signedText(w)}</td>
                      <td className="cell-now">{written ? t.written : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.buses.length > 0 && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{t.busesCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.bus}</th>
                    <th scope="col">{t.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.buses.map((name) => (
                    <tr key={name}>
                      <th scope="row">{name}</th>
                      <td className="memory-word">{valueLabel(netValue(name))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.devices && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{t.devicesCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.device}</th>
                    <th scope="col">{t.value}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{t.display}</th>
                    <td className="memory-word">
                      {shownState.display === undefined
                        ? "X"
                        : (shownState.display >= 1n << 63n
                            ? shownState.display - (1n << 64n)
                            : shownState.display
                          ).toString()}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">{t.lamps}</th>
                    <td className="memory-word">
                      {shownState.lamps === undefined
                        ? "XXX"
                        : shownState.lamps.toString(2).padStart(3, "0")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {data.ram.length > 0 && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{t.ramCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.address}</th>
                    <th scope="col">{t.word}</th>
                    <th scope="col">{t.signed}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ram.map((a) => {
                    const v = datapathRamWord(shownState, a);
                    return (
                      <tr key={a}>
                        <th scope="row">{hex3(a)}</th>
                        <td className="memory-word">
                          {v === undefined
                            ? "XXXXXXXXXXXXXXXX"
                            : v.toString(16).toUpperCase().padStart(16, "0")}
                        </td>
                        <td className="memory-word">
                          {v === undefined
                            ? "X"
                            : (v >= 1n << 63n ? v - (1n << 64n) : v).toString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* What the edges showed, in the lesson's words: below the figure, and only once the
            learner has made them, so the text does not answer what the lead asks them to find. */}
        {faultAt >= 0 && ranFaults.has(faultAt) && data.faults[faultAt]?.outcome && (
          <Prose markdown={data.faults[faultAt]?.outcome ?? ""} />
        )}
        {(faults.length === 0 ? ran : ranFaults.size === faults.length) && data.outcomes && (
          <Prose markdown={data.outcomes} />
        )}
      </div>
    );
  },
);
