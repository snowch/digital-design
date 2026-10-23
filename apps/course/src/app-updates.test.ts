// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { afterEach, expect, it, vi } from "vitest";

import { watchAppUpdates } from "./app-updates";

const base = "http://localhost/digital-design/";
class Worker extends EventTarget {
  scriptURL = `${base}sw.js`;
  state: ServiceWorkerState = "installed";
  postMessage = vi.fn();
}
class Registration extends EventTarget {
  waiting: Worker | null = new Worker();
  installing: Worker | null = null;
  update = vi.fn().mockResolvedValue(undefined);
}
class Container extends EventTarget {
  controller: Worker | null = new Worker();
  registration = new Registration();
  register = vi.fn().mockResolvedValue(this.registration);
}
const stops: Array<() => void> = [];
afterEach(() => {
  stops.splice(0).forEach((stop) => stop());
  vi.useRealTimers();
});
async function start(container = new Container(), beforeReload = vi.fn()) {
  const reload = vi.fn();
  const notify = vi.fn();
  const manager = watchAppUpdates({
    container: container as unknown as ServiceWorkerContainer,
    base,
    beforeReload,
    reload,
    notify,
  });
  stops.push(manager.stop);
  await Promise.resolve();
  return { container, registration: container.registration, reload, notify, manager, beforeReload };
}

it("announces a waiting update without activating or reloading it", async () => {
  const f = await start();
  expect(f.notify).toHaveBeenLastCalledWith({ ready: true, applying: false });
  expect(f.registration.waiting!.postMessage).not.toHaveBeenCalled();
  expect(f.reload).not.toHaveBeenCalled();
  expect(f.container.register).toHaveBeenCalledWith(`${base}sw.js`, {
    scope: base,
    updateViaCache: "none",
  });
});

it("activates only after saving, then reloads only after the controller changes", async () => {
  const f = await start();
  f.manager.apply();
  expect(f.beforeReload).toHaveBeenCalledOnce();
  expect(f.registration.waiting!.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  expect(f.reload).not.toHaveBeenCalled();
  f.container.dispatchEvent(new Event("controllerchange"));
  expect(f.reload).toHaveBeenCalledOnce();
});

it("shows an update in other tabs without forcing their reload", async () => {
  const f = await start();
  f.registration.waiting = null;
  f.container.dispatchEvent(new Event("controllerchange"));
  expect(f.reload).not.toHaveBeenCalled();
  expect(f.notify).toHaveBeenLastCalledWith({ ready: true, applying: false });
  f.manager.apply();
  expect(f.reload).toHaveBeenCalledOnce();
});

it("does not prompt or reload on first installation", async () => {
  const container = new Container();
  container.controller = null;
  const f = await start(container);
  container.controller = new Worker();
  container.registration.waiting = null;
  container.dispatchEvent(new Event("controllerchange"));
  expect(f.notify).toHaveBeenLastCalledWith({ ready: false, applying: false });
  expect(f.reload).not.toHaveBeenCalled();
});

it("announces a background download only once it is installed", async () => {
  const container = new Container();
  const worker = new Worker();
  worker.state = "installing";
  container.registration.waiting = null;
  container.registration.installing = worker;
  const f = await start(container);
  expect(f.notify).toHaveBeenLastCalledWith({ ready: false, applying: false });
  container.registration.waiting = worker;
  worker.state = "installed";
  worker.dispatchEvent(new Event("statechange"));
  expect(f.notify).toHaveBeenLastCalledWith({ ready: true, applying: false });
});

it("blocks activation and reload when the work cannot be saved", async () => {
  const f = await start(
    new Container(),
    vi.fn(() => {
      throw new Error("storage full");
    }),
  );
  f.manager.apply();
  expect(f.notify).toHaveBeenLastCalledWith({ ready: true, applying: false, error: "storage" });
  expect(f.registration.waiting!.postMessage).not.toHaveBeenCalled();
  expect(f.reload).not.toHaveBeenCalled();
});

it("times out an activation without reloading unexpectedly if it completes later", async () => {
  vi.useFakeTimers();
  const f = await start();
  f.manager.apply();
  await vi.advanceTimersByTimeAsync(15_000);
  expect(f.notify).toHaveBeenLastCalledWith({ ready: true, applying: false, error: "activation" });
  f.container.dispatchEvent(new Event("controllerchange"));
  expect(f.reload).not.toHaveBeenCalled();
});

it("checks on return and online, and removes listeners and timers when stopped", async () => {
  vi.useFakeTimers();
  const f = await start();
  window.dispatchEvent(new Event("online"));
  document.dispatchEvent(new Event("visibilitychange"));
  await vi.advanceTimersByTimeAsync(5 * 60_000);
  expect(f.registration.update).toHaveBeenCalledTimes(3);
  f.manager.stop();
  f.container.dispatchEvent(new Event("controllerchange"));
  window.dispatchEvent(new Event("online"));
  await vi.advanceTimersByTimeAsync(5 * 60_000);
  expect(f.registration.update).toHaveBeenCalledTimes(3);
  expect(f.reload).not.toHaveBeenCalled();
});
