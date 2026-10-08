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
  MODULE_12,
  PROGRAM_MACHINE,
  RUN_LIMIT,
  assembleChecked,
  debugRun,
  debugStart,
  debugStartAt,
  debugStep,
  endOf,
  inputsAt,
  instructionHex,
  memoryWord,
  type AssemblyProblem,
  type DebugState,
  type InputPlan,
  type MachineInputs,
  type Program,
} from "@dd/dd-model";
import { Prose, useSlot, type InteractiveProps } from "@platform/lesson-runtime";
import { PredictionChallenge } from "@platform/primitives";

import { format, useViewStrings } from "../strings";
import type { Machine11Strings } from "../strings11";
import type { Machine12Strings } from "../strings12";
import { withProps } from "./props";

export const hex3 = (v: number | bigint) => v.toString(16).toUpperCase().padStart(3, "0");
export const signedText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asIntN(64, v).toString();
export const hexText = (v: bigint | undefined) =>
  v === undefined ? "X" : BigInt.asUintN(64, v).toString(16).toUpperCase();

/** A refusal in the course's words: its sentence with its values filled in. */
export function refusalText(t: Machine11Strings, p: AssemblyProblem): string {
  // Line 0 is no line of the learner's: the tests' own call, which the sentence names.
  if (p.line === 0) return format(t.refusals[p.code], p.values as Record<string, string>);
  return format(t.refusedLine, {
    line: p.line,
    sentence: format(t.refusals[p.code], p.values as Record<string, string>),
  });
}

/** Why a run is not going on, in the course's words, or undefined while it can. */
export function stopText(
  t: Machine11Strings,
  s: DebugState,
  t12?: Machine12Strings,
): string | undefined {
  if (!s.stopped) return undefined;
  const { key, values } = endOf(s.stopped);
  // Module 12's machine (t12 given) says how its run ended in its own words first: a `stop` there
  // is the handler's, never "the program's".
  return format((t12 ? (t12.stops[key] ?? t.stops[key]) : t.stops[key]) ?? key, values);
}

/** Module 12: the last edge's trap that went to the handler, in the course's words. */
export function trapText(t12: Machine12Strings, s: DebugState): string | undefined {
  const trap = s.last?.trap;
  if (!trap || s.stopped) return undefined;
  const values = {
    address: hex3(s.last?.pc ?? 0n),
    cause: trap.cause.toString(16).toUpperCase(),
    handler: hex3(s.cpu.pc),
  };
  return format(trap.cause >= 0x80 ? t12.interrupted : t12.trapped, values);
}

/** Why a watch cannot show what was typed: its form, a name nothing defines, or its address. */
export type WatchProblem =
  | { readonly problem: "form" }
  | { readonly problem: "name"; readonly name: string }
  | { readonly problem: "align" | "outside"; readonly address: number };

/**
 * The value a watch names: `R3`, `PC`, or a word at an address written as a program writes one (a
 * number is decimal, or hexadecimal after `0x`; a name; a register plus or minus a number); or why
 * it cannot be shown.
 */
export function watchCheck(
  expr: string,
  cpu: DebugState["cpu"],
  labels: Readonly<Record<string, number>>,
): { readonly value: bigint | undefined } | WatchProblem {
  const t = expr.trim();
  const reg = /^R(\d{1,2})$/i.exec(t);
  if (reg) {
    const n = Number(reg[1]);
    return n <= 15 ? { value: cpu.regs[n] } : { problem: "form" };
  }
  if (/^pc$/i.test(t)) return { value: cpu.pc };
  const word = /^word\[(.+)\]$/.exec(t);
  if (!word) return { problem: "form" };
  const address = addressValue(word[1] as string, cpu, labels);
  if (address === undefined) return { problem: "form" };
  if (typeof address === "object") return address;
  if (address === "unknown") return { value: undefined };
  if (address < 0 || address >= MAP.deviceStart) return { problem: "outside", address };
  if (address % 8 !== 0) return { problem: "align", address };
  return { value: memoryWord(cpu, address) };
}

