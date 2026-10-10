// Copyright © 2026 Christopher Snow

// A recursive-descent parser for the subset in ast.ts.
//
// Errors are HdlErrors with a position and a plain sentence. The parser accepts the whole subset;
// gate.ts decides, per lesson, which of the parsed constructs the learner has met.

import {
  HdlError,
  type Block,
  type Case,
  type CaseArm,
  type Declaration,
  type EnumMember,
  type EnumType,
  type Expression,
  type If,
  type Item,
  type Literal,
  type LValue,
  type Module,
  type Parameter,
  type Port,
  type Position,
  type Range,
  type Statement,
} from "./ast";
import { tokenize, type Token } from "./lexer";

export function parse(source: string): Module {
  return new Parser(tokenize(source)).module();
}

/** Module 8: a text of one or more modules, in order. */
export function parseModules(source: string): Module[] {
  return new Parser(tokenize(source)).modules();
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.index + offset, this.tokens.length - 1)] as Token;
  }

  private next(): Token {
    const t = this.peek();
    if (t.kind !== "end") this.index++;
    return t;
  }

  private is(text: string, offset = 0): boolean {
    const t = this.peek(offset);
    return (t.kind === "keyword" || t.kind === "symbol") && t.text === text;
  }

  private expect(text: string, why?: string): Token {
    const t = this.peek();
    if ((t.kind === "keyword" || t.kind === "symbol") && t.text === text) return this.next();
    const found = t.kind === "end" ? "the end of the text" : JSON.stringify(t.text);
    throw new HdlError(t.at, why ?? `expected ${JSON.stringify(text)} but found ${found}`);
  }

  private identifier(what: string): Token {
    const t = this.peek();
    if (t.kind === "identifier") return this.next();
    if (t.kind === "keyword") {
      throw new HdlError(t.at, `${JSON.stringify(t.text)} is a keyword and cannot be ${what}`);
    }
    throw new HdlError(
      t.at,
      `expected ${what} but found ${t.kind === "end" ? "the end of the text" : JSON.stringify(t.text)}`,
    );
  }

  /** Module 8: modules one after another until the text ends. */
  modules(): Module[] {
    const out: Module[] = [this.module(true)];
    while (this.peek().kind !== "end") out.push(this.module(true));
    return out;
  }

  module(several = false): Module {
    const start = this.expect("module", "the text must start with `module`").at;
    const name = this.identifier("the module's name").text;
    const parameters: Parameter[] = [];
    if (this.is("#")) {
      this.next();
      this.expect("(");
      do {
        this.expect("parameter");
        const p = this.identifier("a parameter name");
        this.expect("=");
        parameters.push({ name: p.text, value: this.expression(), at: p.at });
      } while (this.is(",") && this.next());
      this.expect(")");
    }
    const ports: Port[] = [];
    if (this.is("(")) {
      this.next();
      if (!this.is(")")) {
        let direction: Port["direction"] | undefined;
        let range: Range | undefined;
        do {
          if (this.is("input") || this.is("output")) {
            direction = this.next().text as Port["direction"];
            range = undefined;
            if (this.is("wire") || this.is("reg")) {
              const t = this.next();
              throw new HdlError(
                t.at,
                `write \`logic\` rather than \`${t.text}\`: the course uses one type for every signal`,
              );
            }
            if (this.is("logic")) this.next();
            if (this.is("[")) range = this.range();
          }
          if (!direction) {
            throw new HdlError(
              this.peek().at,
              "each port needs a direction: `input logic a` or `output logic y`",
            );
          }
          const p = this.identifier("a port name");
          ports.push(
            range
              ? { direction, name: p.text, range, at: p.at }
              : { direction, name: p.text, at: p.at },
          );
        } while (this.is(",") && this.next());
      }
      this.expect(")");
    }
    this.expect(";");
    const declarations: Declaration[] = [];
    const items: Item[] = [];
    const enums: EnumType[] = [];
    while (!this.is("endmodule")) {
      const t = this.peek();
      if (t.kind === "end") throw new HdlError(t.at, "the module never ends: add `endmodule`");
      if (this.is("typedef")) {
        // Module 5: `typedef enum logic [1:0] {A = 2'b00, B} name;`
        this.next();
        this.expect(
          "enum",
          "the course's `typedef` names an `enum`: `typedef enum logic [1:0] {A, B} name;`",
        );
        if (this.is("logic")) this.next();
        const range = this.is("[") ? this.range() : undefined;
        this.expect("{");
        const members: EnumMember[] = [];
        do {
          const m = this.identifier("a name in the list");
          if (this.is("=")) {
            this.next();
            members.push({ name: m.text, value: this.expression(), at: m.at });
          } else members.push({ name: m.text, at: m.at });
        } while (this.is(",") && this.next());
        this.expect("}");
        const name = this.identifier("the type's name");
        this.expect(";");
        enums.push(
          range
            ? { name: name.text, range, members, at: t.at }
            : { name: name.text, members, at: t.at },
        );
      } else if (t.kind === "identifier" && enums.some((e) => e.name === t.text)) {
        // A signal declared with an enumerated type: `state_t S, N;`
        this.next();
        do {
          const d = this.identifier("a signal name");
          declarations.push({ kind: "logic", name: d.text, type: t.text, at: d.at });
        } while (this.is(",") && this.next());
        this.expect(";");
      } else if (this.is("logic")) {
        this.next();
        const range = this.is("[") ? this.range() : undefined;
        do {
          const d = this.identifier("a signal name");
          // Module 6: a memory is an array of words, written after the name, and may be filled
          // from a list of values.
          const array = this.is("[") ? this.arrayDims() : undefined;
          const init = array && this.is("=") ? this.valueList() : undefined;
          declarations.push({
            kind: "logic",
            name: d.text,
            ...(range ? { range } : {}),
            ...(array ? { array } : {}),
            ...(init ? { init } : {}),
            at: d.at,
          });
        } while (this.is(",") && this.next());
        this.expect(";");
      } else if (this.is("wire") || this.is("reg")) {
        throw new HdlError(
          t.at,
          `write \`logic\` rather than \`${t.text}\`: the course uses one type for every signal`,
        );
      } else if (this.is("parameter") || this.is("localparam")) {
        this.next();
        const p = this.identifier("a parameter name");
        this.expect("=");
        parameters.push({ name: p.text, value: this.expression(), at: p.at });
        this.expect(";");
      } else if (this.is("assign")) {
        const at = this.next().at;
        // Module 7: `assign {COUT, SUM} = ...` gives each part its own bits of the value.
        if (this.is("{")) {
          this.next();
          const targets: LValue[] = [this.lvalue()];
          while (this.is(",")) {
            this.next();
            targets.push(this.lvalue());
          }
          this.expect("}");
          this.expect("=");
          const value = this.expression();
          this.expect(";");
          items.push({ kind: "assign", target: targets[0] as LValue, targets, value, at });
        } else {
          const target = this.lvalue();
          this.expect("=");
          const value = this.expression();
          this.expect(";");
          items.push({ kind: "assign", target, value, at });
        }
      } else if (this.is("always_comb")) {
        const at = this.next().at;
        items.push({ kind: "always_comb", body: this.statement("="), at });
      } else if (this.is("always_ff")) {
        const at = this.next().at;
        this.expect("@");
        this.expect("(");
        if (this.is("negedge")) {
          throw new HdlError(
            this.peek().at,
            "the course's flip-flops capture on the rising edge: write `posedge`",
          );
        }
        this.expect("posedge", "write `always_ff @(posedge clk)`");
        const clock = this.identifier("the clock signal").text;
        this.expect(")");
        items.push({ kind: "always_ff", clock, body: this.statement("<="), at });
      } else if (this.is("always")) {
        throw new HdlError(
          t.at,
          "write `always_comb` for logic or `always_ff @(posedge clk)` for a flip-flop, not a plain `always`",
        );
      } else if (
        t.kind === "identifier" &&
        (this.peek(1).kind === "identifier" ||
          (this.peek(1).kind === "symbol" && this.peek(1).text === "#"))
      ) {
        items.push(this.instance());
      } else if (this.is("initial")) {
        throw new HdlError(
          t.at,
          // Module 13: no module meets `initial`; a testbench is code the course shows, not runs.
          "`initial` describes a test, not hardware: the course's texts describe hardware, and a test of a text is run by other tools.",
        );
      } else {
        throw new HdlError(
          t.at,
          `did not expect ${JSON.stringify(t.text)} here; a module body holds \`logic\` declarations, \`assign\`, \`always_comb\` and \`always_ff\``,
        );
      }
    }
    this.expect("endmodule");
    if (!several && this.peek().kind !== "end") {
      throw new HdlError(this.peek().at, "only one module per text in this course");
    }
    return {
      kind: "module",
      name,
      parameters,
      ports,
      declarations,
      items,
      ...(enums.length ? { enums } : {}),
      at: start,
    };
  }

  /** Module 8: `name #(.P(v)) inst (.port(value), ...);`, ports connected by name. */
  private instance(): Item {
    const m = this.identifier("the module's name");
    const parameters: { name: string; value: Expression; at: Position }[] = [];
    if (this.is("#")) {
      this.next();
      this.expect("(");
      if (!this.is(")")) {
        do {
          this.expect(".", "give each parameter by name, like `#(.N(64))`");
          const p = this.identifier("a parameter name");
          this.expect("(");
          parameters.push({ name: p.text, value: this.expression(), at: p.at });
          this.expect(")");
        } while (this.is(",") && this.next());
      }
      this.expect(")");
    }
    const name = this.identifier("this use's own name");
    this.expect("(");
    const connections: { port: string; value?: Expression; at: Position }[] = [];
    if (!this.is(")")) {
      do {
        this.expect(".", "connect each port by name, like `.A(QA)`");
        const port = this.identifier("a port name");
        this.expect("(");
        if (this.is(")")) connections.push({ port: port.text, at: port.at });
        else connections.push({ port: port.text, value: this.expression(), at: port.at });
        this.expect(")");
      } while (this.is(",") && this.next());
    }
    this.expect(")");
    this.expect(";");
    return { kind: "instance", module: m.text, name: name.text, parameters, connections, at: m.at };
  }

  /** Module 6: an array's words after its name, `[0:15]` or `[16]`. */
  private arrayDims(): { from: Expression; to?: Expression } {
    this.expect("[");
    const from = this.expression();
    let to: Expression | undefined;
    if (this.is(":")) {
      this.next();
      to = this.expression();
    }
    this.expect("]");
    return to ? { from, to } : { from };
  }

  /** Module 6: `= '{a, b, c}`, the values an array is filled with, lowest address first. */
  private valueList(): Expression[] {
    this.expect("=");
    this.expect("'{", "Fill an array with values written as `'{8'h12, 8'h34}`.");
    const values: Expression[] = [this.expression()];
    while (this.is(",")) {
      this.next();
      values.push(this.expression());
    }
    this.expect("}");
    return values;
  }

  private range(): Range {
    this.expect("[");
    const hi = this.expression();
    this.expect(":");
    const lo = this.expression();
    this.expect("]");
    return { hi, lo };
  }

  private lvalue(): LValue {
    const t = this.identifier("the signal being assigned");
    if (this.is("[")) {
      this.next();
      const hi = this.expression();
      let lo = hi;
      if (this.is(":")) {
        this.next();
        lo = this.expression();
      }
      this.expect("]");
      return { name: t.text, select: { hi, lo }, at: t.at };
    }
    return { name: t.text, at: t.at };
  }

  /** `operator` is the assignment the block allows: `=` in always_comb, `<=` in always_ff. */
  private statement(operator: "=" | "<="): Statement {
    const t = this.peek();
    if (this.is("begin")) {
      this.next();
      const statements: Statement[] = [];
      while (!this.is("end")) {
        if (this.peek().kind === "end") throw new HdlError(t.at, "`begin` without its `end`");
        statements.push(this.statement(operator));
      }
      this.next();
      const block: Block = { kind: "block", statements, at: t.at };
      return block;
    }
    if (this.is("if")) {
      this.next();
      this.expect("(");
      const condition = this.expression();
      this.expect(")");
      const then = this.statement(operator);
      let otherwise: Statement | undefined;
      if (this.is("else")) {
        this.next();
        otherwise = this.statement(operator);
      }
      const node: If = otherwise
        ? { kind: "if", condition, then, otherwise, at: t.at }
        : { kind: "if", condition, then, at: t.at };
      return node;
    }
    if (this.is("case")) {
      this.next();
      this.expect("(");
      const subject = this.expression();
      this.expect(")");
      const arms: CaseArm[] = [];
      let defaultArm: Statement | undefined;
      while (!this.is("endcase")) {
        const armAt = this.peek().at;
        if (this.peek().kind === "end") throw new HdlError(t.at, "`case` without its `endcase`");
        if (this.is("default")) {
          this.next();
          if (this.is(":")) this.next();
          defaultArm = this.statement(operator);
          continue;
        }
        const labels: Expression[] = [this.expression()];
        while (this.is(",")) {
          this.next();
          labels.push(this.expression());
        }
        this.expect(":");
        arms.push({ labels, body: this.statement(operator), at: armAt });
      }
      this.next();
      const node: Case = defaultArm
        ? { kind: "case", subject, arms, defaultArm, at: t.at }
        : { kind: "case", subject, arms, at: t.at };
      return node;
    }
    const target = this.lvalue();
    const op = this.peek();
    if (op.kind === "symbol" && (op.text === "=" || op.text === "<=")) {
      this.next();
      if (op.text !== operator) {
        throw new HdlError(
          op.at,
          operator === "<="
            ? "inside `always_ff` write `<=`: a flip-flop takes its new value at the edge, not at once"
            : "inside `always_comb` write `=`: there is no clock edge to wait for",
        );
      }
    } else {
      throw new HdlError(
        op.at,
        `expected ${JSON.stringify(operator)} after ${JSON.stringify(target.name)}`,
      );
    }
    const value = this.expression();
    this.expect(";");
    return { kind: "assignment", operator, target, value, at: target.at };
  }

  // Precedence, loosest first: ?: , || , && , | , ^ , & , == != , unary, primary.
  private expression(): Expression {
    const condition = this.logicalOr();
    if (this.is("?")) {
      const at = this.next().at;
      const then = this.expression();
      this.expect(":");
      const otherwise = this.expression();
      return { kind: "ternary", condition, then, otherwise, at };
    }
    return condition;
  }

  private logicalOr(): Expression {
    let left = this.logicalAnd();
    while (this.is("||")) {
      const at = this.next().at;
      left = { kind: "binary", operator: "||", left, right: this.logicalAnd(), at };
    }
    return left;
  }

  private logicalAnd(): Expression {
    let left = this.bitOr();
    while (this.is("&&")) {
      const at = this.next().at;
      left = { kind: "binary", operator: "&&", left, right: this.bitOr(), at };
    }
    return left;
  }

  private bitOr(): Expression {
    let left = this.bitXor();
    while (this.is("|")) {
      const at = this.next().at;
      left = { kind: "binary", operator: "|", left, right: this.bitXor(), at };
    }
    return left;
  }

  private bitXor(): Expression {
    let left = this.bitAnd();
    while (this.is("^")) {
      const at = this.next().at;
      left = { kind: "binary", operator: "^", left, right: this.bitAnd(), at };
    }
    return left;
  }

  private bitAnd(): Expression {
    let left = this.equality();
    while (this.is("&")) {
      const at = this.next().at;
      left = { kind: "binary", operator: "&", left, right: this.equality(), at };
    }
    return left;
  }

  private equality(): Expression {
    let left = this.additive();
    while (this.is("==") || this.is("!=")) {
      const op = this.next();
      left = {
        kind: "binary",
        operator: op.text as "==" | "!=",
        left,
        right: this.additive(),
        at: op.at,
      };
    }
    return left;
  }

  private additive(): Expression {
    let left = this.unary();
    while (this.is("+") || this.is("-")) {
      const op = this.next();
      left = {
        kind: "binary",
        operator: op.text as "+" | "-",
        left,
        right: this.unary(),
        at: op.at,
      };
    }
    return left;
  }

  private unary(): Expression {
    if (this.is("~") || this.is("!")) {
      const op = this.next();
      return { kind: "unary", operator: op.text as "~" | "!", operand: this.unary(), at: op.at };
    }
    if (this.is("~&") || this.is("~|") || this.is("~^")) {
      throw new HdlError(
        this.peek().at,
        `the reduction operator ${this.peek().text} is not in the course's subset; write the gates out`,
      );
    }
    return this.postfix();
  }

  private postfix(): Expression {
    let e = this.primary();
    while (this.is("[")) {
      const at = this.next().at;
      const hi = this.expression();
      let lo = hi;
      if (this.is(":")) {
        this.next();
        lo = this.expression();
      }
      this.expect("]");
      e = { kind: "index", subject: e, hi, lo, at };
    }
    return e;
  }

  private primary(): Expression {
    const t = this.peek();
    if (t.kind === "identifier") {
      this.next();
      return { kind: "identifier", name: t.text, at: t.at };
    }
    if (t.kind === "number") {
      this.next();
      return literal(t);
    }
    if (this.is("(")) {
      this.next();
      const e = this.expression();
      this.expect(")");
      return e;
    }
    if (this.is("{")) {
      this.next();
      const parts: Expression[] = [this.expression()];
      // Repetition, `{4{a}}`, is a construct the course's language leaves out: said plainly.
      if (this.is("{"))
        throw new HdlError(
          this.peek().at,
          "repetition such as `{4{a}}` is not part of the language this course uses; write the bits out as a number or a list",
        );
      while (this.is(",")) {
        this.next();
        parts.push(this.expression());
      }
      this.expect("}");
      return { kind: "concat", parts, at: t.at };
    }
    throw new HdlError(
      t.at,
      `expected a signal, a number or a bracketed expression but found ${t.kind === "end" ? "the end of the text" : JSON.stringify(t.text)}`,
    );
  }
}

