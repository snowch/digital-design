// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The eight lowest wires of the part that adds, as the prediction shows them: the values come
// from the simulator's own wires, hidden until the learner commits, and the wires that give 1
// are marked once they do. The 56 higher wires are named, not drawn, and are all 0 here.
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { meetMachine, meetStart, sliceDigits } from "@dd/dd-model";
import { OutputStrip } from "./OutputStrip";

/** The machine the Module 0 figures run, paused before instruction 3, as the lesson pauses it. */
function paused() {
  const built = meetMachine({ program: "gap" });
  return meetStart(built, {
    program: "gap",
    inputs: { SENSORA: "-184", SENSORB: "-250" },
    lines: 2,
  });
}

function mount(shown: boolean) {
  return render(<OutputStrip sim={paused()} shown={shown} />);
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
    expect(sliceDigits(paused(), 8)).toBe("01000010");
  });
});
