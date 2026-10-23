// Copyright © 2026 Christopher Snow

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

// Precache the complete release, including fonts. Source maps are for debugging, not offline use.
export function offlineCache(): Plugin {
  let directory = "";
  return {
    name: "course-offline-cache",
    apply: "build",
    configResolved(config) {
      directory = resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      const files = (readdirSync(directory, { recursive: true }) as string[])
        .filter(
          (file) =>
            !file.endsWith(".map") &&
            file !== "sw.js" &&
            statSync(resolve(directory, file)).isFile(),
        )
        .sort();
      const hash = createHash("sha256");
      for (const file of files) hash.update(file).update(readFileSync(resolve(directory, file)));
      const source = readFileSync(
        fileURLToPath(new URL("./service-worker.js", import.meta.url)),
        "utf8",
      )
        .replace('"__COURSE_VERSION__"', JSON.stringify(hash.digest("hex")))
        .replace(
          "/* __COURSE_FILES__ */ []",
          JSON.stringify(files.map((file) => file.split(sep).join("/"))),
        );
      writeFileSync(resolve(directory, "sw.js"), source);
    },
  };
}
