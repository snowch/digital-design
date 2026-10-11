// Copyright © 2026 Christopher Snow

// Beyond the machine: the programs and lines the two optional chapters share with their facts
// tests. The compiler chapter's lines are Module 0's two rules, each written as one line; its
// challenge's line is the rule Module 0's failure experiment showed missing.

import { compile } from "@dd/dd-model";

/** Module 0's readings: room A at -184 and room B at -250, a gap of 66. */
export const SHOP_READINGS = { sensorA: -184, sensorB: -250 } as const;

/** Module 0's gap rule as one line: the display shows how much warmer room A is than room B. */
export const GAP_LINE = "display <= sensorA - sensorB";

/** Module 0's CLASH rule as one line: CLASH when room A is 10.0 degrees or more warmer. */
export const CLASH_LINE = "if sensorA - sensorB >= 100 then lamps <= 4";

/** The question's program: the gap rule as the shop says it, which the assembler refuses. */
export const ASKED_PROGRAM = `${GAP_LINE}\nstop`;

/** The compiler's program for the CLASH line, which the construction runs on the whole machine. */
export const CLASH_PROGRAM = compile(CLASH_LINE).program;

/** The compiler's program for both lines, beside Module 0's in the generalisation. */
export const BOTH_PROGRAM = compile(`${GAP_LINE}\n${CLASH_LINE}`).program;

/** The challenge's line: CLASH when room B is more than 10.0 degrees warmer than room A. */
export const CHALLENGE_LINE = "if sensorB - sensorA > 100 then lamps <= 4";

/** The challenge's starting text: the line as a comment, and `stop`. */
export const COMPILER_START = `// ${CHALLENGE_LINE}
stop`;

/** The challenge's reference: the instructions the compiler's rules give for its line. */
export const COMPILER_REFERENCE = `R1 <= word[sensorB]
R2 <= word[sensorA]
R3 <= R1 - R2
R4 <= 100
if R4 >= R3 signed goto after1
R5 <= 4
word[lamps] <= R5
after1: stop`;

/**
 * The challenge's runs: room A and room B, the lamps the line leaves, and the rule a failed run
 * points to (the sentence's key in strings14.ts).
 */
export const COMPILER_RUNS = [
  { sensorA: -184, sensorB: -50, lamps: 4, detail: "compilerWarmer" },
  { sensorA: -250, sensorB: -150, lamps: 0, detail: "compilerExactly" },
  { sensorA: -250, sensorB: -149, lamps: 4, detail: "compilerJustOver" },
  { sensorA: -184, sensorB: -250, lamps: 0, detail: "compilerSigned" },
  { sensorA: -30, sensorB: 80, lamps: 4, detail: "compilerBothSigns" },
  { sensorA: 20, sensorB: 25, lamps: 0, detail: "compilerClose" },
] as const;

// ---------------------------------------------------------------------------------------------
// The kernel chapter: two of the shop's programs on one machine, switched by the timer.

/** The gap program: Module 0's gap, round after round, through jobs 2 and 1; it never ends. */
export const GAP_PROGRAM = `gap:    R2 <= 0
        R1 <= 2
        call system             // room A's reading, in R1
        R5 <= R1
        R2 <= 1
        R1 <= 2
        call system             // room B's reading, in R1
        R2 <= R5 - R1           // the gap: room A minus room B
        R1 <= 1
        call system             // show the gap
        goto gap`;

/** The report: how many of 11.7's first log are warmer than -180, kept at 640, ALARM when any is. */
export const REPORT_PROGRAM = `report: R10 <= log              // the next reading's address
        R11 <= word[count]      // readings left
        R12 <= -180             // the limit
        R13 <= 0                // warm readings so far
        R5 <= 0
next:   if R11 == R5 goto told
        R3 <= word[R10]
        R10 <= R10 + 8
        R11 <= R11 - 1
        if R3 < R12 signed goto next
        if R3 == R12 goto next
        R13 <= R13 + 1
        goto next
told:   word[0x640] <= R13      // how many, in the RAM
        R2 <= 0
        if R13 == R2 goto quiet
        R2 <= 1                 // ALARM: a reading was warmer than the limit
quiet:  R1 <= 3
        call system             // the lamps
        R1 <= 4
        call system             // end
count:  word 6
log:    word -184, -190, -176, -181, -172, -188`;

/** The timer's count in the figures: a program runs this many instructions less the switch's 51. */
export const KERNEL_COUNT = 80;

