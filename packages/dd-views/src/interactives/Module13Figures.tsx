// Copyright © 2026 Christopher Snow

// Module 13's figures.
//
// - `machine-levels`: the course's final demonstration. A program runs on the whole machine, and
//   the run is kept edge by edge (`recordRun`), so the learner steps forwards and back and pauses
//   at any edge. At every edge each level shows the same moment: the line of the program, its
//   machine code, the word in the IR and its fields, the controller's state and the control
//   signals, and the drawing, which opens down to the gates with the values of that edge. Beside
//   it, as a lesson asks: the part each level is made of and the module that built it; the
//   registers, the devices and the control registers; and the comparison with the
//   instruction-level model after every step, which names the first that disagrees, as every
//   machine since Module 8 has been held to. Every value is read off the recorded nets.

import { useMemo, useState, type ReactNode } from "react";
import { z } from "zod";

import {
  CONTROL_STATES,
  bitDrive,
  bitPartOf,
  libraryCircuit,
  type BitPart,
  datapathState,
  edgeView,
  netWord,
  recordRun,
  stepAt,
  type RecordedRun,
  type RunDifference,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { FaultInjector, PredictionChallenge } from "@platform/primitives";
import { Simulator, word, type Circuit, type Word } from "@dd/sim";

import { CircuitView, valueLabel } from "../CircuitView";
import { makerOf } from "../makers";
import { format, useViewStrings } from "../strings";
import type { Machine13Strings } from "../strings13";
import { WordValue } from "./Debugger";
import { FaultSpec, toFault } from "./FaultLab";
import { withProps } from "./props";

const hex3 = (v: bigint | number) =>
  BigInt.asUintN(64, BigInt(v)).toString(16).toUpperCase().padStart(3, "0");
const hex8 = (v: number) => (v >>> 0).toString(16).toUpperCase().padStart(8, "0");
const known = (w: Word | undefined): w is Word =>
  w !== undefined && w.known === (1n << BigInt(w.width)) - 1n;

/** The control registers' nets, and how each is written: two bits, a cause, or an address. */
const CONTROL_NETS: readonly (readonly [string, "bits" | "cause" | "address"])[] = [
  ["STATUS", "bits"],
  ["datapath/cregs/C1", "bits"],
  ["datapath/C2", "address"],
  ["datapath/cregs/C3", "cause"],
  ["datapath/C4", "address"],
];

const Ask = z.enum(["net", "pc", "state"]);

const Props = z.object({
  /** The machine: Module 13's `machine-final`. */
  libraryId: z.string().default("machine-final"),
  program: z.string(),
  /** The shop's inputs by name: SENSORA, SENSORB, DOOR, WARM. */
  inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** The door opens before this instruction, counted from the first, 0. */
  doorOpensAt: z.number().int().min(0).optional(),
  /** The edge the figure first shows, counted from the reset. */
  start: z.number().int().min(0).default(0),
  /** The most edges the run takes before it is cut off. */
  edges: z.number().int().min(1).max(500).default(300),
  /** The panel of the instruction at every level, with these control signals. */
  levels: z.boolean().default(true),
  signals: z.array(z.string()).default([]),
  /** The registers shown, by number. */
  shown: z.array(z.number().int().min(0).max(15)).default([]),
  devices: z.boolean().default(false),
  control: z.boolean().default(false),
  /** The block the drawing first shows opened, by its path, and the parts it opens on. */
  scope: z.string().default(""),
  focus: z.array(z.string()).optional(),
  /** The parts at the level on show, each with the module that built it. */
  makers: z.boolean().default(false),
  /** The comparison with the instruction-level model after every step. */
  compare: z.boolean().default(false),
  /** Faults the learner may choose, each recording the run again with it. */
  faults: z.array(FaultSpec).default([]),
  /** A prediction of the next edge, asked before any value shows. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  ask: Ask.default("net"),
  /** For `net`: the net asked about, and how its value is written. */
  net: z.string().optional(),
  form: z.enum(["word", "address", "signed", "bits"]).default("word"),
  /** For `net`: one bit of it, 0 or 1, in place of the whole word. */
  bit: z.number().int().min(0).max(63).optional(),
  /** Shown once the learner has reached the run's last edge. */
  outcomes: z.string().optional(),
  /**
   * Lesson 3, the trace: a choice of where to pause (a line, and an edge of it); the levels
   * opened so far, each with its maker and its ports' values; and, for the parts at the level on
   * show that never open, the drawing of one bit each, as the module that built it drew it.
   */
  trace: z.boolean().default(false),
});
type Data = z.infer<typeof Props>;

interface Stored {
  readonly choice?: string;
}

/** A net's value at a frame, written as a lesson asks. */
export function formOf(w: Word | undefined, form: Data["form"]): string {
  if (!known(w)) return "X";
  switch (form) {
    case "address":
      return hex3(w.value);
    case "signed":
      return BigInt.asIntN(w.width, w.value).toString();
    case "bits":
      return w.value.toString(2).padStart(w.width, "0");
    case "word":
      return w.value
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil(w.width / 4), "0");
  }
}

