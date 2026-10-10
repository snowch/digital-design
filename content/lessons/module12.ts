// Copyright © 2026 Christopher Snow

// Module 12, traps and interrupts: the programs the lessons run and the challenges grade, in the
// course's assembly (docs/isa.md), on Module 12's machine (`MODULE_12`). Each lesson's facts test
// pins the numbers its prose states.
//
// A challenge's learner writes a handler: the starting text sets C4 and goes to `program`, which
// the tests add after the learner's text, a different program for each test.

// ---------------------------------------------------------------------------------------------
// 12.1 traps

/** The shop's night program, with no handler: a store to room B's sensor halts the machine. */
export const NIGHT_HALTS = `// The night program: show room A, clear room B, light NIGHT.
        R2 <= word[sensorA]
        word[display] <= R2
        R0 <= 0
        word[sensorB] <= R0     // a mistake: room B's sensor cannot be written
        R3 <= 2
        word[lamps] <= R3       // NIGHT
        stop`;

/** The handler that keeps the cause at 400 and skips the instruction that faulted. */
export const SKIP_HANDLER = `handler: R5 <= C3
        word[0x400] <= R5       // store the cause
        R5 <= C2
        R5 <= R5 + 4            // the instruction after the one that faulted
        C2 <= R5
        resume`;

/** The night program with a handler. */
export const NIGHT = `// The night program, with a handler.
        R1 <= handler
        C4 <= R1                // the handler's address
        R2 <= word[sensorA]
        word[display] <= R2
        R0 <= 0
        word[sensorB] <= R0     // a mistake: room B's sensor cannot be written
        R3 <= 2
        word[lamps] <= R3       // NIGHT
        stop
${SKIP_HANDLER}`;

/** The same, with a handler that does not add 4 to C2. */
export const NIGHT_NO_SKIP = `// The night program, with a handler that only resumes.
        R1 <= handler
        C4 <= R1
        R2 <= word[sensorA]
        word[display] <= R2
        R0 <= 0
        word[sensorB] <= R0
        R3 <= 2
        word[lamps] <= R3
        stop
handler: R5 <= C3
        word[0x400] <= R5
        resume`;

/** The construction's program: a word load at an address that is not a multiple of 8. */
export const TRAP_QUIZ = `// The lamps, read one byte too far on.
        R1 <= handler
        C4 <= R1
        R2 <= lamps
        R2 <= R2 + 4
        R3 <= word[R2]
        word[display] <= R3
        stop
handler: R5 <= C3
        word[display] <= R5
        stop`;

/** The challenge's starting text: the handler only resumes. */
export const SKIP34_START = `// Your handler. The tests add a program after it, named program.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of refused stores
        goto program
handler: resume`;

export const SKIP34_REFERENCE = `// Skip a refused store and count it; stop on any other cause.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of refused stores
        goto program
handler: R5 <= C3
        R6 <= 0x34
        if R5 != R6 goto other
        R5 <= word[0x400]
        R5 <= R5 + 1
        word[0x400] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        resume
other:  stop`;

/** The challenge's test programs, each named `program`. */
export const SKIP34_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly count: number;
  readonly display: number;
  readonly traps: number;
  /** The causes of the run's traps, in order, as the grader lists them. */
  readonly causes: string;
  /** Where the run stops: the program's `end`, or the handler. */
  readonly stopAt: "end" | "handler";
}[] = [
  {
    label: "two refused stores",
    code: `program: R2 <= 7
        word[sensorA] <= R2
        word[display] <= R2
        word[sensorB] <= R2
after:  R2 <= R2 + 1
        word[display] <= R2
end:    stop`,
    count: 2,
    display: 8,
    traps: 2,
    causes: "34, 34",
    stopAt: "end",
  },
  {
    label: "a store to the ROM",
    code: `program: R2 <= 25
        word[0x100] <= R2
after:  word[display] <= R2
end:    stop`,
    count: 1,
    display: 25,
    traps: 1,
    causes: "34",
    stopAt: "end",
  },
  {
    label: "a word that is not an instruction",
    code: `program: R2 <= 9
        word[display] <= R2
        word[sensorB] <= R2
        R2 <= R2 - 1
        word[display] <= R2
notCode: word 0`,
    count: 1,
    display: 8,
    traps: 2,
    causes: "34, 21",
    stopAt: "handler",
  },
  {
    label: "a word not at a multiple of 8",
    code: `program: R2 <= 0x404
        R3 <= word[R2]
        word[display] <= R2
end:    stop`,
    count: 0,
    display: 0,
    traps: 1,
    causes: "33",
    stopAt: "handler",
  },
  {
    label: "a load where there is no memory",
    code: `program: R2 <= 6
        word[display] <= R2
        R3 <= word[0x7F8]
        word[display] <= R3
end:    stop`,
    count: 0,
    display: 6,
    traps: 1,
    causes: "31",
    stopAt: "handler",
  },
];

// ---------------------------------------------------------------------------------------------
// 12.2 saving-state

/** A program that keeps room A's reading in R5 across a refused store, with 12.1's handler. */
export const SPOILED = `// Room A's reading kept in R5 across a mistake.
        R1 <= handler
        C4 <= R1
        R5 <= word[sensorA]     // room A's reading
        R0 <= 0
        word[sensorB] <= R0     // the mistake
        word[display] <= R5     // show room A's reading
        stop
${SKIP_HANDLER}`;

/** The same handler, saving R5 first and putting it back before resume. */
export const SAVING_HANDLER = `handler: word[0x408] <= R5     // save R5
        R5 <= C3
        word[0x400] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R5 <= word[0x408]       // put R5 back
        resume`;

export const SAVED = `// Room A's reading kept in R5, with a handler that saves R5.
        R1 <= handler
        C4 <= R1
        R5 <= word[sensorA]
        R0 <= 0
        word[sensorB] <= R0
        word[display] <= R5
        stop
${SAVING_HANDLER}`;

/** A program whose stack starts at the bottom of the RAM, with a handler that saves R5 below R14. */
export const STACK_HANDLER = `// A stack started in the wrong place; the handler saves R5 below it.
        R1 <= handler
        C4 <= R1
        R14 <= 0x400            // not 0x7C0: the bottom of the RAM
        R10 <= 7
        R14 <= R14 - 8
        word[R14] <= R10        // a push into the ROM
        stop
handler: word[R14 - 8] <= R5    // save R5 below the stack's top
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R5 <= word[R14 - 8]
        resume`;

// ---------------------------------------------------------------------------------------------
// 12.3 user-mode

