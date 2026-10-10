// Copyright © 2026 Christopher Snow

// Learner state: browser-local, namespaced, versioned, and never trusted for completion.
//
// Everything a learner does in a lesson is kept under one storage key per lesson,
// `${book}:v1:${lessonId}`, as JSON. The runtime reads it on load and writes it on every change.
// What it stores is the work: the artifact for each challenge, how many hints were shown, the
// choices made in predictions. What it never stores as a fact is "this challenge is complete":
// completion is recomputed by grading the stored artifact every time the page loads. A learner
// who edits the stored JSON can change their work, which is theirs to change; they cannot mark
// a test passed without the test passing.
//
// The store is a small external store with subscribe/get for React's useSyncExternalStore, and
// the storage behind it is an adapter so tests use memory and a browser whose storage throws
// (private mode, blocked site data) degrades to memory for the visit.

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { Artifact, Challenge, Lesson } from "@platform/lesson-schema";

import type { Book, Verdict } from "./book";

export const STATE_VERSION = 1 as const;

export interface StoredChallenge {
  readonly artifact: Artifact;
  readonly attempts: number;
  readonly hintsRevealed: number;
  /** When a run first passed, for the learner's own record. Never read as proof. */
  readonly firstPassedAt?: string;
}

export interface StoredLesson {
  readonly version: typeof STATE_VERSION;
  readonly challenges: Readonly<Record<string, StoredChallenge>>;
  /** Per-interactive state, by interactive id: a prediction, a chosen fault, a slider position. */
  readonly slots: Readonly<Record<string, unknown>>;
  readonly updatedAt?: string;
}

export interface Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  /** Every key this storage holds, so a whole book's work can be cleared at once. */
  keys(): readonly string[];
}

export function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => void map.set(k, v),
    remove: (k) => void map.delete(k),
    keys: () => [...map.keys()],
  };
}

/** The browser's localStorage when it works, memory for the visit when it throws. */
export function browserStorage(): Storage {
  const fallback = memoryStorage();
  const local = (): globalThis.Storage | undefined => {
    try {
      const s = globalThis.localStorage;
      const probe = "__probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    } catch {
      return undefined;
    }
  };
  return {
    get(key) {
      try {
        return local()?.getItem(key) ?? fallback.get(key);
      } catch {
        return fallback.get(key);
      }
    },
    set(key, value) {
      fallback.set(key, value);
      try {
        local()?.setItem(key, value);
      } catch {
        // Storage full or blocked: the visit keeps its memory copy.
      }
    },
    remove(key) {
      fallback.remove(key);
      try {
        local()?.removeItem(key);
      } catch {
        // Nothing to do; the memory copy is gone.
      }
    },
    keys() {
      try {
        const s = local();
        if (!s) return fallback.keys();
        const out = new Set<string>(fallback.keys());
        for (let i = 0; i < s.length; i++) out.add(s.key(i) ?? "");
        return [...out];
      } catch {
        return fallback.keys();
      }
    },
  };
}

export function storageKey(bookId: string, lessonId: string): string {
  return `${bookId}:v${STATE_VERSION}:${lessonId}`;
}

const EMPTY: StoredLesson = { version: STATE_VERSION, challenges: {}, slots: {} };

function parseStored(text: string | null): StoredLesson {
  if (!text) return EMPTY;
  try {
    const value = JSON.parse(text) as Partial<StoredLesson> | null;
    if (!value || value.version !== STATE_VERSION) return EMPTY;
    return {
      version: STATE_VERSION,
      challenges: value.challenges ?? {},
      slots: value.slots ?? {},
      ...(value.updatedAt ? { updatedAt: value.updatedAt } : {}),
    };
  } catch {
    return EMPTY;
  }
}

/** One lesson's state: read it, change it, subscribe to it. */
export class LessonStore {
  private value: StoredLesson;
  private readonly listeners = new Set<() => void>();

