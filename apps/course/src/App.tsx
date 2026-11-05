// Copyright © 2026 Christopher Snow

// The course shell: header, routes, footer. Lessons render through the runtime with the
// digital-design book; the shell itself knows nothing about circuits.

import { useEffect, useMemo, useState } from "react";

import { createBook, INTERACTIVES } from "@dd/dd-views";
import { LESSONS } from "@dd/content";
import { LessonView } from "@platform/lesson-runtime";

import { UpdateNotice } from "./UpdateNotice";
import { LatestCommit } from "./LatestCommit";
import { LessonCompletionProvider } from "./lesson-completion";
import { LessonList } from "./pages/LessonList";
import { LessonPager } from "./pages/LessonPager";
import { Preface } from "./pages/Preface";
import { PREFACE_HREF, lessonHref, pageTitle, useRoute } from "./route";
import { RUNTIME_STRINGS } from "./runtime-strings";
import { reloadStorage } from "./reload-storage";
import { STRINGS } from "./strings";
import { useTheme, type Theme } from "./theme";

export function App() {
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const savedWork = useMemo(() => reloadStorage(), []);
  const storage = savedWork.storage;
  const book = useMemo(() => createBook(LESSONS, INTERACTIVES), []);
  // The lesson last shown, so a reader who comes back to the list finds that lesson's module open.
  const [lastLesson, setLastLesson] = useState<string | undefined>();
  useEffect(() => {
    if (route.kind === "lesson") setLastLesson(route.id);
  }, [route]);
  // The tab names the page, so a reader with several lessons open can tell them apart.
  useEffect(() => {
    document.title = pageTitle(
      route,
      book.title,
      (id) => book.lessons.find((l) => l.id === id)?.title,
    );
  }, [route, book]);

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
          strings={RUNTIME_STRINGS}
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
        <a
          className="header-star"
          href="https://github.com/snowch/digital-design"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={STRINGS.githubStarLabel}
          title={STRINGS.githubStarLabel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3 9.6l6.2-.9Z" />
          </svg>
          <span>{STRINGS.githubStar}</span>
        </a>
        <label className="theme-picker">
          <span>{STRINGS.theme}</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="auto">{STRINGS.themeAuto}</option>
            <option value="light">{STRINGS.themeLight}</option>
            <option value="dark">{STRINGS.themeDark}</option>
          </select>
        </label>
      </header>
      <UpdateNotice beforeReload={savedWork.beforeReload} />
      <main id="main" className="shell-main" tabIndex={-1}>
        <LessonCompletionProvider book={book} storage={storage}>
          {page}
        </LessonCompletionProvider>
      </main>
      <footer className="shell-footer">
        <p>{STRINGS.footer}</p>
        <p className="copyright">{STRINGS.copyright}</p>
        <p>
          <a href={`https://github.com/snowch/digital-design/commit/${__BUILD_INFO__.commit}`}>
            {__BUILD_INFO__.commit.slice(0, 7)}
          </a>
          <LatestCommit commit={__BUILD_INFO__.commit} />
          {" · "}
          <time dateTime={__BUILD_INFO__.date}>{__BUILD_INFO__.date}</time>
        </p>
      </footer>
    </>
  );
}
