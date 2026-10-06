// Copyright © 2026 Chris Snow

// Module 2's circuits: the freezer room's lamps, built from gates.
//
// The shop's office display has three bits besides the temperature: WARM (1 while the freezer
// room is warmer than it should be), DOOR (1 while its door is open) and CLOSED (1 while the shop
// is closed). The lessons turn rules about them into gates. Every circuit is gates alone, at the
// top level, placed by hand so its wires read in the order the lesson explains them.

import { CircuitBuilder, type Circuit, type NetId } from "@dd/sim";

import { placed } from "./library";

type Kind = "not" | "and" | "or" | "nand" | "nor" | "xor";

/** One gate with inputs named A (and B), output Y: the figures that show what a gate does. */
export function oneGate(kind: Kind): Circuit {
  const b = new CircuitBuilder(`${kind}-gate`);
  const a = b.input("A");
  const y = b.net("Y");
  if (kind === "not") b.not(a, { name: "not", output: y });
  else b.gate(kind, [a, b.input("B")], { name: kind, output: y });
  b.output("Y", y);
  return placed(
    b.build(),
    kind === "not"
      ? { "in:A": [0, 1], not: [5, 1], "out:Y": [10, 1] }
      : { "in:A": [0, 1], "in:B": [0, 4], [kind]: [5, 1], "out:Y": [10, 1] },
  );
}

/** One gate with both inputs on one signal A: NAND or NOR tied this way is an inverter. */
export function tiedGate(kind: "nand" | "nor"): Circuit {
  const b = new CircuitBuilder(`${kind}-tied`);
  const a = b.input("A");
  const y = b.gate(kind, [a, a], { name: kind, output: b.net("Y") });
  b.output("Y", y);
  return placed(b.build(), { "in:A": [0, 2], [kind]: [5, 1], "out:Y": [10, 1] });
}

/** ALARM = WARM AND NOT DOOR: warm with the door shut, so the freezer is failing. */
export function alarmCircuit(): Circuit {
  const b = new CircuitBuilder("alarm");
  const warm = b.input("WARM");
  const door = b.input("DOOR");
  const shut = b.not(door, { name: "notDoor", output: b.net("SHUT") });
  const alarm = b.and([warm, shut], { name: "andAlarm", output: b.net("ALARM") });
  b.output("ALARM", alarm);
  return placed(b.build(), {
    "in:WARM": [0, 1],
    "in:DOOR": [0, 5],
    notDoor: [5, 5],
    andAlarm: [10, 1],
    "out:ALARM": [15, 1],
  });
}

/**
 * A first try at ALARM with an OR gate where the AND belongs: ALARM = WARM OR NOT DOOR. It lights
 * with a cold freezer and the door shut, which the rule does not; the lesson's prediction.
 */
export function alarmOrCircuit(): Circuit {
  const b = new CircuitBuilder("alarm-try");
  const warm = b.input("WARM");
  const door = b.input("DOOR");
  const shut = b.not(door, { name: "notDoor", output: b.net("SHUT") });
  const alarm = b.or([warm, shut], { name: "orAlarm", output: b.net("ALARM") });
  b.output("ALARM", alarm);
  return placed(b.build(), {
    "in:WARM": [0, 1],
    "in:DOOR": [0, 5],
    notDoor: [5, 5],
    orAlarm: [10, 1],
    "out:ALARM": [15, 1],
  });
}

/**
 * CLASH from AND, OR and NOT: 1 when the two sensors' WARM bits disagree, one detector per row
 * where they do. The same truth table as one XOR gate.
 */
export function clashGatesCircuit(): Circuit {
  const b = new CircuitBuilder("clash-gates");
  const w1 = b.input("WARM1");
  const w2 = b.input("WARM2");
  const n1 = b.not(w1, { name: "not1", output: b.net("NOT1") });
  const n2 = b.not(w2, { name: "not2", output: b.net("NOT2") });
  const only1 = b.and([w1, n2], { name: "and1", output: b.net("ONLY1") });
  const only2 = b.and([n1, w2], { name: "and2", output: b.net("ONLY2") });
  const check = b.or([only1, only2], { name: "or", output: b.net("CLASH") });
  b.output("CLASH", check);
  return placed(b.build(), {
    "in:WARM1": [0, 1],
    "in:WARM2": [0, 9],
    not1: [5, 13],
    not2: [5, 5],
    and1: [11, 1],
    and2: [11, 9],
    or: [17, 5],
    "out:CLASH": [22, 5],
  });
}

