// Copyright © 2026 Christopher Snow

// Module 10's figures, each a view of the implementation:
//
// - `machine-compare`: Module 8's machine and Module 9's run one program side by side, from
//   reset, in two simulators (packages/dd-model: machine-compare.ts). The learner moves Module 9's
//   machine an edge or an instruction at a time; Module 8's takes its one edge when Module 9's
//   instruction ends. Tables show what a program can see on each machine, with each part that
//   differs marked, what Module 9's machine keeps of its own, and every instruction run with the
//   edges each machine took. A fault may be put into Module 9's machine.
//
// The words are in strings10.ts; the lesson gives what only it knows (the program, the registers
// to show, the faults and their outcomes, the question).

import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import {
  edgePair,
  instructionPair,
  pairView,
  runPair,
  startPair,
  type MachineInputs,
  type MachinePair,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { FaultInjector, PredictionChallenge } from "@platform/primitives";

import { format, useViewStrings } from "../strings";
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
                        <td>{l.stops ? "0" : "1"}</td>
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
