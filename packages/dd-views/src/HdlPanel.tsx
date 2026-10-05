// The text side: an editor for the course's hardware description language, the gate's and the
// elaborator's messages, and the circuit the text describes, drawn.

import { useId, useMemo } from "react";

import { elaborate, type Construct, type Message } from "@dd/hdl";

import { CircuitView } from "./CircuitView";
import { format, useViewStrings } from "./strings";

export interface HdlPanelProps {
  readonly text: string;
  readonly onChange: (text: string) => void;
  /** The constructs this challenge has met. */
  readonly allowed: readonly Construct[];
  readonly title: string;
  readonly highlight?: readonly string[];
  readonly rows?: number;
  /** The starting text: while the text is still this, nothing has been written to judge. */
  readonly untouched?: string;
}

export function messageLine(m: Message): string {
  return m.at ? format("{text} (line {line})", { text: m.text, line: m.at.line }) : m.text;
}

export function HdlPanel({
  text,
  onChange,
  allowed,
  title,
  highlight,
  rows = 10,
  untouched,
}: HdlPanelProps) {
  const strings = useViewStrings();
  const id = useId();
  const result = useMemo(
    () => (text.trim() && text !== untouched ? elaborate(text, { allowed }) : undefined),
    [text, allowed, untouched],
  );
  const errors = result?.messages.filter((m) => m.severity !== "warning") ?? [];
  const warnings = result?.messages.filter((m) => m.severity === "warning") ?? [];
  return (
    <div className="hdl-panel">
      <label htmlFor={`${id}-text`} className="hdl-label">
        {title}
      </label>
      <textarea
        id={`${id}-text`}
        className="hdl-text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-describedby={`${id}-messages`}
      />
      <div id={`${id}-messages`} className="hdl-messages" role="status" aria-live="polite">
        {result && errors.length === 0 && warnings.length === 0 && (
          <p className="hdl-ok">{strings.hdl.ok}</p>
        )}
        {errors.length > 0 && (
          <ul className="hdl-errors">
            {errors.map((m, i) => (
              <li key={i}>{messageLine(m)}</li>
            ))}
          </ul>
        )}
        {warnings.length > 0 && (
          <ul className="hdl-warnings">
            {warnings.map((m, i) => (
              <li key={i}>{messageLine(m)}</li>
            ))}
          </ul>
        )}
      </div>
      {result?.circuit && (
        <CircuitView
          circuit={result.circuit}
          title={strings.hdl.drawn}
          table={false}
          {...(highlight ? { highlight } : {})}
        />
      )}
    </div>
  );
}