/** CLASH as one XOR gate. */
export function clashXorCircuit(): Circuit {
  const b = new CircuitBuilder("clash-xor");
  const w1 = b.input("WARM1");
  const w2 = b.input("WARM2");
  const check = b.xor([w1, w2], { name: "xor", output: b.net("CLASH") });
  b.output("CLASH", check);
  return placed(b.build(), {
    "in:WARM1": [0, 1],
    "in:WARM2": [0, 4],
    xor: [5, 1],
    "out:CLASH": [10, 1],
  });
}

/** OR from three NAND gates: invert each input, then NAND the two. */
export function nandOrCircuit(): Circuit {
  const b = new CircuitBuilder("nand-or");
  const a = b.input("A");
  const bIn = b.input("B");
  const na = b.nand([a, a], { name: "nandA", output: b.net("NA") });
  const nb = b.nand([bIn, bIn], { name: "nandB", output: b.net("NB") });
  const y = b.nand([na, nb], { name: "nandY", output: b.net("Y") });
  b.output("Y", y);
  return placed(b.build(), {
    "in:A": [0, 2],
    "in:B": [0, 8],
    nandA: [5, 1],
    nandB: [5, 7],
    nandY: [11, 4],
    "out:Y": [16, 4],
  });
}

/** XOR from NAND gates the long way: two inverters, two row detectors, one NAND to join them. */
export function xorNandFiveCircuit(): Circuit {
  const b = new CircuitBuilder("xor-nand-5");
  const a = b.input("A");
  const bIn = b.input("B");
  const na = b.nand([a, a], { name: "nandNA", output: b.net("NA") });
  const nb = b.nand([bIn, bIn], { name: "nandNB", output: b.net("NB") });
  const p = b.nand([a, nb], { name: "nandP", output: b.net("P") });
  const q = b.nand([na, bIn], { name: "nandQ", output: b.net("Q") });
  const y = b.nand([p, q], { name: "nandY", output: b.net("Y") });
  b.output("Y", y);
  return placed(b.build(), {
    "in:A": [0, 1],
    "in:B": [0, 9],
    nandNA: [5, 13],
    nandNB: [5, 5],
    nandP: [11, 1],
    nandQ: [11, 9],
    nandY: [17, 5],
    "out:Y": [22, 5],
  });
}

/** XOR from four NAND gates: the first NAND's output is shared by the next two. */
export function xorNandFourCircuit(): Circuit {
  const b = new CircuitBuilder("xor-nand-4");
  const a = b.input("A");
  const bIn = b.input("B");
  const m = b.nand([a, bIn], { name: "nandM", output: b.net("M") });
  const p = b.nand([a, m], { name: "nandP", output: b.net("P") });
  const q = b.nand([m, bIn], { name: "nandQ", output: b.net("Q") });
  const y = b.nand([p, q], { name: "nandY", output: b.net("Y") });
  b.output("Y", y);
  return placed(b.build(), {
    "in:A": [0, 1],
    "in:B": [0, 9],
    nandM: [5, 5],
    nandP: [11, 1],
    nandQ: [11, 9],
    nandY: [17, 5],
    "out:Y": [22, 5],
  });
}

/**
 * CALL written row by row, as the shop's manager first wrote it: one three-input AND for each of
 * the four rows where CALL is 1, and one OR of the four. Eight gates.
 */
