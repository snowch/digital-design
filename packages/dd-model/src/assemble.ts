// Copyright © 2026 Christopher Snow

// Module 8: programs as data. A lesson's ROM is written as lines of `docs/isa.md`'s assembly and
// turned into words here, for authors. No learner uses it: the assembler a learner uses is
// Module 11's, which may refine the language and says so.
//
// The language is the proposal in `docs/isa.md`: one line, one instruction, written as the
// transfer it makes, with `<=` for the arrow; a label ends with a colon; `//` starts a comment;
// `word` and `byte` put fixed values in the ROM; the devices have names. A line it cannot read is
// refused with the line's number and a sentence, since an author reads these errors, not a
// learner.

import { DEVICES, MAP, fieldsOf, instructionHex } from "./machine";

export interface AssembledLine {
  /** The line as written, without its comment. */
  readonly text: string;
  readonly address: number;
  /** The instruction's word, for an instruction line. */
  readonly instruction?: number;
  readonly label?: string;
}

export interface Program {
  /** The ROM's 1024 bytes: the program, its data, then 0s. */
  readonly rom: Uint8Array;
  /** Each line that made something, in order: an instruction or a run of data. */
  readonly lines: readonly AssembledLine[];
  readonly labels: Readonly<Record<string, number>>;
}

const DEVICE_NAMES: Readonly<Record<string, number>> = {
  display: DEVICES.display,
  lamps: DEVICES.lamps,
  signals: DEVICES.signals,
  sensorA: DEVICES.sensorA,
  sensorB: DEVICES.sensorB,
  timer: DEVICES.timer,
  waiting: DEVICES.waiting,
};

/** The ALU's jobs by the operator a register or constant job is written with. */
const JOBS: Readonly<Record<string, number>> = { "&": 0, "^": 1, "+": 2, "-": 3, "|": 4 };

/** Branch conditions by their written form; `signed` or `unsigned` follows `<` and `>=`. */
const CONDITIONS: Readonly<Record<string, number>> = {
  "==": 2,
  "!=": 3,
  "< unsigned": 4,
  ">= unsigned": 5,
  "< signed": 6,
  ">= signed": 7,
};

/**
 * Module 11: why the assembler refuses a line, as a code the learner's sentences are keyed by
 * (`packages/dd-views/src/strings11.ts`), with the values a sentence names. The authors' messages
 * stay English for authors; the learner reads the course's sentence for the code.
 */
export type AssemblyProblemCode =
  | "notNumber"
  | "notRegister"
  | "constantRange"
  | "notWhole"
  | "tooFar"
  | "noGreater"
  | "signedOrUnsigned"
  | "noCallThroughRegister"
  | "noSetIf"
  | "unreadable"
  | "romFull"
  | "unknownName"
  /** Not the assembler's: a test calls a function no line of the program names. */
  | "noFunction"
  | "twice"
  | "dataTarget"
  | "wordTooWide"
  | "useArrow"
  | "noMultiply"
  | "twoJobs"
  | "storeRegister"
  | "compareRegisters"
  | "callRegister"
  | "addressForm"
  | "reservedName"
  /** Module 12: a control register outside C0 to C4, which the learner's assembler refuses. */
  | "controlRegister";

export interface AssemblyProblem {
  /** The line's number in the text, from 1. */
  readonly line: number;
  readonly code: AssemblyProblemCode;
  /** The values the sentence names: a name, a number, the text it could not read. */
  readonly values: Readonly<Record<string, string>>;
  /** The authors' message. */
  readonly message: string;
}

export class AssemblyError extends Error {
  readonly line: number;
  readonly code: AssemblyProblemCode;
  readonly values: Readonly<Record<string, string>>;
  constructor(
    line: number,
    text: string,
    code: AssemblyProblemCode = "unreadable",
    values: Readonly<Record<string, string>> = {},
  ) {
    super(`line ${line}: ${text}`);
    this.line = line;
    this.code = code;
    this.values = values;
  }
}

