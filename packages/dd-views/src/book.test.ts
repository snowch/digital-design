import { describe, expect, it } from "vitest";

import { libraryCircuit } from "@dd/dd-model";
import { parseLesson, type Challenge } from "@dd/lesson-schema";

import { circuitToDrawing, compileDrawing, emptyDrawing, type Drawing } from "./drawing";
import { grade } from "./book";
import { DEFAULT_VIEW_STRINGS as S, format } from "./strings";

const SR_STEPS = [
  { label: "press S", set: { S: 1, R: 0 }, expect: { Q: 1 } },
  { label: "release", set: { S: 0, R: 0 }, expect: { Q: 1 } },
  { label: "press R", set: { S: 0, R: 1 }, expect: { Q: 0 } },
];

function challenge(overrides: Partial<Challenge> = {}): Challenge {
  const lesson = parseLesson({
    id: "x",
    title: "x",
    module: 4,
    order: 1,
    objectives: ["o"],
    sections: [
      "question",
      "motivation",
      "prediction",
      "investigation",
      "construction",
      "failureExperiment",
      "explanation",
      "generalisation",
      "challenge",
      "reflection",
    ].map((kind) => ({
      kind: kind as "question",
      title: kind,
      prose: "",
      interactives:
        kind === "challenge"
          ? [
              {
                id: "c",
                kind: "challenge",
                timeModel: "settle" as const,
                caption: "c",
                props: { challengeId: "latch" },
              },
            ]
          : [],
    })),
    challenges: [
      {
        id: "latch",
        title: "Latch",
        task: "t",
        gradedDirection: "draw",
        interface: { inputs: [{ name: "S" }, { name: "R" }], outputs: [{ name: "Q" }] },
        tests: { kind: "sequence", steps: SR_STEPS },
        palette: ["nor", "not"],
        allowedConstructs: ["module", "ports", "logic", "assign", "op-bitwise"],
        hints: ["1", "2", "3", "4", "5"],
        reference: { libraryId: "sr-latch" },
      },
    ],
    modelVsReality: "m",
    originalityNote: { textbookExample: "t", howThisDiffers: "d" },
  });
  return { ...lesson.challenges[0]!, ...overrides };
}

describe("grading a drawn circuit", () => {
  it("is blocked until something is drawn and every output is driven", () => {
    const c = challenge();
    expect(grade(c, {})).toMatchObject({
      passed: false,
      total: 3,
      blocked: S.grade.nothingDrawn,
    });
    const empty = compileDrawing(emptyDrawing(c.interface)).circuit!;
    expect(grade(c, { circuit: empty }).blocked).toBe(format(S.grade.undriven, { names: "Q" }));
  });

  it("passes the library's latch and fails a latch with a gate wrong, naming the gate", () => {
    const c = challenge();
    const good = libraryCircuit("sr-latch");
    expect(grade(c, { circuit: good }).passed).toBe(true);
    expect(grade(c, { libraryId: "sr-latch" }).passed).toBe(true);

    const drawing: Drawing = circuitToDrawing(good);
    const broken = {
      ...drawing,
      parts: drawing.parts.map((p) => (p.id === "sr" ? p : p)),
    };
    // Drawn by hand with an OR where the NOR should be.
    const wrong = compileDrawing({
      parts: [
        ...emptyDrawing(c.interface).parts,
        { id: "nor1", kind: "or", x: 6, y: 1 },
        { id: "nor2", kind: "nor", x: 6, y: 5 },
      ],
      wires: [
        { from: { part: "input:R", port: "y" }, to: { part: "nor1", port: "a" } },
        { from: { part: "nor2", port: "y" }, to: { part: "nor1", port: "b" } },
        { from: { part: "input:S", port: "y" }, to: { part: "nor2", port: "b" } },
        { from: { part: "nor1", port: "y" }, to: { part: "nor2", port: "a" } },
        { from: { part: "nor1", port: "y" }, to: { part: "output:Q", port: "a" } },
      ],
    }).circuit!;
    void broken;
    const verdict = grade(c, { circuit: wrong });
    expect(verdict.passed).toBe(false);
    expect(verdict.failures[0]?.divergence?.component).toEqual({
      kind: "or",
      path: "nor1",
      label: "OR gate",
    });
  });

  it("refuses a circuit whose ports are not the challenge's", () => {
    const c = challenge();
    expect(grade(c, { libraryId: "d-latch" }).blocked).toBe(
      format(S.grade.ports, { inputs: "S, R", outputs: "Q" }),
    );
  });
});

