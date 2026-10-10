// Copyright © 2026 Christopher Snow

import { describe, expect, it } from "vitest";

import { fixtureBook, fixtureLesson } from "./fixtures";
import {
  LessonStore,
  artifactFor,
  gradeSafely,
  memoryStorage,
  resetBook,
  storageKey,
  verifyCompletion,
} from "./state";

describe("the lesson store", () => {
  it("keeps a lesson's work under one namespaced key and reads it back", () => {
    const storage = memoryStorage();
    const store = new LessonStore(storage, "dd", "remember", () => "2026-01-01T00:00:00.000Z");
    store.setChallenge("latch", (c) => ({ ...c, artifact: { hdl: "x" } }));
    store.setSlot("loop", { prediction: "holds" });
    expect(storageKey("dd", "remember")).toBe("dd:v1:remember");
    const raw = JSON.parse(storage.get("dd:v1:remember") ?? "{}");
    expect(raw).toEqual({
      version: 1,
      challenges: { latch: { artifact: { hdl: "x" }, attempts: 0, hintsRevealed: 0 } },
      slots: { loop: { prediction: "holds" } },
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const again = new LessonStore(storage, "dd", "remember");
    expect(again.challenge("latch")?.artifact).toEqual({ hdl: "x" });
    expect(again.slot("loop")).toEqual({ prediction: "holds" });
  });

  it("treats unreadable or foreign state as empty", () => {
    const storage = memoryStorage();
    storage.set("dd:v1:remember", "{not json");
    expect(new LessonStore(storage, "dd", "remember").get().challenges).toEqual({});
    storage.set("dd:v1:remember", JSON.stringify({ version: 99, challenges: { a: {} } }));
    expect(new LessonStore(storage, "dd", "remember").get().challenges).toEqual({});
  });

  it("notifies subscribers and forgets on reset", () => {
    const store = new LessonStore(memoryStorage(), "dd", "remember");
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.setSlot("a", 1);
    store.resetChallenge("none");
    expect(calls).toBe(2);
    store.reset();
    expect(calls).toBe(3);
    expect(store.get().slots).toEqual({});
    off();
    store.setSlot("a", 2);
    expect(calls).toBe(3);
  });

  it("forgets every lesson of one book on resetBook, and no other book's", () => {
    const storage = memoryStorage();
    new LessonStore(storage, "dd", "remember").setSlot("a", 1);
    new LessonStore(storage, "dd", "count").setSlot("b", 2);
    new LessonStore(storage, "ms", "invisible-system").setSlot("c", 3);
    expect([...storage.keys()].sort()).toEqual([
      "dd:v1:count",
      "dd:v1:remember",
      "ms:v1:invisible-system",
    ]);
    resetBook(storage, "dd");
    expect(storage.keys()).toEqual(["ms:v1:invisible-system"]);
    expect(new LessonStore(storage, "dd", "remember").get().slots).toEqual({});
    expect(new LessonStore(storage, "ms", "invisible-system").slot("c")).toBe(3);
  });
});

describe("completion", () => {
  const lesson = fixtureLesson();
  const book = fixtureBook([lesson]);

  it("is computed by grading the stored work, never read from a stored mark", () => {
    const storage = memoryStorage();
    const store = new LessonStore(storage, "fx", lesson.id);
    expect(verifyCompletion(book, lesson, store.get())).toMatchObject({ passed: 0, total: 1 });

    store.setChallenge("latch", (c) => ({ ...c, artifact: { hdl: "right" } }));
    expect(verifyCompletion(book, lesson, store.get()).passed).toBe(1);

    // A hand-edited store claims a pass it never earned: the claim is ignored.
    storage.set(
      storageKey("fx", lesson.id),
      JSON.stringify({
        version: 1,
        challenges: {
          latch: {
            artifact: { hdl: "wrong" },
            attempts: 9,
            hintsRevealed: 0,
            firstPassedAt: "2020-01-01",
          },
        },
        slots: {},
      }),
    );
    const tampered = new LessonStore(storage, "fx", lesson.id);
    const completion = verifyCompletion(book, lesson, tampered.get());
    expect(completion.passed).toBe(0);
    expect(completion.verdicts["latch"]?.passed).toBe(false);
  });

  it("counts work whose grader throws as not passed, and does not throw itself", () => {
    // A book's list of lessons grades every stored challenge as it draws; one grader that throws
    // on one saved artifact must not take the list down on every later visit.
    const throwing = {
      ...book,
      grade: () => {
        throw new Error("the reference does not branch on an unknown word");
      },
    };
    const store = new LessonStore(memoryStorage(), "fx", lesson.id);
    store.setChallenge("latch", (c) => ({ ...c, artifact: { hdl: "anything" } }));
    const completion = verifyCompletion(throwing, lesson, store.get());
    expect(completion.passed).toBe(0);
    expect(completion.verdicts["latch"]).toEqual({
      passed: false,
      total: 0,
      failures: [],
      blocked: "the reference does not branch on an unknown word",
    });
    expect(
      gradeSafely(throwing, lesson.challenges[0]!, { hdl: "x" }, (m) => `could not run: ${m}`)
        .blocked,
    ).toBe("could not run: the reference does not branch on an unknown word");
    expect(gradeSafely(book, lesson.challenges[0]!, { hdl: "right" }).passed).toBe(true);
  });

  it("does not grade work the learner never touched", () => {
    const easy = fixtureLesson({
      challenges: [{ ...lesson.challenges[0]!, initial: { hdl: "right" } }],
    });
    const store = new LessonStore(memoryStorage(), "fx", easy.id);
    expect(artifactFor(store.get(), easy.challenges[0]!)).toEqual({ hdl: "right" });
    expect(verifyCompletion(fixtureBook([easy]), easy, store.get()).passed).toBe(0);
  });
});
