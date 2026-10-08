// Copyright © 2026 Christopher Snow

// Module 13: programs that use the two instructions the learner added, on the final machine, each
// with the shop's inputs. The final machine runs them against the reference with Module 13's
// options (final.test.ts), with Module 12's trap programs and Module 8's suite.

import type { MachineInputs } from "./machine";

export interface FinalProgram {
  readonly label: string;
  readonly source: string;
  readonly inputs?: Partial<MachineInputs>;
  readonly door?: number;
}

export const FINAL_PROGRAMS: readonly FinalProgram[] = [
  {
    label: "set if on every condition, and a call through a register",
    inputs: { sensorA: -184n, sensorB: -250n },
    source: `R1 <= word[sensorA]
R2 <= word[sensorB]
R3 <= R1 < R2 signed
R4 <= R2 < R1 signed
R5 <= R1 == R1
R6 <= R1 != R1
R7 <= R1 < R2 unsigned
R8 <= R1 >= R2 unsigned
R9 <= R2 >= R1 signed
R10 <= show
call R10, R15
word[lamps] <= R4
stop
show: word[display] <= R4
R11 <= R11 ^ R11
goto R15`,
  },
  {
    label: "a call through a register with a constant, in user mode, and a system call",
    source: `R1 <= handler
C4 <= R1
R1 <= 0
C1 <= R1
R1 <= user
C2 <= R1
resume
handler: R9 <= C3
R10 <= C2
word[display] <= R1
stop
user: R2 <= table
call R2 + 8, R15
R1 <= R1 + 1
call system
table: nothing
nothing
R1 <= 40
goto R15`,
  },
  {
    label: "a call through a register to an address not a multiple of 4: the fetch traps",
    source: `R1 <= handler
C4 <= R1
R2 <= 0x102
call R2 + 1, R15
stop
handler: R3 <= C3
R4 <= C2
R5 <= R15
stop`,
  },
  {
    label: "set if with a job it does not define, and kind B: both illegal",
    source: `R1 <= handler
C4 <= R1
R2 <= 0
word[0x400] <= R2
R2 <= 5
R9 <= setEight
goto R9
back: word[display] <= R2
stop
handler: R3 <= C3
R4 <= C2
R5 <= R4 + 8
R6 <= word[0x400]
R6 <= R6 + 1
word[0x400] <= R6
R7 <= 2
if R6 == R7 goto done
R4 <= kindB
C2 <= R4
resume
done: R8 <= back
C2 <= R8
resume
setEight: word 0xA8123000
kindB: word 0xB0123000`,
  },
  {
    label: "set if counting the colder rooms, interrupted by the timer",
    inputs: { sensorA: -250n, sensorB: -300n },
    source: `R1 <= handler
C4 <= R1
R1 <= 3
word[timer] <= R1
R1 <= 3
C0 <= R1
R1 <= -200
R2 <= word[sensorA]
R3 <= word[sensorB]
R5 <= R2 < R1 signed
R6 <= R3 < R1 signed
R4 <= R5 + R6
word[display] <= R4
stop
handler: R9 <= C3
R8 <= 1
word[waiting] <= R8
resume`,
  },
];
