// Copyright © 2026 Christopher Snow

// Module 8: the instruction-level suite the datapath is tested against, in Module 7's manner
// (testcases.ts): normal, boundary, random with a seed, and adversarial. A case is a short program
// in docs/isa.md's assembly and the shop's inputs; the reference (machine.ts) runs it, the datapath
// runs it, and the two are compared after every instruction: the PC, every register, every byte
// of the RAM, the devices, and why the machine stopped. Every check that stops the machine has a
// case of its own, since a trap ends a program.

import { SeededRandom } from "@dd/sim";

import { CASE_GROUPS, type CaseGroup } from "./testcases";
import { MASK64, type MachineInputs } from "./machine";

export interface MachineCase {
  readonly group: CaseGroup | "stops";
  readonly label: string;
  readonly source: string;
  readonly inputs: MachineInputs;
}

const s64 = (n: bigint) => BigInt.asUintN(64, n);
const SHOP: MachineInputs = { door: 0, warm: 1, sensorA: s64(-184n), sensorB: s64(-250n) };

/** A word too wide for a constant, kept in the ROM after the program and loaded from there. */
function wordsAfter(values: readonly bigint[]): string[] {
  return values.map((v, k) => `w${k}: word ${BigInt.asIntN(64, v)}`);
}

const JOB_OPS: readonly [string, number][] = [
  ["&", 0],
  ["^", 1],
  ["+", 2],
  ["-", 3],
  ["|", 4],
];

/** Every job of kinds 1 and 2 on the words in R1 and R2, results into R3 to R10. */
function jobLines(c: number): string[] {
  return [
    ...JOB_OPS.map(([op], k) => `R${3 + k} <= R1 ${op} R2`),
    "R8 <= R2",
    "R9 <= R1 + 1",
    "R10 <= R1 - 1",
    ...JOB_OPS.map(([op], k) => `R${3 + k} <= R1 ${op} ${c}`),
    `R8 <= ${c}`,
  ];
}

/** Every branch condition between R1 and R2, each followed by a marker it skips when taken. */
function branchLines(tag: string): string[] {
  const conds = [
    "goto",
    "nothing",
    "if R1 == R2 goto",
    "if R1 != R2 goto",
    "if R1 < R2 unsigned goto",
    "if R1 >= R2 unsigned goto",
    "if R1 < R2 signed goto",
    "if R1 >= R2 signed goto",
  ];
  return conds.flatMap((c, k) =>
    c === "nothing"
      ? ["nothing", `R11 <= R11 + 1`]
      : [`${c} ${tag}${k}`, `R11 <= R11 + 1`, `${tag}${k}: R12 <= R12 + 1`],
  );
}

function normalCases(): MachineCase[] {
  const program = [
    "R1 <= 23",
    "R2 <= 9",
    ...jobLines(100),
    "R13 <= 0x400",
    "word[R13 + 8] <= R1",
    "byte[R13 + 17] <= R2",
    "R4 <= word[R13 + 8]",
    "R5 <= byte[R13 + 17]",
    "R6 <= word[sensorA]",
    "R7 <= word[sensorB]",
    "word[display] <= R6",
    "R8 <= word[signals]",
    "R11 <= 0",
    "R12 <= 0",
    ...branchLines("n"),
    "call sub, R15",
    "word[0x408] <= R14",
    "stop",
    "sub: R14 <= 300",
    "goto R15",
  ];
  return [
    {
      group: "normal",
      label: "every job, a load, a store and every branch on small words",
      source: program.join("\n"),
      inputs: SHOP,
    },
  ];
}

const TOP = 1n << 63n;
const PAIRS: readonly [string, bigint, bigint][] = [
  ["0 and 0", 0n, 0n],
  ["FFF...F and 1", MASK64, 1n],
  ["7FF...F and FFF...F", TOP - 1n, MASK64],
  ["800...0 and 1", TOP, 1n],
  ["7FF...F and 800...0", TOP - 1n, TOP],
  ["1 and 2", 1n, 2n],
];

