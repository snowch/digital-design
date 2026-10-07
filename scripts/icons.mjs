// Copyright © 2026 Christopher Snow

// Draws the course's icons as PNGs from apps/course/public/icon.svg, at the sizes browsers and
// phones ask for: 32 pixels for a tab that takes no SVG, 180 for an iPhone's home screen, 192 and
// 512 for an installed course, and 512 again as a maskable icon, which a phone cuts to its own
// shape. The iPhone's and the maskable icon fill their square: an iPhone shows a transparent
// corner as black, and a phone's mask takes the corners anyway. The others keep the SVG's rounded
// corners. The sizes are the ones web-manifest.ts and static-page.ts name, and a test holds each
// file to its size. Run `node scripts/icons.mjs` whenever icon.svg changes, and commit the PNGs.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/course/public");
const svg = readFileSync(resolve(dir, "icon.svg"), "utf8");
const ROUNDED = 'rx="14"';
if (!svg.includes(ROUNDED))
  throw new Error(`icon.svg's background has no ${ROUNDED} to square off.`);
const square = svg.replace(ROUNDED, 'rx="0"');

const ICONS = [
  { file: "icon-32.png", size: 32, svg },
  { file: "apple-touch-icon.png", size: 180, svg: square },
  { file: "icon-192.png", size: 192, svg },
  { file: "icon-512.png", size: 512, svg },
  { file: "icon-maskable-512.png", size: 512, svg: square },
];

const browser = await chromium.launch();
for (const { file, size, svg: drawn } of ICONS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${drawn}`,
  );
  await page.screenshot({ path: resolve(dir, file), omitBackground: true });
  await page.close();
  console.log(`${file}: ${size} by ${size}`);
}
await browser.close();
