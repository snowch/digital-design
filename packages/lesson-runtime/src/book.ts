// The contract between the runtime and a book.
//
// The runtime renders lessons and knows nothing about circuits. A book supplies the interactives
// a lesson names by kind, an editor for a challenge's artifact, and a grader that turns an
// artifact and a challenge into a verdict. The verdict's shape is the one the simulation engine's
// test runner produces, restated here so the runtime never imports the engine.

import type { ComponentType } from "react";

import type { Artifact, Challenge, Interactive, Lesson, TimeModel } from "@dd/lesson-schema";

import type { LessonStore } from "./state";

/** Where a failed test first diverges from what it expected. */
export interface VerdictDivergence {
  readonly net: string;
  readonly actual: string;
  readonly expected: string;
  /** The part where it diverges; `label` is how the book names that part to a learner. */
  readonly component?: { readonly kind: string; readonly path: string; readonly label?: string };
  readonly inputsSeen: Readonly<Record<string, string>>;
  readonly cone: readonly string[];
}

export interface VerdictFailure {
  readonly index: number;
  readonly label: string;
  readonly inputs: Readonly<Record<string, string>>;
  readonly actual: Readonly<Record<string, string>>;
  readonly expected: Readonly<Record<string, string>>;
  readonly divergence?: VerdictDivergence;
  readonly oscillated?: boolean;
  /**
   * A failure that is not about one row or step (Module 2's gate budget, depth, kinds of gate):
   * the book's sentence saying what was found, shown under the failure's label.
   */
  readonly detail?: string;
  /** The parts that failure is about, for the editor to mark. */
  readonly marked?: readonly string[];
}

/** What the grader says about an artifact. */
export interface Verdict {
  readonly passed: boolean;
  readonly total: number;
  readonly failures: readonly VerdictFailure[];
  /** Why the tests could not run at all, as a sentence. */
  readonly blocked?: string;
}

export interface InteractiveProps {
  readonly lesson: Lesson;
  readonly interactive: Interactive;
  readonly store: LessonStore;
}

export interface ChallengeEditorProps {
  readonly lesson: Lesson;
  readonly challenge: Challenge;
  readonly artifact: Artifact;
  readonly onChange: (artifact: Artifact) => void;
  /** The last verdict, so the editor can point at the component where a test diverged. */
  readonly verdict?: Verdict;
}

export interface Book {
  /** Namespaces the learner's stored state: keys start `${id}:v1:`. */
  readonly id: string;
  readonly title: string;
  readonly lessons: readonly Lesson[];
  /** The interactives lessons may mount, by kind. */
  readonly interactives: Readonly<Record<string, ComponentType<InteractiveProps>>>;
  readonly ChallengeEditor: ComponentType<ChallengeEditorProps>;
  readonly grade: (challenge: Challenge, artifact: Artifact) => Verdict;
  /** What each time model means in this book's words, for the note every lesson states. */
  readonly timeModelNotes: Readonly<Partial<Record<TimeModel, string>>>;
}
