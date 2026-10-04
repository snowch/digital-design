// The course shell. Replaced by the lesson router once the runtime exists; this is the first
// end-to-end build, and it renders nothing a learner would mistake for a lesson.
export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="shell-header">
        <a className="brand" href="#/">
          Digital Design
        </a>
        <nav aria-label="Course">
          <a href="#/">Lessons</a>
        </nav>
      </header>
      <main id="main" className="shell-main">
        <h1>Digital Design: From Bits to a Working Computer</h1>
        <p>The first lesson is being built. Nothing here is a lesson yet.</p>
      </main>
      <footer className="shell-footer">
        Everything runs in your browser. Nothing is sent anywhere.
      </footer>
    </>
  );
}
