// Copyright © 2026 Christopher Snow

// Module 8's focused figures, each one idea of the machine drawn small enough for a phone, and
// each a view of the implementation (packages/dd-model: machine-figures.ts):
//
// - `instruction-fields`: an instruction word cut into its six fields, each with its bits, its
//   digits, its value and, where the lesson says, where it goes. The fields are the reference's
//   reading of the word.
// - `widening`: a 12-bit constant and the 64-bit word the widen block makes of it, simulated,
//   with the copies of bit 11 shaded.
// - `edge-timeline`: a real run of the datapath, edge by edge, as a timing diagram of the buses a
//   lesson names: PC moving at each edge and the rest following it.
// - `memory-map`: the memory map part by part, with the verdict of the machine's own check for
//   each kind of access.
// - `branch-targets`: a program's lines with an arrow from each branch, call and jump to where a
//   run of the reference sent PC next, and how many times.
//
// The words are in strings.ts under `machine8`; the lesson gives what only it knows (the notes on
// where a field goes, the constants, the program).

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  ACCESSES,
  CONTROL_STATES,
  accessVerdict,
  buildDatapath,
  instructionFields,
  instructionWord,
  memoryMapParts,
  programFlow,
  startDatapath,
  widening,
  type InstructionField,
  type ProgramLine,
} from "@dd/dd-model";
import type { InteractiveProps } from "@platform/lesson-runtime";
import { formatWord, type Word } from "@dd/sim";

import { format, useViewStrings } from "../strings";
import { TimingDiagram } from "../TimingDiagram";
import { withProps } from "./props";

const hex3 = (v: number | bigint) => v.toString(16).toUpperCase().padStart(3, "0");
const hex8 = (v: number) => (v >>> 0).toString(16).toUpperCase().padStart(8, "0");