const encode = (k: number, j: number, a: number, b: number, y: number, c: number) =>
  ((k << 28) | (j << 24) | (a << 20) | (b << 16) | (y << 12) | (c & 0xfff)) >>> 0;

/** Module 9's capstone: the kind a call through a register is written at, `call R3 + 8, R15`. */
export interface AssemblyOptions {
  readonly callThroughRegister?: number;
  /** Module 10's capstone: the kind "set if" is written at, `R5 <= R1 < R2 signed`. */
  readonly setIf?: number;
}

/** Assembles a program. Labels may be used before they are defined. */
export function assemble(source: string, options: AssemblyOptions = {}): Program {
  const { program, problems } = assembleAll(source, options, false);
  const first = problems[0];
  if (first) throw new AssemblyError(first.line, first.message, first.code, first.values);
  return program as Program;
}

/**
 * Module 11: the learner's assembler. The same language and the same words as `assemble`, but a
 * line it refuses does not end the work: every refusal in the program is listed, each with its
 * line, and the program is made only when there are none.
 */
export function assembleChecked(
  source: string,
  options: AssemblyOptions = {},
): { readonly program?: Program; readonly problems: readonly AssemblyProblem[] } {
  return assembleAll(source, options, true);
}

/** Words the language uses, which a label may not take. */
const RESERVED = new Set(["word", "byte", "goto", "if", "call", "system", "stop", "nothing"]);
const RESERVED_ALSO = new Set(["resume", "signed", "unsigned"]);

