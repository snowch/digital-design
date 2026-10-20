// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow
// A scene wider than its card, whose wires are unnamed, compresses its wire columns before it
// scrolls: GAP_ALARM on Module 0's shop scene, on a phone.
import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import type { Interactive, Lesson } from "@platform/lesson-schema";
import { SceneFigure } from "./SceneFigure";

const lesson = { id: "scene-test", challenges: [] } as unknown as Lesson;
function mount(props: Record<string, unknown>) {
  const interactive: Interactive = {
    id: "x",
    kind: "scene",
    timeModel: "none",
    caption: "c",
    props,
  };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<SceneFigure lesson={lesson} interactive={interactive} store={store} />);
}

const shop = {
  sources: [
    { room: "Room A", items: [{ kind: "sensor", label: "Sensor" }] },
    { room: "Room B", items: [{ kind: "sensor", label: "Sensor" }] },
  ],
  circuit: "Machine",
  outputs: [
    { kind: "readout", label: "Display" },
    { kind: "lamp", label: "ALARM" },
    { kind: "lamp", label: "NIGHT" },
    { kind: "lamp", label: "GAP_ALARM" },
  ],
  labels: { title: "The shop and the machine", summary: "s" },
};

describe("a scene wider than its card", () => {
  beforeAll(() => {
    // jsdom measures nothing; the hook reads getBoundingClientRect, so give the wrap a width.
    Element.prototype.getBoundingClientRect = () =>
      ({ width: 319, height: 100, x: 0, y: 0, top: 0, left: 0 }) as DOMRect;
  });

  it("compresses its unnamed wire columns and draws no wider than the card", () => {
    const { container } = mount(shop);
    const svg = container.querySelector("svg")!;
    expect(Number(svg.getAttribute("width"))).toBeLessThanOrEqual(319);
  });

  it("names its wires after their signals, which no compression may shorten", () => {
    const { container } = mount({
      ...shop,
      outputs: [{ kind: "lamp", label: "ALARM", signal: "ALARM" }],
    });
    expect(container.querySelector("svg")!.getAttribute("data-outputs")).toBe("ALARM");
  });
});
