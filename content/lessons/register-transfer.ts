// Lesson: How do registers pass words to each other?  (module 5, lesson 3)
//
// The structure is here; the words are in register-transfer.prose.ts and
// register-transfer.labels.ts. The registers lesson's display gains a second register that keeps
// the number saved before the latest one: at an edge where SAVE is 1, NOW takes the switches and
// PREV takes NOW, both at that one edge. The lab writes the same pair, with an undo, for the
// freezer room's 16-bit readings.

import type { LessonInput } from "@dd/lesson-schema";

import { PROSE } from "./register-transfer.prose";
import { LABELS } from "./register-transfer.labels";

/** What a drawn challenge's import panel accepts: registers as `always_ff` with `if`. */
const DRAW_CONSTRUCTS = ["module", "ports", "logic", "vector", "always_ff", "if"];

const TEXT_CONSTRUCTS = [...DRAW_CONSTRUCTS, "assign", "op-bitwise"];

const NOW_PREV_TEXT = `module now_prev(input logic [3:0] IN, input logic SAVE, input logic RST, input logic CLK, output logic [3:0] NOW, output logic [3:0] PREV);
  always_ff @(posedge CLK) begin
    if (RST) NOW <= 4'b0000;
    else if (SAVE) NOW <= IN;
  end
  always_ff @(posedge CLK) begin
    if (RST) PREV <= 4'b0000;
    else if (SAVE) PREV <= NOW;
  end
endmodule
`;

const READINGS_HEADER =
  "module readings(input logic [15:0] IN, input logic NEW, input logic UNDO, input logic RST, input logic CLK, output logic [15:0] NOW, output logic [15:0] PREV);";

const READINGS_TEXT = `${READINGS_HEADER}
  always_ff @(posedge CLK) begin
    if (RST) begin
      NOW <= 16'h0000;
      PREV <= 16'h0000;
    end
    else if (NEW) begin
      NOW <= IN;
      PREV <= NOW;
    end
    else if (UNDO) NOW <= PREV;
  end
endmodule
`;

/** Module 1's two readings of the freezer room, and a third. */
export const READINGS = { first: "0xFF48", second: "0xFF06", third: "0x0012" } as const;

