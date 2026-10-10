// Copyright © 2026 Christopher Snow

// Module 13's figures open where their words point (`focus`): each name is a wire's net or a
// path to a part from the top of the circuit. A name the drawing cannot place leaves the figure
// at its left edge, which on a phone shows the wrong part of the machine, so it fails here.

import { describe, expect, it } from "vitest";

import { libraryCircuit } from "@dd/dd-model";

import { LESSONS } from "./index";

const circuit = libraryCircuit("machine-final");
const paths = new Set([...circuit.composites, ...circuit.components].map((c) => c.path));
const nets = new Set(circuit.nets.map((n) => n.name));
const placed = (name: string) =>
  nets.has(name) || paths.has(name) || [...paths].some((p) => p.startsWith(`${name}/`));

describe("Module 13's figures open where their words point", () => {
  for (const lesson of LESSONS.filter((l) => l.module === 13))
    it(`${lesson.id}: every name a figure focuses on is a wire or a part's path`, () => {
      const unplaced = lesson.sections
        .flatMap((s) => s.interactives)
        .filter((x) => x.kind === "machine-levels")
        .flatMap((x) =>
          (((x.props as { focus?: string[] }).focus ?? []) as string[])
            .filter((name) => !placed(name))
            .map((name) => `${x.id}: ${name}`),
        );
      expect(unplaced).toEqual([]);
    });
});
