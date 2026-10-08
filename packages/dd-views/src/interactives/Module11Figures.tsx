// Copyright © 2026 Christopher Snow

// Module 11's figures besides the debugger (Debugger.tsx), each a view of the learner's assembler
// or of a run on the reference:
//
// - `program-listing`: a program's lines beside their addresses and words, the names and the
//   addresses they stand for, and each branch's or call's constant with where it goes; with a
//   question, the words show once the learner has answered.
// - `stack-depth`: the stack's depth, in words, after each instruction of a whole run.
// - `log-results`: one program run over several logs, each log with what the program left beside
//   what the task asks for.

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  assembleChecked,
  debugStart,
  debugStep,
  endOf,
  fieldsOf,
  instructionHex,
  leftFor,
  runScenario,
  RUN_LIMIT,
  type DebugState,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge, useWidth } from "@platform/primitives";

import { format, useViewStrings } from "../strings";
import {
  RunAsk,
  ShopInputs,
  hex3,
  refusalText,
  runAnswer,
  shopInputs,
  signedText,
} from "./Debugger";
import { withProps } from "./props";

// ---------------------------------------------------------------------------------------------
// `program-listing`

const ListingProps = z.object({
  program: z.string(),
  /** Whether the names the program defines are listed with their addresses. */
  names: z.boolean().default(true),
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  /**
   * What the question asks: a line's word, a name's address or a branch's constant, read off the
   * assembler; or, with `run`, something about a run from reset, which the lesson's debugger
   * then shows.
   */
  ask: z
    .object({
      what: z.enum(["word", "address", "constant", "run"]),
      line: z.string().default(""),
      run: RunAsk.optional(),
      inputs: ShopInputs.optional(),
      /** Module 12: the run on the machine with traps, and a door that opens before an instruction. */
      traps: z.boolean().default(false),
      doorOpensAt: z.number().int().min(0).optional(),
    })
    .optional(),
  explain: z.string().default(""),
});
type ListingData = z.infer<typeof ListingProps>;

/** The question's answer, read off the learner's assembler. */
export function listingAnswer(given: z.input<typeof ListingProps>): string {
  const data = ListingProps.parse(given);
  const program = assembleChecked(data.program).program;
  if (!data.ask || !program) return "";
  const { what, line } = data.ask;
  if (what === "run")
    return data.ask.run
      ? runAnswer(data.program, data.ask.inputs ?? {}, data.ask.run, undefined, {
          traps: data.ask.traps,
          ...(data.ask.doorOpensAt !== undefined ? { doorOpensAt: data.ask.doorOpensAt } : {}),
        })
      : "";
  if (what === "address") return hex3(program.labels[line] ?? 0);
  const l = program.lines.find((x) => x.text === line || x.label === line);
  if (!l || l.instruction === undefined) return "";
  if (what === "word") return instructionHex(l.instruction);
  return (l.instruction & 0xfff).toString(16).toUpperCase().padStart(3, "0");
}

