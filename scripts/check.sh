#!/usr/bin/env bash
# Copyright © 2026 Christopher Snow

# Exactly what CI runs. Run it before pushing: `npm run check`.
#
# CI invokes this same script, so a laptop and CI cannot drift. Each stage says what it protects,
# because a check nobody understands is a check somebody eventually deletes.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== formatting =="
# One formatter, pinned, so a diff is never a reformat.
npx prettier --check .

echo "== copyright =="
# Every source file carries its author's copyright line; a new file without it fails here.
# `node scripts/copyright.mjs` adds the line.
node scripts/copyright.mjs --check

echo "== types =="
# Strict TypeScript over every package, the content and the tests, with no emit: the build below
# bundles only what the course imports, so this is the only stage that typechecks everything.
npx tsc --noEmit -p tsconfig.json

echo "== unit and integration tests =="
# The engine, the model, the HDL subset and the lesson schema under Node with no DOM; the runtime
# and the views under jsdom. Every lesson is validated against the schema here too.
npx vitest run

echo "== the course builds =="
# The production bundle, under the base path GitHub Pages serves it from.
npm run build -w @dd/course

echo "== educational tests, in a browser =="
# Every exercise completable, rejects wrong answers, deterministic, resets, cannot be bypassed,
# on a desktop and on a phone. Needs Playwright's Chromium; CI installs it.
npx playwright test

echo
echo "All checks passed."
