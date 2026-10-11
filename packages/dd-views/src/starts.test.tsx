// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

// A challenge's second way in (docs/notes/real-tools/second-way-in.md): each start is data in the
// lesson, every start must fail the challenge's own tests, and the chooser asks before it throws a
// learner's work away.

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LESSONS } from "@dd/content";
import type { Artifact } from "@platform/lesson-schema";

import { placeParts } from "./Builder";
import { StartChooser } from "./StartChooser";
import { gradeSafely } from "./book";
import { compileDrawing, emptyDrawing, withInterface } from "./drawing";

interface Second {
  label: string;
  parts?: string[];
  hdl?: string;
}

const withSecond = LESSONS.flatMap((l) =>
  l.challenges.flatMap((c) => {
    const second = (c.initial.data as { second?: Second } | undefined)?.second;
    return second ? [{ lesson: l.id, challenge: c, second }] : [];
  }),
);

describe("the challenges with a second way in", () => {
  it("are the three the course names", () => {
    expect(withSecond.map((s) => `${s.lesson}/${s.challenge.id}`).sort()).toEqual([
      "memory-map/shop-memory",
      "nand/nand-xor",
      "state-encoding/defrost",
    ]);
  });

  for (const { lesson, challenge, second } of withSecond) {
    const iface = challenge.interface;
    const blank = challenge.gradedDirection === "draw" ? undefined : challenge.initial.hdl;
    const starts: [string, Artifact][] = [];
    if (second.parts) {
      const empty = withInterface(emptyDrawing(iface), iface);
      starts.push(
        ["the blank drawing", { circuit: compileDrawing(empty, challenge.id).circuit as never }],
        [
          "the placed parts",
          {
            circuit: compileDrawing(placeParts(empty, second.parts), challenge.id).circuit as never,
          },
        ],
      );
    } else {
      starts.push(
        ["the blank text", { hdl: blank ?? "" }],
        ["the frame", { hdl: second.hdl ?? "" }],
      );
    }
    for (const [name, artifact] of starts) {
      it(`${lesson}/${challenge.id}: ${name} fails the challenge's own tests`, () => {
        expect(gradeSafely(challenge, artifact).passed).toBe(false);
      });
    }
    it(`${lesson}/${challenge.id}: the reference passes`, () => {
      expect(gradeSafely(challenge, challenge.reference).passed).toBe(true);
    });
  }

  it("place the parts the project names, none of them joined", () => {
    const shop = withSecond.find((s) => s.challenge.id === "shop-memory")!;
    const placed = placeParts(
      withInterface(emptyDrawing(shop.challenge.interface), shop.challenge.interface),
      shop.second.parts!,
    );
    const blocks = placed.parts.filter((p) => p.kind !== "input" && p.kind !== "output");
    expect(blocks.map((p) => p.kind)).toEqual(shop.second.parts);
    expect(placed.wires).toEqual([]);
    const nand = withSecond.find((s) => s.challenge.id === "nand-xor")!;
    expect(nand.second.parts).toEqual(["nand", "nand", "nand", "nand", "nand"]);
  });
});

describe("the start chooser", () => {
  const ways = [
    { id: "a", label: "Start from A" },
    { id: "b", label: "Start from B" },
  ];

  it("picks a start at once when no work would be lost", () => {
    const picked: string[] = [];
    render(
      <StartChooser
        ways={ways}
        wouldReplaceWork={() => false}
        onPick={(id) => picked.push(id)}
        replaceLabel="Replace"
        keepLabel="Keep"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start from B" }));
    expect(picked).toEqual(["b"]);
  });

  it("asks first when work would be lost, and keeps it on request", () => {
    const picked: string[] = [];
    render(
      <StartChooser
        ways={ways}
        wouldReplaceWork={() => true}
        onPick={(id) => picked.push(id)}
        replaceLabel="Replace"
        keepLabel="Keep"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start from A" }));
    expect(picked).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    expect(picked).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Start from A" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(picked).toEqual(["a"]);
  });
});
