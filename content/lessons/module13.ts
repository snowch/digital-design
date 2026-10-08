// Copyright © 2026 Christopher Snow

// Module 13, the whole machine: the programs the lessons run, in the course's assembly
// (docs/isa.md), on Module 13's final machine (`MODULE_13`, library id `machine-final`), which
// knows the two instructions the learner added: the call through a register at kind 9 and set if
// at kind A. Each lesson's facts test pins the numbers its prose states.

/**
 * The shop's last program: Module 0's first program, the gap between the two rooms on the display
 * and CLASH when room A is 10.0 degrees or more warmer, written for the whole machine. Set if
 * replaces Module 0's branch; the gap reaches the display through a call through a register and a
 * system call, whose handler offers one job.
 */
export const SHOP = `// The gap between the rooms, and CLASH, on the whole machine.
        R1 <= handler
        C4 <= R1                // the handler's address
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        R3 <= R1 - R2           // the gap, room A minus room B
        R4 <= 100
        R5 <= R3 >= R4 signed   // set if: 1 when room A is 10.0 degrees warmer or more
        R5 <= R5 + R5
        R5 <= R5 + R5           // CLASH is bit 2
        word[lamps] <= R5
        R6 <= show
        call R6, R15            // a call through a register
        stop
show:   R1 <= 1                 // job 1: show R2
        R2 <= R3
        call system
        goto R15
handler: word[display] <= R2
        resume`;

/** Module 0's readings: room A at -18.4 degrees, room B at -25.0. */
export const SHOP_INPUTS = { SENSORA: -184, SENSORB: -250 } as const;
