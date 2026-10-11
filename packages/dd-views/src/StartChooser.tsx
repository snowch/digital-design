// Copyright © 2026 Christopher Snow

// A challenge with more than one way in offers them as buttons. Pressing one replaces the
// learner's work with that start; if the learner has changed the work, the button first asks, as
// clearing work does. Module 11's capstone, Module 12's handler and Module 13's lab each had their
// own copy of this; the written and drawn challenges with a second way in are the third use, so
// it is one component (CLAUDE.md: the rule of two).

import { useState } from "react";

export interface StartWay {
  /** Names the way in the editor's own terms. */
  readonly id: string;
  /** The button's words. */
  readonly label: string;
}

export interface StartChooserProps {
  readonly ways: readonly StartWay[];
  /** Whether using this way would throw away work the learner has made. */
  readonly wouldReplaceWork: (id: string) => boolean;
  readonly onPick: (id: string) => void;
  /** The words on the two buttons that confirm. */
  readonly replaceLabel: string;
  readonly keepLabel: string;
}

export function StartChooser({
  ways,
  wouldReplaceWork,
  onPick,
  replaceLabel,
  keepLabel,
}: StartChooserProps) {
  const [asking, setAsking] = useState<string | undefined>();
  return (
    <div className="explorer-actions">
      {ways.map(({ id, label }) =>
        asking === id ? (
          <span key={id} className="challenge-reset-confirm" role="group" aria-label={label}>
            <button
              type="button"
              className="button danger"
              onClick={() => {
                setAsking(undefined);
                onPick(id);
              }}
            >
              {replaceLabel}
            </button>
            <button type="button" className="button secondary" onClick={() => setAsking(undefined)}>
              {keepLabel}
            </button>
          </span>
        ) : (
          <button
            key={id}
            type="button"
            className="button secondary"
            onClick={() => (wouldReplaceWork(id) ? setAsking(id) : onPick(id))}
          >
            {label}
          </button>
        ),
      )}
    </div>
  );
}
