// Copyright © 2026 Christopher Snow

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

// Serve two real releases without rebuilding during a browser test. The index marker lets a
// test distinguish a cached document from a new one; the worker and all assets are the build's.
export async function updateServer() {
  const directory = resolve("apps/course/dist");
  let release = 1;
  let failDownload = false;
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const base = "/digital-design/";
    if (!pathname.startsWith(base)) {
      response.writeHead(404).end();
      return;
    }
    const name = decodeURIComponent(pathname.slice(base.length)) || "index.html";
    const file = resolve(directory, name);
    if (!file.startsWith(directory + sep)) {
      response.writeHead(404).end();
      return;
    }
    if (failDownload && name === "index.html") {
      response.writeHead(503).end();
      return;
    }
    try {
      let data: string | Buffer = readFileSync(file);
      if (name === "sw.js") {
        data = data
          .toString()
          .replace(/const VERSION = "[^"]+";/, `const VERSION = "release-${release}";`);
      } else if (name === "index.html") {
        data = data
          .toString()
          .replace("</head>", `<meta name="test-release" content="${release}"></head>`);
      }
      response
        .writeHead(200, {
          "Content-Type": types[extname(name)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Update test server has no port");
  return {
    url: `http://127.0.0.1:${address.port}/digital-design/`,
    next() {
      release++;
    },
    fail(value: boolean) {
      failDownload = value;
    },
    close: () =>
      new Promise<void>((done, reject) => {
        server.close((error) => (error ? reject(error) : done()));
        server.closeAllConnections();
      }),
  };
}
