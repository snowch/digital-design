// What a run of the tests says, in the learner's terms: which tests failed, what the circuit
// gave, what the test expected, and where the disagreement first appears.

import type { Verdict, VerdictFailure } from "./book";
import { useStrings } from "./StringsContext";
import { format } from "./strings";

function Values({ values }: { values: Readonly<Record<string, string>> }) {
  const entries = Object.entries(values);
  if (entries.length === 0) return null;
  return (
    <span className="values">
      {entries.map(([name, value]) => (
        <code key={name} className="value">
          {name}={value}
        </code>
      ))}
    </span>
  );
}

function FailureView({ failure }: { failure: VerdictFailure }) {
  const strings = useStrings();
  const d = failure.divergence;
  return (
    <li className="verdict-failure">
      <h4>{format(strings.challenge.failedTest, { label: failure.label })}</h4>
      <dl className="verdict-values">
        <dt>{strings.challenge.inputs}</dt>
        <dd>
          <Values values={failure.inputs} />
        </dd>
        <dt>{strings.challenge.actual}</dt>
        <dd>
          <Values values={failure.actual} />
        </dd>
        <dt>{strings.challenge.expected}</dt>
        <dd>
          <Values values={failure.expected} />
        </dd>
      </dl>
      {failure.oscillated && <p className="verdict-oscillated">{strings.challenge.oscillated}</p>}
      {d && (
        <div className="verdict-divergence">
          <p>
            {format(strings.challenge.divergence, {
              net: d.net,
              actual: d.actual,
              expected: d.expected,
            })}
          </p>
          {d.component && (
            <p>
              {format(strings.challenge.driver, {
                kind: d.component.kind.toUpperCase(),
                path: d.component.path,
              })}{" "}
              <Values values={d.inputsSeen} />
            </p>
          )}
          {d.cone.length > 0 && (
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

export function VerdictView({ verdict }: { verdict: Verdict }) {
  const strings = useStrings();
  if (verdict.blocked !== undefined) {
    return (
      <div className="verdict blocked">
        <p>{strings.challenge.blocked}</p>
        <pre className="verdict-blocked">{verdict.blocked}</pre>
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
        <FailureView key={f.index} failure={f} />
      ))}
    </ol>
  );
}
