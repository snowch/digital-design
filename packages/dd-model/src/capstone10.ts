// Copyright © 2026 Christopher Snow

// Module 10's capstone, the datapath's change drawn: the block that chooses the word register Y
// takes, as Module 9's machine builds it (multicycle.ts, `yWord`: the held result HR, the held
// word a load read HM, or PC + 4 for a call), with the capstone's new input: the branch
// condition MET as a 64-bit word, 63 zeros above it, chosen when SET is 1. The machine's text
// makes the same change (content/lessons/module10.ts: `if (SET) YIN = {63'h0, MET};`).

import { CircuitBuilder, type Circuit } from "@dd/sim";

import { aluParts } from "./alu";
import { branchCondition, constant, joinParts, wordAdder } from "./datapath";
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

/**
 * Lesson 10.4: the part of Module 8's datapath that the instructions `docs/isa.md` leaves out would
 * join, built from the datapath's own blocks: the selector of the ALU's B (`pickB`), the ALU, the
 * +4 block that makes PC + 4, and the block that chooses register Y's word (`yWord`: the ALU's
 * result, the memory's word for a load, or PC + 4 for a call). A multiplier or a shifter would sit
 * beside the ALU and reach register Y through `yWord`; a comparison with zero needs a 0 at
 * `pickB`; the call through a register uses the PC + 4 that `yWord` already takes.
 */
export function joinPlacesCircuit(): Circuit {
  const b = new CircuitBuilder("datapath");
  const qa = b.input("QA", 64);
  const qb = b.input("QB", 64);
  const wide = b.input("WIDE", 64);
  const bconst = b.input("BCONST");
  const op2 = b.input("OP2");
  const op1 = b.input("OP1");
  const op0 = b.input("OP0");
  const mq = b.input("MQ", 64);
  const load = b.input("LOAD");
  const pc = b.input("PC", 64);
  const call = b.input("CALL");
  const aluB = wordSelector(
    b,
    { A: qb, B: wide, S: bconst },
    { name: "pickB", outs: { Y: b.net("ALUB", 64) } },
  ).Y;
  const result = b.net("RESULT", 64);
  aluParts(
    b,
    { A: qa, B: aluB, OP2: op2, OP1: op1, OP0: op0 },
    { width: 64, flags: false, closed: true, outs: { Y: result } },
  );
  const pc4 = b.net("PC4", 64);
  wordAdder(b, "plus4", "plus4", pc, undefined, pc4);
  const yin = b.net("YIN", 64);
  b.scope(
    "yWord",
    "yWord",
    (bb) => {
      const loaded = wordSelector(
        bb,
        { A: result, B: mq, S: load },
        { name: "pickLoad", outs: { Y: bb.net("LOADED", 64) } },
      ).Y;
      wordSelector(bb, { A: loaded, B: pc4, S: call }, { name: "pickCall", outs: { Y: yin } });
    },
    { inputs: { RESULT: result, MQ: mq, PC4: pc4, LOAD: load, CALL: call }, outputs: { YIN: yin } },
  );
  b.output("YIN", yin);
  return b.build();
}

/**
 * Lesson 10.5: the condition block and its two uses in the copy with set if. The block takes J and
 * the ALU's flags and gives MET (Module 8's `condition`); a branch takes the target when BRANCH and
 * MET are 1 (`andTake`, `pickTake`, as the datapath's next PC does); set if widens MET to a word
 * (`widenMet`) and register Y takes it when SET is 1 (`pickSet`).
 */
export function conditionUsesCircuit(): Circuit {
  const b = new CircuitBuilder("conditionUses");
  const j = b.input("J", 4);
  const zero = b.input("ZERO");
  const minus = b.input("MINUS");
  const cout = b.input("COUT");
  const over = b.input("OVER");
  const branch = b.input("BRANCH");
  const pc4 = b.input("PC4", 64);
  const target = b.input("TARGET", 64);
  const set = b.input("SET");
  const hr = b.input("HR", 64);
  const met = branchCondition(b, { J: j, ZERO: zero, MINUS: minus, COUT: cout, OVER: over });
  const taken = b.and([branch, met], { name: "andTake", output: b.net("TAKEN") });
  const next = wordSelector(
    b,
    { A: pc4, B: target, S: taken },
    { name: "pickTake", outs: { Y: b.net("NEXT", 64) } },
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
    { A: hr, B: word, S: set },
    { name: "pickSet", outs: { Y: b.net("YIN", 64) } },
  ).Y;
  b.output("NEXT", next);
  b.output("YIN", yin);
  return b.build();
}
