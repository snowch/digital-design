// Copyright © 2026 Christopher Snow

// The course app. One bundle, built under the base path GitHub Pages serves it from
// (/digital-design/ on snowch.github.io, an origin the author's books share). BASE_PATH lets the
// deploy workflow pass the path Pages reports, and lets a local build serve at the root.
//
// The page's description, what a shared link's preview shows, the icons, and the cover for a
// reader whose browser runs no scripts are written into index.html from the cover's own words
// (static-page.ts), and the manifest a browser installs the course from is written beside it
// (web-manifest.ts). The icons themselves are files in public/, drawn by scripts/icons.mjs.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { courseTitle, staticPage } from "./src/static-page";
import { MANIFEST_FILE, webManifest } from "./src/web-manifest";

function coverWords(): Plugin {
  let base = "/";
  let manifest = "";
  return {
    name: "cover-words",
    configResolved(config) {
      base = config.base;
      const title = courseTitle(readFileSync(resolve(config.root, "index.html"), "utf8"));
      manifest = `${JSON.stringify(webManifest(title), null, 2)}\n`;
    },
    transformIndexHtml: (html) => staticPage(html, base),
    // The development server has no bundle to write the manifest into, so it answers for it.
    configureServer(server) {
      server.middlewares.use(`${base}${MANIFEST_FILE}`, (_request, response) => {
        response.setHeader("Content-Type", "application/manifest+json");
        response.end(manifest);
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: MANIFEST_FILE, source: manifest });
    },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH ?? "/digital-design/",
  plugins: [react(), coverWords()],
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
