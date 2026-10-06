// Copyright © 2026 Chris Snow

// Module 5: enumerated types, the construct a state machine's states are written with.

import { describe, expect, it } from "vitest";

import { Simulator, formatWord, parseWord } from "@dd/sim";

import { elaborate } from "./elaborate";
import { constructsUsed, gateMessages } from "./gate";
import { parse } from "./parser";

const LIGHTS = `module lights(input logic GO, input logic RST, input logic CLK, output logic [1:0] Y);
  typedef enum logic [1:0] {OFF, LOW = 2'b10, HIGH} level_t;
  level_t L;
  always_ff @(posedge CLK) begin
    if (RST) L <= OFF;
    else case (L)
      OFF: if (GO) L <= LOW; else L <= OFF;
      LOW: L <= HIGH;
      default: L <= OFF;
    endcase
  end
  assign Y = L;
endmodule
`;

describe("enumerated types", () => {
  it("parses a list of names and a signal of that type", () => {
    const m = parse(LIGHTS);
    expect(m.enums?.[0]?.name).toBe("level_t");
    expect(m.enums?.[0]?.members.map((x) => x.name)).toEqual(["OFF", "LOW", "HIGH"]);
    expect(m.declarations[0]).toMatchObject({ name: "L", type: "level_t" });
    expect(constructsUsed(m)).toContain("enum");
  });

  it("numbers names from 0, and from one more than a written value", () => {
    const { circuit, messages } = elaborate(LIGHTS);
    expect(messages).toEqual([]);
    const sim = new Simulator(circuit!);
    sim.setInput("CLK", parseWord("0", 1));
    sim.setInput("GO", parseWord("0", 1));
    sim.setInput("RST", parseWord("1", 1));
    sim.clockCycle("CLK");
    expect(formatWord(sim.read("Y"))).toBe("00");
    sim.setInput("RST", parseWord("0", 1));
    const seen: string[] = [];
    sim.setInput("GO", parseWord("1", 1));
    for (let i = 0; i < 4; i++) {
      sim.clockCycle("CLK");
      seen.push(formatWord(sim.read("Y")));
    }
    // OFF is 00, LOW was written 10, so HIGH is 11.
    expect(seen).toEqual(["10", "11", "00", "10"]);
  });

  it("is refused by a challenge that has not met it, with what to write instead", () => {
    const messages = gateMessages(parse(LIGHTS), [
      "module",
      "ports",
      "logic",
      "vector",
      "always_ff",
      "case",
      "if",
      "assign",
    ]);
    expect(messages.map((m) => m.text)).toEqual([
      "This challenge does not use a list of names declared with `typedef enum`. Instead, write each value as a number, such as `2'b01`.",
    ]);
  });

  it("says plainly what is wrong with a list", () => {
    const err = (text: string) => elaborate(text).messages.map((m) => m.text);
    const wrap = (body: string) =>
      `module m(input logic CLK, output logic [1:0] Y);\n${body}\n  assign Y = 2'b00;\nendmodule\n`;
    expect(err(wrap("  typedef enum {A, B} t;"))).toEqual([
      "give the list a width, such as `typedef enum logic [1:0] {...} t;`",
    ]);
    expect(err(wrap("  typedef enum logic [1:0] {A = 2'b01, B = 2'b01} t;"))).toEqual([
      "B has the same value as A",
    ]);
    expect(err(wrap("  typedef enum logic [0:0] {A, B, C} t;"))).toEqual([
      "C's value does not fit in 1 bits",
    ]);
    expect(err(wrap("  typedef enum logic [1:0] {A = 3'b001} t;"))[0]).toContain("3 bits wide");
  });

  it("refuses a case label of the wrong width with its line, not an internal message", () => {
    const text = `module m(input logic CLK, output logic [2:0] S);
  logic [2:0] state;
  always_comb begin
    case (state)
      2'b01: S = 3'b001;
      default: S = 3'b000;
    endcase
  end
endmodule`;
    expect(elaborate(text).messages).toEqual([
      {
        severity: "error",
        text: "this label is 2 bits wide but the case compares a 3-bit value",
        at: { line: 5, column: 7 },
      },
    ]);
  });
});
