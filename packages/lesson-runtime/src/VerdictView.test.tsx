// @vitest-environment jsdom
// Copyright © 2026 Chris Snow

// Module 2: a failure that is not about one row (a gate budget, a depth) shows the book's
// sentence in place of the inputs and values, which it does not have.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VerdictView } from "./VerdictView";
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
    expect(container.querySelector(".verdict-values")).toBeNull();
    expect(screen.queryByText(S.challenge.inputs)).toBeNull();
  });
});
