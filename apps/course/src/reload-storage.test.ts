// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { afterEach, expect, it, vi } from "vitest";

import { browserStorage, memoryStorage } from "@platform/lesson-runtime";

import { reloadStorage } from "./reload-storage";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

it("makes memory-only work durable before reloading", () => {
  const saved = reloadStorage(memoryStorage());
  saved.storage.set("dd:v1:lesson", "latest work");
  expect(localStorage.getItem("dd:v1:lesson")).toBeNull();
  saved.beforeReload();
  expect(localStorage.getItem("dd:v1:lesson")).toBe("latest work");
});

it("keeps the newest memory copy when a write fails over an older saved value", () => {
  localStorage.setItem("work", "older work");
  const base = { get: () => "older work", set: () => {}, remove: () => {}, keys: () => ["work"] };
  const saved = reloadStorage(base);
  saved.storage.set("work", "new work");
  expect(saved.storage.get("work")).toBe("new work");
  saved.beforeReload();
  expect(localStorage.getItem("work")).toBe("new work");
});

it("refuses a reload if storage is full, retaining the draft for a later retry", () => {
  const saved = reloadStorage(memoryStorage());
  saved.storage.set("work", "draft");
  const blocked = vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });
  expect(() => saved.beforeReload()).toThrow();
  expect(saved.storage.get("work")).toBe("draft");
  blocked.mockRestore();
  saved.beforeReload();
  expect(localStorage.getItem("work")).toBe("draft");
});

it("refuses a reload if browser storage is blocked or silently ignores a write", () => {
  const blocked = reloadStorage(memoryStorage(), () => {
    throw new Error("blocked");
  });
  blocked.storage.set("work", "draft");
  expect(() => blocked.beforeReload()).toThrow("blocked");
  const silent = reloadStorage(memoryStorage());
  silent.storage.set("work", "draft");
  vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(() => {});
  expect(() => silent.beforeReload()).toThrow("could not be saved");
});

it("preserves a pending removal", () => {
  localStorage.setItem("work", "old");
  const saved = reloadStorage(memoryStorage());
  saved.storage.remove("work");
  expect(saved.storage.keys()).not.toContain("work");
  saved.beforeReload();
  expect(localStorage.getItem("work")).toBeNull();
});

it("does not overwrite another tab's newer saved work with an already durable write", () => {
  const saved = reloadStorage(browserStorage());
  saved.storage.set("work", "this tab");
  localStorage.setItem("work", "another tab");
  saved.beforeReload();
  expect(localStorage.getItem("work")).toBe("another tab");
});

it("does not repeat successful saves after a partial failure", () => {
  const saved = reloadStorage(memoryStorage());
  saved.storage.set("first", "draft one");
  saved.storage.set("second", "draft two");
  const realSet = window.Storage.prototype.setItem;
  const blocked = vi.spyOn(window.Storage.prototype, "setItem").mockImplementation(function (
    this: globalThis.Storage,
    key,
    value,
  ) {
    if (key === "second") throw new Error("full");
    realSet.call(this, key, value);
  });
  expect(() => saved.beforeReload()).toThrow("full");
  realSet.call(localStorage, "first", "newer work in another tab");
  blocked.mockRestore();
  saved.beforeReload();
  expect(localStorage.getItem("first")).toBe("newer work in another tab");
  expect(localStorage.getItem("second")).toBe("draft two");
});