/** A sentence with its lines of the program in backticks, each set as code, as prose sets them. */
export function withCode(text: string): ReactNode[] {
  return text.split("`").map((piece, i) => (i % 2 === 1 ? <code key={i}>{piece}</code> : piece));
}

/** The controller's state at a frame, by name. */
function stateAt(circuit: Circuit, values: readonly Word[]): string | undefined {
  const s = netWord(circuit, values, "S");
  if (!known(s)) return undefined;
  const code = s.value.toString(2).padStart(3, "0");
  return Object.entries(CONTROL_STATES).find(([, c]) => c === code)?.[0];
}

/**
 * What a prediction about the next edge asks, answered by the run itself: the value a net holds
 * after it, the PC after it, or the controller's state after it.
 */
export function levelsAnswer(
  run: RecordedRun,
  at: number,
  ask: z.infer<typeof Ask>,
  net?: string,
  form: Data["form"] = "word",
  bit?: number,
): string {
  const after = run.frames[Math.min(at + 1, run.frames.length - 1)] ?? [];
  switch (ask) {
    case "net": {
      const w = netWord(run.circuit, after, net ?? "");
      if (bit === undefined) return formOf(w, form);
      return w && ((w.known >> BigInt(bit)) & 1n) === 1n
        ? String((w.value >> BigInt(bit)) & 1n)
        : "X";
    }
    case "pc": {
      const pc = datapathState(run.circuit, after).pc;
      return pc === undefined ? "X" : hex3(pc);
    }
    case "state":
      return stateAt(run.circuit, after) ?? "X";
  }
}

/** A part's maker in words: "Module 6", or "Module 8, grown in 9, 10 and 12". */
export function makerText(t: Machine13Strings, kind: string): string | undefined {
  const m = makerOf(kind);
  if (!m) return undefined;
  if (!m.grown?.length) return format(t.builtModule, { n: m.built });
  const list =
    m.grown.length === 1
      ? String(m.grown[0])
      : `${m.grown.slice(0, -1).join(", ")} ${t.and} ${m.grown.at(-1)}`;
  return format(t.builtGrown, { n: m.built, list });
}

/** The comparison's words for a run at a frame: agreement so far, or the first difference. */
export function compareText(t: Machine13Strings, run: RecordedRun, at: number): string {
  const d: RunDifference | undefined = run.difference;
  const step = d ? run.steps[d.step] : undefined;
  const pc =
    step?.pc ?? (d ? datapathState(run.circuit, run.frames.at(-1) ?? []).pc : undefined) ?? 0n;
  const line = step?.text ?? "";
  // A difference shows once the learner has run the step it follows.
  const shown = d && at >= (step?.last ?? run.frames.length - 1);
  if (d && shown) {
    const slots = { line, address: hex3(pc) };
    if (d.what === "stop") {
      if (d.machineStop?.kind === "trap")
        return format(t.haltsAlone, {
          ...slots,
          cause: d.machineStop.cause.toString(16).toUpperCase(),
        });
      return format(t.stopsAlone, slots);
    }
    const value = (v: bigint | undefined) =>
      v === undefined
        ? t.unknown
        : /^C[234]$|^PC$/.test(d.what)
          ? hex3(v)
          : /^C[01]$|^waiting$/.test(d.what)
            ? v.toString(2).padStart(2, "0")
            : d.what === "lamps"
              ? v.toString(2).padStart(3, "0")
              : v.toString();
    return format(t.differs, {
      ...slots,
      what: t.what[d.what] ?? d.what,
      machine: value(d.machine),
      model: value(d.model),
    });
  }
  const done = run.steps.filter((s) => s.last <= at).length;
  return done === 0 ? t.agreesNone : format(t.agrees, { n: done });
}

