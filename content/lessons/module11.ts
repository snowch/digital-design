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

/**
 * overBy: how far a reading is above a limit, or 0. It works in R5, a free register, as the
 * convention allows, so a caller that keeps a word in R5 through a call loses it.
 */
export const OVER_BY = `// overBy: how far a reading is above a limit, or 0.
// R1: the reading. R2: the limit. The result in R1.
overBy: R5 <= R1 - R2
        R0 <= 0
        if R0 < R5 signed goto over
        R5 <= 0
over:   R1 <= R5
        goto R15`;

const TWO_ROOMS_MAIN = `// Room A's amount above -180 on the display; ALARM if room B is above -200.
        R1 <= word[sensorA]
        R2 <= -180
        call overBy, R15
        word[display] <= R1
        R1 <= word[sensorB]
        R2 <= -200
        call overBy, R15
        R0 <= 0
        if R1 == R0 goto done
        R3 <= 1
        word[lamps] <= R3
done:   stop`;

export const TWO_ROOMS = `${TWO_ROOMS_MAIN}
${OVER_BY}`;

/** The same work with the check written out twice. */
export const TWO_ROOMS_WRITTEN_TWICE = `// The same work, with the check written out twice.
        R1 <= word[sensorA]
        R2 <= -180
        R5 <= R1 - R2
        R0 <= 0
        if R0 < R5 signed goto showA
        R5 <= 0
showA:  word[display] <= R5
        R1 <= word[sensorB]
        R2 <= -200
        R5 <= R1 - R2
        if R0 < R5 signed goto alarm
        goto done
alarm:  R3 <= 1
        word[lamps] <= R3
done:   stop`;

/** The construction: the caller's side, the larger of the two rooms' amounts. */
export const LARGER_START = `// The larger of room A's amount above -180 and room B's above -200.
        R1 <= word[sensorA]
        R2 <= -180
        call overBy, R15
        word[display] <= R1
        stop
${OVER_BY}`;

export const LARGER_REFERENCE = `// The larger of room A's amount above -180 and room B's above -200.
        R1 <= word[sensorA]
        R2 <= -180
        call overBy, R15
        R10 <= R1            // room A's amount, kept through the next call
        R1 <= word[sensorB]
        R2 <= -200
        call overBy, R15
        if R10 < R1 signed goto show
        R1 <= R10
show:   word[display] <= R1
        stop
${OVER_BY}`;

/** A caller that keeps room A's amount in R10 through a call. */
export const KEEPS_R10 = `// Room A's and room B's amounts above their limits, added, on the display.
        R1 <= word[sensorA]
        R2 <= -180
        call overBy, R15
        R10 <= R1            // room A's amount, kept through the next call
        R1 <= word[sensorB]
        R2 <= -200
        call overBy, R15
        R1 <= R1 + R10
        word[display] <= R1
        stop
${OVER_BY}`;

/** overBy working in R10, a kept register, and not putting it back. */
export const KEEPS_R10_BROKEN = KEEPS_R10.replaceAll("R5", "R10");

/** The challenge: a function of the learner's own, three arguments. */
const RANGE_MAIN = `// The fridge's reading against its range, 20 to 50 (2.0 to 5.0 degrees):
// how far outside it is on the display, and ALARM if it is outside at all.
        R1 <= word[sensorA]
        R2 <= 20
        R3 <= 50
        call outOfRange, R15
        word[display] <= R1
        R0 <= 0
        if R1 == R0 goto done
        R4 <= 1
        word[lamps] <= R4
done:   stop`;

export const RANGE_START = `${RANGE_MAIN}

// outOfRange: R1 a reading, R2 the range's low end, R3 its high end.
// The result in R1: how far the reading is outside the range, or 0.
outOfRange: R1 <= 0
        goto R15`;

export const RANGE_REFERENCE = `${RANGE_MAIN}

// outOfRange: R1 a reading, R2 the range's low end, R3 its high end.
// The result in R1: how far the reading is outside the range, or 0.
outOfRange: if R1 < R2 signed goto below
        if R3 < R1 signed goto above
        R1 <= 0
        goto R15
below:  R1 <= R2 - R1
        goto R15
above:  R1 <= R1 - R3
        goto R15`;

// ---------------------------------------------------------------------------------------------
// 11.4 the stack

const SUM_MAIN = `// Both rooms' amounts above their limits, added, on the display;
// ALARM if the sum is not 0. R10 keeps ALARM's bit through the call.
        R14 <= 0x7C0         // the stack starts at the top of the RAM
        R10 <= 1             // ALARM's bit
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call sumOver, R15
        word[display] <= R1
        R0 <= 0
        if R1 == R0 goto done
        word[lamps] <= R10
done:   stop`;