/** The value a watch names, or undefined where it cannot be shown. */
export function watchValue(
  expr: string,
  cpu: DebugState["cpu"],
  labels: Readonly<Record<string, number>>,
): { value: bigint | undefined } | undefined {
  const r = watchCheck(expr, cpu, labels);
  return "value" in r ? r : undefined;
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
): number | "unknown" | WatchProblem | undefined {
  const m = /^\s*(\w+)\s*(?:([+-])\s*(\S+))?\s*$/.exec(text);
  if (!m) return undefined;
  const nameOf = (x: string) =>
    /^[A-Za-z_]\w*$/.test(x) && !/^R\d{1,2}$/i.test(x) && labels[x] === undefined
      ? ({ problem: "name", name: x } as const)
      : undefined;
  const reg = /^R(\d{1,2})$/i.exec(m[1] as string);
  let base: number | "unknown" | undefined;
  if (reg) {
    const v = cpu.regs[Number(reg[1])];
    base = v === undefined ? "unknown" : Number(BigInt.asIntN(64, v));
  } else base = termValue(m[1] as string, labels);
  if (base === undefined) return nameOf(m[1] as string);
  if (base === "unknown") return base;
  if (!m[3]) return base;
  const n = termValue(m[3], labels);
  if (n === undefined) return nameOf(m[3]);
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
  /** Watches that hold addresses, shown hexadecimal first (the PC, R14 and R15 always are). */
  readonly watchAddresses?: readonly string[];
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
  /** Where the run starts and the registers it starts with: a test's call of a function. */
  readonly start?: { readonly at: number; readonly registers: Readonly<Record<number, bigint>> };
  /** Called with the latest state, so a figure can show what follows a stop. */
  readonly onState?: (s: DebugState) => void;
  /** Module 12: the machine with its control registers and traps. */
  readonly traps?: boolean;
  /** Module 12: C0 to C4 shown; with `modeWords`, C0's and C1's bits said as modes. */
  readonly control?: boolean;
  readonly modeWords?: boolean;
  /** Module 12: the timer, the waiting events, DOOR and WARM shown. */
  readonly events?: boolean;
  /**
   * Module 12: whether C0's and C1's bit 1 is said in words (interrupts on or off); by default with
   * `events`. False before the page has said what an interrupt is.
   */
  readonly interruptWords?: boolean;
  /**
   * Module 12: the registers before the other panels, for a challenge whose failures name them,
   * so that on a phone they sit just below the buttons.
   */
  readonly registersFirst?: boolean;
  /** Module 12: the instructions the learner may choose to open the door before. */
  readonly doorOptions?: readonly number[];
}

const placeOf = (name: string, labels: Readonly<Record<string, number>>) =>
  /^0x[0-9a-f]+$/i.test(name) ? parseInt(name, 16) : labels[name];

/**
 * The debugger on a program that has been assembled: the listing, the controls, and what the
 * run shows. A new program or new inputs start the run again from reset.
 */
