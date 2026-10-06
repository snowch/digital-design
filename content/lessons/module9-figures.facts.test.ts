// Copyright © 2026 Christopher Snow

// Facts Module 9's two timing diagrams show and their words state, read off a run of the machine
// the figures run, from the reset: the controller's state, the memory's address, IR and the
// enables in the half period before each rising edge.

import { describe, expect, it } from "vitest";

import { CONTROL_STATES, buildDatapath, startDatapath } from "@dd/dd-model";
import { formatWord, type Word } from "@dd/sim";

import { LESSONS } from "./index";
import { SUBTRACT_STOP } from "./micro-operations";
import { ONE_PORT } from "./several-edges";

const NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(CONTROL_STATES).map(([name, code]) => [code, name]),
);

const known = (w: Word) => w.known === (1n << BigInt(w.width)) - 1n;
const hex = (w: Word | undefined, digits: number) =>
  !w ? "?" : known(w) ? w.value.toString(16).toUpperCase().padStart(digits, "0") : "X";

/**
 * A run of `program` on Module 9's machine from the reset: for each rising edge from the first
 * to `edges + 1`, what holds in the half period before it. Row 0 is before ↑1.
 */
function run(program: string, edges: number) {
  const built = buildDatapath({ libraryId: "machine-edges", program });
  const sim = startDatapath(built, {});
  const net = (n: string) =>
    built.circuit.nets.find((x) => x.name === n || x.name === `control/${n}`)?.id;
  const at = (n: string) => {
    const id = net(n);
    return id === undefined ? undefined : sim.snapshotValues()[id];
  };
  const row = () => {
    const s = at("S");
    const level = (n: string) => {
      const w = at(n);
      return w ? formatWord(w) : "?";
    };
    return {
      state: s ? NAMES[formatWord(s)] : "?",
      ADDR: hex(at("ADDR"), 3),
      IR: hex(at("IR"), 8),
      PC: hex(at("PC"), 3),
      enables: ["IREN", "HOLDAB", "HOLDR", "HOLDM", "WREG", "PCEN", "GO"]
        .map((n) => `${n} ${level(n)}`)
        .join(", "),
    };
  };
  sim.tick();
  const rows = [row()];
  for (let k = 0; k < edges; k++) {
    sim.clockCycle("CLK");
    rows.push(row());
  }
  return rows;
}

function figure(lesson: string, id: string) {
  const ix = LESSONS.find((l) => l.id === lesson)
    ?.sections.flatMap((s) => s.interactives ?? [])
    .find((i) => i.id === id);
  return ix?.props as { program: string; edges: number } | undefined;
}

describe("facts for Module 9's timing diagrams", () => {
  it("the figures run the programs these facts are read from, for 8 and 6 edges", () => {
    expect(figure("several-edges", "one-port")).toMatchObject({ program: ONE_PORT, edges: 8 });
    expect(figure("micro-operations", "enables")).toMatchObject({
      program: SUBTRACT_STOP,
      edges: 6,
    });
  });

  it("several-edges: one address, at the PC for each fetch and at 7C0 for the store", () => {
    const rows = run(ONE_PORT, 8);
    expect(rows.map((r) => r.state)).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "WRITE",
      "FETCH",
      "READ",
      "ALU",
      "MEMORY",
      "FETCH",
    ]);
    expect(rows.map((r) => r.ADDR)).toEqual([
      "000",
      "X",
      "X",
      "005",
      "004",
      "005",
      "005",
      "7C0",
      "008",
    ]);
    // R1 ← 5 from ↑1 to ↑5, then the store to the end.
    expect(rows.map((r) => r.IR)).toEqual([
      "00000000",
      "25001005",
      "25001005",
      "25001005",
      "25001005",
      "480107C0",
      "480107C0",
      "480107C0",
      "480107C0",
    ]);
    // PC moves on at ↑4, which ends R1 ← 5, and at ↑8, which ends the store.
    expect(rows.map((r) => r.PC)).toEqual([
      "000",
      "000",
      "000",
      "000",
      "004",
      "004",
      "004",
      "004",
      "008",
    ]);
  });

  it("micro-operations: each enable at 1 before the edge that uses it, then GO falls at the stop", () => {
    const rows = run(SUBTRACT_STOP, 6);
    expect(rows.map((r) => r.state)).toEqual([
      "FETCH",
      "READ",
      "ALU",
      "WRITE",
      "FETCH",
      "READ",
      "READ",
    ]);
    expect(rows.map((r) => r.enables)).toEqual([
      "IREN 1, HOLDAB 0, HOLDR 0, HOLDM 0, WREG 0, PCEN 0, GO 1",
      "IREN 0, HOLDAB 1, HOLDR 0, HOLDM 0, WREG 0, PCEN 0, GO 1",
      "IREN 0, HOLDAB 0, HOLDR 1, HOLDM 0, WREG 0, PCEN 0, GO 1",
      "IREN 0, HOLDAB 0, HOLDR 0, HOLDM 0, WREG 1, PCEN 1, GO 1",
      "IREN 1, HOLDAB 0, HOLDR 0, HOLDM 0, WREG 0, PCEN 0, GO 1",
      "IREN 0, HOLDAB 0, HOLDR 0, HOLDM 0, WREG 0, PCEN 0, GO 0",
      "IREN 0, HOLDAB 0, HOLDR 0, HOLDM 0, WREG 0, PCEN 0, GO 0",
    ]);
    expect(rows.map((r) => r.IR)).toEqual([
      "00000000",
      "13123000",
      "13123000",
      "13123000",
      "13123000",
      "84000000",
      "84000000",
    ]);
    expect(rows.map((r) => r.PC)).toEqual(["000", "000", "000", "000", "004", "004", "004"]);
  });
});