/** A program in system mode that writes the lamps by mistake: ALARM goes off and nothing stops it. */
export const LAMPS_SYSTEM = `// ALARM is on; a program meant to clear the display clears the lamps.
        R1 <= 1
        word[lamps] <= R1       // ALARM on
        R1 <= display
        R1 <= R1 + 8            // a mistake: one word past the display, the lamps
        R2 <= 0
        word[R1] <= R2          // meant to clear the display
        stop`;

/** The handler's start: C4, ALARM, then the program in user mode with resume. */
const TO_USER = `        R1 <= handler
        C4 <= R1
        R1 <= 1
        word[lamps] <= R1       // ALARM on
        R1 <= 0
        C1 <= R1                // user mode, for the program resume starts
        R1 <= program
        C2 <= R1
        resume                  // C0 takes C1: user mode`;

/** The same program in user mode, under a handler that stores the cause and where. */
export const LAMPS_USER = `// The lamps program in user mode: the start lights ALARM, then resumes to it.
${TO_USER}
handler: R5 <= C3
        word[0x400] <= R5       // store the cause
        R5 <= C2
        word[0x408] <= R5       // and where
        stop
program: R1 <= display
        R1 <= R1 + 8
        R2 <= 0
        word[R1] <= R2          // meant to clear the display
        stop`;

/** A program in user mode that writes the word the handler counts its traps in. */
export const RAM_UNGUARDED = `// The handler counts the night's traps at 410; the program stores its own total there.
${TO_USER.replace("        R1 <= 0\n        C1 <= R1", "        R1 <= 0\n        word[0x410] <= R1       // no traps yet tonight\n        C1 <= R1")}
handler: R5 <= word[0x410]
        R5 <= R5 + 1
        word[0x410] <= R5       // one more trap tonight
        word[display] <= R5     // show the night's count
        stop
program: R3 <= 0x410
        R4 <= 7
        word[R3] <= R4          // the program's own total
        stop`;

/**
 * The prediction: a start that writes 0 to C1 but goes to the program with `goto`, so the program
 * runs in system mode and its refused store traps with C1 taking `01`.
 */
export const GOTO_START = `// The start writes 0 to C1, then goes to program with goto.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1                // user mode, for a resume
        goto program            // no resume
handler: R5 <= C3
        word[0x400] <= R5       // store the cause
        stop
program: R0 <= 0
        word[sensorB] <= R0     // refused
        stop`;

export const USER_START = `// Your start and handler. The tests add a program after them, named program.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of device accesses refused
        goto program
handler: stop`;

export const USER_REFERENCE = `// Start the program in user mode; count and skip a device access, save any other cause.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of device accesses refused
        C1 <= R1                // user mode, for the program resume starts
        R1 <= program
        C2 <= R1
        resume
handler: word[0x410] <= R5      // save R5 and R6
        word[0x418] <= R6
        R5 <= C3
        R6 <= 0x32
        if R5 != R6 goto other
        R5 <= word[0x400]
        R5 <= R5 + 1
        word[0x400] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R6 <= word[0x418]       // put R6 and R5 back
        R5 <= word[0x410]
        resume
other:  word[0x408] <= R5       // store the cause
        stop`;

/** Words of a test's own in R0 to R15, from a base of its own, so no fixed word passes. */
const userWords = (base: number): number[] => Array.from({ length: 16 }, (_, k) => base + 13 * k);
const setUser = (base: number) =>
  userWords(base)
    .map((v, k) => `        R${k} <= ${v}`)
    .join("\n");

/** The challenge's test programs, each named `program`, each meeting what user mode refuses. */
export const USER_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly count: number;
  readonly cause: number;
  readonly causes: string;
  /** R0 to R15 as the program left them at its last trap, as decimal words. */
  readonly registers: readonly number[];
}[] = [
  {
    label: "a store to the lamps, then stop",
    code: `program: nothing
${setUser(20)}
        word[lamps] <= R1
        R1 <= R1 + 1
        stop`,
    count: 1,
    cause: 0x22,
    causes: "32, 22",
    registers: userWords(20).map((v, k) => (k === 1 ? v + 1 : v)),
  },
  {
    label: "two sensors read, then a control register",
    code: `program: nothing
${setUser(400)}
        R2 <= word[sensorA]
        R3 <= word[sensorB]
        R4 <= C0
        stop`,
    count: 2,
    cause: 0x22,
    causes: "32, 32, 22",
    registers: userWords(400),
  },
  {
    label: "a word not at a multiple of 8",
    code: `program: nothing
${setUser(900)}
        R2 <= 0x404
        R3 <= word[R2]
        stop`,
    count: 0,
    cause: 0x33,
    causes: "33",
    registers: userWords(900).map((v, k) => (k === 2 ? 0x404 : v)),
  },
  {
    label: "the timer, then the ROM",
    code: `program: nothing
${setUser(1300)}
        word[timer] <= R1
        R5 <= R5 + 2
        word[0x100] <= R1
        stop`,
    count: 1,
    cause: 0x34,
    causes: "32, 34",
    registers: userWords(1300).map((v, k) => (k === 5 ? v + 2 : v)),
  },
];

// ---------------------------------------------------------------------------------------------
// 12.4 system-calls

/** The handler's start: C4, then the program in user mode. */
const TO_PROGRAM = `        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1                // user mode
        R1 <= program
        C2 <= R1
        resume`;

/** A handler offering services 1 (show R2) and 4 (end the program). */
const SERVICES_14 = `handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x41
        if R9 != R8 goto fault  // not call system: a fault
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 4
        if R1 == R8 goto end
        goto back               // a job the handler does not offer
show:   word[display] <= R2
back:   R8 <= word[0x400]       // put R8 and R9 back
        R9 <= word[0x408]
        resume
end:    stop
fault:  stop`;

export const SHOW_PROGRAM = `program: R8 <= 88               // the program's own words in R8 and R9
        R9 <= 99
        R2 <= 25
        R1 <= 1
        call system             // show R2
        R2 <= R2 + 1
        R1 <= 1
        call system             // show R2 again
        R1 <= 4
        call system             // end the program`;

export const SERVICES = `// A user program shows two numbers and ends, through the handler's jobs.
${TO_PROGRAM}
${SERVICES_14}
${SHOW_PROGRAM}`;

/** The same, with a handler that adds 4 to C2 as lesson 1's did. */
export const SERVICES_SKIPPING = SERVICES.replace(
  "back:   R8 <= word[0x400]       // put R8 and R9 back",
  `back:   R8 <= C2
        R8 <= R8 + 4            // as lesson 1's handler did
        C2 <= R8
        R8 <= word[0x400]       // put R8 and R9 back`,
);

