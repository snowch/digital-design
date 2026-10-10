// Copyright © 2026 Christopher Snow

// Predict, commit, see, predict again: the controls every
// prediction figure shares. The learner picks one option and commits to it before anything is
// shown, then may pick another and commit again: these are hypothesis tests, not quizzes, and
// changing one's answer is a normal investigative action, not an error. What is
// predicted, and how its answer is worked out and drawn, stays with the figure: the choice is a
// string, and the verdict and the outcome are the figure's to show.

import { useState, type ReactNode } from "react";

export interface PredictionOption {
  readonly value: string;
  readonly label: string;
}

export interface PredictionChallengeProps {
  /** The options' radio group name, unique on the page. */
  readonly name: string;
  readonly options: readonly PredictionOption[];
  /** The choice committed to, or undefined while the learner has not committed. */
  readonly committed: string | undefined;
  readonly onCommit: (choice: string) => void;
  /** Clears the commitment. Without it, a commitment stands and no "Predict again" is offered. */
  readonly onAgain?: () => void;
  /** The options' group name, for a screen reader; it is not shown. */
  readonly legend: string;
  readonly commitLabel: string;
  /** The label of "Predict again"; needed only with `onAgain`. */
  readonly againLabel?: string;
  /** How an option's label is drawn; plain text unless a course draws marks in labels. */
  readonly renderLabel?: (label: string) => ReactNode;
  /** Shown just before "Predict again" once committed, where a figure gives its verdict there. */
  readonly verdict?: ReactNode;
}

export function PredictionChallenge({
  name,
  options,
  committed,
  onCommit,
  onAgain,
  legend,
  commitLabel,
  againLabel,
  verdict,
  renderLabel,
}: PredictionChallengeProps) {
  const [pick, setPick] = useState<string | undefined>();
  return (
    <>
      <fieldset className="prediction-options" data-committed={committed !== undefined}>
        <legend className="visually-hidden">{legend}</legend>
        {options.map((o) => (
          <label key={o.value} className="prediction-option">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={(pick ?? committed) === o.value}
              onChange={() => setPick(o.value)}
            />
            <span>{renderLabel ? renderLabel(o.label) : o.label}</span>
          </label>
        ))}
      </fieldset>
      {committed === undefined ? (
        <button
          type="button"
          className="button primary"
          disabled={pick === undefined}
          onClick={() => pick !== undefined && onCommit(pick)}
        >
          {commitLabel}
        </button>
      ) : (
        <>
          {verdict}
          <button
            type="button"
            className="button secondary"
            disabled={pick === undefined || pick === committed}
            onClick={() => pick !== undefined && onCommit(pick)}
          >
            {commitLabel}
          </button>
          {onAgain && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setPick(undefined);
                onAgain();
              }}
            >
              {againLabel}
            </button>
          )}
        </>
      )}
    </>
  );
}
