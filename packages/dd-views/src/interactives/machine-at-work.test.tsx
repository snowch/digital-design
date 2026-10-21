// Copyright © 2026 Christopher Snow

// @vitest-environment jsdom

// The compact window a phone shows for the run investigation (`mobile: true`): it follows the
// real machine's next instruction, browsing it does not run the machine, Show all lists the whole
// program, and the summary under the controls says what the last instruction changed, read off the
// machine's own before-and-after snapshots. Without `mobile` the figure keeps its full-list table.

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_VIEW_STRINGS as V, format } from "@dd/dd-views";
import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import type { Interactive, Lesson } from "@platform/lesson-schema";

import { MachineAtWork } from "./MachineAtWork";

const lesson = { id: "machine-at-work-test", challenges: [] } as unknown as Lesson;
const M = V.meet;

const PROPS = {
  program: "gap",
  inputs: { SENSORA: "-184", SENSORB: "-250" },
  mobile: true,
};

function mount(props: Record<string, unknown>, id = "run") {
  const interactive: Interactive = {
    id,
    kind: "machine-at-work",
    timeModel: "none",
    caption: "c",
    props,
  };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<MachineAtWork lesson={lesson} interactive={interactive} store={store} />);
}

/** The window's rows, as "number text", without the screen-reader-only marks. */
function windowRows(): string[] {
  return within(document.querySelector(".meet-window-table") as HTMLElement)
    .getAllByRole("row")
    .map((r) => {
      const number = within(r).getByRole("rowheader").textContent?.replace(/\D/g, "") ?? "";
      const text = within(r)
        .getAllByRole("cell")
        .map((c) => c.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .join(" ")
        .replace(/Instruction \d+, (next to run|the one it stopped after)\./g, "")
        .trim();
      return `${number} ${text}`;
    });
}

afterEach(cleanup);

describe("the compact window on a phone", () => {
  it("follows the machine: at most three instructions, the next one marked", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    // Instruction 1 is next; there is no invented instruction before it.
    expect(windowRows()).toEqual([
      "1 R1 becomes room A's reading",
      "2 R2 becomes room B's reading",
      "3 R3 becomes R1 minus R2",
    ]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    // No separate status line under the list on the compact view.
    expect(document.querySelector(".datapath-status")).toBeNull();
    // Before any instruction runs, the summary says it is ready and invents no change.
    expect(screen.getByText(format(M.changedSummary.ready, { line: 1 }))).toBeTruthy();

    await user.click(screen.getByRole("button", { name: M.step }));
    // The window follows the machine; instruction 2 is next, 1 and 3 are its neighbours.
    expect(windowRows()).toEqual([
      "1 R1 becomes room A's reading",
      "2 R2 becomes room B's reading",
      "3 R3 becomes R1 minus R2",
    ]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
    // The summary says what instruction 1 changed: R1, read off the machine.
    const summary = document.querySelector(".meet-changed")!;
    expect(summary).toHaveTextContent(format(M.changedSummary.headingLine, { line: 1 }));
    expect(within(summary as HTMLElement).getByText("R1")).toBeTruthy();
    expect(within(summary as HTMLElement).getByText("-184")).toBeTruthy();
    expect(within(summary as HTMLElement).getAllByText(M.changedSummary.changed).length).toBe(1);
    expect(
      within(summary as HTMLElement).getAllByText(M.changedSummary.unchanged).length,
    ).toBeGreaterThan(0);
  });

  it("after instruction 3, R3 is 66 and instruction 4 is next", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    await user.click(step);
    await user.click(step);
    await user.click(step);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("4");
    const summary = document.querySelector(".meet-changed")!;
    expect(summary).toHaveTextContent(format(M.changedSummary.headingLine, { line: 3 }));
    expect(within(summary as HTMLElement).getByText("R3")).toBeTruthy();
    expect(within(summary as HTMLElement).getByText("66")).toBeTruthy();
    // The display has not changed yet, and the summary says so rather than showing a made-up 0.
    expect(
      within(summary as HTMLElement).getAllByText(M.changedSummary.unchanged).length,
    ).toBeGreaterThan(0);
  });

  it("a branch from 6 shows 9 next, and 7 and 8 are not marked as run", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 6; k++) await user.click(step);
    // The gap is 66, under the limit of 100: instruction 6 goes to instruction 9.
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("9");
    const rows = windowRows();
    // The window is edge-fitting: 7, 8 and 9 are shown, with 9 the one next to run. The window's
    // rows are physically adjacent program positions, not execution history: 7 and 8 are shown
    // as neighbours, and neither is marked as the place the machine is.
    expect(rows).toEqual(["7 R5 becomes 4", "8 Set the lamps from R5", "9 Stop"]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("9");
    // Nothing marks 7 or 8 as the place the machine is.
    expect(
      screen.getAllByRole("row").filter((r) => r.getAttribute("aria-current") !== null),
    ).toHaveLength(1);
  });

  it("browsing does not run the machine, and Back to the next instruction restores follow", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.step }));
    // Browse away from instruction 2, which is next to run.
    await user.click(screen.getByRole("button", { name: M.window.next }));
    expect(screen.getByText(format(M.window.viewing, { viewing: 3, next: 2 }))).toBeTruthy();
    // The machine has not moved: instruction 2 is still next, no register changed.
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
    expect(
      within(document.querySelector(".meet-changed") as HTMLElement).getByText(
        format(M.changedSummary.headingLine, { line: 1 }),
      ),
    ).toBeTruthy();
    // The browsed row is not marked as the one the machine runs.
    const browsed = within(
      document.querySelector(".meet-window-table") as HTMLElement,
    ).getAllByRole("row")[2]!;
    expect(browsed.getAttribute("aria-current")).toBeNull();
    // Back to the next instruction follows the machine again.
    await user.click(screen.getByRole("button", { name: M.window.follow }));
    expect(screen.queryByText(/Viewing/)).toBeNull();
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
  });

  it("Show all lists the whole program, and Collapse returns to the window", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.window.showAll }));
    expect(windowRows()).toHaveLength(9);
    await user.click(screen.getByRole("button", { name: M.window.collapse }));
    expect(windowRows()).toHaveLength(3);
  });

  it("Start again resets the machine, the summary and the window", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    await user.click(step);
    await user.click(screen.getByRole("button", { name: M.window.next }));
    await user.click(screen.getByRole("button", { name: M.reset }));
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    expect(screen.queryByText(/Viewing/)).toBeNull();
    expect(screen.getByText(format(M.changedSummary.ready, { line: 1 }))).toBeTruthy();
  });

  it("the screen reader hears which instruction is next to run", async () => {
    mount(PROPS);
    expect(screen.getByText(format(M.window.nextAria, { line: 1 }))).toBeTruthy();
  });

  it("at STOP the window shows the last instruction as stopped, not as next to run", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 9; k++) await user.click(step);
    // Instruction 9 ran and the machine stopped: the row says so, and no row claims a next.
    expect(screen.queryByRole("row", { current: "step" })).toBeNull();
    const stopped = screen.getByRole("row", { current: true });
    expect(stopped).toHaveTextContent("9");
    expect(screen.getByText(format(M.window.stoppedAria, { line: 9 }))).toBeTruthy();
    // The summary still says what the last instruction changed, and the buttons are spent.
    expect(
      within(document.querySelector(".meet-changed") as HTMLElement).getByText(
        format(M.changedSummary.headingLine, { line: 9 }),
      ),
    ).toBeTruthy();
    expect(step).toBeDisabled();
  });
});

describe("without the mobile presentation, the figure keeps its full list", () => {
  it("shows every instruction, with the status line and the side-by-side tables", () => {
    mount({ program: "gap", inputs: { SENSORA: "-184", SENSORB: "-250" } });
    expect(screen.getAllByRole("row").length).toBeGreaterThan(3);
    expect(screen.getByText(format(M.status.next, { line: 1 }))).toBeTruthy();
    expect(document.querySelector(".meet-window")).toBeNull();
    expect(document.querySelector(".meet-changed")).toBeNull();
    expect(document.querySelector(".datapath-tables")?.className).not.toContain("meet-compact");
  });
});