  constructor(
    readonly storage: Storage,
    readonly bookId: string,
    readonly lessonId: string,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {
    this.value = parseStored(storage.get(storageKey(bookId, lessonId)));
  }

  get(): StoredLesson {
    return this.value;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  update(change: (current: StoredLesson) => StoredLesson): void {
    const next = { ...change(this.value), version: STATE_VERSION, updatedAt: this.now() };
    this.value = next;
    this.storage.set(storageKey(this.bookId, this.lessonId), JSON.stringify(next));
    for (const l of this.listeners) l();
  }

  challenge(id: string): StoredChallenge | undefined {
    return this.value.challenges[id];
  }

  setChallenge(id: string, change: (current: StoredChallenge) => StoredChallenge): void {
    this.update((s) => ({
      ...s,
      challenges: {
        ...s.challenges,
        [id]: change(s.challenges[id] ?? { artifact: {}, attempts: 0, hintsRevealed: 0 }),
      },
    }));
  }

  resetChallenge(id: string): void {
    this.update((s) => {
      const challenges = { ...s.challenges };
      delete challenges[id];
      return { ...s, challenges };
    });
  }

  slot<T>(id: string): T | undefined {
    return this.value.slots[id] as T | undefined;
  }

  setSlot<T>(id: string, value: T | undefined): void {
    this.update((s) => {
      const slots = { ...s.slots };
      if (value === undefined) delete slots[id];
      else slots[id] = value;
      return { ...s, slots };
    });
  }

  /** Forgets everything stored for this lesson. */
  reset(): void {
    this.value = EMPTY;
    this.storage.remove(storageKey(this.bookId, this.lessonId));
    for (const l of this.listeners) l();
  }
}

/**
 * Forgets every lesson's stored work for one book: every key the book's storage holds, so a
 * reader can start the whole course again. The caller remounts what reads the state.
 */
export function resetBook(storage: Storage, bookId: string): void {
  const prefix = `${bookId}:v${STATE_VERSION}:`;
  for (const key of storage.keys()) {
    if (key.startsWith(prefix)) storage.remove(key);
  }
}

/** The stored artifact to grade for a challenge: the learner's, or the lesson's starting point. */
export function artifactFor(store: StoredLesson, challenge: Challenge): Artifact {
  return store.challenges[challenge.id]?.artifact ?? challenge.initial;
}

export interface Completion {
  readonly lessonId: string;
  readonly passed: number;
  readonly total: number;
  readonly verdicts: Readonly<Record<string, Verdict>>;
}

/**
 * A book's grade that cannot take the page down. Saved work is graded again on every load, by the
 * challenge as it mounts and by a book's list of lessons, so a grader that throws on one saved
 * artifact would break those pages on every later visit, with the learner's way out (clearing the
 * work) on the broken page. A throw becomes a verdict that says the tests could not run, in the
 * words `explain` makes of the error's own; the work stays as it was.
 */
export function gradeSafely(
  book: Book,
  challenge: Challenge,
  artifact: Artifact,
  explain: (message: string) => string = (message) => message,
): Verdict {
  try {
    return book.grade(challenge, artifact);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { passed: false, total: 0, failures: [], blocked: explain(message) };
  }
}

/**
 * How much of a lesson stands complete: every stored artifact graded afresh. This is the only
 * way the runtime ever arrives at "complete"; a stored mark is never read.
 */
export function verifyCompletion(book: Book, lesson: Lesson, stored: StoredLesson): Completion {
  const verdicts: Record<string, Verdict> = {};
  let passed = 0;
  for (const c of lesson.challenges) {
    const saved = stored.challenges[c.id];
    // Work never touched is not graded: the starting point may pass a trivial test by accident,
    // and a lesson nobody opened is not complete.
    if (!saved) continue;
    const verdict = gradeSafely(book, c, saved.artifact);
    verdicts[c.id] = verdict;
    if (verdict.passed) passed++;
  }
  return { lessonId: lesson.id, passed, total: lesson.challenges.length, verdicts };
}

/** A store for a lesson, kept for the component's life. */
export function useLessonStore(storage: Storage, bookId: string, lessonId: string): LessonStore {
  return useMemo(() => new LessonStore(storage, bookId, lessonId), [storage, bookId, lessonId]);
}

/** The lesson's stored state, re-rendering on change. */
export function useStored(store: LessonStore): StoredLesson {
  const subscribe = useCallback((l: () => void) => store.subscribe(l), [store]);
  const get = useCallback(() => store.get(), [store]);
  return useSyncExternalStore(subscribe, get, get);
}

/** A per-interactive slot of state. */
export function useSlot<T>(
  store: LessonStore,
  id: string,
): [T | undefined, (v: T | undefined) => void] {
  const stored = useStored(store);
  const set = useCallback((v: T | undefined) => store.setSlot(id, v), [store, id]);
  return [stored.slots[id] as T | undefined, set];
}