function boundaryCases(): MachineCase[] {
  const cases: MachineCase[] = PAIRS.map(([name, a, b], k) => ({
    group: "boundary" as const,
    label: `A and B: ${name}`,
    source: [
      "R1 <= word[w0]",
      "R2 <= word[w1]",
      ...jobLines(k % 2 ? 2047 : -2048),
      "R11 <= 0",
      "R12 <= 0",
      ...branchLines("b"),
      "stop",
      ...wordsAfter([a, b]),
    ].join("\n"),
    inputs: SHOP,
  }));
  cases.push({
    group: "boundary",
    label: "the RAM's first and last words and its last byte; the timer from 1 to 0",
    source: [
      "R1 <= -1",
      "word[0x400] <= R1",
      "word[0x7B8] <= R1",
      "R2 <= 0x41",
      "byte[0x7BF] <= R2",
      "R3 <= word[0x400]",
      "R4 <= word[0x7B8]",
      "R5 <= byte[0x7BF]",
      "R6 <= byte[0x3FF]",
      "R7 <= word[0x3F8]",
      "R8 <= 1",
      "word[timer] <= R8",
      "nothing",
      "R9 <= word[waiting]",
      "R10 <= 1",
      "word[waiting] <= R10",
      "R11 <= word[waiting]",
      "R12 <= 7",
      "word[lamps] <= R12",
      "R13 <= word[lamps]",
      "stop",
    ].join("\n"),
    inputs: SHOP,
  });
  return cases;
}

function randomCases(seed: number, count: number): MachineCase[] {
  const rng = new SeededRandom(seed);
  const cases: MachineCase[] = [];
  for (let n = 0; n < count; n++) {
    const lines: string[] = [];
    for (let r = 1; r <= 12; r++) lines.push(`R${r} <= ${rng.int(-2048, 2047)}`);
    lines.push("R13 <= 0x400");
    for (let i = 0; i < 24; i++) {
      const y = rng.int(1, 12);
      const a = rng.int(1, 12);
      const b = rng.int(1, 12);
      const kind = rng.int(0, 5);
      if (kind === 0) {
        const [op] = JOB_OPS[rng.int(0, 4)] as [string, number];
        lines.push(`R${y} <= R${a} ${op} R${b}`);
      } else if (kind === 1) {
        const [op] = JOB_OPS[rng.int(0, 4)] as [string, number];
        lines.push(`R${y} <= R${a} ${op} ${rng.int(-2048, 2047)}`);
      } else if (kind === 2) {
        const at = 8 * rng.int(0, 119);
        lines.push(`word[R13 + ${at}] <= R${b}`, `R${y} <= word[R13 + ${at}]`);
      } else if (kind === 3) {
        const at = rng.int(0, 959);
        lines.push(`byte[R13 + ${at}] <= R${b}`, `R${y} <= byte[R13 + ${at}]`);
      } else if (kind === 4) {
        const conds = ["==", "!=", "< unsigned", ">= unsigned", "< signed", ">= signed"];
        const c = conds[rng.int(0, 5)] as string;
        const [op, reading] = c.split(" ");
        lines.push(
          `if R${a} ${op} R${b}${reading ? ` ${reading}` : ""} goto r${i}`,
          `R${y} <= R${y} + 1`,
          `r${i}: nothing`,
        );
      } else {
        lines.push(`R${y} <= R${a} ${rng.int(0, 1) ? "+" : "-"} 1`);
      }
    }
    lines.push("stop");
    cases.push({
      group: "random",
      label: `seed ${seed}, program ${n + 1}`,
      source: lines.join("\n"),
      inputs: SHOP,
    });
  }
  return cases;
}

