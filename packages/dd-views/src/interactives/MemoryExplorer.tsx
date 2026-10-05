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
import type { InteractiveProps } from "@dd/lesson-runtime";
import { memoryWords, type Circuit, type Word } from "@dd/sim";

import { CircuitView, valueLabel } from "../CircuitView";
import { format, useViewStrings } from "../strings";
import { useSettleSim } from "../useSim";
import { WordInputs } from "../WordInputs";
import { withProps } from "./props";

/** An address as the nets that carry it: one-bit nets highest first, or one word net. */
const Address = z.union([z.string(), z.array(z.string()).min(1)]);

const Props = z.object({
  libraryId: z.string(),
  clock: z.string().optional(),
  canOpen: z.boolean().default(true),
  initial: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  /** The scope the drawing opens at. */
  scope: z.string().default(""),
  memory: z.object({
    /** The words: one net per word (a memory of gates), lowest address first ... */
    words: z.array(z.string()).optional(),
    /** ... or a memory component's state net, with its shape. */
    state: z.object({ net: z.string(), words: z.number(), width: z.number() }).optional(),
    /** How many binary digits an address is written with in the table. */
    addressBits: z.number(),
    /** Each read: the output's name, as the table says it, and the address the memory reads. */
    reads: z.array(z.object({ port: z.string(), address: Address })),
    /** The write: the address the memory writes at, and the net that enables it. */
    write: z.object({ address: Address, enable: z.string() }).optional(),
  }),
});

type Data = z.infer<typeof Props>;

function netId(circuit: Circuit, name: string): number | undefined {
  const net = circuit.nets.find((n) => n.name === name);
  if (net) return net.id;
  return (
    circuit.inputs.find((p) => p.name === name)?.net ??
    circuit.outputs.find((p) => p.name === name)?.net
  );
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
    const id = netId(circuit, name);
    const w = id === undefined ? undefined : values[id];
    if (!w || w.known !== (1n << BigInt(w.width)) - 1n) return undefined;
    n = (n << BigInt(w.width)) | w.value;
  }
  return Number(n);
}

/** The memory's words now, lowest address first, read off the simulator's values. */
export function wordsOf(circuit: Circuit, values: readonly Word[], memory: Data["memory"]): Word[] {
  if (memory.state) {
    const id = netId(circuit, memory.state.net);
    const state = id === undefined ? undefined : values[id];
    if (!state) return [];
    return memoryWords(state, memory.state.words, memory.state.width);
  }
  return (memory.words ?? []).flatMap((name) => {
    const id = netId(circuit, name);
    const w = id === undefined ? undefined : values[id];
    return w ? [w] : [];
  });
}

/** A word's address in binary, as the table writes it. */
export function addressText(k: number, bits: number): string {
  return k.toString(2).padStart(bits, "0");
}

export const MemoryExplorer = withProps(
  Props,
  function MemoryExplorer({ data, interactive }: InteractiveProps & { data: Data }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const sim = useSettleSim(circuit, data.initial);
    const [scope, setScope] = useState(data.scope);
    const words = wordsOf(circuit, sim.values, data.memory);
    const reads = data.memory.reads.map((r) => ({
      port: r.port,
      at: addressOf(circuit, sim.values, r.address),
    }));
    const write = data.memory.write;
    const enable = write ? addressOf(circuit, sim.values, write.enable) : undefined;
    const writeAt =
      write && enable === 1 ? addressOf(circuit, sim.values, write.address) : undefined;
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
        <div className="truth-table-wrap memory-table-wrap">
          <table className="truth-table memory-table">
            <caption>{strings.memory.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{strings.memory.address}</th>
                <th scope="col">{strings.memory.word}</th>
                <th scope="col">{strings.memory.marks}</th>
              </tr>
            </thead>
            <tbody>
              {words.map((w, k) => {
                const readers = reads.filter((r) => r.at === k).map((r) => r.port);
                const marks = [
                  ...(readers.length
                    ? [format(strings.memory.readBy, { ports: readers.join(", ") })]
                    : []),
                  ...(writeAt === k ? [strings.memory.writeNext] : []),
                ];
                return (
                  <tr
                    key={k}
                    className={readers.length ? "row-current" : ""}
                    aria-current={readers.length ? "true" : undefined}
                    data-address={k}
                  >
                    <th scope="row">{addressText(k, data.memory.addressBits)}</th>
                    <td className="memory-word">{valueLabel(w)}</td>
                    <td className="cell-now">{marks.join(" ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
