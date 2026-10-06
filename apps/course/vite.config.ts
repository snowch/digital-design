// Copyright © 2026 Chris Snow

// The course app. One bundle, built under the base path GitHub Pages serves it from
// (/digital-design/ on snowch.github.io, an origin the author's books share). BASE_PATH lets the
// deploy workflow pass the path Pages reports, and lets a local build serve at the root.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/digital-design/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
