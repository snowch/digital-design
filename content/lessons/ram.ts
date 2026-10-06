// Copyright © 2026 Christopher Snow

// Lesson: Module 6, lesson 1, RAM: many words, each found by its address.
//
// The structure is here; the words are in ram.prose.ts and ram.labels.ts. The circuits are the
// model's (packages/dd-model: memory.ts and library-memory.ts): Module 3's decoder and selector
// around Module 5's registers. The numbers the prose states are pinned by ram.facts.test.ts, read
// off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./ram.labels";
import { PROSE } from "./ram.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise", "always_ff"];

/** The memory explorer's view of the four-word RAM: its words, its address and its write. */
const RAM_TABLE = {
  words: ["ram/M0", "ram/M1", "ram/M2", "ram/M3"],
  addressBits: 2,
  reads: [{ port: "Q", address: ["A1", "A0"] }],
  writes: [{ address: ["A1", "A0"], enable: "WE" }],
};

/** Every word written with its own value, then every word read back: the fault lab's run. */
export const FILL_AND_READ = [
  { label: "write 0001 at 00", set: { A1: 0, A0: 0, D: "0001", WE: 1, CLK: 0 }, clock: "CLK" },
  { label: "write 0010 at 01", set: { A0: 1, D: "0010" }, clock: "CLK" },
  { label: "write 0100 at 10", set: { A1: 1, A0: 0, D: "0100" }, clock: "CLK" },
  { label: "write 1000 at 11", set: { A0: 1, D: "1000" }, clock: "CLK" },
  { label: "read 00", set: { WE: 0, A1: 0, A0: 0 } },
  { label: "read 01", set: { A0: 1 } },
  { label: "read 10", set: { A1: 1, A0: 0 } },
  { label: "read 11", set: { A0: 1 } },
];

