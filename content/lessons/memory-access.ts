// Copyright © 2026 Christopher Snow

// Lesson: Module 8, lesson 4, loads and stores: the ALU's add giving an address, the memory map
// whole (the ROM, the RAM and the shop's devices) on the datapath, a selector that writes a loaded
// word into a register, and the checks that stop a load or a store the memory refuses.
//
// The structure is here; the words are in memory-access.prose.ts and memory-access.labels.ts. The
// numbers the prose states are pinned by memory-access.facts.test.ts, read off the figures' props.

import { MAP, memoryCheck } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./memory-access.labels";
import { PROSE } from "./memory-access.prose";
import { MEMCHECK_REFERENCE, MEMCHECK_START, MEMORY_REFERENCE, MEMORY_START } from "./module8";

/** The shop's two rooms on the sensors, as words. */
export const SENSORS = { SENSORA: "-184", SENSORB: "-250" };

/** The office's margin, from the sensors, kept in the RAM and shown on the display and lamps. */
export const SHOW_MARGIN = `R2 <= word[sensorA]
R3 <= word[sensorB]
R4 <= R2 - R3
word[0x400] <= R4
word[display] <= R4
R5 <= 5
word[lamps] <= R5
stop`;

const MEMCHECK_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "select",
  "op-bitwise",
  "always_comb",
  "if",
  "op-compare",
];
const MEMORY_CONSTRUCTS = [
  ...MEMCHECK_CONSTRUCTS,
  "concat",
  "case",
  "always_ff",
  "op-arith",
  "instance",
];

/** The memory checks' tests, each worked out by the reference's own check. */
const MEMCHECK_CASES: readonly [number | bigint, "load" | "store" | "none", boolean][] = [
  [0x000, "load", false],
  [0x3f8, "store", false],
  [0x3f9, "store", true],
  [0x400, "store", false],
  [0x404, "load", false],
  [0x405, "load", true],
  [0x7c0, "store", false],
  [0x7c0, "store", true],
  [0x7d8, "load", false],
  [0x7d8, "store", false],
  // Both 33 (a byte at a device) and 34 (a store to a sensor) apply: the order of the checks shows.
  [0x7d8, "store", true],
  [0x7f8, "load", false],
  [0x800, "store", true],
  [0xfffffffffffffff8n, "load", false],
  // Only bit 12 is 1: outside the memory, though bits 11 and 10 say nothing of it.
  [0x1000, "load", false],
  [0x800, "none", false],
];
const MEMCHECK_VECTORS = MEMCHECK_CASES.map(([address, access, byte]) => {
  const a = BigInt(address);
  const cause = access === "none" ? undefined : memoryCheck(a, access === "store", byte);
  const at = a.toString(16).toUpperCase().padStart(3, "0");
  return {
    label: `${access === "none" ? "neither" : access} ${byte ? "byte" : "word"} at ${at}`,
    inputs: {
      ADDR: `0x${a.toString(16).toUpperCase()}`,
      LOAD: access === "load" ? 1 : 0,
      STORE: access === "store" ? 1 : 0,
      BYTE: byte ? 1 : 0,
    },
    expect: { CAUSEM: `0x${(cause ?? 0).toString(16).toUpperCase()}` },
  };
});

const h64 = (v: bigint) => `0x${BigInt.asUintN(64, v).toString(16).toUpperCase()}`;

/** The datapath text's tests: reset, then the program edge by edge to its stop. */
const MEMORY_STEPS: {
  label: string;
  set: Record<string, string | number>;
  expect?: Record<string, string | number>;
}[] = [
  {
    label: "RST 1, the rooms on the sensors, clock low",
    set: { CLK: 0, RST: 1, SENSORA: h64(-184n), SENSORB: h64(-250n) },
  },
  { label: "edge with RST 1: PC is 000", set: { CLK: 1 }, expect: { PC: h64(0n), HALT: 0 } },
  { label: "clock low, RST 0", set: { CLK: 0, RST: 0 } },
  ...Array.from({ length: 7 }, (_, k) => {
    const pc = 4 * (k + 1);
    return [
      {
        label: `edge ${k + 1}: PC is ${pc.toString(16).toUpperCase().padStart(3, "0")}${k + 1 >= 7 ? ", the display 66, the lamps 101" : k + 1 >= 5 ? ", the display 66" : ""}`,
        set: { CLK: 1 },
        expect: {
          PC: h64(BigInt(pc)),
          ...(k + 1 >= 5 ? { DISPLAY: h64(66n) } : {}),
          ...(k + 1 >= 7 ? { LAMPS: "101" } : {}),
        },
      },
      { label: "clock low", set: { CLK: 0 } },
    ];
  }).flat(),
  { label: "stop at 01C: HALT is 1, CAUSE 00", set: {}, expect: { HALT: 1, CAUSE: "0x0" } },
  { label: "one more edge: PC stays 01C", set: { CLK: 1 }, expect: { PC: h64(0x1cn) } },
];

