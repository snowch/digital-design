# Reviewer's brief: one lesson of Module 5, read as its learner

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, in the repository at /home/user/digital-design (branch module-5-state-machines,
checked out). Do not edit any file. Do not read docs/notes/ or the git history: they say how the
lessons were made and must not colour the reading. Read only what a learner meets, plus the data
behind it.

Your lesson is given in the message that sent you this brief: its id, its files
(content/lessons/<id>.ts, <id>.prose.ts, <id>.labels.ts) and the lessons the learner has done.
The learner has done Modules 1 to 4 and the lessons of Module 5 before yours, and nothing after.
You may read the earlier lessons' files to know what the learner has met.

The site is built at apps/course/dist. Serve it with
`npm run preview -w @dd/course -- --port <your port>` (from /home/user/digital-design, in the
background; your port is in the message) and walk it with Playwright (`node` with
"/home/user/digital-design/node_modules/playwright/index.mjs", chromium at
`/opt/pw-browsers/chromium` via `executablePath`, the lesson at
`http://localhost:<port>/digital-design/#/lesson/<id>`), at 1280 and 375 pixels wide: screenshot
every figure, press its controls, commit its predictions. Stop the server when you finish (kill
it by its port, never with a pattern that matches your own command line). Facts the prose states
are pinned by content/lessons/<id>.facts.test.ts; run `npx vitest run <file>` to check. The
circuits are in packages/dd-model/src/library-module5.ts, fsm.ts and machines.ts. The course's
rules are CLAUDE.md ("Voice", "Terms are rationed", "What no check can catch") and
docs/style.md.

## What to look for

1. A term used before the lesson explains it; a definite article before something not yet
   introduced; a step the page skips; anything this learner could not follow.
2. Prose that the figure beside it does not show, or shows differently: the interactive must
   show the mechanism the prose claims.
3. Facts: a number, value, label, button name or step name the prose states that the figure, the
   data or the page does not produce. Check before you assert; if you cannot check, say so.
4. A word that means two things on one page (state, code, step, input, reset, hold, keep, load,
   edge, X).
5. The same argument made twice far apart; a paragraph answering two questions; a join that does
   not follow; a label where a statement belongs; a withheld point; filler.
6. The arc: is the question answered; does each figure earn its place; does the predict, build,
   run, break, explain, generalise loop hold; could a learner do each challenge from the lesson
   alone (without the hints), and do the hints climb one rung at a time. Does any text a learner
   sees before committing a prediction give its answer away?
7. Originality: does the lesson's example feel like a textbook's standard one, or its own.
8. Labels, captions, titles: do they say what the section or figure contains.
9. The look: anything cut off, overlapping, unreadable, or hard to use on a phone.

## Rules for every finding

- Quote the page exactly; say which section, which figure or key.
- Suggest a direction; never rewrite the sentence yourself.
- Check every number or cross-reference before asserting it.
- Never include a challenge's answer, or any part of it.
- Give a category (term, fact, figure, double meaning, repeat, style, arc, originality, label,
  look), a severity (high: a learner is misled or stuck; medium: a learner stumbles; low:
  polish), and how sure you are.

## Output

You cannot write files. Your final message is the review itself, in Markdown: a numbered list
of findings (F1, F2, ...) in the form above, then "## Overall" in no more than 120 words. Nothing
else.
