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

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  CONTROL_STATES,
  applyFaults,
  buildDatapath,
  controllerMachine,
  edgeView,
  rowFor,
  type EdgeView,
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
import { type Circuit, type Simulator, type Word } from "@dd/sim";

import { CircuitView, valueLabel } from "../CircuitView";
import { TimingDiagram } from "../TimingDiagram";
import { MicroOps, SignalsTable } from "./ControlViews";
import { StateDiagram } from "./StateMachine";
import { format, useViewStrings } from "../strings";
import { FaultSpec, toFault } from "./FaultLab";
import { withProps } from "./props";

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
  /** Faults the learner may put in, one at a time; the figure starts again with each. */
  faults: z.array(FaultSpec).default([]),
  /** Shown once the learner has made an edge, so the results do not answer the lead's question. */
  outcomes: z.string().optional(),
  /** A prediction of the next edge, asked before the clock can be pressed. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  ask: z.enum(["changed", "pc", "stop", "value", "edges", "took"]).default("changed"),
  /** For `value`: the register asked about. */
  register: z.number().int().min(0).max(15).default(0),
  /**
   * Module 9, for the machine of several edges: the instruction's micro-operations, edge by edge;
   * the control signals at the next edge, by name; the controller's state diagram with its state
   * marked; and a timing diagram of the run, by net name.
   */
  microOps: z.boolean().default(false),
  signals: z.array(z.string()).default([]),
  states: z.boolean().default(false),
  timing: z.array(z.string()).default([]),
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
    const [step, setStep] = useState(Number.POSITIVE_INFINITY);
    const [scope, setScope] = useState("");
    // Module 9: the edges of the instruction in progress, as their views read them before each.
    const edges = built.stage === "edges";
    const [past, setPast] = useState<{ views: EdgeView[]; ended: boolean }>({
      views: [],
      ended: false,
    });
    const record = (before: readonly Word[], from: typeof past) => {
      if (!edges) return from;
      const v = edgeView(circuit, before);
      return { views: from.ended ? [v] : [...from.views, v], ended: v.ends };
    };
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
    const optionLabel = (v: string) => data.options?.find((o) => o.value === v)?.label ?? v;

    const last = edge ? edge.history.length - 1 : 0;
    const at = Math.min(step, last);
    const stepping = data.steps && edge !== undefined;
    const values = stepping ? (edge.history[at] ?? live) : live;
    const shownState = stepping ? datapathState(circuit, values) : state;
    const bump = () => setGeneration((g) => g + 1);

    const clock = () => {
      if (stopped) return;
      const before = sim.snapshotValues();
      const halting = datapathState(circuit, before).halt === 1;
      const { high } = sim.clockCycle("CLK");
      setEdge({ before, history: high.history });
      setPast(record(before, past));
      setStep(Number.POSITIVE_INFINITY);
      if (halting) setStopped(true);
      if (faults.length === 0 || faultAt >= 0) setRan(true);
      bump();
    };
    const run = () => {
      let before = sim.snapshotValues();
      let kept = past;
      for (let k = 0; k < 500; k++) {
        before = sim.snapshotValues();
        const halting = datapathState(circuit, before).halt === 1;
        const { high } = sim.clockCycle("CLK");
        kept = record(before, kept);
        setEdge({ before, history: high.history });
        if (halting) {
          setStopped(true);
          break;
        }
      }
      setPast(kept);
      setStep(Number.POSITIVE_INFINITY);
      if (faults.length === 0 || faultAt >= 0) setRan(true);
      bump();
    };
    const restart = (from: typeof built) => {
      setSim(start(from));
      setPast({ views: [], ended: false });
      setChosen(0);
      setEdge(undefined);
      setStopped(false);
      bump();
    };
    const reset = () => {
      setSim(start());
      setPast({ views: [], ended: false });
      setChosen(0);
      setEdge(undefined);
      setStopped(false);
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
      : reason !== undefined
        ? format(t.halting, { reason: t.reasons[reason] ?? reason })
        : state.pc !== undefined
          ? format(t.running, { pc: hex3(state.pc) })
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
          onToggleInput={toggle}
          scope={scope}
          table={false}
          writtenWidth={4}
          {...(data.canOpen ? { onScope: setScope } : {})}
        />
        {committed && status && (
          <p role="status" className="datapath-status">
            {status}
          </p>
        )}
        {committed && (
          <div className="explorer-actions">
            <button type="button" className="button" disabled={stopped} onClick={clock}>
              {t.clock}
            </button>
            {data.run && (
              <button type="button" className="button secondary" disabled={stopped} onClick={run}>
                {t.run}
              </button>
            )}
            <button type="button" className="button secondary" onClick={reset}>
              {t.reset}
            </button>
          </div>
        )}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
        {ran && data.outcomes && <Prose markdown={data.outcomes} />}
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
                    : format(t.stepChanged, { nets: changedAt(at).join(", ") })
                }
              />
            ) : (
              <p>{t.stepsNone}</p>
            )}
          </section>
        )}
        {edges && committed && (
          <ControlPanes
            data={data}
            circuit={circuit}
            values={live}
            sim={sim}
            past={past}
            stopped={stopped}
            callThroughRegister={built.callThroughRegister ?? false}
          />
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
                  const written = was !== undefined && valueLabel(was) !== valueLabel(w);
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
      </div>
    );
  },
);

/**
 * Module 9: the views of the machine of several edges beside its drawing, all read from the same
 * simulator: the instruction's edges and their micro-operations, the control signals at the next
 * edge, the controller's state diagram with the state it is in and the move the next edge makes,
 * and a timing diagram of the run so far.
 */
function ControlPanes({
  data,
  circuit,
  values,
  sim,
  past,
  stopped,
  callThroughRegister,
}: {
  data: Data;
  circuit: Circuit;
  values: readonly Word[];
  sim: Simulator;
  past: { views: readonly EdgeView[]; ended: boolean };
  stopped: boolean;
  callThroughRegister: boolean;
}) {
  const strings = useViewStrings();
  const t = strings.control;
  const next = edgeView(circuit, values);
  const machine = useMemo(() => controllerMachine({ callThroughRegister }), [callThroughRegister]);
  const inputs: Record<string, 0 | 1> = Object.fromEntries(
    machine.inputs.map((n) => [n, next.signals[n] === 1 ? 1 : 0]),
  );
  const applies = next.state && !stopped ? rowFor(machine, next.state, inputs) : undefined;
  const names = Object.fromEntries(
    Object.entries(CONTROL_STATES).map(([name, code]) => [code, name]),
  );
  return (
    <div className="control-panes">
      {data.microOps && (
        <MicroOps past={past.ended ? [] : past.views} {...(stopped ? {} : { next })} />
      )}
      {data.signals.length > 0 && <SignalsTable view={next} signals={data.signals} />}
      {data.states && (
        <figure className="control-states">
          <figcaption>{t.statesTitle}</figcaption>
          <StateDiagram
            machine={machine}
            {...(next.state ? { current: next.state } : {})}
            {...(applies ? { nextRow: applies.index } : {})}
          />
        </figure>
      )}
      {data.timing.length > 0 && (
        <TimingDiagram
          circuit={circuit}
          trace={sim.trace}
          title={t.timingTitle}
          signals={[
            "CLK",
            { net: "S", label: "S", names },
            ...data.timing.filter((n) => n !== "S" && n !== "CLK"),
          ]}
        />
      )}
    </div>
  );
}
