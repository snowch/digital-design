// Copyright © 2026 Christopher Snow

// The platform's words for a lesson page, with the course's own where the platform's do not fit
// this course's reader. Only one differs: the heading over the note on how a page differs from a
// real machine, on a page with no clocked figure (strings.ts, modelNoteHeading).

import { DEFAULT_STRINGS, type Strings } from "@platform/lesson-runtime";

import { STRINGS } from "./strings";

export const RUNTIME_STRINGS: Strings = {
  ...DEFAULT_STRINGS,
  lesson: { ...DEFAULT_STRINGS.lesson, modelVsRealityNoSimulator: STRINGS.modelNoteHeading },
};