export const MachineLevels = withProps(
  Props,
  function MachineLevels({ data, interactive, store }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const t = strings.machine13;
    const td = strings.datapath;
    const [faultAt, setFaultAt] = useState(-1);
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const fault = faults[faultAt];
    const run = useMemo(
      () =>
        recordRun(
          {
            libraryId: data.libraryId,
            program: data.program,
            inputs: data.inputs,
            ...(data.doorOpensAt !== undefined ? { doorOpensAt: data.doorOpensAt } : {}),
            ...(fault ? { fault } : {}),
          },
          data.edges,
        ),
      [data.libraryId, data.program, data.inputs, data.doorOpensAt, data.edges, fault],
    );
    const last = run.frames.length - 1;
    const first = Math.min(data.start, last);
    const [at, setAt] = useState(first);
    const [reached, setReached] = useState(false);
    const [scope, setScope] = useState(data.scope);
    const go = (k: number) => {
      const to = Math.max(0, Math.min(last, k));
      setAt(to);
      if (to === last) setReached(true);
    };
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    // The answer is the run's own, from the edge the figure first shows.
    const answer = useMemo(
      () => (asking ? levelsAnswer(run, first, data.ask, data.net, data.form, data.bit) : ""),
      [asking, run, first, data.ask, data.net, data.form, data.bit],
    );
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");

    const values = run.frames[at] ?? [];
    const circuit = run.circuit;
    const state = datapathState(circuit, values);
    const next = edgeView(circuit, values);
    const k = stepAt(run, at);
    const step = run.steps[k];
    const pc = step?.pc ?? state.pc ?? 0n;
    const lineOf = (address: bigint) =>
      run.program.lines.find((l) => BigInt(l.address) === address && l.instruction !== undefined);
    const programLine = lineOf(pc);
    const lineText = step?.text ?? programLine?.text ?? t.noLine;
    const stopHere = run.stopped && at === run.stopped.frame ? run.stopped : undefined;
    const trapping = netWord(circuit, values, "TRAP");
    const status = stopHere
      ? stopHere.reason.kind === "trap"
        ? format(t.halted, {
            address: hex3(pc),
            cause: stopHere.reason.cause.toString(16).toUpperCase(),
          })
        : format(t.stopped, { address: hex3(pc) })
      : at === last && run.cutOff
        ? format(t.cutOff, { n: last })
        : `${
            at === 0
              ? format(t.atStart, { line: lineText, address: hex3(pc) })
              : format(t.atEdge, {
                  n: at,
                  state: next.state ?? "X",
                  line: lineText,
                  address: hex3(pc),
                })
          }${
            known(trapping) && trapping.value === 1n && state.cause !== undefined
              ? ` ${format(t.trapsNext, { cause: state.cause.toString(16).toUpperCase() })}`
              : ""
          }`;

    const ir = netWord(circuit, values, "IR");
    const digit = (shift: number) =>
      known(ir)
        ? Number((ir.value >> BigInt(shift)) & 15n)
            .toString(16)
            .toUpperCase()
        : "X";
    const constant = known(ir) ? hex3(ir.value & 0xfffn) : "XXX";
    const signal = (name: string) => {
      const v = next.signals[name] ?? undefined;
      if (v !== undefined) return String(v);
      const w = netWord(circuit, values, name);
      return known(w) ? valueLabel(w) : "X";
    };
    // The blocks and parts at the level on show, each with its maker.
    const parts = useMemo(() => {
      const inside = (path: string) => {
        const cut = path.lastIndexOf("/");
        return (cut < 0 ? "" : path.slice(0, cut)) === scope;
      };
      return circuit.composites
        .filter((c) => inside(c.path) && makerOf(c.kind))
        .map((c) => ({ path: c.path, name: c.name, kind: c.kind }));
    }, [circuit, scope]);
    const scopeKind = circuit.composites.find((c) => c.path === scope)?.kind;

    return (
      <div className="explorer machine-levels" data-interactive={interactive.id}>
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
                    {format(td.answer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
            {committed && at > first && data.explain && <Prose markdown={data.explain} />}
          </div>
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
              setAt(first);
              setReached(false);
            }}
          />
        )}
        {committed && (
          <>
            <div className="explorer-actions debugger-actions">
              <button
                type="button"
                className="button"
                disabled={at >= last}
                onClick={() => go(at + 1)}
              >
                {t.nextEdge}
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={at === 0}
                onClick={() => go(at - 1)}
              >
                {t.backEdge}
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={at >= last}
                onClick={() => go(last)}
              >
                {t.toEnd}
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={at === first}
                onClick={() => go(first)}
              >
                {t.reset}
              </button>
            </div>
            <p className="debugger-status" role="status">
              {withCode(status)}
            </p>
            {data.trace && <PauseChooser run={run} t={t} onGo={go} />}
          </>
        )}
        {committed && data.levels && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table machine-levels-table">
              <caption>{t.levelsCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.level}</th>
                  <th scope="col">{t.shows}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t.line}</th>
                  <td className="memory-word">{lineText}</td>
                </tr>
                <tr>
                  <th scope="row">{t.address}</th>
                  <td className="memory-word">{hex3(pc)}</td>
                </tr>
                <tr>
                  <th scope="row">{t.machineCode}</th>
                  <td className="memory-word">
                    {programLine?.instruction !== undefined ? hex8(programLine.instruction) : "X"}
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t.inIr}</th>
                  <td className="memory-word">
                    {known(ir) ? hex8(Number(ir.value)) : "X"}
                    <br />
                    {format(t.fields, {
                      k: digit(28),
                      j: digit(24),
                      a: digit(20),
                      b: digit(16),
                      y: digit(12),
                      c: constant,
                    })}
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t.state}</th>
                  <td className="memory-word">{next.state ?? "X"}</td>
                </tr>
                {data.signals.map((name) => (
                  <tr key={name}>
                    <th scope="row">{format(t.signal, { name })}</th>
                    <td className="memory-word">{signal(name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <CircuitView
          circuit={circuit}
          {...(committed ? { values } : {})}
          title={strings.explorer.title}
          scope={scope}
          onScope={setScope}
          table={false}
          writtenWidth={4}
          {...(data.focus ? { focus: data.focus } : {})}
        />
        {data.makers && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table machine-makers">
              <caption>
                {`${t.makersCaption}: ${
                  scope === ""
                    ? t.whole
                    : `${scope}${scopeKind && makerText(t, scopeKind) ? ` (${makerText(t, scopeKind)})` : ""}`
                }`}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t.part}</th>
                  <th scope="col">{t.builtIn}</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p.path}>
                    <th scope="row" className="memory-word">
                      {p.name}
                    </th>
                    <td>{makerText(t, p.kind)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {committed && data.trace && (
          <TracePanel circuit={circuit} values={values} scope={scope} t={t} />
        )}
        {committed && data.compare && (
          <p className="machine-compare" role="status">
            {withCode(compareText(t, run, at))}
          </p>
        )}
        <div className="datapath-tables" hidden={!committed}>
          {data.shown.length > 0 && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{td.registersCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{td.register}</th>
                    <th scope="col">{td.word}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shown.map((r) => {
                    const v = state.regs[r];
                    return (
                      <tr key={r}>
                        <th scope="row">{`R${r}`}</th>
                        <td className="memory-word">
                          {/* A word as the debugger writes it: from 10 to 7FF with its
                              hexadecimal beside it, first for the stack and the return address. */}
                          <WordValue
                            value={v === undefined ? undefined : BigInt.asIntN(64, v)}
                            t={strings.machine11}
                            address={r >= 14}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {data.control && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{t.controlCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{td.register}</th>
                    <th scope="col">{td.word}</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROL_NETS.map(([net, form], c) => {
                    const w = netWord(circuit, values, net);
                    const text = !known(w)
                      ? "X"
                      : form === "bits"
                        ? w.value.toString(2).padStart(2, "0")
                        : form === "cause"
                          ? w.value.toString(16).toUpperCase().padStart(2, "0")
                          : hex3(w.value);
                    return (
                      <tr key={net}>
                        <th scope="row">{`C${c} ${strings.machine12.controlNames[c] ?? ""}`}</th>
                        <td className="memory-word">{text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {data.devices && (
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table">
                <caption>{td.devicesCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{td.device}</th>
                    <th scope="col">{td.value}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{td.display}</th>
                    <td className="memory-word">
                      {state.display === undefined
                        ? "X"
                        : BigInt.asIntN(64, state.display).toString()}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">{td.lamps}</th>
                    <td className="memory-word">
                      {state.lamps === undefined ? "XXX" : state.lamps.toString(2).padStart(3, "0")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        {reached && data.outcomes && <Prose markdown={data.outcomes} />}
      </div>
    );
  },
);

/** Lesson 3: choose a line of the program and an edge of it, and pause the run before it. */
function PauseChooser({
  run,
  t,
  onGo,
}: {
  run: RecordedRun;
  t: Machine13Strings;
  onGo: (frame: number) => void;
}) {
  // Each line the run reaches, at its first step, with that step's edges by state.
  const lines = useMemo(() => {
    const seen = new Set<string>();
    return run.steps.flatMap((s) => {
      const key = s.pc.toString();
      if (seen.has(key) || !s.text) return [];
      seen.add(key);
      const states = Array.from(
        { length: s.last - s.first },
        (_, i) => edgeView(run.circuit, run.frames[s.first + i] ?? []).state ?? "X",
      );
      return [{ pc: s.pc, text: s.text, first: s.first, states }];
    });
  }, [run]);
  const [line, setLine] = useState(0);
  const [edge, setEdge] = useState(0);
  const chosen = lines[line];
  return (
    <fieldset className="pause-chooser">
      <legend>{t.pauseLegend}</legend>
      <label>
        <span>{t.pauseLine}</span>
        <select
          value={line}
          onChange={(e) => {
            setLine(Number(e.target.value));
            setEdge(0);
          }}
        >
          {lines.map((l, i) => (
            <option key={l.pc.toString()} value={i}>
              {`${hex3(l.pc)}  ${l.text}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t.pauseEdge}</span>
        <select value={edge} onChange={(e) => setEdge(Number(e.target.value))}>
          {(chosen?.states ?? []).map((st, i) => (
            <option key={i} value={i}>
              {format(t.pauseEdgeOption, { k: i + 1, state: st })}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="button secondary"
        onClick={() => chosen && onGo(chosen.first + edge)}
      >
        {t.pauseGo}
      </button>
    </fieldset>
  );
}

/** A port's value as the trace lists it: a bit as 0 or 1, a word in hexadecimal, X unknown. */
const portText = (w: Word | undefined) => (w ? valueLabel(w) : "X");

/**
 * Lesson 3: the trace. The levels opened so far, the whole machine first, each with the module
 * that built it and the values on its ports at this edge; then the parts at the level on show
 * that never open, each offering the drawing of one bit.
 */
function TracePanel({
  circuit,
  values,
  scope,
  t,
}: {
  circuit: Circuit;
  values: readonly Word[];
  scope: string;
  t: Machine13Strings;
}) {
  const levels =
    scope === "" ? [] : scope.split("/").map((_, i, all) => all.slice(0, i + 1).join("/"));
  const [open, setOpen] = useState<string | undefined>();
  // The parts directly inside the block on show that a learner cannot open.
  const closed = useMemo(() => {
    const inside = (path: string) => {
      const cut = path.lastIndexOf("/");
      return (cut < 0 ? "" : path.slice(0, cut)) === scope;
    };
    return [
      ...circuit.composites.map((c) => c.path),
      ...circuit.components
        .filter((c) => c.kind === "memory" || c.kind === "mux2")
        .map((c) => c.path),
    ]
      .filter(inside)
      .map((path) => bitPartOf(circuit, path))
      .filter((p): p is BitPart => p !== undefined);
  }, [circuit, scope]);
  const part = closed.find((p) => p.path === open);
  return (
    <div className="machine-trace">
      {levels.length > 0 && (
        <div className="truth-table-wrap">
          <table className="truth-table datapath-table machine-trace-table">
            <caption>{t.traceCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.traceLevel}</th>
                <th scope="col">{t.traceIn}</th>
                <th scope="col">{t.traceOut}</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((path) => {
                const block = circuit.composites.find((c) => c.path === path);
                if (!block) return null;
                const ports = (r: Readonly<Record<string, number>>) =>
                  Object.entries(r).map(([port, net]) => (
                    <span key={port} className="trace-port">
                      {format(t.tracePort, { port, value: portText(values[net]) })}
                    </span>
                  ));
                return (
                  <tr key={path}>
                    <th scope="row">
                      <span className="memory-word">{block.name}</span>
                      <br />
                      {makerText(t, block.kind) ?? ""}
                    </th>
                    <td className="memory-word">{ports(block.inputs)}</td>
                    <td className="memory-word">{ports(block.outputs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {closed.length > 0 && (
        <section className="machine-closed" aria-label={t.closedCaption}>
          <p className="layout-title">{t.closedCaption}</p>
          <ul className="machine-closed-list">
            {closed
              .filter((p) => p.bit !== "wiring")
              .map((p) => (
                <li key={p.path}>
                  <button
                    type="button"
                    className="button secondary"
                    aria-pressed={open === p.path}
                    onClick={() => setOpen(open === p.path ? undefined : p.path)}
                  >
                    {format(t.closedOpen, { part: p.name, module: p.module })}
                  </button>
                </li>
              ))}
          </ul>
          {/* The parts with no gate after the buttons, as sentences: the trace passes through. */}
          {closed.some((p) => p.bit === "wiring") && (
            <p className="machine-wiring">
              {closed
                .filter((p) => p.bit === "wiring")
                .map((p) => format(t.closedWiring, { part: p.name }))
                .join(" ")}
            </p>
          )}
          {part && <BitView part={part} circuit={circuit} values={values} t={t} />}
        </section>
      )}
    </div>
  );
}

const unknownBit = { width: 1, value: 0n, known: 0n } as const;

/** One bit of a part that never opens, drawn as its module drew one bit, at the machine's values. */
function BitView({
  part,
  circuit,
  values,
  t,
}: {
  part: BitPart;
  circuit: Circuit;
  values: readonly Word[];
  t: Machine13Strings;
}) {
  const strings = useViewStrings();
  const [k, setK] = useState(0);
  const [index, setIndex] = useState(0);
  const drive = bitDrive(circuit, values, part, Math.min(k, part.width - 1), index);
  const shown = useMemo(() => {
    if (!drive) return undefined;
    const lc = libraryCircuit(drive.libraryId);
    const sim = new Simulator(lc);
    const has = (n: string) => lc.inputs.some((i) => i.name === n);
    const set = (n: string, v: 0 | 1 | undefined) => {
      if (has(n)) sim.setInput(n, v === undefined ? unknownBit : word(1, v));
    };
    for (const i of lc.inputs) sim.setInput(i.name, word(1, 0));
    sim.settle();
    // A register's flip-flop is given what the part holds, then the part's inputs at this edge.
    if (drive.held !== undefined) {
      set("D", drive.held);
      set("EN", 1);
      sim.settle();
      sim.clockCycle("CLK");
    }
    for (const [n, v] of Object.entries(drive.inputs)) set(n, v);
    sim.settle();
    return { circuit: lc, values: sim.snapshotValues() };
  }, [drive?.libraryId, JSON.stringify(drive?.inputs), drive?.held]);
  const bitText = (v: 0 | 1 | undefined) => (v === undefined ? "X" : String(v));
  const choices =
    part.bit === "registerFile"
      ? Array.from({ length: 16 }, (_, r) => ({ value: r, label: `R${r}` }))
      : part.bit === "pair"
        ? [
            { value: 0, label: "HA" },
            { value: 1, label: "HB" },
          ]
        : part.bit === "ram"
          ? Array.from({ length: part.choices ?? 0 }, (_, b) => ({
              value: b,
              label: hex3(0x400 + b),
            }))
          : [];
  return (
    <div className="machine-bit">
      <div className="pause-chooser">
        {choices.length > 0 && (
          <label>
            <span>
              {part.bit === "registerFile"
                ? t.bitRegister
                : part.bit === "ram"
                  ? t.bitByte
                  : t.bitPair}
            </span>
            <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
              {choices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span>{t.bitWhich}</span>
          <select
            value={Math.min(k, part.width - 1)}
            onChange={(e) => setK(Number(e.target.value))}
          >
            {Array.from({ length: part.width }, (_, b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>
      {drive && shown && (
        <>
          <p className="layout-title">
            {format(t.bitHeading, {
              part: part.name,
              k: Math.min(k, part.width - 1),
              module: drive.module,
            })}
          </p>
          <CircuitView
            circuit={shown.circuit}
            values={shown.values}
            title={strings.explorer.title}
            table={false}
          />
          <p role="status" className="machine-bit-status">
            {drive.held !== undefined || part.bit === "register" || part.bit === "registerReset"
              ? format(t.bitHolds, { held: bitText(drive.held), result: bitText(drive.result) })
              : format(t.bitGives, { result: bitText(drive.result) })}
          </p>
        </>
      )}
    </div>
  );
}
