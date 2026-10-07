// Copyright © 2026 Christopher Snow

// Module 0, meet the machine: what its two lessons share. The program is the shop's own, run on
// Module 8's finished machine; the rooms are Module 1's.

/**
 * The program, by its name in the model's `MEET_PROGRAMS` (packages/dd-model/src/meet.ts): how
 * much warmer room A is than room B, on the office display, and the CLASH lamp at 10.0 degrees or
 * more. A lesson names it, since its text says `word` and `signed`, which later lessons ration.
 */
export const GAP = "gap";

/** The same program with line 5's number left for the learner: `{limit}`. */
export const GAP_LIMIT = "gap-limit";

/** Module 1's two rooms, in tenths of a degree: room A at -18.4, room B at -25.0. */
export const ROOMS = { SENSORA: "-184", SENSORB: "-250" } as const;

/** The first lesson's failure experiment: room B's freezer fails and warms to -5.0. */
export const ROOM_B_FAILS = { SENSORA: "-184", SENSORB: "-50" } as const;
