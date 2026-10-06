// Copyright © 2026 Christopher Snow

// Predict, commit, see, and predict again: the controls every prediction figure shares. The
// learner picks one option and commits to it before anything is shown; "Predict again" clears
// the commitment. What is predicted, and how its answer is worked out and drawn, stays with the
// figure: the choice is a string, and the verdict and the outcome are the figure's to show.

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
  readonly onAgain: () => void;
  /** The options' group name, for a screen reader; it is not shown. */
  readonly legend: string;
  readonly commitLabel: string;
  readonly againLabel: string;
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
}: PredictionChallengeProps) {
  const [pick, setPick] = useState<string | undefined>();
  return (
    <>
      <fieldset className="prediction-options" disabled={committed !== undefined}>
        <legend className="visually-hidden">{legend}</legend>
        {options.map((o) => (
          <label key={o.value} className="prediction-option">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={(committed ?? pick) === o.value}
              onChange={() => setPick(o.value)}
            />
            <span>{o.label}</span>
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
            onClick={() => {
              setPick(undefined);
              onAgain();
            }}
          >
            {againLabel}
          </button>
        </>
      )}
    </>
  );
}
