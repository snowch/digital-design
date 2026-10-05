// Module 6: memories written as arrays elaborate to the simulator's memory, read by index with no
// clock and written at an edge; a list of values fills one; the gate refuses an array to a
// challenge that has not met it, in a plain sentence.

import { describe, expect, it } from "vitest";

import { runSuite, type SequenceStep } from "@dd/sim";

import { elaborate } from "./elaborate";
import { ALL_CONSTRUCTS } from "./gate";
import { generate } from "./generate";

const REGFILE = `module regs(input logic [1:0] WA, input logic [3:0] D, input logic WE, input logic CLK,
  input logic [1:0] RA, input logic [1:0] RB, output logic [3:0] QA, output logic [3:0] QB);
  logic [3:0] words [0:3];
  assign QA = words[RA];
  assign QB = words[RB];
  always_ff @(posedge CLK) if (WE) words[WA] <= D;
endmodule
`;

const TABLE = `module table4(input logic [1:0] A, output logic [7:0] Q);
  logic [7:0] values [4] = '{8'h12, 8'h34, 8'h56, 8'h78};
  assign Q = values[A];
endmodule
`;

describe("arrays", () => {
  it("elaborate to a memory with two reads and one write", () => {
    const r = elaborate(REGFILE);
    expect(r.messages).toEqual([]);
    expect(r.constructs).toContain("array");
    const steps: SequenceStep[] = [
      { set: { WA: "01", D: "0111", WE: 1, CLK: 0, RA: "01", RB: "11" } },
      { set: { CLK: 1 }, expect: { QA: "0111", QB: "XXXX" } },
      { set: { CLK: 0, WA: "11", D: "1000" } },
      { set: { CLK: 1 }, expect: { QA: "0111", QB: "1000" } },
      { set: { WA: "01", D: "0000" }, expect: { QA: "0111" } },
      { set: { CLK: 0, WE: 0 } },
      { set: { CLK: 1 }, expect: { QA: "0111" } },
    ];
    const verdict = runSuite(r.circuit!, { kind: "sequence", steps });
    expect(verdict.failures).toEqual([]);
  });

  it("filled from a list and never written, read as a ROM", () => {
    const r = elaborate(TABLE);
    expect(r.messages).toEqual([]);
    expect(r.constructs).toEqual(expect.arrayContaining(["array", "array-init"]));
    expect(r.circuit!.composites.some((c) => c.kind === "rom")).toBe(true);
    const vectors = ["00", "01", "10", "11"].map((a, k) => ({
      inputs: { A: a },
      expect: { Q: ["00010010", "00110100", "01010110", "01111000"][k]! },
    }));
    expect(runSuite(r.circuit!, { kind: "combinational", vectors }).failures).toEqual([]);
  });

  it("are refused, in a sentence, where a challenge has not met them", () => {
    const allowed = ALL_CONSTRUCTS.filter((c) => c !== "array" && c !== "array-init");
    const r = elaborate(REGFILE, { allowed });
    expect(r.circuit).toBeUndefined();
    expect(r.messages[0]?.text).toBe(
      "This challenge does not use arrays to declare memories, like `logic [7:0] mem [0:15]`.",
    );
    const t = elaborate(TABLE, { allowed: [...allowed, "array"] });
    expect(t.messages[0]?.text).toMatch(/^This challenge does not use array initialisation/);
  });

  it("say plainly what is wrong with a memory written another way", () => {
    const wrong = (body: string) =>
      elaborate(`module m(input logic [1:0] A, input logic [3:0] D, input logic WE, input logic CLK, output logic [3:0] Q);
  logic [3:0] mem [0:3];
${body}
endmodule
`).messages[0]?.text;
    expect(wrong("  assign Q = mem[A];\n  assign mem[A] = D;")).toMatch(
      /is a memory; write one word at a clock edge/,
    );
    expect(wrong("  assign Q = mem;")).toMatch(/read one word by its address/);
    expect(wrong("  assign Q = mem[A];")).toMatch(/never written and has no list of values/);
    expect(
      wrong(
        "  assign Q = mem[A];\n  always_ff @(posedge CLK) if (WE) mem[A] <= D; else mem[A] <= 4'b0000;",
      ),
    ).toMatch(/in an `always_ff` of its own, one word at a time/);
    expect(elaborate(TABLE.replace("8'h78}", "8'h78, 8'h9A}")).messages[0]?.text).toMatch(
      /has 4 words, but the list has 5 values/,
    );
  });
});

describe("a memory written back as text", () => {
  it("comes out as the array it was elaborated from, and elaborates to the same behaviour", () => {
    const first = elaborate(REGFILE);
    const text = generate(first.circuit!).text;
    expect(text).toContain("logic [3:0] words [0:3];");
    expect(text).toContain("assign QA = words[RA];");
    expect(text).toContain("always_ff @(posedge CLK) if (WE) words[WA] <= D;");
    expect(elaborate(text).messages).toEqual([]);
    const rom = generate(elaborate(TABLE).circuit!).text;
    expect(rom).toContain("logic [7:0] values [0:3] = '{8'h12, 8'h34, 8'h56, 8'h78};");
  });
});
