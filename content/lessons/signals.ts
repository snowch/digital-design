// Copyright © 2026 Chris Snow

// Lesson: Module 1, lesson 1, signals and bits.
//
// The structure is here; the words are in signals.prose.ts and signals.labels.ts. The recordings,
// the readings and the graders are the model's (packages/dd-model: signals, bits, graders); the
// numbers the prose states are pinned by signals.facts.test.ts, read off the figures' own props.

import type { LessonInput } from "@dd/lesson-schema";

import { LABELS } from "./signals.labels";
import { PROSE } from "./signals.prose";

/** The 16 bits the freezer-room sensor sends: -184, the temperature in tenths of a degree. */
export const SENSOR_BITS = "1111 1111 0100 1000";

/** The second, colder freezer room's temperature for the word challenge: -250 tenths. */
export const FREEZER_TENTHS = -250;

/** What the sensor can measure, in tenths of a degree: the explanation's check on a reading. */
export const SENSOR_RANGE_TENTHS = { low: -500, high: 500 } as const;

export const signals: LessonInput = {
  id: "signals",
  title: LABELS.title,
  module: 1,
  order: 1,
  objectives: [...LABELS.objectives],
  introduces: [
    "bit",
    "threshold",
    "noise margin",
    "binary",
    "word",
    "unsigned",
    "signed",
    "hexadecimal",
  ],
  // Module 3 rations "carry" for the adder's carry; this lesson uses the everyday verb.
  termExemptions: [
    {
      term: "carry",
      reason:
        'Used as the everyday verb ("carry it across", noise that carries a sample), not the carry an adder passes from one column to the next.',
    },
  ],
  sections: [
    {
      kind: "question",
      title: LABELS.titles.question,
      prose: PROSE.question,
      interactives: [
        {
          id: "signal-path",
          kind: "signal-path",
          timeModel: "none",
          caption: LABELS.captions.signalPath,
          after: PROSE.questionAfter,
          props: { recording: "compressor", labels: LABELS.path },
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
          id: "predict-threshold",
          kind: "reading-prediction",
          timeModel: "none",
          caption: LABELS.captions.predictThreshold,
          props: {
            question: PROSE.p1Question,
            ask: { kind: "fewer-wrong", recording: "compressor", thresholds: [240, 140] },
            options: [
              { value: "240", label: LABELS.options.p1High },
              { value: "140", label: LABELS.options.p1Middle },
              { value: "same", label: LABELS.options.p1Same },
            ],
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
          id: "explore-signal",
          kind: "noisy-signal",
          timeModel: "none",
          caption: LABELS.captions.exploreSignal,
          lead: PROSE.exploreSignalLead,
          after: PROSE.exploreSignalAfter,
          props: {
            recordings: [
              { id: "quiet", label: LABELS.recordings.quiet },
              { id: "compressor", label: LABELS.recordings.compressor },
            ],
            threshold: 240,
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
          id: "set-threshold",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.setThreshold,
          lead: PROSE.setThresholdLead,
          props: { challengeId: "set-threshold" },
        },
        {
          id: "predict-sum",
          kind: "reading-prediction",
          timeModel: "none",
          caption: LABELS.captions.predictSum,
          lead: PROSE.predictSumLead,
          after: PROSE.predictSumAfter,
          props: {
            question: PROSE.p3Question,
            ask: { kind: "reading", bits: SENSOR_BITS, reading: "unsigned" },
            options: [
              { value: "184", label: LABELS.options.p3Plain },
              { value: "-184", label: LABELS.options.p3Sent },
              { value: "65352", label: LABELS.options.p3Sum },
            ],
            explain: PROSE.p3Explain,
          },
        },
      ],
    },
    {
      kind: "failureExperiment",
      title: LABELS.titles.failureExperiment,
      prose: "",
      interactives: [
        {
          id: "break-signal",
          kind: "noisy-signal",
          timeModel: "none",
          caption: LABELS.captions.breakSignal,
          lead: PROSE.breakSignalLead,
          after: PROSE.breakSignalAfter,
          props: {
            recordings: [{ id: "compressor", label: LABELS.recordings.compressor }],
            threshold: 170,
            noise: { max: 3 },
            showBand: true,
            reading: "unsigned",
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
          id: "signed-word",
          kind: "bit-inspector",
          timeModel: "none",
          caption: LABELS.captions.signedWord,
          lead: PROSE.signedWordLead,
          after: PROSE.signedWordAfter,
          props: { bits: SENSOR_BITS, readings: ["unsigned", "signed"], weights: "signed" },
        },
      ],
    },
    {
      kind: "generalisation",
      title: LABELS.titles.generalisation,
      prose: "",
      interactives: [
        {
          id: "many-readings",
          kind: "interpretations",
          timeModel: "none",
          caption: LABELS.captions.manyReadings,
          lead: PROSE.manyReadingsLead,
          after: PROSE.manyReadingsAfter,
          props: {
            words: [
              { bits: SENSOR_BITS, label: LABELS.words.sensor },
              { bits: "0000 0000 0001 0010", label: LABELS.words.warm },
              { bits: "1111 1111 1111 1111", label: LABELS.words.allOnes },
            ],
            readings: ["unsigned", "signed", "hex", "lamps"],
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
          id: "predict-top",
          kind: "reading-prediction",
          timeModel: "none",
          caption: LABELS.captions.predictTop,
          lead: PROSE.predictTopLead,
          props: {
            question: PROSE.p2Question,
            ask: { kind: "reading", bits: "1000 0000 0000 0000", reading: "signed" },
            options: [
              { value: "32768", label: LABELS.options.p2Positive },
              { value: "-32768", label: LABELS.options.p2Negative },
              { value: "0", label: LABELS.options.p2Zero },
            ],
            explain: PROSE.p2Explain,
          },
        },
        {
          id: "freezer-word",
          kind: "challenge",
          timeModel: "none",
          caption: LABELS.captions.freezerWord,
          lead: PROSE.freezerWordLead,
          props: { challengeId: "freezer-word" },
        },
      ],
    },
    { kind: "reflection", title: LABELS.titles.reflection, prose: PROSE.reflection },
  ],
  challenges: [
    {
      id: "set-threshold",
      title: LABELS.challengeTitles.c1,
      task: PROSE.c1Task,
      gradedDirection: "answer",
      fields: [
        {
          id: "threshold",
          label: LABELS.fields.threshold,
          kind: "number",
          min: 0,
          max: 3.3,
          step: 0.05,
          unit: "V",
        },
      ],
      tests: {
        kind: "answers",
        grader: "threshold",
        cases: [
          { label: LABELS.cases.quietRight, given: { recording: "quiet" }, expect: { wrong: 0 } },
          {
            label: LABELS.cases.compressorRight,
            given: { recording: "compressor" },
            expect: { wrong: 0 },
          },
          {
            label: LABELS.cases.quietMargin,
            given: { recording: "quiet" },
            expect: { margin: 30 },
          },
          {
            label: LABELS.cases.compressorMargin,
            given: { recording: "compressor" },
            expect: { margin: 30 },
          },
        ],
      },
      hints: [...PROSE.c1Hints],
      reference: { answers: { threshold: "1.70" } },
    },
    {
      id: "freezer-word",
      title: LABELS.challengeTitles.c2,
      task: PROSE.c2Task,
      gradedDirection: "answer",
      fields: [
        { id: "bits", label: LABELS.fields.bits, kind: "bits", width: 16, weights: "signed" },
        { id: "unsigned", label: LABELS.fields.unsigned, kind: "number", step: 1 },
        { id: "hex", label: LABELS.fields.hex, kind: "text" },
      ],
      tests: {
        kind: "answers",
        grader: "word",
        cases: [
          {
            label: LABELS.cases.bitsSigned,
            given: { check: "signed" },
            expect: { signed: FREEZER_TENTHS },
          },
          { label: LABELS.cases.unsignedRight, given: { check: "unsigned" }, expect: {} },
          { label: LABELS.cases.hexRight, given: { check: "hex" }, expect: {} },
        ],
      },
      hints: [...PROSE.c2Hints],
      reference: { answers: { bits: "1111111100000110", unsigned: "65286", hex: "FF06" } },
    },
  ],
  modelVsReality: PROSE.modelVsReality,
  originalityNote: {
    textbookExample:
      "The noise-margin diagram: two bars of output and input voltage levels (VOH, VIH, VIL, VOL) with the margins marked between them, followed by a table of the sixteen four-bit patterns with their unsigned and two's complement values, a conversion table from binary to hexadecimal, and the ASCII table as the example of bits that mean letters.",
    howThisDiffers:
      "The lesson starts from one line a learner could meet: a freezer-room temperature sensor sending its reading to a temperature display in the shop's office along a cable that runs past a compressor. The noise is a recording the model makes, and the learner moves a single threshold across it, first predicting which of two thresholds reads more samples wrong, then finding for themselves that the gap between the threshold and the nearest sample on each side is what noise has to cross; noise margin is named after that, measured on the recording, not drawn as level bars. The failure experiment turns the same noise up until no threshold works, and shows what one misread bit does to the number. The bits the display receives are the sensor's own reading, and the interpretation payoff is a real fault: read as unsigned, a freezer at -18.4 degrees shows 6535.2. Signed reading is taught as one changed place value (the top bit counts negative) on the bit inspector, not as a table or a wheel, and the same 16-bit word, the width of this course's machine, is then read as unsigned, signed, hexadecimal and as a row of lamps. No ASCII table and no four-bit pattern table appear.",
  },
};
