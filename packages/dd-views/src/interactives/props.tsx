// Copyright © 2026 Chris Snow

// Interactive props arrive from lesson data as a plain record. Each interactive declares a zod
// schema for its props; a lesson whose props do not fit gets a sentence on the page saying what
// is wrong, where the figure would be, instead of a broken view.

import type { ComponentType } from "react";
import type { ZodType } from "zod";

import type { InteractiveProps } from "@dd/lesson-runtime";

export function withProps<T>(
  schema: ZodType<T>,
  Inner: ComponentType<InteractiveProps & { data: T }>,
): ComponentType<InteractiveProps> {
  return function Parsed(props: InteractiveProps) {
    const parsed = schema.safeParse(props.interactive.props);
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
