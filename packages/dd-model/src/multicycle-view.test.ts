// Copyright © 2026 Christopher Snow

// Module 9: the view of an edge, read off the machine's nets, against what docs/isa.md's worked
// example's first two instructions do.

import { describe, expect, it } from "vitest";

import { buildDatapath, edgeAnswer, startDatapath } from "./datapath-figure";
import { edgeView } from "./multicycle-view";

const COLDER = `R2 <= word[sensorA]
R3 <= word[sensorB]
if R2 < R3 signed goto show
R2 <= R3
show: word[display] <= R2
stop`;

describe("an edge of the machine of several edges, as its views read it", () => {
  const built = buildDatapath({ libraryId: "machine-edges", program: COLDER });
  const sim = startDatapath(built, { inputs: { SENSORA: "-184", SENSORB: "-250" } });

  it("answers the predictions from a copy", () => {
    expect(edgeAnswer(sim, "edges")).toBe("5");
    expect(edgeAnswer(sim, "took")).toBe("IR");
  });

  it("names each edge's state and transfers: a load, then a branch", () => {
    const seen: string[] = [];
    for (let k = 0; k < 8; k++) {
      const v = edgeView(sim.circuit, sim.snapshotValues());
      seen.push(`${v.state}: ${JSON.stringify(v.ops)}${v.ends ? " ends" : ""}`);
      sim.clockCycle("CLK");
    }
    expect(seen).toEqual([
      'FETCH: [{"kind":"fetch"}]',
      'READ: [{"kind":"read","a":0,"b":0}]',
      'ALU: [{"kind":"alu","a":"0","b":"c","job":2}]',
      'MEMORY: [{"kind":"load","byte":false}]',
      'WRITE: [{"kind":"write","y":2,"from":"HM"},{"kind":"pc","to":"PC4"}] ends',
      'FETCH: [{"kind":"fetch"}]',
      'READ: [{"kind":"read","a":0,"b":0}]',
      'ALU: [{"kind":"alu","a":"0","b":"c","job":2}]',
    ]);
  });
});
