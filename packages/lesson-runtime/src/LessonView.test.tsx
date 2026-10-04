// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SECTION_KINDS } from "@dd/lesson-schema";

import { LessonView } from "./LessonView";
import { fixtureBook, fixtureLesson } from "./fixtures";
import { memoryStorage } from "./state";
import { DEFAULT_STRINGS } from "./strings";

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
    expect(screen.getByText(/Every gate takes one step/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: DEFAULT_STRINGS.lesson.modelVsReality }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gates here have no delay.")).toBeInTheDocument();
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