/** The figures' start: each program's return point and status, the two save areas, the timer. */
export const kernelStart = (count = KERNEL_COUNT) => `        R1 <= handler
        C4 <= R1
        R1 <= gap
        word[0x588] <= R1       // the gap program's return point: its first line
        R1 <= 2
        word[0x580] <= R1       // its status: user mode, interrupts on
        R1 <= report
        word[0x628] <= R1       // the report's return point
        R1 <= 2
        word[0x620] <= R1       // its status
        R1 <= 0x500
        word[0x480] <= R1       // the save area of the program that runs
        R1 <= 0x5A0
        word[0x488] <= R1       // the save area of the program that waits
        R1 <= ${count}
        word[timer] <= R1       // instructions to the first switch
        goto load`;

/** The kernel: 12.8's handler grown, with a switch in its timer's part. */
export const kernel = (count = KERNEL_COUNT) => `handler: word[0x400] <= R8      // save R8 and R9
        word[0x408] <= R9
        R9 <= C3
        R8 <= 0x81
        if R9 == R8 goto tick
        R8 <= 0x41
        if R9 != R8 goto ended  // a fault: the program ends, its record its cause
        R8 <= 1
        if R1 == R8 goto show
        R8 <= 2
        if R1 == R8 goto room
        R8 <= 3
        if R1 == R8 goto light
        R8 <= 4
        if R1 == R8 goto finish
        goto back
show:   word[display] <= R2
        goto back
room:   R1 <= word[sensorA]
        R8 <= 0
        if R2 == R8 goto back
        R1 <= word[sensorB]
        R8 <= 1
        if R2 == R8 goto back
        R1 <= 0
        goto back
light:  word[lamps] <= R2
        goto back
back:   R8 <= word[0x400]       // put R8 and R9 back
        R9 <= word[0x408]
        resume
tick:   R8 <= 1
        word[waiting] <= R8     // the timer's event is seen
        R8 <= ${count}
        word[timer] <= R8       // the next program's count
        R8 <= word[0x488]
        R9 <= 0
        if R8 == R9 goto back   // no program waits: this one carries on
        R9 <= word[0x480]       // save this program's words in its save area
        word[R9] <= R0
        word[R9 + 8] <= R1
        word[R9 + 16] <= R2
        word[R9 + 24] <= R3
        word[R9 + 32] <= R4
        word[R9 + 40] <= R5
        word[R9 + 48] <= R6
        word[R9 + 56] <= R7
        R8 <= word[0x400]
        word[R9 + 64] <= R8     // its R8, saved at the handler's start
        R8 <= word[0x408]
        word[R9 + 72] <= R8     // its R9
        word[R9 + 80] <= R10
        word[R9 + 88] <= R11
        word[R9 + 96] <= R12
        word[R9 + 104] <= R13
        word[R9 + 112] <= R14
        word[R9 + 120] <= R15
        R8 <= C1
        word[R9 + 128] <= R8    // its status
        R8 <= C2
        word[R9 + 136] <= R8    // its return point: the instruction not yet run
        R8 <= word[0x488]
        word[0x488] <= R9       // this program waits now
        word[0x480] <= R8       // the other runs
load:   R9 <= word[0x480]       // put back the words of the program that runs
        R8 <= word[R9 + 128]
        C1 <= R8
        R8 <= word[R9 + 136]
        C2 <= R8
        R0 <= word[R9]
        R1 <= word[R9 + 8]
        R2 <= word[R9 + 16]
        R3 <= word[R9 + 24]
        R4 <= word[R9 + 32]
        R5 <= word[R9 + 40]
        R6 <= word[R9 + 48]
        R7 <= word[R9 + 56]
        R10 <= word[R9 + 80]
        R11 <= word[R9 + 88]
        R12 <= word[R9 + 96]
        R13 <= word[R9 + 104]
        R14 <= word[R9 + 112]
        R15 <= word[R9 + 120]
        R8 <= word[R9 + 64]
        R9 <= word[R9 + 72]
        resume
finish: R9 <= 0                 // job 4: the program ended; its record is 0
ended:  R8 <= word[0x480]
        word[R8 + 144] <= R9    // the record: 0, or the cause it faulted with
        R8 <= word[0x488]
        R9 <= 0
        if R8 == R9 goto done   // no program waits: every program has ended
        word[0x480] <= R8       // the waiting program runs
        word[0x488] <= R9       // and none waits
        goto load
done:   stop`;

/** The figures' whole text: the start, the kernel, then the two programs. */
export const kernelText = (count = KERNEL_COUNT) =>
  [kernelStart(count), kernel(count), GAP_PROGRAM, REPORT_PROGRAM].join("\n");

// The kernel chapter's challenge: set up the second program's save area for the kernel, given whole.

