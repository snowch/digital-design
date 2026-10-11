// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// The compiler at work: read off the compiler's own steps; with a question, it waits at the step
// asked about, the rule hidden, until the learner commits; at the end, the listing with addresses
// and the run; an instruction pressed marks the piece it came from.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import type { Interactive, Lesson } from "@platform/lesson-schema";

import { DEFAULT_VIEW_STRINGS as S, format } from "../strings";
import { CompileSteps } from "./CompileSteps";

const lesson = { id: "compiler", challenges: [] } as unknown as Lesson;
const t = S.beyond;
const CLASH = "if sensorA - sensorB >= 100 then lamps <= 4";

function mount(props: Record<string, unknown>) {
  const interactive: Interactive = {
    id: "steps",
    kind: "compile-steps",
    timeModel: "none",
    caption: "c",
    props: { readings: [{ label: "shop", sensorA: -184, sensorB: -250 }], ...props },
  };
  const store = new LessonStore(memoryStorage(), "dd", lesson.id);
  return render(<CompileSteps lesson={lesson} interactive={interactive} store={store} />);
}

describe("the compiler at work", () => {
  it("writes one instruction a press, rewriting the line, and runs the program at the end", async () => {
    const user = userEvent.setup();
    const { container } = mount({
      lines: [{ label: "gap", text: "display <= sensorA - sensorB" }],
    });
    const next = screen.getByRole("button", { name: t.next });
    expect(container.querySelector(".compile-now mark")).toHaveTextContent("sensorA");
    expect(screen.getByText(t.rules.read)).toBeInTheDocument();
    await user.click(next);
    expect(container.querySelector(".compile-now code")).toHaveTextContent(
      "display <= R1 - sensorB",
    );
    for (let i = 0; i < 3; i++) await user.click(next);
    expect(next).toBeDisabled();
    expect(screen.getByText(t.nothingLeft)).toBeInTheDocument();
    const table = container.querySelector(".compile-listing")!;
    expect(within(table as HTMLElement).getAllByRole("row")).toHaveLength(6);
    expect(table).toHaveTextContent("010stop");
    expect(table).not.toHaveTextContent("380017D8");
    expect(
      screen.getByText(format(t.run, { a: -184, b: -250, display: "66", lamps: t.lampsDark })),
    ).toBeInTheDocument();
  });

  it("marks the piece an instruction came from, and every instruction that piece became", async () => {
    const user = userEvent.setup();
    const { container } = mount({
      lines: [{ label: "gap", text: "display <= sensorA - sensorB" }],
    });
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole("button", { name: t.next }));
    await user.click(
      screen.getByRole("button", { name: format(t.rowLabel, { instruction: "R3 <= R1 - R2" }) }),
    );
    expect(container.querySelector(".compile-line mark")).toHaveTextContent("sensorA - sensorB");
    expect(container.querySelectorAll("tr.compile-made")).toHaveLength(3);
  });

  it("waits at the step its question asks about, the rule hidden, until the learner commits", async () => {
    const user = userEvent.setup();
    const options = ["if R3 < R4 signed goto after1", "if R3 >= R4 signed goto after1"];
    const { container } = mount({
      lines: [{ label: "clash", text: CLASH }],
      question: "Which branch?",
      options: options.map((v) => ({ value: v, label: v })),
      ask: { step: 4 },
      explain: "Turned over.",
    });
    expect(container.querySelector(".compile-now code")).toHaveTextContent(
      "if R3 >= R4 then lamps <= 4",
    );
    expect(screen.getByRole("button", { name: t.next })).toBeDisabled();
    expect(screen.getByText(t.ruleHidden)).toBeInTheDocument();
    expect(screen.queryByText(t.rules.branch)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText(options[0]!));
    await user.click(screen.getByRole("button", { name: S.prediction.commit }));
    expect(screen.getByText(t.rules.branch)).toBeInTheDocument();
    expect(screen.getByText("Turned over.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: t.next }));
    expect(container.querySelector(".compile-listing")).toHaveTextContent(options[0]!);
  });

  it("with every piece in R1, writes over room A's reading and shows 0", async () => {
    const user = userEvent.setup();
    mount({
      lines: [{ label: "gap", text: "display <= sensorA - sensorB" }],
      fault: "oneRegister",
    });
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole("button", { name: t.next }));
    expect(screen.getByText(/R1 <= R1 - R1/)).toBeInTheDocument();
    expect(
      screen.getByText(format(t.run, { a: -184, b: -250, display: "0", lamps: t.lampsDark })),
    ).toBeInTheDocument();
  });
});
