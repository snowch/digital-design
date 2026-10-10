# CLAUDE.md

Project instructions for anyone, human or AI, working on this course. They are binding.

## What this is

*Digital Design: From Bits to a Working Computer*: an interactive, browser-based course that
teaches from signals to a working CPU, built on a reusable interactive learning platform. Every
interactive follows one loop, predict, build, run, break, explain, generalise, and one vocabulary,
inspect, predict, step, experiment, break, explain, drill down, replay.

**Status.** The author approved the inventory's ten recommendations at Checkpoint 1. Which
modules have lessons, the list of lessons on the site says: it is worked out from the lessons
themselves. Slice 2, the retry controller, is Module 5's `state-machines` lesson. On 6 October
2026 the course machine passed checkpoint 2 (`docs/machine.md`, `docs/isa.md`), and the first
shared primitives were extracted under the rule of two (`docs/platform.md`); with the schema and
the runtime they then moved to `snowch/learning-platform`, when a second course took them, and
this course takes them as a checked copy in `platform/`. The same day the course passed
checkpoint 3, one instruction added to the CPU end to end (`docs/checkpoints.md`).

Read `docs/plan.md` for the modules, their order and the decisions taken since the course brief,
`docs/machine.md` and `docs/isa.md` for the course machine, `docs/platform.md` for what the
platform shares and what is the course's own, `docs/inventory.md` for why things are as they are,
`docs/simulator.md` for what the engine models, and `docs/authoring.md` for how a lesson is made.
Edit every learner-facing string against `docs/style.md`.

## Where these rules came from

The author's four earlier works set them: `snowch/sizing-and-tco` (the prose process, the style
checklist, the two-half review), `snowch/computer-systems` (originality logged per chapter, the
voice), and the two interactive books `snowch/parquet-book` and `snowch/query-engine-book` (the
interactive UI is a view of the implementation, never a scripted animation; problems are tests;
one check script that is exactly what CI runs). The inventory says which pattern came from where.

## Haiku drafts the prose; you check it

Every string a learner reads goes to a Haiku subagent to draft before it lands: lesson prose,
hints, the diagnostic feedback after a failed test, model-versus-reality notes, labels inside the
interactives. Haiku writes shorter, plainer sentences than a model that has the whole repository
in its head. It also drops facts and gets them wrong. So the work splits four ways:

1. **You write the brief as a list of facts**, not as prose: what the text must say, each point
   checked against the simulator, the lesson data or the code *before* the brief goes out. Haiku
   copies a wrong fact faithfully. Attach `docs/style.md`. A prose brief gets its wording copied.
2. **Haiku writes the sentences, a section at a time.** Briefed sentence by sentence, nobody
   writes the joins, and the page repeats itself where two drafts meet.
3. **You check the facts, and nothing else.** Where a fact is missing, add the fewest words that
   carry it. Do not rewrite Haiku's sentences. If a draft is wrong, send it back with a note.
4. **Then read the whole lesson, start to finish.** This is `docs/style.md`'s second pass, where
   repeats and broken joins show. Cutting a repeat is yours; a join that needs new words goes
   back to Haiku. For this course the second pass also asks whether the interactive showed the
   mechanism the prose claims it shows.

The mechanism here is the Agent tool with `model: "haiku"`. The first draft made in this
repository, the preamble of `docs/style.md`, came back from six facts with one fact wrong (it said
a file exists that Phase 2 will write), two facts dropped (a repository name, a pointer to this
file) and one meaning drifted ("before it is called finished" became "before it finishes"). Each
was fixed by adding words; no sentence was rewritten. Expect that profile every time, and check
for it.

Engineering documents (the inventory, `docs/platform.md`, `docs/simulator.md`, this file) are
written directly, as the author's own repositories write theirs. They still pass the checklist.

## Voice

Direct, precise, British English, active voice, short sentences. The learner is *you*. No
marketing tone, no filler, no "in this lesson we will". No em dashes.

