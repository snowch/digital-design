// Copyright © 2026 Christopher Snow

// Lesson: Module 6, lesson 4, the memory map: the shop's display and sensor at addresses, a ROM
// filled from a list, and the module's capstone, a memory of the shape a small program needs.
//
// The structure is here; the words are in memory-map.prose.ts and memory-map.labels.ts. The
// circuits are the model's (packages/dd-model: `shopMemory` in memory.ts). The addresses are this
// lesson's own choice, not the course machine's memory map. The numbers the prose states are
// pinned by memory-map.facts.test.ts.

import { SHOP_TABLE_WORDS } from "@dd/dd-model";
import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./memory-map.labels";
import { PROSE } from "./memory-map.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise", "always_ff"];

/** What the ROM challenge allows: arrays, and, new here, filling one from a list of values. */
export const ROM_CONSTRUCTS = [
  "module",
  "ports",
  "logic",
  "vector",
  "assign",
  "array",
  "array-init",
];

const word16 = (n: number) => n.toString(2).padStart(16, "0");
const hex4 = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");

/** The sensor's word in every figure: Module 1's freezer reading, -18.4 degrees. */
export const SENSOR = "1111111101001000";

/** The four words of the ROM challenge: the table's first four. */
export const LOWEST = SHOP_TABLE_WORDS.slice(0, 4);

const ROM_HEADER = "module room_limits(input logic [1:0] A, output logic [15:0] Q);";

const ROM_TEXT = `${ROM_HEADER}
  logic [15:0] limits [0:3] = '{${LOWEST.map((w) => `16'h${hex4(w)}`).join(", ")}};
  assign Q = limits[A];