export function callRowsCircuit(): Circuit {
  const b = new CircuitBuilder("call-rows");
  const w = b.input("WARM");
  const d = b.input("DOOR");
  const c = b.input("CLOSED");
  const nw = b.not(w, { name: "notWarm", output: b.net("NW") });
  const nd = b.not(d, { name: "notDoor", output: b.net("ND") });
  const nc = b.not(c, { name: "notClosed", output: b.net("NC") });
  const r1 = b.and([w, nd, nc], { name: "and1", output: b.net("R1") });
  const r2 = b.and([w, nd, c], { name: "and2", output: b.net("R2") });
  const r3 = b.and([w, d, c], { name: "and3", output: b.net("R3") });
  const r4 = b.and([nw, d, c], { name: "and4", output: b.net("R4") });
  const call = b.or([r1, r2, r3, r4], { name: "orCall", output: b.net("CALL") });
  b.output("CALL", call);
  // Each inverter sits on its input's row, half a cell up so the wire into it runs straight; each
  // signal and its opposite then leave from beside each other for the AND gates on the right. The
  // inputs sit on rows between the gates' inputs, so no branch to a gate runs along a wire that
  // leaves an inverter.
  return placed(b.build(), {
    "in:WARM": [0, 4],
    notWarm: [5, 3.5],
    "in:DOOR": [0, 9],
    notDoor: [5, 8.5],
    "in:CLOSED": [0, 14],
    notClosed: [5, 13.5],
    and1: [14, 1],
    and2: [14, 6],
    and3: [14, 11],
    and4: [14, 16],
    orCall: [22, 7],
    "out:CALL": [28, 8],
  });
}

/** CALL in four gates: (WARM AND NOT DOOR) OR (DOOR AND CLOSED). */
export function callShortCircuit(): Circuit {
  const b = new CircuitBuilder("call-short");
  const w = b.input("WARM");
  const d = b.input("DOOR");
  const c = b.input("CLOSED");
  const nd = b.not(d, { name: "notDoor", output: b.net("SHUT") });
  const p = b.and([w, nd], { name: "andWarm", output: b.net("P") });
  const q = b.and([d, c], { name: "andDoor", output: b.net("Q") });
  const call = b.or([p, q], { name: "orCall", output: b.net("CALL") });
  b.output("CALL", call);
  return placed(b.build(), {
    "in:WARM": [0, 1],
    "in:DOOR": [0, 6],
    "in:CLOSED": [0, 11],
    notDoor: [5, 5],
    andWarm: [11, 1],
    andDoor: [11, 9],
    orCall: [17, 5],
    "out:CALL": [22, 5],
  });
}

/** One simplification too far: WARM OR (DOOR AND CLOSED). Wrong where the door is open by day. */
export function callTooShortCircuit(): Circuit {
  const b = new CircuitBuilder("call-too-short");
  const w = b.input("WARM");
  const d = b.input("DOOR");
  const c = b.input("CLOSED");
  const q = b.and([d, c], { name: "andDoor", output: b.net("Q") });
  const call = b.or([w, q], { name: "orCall", output: b.net("CALL") });
  b.output("CALL", call);
  return placed(b.build(), {
    "in:WARM": [0, 1],
    "in:DOOR": [0, 6],
    "in:CLOSED": [0, 11],
    andDoor: [6, 7],
    orCall: [12, 3],
    "out:CALL": [17, 3],
  });
}

/** ANY = ROOM1 OR ROOM2 OR ROOM3 OR ROOM4, each 1 while that freezer room is warm, from two-input OR gates, in a chain or as a tree. */
export function anyWarmCircuit(shape: "chain" | "tree"): Circuit {
  const b = new CircuitBuilder(`any-warm-${shape}`);
  const w = [1, 2, 3, 4].map((i) => b.input(`ROOM${i}`)) as [NetId, NetId, NetId, NetId];
  let any: NetId;
  if (shape === "chain") {
    const o1 = b.or([w[0], w[1]], { name: "or1", output: b.net("O1") });
    const o2 = b.or([o1, w[2]], { name: "or2", output: b.net("O2") });
    any = b.or([o2, w[3]], { name: "or3", output: b.net("ANY") });
  } else {
    const o1 = b.or([w[0], w[1]], { name: "or1", output: b.net("O1") });
    const o2 = b.or([w[2], w[3]], { name: "or2", output: b.net("O2") });
    any = b.or([o1, o2], { name: "or3", output: b.net("ANY") });
  }
  b.output("ANY", any);
  return placed(
    b.build(),
    shape === "chain"
      ? {
          "in:ROOM1": [0, 1],
          "in:ROOM2": [0, 4],
          "in:ROOM3": [0, 8],
          "in:ROOM4": [0, 12],
          or1: [5, 1],
          or2: [10, 5],
          or3: [15, 9],
          "out:ANY": [20, 9],
        }
      : {
          "in:ROOM1": [0, 1],
          "in:ROOM2": [0, 4],
          "in:ROOM3": [0, 8],
          "in:ROOM4": [0, 11],
          or1: [5, 1],
          or2: [5, 8],
          or3: [11, 4],
          "out:ANY": [16, 4],
        },
  );
}

