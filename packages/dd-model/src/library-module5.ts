// Module 5's circuits after the registers lesson: counters, registers passing words to each
// other, and state machines. Each is a function, so every caller gets a fresh netlist. The
// state machines are data (machines.ts) turned into circuits by fsm.ts.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import {
  equalWords,
  halfAdder,
  selector2,
  type BlockOptions,
  type PortNets,
} from "./combinational";
import { dFlipFlop } from "./flipflop";
import { machineCircuit, type Machine } from "./fsm";
import { MACHINES } from "./machines";
import { register } from "./register";

type At = Readonly<Record<string, readonly [number, number]>>;
type Place = (circuit: Circuit, at: At) => Circuit;

function need(ins: PortNets, port: string): NetId {
  const n = ins[port];
  if (n === undefined) throw new RangeError(`the block needs a net for its input ${port}`);
  return n;
}

/**
 * The next number up: Q + EN, from a chain of half adders. Bit 0's half adder adds EN to Q0; each
 * later one adds the carry from the one before. With EN at 0 nothing is added and NEXT is Q. COUT
 * is 1 when the sum does not fit: Q is all ones and EN is 1, so the next edge wraps to zero.
 */
export function addOne(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const q = need(ins, "Q");
  const en = need(ins, "EN");
  const width = b.widthOf(q);
  const next = options.outs?.["NEXT"] ?? b.net("NEXT", width);
  const cout = options.outs?.["COUT"] ?? b.net("COUT");
  b.scope(
    options.name ?? "add-one",
    "add-one",
    (bb) => {
      let carry = en;
      const sums: NetId[] = [];
      for (let i = 0; i < width; i++) {
        const qi = bb.net(`Q${i}`);
        bb.component("bit", { a: q }, { y: qi }, { name: `bitQ${i}`, params: { index: i } });
        const last = i === width - 1;
        const ha = halfAdder(
          bb,
          { A: qi, B: carry },
          {
            name: `ha${i}`,
            outs: { SUM: bb.net(`N${i}`), CARRY: last ? cout : bb.net(`C${i + 1}`) },
          },
        );
        sums.push(ha.SUM);
        carry = ha.CARRY;
      }
      bb.component(
        "join",
        Object.fromEntries(sums.map((n, i) => [String.fromCharCode(97 + i), n])),
        { y: next },
        { name: "join", params: { width } },
      );
    },
    { inputs: { Q: q, EN: en }, outputs: { NEXT: next, COUT: cout } },
  );
  return { NEXT: next, COUT: cout };
}

/**
 * The counter: a register whose D is its own Q plus one. EN decides whether an edge counts, RST
 * brings it to zero at an edge, and TICK is the adder's carry out: 1 while the count is all ones
 * and EN is 1, so the next edge wraps to zero.
 */
export function counterCircuit(width = 4): Circuit {
  const b = new CircuitBuilder(`counter-${width}`);
  const en = b.input("EN");
  const rst = b.input("RST");
  const clk = b.input("CLK");
  const q = b.net("Q", width);
  const next = b.net("NEXT", width);
  const tick = b.net("TICK");
  addOne(b, { Q: q, EN: en }, { name: "add", outs: { NEXT: next, COUT: tick } });
  register(b, next, clk, { name: "count", width, reset: rst, q });
  b.output("Q", q);
  b.output("TICK", tick);
  return b.build();
}

/** The next-number-up block on its own: set Q and EN, read NEXT and COUT. */
export function addOneCircuit(width = 4): Circuit {
  const b = new CircuitBuilder(`add-one-${width}`);
  const q = b.input("Q", width);
  const en = b.input("EN");
  const outs = addOne(
    b,
    { Q: q, EN: en },
    { name: "add-one", outs: { NEXT: b.net("NEXT", width), COUT: b.net("COUT") } },
  );
  b.output("NEXT", outs.NEXT);
  b.output("COUT", outs.COUT);
  return b.build();
}

/**
 * A counter that starts again after `last`: a comparator says when Q equals `last`, and its EQ
 * output, ORed with RST, is the register's reset, so the edge after `last` loads 0000. EQ is the
 * TICK, once every last + 1 edges.
 */
export function counterToCircuit(last: number, width = 4): Circuit {
  const b = new CircuitBuilder(`counter-to-${last}`);
  const en = b.input("EN");
  const rst = b.input("RST");
  const clk = b.input("CLK");
  const q = b.net("Q", width);
  const next = b.net("NEXT", width);
  const lastNet = b.net("LAST", width);
  b.component(
    "const",
    {},
    { y: lastNet },
    { name: "last", params: { width, value: String(last) } },
  );
  const tick = equalWords(
    b,
    { A: q, B: lastNet },
    { name: "comparator", outs: { EQ: b.net("TICK") } },
  ).EQ;
  const clear = b.or([rst, tick], { name: "orClear", output: b.net("CLEAR") });
  addOne(b, { Q: q, EN: en }, { name: "add", outs: { NEXT: next, COUT: b.net("COUT") } });
  register(b, next, clk, { name: "count", width, reset: clear, q });
  b.output("Q", q);
  b.output("TICK", tick);
  return b.build();
}