const SUM_BODY = `// sumOver: R1 room A's reading, R2 room B's. The result in R1:
// how far both are above their limits, added.
sumOver: R14 <= R14 - 8
        word[R14] <= R15     // push R15
        R14 <= R14 - 8
        word[R14] <= R10     // push R10
        R10 <= R2            // keep room B's reading through the first call
        R2 <= -180
        call overBy, R15
        R6 <= R10
        R10 <= R1            // keep room A's amount through the second call
        R1 <= R6
        R2 <= -200
        call overBy, R15
        R1 <= R1 + R10
        R10 <= word[R14]     // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]     // pop R15
        R14 <= R14 + 8
        goto R15`;

export const SUM_OVER = `${SUM_MAIN}
${SUM_BODY}
${OVER_BY}`;

/** sumOver with no stack: the second call overwrites R15, and the return goes round for ever. */
export const SUM_NO_STACK = `// Both rooms' amounts above their limits, added, on the display.
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call sumOver, R15
        word[display] <= R1
        stop
// sumOver: R1 room A's reading, R2 room B's. The result in R1.
sumOver: R10 <= R2
        R2 <= -180
        call overBy, R15
        R6 <= R10
        R10 <= R1
        R1 <= R6
        R2 <= -200
        call overBy, R15
        R1 <= R1 + R10
        goto R15
${OVER_BY}`;

/** sumOver popping in the order it pushed: R15 takes R10's word, and R10 the return address. */
export const SUM_POPS_SWAPPED = SUM_OVER.replace(
  `        R10 <= word[R14]     // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]     // pop R15
        R14 <= R14 + 8`,
  `        R15 <= word[R14]     // pop R15
        R14 <= R14 + 8
        R10 <= word[R14]     // pop R10
        R14 <= R14 + 8`,
);

/** The construction: the stack's addresses in a program the lesson does not run. */
export const STACK_QUIZ = `// Both rooms' amounts above their limits, and how many rooms are above.
        R14 <= 0x7C0
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call check, R15
        word[display] <= R1
        stop
// check: R1 room A's reading, R2 room B's. Keeps R10, R11 and R12.
check:  R14 <= R14 - 8
        word[R14] <= R15
        R14 <= R14 - 8
        word[R14] <= R10
        R14 <= R14 - 8
        word[R14] <= R11
        R14 <= R14 - 8
        word[R14] <= R12
        R12 <= R2
        R2 <= -180
        call overBy, R15
        R10 <= R1
        R1 <= R12
        R2 <= -200
        call overBy, R15
        R1 <= R1 + R10
        R12 <= word[R14]
        R14 <= R14 + 8
        R11 <= word[R14]
        R14 <= R14 + 8
        R10 <= word[R14]
        R14 <= R14 + 8
        R15 <= word[R14]
        R14 <= R14 + 8
        goto R15
${OVER_BY}`;

const ROOMS_MAIN = `// How many rooms are above their limits: 0, 1 or 2.
        R14 <= 0x7C0
        R1 <= word[sensorA]
        R2 <= word[sensorB]
        call roomsOver, R15
        word[display] <= R1
        stop
// roomsOver: R1 room A's reading, R2 room B's.
// The result in R1: how many rooms are above their limits.`;

export const ROOMS_OVER_START = `${ROOMS_MAIN}
roomsOver: R1 <= 0
        goto R15
${OVER_BY}`;

export const ROOMS_OVER_REFERENCE = `${ROOMS_MAIN}
roomsOver: R14 <= R14 - 8
        word[R14] <= R15     // push R15
        R14 <= R14 - 8
        word[R14] <= R10     // push R10
        R14 <= R14 - 8
        word[R14] <= R11     // push R11
        R11 <= R2            // room B's reading, kept
        R10 <= 0             // how many rooms are above, kept
        R2 <= -180
        call overBy, R15
        R0 <= 0
        if R1 == R0 goto roomB
        R10 <= R10 + 1
roomB:  R1 <= R11
        R2 <= -200
        call overBy, R15
        R0 <= 0
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
${OVER_BY}`;

// ---------------------------------------------------------------------------------------------
// 11.5 recursion

/**
 * The cold store: each room is three words, its reading and the addresses of the rooms behind
 * its two doors (0 where a door leads nowhere). The hall opens onto the prep room and the store;
 * the store onto two chillers; the first chiller onto the deep freeze.
 */
export const COLD_STORE = `hall:   word -150, prep, store
prep:   word -175, 0, 0
store:  word -190, chillA, chillB
chillA: word -182, deep, 0
chillB: word -205, 0, 0
deep:   word -178, 0, 0`;

/** The same rooms with the deep freeze's door leading back to the store: a way round for ever. */
export const COLD_STORE_LOOP = COLD_STORE.replace(
  "deep:   word -178, 0, 0",
  "deep:   word -178, store, 0",
);

