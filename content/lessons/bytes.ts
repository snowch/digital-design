// Copyright © 2026 Christopher Snow

// Lesson: Module 6, lesson 3, bytes: a memory whose every address names eight bits, and the
// 16-bit words it keeps as two of them, the low byte at the lower address.
//
// The structure is here; the words are in bytes.prose.ts and bytes.labels.ts. The memory is the
// model's (packages/dd-model: `byteMemory` in memory.ts): two banks of bytes, even and odd
// addresses. The numbers the prose states are pinned by bytes.facts.test.ts.

import { FILLED_BYTES } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./bytes.labels";
import { PROSE } from "./bytes.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** The memory explorer's view of the bytes: two banks, interleaved by address. */
const BYTES_TABLE = {
  banks: [
    { net: "bytes/even/state", words: 8, width: 8 },
    { net: "bytes/odd/state", words: 8, width: 8 },
  ],
  addressBits: 4,
  caption: LABELS.memoryTable.caption,
  keptHeading: LABELS.memoryTable.kept,
  reads: [
    { port: LABELS.banks.even, address: "bytes/ROW", bank: 0 },
    { port: LABELS.banks.odd, address: "bytes/ROW", bank: 1 },
  ],
  writes: [
    { address: "bytes/ROW", enable: "bytes/WEE", bank: 0 },
    { address: "bytes/ROW", enable: "bytes/WEO", bank: 1 },
  ],
};

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

/** The challenge's bytes as a table in its task: address in binary, the byte in hexadecimal. */
const FILLED_TABLE = [
  `| ${LABELS.table.address} | ${LABELS.table.byte} |`,
  "| --- | --- |",
  ...FILLED_BYTES.map((v, k) => `| ${k.toString(2).padStart(4, "0")} | ${hex2(v)} |`),
].join("\n");

/** The addresses the challenge asks about, and what to set for each. */
export const READ_CASES = {
  word6: { A: "0110", WORD: 1 },
  byte9: { A: "1001", WORD: 0 },
  word9: { A: "1001", WORD: 1 },
} as const;

