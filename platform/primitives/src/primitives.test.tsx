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
  fitUnit,
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
        legend="Your prediction"
        commitLabel="Check my prediction"
        {...(verdict ? { verdict: <p role="status">You said {committed}.</p> } : {})}
      />
    );
  }

  it("keeps the options live after a commitment, so another can be tested", async () => {
    const commits: string[] = [];
    render(
      <PredictionChallenge
        name="kept"
        options={OPTIONS}
        committed="1"
        onCommit={(c) => void commits.push(c)}
        legend="Your prediction"
        commitLabel="Check my prediction"
      />,
    );
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "One" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Check my prediction" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Zero" }));
    await userEvent.click(screen.getByRole("button", { name: "Check my prediction" }));
    expect(commits).toEqual(["0"]);
  });

  it("commits only once an option is chosen, and allows a different one afterwards", async () => {
    render(<Harness />);
    const commit = screen.getByRole("button", { name: "Check my prediction" });
    expect(commit).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "One" }));
    expect(commit).toBeEnabled();
    await userEvent.click(commit);
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "One" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Check my prediction" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Zero" }));
    await userEvent.click(screen.getByRole("button", { name: "Check my prediction" }));
    expect(screen.getByRole("radio", { name: "Zero" })).toBeChecked();
  });

  it("shows the verdict beside the commit, which a new choice re-arms", async () => {
    render(<Harness verdict />);
    await userEvent.click(screen.getByRole("radio", { name: "Zero" }));
    await userEvent.click(screen.getByRole("button", { name: "Check my prediction" }));
    const verdict = screen.getByRole("status");
    const again = screen.getByRole("button", { name: "Check my prediction" });
    expect(verdict).toHaveTextContent("You said 0.");
    expect(verdict.compareDocumentPosition(again) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(again).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "One" }));
    expect(again).toBeEnabled();
    await userEvent.click(again);
    expect(screen.getByRole("radio", { name: "One" })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("You said 1.");
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

  it("widens a run until every numbered edge has room on one of the axis's two rows", () => {
    // Forty rises two units apart: at the base unit each label touches the one two before it.
    const marks = Array.from({ length: 40 }, (_, k) => ({ time: 2 * k + 2, label: `↑${k + 1}` }));
    const span = 82;
    const base = 700 / span;
    const x = (u: number) => (t: number) => t * u;
    const touches = (u: number) => {
      const rows = layoutMarks(marks, 0, span, x(u), span * u + 16);
      const extent = (r: (typeof rows)[number]) => {
        const w = r.label.length * 7.5;
        const px = r.time * u;
        return r.anchor === "start"
          ? [px, px + w]
          : r.anchor === "end"
            ? [px - w, px]
            : [px - w / 2, px + w / 2];
      };
      return rows.some((a, i) =>
        rows.slice(i + 1).some((b) => {
          if (a.row !== b.row) return false;
          const [al, ar] = extent(a);
          const [bl, br] = extent(b);
          return al! < br! && bl! < ar!;
        }),
      );
    };
    expect(touches(base)).toBe(true);
    const unit = fitUnit(marks, 0, span, base);
    expect(unit).toBeGreaterThan(base);
    expect(touches(unit)).toBe(false);
  });

  it("keeps a run whose labels already have room at the unit it was given", () => {
    const marks = [
      { time: 2, label: "edge 1" },
      { time: 20, label: "edge 2" },
    ];
    expect(fitUnit(marks, 0, 30, 10)).toBe(10);
  });

  it("gives a unit of time at least the caller's least, so a long run scrolls", () => {
    const props = {
      lanes: [{ label: "S" }],
      from: 0,
      end: 100,
      marks: [],
      cursor: 100,
      cursorLabel: "After the run",
      title: "A run",
      scrollNote: "Scroll sideways",
      focus: 100,
      renderLane: () => null,
    };
    const width = (c: HTMLElement) =>
      Number(c.querySelector("svg.timing-diagram")?.getAttribute("viewBox")?.split(" ")[2]);
    const { container, rerender } = render(<Timeline {...props} />);
    expect(width(container)).toBe(100 * 7 + 16);
    rerender(<Timeline {...props} minUnit={30} />);
    expect(width(container)).toBe(100 * 30 + 16);
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
