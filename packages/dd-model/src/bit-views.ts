// Copyright © 2026 Christopher Snow

// Module 13: the parts of the final machine that never open, and the drawing of one bit each
// stands for. The register file, the memory, the PC, the IR, the held words, the control
// registers and the controller's state register run as the simulator's own parts, and the
// selectors and adders of a whole word are drawn closed. A trace that reaches one of them opens
// the drawing of one bit that the module which built the part drew: a register's bit is Module
// 5's (`keep-bit`, or `keep-clear-bit` where a reset clears it), a selector's is Module 3's
// (`selector-2-gates`), an adder's is Module 3's full adder (`full-adder-parts`). The bit is
// driven by the machine's values at that moment, read off its nets, so every path ends at a gate
// or a flip-flop. A part that only splits or joins a word holds no gate, and says so.

import type { Circuit, Word } from "@dd/sim";

import { ramBytesOf, registersOf } from "./datapath-run";

export type BitKind =
  "register" | "registerReset" | "registerFile" | "pair" | "ram" | "selector" | "adder" | "wiring";

/** A part that never opens, and what its one bit is. */
export interface BitPart {
  readonly path: string;
  readonly name: string;
  readonly kind: string;
  readonly bit: BitKind;
  /** The bits a learner may choose among. */
  readonly width: number;
  /** For the register file, the registers; for the RAM, its bytes; for a pair, its two words. */
  readonly choices?: number;
  /** The module whose drawing of one bit stands for the part. */
  readonly module: number;
}

/** The library's drawing of one bit for each kind of part, and the module that drew it. */
export const BIT_DRAWINGS: Readonly<Record<Exclude<BitKind, "wiring">, readonly [string, number]>> =
  {
    register: ["keep-bit", 5],
    registerReset: ["keep-clear-bit", 5],
    registerFile: ["keep-bit", 5],
    pair: ["keep-bit", 5],
    ram: ["keep-bit", 5],
    selector: ["selector-2-gates", 3],
    adder: ["full-adder-parts", 3],
  };

/** Kinds of closed block, by what one bit of each is. */
const BLOCKS: Readonly<Record<string, readonly [BitKind, number]>> = {
  "word-register-64": ["registerReset", 5],
  "word-register-32": ["registerReset", 5],
  "held-64": ["register", 5],
  "held-32": ["register", 5],
  "hold-ab": ["pair", 5],
  registers: ["registerFile", 6],
  memory: ["ram", 6],
  "word-selector-2": ["selector", 3],
  "zero-or-word": ["selector", 3],
  "word-adder": ["adder", 3],
  plus4: ["adder", 3],
  digits: ["wiring", 8],
  widen: ["wiring", 8],
  times4: ["wiring", 8],
  "split-control": ["wiring", 9],
  "split-4": ["wiring", 3],
  "split-3": ["wiring", 5],
  "join-3": ["wiring", 5],
  "join-4": ["wiring", 7],
  "word-piece": ["wiring", 7],
  "word-join": ["wiring", 7],
  "top-bit": ["wiring", 7],
  "constant-bits": ["wiring", 9],
  "join-control-final": ["wiring", 9],
};

const widthOf = (circuit: Circuit, net: number | undefined) =>
  net === undefined ? 1 : (circuit.nets[net]?.width ?? 1);

/** What one bit of a part is, or undefined for a part that opens (or a gate). */
export function bitPartOf(circuit: Circuit, path: string): BitPart | undefined {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const block = circuit.composites.find((c) => c.path === path);
  if (block) {
    const found = BLOCKS[block.kind];
    if (!found) return undefined;
    const [bit, module] = found;
    const out = Object.values(block.outputs)[0];
    const width =
      bit === "ram"
        ? 8
        : bit === "registerFile"
          ? 64
          : bit === "adder"
            ? widthOf(circuit, out)
            : widthOf(circuit, out);
    return {
      path,
      name,
      kind: block.kind,
      bit,
      width,
      module,
      ...(bit === "registerFile" ? { choices: 16 } : {}),
      ...(bit === "ram" ? { choices: 0x7c0 - 0x400 } : {}),
      ...(bit === "pair" ? { choices: 2 } : {}),
    };
  }
  const part = circuit.components.find((c) => c.path === path);
  if (!part) return undefined;
  if (part.kind === "memory" && Number(part.params?.["words"]) === 1)
    return {
      path,
      name,
      kind: part.kind,
      bit: "register",
      width: Number(part.params?.["width"]),
      module: 5,
    };
  if (part.kind === "mux2")
    return {
      path,
      name,
      kind: part.kind,
      bit: "selector",
      width: widthOf(circuit, part.outputs["y"]),
      module: 3,
    };
  if (part.kind === "slice" || part.kind === "join" || part.kind === "bit")
    return { path, name, kind: part.kind, bit: "wiring", width: 1, module: 3 };
  return undefined;
}

/** A bit's value, 0, 1, or undefined while unknown. */
function bitOf(w: Word | undefined, k: number): 0 | 1 | undefined {
  if (!w || ((w.known >> BigInt(k)) & 1n) === 0n) return undefined;
  return Number((w.value >> BigInt(k)) & 1n) as 0 | 1;
}

/** One bit's drawing, driven: the library circuit, its inputs, and what it holds and gives. */
export interface BitDrive {
  readonly libraryId: string;
  readonly module: number;
  /** The drawing's inputs, by name (D, EN, RST; A, B, S; A, B, CIN). */
  readonly inputs: Readonly<Record<string, 0 | 1 | undefined>>;
  /** For a register's bit: what its flip-flop holds now. */
  readonly held?: 0 | 1 | undefined;
  /** What the bit gives: for a register, what it holds after the next edge; else its output now. */
  readonly result: 0 | 1 | undefined;
}

