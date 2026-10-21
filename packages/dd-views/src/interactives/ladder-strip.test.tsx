// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The prediction's ladder, with the strip: the strip is the visual premise of the question,
// before the choices; the real circuit stays closed until the learner opens it; Try again
// closes it again. The investigation's ladder, without the strip, keeps its navigation.
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import type { Interactive, Lesson } from "@platform/lesson-schema";
import { Ladder } from "./Ladder";

const lesson = { id: "ladder-test", challenges: [] } as unknown as Lesson;

const LEVELS = [
  { title: "The adding part", caption: "c1", module: 3, moduleName: "m3", place: "adding" },
  { title: "The smallest parts", caption: "c2", module: 2, moduleName: "m2", place: "smallest" },
  { title: "One wire", caption: "c3", module: 1, moduleName: "m1", place: "wire" },
];

function mount(props: Record<string, unknown>, id = "x") {
  const interactive: Interactive = {
    id,
    kind: "ladder",
    timeModel: "none",
    caption: "c",
    props,
  };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<Ladder lesson={lesson} interactive={interactive} store={store} />);
}

const stripProps = {
  program: "gap",
  inputs: { SENSORA: "-184", SENSORB: "-250" },
  lines: 2,
  strip: true,
  levels: LEVELS,
  question: "Which wires give 1?",
  options: [
    { value: "64 + 2", label: "The wires worth 64 and 2" },
    { value: "66", label: "One wire worth 66" },
    { value: "all", label: "All 64 wires" },
  ],
  explain: "66 is 64 + 2.",
};

describe("the prediction's ladder with the strip", () => {
  it("shows the strip before the choices, with every wire a question mark", () => {
    mount(stripProps);
    const table = screen.getByRole("table");
    const firstRadio = screen.getAllByRole("radio")[0]!;
    // The strip precedes the first radio in the DOM, so in reading order too.
    expect(
      table.compareDocumentPosition(firstRadio) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("cell").map((c) => c.textContent)).toEqual(
      Array.from({ length: 8 }, () => "?"),
    );
  });

  it("renders no circuit until the learner commits and chooses to explore", async () => {
    cleanup();
    const user = userEvent.setup();
    mount(stripProps);
    expect(screen.queryByRole("button", { name: /Explore the slice worth 2/ })).toBeNull();
    expect(screen.queryByRole("img", { name: /Inside this part/ })).toBeNull();
    // Commit: the circuit is still closed, behind its open button.
    await user.click(screen.getAllByRole("radio")[0]!);
    await user.click(screen.getByRole("button", { name: /Check my prediction/ }));
    expect(screen.getByRole("button", { name: /Explore the slice worth 2/ })).toBeTruthy();
    expect(screen.queryByRole("img", { name: /Inside this part/ })).toBeNull();
    // Open it: the circuit and its level controls appear.
    await user.click(screen.getByRole("button", { name: /Explore the slice worth 2/ }));
    expect(screen.getByRole("button", { name: "Down a level" })).toBeTruthy();
  });

  it("Try again hides the values and closes the circuit again", async () => {
    cleanup();
    const user = userEvent.setup();
    mount(stripProps);
    await user.click(screen.getAllByRole("radio")[0]!);
    await user.click(screen.getByRole("button", { name: /Check my prediction/ }));
    await user.click(screen.getByRole("button", { name: /Explore the slice worth 2/ }));
    await user.click(screen.getByRole("button", { name: "Predict again" }));
    expect(screen.getAllByRole("cell").map((c) => c.textContent)).toEqual(
      Array.from({ length: 8 }, () => "?"),
    );
    expect(screen.queryByRole("button", { name: "Down a level" })).toBeNull();
    expect(screen.queryByRole("img", { name: /Inside this part/ })).toBeNull();
  });

  it("the investigation's ladder, without the strip, keeps its levels from the start", () => {
    cleanup();
    mount({ ...stripProps, strip: false, question: undefined, options: undefined });
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: "Down a level" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Inside this part/ })).toBeTruthy();
  });
});