const WARM_ROOMS_BODY = `// warmRooms: R1 a room's address (0 for none), R2 the limit. The result in R1:
// how many rooms are warmer than the limit, this one and every room behind it.
warmRooms: R0 <= 0
        if R1 == R0 goto none   // no room behind this door
        R14 <= R14 - 8
        word[R14] <= R15        // push R15
        R14 <= R14 - 8
        word[R14] <= R10        // push R10
        R14 <= R14 - 8
        word[R14] <= R11        // push R11
        R14 <= R14 - 8
        word[R14] <= R12        // push R12
        R10 <= R1               // this room's address, kept
        R12 <= R2               // the limit, kept
        R11 <= 0                // how many are warmer, kept
        R5 <= word[R10]
        if R2 >= R5 signed goto doors
        R11 <= 1                // this room is warmer
doors:  R1 <= word[R10 + 8]     // the room behind the first door
        call warmRooms, R15
        R11 <= R11 + R1
        R1 <= word[R10 + 16]    // the room behind the second door
        R2 <= R12
        call warmRooms, R15
        R1 <= R1 + R11
        R12 <= word[R14]        // pop R12
        R14 <= R14 + 8
        R11 <= word[R14]        // pop R11
        R14 <= R14 + 8
        R10 <= word[R14]        // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]        // pop R15
        R14 <= R14 + 8
        goto R15
none:   R1 <= 0
        goto R15`;

export const WARM_ROOMS_MAIN = `// How many rooms of the cold store are warmer than -180, from the hall.
        R14 <= 0x7C0
        R1 <= hall
        R2 <= -180
        call warmRooms, R15
        word[display] <= R1
        stop`;

export const warmRoomsOn = (rooms: string) => `${WARM_ROOMS_MAIN}
${WARM_ROOMS_BODY}
${rooms}`;

export const WARM_ROOMS = warmRoomsOn(COLD_STORE);
export const WARM_ROOMS_LOOP = warmRoomsOn(COLD_STORE_LOOP);

/** The construction's rooms, which the lesson never runs: a longer way in. */
export const LONG_STORE = `hall:   word -150, lobby, 0
lobby:  word -160, coolA, coolB
coolA:  word -185, 0, ice
ice:    word -200, 0, 0
coolB:  word -188, frost, 0
frost:  word -192, blast, 0
blast:  word -230, 0, 0`;

const FARTHEST_MAIN = `// How many rooms deep the cold store goes from the hall. The tests add the rooms.
        R14 <= 0x7C0
        R1 <= hall
        call farthest, R15
        word[display] <= R1
        stop
// farthest: R1 a room's address (0 for none). The result in R1: how many rooms
// lie on the longest way in from this room, counting this one; 0 for none.`;

export const FARTHEST_START = `${FARTHEST_MAIN}
farthest: R1 <= 0
        goto R15`;

export const FARTHEST_REFERENCE = `${FARTHEST_MAIN}
farthest: R0 <= 0
        if R1 == R0 goto none
        R14 <= R14 - 8
        word[R14] <= R15        // push R15
        R14 <= R14 - 8
        word[R14] <= R10        // push R10
        R14 <= R14 - 8
        word[R14] <= R11        // push R11
        R10 <= R1               // this room's address, kept
        R1 <= word[R10 + 8]
        call farthest, R15
        R11 <= R1               // how deep the first door goes, kept
        R1 <= word[R10 + 16]
        call farthest, R15
        if R11 < R1 signed goto deeper
        R1 <= R11
deeper: R1 <= R1 + 1            // this room too
        R11 <= word[R14]        // pop R11
        R14 <= R14 + 8
        R10 <= word[R14]        // pop R10
        R14 <= R14 + 8
        R15 <= word[R14]        // pop R15
        R14 <= R14 + 8
        goto R15
none:   R1 <= 0
        goto R15`;

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

/**
 * The second challenge: the readings above the limit counted with overBy. Two mistakes the
 * module has not shown: the count read as the address of `count`, not the word there, and the
 * list stepped by 4 where a word takes 8.
 */
export const COUNT_OVER_REFERENCE = `// How many of the log's readings are above the limit, counted with overBy.
        R10 <= log           // the address of the next reading
        R11 <= word[count]   // how many readings are left
        R12 <= word[limit]
        R13 <= 0             // how many are above
        R0 <= 0
next:   if R11 == R0 goto done
        R1 <= word[R10]
        R2 <= R12
        call overBy, R15
        R0 <= 0
        if R1 == R0 goto skip
        R13 <= R13 + 1
skip:   R10 <= R10 + 8
        R11 <= R11 - 1
        goto next
done:   word[display] <= R13
        stop
${OVER_BY}`;

export const COUNT_OVER_MISTAKES = COUNT_OVER_REFERENCE.replace(
  "R11 <= word[count]   // how many readings are left",
  "R11 <= count        // how many readings are left",
).replace("skip:   R10 <= R10 + 8", "skip:   R10 <= R10 + 4");

