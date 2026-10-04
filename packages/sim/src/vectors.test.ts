import { describe, expect, it } from "vitest";

import { CircuitBuilder } from "./circuit";
import { runSuite, type TestSuite } from "./vectors";

function xorFromNand(broken = false) {
  // XOR built from four NAND gates. With `broken`, the last gate is an AND instead: the classic
  // "forgot the inversion" mistake, which fails on two rows and passes on two.
  const b = new CircuitBuilder("xor-from-nand");
  const a = b.input("a");
  const c = b.input("b");
  const m = b.nand([a, c], { name: "middle" });
  const l = b.nand([a, m], { name: "left" });
  const r = b.nand([c, m], { name: "right" });
  const y = broken ? b.and([l, r], { name: "out" }) : b.nand([l, r], { name: "out" });
  b.output("y", y);
  return b.build();
}

const xorSuite: TestSuite = {
  kind: "combinational",
  vectors: [
    { inputs: { a: 0, b: 0 }, expect: { y: 0 } },
    {
      inputs: { a: 0, b: 1 },
      expect: { y: 1 },
      internal: { "middle.y": 1, "left.y": 1, "right.y": 0 },
    },
    { inputs: { a: 1, b: 0 }, expect: { y: 1 } },
    { inputs: { a: 1, b: 1 }, expect: { y: 0 }, label: "both high" },
  ],
};

describe("combinational vectors", () => {
  it("pass a correct circuit", () => {
    const d = runSuite(xorFromNand(), xorSuite);
    expect(d.passed).toBe(true);
    expect(d.total).toBe(4);
    expect(d.failures).toEqual([]);
  });

  it("name the failing inputs, the actual and expected outputs, and where the divergence starts", () => {
    // An AND where the final NAND belongs turns XOR into XNOR: wrong on every row.
    const d = runSuite(xorFromNand(true), xorSuite);
    expect(d.passed).toBe(false);
    expect(d.failures.map((f) => f.label)).toEqual([
      "vector 1",
      "vector 2",
      "vector 3",
      "both high",
    ]);
    const first = d.failures[0];
    expect(first?.inputs).toEqual({ a: "0", b: "0" });
    expect(first?.actual).toEqual({ y: "1" });
    expect(first?.expected).toEqual({ y: "0" });
    expect(first?.divergence?.component).toEqual({ kind: "and", path: "out" });
    expect(first?.divergence?.cone[0]).toBe("out");
    // Vector 2 names the internal nets, and they all agree, so the divergence is the output gate.
    const second = d.failures[1];
    expect(second?.inputs).toEqual({ a: "0", b: "1" });
    expect(second?.divergence?.net).toBe("y");
    expect(second?.divergence?.component).toEqual({ kind: "and", path: "out" });
    expect(second?.divergence?.inputsSeen).toEqual({ "a (left.y)": "1", "b (right.y)": "0" });
  });

  it("localise to the earliest named internal net that is wrong", () => {
    // Break the middle gate instead: an AND where a NAND belongs.
    const b = new CircuitBuilder("xor-broken-middle");
    const a = b.input("a");
    const c = b.input("b");
    const m = b.and([a, c], { name: "middle" });
    const l = b.nand([a, m], { name: "left" });
    const r = b.nand([c, m], { name: "right" });
    b.output("y", b.nand([l, r], { name: "out" }));
    const d = runSuite(b.build(), xorSuite);
    const withInternal = d.failures.find((f) => f.divergence?.net === "middle.y");
    expect(withInternal?.divergence?.component?.path).toBe("middle");
    expect(withInternal?.divergence?.actual).toBe("0");
    expect(withInternal?.divergence?.expected).toBe("1");
  });

  it("report a circuit that cannot run instead of throwing", () => {
    const d = runSuite(xorFromNand(), {
      kind: "combinational",
      vectors: [{ inputs: { nonsense: 1 }, expect: { y: 0 } }],
    });
    expect(d.passed).toBe(false);
    expect(d.blocked).toMatch(/no net called "nonsense"/);
  });
});

describe("sequences", () => {
  function dLatch() {
    const b = new CircuitBuilder("d-latch");
    const d = b.input("D");
    const en = b.input("EN");
    const q = b.net("Q");
    b.component("mux2", { sel: en, a: q, b: d }, { y: q }, { name: "sel" });
    b.output("Q", q);
    return b.build();
  }

  it("pulse a clock between steps and check the outputs after each", () => {
    const d = runSuite(dLatch(), {
      kind: "sequence",
      steps: [
        { set: { D: 1, EN: 0 }, clock: "EN", expect: { Q: 1 }, label: "capture a 1" },
        { set: { D: 0 }, expect: { Q: 1 }, label: "D changes while the enable is low: Q holds" },
        { clock: "EN", expect: { Q: 0 }, label: "capture the 0" },
      ],
    });
    expect(d.passed).toBe(true);
  });

  it("report the step that failed with the inputs then in force", () => {
    const d = runSuite(dLatch(), {
      kind: "sequence",
      steps: [
        { set: { D: 1, EN: 0 }, clock: "EN", expect: { Q: 1 } },
        { set: { D: 0 }, expect: { Q: 0 }, label: "a wrong expectation: the latch holds" },
      ],
    });
    expect(d.passed).toBe(false);
    expect(d.failures[0]?.label).toBe("a wrong expectation: the latch holds");
    expect(d.failures[0]?.inputs).toEqual({ D: "0", EN: "0" });
    expect(d.failures[0]?.actual).toEqual({ Q: "1" });
  });
});
