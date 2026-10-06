// Copyright © 2026 Christopher Snow

// Module 6: the memory explorer. A memory running in the simulator, drawn as a block that opens
// one level at a time (the memory, its words, a word's flip-flops), with its address, data and
// write-enable inputs to set, its clock to press, and a table of every word it holds, with the
// word each read's address names marked, and the word the next edge will write.
//
// Every value comes from the simulator: the words are the registers' outputs (a memory of gates)
// or the slices of a memory component's state net; the marks read the address the memory itself
// is given, not the one the learner set, so an address with more bits than the memory uses marks
// the word the memory reaches.

import { useMemo, useState } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import type { InteractiveProps } from "@platform/lesson-runtime";
import { memoryWords, type Circuit, type Word } from "@dd/sim";

import { CircuitView, valueLabel } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { useSettleSim } from "../useSim";
import { WordInputs } from "../WordInputs";
import { withProps } from "./props";

/** An address as the nets that carry it: one-bit nets highest first, or one word net. */
const Address = z.union([z.string(), z.array(z.string()).min(1)]);

const Bank = z.object({ net: z.string(), words: z.number(), width: z.number() });

const Props = z.object({
  libraryId: z.string(),
  clock: z.string().optional(),
  canOpen: z.boolean().default(true),
  initial: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  /** The scope the drawing opens at. */
  scope: z.string().default(""),
  memory: z
    .object({
      /** The words: one net per word (a memory of gates), lowest address first ... */
      words: z.array(z.string()).optional(),
      /** ... or a memory component's state net, with its shape ... */
      state: Bank.optional(),
      /** ... or banks of components, interleaved: address k is in bank k mod n, row k div n. */
      banks: z.array(Bank).optional(),
      /** How many binary digits an address is written with in the table. */
      addressBits: z.number(),
      /**
       * The lesson's own caption and heading for the kept column, where a row is not a word (a
       * memory of bytes); the book's "word" wording otherwise.
       */
      caption: z.string().optional(),
      keptHeading: z.string().optional(),
      /**
       * Each read: the output's name, as the table says it, and the address the memory reads (in
       * a bank, the row that bank reads).
       */
      reads: z.array(z.object({ port: z.string(), address: Address, bank: z.number().optional() })),
      /** Each write: the address the memory writes at (in a bank, its row), and its enable. */
      writes: z
        .array(z.object({ address: Address, enable: z.string(), bank: z.number().optional() }))
        .default([]),
    })
    .optional(),
  /**
   * A memory map instead of a memory's words (lesson 6.4): each part's share of the addresses,
   * the top `regionBits` of the address choosing the part, and the part the address names marked
   * by the net that selects it.
   */
  map: z
    .object({
      regionBits: z.number(),
      lowBits: z.number(),
      regions: z.array(z.object({ part: z.string(), select: z.string() })),
    })
    .optional(),
});

type Data = z.infer<typeof Props>;
type MemoryData = NonNullable<Data["memory"]>;

function netId(circuit: Circuit, name: string): number | undefined {
  const net = circuit.nets.find((n) => n.name === name);
  if (net) return net.id;
  return (
    circuit.inputs.find((p) => p.name === name)?.net ??
    circuit.outputs.find((p) => p.name === name)?.net
  );
}

function valueOf(circuit: Circuit, values: readonly Word[], name: string): Word | undefined {
  const id = netId(circuit, name);
  return id === undefined ? undefined : values[id];
}

/** The number an address's nets spell, or undefined while any bit is unknown. */
export function addressOf(
  circuit: Circuit,
  values: readonly Word[],
  address: string | readonly string[],
): number | undefined {
  const nets = typeof address === "string" ? [address] : address;
  let n = 0n;
  for (const name of nets) {
    const w = valueOf(circuit, values, name);
    if (!w || w.known !== (1n << BigInt(w.width)) - 1n) return undefined;
    n = (n << BigInt(w.width)) | w.value;
  }
  return Number(n);
}

/** The memory's words now, lowest address first, read off the simulator's values. */
export function wordsOf(circuit: Circuit, values: readonly Word[], memory: MemoryData): Word[] {
  const bank = (b: z.infer<typeof Bank>) => {
    const state = valueOf(circuit, values, b.net);
    return state ? memoryWords(state, b.words, b.width) : [];
  };
  if (memory.banks) {
    const banks = memory.banks.map(bank);
    const rows = Math.max(...banks.map((w) => w.length));
    const out: Word[] = [];
    for (let r = 0; r < rows; r++)
      for (const words of banks) {
        const w = words[r];
        if (w) out.push(w);
      }
    return out;
  }
  if (memory.state) return bank(memory.state);
  return (memory.words ?? []).flatMap((name) => {
    const w = valueOf(circuit, values, name);
    return w ? [w] : [];
  });
}

