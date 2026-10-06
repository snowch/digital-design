// Copyright © 2026 Christopher Snow

// Writes the lesson data format as JSON Schema, for a book whose toolchain is not TypeScript.
// Usage: npx vite-node scripts/export-schema.mts > lesson.schema.json
import { lessonJsonSchema } from "@dd/lesson-schema";

process.stdout.write(JSON.stringify(lessonJsonSchema(), null, 2) + "\n");
