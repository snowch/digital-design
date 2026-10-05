// Copyright © 2026 Chris Snow

// Four conversions a learner can try before Module 1, two each way, to see whether they are
// ready for it. The answers, and the working shown under a wrong one, are the model's (dd-model:
// bits), as every number in a lesson is.

import { useState } from "react";

import { bitsOf, bitsText, parseBits, termsOf, unsignedOf } from "@dd/dd-model";

import { STRINGS } from "../strings";

export type CheckItem = { kind: "toDecimal"; binary: string } | { kind: "toBinary"; n: number };

/** Two binary numbers to read and two decimal numbers to write, 8 digits each. */
export const SELF_CHECK: readonly CheckItem[] = [
  { kind: "toDecimal", binary: "1011 0010" },
  { kind: "toBinary", n: 37 },
  { kind: "toDecimal", binary: "0100 1101" },
  { kind: "toBinary", n: 200 },
];

export type Verdict = "right" | "wrong" | "blank";

/** Whether an answer is right. A binary answer may leave out leading 0s and group with spaces. */
export function verdictOf(item: CheckItem, answer: string): Verdict {
  const a = answer.trim();
  if (a === "") return "blank";
  if (item.kind === "toDecimal")
    return /^\d+$/.test(a) && Number(a) === unsignedOf(parseBits(item.binary)) ? "right" : "wrong";
  const digits = a.replace(/[\s_]/g, "");
  return /^[01]{1,8}$/.test(digits) && parseInt(digits, 2) === item.n ? "right" : "wrong";
}

/** The working shown under a wrong answer: the place values of the 1s, added. */
export function workingOf(item: CheckItem): string {
  if (item.kind === "toDecimal") {
    const bits = parseBits(item.binary);
    return STRINGS.selfCheck.workingDecimal(
      item.binary,
      termsOf(bits, "unsigned").join(" + "),
      unsignedOf(bits),
    );
  }
  const bits = bitsOf(item.n, 8);
  return STRINGS.selfCheck.workingBinary(
    item.n,
    termsOf(bits, "unsigned").join(" + "),
    bitsText(bits),
  );
}

const question = (item: CheckItem) =>
  item.kind === "toDecimal"
    ? STRINGS.selfCheck.toDecimal(item.binary)
    : STRINGS.selfCheck.toBinary(item.n);

export function SelfCheck() {
  const [answers, setAnswers] = useState<string[]>(() => SELF_CHECK.map(() => ""));
  // Cleared by any edit, so a verdict never sits beside an answer it was not given for.
  const [verdicts, setVerdicts] = useState<Verdict[] | undefined>();
  const right = verdicts?.filter((v) => v === "right").length ?? 0;
  return (
    <section className="self-check" aria-labelledby="self-check-title">
      <h3 id="self-check-title">{STRINGS.selfCheck.title}</h3>
      <p>{STRINGS.selfCheck.intro}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setVerdicts(SELF_CHECK.map((item, i) => verdictOf(item, answers[i] ?? "")));
        }}
      >
        <ol className="self-check-items">
          {SELF_CHECK.map((item, i) => {
            const id = `self-check-${i}`;
            const verdict = verdicts?.[i];
            return (
              <li key={id} className="answer-field" data-verdict={verdict}>
                <label htmlFor={id} className="answer-label">
                  {question(item)}
                </label>
                <span className="answer-input">
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    value={answers[i] ?? ""}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                      setVerdicts(undefined);
                    }}
                  />
                </span>
                {verdict && (
                  <p className={`self-check-result ${verdict}`}>
                    {verdict === "right"
                      ? STRINGS.selfCheck.right
                      : verdict === "blank"
                        ? STRINGS.selfCheck.blank
                        : workingOf(item)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        <button type="submit" className="button primary">
          {STRINGS.selfCheck.check}
        </button>
        <p role="status" className="self-check-score">
          {verdicts ? STRINGS.selfCheck.score(right, SELF_CHECK.length) : ""}
        </p>
      </form>
    </section>
  );
}