endmodule
`;

const MAP = {
  regionBits: 2,
  lowBits: 4,
  regions: [
    { part: LABELS.parts.rom, select: "shop/Y0" },
    { part: LABELS.parts.ram, select: "shop/Y1" },
    { part: LABELS.parts.display, select: "shop/Y2" },
    { part: LABELS.parts.sensor, select: "shop/Y3" },
  ],
};

const SHOP_SIGNALS = ["CLK", "WE", "WORD", "A5", "A4", "A", "D", "Q", "DISPLAY"];

export const memoryMap: LessonInput = {
  id: "memory-map",
  title: LABELS.title,
  module: 6,
  order: 4,
  objectives: [...LABELS.objectives],
  introduces: ["memory-mapped", "ROM"],
  // Module 8 rations "instruction" for the machine's instructions, introduced in the lesson
  // instructions; this lesson points ahead to that machine before the word is taught.
  termExemptions: [
    {
      term: "instruction",
      reason:
        "Points ahead, in a sentence, to the machine Module 8 builds, which follows a list of instructions; the lesson teaches nothing about one.",
    },
  ],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "shop-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.address, width: 6 },
                  { kind: "switch", label: LABELS.scene.data, signal: "D", width: 16 },
                  { kind: "button", label: LABELS.scene.save, signal: "WE" },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                  { kind: "receiver", label: LABELS.scene.sensor, width: 16 },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [
              { kind: "readout", label: LABELS.scene.display, width: 16 },
              { kind: "readout", label: LABELS.scene.read, signal: "Q", width: 16 },
            ],
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
          id: "predict-display",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictDisplay,
          props: {
            question: PROSE.p1Question,
            libraryId: "shop-memory-block",
            run: [
              {
                label: "write 0012 at 10 0000",
                set: { A5: 1, A4: 0, A: "0000", D: word16(0x12), WORD: 1, WE: 1, CLK: 0, SENSOR },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "write 0030 at 10 0110", set: { A: "0110", D: word16(0x30) } },
              { label: "edge 2", clock: "CLK" },
            ],
            watch: "DISPLAY",
            options: [
              { value: word16(0x12), label: LABELS.options.p1First },
              { value: word16(0x30), label: LABELS.options.p1Second },
              { value: "XXXXXXXXXXXXXXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p1Explain,
            signals: SHOP_SIGNALS,
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
          id: "map-explorer",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.explorer,
          lead: PROSE.explorerLead,
          after: PROSE.explorerAfter,
          props: {
            libraryId: "shop-memory-block",
            clock: "CLK",
            initial: { SENSOR, WORD: 1 },
            map: MAP,
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
          id: "write-rom",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.writeRom,
          lead: PROSE.romLead,
          props: { challengeId: "rom-table" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "map-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "shop-memory-block",
            scope: "shop",
            initial: { SENSOR, WORD: 1 },
            faults: [
              {
                kind: "wrong-gate",
                path: "shop/andDisplay",
                gate: "or",
                label: LABELS.faults.displayOr,
                outcome: PROSE.faultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "shop/WERAM",
                value: 1,
                label: LABELS.faults.ramHigh,
                outcome: PROSE.faultsAfterFault2,
              },
            ],
            run: [
              {
                label: "write 0012 at 10 0000",
                set: { A5: 1, A4: 0, A: "0000", D: word16(0x12), WORD: 1, WE: 1, CLK: 0, SENSOR },
                clock: "CLK",
              },
              {
                label: "write 03E8 at 01 0100",
                set: { A4: 1, A5: 0, A: "0100", D: word16(0x3e8) },
                clock: "CLK",
              },
              { label: "read 01 0100", set: { WE: 0 } },
              { label: "read 01 0000", set: { A: "0000" } },
              { label: "read 10 0000", set: { A5: 1, A4: 0 } },
              { label: "read 11 0000", set: { A4: 1 } },
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
          id: "map-opened",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.opened,
          lead: PROSE.openedLead,
          after: PROSE.openedAfter,
          props: {
            libraryId: "shop-memory-block",
            clock: "CLK",
            scope: "shop",
            initial: { SENSOR, WORD: 1 },
            map: MAP,
          },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "predict-sensor-write",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictSensor,
          lead: PROSE.sensorLead,
          props: {
            question: PROSE.p2Question,
            libraryId: "shop-memory-block",
            run: [
              {
                label: "write 0000 at 11 0000",
                set: { A5: 1, A4: 1, A: "0000", D: word16(0), WORD: 1, WE: 1, CLK: 0, SENSOR },
              },
              { label: "edge", clock: "CLK" },
              { label: "WE 0", set: { WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: SENSOR, label: LABELS.options.p2Sensor },
              { value: word16(0), label: LABELS.options.p2Zero },
              { value: "XXXXXXXXXXXXXXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p2Explain,
            signals: SHOP_SIGNALS,
          },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "build-shop",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildShop,
          lead: PROSE.shopLead,
          props: { challengeId: "shop-memory" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "rom-table",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "write",
      interface: {
        inputs: [{ name: "A", width: 2 }],
        outputs: [{ name: "Q", width: 16 }],
      },
      allowedConstructs: ROM_CONSTRUCTS,
      initial: { hdl: `${ROM_HEADER}\n\nendmodule\n` },
      tests: {
        kind: "combinational",
        vectors: LOWEST.map((w, k) => ({
          label: `A ${k.toString(2).padStart(2, "0")}`,
          inputs: { A: k.toString(2).padStart(2, "0") },
          expect: { Q: word16(w) },
        })),
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: ROM_TEXT },
    },
    {
      id: "shop-memory",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "A5" },
          { name: "A4" },
          { name: "A", width: 4 },
          { name: "D", width: 16 },
          { name: "WORD" },
          { name: "WE" },
          { name: "CLK" },
          { name: "SENSOR", width: 16 },
        ],
        outputs: [
          { name: "Q", width: 16 },
          { name: "DISPLAY", width: 16 },
        ],
      },
      palette: [
        "decoder-2",
        "table-rom",
        "byte-memory",
        "word-register-16",
        "word-selector-16",
        "and",
        "not",
      ],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "read the table at 00 0000",
            set: { A5: 0, A4: 0, A: "0000", D: word16(0), WORD: 1, WE: 0, CLK: 0, SENSOR },
            expect: { Q: word16(SHOP_TABLE_WORDS[0]!) },
          },
          {
            label: "read the table at 00 0110",
            set: { A: "0110" },
            expect: { Q: word16(SHOP_TABLE_WORDS[3]!) },
          },
          { label: "write 03E8 at 01 0100", set: { A4: 1, A: "0100", D: word16(0x3e8), WE: 1 } },
          { label: "edge", set: { CLK: 1 }, expect: { Q: word16(0x3e8) } },
          {
            label: "A5 rises while the clock is high",
            set: { A5: 1 },
            expect: { Q: SENSOR, DISPLAY: "XXXXXXXXXXXXXXXX" },
          },
          { label: "clock low, write 0012 at 10 0100", set: { CLK: 0, A4: 0, D: word16(0x12) } },
          { label: "edge", set: { CLK: 1 }, expect: { Q: word16(0x12), DISPLAY: word16(0x12) } },
          {
            label: "clock low, read the byte at 01 0101",
            set: { CLK: 0, WE: 0, A5: 0, A4: 1, A: "0101", WORD: 0 },
            expect: { Q: word16(0x03) },
          },
          { label: "write the byte 7F at 01 0101", set: { WE: 1, D: word16(0x7f) } },
          { label: "edge", set: { CLK: 1 }, expect: { Q: word16(0x7f) } },
          {
            label: "clock low, read the word at 01 0100",
            set: { CLK: 0, WE: 0, WORD: 1, A: "0100" },
            expect: { Q: word16(0x7fe8) },
          },
          { label: "write 0000 at 11 0000", set: { A5: 1, A4: 1, A: "0000", WE: 1, D: word16(0) } },
          { label: "edge", set: { CLK: 1 }, expect: { Q: SENSOR, DISPLAY: word16(0x12) } },
          {
            label: "clock low, read the table at 00 1110",
            set: { CLK: 0, WE: 0, A5: 0, A4: 0, A: "1110" },
            expect: { Q: word16(SHOP_TABLE_WORDS[7]!) },
          },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "shop-parts" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A microcontroller's published memory map (flash, SRAM and peripheral registers at fixed hexadecimal ranges), memory-mapped I/O shown as a UART or GPIO register at a named address, and a ROM introduced as a chip programmed at the factory or from a $readmemh file.",
    howThisDiffers:
      "The parts are the shop's: a table of each room's lowest and highest temperatures, the memory of bytes from the previous lesson, the office display and the freezer room's sensor, at addresses the lesson chooses (a quarter each, by the top two bits) and says are its own, not the course machine's. The learner predicts that the display answers at all sixteen of its addresses and that a write to the sensor changes nothing; the ROM is written as an array filled from a list in the text, not from a file; and the capstone is drawn from the blocks the module built and tested by the reads and writes a small program would make.",
  },
};
