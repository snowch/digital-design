// Copyright © 2026 Christopher Snow

// What the page says before any script runs: to a search engine, to the preview of a shared link,
// to a program that reads the page without running it, and to a reader whose browser runs no
// scripts. A first-time visitor's review read only that, and found nothing but the line that the
// course needs JavaScript. So the build writes the cover's own words into index.html
// (vite.config.ts): the description a search result shows, what a shared link's preview shows,
// and, for a page that runs no script, the cover itself, its opening, its path in five stages and
// what it assumes. They come from strings.ts, so they say what the cover says and cannot drift.
// The head also names the course's icon, for a tab and a phone's home screen, and the manifest a
// browser installs the course from (web-manifest.ts), each under the site's base path.

import { STRINGS } from "./strings";
import { BACKGROUND, ICONS, MANIFEST_FILE, shortName } from "./web-manifest";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The course's name, as index.html's title gives it. */
export function courseTitle(html: string): string {
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  if (!title) throw new Error("index.html has no <title>, so the page has no name to give.");
  return title;
}

/**
 * index.html with the cover's words written in, its title kept as the course's name, and its icons
 * and manifest named under `base`, the path the site is served from.
 */
export function staticPage(html: string, base = "/"): string {
  const title = courseTitle(html);
  const { cover } = STRINGS;
  const head = [
    `<meta name="description" content="${escape(cover.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${escape(cover.description)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<link rel="icon" href="${base}${ICONS.tabPng.src}" sizes="32x32" type="image/png" />`,
    `<link rel="icon" href="${base}${ICONS.tab}" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="${base}${ICONS.homeScreen.src}" />`,
    `<link rel="manifest" href="${base}${MANIFEST_FILE}" />`,
    `<meta name="apple-mobile-web-app-title" content="${escape(shortName(title))}" />`,
    `<meta name="theme-color" content="${BACKGROUND.light}" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="${BACKGROUND.dark}" media="(prefers-color-scheme: dark)" />`,
  ];
  const stages = cover.stages.map(
    (s) =>
      `<li><strong>${escape(s.name)}</strong> (${escape(cover.stageModules(s.from, s.to))}): ` +
      `${escape(s.about)}</li>`,
  );
  const noScript = [
    "<noscript>",
    `<h1>${title}</h1>`,
    `<p><strong>${escape(cover.tagline)}</strong></p>`,
    `<p>${escape(cover.lead)}</p>`,
    `<h2>${escape(cover.journeyHeading)}</h2>`,
    `<p>${escape(cover.journeyIntro)}</p>`,
    `<ol>${stages.join("")}</ol>`,
    `<p>${escape(STRINGS.assumes)}</p>`,
    `<p>${escape(STRINGS.noScript)}</p>`,
    "</noscript>",
  ];
  return html
    .replace("</title>", `</title>${head.map((t) => `\n    ${t}`).join("")}`)
    .replace(`<div id="root"></div>`, `<div id="root"></div>\n    ${noScript.join("\n    ")}`);
}
