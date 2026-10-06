// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The two drawings that state no number of their own: a lesson's scene, which places the
// lesson's names, and a sum on paper, whose carries and digits are the model's.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import type { Interactive, Lesson } from "@dd/lesson-schema";

import { ColumnSum } from "./ColumnSum";
import { SceneFigure } from "./SceneFigure";

const lesson = { id: "scene-test", challenges: [] } as unknown as Lesson;

function mount(View: typeof SceneFigure, kind: string, props: Record<string, unknown>) {
  const interactive: Interactive = { id: "x", kind, timeModel: "none", caption: "c", props };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<View lesson={lesson} interactive={interactive} store={store} />);
}

const labels = { title: "A test scene", summary: "What it shows." };

describe("a lesson's scene", () => {
  const props = {
    sources: [
      {
        room: "Lab",
        items: [
          { kind: "sensor", label: "Probe", signal: "HOT" },
          { kind: "switch", label: "Levers", width: 4 },
        ],
      },
      { items: [{ kind: "clock", label: "Clock", signal: "CLK" }] },
    ],
    circuit: "?",
    outputs: [
      { kind: "lamp", label: "Bulb", signal: "ON" },
      { kind: "readout", label: "Panel", value: "0000", width: 4 },
    ],
    labels,
  };

  it("draws each source in its room, the circuit's box, and each output, with their names", () => {
    const { container } = mount(SceneFigure, "scene", props);
    const svg = screen.getByRole("img", { name: "A test scene. What it shows." });
    expect(svg.getAttribute("data-sources")).toBe("HOT,,CLK");
    expect(svg.getAttribute("data-outputs")).toBe("ON,");
    for (const text of ["Lab", "Probe", "HOT", "Levers", "Clock", "CLK", "?", "ON", "Bulb"])
      expect(svg).toHaveTextContent(text);
    // One room: the clock's group has none.
    expect(container.querySelectorAll(".room")).toHaveLength(1);
    // The four switches and the readout's word are buses, each with its count.
    expect(container.querySelectorAll("line.bus")).toHaveLength(2);
    expect([...container.querySelectorAll(".bus-count")].map((t) => t.textContent)).toEqual([
      "4",
      "4",
    ]);
    expect(container.querySelectorAll(".lamp")).toHaveLength(1);
    // A readout with a value shows it, with its label above.
    expect(container.querySelector(".readout-value")).toHaveTextContent("0000");
    expect(container.querySelector(".readout")).toHaveTextContent("Panel");
  });

  it("shows a readout's label inside it when it has no value", () => {
    const { container } = mount(SceneFigure, "scene", {
      ...props,
      outputs: [{ kind: "readout", label: "Display", width: 16 }],
    });
    expect(container.querySelector(".readout-value")).toHaveTextContent("Display");
    expect(container.querySelector(".readout")?.querySelectorAll("text")).toHaveLength(1);
  });

  it("says what is wrong with props that give the circuit nothing to drive", () => {
    mount(SceneFigure, "scene", { ...props, outputs: [] });
    expect(screen.getByRole("note")).toHaveTextContent("outputs");
  });
});

describe("a sum on paper", () => {
  const labels = { carries: "Carries", title: "A sum", summary: "What it adds." };

  it("writes the model's carries above the columns they go into, and the sum under the rule", () => {
    const { container } = mount(ColumnSum as typeof SceneFigure, "column-sum", {
      a: "0011",
      b: "0011",
      labels,
    });
    const svg = screen.getByRole("img", { name: "A sum. What it adds." });
    expect(svg.getAttribute("data-sum")).toBe("00110");
    expect(svg.getAttribute("data-carries")).toBe("00110");
    const carries = [...container.querySelectorAll(".carry")];
    expect(carries.map((c) => c.getAttribute("data-column"))).toEqual(["1", "2"]);
    expect(container.querySelectorAll(".carry-arrow")).toHaveLength(2);
    // No carry out of the top column, so the sum is as wide as the words.
    const sum = [...container.querySelectorAll(".sum-digit")].map((t) => t.textContent);
    expect(sum.join("")).toBe("0110");
    expect(svg).toHaveTextContent("Carries");
  });

  it("writes a carry out of the top column as one more digit of the sum", () => {
    const { container } = mount(ColumnSum as typeof SceneFigure, "column-sum", {
      a: "1111",
      b: "0001",
      labels,
    });
    const carries = [...container.querySelectorAll(".carry")];
    expect(carries.map((c) => c.getAttribute("data-column"))).toEqual(["1", "2", "3", "4"]);
    const sum = [...container.querySelectorAll(".sum-digit")].map((t) => t.textContent);
    expect(sum.join("")).toBe("10000");
  });

  it("says what is wrong with two words of different widths", () => {
    mount(ColumnSum as typeof SceneFigure, "column-sum", { a: "011", b: "0011", labels });
    expect(screen.getByRole("note")).toHaveTextContent("same width");
  });
});
