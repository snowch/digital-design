// Copyright © 2026 Christopher Snow

// Module 8's focused figures, read off the implementation: an instruction's fields as the
// reference reads them, a constant's widening as the widen block simulates it, the memory map and
// the verdict of the machine's own check for each part and each kind of access, and a program's
// branches, call and jump with their targets and how often a run of the reference took each.

import { Simulator, word } from "@dd/sim";

import { assemble } from "./assemble";
import { widenCircuit } from "./datapath";
import {
  DEVICES,
  MAP,
  QUIET_INPUTS,
  fieldsOf,
  memoryCheck,
  resetMachine,
  run,
  type MachineInputs,
} from "./machine";

/** One field of an instruction: its letter, its bits, its digits and its value. */
export interface InstructionField {
  readonly name: "K" | "J" | "A" | "B" | "Y" | "C";
  readonly hi: number;
  readonly lo: number;
  /** The field's bits, highest first. */
  readonly bits: string;
  /** The field's hexadecimal digits. */
  readonly digits: string;
  readonly value: number;
  /** For C, the value read signed. */
  readonly signed?: number;
}

/** An instruction's six fields, left to right, as `docs/isa.md` lays them out. */
export function instructionFields(instruction: number): InstructionField[] {
  const f = fieldsOf(instruction);
  const field = (
    name: InstructionField["name"],
    hi: number,
    lo: number,
    value: number,
    signed?: number,
  ): InstructionField => ({
    name,
    hi,
    lo,
    bits: value.toString(2).padStart(hi - lo + 1, "0"),
    digits: value
      .toString(16)
      .toUpperCase()
      .padStart((hi - lo + 1) / 4, "0"),
    value,
    ...(signed !== undefined ? { signed } : {}),
  });
  return [
    field("K", 31, 28, f.k),
    field("J", 27, 24, f.j),
    field("A", 23, 20, f.a),
    field("B", 19, 16, f.b),
    field("Y", 15, 12, f.y),
    field("C", 11, 0, f.raw, f.c),
  ];
}

/** A constant widened by the widen block, simulated: C's 12 bits in, W's 64 bits out. */
export interface Widening {
  readonly c: number;
  readonly cSigned: number;
  readonly w: bigint;
  readonly wSigned: bigint;
}

let widenSim: Simulator | undefined;

export function widening(raw: number): Widening {
  widenSim ??= new Simulator(widenCircuit());
  widenSim.setInput("C", word(12, raw & 0xfff));
  widenSim.settle();
  const w = widenSim.read("W").value;
  return {
    c: raw & 0xfff,
    cSigned: raw & 0x800 ? (raw & 0xfff) - 0x1000 : raw & 0xfff,
    w,
    wSigned: w >= 1n << 63n ? w - (1n << 64n) : w,
  };
}

/** A part of the memory map. */
export interface MapPart {
  /** `rom`, `ram`, a device's name, or `none`. */
  readonly part: string;
  readonly first: number;
  /** The last address of the part. */
  readonly last: number;
}

/** The memory map, part by part: the ROM, the RAM, each device word, and no memory. */
export function memoryMapParts(): MapPart[] {
  const devices = Object.entries(DEVICES)
    .filter(([name]) => name !== "none")
    .sort(([, a], [, b]) => a - b)
    .map(([part, first]) => ({ part, first, last: first + 7 }));
  return [
    { part: "rom", first: MAP.romStart, last: MAP.romEnd - 1 },
    { part: "ram", first: MAP.ramStart, last: MAP.ramEnd - 1 },
    ...devices,
    { part: "none", first: DEVICES.none, last: MAP.end - 1 },
  ];
}

/** Lesson 10.3: a run of 12-bit constants, the addresses they widen to, and what answers there. */
export interface ConstantRange {
  /** `rom`, `ram`, `devices`, `none` (the map's last word), or `negative` (bit 11 set). */
  readonly part: string;
  readonly first: number;
  readonly last: number;
  /** The widen block's 64-bit words for the first and last constant, simulated. */
  readonly firstAddress: bigint;
  readonly lastAddress: bigint;
  /** The machine's check on a word load at the first address: the cause, or 0 if it is allowed. */
  readonly cause: number;
}

/**
 * Every 12-bit constant, used as an address (AZERO's 0 + the constant): `000` to `7FF` widen to
 * the memory map's own addresses, part by part; `800` to `FFF` widen to negative words, which no
 * part answers.
 */
export function constantRanges(): ConstantRange[] {
  const parts = memoryMapParts();
  const devices = parts.filter((p) => p.part !== "rom" && p.part !== "ram" && p.part !== "none");
  const runs = [
    ...parts.filter((p) => p.part === "rom" || p.part === "ram"),
    { part: "devices", first: devices[0]?.first ?? 0, last: devices.at(-1)?.last ?? 0 },
    ...parts.filter((p) => p.part === "none"),
    { part: "negative", first: 0x800, last: 0xfff },
  ];
  return runs.map((r) => {
    const firstAddress = widening(r.first).w;
    return {
      part: r.part,
      first: r.first,
      last: r.last,
      firstAddress,
      lastAddress: widening(r.last).w,
      cause: memoryCheck(firstAddress, false, false) ?? 0,
    };
  });
}

export type Access = "load-word" | "load-byte" | "store-word" | "store-byte";
export const ACCESSES: readonly Access[] = ["load-word", "load-byte", "store-word", "store-byte"];

/**
 * The machine's check on an access at a part's first address: the cause, or 0 if it is allowed;
 * in user mode with `user` (Module 12).
 */
export function accessVerdict(part: MapPart, access: Access, user = false): number {
  return (
    memoryCheck(BigInt(part.first), access.startsWith("store"), access.endsWith("byte"), user) ?? 0
  );
}

/** One line of a program, with where a run went next from it. */
export interface ProgramLine {
  readonly address: number;
  readonly text: string;
  readonly instruction: number;
  /** The kind: 5 a branch, 6 a call, 7 a jump. */
  readonly kind: number;
  /** For a branch or call, the target its constant gives: the address plus 4c. */
  readonly target?: number;
  /** Where a run of the reference went from this line, and how many times. */
  readonly went: readonly { readonly to: number; readonly times: number }[];
}

/** A program's lines and, from a run of the reference, where each line sent PC next. */
export function programFlow(
  source: string,
  inputs: MachineInputs = QUIET_INPUTS,
  limit = 1000,
): ProgramLine[] {
  const program = assemble(source);
  const { records } = run(resetMachine(program.rom), limit, inputs);
  return program.lines.flatMap((l) => {
    if (l.instruction === undefined) return [];
    const f = fieldsOf(l.instruction);
    const went = new Map<number, number>();
    for (const r of records)
      if (Number(r.pc) === l.address && !r.stopped)
        went.set(Number(r.nextPc), (went.get(Number(r.nextPc)) ?? 0) + 1);
    return [
      {
        address: l.address,
        text: l.text,
        instruction: l.instruction,
        kind: f.k,
        ...(f.k === 5 || f.k === 6 ? { target: l.address + 4 * f.c } : {}),
        went: [...went].map(([to, times]) => ({ to, times })),
      },
    ];
  });
}
