// Copyright © 2026 Christopher Snow

// Interactive props arrive from lesson data as a plain record. Each interactive declares a zod
// schema for its props; a lesson whose props do not fit gets a sentence on the page saying what
// is wrong, where the figure would be, instead of a broken view.
//
// The props are parsed once per lesson record, not once per render: a parse makes new objects
// (a default, an array), and a figure that rebuilt its circuit from them on every render of the
// page around it lost its place (a wide drawing scrolled back to the parts it opens on when a
// figure's note was opened) and built Module 8's whole datapath again each time.

import { useMemo, type ComponentType } from "react";
import type { ZodType } from "zod";

import type { InteractiveProps } from "@dd/lesson-runtime";

export function withProps<T>(
  schema: ZodType<T>,
  Inner: ComponentType<InteractiveProps & { data: T }>,
): ComponentType<InteractiveProps> {
  return function Parsed(props: InteractiveProps) {
    const raw = props.interactive.props;
    const parsed = useMemo(() => schema.safeParse(raw), [raw]);
    if (!parsed.success) {
      const lines = parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(props)"}: ${i.message}`,
      );
      return (
        <p role="note" className="interactive-problem">
          {`${props.interactive.kind} (${props.interactive.id}): ${lines.join("; ")}`}
        </p>
      );
    }
    return <Inner {...props} data={parsed.data} />;
  };
}