export const memoryAccess: LessonInput = {
  id: "memory-access",
  title: LABELS.title,
  module: 8,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: [],
  sections: [
    { kind: "question", title: LABELS.titles.question, prose: PROSE.question },
    {
      kind: "motivation",
      title: LABELS.titles.motivation,
      prose: PROSE.motivation,
      interactives: [
        {
          id: "fields",
          kind: "instruction-fields",
          timeModel: "none",
          caption: LABELS.captions.fields,
          lead: PROSE.fieldsLead,
          props: {
            instructions: [
              { label: LABELS.fieldsChoices.load, text: "0x380027D8" },
              { label: LABELS.fieldsChoices.store, text: "0x48040400" },
            ],
            notes: LABELS.fieldNotes,
          },
        },
      ],
    },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-load",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.predictLoad,
          props: {
            libraryId: "datapath-memory",
            program: SHOW_MARGIN,
            inputs: SENSORS,
            shown: [2, 3],
            buses: ["ALUA", "RESULT", "MQ", "YIN"],
            question: PROSE.p1Question,
            options: [
              { value: "-184", label: LABELS.options.p1Reading },
              { value: "2008", label: LABELS.options.p1Address },
              { value: "X", label: LABELS.options.p1Unknown },
            ],
            ask: "value",
            register: 2,
            explain: PROSE.p1Explain,
          },
        },
      ],
    },
    {
      kind: "investigation",
      title: LABELS.titles.investigation,
      prose: "",
      interactives: [
        {
          id: "show-margin",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.showMargin,
          lead: PROSE.showMarginLead,
          props: {
            outcomes: PROSE.showMarginAfter,
            libraryId: "datapath-memory",
            program: SHOW_MARGIN,
            inputs: SENSORS,
            shown: [2, 3, 4, 5],
            buses: ["RESULT", "QB", "MQ", "YIN"],
            ram: [MAP.ramStart],
            devices: true,
            run: true,
          },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "map",
          kind: "memory-map",
          timeModel: "none",
          caption: LABELS.captions.map,
          lead: PROSE.mapLead,
          props: {},
        },
        {
          id: "write-memcheck",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeMemcheck,
          lead: PROSE.writeMemcheckLead,
          props: { challengeId: "memcheck-text" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "memory-faults",
          kind: "datapath",
          timeModel: "settle",
          caption: LABELS.captions.memoryFaults,
          lead: PROSE.memoryFaultsLead,
          props: {
            outcomes: PROSE.memoryFaultsAfter,
            libraryId: "datapath-memory",
            program: SHOW_MARGIN,
            inputs: SENSORS,
            shown: [2, 3, 4],
            buses: ["RESULT", "MQ", "YIN"],
            devices: true,
            run: true,
            faults: [
              {
                kind: "stuck-at",
                net: "LOAD",
                value: 0,
                at: [50, 17],
                label: LABELS.faults.loadLow,
                outcome: PROSE.memoryFaultLoad,
              },
              {
                kind: "stuck-at",
                net: "STORE",
                value: 1,
                at: [50, 17],
                label: LABELS.faults.storeHigh,
                outcome: PROSE.memoryFaultStore,
              },
            ],
          },
        },
      ],
    },
    { kind: "explanation", title: LABELS.titles.explanation, prose: PROSE.explanation },
    { kind: "generalisation", title: LABELS.titles.generalisation, prose: PROSE.generalisation },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "write-memory",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeMemory,
          lead: PROSE.writeMemoryLead,
          props: { challengeId: "memory-text" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "memcheck-text",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "ADDR", width: 64 },
          { name: "LOAD" },
          { name: "STORE" },
          { name: "BYTE" },
        ],
        outputs: [{ name: "CAUSEM", width: 8 }],
      },
      allowedConstructs: MEMCHECK_CONSTRUCTS,
      tryIt: "pins",
      initial: { hdl: MEMCHECK_START },
      tests: { kind: "combinational", vectors: MEMCHECK_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { hdl: MEMCHECK_REFERENCE },
    },
    {
      id: "memory-text",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "CLK" },
          { name: "RST" },
          { name: "SENSORA", width: 64 },
          { name: "SENSORB", width: 64 },
        ],
        outputs: [
          { name: "PC", width: 64 },
          { name: "HALT" },
          { name: "CAUSE", width: 8 },
          { name: "DISPLAY", width: 64 },
          { name: "LAMPS", width: 3 },
        ],
      },
      allowedConstructs: MEMORY_CONSTRUCTS,
      courseModules: { set: "machine", program: SHOW_MARGIN },
      tryIt: "pins",
      initial: { hdl: MEMORY_START },
      tests: { kind: "sequence", steps: MEMORY_STEPS },
      hints: [...PROSE.c2Hints],
      reference: { hdl: MEMORY_REFERENCE },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The load word and store word instructions added to the single-cycle datapath with a data memory beside the instruction memory, MemRead, MemWrite and MemtoReg choosing the word written back (Patterson and Hennessy), or the load built first of all (Harris and Harris); LC-3's MAR and MDR on its bus; memory-mapped I/O as a separate later chapter.",
    howThisDiffers:
      "The memory is the memory map Module 6 built, one block holding the ROM, the RAM and the shop's devices at their addresses, with the fetch and the data reads as two ports of it; the program reads the shop's two sensors and writes the display and the lamps, so memory-mapped devices arrive with the first load rather than after it. The address is the ALU's add of A and the constant, with A replaced by 0 for an absolute address (a selector named AZERO), the course's own way to reach any address in one instruction. The checks that stop the machine (no memory, a misaligned word or a byte at a device, a store to the ROM or a read-only device) are the lesson's construction, written from the course's memory map; the faults are LOAD held at 0, which writes the address instead of the word, and STORE held at 1, which the read-only check stops at once.",
  },
};
