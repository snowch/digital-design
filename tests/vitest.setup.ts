// Copyright © 2026 Christopher Snow

// Runs before every test file. The matchers are jest-dom's; the cleanup unmounts what a test
// rendered, which Testing Library does on its own only when Vitest's globals are on.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