export const bytes: LessonInput = {
  id: "bytes",
  title: LABELS.title,
  module: 6,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["byte", "aligned", "alignment"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "bytes-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.word, signal: "WORD" },
                  { kind: "receiver", label: LABELS.scene.reading, width: 16 },
                  { kind: "switch", label: LABELS.scene.address, width: 4 },
                  { kind: "button", label: LABELS.scene.save, signal: "WE" },
                  { kind: "clock", label: LABELS.scene.clock },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [{ kind: "readout", label: LABELS.scene.display, width: 16 }],
            labels: { title: LABELS.scene.title, summary: LABELS.scene.summary },
          },
        },
      ],
    },
    { kind: "motivation", title: LABELS.titles.motivation, prose: PROSE.motivation },
    {
      kind: "prediction",
      title: LABELS.titles.prediction,
      prose: PROSE.prediction,
      interactives: [
        {
          id: "predict-high-byte",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictHigh,
          props: {
            question: PROSE.p1Question,
            libraryId: "byte-memory-block",
            run: [
              {
                label: "A 0110, D FF48, word, WE 1",
                set: { A: "0110", D: "1111111101001000", WORD: 1, WE: 1, CLK: 0 },
              },
              { label: "edge", clock: "CLK" },
              { label: "A 0111, byte, WE 0", set: { A: "0111", WORD: 0, WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "0000000011111111", label: LABELS.options.p1High },
              { value: "0000000001001000", label: LABELS.options.p1Low },
              { value: "XXXXXXXXXXXXXXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "WE", "WORD", "A", "D", "Q"],
          },
        },
        {
          id: "predict-half-word",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictHalf,
          props: {
            question: PROSE.p2Question,
            libraryId: "byte-memory-block",
            run: [
              {
                label: "A 0100, D FF48, word, WE 1",
                set: { A: "0100", D: "1111111101001000", WORD: 1, WE: 1, CLK: 0 },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "A 0101, D 0012, byte", set: { A: "0101", D: "0000000000010010", WORD: 0 } },
              { label: "edge 2", clock: "CLK" },
              { label: "A 0100, word, WE 0", set: { A: "0100", WORD: 1, WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "1111111101001000", label: LABELS.options.p2Same },
              { value: "0001001001001000", label: LABELS.options.p2Half },
              { value: "0000000000010010", label: LABELS.options.p2Whole },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "WE", "WORD", "A", "D", "Q"],
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
          id: "bytes-explorer",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.explorer,
          lead: PROSE.explorerLead,
          after: PROSE.explorerAfter,
          props: { libraryId: "byte-memory-block", clock: "CLK", memory: BYTES_TABLE },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-byte-write",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildWrite,
          lead: PROSE.buildLead,
          props: { challengeId: "byte-write" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "predict-odd-word",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictOdd,
          lead: PROSE.oddLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "byte-memory-block",
            run: [
              {
                label: "A 0100, D FF48, word, WE 1",
                set: { A: "0100", D: "1111111101001000", WORD: 1, WE: 1, CLK: 0 },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "A 0101, D 0000", set: { A: "0101", D: "0000000000000000" } },
              { label: "edge 2", clock: "CLK" },
              { label: "WE 0", set: { WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "1111111101001000", label: LABELS.options.p3Below },
              { value: "0000000000000000", label: LABELS.options.p3Zero },
              { value: "XXXXXXXXXXXXXXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "WE", "WORD", "A", "D", "Q", "ODD"],
          },
        },
        {
          id: "bytes-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          after: PROSE.faultsAfter,
          props: {
            libraryId: "byte-memory-block",
            scope: "bytes",
            faults: [
              {
                kind: "wrong-gate",
                path: "bytes/xorOdd",
                gate: "or",
                label: LABELS.faults.xorToOr,
              },
              {
                kind: "wrong-gate",
                path: "bytes/notA0",
                gate: "buf",
                label: LABELS.faults.notA0Cut,
              },
            ],
            run: [
              {
                label: "word FF48 at 0100",
                set: { A: "0100", D: "1111111101001000", WORD: 1, WE: 1, CLK: 0 },
                clock: "CLK",
              },
              {
                label: "byte 12 at 0111",
                set: { A: "0111", D: "0000000000010010", WORD: 0 },
                clock: "CLK",
              },
              {
                label: "word 0000 at 0101",
                set: { A: "0101", D: "0000000000000000", WORD: 1 },
                clock: "CLK",
              },
              { label: "read the word at 0100", set: { A: "0100", WE: 0 } },
              { label: "read the byte at 0111", set: { A: "0111", WORD: 0 } },
            ],
          },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          id: "bytes-opened",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.opened,
          lead: PROSE.openedLead,
          after: PROSE.openedAfter,
          props: {
            libraryId: "byte-memory-block",
            clock: "CLK",
            scope: "bytes",
            memory: BYTES_TABLE,
          },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "read-the-bytes",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.readBytes,
          lead: PROSE.readLead,
          props: { challengeId: "read-bytes" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "byte-write",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "WE" }, { name: "WORD" }, { name: "A0" }],
        outputs: [{ name: "WEE" }, { name: "WEO" }, { name: "ODD" }],
      },
      palette: ["and", "or", "not", "xor"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "combinational",
        vectors: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const we = k >> 2;
          const word = (k >> 1) & 1;
          const a0 = k & 1;
          return {
            label: `WE ${we}, WORD ${word}, A0 ${a0}`,
            inputs: { WE: we, WORD: word, A0: a0 },
            expect: {
              WEE: we & (1 - a0),
              WEO: we & (word ^ a0),
              ODD: word & a0,
            },
          };
        }),
      },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "byte-write-gates" },
    },
    {
      id: "read-bytes",
      title: LABELS.challengeTitles.c2,
      task: `${PROSE.c2Task}\n\n${FILLED_TABLE}`,
      gradedDirection: "answer",
      interface: { inputs: [], outputs: [] },
      fields: [
        { id: "word6", label: LABELS.fields.word6, kind: "text" },
        { id: "byte9", label: LABELS.fields.byte9, kind: "text" },
        { id: "word9", label: LABELS.fields.word9, kind: "text" },
      ],
      tests: {
        kind: "answers",
        grader: "memory-read",
        cases: (["word6", "byte9", "word9"] as const).map((field) => ({
          label: LABELS.cases[field],
          given: { field, circuit: "byte-memory-filled", ...READ_CASES[field] },
          expect: {},
        })),
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: { word6: "019C", byte9: "03", word9: "03E8" } },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Byte addressing and endianness explained with a 32-bit word stored at four consecutive addresses, a big-endian and a little-endian diagram side by side, and alignment as a rule of a named processor family that traps or splits a misaligned access.",
    howThisDiffers:
      "The lesson starts from the shop's own 16-bit reading (Module 1's FF48) and the office's smaller numbers, keeps a word as two bytes with the low byte at the lower address (the course machine's choice, said to be a choice), and builds the memory from two banks of bytes that the learner opens. The learner predicts where a word's high byte goes and what a byte write does to half a word, builds the banks' write enables and the ODD check as gates, and meets a misaligned word as a prediction: this memory refuses the write and reads the word below. No named processor, no big-endian and little-endian diagram, no 32-bit example beyond one sentence.",
  },
};
