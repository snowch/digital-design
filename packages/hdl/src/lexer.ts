// Copyright © 2026 Chris Snow

// Tokens of the subset. Comments are skipped; positions are kept for messages.

import { HdlError, type Position } from "./ast";

export type TokenKind = "identifier" | "keyword" | "number" | "symbol" | "end";

export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
  readonly at: Position;
}

export const KEYWORDS = new Set([
  "module",
  "endmodule",
  "input",
  "output",
  "logic",
  "wire",
  "reg",
  "assign",
  "always",
  "always_comb",
  "always_ff",
  "posedge",
  "negedge",
  "begin",
  "end",
  "if",
  "else",
  "case",
  "endcase",
  "default",
  "parameter",
  "localparam",
  "initial",
]);

// Longest symbols first, so `<=` is not read as `<` then `=`.
const SYMBOLS = [
  "<=",
  "&&",
  "||",
  "==",
  "!=",
  "+",
  "-",
  "~&",
  "~|",
  "~^",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ",",
  ";",
  ":",
  "?",
  "=",
  "&",
  "|",
  "^",
  "~",
  "!",
  "#",
  "@",
  ".",
];

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let column = 1;
  const at = (): Position => ({ line, column });
  const advance = (n: number) => {
    for (let k = 0; k < n; k++) {
      if (source[i] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
      i++;
    }
  };
  while (i < source.length) {
    const c = source[i] as string;
    if (c === " " || c === "\t" || c === "\r" || c === "\n") {
      advance(1);
      continue;
    }
    if (c === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") advance(1);
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      const start = at();
      const close = source.indexOf("*/", i + 2);
      if (close < 0) throw new HdlError(start, "a comment opened with /* never closes");
      advance(close + 2 - i);
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const start = at();
      let j = i;
      while (j < source.length && /[A-Za-z0-9_$]/.test(source[j] as string)) j++;
      const text = source.slice(i, j);
      tokens.push({ kind: KEYWORDS.has(text) ? "keyword" : "identifier", text, at: start });
      advance(j - i);
      continue;
    }
    if (/[0-9]/.test(c) || (c === "'" && /[bBdDhHoO]/.test(source[i + 1] ?? ""))) {
      const start = at();
      const m = /^(\d+)?\s*'\s*[sS]?([bBdDhHoO])\s*([0-9a-fA-FxXzZ_?]+)|^\d[0-9_]*/.exec(
        source.slice(i),
      );
      if (!m) throw new HdlError(start, `cannot read the number starting at ${JSON.stringify(c)}`);
      tokens.push({ kind: "number", text: m[0], at: start });
      advance(m[0].length);
      continue;
    }
    const symbol = SYMBOLS.find((s) => source.startsWith(s, i));
    if (symbol) {
      tokens.push({ kind: "symbol", text: symbol, at: at() });
      advance(symbol.length);
      continue;
    }
    throw new HdlError(
      at(),
      `the character ${JSON.stringify(c)} is not part of the language this course uses`,
    );
  }
  tokens.push({ kind: "end", text: "", at: at() });
  return tokens;
}