function assembleAll(
  source: string,
  options: AssemblyOptions,
  collect: boolean,
): { program?: Program; problems: AssemblyProblem[] } {
  const raw = source.split("\n");
  const problems: AssemblyProblem[] = [];
  const attempt = (f: () => void) => {
    try {
      f();
    } catch (e) {
      if (!(e instanceof AssemblyError)) throw e;
      problems.push({
        line: e.line,
        code: e.code,
        values: e.values,
        message: e.message.replace(/^line \d+: /, ""),
      });
      if (!collect) throw e;
    }
  };
  // First pass: addresses and labels.
  type Item =
    | { kind: "instruction"; text: string; line: number; address: number; label?: string }
    | {
        kind: "data";
        text: string;
        line: number;
        address: number;
        bytes: number[];
        /** Values written as names, put in once every name has its address: index, name. */
        names: [number, string][];
        label?: string;
      };
  const items: Item[] = [];
  const labels: Record<string, number> = {};
  const dataLabels = new Set<string>();
  let address = 0;
  try {
    raw.forEach((full, index) => {
      const lineNo = index + 1;
      attempt(() => {
        let text = (full.split("//")[0] ?? "").trim();
        if (!text) return;
        let label: string | undefined;
        const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(text);
        if (m) {
          label = m[1] as string;
          text = (m[2] ?? "").trim();
          if (
            /^R\d{1,2}$/.test(label) ||
            /^C\d$/.test(label) ||
            label in DEVICE_NAMES ||
            RESERVED.has(label) ||
            RESERVED_ALSO.has(label)
          )
            throw new AssemblyError(
              lineNo,
              `${label} is a name the language uses`,
              "reservedName",
              {
                name: label,
              },
            );
          if (label in labels)
            throw new AssemblyError(lineNo, `${label} is defined twice`, "twice", { name: label });
        }
        const data = /^(word|byte)\s+(.+)$/.exec(text);
        if (data) {
          const size = data[1] === "word" ? 8 : 1;
          if (size === 8) while (address % 8) address++;
          // A word may hold a name's address (a list's next entry, a room's door): it is put in
          // on the second pass, when every name has one.
          const names: [number, string][] = [];
          const values = (data[2] ?? "").split(",").map((t, i) => {
            const v = t.trim();
            if (size === 8 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) {
              names.push([i, v]);
              return 0n;
            }
            return bigNumber(v, lineNo, size);
          });
          const bytes = values.flatMap((v) =>
            Array.from({ length: size }, (_, i) =>
              Number((BigInt.asUintN(64, v) >> BigInt(8 * i)) & 0xffn),
            ),
          );
          if (label) {
            labels[label] = address;
            dataLabels.add(label);
          }
          items.push({
            kind: "data",
            text,
            line: lineNo,
            address,
            bytes,
            names,
            ...(label ? { label } : {}),
          });
          address += bytes.length;
          return;
        }
        while (address % 4) address++;
        if (label) labels[label] = address;
        if (!text) return;
        items.push({
          kind: "instruction",
          text,
          line: lineNo,
          address,
          ...(label ? { label } : {}),
        });
        address += 4;
      });
    });
    if (address > MAP.romEnd)
      attempt(() => {
        throw new AssemblyError(
          raw.length,
          `the program needs ${address} bytes; the ROM holds ${MAP.romEnd}`,
          "romFull",
          { bytes: String(address), rom: String(MAP.romEnd) },
        );
      });
  } catch (e) {
    if (e instanceof AssemblyError) return { problems };
    throw e;
  }
  const rom = new Uint8Array(MAP.romEnd);
  const lines: AssembledLine[] = [];
  const context: Context = { labels, dataLabels, learner: collect };
  for (const item of items) {
    if (item.kind === "data") {
      try {
        attempt(() => {
          for (const [i, name] of item.names) {
            const at = labels[name];
            if (at === undefined)
              throw new AssemblyError(
                item.line,
                `nothing defines the name ${name}`,
                "unknownName",
                {
                  name,
                },
              );
            for (let b = 0; b < 8; b++) item.bytes[8 * i + b] = b < 2 ? (at >> (8 * b)) & 0xff : 0;
          }
        });
      } catch (e) {
        if (e instanceof AssemblyError) return { problems };
        throw e;
      }
      if (item.address + item.bytes.length <= MAP.romEnd) rom.set(item.bytes, item.address);
      lines.push({
        text: item.text,
        address: item.address,
        ...(item.label ? { label: item.label } : {}),
      });
      continue;
    }
    let word = 0;
    try {
      attempt(() => {
        word = instruction(item.text, item.address, context, item.line, options);
      });
    } catch (e) {
      if (e instanceof AssemblyError) return { problems };
      throw e;
    }
    if (item.address + 4 <= MAP.romEnd)
      for (let i = 0; i < 4; i++) rom[item.address + i] = (word >>> (8 * i)) & 0xff;
    lines.push({
      text: item.text,
      address: item.address,
      instruction: word,
      ...(item.label ? { label: item.label } : {}),
    });
  }
  problems.sort((a, b) => a.line - b.line);
  if (problems.length) return { problems };
  return { program: { rom, lines, labels }, problems };
}

interface Context {
  readonly labels: Readonly<Record<string, number>>;
  /** Names of `word` and `byte` lines: data, which a `goto` or a `call` may not go to. */
  readonly dataLabels: ReadonlySet<string>;
  /** The learner's assembler (Module 12): a control register outside C0 to C4 is refused. */
  readonly learner?: boolean;
}

/** A control register's number, refused outside 0 to 4 by the learner's assembler. */
function controlNumber(text: string, context: Context, line: number): number {
  const n = Number(text.slice(1));
  if (context.learner && n > 4)
    throw new AssemblyError(line, `${text} is not a control register`, "controlRegister", {
      name: text,
    });
  return n;
}

/** A number of any size, for a word of data, which must fit in a word (or a byte). */
function bigNumber(text: string, line: number, size = 8): bigint {
  const t = text.trim();
  const negative = t.startsWith("-");
  const body = negative ? t.slice(1) : t;
  if (/^0x[0-9a-f]+$/i.test(body) || /^\d+$/.test(body)) {
    const v = negative ? -BigInt(body) : BigInt(body);
    const bits = BigInt(8 * size);
    if (v >= 1n << bits || v < -(1n << (bits - 1n)))
      throw new AssemblyError(
        line,
        `${t} does not fit in a ${size === 8 ? "word" : "byte"}`,
        "wordTooWide",
        {
          text: t,
          size: size === 8 ? "word" : "byte",
        },
      );
    return v;
  }
  throw new AssemblyError(line, `${JSON.stringify(t)} is not a number`, "notNumber", { text: t });
}

