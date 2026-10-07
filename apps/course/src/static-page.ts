// Copyright © 2026 Christopher Snow

// What the page says before any script runs: to a search engine, to the preview of a shared link,
// to a program that reads the page without running it, and to a reader whose browser runs no
// scripts. A first-time visitor's review read only that, and found nothing but the line that the
// course needs JavaScript. So the build writes the cover's own words into index.html
// (vite.config.ts): the description a search result shows, what a shared link's preview shows,
// and, for a page that runs no script, the cover itself, its opening, its path in five stages and
// what it assumes. They come from strings.ts, so they say what the cover says and cannot drift.

import { STRINGS } from "./strings";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** index.html with the cover's words written in, its title kept as the course's name. */
export function staticPage(html: string): string {
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  if (!title) throw new Error("index.html has no <title>, so the page has no name to give.");
  const { cover } = STRINGS;
  const head = [
    `<meta name="description" content="${escape(cover.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${escape(cover.description)}" />`,
    `<meta name="twitter:card" content="summary" />`,
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
    `<ol>${stages.join("")}</ol>`,
    `<p>${escape(STRINGS.assumes)}</p>`,
    `<p>${escape(STRINGS.noScript)}</p>`,
    "</noscript>",
  ];
  return html
    .replace("</title>", `</title>${head.map((t) => `\n    ${t}`).join("")}`)
    .replace(`<div id="root"></div>`, `<div id="root"></div>\n    ${noScript.join("\n    ")}`);
}