export const ram: LessonInput = {
  id: "ram",
  title: LABELS.title,
  module: 6,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["address", "RAM"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "settings-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.number, width: 4 },
                  { kind: "switch", label: LABELS.scene.room, signal: "A1" },
                  { kind: "switch", label: LABELS.scene.room, signal: "A0" },
                  { kind: "button", label: LABELS.scene.save },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [{ kind: "readout", label: LABELS.scene.display, width: 4 }],
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
          id: "predict-other-word",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictOther,
          props: {
            question: PROSE.p1Question,
            libraryId: "ram-block",
            run: [
              { label: "A 10, D 0110, WE 1", set: { A1: 1, A0: 0, D: "0110", WE: 1, CLK: 0 } },
              { label: "edge", clock: "CLK" },
              { label: "A 01, WE 0", set: { A1: 0, A0: 1, WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "0110", label: LABELS.options.p1Same },
              { value: "0000", label: LABELS.options.p1Zero },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "WE", "A1", "A0", "D", "Q"],
          },
        },
        {
          id: "predict-two-words",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictTwo,
          props: {
            question: PROSE.p2Question,
            libraryId: "ram-block",
            run: [
              { label: "A 10, D 0110, WE 1", set: { A1: 1, A0: 0, D: "0110", WE: 1, CLK: 0 } },
              { label: "edge 1", clock: "CLK" },
              { label: "A 01, D 1001", set: { A1: 0, A0: 1, D: "1001" } },
              { label: "edge 2", clock: "CLK" },
              { label: "A 10, WE 0", set: { A1: 1, A0: 0, WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "0110", label: LABELS.options.p2First },
              { value: "1001", label: LABELS.options.p2Second },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "WE", "A1", "A0", "D", "Q"],
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
          id: "ram-explorer",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.explorer,
          lead: PROSE.explorerLead,
          after: PROSE.explorerAfter,
          props: { libraryId: "ram-block", clock: "CLK", memory: RAM_TABLE },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-two-words",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildTwo,
          lead: PROSE.buildLead,
          props: { challengeId: "two-words" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "ram-faults",
          kind: "fault-lab",
          timeModel: "clocked",
          caption: LABELS.captions.faults,
          lead: PROSE.faultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "ram-block",
            scope: "ram",
            faults: [
              {
                kind: "stuck-at",
                net: "ram/W2",
                value: 1,
                label: LABELS.faults.w2High,
                outcome: PROSE.faultsAfterFault1,
              },
              {
                kind: "wrong-gate",
                path: "ram/decoder/notS0",
                gate: "buf",
                label: LABELS.faults.notS0Cut,
                outcome: PROSE.faultsAfterFault2,
              },
              {
                kind: "wrong-gate",
                path: "ram/andW3",
                gate: "or",
                label: LABELS.faults.andW3ToOr,
                outcome: PROSE.faultsAfterFault3,
              },
            ],
            run: FILL_AND_READ,
          },
        },
        {
          id: "predict-past-the-end",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictWide,
          lead: PROSE.wideLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "ram-wide",
            run: [
              {
                label: "A 001, D 0101, WE 1",
                set: { A2: 0, A1: 0, A0: 1, D: "0101", WE: 1, CLK: 0 },
              },
              { label: "edge 1", clock: "CLK" },
              { label: "A 101, D 1110", set: { A2: 1, D: "1110" } },
              { label: "edge 2", clock: "CLK" },
              { label: "A 001, WE 0", set: { A2: 0, WE: 0 } },
            ],
            watch: "Q",
            options: [
              { value: "0101", label: LABELS.options.p3Kept },
              { value: "1110", label: LABELS.options.p3Over },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "WE", "A2", "A1", "A0", "D", "Q"],
          },
        },
        {
          id: "wide-explorer",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.wideExplorer,
          lead: PROSE.wideExplorerLead,
          props: { libraryId: "ram-wide", clock: "CLK", memory: RAM_TABLE },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [
        {
          id: "ram-opened",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.opened,
          lead: PROSE.openedLead,
          after: PROSE.openedAfter,
          props: { libraryId: "ram-block", clock: "CLK", scope: "ram", memory: RAM_TABLE },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "big-memory",
          kind: "memory-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.big,
          lead: PROSE.bigLead,
          after: PROSE.bigAfter,
          props: {
            libraryId: "memory-16",
            clock: "CLK",
            memory: {
              state: { net: "memory/state", words: 16, width: 16 },
              addressBits: 4,
              reads: [{ port: "Q", address: "A" }],
              writes: [{ address: "A", enable: "WE" }],
            },
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
          id: "build-guard",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildGuard,
          lead: PROSE.guardLead,
          props: { challengeId: "guard" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "two-words",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A" }, { name: "D", width: 4 }, { name: "WE" }, { name: "CLK" }],
        outputs: [{ name: "Q", width: 4 }],
      },
      palette: ["register", "word-selector-2", "and", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "A 0, D 0110, WE 1, clock low", set: { A: 0, D: "0110", WE: 1, CLK: 0 } },
          { label: "edge: write at 0", set: { CLK: 1 }, expect: { Q: "0110" } },
          {
            label: "clock low, A 1, D 1001",
            set: { CLK: 0, A: 1, D: "1001" },
            expect: { Q: "XXXX" },
          },
          { label: "edge: write at 1", set: { CLK: 1 }, expect: { Q: "1001" } },
          { label: "A falls while the clock is high", set: { A: 0 }, expect: { Q: "0110" } },
          {
            label: "clock low, WE 0, D 1111",
            set: { CLK: 0, WE: 0, D: "1111" },
            expect: { Q: "0110" },
          },
          { label: "edge with WE 0", set: { CLK: 1 }, expect: { Q: "0110" } },
          { label: "WE rises while the clock is high", set: { WE: 1 }, expect: { Q: "0110" } },
          { label: "clock falls", set: { CLK: 0 }, expect: { Q: "0110" } },
          { label: "A 1, WE 0", set: { A: 1, WE: 0 }, expect: { Q: "1001" } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "ram-2-parts" },
    },
    {
      id: "guard",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "A2" },
          { name: "A1" },
          { name: "A0" },
          { name: "D", width: 4 },
          { name: "WE" },
          { name: "CLK" },
        ],
        outputs: [{ name: "Q", width: 4 }, { name: "OK" }],
      },
      palette: ["ram", "and", "not", "or"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "A 001, D 0101, WE 1, clock low",
            set: { A2: 0, A1: 0, A0: 1, D: "0101", WE: 1, CLK: 0 },
            expect: { OK: 1 },
          },
          { label: "edge: write at 001", set: { CLK: 1 }, expect: { Q: "0101", OK: 1 } },
          {
            label: "clock low, A 101, D 1110",
            set: { CLK: 0, A2: 1, D: "1110" },
            expect: { OK: 0 },
          },
          { label: "edge at 101", set: { CLK: 1 }, expect: { OK: 0 } },
          {
            label: "A2 falls while the clock is high",
            set: { A2: 0 },
            expect: { Q: "0101", OK: 1 },
          },
          { label: "clock low, A 011, D 0011", set: { CLK: 0, A1: 1, D: "0011" } },
          { label: "edge: write at 011", set: { CLK: 1 }, expect: { Q: "0011", OK: 1 } },
          { label: "A2 rises while the clock is high", set: { A2: 1 }, expect: { OK: 0 } },
          {
            label: "clock low, A 001, WE 0",
            set: { CLK: 0, A2: 0, A1: 0, WE: 0 },
            expect: { Q: "0101" },
          },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "ram-guard" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A RAM introduced as an array of bit cells in rows and columns, each row selected by a wordline from an address decoder and each column read on a bitline (Harris and Harris's memory-array chapter), or built bottom-up as a chain of ever larger RAMs from registers (Nand2Tetris's RAM8, RAM64 and so on, in its project 3), usually with a read and write timing diagram from a datasheet.",
    howThisDiffers:
      "The lesson starts from the shop: one setting per room, kept and shown on request, with the rooms numbered as the decoders lesson numbered them. The learner predicts that a read follows the address with no edge (an unwritten word shows XXXX) before the RAM is opened, then opens it one level at a time to Module 3's decoder and selector and Module 5's registers. There are no bit cells, wordlines or bitlines and no chain of larger RAMs: the larger memory is shown as one component. The break is an address with more bits than the memory decodes, predicted and then guarded against in the challenge; a fault the checks miss shows that passing tests do not prove a circuit right.",
  },
};