/** The challenge's start as the reference completes it; the starting text leaves out ten lines. */
const challengeStart = (
  second: boolean,
) => `// The start. The kernel follows it, whole. The tests add two programs after your text, named
// program and second, and the words secondLog and secondCount.
        R1 <= handler
        C4 <= R1
        R1 <= program
        word[0x588] <= R1       // the first program's return point: its first line
        R1 <= 2
        word[0x580] <= R1       // its status: user mode, interrupts on
        R1 <= 0x7C0
        word[0x570] <= R1       // its R14: the top of its stack
${
  second
    ? `        R1 <= second
        word[0x628] <= R1       // the second program's return point
        R1 <= 2
        word[0x620] <= R1       // its status
        R1 <= 0x700
        word[0x610] <= R1       // its R14
        R1 <= secondLog
        word[0x5A8] <= R1       // its R1: the address of its readings
        R1 <= word[secondCount]
        word[0x5B0] <= R1       // its R2: how many readings
`
    : `// Set up the second program here, in the save area at 0x5A0.
`
}        R1 <= 0x500
        word[0x480] <= R1       // the save area of the program that runs
        R1 <= ${second ? "0x5A0" : "0"}
        word[0x488] <= R1       // the save area of the program that waits${second ? "" : ", or 0"}
        R1 <= ${KERNEL_COUNT}
        word[timer] <= R1
        goto load`;

export const KERNEL_START = `${challengeStart(false)}\n${kernel()}`;
export const KERNEL_REFERENCE = `${challengeStart(true)}\n${kernel()}`;

/** The gap program for three rounds, then job 4. */
const GAP_THREE = `program: R6 <= 3                // three rounds
p1round: R2 <= 0
        R1 <= 2
        call system             // room A's reading
        R5 <= R1
        R2 <= 1
        R1 <= 2
        call system             // room B's reading
        R2 <= R5 - R1
        R1 <= 1
        call system             // show the gap
        R6 <= R6 - 1
        R7 <= 0
        if R6 != R7 goto p1round
        R1 <= 4
        call system             // end`;

/** The report on the log its arguments give: how many readings are warmer than -180, shown. */
const reportWith = (
  show: string,
) => `second: R10 <= R1               // the readings' address, from R1
        R11 <= R2               // how many, from R2
        R12 <= -180
        R13 <= 0
        R5 <= 0
p2next: if R11 == R5 goto p2told
        R3 <= word[R10]
        R10 <= R10 + 8
        R11 <= R11 - 1
        if R3 < R12 signed goto p2next
        if R3 == R12 goto p2next
        R13 <= R13 + 1
        goto p2next
p2told: ${show}
        R1 <= 4
        call system             // end`;

const LOG6 = `secondCount: word 6
secondLog: word -184, -190, -176, -181, -172, -188`;

/** Two programs that call one function, which pushes R15, R10 and R11 and counts warm readings. */
const CALLERS = `program: R10 <= 100              // kept across the call, as the calling convention allows
        R1 <= firstLog
        R2 <= 8
        call warmCount, R15
        R2 <= R10 + R1          // 100 plus how many
        R1 <= 1
        call system
        R1 <= 4
        call system
second: call warmCount, R15     // its readings' address and count, from R1 and R2
        R2 <= R1
        R1 <= 1
        call system
        R1 <= 4
        call system
warmCount: R14 <= R14 - 8
        word[R14] <= R15
        R14 <= R14 - 8
        word[R14] <= R10
        R14 <= R14 - 8
        word[R14] <= R11
        R10 <= 0                // warm readings so far
        R11 <= -180
wcNext: R3 <= 0
        if R2 == R3 goto wcDone
        R3 <= word[R1]
        R1 <= R1 + 8
        R2 <= R2 - 1
        if R3 < R11 signed goto wcNext
        if R3 == R11 goto wcNext
        R10 <= R10 + 1
        goto wcNext
wcDone: R1 <= R10
        R11 <= word[R14]
        R14 <= R14 + 8
        R10 <= word[R14]
        R14 <= R14 + 8
        R15 <= word[R14]
        R14 <= R14 + 8
        goto R15
firstLog: word -184, -170, -176, -181, -172, -188, -150, -200
secondCount: word 20
secondLog: word -184, -190, -176, -181, -172, -188, -185, -183, -195, -191, -186, -182, -199, -178, -192, -193, -187, -184, -189, -175`;

/** The challenge's three runs: the programs the tests add, and what each run must leave. */
export const KERNEL_RUNS = [
  {
    data: `${GAP_THREE}\n${reportWith("R2 <= R13\n        R1 <= 1\n        call system             // show how many")}\n${LOG6}`,
    shown: "66, 2, 66, 66",
    records: ["0", "0"],
  },
  { data: CALLERS, shown: "104, 4", records: ["0", "0"] },
  {
    data: `${GAP_THREE}\n${reportWith("word[display] <= R13     // a store to the display, in user mode")}\n${LOG6}`,
    shown: "66, 66, 66",
    records: ["0", "50"],
  },
] as const;
