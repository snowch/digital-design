// Copyright © 2026 Christopher Snow

// Hash routes, so the site works from GitHub Pages without server rules: `#/` is the lesson
// list, `#/start` the page before the first lesson and `#/lesson/<id>` a lesson.

import { useEffect, useState } from "react";

export type Route =
  | { kind: "list" }
  | { kind: "preface" }
  | { kind: "lesson"; id: string }
  | { kind: "missing"; path: string };

/** The page a learner reads before the first lesson. */
export const PREFACE_HREF = "#/start";

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/" || path === "") return { kind: "list" };
  if (/^\/start\/?$/.test(path)) return { kind: "preface" };
  const m = /^\/lesson\/([a-z][a-z0-9-]*)\/?$/.exec(path);
  if (m) return { kind: "lesson", id: m[1] as string };
  return { kind: "missing", path };
}

export function lessonHref(id: string): string {
  return `#/lesson/${id}`;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    // A page reached by following a link starts at its top, with focus on the page itself, so the
    // keyboard and a screen reader start there too. A page reached by Back or Forward returns to
    // where the reader left it, which the browser restores.
    let followed = false;
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest("a") : null;
      if (link?.getAttribute("href")?.startsWith("#/")) followed = true;
    };
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      if (!followed) return;
      followed = false;
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);
  return route;
}
