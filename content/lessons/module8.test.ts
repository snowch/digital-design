// Copyright © 2026 Christopher Snow

// Module 8: the datapath as text and the datapath as drawn are the same circuit. One suite runs
// through both: every program of the generated suite, compared with the reference instruction by
// instruction (packages/dd-model: datapath.test.ts does the same for the drawing alone).

import { describe, expect, it } from "vitest";

import { compareWithReference, machineSuite } from "@dd/dd-model";
import { elaborate, machineModules } from "@dd/hdl";
import type { Circuit } from "@dd/sim";

import { DATAPATH_CONSTRUCTS, DATAPATH_TEXT } from "./module8";

function fromText(rom: Uint8Array): Circuit {
  const r = elaborate(DATAPATH_TEXT, {
    allowed: DATAPATH_CONSTRUCTS as never,
    modules: machineModules({ rom }),
  });
  const errors = r.messages.filter((m) => m.severity !== "warning");
  if (errors.length || !r.circuit)
    throw new Error(errors.map((m) => `${m.text} (${m.at?.line})`).join("\n"));
  return r.circuit;
}

describe("the datapath's text", () => {
  for (const c of machineSuite(1)) {
    it(`runs as the reference does: ${c.group}, ${c.label}`, () => {
      const result = compareWithReference(fromText, c.source, c.inputs);
      expect(result.differences).toEqual([]);
      expect(result.instructions).toBeGreaterThan(0);
    }, 60_000);
  }
});