**Say the thing. Do not perform it.** Three habits make a reader extract the point instead of
receiving it: a label where a statement belongs ("that is the whole motivation"); withholding,
then revealing ("the third part is the one that decides"); a roundabout purpose ("the line is
there so that a reader who does not believe this table has somewhere to go"). The test for any
sentence: does it state the point, or make the reader work it out? Headings are different: a
heading is a label, and its test is whether somebody scanning the page can tell what the section
contains.

**Terms are rationed per lesson.** A term arrives because the circuit in front of the learner has
just raised the question that needs it, never as a definition up front. Plain English first, the
term second, and the lesson that introduces a term is the first lesson allowed to use it. Phase 2
writes the list and the test that enforces it, as `tests/test_vocabulary.py` does in Sizing and
TCO. The HDL subset is gated the same way: a construct the learner has not met is rejected with a
plain message, not an elaboration error.

**Length follows the material.** A lesson is as long as what it has to convey and no longer. The
ten sections of the lesson format (question, motivation, prediction, investigation, construction,
failure experiment, explanation, generalisation, challenge, reflection) stay whatever the length.

## Originality

The course covers ground that textbooks cover and must be original work. Do not reproduce,
closely paraphrase or structurally mirror any existing text: not the Hack machine or HDL of
Nand2Tetris, not Harris and Harris's chapter order, examples or exercises, and no named
commercial ISA's mnemonics, encodings or register conventions. If you notice you are
reconstructing a known sequence or a well-known worked example, stop and design a different one.
The feeling of "this is the standard way to present this" is the signal, not the permission.
Standard gate symbols and truth tables are fine. Every lesson carries an `originalityNote` in its
data: the obvious textbook example for its topic and how this lesson's example differs. It is
written in the same commit as the lesson, and a test fails a lesson without one.

## Reviewing a lesson

A review has two halves, and the test suite does neither on its own.

- **The mechanical half** walks the published page in a browser at phone, tablet and desktop
  widths and in the dark theme, presses every control, moves every input to both ends of its
  range, runs every challenge with the shipped stub and with plausible wrong attempts, and writes
  down what broke: console errors, a table column a phone hides, a control with no accessible
  name, text below the contrast a reader needs, wording that assumes a mouse. Sizing and TCO's
  `scripts/review-pages.py` is the model; in this course most of it lives in the Playwright
  educational suite and the rest in a review script Phase 2 writes.
- **The reading half** gives each lesson to its own reviewer with a written brief, as the
  `editorial-review` skill in Sizing and TCO does. The reviewer reads as a learner who has done
  every earlier lesson and none after; every finding quotes the page; a finding suggests a
  direction and never rewrites; a number or a cross-reference is checked before it is asserted; a
  review never contains a challenge's answer. Reviewers over-call, so each finding is attacked by
  an independent sceptic before it is acted on. A model cannot audit itself: the findings that
  matter most are about your own recent edits.

After a review, fixes to code come first, then fact briefs per finding go to Haiku, then the
whole lesson is read once more.

## What no check can catch

Each of these was published in one of the author's books and found only by a slow reread. Read
for them before calling a lesson finished:

- a claim about the repository's own state ("every lesson has a test"), which rots silently;
  if the repository can compute it, generate it;
- a word that means two things on one page (*state*, *input*, *cycle*, *level*, *edge*);
- a definite article in front of a noun the lesson has not introduced;
- a term doing work before it is defined;
- a table or a signal list nobody chose for this lesson, rendered because the component had it;
- an idea that is a shape (a path through a program, words laid out in memory, parts and the
  joins between them, a run over time) carried only in a table or in sentences. A table beside a
  drawing can index it; a table in its place cannot. Modules 11 and 12 shipped their lists, their
  stack and a trap's crossing that way, and their reviews passed them;
- the same argument made twice, far apart;
- a number spelled as a word that the simulator did not produce.

## Things that will break the build

`npm run check` is exactly what CI runs (`scripts/check.sh`): Prettier, the copyright line, the
platform copy, `tsc --noEmit`, Vitest, the Vite build, Playwright. Each line below is a check and
the reason it exists.

- **Prettier, with `*.md` ignored.** Prose files keep their own line breaks; code does not get a
  style argument.
- **Every source file carries its author's copyright line** ("Copyright © 2026 Christopher Snow")
  near its top, and every page carries it in its footer. `node scripts/copyright.mjs --check` fails
  a file without it, or with an older wording; `node scripts/copyright.mjs` adds the line, or puts
  it in place of the older one, so run it on a new file.
- **The platform copy is unedited.** `platform/` is `snowch/learning-platform`'s packages at the
  commit `platform/SOURCE.json` records; `node scripts/sync-platform.mjs --check` fails if a file
  there differs. Change the platform in its own repository, then sync.
- **`tsc` strict, with `noUncheckedIndexedAccess` and `verbatimModuleSyntax`.** An index into a
  list may be undefined and the code must say what happens then.
- **A lesson without an `originalityNote`, or with its sections out of order, or with a
  challenge nobody mounts, fails to parse.** The schema is the contract; the content tests parse
  every lesson at startup and in CI.
- **The term gate.** A lesson that uses a rationed term before the lesson that introduces it
  fails `termProblems`, unless it lists the word under `termExemptions` with a reason.
- **Every challenge's reference solution must pass its own tests, and its starting point must
  not.** Otherwise the tests prove nothing about the challenge.
- **The whole lesson must render in jsdom with no figure problem.** A figure whose props do not
  fit its schema, or whose kind the book lacks, says so on the page and fails this test.
- **The lesson's stated numbers are pinned.** `packages/dd-views/src/lesson-facts.test.ts` and
  `packages/dd-model/src/timing.test.ts` hold the settle counts and the capture map the prose
  states; change the model and the prose must change with it.
- **The Playwright suite drives the built site at desktop and phone widths.** Completable with
  the reference, rejects a wrong answer, keyboard-buildable, re-verified on load, not bypassable
  through storage, resettable, deterministic. A missing accessible name on a control breaks it.
- **No label in any diagram may overlap another or leave its drawing**, at either width, before
  or after the figures are used (`tests/educational/diagrams.spec.ts`). A timing diagram whose
  axis labels collide, or a block whose name sits on its port names, fails a learner however
  right its data; the test measures the rendered text, so a new figure is checked the day it
  lands.
- **No wire in a circuit drawing may mislead.** A wire may not enter a gate outside its drawn
  body or leave it off its output lead, step up or down by less than a grid cell where it could
  run straight, pass through a part or a part's label or name, run along another signal's wire,
  or leave its drawing, where it is cut off and seems to end
  (`tests/educational/diagrams.spec.ts` in the browser; the content tests for every figure's
  circuit, under every fault, and inside every block a learner can open). A wire through a part
  reads as a connection that is not there; `docs/notes/straight-wires.md` says how the geometry
  and the router keep to this. In every drawing as first shown, two signals may not run side by side
  closer than half a cell, which reads as one thick line, nor two wires cross that leave one column
  and enter another in the same order, nor any wire touch a written value; the first two hold under
  every fault as well (the same tests; `docs/notes/roomy-wires.md`).
- **The look of the page is held to rules and to screenshots**
  (`tests/educational/aesthetics.spec.ts`). No visible text under 11 pixels on the page as it
  loads (a large drawing a learner zooms out shows its words smaller, down to 0.6 of their size,
  then hides them; `docs/notes/overview-strip.md`), every control at
  least 40 pixels tall on a phone, no line of prose over about 85 characters; and the lesson
  header and the figures the test names must match their stored screenshots, at both widths. The typefaces
  ship with the site (Source Sans 3 for prose, Archivo for headings, JetBrains Mono for values
  and code) so the same commit renders the same everywhere. A change that alters a figure's look
  fails here until its baseline is updated on purpose with `npx playwright test
  --update-snapshots=all` for that figure's test (plain `--update-snapshots` skips a change
  inside the 2% tolerance), and the diff is reviewed in the commit. `tokens.css` says why the faces,
  the neutrals and the radii are what they are; a new component takes its colours and sizes
  from there.
- **`.npmrc` sets `legacy-peer-deps`.** npm 10's peer resolution crashes on Vitest 4's peer
  ranges; the flag is the workaround and the file says so. Cross-workspace `@dd/*` dependencies
  are not declared in manifests: npm links every workspace into the root `node_modules`, the
  platform's `@platform/*` packages in `platform/` too.
- **Vitest 4 has no `basic` reporter and its console capture is unreliable.** An exploration
  writes its output to a file; a test asserts, it does not print.
- **Learner-facing strings live in `strings.ts` files and in `remember.prose.ts` and
  `remember.labels.ts`.** A string typed into a component is a string that skipped the prose
  process, and the review reads for it.