/** The stack started at the RAM's first word, not past its last: the first push reaches the ROM. */
export const STACK_IN_ROM = SUM_OVER.replace(
  "        R14 <= 0x7C0         // the stack starts at the top of the RAM",
  "        R14 <= 0x400         // the stack starts in the RAM",
);

// ---------------------------------------------------------------------------------------------
// 11.7 the day's report (the capstone)

const REPORT_MAIN = `// The day's report on the log the tests add: count, limit and log.
        R14 <= 0x7C0
        R1 <= log
        R2 <= word[count]
        call lowestOf, R15
        word[0x400] <= R1       // the lowest reading
        R1 <= log
        R2 <= word[count]
        call highestOf, R15
        word[0x408] <= R1       // the highest reading
        R1 <= log
        R2 <= word[count]
        R3 <= word[limit]
        call warmCount, R15
        word[display] <= R1     // how many are warmer than the limit
        R0 <= 0
        if R1 == R0 goto quiet
        R4 <= 1
        word[lamps] <= R4       // ALARM
quiet:  stop`;

/** The worked function the guided start gives whole. */
export const LOWEST = `// lowestOf: R1 the address of a list, R2 how many readings.
// The lowest reading in R1, or 0 for an empty list.
lowestOf: R0 <= 0
          if R2 == R0 goto lowNone
          R5 <= word[R1]        // the lowest so far: the first reading
lowNext:  R1 <= R1 + 8
          R2 <= R2 - 1
          if R2 == R0 goto lowDone
          R6 <= word[R1]
          if R5 < R6 signed goto lowNext
          R5 <= R6
          goto lowNext
lowDone:  R1 <= R5
          goto R15
lowNone:  R1 <= 0
          goto R15`;

const HIGHEST = `// highestOf: R1 the address of a list, R2 how many readings.
// The highest reading in R1, or 0 for an empty list.
highestOf: R0 <= 0
          if R2 == R0 goto highNone
          R5 <= word[R1]        // the highest so far: the first reading
highNext: R1 <= R1 + 8
          R2 <= R2 - 1
          if R2 == R0 goto highDone
          R6 <= word[R1]
          if R6 < R5 signed goto highNext
          R5 <= R6
          goto highNext
highDone: R1 <= R5
          goto R15
highNone: R1 <= 0
          goto R15`;

const WARMER = `// warmCount: R1 the address of a list, R2 how many readings, R3 the limit.
// How many readings are warmer than the limit, in R1.
warmCount: R0 <= 0
          R5 <= 0               // how many so far
warmNext: if R2 == R0 goto warmDone
          R6 <= word[R1]
          if R3 >= R6 signed goto warmSkip
          R5 <= R5 + 1
warmSkip: R1 <= R1 + 8
          R2 <= R2 - 1
          goto warmNext
warmDone: R1 <= R5
          goto R15`;

export const REPORT_REFERENCE = `${REPORT_MAIN}

${LOWEST}

${HIGHEST}

${WARMER}`;

/** The guided start: the main program and lowestOf whole, highestOf and warmCount to write. */
export const REPORT_SKELETON = `${REPORT_MAIN}

${LOWEST}

// highestOf: R1 the address of a list, R2 how many readings.
// The highest reading in R1, or 0 for an empty list.
highestOf: R1 <= 0
          goto R15

// warmCount: R1 the address of a list, R2 how many readings, R3 the limit.
// How many readings are warmer than the limit, in R1.
warmCount: R1 <= 0
          goto R15`;

/** The empty start: the requirements as comments. */
export const REPORT_EMPTY = `// The day's report. The tests add count, limit and log after this program.
// Write lowestOf, highestOf and warmCount (R1 the list's address, R2 its count,
// R3 the limit for warmCount; each result in R1), and a main program that
// shows the report: the display, ALARM, and the words at 400 and 408.
`;

/** A report whose highestOf starts its highest so far at 0: wrong on any log below 0. */
export const REPORT_HIGHEST_FROM_ZERO = REPORT_REFERENCE.replace(
  "          R5 <= word[R1]        // the highest so far: the first reading",
  "          R5 <= 0               // the highest so far",
).replace(
  "highNext: R1 <= R1 + 8\n          R2 <= R2 - 1\n          if R2 == R0 goto highDone\n          R6 <= word[R1]",
  "highNext: if R2 == R0 goto highDone\n          R6 <= word[R1]\n          R1 <= R1 + 8\n          R2 <= R2 - 1",
);

/** The main program with lowestOf alone, for the worked function's figures. */
export const LOWEST_DEMO = (log: readonly number[]) => `// lowestOf on today's log.
        R1 <= log
        R2 <= word[count]
        call lowestOf, R15
        word[display] <= R1
        stop

${LOWEST}
${logData(log)}`;
