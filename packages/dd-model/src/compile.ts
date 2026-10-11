// Copyright © 2026 Christopher Snow

// Beyond the machine, the compiler chapter: the course's own compiler, small and real. It reads
// lines that say what to work out, in the course's text with the assembler's refusals lifted, and
// writes the course's instructions in `docs/isa.md`'s assembly. The chapter's figure reads its
// steps; nothing on the page is scripted.
//
// A line is `D <= E`, where D is `display` or `lamps`, or `if E C E then D <= E`, where C is one of
// < <= > >= == !=. An E is a device's name the line reads (sensorA, sensorB, signals, lamps), a
// number from -2048 to 2047, two Es joined by + - & | ^, or an E in brackets. Jobs are done left to
// right, brackets first. In these lines a device's name stands for its word, the reading; in
// assembly the name alone is its address.
//
// The compiler rewrites the line in place: it takes the leftmost piece the assembler would refuse,
// writes one instruction for it, and puts that instruction's register where the piece was, until
// nothing of the line is left. Five rules, four of them the advice of a refusal Module 11 taught
// (docs/notes/beyond-the-machine-plan.md, section 4):
//   read    a device's name the line reads: the next register takes its word;
//   number  a number: the next register takes it;
//   job     two registers joined by a job: the next register takes the result;
//   branch  `if`, both sides registers: a branch past the rest of the line, on the comparison
//           turned over, read signed, the registers swapped where that comparison is > or <=;
//   store   a device's name the line writes, a register on the right: a store.
// Each line starts again at R1, so nothing is kept in a register from one line to the next. The
// program ends with `stop`.

import { runScenario } from "./program-tests";

/** The rules, in the order the chapter lists them. */
export const COMPILE_RULES = ["read", "number", "job", "branch", "store"] as const;
export type CompileRule = (typeof COMPILE_RULES)[number];

/** Why the compiler refuses a line, as a code the learner's sentences are keyed by. */
export type CompileProblemCode =
  /** A name that is no device the line may read. */
  | "name"
  /** A number outside -2048 to 2047, the constant an instruction holds. */
  | "range"
  /** `*` or `/`: the machine has no multiplication or division. */
  | "multiply"
  /** A line in no form the compiler reads. */
  | "form"
  /** A line with more pieces than the registers R1 to R13 can hold. */
  | "registers";

export interface CompileProblem {
  /** The line's number in the text, from 1. */
  readonly line: number;
  readonly code: CompileProblemCode;
  /** The name, the number or the text the sentence names. */
  readonly values: Readonly<Record<string, string>>;
}

export interface CompileStep {
  /** The line's number in the text, from 1. */
  readonly line: number;
  /** The line as it stood before this step. */
  readonly before: string;
  /** Where the piece the compiler takes sits in `before`: from, to (not included). */
  readonly piece: readonly [number, number];
  readonly rule: CompileRule;
  /** The instruction written, in assembly. */
  readonly instruction: string;
  /** The line after the step, with the register in place of the piece; "" when nothing is left. */
  readonly after: string;
  /** Where the piece came from in the line as first written (the first step's `before`). */
  readonly source: readonly [number, number];
  /** Every instruction the piece became, by its place in `instructions`, this step's among them. */
  readonly made: readonly number[];
}

export interface Compiled {
  readonly steps: readonly CompileStep[];
  /** The instructions in order, `stop` last, each with the line it came from (0 for `stop`). */
  readonly instructions: readonly { readonly text: string; readonly line: number }[];
  /** The program as assembly text, a line's name before the instruction after the line. */
  readonly program: string;
  readonly problems: readonly CompileProblem[];
}

export interface CompileOptions {
  /** The failure experiment's broken rule: every piece in R1. */
  readonly fault?: "oneRegister";
}

