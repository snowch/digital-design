// Copyright © 2026 Christopher Snow

// Module 10's capstone, the datapath's change drawn: the block that chooses the word register Y
// takes, as Module 9's machine builds it (multicycle.ts, `yWord`: the held result HR, the held
// word a load read HM, or PC + 4 for a call), with the capstone's new input: the branch
// condition MET as a 64-bit word, 63 zeros above it, chosen when SET is 1. The machine's text
// makes the same change (content/lessons/module10.ts: `if (SET) YIN = {63'h0, MET};`).

import { CircuitBuilder, type Circuit } from "@dd/sim";

import { constant, joinParts } from "./datapath";
import { wordSelector } from "./memory";

/** The word for register Y with set if's input: HR, HM, PC + 4, or MET as a word. */
export function yWordSetCircuit(): Circuit {
  const b = new CircuitBuilder("yWord");
  const hr = b.input("HR", 64);
  const hm = b.input("HM", 64);
  const pc4 = b.input("PC4", 64);
  const load = b.input("LOAD");
  const call = b.input("CALL");
  const met = b.input("MET");
  const set = b.input("SET");
  const loaded = wordSelector(
    b,
    { A: hr, B: hm, S: load },
    { name: "pickLoad", outs: { Y: b.net("LOADED", 64) } },
  ).Y;
  const called = wordSelector(
    b,
    { A: loaded, B: pc4, S: call },
    { name: "pickCall", outs: { Y: b.net("CALLED", 64) } },
  ).Y;
  const word = b.net("METWORD", 64);
  b.scope(
    "widenMet",
    "met-word",
    (bb) => joinParts(bb, [met, constant(bb, "zeros", 63, 0n)], word),
    { inputs: { MET: met }, outputs: { METWORD: word } },
  );
  const yin = wordSelector(
    b,
    { A: called, B: word, S: set },
    { name: "pickSet", outs: { Y: b.net("YIN", 64) } },
  ).Y;
  b.output("YIN", yin);
  return b.build();
}