/** `4'b1010`, `8'hA5`, `1'bx`, `3'd5`, or an unsized `12`. */
export function literal(t: Token): Literal {
  const m = /^(\d+)?\s*'\s*[sS]?([bBdDhHoO])\s*([0-9a-fA-FxXzZ_?]+)$/.exec(t.text);
  if (!m) {
    const text = t.text.replace(/_/g, "");
    return { kind: "literal", value: BigInt(text), unknown: 0n, text: t.text, at: t.at };
  }
  const width = m[1] ? Number(m[1]) : undefined;
  const base = (m[2] as string).toLowerCase();
  const digits = (m[3] as string).replace(/_/g, "").toLowerCase();
  const radix = base === "b" ? 2 : base === "o" ? 8 : base === "d" ? 10 : 16;
  const bitsPerDigit = base === "b" ? 1 : base === "o" ? 3 : base === "h" ? 4 : 0;
  let value = 0n;
  let unknown = 0n;
  if (base === "d") {
    if (/[xz?]/.test(digits)) throw new HdlError(t.at, "a decimal literal cannot hold x or z");
    value = BigInt(digits);
  } else {
    for (const ch of digits) {
      value <<= BigInt(bitsPerDigit);
      unknown <<= BigInt(bitsPerDigit);
      if (ch === "x" || ch === "z" || ch === "?") {
        unknown |= (1n << BigInt(bitsPerDigit)) - 1n;
      } else {
        value |= BigInt(parseInt(ch, radix));
      }
    }
  }
  if (width !== undefined) {
    const mask = (1n << BigInt(width)) - 1n;
    value &= mask;
    unknown &= mask;
    return { kind: "literal", value, width, unknown, text: t.text, at: t.at };
  }
  return { kind: "literal", value, unknown, text: t.text, at: t.at };
}

export function describePosition(at: Position): string {
  return `line ${at.line}, column ${at.column}`;
}
