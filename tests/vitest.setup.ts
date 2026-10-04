// Shared setup for every Vitest file. The jest-dom matchers extend `expect` and are harmless
// under Node; a component test adds `// @vitest-environment jsdom` to get a document.
import "@testing-library/jest-dom/vitest";
