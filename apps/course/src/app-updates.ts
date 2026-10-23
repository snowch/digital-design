// Copyright © 2026 Christopher Snow

export interface UpdateState {
  ready: boolean;
  applying: boolean;
  error?: "storage" | "activation";
}

export const NO_UPDATE: UpdateState = { ready: false, applying: false };

export function watchAppUpdates({
  container,
  base,
  beforeReload,
  reload,
  notify,
}: {
  container: ServiceWorkerContainer;
  base: string;
  beforeReload: () => void;
  reload: () => void;
  notify: (state: UpdateState) => void;
}) {
  const workerURL = new URL("sw.js", base).href;
  let active = true;
  let registration: ServiceWorkerRegistration | undefined;
  let waiting: ServiceWorker | null = null;
  let controlled = container.controller?.scriptURL === workerURL;
  let ready = false;
  let requested = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Map<ServiceWorker, () => void>();
  const announce = () => {
    if (!active) return;
    waiting = registration?.waiting ?? null;
    if (waiting && controlled) ready = true;
    notify({ ready, applying: requested });
  };
  const controllerChanged = () => {
    if (!active || container.controller?.scriptURL !== workerURL) return;
    if (requested) {
      clearTimeout(timer);
      // A controller change alone never reloads another tab or the first installation.
      reload();
      return;
    }
    if (controlled) ready = true;
    controlled = true;
    announce();
  };
  const found = () => {
    const worker = registration?.installing;
    if (!worker || listeners.has(worker)) return;
    const changed = () => {
      if (worker.state === "installed" || worker.state === "redundant") announce();
    };
    listeners.set(worker, changed);
    worker.addEventListener("statechange", changed);
    changed();
  };
  const check = () => {
    if (!active || document.visibilityState !== "visible") return;
    announce();
    void registration?.update().catch(() => {});
  };
  container.addEventListener("controllerchange", controllerChanged);
  document.addEventListener("visibilitychange", check);
  window.addEventListener("online", check);
  const interval = setInterval(check, 5 * 60_000);
  void container
    .register(workerURL, { scope: base, updateViaCache: "none" })
    .then((result) => {
      if (!active) return;
      registration = result;
      result.addEventListener("updatefound", found);
      found();
      announce();
    })
    .catch(() => {});

  return {
    apply() {
      if (!active || !ready || requested) return;
      try {
        beforeReload();
      } catch {
        notify({ ready: true, applying: false, error: "storage" });
        return;
      }
      waiting = registration?.waiting ?? null;
      if (!waiting) {
        reload();
        return;
      }
      requested = true;
      notify({ ready: true, applying: true });
      timer = setTimeout(() => {
        requested = false;
        notify({ ready: true, applying: false, error: "activation" });
      }, 15_000);
      try {
        waiting.postMessage({ type: "SKIP_WAITING" });
      } catch {
        clearTimeout(timer);
        requested = false;
        notify({ ready: true, applying: false, error: "activation" });
      }
    },
    stop() {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
      container.removeEventListener("controllerchange", controllerChanged);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
      registration?.removeEventListener("updatefound", found);
      for (const [worker, listener] of listeners)
        worker.removeEventListener("statechange", listener);
    },
  };
}
