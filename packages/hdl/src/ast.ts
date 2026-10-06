// Copyright © 2026 Chris Snow

// The syntax tree of the course's SystemVerilog subset.
//
// Small on purpose. The course teaches the synthesisable subset and grows it lesson by lesson
// (gate.ts says which constructs a lesson has met); this file is the whole of what the parser can
// produce, so a construct that is not here is not in the language the course speaks.

export interface Position {
  readonly line: number;
  readonly column: number;
}

export interface Module {
  readonly kind: "module";
  readonly name: string;
  readonly parameters: readonly Parameter[];
  readonly ports: readonly Port[];
  readonly declarations: readonly Declaration[];
  readonly items: readonly Item[];
  /** Module 5: enumerated types, `typedef enum logic [1:0] {A, B} t;`. */
  readonly enums?: readonly EnumType[];
  readonly at: Position;
}

/** Module 5: a named list of constants of one width, such as a state machine's states. */
export interface EnumType {
  readonly name: string;
  readonly range?: Range;
  readonly members: readonly EnumMember[];
  readonly at: Position;
}

export interface EnumMember {
  readonly name: string;
  /** The value written after `=`, if any; otherwise one more than the member before (0 first). */
  readonly value?: Expression;
  readonly at: Position;
}

export interface Parameter {
  readonly name: string;
  readonly value: Expression;
  readonly at: Position;
}

export interface Port {
  readonly direction: "input" | "output";
  readonly name: string;
  /** The declared range, or none for a single bit. */
  readonly range?: Range;
  readonly at: Position;
}

export interface Declaration {
  readonly kind: "logic";
  readonly name: string;
  readonly range?: Range;
  /** Module 5: the enumerated type the signal was declared with, instead of `logic`. */
  readonly type?: string;
  /**
   * Module 6: a memory, written as an array of words after the name: `[0:15]` (`from` 0, `to`
   * 15) or `[16]` (`from` 16 alone, the count).
   */
  readonly array?: { readonly from: Expression; readonly to?: Expression };
  /** Module 6: the list of values the array is filled with, `= '{8'h12, 8'h34}`. */
  readonly init?: readonly Expression[];
  readonly at: Position;
}

export interface Range {
  readonly hi: Expression;
  readonly lo: Expression;
}

export type Item = ContinuousAssign | AlwaysComb | AlwaysFf;

export interface ContinuousAssign {
  readonly kind: "assign";
  /** The signal assigned; for a concatenation, its first part. */
  readonly target: LValue;
  /** Module 7: a concatenation as the target, `{COUT, SUM}`, its parts from the top bits down. */
  readonly targets?: readonly LValue[];
  readonly value: Expression;
  readonly at: Position;
}

export interface AlwaysComb {
  readonly kind: "always_comb";
  readonly body: Statement;
  readonly at: Position;
}

export interface AlwaysFf {
  readonly kind: "always_ff";
  readonly clock: string;
  readonly body: Statement;
  readonly at: Position;
}

export type Statement = Block | Assignment | If | Case;

export interface Block {
  readonly kind: "block";
  readonly statements: readonly Statement[];
  readonly at: Position;
}

export interface Assignment {
  readonly kind: "assignment";
  /** `=` blocking, in always_comb; `<=` non-blocking, in always_ff. */
  readonly operator: "=" | "<=";
  readonly target: LValue;
  readonly value: Expression;
  readonly at: Position;
}

export interface If {
  readonly kind: "if";
  readonly condition: Expression;
  readonly then: Statement;
  readonly otherwise?: Statement;
  readonly at: Position;
}

export interface Case {
  readonly kind: "case";
  readonly subject: Expression;
  readonly arms: readonly CaseArm[];
  readonly defaultArm?: Statement;
  readonly at: Position;
}

export interface CaseArm {
  readonly labels: readonly Expression[];
  readonly body: Statement;
  readonly at: Position;
}

export interface LValue {
  readonly name: string;
  /** A bit or part select on the target, if any. */
  readonly select?: Select;
  readonly at: Position;
}

export interface Select {
  readonly hi: Expression;
  readonly lo: Expression;
}

export type Expression = Identifier | Literal | Unary | Binary | Ternary | IndexExpr | Concat;

export interface Identifier {
  readonly kind: "identifier";
  readonly name: string;
  readonly at: Position;
}

export interface Literal {
  readonly kind: "literal";
  readonly value: bigint;
  /** The declared width, or undefined for an unsized number. */
  readonly width?: number;
  /** Bits written as x in a sized literal, as a mask. */
  readonly unknown: bigint;
  readonly text: string;
  readonly at: Position;
}

export type UnaryOperator = "~" | "!";

export interface Unary {
  readonly kind: "unary";
  readonly operator: UnaryOperator;
  readonly operand: Expression;
  readonly at: Position;
}

export type BinaryOperator = "&" | "|" | "^" | "&&" | "||" | "==" | "!=" | "+" | "-";

export interface Binary {
  readonly kind: "binary";
  readonly operator: BinaryOperator;
  readonly left: Expression;
  readonly right: Expression;
  readonly at: Position;
}

export interface Ternary {
  readonly kind: "ternary";
  readonly condition: Expression;
  readonly then: Expression;
  readonly otherwise: Expression;
  readonly at: Position;
}

export interface IndexExpr {
  readonly kind: "index";
  readonly subject: Expression;
  readonly hi: Expression;
  readonly lo: Expression;
  readonly at: Position;
}

export interface Concat {
  readonly kind: "concat";
  readonly parts: readonly Expression[];
  readonly at: Position;
}

/** A problem with the text, placed, and whether it stops elaboration. */
export interface Message {
  readonly severity: "error" | "warning" | "gate";
  readonly text: string;
  readonly at?: Position;
}

export class HdlError extends Error {
  constructor(
    readonly at: Position,
    message: string,
  ) {
    super(message);
    this.name = "HdlError";
  }
}
