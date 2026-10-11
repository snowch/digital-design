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
