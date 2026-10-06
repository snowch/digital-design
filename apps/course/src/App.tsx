// Copyright © 2026 Christopher Snow

// The course shell: header, routes, footer. Lessons render through the runtime with the
// digital-design book; the shell itself knows nothing about circuits.

import { useEffect, useMemo, useState } from "react";

import { createBook, INTERACTIVES } from "@dd/dd-views";
import { LESSONS } from "@dd/content";
import { browserStorage, LessonView } from "@platform/lesson-runtime";

import { LessonList } from "./pages/LessonList";
import { LessonPager } from "./pages/LessonPager";
import { Preface } from "./pages/Preface";
import { PREFACE_HREF, lessonHref, useRoute } from "./route";
import { STRINGS } from "./strings";
import { useTheme, type Theme } from "./theme";

export function App() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const storage = useMemo(() => browserStorage(), []);
  const book = useMemo(() => createBook(LESSONS, INTERACTIVES), []);
  // The lesson last shown, so a reader who comes back to the list finds that lesson's module open.
  const [lastLesson, setLastLesson] = useState<string | undefined>();
  useEffect(() => {
    if (route.kind === "lesson") setLastLesson(route.id);
  }, [route]);

  let page: React.ReactNode;
  if (route.kind === "list")
    page = (
      <LessonList book={book} storage={storage} {...(lastLesson ? { from: lastLesson } : {})} />
    );
  else if (route.kind === "preface") page = <Preface book={book} />;
  else if (route.kind === "lesson") {
    const lesson = book.lessons.find((l) => l.id === route.id);
    page = lesson ? (
      <>
        <LessonView
          key={lesson.id}
          book={book}
          lesson={lesson}
          storage={storage}
          lessonHref={lessonHref}
        />
        <LessonPager book={book} lessonId={lesson.id} />
      </>
    ) : (
      <>
        <h1>{STRINGS.noLesson(route.id)}</h1>
        <p>
          <a href="#/">{STRINGS.backToLessons}</a>
        </p>
      </>
    );
  } else {
    page = (
      <>
        <h1>{STRINGS.missing(route.path)}</h1>
        <p>
          <a href="#/">{STRINGS.backToLessons}</a>
        </p>
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {STRINGS.skip}
      </a>
      <header className="shell-header">
        <a className="brand" href="#/">
          Digital Design
        </a>
        <nav aria-label={STRINGS.lessons}>
          <a href="#/" aria-current={route.kind === "list" ? "page" : undefined}>
            {STRINGS.lessons}
          </a>
          {/* The page before the first lesson is also where "how a lesson works" lives, so it is
              one step from any lesson. */}
          <a href={PREFACE_HREF} aria-current={route.kind === "preface" ? "page" : undefined}>
            {STRINGS.preface.title}
          </a>
        </nav>
        <label className="theme-picker">
          <span>{STRINGS.theme}</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="auto">{STRINGS.themeAuto}</option>
            <option value="light">{STRINGS.themeLight}</option>
            <option value="dark">{STRINGS.themeDark}</option>
          </select>
        </label>
      </header>
      <main id="main" className="shell-main" tabIndex={-1}>
        {page}
      </main>
      <footer className="shell-footer">
        <p>{STRINGS.footer}</p>
        <p className="copyright">{STRINGS.copyright}</p>
      </footer>
    </>
  );
}
