// Copyright © 2026 Christopher Snow

// Lesson: Module 3, lesson 1, selectors.
//
// The structure is here; the words are in selectors.prose.ts and selectors.labels.ts. The circuits
// are the model's (packages/dd-model: combinational.ts and library-combinational.ts); the numbers
// the prose states are pinned by selectors.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./selectors.labels";
import { PROSE } from "./selectors.prose";

/** A drawn challenge's import panel: gates as `assign`, one bit at a time. */
const DRAW_CONSTRUCTS = ["module", "ports", "logic", "assign", "op-bitwise"];

/** How many wires carry a room's word from its receiver, and the display's word from the circuit. */
const WORD_WIDTH = 16;

/** The two rooms' 4-bit words in the word-selector figure: the last four bits of each room's word. */
export const ROOM_WORDS = { A: "1000", B: "0110" } as const;

/** Every pattern of S, A and B, labelled as the page shows it. */
const SELECTOR_2_VECTORS = [0, 1].flatMap((s) =>
  [0, 1].flatMap((a) =>
    [0, 1].map((b) => ({
      label: `S ${s}, A ${a}, B ${b}`,
      inputs: { S: s, A: a, B: b },
      expect: { Y: s ? b : a },
    })),
  ),
);

/**
 * For each value of S1 S0, two rows: only the chosen input at 1 (Y must be 1), and every input at
 * 1 but the chosen one (Y must be 0). A circuit that picks the wrong input fails one of the two.
 */
const SELECTOR_4_VECTORS = [0, 1, 2, 3].flatMap((k) => {
  const names = ["A", "B", "C", "D"] as const;
  const s = { S1: k >> 1, S0: k & 1 };
  const only = Object.fromEntries(names.map((n, j) => [n, j === k ? 1 : 0]));
  const allBut = Object.fromEntries(names.map((n, j) => [n, j === k ? 0 : 1]));
  const chosen = names[k];
  return [
    {
      label: `S1 ${s.S1}, S0 ${s.S0}, only ${chosen} at 1`,
      inputs: { ...s, ...only },
      expect: { Y: 1 },
    },
    {
      label: `S1 ${s.S1}, S0 ${s.S0}, all but ${chosen} at 1`,
      inputs: { ...s, ...allBut },
      expect: { Y: 0 },
    },
  ];
});

