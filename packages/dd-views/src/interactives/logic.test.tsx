// @vitest-environment jsdom
// Copyright © 2026 Chris Snow

// Module 2's figures: two circuits compared, a table read in pairs, a circuit's own table in the
// explorer, and a circuit written as one expression per output.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import type { Interactive, Lesson } from "@dd/lesson-schema";

import { DEFAULT_VIEW_STRINGS as S, format } from "../strings";
import { CircuitCompare, compareAnswer } from "./CircuitCompare";
import { CircuitExplorer } from "./CircuitExplorer";
import { CircuitText } from "./CircuitText";
import { FaultLab } from "./FaultLab";
import { InputPairs } from "./InputPairs";

const lesson = { id: "logic", challenges: [] } as unknown as Lesson;

function mount(View: typeof CircuitCompare, interactive: Interactive) {
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<View lesson={lesson} interactive={interactive} store={store} />);
}

const figure = (kind: string, props: Record<string, unknown>): Interactive => ({
  id: "f",
  kind,
  timeModel: "none",
  caption: "c",
  props,
});

describe("two circuits compared", () => {
  const props = {
    circuits: [
      { libraryId: "call-rows", label: "Rows" },
      { libraryId: "call-too-short", label: "Short" },
    ],
    show: ["gates"],
    question: "Same?",
    options: [
      { value: "same", label: "the same rows" },
      { value: "different", label: "different rows" },
    ],
    explain: "Row six.",
  };

  it("hides the counts and the table until the learner commits, then marks the row that differs", async () => {
    const user = userEvent.setup();
    const { container } = mount(CircuitCompare, figure("circuit-compare", props));
    expect(container.querySelector(".compare-measures")).toBeNull();
    expect(container.querySelector("table")).toBeNull();
    await user.click(screen.getByLabelText("the same rows"));
    await user.click(screen.getByRole("button", { name: S.prediction.commit }));
    expect(screen.getByRole("status")).toHaveTextContent(S.prediction.noMatch);
    expect(container.querySelector(".compare-summary")).toHaveTextContent(
      format(S.compare.someDiffer, { n: 1, total: 8 }),
    );
    const marked = container.querySelectorAll("tr.row-current");
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveTextContent(S.compare.differs);
    expect(container.querySelectorAll(".compare-measures")[0]).toHaveTextContent(
      format(S.compare.gates, { n: 8 }),
    );
    expect(screen.getByText("Row six.")).toBeInTheDocument();
  });

  it("shows everything at once without a question, and answers from the simulator", () => {
    const { container } = mount(
      CircuitCompare,
      figure("circuit-compare", {
        circuits: [
          { libraryId: "two-lamps-separate", label: "Separate" },
          { libraryId: "two-lamps-shared", label: "Shared" },
        ],
        show: ["gates", "depth"],
        table: false,
      }),
    );
    expect(container.querySelector("table")).toBeNull();
    const measures = [...container.querySelectorAll(".compare-measures")].map((e) => e.textContent);
    expect(measures[0]).toContain(format(S.compare.gates, { n: 6 }));
    expect(measures[1]).toContain(format(S.compare.depth, { n: 3 }));
    expect(screen.getByRole("status")).toHaveTextContent(format(S.compare.allSame, { total: 8 }));
    expect(compareAnswer("call-rows", "call-short")).toBe("same");
  });
});

describe("a table read in pairs", () => {
  it("pairs the rows by the chosen input and counts where it matters", async () => {
    const user = userEvent.setup();
    const { container } = mount(
      InputPairs,
      figure("input-pairs", { libraryId: "call-rows", input: "WARM", drawing: false }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.pairs.summary, { input: "WARM", n: 2, total: 4 }),
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(4);
    await user.click(screen.getByLabelText("CLOSED"));
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.pairs.summary, { input: "CLOSED", n: 2, total: 4 }),
    );
    expect(
      screen.getByRole("columnheader", { name: format(S.pairs.matters, { input: "CLOSED" }) }),
    ).toBeInTheDocument();
  });
});

describe("the explorer with the circuit's own table", () => {
  it("marks the row of the inputs now, and moves it when an input is pressed", async () => {
    const user = userEvent.setup();
    const { container } = mount(
      CircuitExplorer,
      figure("circuit-explorer", { libraryId: "and-gate", truthTable: "circuit" }),
    );
    const table = screen.getByRole("table", { name: S.explorer.ownTable });
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(container.querySelector("tr.row-current")).toHaveTextContent("000");
    await user.click(
      screen.getAllByRole("button", { name: new RegExp(`^A.*${S.circuit.toggle}`) })[0]!,
    );
    expect(container.querySelector("tr.row-current")).toHaveTextContent("100");
  });
});

describe("a circuit written as expressions", () => {
  it("prints one assign per output", () => {
    mount(CircuitText, figure("circuit-text", { libraryId: "alarm", form: "expression" }));
    expect(screen.getByLabelText(S.hdl.generated)).toHaveTextContent(
      "assign ALARM = WARM & ~DOOR;",
    );
  });
});

describe("a fault in the lesson's own words", () => {
  it("shows the lesson's explanation in place of the fault library's", async () => {
    const user = userEvent.setup();
    mount(
      FaultLab as typeof CircuitCompare,
      figure("fault-lab", {
        libraryId: "alarm",
        faults: [
          { kind: "stuck-at", net: "DOOR", value: 0, label: "Broken switch", explanation: "Mine." },
        ],
        run: [{ label: "row", set: { WARM: 1, DOOR: 1 } }],
      }),
    );
    await user.click(screen.getByLabelText("Broken switch"));
    expect(screen.getByText("Mine.")).toBeInTheDocument();
  });
});
