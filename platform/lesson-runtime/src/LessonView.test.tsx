// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SECTION_KINDS } from "@platform/lesson-schema";

import { LessonView } from "./LessonView";
import { fixtureBook, fixtureLesson } from "./fixtures";
import { memoryStorage } from "./state";
import { DEFAULT_STRINGS, format } from "./strings";

describe("LessonView", () => {
  const lesson = fixtureLesson();
  const book = fixtureBook([lesson]);

  it("renders the ten sections in the course's order, each with its kind and title", () => {
    render(<LessonView book={book} lesson={lesson} storage={memoryStorage()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "How does a circuit remember?",
    );
    const sections = document.querySelectorAll("section.lesson-section");
    expect([...sections].map((s) => s.getAttribute("data-kind"))).toEqual([...SECTION_KINDS]);
    const h2 = within(sections[5] as HTMLElement).getByRole("heading", { level: 2 });
    expect(h2).toHaveTextContent(DEFAULT_STRINGS.section["failureExperiment"] ?? "");
    expect(h2).toHaveTextContent("The failureExperiment title");
    expect(within(sections[0] as HTMLElement).getByText("question")).toBeInTheDocument();
  });

  it("mounts interactives from the book's registry and says when it has none", () => {
    render(<LessonView book={book} lesson={lesson} storage={memoryStorage()} />);
    expect(screen.getByTestId("demo")).toHaveTextContent("demo with n=2");
    const figure = document.getElementById("ix-loop");
    expect(figure).toHaveAttribute("data-time-model", "settle");
    expect(
      within(figure as HTMLElement).getByText("A loop of inverters.", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("Unknown interactive type: nothing-has-this")).toBeInTheDocument();
  });

  it("gives a simulated figure a badge that opens its model's note, and others no badge", async () => {
    const user = userEvent.setup();
    render(<LessonView book={book} lesson={lesson} storage={memoryStorage()} />);
    const loop = document.getElementById("ix-loop") as HTMLElement;
    const badge = within(loop).getByRole("button", {
      name: format(DEFAULT_STRINGS.lesson.badgeLabel, {
        model: DEFAULT_STRINGS.lesson.timeModel["settle"] ?? "",
      }),
    });
    expect(badge).toHaveAttribute("aria-expanded", "false");
    const note = book.timeModelNotes.settle ?? "";
    expect(within(loop).getByText(note)).not.toBeVisible();
    await user.click(badge);
    expect(badge).toHaveAttribute("aria-expanded", "true");
    expect(within(loop).getByText(note)).toBeVisible();
    await user.click(badge);
    expect(within(loop).getByText(note)).not.toBeVisible();
    // A figure that runs nothing names no time model at all.
    const none = document.querySelector('[data-time-model="none"]') as HTMLElement;
    expect(none).not.toBeNull();
    expect(none.querySelector(".badge")).toBeNull();
    expect(within(none).queryByRole("button", { expanded: false })).toBeNull();
  });

  it("badges a figure that declares a role by the role, and opens the role's note alone", async () => {
    const user = userEvent.setup();
    const withRole = {
      ...lesson,
      sections: lesson.sections.map((s) => ({
        ...s,
        interactives: s.interactives.map((x) =>
          x.id === "loop" ? { ...x, role: "experiment" } : x,
        ),
      })),
    };
    const roleNote = "Commit first, then compare what the model shows with what you expected.";
    const roleBook = { ...fixtureBook([withRole]), roleNotes: { experiment: roleNote } };
    const strings = {
      ...DEFAULT_STRINGS,
      lesson: { ...DEFAULT_STRINGS.lesson, role: { experiment: "Experiment" } },
    };
    render(
      <LessonView book={roleBook} lesson={withRole} storage={memoryStorage()} strings={strings} />,
    );
    const loop = document.getElementById("ix-loop") as HTMLElement;
    expect(loop).toHaveAttribute("data-role", "experiment");
    const badge = within(loop).getByRole("button", {
      name: format(DEFAULT_STRINGS.lesson.roleBadgeLabel, { role: "Experiment" }),
    });
    expect(badge).toHaveTextContent("Experiment");
    await user.click(badge);
    const note = loop.querySelector(".time-model-note") as HTMLElement;
    expect(note).toBeVisible();
    expect(note.textContent).toContain(roleNote);
    // The model's note is stated once, at the foot, not again in every badge.
    expect(note.textContent).not.toContain(roleBook.timeModelNotes.settle ?? "");
    const foot = document.querySelector(".lesson-model-note") as HTMLElement;
    expect(foot.textContent).toContain(roleBook.timeModelNotes.settle ?? "");
  });

  it("gives a role with no note a badge that opens nothing", () => {
    const withRole = {
      ...lesson,
      sections: lesson.sections.map((s) => ({
        ...s,
        interactives: s.interactives.map((x) =>
          x.id === "loop" ? { ...x, role: "reference" } : x,
        ),
      })),
    };
    render(
      <LessonView book={fixtureBook([withRole])} lesson={withRole} storage={memoryStorage()} />,
    );
    const loop = document.getElementById("ix-loop") as HTMLElement;
    expect(loop.querySelector(".badge")).toHaveTextContent("reference");
    expect(loop.querySelector(".time-model-toggle")).toBeNull();
    expect(loop.querySelector(".time-model-note")).toBeNull();
  });

  it("states no model note at the foot when the book gives none", () => {
    const quiet = { ...fixtureBook([lesson]), timeModelNotes: {} };
    render(<LessonView book={quiet} lesson={lesson} storage={memoryStorage()} />);
    expect(document.querySelector(".lesson-model-note")).toBeNull();
    // A figure badged by its model still names it, and opens nothing.
    const loop = document.getElementById("ix-loop") as HTMLElement;
    expect(loop.querySelector(".badge")).not.toBeNull();
    expect(loop.querySelector(".time-model-toggle")).toBeNull();
  });

  it("shows a section's details closed, after its prose and before its figures", async () => {
    const user = userEvent.setup();
    const detailed = {
      ...lesson,
      sections: lesson.sections.map((s) =>
        s.kind === "investigation"
          ? { ...s, details: { summary: "How the loop is built", prose: "Two **inverters**." } }
          : s,
      ),
    };
    render(
      <LessonView book={fixtureBook([detailed])} lesson={detailed} storage={memoryStorage()} />,
    );
    const section = document.querySelector('section[data-kind="investigation"]') as HTMLElement;
    const details = section.querySelector("details.lesson-details") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(within(details).getByText("How the loop is built").tagName).toBe("SUMMARY");
    expect(within(details).getByText("inverters").tagName).toBe("STRONG");
    // After the section's prose and before its first figure.
    const prose = within(section).getByText("investigation").closest("p") as HTMLElement;
    const figure = document.getElementById("ix-loop") as HTMLElement;
    expect(prose.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(details.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.click(within(details).getByText("How the loop is built"));
    expect(details.open).toBe(true);
    // A section without details has none.
    expect(document.querySelectorAll("details.lesson-details")).toHaveLength(1);
  });

  it("mounts the challenge section's challenge through the runner", () => {
    render(<LessonView book={book} lesson={lesson} storage={memoryStorage()} />);
    expect(screen.getByRole("heading", { level: 3, name: /Remember a press/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: DEFAULT_STRINGS.challenge.run })).toBeInTheDocument();
  });

  it("states the time models the lesson uses and the model-versus-reality note", () => {
    render(<LessonView book={book} lesson={lesson} storage={memoryStorage()} />);
    expect(
      screen.getByRole("heading", { name: DEFAULT_STRINGS.lesson.modelNote }),
    ).toBeInTheDocument();
    // At the foot of the lesson; each simulated figure's badge also holds the note, hidden.
    const foot = screen.getByRole("complementary", { name: DEFAULT_STRINGS.lesson.modelNote });
    expect(within(foot).getByText(/Every gate takes one step/)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: DEFAULT_STRINGS.lesson.modelVsReality }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gates here have no delay.")).toBeInTheDocument();
  });

  it("names no simulator at the foot of a lesson none of whose figures runs it", () => {
    const plain = {
      ...lesson,
      sections: lesson.sections.map((s) => ({
        ...s,
        interactives: s.interactives.map((x) => ({ ...x, timeModel: "none" as const })),
      })),
    };
    render(<LessonView book={fixtureBook([plain])} lesson={plain} storage={memoryStorage()} />);
    expect(
      screen.getByRole("heading", { name: DEFAULT_STRINGS.lesson.modelVsRealityNoSimulator }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: DEFAULT_STRINGS.lesson.modelVsReality }),
    ).toBeNull();
    expect(screen.queryByRole("heading", { name: DEFAULT_STRINGS.lesson.modelNote })).toBeNull();
  });

  it("draws code in an objective as the prose draws it, inside the objective's list item", () => {
    const coded = fixtureLesson({ objectives: ["Say what `resume` writes.", "Build a latch."] });
    render(<LessonView book={fixtureBook([coded])} lesson={coded} storage={memoryStorage()} />);
    const objectives = screen.getByRole("region", { name: DEFAULT_STRINGS.lesson.objectives });
    const items = within(objectives).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Say what resume writes.");
    expect(within(items[0]!).getByText("resume").tagName).toBe("CODE");
    expect(items[0]!.querySelector("p")).toBeNull();
    expect(items[1]).toHaveTextContent("Build a latch.");
  });

  it("links prerequisites by title through the app's router", () => {
    const first = fixtureLesson({
      id: "feedback",
      order: 0,
      title: "What feedback does",
      introduces: [],
    });
    const second = fixtureLesson({ prerequisites: ["feedback"] });
    render(
      <LessonView
        book={fixtureBook([first, second])}
        lesson={second}
        storage={memoryStorage()}
        lessonHref={(id) => `#/lesson/${id}`}
      />,
    );
    expect(screen.getByRole("link", { name: "What feedback does" })).toHaveAttribute(
      "href",
      "#/lesson/feedback",
    );
  });
});