/** The devices a line may read, and the two it may write. */
const READS = new Set(["sensorA", "sensorB", "signals", "lamps"]);
const WRITES = new Set(["display", "lamps"]);
const JOB_OPERATORS = new Set(["+", "-", "&", "|", "^"]);
const COMPARISONS = new Set(["<", "<=", ">", ">=", "==", "!="]);
/** The highest register a line's pieces may take: R14 and R15 are the stack's and the return's. */
const LAST_REGISTER = 13;

type Expr =
  | { kind: "name"; name: string; bracketed: boolean }
  | { kind: "number"; value: number; bracketed: boolean }
  | { kind: "register"; n: number }
  | { kind: "job"; op: string; left: Expr; right: Expr; bracketed: boolean };

interface Line {
  test?: { left: Expr; op: string; right: Expr };
  target: string;
  value: Expr;
}

class Refusal extends Error {
  constructor(
    readonly code: CompileProblemCode,
    readonly values: Readonly<Record<string, string>> = {},
  ) {
    super(code);
  }
}

/** Splits a line into names, numbers, operators and brackets. */
function tokens(text: string): string[] {
  const out: string[] = [];
  const re = /\s*(<=|>=|==|!=|[A-Za-z_][A-Za-z0-9_]*|\d+|[-+&|^*/()<>]|\S)/y;
  let m: RegExpExecArray | null;
  while (re.lastIndex < text.length && (m = re.exec(text))) out.push(m[1] as string);
  if (/\S/.test(text.slice(re.lastIndex))) throw new Refusal("form", { text });
  return out;
}

/** Reads one line of the compiler's text. */
function parseLine(text: string): Line {
  const ts = tokens(text);
  let at = 0;
  const peek = () => ts[at];
  const take = () => ts[at++];
  const expect = (t: string) => {
    if (take() !== t) throw new Refusal("form", { text });
  };

  const primary = (): Expr => {
    const t = take();
    if (t === undefined) throw new Refusal("form", { text });
    if (t === "(") {
      const e = expr();
      expect(")");
      return e.kind === "register" ? e : { ...e, bracketed: true };
    }
    if (t === "-" && /^\d+$/.test(peek() ?? "")) return number(-Number(take()));
    if (/^\d+$/.test(t)) return number(Number(t));
    if (/^[A-Za-z_]/.test(t)) {
      if (!READS.has(t)) throw new Refusal("name", { name: t });
      return { kind: "name", name: t, bracketed: false };
    }
    throw new Refusal(t === "*" || t === "/" ? "multiply" : "form", { text });
  };
  const number = (value: number): Expr => {
    if (value < -2048 || value > 2047) throw new Refusal("range", { number: String(value) });
    return { kind: "number", value, bracketed: false };
  };
  const expr = (): Expr => {
    let left = primary();
    for (;;) {
      const op = peek();
      if (op === "*" || op === "/") throw new Refusal("multiply", { text });
      if (op === undefined || !JOB_OPERATORS.has(op)) return left;
      take();
      left = { kind: "job", op, left, right: primary(), bracketed: false };
    }
  };

  let test: Line["test"];
  if (peek() === "if") {
    take();
    const left = expr();
    const op = take();
    if (op === undefined || !COMPARISONS.has(op)) throw new Refusal("form", { text });
    const right = expr();
    expect("then");
    test = { left, op, right };
  }
  const target = take();
  if (target === undefined || !WRITES.has(target)) {
    if (target !== undefined && /^[A-Za-z_]/.test(target) && !READS.has(target) && peek() === "<=")
      throw new Refusal("name", { name: target });
    throw new Refusal("form", { text });
  }
  expect("<=");
  const value = expr();
  if (at !== ts.length) {
    const t = peek();
    throw new Refusal(t === "*" || t === "/" ? "multiply" : "form", { text });
  }
  return test ? { test, target, value } : { target, value };
}

/** A line written out, with where each piece of it sits. */
interface Rendered {
  text: string;
  spans: Map<Expr, [number, number]>;
}

