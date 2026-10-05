// @vitest-environment jsdom
// Module 5: the state-machine figure moves every view together from one simulator.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LessonStore, memoryStorage } from "@dd/lesson-runtime";
import type { Interactive, Lesson } from "@dd/lesson-schema";

import { DEFAULT_VIEW_STRINGS as S, format } from "../strings";
import { StateMachine } from "./StateMachine";

const lesson = { id: "state-machines", challenges: [] } as unknown as Lesson;

function mount(props: Record<string, unknown>) {
  const interactive: Interactive = {
    id: "fsm",
    kind: "state-machine",
    timeModel: "clocked",
    caption: "c",
    props,
  };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<StateMachine lesson={lesson} interactive={interactive} store={store} />);
}

const reset = [{ set: { RST: 1 }, clock: "CLK" }, { set: { RST: 0 } }];

describe("the state-machine figure", () => {
  it("before a reset, says the register holds no state", () => {
    mount({ machine: "retry" });
    expect(screen.getByRole("status")).toHaveTextContent(format(S.machine.noState, { code: "XX" }));
  });

  it("marks the state, the row the next edge applies, and moves at a press of the clock", async () => {
    const user = userEvent.setup();
    const { container } = mount({ machine: "retry", prime: reset });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(
      format(S.machine.status, { state: "IDLE", code: "00", row: 2, next: "IDLE", nextCode: "00" }),
    );
    await user.click(
      screen.getByRole("button", { name: format(S.machine.inputButton, { name: "GO", value: 0 }) }),
    );
    expect(status).toHaveTextContent(
      format(S.machine.status, { state: "IDLE", code: "00", row: 1, next: "TRY", nextCode: "01" }),
    );
    // The diagram marks IDLE and the arrow of row 1; the table marks row 1.
    expect(container.querySelector(".state-node-current")?.getAttribute("data-state")).toBe("IDLE");
    expect(container.querySelector(".state-arrow-next")?.getAttribute("data-rows")).toBe("1");
    const table = container.querySelector("table.machine-table") as HTMLTableElement;
    expect(
      within(table)
        .getAllByRole("row")
        .find((r) => r.getAttribute("aria-current"))?.textContent,
    ).toContain("TRY 01");
    await user.click(
      screen.getByRole("button", { name: format(S.explorer.clock, { name: "CLK" }) }),
    );
    expect(container.querySelector(".state-node-current")?.getAttribute("data-state")).toBe("TRY");
  });

  it("shows the text in the style asked for", () => {
    const { container } = mount({ machine: "retry", show: ["text"], textStyle: "enum" });
    expect(container.querySelector("pre.machine-text")?.textContent).toContain(
      "typedef enum logic [1:0]",
    );
  });

  it("a machine whose reset is no state says so after the reset", () => {
    mount({ machine: "retry-one-hot", prime: reset, show: ["diagram"] });
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.machine.noState, { code: "0000" }),
    );
  });
});
