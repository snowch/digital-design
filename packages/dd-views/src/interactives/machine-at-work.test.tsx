// Copyright © 2026 Christopher Snow

// @vitest-environment jsdom

// The mobile presentation of the run investigation (`mobile: true`): the whole program on show by
// default, with a Follow execution switch to the three-instruction window. Both modes are views over
// the real machine: they follow its next instruction, browsing does not run it, and the summary
// under the controls says what the last instruction changed, read off the machine's own
// before-and-after snapshots. Without `mobile` the figure keeps its full-list table.

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

/** The program rows on show, as "number text", without the screen-reader-only marks. */
function programRows(): string[] {
  return within(document.querySelector(".meet-window") as HTMLElement)
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

/** One instruction's row: its number and its text in one semantic row. */
function rowOf(line: number): HTMLElement {
  return within(document.querySelector(".meet-window") as HTMLElement)
    .getAllByRole("row")
    .find((r) => within(r).getByRole("rowheader").textContent?.includes(String(line)))!;
}

afterEach(cleanup);

describe("the mobile presentation: full program by default", () => {
  it("shows all nine instructions, with instruction 1 next and no invented change", () => {
    mount(PROPS);
    // Full program is the default: every instruction is on show, in program order.
    expect(programRows()).toEqual([
      "1 R1 becomes room A's reading",
      "2 R2 becomes room B's reading",
      "3 R3 becomes R1 minus R2",
      "4 Show R3 on the display",
      "5 R4 becomes 100",
      "6 If R3 is less than R4, go to instruction 9",
      "7 R5 becomes 4",
      "8 Set the lamps from R5",
      "9 Stop",
    ]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    // The header carries the position; no separate status line under the list.
    expect(screen.getByText(format(M.window.position, { n: 1, total: 9 }))).toBeTruthy();
    expect(document.querySelector(".datapath-status")).toBeNull();
    // Before any instruction runs, the summary says it is ready and invents no change.
    expect(screen.getByText(format(M.changedSummary.ready, { line: 1 }))).toBeTruthy();
  });

  it("keeps the number and the instruction's words in one row, with the arrow on the next row", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const row = rowOf(1);
    // Number and text are cells of the same row, not stacked blocks.
    expect(within(row).getByRole("rowheader")).toHaveTextContent("1");
    expect(within(row).getByRole("cell")).toHaveTextContent("R1 becomes room A's reading");
    expect(row.querySelector(".meet-line-arrow")?.textContent).toBe("▶");
    // The whole row carries the mark, not an extra line.
    expect(row.className).toContain("row-current");
    await user.click(screen.getByRole("button", { name: M.step }));
    expect(rowOf(2).querySelector(".meet-line-arrow")?.textContent).toBe("▶");
    expect(rowOf(1).querySelector(".meet-line-arrow")?.textContent).toBe("");
  });

  it("after instruction 3, R3 is 66 and instruction 4 is next, with the display unchanged", async () => {
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

  it("at STOP the last instruction is marked stopped, not next to run", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 9; k++) await user.click(step);
    expect(screen.queryByRole("row", { current: "step" })).toBeNull();
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("9");
    expect(screen.getByText(format(M.window.stoppedAria, { line: 9 }))).toBeTruthy();
    expect(step).toBeDisabled();
  });
});

describe("Follow execution: the three-instruction window", () => {
  it("is off by default and shows the window when switched on, without running the machine", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    expect(programRows()).toHaveLength(9);
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    // The window shows at most three instructions: instruction 1 is next, with no invented
    // instruction before it.
    expect(programRows()).toEqual([
      "1 R1 becomes room A's reading",
      "2 R2 becomes room B's reading",
      "3 R3 becomes R1 minus R2",
    ]);
    // Switching modes did not step the machine: instruction 1 is still next, nothing changed.
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    expect(screen.getByText(format(M.changedSummary.ready, { line: 1 }))).toBeTruthy();
    // Switching back reveals all nine instructions again.
    await user.click(screen.getByRole("button", { name: M.window.modeFull }));
    expect(programRows()).toHaveLength(9);
  });

  it("follows the machine, and the 6 to 9 branch shows 9 without claiming 7 or 8 ran", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 6; k++) await user.click(step);
    // The gap is 66, under the limit of 100: instruction 6 goes to instruction 9. The window's
    // rows are physically adjacent program positions, not execution history: 7 and 8 are shown
    // as neighbours, and neither is marked as the place the machine is.
    expect(programRows()).toEqual(["7 R5 becomes 4", "8 Set the lamps from R5", "9 Stop"]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("9");
    expect(
      screen.getAllByRole("row").filter((r) => r.getAttribute("aria-current") !== null),
    ).toHaveLength(1);
  });

  it("browsing does not run the machine, and Back to the next instruction restores follow", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    await user.click(screen.getByRole("button", { name: M.step }));
    // Browse away from instruction 2, which is next to run.
    await user.click(screen.getByRole("button", { name: M.window.next }));
    expect(screen.getByText(format(M.window.viewing, { viewing: 3, next: 2 }))).toBeTruthy();
    // The machine has not moved: instruction 2 is still next, and the summary still names
    // instruction 1 as the last to run.
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
    expect(
      within(document.querySelector(".meet-changed") as HTMLElement).getByText(
        format(M.changedSummary.headingLine, { line: 1 }),
      ),
    ).toBeTruthy();
    // The browsed row is not marked as the one the machine runs.
    expect(rowOf(3).getAttribute("aria-current")).toBeNull();
    // Back to the next instruction follows the machine again.
    await user.click(screen.getByRole("button", { name: M.window.follow }));
    expect(screen.queryByText(/Viewing/)).toBeNull();
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
  });

  it("the arrow keys browse the window; Home and End go to its ends", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    const window = document.querySelector(".meet-window") as HTMLElement;
    window.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(format(M.window.viewing, { viewing: 2, next: 1 }))).toBeTruthy();
    await user.keyboard("{End}");
    expect(screen.getByText(format(M.window.viewing, { viewing: 9, next: 1 }))).toBeTruthy();
    await user.keyboard("{Home}");
    expect(screen.queryByText(/Viewing/)).toBeNull();
  });

  it("Start again resets the machine, the summary and the window, in either mode", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    await user.click(screen.getByRole("button", { name: M.step }));
    await user.click(screen.getByRole("button", { name: M.window.next }));
    await user.click(screen.getByRole("button", { name: M.reset }));
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    expect(screen.queryByText(/Viewing/)).toBeNull();
    expect(screen.getByText(format(M.changedSummary.ready, { line: 1 }))).toBeTruthy();
  });

  it("step, run and the summary work the same after switching modes", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.click(screen.getByRole("button", { name: M.step }));
    // Switch to the window mid-run: it centres on the machine's own next place.
    await user.click(screen.getByRole("button", { name: M.window.modeFollow }));
    expect(programRows()).toEqual([
      "1 R1 becomes room A's reading",
      "2 R2 becomes room B's reading",
      "3 R3 becomes R1 minus R2",
    ]);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
    // Switch back: all nine instructions, the same next row.
    await user.click(screen.getByRole("button", { name: M.window.modeFull }));
    expect(programRows()).toHaveLength(9);
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("2");
    // The summary still names the last instruction that ran.
    expect(
      within(document.querySelector(".meet-changed") as HTMLElement).getByText(
        format(M.changedSummary.headingLine, { line: 1 }),
      ),
    ).toBeTruthy();
  });

  it("the screen reader hears which instruction is next to run", async () => {
    mount(PROPS);
    expect(screen.getByText(format(M.window.nextAria, { line: 1 }))).toBeTruthy();
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