function render(line: Line): Rendered {
  let text = "";
  const spans = new Map<Expr, [number, number]>();
  const put = (e: Expr) => {
    const from = text.length;
    const bracketed = e.kind !== "register" && e.bracketed;
    if (bracketed) text += "(";
    if (e.kind === "name") text += e.name;
    else if (e.kind === "number") text += String(e.value);
    else if (e.kind === "register") text += `R${e.n}`;
    else {
      put(e.left);
      text += ` ${e.op} `;
      put(e.right);
    }
    if (bracketed) text += ")";
    spans.set(e, [from, text.length]);
  };
  if (line.test) {
    text += "if ";
    put(line.test.left);
    text += ` ${line.test.op} `;
    put(line.test.right);
    text += " then ";
  }
  text += `${line.target} <= `;
  put(line.value);
  return { text, spans };
}

/** The comparison turned over, as the branch the machine has for it. */
function branchFor(op: string, a: number, b: number, name: string): string {
  switch (op) {
    case "<":
      return `if R${a} >= R${b} signed goto ${name}`;
    case ">=":
      return `if R${a} < R${b} signed goto ${name}`;
    case ">":
      // a > b fails when a <= b, which the machine writes as b >= a.
      return `if R${b} >= R${a} signed goto ${name}`;
    case "<=":
      // a <= b fails when a > b, which the machine writes as b < a.
      return `if R${b} < R${a} signed goto ${name}`;
    case "==":
      return `if R${a} != R${b} goto ${name}`;
    default:
      return `if R${a} == R${b} goto ${name}`;
  }
}

