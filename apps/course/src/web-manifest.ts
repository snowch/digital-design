// Copyright © 2026 Christopher Snow

// What a browser shows when the course is installed, or added to a phone's home screen: the
// course's name, the shorter name under its icon, the cover's description, the icon at each size a
// platform asks for, and the page's own background while it opens. Every word is the course's own
// (the title in index.html, the description in strings.ts), so none of it skipped the prose
// process. The build writes it beside index.html as manifest.webmanifest (vite.config.ts), and
// static-page.ts names it and the icons in the page's head.

import { STRINGS } from "./strings";

/** The file the build writes, beside index.html. */
export const MANIFEST_FILE = "manifest.webmanifest";

/** The page's background in each theme (tokens.css, --bg): a phone's bar, an opening course. */
export const BACKGROUND = { light: "#f4f5f8", dark: "#121419" } as const;

/** The icons in public/, drawn from icon.svg by scripts/icons.mjs, by what each is for. */
export const ICONS = {
  /** A browser's tab. */
  tab: "icon.svg",
  /** A tab in a browser that takes no SVG icon. */
  tabPng: { src: "icon-32.png", size: 32 },
  /** An iPhone's home screen, which shapes the icon itself. */
  homeScreen: { src: "apple-touch-icon.png", size: 180 },
  /** An installed course. */
  installed: [
    { src: "icon-192.png", size: 192 },
    { src: "icon-512.png", size: 512 },
  ],
  /** An installed course on a phone that cuts every icon to its own shape. */
  maskable: { src: "icon-maskable-512.png", size: 512 },
} as const;

/** The name under the icon: the course's name, before its colon. */
export function shortName(title: string): string {
  return title.includes(": ") ? title.slice(0, title.indexOf(": ")) : title;
}

const png = (icon: { src: string; size: number }) => ({
  src: icon.src,
  sizes: `${icon.size}x${icon.size}`,
  type: "image/png",
});

/** The manifest, its paths relative to itself, so the site's base path holds them all. */
export function webManifest(title: string) {
  return {
    name: title,
    short_name: shortName(title),
    description: STRINGS.cover.description,
    lang: "en",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: BACKGROUND.light,
    theme_color: BACKGROUND.light,
    icons: [
      ...ICONS.installed.map(png),
      { ...png(ICONS.maskable), purpose: "maskable" },
      { src: ICONS.tab, sizes: "any", type: "image/svg+xml" },
    ],
  };
}
