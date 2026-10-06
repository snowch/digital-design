// Copyright © 2026 Christopher Snow

// Step through a run, one step at a time or with a slider, a keyboard and a finger alike: the
// controls every stepped figure shares. The figure keeps the step and says what it shows; this
// is the slider, its "k of n", the optional buttons for a step back, a step on and the last
// step, and the line under them.

import type { ReactNode } from "react";

export interface StepperProps {
  /** The step shown, from 0; a step past the last shows the last. */
  readonly step: number;
  /** The last step. */
  readonly last: number;
  readonly onStep: (step: number) => void;
  /** The slider's name. */
  readonly label: string;
  /** Where the slider stands, in the figure's words: "3 of 8". */
  readonly position: string;
  /** Buttons for a step back, a step on and the last step; left out where the slider serves. */
  readonly buttons?: { readonly back: string; readonly next: string; readonly end: string };
  /** The line under the controls: what the step shows. */
  readonly status: ReactNode;
}

export function Stepper({ step, last, onStep, label, position, buttons, status }: StepperProps) {
  const at = Math.min(step, last);
  return (
    <div className="explorer-steps">
      <label>
        <span>{label}</span>
        <input
          type="range"
          min={0}
          max={last}
          value={at}
          onChange={(e) => onStep(Number(e.target.value))}
        />
        <span className="explorer-step-of">{position}</span>
      </label>
      {buttons && (
        <div className="explorer-actions">
          <button
            type="button"
            className="button secondary"
            disabled={at === 0}
            onClick={() => onStep(Math.max(0, at - 1))}
          >
            {buttons.back}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={at === last}
            onClick={() => onStep(Math.min(last, at + 1))}
          >
            {buttons.next}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={at === last}
            onClick={() => onStep(last)}
          >
            {buttons.end}
          </button>
        </div>
      )}
      <p role="status">{status}</p>
    </div>
  );
}
