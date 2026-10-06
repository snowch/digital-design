// Copyright © 2026 Christopher Snow

// The lesson format as JSON Schema, for a book whose toolchain is not TypeScript.

import { z } from "zod";

import { Lesson } from "./schema";

export function lessonJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(Lesson, { target: "draft-2020-12", io: "input" }) as Record<
    string,
    unknown
  >;
}
