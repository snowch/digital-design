// Copyright © 2026 Christopher Snow

// The joins a text of the whole machine makes, read from the text alone: a part's output joined
// to another's input by one wire's name, the machine's inputs, constants, the text's own logic,
// and ports left open, in a text that does not elaborate.

import { describe, expect, it } from "vitest";

import { labJoins } from "./machine13-joins";

const TEXT = `module machine(input logic CLK, input logic RST, input logic DOOR, output logic [2:0] LAMPS);
  logic [7:0] CAUSEF, CAUSEM;
  logic [1:0] WAITING;
  logic GO, X;
  assign X = GO & DOOR;
  memory mem (.CLK(CLK), .DOOR(1'b0), .TICK(X), .CAUSEF(CAUSEF), .LAMPS(LAMPS), .WAITING(WAITING));
  traplogic tl (.CAUSEF(CAUSEF), .WAITING(2'b00), .GO(GO));
endmodule
`;

describe("labJoins", () => {
  const j = labJoins(TEXT);
  const mem = j.parts.find((p) => p.module === "memory")!;
  const tl = j.parts.find((p) => p.module === "traplogic")!;
  const input = (part: typeof mem, port: string) => part.inputs.find((p) => p.port === port)!;
  const output = (part: typeof mem, port: string) => part.outputs.find((p) => p.port === port)!;

  it("reads the parts the text places, though the text would not elaborate", () => {
    expect(j.problem).toBeUndefined();
    expect(j.parts.map((p) => p.name)).toEqual(["mem", "tl"]);
  });

  it("names what feeds each input port", () => {
    expect(input(tl, "CAUSEF").source).toEqual({ kind: "part", part: "mem", port: "CAUSEF" });
    expect(input(mem, "CLK").source).toEqual({ kind: "input", name: "CLK" });
    expect(input(mem, "DOOR").source).toEqual({ kind: "constant", text: "1'b0" });
    expect(input(mem, "TICK").source).toEqual({ kind: "text", text: "X" });
    expect(input(mem, "ADDR").source).toEqual({ kind: "open" });
  });

  it("names what reads each output port", () => {
    expect(output(mem, "CAUSEF").readers).toEqual([{ kind: "part", part: "tl", port: "CAUSEF" }]);
    expect(output(mem, "LAMPS").readers).toEqual([{ kind: "output", name: "LAMPS" }]);
    expect(output(mem, "WAITING").readers).toEqual([]);
    expect(output(tl, "GO").readByText).toBe(true);
    expect(output(mem, "MQ").written).toBe("");
  });

  it("says why a text that does not parse has no joins", () => {
    expect(labJoins("module machine(").problem).toBeTruthy();
  });
});
