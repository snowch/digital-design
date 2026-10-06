# The reading review of Module 8's focused figures: the reviewer's brief

You review one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, as a learner who has done every earlier lesson and none after. Five figures were just
added to Module 8's lessons; your lesson has one or two of them. Read `CLAUDE.md` ("Reviewing a
lesson", "What no check can catch") and `docs/style.md` first.

The lesson's data is `content/lessons/<id>.ts`; its words are `<id>.prose.ts` and
`<id>.labels.ts`; the figures' own labels are `machine8` in `packages/dd-views/src/strings.ts`;
the figures are `packages/dd-views/src/interactives/MachineFigures.tsx`, reading facts from
`packages/dd-model/src/machine-figures.ts`. Screenshots of each new figure at 1280 px, at 375 px
and at 375 px in the dark theme are in the directory the task names (`desk-<id>.png`,
`phone-<id>.png`, `dark-<id>.png`). Read the whole lesson in its section order, not only the new
figure.

Answer two questions, and report anything else a learner would trip on near the new figures:

1. Is every idea on this page shown in a figure where a picture helps the learner? Name an idea
   still carried only in words that a picture would teach better, and say why; or say there is
   none.
2. Does each new figure show what its caption, its lead, its after-text and the prose around it
   say it shows? Quote any sentence the figure does not bear out.

Rules: every finding quotes the page; a finding suggests a direction and never rewrites; check a
number or a cross-reference before you assert it; never give a challenge's answer; do not change
any file. Report each finding as a numbered item: the quotation, what is wrong, why it matters to
the learner, the direction. Rank the findings, most harmful first. Say "none" where there is none.
