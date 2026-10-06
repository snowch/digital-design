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

class AssemblyError extends Error {
  constructor(line: number, text: string) {
    super(`line ${line}: ${text}`);
  }
}

const encode = (k: number, j: number, a: number, b: number, y: number, c: number) =>
  ((k << 28) | (j << 24) | (a << 20) | (b << 16) | (y << 12) | (c & 0xfff)) >>> 0;

/** Module 9's capstone: the kind a call through a register is written at, `call R3 + 8, R15`. */
export interface AssemblyOptions {
  readonly callThroughRegister?: number;
}

/** Assembles a program. Labels may be used before they are defined. */
export function assemble(source: string, options: AssemblyOptions = {}): Program {
  const raw = source.split("\n");
  // First pass: addresses and labels.
  type Item =
    | { kind: "instruction"; text: string; line: number; address: number; label?: string }
    | {
        kind: "data";
        text: string;
        line: number;
        address: number;
        bytes: number[];
        label?: string;
      };
  const items: Item[] = [];
  const labels: Record<string, number> = {};
  let address = 0;
  raw.forEach((full, index) => {
    const lineNo = index + 1;
    let text = (full.split("//")[0] ?? "").trim();
    if (!text) return;
    let label: string | undefined;
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(text);
    if (m) {
      label = m[1] as string;
      text = (m[2] ?? "").trim();
    }
    const data = /^(word|byte)\s+(.+)$/.exec(text);
    if (data) {
      const size = data[1] === "word" ? 8 : 1;
      if (size === 8) while (address % 8) address++;
      const values = (data[2] ?? "").split(",").map((t) => bigNumber(t.trim(), lineNo));
      const bytes = values.flatMap((v) =>
        Array.from({ length: size }, (_, i) =>
          Number((BigInt.asUintN(64, v) >> BigInt(8 * i)) & 0xffn),
        ),
      );
      if (label) labels[label] = address;
      items.push({ kind: "data", text, line: lineNo, address, bytes, ...(label ? { label } : {}) });
      address += bytes.length;
      return;
    }
    while (address % 4) address++;
    if (label) labels[label] = address;
    if (!text) return;
    items.push({ kind: "instruction", text, line: lineNo, address, ...(label ? { label } : {}) });
    address += 4;
  });
  if (address > MAP.romEnd)
    throw new Error(`the program needs ${address} bytes; the ROM holds ${MAP.romEnd}`);
  const rom = new Uint8Array(MAP.romEnd);
  const lines: AssembledLine[] = [];
  for (const item of items) {
    if (item.kind === "data") {
      rom.set(item.bytes, item.address);
      lines.push({
        text: item.text,
        address: item.address,
        ...(item.label ? { label: item.label } : {}),
      });
      continue;
    }
    const word = instruction(item.text, item.address, labels, item.line, options);
    for (let i = 0; i < 4; i++) rom[item.address + i] = (word >>> (8 * i)) & 0xff;
    lines.push({
      text: item.text,
      address: item.address,
      instruction: word,
      ...(item.label ? { label: item.label } : {}),
    });
  }
  return { rom, lines, labels };
}

/** A number of any size, for a word of data. */
function bigNumber(text: string, line: number): bigint {
  const t = text.trim();
  const negative = t.startsWith("-");
  const body = negative ? t.slice(1) : t;
  if (/^0x[0-9a-f]+$/i.test(body) || /^\d+$/.test(body))
    return negative ? -BigInt(body) : BigInt(body);
  throw new AssemblyError(line, `${JSON.stringify(t)} is not a number`);
}

function number(text: string, line: number): number {
  const t = text.trim();
  if (/^-?0x[0-9a-f]+$/i.test(t))
    return t.startsWith("-") ? -parseInt(t.slice(3), 16) : parseInt(t, 16);
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  throw new AssemblyError(line, `${JSON.stringify(t)} is not a number`);
}

function register(text: string, line: number): number {
  const m = /^R(\d{1,2})$/.exec(text.trim());
  const n = m ? Number(m[1]) : NaN;
  if (!(n >= 0 && n <= 15))
    throw new AssemblyError(line, `${JSON.stringify(text)} is not R0 to R15`);
  return n;
}

function constant(value: number, line: number): number {
  if (value < -2048 || value > 2047)
    throw new AssemblyError(line, `${value} does not fit: a constant is -2048 to 2047`);
  return value;
}

