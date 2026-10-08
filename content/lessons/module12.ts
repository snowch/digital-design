// Copyright © 2026 Christopher Snow

// Module 12, traps and interrupts: the programs the lessons run and the challenges grade, in the
// course's assembly (docs/isa.md), on Module 12's machine (`MODULE_12`). Each lesson's facts test
// pins the numbers its prose states.
//
// A challenge's learner writes a handler: the starting text sets C4 and goes to `program`, which
// the tests add after the learner's text, a different program for each test.

// ---------------------------------------------------------------------------------------------
// 12.1 traps

/** The night program as Module 11 left it: a store to room B's sensor halts the machine. */
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
        word[0x400] <= R5       // keep the cause
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
  readonly cause: string;
}[] = [
  {
    label: "two refused stores",
    code: `program: R2 <= 7
        word[sensorA] <= R2
        word[display] <= R2
        word[signals] <= R2
        R2 <= R2 + 1
        word[display] <= R2
        stop`,
    count: 2,
    display: 8,
    traps: 2,
    cause: "34",
  },
  {
    label: "a store to the ROM",
    code: `program: R2 <= 25
        word[0x100] <= R2
        word[display] <= R2
        stop`,
    count: 1,
    display: 25,
    traps: 1,
    cause: "34",
  },
  {
    label: "a word that is not an instruction",
    code: `program: R2 <= 9
        word[display] <= R2
        word[sensorB] <= R2
        R2 <= R2 - 1
        word[display] <= R2
data:   word 0`,
    count: 1,
    display: 8,
    traps: 2,
    cause: "21",
  },
  {
    label: "a word not at a multiple of 8",
    code: `program: R2 <= 0x404
        R3 <= word[R2]
        word[display] <= R2
        stop`,
    count: 0,
    display: 0,
    traps: 1,
    cause: "33",
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

/** A program whose stack has run into the ROM, with a handler that saves R5 below R14. */
export const STACK_HANDLER = `// The stack has reached the ROM; the handler saves R5 below it.
        R1 <= handler
        C4 <= R1
        R14 <= 0x400            // the stack is full
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

/** The same program in user mode, under a handler that keeps the cause and where. */
export const LAMPS_USER = `// The same program, started in user mode by the handler.
${TO_USER}
handler: R5 <= C3
        word[0x400] <= R5       // keep the cause
        R5 <= C2
        word[0x408] <= R5       // and where
        stop
program: R1 <= display
        R1 <= R1 + 8
        R2 <= 0
        word[R1] <= R2          // meant to clear the display
        stop`;

/** A program in user mode that writes the word the handler counts its traps in. */
export const RAM_UNGUARDED = `// The handler counts the night's traps at 410; the program keeps its own total there.
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

export const USER_START = `// Your handler. The tests add a program after it, named program.
        R1 <= handler
        C4 <= R1
        goto program
handler: stop`;

export const USER_REFERENCE = `// Start the program in user mode; keep the cause, then stop.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        C1 <= R1
        R1 <= program
        C2 <= R1
        resume
handler: R5 <= C3
        word[0x400] <= R5
        stop`;

export const USER_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly cause: number;
}[] = [
  {
    label: "a store to the lamps",
    code: `program: R1 <= 7
        word[lamps] <= R1
        stop`,
    cause: 0x32,
  },
  {
    label: "stop",
    code: `program: R1 <= 3
        R1 <= R1 + 1
        stop`,
    cause: 0x22,
  },
  {
    label: "a load from a sensor",
    code: `program: R2 <= word[sensorA]
        word[0x418] <= R2
        stop`,
    cause: 0x32,
  },
  {
    label: "a control register read",
    code: `program: R2 <= 0x418
        word[R2] <= R2
        R3 <= C0
        stop`,
    cause: 0x22,
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

export const SHOW_PROGRAM = `program: R2 <= 25
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
        word[0x400] <= R5       // keep the cause
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

/** Programs that read a room through service 2 and show it through service 1. */
export const SERVICE2_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly shown: string;
}[] = [
  {
    label: "room A, then room B",
    code: `program: R2 <= 0
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
  },
  {
    label: "room B, kept in R5 across a call",
    code: `program: R2 <= 1
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
  },
  {
    label: "the difference between the rooms",
    code: `program: R2 <= 0
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
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        resume`;

export const SAVE_REFERENCE = `// Count and skip a refused store, and leave every register as it was.
        R1 <= handler
        C4 <= R1
        R1 <= 0
        word[0x400] <= R1       // the count of refused stores
        goto program
handler: word[0x408] <= R5      // save R5
        R5 <= word[0x400]
        R5 <= R5 + 1
        word[0x400] <= R5
        R5 <= C2
        R5 <= R5 + 4
        C2 <= R5
        R5 <= word[0x408]       // put R5 back
        resume`;

/** Each program sets R1 to R9 to words of its own, then stores where it may not. */
const SET_ALL = Array.from({ length: 9 }, (_, k) => `        R${k + 1} <= ${(k + 1) * 11}`).join(
  "\n",
);
export const SAVE_PROGRAMS: readonly {
  readonly label: string;
  readonly code: string;
  readonly count: number;
}[] = [
  {
    label: "one refused store",
    code: `program: nothing\n${SET_ALL}\n        word[sensorA] <= R1\n        stop`,
    count: 1,
  },
  {
    label: "two refused stores",
    code: `program: nothing\n${SET_ALL}\n        word[signals] <= R2\n        word[0x200] <= R3\n        stop`,
    count: 2,
  },
  {
    label: "a stack at the ROM",
    code: `program: R14 <= 0x400\n${SET_ALL}\n        R14 <= R14 - 8\n        word[R14] <= R5\n        stop`,
    count: 1,
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
`,
);

export const TIMER_START = `// The handler. Write its timer part. The tests add a program after it, named program.
${TO_PROGRAM_EVENTS}
${EVENT_HANDLER_HEAD}
${DOOR_PART}
tick:   goto back
${EVENT_HANDLER_TAIL}`;

export const TIMER_REFERENCE = `// The handler, with its timer part.
${TO_PROGRAM_EVENTS}
${EVENT_HANDLER_HEAD}
${DOOR_PART}
${TIMER_PART}
${EVENT_HANDLER_TAIL}`;

/** The timer challenge's runs: the door opens before an instruction, and maybe closes again. */
export const TIMER_RUNS: readonly {
  readonly label: string;
  readonly opens?: number;
  readonly closes?: number;
  readonly lamps: number;
}[] = [
  { label: "the door left open", opens: 15, lamps: 1 },
  { label: "the door closed in time", opens: 15, closes: 30, lamps: 0 },
  { label: "the door shut all night", lamps: 0 },
  { label: "the door opened late and left open", opens: 50, lamps: 1 },
];
