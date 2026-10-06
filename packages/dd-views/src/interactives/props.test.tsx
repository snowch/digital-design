// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// A figure's props are parsed once per lesson record, so the page rendering again around a figure
// hands it the same data, and the figure keeps what it built from them.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { LessonStore, memoryStorage } from "@platform/lesson-runtime";
import type { Interactive, Lesson } from "@platform/lesson-schema";

import { withProps } from "./props";

const lesson = { id: "remember", challenges: [] } as unknown as Lesson;

describe("a figure's props", () => {
  it("reach the figure as the same data each time the page renders it", () => {
    const seen: unknown[] = [];
    const Figure = withProps(
      z.object({ names: z.array(z.string()).default([]), at: z.record(z.string(), z.number()) }),
      function Figure({ data }) {
        seen.push(data);
        return null;
      },
    );
    const interactive = {
      id: "f",
      kind: "test",
      timeModel: "none",
      caption: "c",
      props: { at: { x: 1 } },
    } as unknown as Interactive;
    const store = new LessonStore(memoryStorage(), "dd", lesson.id);
    const page = render(<Figure lesson={lesson} interactive={interactive} store={store} />);
    page.rerender(<Figure lesson={lesson} interactive={interactive} store={store} />);
    expect(seen).toHaveLength(2);
    expect(seen[1]).toBe(seen[0]);
    // Another lesson record is parsed afresh.
    page.rerender(<Figure lesson={lesson} interactive={{ ...interactive }} store={store} />);
    expect(seen[2]).toBe(seen[0]);
    page.rerender(
      <Figure
        lesson={lesson}
        interactive={{ ...interactive, props: { at: { x: 2 } } }}
        store={store}
      />,
    );
    expect(seen[3]).not.toBe(seen[0]);
  });
});
