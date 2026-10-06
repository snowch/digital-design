// Copyright © 2026 Christopher Snow

// Unit and integration tests, under Vitest.
//
// The engine, the domain model, the HDL subset and the lesson schema run under Node with no DOM:
// that is a design rule (docs/simulator.md), and running them here is what enforces it. Tests of
// React components opt into a DOM with a `// @vitest-environment jsdom` comment at the top of
// the file. The educational tests (every exercise completable, rejects wrong answers,
// deterministic, resets, cannot be bypassed) drive the built site in a browser and live under
// tests/educational, run by Playwright, not here.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/*.test.ts",
      "packages/**/*.test.tsx",
      "content/**/*.test.ts",
      "content/**/*.test.tsx",
      "apps/**/*.test.ts",
      "apps/**/*.test.tsx",
    ],
    environment: "node",
    setupFiles: ["./tests/vitest.setup.ts"],
    passWithNoTests: false,
  },
});
