// Copyright © 2026 Christopher Snow

import { useEffect, useRef, useState } from "react";

import { NO_UPDATE, watchAppUpdates } from "./app-updates";
import { STRINGS } from "./strings";

export function UpdateNotice({ beforeReload }: { beforeReload: () => void }) {
  const [state, setState] = useState(NO_UPDATE);
  const updates = useRef<ReturnType<typeof watchAppUpdates>>(undefined);
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const manager = watchAppUpdates({
      container: navigator.serviceWorker,
      base: new URL(import.meta.env.BASE_URL, window.location.origin).href,
      beforeReload,
      reload: () => window.location.reload(),
      notify: setState,
    });
    updates.current = manager;
    return () => manager.stop();
  }, [beforeReload]);

  if (!state.ready) return null;
  return (
    <aside className="update-notice" aria-label={STRINGS.appUpdate.available}>
      <p role="status">{STRINGS.appUpdate.available}</p>
      <button
        className="button primary"
        type="button"
        disabled={state.applying}
        onClick={() => updates.current?.apply()}
      >
        {state.applying ? STRINGS.appUpdate.applying : STRINGS.appUpdate.action}
      </button>
      {state.error && <p role="alert">{STRINGS.appUpdate[state.error]}</p>}
    </aside>
  );
}
