// Copyright © 2026 Christopher Snow

// The book's grader, remembered. The front page re-checks every saved challenge each time it
// renders, a module opened or closed included, and a lesson re-checks its own on every visit
// (the platform's rule: saved work is proof only once it passes again). The checks that run a
// whole machine take a second or more each, so a learner far into the course waited seconds for
// every press on the front page. Grading is a pure function of the challenge and the work, so a
// verdict once worked out is kept, in memory only: every page load still checks the work afresh,
// and nothing in storage can stand in for a pass.

import type { Artifact, Challenge } from "@platform/lesson-schema";
import type { Verdict } from "@platform/lesson-runtime";

/** Verdicts kept for each challenge: enough for a learner's recent attempts, and no more. */
export const KEPT_PER_CHALLENGE = 16;

export function rememberVerdicts(
  grade: (challenge: Challenge, artifact: Artifact) => Verdict,
): (challenge: Challenge, artifact: Artifact) => Verdict {
  const kept = new WeakMap<Challenge, Map<string, Verdict>>();
  return (challenge, artifact) => {
    let verdicts = kept.get(challenge);
    if (!verdicts) kept.set(challenge, (verdicts = new Map()));
    const key = JSON.stringify(artifact);
    const known = verdicts.get(key);
    if (known) return known;
    const verdict = grade(challenge, artifact);
    verdicts.set(key, verdict);
    // A Map keeps the order of insertion, so the first key is the oldest.
    if (verdicts.size > KEPT_PER_CHALLENGE) verdicts.delete(verdicts.keys().next().value!);
    return verdict;
  };
}
