// Copyright © 2026 Christopher Snow

// Module 13: a program's lines with their addresses, folded under its name, beside the figures and
// the tests that name a line and its address, so the address a sentence names can be found.

import { useMemo } from "react";

import { MODULE_13_ASSEMBLY, assemble } from "@dd/dd-model";

/** A program's lines with their addresses, as the failure sentences name them. */
export function ProgramListing({ source, label }: { source: string; label: string }) {
  const lines = useMemo(() => {
    try {
      return assemble(source, MODULE_13_ASSEMBLY).lines;
    } catch {
      return [];
    }
  }, [source]);
  return (
    <details className="lab-listing">
      <summary>{label}</summary>
      <pre className="hdl-code">
        <code>
          {lines
            .map(
              (l) =>
                `${l.address.toString(16).toUpperCase().padStart(3, "0")}  ${l.label ? `${l.label}: ` : ""}${l.text}`,
            )
            .join("\n")}
        </code>
      </pre>
    </details>
  );
}
