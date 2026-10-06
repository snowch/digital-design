// Copyright © 2026 Christopher Snow

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
  | "op-arith"
  // Module 5: an enumerated type, such as a state machine's states.
  | "enum"
  // Module 6: a memory written as an array, and filled from a list of values.
  | "array"
  | "array-init"
  // Module 8: one module used inside another.
  | "instance";

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
  // Module 5
  "enum",
  // Module 6
  "array",
  "array-init",
  // Module 8
  "instance",
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
  // Module 5
  enum: "a list of names declared with `typedef enum`",
  // Module 6: drafted by the prose process (docs/notes/module-6-memory.md).
  array: "arrays to declare memories, like `logic [7:0] mem [0:15]`",
  "array-init": "array initialisation like `= '{...}`",
  // Module 8: drafted by the prose process (docs/notes/module-8-datapath.md).
  instance: "one module used inside another, like `alu a1 (.A(QA), .B(QB), .Y(R));`",
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
  // Module 5
  enum: "write each value as a number, such as `2'b01`",
  // Module 6
  "array-init": "write every word with `always_ff`",
};

/** Every construct the text uses, in order of first appearance. */
export function constructsUsed(module: Module): Construct[] {
  const used: Construct[] = [];
  const add = (c: Construct) => {
    if (!used.includes(c)) used.push(c);
  };
  add("module");
  // Module 6: an index into an array is a read of a memory, not a bit select.
  const arrays = new Set(module.declarations.filter((d) => d.array).map((d) => d.name));
  if (module.ports.length) add("ports");
  if (module.ports.some((p) => p.range)) add("vector");
  if (module.parameters.length) add("parameter");
  // Module 5
  if (module.enums?.length) add("enum");
  for (const d of module.declarations) {
    add("logic");
    if (d.range) add("vector");
    if (d.array) add("array");
    if (d.init) add("array-init");
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
        add(e.subject.kind === "identifier" && arrays.has(e.subject.name) ? "array" : "select");
        expression(e.subject);
        expression(e.hi);
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
        if (s.target.select) add(arrays.has(s.target.name) ? "array" : "select");
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
        if (item.targets) add("concat");
        if ((item.targets ?? [item.target]).some((t) => t.select)) add("select");
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
      // Module 8
      case "instance":
        add("instance");
        for (const p of item.parameters) expression(p.value);
        for (const c of item.connections) if (c.value) expression(c.value);
        break;
    }
  }
  return used;
}

/** Messages for every construct the text uses that the challenge does not allow. Empty when none. */
export function gateMessages(module: Module, allowed: readonly Construct[]): Message[] {
  return gateMessagesOf(constructsUsed(module), allowed);
}

/** Module 8: the same, for the constructs a text of several modules uses. */
export function gateMessagesOf(
  used: readonly Construct[],
  allowed: readonly Construct[],
): Message[] {
  const set = new Set(allowed);
  return used
    .filter((c) => !set.has(c))
    .map((c) => {
      const instead = INSTEAD[c];
      return {
        severity: "gate",
        text: `This challenge does not use ${EXPLAIN[c]}.${instead ? ` Instead, ${instead}.` : ""}`,
      };
    });
}
