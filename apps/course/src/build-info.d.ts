// Copyright © 2026 Christopher Snow

// Vite supplies the checked-out revision at build time; the browser makes no GitHub request.
declare const __BUILD_INFO__: {
  readonly commit: string;
  readonly date: string;
};