/** A row of radio buttons choosing one of a figure's cases, or nothing for a single case. */
function Chooser({
  name,
  labels,
  chosen,
  onChoose,
}: {
  name: string;
  labels: readonly string[];
  chosen: number;
  onChoose: (k: number) => void;
}) {
  const strings = useViewStrings();
  if (labels.length < 2) return null;
  return (
    <fieldset className="carry-cases">
      <legend>{strings.machine8.choose}</legend>
      {labels.map((label, k) => (
        <label key={label} className="fault-choice">
          <input type="radio" name={name} checked={chosen === k} onChange={() => onChoose(k)} />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------------------------

/** A note for each field, in the lesson's words; a field without a note shows none. */
const FieldNotes = z.object({
  K: z.string().optional(),
  J: z.string().optional(),
  A: z.string().optional(),
  B: z.string().optional(),
  Y: z.string().optional(),
  C: z.string().optional(),
});

const FieldsProps = z.object({
  /**
   * The instructions, as lines of assembly or eight hexadecimal digits after `0x`; an
   * instruction's own notes replace the figure's for the fields they name, such as a field its
   * job reads but ignores.
   */
  instructions: z
    .array(z.object({ label: z.string(), text: z.string(), notes: FieldNotes.optional() }))
    .min(1),
  /** Where each field goes, for every instruction. */
  notes: FieldNotes.default({}),
});

export const InstructionFieldsFigure = withProps(
  FieldsProps,
  function InstructionFieldsFigure({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof FieldsProps> }) {
    const t = useViewStrings().machine8;
    const [chosen, setChosen] = useState(0);
    const given = data.instructions[chosen] ?? data.instructions[0];
    const word = useMemo(() => (given ? instructionWord(given.text) : 0), [given]);
    const fields = instructionFields(word);
    // A field's value, unless it says no more than the field's digits.
    const value = (f: InstructionField) =>
      f.name === "A" || f.name === "B" || f.name === "Y"
        ? format(t.register, { n: f.value })
        : f.name === "C"
          ? format(t.signedValue, { value: f.signed ?? f.value })
          : String(f.value);
    return (
      <div className="machine-figure instruction-fields" data-interactive={interactive.id}>
        <Chooser
          name={`${interactive.id}-choice`}
          labels={data.instructions.map((i) => i.label)}
          chosen={chosen}
          onChoose={setChosen}
        />
        <p className="fields-word">{format(t.word, { word: hex8(word) })}</p>
        <ol className="fields" aria-label={t.fieldsLabel}>
          {fields.map((f) => {
            const note = given?.notes?.[f.name] ?? data.notes[f.name];
            return (
              <li key={f.name} className={`field field-${f.name}`}>
                <span className="field-name">{f.name}</span>
                <span className="field-bits-range">{format(t.bits, { hi: f.hi, lo: f.lo })}</span>
                <span className="field-digits">{f.digits}</span>
                <span className="field-bits">{f.bits.replace(/(.{4})(?=.)/g, "$1 ")}</span>
                {value(f) !== f.digits && <span className="field-value">{value(f)}</span>}
                {note && <span className="field-note">{note}</span>}
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------

const WideningProps = z.object({
  /** The constants, each 12 bits as three hexadecimal digits, with the lesson's label. */
  constants: z
    .array(z.object({ label: z.string(), c: z.string().regex(/^[0-9A-Fa-f]{3}$/) }))
    .min(1),
});

export const WideningFigure = withProps(
  WideningProps,
  function WideningFigure({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof WideningProps> }) {
    const t = useViewStrings().machine8;
    const [chosen, setChosen] = useState(0);
    const given = data.constants[chosen] ?? data.constants[0];
    const result = useMemo(() => widening(Number.parseInt(given?.c ?? "0", 16)), [given]);
    const bit = (w: bigint, n: number) => ((w >> BigInt(n)) & 1n).toString();
    const cell = (value: string, n: number, copied: boolean, top: boolean) => (
      <li
        key={n}
        className={`wide-bit${copied ? " copied" : ""}${top ? " top" : ""}${n % 4 === 0 && n % 16 !== 0 ? " digit-end" : ""}`}
        aria-label={`${format(t.bitLabel, { n, bit: value })}${copied ? `, ${t.copied}` : ""}`}
      >
        <span className="wide-bit-n" aria-hidden="true">
          {n}
        </span>
        <span className="wide-bit-v" aria-hidden="true">
          {value}
        </span>
      </li>
    );
    const rows = [63, 47, 31, 15];
    return (
      <div className="machine-figure widening" data-interactive={interactive.id}>
        <Chooser
          name={`${interactive.id}-choice`}
          labels={data.constants.map((c) => c.label)}
          chosen={chosen}
          onChoose={setChosen}
        />
        <p className="wide-row-label">{t.wideRow}</p>
        {rows.map((hi) => (
          <div key={hi}>
            <p className="wide-range">{format(t.bitRange, { hi, lo: hi - 15 })}</p>
            <ol className="wide-bits">
              {Array.from({ length: 16 }, (_, i) => hi - i).map((n) =>
                cell(bit(result.w, n), n, n >= 12, n === 11),
              )}
            </ol>
          </div>
        ))}
        <p className="wide-row-label">{t.constantRow}</p>
        <ol className="wide-bits wide-c">
          {Array.from({ length: 12 }, (_, i) => 11 - i).map((n) =>
            cell(bit(BigInt(result.c), n), n, false, n === 11),
          )}
        </ol>
        <p className="wide-key">{t.copyKey}</p>
        <p role="status" className="wide-readings">
          {format(t.readings, { c: result.cSigned, w: result.wSigned.toString() })}
        </p>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------

const TimelineProps = z.object({
  /** The stage's drawing: datapath-fetch, -memory or -full; Module 9's machine-edges. */
  libraryId: z.string(),
  program: z.string(),
  inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** Edges run after the reset and drawn. */
  edges: z.number().int().min(1).max(12),
  /**
   * The buses drawn, in order: a word's values are written as an address, a word or signed;
   * Module 9's `state` writes the controller's state by its name, FETCH to WRITE. A signal of
   * Module 9's control unit, named inside it (`control/PCEN`), may be given by its name alone.
   */
  signals: z
    .array(
      z.object({
        net: z.string(),
        label: z.string().optional(),
        show: z
          .enum(["address", "word", "signed", "level", "state", "bits", "cause"])
          .default("level"),
      }),
    )
    .min(1),
});

/** The controller's states by their codes, as its lane writes them. */
const STATE_NAMES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(CONTROL_STATES).map(([name, code]) => [code, name]),
);

export const EdgeTimeline = withProps(
  TimelineProps,
  function EdgeTimeline({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof TimelineProps> }) {
    const t = useViewStrings().machine8;
    const run = useMemo(() => {
      const built = buildDatapath({ libraryId: data.libraryId, program: data.program });
      const sim = startDatapath(built, { inputs: data.inputs });
      const from = sim.time;
      // A whole low half before the first edge, so the first instruction's lane has room.
      sim.tick();
      for (let k = 0; k < data.edges; k++) sim.clockCycle("CLK");
      return { circuit: built.circuit, trace: sim.trace, from, to: sim.time };
    }, [data.libraryId, data.program, data.inputs, data.edges]);
    // Only the rising edges are named, each with its number from the reset: an edge here is a
    // rise, and a fall at either end of the window would match nothing drawn in CLK's lane. Every
    // other time keeps an unnamed mark, so the axis counts no third thing beside edges and steps.
    const trace = useMemo(() => {
      const rises = new Set(
        run.trace.marks.filter((m) => m.label === "↑" && m.time > run.from).map((m) => m.time),
      );
      let n = 0;
      const marks = Array.from({ length: run.to - run.from + 1 }, (_, i) => run.from + i).map(
        (time) => ({ time, label: rises.has(time) ? format(t.edgeMark, { n: ++n }) : "" }),
      );
      return { ...run.trace, marks };
    }, [run, t.edgeMark]);
    // The cursor starts just before the first edge, on the values that edge writes, so a phone's
    // scrolled drawing opens at the start.
    const [cursor, setCursor] = useState(run.from + 1);
    // Each word's values in the run, written as the lesson asks: short enough for its lane.
    const c = run.circuit;
    const known = (n: string) =>
      [...c.inputs, ...c.outputs].some((p) => p.name === n) || c.nets.some((x) => x.name === n);
    const signals = data.signals.map((s) => {
      const name = known(s.net) ? s.net : `control/${s.net}`;
      if (s.show === "level") return { net: name, label: s.label ?? s.net };
      if (s.show === "state") return { net: name, label: s.label ?? s.net, labels: STATE_NAMES };
      const net = run.circuit.nets.find((n) => n.name === name);
      const labels: Record<string, string> = {};
      for (const e of run.trace.events) {
        if (e.net !== net?.id) continue;
        const w: Word = e.value;
        if (w.known !== (1n << BigInt(w.width)) - 1n) continue;
        labels[formatWord(w)] =
          s.show === "bits"
            ? // Module 12: C0 and C1 as their two bits, bit 1 then bit 0.
              (w.value & 3n).toString(2).padStart(2, "0")
            : s.show === "cause"
              ? // Module 12: a cause, two hexadecimal digits.
                w.value.toString(16).toUpperCase().padStart(2, "0")
              : s.show === "address"
                ? hex3(w.value)
                : s.show === "word"
                  ? hex8(Number(w.value))
                  : (w.value >= 1n << BigInt(w.width - 1)
                      ? w.value - (1n << BigInt(w.width))
                      : w.value
                    ).toString();
      }
      return { net: name, label: s.label ?? s.net, labels };
    });
    return (
      <div className="machine-figure edge-timeline" data-interactive={interactive.id}>
        <TimingDiagram
          circuit={run.circuit}
          trace={trace}
          signals={signals}
          from={run.from}
          to={run.to}
          cursor={cursor}
          onCursor={setCursor}
          title={t.timelineTitle}
        />
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------

const MapProps = z.object({
  /** The accesses shown, as columns; all four by default. */
  accesses: z.array(z.enum(["load-word", "load-byte", "store-word", "store-byte"])).optional(),
  /** Module 12: the verdicts as user mode meets them. */
  mode: z.enum(["system", "user"]).default("system"),
});

export const MemoryMapFigure = withProps(
  MapProps,
  function MemoryMapFigure({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof MapProps> }) {
    const strings = useViewStrings();
    const t = strings.machine8;
    const user = data.mode === "user";
    const accesses = data.accesses ?? ACCESSES;
    const parts = memoryMapParts();
    return (
      <div className="machine-figure memory-map-figure" data-interactive={interactive.id}>
        <div className="truth-table-wrap">
          <table className="truth-table map-table">
            <caption>{user ? strings.machine12.mapCaptionUser : t.mapCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.part}</th>
                {accesses.map((a) => (
                  <th scope="col" key={a}>
                    {t.accesses[a]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.part} className={`map-part map-${p.part}`}>
                  <th scope="row">
                    {t.parts[p.part] ?? p.part}
                    <span className="map-range">
                      {p.part === "none"
                        ? format(t.rangeAbove, { first: hex3(p.first) })
                        : format(t.range, { first: hex3(p.first), last: hex3(p.last) })}
                    </span>
                  </th>
                  {accesses.map((a) => {
                    const cause = accessVerdict(p, a, user);
                    return (
                      <td key={a} className={cause ? "map-refused" : "map-allowed"}>
                        {cause ? format(t.refused, { cause: cause.toString(16) }) : t.allowed}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------

const FlowProps = z.object({
  /** The programs, in `docs/isa.md`'s assembly, each with the lesson's label. */
  programs: z
    .array(
      z.object({
        label: z.string(),
        program: z.string(),
        inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
      }),
    )
    .min(1),
});

/** A row's height: room for two lines of "went to", which wraps between its entries on a phone. */
const ROW_H = 40;
const LANE_W = 8;
/** How far apart two arrows arriving at one line run, and the break a crossing leaves. */
const ARRIVE_STEP = 10;
const GAP = 3;

/**
 * The arrows a program's run drew: from a line to anywhere but the next one, and targets never
 * taken. The shortest span takes the lane nearest the listing, so nested arrows never cross; where
 * arrows meet one line, each arrives at its own height, the one from higher up arriving higher.
 */
function arrowsOf(lines: readonly ProgramLine[]) {
  const row = new Map(lines.map((l, i) => [l.address, i]));
  const found: { from: number; to: number; taken: boolean; r1: number; r2: number }[] = [];
  const add = (from: number, to: number, taken: boolean) =>
    found.push({ from, to, taken, r1: row.get(from) ?? 0, r2: row.get(to) ?? 0 });
  for (const l of lines) {
    for (const w of l.went) if (w.to !== l.address + 4 && row.has(w.to)) add(l.address, w.to, true);
    if (l.target !== undefined && !l.went.some((w) => w.to === l.target) && row.has(l.target))
      add(l.address, l.target, false);
  }
  const span = (a: { r1: number; r2: number }) => Math.abs(a.r1 - a.r2);
  const laned = [...found]
    .sort((x, y) => span(x) - span(y) || x.r1 - y.r1)
    .map((a, lane) => ({ ...a, lane, arrive: ROW_H / 2 }));
  for (const r of new Set(laned.map((a) => a.r2))) {
    const meeting = laned.filter((a) => a.r2 === r).sort((x, y) => x.r1 - y.r1);
    meeting.forEach((a, i) => {
      a.arrive = ROW_H / 2 + (i - (meeting.length - 1) / 2) * ARRIVE_STEP;
    });
  }
  return laned;
}

/**
 * One row's slice of the arrows: the lanes passing it, and the stubs that leave or reach it. A
 * lane that another arrow's stub crosses is broken where it crosses, so a crossing never reads as
 * a junction.
 */
function ArrowSlice({
  arrows,
  row,
  width,
  head,
}: {
  arrows: ReturnType<typeof arrowsOf>;
  row: number;
  width: number;
  head: string;
}) {
  const mid = ROW_H / 2;
  const laneX = (lane: number) => width - 6 - (lane + 1) * LANE_W;
  const stubs = arrows.flatMap((a) => [
    ...(a.r1 === row ? [{ y: mid, lane: a.lane }] : []),
    ...(a.r2 === row ? [{ y: a.arrive, lane: a.lane }] : []),
  ]);
  return (
    <svg className="flow-arrows" width={width} height={ROW_H} aria-hidden="true">
      {arrows.map((a) => {
        const x = laneX(a.lane);
        const top = Math.min(a.r1, a.r2);
        const bottom = Math.max(a.r1, a.r2);
        if (row < top || row > bottom) return null;
        const cls = a.taken ? "flow-arrow" : "flow-arrow never";
        const end = (r: number) => (r === a.r1 ? mid : a.arrive);
        const y1 = row === top ? end(top) : 0;
        const y2 = row === bottom ? end(bottom) : ROW_H;
        const pieces: [number, number][] = [];
        let from = y1;
        for (const g of stubs
          .filter((st) => st.lane > a.lane && st.y > y1 + GAP && st.y < y2 - GAP)
          .map((st) => st.y)
          .sort((p, q) => p - q)) {
          pieces.push([from, g - GAP]);
          from = g + GAP;
        }
        pieces.push([from, y2]);
        return (
          <g key={`${a.from}-${a.to}`} className={cls}>
            {pieces.map(([p, q]) => (
              <path key={p} d={`M ${x} ${p} V ${q}`} />
            ))}
            {row === a.r1 && <path d={`M ${width} ${mid} H ${x}`} />}
            {row === a.r2 && (
              <path d={`M ${x} ${a.arrive} H ${width - 1}`} markerEnd={`url(#${head})`} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const BranchTargets = withProps(
  FlowProps,
  function BranchTargets({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof FlowProps> }) {
    const t = useViewStrings().machine8;
    const [chosen, setChosen] = useState(0);
    const given = data.programs[chosen] ?? data.programs[0];
    const lines = useMemo(() => {
      if (!given) return [];
      const inputs = given.inputs;
      const word = (name: string) => {
        const v = inputs[name];
        if (v === undefined) return 0n;
        const n = BigInt(String(v));
        return n < 0n ? n + (1n << 64n) : n;
      };
      return programFlow(given.program, {
        door: Number(inputs["DOOR"] ?? 0) as 0 | 1,
        warm: Number(inputs["WARM"] ?? 0) as 0 | 1,
        sensorA: word("SENSORA"),
        sensorB: word("SENSORB"),
      });
    }, [given]);
    const arrows = arrowsOf(lines);
    const width = (arrows.length + 1) * LANE_W + 8;
    const head = `${interactive.id}-head`;
    const went = (l: ProgramLine) => {
      const out = l.went
        // A branch's way on to the next line is shown too: it is one of its two outcomes.
        .filter((w) => w.to !== l.address + 4 || l.target !== undefined)
        .map((w) => format(t.wentTo, { to: hex3(w.to), times: w.times }));
      if (l.target !== undefined && !l.went.some((w) => w.to === l.target))
        out.push(format(t.notTaken, { to: hex3(l.target) }));
      return out;
    };
    return (
      <div className="machine-figure branch-targets" data-interactive={interactive.id}>
        <Chooser
          name={`${interactive.id}-choice`}
          labels={data.programs.map((p) => p.label)}
          chosen={chosen}
          onChoose={setChosen}
        />
        <svg width={0} height={0} aria-hidden="true" className="flow-defs">
          <defs>
            <marker
              id={head}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" className="flow-head" />
            </marker>
          </defs>
        </svg>
        <div className="truth-table-wrap">
          <table className="truth-table flow-table" aria-describedby={`${interactive.id}-arrows`}>
            <caption>{t.flowCaption}</caption>
            <thead>
              <tr>
                <td aria-hidden="true" />
                <th scope="col">{t.address}</th>
                <th scope="col">{t.instruction}</th>
                <th scope="col">{t.went}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.address}>
                  <td className="flow-arrow-cell" aria-hidden="true">
                    <ArrowSlice arrows={arrows} row={i} width={width} head={head} />
                  </td>
                  <th scope="row" className="memory-word">
                    {hex3(l.address)}
                  </th>
                  <td className="memory-word">{l.text}</td>
                  <td className="memory-word flow-went">
                    {went(l).map((w, k, all) => (
                      <span key={w}>
                        {w}
                        {k < all.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p id={`${interactive.id}-arrows`} className="visually-hidden">
          {t.arrowsLabel}
        </p>
      </div>
    );
  },
);