/** The opening of 12.4: a user program that writes the display itself. */
export const SHOW_DIRECT = `// A user program that shows 25 by storing to the display.
${TO_PROGRAM}
handler: R5 <= C3
        word[0x400] <= R5       // store the cause
        stop
program: R2 <= 25
        word[display] <= R2
        stop`;

export const SERVICE2_START = `// The handler's jobs. The tests add a program after it, named program.
${TO_PROGRAM}
${SERVICES_14}`;

export const SERVICE2_REFERENCE = SERVICE2_START.replace(
  `        R8 <= 4
        if R1 == R8 goto end`,
  `        R8 <= 4
        if R1 == R8 goto end
        R8 <= 2
        if R1 == R8 goto sensor`,
).replace(
  "end:    stop",
  `sensor: R1 <= word[sensorA]    // room A when R2 is 0
        R8 <= 0
        if R2 == R8 goto back
        R1 <= word[sensorB]     // room B otherwise
        goto back
end:    stop`,
);

/**
 * The words the sensor job's test programs give R0 and R3 to R15 (the call's own registers, R1
 * and R2, aside), a set of their own for each test. The tests read them as the program left them
 * at its last trap, job 4's call, before the handler's `stop` writes over R8 and R9.
 */
const KEPT_REGISTERS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const keptWords = (base: number) => KEPT_REGISTERS.map((k) => [k, base + 9 * k] as const);
const KEEP_ALL = (base: number) =>
  keptWords(base)
    .map(([k, v]) => `        R${k} <= ${v}`)
    .join("\n");
/** What each kept register holds at the last trap: its own word, or what the program changed. */
const keptAtTrap = (base: number, changed: Readonly<Record<number, number>> = {}) =>
  Object.fromEntries(keptWords(base).map(([k, v]) => [`R${k}@trap`, String(changed[k] ?? v)]));

/** Programs that read a room through job 2 and show it through job 1. */
export const SERVICE2_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly shown: string;
  readonly causes: string;
  /** The registers the program keeps, as decimal words at the end of its run. */
  readonly kept: Readonly<Record<string, string>>;
}[] = [
  {
    label: "room A, then room B",
    code: `program: nothing
${KEEP_ALL(30)}
        R2 <= 0
        R1 <= 2
        call system             // room A's reading in R1
        R2 <= R1
        R1 <= 1
        call system             // show it
        R2 <= 1
        R1 <= 2
        call system             // room B's reading in R1
        R2 <= R1
        R1 <= 1
        call system
        R1 <= 4
        call system`,
    shown: "-184, -250",
    causes: "41, 41, 41, 41, 41",
    kept: keptAtTrap(30),
  },
  {
    label: "room B, kept in R5 across a call",
    code: `program: nothing
${KEEP_ALL(600)}
        R2 <= 1
        R1 <= 2
        call system
        R5 <= R1                // room B's reading
        R2 <= 7
        R1 <= 1
        call system             // show 7
        R2 <= R5
        R1 <= 1
        call system             // show room B's reading
        R1 <= 4
        call system`,
    shown: "7, -250",
    causes: "41, 41, 41, 41",
    kept: keptAtTrap(600, { 5: -250 }),
  },
  {
    label: "the difference between the rooms",
    code: `program: nothing
${KEEP_ALL(1200)}
        R2 <= 0
        R1 <= 2
        call system
        R6 <= R1
        R2 <= 1
        R1 <= 2
        call system
        R2 <= R6 - R1
        R1 <= 1
        call system             // room A's reading less room B's
        R1 <= 4
        call system`,
    shown: "66",
    causes: "41, 41, 41, 41",
    kept: keptAtTrap(1200, { 6: -184 }),
  },
];

// ---------------------------------------------------------------------------------------------
// 12.2 saving-state: the challenge

export const SAVE_START = `// Your handler. The tests add a program after it, named program.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of refused stores
        goto program
handler: R5 <= word[0x400]
        R5 <= R5 + 1
        word[0x400] <= R5
        R6 <= C2
        R6 <= R6 + 4
        C2 <= R6
        resume`;

export const SAVE_REFERENCE = `// Count and skip a refused store, and leave every register as it was.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of refused stores
        goto program
handler: word[0x408] <= R5      // save R5 and R6
        word[0x410] <= R6
        R5 <= word[0x400]
        R5 <= R5 + 1
        word[0x400] <= R5
        R6 <= C2
        R6 <= R6 + 4
        C2 <= R6
        R6 <= word[0x410]       // put R6 and R5 back
        R5 <= word[0x408]
        resume`;

/**
 * Each test's program gives every register, R0 to R15, a word of its own, a different set for
 * each test, and changes some between its refused stores, so no fixed word written back passes.
 * Test 3's R14 is its stack, started in the wrong place.
 */
const SET_BASES = [11, 300, 1500] as const;
export const setWords = (base: number): number[] =>
  Array.from({ length: 16 }, (_, k) => base + 7 * k);
const SET_ALL = (base: number, except: readonly number[] = []) =>
  setWords(base)
    .flatMap((v, k) => (except.includes(k) ? [] : [`        R${k} <= ${v}`]))
    .join("\n");
export const SAVE_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly count: number;
  readonly causes: string;
  /** The registers the program leaves, R0 to R15, as decimal words. */
  readonly registers: readonly number[];
}[] = [
  {
    label: "one refused store",
    code: `program: nothing\n${SET_ALL(SET_BASES[0])}\n        word[sensorA] <= R1\nend:    stop`,
    count: 1,
    causes: "34",
    registers: setWords(SET_BASES[0]),
  },
  {
    label: "two refused stores",
    code: `program: nothing\n${SET_ALL(SET_BASES[1])}\n        word[sensorB] <= R2\n        R5 <= R5 + 3\n        R6 <= R6 - 5\n        word[0x200] <= R3\nend:    stop`,
    count: 2,
    causes: "34, 34",
    registers: setWords(SET_BASES[1]).map((v, k) => (k === 5 ? v + 3 : k === 6 ? v - 5 : v)),
  },
  {
    label: "a stack started in the wrong place",
    code: `program: R14 <= 0x400\n${SET_ALL(SET_BASES[2], [14])}\n        R14 <= R14 - 8\n        word[R14] <= R5\nend:    stop`,
    count: 1,
    causes: "34",
    registers: setWords(SET_BASES[2]).map((v, k) => (k === 14 ? 0x3f8 : v)),
  },
];

