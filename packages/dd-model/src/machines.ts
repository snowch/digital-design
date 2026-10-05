// Module 5's state machines, as data. fsm.ts turns each into a circuit and into text.
//
// The retry controller is Slice 2's example, approved at Checkpoint 1: the shop's office sends the
// manager a message (SEND), waits for an answer, and if the message fails it waits for the next
// TICK and sends it again; if a whole TICK passes in TRY with no answer at all, it gives up and
// sounds the siren (SIREN). It has the four kinds of move the lessons predict: stay, advance,
// return and reset. The same table appears with three other encodings, one of which a reset
// cannot start (all-zero is no state) and one of which a reset starts in the wrong state.

import type { Machine, MachineRow, MachineState } from "./fsm";

/** The retry controller's table, the same in every encoding. */
const RETRY_ROWS: readonly MachineRow[] = [
  { from: "IDLE", when: { GO: 1 }, to: "TRY" },
  { from: "IDLE", when: { GO: 0 }, to: "IDLE" },
  { from: "TRY", when: { OK: 1 }, to: "IDLE" },
  { from: "TRY", when: { OK: 0, FAIL: 1 }, to: "WAIT" },
  { from: "TRY", when: { OK: 0, FAIL: 0, TICK: 1 }, to: "GIVE_UP", labelAt: [250, 245] },
  { from: "TRY", when: { OK: 0, FAIL: 0, TICK: 0 }, to: "TRY" },
  { from: "WAIT", when: { TICK: 1 }, to: "TRY" },
  { from: "WAIT", when: { TICK: 0 }, to: "WAIT" },
  { from: "GIVE_UP", when: {}, to: "GIVE_UP" },
];

/** Where the state diagram draws each state, the same in every encoding. */
const RETRY_AT: Readonly<Record<string, readonly [number, number]>> = {
  IDLE: [90, 140],
  TRY: [370, 140],
  WAIT: [370, 310],
  GIVE_UP: [90, 310],
};

function retry(id: string, codes: Readonly<Record<string, string>>, decode: Machine["decode"]) {
  const states: MachineState[] = ["IDLE", "TRY", "WAIT", "GIVE_UP"].map((name) => ({
    name,
    code: codes[name] as string,
    outputs: (name === "TRY" ? { SEND: 1 } : name === "GIVE_UP" ? { SIREN: 1 } : {}) as Readonly<
      Record<string, 0 | 1>
    >,
    at: RETRY_AT[name] as readonly [number, number],
  }));
  const machine: Machine = {
    id,
    name: "retry",
    inputs: ["GO", "OK", "FAIL", "TICK"],
    outputs: ["SEND", "SIREN"],
    states,
    rows: RETRY_ROWS,
    size: [470, 400],
    ...(decode ? { decode } : {}),
  };
  return machine;
}

/**
 * The capstone's machine: the freezer room's defrost cycle. The compressor runs in COOL; at a
 * TICK the heater melts the ice (DEFROST) until CLEAR says it is gone, then the water drains
 * (DRAIN) until the next TICK. If the room gets WARM while defrosting, cooling wins at once.
 */
const DEFROST: Machine = {
  id: "defrost",
  name: "defrost",
  inputs: ["TICK", "CLEAR", "WARM"],
  outputs: ["COMP", "HEAT"],
  states: [
    { name: "COOL", code: "00", outputs: { COMP: 1 }, at: [90, 140] },
    { name: "DEFROST", code: "01", outputs: { HEAT: 1 }, at: [370, 140] },
    { name: "DRAIN", code: "10", outputs: {}, at: [230, 310] },
  ],
  rows: [
    { from: "COOL", when: { TICK: 1 }, to: "DEFROST" },
    { from: "COOL", when: { TICK: 0 }, to: "COOL" },
    { from: "DEFROST", when: { WARM: 1 }, to: "COOL" },
    { from: "DEFROST", when: { WARM: 0, CLEAR: 1 }, to: "DRAIN" },
    { from: "DEFROST", when: { WARM: 0, CLEAR: 0 }, to: "DEFROST" },
    { from: "DRAIN", when: { TICK: 1 }, to: "COOL" },
    { from: "DRAIN", when: { TICK: 0 }, to: "DRAIN" },
  ],
  size: [470, 400],
};

/** The retry controller after the lab's change: an answer that arrives while waiting ends it. */
const RETRY_LATE_OK: Machine = {
  ...retry("retry-late-ok", { IDLE: "00", TRY: "01", WAIT: "10", GIVE_UP: "11" }, "full"),
  rows: RETRY_ROWS.flatMap((r) =>
    r.from !== "WAIT"
      ? [r]
      : r.when["TICK"] === 1
        ? [
            { from: "WAIT", when: { OK: 1 }, to: "IDLE" },
            { from: "WAIT", when: { OK: 0, TICK: 1 }, to: "TRY" },
          ]
        : [{ from: "WAIT", when: { OK: 0, TICK: 0 }, to: "WAIT" }],
  ),
};

export const MACHINES = {
  /** IDLE 00, TRY 01, WAIT 10, GIVE_UP 11: a reset starts it in IDLE. */
  retry: retry("retry", { IDLE: "00", TRY: "01", WAIT: "10", GIVE_UP: "11" }, "full"),
  /** TRY given the all-zero code: a reset starts it sending. */
  "retry-try-zero": retry(
    "retry-try-zero",
    { TRY: "00", IDLE: "01", WAIT: "10", GIVE_UP: "11" },
    "full",
  ),
  /** One flip-flop per state: the reset's 0000 is no state at all. */
  "retry-one-hot": retry(
    "retry-one-hot",
    { IDLE: "0001", TRY: "0010", WAIT: "0100", GIVE_UP: "1000" },
    "one-hot",
  ),
  /** One flip-flop per state but IDLE, which is all zeros, so a reset starts it in IDLE. */
  "retry-zero-idle": retry(
    "retry-zero-idle",
    { IDLE: "000", TRY: "001", WAIT: "010", GIVE_UP: "100" },
    "one-hot",
  ),
  "retry-late-ok": RETRY_LATE_OK,
  defrost: DEFROST,
} as const satisfies Readonly<Record<string, Machine>>;

export type MachineId = keyof typeof MACHINES;

export function machineById(id: string): Machine {
  const m = (MACHINES as Readonly<Record<string, Machine>>)[id];
  if (!m) throw new RangeError(`no state machine called ${JSON.stringify(id)}`);
  return m;
}
