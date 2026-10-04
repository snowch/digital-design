// Every word the runtime itself puts in front of a learner, in one place.
//
// The sentences were drafted by the course's prose process (see CLAUDE.md) from a brief of facts,
// and checked against the code that uses them. Slots in braces are filled by `format`. A book
// may replace any of them through LessonView's `strings` prop.

export interface Strings {
  readonly section: Readonly<Record<string, string>>;
  readonly lesson: {
    readonly objectives: string;
    readonly prerequisites: string;
    readonly modelNote: string;
    readonly modelVsReality: string;
    readonly timeModel: Readonly<Record<string, string>>;
    readonly unknownInteractive: string;
    readonly brokenInteractive: string;
  };
  readonly challenge: {
    readonly run: string;
    readonly notRun: string;
    readonly passing: string;
    readonly failing: string;
    readonly complete: string;
    readonly blocked: string;
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
    timeModel: {
      settle: "Stepped",
      clocked: "Clocked",
      delay: "Gate delays",
      none: "No simulation",
    },
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
    failedTest: "{label}",
    inputs: "Inputs",
    actual: "Actual",
    expected: "Expected",
    divergence: "Signal {net} was {actual}, but the test expected {expected}",
    driver: "The {kind} gate {path} drives that signal. Its inputs at that moment:",
    inputsSeen: "Inputs seen",
    coneHint: "Places to look",
    oscillated:
      "The circuit never settled during this test, so signals that kept changing are shown as X",
    reset: "Reset",
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
