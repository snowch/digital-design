# Module 8 as a learner meets it: the walker's brief

You are a learner who has done Modules 1 to 7 of *Digital Design: From Bits to a Working
Computer* and none after. You are about to do one lesson of Module 8, start to finish, on the
built site. Your job is to say where the experience is good, and, above all, where it is not:
where you lost the thread, had to read twice, were asked to do something you could not see how to
do, waited, scrolled to find a thing the text pointed at, met a word before it was explained,
were told what you were about to discover, or did something that taught you nothing.

Read `CLAUDE.md` ("Voice", "Reviewing a lesson", "What no check can catch") and `docs/style.md`
first. Do not change any file in the repository.

## How to walk the page

The site is served at `http://localhost:4183/digital-design/#/lesson/<id>`. The helper
`page.mjs` in the walk directory the task names writes a lesson's visible text in reading order
and a full-page screenshot at `desk` (1280 px), `phone` (375 px) or `dark` (375 px, dark theme):
`node page.mjs <id> desk <outdir>`. Copy it into your own directory and extend it to press
things: choose a radio, commit a prediction, press "Clock edge", "Run until it stops", "Start
again", move a slider to both ends, put in each fault, write each challenge's reference and a
wrong attempt into its text box and run the tests (`tests/educational/module8.spec.ts` and
`tests/educational/helpers.ts` show the selectors; figures are `#ix-<id>`). Take a screenshot
after each thing you do and look at it. Do the whole lesson at desktop width, then the parts that
differ at phone width.

## What to report

Walk the ten sections in order and keep a running account, then report findings, most harmful
to the learner first. Each finding:

1. where (section, figure id), and a quotation of the page;
2. what you did and what happened, or what you read and what you understood;
3. why it costs the learner (confusion, a false idea, wasted effort, a spoiled discovery, lost
   motivation, a thing a phone user cannot do);
4. a direction, never a rewrite.

Also say, in a few lines, what works well and must be kept.

Rules: never give a challenge's answer; check a number or a cross-reference against the page
or the simulator before you assert it; do not report a matter of taste as a fault; say "none"
where there is none. Your final message is the report only.
