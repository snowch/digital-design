// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HdlPanel } from "./HdlPanel";

const START = "module m(input logic D, output logic Q);\n\nendmodule\n";

describe("the text panel", () => {
  it("says nothing about the starting text until the learner changes it", () => {
    const { container, rerender } = render(
      <HdlPanel text={START} onChange={() => {}} allowed={[]} title="t" untouched={START} />,
    );
    expect(container.querySelector(".hdl-messages")?.textContent).toBe("");
    const edited = START.replace("\n\n", "\n  logic X;\n");
    rerender(
      <HdlPanel
        text={edited}
        onChange={() => {}}
        allowed={["module", "ports", "logic"]}
        title="t"
        untouched={START}
      />,
    );
    expect(container.querySelector(".hdl-messages")?.textContent).toMatch(/never assigned/);
  });
});
