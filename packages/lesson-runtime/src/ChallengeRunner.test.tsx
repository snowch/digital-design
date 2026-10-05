// @vitest-environment jsdom
// Copyright © 2026 Chris Snow

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ChallengeRunner } from "./ChallengeRunner";
import { fixtureBook, fixtureLesson } from "./fixtures";
import { LessonStore, memoryStorage, storageKey, type Storage } from "./state";
import { DEFAULT_STRINGS as S } from "./strings";

const lesson = fixtureLesson();
const book = fixtureBook([lesson]);
const challenge = lesson.challenges[0]!;

function mount(storage: Storage) {
  const store = new LessonStore(storage, book.id, lesson.id);
  const view = render(
    <ChallengeRunner book={book} lesson={lesson} challenge={challenge} store={store} />,
  );
  return { store, ...view };
}

describe("ChallengeRunner", () => {
  it("grades only when asked, reports the failure in the learner's terms, and marks a pass", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    mount(storage);
    expect(screen.getByRole("status")).toHaveTextContent(S.challenge.notRun);
    expect(screen.queryByText(S.challenge.complete)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Your text"), "wrong");
    expect(screen.getByRole("status")).toHaveTextContent(S.challenge.notRun);
    await user.click(screen.getByRole("button", { name: S.challenge.run }));
    expect(screen.getByRole("status")).toHaveTextContent("0 of 1 tests passed");
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("press S");
    expect(screen.getByText("Signal Q was 0, but the test expected 1")).toBeInTheDocument();
    expect(screen.getByText(/The NOR gate norQ drives that signal/)).toBeInTheDocument();
    expect(screen.getByText("b (Qb)=1")).toBeInTheDocument();
    expect(screen.getByText(S.challenge.coneHint, { exact: false })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Your text"));
    await user.type(screen.getByLabelText("Your text"), "right");
    // An edit after a run clears the verdict: the status says the tests have not run on this work.
    expect(screen.getByRole("status")).toHaveTextContent(S.challenge.notRun);
    await user.click(screen.getByRole("button", { name: S.challenge.run }));
    expect(screen.getByRole("status")).toHaveTextContent("All 1 tests passed");
    expect(screen.getByText(S.challenge.complete)).toBeInTheDocument();
    const saved = JSON.parse(storage.get(storageKey(book.id, lesson.id)) ?? "{}");
    expect(saved.challenges.latch.attempts).toBe(2);
    expect(saved.challenges.latch.firstPassedAt).toBeTruthy();
  });

  it("re-grades saved work on load instead of trusting a saved mark", () => {
    const storage = memoryStorage();
    storage.set(
      storageKey(book.id, lesson.id),
      JSON.stringify({
        version: 1,
        challenges: { latch: { artifact: { hdl: "right" }, attempts: 1, hintsRevealed: 0 } },
        slots: {},
      }),
    );
    const first = mount(storage);
    expect(screen.getByText(S.challenge.complete)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("All 1 tests passed");
    first.unmount();

    storage.set(
      storageKey(book.id, lesson.id),
      JSON.stringify({
        version: 1,
        challenges: {
          latch: {
            artifact: { hdl: "wrong" },
            attempts: 1,
            hintsRevealed: 0,
            firstPassedAt: "2020-01-01",
          },
        },
        slots: {},
      }),
    );
    mount(storage);
    expect(screen.queryByText(S.challenge.complete)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("0 of 1 tests passed");
  });

  it("says when the tests could not run, with the reason", async () => {
    const user = userEvent.setup();
    mount(memoryStorage());
    await user.type(screen.getByLabelText("Your text"), "broken");
    await user.click(screen.getByRole("button", { name: S.challenge.run }));
    expect(screen.getByRole("status")).toHaveTextContent(S.challenge.blocked);
    expect(screen.getByText("the text does not parse")).toBeInTheDocument();
  });

  it("reveals hints one rung at a time and remembers how many", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    const first = mount(storage);
    expect(screen.queryByText("Think.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show hint (1 of 5)" }));
    expect(screen.getByText("Think.")).toBeInTheDocument();
    expect(screen.getByText(S.hints.rung[0])).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show hint (2 of 5)" }));
    expect(screen.getByText("Most people forget.")).toBeInTheDocument();
    first.unmount();
    mount(storage);
    expect(screen.getByText("Most people forget.")).toBeInTheDocument();
    expect(screen.queryByText("Try one wire.")).not.toBeInTheDocument();
    for (const n of [3, 4, 5])
      await user.click(screen.getByRole("button", { name: `Show hint (${n} of 5)` }));
    expect(screen.getByText("All of it.")).toBeInTheDocument();
    expect(screen.getByText(S.hints.none)).toBeInTheDocument();
  });

  it("resets in two steps and clears the saved work", async () => {
    const user = userEvent.setup();
    const storage = memoryStorage();
    mount(storage);
    await user.type(screen.getByLabelText("Your text"), "right");
    await user.click(screen.getByRole("button", { name: S.challenge.run }));
    expect(screen.getByText(S.challenge.complete)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Clear work/ }));
    await user.click(screen.getByRole("button", { name: S.challenge.resetCancel }));
    expect(screen.getByText(S.challenge.complete)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Clear work/ }));
    await user.click(screen.getByRole("button", { name: S.challenge.resetConfirm }));
    expect(screen.queryByText(S.challenge.complete)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(S.challenge.resetDone);
    expect(screen.getByLabelText("Your text")).toHaveValue("");
    const saved = JSON.parse(storage.get(storageKey(book.id, lesson.id)) ?? "{}");
    expect(saved.challenges).toEqual({});
  });
});
