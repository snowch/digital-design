# Reviewer's brief: two lessons, read as a learner

You are reviewing two lessons of an interactive course, *Digital Design: From Bits to a Working
Computer*, in the repository at /home/user/digital-design (branch module-5-registers-b, already
checked out). Do not edit any file in it. Do not read docs/notes/, docs/checkpoints.md or the git
history: they would tell you things about how the lessons were made that must not colour the
reading. Read only what a learner meets, plus the data behind it.

- Lesson A: id `remember`, "How does a circuit remember?" (content/lessons/remember.ts,
  remember.prose.ts, remember.labels.ts). Read it as a learner who knows gates and truth tables
  and nothing that holds a value, and who has done no earlier lesson of this course.
- Lesson B: id `registers`, "How does a circuit keep several bits together?"
  (content/lessons/registers.ts, registers.prose.ts, registers.labels.ts). Read it as a learner
  who has done Lesson A and nothing after it.

The site is built at apps/course/dist. You may serve it with
`npm run preview -w @dd/course -- --port 4181` (from /home/user/digital-design, in the
background) and walk it with Playwright (`node` with
"/home/user/digital-design/node_modules/playwright/index.mjs", chromium, the lesson at
`http://localhost:4181/digital-design/#/lesson/<id>`), at 1280 and 375 pixels wide, to see every
figure as the learner sees it. Stop the server when you finish. Facts the prose states are
pinned by content/lessons/registers.facts.test.ts and packages/dd-views/src/lesson-facts.test.ts;
run a test with `npx vitest run <file>` to check a number before asserting it. The circuits are
in packages/dd-model/src/library.ts. The course's rules are CLAUDE.md ("Voice", "Terms are
rationed", "What no check can catch") and docs/style.md.

## What to look for, in both lessons, with the same care

1. A term used before the lesson explains it; a definite article before something not yet
   introduced; a step the page skips; anything the learner described above could not follow.
2. Prose that the figure beside it does not show, or shows differently: the course's rule is
   that the interactive shows the mechanism the prose claims.
3. Facts: a number, value, label, step name or button name the prose states that the figure, the
   data or the page does not produce. Check before you assert; if you cannot check, say so.
4. A word that means two things on one page (reset, hold, keep, load, edge, step, input, X).
5. The same argument made twice far apart; a paragraph answering two questions; a join that does
   not follow; a label where a statement belongs; a withheld point; filler.
6. The arc: is the question answered; does each figure earn its place; does the predict, build,
   run, break, explain, generalise loop hold; could a learner do each challenge from the lesson
   alone (without the hints), and do the hints climb one rung at a time.
7. Originality: does the lesson's example feel like a textbook's standard one, or its own.
8. Labels, captions, titles: do they say what the section or figure contains.

## Rules for every finding

- Quote the page exactly. Say which lesson (A or B), which section, which figure or key.
- Suggest a direction; never rewrite the sentence yourself.
- Check every number or cross-reference before asserting it.
- Never include a challenge's answer, or any part of it.
- Give a category (term, fact, figure, double meaning, repeat, style, arc, originality, label), a
  severity (high: a learner is misled or stuck; medium: a learner stumbles; low: polish), and how
  sure you are.

## Output

Write to docs/notes/comparison/review-N.md a file with two sections, "## Lesson A" and "## Lesson B", each a numbered
list of findings (A1, A2, ... and B1, B2, ...) in the form above, then a short "## Comparison"
of no more than 150 words: which lesson reads better for its learner and why, in your judgement,
naming the two or three things that decide it. Reply "done" with the counts per lesson.
