// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { runSuite } from "@dd/sim";

import { Builder } from "./Builder";
import { compileDrawing, emptyDrawing, type Drawing } from "./drawing";
import { DEFAULT_VIEW_STRINGS as S, format } from "./strings";

const IFACE = { inputs: [{ name: "S" }, { name: "R" }], outputs: [{ name: "Q" }] };

function Harness({ onDrawing }: { onDrawing: (d: Drawing) => void }) {
  const [drawing, setDrawing] = useState<Drawing>(() => emptyDrawing(IFACE));
  return (
    <Builder
      drawing={drawing}
      onChange={(d) => {
        setDrawing(d);
        onDrawing(d);
      }}
      palette={["nor", "not"]}
      title="Your drawing"
    />
  );
}

describe("Builder", () => {
  it("builds a working SR latch with the keyboard alone", async () => {
    const user = userEvent.setup();
    let latest: Drawing | undefined;
    render(<Harness onDrawing={(d) => (latest = d)} />);

    await user.click(screen.getByRole("button", { name: "Add NOR" }));
    await user.click(screen.getByRole("button", { name: "Add NOR" }));
    expect(screen.getByRole("status")).toHaveTextContent(format(S.builder.added, { id: "nor2" }));
    expect(latest?.parts.map((p) => p.id)).toEqual([
      "input:S",
      "input:R",
      "output:Q",
      "nor1",
      "nor2",
    ]);

    const port = (name: RegExp) => screen.getByRole("button", { name });
    const wire = async (from: RegExp, to: RegExp) => {
      port(from).focus();
      await user.keyboard("{Enter}");
      port(to).focus();
      await user.keyboard("{Enter}");
    };
    await wire(/^R\./, /^nor1 input a\./);
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.builder.connected, { from: "R", to: "nor1 input a" }),
    );
    await wire(/^nor2 output y\./, /^nor1 input b\./);
    await wire(/^S\./, /^nor2 input b\./);
    await wire(/^nor1 output y\./, /^nor2 input a\./);
    await wire(/^nor1 output y\./, /^Q\./);
    expect(latest?.wires).toHaveLength(5);
    expect(screen.queryByText(format(S.builder.looseEnds, { n: 1 }))).not.toBeInTheDocument();

    const compiled = compileDrawing(latest!);
    expect(compiled.errors).toEqual([]);
    const diagnosis = runSuite(compiled.circuit!, {
      kind: "sequence",
      steps: [
        { set: { S: 1, R: 0 }, expect: { Q: 1 } },
        { set: { S: 0, R: 0 }, expect: { Q: 1 } },
        { set: { S: 0, R: 1 }, expect: { Q: 0 } },
      ],
    });
    expect(diagnosis.passed).toBe(true);
  });

  it("refuses to join two outputs, and lets a wrong wire be replaced", async () => {
    const user = userEvent.setup();
    let latest: Drawing | undefined;
    render(<Harness onDrawing={(d) => (latest = d)} />);
    await user.click(screen.getByRole("button", { name: "Add NOT" }));
    const port = (name: RegExp) => screen.getByRole("button", { name });
    port(/^S\./).focus();
    await user.keyboard("{Enter}");
    port(/^R\./).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.builder.notAPair, { a: "S", b: "R", role: S.builder.outputs }),
    );
    port(/^not1 input a\./).focus();
    await user.keyboard("{Enter}");
    expect(latest?.wires).toEqual([
      { from: { part: "input:S", port: "y" }, to: { part: "not1", port: "a" } },
    ]);
    // A second wire into the same input replaces the first.
    port(/^R\./).focus();
    await user.keyboard("{Enter}");
    port(/^not1 input a\./).focus();
    await user.keyboard("{Enter}");
    expect(latest?.wires).toEqual([
      { from: { part: "input:R", port: "y" }, to: { part: "not1", port: "a" } },
    ]);
  });

  it("moves a part with the arrow keys and deletes it with its wires", async () => {
    const user = userEvent.setup();
    let latest: Drawing | undefined;
    render(<Harness onDrawing={(d) => (latest = d)} />);
    await user.click(screen.getByRole("button", { name: "Add NOT" }));
    const before = latest!.parts.find((p) => p.id === "not1")!;
    const part = screen.getByRole("button", { name: /^NOT not1\./ });
    part.focus();
    await user.keyboard("{ArrowRight}{ArrowDown}{ArrowDown}");
    const after = latest!.parts.find((p) => p.id === "not1")!;
    expect([after.x - before.x, after.y - before.y]).toEqual([1, 2]);

    screen.getByRole("button", { name: /^S\./ }).focus();
    await user.keyboard("{Enter}");
    screen.getByRole("button", { name: /^not1 input a\./ }).focus();
    await user.keyboard("{Enter}");
    expect(latest!.wires).toHaveLength(1);
    screen.getByRole("button", { name: /^NOT not1\./ }).focus();
    await user.keyboard("{Delete}");
    expect(latest!.parts.some((p) => p.id === "not1")).toBe(false);
    expect(latest!.wires).toHaveLength(0);
    expect(screen.getByRole("status")).toHaveTextContent(
      format(S.builder.removedPart, { id: "not1" }),
    );
    // Pins cannot be deleted.
    screen.getByRole("button", { name: /^Input S\./ }).focus();
    await user.keyboard("{Delete}");
    expect(latest!.parts.some((p) => p.id === "input:S")).toBe(true);
  });
});
