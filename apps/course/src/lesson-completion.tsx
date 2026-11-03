// Copyright © 2026 Christopher Snow

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { Book, Storage } from "@platform/lesson-runtime";

export const lessonDoneKey = (book: string, lesson: string) =>
  `${book}:v1:manual-completion:${lesson}`;

interface Completion {
  completed: ReadonlySet<string>;
  setDone: (id: string, done: boolean) => void;
}

const CompletionContext = createContext<Completion | null>(null);

// Reading marks have their own keys. They never alter exercise artifacts or verified results.
export function LessonCompletionProvider({
  book,
  storage,
  children,
}: {
  book: Book;
  storage: Storage;
  children: ReactNode;
}) {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        book.lessons
          .filter((l) => storage.get(lessonDoneKey(book.id, l.id)) === "true")
          .map((l) => l.id),
      ),
  );
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      const lessons = book.lessons.filter(
        (l) => event.key === null || event.key === lessonDoneKey(book.id, l.id),
      );
      if (lessons.length === 0) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return;
        const values = lessons.map((l) => ({
          id: l.id,
          done: window.localStorage.getItem(lessonDoneKey(book.id, l.id)) === "true",
        }));
        setCompleted((previous) => {
          const next = new Set(previous);
          for (const value of values) {
            if (value.done) next.add(value.id);
            else next.delete(value.id);
          }
          return next;
        });
      } catch {
        // Blocked storage leaves this tab's in-memory choices intact.
      }
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [book]);

  const setDone = (id: string, done: boolean) => {
    if (!book.lessons.some((lesson) => lesson.id === id)) return;
    storage.set(lessonDoneKey(book.id, id), String(done));
    setCompleted((previous) => {
      const next = new Set(previous);
      if (done) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <CompletionContext.Provider value={{ completed, setDone }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useLessonCompletion() {
  return useContext(CompletionContext);
}
