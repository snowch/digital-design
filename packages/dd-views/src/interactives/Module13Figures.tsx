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

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";

import {
  BIT_DRAWINGS,
  CONTROL_STATES,
  bitDrive,
  bitPartOf,
  libraryCircuit,
  type BitPart,
  datapathState,
  edgeUses,
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
import { ProgramListing } from "./ProgramListing";
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
  /**
   * The row "Its word in the ROM" held back until the first edge has run: a figure whose
   * construction asks for that word works it out before the row gives it.
   */
  holdRom: z.boolean().default(false),
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
  /**
   * A paragraph shown only once the learner has made what it reports: opened the block at
   * `scope` (or one inside it) after committing, or reached the run's last edge (`end`).
   */
  reveal: z
    .object({
      text: z.string(),
      scope: z.string().optional(),
      end: z.boolean().default(false),
      /** Or once the run has passed this edge, counted from the reset. */
      edge: z.number().int().min(0).optional(),
      /** Or once the learner has pinned this wire, by its name. */
      net: z.string().optional(),
      /**
       * And only after a run with a fault chosen has reached its end: a fault's explanation that
       * names where it is shows once the learner has found it after the run that shows it.
       */
      afterFault: z.boolean().default(false),
    })
    .optional(),
  /** The program's lines and their addresses, folded under its name. */
  listing: z.string().optional(),
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
export function makerText(t: Machine13Strings, kind: string, path?: string): string | undefined {
  const m = makerOf(kind, path);
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
    // A wire pinned from a table is brought into view: its name goes first in the focus.
    const [pinFocus, setPinFocus] = useState<string | undefined>();
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const fault = faults[faultAt];
    // A chosen fault on a join (a wire of the top level) brings that join into view first; a
    // fault inside a block is left for the learner to find.
    const chosenSpec = data.faults[faultAt];
    const faultNet = chosenSpec && "net" in chosenSpec ? chosenSpec.net : undefined;
    const focus = useMemo(
      () => [
        ...(pinFocus !== undefined ? [pinFocus] : []),
        ...(faultNet !== undefined && !faultNet.includes("/") ? [faultNet] : []),
        ...(data.focus ?? []),
      ],
      [pinFocus, faultNet, data.focus],
    );
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
    // A wire the learner pressed stays pinned as blocks open: a net keeps its number at every
    // level, so its value shows wherever it is drawn.
    const [pinned, setPinned] = useState<number | undefined>();
    const go = (k: number) => {
      const to = Math.max(0, Math.min(last, k));
      setAt(to);
      // A fault's outcome shows once its run has reached the end, until the run starts again.
      if (to === last) setReached(true);
      else if (to === first) setReached(false);
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
    // A pinned word marks the parts it is joined from or split into, so the pin follows it down
    // a level (RESULT into the groups' results inside the ALU).
    const pinnedParts = useMemo(
      () => (pinned === undefined ? new Set<number>() : wordParts(run.circuit, pinned)),
      [run.circuit, pinned],
    );
    // A table's row or port pressed: its wire pinned, and the drawing opened where it is drawn,
    // with the wire in view.
    const drawingRef = useRef<HTMLDivElement>(null);
    const pinWire = (name: string) => {
      const net = run.circuit.nets.find((n) => n.name === name);
      if (!net) return;
      setPinned(net.id);
      setScope(drawnAt(run.circuit, net.id, scope));
      setPinFocus(name);
      drawingRef.current?.scrollIntoView?.({ block: "nearest" });
    };
    // The wires the next edge uses: back from what it writes, along each selector's chosen
    // input (`edgeUses`), marked on the drawing at every level.
    const active = useMemo(
      () =>
        at < run.frames.length - 1
          ? edgeUses(run.circuit, run.frames[at] ?? [])
          : new Set<number>(),
      [run, at],
    );
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

    // A paragraph a run reveals shows once its condition has held, and stays: stepping back
    // past the edge does not take back what the learner has read.
    const revealNow =
      committed &&
      data.reveal !== undefined &&
      ((data.reveal.scope !== undefined &&
        (scope === data.reveal.scope || scope.startsWith(`${data.reveal.scope}/`))) ||
        (data.reveal.end === true && reached) ||
        (data.reveal.edge !== undefined && at >= data.reveal.edge) ||
        (data.reveal.net !== undefined &&
          pinned !== undefined &&
          run.circuit.nets[pinned]?.name === data.reveal.net)) &&
      (!data.reveal.afterFault || (reached && faultAt >= 0));
    // A fault's explanation is the exception: it holds only while its run is the one on show, so
    // "Start again" or "No fault" takes it back with the run it explains.
    const [revealed, setRevealed] = useState(false);
    if (revealNow && !revealed && !data.reveal?.afterFault) setRevealed(true);
    const isPinned = (name: string) => {
      const net = run.circuit.nets.find((n) => n.name === name);
      return net !== undefined && (net.id === pinned || pinnedParts.has(net.id));
    };
    const rowPinned = (name: string) => (isPinned(name) ? "machine-row-pinned" : undefined);
    // A row's heading is a button: it pins the wire the row reads, named under its label, and
    // brings it into view.
    const rowButton = (label: string, name: string, wire?: string) => (
      <button
        type="button"
        className="machine-row-wire"
        aria-pressed={isPinned(name)}
        aria-label={format(t.rowPin, {
          row: plainText(label),
          wire: name.split("/").pop() ?? name,
        })}
        onClick={() => pinWire(name)}
      >
        {label}
        <span className="machine-row-wire-name" aria-hidden="true">
          {wire ?? format(t.rowWire, { wire: name.split("/").pop() ?? name })}
        </span>
      </button>
    );
    // A row's wire, pinned, reads under the drawing as its row writes it.
    const rowForms = useMemo(() => {
      const byName = new Map<string, (w: Word) => string>([
        ["PC", (w) => hex3(w.value)],
        ["FETCHED", (w) => hex8(Number(w.value))],
        ["IR", (w) => hex8(Number(w.value))],
        [
          "control/S",
          (w) =>
            Object.entries(CONTROL_STATES).find(
              ([, c]) => c === w.value.toString(2).padStart(3, "0"),
            )?.[0] ?? valueLabel(w),
        ],
      ]);
      const forms = new Map<number, (w: Word) => string>();
      for (const [name, f] of byName) {
        const net = run.circuit.nets.find((n) => n.name === name);
        if (net) forms.set(net.id, f);
      }
      return forms;
    }, [run.circuit]);
    const readout = (net: number) => {
      const f = rowForms.get(net);
      const w = values[net];
      return f && known(w) ? f(w) : undefined;
    };
    // The step buttons and the status line stay at the top of the window over the whole figure,
    // tables and bit views too, so a lead that alternates a press with a row under the drawing
    // keeps the button in reach. The drawing's overview sticks under them, over the drawing only
    // (`--sticky-top`), and only in a window tall enough to keep most of it for the drawing.
    const rootRef = useRef<HTMLDivElement>(null);
    const bandRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const root = rootRef.current;
      const band = bandRef.current;
      if (!root || !band) return;
      const set = () => root.style.setProperty("--sticky-top", `${band.offsetHeight}px`);
      set();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(set);
      ro.observe(band);
      return () => ro.disconnect();
    }, [committed]);
    const steps = (
      <div className="machine-steps" ref={bandRef}>
        <div className="explorer-actions debugger-actions">
          <button type="button" className="button" disabled={at >= last} onClick={() => go(at + 1)}>
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
      </div>
    );
    return (
      <div className="explorer machine-levels" data-interactive={interactive.id} ref={rootRef}>
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
                    {data.explain && at === first ? ` ${t.explainNext}` : ""}
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
            // The chooser shows plain text: a label's code marks go.
            faults={faults.map((f) => ({ ...f, label: f.label.replace(/`([^`]*)`/g, "$1") }))}
            chosen={faultAt}
            onChoose={(i) => {
              setFaultAt(i);
              setAt(first);
              setReached(false);
            }}
          />
        )}
        {data.listing && <ProgramListing source={data.program} label={data.listing} />}
        {committed && steps}
        <div ref={drawingRef}>
          <CircuitView
            circuit={circuit}
            {...(committed ? { values } : {})}
            title={strings.explorer.title}
            scope={scope}
            onScope={setScope}
            table={false}
            writtenWidth={4}
            {...(focus.length ? { focus } : {})}
            pinned={pinned}
            onPin={(n) => {
              setPinned(n);
              setPinFocus(undefined);
            }}
            pinnedParts={pinnedParts}
            readout={readout}
            {...(committed ? { active } : {})}
          />
        </div>
        <p className="machine-pin-note">{t.pinNote}</p>
        {/* What a run has shown: under the drawing, where the learner is looking when it appears,
            the comparison first and the paragraph that explains it after, so neither moves as
            the tables below grow. */}
        {committed && data.compare && (
          <p className="machine-compare" role="status">
            {withCode(compareText(t, run, at))}
          </p>
        )}
        {reached && data.outcomes && (
          <div className="fault-outcome" role="status">
            <Prose markdown={data.outcomes} />
          </div>
        )}
        {reached && faultAt >= 0 && data.faults[faultAt]?.outcome && (
          <div className="fault-outcome" role="status">
            <Prose markdown={data.faults[faultAt]?.outcome ?? ""} />
          </div>
        )}
        {committed && data.reveal && (revealNow || revealed) && (
          <div className="fault-outcome" role="status">
            <Prose markdown={data.reveal.text} />
          </div>
        )}
        {/* The run over time, under the drawing and what its runs have shown: above it, it put
            the length of the run between the step controls, or a challenge's answer boxes, and
            the drawing. */}
        {committed && (data.trace || data.levels) && <RunStrip run={run} at={at} t={t} onGo={go} />}
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
                <tr className={rowPinned("PC")}>
                  <th scope="row">{rowButton(t.address, "PC")}</th>
                  <td className="memory-word">{hex3(pc)}</td>
                </tr>
                <tr className={rowPinned("FETCHED")}>
                  <th scope="row">{rowButton(t.machineCode, "FETCHED", t.romWire)}</th>
                  <td className="memory-word">
                    {data.holdRom && at <= first
                      ? t.romLater
                      : programLine?.instruction !== undefined
                        ? hex8(programLine.instruction)
                        : "X"}
                  </td>
                </tr>
                <tr className={rowPinned("IR")}>
                  <th scope="row">{rowButton(t.inIr, "IR")}</th>
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
                <tr className={rowPinned("control/S")}>
                  <th scope="row">{rowButton(t.state, "control/S")}</th>
                  <td className="memory-word">{next.state ?? "X"}</td>
                </tr>
                {data.signals.map((name) => (
                  <tr key={name} className={rowPinned(`control/${name}`)}>
                    <th scope="row">{rowButton(format(t.signal, { name }), `control/${name}`)}</th>
                    <td className="memory-word">{signal(name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.makers && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table machine-makers">
              <caption>
                {`${t.makersCaption}: ${
                  scope === ""
                    ? t.whole
                    : `${scope}${scopeKind && makerText(t, scopeKind, scope) ? ` (${makerText(t, scopeKind, scope)})` : ""}`
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
                    <td>{makerText(t, p.kind, p.path)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {committed && data.trace && (
          <TracePanel
            circuit={circuit}
            values={values}
            scope={scope}
            t={t}
            marked={(net) =>
              net === pinned || pinnedParts.has(net)
                ? "trace-port-pinned"
                : active.has(net)
                  ? "trace-port-route"
                  : ""
            }
            onPin={(net) => {
              setPinned(net);
              setPinFocus(run.circuit.nets[net]?.name);
            }}
          />
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
      </div>
    );
  },
);

/**
 * The run over time, by the step controls: each step of the run (an instruction, or a trap) with
 * its edges side by side, by state, numbered from the reset, the next edge marked. A press pauses
 * the run before that edge. A window of steps around the next edge shows, and moves with it.
 */
function RunStrip({
  run,
  at,
  t,
  onGo,
}: {
  run: RecordedRun;
  at: number;
  t: Machine13Strings;
  onGo: (frame: number) => void;
}) {
  const steps = useMemo(
    () =>
      run.steps.map((s) => ({
        pc: s.pc,
        text: s.text,
        first: s.first,
        states: Array.from(
          { length: s.last - s.first },
          (_, i) => edgeView(run.circuit, run.frames[s.first + i] ?? []).state ?? "X",
        ),
      })),
    [run],
  );
  // The step the run is in; at the run's last frame, after its last edge, the last step.
  const within = steps.findIndex((s) => at >= s.first && at < s.first + s.states.length);
  const current = within >= 0 ? within : at > 0 ? Math.max(0, steps.length - 1) : 0;
  // "Earlier lines" and "Later lines" move the window; a move of the run brings it back to the
  // step the run is in, so the marked edge never leaves it.
  const [shift, setShift] = useState(0);
  const [shiftedAt, setShiftedAt] = useState(at);
  if (shiftedAt !== at) {
    setShiftedAt(at);
    setShift(0);
  }
  const WINDOW = 4;
  const start = Math.max(0, Math.min(steps.length - WINDOW, current - 1 + shift));
  const shown = steps.slice(start, start + WINDOW);
  return (
    <div className="run-strip" role="group" aria-label={t.stripLegend}>
      <p className="run-strip-legend">{t.stripLegend}</p>
      <button
        type="button"
        className="button secondary run-strip-move"
        disabled={start === 0}
        onClick={() => setShift((k) => k - WINDOW)}
      >
        {t.stripEarlier}
      </button>
      <ol className="run-strip-steps" start={start + 1}>
        {shown.map((s, i) => (
          <li key={start + i} className="run-strip-step">
            <span className="run-strip-line">
              <code>{`${hex3(s.pc)}  ${s.text || t.noLine}`}</code>
            </span>
            <span className="run-strip-edges">
              {s.states.map((st, k) => {
                const frame = s.first + k;
                const next = frame === at;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`button secondary run-strip-edge${next ? " run-strip-next" : ""}${frame < at ? " run-strip-done" : ""}`}
                    aria-current={next ? "step" : undefined}
                    onClick={() => {
                      setShift(0);
                      onGo(frame);
                    }}
                  >
                    {format(t.stripEdge, { n: frame + 1, state: st })}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="button secondary run-strip-move"
        disabled={start + WINDOW >= steps.length}
        onClick={() => setShift((k) => k + WINDOW)}
      >
        {t.stripLater}
      </button>
    </div>
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
  marked,
  onPin,
}: {
  circuit: Circuit;
  values: readonly Word[];
  scope: string;
  t: Machine13Strings;
  /** A port's mark: pinned, on the next edge's route, or none. */
  marked: (net: number) => string;
  onPin: (net: number) => void;
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
                    <button
                      key={port}
                      type="button"
                      className={`trace-port ${marked(net)}`.trim()}
                      aria-pressed={marked(net) === "trace-port-pinned"}
                      onClick={() => onPin(net)}
                    >
                      {format(t.tracePort, { port, value: portText(values[net]) })}
                    </button>
                  ));
                return (
                  <tr key={path}>
                    <th scope="row">
                      <span className="memory-word">{block.name}</span>
                      <br />
                      {makerText(t, block.kind, block.path) ?? ""}
                    </th>
                    <td className="memory-word" data-label={t.traceIn}>
                      {ports(block.inputs)}
                    </td>
                    <td className="memory-word" data-label={t.traceOut}>
                      {ports(block.outputs)}
                    </td>
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
                    {format(t.closedOpen, {
                      part: p.name,
                      // The module whose drawing of one bit opens, as the heading over it says.
                      module: p.bit === "wiring" ? p.module : BIT_DRAWINGS[p.bit][1],
                    })}
                  </button>
                </li>
              ))}
          </ul>
          {/* The parts with no gate after the buttons, as sentences: the trace passes through. */}
          {closed.some((p) => p.bit === "wiring") && (
            <p className="machine-wiring">
              {wiringSentence(
                closed.filter((p) => p.bit === "wiring").map((p) => p.name),
                t,
              )}
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

/** One sentence for the parts that only split or join words, however many there are. */
function wiringSentence(names: readonly string[], t: Machine13Strings): string {
  if (names.length === 1) return format(t.closedWiring, { part: names[0] ?? "" });
  const parts = `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return format(t.closedWiringMany, { parts });
}

/**
 * The parts a word is joined from or split into: a join's inputs, and the outputs of the parts
 * that take bits from it, through joins and splits in turn, so a pin on RESULT marks the groups'
 * results inside the ALU and their slices' bits.
 */
function wordParts(circuit: Circuit, net: number): Set<number> {
  const parts = new Set<number>();
  const queue = [net];
  while (queue.length) {
    const n = queue.pop()!;
    for (const c of circuit.components) {
      const into = c.kind === "join" && Object.values(c.outputs).includes(n);
      const outOf = (c.kind === "bit" || c.kind === "slice") && Object.values(c.inputs).includes(n);
      const next = into ? Object.values(c.inputs) : outOf ? Object.values(c.outputs) : [];
      for (const m of next)
        if (m !== net && !parts.has(m)) {
          parts.add(m);
          queue.push(m);
        }
    }
  }
  return parts;
}

/**
 * The block to show a wire in: the level on show if the wire is drawn there, else the shallowest
 * block that draws it (the PC inside the datapath, S inside the controller). A wire is drawn in a
 * block when it joins two things there: parts directly inside, or the block's own ports.
 */
export function drawnAt(circuit: Circuit, net: number, scope: string): string {
  const parent = (path: string) => {
    const cut = path.lastIndexOf("/");
    return cut < 0 ? "" : path.slice(0, cut);
  };
  const ends = new Map<string, number>();
  const end = (at: string) => ends.set(at, (ends.get(at) ?? 0) + 1);
  for (const p of [...circuit.inputs, ...circuit.outputs]) if (p.net === net) end("");
  for (const c of circuit.components)
    if (Object.values(c.inputs).includes(net) || Object.values(c.outputs).includes(net))
      end(parent(c.path));
  for (const c of circuit.composites)
    if (Object.values(c.inputs).includes(net) || Object.values(c.outputs).includes(net)) {
      end(parent(c.path));
      end(c.path);
    }
  const drawn = [...ends].filter(([, n]) => n >= 2).map(([at]) => at);
  if (drawn.includes(scope)) return scope;
  const depth = (path: string) => (path === "" ? 0 : path.split("/").length);
  return drawn.sort((a, b) => depth(a) - depth(b))[0] ?? scope;
}

/** A label without its Markdown code marks, for an accessible name. */
function plainText(label: string): string {
  return label.replace(/`/g, "");
}
