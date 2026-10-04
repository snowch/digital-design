# Sceptic's brief: attack the findings of two blind reviews

Two reviewers have each read two lessons of an interactive digital-design course and written
findings: docs/notes/comparison/review-1.md
and docs/notes/comparison/review-2.md.
Reviewers over-call. Attack every finding in both files independently and give a verdict, so
that only findings that survive count.

The repository is at /home/user/digital-design (branch module-5-registers-b, checked out). Do not
edit any file in it, and do not read docs/notes/, docs/checkpoints.md or the git history. Lesson A
is content/lessons/remember.ts with remember.prose.ts and remember.labels.ts (its learner knows
gates and truth tables and nothing that holds a value). Lesson B is content/lessons/registers.ts
with registers.prose.ts and registers.labels.ts (its learner has done Lesson A and nothing after).
Facts the prose states are pinned in content/lessons/registers.facts.test.ts and
packages/dd-views/src/lesson-facts.test.ts (`npx vitest run <file>`); the circuits are in
packages/dd-model/src/library.ts; the rules are CLAUDE.md and docs/style.md. You may serve the
built site with `npm run preview -w @dd/course -- --port 4184` (background) and look with
Playwright ("/home/user/digital-design/node_modules/playwright/index.mjs"); stop the server after.

For each finding, in both files:
1. Check the quote is on the page or in the lesson's text, exactly.
2. Check the claim. A fact: verify against the data, the facts tests or the simulator. A learner's
   knowledge: check what the lesson that learner has done actually says.
3. Ask whether a fix would make the lesson better for that learner, or only different.
4. Verdict: **upheld**, **in part** (say which part), or **rejected** (say why), with the evidence.
5. Never include a challenge's answer; never rewrite a lesson sentence.

Also mark, for each pair of findings that say the same thing in both files, that they agree
(same lesson, same quote or same point), so the count of independent findings is honest.

Write to docs/notes/comparison/verdicts.md:
one entry per finding keyed by its id (A1, B3, ... prefixed with the review number, e.g. 1-A1,
2-B3), then a table of totals per lesson per review: upheld / in part / rejected, and the number
of findings the two reviews share. Reply "done" with the totals.
