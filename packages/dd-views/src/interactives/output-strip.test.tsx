// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The eight lowest wires of the part that adds, as the prediction shows them: the values come
// from the simulator's own wires, hidden until the learner commits, and the wires that give 1
// are marked once they do. The 56 higher wires are named, not drawn, and are all 0 here.
import { cleanup, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { meetMachine, meetStart, sliceDigits } from "@dd/dd-model";
import { OutputStrip } from "./OutputStrip";

/** The machine the Module 0 figures run, paused before instruction 3, at given readings. */
function paused(a: string, b: string) {
  const built = meetMachine({ program: "gap" });
  return meetStart(built, {
    program: "gap",
    inputs: { SENSORA: a, SENSORB: b },
    lines: 2,
  });
}

function mount(shown: boolean, sim = paused("-184", "-250")) {
  return render(<OutputStrip sim={sim} shown={shown} />);
}

describe("the eight wires of least worth", () => {
  it("hides every wire's value until the learner commits", () => {
    mount(false);
    const cells = screen.getAllByRole("cell");
    expect(cells.map((c) => c.textContent)).toEqual(Array.from({ length: 8 }, () => "?"));
  });

  it("shows the simulator's own answer, with the two wires that give 1 marked", () => {
    mount(true);
    const cells = screen.getAllByRole("cell");
    expect(cells.map((c) => c.textContent).join("")).toBe("01000010");
    const marked = cells.filter((c) => c.className.includes("strip-one"));
    expect(marked.map((c) => c.textContent)).toEqual(["1", "1"]);
    // The two marked wires are the ones worth 64 and 2, by their column headings.
    const table = screen.getByRole("table");
    const heads = within(table).getAllByRole("columnheader");
    expect(
      marked.map((c) => heads[cells.indexOf(c)]?.textContent),
      "the marked columns are worth 64 and 2",
    ).toEqual(["64", "2"]);
    expect(screen.getByText(/64 and 2/)).toBeTruthy();
    expect(screen.getByText(/56 wires of higher worth/)).toBeTruthy();
  });

  it("reads the digits off the same simulator the ladder reads", () => {
    expect(sliceDigits(paused("-184", "-250"), 8)).toBe("01000010");
  });

  // A value whose eight bits are not a palindrome, so a reversed mapping would show: the
  // construction's own readings, -180 and -250, give 70 and 01000110 (worths 64, 4 and 2).
  it("maps each wire's value to its own worth, not reversed (70 is not 98)", () => {
    const sim = paused("-180", "-250");
    expect(sliceDigits(sim, 8)).toBe("01000110");
    mount(true, sim);
    const cells = screen.getAllByRole("cell");
    expect(cells.map((c) => c.textContent).join("")).toBe("01000110");
    const table = screen.getByRole("table");
    const heads = within(table).getAllByRole("columnheader");
    const marked = cells.filter((c) => c.className.includes("strip-one"));
    expect(
      marked.map((c) => heads[cells.indexOf(c)]?.textContent),
      "the marked columns are worth 64, 4 and 2",
    ).toEqual(["64", "4", "2"]);
    expect(screen.getByText(/64 and 4 and 2/)).toBeTruthy();
  });

  // The extreme worths, one bit each: 1 is the last column, 128 the first.
  it("marks the single wire worth 1 for 1, and the single wire worth 128 for 128", () => {
    for (const [a, b, digits, worth] of [
      ["-249", "-250", "00000001", "1"],
      ["-122", "-250", "10000000", "128"],
    ] as const) {
      cleanup();
      const sim = paused(a, b);
      expect(sliceDigits(sim, 8)).toBe(digits);
      mount(true, sim);
      const marked = screen.getAllByRole("cell").filter((c) => c.className.includes("strip-one"));
      expect(marked).toHaveLength(1);
      const table = screen.getByRole("table");
      const heads = within(table).getAllByRole("columnheader");
      expect(heads[screen.getAllByRole("cell").indexOf(marked[0]!)]?.textContent).toBe(worth);
    }
  });
});