export const selectors: LessonInput = {
  id: "selectors",
  title: LABELS.title,
  module: 3,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: ["multiplexer", "bus"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "rooms-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            // What is in the office: each room's cable ends at its own receiver, which puts the
            // room's word on 16 wires, as the question says; the rooms are not drawn.
            sources: [
              {
                items: [
                  { kind: "receiver", label: LABELS.scene.receiverA, width: WORD_WIDTH },
                  { kind: "receiver", label: LABELS.scene.receiverB, width: WORD_WIDTH },
                ],
              },
              // A group of its own, so the gap above it keeps S clear of room B's count.
              { items: [{ kind: "switch", label: LABELS.scene.switch, signal: "S" }] },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [{ kind: "readout", label: LABELS.scene.display, width: WORD_WIDTH }],
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
          id: "predict-or",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictOr,
          props: {
            question: PROSE.p1Question,
            libraryId: "rooms-or",
            run: [{ label: "A = 0, B = 1", set: { A: 0, B: 1 } }],
            watch: "Y",
            options: [
              { value: "0", label: LABELS.options.p1RoomA },
              { value: "1", label: LABELS.options.p1RoomB },
            ],
            explain: PROSE.p1Explain,
            signals: ["A", "B", "Y"],
          },
        },
        {
          id: "predict-and",
          kind: "prediction",
          timeModel: "settle",
          caption: LABELS.captions.predictAnd,
          props: {
            question: PROSE.p2Question,
            libraryId: "and-pass",
            run: [
              { label: "S = 0, A = 0", set: { S: 0, A: 0 } },
              { label: "A = 1", set: { A: 1 } },
            ],
            watch: "Y",
            options: [
              { value: "0", label: LABELS.options.p2Zero },
              { value: "1", label: LABELS.options.p2One },
            ],
            explain: PROSE.p2Explain,
            signals: ["S", "A", "Y"],
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
          id: "selector-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.selectorBlock,
          lead: PROSE.selectorBlockLead,
          after: PROSE.selectorBlockAfter,
          props: { libraryId: "selector-2-block", canOpen: false },
        },
      ],
    },
    {
      kind: "construction",
      title: LABELS.titles.construction,
      prose: PROSE.construction,
      interactives: [
        {
          id: "build-selector-2",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildSelector2,
          lead: PROSE.buildSelector2Lead,
          props: { challengeId: "selector-2" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "selector-faults",
          kind: "fault-lab",
          timeModel: "settle",
          caption: LABELS.captions.selectorFaults,
          lead: PROSE.selectorFaultsLead,
          props: {
            // Each fault's outcome shows once that fault has run, so the lead's prediction is not answered first.

            libraryId: "selector-2-gates",
            faults: [
              {
                kind: "wrong-gate",
                path: "notS",
                gate: "buf",
                label: LABELS.faults.noNot,
                outcome: PROSE.selectorFaultsAfterFault1,
              },
              {
                kind: "stuck-at",
                net: "S",
                value: 1,
                label: LABELS.faults.sHigh,
                outcome: PROSE.selectorFaultsAfterFault2,
              },
              {
                kind: "wrong-gate",
                path: "orY",
                gate: "xor",
                label: LABELS.faults.orToXor,
                outcome: PROSE.selectorFaultsAfterFault3,
              },
            ],
            run: [
              { label: "S 0, A 1, B 0", set: { S: 0, A: 1, B: 0 } },
              { label: "S 0, A 0, B 1", set: { S: 0, A: 0, B: 1 } },
              { label: "S 1, A 1, B 0", set: { S: 1, A: 1, B: 0 } },
              { label: "S 1, A 0, B 1", set: { S: 1, A: 0, B: 1 } },
              { label: "S 0, A 1, B 1", set: { S: 0, A: 1, B: 1 } },
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
          id: "word-selector",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.wordSelector,
          lead: PROSE.wordSelectorLead,
          after: PROSE.wordSelectorAfter,
          props: { libraryId: "selector-word", initial: { ...ROOM_WORDS } },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: PROSE.generalisation,
      interactives: [
        {
          id: "four-way-block",
          kind: "circuit-explorer",
          timeModel: "settle",
          caption: LABELS.captions.fourWayBlock,
          lead: PROSE.fourWayBlockLead,
          after: PROSE.fourWayBlockAfter,
          props: { libraryId: "selector-4-block", canOpen: false },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "build-selector-4",
          kind: "challenge",
          timeModel: "settle",
          caption: LABELS.captions.buildSelector4,
          lead: PROSE.buildSelector4Lead,
          props: { challengeId: "selector-4" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "selector-2",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "A" }, { name: "B" }, { name: "S" }],
        outputs: [{ name: "Y" }],
      },
      palette: ["and", "or", "not"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: SELECTOR_2_VECTORS },
      hints: [...PROSE.c1Hints],
      reference: { libraryId: "selector-2-gates" },
    },
    {
      id: "selector-4",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "draw",
      interface: {
        inputs: [
          { name: "A" },
          { name: "B" },
          { name: "C" },
          { name: "D" },
          { name: "S1" },
          { name: "S0" },
        ],
        outputs: [{ name: "Y" }],
      },
      palette: ["selector-2"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: { kind: "combinational", vectors: SELECTOR_4_VECTORS },
      hints: [...PROSE.c2Hints],
      reference: { libraryId: "selector-4-blocks" },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "A 2-to-1 multiplexer given as a symbol and a truth table, then the 4-to-1 multiplexer with its truth table and a sum-of-products circuit of four three-input AND gates, often followed by a chip sequence such as Nand2Tetris's Mux, Mux16 and Mux4Way16.",
    howThisDiffers:
      "The lesson starts from Module 1's freezer-room shop gaining a second room: two sensor cables and one display. The learner first predicts what joining the two cables with an OR gate does (a 1 from either room gets through), then what an AND gate does with a control input at 0 (it blocks), and finds the selector's behaviour by pressing a closed block before building it from those two ideas. No truth table of the selector is shown; the tests are its rows. The fault lab includes a fault that every check passes (OR changed to XOR), to show that the two passed signals are never both 1. The word-wide selector is shown as one 2-way selector per bit sharing S, and the 4-way selector is built from three 2-way selector blocks, so the learner meets a block made of blocks rather than a four-AND sum of products.",
  },
};
