// Copyright © 2026 Christopher Snow

// What a run of the tests says, in the learner's terms: which tests failed, what the circuit
// gave, what the test expected, and where the disagreement first appears.

import type { Verdict, VerdictFailure } from "./book";
import { useStrings } from "./StringsContext";
import { format } from "./strings";

type Feedback = "gates" | "words";

/**
 * A value as the learner reads it: with "words", a value of eight bits or more is written in
 * hexadecimal, a digit X where any of its four bits is unknown, as the lessons write words.
 */
export function shownValue(value: string, feedback: Feedback): string {
  if (feedback !== "words" || value.length < 8 || !/^[01X]+$/.test(value)) return value;
  const padded = value.padStart(Math.ceil(value.length / 4) * 4, "0");
  let out = "";
  for (let i = 0; i < padded.length; i += 4) {
    const nibble = padded.slice(i, i + 4);
    out += nibble.includes("X") ? "X" : Number.parseInt(nibble, 2).toString(16).toUpperCase();
  }
  return out;
}

function Values({
  values,
  feedback,
}: {
  values: Readonly<Record<string, string>>;
  feedback: Feedback;
}) {
  const entries = Object.entries(values);
  if (entries.length === 0) return null;
  return (
    <span className="values">
      {entries.map(([name, value]) => (
        <code key={name} className="value">
          {name}={shownValue(value, feedback)}
        </code>
      ))}
    </span>
  );
}

function FailureView({ failure, feedback }: { failure: VerdictFailure; feedback: Feedback }) {
  const strings = useStrings();
  const d = failure.divergence;
  return (
    <li className="verdict-failure">
      <h4>{format(strings.challenge.failedTest, { label: failure.label })}</h4>
      {failure.detail !== undefined && <p className="verdict-detail">{failure.detail}</p>}
      {failure.detail === undefined && (
        <dl className="verdict-values">
          <dt>{strings.challenge.inputs}</dt>
          <dd>
            <Values values={failure.inputs} feedback={feedback} />
          </dd>
          <dt>{strings.challenge.actual}</dt>
          <dd>
            <Values values={failure.actual} feedback={feedback} />
          </dd>
          <dt>{strings.challenge.expected}</dt>
          <dd>
            <Values values={failure.expected} feedback={feedback} />
          </dd>
        </dl>
      )}
      {failure.oscillated && <p className="verdict-oscillated">{strings.challenge.oscillated}</p>}
      {d && (
        <div className="verdict-divergence">
          <p>
            {format(strings.challenge.divergence, {
              net: d.net,
              actual: shownValue(d.actual, feedback),
              expected: shownValue(d.expected, feedback),
            })}
          </p>
          {feedback === "gates" && d.component && (
            <p>
              {format(strings.challenge.driver, {
                kind: d.component.label ?? `${d.component.kind.toUpperCase()} gate`,
                path: d.component.path,
              })}{" "}
              <Values values={d.inputsSeen} feedback={feedback} />
            </p>
          )}
          {feedback === "gates" && d.cone.length > 0 && (
            <p className="verdict-cone">
              {strings.challenge.coneHint}:{" "}
              {d.cone.slice(0, 6).map((path) => (
                <code key={path}>{path}</code>
              ))}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export function VerdictView({
  verdict,
  feedback = "gates",
}: {
  verdict: Verdict;
  feedback?: Feedback;
}) {
  const strings = useStrings();
  if (verdict.blocked !== undefined) {
    return (
      <div className="verdict blocked">
        {/* The status line above already says the tests could not run; this says why. */}
        <div className="verdict-blocked">
          {verdict.blocked.split("\n").map((line, i) => (
            <p key={i}>
              {/* A message names code between backticks, as the lessons do: shown as code. */}
              {line.split("`").map((part, k) => (k % 2 === 1 ? <code key={k}>{part}</code> : part))}
            </p>
          ))}
        </div>
      </div>
    );
  }
  if (verdict.passed) return null;
  return (
    <ol
      className="verdict failures"
      aria-label={strings.challenge.failing.replace(/\{\w+\}/g, "").trim()}
    >
      {verdict.failures.map((f) => (
        <FailureView key={f.index} failure={f} feedback={feedback} />
      ))}
    </ol>
  );
}
