// Copyright © 2026 Christopher Snow

import { browserStorage, type Storage } from "@platform/lesson-runtime";

// The platform keeps working in memory if localStorage throws. Track the latest writes here so
// an explicit app update can refuse to reload until that work really is durable.
export function reloadStorage(base: Storage = browserStorage(), local = () => window.localStorage) {
  const pending = new Map<string, string | null>();
  const listeners = new Set<() => void>();
  const hasPending = () => pending.size > 0;
  const notify = (wasPending: boolean) => {
    if (wasPending !== hasPending()) for (const listener of listeners) listener();
  };
  const track = (key: string, value: string | null) => {
    const wasPending = hasPending();
    pending.set(key, value);
    try {
      if (local().getItem(key) === value) pending.delete(key);
    } catch {
      // This write still exists only in this tab's memory.
    }
    notify(wasPending);
  };
  const storage: Storage = {
    get: (key) => (pending.has(key) ? pending.get(key)! : base.get(key)),
    set(key, value) {
      base.set(key, value);
      track(key, value);
    },
    remove(key) {
      base.remove(key);
      track(key, null);
    },
    keys: () =>
      [...new Set([...base.keys(), ...pending.keys()])].filter((key) => storage.get(key) !== null),
  };
  return {
    storage,
    hasPending,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    beforeReload() {
      if (!hasPending()) return;
      try {
        const target = local();
        for (const [key, value] of pending) {
          if (value === null) target.removeItem(key);
          else target.setItem(key, value);
          if (target.getItem(key) !== value) throw new Error("Course work could not be saved");
          pending.delete(key);
        }
      } finally {
        notify(true);
      }
    },
  };
}