const and = (...xs: (0 | 1 | undefined)[]): 0 | 1 | undefined =>
  xs.some((x) => x === 0) ? 0 : xs.every((x) => x === 1) ? 1 : undefined;

/**
 * The bit `k` of a part at the machine's values, as the module that built it drew one bit:
 * `index` chooses a register of the register file, a byte of the RAM by its offset from `400`, or
 * one of a pair of held words.
 */
export function bitDrive(
  circuit: Circuit,
  values: readonly Word[],
  part: BitPart,
  k: number,
  index = 0,
): BitDrive | undefined {
  if (part.bit === "wiring") return undefined;
  const [libraryId, module] = BIT_DRAWINGS[part.bit];
  const block = circuit.composites.find((c) => c.path === part.path);
  const component = circuit.components.find((c) => c.path === part.path);
  const pin = (name: string) => {
    const net =
      block?.inputs[name] ??
      block?.outputs[name] ??
      component?.inputs[name] ??
      component?.outputs[name];
    return net === undefined ? undefined : values[net];
  };
  const register = (d: 0 | 1 | undefined, en: 0 | 1 | undefined, held: 0 | 1 | undefined) => ({
    libraryId,
    module,
    inputs: { D: d, EN: en },
    held,
    result: en === 1 ? d : en === 0 ? held : d === held ? d : undefined,
  });
  switch (part.bit) {
    case "register":
      return component
        ? register(bitOf(pin("D"), k), bitOf(pin("WE"), 0), bitOf(pin("Q0"), k))
        : register(bitOf(pin("D"), k), bitOf(pin("EN"), 0), bitOf(pin("Q"), k));
    case "registerReset": {
      const d = bitOf(pin("D"), k);
      const en = bitOf(pin("EN"), 0);
      const rst = bitOf(pin("RST"), 0);
      const held = bitOf(pin("Q"), k);
      const kept = register(d, en, held).result;
      return {
        libraryId,
        module,
        inputs: { D: d, EN: en, RST: rst },
        held,
        result: rst === 1 ? 0 : rst === 0 ? kept : undefined,
      };
    }
    case "pair":
      return register(
        bitOf(pin(index === 0 ? "QA" : "QB"), k),
        bitOf(pin("EN"), 0),
        bitOf(pin(index === 0 ? "HA" : "HB"), k),
      );
    case "registerFile": {
      const wa = pin("WA");
      const chosen =
        wa && wa.known === 15n
          ? Number(wa.value) === index
            ? 1
            : 0
          : (undefined as 0 | 1 | undefined);
      const word = registersOf(circuit, values)[index];
      const held = word === undefined ? undefined : (Number((word >> BigInt(k)) & 1n) as 0 | 1);
      return register(bitOf(pin("D"), k), and(bitOf(pin("WE"), 0), chosen), held);
    }
    case "ram": {
      const address = 0x400 + index;
      const at = pin("ADDR");
      const byte = bitOf(pin("BYTE"), 0);
      const causem = pin("CAUSEM");
      const fine =
        causem && causem.known === 0xffn ? ((causem.value === 0n ? 1 : 0) as 0 | 1) : undefined;
      let covers: 0 | 1 | undefined;
      let lane = 0;
      if (at && at.known === (1n << BigInt(at.width)) - 1n && byte !== undefined) {
        const from = Number(at.value);
        lane = address - from;
        covers = byte === 1 ? (lane === 0 ? 1 : 0) : lane >= 0 && lane < 8 ? 1 : 0;
      }
      const d = covers === 1 ? bitOf(pin("D"), 8 * lane + k) : bitOf(pin("D"), k);
      const ram = ramBytesOf(circuit, values);
      const b = ram?.[index];
      const held = b === undefined ? undefined : (((b >> k) & 1) as 0 | 1);
      return register(d, and(bitOf(pin("STORE"), 0), bitOf(pin("GO"), 0), fine, covers), held);
    }
    case "selector": {
      const zeroOr = block?.kind === "zero-or-word";
      const a = bitOf(pin(component ? "a" : "A"), k);
      const b = zeroOr ? 0 : bitOf(pin(component ? "b" : "B"), k);
      const s = bitOf(pin(component ? "sel" : zeroOr ? "AZERO" : "S"), 0);
      return {
        libraryId,
        module,
        inputs: { A: a, B: b, S: s },
        result: s === 1 ? b : s === 0 ? a : undefined,
      };
    }
    case "adder": {
      const plus4 = block?.kind === "plus4";
      const a = pin(plus4 ? "PC" : "A");
      const bw = plus4 ? ({ width: 64, value: 4n, known: (1n << 64n) - 1n } as Word) : pin("B");
      const low = (w: Word | undefined) => {
        const mask = (1n << BigInt(k)) - 1n;
        return w && (w.known & mask) === mask ? w.value & mask : undefined;
      };
      const la = low(a);
      const lb = low(bw);
      const cin =
        la === undefined || lb === undefined
          ? undefined
          : (Number(((la + lb) >> BigInt(k)) & 1n) as 0 | 1);
      const x = bitOf(a, k);
      const y = bitOf(bw, k);
      const sum =
        x === undefined || y === undefined || cin === undefined
          ? undefined
          : (((x + y + cin) & 1) as 0 | 1);
      return { libraryId, module, inputs: { A: x, B: y, CIN: cin }, result: sum };
    }
  }
}
