// Copyright © 2026 Christopher Snow

import { useEffect, useState } from "react";

import { STRINGS } from "./strings";

// Check only the public branch ref. No lesson data or saved work leaves the browser.
export function LatestCommit({ commit }: { commit: string }) {
  const [latest, setLatest] = useState(false);
  useEffect(() => {
    let request: AbortController | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    const check = async () => {
      request?.abort();
      clearTimeout(timeout);
      const controller = new AbortController();
      request = controller;
      setLatest(false);
      timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch(
          "https://api.github.com/repos/snowch/digital-design/git/ref/heads/main",
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) return;
        const ref: unknown = await response.json();
        if (active && !controller.signal.aborted) {
          setLatest(
            typeof ref === "object" &&
              ref !== null &&
              "object" in ref &&
              typeof ref.object === "object" &&
              ref.object !== null &&
              "sha" in ref.object &&
              ref.object.sha === commit,
          );
        }
      } catch {
        // Offline, rate-limited or timed out: there is no confirmed match to show.
      } finally {
        if (request === controller) clearTimeout(timeout);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void check();
    }, 5 * 60_000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      request?.abort();
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [commit]);

  return latest ? (
    <span role="img" aria-label={STRINGS.latestCommit} title={STRINGS.latestCommit}>
      {" ✓"}
    </span>
  ) : null;
}
