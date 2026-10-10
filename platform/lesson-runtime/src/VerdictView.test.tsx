// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// Module 2: a failure that is not about one row (a gate budget, a depth) shows the book's
// sentence in place of the inputs and values, which it does not have.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { shownValue, VerdictView } from "./VerdictView";
import { DEFAULT_STRINGS as S } from "./strings";

describe("a failure with a detail", () => {
  it("says the detail and leaves out the empty inputs and values", () => {
    const { container } = render(
      <VerdictView
        verdict={{
          passed: false,
          total: 5,
          failures: [
            {
              index: 4,
              label: "At most 4 gates",
              inputs: {},
              actual: {},
              expected: {},
              detail: "Your circuit has 5 gates.",
              marked: ["g1"],
            },
          ],
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "At most 4 gates" })).toBeInTheDocument();
    expect(screen.getByText("Your circuit has 5 gates.")).toBeInTheDocument();
    // The list of failures is named by the status sentence, with its numbers.
    expect(screen.getByRole("list", { name: "4 of 5 tests passed" })).toBeInTheDocument();
    expect(container.querySelector(".verdict-values")).toBeNull();
    expect(screen.queryByText(S.challenge.inputs)).toBeNull();
  });
});

describe("a failure reported as words", () => {
  it("writes a value of eight bits or more in hexadecimal, an unknown digit as X", () => {
    expect(
      shownValue("0000000000000000000000000000000000000000000000000000000001000010", "words"),
    ).toBe("0000000000000042");
    expect(shownValue("00110100", "words")).toBe("34");
    expect(shownValue("XXXX0001", "words")).toBe("X1");
    expect(shownValue("0101", "words")).toBe("0101");
    expect(shownValue("00110100", "gates")).toBe("00110100");
  });

  it("leaves out the gate and the places to look, which the learner never wrote", () => {
    render(
      <VerdictView
        feedback="words"
        verdict={{
          passed: false,
          total: 1,
          failures: [
            {
              index: 0,
              label: "edge 1",
              inputs: { IR: "00010011000100100011000000000000" },
              actual: { RESULT: "01001110" },
              expected: { RESULT: "01000010" },
              divergence: {
                net: "RESULT",
                actual: "01001110",
                expected: "01000010",
                component: { kind: "buf", path: "buf1" },
                inputsSeen: { "a (bits11_36)": "0" },
                cone: ["buf1", "const1"],
              },
              marked: [],
            },
          ],
        }}
      />,
    );
    expect(screen.getByText("IR=13123000")).toBeInTheDocument();
    expect(screen.getByText(/Signal RESULT was 4E, but the test expected 42/)).toBeInTheDocument();
    expect(screen.queryByText(S.challenge.coneHint, { exact: false })).toBeNull();
    expect(screen.queryByText(/buf1/)).toBeNull();
  });
});
