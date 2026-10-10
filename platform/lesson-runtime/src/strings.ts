// Copyright © 2026 Christopher Snow

// Every word the runtime itself puts in front of a learner, in one place.
//
// The sentences were drafted by the course's prose process (see CLAUDE.md) from a brief of facts,
// and checked against the code that uses them. Slots in braces are filled by `format`. A book
// may replace any of them through LessonView's `strings` prop.
import type { ReactNode } from "react";

export interface Strings {
  readonly section: Readonly<Record<string, string>>;
  readonly lesson: {
    readonly objectives: string;
    readonly prerequisites: string;
    readonly modelNote: string;
    readonly modelVsReality: string;
    /** The same heading for a lesson none of whose figures runs the simulator. */
    readonly modelVsRealityNoSimulator: string;
    readonly timeModel: Readonly<Record<string, string>>;
    /** The time-model badge's accessible name; {model} is the badge's text. */
    readonly badgeLabel: string;
    /** A figure's role as its badge names it, by the role's name in the lesson. */
    readonly role: Readonly<Record<string, string>>;
    /** The badge's accessible name on a figure with a role; {role} is the badge's text. */
    readonly roleBadgeLabel: string;
    readonly unknownInteractive: string;
    readonly brokenInteractive: string;
  };
  /** How a course draws inline code in prose, if it draws more than the words. */
  readonly code?: (props: { readonly children: ReactNode }) => ReactNode;
  readonly challenge: {
    readonly run: string;
    readonly notRun: string;
    readonly passing: string;
    readonly failing: string;
    readonly complete: string;
    readonly blocked: string;
    /** Under `blocked`, when the book's grader threw instead of giving a verdict; {message} is the error's. */
    readonly graderError: string;
    /** In the editor's place, when the book's editor could not draw the saved work; {message} is the error's. */
    readonly brokenEditor: string;
    readonly failedTest: string;
    readonly inputs: string;
    readonly actual: string;
    readonly expected: string;
    readonly divergence: string;
    readonly driver: string;
    readonly inputsSeen: string;
    readonly coneHint: string;
    readonly oscillated: string;
    readonly reset: string;
    readonly resetConfirm: string;
    readonly resetCancel: string;
    readonly resetDone: string;
  };
  readonly hints: {
    readonly show: string;
    readonly none: string;
    readonly rung: readonly [string, string, string, string, string];
  };
}

export const DEFAULT_STRINGS: Strings = {
  section: {
    question: "Question",
    motivation: "Motivation",
    prediction: "Prediction",
    investigation: "Investigation",
    construction: "Construction",
    failureExperiment: "Failure experiment",
    explanation: "Explanation",
    generalisation: "Generalisation",
    challenge: "Challenge",
    reflection: "Reflection",
  },
  lesson: {
    objectives: "Objectives",
    prerequisites: "Prerequisites",
    modelNote: "Time model",
    modelVsReality: "How the simulator differs from hardware",
    modelVsRealityNoSimulator: "How the model differs from hardware",
    timeModel: {
      settle: "Stepped",
      clocked: "Clocked",
      delay: "Gate delays",
    },
    badgeLabel: "Time model: {model}",
    role: {},
    roleBadgeLabel: "What this figure asks of you: {role}",
    unknownInteractive: "Unknown interactive type: {kind}",
    brokenInteractive: "The {kind} figure could not be shown: {message}",
  },
  challenge: {
    run: "Run tests",
    notRun: "No tests run yet",
    passing: "All {total} tests passed",
    failing: "{passed} of {total} tests passed",
    complete: "Complete",
    blocked: "Tests could not run",
    graderError:
      'The checking code stopped with an error while it checked your work, so it could not report which tests passed. Your work is kept, so you can change it and press "Run tests" again, or press "Clear work" to go back to the starting point. The error says: {message}',
    brokenEditor:
      'The editor cannot show the work saved for this challenge. The buttons below still work, and pressing "Clear work" puts the challenge back to its starting point, which the editor then shows. The error says: {message}',
    failedTest: "{label}",
    inputs: "Inputs",
    actual: "Actual",
    expected: "Expected",
    divergence: "Signal {net} was {actual}, but the test expected {expected}",
    driver: "The {kind} {path} drives that signal. Its inputs at that moment:",
    inputsSeen: "Inputs seen",
    coneHint: "Places to look",
    oscillated:
      "The circuit never settled during this test, so signals that kept changing are shown as X",
    reset: "Clear work",
    resetConfirm: "Discard work",
    resetCancel: "Cancel",
    resetDone: "Work cleared",
  },
  hints: {
    show: "Show hint ({n} of {total})",
    none: "All hints shown",
    rung: ["The concept", "Common mistake", "Smaller example", "Part of the answer", "The answer"],
  },
};

/** Fills `{slot}`s in a template from `slots`. A slot with no value is left as written. */
export function format(template: string, slots: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const v = slots[key];
    return v === undefined ? whole : String(v);
  });
}
