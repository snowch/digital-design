// Copyright © 2026 Chris Snow

// The construct gate: which parts of the language a lesson has met.
//
// The subset grows with the course. A lesson declares the constructs it allows; anything else in
// the learner's text is refused with a plain sentence that names the construct and says what to
// write instead, before elaboration ever runs. The ids below are the vocabulary a lesson's data
// uses.

import type { Expression, Message, Module, Statement } from "./ast";

export type Construct =
  | "module"
  | "ports"
  | "logic"
  | "vector"
  | "parameter"
  | "assign"
  | "op-bitwise"
  | "op-logical"
  | "op-compare"
  | "op-ternary"
  | "select"
  | "concat"
  | "always_comb"
  | "always_ff"
  | "if"
  | "case"
  | "op-arith";

export const ALL_CONSTRUCTS: readonly Construct[] = [
  "module",
  "ports",
  "logic",
  "vector",
  "parameter",
  "assign",
  "op-bitwise",
  "op-logical",
  "op-compare",
  "op-ternary",
  "select",
  "concat",
  "always_comb",
  "always_ff",
  "if",
  "case",
  "op-arith",
];

/** What each construct is, in the words the gate uses when it refuses one. */
const EXPLAIN: Record<Construct, string> = {
  module: "a `module`",
  ports: "module ports",
  logic: "a `logic` declaration",
  vector: "a multi-bit signal such as `logic [3:0]`",
  parameter: "a `parameter`",
  assign: "`assign`",
  "op-bitwise": "the bitwise operators `~`, `&`, `|` and `^`",
  "op-logical": "the logical operators `&&`, `||` and `!`",
  "op-compare": "the comparisons `==` and `!=`",
  "op-ternary": "the selector `cond ? a : b`",
  select: "a bit or part select such as `a[0]` or `a[3:2]`",
  concat: "concatenation with `{a, b}`",
  always_comb: "`always_comb`",
  always_ff: "`always_ff`",
  if: "`if` and `else`",
  case: "`case`",
  "op-arith": "arithmetic with `+` and `-`",
};

/** What to write instead, where there is something. */
const INSTEAD: Partial<Record<Construct, string>> = {
  always_comb: "describe the logic with `assign`",
  "op-ternary": "write the selection out with `&`, `|` and `~`",
  if: "write the selection out with `&`, `|` and `~`",
  case: "write the selection out with `&`, `|` and `~`",
  vector: "use one-bit signals",
  concat: "use one-bit signals",
  select: "use one-bit signals",
  "op-arith": "write the gates out; adders come in a later module",
};

/** Every construct the text uses, in order of first appearance. */
export function constructsUsed(module: Module): Construct[] {
  const used: Construct[] = [];
  const add = (c: Construct) => {
    if (!used.includes(c)) used.push(c);
  };
  add("module");
  if (module.ports.length) add("ports");
  if (module.ports.some((p) => p.range)) add("vector");
  if (module.parameters.length) add("parameter");
  for (const d of module.declarations) {
    add("logic");
    if (d.range) add("vector");
  }
  const expression = (e: Expression): void => {
    switch (e.kind) {
      case "identifier":
      case "literal":
        return;
      case "unary":
        add(e.operator === "~" ? "op-bitwise" : "op-logical");
        expression(e.operand);
        return;
      case "binary":
        if (e.operator === "&&" || e.operator === "||") add("op-logical");
        else if (e.operator === "==" || e.operator === "!=") add("op-compare");
        else if (e.operator === "+" || e.operator === "-") add("op-arith");
        else add("op-bitwise");
        expression(e.left);
        expression(e.right);
        return;
      case "ternary":
        add("op-ternary");
        expression(e.condition);
        expression(e.then);
        expression(e.otherwise);
        return;
      case "index":
        add("select");
        expression(e.subject);
        return;
      case "concat":
        add("concat");
        e.parts.forEach(expression);
        return;
    }
  };
  const statement = (s: Statement): void => {
    switch (s.kind) {
      case "block":
        s.statements.forEach(statement);
        return;
      case "assignment":
        if (s.target.select) add("select");
        expression(s.value);
        return;
      case "if":
        add("if");
        expression(s.condition);
        statement(s.then);
        if (s.otherwise) statement(s.otherwise);
        return;
      case "case":
        add("case");
        expression(s.subject);
        for (const arm of s.arms) {
          arm.labels.forEach(expression);
          statement(arm.body);
        }
        if (s.defaultArm) statement(s.defaultArm);
        return;
    }
  };
  for (const item of module.items) {
    switch (item.kind) {
      case "assign":
        add("assign");
        if (item.target.select) add("select");
        expression(item.value);
        break;
      case "always_comb":
        add("always_comb");
        statement(item.body);
        break;
      case "always_ff":
        add("always_ff");
        statement(item.body);
        break;
    }
  }
  return used;
}

/** Messages for every construct the text uses that the challenge does not allow. Empty when none. */
export function gateMessages(module: Module, allowed: readonly Construct[]): Message[] {
  const set = new Set(allowed);
  return constructsUsed(module)
    .filter((c) => !set.has(c))
    .map((c) => {
      const instead = INSTEAD[c];
      return {
        severity: "gate",
        text: `This challenge does not use ${EXPLAIN[c]}.${instead ? ` Instead, ${instead}.` : ""}`,
      };
    });
}
