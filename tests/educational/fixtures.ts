// Copyright © 2026 Christopher Snow

import { test as base } from "@playwright/test";

export { expect, type Locator, type Page } from "@playwright/test";

export const MAIN_REF_URL = "https://api.github.com/repos/snowch/digital-design/git/ref/heads/main";

// The lessons must not depend on GitHub's availability or shared runner IP rate limits.
// Footer status tests override this response to exercise matching and unavailable revisions.
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(MAIN_REF_URL, (route) =>
      route.fulfill({ json: { object: { sha: "0".repeat(40) } } }),
    );
    await use(context);
  },
});
