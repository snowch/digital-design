// Copyright © 2026 Christopher Snow

// @vitest-environment jsdom

// The compact mobile runner (`mobile: true`): the whole program with one row per instruction, the
// machine's state always on show, and one short event line after a real step. No Ready card or
// empty "What changed?" panel renders before the first step. Every value comes from the real
// simulator's snapshots. Without `mobile` the figure keeps its full-list table and status line.

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

/** The program rows, as "number text", without the screen-reader-only marks. */
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

/** The always-visible machine-state tiles, as "name value". */
function stateTiles(): string[] {
  return within(document.querySelector(".meet-state") as HTMLElement)
    .getAllByRole("listitem")
    .map((li) => {
      const name = li.querySelector(".meet-tile-name")?.textContent?.trim() ?? "";
      const value = li.querySelector(".meet-tile-value")?.textContent?.trim() ?? "";
      return `${name} ${value}`;
    });
}

/** The one event line, or null when no instruction has run. */
function eventLine(): string | null {
  const el = document.querySelector(".meet-event");
  return el === null ? null : (el.textContent?.replace(/\s+/g, " ").trim() ?? "");
}

afterEach(cleanup);

describe("the compact mobile runner", () => {
  it("shows all nine instructions by default, with instruction 1 next and no Ready card", () => {
    mount(PROPS);
    // The complete program, in program order, each number and its text in one row.
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
    expect(screen.getByText(format(M.window.position, { n: 1, total: 9 }))).toBeTruthy();
    // No Ready message, no empty "What changed?" panel, no event line: the highlighted
    // instruction is the guidance.
    expect(screen.queryByText(/Ready for instruction/)).toBeNull();
    expect(screen.queryByText(/What changed/)).toBeNull();
    expect(eventLine()).toBeNull();
    expect(document.querySelector(".meet-changed")).toBeNull();
    // The machine's state is already on show, with not-yet-set numbers as dashes, not as 0.
    expect(stateTiles()).toEqual([
      "R1 —",
      "R2 —",
      "R3 —",
      "R4 —",
      "R5 —",
      "The display 0",
      "ALARM dark",
      "NIGHT dark",
      "GAP_ALARM dark",
    ]);
  });

  it("keeps the number and the instruction's words in one row, with the arrow on the next row", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const row = rowOf(1);
    expect(within(row).getByRole("rowheader")).toHaveTextContent("1");
    expect(within(row).getByRole("cell")).toHaveTextContent("R1 becomes room A's reading");
    expect(row.querySelector(".meet-line-arrow")?.textContent).toBe("▶");
    expect(row.className).toContain("row-current");
    await user.click(screen.getByRole("button", { name: M.step }));
    expect(rowOf(2).querySelector(".meet-line-arrow")?.textContent).toBe("▶");
    expect(rowOf(1).querySelector(".meet-line-arrow")?.textContent).toBe("");
  });

  it("after a real step, one short event says what the instruction did", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    await user.click(step);
    // Instruction 1: R1 became -184, read off the machine's own snapshots.
    expect(eventLine()).toBe(
      format(M.window.eventRegister, { line: 1, name: "R1", value: "-184" }),
    );
    // The register tile shows the same value, and is marked as changed.
    expect(stateTiles()[0]).toBe("R1 -184");
    expect(
      within(document.querySelector(".meet-state") as HTMLElement).getAllByRole("listitem")[0]!
        .className,
    ).toContain("row-current");
    await user.click(step);
    expect(eventLine()).toBe(
      format(M.window.eventRegister, { line: 2, name: "R2", value: "-250" }),
    );
    await user.click(step);
    // Instruction 3: R3 became 66; the display is still 0 and no fake change is claimed.
    expect(eventLine()).toBe(format(M.window.eventRegister, { line: 3, name: "R3", value: "66" }));
    expect(stateTiles()[2]).toBe("R3 66");
    expect(stateTiles()[5]).toBe("The display 0");
  });

  it("after instruction 6, the event explains the jump to 9 without implying 7 or 8 ran", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 6; k++) await user.click(step);
    expect(eventLine()).toBe(format(M.window.eventJump, { line: 6, to: 9 }));
    // The highlighted row is 9; 7 and 8 carry no mark.
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("9");
    expect(rowOf(7).getAttribute("aria-current")).toBeNull();
    expect(rowOf(8).getAttribute("aria-current")).toBeNull();
    expect(rowOf(7).className).not.toContain("row-current");
    expect(rowOf(8).className).not.toContain("row-current");
  });

  it("after instruction 9, the event says the program stopped, and the row is not next to run", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    for (let k = 0; k < 9; k++) await user.click(step);
    expect(eventLine()).toBe(format(M.window.eventStopped, { line: 9 }));
    expect(screen.queryByRole("row", { current: "step" })).toBeNull();
    expect(screen.getByRole("row", { current: true })).toHaveTextContent("9");
    expect(screen.getByText(format(M.window.stoppedAria, { line: 9 }))).toBeTruthy();
    expect(step).toBeDisabled();
  });

  it("Start again clears the event and returns to the compact initial state", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    const step = screen.getByRole("button", { name: M.step });
    await user.click(step);
    await user.click(step);
    expect(eventLine()).not.toBeNull();
    await user.click(screen.getByRole("button", { name: M.reset }));
    expect(eventLine()).toBeNull();
    expect(screen.queryByText(/Ready for instruction/)).toBeNull();
    expect(screen.getByRole("row", { current: "step" })).toHaveTextContent("1");
    expect(stateTiles()[0]).toBe("R1 —");
  });

  it("editing a room's reading does not invent a last-instruction event", async () => {
    const user = userEvent.setup();
    mount(PROPS);
    await user.clear(screen.getByRole("spinbutton", { name: M.roomA }));
    await user.type(screen.getByRole("spinbutton", { name: M.roomA }), "-50");
    // No instruction has run: still no event, and the tiles show the live machine.
    expect(eventLine()).toBeNull();
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
    expect(document.querySelector(".meet-state")).toBeNull();
    expect(document.querySelector(".meet-event")).toBeNull();
    expect(document.querySelector(".datapath-tables")).not.toBeNull();
  });
});
