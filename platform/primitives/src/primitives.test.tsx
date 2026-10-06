// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The shared primitives on their own, with no circuit: each is tested for the behaviour its
// figures rely on, so a change here is caught before any lesson shows it.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  DrillDown,
  FaultInjector,
  PredictionChallenge,
  StateInspector,
  Stepper,
  Timeline,
  drillLevels,
  layoutMarks,
} from "./index";

const OPTIONS = [
  { value: "0", label: "Zero" },
  { value: "1", label: "One" },
];

describe("PredictionChallenge", () => {
  function Harness({ verdict }: { verdict?: boolean }) {
    const [committed, setCommitted] = useState<string | undefined>();
    return (
      <PredictionChallenge
        name="q"
        options={OPTIONS}
        committed={committed}
        onCommit={setCommitted}
        onAgain={() => setCommitted(undefined)}
        legend="Your prediction"
        commitLabel="Check my prediction"
        againLabel="Predict again"
        {...(verdict ? { verdict: <p role="status">You said {committed}.</p> } : {})}
      />
    );
  }

  it("offers no 'Predict again' when the figure keeps the commitment", async () => {
    render(
      <PredictionChallenge
        name="kept"
        options={OPTIONS}
        committed="1"
        onCommit={() => {}}
        legend="Your prediction"
        commitLabel="Check my prediction"
      />,
    );
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "One" })).toBeDisabled();
    expect(screen.queryAllByRole("button")).toEqual([]);
  });

  it("commits only once an option is chosen, then locks the options", async () => {
    render(<Harness />);
    const commit = screen.getByRole("button", { name: "Check my prediction" });
    expect(commit).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "One" }));
    expect(commit).toBeEnabled();
    await userEvent.click(commit);
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "One" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Check my prediction" })).toBeNull();
  });

  it("shows the verdict before 'Predict again', which clears the choice", async () => {
    render(<Harness verdict />);
    await userEvent.click(screen.getByRole("radio", { name: "Zero" }));
    await userEvent.click(screen.getByRole("button", { name: "Check my prediction" }));
    const verdict = screen.getByRole("status");
    const again = screen.getByRole("button", { name: "Predict again" });
    expect(verdict).toHaveTextContent("You said 0.");
    expect(verdict.compareDocumentPosition(again) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(again);
    expect(screen.getByRole("radio", { name: "Zero" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Check my prediction" })).toBeDisabled();
  });
});

describe("FaultInjector", () => {
  it("offers no fault first, and says which is chosen", async () => {
    const onChoose = vi.fn();
    render(
      <FaultInjector
        name="f"
        legend="Choose a fault"
        noneLabel="No fault"
        faults={[{ label: "A stuck at 0" }, { label: "B cut" }]}
        chosen={-1}
        onChoose={onChoose}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.closest("label")?.textContent)).toEqual([
      "No fault",
      "A stuck at 0",
      "B cut",
    ]);
    expect(radios[0]).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "B cut" }));
    expect(onChoose).toHaveBeenCalledWith(1);
  });
});

describe("Stepper", () => {
  function Harness({ last }: { last: number }) {
    const [step, setStep] = useState(0);
    return (
      <Stepper
        step={step}
        last={last}
        onStep={setStep}
        label="Step"
        position={`${Math.min(step, last)} of ${last}`}
        buttons={{ back: "Back a step", next: "Next step", end: "Last step" }}
        status={`at ${Math.min(step, last)}`}
      />
    );
  }

  it("moves a step at a time and stops at both ends", async () => {
    render(<Harness last={3} />);
    const back = screen.getByRole("button", { name: "Back a step" });
    const next = screen.getByRole("button", { name: "Next step" });
    expect(back).toBeDisabled();
    await userEvent.click(next);
    expect(screen.getByRole("status")).toHaveTextContent("at 1");
    await userEvent.click(screen.getByRole("button", { name: "Last step" }));
    expect(screen.getByRole("status")).toHaveTextContent("at 3");
    expect(next).toBeDisabled();
    expect(screen.getByRole("slider")).toHaveValue("3");
  });

  it("shows the last step for a step past it", () => {
    render(
      <Stepper step={9} last={2} onStep={() => {}} label="Step" position="2 of 2" status="" />,
    );
    expect(screen.getByRole("slider")).toHaveValue("2");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("StateInspector", () => {
  it("names each row and writes each reading with its class", () => {
    render(
      <StateInspector
        className="signal-table"
        caption="Values now"
        headings={["Signal", "Value"]}
        rows={[{ key: "q", name: "Q", cells: [{ text: "1", className: "value-high" }] }]}
      />,
    );
    const table = screen.getByRole("table", { name: "Values now" });
    expect(table).toHaveClass("signal-table");
    expect(screen.getByRole("rowheader", { name: "Q" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1" })).toHaveClass("value-high");
  });
});

describe("DrillDown", () => {
  it("names each level once, collapsing two with one label into the deeper", () => {
    const labels: Record<string, string> = { a: "ram", "a/b": "ram", "a/b/c": "flip-flop" };
    expect(drillLevels("a/b/c", "top", (path) => labels[path] ?? path)).toEqual([
      { path: "", label: "top" },
      { path: "a/b", label: "ram" },
      { path: "a/b/c", label: "flip-flop" },
    ]);
    expect(drillLevels("", "top", () => "never")).toEqual([{ path: "", label: "top" }]);
  });

  it("goes back to a level pressed, and the level shown cannot be pressed", async () => {
    const onGo = vi.fn();
    render(
      <DrillDown
        label="Where you are"
        levels={[
          { path: "", label: "top" },
          { path: "a", label: "ram" },
        ]}
        current="a"
        onGo={onGo}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Where you are" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ram" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "top" }));
    expect(onGo).toHaveBeenCalledWith("");
  });
});

describe("Timeline", () => {
  it("puts a label that would touch the one before it on the second row", () => {
    const x = (t: number) => t * 10;
    const rows = layoutMarks(
      [
        { time: 2, label: "edge 1" },
        { time: 3, label: "edge 2" },
        { time: 20, label: "edge 3" },
      ],
      0,
      30,
      x,
      316,
    );
    expect(rows.map((r) => r.row)).toEqual([0, 1, 0]);
  });

  it("anchors the first and last labels inwards", () => {
    const rows = layoutMarks(
      [
        { time: 0, label: "start" },
        { time: 10, label: "end" },
      ],
      0,
      10,
      (t) => t * 10,
      116,
    );
    expect(rows.map((r) => r.anchor)).toEqual(["start", "end"]);
  });

  it("draws a lane per name, and a cursor slider only when the cursor can move", async () => {
    const onCursor = vi.fn();
    const props = {
      lanes: [{ label: "CLK" }, { label: "Q" }],
      from: 0,
      end: 4,
      marks: [],
      cursor: 1,
      cursorLabel: "Time 1",
      title: "A run",
      scrollNote: "Scroll sideways",
      focus: 0,
      renderLane: (i: number, top: number) => <rect data-lane={i} y={top} />,
    };
    const { container, rerender } = render(<Timeline {...props} />);
    expect(container.querySelectorAll("g.lane")).toHaveLength(2);
    expect(container.querySelector('g.lane[data-signal="Q"] rect')?.getAttribute("y")).toBe("96");
    expect(screen.queryByRole("slider")).toBeNull();
    rerender(<Timeline {...props} onCursor={onCursor} />);
    expect(screen.getByRole("slider", { name: "Time 1" })).toHaveValue("1");
  });
});