export const registerTransfer: LessonInput = {
  id: "register-transfer",
  title: LABELS.title,
  module: 5,
  order: 3,
  objectives: [...LABELS.objectives],
  introduces: ["register transfer"],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "transfer-scene",
          kind: "scene",
          timeModel: "none",
          caption: LABELS.captions.scene,
          props: {
            sources: [
              {
                items: [
                  { kind: "switch", label: LABELS.scene.switches, signal: "IN", width: 4 },
                  { kind: "button", label: LABELS.scene.save, signal: "SAVE" },
                  { kind: "clock", label: LABELS.scene.clock, signal: "CLK" },
                ],
              },
            ],
            circuit: LABELS.scene.circuit,
            outputs: [
              { kind: "readout", label: LABELS.scene.now, width: 4 },
              { kind: "readout", label: LABELS.scene.prev, width: 4 },
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
          id: "predict-prev",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictPrev,
          props: {
            question: PROSE.p1Question,
            libraryId: "now-prev",
            run: [
              { label: "RST 1", set: { RST: 1, SAVE: 0, IN: "0000", CLK: 0 }, clock: "CLK" },
              { label: "save 0011", set: { RST: 0, IN: "0011", SAVE: 1 }, clock: "CLK" },
              { label: "save 0101", set: { IN: "0101" }, clock: "CLK" },
            ],
            watch: "PREV",
            options: [
              { value: "0101", label: LABELS.options.p1New },
              { value: "0011", label: LABELS.options.p1Old },
              { value: "0000", label: LABELS.options.p1Zero },
            ],
            explain: PROSE.p1Explain,
            signals: ["CLK", "SAVE", "IN", "NOW", "PREV"],
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
          id: "now-prev-explorer",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.nowPrevExplorer,
          lead: PROSE.nowPrevExplorerLead,
          after: PROSE.nowPrevExplorerAfter,
          props: {
            libraryId: "now-prev",
            clock: "CLK",
            prime: [{ set: { RST: 1, CLK: 0 }, clock: "CLK" }, { set: { RST: 0 } }],
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
          id: "build-now-prev",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.buildNowPrev,
          lead: PROSE.buildNowPrevLead,
          props: { challengeId: "now-prev" },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "predict-long-press",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictLongPress,
          lead: PROSE.predictLongPressLead,
          props: {
            question: PROSE.p2Question,
            libraryId: "now-prev",
            run: [
              { label: "RST 1", set: { RST: 1, SAVE: 0, IN: "0000", CLK: 0 }, clock: "CLK" },
              { label: "save 0011", set: { RST: 0, IN: "0011", SAVE: 1 }, clock: "CLK" },
              { label: "SAVE 0", set: { SAVE: 0, IN: "0101" }, clock: "CLK" },
              { label: "press 1", set: { SAVE: 1 }, clock: "CLK" },
              { label: "press 2", clock: "CLK" },
              { label: "press 3", clock: "CLK" },
            ],
            watch: "PREV",
            options: [
              { value: "0011", label: LABELS.options.p2Old },
              { value: "0101", label: LABELS.options.p2New },
              { value: "0000", label: LABELS.options.p2Zero },
            ],
            explain: PROSE.p2Explain,
            signals: ["CLK", "SAVE", "IN", "NOW", "PREV"],
          },
        },
        {
          id: "save-once",
          kind: "circuit-explorer",
          timeModel: "clocked",
          caption: LABELS.captions.saveOnce,
          lead: PROSE.saveOnceLead,
          after: PROSE.saveOnceAfter,
          props: {
            libraryId: "now-prev-once",
            clock: "CLK",
            prime: [
              { set: { RST: 1, CLK: 0 }, clock: "CLK" },
              { set: { RST: 0, IN: "0011", SAVE: 1 }, clock: "CLK" },
              { set: { SAVE: 0, IN: "0101" }, clock: "CLK" },
            ],
          },
        },
      ],
    },
    {
      kind: "explanation",
      title: LABELS.titles.explanation,
      prose: PROSE.explanation,
      interactives: [],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "now-prev-as-text",
          kind: "circuit-text",
          timeModel: "none",
          caption: LABELS.captions.nowPrevAsText,
          lead: PROSE.nowPrevAsTextLead,
          after: PROSE.nowPrevAsTextAfter,
          props: { libraryId: "now-prev" },
        },
      ],
    },
    {
      kind: "challenge",
      title: LABELS.titles.challenge,
      prose: "",
      interactives: [
        {
          id: "predict-swap",
          kind: "prediction",
          timeModel: "clocked",
          caption: LABELS.captions.predictSwap,
          lead: PROSE.predictSwapLead,
          props: {
            question: PROSE.p3Question,
            libraryId: "swap",
            run: [
              { label: "load", set: { A: "0011", B: "0101", LOAD: 1, CLK: 0 }, clock: "CLK" },
              { label: "LOAD 0", set: { LOAD: 0 }, clock: "CLK" },
            ],
            watch: "X",
            options: [
              { value: "0011", label: LABELS.options.p3Same },
              { value: "0101", label: LABELS.options.p3Swapped },
              { value: "XXXX", label: LABELS.options.unknown },
            ],
            explain: PROSE.p3Explain,
            signals: ["CLK", "LOAD", "X", "Y"],
          },
        },
        {
          id: "write-readings",
          kind: "challenge",
          timeModel: "clocked",
          caption: LABELS.captions.writeReadings,
          lead: PROSE.writeReadingsLead,
          props: { challengeId: "readings" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "now-prev",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "draw",
      interface: {
        inputs: [{ name: "IN", width: 4 }, { name: "SAVE" }, { name: "RST" }, { name: "CLK" }],
        outputs: [
          { name: "NOW", width: 4 },
          { name: "PREV", width: 4 },
        ],
      },
      palette: ["register-4-reset-enable"],
      allowedConstructs: DRAW_CONSTRUCTS,
      tests: {
        kind: "sequence",
        steps: [
          { label: "RST 1, clock low", set: { RST: 1, SAVE: 0, IN: "0000", CLK: 0 } },
          { label: "edge with RST 1", set: { CLK: 1 }, expect: { NOW: "0000", PREV: "0000" } },
          { label: "clock low, IN 0011, SAVE 1", set: { CLK: 0, RST: 0, IN: "0011", SAVE: 1 } },
          { label: "edge saving 0011", set: { CLK: 1 }, expect: { NOW: "0011", PREV: "0000" } },
          {
            label: "SAVE falls while the clock is high",
            set: { SAVE: 0 },
            expect: { NOW: "0011", PREV: "0000" },
          },
          { label: "clock low, IN 0101", set: { CLK: 0, IN: "0101" } },
          { label: "edge with SAVE 0", set: { CLK: 1 }, expect: { NOW: "0011", PREV: "0000" } },
          {
            label: "SAVE rises while the clock is high",
            set: { SAVE: 1 },
            expect: { NOW: "0011", PREV: "0000" },
          },
          { label: "clock low", set: { CLK: 0 } },
          { label: "edge saving 0101", set: { CLK: 1 }, expect: { NOW: "0101", PREV: "0011" } },
          { label: "clock low, IN 1001", set: { CLK: 0, IN: "1001" } },
          { label: "edge saving 1001", set: { CLK: 1 }, expect: { NOW: "1001", PREV: "0101" } },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { hdl: NOW_PREV_TEXT },
    },
    {
      id: "readings",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "write",
      interface: {
        inputs: [
          { name: "IN", width: 16 },
          { name: "NEW" },
          { name: "UNDO" },
          { name: "RST" },
          { name: "CLK" },
        ],
        outputs: [
          { name: "NOW", width: 16 },
          { name: "PREV", width: 16 },
        ],
      },
      allowedConstructs: TEXT_CONSTRUCTS,
      initial: { hdl: `${READINGS_HEADER}\n\nendmodule\n` },
      tests: {
        kind: "sequence",
        steps: [
          {
            label: "RST 1, clock low",
            set: { RST: 1, NEW: 0, UNDO: 0, IN: READINGS.first, CLK: 0 },
          },
          { label: "edge with RST 1", set: { CLK: 1 }, expect: { NOW: "0x0000", PREV: "0x0000" } },
          { label: "clock low, NEW 1", set: { CLK: 0, RST: 0, NEW: 1 } },
          {
            label: "edge with the first reading",
            set: { CLK: 1 },
            expect: { NOW: READINGS.first, PREV: "0x0000" },
          },
          {
            label: "NEW falls while the clock is high",
            set: { NEW: 0, IN: READINGS.second },
            expect: { NOW: READINGS.first, PREV: "0x0000" },
          },
          { label: "clock low, NEW 1", set: { CLK: 0, NEW: 1 } },
          {
            label: "edge with the second reading",
            set: { CLK: 1 },
            expect: { NOW: READINGS.second, PREV: READINGS.first },
          },
          { label: "clock low, NEW 0, UNDO 1", set: { CLK: 0, NEW: 0, UNDO: 1 } },
          {
            label: "edge with UNDO 1",
            set: { CLK: 1 },
            expect: { NOW: READINGS.first, PREV: READINGS.first },
          },
          {
            label: "clock low, NEW 1 and UNDO 1",
            set: { CLK: 0, NEW: 1, IN: READINGS.third },
          },
          {
            label: "edge with NEW 1 and UNDO 1",
            set: { CLK: 1 },
            expect: { NOW: READINGS.third, PREV: READINGS.first },
          },
          { label: "clock low, RST 1 and NEW 1", set: { CLK: 0, RST: 1 } },
          {
            label: "edge with RST 1 and NEW 1",
            set: { CLK: 1 },
            expect: { NOW: "0x0000", PREV: "0x0000" },
          },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { hdl: READINGS_TEXT },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "Register-transfer notation introduced on an accumulator or a bus with three-state drivers: R1 ← R2 on a control signal, a datapath of registers around one ALU, and microoperations listed in a table; the swap of two registers through a temporary register as in software.",
    howThisDiffers:
      "The registers lesson's own display gains a second register that keeps the number saved before the latest one, so the first transfer the learner predicts is the one a software habit gets wrong (PREV gets NOW's old word, at the same edge). The failure experiment is a button held down across several edges, which saves the same number twice and loses the older one; the fix is one more flip-flop that keeps SAVE's value from the edge before, itself a register transfer. The swap needs no temporary register and is predicted before it is explained. The lab writes the pair, with an undo, for the 16-bit readings of Module 1's freezer room. No bus, three-state driver or accumulator appears.",
  },
};
