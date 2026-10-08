// Copyright © 2026 Christopher Snow

// Module 12: the machine of several edges with its trap hardware, against the reference with
// Module 12's options, step by step: on Module 8's suite (no handler, so every trap halts, as in
// Module 9's machine), and on programs that trap to a handler, drop to user mode, make system
// calls and take interrupts.

import { describe, expect, it } from "vitest";

import { stuckAt } from "./faults";
import { machineSuite } from "./machine-suite";
import { QUIET_INPUTS } from "./machine";
import { trapsCircuit } from "./traps";
import { compareTraps } from "./traps-run";

/** Programs that use the trap hardware, each with the shop's inputs. */
export const TRAP_PROGRAMS: readonly {
  readonly label: string;
  readonly source: string;
  readonly door?: number;
}[] = [
  {
    label: "a fault skipped by the handler",
    source: `R1 <= handler
C4 <= R1
R2 <= 7
word[sensorA] <= R2
word[display] <= R2
stop
handler: R5 <= C2
R5 <= R5 + 4
C2 <= R5
R6 <= C3
word[lamps] <= R6
resume`,
  },
  {
    label: "a system call and every control register read and written",
    source: `R1 <= handler
C4 <= R1
R1 <= 2
C1 <= R1
R1 <= 0x123
C2 <= R1
R1 <= 0x5A
C3 <= R1
R1 <= C1
R2 <= C2
R3 <= C3
R4 <= C4
R5 <= C0
R1 <= 1
call system
word[display] <= R1
stop
handler: R1 <= C3
R7 <= C2
resume`,
  },
  {
    label: "user mode refusing a device, stop, and a control register",
    source: `R1 <= handler
C4 <= R1
R1 <= 0
word[0x400] <= R1
C1 <= R1
R1 <= user
C2 <= R1
resume
handler: R9 <= C3
R8 <= word[0x400]
R8 <= R8 + R9
word[0x400] <= R8
R7 <= C2
R7 <= R7 + 4
C2 <= R7
R6 <= C1
R6 <= R6 + 1
R5 <= 3
if R8 == R5 goto done
resume
done: stop
user: R2 <= word[sensorA]
R3 <= 9
stop
R4 <= C0
word[0x408] <= R3
call system`,
  },
  {
    label: "the timer's interrupt, cleared, and the program carrying on",
    source: `R1 <= handler
C4 <= R1
R1 <= 0
word[0x400] <= R1
R1 <= 4
word[timer] <= R1
R1 <= 2
C1 <= R1
R1 <= user
C2 <= R1
resume
handler: word[0x408] <= R1
R1 <= word[0x400]
R1 <= R1 + 1
word[0x400] <= R1
R1 <= 1
word[waiting] <= R1
R1 <= word[0x408]
resume
user: R2 <= 0
R3 <= 12
loop: R2 <= R2 + 1
if R2 != R3 goto loop
call system`,
  },
  {
    label: "the door opening, and an interrupt left waiting while interrupts are off",
    door: 5,
    source: `R1 <= handler
C4 <= R1
R2 <= 0
R2 <= R2 + 1
R2 <= R2 + 1
R2 <= R2 + 1
R2 <= R2 + 1
R2 <= R2 + 1
R1 <= 2
C0 <= R1
R2 <= R2 + 1
stop
handler: R3 <= C3
word[display] <= R3
stop`,
  },
  {
    label: "a fault inside the handler, which overwrites C1 and C2",
    source: `R1 <= handler
C4 <= R1
R1 <= 0
C1 <= R1
R1 <= user
C2 <= R1
resume
handler: R9 <= C3
R10 <= C2
R11 <= C1
R8 <= 0x401
R1 <= word[R8]
R12 <= C2
stop
user: call system`,
  },
  {
    label: "a jump to a bad address: the fetch traps with the new PC as the return point",
    source: `R1 <= handler
C4 <= R1
R1 <= 0x7FE
goto R1
handler: R2 <= C2
R3 <= C3
stop`,
  },
];

describe("Module 12's machine against the reference", () => {
  for (const c of machineSuite(1, 1)) {
    it(`no handler, ${c.group}: ${c.label}`, () => {
      const result = compareTraps(c.source, c.inputs);
      expect(result.differences).toEqual([]);
    }, 60_000);
  }

  for (const p of TRAP_PROGRAMS)
    it(
      p.label,
      () => {
        const result = compareTraps(p.source, {
          ...QUIET_INPUTS,
          ...(p.door !== undefined ? { doorOpensAt: p.door } : {}),
        });
        expect(result.differences).toEqual([]);
        expect(result.edges.some((e) => e.trap !== undefined)).toBe(true);
      },
      60_000,
    );

  it("call system traps at its READ edge, and the system jobs 1 to 3 take three", () => {
    const result = compareTraps(TRAP_PROGRAMS[1]!.source);
    expect(result.edges.filter((e) => e.trap !== undefined).map((e) => e.edges)).toEqual([2]);
    expect(
      result.edges.filter((e) => e.kind === 8 && e.job! >= 1 && e.job! <= 3).map((e) => e.edges),
    ).toEqual(Array(12).fill(3));
  }, 60_000);
});

describe("Module 12's machine with a part of its trap hardware broken", () => {
  const broken = (net: string, value: 0 | 1) =>
    compareTraps(TRAP_PROGRAMS[0]!.source, QUIET_INPUTS, 400, (rom) =>
      stuckAt(net, value).apply(trapsCircuit({ rom })),
    ).differences;
  it("fails when no edge traps", () => {
    expect(broken("control/TRAP", 0)).not.toEqual([]);
  });
  it("fails when C2 never takes the return point", () => {
    expect(broken("control/CWEN", 0)).not.toEqual([]);
  });
});