/** 12.2's construction: four handlers, each to be judged on whether it leaves registers alone. */
export const SAVE_CHOICE_HANDLERS: Readonly<Record<"a" | "b" | "c" | "d", string>> = {
  a: `handler: word[0x408] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R5 <= word[0x408]
        resume`,
  b: `handler: word[0x408] <= R5
        R5 <= C2
        R6 <= R5 + 4
        C2 <= R6
        R5 <= word[0x408]
        resume`,
  c: `handler: word[0x408] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R5 <= word[0x410]
        resume`,
  d: `handler: word[0x408] <= R5
        word[0x410] <= R6
        R5 <= C2
        R6 <= 4
        R5 <= R5 + R6
        C2 <= R5
        R6 <= word[0x410]
        R5 <= word[0x408]
        resume`,
};

// ---------------------------------------------------------------------------------------------
// 12.5 interrupts: the door left open

/** The handler's start with interrupts on in user mode: C1 = 2, binary 10. */
const TO_PROGRAM_EVENTS = `        R1 <= handler
        C4 <= R1
        R1 <= 2
        C1 <= R1                // user mode, interrupts on
        R1 <= program
        C2 <= R1
        resume`;

/** The handler's choice by cause, then the jobs: the door, the timer, show and end. */
const EVENT_HANDLER_HEAD = `handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x82
        if R9 == R8 goto door
        R8 <= 0x81
        if R9 == R8 goto tick
        R8 <= 0x41
        if R9 != R8 goto fault
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 4
        if R1 == R8 goto end
        goto back
show:   word[display] <= R2
        goto back`;

export const DOOR_PART = `door:   R8 <= 2
        word[waiting] <= R8     // the door's event is seen
        R8 <= 20
        word[timer] <= R8       // 20 instructions to close the door
        goto back`;

export const TIMER_PART = `tick:   R8 <= 1
        word[waiting] <= R8     // the timer's event is seen
        R8 <= word[signals]
        R9 <= 1
        R8 <= R8 & R9           // DOOR
        if R8 != R9 goto back   // closed in time
        word[lamps] <= R9       // still open: ALARM
        goto back`;

const EVENT_HANDLER_TAIL = `back:   R8 <= word[0x400]       // put R8 and R9 back
        R9 <= word[0x408]
        resume
end:    stop
fault:  stop`;

/** The user program: counts to 30, shows it, ends. It knows nothing of the door. */
export const COUNT_PROGRAM = `program: R2 <= 0
        R3 <= 30
loop:   R2 <= R2 + 1
        if R2 != R3 goto loop
        R1 <= 1
        call system             // show 30
        R1 <= 4
        call system             // end the program`;

/** The opening of 12.5: lesson 4's handler and the counting program, interrupts off. */
export const DOOR_UNSEEN = `// The door opens while a user program counts to 30, with lesson 4's handler.
${TO_PROGRAM}
${SERVICES_14}
${COUNT_PROGRAM}`;

export const DOOR_OPEN = `// The door left open: the program counts to 30 while the handler watches the door.
${TO_PROGRAM_EVENTS}
${EVENT_HANDLER_HEAD}
${DOOR_PART}
${TIMER_PART}
${EVENT_HANDLER_TAIL}
${COUNT_PROGRAM}`;

/** The same, with a door part that does not write "waiting". */
export const DOOR_NO_CLEAR = DOOR_OPEN.replace(
  `door:   R8 <= 2
        word[waiting] <= R8     // the door's event is seen
`,
  `door:   nothing                 // the door's event is left waiting
        nothing
`,
);

/**
 * The timer challenge's start: NIGHT lit before the program runs, so the timer's part must light
 * ALARM beside it and leave the other lamps as they are, a rule no figure's timer part keeps.
 */
const TO_PROGRAM_NIGHT = TO_PROGRAM_EVENTS.replace(
  "        R1 <= 2\n        C1 <= R1",
  "        R1 <= word[startLamps]\n        word[lamps] <= R1       // the lamps each test starts with\n        R1 <= 2\n        C1 <= R1",
);

export const TIMER_START = `// The start and the handler. Write the timer part. The tests add a program, named program.
${TO_PROGRAM_NIGHT}
${EVENT_HANDLER_HEAD}
${DOOR_PART}
tick:   goto back
${EVENT_HANDLER_TAIL}`;

export const TIMER_REFERENCE = `// The start and the handler, with its timer part: ALARM beside the lamps already lit.
${TO_PROGRAM_NIGHT}
${EVENT_HANDLER_HEAD}
${DOOR_PART}
tick:   R8 <= 1
        word[waiting] <= R8     // the timer's event is seen
        R8 <= word[signals]
        R9 <= 1
        R8 <= R8 & R9           // DOOR
        if R8 != R9 goto back   // closed in time
        R8 <= word[lamps]
        R8 <= R8 | R9           // ALARM, beside the lamps already lit
        word[lamps] <= R8
        goto back
${EVENT_HANDLER_TAIL}`;

/**
 * The timer challenge's program: words of its own in R0, R1 and R5 to R15; a count to 30 in R2
 * over 30 rounds that R3 counts down to R4's 0, so a spoiled R2 shows on the display; R1 stored
 * at 500 before the calls use it; then 30 shown and the end. An interrupt changes no register,
 * R1 and R2 included: the program did not ask for it. Each test adds its lamps word after it.
 */