export const ProgramListing = withProps(
  ListingProps,
  function ProgramListing({ data, interactive, store }: InteractiveProps & { data: ListingData }) {
    const strings = useViewStrings();
    const t = strings.machine11;
    const checked = useMemo(() => assembleChecked(data.program), [data.program]);
    const [stored, setStored] = useSlot<{ choice?: string }>(store, interactive.id);
    const asking = data.question !== undefined && data.options !== undefined && !!data.ask;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(() => (asking ? listingAnswer(data) : ""), [asking, data]);
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    const program = checked.program;
    if (!program)
      return (
        <ul className="hdl-errors">
          {checked.problems.map((p) => (
            <li key={`${p.line}-${p.code}`}>{refusalText(t, p)}</li>
          ))}
        </ul>
      );
    const nameAt = new Map(Object.entries(program.labels).map(([n, a]) => [a, n]));
    const target = (address: number, word: number) => {
      const f = fieldsOf(word);
      if (!(f.k === 5 && f.j !== 1) && f.k !== 6) return undefined;
      const to = address + 4 * f.c;
      return format(t.goesTo, { name: nameAt.get(to) ?? "", address: hex3(to), c: f.c });
    };
    return (
      <div className="machine-figure program-listing-figure" data-interactive={interactive.id}>
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
                    {format(strings.prediction.youSaid, { choice: optionLabel(stored.choice) })}{" "}
                    {format(data.ask?.what === "run" ? t.answer : t.assemblerAnswer, {
                      answer: optionLabel(answer),
                    })}{" "}
                    {stored.choice === answer
                      ? strings.prediction.match
                      : strings.prediction.noMatch}
                  </p>
                )
              }
            />
          </div>
        )}
        <div className="truth-table-wrap">
          <table className="truth-table datapath-table debugger-listing">
            <caption>{t.listingCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.address}</th>
                {committed && <th scope="col">{t.word}</th>}
                <th scope="col">{t.line}</th>
              </tr>
            </thead>
            <tbody>
              {program.lines.map((l) => {
                const goes =
                  committed && l.instruction !== undefined
                    ? target(l.address, l.instruction)
                    : undefined;
                return (
                  <tr key={l.address}>
                    <td className="memory-word">{hex3(l.address)}</td>
                    {committed && (
                      <td className="memory-word">
                        {l.instruction !== undefined ? instructionHex(l.instruction) : t.data}
                      </td>
                    )}
                    <td className="memory-word debugger-line">
                      {l.label ? `${l.label}: ` : ""}
                      {l.text}
                      {goes && <span className="listing-goes">{goes}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.names && Object.keys(program.labels).length > 0 && (
          <div className="truth-table-wrap">
            <table className="truth-table datapath-table listing-names">
              <caption>{t.namesCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.name}</th>
                  <th scope="col">{t.address}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(program.labels).map(([name, at]) => (
                  <tr key={name}>
                    <td className="memory-word">{name}</td>
                    <td className="memory-word">{hex3(at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `stack-depth`

const DepthProps = z.object({
  program: z.string(),
  inputs: ShopInputs,
  limit: z.number().int().min(1).max(20000).default(RUN_LIMIT),
});
type DepthData = z.infer<typeof DepthProps>;

/** The stack's depth in words after each instruction of a run, with where the run ended. */
export function depthRun(
  program: string,
  inputs = shopInputs(ShopInputs.parse(undefined)),
  limit = RUN_LIMIT,
) {
  const p = assembleChecked(program).program;
  if (!p) return undefined;
  let s: DebugState = debugStart(p.rom);
  const depths: number[] = [0];
  const calls: number[] = [];
  while (!s.stopped && s.ran < limit) {
    const made = s.callsMade;
    s = debugStep(s, inputs);
    const sp = s.cpu.regs[14];
    // A push that runs R14 below the RAM stores nothing (the ROM refuses it), so the stack holds
    // at most the RAM's 120 words.
    depths.push(sp === undefined || sp > 0x7c0n ? 0 : Math.min(120, Number((0x7c0n - sp) / 8n)));
    if (s.callsMade > made) calls.push(depths.length - 1);
  }
  return { depths, calls, state: s, deepest: Math.max(...depths) };
}

export const StackDepth = withProps(
  DepthProps,
  function StackDepth({ data, interactive }: InteractiveProps & { data: DepthData }) {
    const t = useViewStrings().machine11;
    const run = useMemo(
      () => depthRun(data.program, shopInputs(data.inputs), data.limit),
      [data.program, data.inputs, data.limit],
    );
    const [ref, width] = useWidth<HTMLDivElement>(640);
    if (!run) return null;
    const W = Math.max(280, width);
    const H = 200;
    const left = 40;
    const right = 12;
    const top = 12;
    const bottom = 34;
    const n = run.depths.length - 1;
    const most = Math.max(1, run.deepest);
    const x = (i: number) => left + ((W - left - right) * i) / Math.max(1, n);
    const y = (d: number) => top + (H - top - bottom) * (1 - d / most);
    let d = `M ${x(0).toFixed(1)} ${y(run.depths[0] ?? 0).toFixed(1)}`;
    run.depths.forEach((v, i) => {
      if (i === 0) return;
      d += ` H ${x(i).toFixed(1)} V ${y(v).toFixed(1)}`;
    });
    const ticks =
      most <= 4 ? Array.from({ length: most + 1 }, (_, k) => k) : [0, Math.round(most / 2), most];
    const end = endOf(run.state.stopped);
    return (
      <div
        className="machine-figure stack-depth-figure"
        data-interactive={interactive.id}
        ref={ref}
      >
        <p className="layout-title">{t.depthCaption}</p>
        <svg
          className="stack-depth"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${t.depthCaption}. ${format(t.depthMost, { n: run.deepest })}`}
        >
          <line className="depth-axis" x1={left} y1={top} x2={left} y2={H - bottom} />
          <line className="depth-axis" x1={left} y1={H - bottom} x2={W - right} y2={H - bottom} />
          {ticks.map((k) => (
            <g key={k}>
              <line className="depth-grid" x1={left} x2={W - right} y1={y(k)} y2={y(k)} />
              <text className="depth-label" x={left - 6} y={y(k) + 4} textAnchor="end">
                {k}
              </text>
            </g>
          ))}
          {run.calls.map((i) => (
            <line
              key={i}
              className="depth-call"
              x1={x(i)}
              x2={x(i)}
              y1={H - bottom}
              y2={H - bottom + 10}
            />
          ))}
          <path className="depth-line" d={d} fill="none" />
          <text className="depth-label" x={left} y={H - 8} textAnchor="start">
            0
          </text>
          <text className="depth-label" x={W - right} y={H - 8} textAnchor="end">
            {format(n === 1 ? t.depthRanOne : t.depthRan, { n })}
          </text>
        </svg>
        <ul className="program-counts">
          <li>{format(t.depthMost, { n: run.deepest })}</li>
          {run.calls.length > 0 && <li>{format(t.depthCalls, { n: run.calls.length })}</li>}
          <li>{format(t.stops[end.key] ?? end.key, end.values)}</li>
        </ul>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------------------------
// `log-results`

const ResultsProps = z.object({
  program: z.string(),
  logs: z
    .array(
      z.object({
        label: z.string(),
        readings: z.array(z.number().int()).optional(),
        limit: z.number().int().optional(),
        /** Module 12: lines added after the program in place of a log, and what they hold. */
        data: z.string().optional(),
        note: z.string().optional(),
        /** Module 12: the rooms' readings for the run, as a test gives them. */
        sensorA: z.number().int().optional(),
        sensorB: z.number().int().optional(),
        /** What the task asks this log's run to leave, by the check's key. */
        asks: z.record(z.string(), z.string()),
      }),
    )
    .min(1),
  /** The checks shown, each a key of `asks` and the words that name it. */
  checks: z.array(z.object({ key: z.string(), label: z.string() })).min(1),
  outcomes: z.string().optional(),
  /** Module 12: the machine with traps. */
  traps: z.boolean().default(false),
});
type ResultsData = z.infer<typeof ResultsProps>;

const logText = (readings: readonly number[], limit?: number) => {
  const lines = [`count: word ${readings.length}`];
  if (limit !== undefined) lines.push(`limit: word ${limit}`);
  lines.push(readings.length ? `log: word ${readings.join(", ")}` : "log: word 0");
  return lines.join("\n");
};

/** What a run left for a check's key: the display, the lamps, a word of the RAM, how it ended. */
export function resultsOf(data: z.input<typeof ResultsProps>) {
  const parsed = ResultsProps.parse(data);
  return parsed.logs.map((log) => {
    const run = runScenario(parsed.program, {
      data: log.data ?? logText(log.readings ?? [], log.limit),
      ...(parsed.traps ? { traps: true } : {}),
      inputs: {
        ...(log.sensorA !== undefined ? { sensorA: BigInt(log.sensorA) } : {}),
        ...(log.sensorB !== undefined ? { sensorB: BigInt(log.sensorB) } : {}),
      },
    });
    const s = run.state;
    const left: Record<string, string> = {};
    for (const c of parsed.checks) {
      if (!s) left[c.key] = "";
      else if (log.data !== undefined) left[c.key] = leftFor(c.key, run);
      else if (c.key === "display") left[c.key] = signedText(s.cpu.display);
      else if (c.key === "lamps") left[c.key] = String(s.cpu.lamps);
      else if (c.key === "end") left[c.key] = endOf(s.stopped).key;
      else if (c.key.startsWith("word:")) {
        const a = parseInt(c.key.slice(5), 16);
        let v = 0n;
        let known = true;
        for (let i = 7; i >= 0; i--) {
          const b = s.cpu.ram[a - 0x400 + i];
          if (b === undefined) known = false;
          else v = (v << 8n) | BigInt(b);
        }
        left[c.key] = known ? signedText(v) : "X";
      }
    }
    return { log, left };
  });
}

export const LogResults = withProps(
  ResultsProps,
  function LogResults({ data, interactive }: InteractiveProps & { data: ResultsData }) {
    const strings = useViewStrings();
    const t = strings.machine11;
    const t12 = strings.machine12;
    // How a run ended, in the course's words where it has them (a run cut off), else its key.
    const shown = (key: string, value: string | undefined) =>
      key === "end" && value !== undefined ? (t12.endWords[value] ?? value) : value;
    const rows = useMemo(() => resultsOf(data), [data]);
    const [ran, setRan] = useState(false);
    return (
      <div className="machine-figure log-results" data-interactive={interactive.id}>
        {/* The button and what the run showed come first, near the lead: the logs follow. */}
        <div className="explorer-actions">
          <button type="button" className="button" disabled={ran} onClick={() => setRan(true)}>
            {t.runAll}
          </button>
        </div>
        {ran && data.outcomes && <Prose markdown={data.outcomes} />}
        <ol className="log-cards">
          {rows.map(({ log, left }) => {
            const all = data.checks.every((c) => left[c.key] === log.asks[c.key]);
            return (
              <li key={log.label} className="log-card" aria-label={log.label}>
                <p className="layout-title">{log.label}</p>
                {log.readings ? (
                  <p className="memory-word log-readings">
                    {`${t.readingsCol}: ${log.readings.length ? log.readings.join(", ") : t.emptyLog}`}
                    {log.limit !== undefined ? ` ${format(t.limitNote, { limit: log.limit })}` : ""}
                  </p>
                ) : (
                  log.note && <p className="log-readings">{log.note}</p>
                )}
                <table className="truth-table datapath-table log-table">
                  <thead>
                    <tr>
                      <th scope="col" aria-label={t.logCol} />
                      <th scope="col">{t.asks}</th>
                      {ran && <th scope="col">{t.left}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.checks.map((c) => (
                      <tr
                        key={c.key}
                        className={ran && left[c.key] !== log.asks[c.key] ? "row-differs" : ""}
                      >
                        <th scope="row">{c.label}</th>
                        <td className="memory-word">{shown(c.key, log.asks[c.key])}</td>
                        {ran && <td className="memory-word">{shown(c.key, left[c.key])}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ran && (
                  <p className="log-verdict">
                    {all ? (log.data !== undefined ? t12.runMatches : t.matches) : t.differs}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);