/** A word's address in binary, as the table writes it. */
export function addressText(k: number, bits: number): string {
  return k.toString(2).padStart(bits, "0");
}

/** The table of a memory's words, the words its reads name and the word the next edge writes. */
function WordsTable({
  circuit,
  values,
  memory,
}: {
  circuit: Circuit;
  values: readonly Word[];
  memory: MemoryData;
}) {
  const strings = useViewStrings();
  const words = wordsOf(circuit, values, memory);
  const n = memory.banks?.length ?? 1;
  const at = (address: string | readonly string[], bank: number | undefined) => {
    const a = addressOf(circuit, values, address);
    return a === undefined ? undefined : bank === undefined ? a : a * n + bank;
  };
  const reads = memory.reads.map((r) => ({ port: r.port, at: at(r.address, r.bank) }));
  const writes = memory.writes
    .filter((w) => addressOf(circuit, values, w.enable) === 1)
    .map((w) => at(w.address, w.bank));
  return (
    <div className="truth-table-wrap memory-table-wrap">
      <table className="truth-table memory-table">
        <caption>{memory.caption ?? strings.memory.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{strings.memory.address}</th>
            <th scope="col">{memory.keptHeading ?? strings.memory.word}</th>
            <th scope="col">{strings.memory.marks}</th>
          </tr>
        </thead>
        <tbody>
          {words.map((w, k) => {
            const readers = [...new Set(reads.filter((r) => r.at === k).map((r) => r.port))];
            const marks = [
              ...(readers.length
                ? [format(strings.memory.readBy, { ports: readers.join(", ") })]
                : []),
              ...(writes.includes(k) ? [strings.memory.writeNext] : []),
            ];
            return (
              <tr
                key={k}
                className={readers.length ? "row-current" : ""}
                aria-current={readers.length ? "true" : undefined}
                data-address={k}
              >
                <th scope="row">{addressText(k, memory.addressBits)}</th>
                <td className="memory-word">{valueLabel(w)}</td>
                <td className="cell-now">{marks.join(" ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A memory map: each part's share of the addresses, and the part the address names now. */
function MapTable({
  circuit,
  values,
  map,
}: {
  circuit: Circuit;
  values: readonly Word[];
  map: NonNullable<Data["map"]>;
}) {
  const strings = useViewStrings();
  const range = (k: number, low: number) =>
    `${addressText(k, map.regionBits)} ${addressText(low, map.lowBits)}`;
  const last = (1 << map.lowBits) - 1;
  return (
    <div className="truth-table-wrap memory-table-wrap">
      <table className="truth-table memory-table">
        <caption>{strings.memory.mapCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{strings.memory.addresses}</th>
            <th scope="col">{strings.memory.part}</th>
            <th scope="col">{strings.memory.marks}</th>
          </tr>
        </thead>
        <tbody>
          {map.regions.map((r, k) => {
            const chosen = addressOf(circuit, values, r.select) === 1;
            return (
              <tr
                key={r.part}
                className={chosen ? "row-current" : ""}
                aria-current={chosen ? "true" : undefined}
              >
                <th scope="row">
                  {format(strings.memory.range, { first: range(k, 0), last: range(k, last) })}
                </th>
                <td>{r.part}</td>
                <td className="cell-now">{chosen ? strings.memory.chosen : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const MemoryExplorer = withProps(
  Props,
  function MemoryExplorer({ data, interactive }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const sim = useSettleSim(circuit, data.initial);
    const [scope, setScope] = useState(data.scope);
    return (
      <div className="explorer memory-explorer" data-interactive={interactive.id}>
        <CircuitView
          circuit={circuit}
          values={sim.values}
          title={strings.explorer.title}
          onToggleInput={(name) => sim.toggle(name)}
          scope={scope}
          {...(data.canOpen ? { onScope: setScope } : {})}
        />
        <WordInputs circuit={circuit} values={sim.values} onSet={(n, v) => sim.set(n, v)} />
        <div className="explorer-actions">
          {data.clock && (
            <button
              type="button"
              className="button secondary"
              onClick={() => sim.clock(data.clock as string)}
            >
              {format(strings.explorer.clock, { name: data.clock })}
            </button>
          )}
          <button type="button" className="button secondary" onClick={() => sim.reset()}>
            {strings.explorer.reset}
          </button>
        </div>
        {data.memory && <WordsTable circuit={circuit} values={sim.values} memory={data.memory} />}
        {data.map && <MapTable circuit={circuit} values={sim.values} map={data.map} />}
      </div>
    );
  },
);
