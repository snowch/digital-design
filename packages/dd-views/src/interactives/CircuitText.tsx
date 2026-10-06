// Copyright © 2026 Christopher Snow

// A library circuit written out as text by the generator, beside its drawing: the abstraction
// the text language offers for what the learner has just built out of gates.

import { useMemo } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import { expressionModule, generate } from "@dd/hdl";
import type { InteractiveProps } from "@platform/lesson-runtime";

import { CircuitView } from "../CircuitView";
import { useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  libraryId: z.string(),
  drawing: z.boolean().default(true),
  /**
   * "gates": one `assign` per gate, as a drawing's text is written. "expression" (Module 2): one
   * `assign` per output, the whole expression from the inputs.
   */
  form: z.enum(["gates", "expression"]).default("gates"),
});

export const CircuitText = withProps(
  Props,
  function CircuitText({ data, interactive }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const text = useMemo(
      () => (data.form === "expression" ? expressionModule(circuit) : generate(circuit).text),
      [circuit, data.form],
    );
    return (
      <div className="circuit-text" data-interactive={interactive.id}>
        {data.drawing && <CircuitView circuit={circuit} title={strings.hdl.drawn} table={false} />}
        <pre className="hdl-generated" aria-label={strings.hdl.generated}>
          {text}
        </pre>
      </div>
    );
  },
);
