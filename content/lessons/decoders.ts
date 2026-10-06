// Copyright © 2026 Christopher Snow

// Lesson: Module 3, lesson 2, decoders, demultiplexers, encoders and the comparator.
//
// The structure is here; the words are in decoders.prose.ts and decoders.labels.ts. The circuits
// are the model's (packages/dd-model: combinational.ts and library-combinational.ts); the numbers
// the prose states are pinned by decoders.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./decoders.labels";
import { PROSE } from "./decoders.prose";

const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** For each value of S1 S0, the four outputs: only the one S1 S0 names is 1. */
const DECODER_VECTORS = [0, 1, 2, 3].map((k) => ({
  label: `S1 ${k >> 1}, S0 ${k & 1}`,
  inputs: { S1: k >> 1, S0: k & 1 },
  expect: Object.fromEntries([0, 1, 2, 3].map((j) => [`Y${j}`, j === k ? 1 : 0])),
}));

const bits4 = (n: number) => n.toString(2).padStart(4, "0");

/**
 * Equal words, and words that differ in one bit at each place, and in every bit: a comparator
 * that ignores any one bit fails a row where only that bit differs.
 */
const COMPARATOR_VECTORS = [
  ...[0b0000, 0b1010, 0b0111, 0b1111].map((a) => ({
    label: `A ${bits4(a)}, B ${bits4(a)}`,
    inputs: { A: bits4(a), B: bits4(a) },
    expect: { EQ: 1 },
  })),
  ...[3, 2, 1, 0].map((i) => {
    const a = 0b0110;
    const b = a ^ (1 << i);
    return {
      label: `A ${bits4(a)}, B ${bits4(b)}`,
      inputs: { A: bits4(a), B: bits4(b) },
      expect: { EQ: 0 },
    };
  }),
  { label: "A 1010, B 0101", inputs: { A: "1010", B: "0101" }, expect: { EQ: 0 } },
];

export const decoders: LessonInput = {
  id: "decoders",
  title: LABELS.title,
  module: 3,
  order: 2,
  objectives: [...LABELS.objectives],
  introduces: ["decoder", "demultiplexer", "encoder", "comparator"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "lamps-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.switch, signal: "S1" },
                  { kind: "switch", label: LABELS.scene.switch, signal: "S0" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: LABELS.scene.lamps.map((label, k) => ({
              kind: "lamp",
              label,
              signal: `Y${k}`,
            })),
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
          id: "predict-lamp",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictLamp,
          props: {
            question: PROSE.p1Question,
            libraryId: "lamp-2",
            run: [{ label: "S1 = 1, S0 = 1", set: { S1: 1, S0: 1 } }],
            watch: "Y2",
            options: [
              { value: "0", label: LABELS.options.p1Off },
              { value: "1", label: LABELS.options.p1On },
            ],
            explain: PROSE.p1Explain,
            signals: ["S1", "S0", "Y2"],
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
          id: "decoder-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.decoderBlock,
          lead: PROSE.decoderBlockLead,
          after: PROSE.decoderBlockAfter,
          props: { libraryId: "decoder-block", canOpen: false },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-decoder",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildDecoder,
          lead: PROSE.buildDecoderLead,
          props: { challengeId: "decoder" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "decoder-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.decoderFaults,
          lead: PROSE.decoderFaultsLead,
          props: {
            // Shown once the checks have run, so the lead's prediction is not answered first.
            outcomes: PROSE.decoderFaultsAfter,
            libraryId: "decoder-gates",
            faults: [
              { kind: "stuck-at", net: "NS0", value: 1, label: LABELS.faults.ns0High },
              { kind: "wrong-gate", path: "and3", gate: "or", label: LABELS.faults.and3ToOr },
              { kind: "wrong-gate", path: "notS1", gate: "buf", label: LABELS.faults.ns1Cut },
            ],
            run: [
              { label: "S1 0, S0 0", set: { S1: 0, S0: 0 } },
              { label: "S1 0, S0 1", set: { S1: 0, S0: 1 } },
              { label: "S1 1, S0 0", set: { S1: 1, S0: 0 } },
              { label: "S1 1, S0 1", set: { S1: 1, S0: 1 } },
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
          id: "demux-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.demuxBlock,
          lead: PROSE.demuxBlockLead,
          after: PROSE.demuxBlockAfter,
          props: { libraryId: "demux-block" },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "predict-doors",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictDoors,
          lead: PROSE.predictDoorsLead,
          props: {
            question: PROSE.p2Question,
            libraryId: "encoder-word",
            run: [
              { label: "door 1 open", set: { L0: 0, L1: 1, L2: 0, L3: 0 } },
              { label: "door 2 opens too", set: { L2: 1 } },
            ],
            watch: "S",
            options: [
              { value: "01", label: LABELS.options.p2Room1 },
              { value: "10", label: LABELS.options.p2Room2 },
              { value: "11", label: LABELS.options.p2Room3 },
            ],
            explain: PROSE.p2Explain,
            signals: ["L1", "L2", "S"],
          },
        },
        {
          id: "comparator-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.comparatorBlock,
          lead: PROSE.comparatorBlockLead,
          after: PROSE.comparatorBlockAfter,
          props: {
            libraryId: "comparator-block",
            canOpen: false,
            initial: { A: "1000", B: "1000" },
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
          id: "build-comparator",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildComparator,
          lead: PROSE.buildComparatorLead,
          props: { challengeId: "comparator" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "decoder",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "S1" }, { name: "S0" }],
        outputs: [{ name: "Y0" }, { name: "Y1" }, { name: "Y2" }, { name: "Y3" }],
      },
      palette: ["and", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: DECODER_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "decoder-gates" },
    },
    {
      id: "comparator",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "A", width: 4 },
          { name: "B", width: 4 },
        ],
        outputs: [{ name: "EQ" }],
      },
      palette: ["split-4", "xor", "or", "nor", "and", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: COMPARATOR_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "comparator-parts" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A 2-to-4 or 3-to-8 decoder given as a truth table and a gate diagram, often with an enable input, used to select memory chips or drive a seven-segment display; an 8-to-3 priority encoder as a table with don't-care entries; a demultiplexer as a decoder with a data input; and a 4-bit magnitude comparator from a standard part.",
    howThisDiffers:
      "The decoder answers a question from the shop: four lamps beside the office display, one per room, with the lamp for the room on show lit. The learner predicts one lamp's AND gate from its wiring, finds the decoder's rule by pressing a closed block, then builds it. The fault lab shows each fault as two lamps lit or none, so the learner sees that each AND gate must accept one pattern alone. The explanation reads each output as the question \"does S1 S0 equal my number?\", which leads to the demultiplexer (steering one button to one room) and, in the generalisation, to comparing two words rather than a word and a number: twin sensors in one room whose words must agree. The encoder is met in reverse, from door switches, with a prediction of what two open doors do to the room number. No seven-segment display, no chip enables, no priority-encoder table.",
  },
};