function number(text: string, line: number): number {
  const t = text.trim();
  if (/^-?0x[0-9a-f]+$/i.test(t))
    return t.startsWith("-") ? -parseInt(t.slice(3), 16) : parseInt(t, 16);
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t) && !/^R\d{1,2}$/.test(t))
    throw new AssemblyError(line, `nothing defines the name ${t}`, "unknownName", { name: t });
  throw new AssemblyError(line, `${JSON.stringify(t)} is not a number`, "notNumber", { text: t });
}

function register(text: string, line: number): number {
  const m = /^R(\d{1,2})$/.exec(text.trim());
  const n = m ? Number(m[1]) : NaN;
  if (!(n >= 0 && n <= 15))
    throw new AssemblyError(line, `${JSON.stringify(text)} is not R0 to R15`, "notRegister", {
      text: text.trim(),
    });
  return n;
}

function constant(value: number, line: number): number {
  if (value < -2048 || value > 2047)
    throw new AssemblyError(
      line,
      `${value} does not fit: a constant is -2048 to 2047`,
      "constantRange",
      {
        value: String(value),
      },
    );
  return value;
}

/**
 * A value: a number, a label or a device's name. Module 11: a name may be followed by `+` or `-`
 * and a number, `log + 8`, the address 8 bytes past the label.
 */
function value(text: string, context: Context, line: number): number {
  const t = text.trim();
  const sum = /^([A-Za-z_][A-Za-z0-9_]*)\s*([+-])\s*(\S+)$/.exec(t);
  if (sum && !/^R\d{1,2}$/.test(sum[1] as string)) {
    const base = value(sum[1] as string, context, line);
    const n = number(sum[3] as string, line);
    return sum[2] === "-" ? base - n : base + n;
  }
  if (t in DEVICE_NAMES) return DEVICE_NAMES[t] as number;
  if (t in context.labels) return context.labels[t] as number;
  return number(t, line);
}

/** `R1 + 8`, `R1 - 8`, `R1`, or a value alone: the register (if any) and the constant. */
function addressOf(text: string, context: Context, line: number): { reg?: number; c: number } {
  const m = /^(R\d{1,2})\s*(?:([+-])\s*(.+))?$/.exec(text.trim());
  if (m) {
    if (m[3] && /^R\d{1,2}$/.test(m[3].trim()))
      throw new AssemblyError(line, "an address is a register and a constant", "addressForm", {
        text: text.trim(),
      });
    const c = m[3] ? value(m[3], context, line) * (m[2] === "-" ? -1 : 1) : 0;
    return { reg: register(m[1] as string, line), c: constant(c, line) };
  }
  return { c: constant(value(text, context, line), line) };
}

/** Why a line no rule reads cannot be read, by the commonest slips. */
function unreadable(t: string, line: number): AssemblyError {
  const v = { text: t };
  if (/^(R\d{1,2}|word\[.*\]|byte\[.*\])\s*=[^=]/.test(t) || /^(R\d{1,2})\s*:=/.test(t))
    return new AssemblyError(line, "write the arrow `<=`", "useArrow", v);
  if (/[*/%]|<<|>>/.test(t.replace(/^.*?<=/, "")))
    return new AssemblyError(
      line,
      "the machine has no multiplication, division or shift",
      "noMultiply",
      v,
    );
  if (/^R\d{1,2} <= .+[+\-&|^].+[+\-&|^]/.test(t))
    return new AssemblyError(line, "one line does one job", "twoJobs", v);
  if (/^(word|byte)\[.+\] <= /.test(t))
    return new AssemblyError(line, "a store writes a register", "storeRegister", v);
  if (/^if /.test(t))
    return new AssemblyError(line, "a branch compares two registers", "compareRegisters", v);
  if (/^call \w+$/.test(t))
    return new AssemblyError(
      line,
      "say which register keeps the return address",
      "callRegister",
      v,
    );
  return new AssemblyError(line, `cannot read ${JSON.stringify(t)}`, "unreadable", v);
}