/** A value: a number, a label or a device's name. */
function value(text: string, labels: Readonly<Record<string, number>>, line: number): number {
  const t = text.trim();
  if (t in DEVICE_NAMES) return DEVICE_NAMES[t] as number;
  if (t in labels) return labels[t] as number;
  return number(t, line);
}

/** `R1 + 8`, `R1 - 8`, `R1`, or a value alone: the register (if any) and the constant. */
function addressOf(
  text: string,
  labels: Readonly<Record<string, number>>,
  line: number,
): { reg?: number; c: number } {
  const m = /^(R\d{1,2})\s*(?:([+-])\s*(.+))?$/.exec(text.trim());
  if (m) {
    const c = m[3] ? value(m[3], labels, line) * (m[2] === "-" ? -1 : 1) : 0;
    return { reg: register(m[1] as string, line), c: constant(c, line) };
  }
  return { c: constant(value(text, labels, line), line) };
}

function instruction(
  text: string,
  at: number,
  labels: Readonly<Record<string, number>>,
  line: number,
  options: AssemblyOptions = {},
): number {
  const t = text.replace(/\s+/g, " ").trim();
  const offset = (target: string) => {
    const to = value(target, labels, line);
    if ((to - at) % 4 !== 0)
      throw new AssemblyError(line, `${target} is not a whole instruction away`);
    return constant((to - at) / 4, line);
  };
  if (t === "stop") return encode(8, 4, 0, 0, 0, 0);
  if (t === "nothing") return encode(5, 1, 0, 0, 0, 0);
  if (t === "call system") return encode(8, 0, 0, 0, 0, 0);
  if (t === "resume") return encode(8, 1, 0, 0, 0, 0);
  if (t.includes(">") && !t.includes(">=") && !t.includes("<="))
    throw new AssemblyError(line, "there is no `>`: swap the two registers and write `<`");
  let m = /^call (R\d{1,2})(?: ?([+-]) ?(.+))?, ?(R\d{1,2})$/.exec(t);
  if (m) {
    if (options.callThroughRegister === undefined)
      throw new AssemblyError(line, "this machine has no call through a register");
    const c = m[3] ? value(m[3], labels, line) * (m[2] === "-" ? -1 : 1) : 0;
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
    const c = m[3] ? value(m[3], labels, line) * (m[2] === "-" ? -1 : 1) : 0;
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
      throw new AssemblyError(line, "write `signed` or `unsigned` after `<` or `>=`");
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
    const { reg, c } = addressOf(m[2] as string, labels, line);
    const j = (m[1] === "byte" ? 1 : 0) | (reg === undefined ? 8 : 0);
    return encode(4, j, reg ?? 0, register(m[3] as string, line), 0, c);
  }
  m = /^(C\d) <= (R\d{1,2})$/.exec(t);
  if (m)
    return encode(8, 3, register(m[2] as string, line), 0, 0, Number((m[1] as string).slice(1)));
  m = /^(R\d{1,2}) <= (.+)$/.exec(t);
  if (!m) throw new AssemblyError(line, `cannot read ${JSON.stringify(text)}`);
  const y = register(m[1] as string, line);
  const right = (m[2] as string).trim();
  let r = /^(word|byte)\[(.+)\]$/.exec(right);
  if (r) {
    const { reg, c } = addressOf(r[2] as string, labels, line);
    const j = (r[1] === "byte" ? 1 : 0) | (reg === undefined ? 8 : 0);
    return encode(3, j, reg ?? 0, 0, y, c);
  }
  r = /^C(\d)$/.exec(right);
  if (r) return encode(8, 2, 0, 0, y, Number(r[1]));
  r = /^(R\d{1,2}) ?([&^+|-]) ?(.+)$/.exec(right);
  if (r) {
    const a = register(r[1] as string, line);
    const op = r[2] as string;
    const other = (r[3] as string).trim();
    if (/^R\d{1,2}$/.test(other))
      return encode(1, JOBS[op] as number, a, register(other, line), y, 0);
    const c = value(other, labels, line);
    // `R3 <= R1 + 1` and `R3 <= R1 - 1` are count up and count down, the ALU's own jobs.
    if (c === 1 && op === "+") return encode(1, 6, a, 0, y, 0);
    if (c === 1 && op === "-") return encode(1, 7, a, 0, y, 0);
    return encode(2, JOBS[op] as number, a, 0, y, constant(c, line));
  }
  if (/^R\d{1,2}$/.test(right)) return encode(1, 5, 0, register(right, line), y, 0);
  return encode(2, 5, 0, 0, y, constant(value(right, labels, line), line));
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