/** Compiles a text of lines: one per line, blank lines and `//` comments skipped. */
export function compile(text: string, options: CompileOptions = {}): Compiled {
  const steps: CompileStep[] = [];
  const instructions: { text: string; line: number }[] = [];
  const problems: CompileProblem[] = [];
  /** The names that go before the next instruction: a line's `afterN`. */
  let pending: string[] = [];
  const program: string[] = [];
  const write = (instruction: string, line: number) => {
    const named = pending.map((n) => `${n}: `).join("");
    pending = [];
    program.push(`${named}${instruction}`);
    instructions.push({ text: instruction, line });
    return instructions.length - 1;
  };

  text.split("\n").forEach((raw, i) => {
    const lineNo = i + 1;
    const source = raw.replace(/\/\/.*$/, "").trim();
    if (source === "") return;
    let line: Line;
    try {
      line = parseLine(source);
    } catch (e) {
      if (e instanceof Refusal) problems.push({ line: lineNo, code: e.code, values: e.values });
      else throw e;
      return;
    }
    const first = render(line);
    /** Where each piece sits in the line as first written, carried as the pieces are replaced. */
    const origin = new Map<Expr, [number, number]>(first.spans);
    /** The instructions each register-in-place stands for. */
    const madeOf = new Map<Expr, number[]>();
    let next = 1;
    const register = () => {
      if (options.fault === "oneRegister") return 1;
      if (next > LAST_REGISTER) throw new Refusal("registers", {});
      return next++;
    };
    let current = first;
    const lineSteps: CompileStep[] = [];
    const lineInstructions: number[] = [];
    const step = (
      piece: Expr,
      rule: CompileRule,
      instruction: string,
      made: number[],
      replace: (r: Expr | undefined) => void,
      reg?: number,
    ) => {
      const span = current.spans.get(piece) ?? [0, current.text.length];
      const before = current.text;
      const index = write(instruction, lineNo);
      lineInstructions.push(index);
      const all = [...made, index];
      const r: Expr | undefined = reg === undefined ? undefined : { kind: "register", n: reg };
      if (r) {
        origin.set(r, origin.get(piece) ?? span);
        madeOf.set(r, all);
      }
      replace(r);
      const after = replace === finish ? "" : render(line).text;
      lineSteps.push({
        line: lineNo,
        before,
        piece: span,
        rule,
        instruction,
        after,
        source: origin.get(piece) ?? span,
        made: all,
      });
      if (after !== "") current = render(line);
    };
    const finish = () => {};

    /** Reduces a piece to one register, writing its instructions, leftmost piece first. */
    const reduce = (e: Expr, put: (r: Expr) => void): number => {
      if (e.kind === "register") return e.n;
      if (e.kind === "job") {
        const a = reduce(e.left, (r) => (e.left = r));
        const b = reduce(e.right, (r) => (e.right = r));
        const n = register();
        step(
          e,
          "job",
          `R${n} <= R${a} ${e.op} R${b}`,
          [...(madeOf.get(e.left) ?? []), ...(madeOf.get(e.right) ?? [])],
          (r) => put(r!),
          n,
        );
        return n;
      }
      const n = register();
      if (e.kind === "name") step(e, "read", `R${n} <= word[${e.name}]`, [], (r) => put(r!), n);
      else step(e, "number", `R${n} <= ${e.value}`, [], (r) => put(r!), n);
      return n;
    };

    try {
      const name = `after${lineNo}`;
      if (line.test) {
        const t = line.test;
        const a = reduce(t.left, (r) => (t.left = r));
        const b = reduce(t.right, (r) => (t.right = r));
        const whole = { kind: "test" } as unknown as Expr;
        // The branch's piece is everything before `then`, and the words `then`.
        const thenAt = current.text.indexOf(" then ") + " then".length;
        current.spans.set(whole, [0, thenAt]);
        origin.set(whole, [0, first.text.indexOf(" then ") + " then".length]);
        step(
          whole,
          "branch",
          branchFor(t.op, a, b, name),
          [...(madeOf.get(t.left) ?? []), ...(madeOf.get(t.right) ?? [])],
          () => delete line.test,
        );
      }
      const v = reduce(line.value, (r) => (line.value = r));
      const whole = { kind: "store" } as unknown as Expr;
      current.spans.set(whole, [0, current.text.length]);
      origin.set(whole, [0, first.text.length]);
      step(
        whole,
        "store",
        `word[${line.target}] <= R${v}`,
        [...(madeOf.get(line.value) ?? [])],
        finish,
      );
      if (line.test === undefined && lineSteps.some((s) => s.rule === "branch")) pending.push(name);
    } catch (e) {
      if (!(e instanceof Refusal)) throw e;
      problems.push({ line: lineNo, code: e.code, values: e.values });
      // A refused line writes nothing: take back what it wrote.
      instructions.splice(instructions.length - lineInstructions.length);
      program.splice(program.length - lineInstructions.length);
      return;
    }
    steps.push(...lineSteps);
  });
  if (problems.length > 0) return { steps: [], instructions: [], program: "", problems };
  write("stop", 0);
  return { steps, instructions, program: program.join("\n"), problems };
}

/** What the compiled program did with a pair of readings: what the display and the lamps show. */
export interface CompiledRun {
  /** The display's word, signed, or "X" if nothing was written to it. */
  readonly display: string;
  readonly lamps: number;
  /** Instructions run, the `stop` among them. */
  readonly ran: number;
  /** Whether the run ended at the program's `stop`. */
  readonly stopped: boolean;
}

/** Runs a compiled program on the machine (the debugger's model) with room A and room B's readings. */
export function runCompiled(compiled: Compiled, sensorA: number, sensorB: number): CompiledRun {
  const run = runScenario(compiled.program, {
    inputs: { sensorA: BigInt(sensorA), sensorB: BigInt(sensorB) },
  });
  const cpu = run.state?.cpu;
  return {
    display: cpu?.display === undefined ? "X" : BigInt.asIntN(64, cpu.display).toString(),
    lamps: Number(cpu?.lamps ?? 0),
    ran: run.state?.ran ?? 0,
    stopped: run.state?.stopped?.kind === "machine" && run.state.stopped.reason.kind === "stop",
  };
}