function instruction(
  text: string,
  at: number,
  context: Context,
  line: number,
  options: AssemblyOptions = {},
): number {
  const t = text.replace(/\s+/g, " ").trim();
  const offset = (target: string) => {
    const name = target.trim();
    if (context.dataLabels.has(name))
      throw new AssemblyError(line, `${name} names data, not an instruction`, "dataTarget", {
        name,
      });
    const to = value(target, context, line);
    if ((to - at) % 4 !== 0)
      throw new AssemblyError(line, `${target} is not a whole instruction away`, "notWhole", {
        name,
      });
    const c = (to - at) / 4;
    if (c < -2048 || c > 2047)
      throw new AssemblyError(line, `${target} is too far for a branch`, "tooFar", {
        name,
        value: String(c),
      });
    return c;
  };
  if (t === "stop") return encode(8, 4, 0, 0, 0, 0);
  if (t === "nothing") return encode(5, 1, 0, 0, 0, 0);
  if (t === "call system") return encode(8, 0, 0, 0, 0, 0);
  if (t === "resume") return encode(8, 1, 0, 0, 0, 0);
  if (t.includes(">") && !t.includes(">=") && !t.includes("<="))
    throw new AssemblyError(
      line,
      "there is no `>`: swap the two registers and write `<`",
      "noGreater",
    );
  let m = /^call (R\d{1,2})(?: ?([+-]) ?(.+))?, ?(R\d{1,2})$/.exec(t);
  if (m) {
    if (options.callThroughRegister === undefined)
      throw new AssemblyError(
        line,
        "this machine has no call through a register",
        "noCallThroughRegister",
      );
    const c = m[3] ? value(m[3], context, line) * (m[2] === "-" ? -1 : 1) : 0;
    const a = register(m[1] as string, line);
    return encode(
      options.callThroughRegister,
      0,
      a,
      0,
      register(m[4] as string, line),
      constant(c, line),
    );
  }
  m = /^call (\w+), ?(R\d{1,2})$/.exec(t);
  if (m) return encode(6, 0, 0, 0, register(m[2] as string, line), offset(m[1] as string));
  m = /^goto (R\d{1,2})(?: ?([+-]) ?(.+))?$/.exec(t);
  if (m) {
    const c = m[3] ? value(m[3], context, line) * (m[2] === "-" ? -1 : 1) : 0;
    return encode(7, 0, register(m[1] as string, line), 0, 0, constant(c, line));
  }
  m = /^goto (\w+)$/.exec(t);
  if (m) return encode(5, 0, 0, 0, 0, offset(m[1] as string));
  m = /^if (R\d{1,2}) (==|!=|<|>=) (R\d{1,2})(?: (signed|unsigned))? goto (\w+)$/.exec(t);
  if (m) {
    const op = m[2] as string;
    const key = op === "==" || op === "!=" ? op : `${op} ${m[4] ?? ""}`;
    const j = CONDITIONS[key];
    if (j === undefined)
      throw new AssemblyError(
        line,
        "write `signed` or `unsigned` after `<` or `>=`",
        "signedOrUnsigned",
      );
    return encode(
      5,
      j,
      register(m[1] as string, line),
      register(m[3] as string, line),
      0,
      offset(m[5] as string),
    );
  }
  m = /^(word|byte)\[(.+)\] <= (R\d{1,2})$/.exec(t);
  if (m) {
    const { reg, c } = addressOf(m[2] as string, context, line);
    const j = (m[1] === "byte" ? 1 : 0) | (reg === undefined ? 8 : 0);
    return encode(4, j, reg ?? 0, register(m[3] as string, line), 0, c);
  }
  m = /^(C\d{1,2}) <= (R\d{1,2})$/.exec(t);
  if (m)
    return encode(
      8,
      3,
      register(m[2] as string, line),
      0,
      0,
      controlNumber(m[1] as string, context, line),
    );
  m = /^(R\d{1,2}) <= (.+)$/.exec(t);
  if (!m) throw unreadable(t, line);
  const y = register(m[1] as string, line);
  const right = (m[2] as string).trim();
  const set = /^(R\d{1,2}) (==|!=|<|>=) (R\d{1,2})(?: (signed|unsigned))?$/.exec(right);
  if (set) {
    if (options.setIf === undefined)
      throw new AssemblyError(line, "this machine has no set if", "noSetIf");
    const op = set[2] as string;
    const key = op === "==" || op === "!=" ? op : `${op} ${set[4] ?? ""}`;
    const j = CONDITIONS[key];
    if (j === undefined)
      throw new AssemblyError(
        line,
        "write `signed` or `unsigned` after `<` or `>=`",
        "signedOrUnsigned",
      );
    return encode(
      options.setIf,
      j,
      register(set[1] as string, line),
      register(set[3] as string, line),
      y,
      0,
    );
  }
  let r = /^(word|byte)\[(.+)\]$/.exec(right);
  if (r) {
    const { reg, c } = addressOf(r[2] as string, context, line);
    const j = (r[1] === "byte" ? 1 : 0) | (reg === undefined ? 8 : 0);
    return encode(3, j, reg ?? 0, 0, y, c);
  }
  r = /^(C\d{1,2})$/.exec(right);
  if (r) return encode(8, 2, 0, 0, y, controlNumber(r[1] as string, context, line));
  r = /^(R\d{1,2}) ?([&^+|-]) ?(.+)$/.exec(right);
  if (r) {
    const a = register(r[1] as string, line);
    const op = r[2] as string;
    const other = (r[3] as string).trim();
    if (/^R\d{1,2}$/.test(other))
      return encode(1, JOBS[op] as number, a, register(other, line), y, 0);
    if (/^R\d{1,2}\s*[^\s\w]/.test(other)) throw unreadable(t, line);
    if (
      /[+\-&|^]/.test(other) &&
      !/^-?(0x)?[0-9a-f]+$/i.test(other) &&
      !/^[A-Za-z_]\w*\s*[+-]\s*\S+$/.test(other)
    )
      throw unreadable(t, line);
    const c = value(other, context, line);
    // `R3 <= R1 + 1` and `R3 <= R1 - 1` are count up and count down, the ALU's own jobs.
    if (c === 1 && op === "+") return encode(1, 6, a, 0, y, 0);
    if (c === 1 && op === "-") return encode(1, 7, a, 0, y, 0);
    return encode(2, JOBS[op] as number, a, 0, y, constant(c, line));
  }
  if (/^R\d{1,2}$/.test(right)) return encode(1, 5, 0, register(right, line), y, 0);
  if (/[*/%]|<<|>>/.test(right) || /^R\d{1,2}\s*[^\s\w]/.test(right)) throw unreadable(t, line);
  return encode(2, 5, 0, 0, y, constant(value(right, context, line), line));
}

/** A program's listing, one line per instruction: its address, its digits and its text. */
export function listing(program: Program): string[] {
  return program.lines.map((l) =>
    l.instruction === undefined
      ? `${l.address.toString(16).toUpperCase().padStart(3, "0")}  ${l.label ? `${l.label}: ` : ""}${l.text}`
      : `${l.address.toString(16).toUpperCase().padStart(3, "0")}  ${instructionHex(l.instruction)}  ${l.label ? `${l.label}: ` : ""}${l.text}`,
  );
}

export { fieldsOf };
