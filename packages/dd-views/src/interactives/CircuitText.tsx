// A library circuit written out as text by the generator, beside its drawing: the abstraction
// the text language offers for what the learner has just built out of gates.

import { useMemo } from "react";
import { z } from "zod";

import { libraryCircuit } from "@dd/dd-model";
import { generate } from "@dd/hdl";
import type { InteractiveProps } from "@dd/lesson-runtime";

import { CircuitView } from "../CircuitView";
import { useViewStrings } from "../strings";
import { withProps } from "./props";

const Props = z.object({
  libraryId: z.string(),
  drawing: z.boolean().default(true),
});

export const CircuitText = withProps(
  Props,
  function CircuitText({ data, interactive }: InteractiveProps & { data: z.infer<typeof Props> }) {
    const strings = useViewStrings();
    const circuit = useMemo(() => libraryCircuit(data.libraryId), [data.libraryId]);
    const generated = useMemo(() => generate(circuit), [circuit]);
    return (
      <div className="circuit-text" data-interactive={interactive.id}>
        {data.drawing && <CircuitView circuit={circuit} title={strings.hdl.drawn} table={false} />}
        <pre className="hdl-generated" aria-label={strings.hdl.generated}>
          {generated.text}
        </pre>
      </div>
    );
  },
);
