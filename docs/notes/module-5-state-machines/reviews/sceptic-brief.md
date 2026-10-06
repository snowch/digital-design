# Sceptic's brief: attack each finding of a lesson review

A reviewer has read one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer* (repository /home/user/digital-design, branch module-5-state-machines), as its learner
and listed findings. Reviewers over-call. Your job is to attack each finding independently before
anyone acts on it. Do not edit any file. Do not read docs/notes/ (except the review you are given)
or the git history.

For each finding: read the page text it quotes in content/lessons/<id>.ts, <id>.prose.ts and
<id>.labels.ts; check any fact against the facts test (`npx vitest run
content/lessons/<id>.facts.test.ts`), the circuits (packages/dd-model/src/library-module5.ts,
fsm.ts, machines.ts) or the built page (you may serve apps/course/dist with
`npm run preview -w @dd/course -- --port <your port>` and look with Playwright, chromium at
/opt/pw-browsers/chromium; stop the server by its port when done). Check the quote is on the
page. Check the claim against the course's rules (CLAUDE.md, docs/style.md) and against what the
learner has met (the earlier lessons' files).

Give each finding a verdict: **upheld** (right, and worth acting on), **in part** (say which part
stands), or **rejected** (say why: misquoted, factually wrong, a rule misread, a matter of taste
the course's rules do not decide, or already handled elsewhere on the page). Add any finding the
reviewer missed that you find while checking, marked "found".

You cannot write files. Your final message is the verdicts in Markdown, one line or short
paragraph per finding (F1: upheld. ...), then the found ones, then a count. Nothing else.
