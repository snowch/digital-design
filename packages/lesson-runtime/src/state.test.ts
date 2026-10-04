import { describe, expect, it } from "vitest";

import { fixtureBook, fixtureLesson } from "./fixtures";
import { LessonStore, artifactFor, memoryStorage, storageKey, verifyCompletion } from "./state";

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

  it("does not grade work the learner never touched", () => {
    const easy = fixtureLesson({
      challenges: [{ ...lesson.challenges[0]!, initial: { hdl: "right" } }],
    });
    const store = new LessonStore(memoryStorage(), "fx", easy.id);
    expect(artifactFor(store.get(), easy.challenges[0]!)).toEqual({ hdl: "right" });
    expect(verifyCompletion(fixtureBook([easy]), easy, store.get()).passed).toBe(0);
  });
});
