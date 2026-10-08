// Copyright © 2026 Christopher Snow

// Module 13: a run of the final machine recorded edge by edge agrees with the model at every
// step, and a run with a fault says which step first disagreed, and how.

import { describe, expect, it } from "vitest";

import { FINAL_PROGRAMS } from "./final-programs";
import { stuckAt } from "./faults";
import { recordRun, stepAt } from "./final-run";
import { datapathState } from "./datapath-run";

const SHOP = FINAL_PROGRAMS[0]!;

describe("a recorded run of the final machine", () => {
  const run = recordRun({
    libraryId: "machine-final",
    program: SHOP.source,
    inputs: { SENSORA: -184, SENSORB: -250 },
  });

  it("keeps a frame after every edge, and steps that cover them", () => {
    expect(run.difference).toBeUndefined();
    expect(run.stopped?.reason).toEqual({ kind: "stop" });
    expect(run.steps[0]?.first).toBe(0);
    for (let k = 1; k < run.steps.length; k++)
      expect(run.steps[k]?.first).toBe(run.steps[k - 1]?.last);
    expect(run.frames.length - 1).toBe(run.steps.at(-1)?.last);
    expect(stepAt(run, 0)).toBe(0);
    const last = run.frames.at(-1)!;
    expect(datapathState(run.circuit, last).lamps).toBe(1);
  });

  it("says which step first disagrees with the model when a part is broken", () => {
    const broken = recordRun({
      libraryId: "machine-final",
      program: SHOP.source,
      inputs: { SENSORA: -184, SENSORB: -250 },
      fault: stuckAt("datapath/SET", 0),
    });
    expect(broken.difference).toBeDefined();
    const at = broken.steps[broken.difference!.step]!;
    expect(at.text).toBe("R3 <= R1 < R2 signed");
    expect(broken.difference!.what).toBe("R3");
    // Register Y takes the subtraction, -184 - (-250), not the condition.
    expect([broken.difference!.machine, broken.difference!.model]).toEqual([66n, 0n]);
  });

  it("says when the machine halts where the model does not", () => {
    // SET held at 0 in the control unit: kind A has no kind line, so the decoder refuses it.
    const broken = recordRun({
      libraryId: "machine-final",
      program: SHOP.source,
      inputs: { SENSORA: -184, SENSORB: -250 },
      fault: stuckAt("control/SET", 0),
    });
    expect(broken.difference).toMatchObject({
      what: "stop",
      machineStop: { kind: "trap", cause: 0x21 },
    });
    expect(broken.steps[broken.difference!.step]?.text).toBe("R3 <= R1 < R2 signed");
  });
});