/**
 * ALARM and CALL on one board. Separately, each lamp has its own gates (six). Shared, CALL takes
 * ALARM's output as its first term, because WARM AND NOT DOOR is both lamps' rule (four).
 */
export function twoLampsCircuit(shared: boolean): Circuit {
  const b = new CircuitBuilder(shared ? "two-lamps-shared" : "two-lamps-separate");
  const w = b.input("WARM");
  const d = b.input("DOOR");
  const c = b.input("CLOSED");
  const nd = b.not(d, { name: "notDoor", output: b.net("SHUT") });
  const alarm = b.and([w, nd], { name: "andAlarm", output: b.net("ALARM") });
  let p = alarm;
  if (!shared) {
    const nd2 = b.not(d, { name: "notDoor2", output: b.net("SHUT2") });
    p = b.and([w, nd2], { name: "andWarm", output: b.net("P") });
  }
  const q = b.and([d, c], { name: "andDoor", output: b.net("Q") });
  const call = b.or([p, q], { name: "orCall", output: b.net("CALL") });
  b.output("ALARM", alarm);
  b.output("CALL", call);
  return placed(
    b.build(),
    shared
      ? {
          "in:WARM": [0, 1],
          "in:DOOR": [0, 6],
          "in:CLOSED": [0, 11],
          notDoor: [5, 5],
          andAlarm: [11, 1],
          andDoor: [11, 9],
          orCall: [17, 5],
          "out:ALARM": [22, 1],
          "out:CALL": [22, 6],
        }
      : {
          "in:WARM": [0, 1],
          "in:DOOR": [0, 6],
          "in:CLOSED": [0, 11],
          notDoor: [5, 5],
          notDoor2: [5, 14],
          andAlarm: [11, 1],
          andWarm: [11, 13],
          andDoor: [11, 8],
          orCall: [17, 9],
          "out:ALARM": [22, 1],
          "out:CALL": [22, 9],
        },
  );
}

/** Module 2's entries in the library, merged into `LIBRARY`. */
export const LOGIC_LIBRARY: Readonly<Record<string, () => Circuit>> = {
  "not-gate": () => oneGate("not"),
  "and-gate": () => oneGate("and"),
  "or-gate": () => oneGate("or"),
  "xor-gate": () => oneGate("xor"),
  "nand-gate": () => oneGate("nand"),
  "nor-gate": () => oneGate("nor"),
  "nand-tied": () => tiedGate("nand"),
  "nor-tied": () => tiedGate("nor"),
  alarm: () => alarmCircuit(),
  "alarm-try": () => alarmOrCircuit(),
  "clash-gates": () => clashGatesCircuit(),
  "clash-xor": () => clashXorCircuit(),
  "nand-or": () => nandOrCircuit(),
  "xor-nand-5": () => xorNandFiveCircuit(),
  "xor-nand-4": () => xorNandFourCircuit(),
  "call-rows": () => callRowsCircuit(),
  "call-short": () => callShortCircuit(),
  "call-too-short": () => callTooShortCircuit(),
  "any-warm-chain": () => anyWarmCircuit("chain"),
  "any-warm-tree": () => anyWarmCircuit("tree"),
  "two-lamps-separate": () => twoLampsCircuit(false),
  "two-lamps-shared": () => twoLampsCircuit(true),
};
