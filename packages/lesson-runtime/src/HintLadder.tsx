// Copyright © 2026 Christopher Snow

// Five hints, one at a time, in a fixed order. How many are shown is the learner's state.

import { Prose } from "./Prose";
import { useStrings } from "./StringsContext";
import { format } from "./strings";

export function HintLadder({
  hints,
  revealed,
  onReveal,
  idPrefix,
}: {
  hints: readonly string[];
  revealed: number;
  onReveal: () => void;
  idPrefix: string;
}) {
  const strings = useStrings();
  const shown = Math.min(revealed, hints.length);
  return (
    <div className="hints" data-revealed={shown}>
      {shown > 0 && (
        <ol className="hints-list" aria-label={strings.section["challenge"]}>
          {hints.slice(0, shown).map((hint, i) => (
            <li key={i} id={`${idPrefix}-hint-${i + 1}`}>
              <strong className="hints-rung">{strings.hints.rung[i] ?? ""}</strong>
              <Prose markdown={hint} className="hints-text" />
            </li>
          ))}
        </ol>
      )}
      {shown < hints.length ? (
        <button type="button" className="button secondary" onClick={onReveal}>
          {format(strings.hints.show, { n: shown + 1, total: hints.length })}
        </button>
      ) : (
        <p className="hints-none">{strings.hints.none}</p>
      )}
    </div>
  );
}
