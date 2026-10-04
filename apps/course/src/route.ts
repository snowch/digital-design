// Hash routes, so the site works from GitHub Pages without server rules: `#/` is the lesson
// list and `#/lesson/<id>` a lesson.

import { useEffect, useState } from "react";

export type Route =
  { kind: "list" } | { kind: "lesson"; id: string } | { kind: "missing"; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/" || path === "") return { kind: "list" };
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
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