/** A word of selectors: Y is A while S is 0 and B while S is 1, bit by bit. */
function wordSelector(b: CircuitBuilder, ins: PortNets, options: BlockOptions = {}) {
  const a = need(ins, "A");
  const bIn = need(ins, "B");
  const s = need(ins, "S");
  const width = b.widthOf(a);
  const y = options.outs?.["Y"] ?? b.net("Y", width);
  b.scope(
    options.name ?? "selector-word",
    "selector-word",
    (bb) => {
      const ys: NetId[] = [];
      for (let i = 0; i < width; i++) {
        const ai = bb.net(`A${i}`);
        const bi = bb.net(`B${i}`);
        bb.component("bit", { a }, { y: ai }, { name: `bitA${i}`, params: { index: i } });
        bb.component("bit", { a: bIn }, { y: bi }, { name: `bitB${i}`, params: { index: i } });
        ys.push(
          selector2(bb, { A: ai, B: bi, S: s }, { name: `sel${i}`, outs: { Y: bb.net(`Y${i}`) } })
            .Y,
        );
      }
      bb.component(
        "join",
        Object.fromEntries(ys.map((n, i) => [String.fromCharCode(97 + i), n])),
        { y },
        { name: "join", params: { width } },
      );
    },
    { inputs: { A: a, B: bIn, S: s }, outputs: { Y: y } },
  );
  return { Y: y };
}

/**
 * Two registers that keep the latest number saved and the one before it: at an edge where SAVE
 * is 1, NOW takes IN and PREV takes NOW, both at the same edge, so PREV gets the number NOW held
 * before the edge. RST brings both to zero.
 */
export function nowPrevCircuit(width = 4): Circuit {
  const b = new CircuitBuilder("now-prev");
  const input = b.input("IN", width);
  const nw = b.input("SAVE");
  const rst = b.input("RST");
  const clk = b.input("CLK");
  const now = b.net("NOW", width);
  const prev = b.net("PREV", width);
  register(b, input, clk, { name: "now", width, reset: rst, enable: nw, q: now });
  register(b, now, clk, { name: "prev", width, reset: rst, enable: nw, q: prev });
  b.output("NOW", now);
  b.output("PREV", prev);
  return b.build();
}

/**
 * NOW and PREV again, but a press of SAVE that lasts several edges saves once: a flip-flop keeps
 * what SAVE was at the edge before (OLD), and STEP = SAVE AND NOT OLD is 1 for the first edge of a
 * press only. STEP is the registers' enable.
 */
export function nowPrevOnceCircuit(width = 4): Circuit {
  const b = new CircuitBuilder("now-prev-once");
  const input = b.input("IN", width);
  const save = b.input("SAVE");
  const rst = b.input("RST");
  const clk = b.input("CLK");
  const old = b.net("OLD");
  dFlipFlop(b, save, clk, { name: "last", reset: rst, q: old });
  const notOld = b.not(old, { name: "notOld", output: b.net("NOLD") });
  const step = b.and([save, notOld], { name: "andStep", output: b.net("STEP") });
  const now = b.net("NOW", width);
  const prev = b.net("PREV", width);
  register(b, input, clk, { name: "now", width, reset: rst, enable: step, q: now });
  register(b, now, clk, { name: "prev", width, reset: rst, enable: step, q: prev });
  b.output("NOW", now);
  b.output("PREV", prev);
  return b.build();
}

/**
 * Two registers that trade words at one edge: X's D is Y's Q and Y's D is X's Q, unless LOAD is 1,
 * when they take A and B instead. Both take their D at the same edge, so neither sees the other's
 * new value and the words change places.
 */
export function swapCircuit(width = 4): Circuit {
  const b = new CircuitBuilder("swap");
  const a = b.input("A", width);
  const bIn = b.input("B", width);
  const load = b.input("LOAD");
  const clk = b.input("CLK");
  const x = b.net("X", width);
  const y = b.net("Y", width);
  const dx = wordSelector(
    b,
    { A: y, B: a, S: load },
    { name: "selX", outs: { Y: b.net("DX", width) } },
  ).Y;
  const dy = wordSelector(
    b,
    { A: x, B: bIn, S: load },
    { name: "selY", outs: { Y: b.net("DY", width) } },
  ).Y;
  register(b, dx, clk, { name: "regX", width, q: x });
  register(b, dy, clk, { name: "regY", width, q: y });
  b.output("X", x);
  b.output("Y", y);
  return b.build();
}

/** Module 5's library entries after the registers lesson. */
export function module5Library(place: Place): Readonly<Record<string, () => Circuit>> {
  const machines = Object.fromEntries(
    Object.values(MACHINES).map(
      (m) => [m.id, () => place(machineCircuit(m), machineAt(m))] as const,
    ),
  );
  return {
    "counter-4": () =>
      place(counterCircuit(4), {
        "in:EN": [0, 1],
        "in:RST": [0, 8],
        "in:CLK": [0, 11],
        add: [5, 1],
        count: [12, 6],
        "out:Q": [19, 6],
        "out:TICK": [19, 2],
      }),
    "add-one-4": () => addOneCircuit(4),
    "counter-to-5": () => counterToCircuit(5),
    "now-prev": () =>
      place(nowPrevCircuit(4), {
        "in:IN": [0, 1],
        "in:SAVE": [0, 7],
        "in:RST": [0, 4],
        "in:CLK": [0, 10],
        now: [6, 1],
        prev: [14, 1],
        "out:NOW": [21, 12],
        "out:PREV": [21, 1],
      }),
    "now-prev-once": () => nowPrevOnceCircuit(4),
    swap: () => swapCircuit(4),
    ...machines,
  };
}

/**
 * Where a state machine's drawing puts its parts: the inputs down the left in the machine's
 * order, then RST and CLK; the three blocks left to right; the outputs on the right, then S.
 */
function machineAt(m: Machine): At {
  const at: Record<string, readonly [number, number]> = {};
  [...m.inputs, "RST", "CLK"].forEach((name, i) => {
    at[`in:${name}`] = [0, 1 + 3 * i];
  });
  at["next-state-logic"] = [7, 1];
  at["register"] = [16, 4];
  at["output-logic"] = [23, 4];
  [...m.outputs, "S"].forEach((name, i) => {
    at[`out:${name}`] = [31, 1 + 3 * i];
  });
  return at;
}
