// Copyright © 2026 Christopher Snow

// Module 11's lab: the assembler and the debugger, one component that grows with the lessons.
//
// The program is text in the course's assembly (docs/isa.md). The learner's assembler
// (`assembleChecked`) makes its words or lists every line it refuses, in the course's sentences.
// The debugger runs the words on the instruction-level reference (packages/dd-model: debugger.ts),
// which runs the instruction set the learner's two circuits keep: the listing with the line about
// to run, R0 to R15 and the PC, the shop's devices; step, step back, run, reset; and every stop's
// reason in words. A lesson turns on what its question needs: breakpoints on lines, a watch on
// registers and words, memory shown where the program keeps a list with the registers that point
// into it, and the stack with each call's frame marked by the calling convention.
//
// `debugger` is the lesson's figure; `DebuggerView` is also the challenge editor's "Try it".

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";

import {
  MAP,
  RUN_LIMIT,
  assembleChecked,
  debugRun,
  debugStart,
  debugStep,
  endOf,
  instructionHex,
  memoryWord,
  type AssemblyProblem,
  type DebugState,
  type MachineInputs,
  type Program,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";

import { format, useViewStrings } from "../strings";
import type { Machine11Strings } from "../strings11";
import { withProps } from "./props";

export const hex3 = (v: number | bigint) => v.toString(16).toUpperCase().padStart(3, "0");
export const signedText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asIntN(64, v).toString();
export const hexText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asUintN(64, v).toString(16).toUpperCase();

/** A refusal in the course's words: its sentence with its values filled in. */
export function refusalText(t: Machine11Strings, p: AssemblyProblem): string {
  return format(t.refusedLine, {
    line: p.line,
    sentence: format(t.refusals[p.code], p.values as Record<string, string>),
  });
}

/** Why a run is not going on, in the course's words, or undefined while it can. */
export function stopText(t: Machine11Strings, s: DebugState): string | undefined {
  if (!s.stopped) return undefined;
  const { key, values } = endOf(s.stopped);
  return format(t.stops[key] ?? key, values);
}

/** The value a watch names: `R3`, `PC`, or a word at an address written as the assembler reads it. */
export function watchValue(
  expr: string,
  cpu: DebugState["cpu"],
  labels: Readonly<Record<string, number>>,
): { value: bigint | undefined } | undefined {
  const t = expr.trim();
  const reg = /^R(\d{1,2})$/i.exec(t);
  if (reg) {
    const n = Number(reg[1]);
    return n <= 15 ? { value: cpu.regs[n] } : undefined;
  }
  if (/^pc$/i.test(t)) return { value: cpu.pc };
  const word = /^word\[(.+)\]$/.exec(t);
  if (!word) return undefined;
  const address = addressValue(word[1] as string, cpu, labels);
  if (address === undefined) return undefined;
  if (address === "unknown") return { value: undefined };
  if (address % 8 !== 0 || address < 0 || address >= MAP.deviceStart) return undefined;
  return { value: memoryWord(cpu, address) };
}

function termValue(t: string, labels: Readonly<Record<string, number>>): number | undefined {
  const s = t.trim();
  if (/^-?0x[0-9a-f]+$/i.test(s))
    return s.startsWith("-") ? -parseInt(s.slice(3), 16) : parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return Number(s);
  return labels[s];
}

function addressValue(
  text: string,
  cpu: DebugState["cpu"],
  labels: Readonly<Record<string, number>>,
): number | "unknown" | undefined {
  const m = /^\s*(\w+)\s*(?:([+-])\s*(\S+))?\s*$/.exec(text);
  if (!m) return undefined;
  const reg = /^R(\d{1,2})$/i.exec(m[1] as string);
  let base: number | "unknown" | undefined;
  if (reg) {
    const v = cpu.regs[Number(reg[1])];
    base = v === undefined ? "unknown" : Number(BigInt.asIntN(64, v));
  } else base = termValue(m[1] as string, labels);
  if (base === undefined || base === "unknown") return base;
  if (!m[3]) return base;
  const n = termValue(m[3], labels);
  if (n === undefined) return undefined;
  return m[2] === "-" ? base - n : base + n;
}

/** The label each address carries, for naming a call's frame. */
function namesByAddress(program: Program): Map<number, string> {
  const out = new Map<number, string>();
  for (const [name, at] of Object.entries(program.labels)) if (!out.has(at)) out.set(at, name);
  return out;
}

export interface MemoryRegion {
  /** A label, or an address in hexadecimal after 0x. */
  readonly from: string;
  readonly words: number;
  readonly title: string;
}

export interface DebuggerOptions {
  readonly breakpoints?: boolean;
  /** Breakpoints set at first, by label or by address. */
  readonly pause?: readonly string[];
  readonly watch?: boolean;
  readonly watched?: readonly string[];
  readonly memory?: readonly MemoryRegion[];
  readonly stack?: boolean;
  /** Which registers to show; all sixteen when not given. */
  readonly registers?: readonly number[];
  readonly limit?: number;
  /** The run button's own words, for a figure whose run stops at the lines `pause` names. */
  readonly runLabel?: string;
  /** Whether the listing shows; without it, the controls drive the memory and the registers. */
  readonly listing?: boolean;
  /** Only the memory the lesson names, as the program finds it at reset: no listing, no controls. */
  readonly memoryOnly?: boolean;
  /** Whether the controls answer: false while a question waits for its answer. */
  readonly live?: boolean;
  /** Called with the latest state, so a figure can show what follows a stop. */
  readonly onState?: (s: DebugState) => void;
}

const placeOf = (name: string, labels: Readonly<Record<string, number>>) =>
  /^0x[0-9a-f]+$/i.test(name) ? parseInt(name, 16) : labels[name];

/**
 * The debugger on a program that has been assembled: the listing, the controls, and what the
 * run shows. A new program or new inputs start the run again from reset.
 */
export function DebuggerView({
  program,
  inputs,
  options,
  id,
}: {
  program: Program;
  inputs: MachineInputs;
  options: DebuggerOptions;
  /** For the names of controls that must be unique on the page. */
  id: string;
}) {
  const t = useViewStrings().machine11;
  const start = useMemo(() => debugStart(program.rom), [program]);
  const [history, setHistory] = useState<DebugState[]>([start]);
  const [at, setAt] = useState(0);
  // Where the run last paused before this one: the watch says what changed since.
  const [from, setFrom] = useState(0);
  const initialPauses = useMemo(
    () =>
      new Set(
        (options.pause ?? [])
          .map((n) => placeOf(n, program.labels))
          .filter((n): n is number => n !== undefined),
      ),
    [options.pause, program],
  );
  const [pauses, setPauses] = useState<Set<number>>(initialPauses);
  const [watched, setWatched] = useState<string[]>([...(options.watched ?? [])]);
  const [watchText, setWatchText] = useState("");
  const [watchNote, setWatchNote] = useState("");
  useEffect(() => {
    setHistory([start]);
    setAt(0);
    setFrom(0);
    setPauses(initialPauses);
  }, [start, initialPauses, inputs]);
  const state = history[at] ?? start;
  const before = at > 0 ? history[Math.min(from, at - 1)] : undefined;
  const { onState } = options;
  useEffect(() => {
    onState?.(state);
  }, [state, onState]);
  const live = options.live !== false;
  const limit = options.limit ?? RUN_LIMIT;
  const keep = (next: DebugState[]) => {
    // Step back reaches the last thousand instructions; older states are let go.
    const all = [...history.slice(0, at + 1), ...next];
    const drop = Math.max(0, all.length - 1000);
    setHistory(all.slice(drop));
    setFrom(Math.max(0, at - drop));
    setAt(all.length - 1 - drop);
  };
  const onStep = () => {
    if (at < history.length - 1) {
      setFrom(at);
      setAt(at + 1);
    } else if (!state.stopped) {
      if (state.ran >= limit) keep([{ ...state, stopped: { kind: "cutOff", ran: state.ran } }]);
      else keep([debugStep(state, inputs)]);
    }
  };
  const onRun = () => {
    const pausesNow = options.breakpoints || options.runLabel ? pauses : new Set<number>();
    keep(debugRun(history[at] ?? start, { breakpoints: pausesNow, inputs, limit }));
  };
  const onReset = () => {
    setHistory([start]);
    setAt(0);
    setFrom(0);
  };
  const pc = state.cpu.pc;
  // The listing sits in a box of its own height; the line about to run is kept in view inside it,
  // without moving the page.
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    const row = box?.querySelector<HTMLElement>("tr[aria-current]");
    if (!box || !row) return;
    const head = box.querySelector("thead")?.getBoundingClientRect().height ?? 0;
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
    const bottom = top + row.getBoundingClientRect().height;
    if (top < head || bottom > box.clientHeight)
      box.scrollTop += top - head - (box.clientHeight - head) / 3;
  }, [pc, at]);
  const names = useMemo(() => namesByAddress(program), [program]);
  const wrote = state.last?.wrote?.reg;
  const shownRegs = options.registers ?? Array.from({ length: 16 }, (_, k) => k);
  const stopped = stopText(t, state);
  const status =
    stopped ??
    (state.ran === 0 && at === 0
      ? t.atStart
      : options.breakpoints && pauses.has(Number(pc)) && state.ran > 0
        ? format(t.paused, { address: hex3(pc) })
        : format(t.next, { address: hex3(pc) }));

  const togglePause = (address: number) => {
    const next = new Set(pauses);
    if (next.has(address)) next.delete(address);
    else next.add(address);
    setPauses(next);
  };
  const addWatch = () => {
    const text = watchText.trim();
    if (!text) return;
    if (!watchValue(text, state.cpu, program.labels)) {
      setWatchNote(format(t.watchBad, { text }));
      return;
    }
    setWatchNote("");
    if (!watched.includes(text)) setWatched([...watched, text]);
    setWatchText("");
  };

  if (options.memoryOnly)
    return (
      <div className="debugger" data-debugger={id}>
        {(options.memory ?? []).map((region) => (
          <MemoryPanel key={region.from} region={region} program={program} state={state} t={t} />
        ))}
      </div>
    );
  return (
    <div className="debugger debugger-body" data-debugger={id}>
      <div className="debugger-run">
        <div className="explorer-actions debugger-actions">
          <button
            type="button"
            className="button"
            disabled={!live || (!!state.stopped && at === history.length - 1)}
            onClick={onStep}
          >
            {t.step}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={!live || at === 0}
            onClick={() => {
              setFrom(Math.max(0, at - 2));
              setAt(at - 1);
            }}
          >
            {t.back}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={!live || !!state.stopped}
            onClick={onRun}
          >
            {options.runLabel ?? (options.breakpoints && pauses.size ? t.runToPause : t.run)}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={!live || (at === 0 && history.length === 1)}
            onClick={onReset}
          >
            {t.reset}
          </button>
        </div>
        <p className="debugger-status" role="status">
          {status}
          {state.ran > 0 || at > 0 ? ` ${format(t.ran, { n: state.ran })}` : ""}
        </p>
        {options.listing !== false && (
          <div className="truth-table-wrap debugger-listing-wrap" ref={boxRef}>
            <table className="truth-table datapath-table debugger-listing">
              <caption>{t.listingCaption}</caption>
              <thead>
                <tr>
                  {options.breakpoints && (
                    <th scope="col" aria-label={t.pauseBefore.split(" ")[0]} />
                  )}
                  <th scope="col">{t.address}</th>
                  <th scope="col">{t.word}</th>
                  <th scope="col">{t.line}</th>
                </tr>
              </thead>
              <tbody>
                {program.lines.map((l) => {
                  const isNext = l.instruction !== undefined && BigInt(l.address) === pc;
                  const paused = pauses.has(l.address);
                  return (
                    <tr
                      key={l.address}
                      className={`${isNext ? "row-current" : ""}${paused ? " row-paused" : ""}`}
                      aria-current={isNext ? "step" : undefined}
                    >
                      {options.breakpoints && (
                        <td className="debugger-pause">
                          {l.instruction !== undefined && (
                            <button
                              type="button"
                              className="pause-toggle"
                              aria-pressed={paused}
                              aria-label={format(t.pauseBefore, { address: hex3(l.address) })}
                              disabled={!live}
                              onClick={() => togglePause(l.address)}
                            >
                              <span aria-hidden="true">{paused ? "●" : "○"}</span>
                            </button>
                          )}
                        </td>
                      )}
                      <td className="memory-word">
                        {isNext && <span className="next-mark">{`▶ `}</span>}
                        {hex3(l.address)}
                      </td>
                      <td className="memory-word">
                        {l.instruction !== undefined ? instructionHex(l.instruction) : t.data}
                      </td>
                      <td className="memory-word debugger-line">
                        {l.label ? `${l.label}: ` : ""}
                        {l.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="debugger-values">
        {options.watch && (
          <section className="debugger-panel" aria-label={t.watchCaption}>
            <p className="layout-title">{t.watchCaption}</p>
            <div className="watch-add">
              <label>
                <span>{t.watchLabel}</span>
                <input
                  type="text"
                  className="watch-input"
                  spellCheck={false}
                  value={watchText}
                  disabled={!live}
                  onChange={(e) => setWatchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addWatch();
                  }}
                />
              </label>
              <button
                type="button"
                className="button secondary"
                disabled={!live}
                onClick={addWatch}
              >
                {t.watchAdd}
              </button>
            </div>
            {watchNote && (
              <p className="watch-note" role="status">
                {watchNote}
              </p>
            )}
            {watched.length === 0 ? (
              <p className="watch-note">{t.watchNone}</p>
            ) : (
              <ul className="watch-list">
                {watched.map((w) => {
                  const now = watchValue(w, state.cpu, program.labels)?.value;
                  const was = before ? watchValue(w, before.cpu, program.labels)?.value : now;
                  const changed = before !== undefined && now !== was;
                  return (
                    <li key={w} className={changed ? "watch-changed" : ""}>
                      <span className="memory-word">{w}</span>
                      <span className="memory-word">{signedText(now)}</span>
                      {changed && (
                        <span className="watch-was">
                          {format(t.watchWas, { value: signedText(was) })}
                        </span>
                      )}
                      <button
                        type="button"
                        className="watch-remove"
                        aria-label={format(t.watchRemove, { name: w })}
                        onClick={() => setWatched(watched.filter((x) => x !== w))}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
        <div className="debugger-panels">
          <section className="debugger-panel" aria-label={t.registersCaption}>
            <p className="layout-title">{t.registersCaption}</p>
            <dl className="debugger-registers">
              <div className="debugger-register">
                <dt>{t.pc}</dt>
                <dd className="memory-word">{hex3(pc)}</dd>
              </div>
              {shownRegs.map((k) => {
                const v = state.cpu.regs[k];
                const changed = wrote === k && at > 0;
                return (
                  <div
                    key={k}
                    className={`debugger-register${changed ? " register-changed" : ""}`}
                    data-register={k}
                  >
                    <dt>
                      {`R${k}`}
                      {changed && <span className="visually-hidden">{` (${t.changed})`}</span>}
                    </dt>
                    <dd className="memory-word">
                      <WordValue value={v} t={t} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
          {options.listing !== false && (
            <section className="debugger-panel" aria-label={t.devicesCaption}>
              <p className="layout-title">{t.devicesCaption}</p>
              <dl className="debugger-devices">
                <div>
                  <dt>{t.display}</dt>
                  <dd className="memory-word debugger-display">{signedText(state.cpu.display)}</dd>
                </div>
                <div>
                  <dt>{t.lamps}</dt>
                  <dd className="debugger-lamps">
                    {t.lampNames.map((name, bit) => {
                      const on = (state.cpu.lamps >> bit) & 1;
                      return (
                        <span key={name} className={`lamp-chip${on ? " lamp-on" : ""}`}>
                          {`${name} ${on ? t.lampOn : t.lampOff}`}
                        </span>
                      );
                    })}
                  </dd>
                </div>
                <div>
                  <dt>{t.sensorA}</dt>
                  <dd className="memory-word">{signedText(inputs.sensorA)}</dd>
                </div>
                <div>
                  <dt>{t.sensorB}</dt>
                  <dd className="memory-word">{signedText(inputs.sensorB)}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>
        {(options.memory ?? []).map((region) => (
          <MemoryPanel key={region.from} region={region} program={program} state={state} t={t} />
        ))}
        {options.stack && <StackPanel program={program} state={state} names={names} t={t} />}
      </div>
    </div>
  );
}

/** A word as the debugger shows it: read signed, and in hexadecimal too where it may be an address. */
function WordValue({ value, t }: { value: bigint | undefined; t: Machine11Strings }) {
  return (
    <>
      {signedText(value)}
      {value !== undefined && value > 9n && value < 1n << 63n && (
        <span className="register-hex">
          <span className="visually-hidden">{` ${t.hex} `}</span>
          {hexText(value)}
        </span>
      )}
    </>
  );
}

function MemoryPanel({
  region,
  program,
  state,
  t,
}: {
  region: MemoryRegion;
  program: Program;
  state: DebugState;
  t: Machine11Strings;
}) {
  const first = placeOf(region.from, program.labels);
  if (first === undefined) return null;
  const rows = Array.from({ length: region.words }, (_, k) => first + 8 * k);
  return (
    <section className="debugger-panel debugger-memory" aria-label={region.title}>
      <div className="truth-table-wrap">
        <table className="truth-table datapath-table">
          <caption>{region.title}</caption>
          <thead>
            <tr>
              <th scope="col">{t.address}</th>
              <th scope="col">{t.memoryValue}</th>
              <th scope="col" aria-label={t.pointsHere.replace("{names}", "").trim()} />
            </tr>
          </thead>
          <tbody>
            {rows.map((address) => {
              const pointing = state.cpu.regs
                .map((v, k) => (v === BigInt(address) ? `R${k}` : undefined))
                .filter((x): x is string => x !== undefined);
              return (
                <tr key={address} className={pointing.length ? "row-current" : ""}>
                  <td className="memory-word">{hex3(address)}</td>
                  <td className="memory-word">
                    <WordValue value={memoryWord(state.cpu, address)} t={t} />
                  </td>
                  <td className="memory-pointer">
                    {pointing.length
                      ? `← ${format(t.pointsHere, { names: pointing.join(", ") })}`
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * The stack from the top of the RAM down to R14, each word in the frame of the call that pushed it
 * (the words below the stack's address when that call was made), the main program's above them.
 */
export function stackRows(
  state: DebugState,
): { address: number; value: bigint | undefined; frame: number }[] {
  const sp = state.cpu.regs[14];
  if (sp === undefined || sp > 0x7c0n || sp < BigInt(MAP.romStart)) return [];
  const out: { address: number; value: bigint | undefined; frame: number }[] = [];
  for (let a = 0x7c0 - 8; a >= Number(sp); a -= 8) {
    // The frame is the latest call made with the stack's address above this word.
    let frame = -1;
    state.calls.forEach((c, k) => {
      if (c.stack !== undefined && BigInt(a) < c.stack) frame = k;
    });
    out.push({ address: a, value: memoryWord(state.cpu, a), frame });
  }
  return out;
}

function StackPanel({
  program,
  state,
  names,
  t,
}: {
  program: Program;
  state: DebugState;
  names: Map<number, string>;
  t: Machine11Strings;
}) {
  const sp = state.cpu.regs[14];
  const rows = stackRows(state);
  const groups: { frame: number; rows: typeof rows }[] = [];
  for (const r of rows) {
    const last = groups.at(-1);
    if (last && last.frame === r.frame) last.rows.push(r);
    else groups.push({ frame: r.frame, rows: [r] });
  }
  const frameName = (k: number) => {
    const c = state.calls[k];
    if (!c) return t.frameMain;
    return format(t.frameCall, {
      name: names.get(Number(c.to)) ?? hex3(c.to),
      address: hex3(c.at),
    });
  };
  void program;
  return (
    <section className="debugger-panel debugger-stack" aria-label={t.stackCaption}>
      <p className="layout-title">{t.stackCaption}</p>
      {sp === undefined ? (
        <p className="watch-note">{t.stackUnset}</p>
      ) : rows.length === 0 ? (
        <p className="watch-note">{t.stackEmpty}</p>
      ) : (
        <ol className="stack-frames">
          {groups.map((g) => (
            <li key={`${g.frame}-${g.rows[0]?.address}`} className="stack-frame">
              <p className="stack-frame-name">{frameName(g.frame)}</p>
              <ul className="stack-words">
                {g.rows.map((r) => (
                  <li key={r.address} className="stack-word">
                    <span className="memory-word">{hex3(r.address)}</span>
                    <span className="memory-word">
                      <WordValue value={r.value} t={t} />
                    </span>
                    {BigInt(r.address) === sp && <span className="stack-top">{"← R14"}</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** The program as the learner may change it, with the assembler's verdict under it. */
export function ProgramText({
  text,
  onChange,
  problems,
  program,
  onRestore,
  label,
}: {
  text: string;
  onChange: (text: string) => void;
  problems: readonly AssemblyProblem[];
  program?: Program;
  onRestore?: () => void;
  label?: string;
}) {
  const t = useViewStrings().machine11;
  const last = program?.lines.at(-1);
  const bytes = last
    ? last.address + (last.instruction !== undefined ? 4 : dataBytes(last.text))
    : 0;
  return (
    <div className="program-text">
      <label>
        <span className="hdl-label">{label ?? t.programLabel}</span>
        <textarea
          className="hdl-text program-source"
          wrap="off"
          rows={Math.min(18, Math.max(6, text.split("\n").length + 1))}
          spellCheck={false}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {onRestore && (
        <button type="button" className="button secondary" onClick={onRestore}>
          {t.restore}
        </button>
      )}
      <div className="hdl-messages" role="status">
        {problems.length ? (
          <>
            <p className="hdl-errors">{format(t.refusedTitle, { n: problems.length })}</p>
            <ul className="hdl-errors">
              {problems.map((p) => (
                <li key={`${p.line}-${p.code}`}>{refusalText(t, p)}</li>
              ))}
            </ul>
          </>
        ) : program ? (
          <p>
            {format(t.assembled, {
              n: program.lines.filter((l) => l.instruction !== undefined).length,
              bytes,
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function dataBytes(text: string): number {
  const m = /^(word|byte)\s+(.+)$/.exec(text.trim());
  if (!m) return 0;
  return (m[1] === "word" ? 8 : 1) * (m[2] ?? "").split(",").length;
}

/** The shop's inputs as a lesson writes them: SENSORA and SENSORB as signed decimals. */
export const ShopInputs = z
  .object({
    DOOR: z.number().int().min(0).max(1).default(0),
    WARM: z.number().int().min(0).max(1).default(0),
    SENSORA: z.string().default("0"),
    SENSORB: z.string().default("0"),
  })
  .default({ DOOR: 0, WARM: 0, SENSORA: "0", SENSORB: "0" });

export function shopInputs(given: z.infer<typeof ShopInputs>): MachineInputs {
  return {
    door: given.DOOR as 0 | 1,
    warm: given.WARM as 0 | 1,
    sensorA: BigInt(given.SENSORA),
    sensorB: BigInt(given.SENSORB),
  };
}

const Region = z.object({
  from: z.string(),
  words: z.number().int().min(1).max(64),
  title: z.string(),
});

/** A question about a run from reset, answered by running the reference. */
export const RunAsk = z.object({
  /** How many instructions the question is about; the run to its end when not given. */
  after: z.number().int().min(0).optional(),
  what: z.enum(["register", "display", "end", "pc", "stack", "shown", "word", "calls"]),
  reg: z.number().int().min(0).max(15).default(1),
  /** For `word`: the word's address, in hexadecimal. */
  address: z.string().default("400"),
  /** A register or a word as an address, in three hexadecimal digits, not read signed. */
  hex: z.boolean().default(false),
});

const DebuggerProps = z.object({
  program: z.string(),
  /** Whether the learner may change the program in the figure. */
  editable: z.boolean().default(false),
  inputs: ShopInputs,
  registers: z.array(z.number().int().min(0).max(15)).optional(),
  breakpoints: z.boolean().default(false),
  pause: z.array(z.string()).default([]),
  watch: z.boolean().default(false),
  watched: z.array(z.string()).default([]),
  memory: z.array(Region).default([]),
  stack: z.boolean().default(false),
  memoryOnly: z.boolean().default(false),
  listing: z.boolean().default(true),
  runLabel: z.string().optional(),
  limit: z.number().int().min(1).max(20000).default(RUN_LIMIT),
  /** A question the learner answers before the controls work, about the run from reset. */
  question: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  ask: RunAsk.optional(),
  explain: z.string().default(""),
  /** Shown once the run has ended. */
  outcomes: z.string().optional(),
});
type DebuggerData = z.infer<typeof DebuggerProps>;

/** The question's answer, read off a run of the reference from reset. */
export function debuggerAnswer(given: z.input<typeof DebuggerProps>): string {
  const data = DebuggerProps.parse(given);
  if (!data.ask) return "";
  return runAnswer(data.program, data.inputs, data.ask, data.limit);
}

/** A run question's answer: the reference run from reset, read where the question says. */
export function runAnswer(
  source: string,
  given: z.input<typeof ShopInputs>,
  askGiven: z.input<typeof RunAsk>,
  limit = RUN_LIMIT,
): string {
  const ask = RunAsk.parse(askGiven);
  const { program } = assembleChecked(source);
  if (!program) return "";
  const inputs = shopInputs(ShopInputs.parse(given));
  let s = debugStart(program.rom);
  const steps = ask.after;
  if (steps === undefined) s = debugRun(s, { inputs, limit }).at(-1) ?? s;
  else for (let i = 0; i < steps && !s.stopped; i++) s = debugStep(s, inputs);
  const shown = (v: bigint | undefined) =>
    ask.hex ? (v === undefined ? "X" : hex3(BigInt.asUintN(64, v))) : signedText(v);
  switch (ask.what) {
    case "register":
      return shown(s.cpu.regs[ask.reg]);
    case "word":
      return shown(memoryWord(s.cpu, parseInt(ask.address, 16)));
    case "calls":
      return String(s.callsMade);
    case "display":
      return signedText(s.cpu.display);
    case "pc":
      return hex3(s.cpu.pc);
    case "end":
      return endOf(s.stopped).key;
    case "stack":
      return s.deepest === undefined ? "0" : String((0x7c0n - s.deepest) / 8n);
    case "shown":
      return s.shown.map((v) => signedText(v)).join(", ");
  }
}

interface Stored {
  readonly choice?: string;
  readonly text?: string;
}

export const DebuggerFigure = withProps(
  DebuggerProps,
  function DebuggerFigure({ data, interactive, store }: InteractiveProps & { data: DebuggerData }) {
    const strings = useViewStrings();
    const t = strings.machine11;
    const [stored, setStored] = useSlot<Stored>(store, interactive.id);
    const text = data.editable ? (stored?.text ?? data.program) : data.program;
    const checked = useMemo(() => assembleChecked(text), [text]);
    const inputs = useMemo(() => shopInputs(data.inputs), [data.inputs]);
    const asking = data.question !== undefined && data.options !== undefined && !!data.ask;
    const committed = !asking || stored?.choice !== undefined;
    const answer = useMemo(() => (asking ? debuggerAnswer(data) : ""), [asking, data]);
    const [ended, setEnded] = useState(false);
    const optionLabel = (v: string) =>
      (data.options?.find((o) => o.value === v)?.label ?? v).replace(/\.$/, "");
    const options: DebuggerOptions = {
      breakpoints: data.breakpoints,
      pause: data.pause,
      watch: data.watch,
      watched: data.watched,
      memory: data.memory,
      stack: data.stack,
      memoryOnly: data.memoryOnly,
      listing: data.listing,
      ...(data.runLabel ? { runLabel: data.runLabel } : {}),
      limit: data.limit,
      live: committed,
      ...(data.registers ? { registers: data.registers } : {}),
      onState: (s: DebugState) => setEnded(!!s.stopped),
    };
    let question: ReactNode = null;
    if (asking)
      question = (
        <div className="carry-question">
          <Prose markdown={data.question ?? ""} />
          <PredictionChallenge
            name={`${interactive.id}-question`}
            options={data.options ?? []}
            committed={stored?.choice}
            onCommit={(choice) => setStored({ ...stored, choice })}
            onAgain={() => setStored({ ...(stored?.text ? { text: stored.text } : {}) })}
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
                  {stored.choice === answer ? strings.prediction.match : strings.prediction.noMatch}
                </p>
              )
            }
          />
        </div>
      );
    return (
      <div className="machine-figure debugger-figure" data-interactive={interactive.id}>
        {question}
        {data.editable && (
          <ProgramText
            text={text}
            onChange={(next) => setStored({ ...stored, text: next })}
            problems={checked.problems}
            {...(checked.program ? { program: checked.program } : {})}
            {...(stored?.text !== undefined && stored.text !== data.program
              ? {
                  onRestore: () =>
                    setStored({ ...(stored?.choice ? { choice: stored.choice } : {}) }),
                }
              : {})}
          />
        )}
        {checked.program && (
          <DebuggerView
            program={checked.program}
            inputs={inputs}
            options={options}
            id={interactive.id}
          />
        )}
        {asking && committed && data.explain && <Prose markdown={data.explain} />}
        {committed && ended && data.outcomes && <Prose markdown={data.outcomes} />}
      </div>
    );
  },
);