export function DebuggerView({
  program,
  inputs: givenInputs,
  options,
  id,
}: {
  program: Program;
  inputs: InputPlan;
  options: DebuggerOptions;
  /** For the names of controls that must be unique on the page. */
  id: string;
}) {
  const strings = useViewStrings();
  const t = strings.machine11;
  const t12 = strings.machine12;
  const machine = options.traps ? MODULE_12 : PROGRAM_MACHINE;
  // Module 12: the door opens before the instruction the learner chooses, or the figure gives.
  const [doorAt, setDoorAt] = useState<number | undefined>(givenInputs.doorOpensAt);
  // A run chosen in a challenge's Try it brings its own door: the choice follows it.
  useEffect(() => setDoorAt(givenInputs.doorOpensAt), [givenInputs.doorOpensAt]);
  const inputs = useMemo<InputPlan>(() => {
    const { doorOpensAt: _given, ...rest } = givenInputs;
    return doorAt === undefined ? rest : { ...rest, doorOpensAt: doorAt };
  }, [givenInputs, doorAt]);
  const startAt = options.start;
  const start = useMemo(
    () =>
      startAt ? debugStartAt(program.rom, startAt.at, startAt.registers) : debugStart(program.rom),
    [program, startAt],
  );
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
      else keep([debugStep(state, inputs, machine)]);
    }
  };
  const onRun = () => {
    const pausesNow = options.breakpoints || options.runLabel ? pauses : new Set<number>();
    keep(
      debugRun(history[at] ?? start, { breakpoints: pausesNow, inputs, limit, options: machine }),
    );
  };
  const onReset = () => {
    setHistory([start]);
    setAt(0);
    setFrom(0);
  };
  const pc = state.cpu.pc;
  // Without its listing, the figure walks from pause to pause only, and ends at the last pause
  // before the program's end: its run never reaches the stop.
  const compact = options.listing === false && options.runLabel !== undefined;
  // Whether a press of the run button would pause before the run ends: the button says what the
  // press will do, "Run to a breakpoint" while a pause lies ahead and "Run to the end" when none does.
  const pauseAhead = useMemo(() => {
    // A compact figure walks from pause to pause without the breakpoints' controls.
    if ((!options.breakpoints && !compact) || pauses.size === 0 || state.stopped) return false;
    const ahead = debugRun(state, { breakpoints: pauses, inputs, limit, options: machine }).at(-1);
    return !ahead?.stopped;
  }, [options.breakpoints, compact, state, pauses, inputs, limit, machine]);
  const pausesAhead = !compact || pauseAhead;
  // A figure shows the devices its program reaches, and only those.
  const uses = useMemo(() => devicesUsed(program), [program]);
  // The listing sits in a box of its own height; the line about to run is kept in view inside it,
  // without moving the page.
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => keepInView(boxRef.current, "tr[aria-current]"), [pc, at]);
  const names = useMemo(() => namesByAddress(program), [program]);
  const wrote = state.last?.wrote?.reg;
  const shownRegs = options.registers ?? Array.from({ length: 16 }, (_, k) => k);
  const stopped = stopText(t, state, options.traps ? t12 : undefined);
  const status =
    stopped ??
    trapText(t12, state) ??
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
    const checked = watchCheck(text, state.cpu, program.labels);
    if (!("value" in checked)) {
      setWatchNote(
        checked.problem === "form"
          ? format(t.watchBad, { text })
          : checked.problem === "name"
            ? format(t.watchName, { name: checked.name })
            : format(checked.problem === "align" ? t.watchAlign : t.watchOutside, {
                address: hex3(checked.address),
                decimal: String(checked.address),
              }),
      );
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
  // The door's time, chosen in the panel of the timer and the door, where the door is.
  const doorChoice = options.doorOptions ? (
    <label className="door-choice">
      <span>{t12.doorChoice}</span>
      <select
        value={doorAt === undefined ? "" : String(doorAt)}
        disabled={!live}
        onChange={(e) => {
          const v = e.target.value;
          setDoorAt(v === "" ? undefined : Number(v));
        }}
      >
        <option value="">{t12.doorNever}</option>
        {options.doorOptions.map((n) => (
          <option key={n} value={String(n)}>
            {format(t12.doorBefore, { n })}
          </option>
        ))}
      </select>
    </label>
  ) : undefined;
  return (
    <div
      className={`debugger debugger-body${compact ? " debugger-compact" : ""}`}
      data-debugger={id}
    >
      <div className="debugger-run">
        <div className="explorer-actions debugger-actions">
          {!compact && (
            <button
              type="button"
              className="button"
              disabled={!live || (!!state.stopped && at === history.length - 1)}
              onClick={onStep}
            >
              {t.step}
            </button>
          )}
          {!compact && (
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
          )}
          <button
            type="button"
            className={compact ? "button" : "button secondary"}
            disabled={!live || !!state.stopped || (compact && !pausesAhead)}
            onClick={onRun}
          >
            {options.runLabel ?? (pauseAhead ? t.runToPause : t.run)}
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
        <p className={`debugger-status${compact ? " visually-hidden" : ""}`} role="status">
          {status}
          {state.ran > 0 || at > 0
            ? ` ${format(state.ran === 1 ? t.ranOne : t.ran, { n: state.ran })}`
            : ""}
          {state.traps.length > 0
            ? ` ${state.traps.length === 1 ? t12.trapCountOne : format(t12.trapCount, { n: state.traps.length })}`
            : ""}
        </p>
        {options.listing !== false && (
          <div className="truth-table-wrap debugger-listing-wrap" ref={boxRef}>
            <table className="truth-table datapath-table debugger-listing">
              <caption>{options.traps ? t12.listingCaption : t.listingCaption}</caption>
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
      <div className={`debugger-values${options.registersFirst ? " registers-first" : ""}`}>
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
                  const address = watchIsAddress(w, options.watchAddresses);
                  return (
                    <li key={w} className={changed ? "watch-changed" : ""}>
                      <span className="memory-word">{w}</span>
                      <span className="memory-word">
                        <WordValue value={now} t={t} address={address} />
                      </span>
                      {changed && (
                        <span className="watch-was">
                          {format(t.watchWas, { value: valueText(was, address) })}
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
        {(options.memory ?? []).map((region) => (
          <MemoryPanel key={region.from} region={region} program={program} state={state} t={t} />
        ))}
        {options.stack && <StackPanel program={program} state={state} names={names} t={t} />}
        {options.control && (
          <ControlPanel
            state={state}
            t12={t12}
            modeWords={options.modeWords === true}
            interrupts={options.interruptWords ?? options.events === true}
          />
        )}
        {options.events && (
          <EventsPanel state={state} inputs={inputs} t12={t12}>
            {doorChoice}
          </EventsPanel>
        )}
        <div className="debugger-panels">
          {uses.devices && (
            <section className="debugger-panel" aria-label={t.devicesCaption}>
              <p className="layout-title">{t.devicesCaption}</p>
              <dl className="debugger-devices">
                {uses.display && (
                  <div>
                    <dt>{t.display}</dt>
                    <dd className="memory-word debugger-display">
                      {signedText(state.cpu.display)}
                    </dd>
                  </div>
                )}
                {uses.lamps && (
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
                )}
                {uses.sensorA && (
                  <div>
                    <dt>{t.sensorA}</dt>
                    <dd className="memory-word">{signedText(inputs.sensorA)}</dd>
                  </div>
                )}
                {uses.sensorB && (
                  <div>
                    <dt>{t.sensorB}</dt>
                    <dd className="memory-word">{signedText(inputs.sensorB)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
          <section
            className="debugger-panel debugger-registers-panel"
            aria-label={t.registersCaption}
          >
            <p className="layout-title">{t.registersCaption}</p>
            <dl className="debugger-registers">
              <div className="debugger-register">
                <dt>{t.pc}</dt>
                <dd className="memory-word">
                  <WordValue value={pc} t={t} address />
                </dd>
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
                      <WordValue value={v} t={t} address={ADDRESS_REGISTERS.has(k)} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Module 12: C0's or C1's two bits in words: the mode, and whether interrupts are on. */
export function statusText(t12: Machine12Strings, bits: bigint, interrupts = true): string {
  if (!interrupts) return (bits & 1n) === 1n ? t12.systemMode : t12.userMode;
  return format(t12.statusWords, {
    mode: (bits & 1n) === 1n ? t12.systemMode : t12.userMode,
    interrupts: (bits & 2n) !== 0n ? t12.interruptsOn : t12.interruptsOff,
  });
}

/** Module 12: a control register's word as the pages write it. */
export function controlText(k: number, v: bigint): string {
  if (k === 0 || k === 1) return v.toString(2).padStart(2, "0");
  if (k === 3) return v.toString(16).toUpperCase().padStart(2, "0");
  return hex3(BigInt.asUintN(64, v));
}

/** Module 12: C0 to C4, each with its job, the ones the last edge wrote marked. */
function ControlPanel({
  state,
  t12,
  modeWords,
  interrupts,
}: {
  state: DebugState;
  t12: Machine12Strings;
  modeWords: boolean;
  /** Whether C0's bit 1 is said in words: from lesson 5, which names interrupts. */
  interrupts: boolean;
}) {
  const last = state.last;
  const changed = (k: number) =>
    last?.trap !== undefined ? k <= 3 : last?.control?.reg === k && !last.stopped;
  return (
    <section className="debugger-panel debugger-control" aria-label={t12.controlCaption}>
      <p className="layout-title">{t12.controlCaption}</p>
      <dl className="debugger-registers">
        {state.cpu.control.map((v, k) => (
          <div
            key={k}
            className={`debugger-register${changed(k) ? " register-changed" : ""}`}
            data-control={k}
          >
            <dt>
              {`C${k} `}
              <span className="control-name">{t12.controlNames[k]}</span>
            </dt>
            <dd className="memory-word">
              {controlText(k, v)}
              {modeWords && k <= 1 && (
                <span className="control-mode">{` ${statusText(t12, v, interrupts)}`}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Module 12: the timer, the waiting events, and DOOR and WARM as the next edge sees them. */
function EventsPanel({
  state,
  inputs,
  t12,
  children,
}: {
  state: DebugState;
  inputs: InputPlan;
  t12: Machine12Strings;
  /** The door's time, where a figure lets the learner choose it. */
  children?: ReactNode;
}) {
  const now = inputsAt(inputs, state.ran);
  return (
    <section className="debugger-panel debugger-events" aria-label={t12.eventsCaption}>
      <p className="layout-title">{t12.eventsCaption}</p>
      <dl className="debugger-devices">
        <div>
          <dt>{t12.timer}</dt>
          <dd className="memory-word">{state.cpu.timer.toString()}</dd>
        </div>
        <div>
          <dt>{t12.timerReached}</dt>
          <dd>{state.cpu.waiting & 1 ? t12.yes : t12.no}</dd>
        </div>
        <div>
          <dt>{t12.doorOpened}</dt>
          <dd>{state.cpu.waiting & 2 ? t12.yes : t12.no}</dd>
        </div>
        <div>
          <dt>{t12.door}</dt>
          <dd>{now.door ? t12.open : t12.closed}</dd>
        </div>
        <div>
          <dt>{t12.warm}</dt>
          <dd className="memory-word">{now.warm}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}

/**
 * A word as the debugger shows it. A value from 10 to 7FF, which may be an address, shows both
 * ways at one size: decimal first, or hexadecimal first where the word is an address (the PC, R14,
 * R15, or a watch a figure names as one). Other values are decimal only, read signed.
 */
export function valueText(value: bigint | undefined, address = false): string {
  // An address below 10 is still an address: three hexadecimal digits, as the listing writes it.
  if (address && value !== undefined && value >= 0n && value < 10n) return hex3(value);
  if (value === undefined || value < 10n || value > 0x7ffn) return signedText(value);
  return address ? `${hex3(value)} ${value}` : `${value} ${hex3(value)}`;
}

export function WordValue({
  value,
  t,
  address = false,
}: {
  value: bigint | undefined;
  t: Machine11Strings;
  address?: boolean;
}) {
  if (address && value !== undefined && value >= 0n && value < 10n) return <>{hex3(value)}</>;
  if (value === undefined || value < 10n || value > 0x7ffn) return <>{signedText(value)}</>;
  const hex = (
    <span className="value-hex">
      <span className="visually-hidden">{`${t.hex} `}</span>
      {hex3(value)}
    </span>
  );
  const dec = <span className="value-dec">{value.toString()}</span>;
  return address ? (
    <>
      {hex} {dec}
    </>
  ) : (
    <>
      {dec} {hex}
    </>
  );
}

/** The devices a program's lines name: the panel shows those, the display wherever it is written. */
export function devicesUsed(program: Program) {
  const text = program.lines.map((l) => l.text).join("\n");
  const has = (name: string) => new RegExp(`\\b${name}\\b`).test(text);
  const out = {
    display: has("display"),
    lamps: has("lamps"),
    sensorA: has("sensorA"),
    sensorB: has("sensorB"),
  };
  return { ...out, devices: out.display || out.lamps || out.sensorA || out.sensorB };
}

/** The registers that hold addresses by the course's convention, shown hexadecimal first. */
const ADDRESS_REGISTERS = new Set([14, 15]);

/** Whether a watch shows its value hexadecimal first: the PC, R14, R15, or one a figure names. */
function watchIsAddress(expr: string, named: readonly string[] = []): boolean {
  const t = expr.trim().toUpperCase();
  return t === "PC" || t === "R14" || t === "R15" || named.some((n) => n.toUpperCase() === t);
}

/**
 * Scrolls a box of its own height, not the page, so that the row the selector finds is in view,
 * a third of the way down, below the box's sticky head.
 */
function keepInView(box: HTMLElement | null, selector: string) {
  const row = box?.querySelector<HTMLElement>(selector);
  if (!box || !row) return;
  const head = box.querySelector("thead")?.getBoundingClientRect().height ?? 0;
  const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
  const bottom = top + row.getBoundingClientRect().height;
  if (top < head || bottom > box.clientHeight)
    box.scrollTop += top - head - (box.clientHeight - head) / 3;
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
  // A long region sits in a box of its own height that keeps the word a register points at in view.
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => keepInView(boxRef.current, "tr.row-current"), [state]);
  const first = placeOf(region.from, program.labels);
  if (first === undefined) return null;
  const rows = Array.from({ length: region.words }, (_, k) => first + 8 * k);
  // The name a line gives an address, beside it: the rooms and the log by the program's names.
  const nameAt = namesByAddress(program);
  return (
    <section className="debugger-panel debugger-memory" aria-label={region.title}>
      <p className="layout-title" aria-hidden="true">
        {region.title}
      </p>
      <div className="truth-table-wrap memory-box" ref={boxRef}>
        <table className="truth-table datapath-table">
          <caption className="visually-hidden">{region.title}</caption>
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
                  <td className="memory-word">
                    {hex3(address)}
                    {nameAt.get(address) && (
                      <span className="memory-name">{` ${nameAt.get(address)}`}</span>
                    )}
                  </td>
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
 * The stack's words: those a push wrote, from the word R14 names up to the top of the RAM, lowest
 * address first, so the top of the stack is drawn at the top as every memory view draws addresses
 * rising downwards. Each word sits in the group of the call that pushed it (the latest call made
 * with the stack's address above it); the main program's words come last.
 */
export function stackRows(
  state: DebugState,
): { address: number; value: bigint | undefined; frame: number }[] {
  const sp = state.cpu.regs[14];
  if (sp === undefined || sp > 0x7c0n) return [];
  return state.pushed
    .filter((a) => BigInt(a) >= sp && a < 0x7c0)
    .map((a) => {
      let frame = -1;
      state.calls.forEach((c, k) => {
        if (c.stack !== undefined && BigInt(a) < c.stack) frame = k;
      });
      return { address: a, value: memoryWord(state.cpu, a), frame };
    });
}

/** Groups of words by call, a run of more than three like calls folded to its first and last. */
export function stackGroups(state: DebugState, names: Map<number, string>) {
  const rows = stackRows(state);
  const groups: { frame: number; key: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const last = groups.at(-1);
    if (last && last.frame === r.frame) last.rows.push(r);
    else {
      const c = state.calls[r.frame];
      const key = c ? `${names.get(Number(c.to)) ?? c.to}@${c.at}` : "main";
      groups.push({ frame: r.frame, key, rows: [r] });
    }
  }
  const out: (
    | { kind: "group"; group: (typeof groups)[number] }
    | { kind: "fold"; n: number; group: (typeof groups)[number] }
  )[] = [];
  for (let i = 0; i < groups.length;) {
    let j = i;
    while (j + 1 < groups.length && groups[j + 1]!.key === groups[i]!.key) j++;
    const run = j - i + 1;
    if (run > 3) {
      out.push({ kind: "group", group: groups[i]! });
      out.push({ kind: "fold", n: run - 2, group: groups[i + 1]! });
      out.push({ kind: "group", group: groups[j]! });
    } else for (let k = i; k <= j; k++) out.push({ kind: "group", group: groups[k]! });
    i = j + 1;
  }
  return out;
}

function StackPanel({
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
  const items = stackGroups(state, names);
  const callOf = (k: number) => state.calls[k];
  const frameName = (k: number) => {
    const c = callOf(k);
    if (!c) return t.frameMain;
    return format(t.frameCall, {
      name: names.get(Number(c.to)) ?? hex3(c.to),
      address: hex3(c.at),
    });
  };
  return (
    <section className="debugger-panel debugger-stack" aria-label={t.stackCaption}>
      <p className="layout-title">{t.stackCaption}</p>
      {sp === undefined ? (
        <p className="watch-note">{t.stackUnset}</p>
      ) : items.length === 0 ? (
        <p className="watch-note">{t.stackEmpty}</p>
      ) : (
        <ol className="stack-frames">
          {items.map((item) =>
            item.kind === "fold" ? (
              <li key={`fold-${item.group.rows[0]?.address}`} className="stack-fold">
                {format(t.stackFolded, {
                  n: item.n,
                  name: frameName(item.group.frame),
                  words: item.n * item.group.rows.length,
                })}
              </li>
            ) : (
              <li
                key={`${item.group.frame}-${item.group.rows[0]?.address}`}
                className="stack-frame"
              >
                <p className="stack-frame-name">{frameName(item.group.frame)}</p>
                <ul className="stack-words">
                  {item.group.rows.map((r) => (
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
            ),
          )}
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
  traps,
}: {
  text: string;
  onChange: (text: string) => void;
  problems: readonly AssemblyProblem[];
  program?: Program;
  onRestore?: () => void;
  label?: string;
  /** Module 12: the text is a start and a handler, and the ROM holds a test's lines after them. */
  traps?: boolean;
}) {
  const strings = useViewStrings();
  const t = strings.machine11;
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
            <p className="hdl-errors">
              {problems.length === 1
                ? t.refusedTitleOne
                : format(t.refusedTitle, { n: problems.length })}
            </p>
            <ul className="hdl-errors">
              {problems.map((p) => (
                <li key={`${p.line}-${p.code}`}>{refusalText(t, p)}</li>
              ))}
            </ul>
          </>
        ) : program ? (
          <p>
            {format(traps ? strings.machine12.assembled : t.assembled, {
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
  what: z.enum([
    "register",
    "display",
    "end",
    "pc",
    "stack",
    "shown",
    "word",
    "calls",
    // Module 12: a control register (by `reg`, 0 to 4), and how many traps went to the handler.
    "control",
    "traps",
  ]),
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
  watchAddresses: z.array(z.string()).default([]),
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
  /** Module 12: the machine with traps, its control registers, the shop's events and the door. */
  traps: z.boolean().default(false),
  control: z.boolean().default(false),
  modeWords: z.boolean().default(false),
  events: z.boolean().default(false),
  doorOpensAt: z.number().int().min(0).optional(),
  doorOptions: z.array(z.number().int().min(0)).optional(),
});
type DebuggerData = z.infer<typeof DebuggerProps>;

/** The question's answer, read off a run of the reference from reset. */
export function debuggerAnswer(given: z.input<typeof DebuggerProps>): string {
  const data = DebuggerProps.parse(given);
  if (!data.ask) return "";
  return runAnswer(data.program, data.inputs, data.ask, data.limit, {
    traps: data.traps,
    ...(data.doorOpensAt !== undefined ? { doorOpensAt: data.doorOpensAt } : {}),
  });
}

/** A run question's answer: the reference run from reset, read where the question says. */
export function runAnswer(
  source: string,
  given: z.input<typeof ShopInputs>,
  askGiven: z.input<typeof RunAsk>,
  limit = RUN_LIMIT,
  module12: { readonly traps?: boolean; readonly doorOpensAt?: number } = {},
): string {
  const ask = RunAsk.parse(askGiven);
  const { program } = assembleChecked(source);
  if (!program) return "";
  const inputs: InputPlan = {
    ...shopInputs(ShopInputs.parse(given)),
    ...(module12.doorOpensAt !== undefined ? { doorOpensAt: module12.doorOpensAt } : {}),
  };
  const machine = module12.traps ? MODULE_12 : PROGRAM_MACHINE;
  let s = debugStart(program.rom);
  const steps = ask.after;
  if (steps === undefined) s = debugRun(s, { inputs, limit, options: machine }).at(-1) ?? s;
  else for (let i = 0; i < steps && !s.stopped; i++) s = debugStep(s, inputs, machine);
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
    case "control":
      return controlText(ask.reg, s.cpu.control[ask.reg] ?? 0n);
    case "traps":
      return String(s.traps.length);
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
    const inputs = useMemo<InputPlan>(
      () => ({
        ...shopInputs(data.inputs),
        ...(data.doorOpensAt !== undefined ? { doorOpensAt: data.doorOpensAt } : {}),
      }),
      [data.inputs, data.doorOpensAt],
    );
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
      watchAddresses: data.watchAddresses,
      memory: data.memory,
      stack: data.stack,
      memoryOnly: data.memoryOnly,
      listing: data.listing,
      ...(data.runLabel ? { runLabel: data.runLabel } : {}),
      limit: data.limit,
      live: committed,
      ...(data.registers ? { registers: data.registers } : {}),
      onState: (s: DebugState) => setEnded(!!s.stopped),
      traps: data.traps,
      control: data.control,
      modeWords: data.modeWords,
      events: data.events,
      ...(data.doorOptions ? { doorOptions: data.doorOptions } : {}),
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