describe("grading written text", () => {
  const c = challenge({ gradedDirection: "write" });
  it("is blocked by empty text, by a refused construct, and by the wrong ports", () => {
    expect(grade(c, {}).blocked).toBe(S.grade.nothingWritten);
    const ff = `module latch(input logic S, input logic R, input logic CLK, output logic Q);
  always_ff @(posedge CLK) Q <= S;
endmodule`;
    expect(grade(c, { hdl: ff }).blocked).toMatch(/does not use/);
    const wrongPorts = `module latch(input logic A, input logic B, output logic Q);
  assign Q = A & B;
endmodule`;
    expect(grade(c, { hdl: wrongPorts }).blocked).toBe(
      format(S.grade.ports, { inputs: "S, R", outputs: "Q" }),
    );
  });

  it("runs the tests on the text's circuit", () => {
    const text = `module latch(input logic S, input logic R, output logic Q);
  logic Qb;
  assign Q = ~(R | Qb);
  assign Qb = ~(S | Q);
endmodule`;
    expect(grade(c, { hdl: text }).passed).toBe(true);
    const and = `module latch(input logic S, input logic R, output logic Q);
  assign Q = S & ~R;
endmodule`;
    const verdict = grade(c, { hdl: and });
    expect(verdict.passed).toBe(false);
    expect(verdict.failures.map((f) => f.label)).toEqual(["release"]);
  });
});

// Module 2
describe("grading a circuit's limits", () => {
  const xor = (limits: Challenge["limits"]) =>
    challenge({
      interface: {
        inputs: [
          { name: "A", width: 1 },
          { name: "B", width: 1 },
        ],
        outputs: [{ name: "Y", width: 1 }],
      },
      tests: {
        kind: "combinational",
        vectors: [
          { label: "A 0, B 0", inputs: { A: 0, B: 0 }, expect: { Y: 0 } },
          { label: "A 0, B 1", inputs: { A: 0, B: 1 }, expect: { Y: 1 } },
          { label: "A 1, B 0", inputs: { A: 1, B: 0 }, expect: { Y: 1 } },
          { label: "A 1, B 1", inputs: { A: 1, B: 1 }, expect: { Y: 0 } },
        ],
      },
      ...(limits ? { limits } : {}),
    });
  const fiveNand = { circuit: libraryCircuit("xor-nand-5") };
  const fourNand = { circuit: libraryCircuit("xor-nand-4") };
  const oneXor = { circuit: libraryCircuit("xor-gate") };

  it("passes a circuit inside every limit, counting each limit as a test", () => {
    expect(grade(xor({ gates: 4, depth: 3, only: ["nand"] }), fourNand)).toMatchObject({
      passed: true,
      total: 7,
      failures: [],
    });
  });
  it("fails a circuit over its gate budget, naming the count and marking every gate", () => {
    const v = grade(xor({ gates: 4 }), fiveNand);
    expect(v.passed).toBe(false);
    expect(v.total).toBe(5);
    expect(v.failures).toHaveLength(1);
    expect(v.failures[0]).toMatchObject({
      index: 4,
      label: format(S.limits.gates, { limit: 4 }),
      detail: format(S.limits.gatesFound, { count: 5, limit: 4 }),
    });
    expect(v.failures[0]?.marked).toHaveLength(5);
  });
  it("fails a circuit too deep, naming the longest path", () => {
    const v = grade(xor({ depth: 2 }), fourNand);
    expect(v.failures[0]).toMatchObject({
      label: format(S.limits.depth, { limit: 2 }),
      detail: format(S.limits.depthFound, { count: 3, path: "nandM, nandP, nandY", limit: 2 }),
      marked: ["nandM", "nandP", "nandY"],
    });
  });
  it("fails a gate of a kind not allowed, and still reports the rows", () => {
    const v = grade(xor({ only: ["nand"] }), oneXor);
    expect(v.failures.map((f) => f.label)).toEqual([format(S.limits.only, { kinds: "NAND" })]);
    expect(v.failures[0]?.detail).toBe(
      format(S.limits.onlyFound, { list: "XOR xor", kinds: "NAND" }),
    );
    const wrongRows = grade(xor({ only: ["nand"] }), { circuit: libraryCircuit("and-gate") });
    expect(wrongRows.failures.map((f) => f.label)).toEqual([
      "A 0, B 1",
      "A 1, B 0",
      "A 1, B 1",
      format(S.limits.only, { kinds: "NAND" }),
    ]);
  });
});