function adversarialCases(): MachineCase[] {
  return [
    {
      group: "adversarial",
      label: "a carry through all 64 bits, and overflow at the signed limits",
      source: [
        "R1 <= -1",
        "R2 <= 1",
        "R3 <= R1 + R2",
        "R4 <= R1 + 1",
        "R5 <= word[w0]",
        "R6 <= R5 + 1",
        "R7 <= R6 - 1",
        "R11 <= 0",
        "R12 <= 0",
        // MINUS and OVER differ: A - B overflows, so the signed reading needs both.
        "R1 <= R6",
        "R2 <= 1",
        ...branchLines("v"),
        "stop",
        ...wordsAfter([TOP - 1n]),
      ].join("\n"),
      inputs: SHOP,
    },
    {
      group: "adversarial",
      label: "one register as A, B and Y; a word read back as bytes; a byte into a word",
      source: [
        "R1 <= 0x5A5",
        "R1 <= R1 + R1",
        "R1 <= R1 ^ R1",
        "R2 <= -1366",
        "R2 <= R2 - R2",
        "R3 <= 0x555",
        "R3 <= R3 | -2048",
        "R13 <= 0x7B0",
        "word[R13] <= R3",
        "R4 <= byte[R13 + 1]",
        "R5 <= byte[R13 + 7]",
        "R6 <= 0x7E",
        "byte[R13 + 3] <= R6",
        "R7 <= word[R13]",
        "R8 <= word[R13 - 8]",
        "R9 <= word[R13 + 8]",
        "stop",
      ].join("\n"),
      inputs: { ...SHOP, door: 1 },
    },
    {
      group: "adversarial",
      label: "a jump to an address worked out at run time, and a call that writes R0",
      source: [
        "R1 <= 12",
        "goto R1 + 4",
        "R2 <= 1",
        "R3 <= 2",
        "call last, R0",
        "stop",
        "last: R4 <= R0",
        "goto R0",
      ].join("\n"),
      inputs: SHOP,
    },
  ];
}

/** One case per check that stops the machine, and for `stop` and the system jobs. */
function stopCases(): MachineCase[] {
  const stop = (label: string, source: string): MachineCase => ({
    group: "stops",
    label,
    source,
    inputs: SHOP,
  });
  return [
    stop("stop", "R1 <= 5\nstop"),
    stop("a fetch outside the ROM (11)", "R1 <= 0x400\ngoto R1"),
    stop("a jump past every address (11)", "R1 <= -4\ngoto R1"),
    stop("a fetch not at a multiple of 4 (12)", "R1 <= 0x102\ngoto R1"),
    stop("an instruction of all zeros (21)", "R1 <= 5"),
    stop("job 8 of a register job (21)", "word 0\nR1 <= 1"),
    stop("a load with job 2 (21)", "byte 0, 0, 0, 0x32"),
    stop("a call with job 1 (21)", "byte 0, 0, 0, 0x61"),
    stop("kind 9 (21)", "byte 0, 0, 0, 0x90"),
    stop("a control register numbered 5, a job Module 12 builds", "byte 5, 0, 0, 0x82"),
    stop("a control register numbered -1, a job Module 12 builds", "byte 0xFF, 0x0F, 0, 0x83"),
    stop("call system (41)", "call system"),
    stop("resume, built in Module 12", "resume"),
    stop("a load past the memory (31)", "R1 <= 0x400\nR1 <= R1 + R1\nR2 <= word[R1]"),
    stop("a load at the address no device answers (31)", "R2 <= word[0x7F8]"),
    stop("an address with a high bit set (31)", "R1 <= -2048\nR2 <= word[R1 + 0]"),
    stop("a word not at a multiple of 8 (33)", "R2 <= word[0x404]"),
    stop("a byte at a device (33)", "R2 <= byte[0x7C0]"),
    stop("a store to the ROM (34)", "R1 <= 1\nword[0x10] <= R1"),
    stop("a byte stored to the ROM (34)", "R1 <= 1\nbyte[0x3FF] <= R1"),
    stop("a store to a sensor (34)", "R1 <= 1\nword[sensorA] <= R1"),
    stop("a word at 7F9: no memory wins over misaligned (31)", "R1 <= 1\nword[0x7F9] <= R1"),
    stop("a misaligned store to the ROM: misaligned wins (33)", "R1 <= 1\nword[0x0C] <= R1"),
  ];
}

/** The suite: every group, the random group drawn from `seed`. */
export function machineSuite(seed = 1, randomPrograms = 3): MachineCase[] {
  void CASE_GROUPS;
  return [
    ...normalCases(),
    ...boundaryCases(),
    ...randomCases(seed, randomPrograms),
    ...adversarialCases(),
    ...stopCases(),
  ];
}
