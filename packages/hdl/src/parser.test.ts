// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { HdlError } from "./ast";
import { tokenize } from "./lexer";
import { parse } from "./parser";

describe("the lexer", () => {
  it("reads identifiers, keywords, sized numbers and symbols, skipping comments", () => {
    const tokens = tokenize(
      "module m; // a comment\n assign y = a & 4'b10x1; /* block */ endmodule",
    );
    expect(tokens.map((t) => t.text)).toEqual([
      "module",
      "m",
      ";",
      "assign",
      "y",
      "=",
      "a",
      "&",
      "4'b10x1",
      ";",
      "endmodule",
      "",
    ]);
    expect(tokens.map((t) => t.kind)).toEqual([
      "keyword",
      "identifier",
      "symbol",
      "keyword",
      "identifier",
      "symbol",
      "identifier",
      "symbol",
      "number",
      "symbol",
      "keyword",
      "end",
    ]);
    expect(tokens[3]?.at).toEqual({ line: 2, column: 2 });
  });

  it("keeps <= whole and refuses characters outside the language", () => {
    expect(tokenize("q <= d").map((t) => t.text)).toEqual(["q", "<=", "d", ""]);
    expect(() => tokenize("a$b")).not.toThrow();
    expect(() => tokenize("a % b")).toThrow(HdlError);
  });
});

describe("the parser", () => {
  it("parses ports, declarations, assigns and both always blocks", () => {
    const m = parse(`
      module counter #(parameter N = 4) (input logic clk, input logic rst, output logic [N-1:0] q);
        logic [N-1:0] next;
        assign next = q ^ 4'b0001;
        always_comb begin
          if (rst) next = 0; else next = q;
        end
        always_ff @(posedge clk) q <= next;
      endmodule
    `);
    expect(m.name).toBe("counter");
    expect(m.parameters.map((p) => p.name)).toEqual(["N"]);
    expect(m.ports.map((p) => `${p.direction} ${p.name}${p.range ? "[]" : ""}`)).toEqual([
      "input clk",
      "input rst",
      "output q[]",
    ]);
    expect(m.declarations.map((d) => d.name)).toEqual(["next"]);
    expect(m.items.map((i) => i.kind)).toEqual(["assign", "always_comb", "always_ff"]);
    const ff = m.items[2];
    expect(ff?.kind === "always_ff" && ff.clock).toBe("clk");
  });

  it("parses literals with widths, bases and x bits", () => {
    const m = parse(
      "module m(output logic [7:0] y); assign y = 8'hA5 ^ 8'b1010_xx11 ^ 3'd5 ^ 12; endmodule",
    );
    const item = m.items[0];
    if (item?.kind !== "assign") throw new Error("expected an assign");
    const literals: string[] = [];
    const walk = (e: typeof item.value): void => {
      if (e.kind === "literal") literals.push(`${e.width ?? "?"}:${e.value}:${e.unknown}`);
      else if (e.kind === "binary") {
        walk(e.left);
        walk(e.right);
      }
    };
    walk(item.value);
    expect(literals).toEqual(["8:165:0", "8:163:12", "3:5:0", "?:12:0"]);
  });

  it("honours precedence: ?: loosest, then || && | ^ & == !=, then unary", () => {
    const m = parse(
      "module m(input logic a, b, c, output logic y); assign y = a | b & ~c == 1'b0 ? a : b; endmodule",
    );
    const item = m.items[0];
    if (item?.kind !== "assign") throw new Error("expected an assign");
    const v = item.value;
    expect(v.kind).toBe("ternary");
    if (v.kind !== "ternary") return;
    expect(v.condition.kind).toBe("binary");
    if (v.condition.kind !== "binary") return;
    expect(v.condition.operator).toBe("|");
    expect(v.condition.right.kind === "binary" && v.condition.right.operator).toBe("&");
  });

  it("names the mistakes the course expects, in plain sentences", () => {
    const expectError = (text: string, pattern: RegExp) => {
      try {
        parse(text);
      } catch (error) {
        expect(error).toBeInstanceOf(HdlError);
        expect((error as HdlError).message).toMatch(pattern);
        return;
      }
      throw new Error(`expected an error for ${text}`);
    };
    expectError(
      "module m(input wire a, output logic y); assign y = a; endmodule",
      /write `logic` rather than `wire`/,
    );
    expectError(
      "module m(input logic clk, d, output logic q); always @(posedge clk) q <= d; endmodule",
      /always_comb.*always_ff/,
    );
    expectError(
      "module m(input logic clk, d, output logic q); always_ff @(posedge clk) q = d; endmodule",
      /write `<=`/,
    );
    expectError(
      "module m(input logic a, output logic y); always_comb y <= a; endmodule",
      /write `=`/,
    );
    expectError(
      "module m(input logic clk, d, output logic q); always_ff @(negedge clk) q <= d; endmodule",
      /rising edge/,
    );
    expectError("module m(input logic a, output logic y); assign y = a;", /add `endmodule`/);
    expectError(
      "module m(input logic a, output logic y); assign y = &a; endmodule",
      /expected a signal/,
    );
    expectError(
      "module m(input logic a, output logic y); initial y = a; endmodule",
      /describes a test/,
    );
  });
});