const TIMER_KEPT = [0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const TIMER_WORD = (k: number) => 40 + 17 * k;
export const TIMER_PROGRAM = (lamps: number) => `program: nothing
${TIMER_KEPT.map((k) => `        R${k} <= ${TIMER_WORD(k)}`).join("\n")}
        R2 <= 0
        R3 <= 30                // rounds left
        R4 <= 0
testLoop: R2 <= R2 + 1
        R3 <= R3 - 1
        if R3 != R4 goto testLoop
        word[0x500] <= R1       // R1 as the interrupts left it
        R1 <= 1
        call system             // show 30
        R1 <= 4
        call system             // end the program
startLamps: word ${lamps}`;

/**
 * What the timer program's registers hold at its last trap, job 4's call, by name, and R1's own
 * word, stored at 500 after the count.
 */
export const TIMER_KEPT_END: Readonly<Record<string, string>> = Object.fromEntries([
  ...TIMER_KEPT.filter((k) => k !== 1).map((k) => [`R${k}@trap`, String(TIMER_WORD(k))]),
  ["R2@trap", "30"],
  ["R3@trap", "0"],
  ["R4@trap", "0"],
  ["word:500", String(TIMER_WORD(1))],
]);

/** The timer challenge's runs: the door opens before an instruction, and maybe closes again. */
export const TIMER_RUNS: readonly {
  readonly label: string;
  readonly opens?: number;
  readonly closes?: number;
  readonly warm?: 1;
  /** The lamps the start lights, from the word the test's lines give. */
  readonly start: number;
  /** The lamps at the end: the start's, with ALARM (bit 0) where the door was left open. */
  readonly lamps: number;
}[] = [
  { label: "the door left open", opens: 20, start: 2, lamps: 3 },
  { label: "the door closed in time", opens: 20, closes: 35, start: 6, lamps: 6 },
  { label: "the door shut all night", start: 4, lamps: 4 },
  { label: "the door opened late and left open", opens: 60, start: 5, lamps: 5 },
  { label: "the door left open on a warm night", opens: 20, warm: 1, start: 2, lamps: 3 },
];

// ---------------------------------------------------------------------------------------------
// 12.6 nesting

/** The handler's choice for 12.6: the door, the timer, then jobs 1, 2, 4 and 5. */
const NEST_HEAD = `handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x82
        if R9 == R8 goto door
        R8 <= 0x81
        if R9 == R8 goto tick
        R8 <= 0x41
        if R9 != R8 goto fault
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 4
        if R1 == R8 goto end
        R8 <= 5
        if R1 == R8 goto wait
        goto back
show:   word[display] <= R2
        goto back`;

/** Job 5 as it starts: R2 rounds of a loop, with interrupts off, as every trap leaves them. */
export const WAIT_OFF = `wait:   R8 <= 0
pause:  R2 <= R2 - 1
        if R2 != R8 goto pause
        goto back`;

/** Job 5 letting the door in: C1 and C2 kept at 410 and 418, interrupts on for the loop. */
export const WAIT_ON = `wait:   R8 <= word[0x400]       // the program's R8 and R9 back now:
        R9 <= word[0x408]       // a trap in the loop saves them again
        R1 <= C1
        word[0x410] <= R1       // save C1
        R1 <= C2
        word[0x418] <= R1       // save C2
        R1 <= 3
        C0 <= R1                // system mode, interrupts on
        R1 <= 0
pause:  R2 <= R2 - 1
        if R2 != R1 goto pause
        R1 <= 1
        C0 <= R1                // interrupts off again
        R1 <= word[0x410]
        C1 <= R1                // C1 and C2 back
        R1 <= word[0x418]
        C2 <= R1
        resume`;

/** Job 5 with interrupts on, but C1 and C2 not kept. */
export const WAIT_UNSAVED = `wait:   R8 <= word[0x400]       // the program's R8 and R9 back now:
        R9 <= word[0x408]       // a trap in the loop saves them again
        R1 <= 3
        C0 <= R1                // system mode, interrupts on
        R1 <= 0
pause:  R2 <= R2 - 1
        if R2 != R1 goto pause
        R1 <= 1
        C0 <= R1                // interrupts off again
        resume`;

/** The user program of 12.6: shows 5, waits 60 rounds, shows 6, ends. */
export const WAIT_PROGRAM = `program: R2 <= 5
        R1 <= 1
        call system             // show 5
        R2 <= 60
        R1 <= 5
        call system             // wait 60 rounds
        R2 <= 6
        R1 <= 1
        call system             // show 6
        R1 <= 4
        call system             // end the program`;

const nest = (wait: string, program = WAIT_PROGRAM) => `${TO_PROGRAM_EVENTS}
${NEST_HEAD}
${wait}
${DOOR_PART}
${TIMER_PART}
${EVENT_HANDLER_TAIL}
${program}`;

export const NEST_LATE = `// A long job keeps the door waiting: job 5 waits with interrupts off.
${nest(WAIT_OFF)}`;
export const NEST_UNSAVED = `// Job 5 lets the door in, but does not save C1 and C2.
${nest(WAIT_UNSAVED)}`;
export const NEST_SAVED = `// Job 5 lets the door in, and saves C1 and C2 at 410 and 418.
${nest(WAIT_ON)}`;

/** A handler whose job 2 trusts R2, and whose fault part skips, as lesson 1's did. */
export const NEST_FAULT = `// A user program asks job 2 for room 5; the handler's own load faults.
${TO_PROGRAM}
handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x41
        if R9 != R8 goto fault
        R8 <= 2
        if R1 == R8 goto room
        goto back
room:   R8 <= R2 + R2           // room R2's sensor: sensorA + 8 × R2
        R8 <= R8 + R8
        R8 <= R8 + R8
        R1 <= word[R8 + 0x7D8]
        goto back
fault:  R8 <= C2                // skip what faulted, as lesson 1's handler did
        R8 <= R8 + 4
        C2 <= R8
back:   R8 <= word[0x400]       // put R8 and R9 back
        R9 <= word[0x408]
        resume
program: R8 <= 88               // the program's own words in R8 and R9
        R9 <= 99
        R2 <= 5
        R1 <= 2
        call system             // room 5's reading in R1: there is no room 5
        R2 <= R1
        R1 <= 1
        call system`;

/**
 * 12.6's challenge: a job of its own, job 6, which counts R2 down on the display to 1, so no
 * figure lists its lines. The handler offers jobs 1, 4 and 6.
 */
const COUNT_HEAD = NEST_HEAD.replace(
  "        R8 <= 5\n        if R1 == R8 goto wait",
  "        R8 <= 6\n        if R1 == R8 goto count",
);

/** Job 6 as it starts: interrupts off, as every trap leaves them. */
export const COUNT_OFF = `count:  R8 <= 0
next:   word[display] <= R2     // show the count
        R2 <= R2 - 1
        if R2 != R8 goto next
        goto back`;

/** Job 6 letting the door in: C1 and C2 saved at 410 and 418, interrupts on for the count. */
export const COUNT_ON = `count:  R8 <= word[0x400]       // the program's R8 and R9 back now:
        R9 <= word[0x408]       // a trap in the count saves them again
        R1 <= C1
        word[0x410] <= R1       // save C1
        R1 <= C2
        word[0x418] <= R1       // save C2
        R1 <= 3
        C0 <= R1                // system mode, interrupts on
        R1 <= 0
next:   word[display] <= R2     // show the count
        R2 <= R2 - 1
        if R2 != R1 goto next
        R1 <= 1
        C0 <= R1                // interrupts off again
        R1 <= word[0x410]
        C1 <= R1                // C1 and C2 put back
        R1 <= word[0x418]
        C2 <= R1
        resume`;

/** 12.6's start: the program's status comes from the word each test gives, `startStatus`. */
const TO_PROGRAM_STATUS = TO_PROGRAM_EVENTS.replace(
  "        R1 <= 2\n        C1 <= R1                // user mode, interrupts on",
  "        R1 <= word[startStatus]\n        C1 <= R1                // the status each test gives",
);

export const WAIT_START = `// The start and the handler. Change job 6 so the door can come in while it counts.
${TO_PROGRAM_STATUS}
${COUNT_HEAD}
${COUNT_OFF}
${DOOR_PART}
${TIMER_PART}
${EVENT_HANDLER_TAIL}`;

export const WAIT_REFERENCE = WAIT_START.replace(COUNT_OFF, COUNT_ON);

/**
 * The count challenge's programs: words of their own in R0 and R3 to R15, a set for each test; a
 * system call may change R1 and R2 alone. The tests read them as the program left them at its last
 * trap, job 4's call. Each test gives the status the start runs the program with.
 */
const COUNT_KEPT = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const countWords = (base: number) => COUNT_KEPT.map((k) => [k, base + 5 * k] as const);
const countSet = (base: number) =>
  countWords(base)
    .map(([k, v]) => `        R${k} <= ${v}`)
    .join("\n");
/** The kept registers at the last trap, by name, as decimal words. */
export const countKeptAt = (base: number): Readonly<Record<string, string>> =>
  Object.fromEntries(countWords(base).map(([k, v]) => [`R${k}@trap`, String(v)]));
const countdown = (from: number) =>
  Array.from({ length: from }, (_, k) => String(from - k)).join(", ");
const countEnd = (status: number) => `        R1 <= 4
        call system             // end the program
startStatus: word ${status}`;

/** The challenge's runs: each user program asks job 6 to count while the door may open. */
export const WAIT_RUNS: readonly {
  readonly label: string;
  readonly code: string;
  readonly opens?: number;
  readonly shown: string;
  readonly lamps: number;
  /** C1 at the end: the status the start ran the program with, as two bits. */
  readonly status: string;
  readonly kept: Readonly<Record<string, string>>;
}[] = [
  {
    label: "the door opens in the count, and the program ends after it",
    code: `program: nothing
${countSet(30)}
        R2 <= 20
        R1 <= 6
        call system             // count 20 down
${countEnd(2)}`,
    opens: 50,
    shown: countdown(20),
    lamps: 1,
    status: "10",
    kept: countKeptAt(30),
  },
  {
    label: "show 5, count, show 6, the door open",
    code: `program: nothing
${countSet(500)}
        R2 <= 5
        R1 <= 1
        call system             // show 5
        R2 <= 20
        R1 <= 6
        call system             // count 20 down
        R2 <= 6
        R1 <= 1
        call system             // show 6
${countEnd(2)}`,
    opens: 60,
    shown: `5, ${countdown(20)}, 6`,
    lamps: 1,
    status: "10",
    kept: countKeptAt(500),
  },
  {
    label: "show 5, count, show 6, the door shut",
    code: `program: nothing
${countSet(900)}
        R2 <= 5
        R1 <= 1
        call system             // show 5
        R2 <= 20
        R1 <= 6
        call system             // count 20 down
        R2 <= 6
        R1 <= 1
        call system             // show 6
${countEnd(2)}`,
    shown: `5, ${countdown(20)}, 6`,
    lamps: 0,
    status: "10",
    kept: countKeptAt(900),
  },
  {
    label: "a longer count, the program's interrupts off",
    code: `program: nothing
${countSet(1400)}
        R2 <= 30
        R1 <= 6
        call system             // count 30 down
${countEnd(0)}`,
    opens: 40,
    shown: countdown(30),
    lamps: 1,
    status: "00",
    kept: countKeptAt(1400),
  },
];

// ---------------------------------------------------------------------------------------------
// 12.7 trap-hardware

/** A trap inside 12 edges of the machine of several edges: C4 set, then a refused store. */
export const TRAP_EDGES = `        R1 <= handler
        C4 <= R1
        word[sensorB] <= R1     // refused: it traps at its MEMORY edge
        stop
handler: R5 <= C3
        stop`;

/**
 * The prediction's program: a `call system` traps at its READ edge, where the controller's table
 * would go on to ALU; the trap sends it to FETCH instead.
 */
export const CALL_TRAP = `        R1 <= handler
        C4 <= R1
        call system             // traps at its READ edge, with cause 41
        stop
handler: R5 <= C3
        stop`;

const TRAPLOGIC_HEADER = `module traplogic(
  input logic CHECKING,
  input logic FETCHING,
  input logic [7:0] CAUSED,
  input logic STOP,
  input logic IE,
  input logic [7:0] CAUSEF,
  input logic [7:0] CAUSEM,
  input logic [1:0] WAITING,
  input logic NOHANDLER,
  output logic GO,
  output logic TRAP,
  output logic [7:0] CAUSE,
  output logic HALT
);
  logic failedF, failedD, failedM, stopNow;
  assign failedF = CAUSEF != 8'h00;
  assign failedD = (CAUSED != 8'h00) & CHECKING;
  assign failedM = CAUSEM != 8'h00;
  assign stopNow = STOP & CHECKING;`;

/** 12.7's challenge's start: Module 9's stop logic, which halts at every cause. */
export const TRAPLOGIC_START = `${TRAPLOGIC_HEADER}
  logic failed;
  assign failed = failedF | failedD | failedM;
  assign HALT = failed | stopNow;
  assign TRAP = 1'b0;
  assign GO = ~(failed | stopNow);
  always_comb begin
    CAUSE = CAUSEM;
    if (failedD) CAUSE = CAUSED;
    if (failedF) CAUSE = CAUSEF;
  end
endmodule
`;

export const TRAPLOGIC_REFERENCE = `${TRAPLOGIC_HEADER}
  logic interrupt, traps;
  assign interrupt = FETCHING & IE & (WAITING != 2'b00);
  assign traps = failedF | interrupt | failedD | failedM;
  assign HALT = stopNow | (traps & NOHANDLER);
  assign TRAP = traps & ~NOHANDLER;
  assign GO = ~(traps | stopNow);
  always_comb begin
    CAUSE = CAUSEM;
    if (failedD) CAUSE = CAUSED;
    if (interrupt) begin
      if (WAITING[0]) CAUSE = 8'h81;
      else CAUSE = 8'h82;
    end
    if (failedF) CAUSE = CAUSEF;
  end
endmodule
`;

/** One row of the trap logic's table: the inputs that are not 0. */
export interface TrapLogicRow {
  readonly label: string;
  readonly inputs: Partial<
    Record<
      | "CHECKING"
      | "FETCHING"
      | "CAUSED"
      | "STOP"
      | "IE"
      | "CAUSEF"
      | "CAUSEM"
      | "WAITING"
      | "NOHANDLER",
      number
    >
  >;
}

/** The trap logic's tests: each cause on its own, the events, which cause wins, and no handler. */
export const TRAPLOGIC_ROWS: readonly TrapLogicRow[] = [
  { label: "nothing to do", inputs: {} },
  { label: "a fetch's cause 11", inputs: { FETCHING: 1, CAUSEF: 0x11 } },
  { label: "a fetch's cause 11, no handler", inputs: { FETCHING: 1, CAUSEF: 0x11, NOHANDLER: 1 } },
  { label: "the decoder's cause 22 at the check", inputs: { CHECKING: 1, CAUSED: 0x22 } },
  { label: "the decoder's cause 22 outside the check", inputs: { CAUSED: 0x22 } },
  { label: "call system at the check", inputs: { CHECKING: 1, CAUSED: 0x41 } },
  { label: "the memory's cause 34", inputs: { CAUSEM: 0x34 } },
  { label: "the memory's cause 32, no handler", inputs: { CAUSEM: 0x32, NOHANDLER: 1 } },
  { label: "stop at the check", inputs: { CHECKING: 1, STOP: 1 } },
  { label: "the door, at a fetch, interrupts on", inputs: { FETCHING: 1, IE: 1, WAITING: 2 } },
  { label: "the timer, at a fetch, interrupts on", inputs: { FETCHING: 1, IE: 1, WAITING: 1 } },
  { label: "both events, at a fetch", inputs: { FETCHING: 1, IE: 1, WAITING: 3 } },
  { label: "the door, interrupts off", inputs: { FETCHING: 1, WAITING: 2 } },
  { label: "the door, not at a fetch", inputs: { CHECKING: 1, IE: 1, WAITING: 2 } },
  {
    label: "the door and a fetch's cause 12",
    inputs: { FETCHING: 1, IE: 1, WAITING: 2, CAUSEF: 0x12 },
  },
  {
    label: "the door at a fetch, no handler",
    inputs: { FETCHING: 1, IE: 1, WAITING: 2, NOHANDLER: 1 },
  },
  {
    label: "the decoder's 21 and the memory's 31",
    inputs: { CHECKING: 1, CAUSED: 0x21, CAUSEM: 0x31 },
  },
];

/** What the drawn trap logic gives for a row: the rule `docs/machine.md` and the circuit share. */
export function trapLogicOut(r: TrapLogicRow["inputs"]): {
  GO: number;
  TRAP: number;
  CAUSE: number;
  HALT: number;
} {
  const v = (k: keyof TrapLogicRow["inputs"]) => r[k] ?? 0;
  const failedF = v("CAUSEF") !== 0;
  const failedD = v("CAUSED") !== 0 && v("CHECKING") === 1;
  const failedM = v("CAUSEM") !== 0;
  const interrupt = v("FETCHING") === 1 && v("IE") === 1 && v("WAITING") !== 0;
  const traps = failedF || interrupt || failedD || failedM;
  const stopNow = v("STOP") === 1 && v("CHECKING") === 1;
  const cause = failedF
    ? v("CAUSEF")
    : interrupt
      ? (v("WAITING") & 1) === 1
        ? 0x81
        : 0x82
      : failedD
        ? v("CAUSED")
        : v("CAUSEM");
  return {
    GO: traps || stopNow ? 0 : 1,
    TRAP: traps && v("NOHANDLER") === 0 ? 1 : 0,
    CAUSE: cause,
    HALT: stopNow || (traps && v("NOHANDLER") === 1) ? 1 : 0,
  };
}

// ---------------------------------------------------------------------------------------------
// 12.8 system-call-mechanism: the capstone

/** The handler's start: run program number word[0x480] of the table, in user mode. */
const RUN_START = `        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x480] <= R1       // the first program is number 0
start:  R1 <= word[0x480]       // run program number R1, if there is one
        R2 <= word[programs]
        if R1 == R2 goto done
        R1 <= R1 + R1
        R1 <= R1 + R1
        R1 <= R1 + R1           // 8 × R1
        R2 <= programs
        R1 <= R1 + R2
        R1 <= word[R1 + 8]      // its address, from the table
        C2 <= R1
        R1 <= 0
        C1 <= R1                // user mode, interrupts off
        resume
done:   stop`;

const RUN_HANDLER_HEAD = `handler: word[0x488] <= R8      // save R8 and R9
        word[0x490] <= R9
        R9 <= C3
        R8 <= 0x41
        if R9 != R8 goto ended  // a fault: the program ends with its cause
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 2
        if R1 == R8 goto room
        R8 <= 3
        if R1 == R8 goto light
        R8 <= 4
        if R1 == R8 goto finish
        goto back               // a job the handler does not offer
show:   word[display] <= R2
        goto back`;

const RUN_ROOM = `room:   R1 <= word[sensorA]     // job 2: room A when R2 is 0
        R8 <= 0
        if R2 == R8 goto back
        R1 <= word[sensorB]     // room B when R2 is 1
        R8 <= 1
        if R2 == R8 goto back
        R1 <= 0                 // no such room
        goto back`;

const RUN_LAMPS = `light:  word[lamps] <= R2      // job 3: the lamps from R2's bits 2 to 0
        goto back`;

const RUN_BACK = `back:   R8 <= word[0x488]       // put R8 and R9 back
        R9 <= word[0x490]
        resume`;

const RUN_END = `finish: R9 <= 0                 // job 4: the program ended; its record is 0
ended:  R8 <= word[0x480]       // record R9 for program R8, at 0x400 + 8 × R8
        R1 <= R8 + R8
        R1 <= R1 + R1
        R1 <= R1 + R1
        word[R1 + 0x400] <= R9
        R8 <= R8 + 1
        word[0x480] <= R8       // the next program
        goto start`;

export const RUN_REFERENCE = `// The shop's runner: run each program the table names, in user mode, through jobs 1 to 4.
// The start's lines come first, its stop included. The handler's first line is named handler.
${RUN_START}
${RUN_HANDLER_HEAD}
${RUN_ROOM}
${RUN_LAMPS}
${RUN_BACK}
${RUN_END}`;

/** The lines before the start: C4, and the number of the first program, 0, at 480. */
const RUN_FIRST = `        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x480] <= R1       // the first program is number 0`;

/**
 * The outline, the challenge's starting text: the choice of job and jobs 1 to 3 given; the start
 * of each program and the end of each, with its record, left to the learner, so no figure shows
 * them.
 */
export const RUN_SKELETON = `// The shop's runner: run each program the table names, in user mode, through jobs 1 to 4.
// The start's lines come first, its stop included. The handler's first line is named handler.
${RUN_FIRST}
// start: run program number word[0x480] from the table, in user mode with interrupts off;
// after the last program, stop.
start:  stop
${RUN_HANDLER_HEAD}
${RUN_ROOM}
${RUN_LAMPS}
${RUN_BACK}
// job 4 and a fault: record 0 (job 4) or the cause at 0x400 + 8 × the program's number,
// then run the next program.
finish: stop
ended:  stop`;

/** The empty start: the requirements as comments. */
export const RUN_EMPTY = `// The shop's runner is a start, then the handler. The start's lines, its stop included, go above
// the handler's first line, which is named handler. The tests add a table, programs, after it:
// its first word is how many programs, then each program's address. Run each in user mode with
// interrupts off, in order, from the first. Offer jobs 1 to 4 by call system: 1 shows R2; 2 puts
// room R2's reading in R1 (R2 is 0 for room A, 1 for room B; any other R2 puts 0 in R1); 3 sets
// the lamps from R2;
// 4 ends the program. A program that faults ends there. For program k, store 0 at 0x400 + 8k if
// it ended with job 4, else its cause. A job may change R1 and R2 only. After the last program,
// stop.
`;

/**
 * The prediction's handler, smaller than the challenge's: it runs one program in user mode and
 * records the cause of its trap at 400. The program's load faults with cause 33.
 */
export const RECORD_ONE = `// One program in user mode; the handler records the cause of its trap.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1                // user mode, interrupts off
        R1 <= program
        C2 <= R1
        resume
handler: R5 <= C3
        word[0x400] <= R5       // record the cause
        stop
program: R2 <= 0x404
        R3 <= word[R2]          // a word not at a multiple of 8
        R1 <= 4
        call system`;

/** A handler that skips a faulting instruction, as lesson 1's did, instead of ending the program. */
export const RUN_SKIPPING = RUN_REFERENCE.replace(
  "        if R9 != R8 goto ended  // a fault: the program ends with its cause",
  "        if R9 != R8 goto skip   // a fault: skip it, as lesson 1's handler did",
).replace(
  RUN_BACK,
  `skip:   R8 <= C2
        R8 <= R8 + 4
        C2 <= R8
${RUN_BACK}`,
);

/** One run of the capstone: the user programs and their table, and what the run must leave. */
export interface RunCase {
  readonly label: string;
  readonly data: string;
  readonly shown: string;
  readonly lamps: number;
  /** How each program ended: 0 for job 4, else its cause, in decimal. */
  readonly records: readonly number[];
  /** Registers the last program keeps, as it left them at its last trap. */
  readonly kept?: Readonly<Record<string, string>>;
}

/**
 * Run 6's second program gives R0 and R3 to R15 words of its own; the tests read them at its last
 * trap, job 4's call, so a handler that keeps the program's number or its own words in a register
 * the program uses fails.
 */
const RUN6_KEPT_REGISTERS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const RUN6_WORD = (k: number) => 700 + 19 * k;
const RUN6_SET = RUN6_KEPT_REGISTERS.map((k) => `        R${k} <= ${RUN6_WORD(k)}`).join("\n");
const RUN6_KEPT: Readonly<Record<string, string>> = Object.fromEntries(
  RUN6_KEPT_REGISTERS.map((k) => [`R${k}@trap`, String(RUN6_WORD(k))]),
);

export const RUN_CASES: readonly RunCase[] = [
  {
    label: "two programs that end with job 4",
    data: `programs: word 2, run1first, run1second
run1first:  R2 <= 25
        R1 <= 1
        call system             // show 25
        R1 <= 4
        call system
run1second:  R2 <= 1
        R1 <= 2
        call system             // room B's reading in R1
        R2 <= R1
        R1 <= 1
        call system             // show it
        R1 <= 4
        call system`,
    shown: "25, -250",
    lamps: 0,
    records: [0, 0],
  },
  {
    label: "a program that stores to the display itself",
    data: `programs: word 2, run2first, run2second
run2first: R2 <= 7
        word[display] <= R2     // refused in user mode
        R1 <= 4
        call system
run2second:  R2 <= 8
        R1 <= 1
        call system
        R1 <= 4
        call system`,
    shown: "8",
    lamps: 0,
    records: [0x32, 0],
  },
  {
    label: "the lamps, then a program that runs stop",
    data: `programs: word 2, run3first, run3second
run3first:  R2 <= 2
        R1 <= 3
        call system             // NIGHT on
        R1 <= 4
        call system
run3second:  stop                    // refused in user mode`,
    shown: "",
    lamps: 2,
    records: [0, 0x22],
  },
  {
    label: "a word kept in R10 across a job",
    data: `programs: word 1, run4only
run4only:  R10 <= 77
        R2 <= 5
        R1 <= 1
        call system             // show 5
        R2 <= R10
        R1 <= 1
        call system             // show 77
        R1 <= 4
        call system`,
    shown: "5, 77",
    lamps: 0,
    records: [0],
  },
  {
    label: "room 5, and a program that is not instructions",
    data: `programs: word 2, run5first, run5second
run5first:  R2 <= 5
        R1 <= 2
        call system             // there is no room 5
        R2 <= R1
        R1 <= 1
        call system
        R1 <= 4
        call system
run5second: word 0`,
    shown: "0",
    lamps: 0,
    records: [0, 0x21],
  },
  {
    label: "every register kept across jobs",
    data: `programs: word 2, run6first, run6second
run6first: R8 <= 81
        R9 <= 92
        R12 <= 3
        R2 <= R8
        R1 <= 1
        call system             // show 81
        R2 <= R9
        R1 <= 1
        call system             // show 92
        R2 <= R12
        R1 <= 1
        call system             // show 3
        R1 <= 4
        call system
run6second: nothing
${RUN6_SET}
        R2 <= 1
        R1 <= 2
        call system             // room B's reading in R1
        R2 <= R12
        R1 <= 1
        call system             // show R12
        R1 <= 4
        call system`,
    shown: `81, 92, 3, ${RUN6_WORD(12)}`,
    lamps: 0,
    records: [0, 0],
    kept: RUN6_KEPT,
  },
  {
    label: "no programs",
    data: `programs: word 0`,
    shown: "",
    lamps: 0,
    records: [],
  },
];
