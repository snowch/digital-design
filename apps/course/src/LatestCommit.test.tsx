// @vitest-environment jsdom
// Copyright © 2026 Christopher Snow

import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LatestCommit } from "./LatestCommit";
import { STRINGS } from "./strings";

const commit = "a".repeat(40);
const tick = () => screen.queryByRole("img", { name: STRINGS.latestCommit });
const response = (sha: string) => ({ ok: true, json: async () => ({ object: { sha } }) });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("the latest commit tick", () => {
  it("waits for an exact match from the public main branch", async () => {
    let resolve!: (value: unknown) => void;
    const fetch = vi.fn(() => new Promise((done) => (resolve = done)));
    vi.stubGlobal("fetch", fetch);
    render(<LatestCommit commit={commit} />);
    expect(tick()).toBeNull();
    await act(async () => resolve(response(commit)));
    expect(tick()).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/snowch/digital-design/git/ref/heads/main",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
    );
  });

  it.each([
    ["a newer commit", response("b".repeat(40))],
    ["only a matching short ID", response(commit.slice(0, 7))],
    ["a rate limit", { ok: false }],
    ["an unexpected response", { ok: true, json: async () => null }],
  ])("shows no tick for %s", async (_name, result) => {
    const fetch = vi.fn().mockResolvedValue(result);
    vi.stubGlobal("fetch", fetch);
    render(<LatestCommit commit={commit} />);
    await act(async () => {});
    expect(tick()).toBeNull();
  });

  it("shows no tick offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<LatestCommit commit={commit} />);
    await act(async () => {});
    expect(tick()).toBeNull();
  });

  it("removes a previous tick when main advances and the tab becomes visible", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response(commit))
        .mockResolvedValue(response("b".repeat(40))),
    );
    render(<LatestCommit commit={commit} />);
    await waitFor(() => expect(tick()).toBeVisible());
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(tick()).toBeNull();
  });

  it("rechecks after five minutes and aborts the request when unmounted", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValue(response(commit));
    vi.stubGlobal("fetch", fetch);
    const view = render(<LatestCommit commit={commit} />);
    await act(async () => {});
    expect(tick()).toBeVisible();
    await act(async () => vi.advanceTimersByTimeAsync(5 * 60_000));
    expect(fetch).toHaveBeenCalledTimes(2);
    const signal = fetch.mock.calls[1]![1].signal as AbortSignal;
    view.unmount();
    expect(signal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
