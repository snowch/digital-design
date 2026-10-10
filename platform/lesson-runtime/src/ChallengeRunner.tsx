// Copyright © 2026 Christopher Snow

// A challenge on the page: the task, the book's editor, the run button, the verdict, the hints.
//
// Completion is a property of the work on screen, not a flag: the badge shows when the artifact
// in the editor has been graded in this visit and passed. Saved work is graded as the runner
// mounts, which is how a challenge passed last week shows as complete today, and an edit after a
// pass clears the verdict until the tests run again. There is no other path to the badge.
//
// Neither the grader nor the editor can take the box down. A grader that throws gives a verdict
// that says the tests could not run (`gradeSafely`); an editor that cannot draw the saved work
// shows why in its place, with the buttons still under it, and "Clear work" draws it afresh.

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Artifact, Challenge, Lesson } from "@platform/lesson-schema";

import type { Book, Verdict } from "./book";
import { Boundary } from "./Boundary";
import { HintLadder } from "./HintLadder";
import { Prose } from "./Prose";
import { useStrings } from "./StringsContext";
import { artifactFor, gradeSafely, useStored, type LessonStore } from "./state";
import { format } from "./strings";
import { VerdictView } from "./VerdictView";

export function ChallengeRunner({
  book,
  lesson,
  challenge,
  store,
}: {
  book: Book;
  lesson: Lesson;
  challenge: Challenge;
  store: LessonStore;
}) {
  const strings = useStrings();
  const stored = useStored(store);
  const saved = stored.challenges[challenge.id];
  const artifact = artifactFor(stored, challenge);
  const idPrefix = `challenge-${challenge.id}`;

  const explain = useCallback(
    (message: string) => format(strings.challenge.graderError, { message }),
    [strings],
  );
  // The verdict for the artifact as it stands. Saved work is graded on mount; nothing is read
  // from storage as a result.
  const [verdict, setVerdict] = useState<Verdict | undefined>(() =>
    saved ? gradeSafely(book, challenge, saved.artifact, explain) : undefined,
  );
  const [confirming, setConfirming] = useState(false);
  const [resetNote, setResetNote] = useState(false);
  // Each reset draws the editor afresh, so an editor that failed on the old work tries again.
  const [drawn, setDrawn] = useState(0);

  const onChange = useCallback(
    (next: Artifact) => {
      store.setChallenge(challenge.id, (c) => ({ ...c, artifact: next }));
      setVerdict(undefined);
      setResetNote(false);
    },
    [store, challenge.id],
  );

  const run = useCallback(() => {
    const result = gradeSafely(book, challenge, artifact, explain);
    setVerdict(result);
    setResetNote(false);
    store.setChallenge(challenge.id, (c) => ({
      ...c,
      artifact,
      attempts: c.attempts + 1,
      ...(result.passed && !c.firstPassedAt ? { firstPassedAt: new Date().toISOString() } : {}),
    }));
  }, [book, challenge, artifact, store, explain]);

  const reset = useCallback(() => {
    store.resetChallenge(challenge.id);
    setVerdict(undefined);
    setConfirming(false);
    setResetNote(true);
    setDrawn((n) => n + 1);
  }, [store, challenge.id]);

  // If storage changes under us (a reset of the whole lesson), drop a verdict for work that is gone.
  useEffect(() => {
    if (!saved && verdict && !verdict.passed) setVerdict(undefined);
  }, [saved, verdict]);

  const complete = verdict?.passed === true;
  const status = useMemo(() => {
    if (resetNote) return strings.challenge.resetDone;
    if (!verdict) return strings.challenge.notRun;
    if (verdict.blocked !== undefined) return strings.challenge.blocked;
    if (verdict.passed) return format(strings.challenge.passing, { total: verdict.total });
    return format(strings.challenge.failing, {
      passed: verdict.total - verdict.failures.length,
      total: verdict.total,
    });
  }, [verdict, resetNote, strings]);

  return (
    <section
      className="challenge"
      id={idPrefix}
      aria-labelledby={`${idPrefix}-title`}
      data-challenge={challenge.id}
      data-complete={complete ? "true" : "false"}
    >
      <h3 id={`${idPrefix}-title`} className="challenge-title">
        {challenge.title}
        {complete && (
          <span className="badge ok challenge-complete">{strings.challenge.complete}</span>
        )}
      </h3>
      <Prose markdown={challenge.task} className="challenge-task" />
      <Boundary
        key={drawn}
        fallback={(message) => (
          <p role="note" className="interactive-problem">
            {format(strings.challenge.brokenEditor, { message })}
          </p>
        )}
      >
        <book.ChallengeEditor
          lesson={lesson}
          challenge={challenge}
          artifact={artifact}
          onChange={onChange}
          {...(verdict ? { verdict } : {})}
        />
      </Boundary>
      <div className="challenge-actions">
        <button type="button" className="button primary challenge-run" onClick={run}>
          {strings.challenge.run}
        </button>
        {confirming ? (
          <span
            className="challenge-reset-confirm"
            role="group"
            aria-label={strings.challenge.reset}
          >
            <button type="button" className="button danger" onClick={reset}>
              {strings.challenge.resetConfirm}
            </button>
            <button type="button" className="button secondary" onClick={() => setConfirming(false)}>
              {strings.challenge.resetCancel}
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="button secondary challenge-reset"
            onClick={() => setConfirming(true)}
            aria-label={`${strings.challenge.reset}: ${challenge.title}`}
          >
            {strings.challenge.reset}
          </button>
        )}
      </div>
      <p className="challenge-status" role="status" aria-live="polite">
        {status}
      </p>
      {verdict && <VerdictView verdict={verdict} feedback={challenge.feedback} />}
      <HintLadder
        hints={challenge.hints}
        revealed={saved?.hintsRevealed ?? 0}
        onReveal={() =>
          store.setChallenge(challenge.id, (c) => ({ ...c, hintsRevealed: c.hintsRevealed + 1 }))
        }
        idPrefix={idPrefix}
      />
    </section>
  );
}
