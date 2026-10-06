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
  accessVerdict,
  buildDatapath,
  instructionFields,
  instructionWord,
  memoryMapParts,
  programFlow,
  startDatapath,
  widening,
  type ProgramLine,
} from "@dd/dd-model";
import type { InteractiveProps } from "@dd/lesson-runtime";
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

const FieldsProps = z.object({
  /** The instructions, as lines of assembly or eight hexadecimal digits after `0x`. */
  instructions: z.array(z.object({ label: z.string(), text: z.string() })).min(1),
  /** Where each field goes, in the lesson's words; a field without a note shows none. */
  notes: z
    .object({
      K: z.string().optional(),
      J: z.string().optional(),
      A: z.string().optional(),
      B: z.string().optional(),
      Y: z.string().optional(),
      C: z.string().optional(),
    })
    .default({}),
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
            const note = data.notes[f.name];
            return (
              <li key={f.name} className={`field field-${f.name}`}>
                <span className="field-name">{f.name}</span>
                <span className="field-bits-range">{format(t.bits, { hi: f.hi, lo: f.lo })}</span>
                <span className="field-digits">{f.digits}</span>
                <span className="field-bits">{f.bits}</span>
                <span className="field-value">
                  {f.name === "A" || f.name === "B" || f.name === "Y"
                    ? format(t.register, { n: f.value })
                    : f.name === "C"
                      ? format(t.signedValue, { value: f.signed ?? f.value })
                      : f.value}
                </span>
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
        className={`wide-bit${copied ? " copied" : ""}${top ? " top" : ""}`}
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
        <p className="wide-row-label">{t.constantRow}</p>
        <ol className="wide-bits wide-c">
          {Array.from({ length: 12 }, (_, i) => 11 - i).map((n) =>
            cell(bit(BigInt(result.c), n), n, false, n === 11),
          )}
        </ol>
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
  /** The stage's drawing: datapath-fetch, -memory or -full. */
  libraryId: z.string(),
  program: z.string(),
  inputs: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** Edges run after the reset and drawn. */
  edges: z.number().int().min(1).max(12),
  /** The buses drawn, in order: a word's values are written as an address, a word or signed. */
  signals: z
    .array(
      z.object({
        net: z.string(),
        label: z.string().optional(),
        show: z.enum(["address", "word", "signed", "level"]).default("level"),
      }),
    )
    .min(1),
});

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
    // The cursor starts on the first edge, so a phone's scrolled drawing opens at the start.
    const [cursor, setCursor] = useState(run.from + 2);
    // Each word's values in the run, written as the lesson asks: short enough for its lane.
    const signals = data.signals.map((s) => {
      if (s.show === "level") return s.label ? { net: s.net, label: s.label } : s.net;
      const net = run.circuit.nets.find((n) => n.name === s.net);
      const labels: Record<string, string> = {};
      for (const e of run.trace.events) {
        if (e.net !== net?.id) continue;
        const w: Word = e.value;
        if (w.known !== (1n << BigInt(w.width)) - 1n) continue;
        labels[formatWord(w)] =
          s.show === "address"
            ? hex3(w.value)
            : s.show === "word"
              ? hex8(Number(w.value))
              : (w.value >= 1n << BigInt(w.width - 1)
                  ? w.value - (1n << BigInt(w.width))
                  : w.value
                ).toString();
      }
      return { net: s.net, label: s.label ?? s.net, labels };
    });
    return (
      <div className="machine-figure edge-timeline" data-interactive={interactive.id}>
        <TimingDiagram
          circuit={run.circuit}
          trace={run.trace}
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
});

export const MemoryMapFigure = withProps(
  MapProps,
  function MemoryMapFigure({
    data,
    interactive,
  }: InteractiveProps & { data: z.infer<typeof MapProps> }) {
    const t = useViewStrings().machine8;
    const accesses = data.accesses ?? ACCESSES;
    const parts = memoryMapParts();
    return (
      <div className="machine-figure memory-map-figure" data-interactive={interactive.id}>
        <div className="truth-table-wrap">
          <table className="truth-table map-table">
            <caption>{t.mapCaption}</caption>
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
                      {format(t.range, { first: hex3(p.first), last: hex3(p.last) })}
                    </span>
                  </th>
                  {accesses.map((a) => {
                    const cause = accessVerdict(p, a);
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

const ROW_H = 30;
const LANE_W = 8;

/** The arrows a program's run drew: from a line to anywhere but the next one, and targets never taken. */
function arrowsOf(lines: readonly ProgramLine[]) {
  const row = new Map(lines.map((l, i) => [l.address, i]));
  const arrows: { from: number; to: number; taken: boolean; times: number }[] = [];
  for (const l of lines) {
    for (const w of l.went)
      if (w.to !== l.address + 4 && row.has(w.to))
        arrows.push({ from: l.address, to: w.to, taken: true, times: w.times });
    if (l.target !== undefined && !l.went.some((w) => w.to === l.target) && row.has(l.target))
      arrows.push({ from: l.address, to: l.target, taken: false, times: 0 });
  }
  return arrows.map((a, lane) => ({
    ...a,
    lane,
    r1: row.get(a.from) ?? 0,
    r2: row.get(a.to) ?? 0,
  }));
}

/** One row's slice of the arrows: the lanes passing it, and the stubs that leave or reach it. */
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
  return (
    <svg className="flow-arrows" width={width} height={ROW_H} aria-hidden="true">
      {arrows.map((a) => {
        const x = width - 6 - (a.lane + 1) * LANE_W;
        const top = Math.min(a.r1, a.r2);
        const bottom = Math.max(a.r1, a.r2);
        if (row < top || row > bottom) return null;
        const cls = a.taken ? "flow-arrow" : "flow-arrow never";
        const y1 = row === top ? mid : 0;
        const y2 = row === bottom ? mid : ROW_H;
        return (
          <g key={`${a.from}-${a.to}`} className={cls}>
            <path d={`M ${x} ${y1} V ${y2}`} />
            {row === a.r1 && <path d={`M ${width} ${mid} H ${x}`} />}
            {row === a.r2 && (
              <path d={`M ${x} ${mid} H ${width - 1}`} markerEnd={`url(#${head})`} />
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
        .filter((w) => w.to !== l.address + 4)
        .map((w) => format(t.wentTo, { to: hex3(w.to), times: w.times }));
      if (l.target !== undefined && !l.went.some((w) => w.to === l.target))
        out.push(format(t.notTaken, { to: hex3(l.target) }));
      return out.join(", ");
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
                  <td className="memory-word">{went(l)}</td>
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
