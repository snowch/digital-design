// Copyright © 2026 Christopher Snow

// Module 10's figures, each a view of the implementation:
//
// - `machine-parts`: each part lesson 1 names, as each machine's circuit has it.
// - `machine-compare`: Module 8's machine and Module 9's run one program side by side, from
//   reset, in two simulators (packages/dd-model: machine-compare.ts). The learner moves Module 9's
//   machine an edge or an instruction at a time; Module 8's takes its one edge when Module 9's
//   instruction ends. Tables show what a program can see on each machine, with each part that
//   differs marked, what Module 9's machine keeps of its own, and every instruction run with the
//   edges each machine took. A fault may be put into Module 9's machine.
//
// - `constant-map`: every 12-bit constant used as an address, widened by the widen block
//   (simulated), and the part of the memory map that answers there, or the cause that stops a load.
//
// The words are in strings10.ts; the lesson gives what only it knows (the program, the registers
// to show, the faults and their outcomes, the question).

import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import {
  MODULE_9,
  assemble,
  branchSays,
  calculate,
  comparisons,
  runProgram,
  courseLayout,
  edgePair,
  fieldsOf,
  instructionFields,
  meaningOf,
  packedLayout,
  parseHexWord,
  parseNumberWord,
  widening,
  type AssemblyOptions,
  type Entry,
  type Layout,
  type MachineOptions,
  type Meaning,
  type StopReason,
  instructionPair,
  pairView,
  runPair,
  startPair,
  type MachineInputs,
  type MachinePair,
  machineParts,
  constantRanges,
  type PartForm,
  type PartRow,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { FaultInjector, PredictionChallenge } from "@platform/primitives";

import { format, useViewStrings, youChose } from "../strings";
import type { Machine10Strings } from "../strings10";
import { FaultSpec, toFault } from "./FaultLab";
import { withProps } from "./props";

const hex3 = (v: number | bigint) => v.toString(16).toUpperCase().padStart(3, "0");
const signed = (v: bigint | undefined) => (v === undefined ? "X" : BigInt.asIntN(64, v).toString());
const hexWord = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asUintN(64, v).toString(16).toUpperCase();

/** The shop's inputs as a lesson writes them: SENSORA and SENSORB as signed decimals. */
const ShopInputs = z
  .object({
    DOOR: z.number().int().min(0).max(1).default(0),
    WARM: z.number().int().min(0).max(1).default(0),
    SENSORA: z.string().default("0"),
    SENSORB: z.string().default("0"),
  })
  .default({ DOOR: 0, WARM: 0, SENSORA: "0", SENSORB: "0" });

function shop(given: z.infer<typeof ShopInputs>): MachineInputs {
  return {
    door: given.DOOR as 0 | 1,
    warm: given.WARM as 0 | 1,
    sensorA: BigInt(given.SENSORA),
    sensorB: BigInt(given.SENSORB),
  };
}

interface Stored {
  readonly choice?: string;
}

// ---------------------------------------------------------------------------------------------

const CompareProps = z.object({
  /** The program in the ROM of both machines, in docs/isa.md's assembly. */
  program: z.string(),
  inputs: ShopInputs,
  /** The registers the table of what a program can see lists, by number. */
  shown: z.array(z.number().int().min(0).max(15)).min(1),
  /** Module 9's edges made before the figure first shows. */
  edges: z.number().int().min(0).max(40).default(0),
  /** Faults to choose from, put into Module 9's machine; each `outcome` shows once it has run. */
  faults: z.array(FaultSpec).default([]),
  /** Shown once the learner has run the program to its stop (and every fault, if any). */
  outcomes: z.string().optional(),
  /** Optional: commit to what the machines differ on now, before the tables show. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
});
type CompareData = z.infer<typeof CompareProps>;

/** The answer to the question: what the two machines differ on as the figure first shows. */
export function compareAnswer(data: Pick<CompareData, "program" | "inputs" | "edges">): string {
  const pair = startPair(data.program, shop(data.inputs));
  for (let k = 0; k < data.edges; k++) edgePair(pair);
  const differ = pairView(pair).differ;
  return differ.length ? differ.join(", ") : "nothing";
}

const RUN_LIMIT = 200;

export const MachineCompare = withProps(
  CompareProps,
  function MachineCompare({ data, interactive, store }: InteractiveProps & { data: CompareData }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const faults = useMemo(() => data.faults.map(toFault), [data.faults]);
    const [faultAt, setFaultAt] = useState(-1);
    const start = (at: number) => {
      const f = faults[at];
      const pair = startPair(data.program, shop(data.inputs), f ? [f] : []);
      for (let k = 0; k < data.edges; k++) edgePair(pair);
      return pair;
    };
    const pair = useRef<MachinePair>(undefined as unknown as MachinePair);
    if (!pair.current) pair.current = start(-1);
    const [, setGeneration] = useState(0);
    const bump = () => setGeneration((g) => g + 1);
    const [gaveUp, setGaveUp] = useState(false);
    // The faults run to their stop, each shown its own outcome once it has; -1 is no fault.
    const [ranTo, setRanTo] = useState<ReadonlySet<number>>(new Set());
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(
      () => (asking ? compareAnswer(data) : ""),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [asking, data.program, data.edges],
    );
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");

    const p = pair.current;
    const view = pairView(p);
    const stopped = p.log.at(-1)?.stops === true;
    const note = () => {
      if (p.log.at(-1)?.stops) setRanTo((was) => new Set([...was, faultAt]));
    };
    const act = (move: (pp: MachinePair) => void) => {
      move(p);
      note();
      bump();
    };
    const run = () => {
      runPair(p, RUN_LIMIT);
      setGaveUp(!p.log.at(-1)?.stops);
      note();
      bump();
    };
    const restart = (at: number) => {
      pair.current = start(at);
      setGaveUp(false);
      bump();
    };

    const rows: { name: string; one: string; many: string; differs: boolean }[] = [
      {
        name: t.pc,
        one: view.single.pc === undefined ? "X" : hex3(view.single.pc),
        many: view.multi.pc === undefined ? "X" : hex3(view.multi.pc),
        differs: view.differ.includes("PC"),
      },
      ...data.shown.map((k) => ({
        name: format(t.register, { n: k }),
        one: signed(view.single.regs[k]),
        many: signed(view.multi.regs[k]),
        differs: view.differ.includes(`R${k}`),
      })),
      {
        name: t.display,
        one: signed(view.single.display),
        many: signed(view.multi.display),
        differs: view.differ.includes("display"),
      },
    ];
    const own: [string, string][] = [
      [t.state, view.own.state ?? "X"],
      ["IR", view.own.ir === undefined ? "X" : hexWord(view.own.ir).padStart(8, "0")],
      ["HA", hexWord(view.own.ha)],
      ["HB", hexWord(view.own.hb)],
      ["HR", hexWord(view.own.hr)],
      ["HM", hexWord(view.own.hm)],
    ];
    const status = stopped
      ? t.statusStopped
      : gaveUp
        ? format(t.statusGaveUp, { n: p.log.length })
        : p.edgesIn > 0
          ? format(t.statusIn, { k: p.edgesIn, address: hex3(view.multi.pc ?? 0n) })
          : t.statusBetween;
    const allRan = faults.length === 0 ? ranTo.size > 0 : faults.every((_, i) => ranTo.has(i));

    return (
      <div className="explorer machine-compare" data-interactive={interactive.id}>
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
        {faults.length > 0 && (
          <FaultInjector
            name={`${interactive.id}-fault`}
            legend={strings.fault.choose}
            noneLabel={strings.fault.healthy}
            faults={faults}
            chosen={faultAt}
            onChoose={(i) => {
              setFaultAt(i);
              restart(i);
            }}
          />
        )}
        {committed && (
          <>
            <p role="status" className="datapath-status">
              {status}
            </p>
            <div className="explorer-actions">
              <button
                type="button"
                className="button"
                disabled={stopped}
                onClick={() => act(edgePair)}
              >
                {t.clock}
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={stopped}
                onClick={() => act(instructionPair)}
              >
                {t.next}
              </button>
              <button type="button" className="button secondary" disabled={stopped} onClick={run}>
                {t.run}
              </button>
              <button type="button" className="button secondary" onClick={() => restart(faultAt)}>
                {t.reset}
              </button>
            </div>
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table compare-seen">
                <caption>{t.seenCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.part}</th>
                    <th scope="col">{t.singleName}</th>
                    <th scope="col">{t.multiName}</th>
                    <th scope="col">{t.differs}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.name} className={r.differs ? "row-current" : ""}>
                      <th scope="row">{r.name}</th>
                      <td className="memory-word">{r.one}</td>
                      <td className="memory-word">{r.many}</td>
                      <td className="cell-now">{r.differs ? t.differsMark : t.agree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table compare-own">
                <caption>{t.ownCaption}</caption>
                <tbody>
                  {own.map(([name, value]) => (
                    <tr key={name}>
                      <th scope="row">{name}</th>
                      <td className="memory-word">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-note">{t.ownNote}</p>
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table compare-log">
                <caption>{t.logCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.instruction}</th>
                    <th scope="col">{t.singleEdges}</th>
                    <th scope="col">{t.multiEdges}</th>
                    <th scope="col">{t.after}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.log.length === 0 ? (
                    <tr>
                      <td colSpan={4}>{t.logNone}</td>
                    </tr>
                  ) : (
                    p.log.map((l, k) => (
                      <tr key={k} className={l.differ.length ? "row-current" : ""}>
                        <td className="memory-word">
                          <span className="compare-address">{hex3(l.address)}</span> {l.text}
                        </td>
                        <td>{l.singleEdges}</td>
                        <td>{l.edges}</td>
                        <td>
                          {l.stops
                            ? t.stops
                            : l.differ.length
                              ? format(t.disagree, { names: l.differ.join(", ") })
                              : t.agree}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {faultAt >= 0 && ranTo.has(faultAt) && data.faults[faultAt]?.outcome && (
          <Prose markdown={data.faults[faultAt]?.outcome ?? ""} />
        )}
        {allRan && data.outcomes && <Prose markdown={data.outcomes} />}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `layout-compare`: one instruction in the course's layout and in a packed one, digit by digit,
// with each layout's constant range and the fields the packed layout moves (encoding.ts).

const Choice = z.object({ label: z.string(), text: z.string() });

const LayoutProps = z.object({
  /** The instructions to choose from: a line of docs/isa.md's assembly, or `0x` and 8 digits. */
  instructions: z.array(Choice).min(1),
  /**
   * Optional: commit to which fields the packed layout moves for the first instruction (`none`,
   * or the names joined by ", ") before the layouts show.
   */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /**
   * Instructions held back until a prediction elsewhere on the page is checked (10.2): its own
   * instruction, whose layouts would answer it on one click.
   */
  holdUntil: z.object({ prediction: z.string(), texts: z.array(z.string()) }).optional(),
});

/** The question's answer: the fields the packed layout moves for the first instruction. */
export function layoutAnswer(data: {
  readonly instructions: readonly { readonly text: string }[];
}): string {
  const moved = packedLayout(wordOfText(data.instructions[0]?.text ?? "0x00000000")).moved;
  return moved.length ? moved.join(", ") : "none";
}

/** A word given as eight digits after `0x`, or as a line the authors' assembler reads. */
function wordOfText(text: string, assembly: AssemblyOptions = {}): number {
  if (/^0x[0-9a-f]{8}$/i.test(text)) return Number.parseInt(text.slice(2), 16) >>> 0;
  const line = assemble(text, assembly).lines.find((l) => l.instruction !== undefined);
  return (line?.instruction ?? 0) >>> 0;
}

const hex8 = (v: number) => (v >>> 0).toString(16).toUpperCase().padStart(8, "0");

function LayoutRow({ layout, title }: { layout: Layout; title: string }) {
  const t = useViewStrings().machine10;
  const digits = hex8(layout.word);
  const c = layout.fields.find((f) => f.name === "C");
  return (
    <div className="layout-row">
      <p className="layout-title">{title}</p>
      <p className="fields-word">{format(t.layoutWord, { word: digits })}</p>
      <ol className="layout-digits" aria-label={title}>
        {layout.fields.map((f) => (
          <li
            key={f.name}
            className={`layout-field layout-${f.name}${layout.moved.includes(f.name) ? " moved" : ""}`}
            style={{ gridColumn: `${8 - f.hi} / span ${f.hi - f.lo + 1}` }}
          >
            <span className="layout-name">{f.name}</span>
            <span className="layout-value">{digits.slice(7 - f.hi, 8 - f.lo)}</span>
          </li>
        ))}
      </ol>
      <p className="layout-range">
        {c
          ? format(t.layoutRange, { bits: layout.constantBits, min: layout.min, max: layout.max })
          : ""}
      </p>
    </div>
  );
}

export const LayoutCompare = withProps(
  LayoutProps,
  function LayoutCompare({
    data,
    interactive,
    store,
  }: InteractiveProps & { data: z.infer<typeof LayoutProps> }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const [predicted] = useSlot<unknown>(store, data.holdUntil?.prediction ?? interactive.id);
    const held = new Set(data.holdUntil && predicted === undefined ? data.holdUntil.texts : []);
    const instructions = data.instructions.filter((c) => !held.has(c.text));
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(() => (asking ? layoutAnswer(data) : ""), [asking, data]);
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    // The choice is kept by its text, so an instruction held back and then shown keeps the
    // learner's choice where it was.
    const [chosen, setChosen] = useState<string>();
    const given = instructions.find((c) => c.text === chosen) ?? instructions[0];
    const instruction = useMemo(() => (given ? wordOfText(given.text) : 0), [given]);
    const course = courseLayout(instruction);
    const packed = packedLayout(instruction);
    return (
      <div className="machine-figure layout-compare" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <PredictionChallenge
              name={`${interactive.id}-question`}
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
                    {format(t.layoutAnswer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
          </div>
        )}
        {committed && instructions.length > 1 && (
          <fieldset className="carry-cases">
            <legend>{strings.machine8.choose}</legend>
            {instructions.map((c) => (
              <label key={c.label} className="fault-choice">
                <input
                  type="radio"
                  name={`${interactive.id}-choice`}
                  checked={c === given}
                  onChange={() => setChosen(c.text)}
                />
                <span>{c.label}</span>
              </label>
            ))}
            {held.size > 0 && (
              <p className="layout-held">{format(t.layoutsHeld, { n: held.size })}</p>
            )}
          </fieldset>
        )}
        {committed && (
          <>
            <LayoutRow layout={course} title={t.courseLayout} />
            <LayoutRow layout={packed} title={t.packedLayout} />
            <p role="status" className="layout-moved">
              {packed.moved.length
                ? format(t.layoutMoved, { names: packed.moved.join(", ") })
                : t.layoutStill}
            </p>
          </>
        )}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `encoding-explorer`: a word typed or chosen, its fields, what the machine makes of it and its
// constant widened (machine.ts, encoding.ts); and the course's calculator, Module 7's ALU from
// the library at 16 or 64 bits, simulated, with the job and B taken from the word on request.

const ExplorerProps = z.object({
  /** Words offered to try, each a label and a line of assembly or `0x` and 8 digits. */
  words: z.array(Choice).default([]),
  /** The calculator under the explorer. */
  calculator: z.boolean().default(true),
  width: z.union([z.literal(16), z.literal(64)]).default(64),
  /** Module 10's capstone: the learner's copy, with set if at kind A and kind 9's call. */
  capstone: z.boolean().default(false),
  /**
   * A prediction on the page that these words would answer (10.2): the figure, and its outcome,
   * wait until it is checked.
   */
  holdUntil: z.string().optional(),
  /** Shown under the figure once it shows: what its words show. */
  outcome: z.string().optional(),
});

function entryText(t: ReturnType<typeof useViewStrings>["machine10"], e: Entry): string {
  if ("value" in e) return "";
  const p = e.problem;
  switch (p.kind) {
    case "empty":
      return t.entryEmpty;
    case "not-hex":
      return format(t.entryNotHex, { char: p.char });
    case "hex-too-long":
      return format(t.entryHexLong, { digits: p.digits });
    case "not-number":
      return format(t.entryNotNumber, { char: p.char });
    case "number-range":
      return format(t.entryRange, { min: p.min.toString(), max: p.max.toString() });
  }
}

/** A meaning in the figure's words. */
function meaningText(
  t: ReturnType<typeof useViewStrings>["machine10"],
  m: Meaning,
  k: number,
  j: number,
): string {
  const job = (n: number) => t.jobs[String(n)] ?? "";
  const cond = (n: number) => t.conds[String(n)] ?? "";
  const address = (a: number | undefined, c: number) =>
    a === undefined
      ? hex3(c & 0xfff)
      : c === 0
        ? `R${a}`
        : `R${a} ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
  const M = t.meanings;
  switch (m.form) {
    case "register":
      if (m.job === 5) return format(M["registerCopy"] ?? "", m);
      if (m.job === 6) return format(M["registerUp"] ?? "", m);
      if (m.job === 7) return format(M["registerDown"] ?? "", m);
      return format(M["register"] ?? "", { ...m, job: job(m.job) });
    case "constant":
      if (m.job === 5) return format(M["constantCopy"] ?? "", m);
      if (m.job === 6) return format(M["registerUp"] ?? "", m);
      if (m.job === 7) return format(M["registerDown"] ?? "", m);
      return format(M["constant"] ?? "", { ...m, job: job(m.job) });
    case "load":
      return format(M[m.byte ? "loadByte" : "loadWord"] ?? "", {
        y: m.y,
        address: address(m.a, m.c),
      });
    case "store":
      return format(M[m.byte ? "storeByte" : "storeWord"] ?? "", {
        b: m.b,
        address: address(m.a, m.c),
      });
    case "branch":
      if (m.cond === 0) return format(M["branchAlways"] ?? "", m);
      if (m.cond === 1) return M["branchNever"] ?? "";
      return format(M["branch"] ?? "", {
        ...m,
        cond: cond(m.cond),
        reading: t.condReadings[String(m.cond)] ?? "",
      });
    case "call":
      return format(M["call"] ?? "", m);
    case "jump":
      return format(M["jump"] ?? "", m);
    case "system":
      return format(t.systemJobs[String(m.job)] ?? "", m);
    case "setIf":
      if (m.cond === 0 || m.cond === 1)
        return format(M["setIfFixed"] ?? "", { y: m.y, n: m.cond === 0 ? 1 : 0 });
      return format(M["setIf"] ?? "", {
        ...m,
        cond: cond(m.cond),
        reading: t.condReadings[String(m.cond)] ?? "",
      });
    case "callRegister":
      return format(M["callRegister"] ?? "", m);
    case "illegal":
      return format(t.illegal[m.why] ?? "", {
        k: k.toString(16).toUpperCase(),
        j: j.toString(16).toUpperCase(),
        c: 0,
      });
  }
}

const bitText = (w: bigint, width: number) => w.toString(2).padStart(width, "0");

export const EncodingExplorer = withProps(
  ExplorerProps,
  function EncodingExplorer({
    data,
    interactive,
    store,
  }: InteractiveProps & { data: z.infer<typeof ExplorerProps> }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const [predicted] = useSlot<unknown>(store, data.holdUntil ?? interactive.id);
    const held = data.holdUntil !== undefined && predicted === undefined;
    const options: MachineOptions = data.capstone ? { setIf: 10, callThroughRegister: 9 } : {};
    const assembly = data.capstone ? { setIf: 10, callThroughRegister: 9 } : {};
    const firstWord = data.words[0] ? hex8(wordOfText(data.words[0].text, assembly)) : "13123000";
    const [text, setText] = useState(firstWord);
    const typed = parseHexWord(text, 32);
    const instruction = "value" in typed ? Number(typed.value) >>> 0 : undefined;
    const fields = instruction === undefined ? [] : instructionFields(instruction);
    const meaning = instruction === undefined ? undefined : meaningOf(instruction, options);
    const f = instruction === undefined ? undefined : fieldsOf(instruction);
    const wide = f ? widening(f.raw) : undefined;
    const meaningLine =
      meaning && f
        ? meaning.form === "illegal" && meaning.why === "number"
          ? format(t.illegal["number"] ?? "", { c: f.c })
          : meaningText(t, meaning, f.k, f.j)
        : "";

    // The calculator.
    const [width, setWidth] = useState<16 | 64>(data.width);
    const [form, setForm] = useState<"hex" | "signed">("signed");
    const [aText, setAText] = useState("-184");
    const [bText, setBText] = useState("-250");
    const [job, setJob] = useState(3);
    const [took, setTook] = useState<string | undefined>();
    /** Whether B is still the word's constant, as the button took it. */
    const [tookB, setTookB] = useState(false);
    const parse = (s: string) =>
      form === "hex" ? parseHexWord(s, width) : parseNumberWord(s, width);
    const a = parse(aText);
    const b = parse(bText);
    const result =
      "value" in a && "value" in b ? calculate(width, job, a.value, b.value) : undefined;
    const signedOf = (v: bigint) => {
      const top = 1n << BigInt(width - 1);
      return (v >= top ? v - (1n << BigInt(width)) : v).toString();
    };
    const showWord = (v: bigint) => (form === "hex" ? v.toString(16).toUpperCase() : signedOf(v));
    /** A switch of form converts the words typed, so A and B keep their values. */
    const switchForm = (to: "hex" | "signed") => {
      const shown = (e: Entry, was: string) =>
        "value" in e
          ? to === "hex"
            ? e.value.toString(16).toUpperCase()
            : signedOf(e.value)
          : was;
      setAText(shown(a, aText));
      setBText(shown(b, bText));
      setForm(to);
    };
    const takeFromWord = () => {
      if (!f || (f.k !== 1 && f.k !== 2) || f.j > 7) {
        setTook(t.fromWordNone);
        setTookB(false);
        return;
      }
      setJob(f.j);
      setTook(format(t.tookJob, { job: `${f.j} ${t.jobNames[String(f.j)] ?? ""}`.trim() }));
      setTookB(f.k === 2 && wide !== undefined);
      if (f.k === 2 && wide) setBText(showWord(BigInt.asUintN(width, wide.w)));
    };
    const rows: number[] = [];
    for (let hi = width - 1; hi >= 0; hi -= 16) rows.push(hi);

    if (held)
      return (
        <div className="machine-figure" data-interactive={interactive.id}>
          <p className="watch-note">{t.heldNote}</p>
        </div>
      );
    const figure = (
      <div className="machine-figure encoding-explorer" data-interactive={interactive.id}>
        <label className="answer-field explorer-word">
          <span className="answer-label">{t.wordLabel}</span>
          <span className="answer-input">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </span>
        </label>
        <p className="explorer-help">
          {"value" in typed ? t.wordHelp : format(t.wordProblem, { n: 8 })}
        </p>
        {data.words.length > 0 && (
          <fieldset className="carry-cases">
            <legend>{t.examples}</legend>
            {data.words.map((w) => {
              const digits = hex8(wordOfText(w.text, assembly));
              return (
                <label key={w.label} className="fault-choice">
                  <input
                    type="radio"
                    name={`${interactive.id}-word`}
                    checked={text.replace(/\s/g, "").toUpperCase() === digits}
                    onChange={() => setText(digits)}
                  />
                  <span>{w.label}</span>
                </label>
              );
            })}
          </fieldset>
        )}
        {instruction !== undefined && (
          <>
            <ol className="fields" aria-label={t.fieldsLabel}>
              {fields.map((x) => (
                <li key={x.name} className={`field field-${x.name}`}>
                  <span className="field-name">{x.name}</span>
                  <span className="field-bits-range">
                    {format(strings.machine8.bits, { hi: x.hi, lo: x.lo })}
                  </span>
                  <span className="field-digits">{x.digits}</span>
                  <span className="field-bits">{x.bits.replace(/(.{4})(?=.)/g, "$1 ")}</span>
                </li>
              ))}
            </ol>
            <p className="explorer-meaning-heading">{t.meaningHeading}</p>
            <p role="status" className="explorer-meaning">
              {meaningLine}
            </p>
            {wide && (
              <p className="explorer-widened">
                {format(t.widened, {
                  c: hex3(f?.raw ?? 0),
                  w: BigInt.asUintN(64, wide.w).toString(16).toUpperCase().padStart(16, "0"),
                  n: wide.wSigned.toString(),
                })}
              </p>
            )}
          </>
        )}
        {data.calculator && (
          <section className="calculator" aria-label={t.calcHeading}>
            <p className="calculator-heading">{t.calcHeading}</p>
            <fieldset className="carry-cases">
              <legend>{t.widthLegend}</legend>
              {([16, 64] as const).map((n) => (
                <label key={n} className="fault-choice">
                  <input
                    type="radio"
                    name={`${interactive.id}-width`}
                    checked={width === n}
                    onChange={() => setWidth(n)}
                  />
                  <span>{format(t.widthOption, { n })}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="carry-cases">
              <legend>{t.formLegend}</legend>
              {(["signed", "hex"] as const).map((k) => (
                <label key={k} className="fault-choice">
                  <input
                    type="radio"
                    name={`${interactive.id}-form`}
                    checked={form === k}
                    onChange={() => switchForm(k)}
                  />
                  <span>{k === "hex" ? t.formHex : t.formSigned}</span>
                </label>
              ))}
            </fieldset>
            {(
              [
                [t.aLabel, aText, setAText, a],
                [
                  t.bLabel,
                  bText,
                  (v: string) => {
                    setBText(v);
                    setTookB(false);
                  },
                  b,
                ],
              ] as const
            ).map(([label, value, set, entry]) => (
              <label key={label} className="answer-field">
                <span className="answer-label">{label}</span>
                <span className="answer-input">
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                  />
                </span>
                {"problem" in entry && <span className="answer-unit">{entryText(t, entry)}</span>}
              </label>
            ))}
            <label className="answer-field">
              <span className="answer-label">{t.jobLabel}</span>
              <span className="answer-input">
                <select value={job} onChange={(e) => setJob(Number(e.target.value))}>
                  {Array.from({ length: 8 }, (_, k) => (
                    <option key={k} value={k}>
                      {format(t.jobOption, {
                        k: k.toString(2).padStart(3, "0"),
                        name: t.jobNames[String(k)] ?? "",
                      })}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <div className="explorer-actions">
              <button type="button" className="button secondary" onClick={takeFromWord}>
                {t.fromWord}
              </button>
            </div>
            {took && <p className="calculator-took">{tookB ? `${took} ${t.tookB}` : took}</p>}
            {result && (
              <div className="calculator-result" role="group" aria-label={t.yHeading}>
                <p className="calculator-y">
                  <span className="field-name">{t.yHeading}</span> {t.yHex}{" "}
                  <code>
                    {result.y.value
                      .toString(16)
                      .toUpperCase()
                      .padStart(width / 4, "0")}
                  </code>
                  , {t.yUnsigned} <code>{result.y.value.toString()}</code>, {t.ySigned}{" "}
                  <code>{signedOf(result.y.value)}</code>
                </p>
                {rows.map((hi) => (
                  <p key={hi} className="calculator-bits">
                    <span className="wide-range">{format(t.bitsRow, { hi, lo: hi - 15 })}</span>{" "}
                    <code>
                      {bitText(result.y.value, width)
                        .slice(width - 1 - hi, width - hi + 15)
                        .replace(/(.{4})(?=.)/g, "$1 ")}
                    </code>
                  </p>
                ))}
                <p className="calculator-flags">
                  {t.flagsLabel}:{" "}
                  {(
                    [
                      ["ZERO", result.zero],
                      ["MINUS", result.minus],
                      ["COUT", result.cout],
                      ["OVER", result.over],
                    ] as const
                  )
                    .map(([name, value]) => format(t.flag, { name, value }))
                    .join(", ")}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    );
    return (
      <>
        {figure}
        {data.outcome && <Prose markdown={data.outcome} />}
      </>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `swap-compare`: two registers' words and every comparison a program needs, each said by one of
// the machine's branches, with A and B in order or swapped; whether the reference takes that
// branch, and whether the comparison holds (programs10.ts).

const SwapProps = z.object({
  /** Pairs of words for R1 and R2, signed decimals, each with the lesson's label. */
  cases: z.array(z.object({ label: z.string(), a: z.string(), b: z.string() })).min(1),
  /**
   * Optional: commit to the branch that says R1 > R2, read as `reading`, before the table shows.
   * Each option's value is a branch: its job and `swap` or `keep`, as `6:swap`.
   */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  reading: z.enum(["signed", "unsigned"]).default("signed"),
});

/** The question's answer: the option whose branch is taken exactly when R1 > R2 in every case. */
export function swapAnswer(given: z.input<typeof SwapProps>): string {
  const data = SwapProps.parse(given);
  const says = (value: string) => {
    const [job, order] = value.split(":");
    return data.cases.every((c) => {
      const want = comparisons(BigInt(c.a), BigInt(c.b)).find(
        (x) => x.relation === ">" && x.reading === data.reading,
      )?.holds;
      return branchSays(Number(job), order === "swap", BigInt(c.a), BigInt(c.b)) === want;
    });
  };
  return data.options?.find((o) => says(o.value))?.value ?? "";
}

export const SwapCompare = withProps(
  SwapProps,
  function SwapCompare({
    data,
    interactive,
    store,
  }: InteractiveProps & { data: z.infer<typeof SwapProps> }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const [chosen, setChosen] = useState(0);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(() => (asking ? swapAnswer(data) : ""), [asking, data]);
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    const given = data.cases[chosen] ?? data.cases[0];
    const rows = given ? comparisons(BigInt(given.a), BigInt(given.b)) : [];
    const branchText = (job: number, swapped: boolean) =>
      format(t.branchForm, {
        a: swapped ? "R2" : "R1",
        b: swapped ? "R1" : "R2",
        cond: t.conds[String(job)] ?? "",
        reading: t.condReadings[String(job)] ?? "",
      });
    return (
      <div className="machine-figure swap-compare" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <PredictionChallenge
              name={`${interactive.id}-question`}
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
                    {format(t.swapAnswer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
          </div>
        )}
        {asking && !committed && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table swap-pairs">
              <caption>{t.pairsCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">R1</th>
                  <th scope="col">R2</th>
                </tr>
              </thead>
              <tbody>
                {data.cases.map((c) => (
                  <tr key={c.label}>
                    <td>{c.a}</td>
                    <td>{c.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {asking && committed && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table swap-asked">
              <caption>{t.askedCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.branch}</th>
                  {data.cases.map((c) => (
                    <th scope="col" key={c.label}>
                      {format(t.pairHeading, { a: c.a, b: c.b })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    {format(t.relationForm, {
                      rel: t.relations[">"] ?? ">",
                      reading: data.reading === "signed" ? t.signedWord : t.unsignedWord,
                    })}
                  </th>
                  {data.cases.map((c) => (
                    <td key={c.label}>
                      {comparisons(BigInt(c.a), BigInt(c.b)).find(
                        (x) => x.relation === ">" && x.reading === data.reading,
                      )?.holds
                        ? t.yes
                        : t.no}
                    </td>
                  ))}
                </tr>
                {(data.options ?? []).map((o) => {
                  const [job, order] = o.value.split(":");
                  return (
                    <tr key={o.value} className={o.value === answer ? "row-current" : ""}>
                      <th scope="row" className="memory-word">
                        {branchText(Number(job), order === "swap")}
                      </th>
                      {data.cases.map((c) => (
                        <td key={c.label}>
                          {branchSays(Number(job), order === "swap", BigInt(c.a), BigInt(c.b))
                            ? t.yes
                            : t.no}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!asking && (
          <>
            {data.cases.length > 1 && (
              <fieldset className="carry-cases">
                <legend>{t.casesLegend}</legend>
                {data.cases.map((c, k) => (
                  <label key={c.label} className="fault-choice">
                    <input
                      type="radio"
                      name={`${interactive.id}-case`}
                      checked={chosen === k}
                      onChange={() => setChosen(k)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="truth-table-wrap">
              <table className="truth-table datapath-table swap-table">
                <caption>{format(t.swapCaption, { a: given?.a ?? "", b: given?.b ?? "" })}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.relation}</th>
                    <th scope="col">{t.branch}</th>
                    <th scope="col">{t.taken}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={`${r.relation}${r.reading}`}
                      className={r.swapped ? "row-current" : ""}
                    >
                      <th scope="row">
                        {format(t.relationForm, {
                          rel: t.relations[r.relation] ?? r.relation,
                          reading: r.reading === "signed" ? t.signedWord : t.unsignedWord,
                        })}
                      </th>
                      <td className="memory-word">
                        {branchText(r.job, r.swapped)}
                        <span className="swap-flags">
                          {format(r.reading === "signed" ? t.flagsSigned : t.flagsUnsigned, {
                            x: r.swapped ? "R2" : "R1",
                            y: r.swapped ? "R1" : "R2",
                            minus: r.flags.minus,
                            over: r.flags.over,
                            cout: r.flags.cout,
                          })}
                        </span>
                      </td>
                      <td>{r.taken ? t.yes : t.no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-note">{t.swapKey}</p>
          </>
        )}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `program-compare`: two programs run from reset on the reference, side by side: each listing,
// the instructions written and run, the ROM's bytes, and the registers and display the lesson
// names (programs10.ts). With a question, the learner commits before the runs show.

const ProgramProps = z.object({
  programs: z
    .array(
      z.object({
        label: z.string(),
        program: z.string(),
        /** Module 10's capstone: the learner's copy, with set if at kind A. */
        capstone: z.boolean().default(false),
        /**
         * Written with the learner's copy's kinds, but run on the course's machine, which refuses
         * them (lesson 10.4).
         */
        copyWordsOnCourse: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(2),
  inputs: ShopInputs,
  /** The registers to show after each run, by number. */
  shown: z.array(z.number().int().min(0).max(15)).default([]),
  display: z.boolean().default(true),
  /** Whether each run's count of the ROM's bytes shows. */
  romBytes: z.boolean().default(true),
  /** One program run on two machines: its listing shows once, above the first run's counts. */
  oneListing: z.boolean().default(false),
  /** Module 11: the text column headed "Line", as the debugger heads it, not "Instruction". */
  lineHeader: z.boolean().default(false),
  /** Shown once the learner has run the programs. */
  outcomes: z.string().optional(),
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  explain: z.string().default(""),
  /** What the question asks: a program's instructions run or written, by its index. */
  ask: z
    .object({
      program: z.number().int().min(0),
      what: z.enum(["ran", "written", "display", "stop", "where"]),
    })
    .optional(),
});
type ProgramData = z.infer<typeof ProgramProps>;

/** Why a run stopped, as a key: `stop`, `later`, a trap's cause in hexadecimal, or `none`. */
function stopKey(reason: StopReason | undefined): string {
  if (!reason) return "none";
  return reason.kind === "trap" ? reason.cause.toString(16).toUpperCase() : reason.kind;
}

const CAPSTONE: MachineOptions = { ...MODULE_9, callThroughRegister: 9, setIf: 10 };

function runsOf(data: Pick<ProgramData, "programs" | "inputs">) {
  return data.programs.map((p) => ({
    run: runProgram(
      p.program,
      shop(data.inputs),
      p.capstone ? CAPSTONE : MODULE_9,
      2000,
      p.copyWordsOnCourse ? { callThroughRegister: 9, setIf: 10 } : undefined,
    ),
    lines: assemble(
      p.program,
      p.capstone || p.copyWordsOnCourse ? { callThroughRegister: 9, setIf: 10 } : {},
    ).lines,
  }));
}

/** The question's answer, read off the reference's runs. */
export function programAnswer(given: z.input<typeof ProgramProps>): string {
  const data = ProgramProps.parse(given);
  if (!data.ask) return "";
  const r = runsOf(data)[data.ask.program]?.run;
  if (!r) return "";
  if (data.ask.what === "display") return BigInt.asIntN(64, r.state.display).toString();
  if (data.ask.what === "stop") return stopKey(r.stopped);
  if (data.ask.what === "where") return r.state.stopped ? hex3(r.state.stopped.pc) : "none";
  return String(data.ask.what === "ran" ? r.ran : r.written);
}

export const ProgramCompare = withProps(
  ProgramProps,
  function ProgramCompare({ data, interactive, store }: InteractiveProps & { data: ProgramData }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const runs = useMemo(() => runsOf(data), [data]);
    const [ran, setRan] = useState(false);
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined && !!data.ask;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(() => (asking ? programAnswer(data) : ""), [asking, data]);
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    return (
      <div className="machine-figure program-compare" data-interactive={interactive.id}>
        {asking && (
          <div className="carry-question">
            <Prose markdown={data.question ?? ""} />
            <PredictionChallenge
              name={`${interactive.id}-question`}
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
                    {format(t.programAnswer, { answer: optionLabel(answer) })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
          </div>
        )}
        <div className="program-columns">
          {data.programs.map((p, k) => {
            const r = runs[k];
            if (!r) return null;
            return (
              <section key={p.label} className="program-column" aria-label={p.label}>
                <p className="layout-title">{p.label}</p>
                {(!data.oneListing || k === 0) && (
                  <div className="truth-table-wrap">
                    <table className="truth-table datapath-table program-listing">
                      <caption>{t.listingCaption}</caption>
                      <thead>
                        <tr>
                          <th scope="col">{t.address}</th>
                          <th scope="col">
                            {data.lineHeader ? strings.machine11.line : t.instruction}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.lines.map((l) => (
                          <tr key={l.address}>
                            <td className="memory-word">{hex3(l.address)}</td>
                            <td className="memory-word">
                              {l.label ? `${l.label}: ` : ""}
                              {l.text}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {committed && ran && (
                  <ul className="program-counts">
                    <li>{format(t.written, { n: r.run.written })}</li>
                    <li>
                      {format(stopKey(r.run.stopped) === "stop" ? t.ran : t.ranNoStop, {
                        n: r.run.ran,
                      })}
                    </li>
                    {data.romBytes && <li>{format(t.romBytes, { n: r.run.romBytes })}</li>}
                    {data.shown.map((n) => (
                      <li key={n}>
                        {format(t.registerAfter, { n, value: signed(r.run.state.regs[n]) })}
                      </li>
                    ))}
                    {data.display && (
                      <li>{format(t.displayAfter, { value: signed(r.run.state.display) })}</li>
                    )}
                    <li>
                      {r.run.state.stopped
                        ? stopKey(r.run.stopped) === "stop"
                          ? format(t.stoppedAtStop, { address: hex3(r.run.state.stopped.pc) })
                          : format(t.stoppedCause, {
                              address: hex3(r.run.state.stopped.pc),
                              cause: stopKey(r.run.stopped),
                            })
                        : t.notStopped}
                    </li>
                  </ul>
                )}
              </section>
            );
          })}
        </div>
        {committed && (
          <div className="explorer-actions">
            <button type="button" className="button" disabled={ran} onClick={() => setRan(true)}>
              {t.runBoth}
            </button>
          </div>
        )}
        {committed && ran && data.outcomes && <Prose markdown={data.outcomes} />}
        {asking && committed && ran && data.explain && <Prose markdown={data.explain} />}
      </div>
    );
  },
);

// `machine-parts`: each part lesson 1 names, as Module 8's machine and Module 9's have it, read
// from the two circuits (machine-compare.ts, machineParts). It takes no props.

function partText(t: Machine10Strings, form: PartForm): string {
  switch (form.kind) {
    case "registers":
      return format(t.forms.registers, { count: form.count, width: form.width });
    case "register":
      return format(t.forms.register, { width: form.width });
    case "rom-output":
      return format(t.forms.romOutput, { width: form.width });
    case "memory":
      return t.forms.memory;
    case "devices":
      return format(t.forms.devices, {
        names: form.names
          .map((n) => t.deviceNames[n as keyof typeof t.deviceNames] ?? n)
          .join(", "),
      });
    case "none":
      return t.forms.none;
  }
}

export const MachineParts = withProps(
  z.object({}),
  function MachineParts({ interactive }: InteractiveProps & { data: Record<string, never> }) {
    const strings = useViewStrings();
    const t = strings.machine10;
    const rows = useMemo(() => machineParts(), []);
    // A part both circuits keep in the same form is one a program can see: the shared band. Any
    // other part is one circuit's own, in its machine's band; a machine without it shows nothing.
    const shared = rows.filter((r) => r.single.kind === r.multi.kind && r.single.kind !== "none");
    const own = (side: "single" | "multi") =>
      rows.filter((r) => !shared.includes(r) && r[side].kind !== "none");
    const item = (r: PartRow, form: PartForm) => (
      <li key={r.part} className="parts-item" data-part={r.part}>
        <span className="parts-name">{t.partNames[r.part]}</span>
        <span className="parts-form">{partText(t, form)}</span>
      </li>
    );
    const band = (side: "single" | "multi") => {
      const machine = side === "single" ? t.singleName : t.multiName;
      return (
        <section
          className={`parts-band parts-own parts-${side}`}
          aria-label={`${machine}: ${t.partsOwn}`}
        >
          <p className="parts-title">{t.partsOwn}</p>
          <ul>{own(side).map((r) => item(r, r[side]))}</ul>
        </section>
      );
    };
    return (
      <div className="machine-figure machine-parts" data-interactive={interactive.id}>
        <p className="layout-title">{t.partsCaption}</p>
        <div className="parts-drawing">
          <div className="parts-outline parts-outline-single" aria-hidden="true">
            <span>{t.singleName}</span>
          </div>
          <div className="parts-outline parts-outline-multi" aria-hidden="true">
            <span>{t.multiName}</span>
          </div>
          {band("single")}
          <section className="parts-band parts-shared" aria-label={t.partsShared}>
            <p className="parts-title">{t.partsShared}</p>
            <ul>{shared.map((r) => item(r, r.single))}</ul>
          </section>
          {band("multi")}
        </div>
      </div>
    );
  },
);

const hex16 = (v: bigint) => v.toString(16).toUpperCase().padStart(16, "0");

export const ConstantMap = withProps(
  z.object({}),
  function ConstantMap({ interactive }: InteractiveProps & { data: Record<string, never> }) {
    const t = useViewStrings().machine10;
    const runs = useMemo(() => constantRanges(), []);
    return (
      <div className="machine-figure constant-map" data-interactive={interactive.id}>
        <p className="layout-title">{t.constantsCaption}</p>
        <ol className="constant-runs">
          {runs.map((r) => (
            <li
              key={r.part}
              className={`constant-run constant-${r.part}${r.cause ? " constant-none" : ""}`}
              data-part={r.part}
            >
              <span className="constant-part">
                {t.constantsParts[r.part as keyof typeof t.constantsParts]}
              </span>
              <span className="constant-c">
                {format(t.constantsRun, { first: hex3(r.first), last: hex3(r.last) })}
              </span>
              <span className="constant-w">
                {format(t.constantsWiden, {
                  first: hex16(r.firstAddress),
                  last: hex16(r.lastAddress),
                })}
              </span>
              {r.cause !== 0 && (
                <span className="constant-stop">
                  {format(t.constantsStop, { cause: r.cause.toString(16) })}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  },
);
