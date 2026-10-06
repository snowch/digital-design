// Copyright © 2026 Christopher Snow

// Module 9: the machine of several edges as text and as drawn are the same machine. Module 8's
// suite runs through the text, compared with the reference instruction by instruction, with each
// kind's count of edges (packages/dd-model: multicycle.test.ts does the same for the drawing).

import { describe, expect, it } from "vitest";

import { compareMulticycle, machineSuite } from "@dd/dd-model";
import { elaborate, machine9Modules } from "@dd/hdl";
import type { Circuit } from "@dd/sim";

import { MACHINE9_CONSTRUCTS, machineText } from "./module9";

export function machineFromText(text: string) {
  return (rom: Uint8Array): Circuit => {
    const r = elaborate(text, {
      allowed: MACHINE9_CONSTRUCTS as never,
      modules: machine9Modules({ rom }),
    });
    const errors = r.messages.filter((m) => m.severity !== "warning");
    if (errors.length || !r.circuit)
      throw new Error(errors.map((m) => `${m.text} (${m.at?.line})`).join("\n"));
    return r.circuit;
  };
}

describe("the machine's text", () => {
  for (const c of machineSuite(1)) {
    it(`runs as the reference does: ${c.group}, ${c.label}`, () => {
      const result = compareMulticycle(c.source, c.inputs, {}, 400, machineFromText(machineText()));
      expect(result.differences).toEqual([]);
      expect(result.instructions).toBeGreaterThan(0);
    }, 60_000);
  }

  it("with the capstone's instruction, runs a call through a register", () => {
    const source =
      "R4 <= 20\nR5 <= 28\ncall R4, R15\ncall R5 + 0, R14\nstop\nR1 <= 7\ngoto R15\nR2 <= 9\ngoto R14";
    const r = compareMulticycle(
      source,
      undefined,
      { callThroughRegister: true },
      400,
      machineFromText(machineText(true)),
    );
    expect(r.differences).toEqual([]);
    expect(r.edges.filter((e) => e.kind === 9).map((e) => e.edges)).toEqual([4, 4]);
  }, 60_000);
});
