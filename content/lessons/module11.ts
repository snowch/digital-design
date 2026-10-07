// Copyright © 2026 Christopher Snow

// Module 11, programming and debugging: the programs the lessons run and the challenges grade, in
// the course's assembly (docs/isa.md). Each is checked on the reference by module11.test.ts and by
// each lesson's facts test, which pin the numbers the prose states.
//
// The shop's logs are `word` data: `count`, how many readings; `limit`, the warm limit; `log`, the
// readings, oldest first, in tenths of a degree. A challenge's tests add a log after the learner's
// program; a figure's program carries its own.

/** A log as the data lines a test adds after a program. */
export function logData(readings: readonly number[], limit?: number): string {
  const lines = [`count: word ${readings.length}`];
  if (limit !== undefined) lines.push(`limit: word ${limit}`);
  lines.push(readings.length ? `log: word ${readings.join(", ")}` : "log: word 0");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------------------------
// 11.1 assembly

/** Room A against its limit: ALARM when warmer, and its reading on the display. */
export const ROOM_A_LIMIT = `// Room A's reading against its limit, -18.0 degrees.
      R2 <= word[sensorA]
      R3 <= -180
      if R2 < R3 signed goto fine   // colder than the limit: no alarm
      R4 <= 1
      word[lamps] <= R4             // ALARM on
fine: word[display] <= R2
      stop`;

/** The same program with four mistakes the assembler refuses. */
export const ROOM_A_MISTAKES = `// Room A's reading against its limit, -18.0 degrees.
      R2 <= word[sensorA]
      R3 <= -18000
      if R2 < R3 goto fine
      R4 <= 1
      word[lamps] <= R4
fine: word[dispaly] <= R2
      stop`;

export const WARMER_START = `// Show the warmer room's reading on the display.
R2 <= word[sensorA]
R3 <= word[sensorB]
word[display] <= R2
stop`;

export const WARMER_REFERENCE = `// Show the warmer room's reading on the display.
      R2 <= word[sensorA]
      R3 <= word[sensorB]
      if R3 < R2 signed goto show   // room A is warmer: show it
      R2 <= R3                      // otherwise show room B's
show: word[display] <= R2
      stop`;

/** Room A against a limit kept as data after the program: the explanation's listing. */
export const LIMIT_AS_DATA = `       R2 <= word[sensorA]
       R3 <= word[limit]
       if R2 < R3 signed goto fine
       R4 <= 1
       word[lamps] <= R4
fine:  word[display] <= R2
       stop
limit: word -180`;

/** The program the second challenge assembles by hand. */
export const BE_THE_ASSEMBLER = `       R1 <= word[limit]
       R2 <= word[sensorB]
       if R2 < R1 signed goto cold
       R3 <= 1
       word[lamps] <= R3
cold:  stop
limit: word -200`;

// ---------------------------------------------------------------------------------------------
// 11.2 lists

export const DAY_LOG = [-184, -190, -176, -181, -172, -188] as const;

/** How many readings of the log are warmer than -180. */
export const COUNT_WARMER = `// How many of the log's readings are warmer than -180?
       R1 <= log            // the address of the next reading
       R2 <= word[count]    // how many readings are left
       R3 <= 0              // how many were warmer
       R4 <= -180           // the limit
       R0 <= 0
next:  if R2 == R0 goto done
       R5 <= word[R1]
       if R4 >= R5 signed goto skip   // not warmer than the limit
       R3 <= R3 + 1
skip:  R1 <= R1 + 8
       R2 <= R2 - 1
       goto next
done:  word[display] <= R3
       stop
${logData(DAY_LOG)}`;

/** A log with defrost readings above 0, for signed and unsigned compared. */
export const DEFROST_LOG = [-184, 35, -176, 12, -190] as const;

export const countWarmerOn = (log: readonly number[], reading: "signed" | "unsigned") =>
  COUNT_WARMER.replace(`${logData(DAY_LOG)}`, logData(log)).replace(
    "if R4 >= R5 signed",
    `if R4 >= R5 ${reading}`,
  );

export const FIRST_WARMER_START = `// Show the position of the first reading warmer than the limit, or 0.
// The tests add count, limit and log after your program.
       R4 <= 0
       word[display] <= R4
       stop`;

export const FIRST_WARMER_REFERENCE = `// Show the position of the first reading warmer than the limit, or 0.
       R1 <= log            // the address of the next reading
       R2 <= word[count]    // how many readings are left
       R3 <= word[limit]
       R4 <= 0              // the position of the reading
       R0 <= 0
next:  if R2 == R0 goto none
       R4 <= R4 + 1
       R5 <= word[R1]
       if R3 < R5 signed goto found
       R1 <= R1 + 8
       R2 <= R2 - 1
       goto next
none:  R4 <= 0
found: word[display] <= R4
       stop`;

export const RISE_START = `// Show the largest rise from one reading to the next.
// The tests add count and log after your program.
       R3 <= 0
       word[display] <= R3
       stop`;

export const RISE_REFERENCE = `// Show the largest rise from one reading to the next.
         R1 <= log
         R2 <= word[count]
         R2 <= R2 - 1          // how many pairs are left
         R0 <= 0
         R5 <= word[R1]        // the earlier reading of the pair
         R6 <= word[R1 + 8]
         R3 <= R6 - R5         // the largest rise so far: the first pair's
next:    if R2 == R0 goto done
         R6 <= word[R1 + 8]    // the later reading
         R7 <= R6 - R5         // this pair's rise
         if R7 < R3 signed goto smaller
         R3 <= R7
smaller: R5 <= R6
         R1 <= R1 + 8
         R2 <= R2 - 1
         goto next
done:    word[display] <= R3
         stop`;

// ---------------------------------------------------------------------------------------------
// 11.3 functions

export const ABOVE = `// above: how far a reading is above a limit, or 0.
// R1: the reading. R2: the limit. The result in R1.
above: if R2 < R1 signed goto over
       R1 <= 0
       goto R15
over:  R1 <= R1 - R2
       goto R15`;

const TWO_ROOMS_MAIN = `// Room A's amount above -180 on the display; ALARM if room B is above -200.
       R1 <= word[sensorA]
       R2 <= -180
       call above, R15
       word[display] <= R1
       R1 <= word[sensorB]
       R2 <= -200
       call above, R15
       R0 <= 0
       if R1 == R0 goto done
       R3 <= 1
       word[lamps] <= R3
done:  stop`;

export const TWO_ROOMS = `${TWO_ROOMS_MAIN}
${ABOVE}`;

/** The same work with the check written out twice. */
export const TWO_ROOMS_WRITTEN_TWICE = `// The same work, with the check written out twice.
       R1 <= word[sensorA]
       R2 <= -180
       if R2 < R1 signed goto overA
       R1 <= 0
       goto showA
overA: R1 <= R1 - R2
showA: word[display] <= R1
       R1 <= word[sensorB]
       R2 <= -200
       if R2 < R1 signed goto overB
       R1 <= 0
       goto doneB
overB: R1 <= R1 - R2
doneB: R0 <= 0
       if R1 == R0 goto done
       R3 <= 1
       word[lamps] <= R3
done:  stop`;

/** A caller that keeps room A's amount in R10 through a call that changes R10. */
export const KEEPS_R10 = `// Room A's and room B's amounts above their limits, added, on the display.
       R1 <= word[sensorA]
       R2 <= -180
       call above, R15
       R10 <= R1            // room A's amount, kept through the next call
       R1 <= word[sensorB]
       R2 <= -200
       call above, R15
       R1 <= R1 + R10
       word[display] <= R1
       stop
${ABOVE}`;

export const KEEPS_R10_BROKEN = KEEPS_R10.replace(
  "over:  R1 <= R1 - R2\n       goto R15",
  "over:  R10 <= R1 - R2       // R10 used as a spare register\n       R1 <= R10\n       goto R15",
);

export const ABOVE_START = `${TWO_ROOMS_MAIN}

// above: how far a reading is above a limit, or 0.
// R1: the reading. R2: the limit. The result in R1.
above: R1 <= 0
       goto R15`;

export const ABOVE_REFERENCE = TWO_ROOMS;

// ---------------------------------------------------------------------------------------------
// 11.4 the stack

const TOTAL_MAIN = `// Both rooms' amounts above their limits, added, on the display.
        R14 <= 0x7C0         // the stack starts at the top of the RAM
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call total, R15
        word[display] <= R1
        stop`;

const TOTAL_BODY = `// total: R1 room A's reading, R2 room B's. The result in R1:
// how far both are above their limits, added.
total:  R14 <= R14 - 8
        word[R14] <= R15     // push R15
        R14 <= R14 - 8
        word[R14] <= R10     // push R10
        R10 <= R2            // keep room B's reading through the first call
        R2 <= -180
        call above, R15
        R5 <= R10
        R10 <= R1            // keep room A's amount through the second call
        R1 <= R5
        R2 <= -200
        call above, R15
        R1 <= R1 + R10
        R10 <= word[R14]     // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]     // pop R15
        R14 <= R14 + 8
        goto R15`;

export const TOTAL = `${TOTAL_MAIN}
${TOTAL_BODY}
${ABOVE}`;

/** `total` with no stack: the second call overwrites R15, and the return goes round for ever. */
export const TOTAL_NO_STACK = `// Both rooms' amounts above their limits, added, on the display.
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call total, R15
        word[display] <= R1
        stop
// total: R1 room A's reading, R2 room B's. The result in R1.
total:  R10 <= R2
        R2 <= -180
        call above, R15
        R5 <= R10
        R10 <= R1
        R1 <= R5
        R2 <= -200
        call above, R15
        R1 <= R1 + R10
        goto R15
${ABOVE}`;

/** `total` with the stack, but the program never sets R14. */
export const TOTAL_NO_START = TOTAL.replace(
  "        R14 <= 0x7C0         // the stack starts at the top of the RAM\n",
  "",
);

export const BOTH_START = `// How many rooms are above their limits: 0, 1 or 2.
        R14 <= 0x7C0
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call both, R15
        word[display] <= R1
        stop
// both: R1 room A's reading, R2 room B's.
// The result in R1: how many rooms are above their limits.
both:   R1 <= 0
        goto R15
${ABOVE}`;

export const BOTH_REFERENCE = `// How many rooms are above their limits: 0, 1 or 2.
        R14 <= 0x7C0
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call both, R15
        word[display] <= R1
        stop
// both: R1 room A's reading, R2 room B's.
// The result in R1: how many rooms are above their limits.
both:   R14 <= R14 - 8
        word[R14] <= R15     // push R15
        R14 <= R14 - 8
        word[R14] <= R10     // push R10
        R14 <= R14 - 8
        word[R14] <= R11     // push R11
        R11 <= R2            // room B's reading, kept
        R10 <= 0             // how many rooms are above, kept
        R0 <= 0
        R2 <= -180
        call above, R15
        if R1 == R0 goto roomB
        R10 <= R10 + 1
roomB:  R1 <= R11
        R2 <= -200
        call above, R15
        if R1 == R0 goto done
        R10 <= R10 + 1
done:   R1 <= R10
        R11 <= word[R14]     // pop R11
        R14 <= R14 + 8
        R10 <= word[R14]     // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]     // pop R15
        R14 <= R14 + 8
        goto R15
${ABOVE}`;

// ---------------------------------------------------------------------------------------------
// 11.5 recursion

const NEWEST_BODY = `// newest: R1 the address of a list, R2 how many readings it has.
// Shows the list's readings on the display, newest first.
newest: R0 <= 0
        if R2 == R0 goto none   // an empty list: nothing to show
        R14 <= R14 - 8
        word[R14] <= R15        // push R15
        R14 <= R14 - 8
        word[R14] <= R1         // push this reading's address
        R1 <= R1 + 8
        R2 <= R2 - 1
        call newest, R15        // the rest of the list, newest first
        R1 <= word[R14]         // pop this reading's address
        R14 <= R14 + 8
        R15 <= word[R14]        // pop R15
        R14 <= R14 + 8
        R5 <= word[R1]
        word[display] <= R5     // then this reading
none:   goto R15`;

export const NEWEST_MAIN = `// The log's readings on the display, newest first.
        R14 <= 0x7C0
        R1 <= log
        R2 <= word[count]
        call newest, R15
        stop`;

export const SHORT_LOG = [-184, -190, -176, -181] as const;

export const newestOn = (log: readonly number[]) => `${NEWEST_MAIN}
${NEWEST_BODY}
${logData(log)}`;

export const NEWEST = newestOn(SHORT_LOG);

/** `newest` without its last case: it calls itself until the stack reaches the ROM. */
export const NEWEST_NO_LAST_CASE = NEWEST.replace(
  "        if R2 == R0 goto none   // an empty list: nothing to show\n",
  "",
);

export const COLDER_START = `// The log's readings colder than the limit, newest first.
        R14 <= 0x7C0
        R1 <= log
        R2 <= word[count]
        R3 <= word[limit]
        call colder, R15
        stop
// colder: R1 the address of a list, R2 how many readings, R3 the limit.
// Shows the list's readings colder than the limit, newest first.
colder: goto R15`;

export const COLDER_REFERENCE = `// The log's readings colder than the limit, newest first.
        R14 <= 0x7C0
        R1 <= log
        R2 <= word[count]
        R3 <= word[limit]
        call colder, R15
        stop
// colder: R1 the address of a list, R2 how many readings, R3 the limit.
// Shows the list's readings colder than the limit, newest first.
colder: R0 <= 0
        if R2 == R0 goto none
        R14 <= R14 - 8
        word[R14] <= R15
        R14 <= R14 - 8
        word[R14] <= R1
        R1 <= R1 + 8
        R2 <= R2 - 1
        call colder, R15
        R1 <= word[R14]
        R14 <= R14 + 8
        R15 <= word[R14]
        R14 <= R14 + 8
        R5 <= word[R1]
        if R5 >= R3 signed goto none
        word[display] <= R5
none:   goto R15`;

// ---------------------------------------------------------------------------------------------
// 11.6 debugging

/** The count of warm readings, with its count one short: the last reading is never read. */
export const OFF_BY_ONE = `// How many of the log's readings are warmer than the limit?
       R1 <= log
       R2 <= word[count]
       R2 <= R2 - 1         // the readings are numbered from 0
       R3 <= 0
       R4 <= word[limit]
       R0 <= 0
next:  if R2 == R0 goto done
       R5 <= word[R1]
       if R4 >= R5 signed goto skip
       R3 <= R3 + 1
skip:  R1 <= R1 + 8
       R2 <= R2 - 1
       goto next
done:  word[display] <= R3
       stop`;

export const OFF_BY_ONE_MENDED = OFF_BY_ONE.replace(
  "       R2 <= R2 - 1         // the readings are numbered from 0\n",
  "",
);

/** `total` with its push and pop of R15 forgotten, and an unsigned comparison in `above`. */
export const TWO_MISTAKES = TOTAL.replace(
  "total:  R14 <= R14 - 8\n        word[R14] <= R15     // push R15\n        R14 <= R14 - 8",
  "total:  R14 <= R14 - 8",
)
  .replace("        R15 <= word[R14]     // pop R15\n        R14 <= R14 + 8\n", "")
  .replace("above: if R2 < R1 signed goto over", "above: if R2 < R1 unsigned goto over");

export const TWO_MISTAKES_MENDED = TOTAL;

/** The stack started at the RAM's first word, not past its last: the first push reaches the ROM. */
export const STACK_IN_ROM = TOTAL.replace(
  "        R14 <= 0x7C0         // the stack starts at the top of the RAM",
  "        R14 <= 0x400         // the stack starts in the RAM",
);
