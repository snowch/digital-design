// Copyright © 2026 Christopher Snow

import { bit0, bit1, formatWord, hierarchy, runSuite, Simulator, type Circuit } from "@dd/sim";
import { describe, expect, it } from "vitest";

import { elaborate } from "./elaborate";
import type { Construct } from "./gate";

function circuitOf(source: string, allowed?: readonly Construct[]): Circuit {
  const result = elaborate(source, allowed ? { allowed } : {});
  const errors = result.messages.filter((m) => m.severity !== "warning");
  if (!result.circuit) throw new Error(errors.map((m) => m.text).join("; "));
  return result.circuit;
}

describe("elaborating assign", () => {
  it("turns bitwise expressions into gates that compute the same table", () => {
    const circuit = circuitOf(
      "module m(input logic a, b, output logic y); assign y = a & ~b; endmodule",
    );
    const d = runSuite(circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { a: 0, b: 0 }, expect: { y: 0 } },
        { inputs: { a: 1, b: 0 }, expect: { y: 1 } },
        { inputs: { a: 1, b: 1 }, expect: { y: 0 } },
        { inputs: { a: 0, b: 1 }, expect: { y: 0 } },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("drives the output from the top gate without an extra buffer", () => {
    const circuit = circuitOf(
      "module m(input logic a, b, output logic y); assign y = a ^ b; endmodule",
    );
    expect(circuit.components.map((c) => c.kind)).toEqual(["xor"]);
  });

  it("gives unsized literals the width of the signal beside them, and refuses one that does not fit", () => {
    const circuit = circuitOf(
      "module m(input logic [3:0] a, output logic [3:0] y); assign y = a ^ 5; endmodule",
    );
    const sim = new Simulator(circuit);
    sim.setInput("a", { width: 4, value: 0b1111n, known: 0b1111n });
    sim.settle();
    expect(formatWord(sim.read("y"))).toBe("1010");
    const r = elaborate(
      "module m(input logic [1:0] a, output logic [1:0] y); assign y = a ^ 5; endmodule",
    );
    expect(r.circuit).toBeUndefined();
    expect(r.messages[0]?.text).toMatch(/does not fit in 2 bits/);
  });

  it("handles selects, concatenation, comparison and the selector", () => {
    const circuit = circuitOf(`
      module m(input logic [3:0] a, input logic s, output logic [3:0] y, output logic eq);
        assign y = s ? {a[1:0], a[3:2]} : a;
        assign eq = a == 4'b1001;
      endmodule`);
    const d = runSuite(circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { a: "1001", s: 0 }, expect: { y: "1001", eq: 1 } },
        { inputs: { a: "1001", s: 1 }, expect: { y: "0110", eq: 1 } },
        { inputs: { a: "1100", s: 1 }, expect: { y: "0011", eq: 0 } },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("reports the mistakes with a place", () => {
    const r = elaborate(
      "module m(input logic a, output logic y, z);\n assign y = a;\n assign y = ~a;\n endmodule",
    );
    expect(r.circuit).toBeUndefined();
    expect(r.messages[0]?.text).toMatch(/assigned twice/);
    expect(r.messages[0]?.at?.line).toBe(3);
    const undriven = elaborate(
      "module m(input logic a, output logic y, z); assign y = a; endmodule",
    );
    expect(undriven.messages[0]?.text).toMatch(/the output z is never assigned/);
    const undeclared = elaborate(
      "module m(input logic a, output logic y); assign y = a & c; endmodule",
    );
    expect(undeclared.messages[0]?.text).toMatch(/c is not declared/);
  });
});

describe("elaborating always_comb", () => {
  it("turns if/else into a selector", () => {
    const circuit = circuitOf(`
      module m(input logic s, a, b, output logic y);
        always_comb begin
          if (s) y = a; else y = b;
        end
      endmodule`);
    expect(circuit.components.map((c) => c.kind).sort()).toEqual(["buf", "mux2"]);
    const d = runSuite(circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { s: 1, a: 1, b: 0 }, expect: { y: 1 } },
        { inputs: { s: 0, a: 1, b: 0 }, expect: { y: 0 } },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("warns about a path that leaves a signal unassigned, and leaves it unknown", () => {
    const r = elaborate(
      "module m(input logic s, a, output logic y); always_comb begin if (s) y = a; end endmodule",
    );
    expect(r.messages.map((m) => m.severity)).toEqual(["warning"]);
    expect(r.messages[0]?.text).toMatch(/not assigned on every path/);
    const sim = new Simulator(r.circuit as Circuit);
    sim.setInput("s", bit0);
    sim.setInput("a", bit1);
    sim.settle();
    expect(formatWord(sim.read("y"))).toBe("X");
  });

  it("turns case into a chain of selectors, first matching label first", () => {
    const circuit = circuitOf(`
      module m(input logic [1:0] state, output logic [1:0] out);
        always_comb begin
          case (state)
            2'b00: out = 2'b01;
            2'b01, 2'b10: out = 2'b11;
            default: out = 2'b00;
          endcase
        end
      endmodule`);
    const d = runSuite(circuit, {
      kind: "combinational",
      vectors: [
        { inputs: { state: "00" }, expect: { out: "01" } },
        { inputs: { state: "01" }, expect: { out: "11" } },
        { inputs: { state: "10" }, expect: { out: "11" } },
        { inputs: { state: "11" }, expect: { out: "00" } },
      ],
    });
    expect(d.failures).toEqual([]);
  });
});

describe("elaborating always_ff", () => {
  it("is the course's flip-flop underneath, down to its NOR gates", () => {
    const circuit = circuitOf(
      "module m(input logic clk, d, output logic q); always_ff @(posedge clk) q <= d; endmodule",
    );
    const tree = hierarchy(circuit);
    expect(tree.children.map((c) => `${c.kind}:${c.name}`)).toEqual(["dff:q_ff"]);
    expect(circuit.components.some((c) => c.path === "q_ff/master/sr/norQ")).toBe(true);
    const d = runSuite(circuit, {
      kind: "sequence",
      steps: [
        { set: { d: 1, clk: 0 }, clock: "clk", expect: { q: 1 } },
        { set: { d: 0 }, expect: { q: 1 } },
        { clock: "clk", expect: { q: 0 } },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("a reset written as if/else loads the reset value at the edge, and an unassigned path holds", () => {
    const circuit = circuitOf(`
      module m(input logic clk, rst, en, d, output logic q);
        always_ff @(posedge clk) begin
          if (rst) q <= 1'b0;
          else if (en) q <= d;
        end
      endmodule`);
    const d = runSuite(circuit, {
      kind: "sequence",
      steps: [
        { set: { clk: 0, rst: 1, en: 1, d: 1 }, clock: "clk", expect: { q: 0 }, label: "reset" },
        { set: { rst: 0 }, clock: "clk", expect: { q: 1 }, label: "load" },
        { set: { en: 0, d: 0 }, clock: "clk", expect: { q: 1 }, label: "hold with enable low" },
        { set: { en: 1 }, clock: "clk", expect: { q: 0 }, label: "load again" },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("a wide target is a register of flip-flops", () => {
    const circuit = circuitOf(
      "module m(input logic clk, input logic [3:0] d, output logic [3:0] q); always_ff @(posedge clk) q <= d; endmodule",
    );
    expect(circuit.composites.filter((c) => c.kind === "dff")).toHaveLength(4);
    const d = runSuite(circuit, {
      kind: "sequence",
      steps: [{ set: { clk: 0, d: "1010" }, clock: "clk", expect: { q: "1010" } }],
    });
    expect(d.failures).toEqual([]);
  });
});

describe("the construct gate", () => {
  it("refuses a construct the challenge does not allow with a plain sentence, before elaborating", () => {
    const r = elaborate(
      "module m(input logic s, a, b, output logic y); always_comb begin if (s) y = a; else y = b; end endmodule",
      {
        allowed: ["module", "ports", "logic", "assign", "op-bitwise"],
      },
    );
    expect(r.circuit).toBeUndefined();
    expect(r.messages.map((m) => m.severity)).toEqual(["gate", "gate"]);
    expect(r.messages[0]?.text).toBe(
      "This challenge does not use `always_comb`. Instead, describe the logic with `assign`.",
    );
    expect(r.messages[1]?.text).toMatch(/`if` and `else`/);
  });

  it("lets an allowed text through unchanged", () => {
    const r = elaborate("module m(input logic a, b, output logic y); assign y = a | b; endmodule", {
      allowed: ["module", "ports", "assign", "op-bitwise"],
    });
    expect(r.circuit).toBeDefined();
    expect(r.constructs).toEqual(["module", "ports", "assign", "op-bitwise"]);
  });
});

describe("the awkward case", () => {
  it("two assigns that read each other elaborate to a latch and carry a synthesis-style warning", () => {
    const r = elaborate(`
      module latch(input logic s, r, output logic q, qb);
        assign q = ~(r | qb);
        assign qb = ~(s | q);
      endmodule`);
    expect(r.circuit).toBeDefined();
    expect(r.messages.map((m) => m.severity)).toEqual(["warning"]);
    expect(r.messages[0]?.text).toMatch(/form a loop/);
    expect(r.messages[0]?.text).toMatch(/holds a value/);
    const sim = new Simulator(r.circuit as Circuit);
    sim.setInput("s", bit1);
    sim.setInput("r", bit0);
    sim.settle();
    sim.setInput("s", bit0);
    sim.settle();
    expect(formatWord(sim.read("q"))).toBe("1");
  });
});

describe("a value of the wrong width inside always_ff", () => {
  it("is refused with a message, not passed to the simulator", () => {
    const r =
      elaborate(`module wide(input logic [7:0] D, input logic RST, input logic CLK, output logic [7:0] Q);
  always_ff @(posedge CLK) begin
    if (RST) Q <= 4'b0000;
    else Q <= D;
  end
endmodule`);
    expect(r.circuit).toBeUndefined();
    expect(r.messages.map((m) => m.text).join(" ")).toMatch(/4.*8|8.*4/);
  });
});

describe("a register with a reset and an enable, written the way the generator writes it", () => {
  const header =
    "module r(input logic [3:0] D, input logic CLK, input logic RST, input logic EN, output logic [3:0] Q);";
  const parts = (source: string) => {
    const circuit = circuitOf(source);
    return {
      circuit,
      top: circuit.composites.filter((c) => !c.path.includes("/")),
      selectors: circuit.components.filter((c) => c.kind === "mux2" && !c.path.includes("/")),
      constants: circuit.components.filter((c) => c.kind === "const" && !c.path.includes("/")),
    };
  };

  it("comes back as one register block with RST and EN ports, and no selector or constant", () => {
    const { top, selectors, constants } = parts(`${header}
  always_ff @(posedge CLK) begin
    if (RST) Q <= 4'b0000;
    else if (EN) Q <= D;
  end
endmodule`);
    expect(top.map((c) => [c.kind, Object.keys(c.inputs).sort()])).toEqual([
      ["register", ["CLK", "D", "EN", "RST"]],
    ]);
    expect(selectors).toEqual([]);
    expect(constants).toEqual([]);
  });

  it("behaves as the text says: the reset wins, EN 0 keeps, EN 1 loads", () => {
    const { circuit } = parts(`${header}
  always_ff @(posedge CLK) begin
    if (RST) Q <= 4'b0000;
    else if (EN) Q <= D;
  end
endmodule`);
    const d = runSuite(circuit, {
      kind: "sequence",
      steps: [
        { label: "load", set: { D: "0110", EN: 1, RST: 0, CLK: 0 } },
        { label: "edge", set: { CLK: 1 }, expect: { Q: "0110" } },
        { label: "low, EN 0", set: { CLK: 0, EN: 0, D: "1111" } },
        { label: "edge keeps", set: { CLK: 1 }, expect: { Q: "0110" } },
        { label: "low, both", set: { CLK: 0, EN: 1, RST: 1 } },
        { label: "edge resets", set: { CLK: 1 }, expect: { Q: "0000" } },
      ],
    });
    expect(d.failures).toEqual([]);
  });

  it("refuses a reset value of the wrong width", () => {
    const result = elaborate(`${header}
  always_ff @(posedge CLK) begin
    if (RST) Q <= 2'b00;
    else if (EN) Q <= D;
  end
endmodule`);
    expect(result.messages.some((m) => /2 bits wide/.test(m.text))).toBe(true);
  });

  it("elaborates any other shape as written, through selectors", () => {
    const { top, selectors } = parts(`${header}
  always_ff @(posedge CLK) begin
    if (EN) Q <= D;
    else if (RST) Q <= 4'b0000;
  end
endmodule`);
    expect(top.map((c) => Object.keys(c.inputs).sort())).toEqual([["CLK", "D"]]);
    expect(selectors.length).toBeGreaterThan(0);
  });
});

describe("selectors for one signal", () => {
  it("each get a name of their own, so a drawing does not stack them", () => {
    const circuit = circuitOf(`module m(input logic a, b, c, d, CLK, output logic Q);
  always_ff @(posedge CLK) begin
    if (a) Q <= b;
    else if (c) Q <= d;
  end
endmodule`);
    const names = circuit.components.filter((c) => c.kind === "mux2").map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
