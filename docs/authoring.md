# Writing a lesson

How a lesson is made, from the data format to the review. The first lesson,
`content/lessons/remember.ts`, is the worked example; copy its shape.

## A lesson is data

A lesson is one module in `content/lessons/` exporting a `LessonInput` (the type is
`packages/lesson-schema`), listed in `content/lessons/index.ts`. It has:

- `id`: a lowercase slug, its identity everywhere; `title`; `module` and `order`.
- `objectives`: what the learner can do afterwards, each starting with a verb.
- `introduces`: the rationed terms this lesson is the first to use. The term gate
  (`termProblems`) fails any earlier lesson that uses one of them; `termExemptions` lists a word
  used in another sense, with the reason.
- `sections`: exactly ten, in the course's order: question, motivation, prediction,
  investigation, construction, failureExperiment, explanation, generalisation, challenge,
  reflection. Each has a title, Markdown `prose` shown first, and `interactives`.
- An interactive has an `id` (unique in the lesson), a `kind` the book's registry knows, a
  `timeModel` (`settle`, `clocked`, `delay`, `none`), a `caption`,
  `props` the kind's schema checks, and optional `lead` and `after` Markdown shown above and below
  the figure. The kind `challenge` with `props.challengeId` mounts a challenge.
- A figure that runs the simulator shows its time model on a badge ("Stepped", "Clocked", "Gate
  delays"), and pressing the badge shows that model's note, the book's `timeModelNotes`, under
  the caption, so a reader learns the rules where the figure is. A figure with `timeModel: "none"`
  shows no badge: a label saying what a figure is not tells the reader nothing. Prose need not
  explain the badges; it may name the model a figure runs where that matters to the argument.
- `challenges`: each with a `title`, a Markdown `task`, `gradedDirection` (`draw`, `write` or
  `answer`),
  the `interface` (input and output names), the `palette` a drawn solution may use, the
  `allowedConstructs` text may use, `tests` (a combinational table or a sequence), five `hints` in
  ladder order (concept, mistake class, smaller example, part of the answer, whole answer), an
  optional `initial` artifact, and a `reference` solution: text, a drawn circuit, or a library id.
  An `answer` challenge has no circuit: it declares `fields` (a number with a unit, a row of bits,
  a short text), tests of kind `answers` that name a grader the book supplies
  (`ANSWER_GRADERS` in `packages/dd-model/src/graders.ts`) and list cases (`label`, `given`,
  `expect`), and a reference of `answers` by field id. A failure names the case, the answers'
  values and what was expected; the runner, the hints, the re-grading on load and the reset are
  the same as for a circuit.
- `modelVsReality`: how the simulator differs from hardware, said once.
- `originalityNote`: the obvious textbook example for the topic and how this lesson differs.
  Written in the same commit as the lesson; the schema refuses a lesson without one.

Keep the words out of the structure file: `remember.prose.ts` holds every paragraph, keyed by
where it sits, and `remember.labels.ts` holds titles, objectives, captions and labels.

## The interactives

The registry is `packages/dd-views/src/interactives/index.ts`. Each kind parses its props with a
zod schema and shows a sentence in its place when they do not fit. Library ids are the keys of
`LIBRARY` in `packages/dd-model/src/library.ts`.

| kind | props | what it does |
| --- | --- | --- |
| `circuit-explorer` | `libraryId`, `clock?`, `showSteps?`, `truthTable?` (`sr-latch`, `d-latch`, `d-flip-flop`, `register-bit`), `scope?`, `releaseAll?` (offer "Release all at once") | the circuit running live: press inputs, clock it, scrub the settling steps, see the reference table's row |
| `prediction` | `question`, `libraryId`, `run` (steps), `watch`, `options`, `explain?`, `signals?` | commit to a value before the simulator runs the script and answers |
| `truth-table` | `table?` or `libraryId?`, `caption?` | a reference table, or a small circuit enumerated by the simulator |
| `fault-lab` | `libraryId`, `faults` (broken-wire, inverted, stuck-at, wrong-gate, each with an optional label), `run`, `scope?`, `releaseAll?` | apply a fault, press the inputs, run checks whose expectations are the healthy circuit's own behaviour |
| `latch-internals` | `libraryId?`, `delay?`, `script`, `until`, `signals?`, `scope?`, `phases` | a recorded delay-model run with a cursor, a drawing that opens, and the lesson's words per phase |
| `setup-hold` | `delay?`, `edgeAt?`, `offsets?`, `window?`, `settleBetween?`, `undecidedFrom?`, `show?` | move D against the edge; roll the overlay inside the untrusted window; replay a roll |
| `circuit-text` | `libraryId`, `drawing?` | the circuit beside the text generated from it |
| `signal-path` | `recording`, `labels` (the lesson's names for the rooms, the parts and the cable, the strip's title, and what a screen reader is told) | the setup a signal travels through, drawn: sender, cable past a noise source, receiver; under it, the steps the sender drives, from the model |
| `noisy-signal` | `recordings` (id and label), `threshold?`, `range?`, `step?`, `noise?`, `showBand?`, `reading?` | a sampled recording read against a threshold the learner moves; how many samples read wrong, the nearest sample on each side, optionally the noise scaled up, the band of thresholds that read every sample, the bits as a number |
| `bit-inspector` | `bits`, `readings` (`unsigned`, `signed`, `hex`), `weights?` | a word of bits to change one at a time, read several ways at once, with the sum that gives each number |
| `interpretations` | `words` (bits and label), `readings` (two or more of `unsigned`, `signed`, `hex`, `lamps`) | one word read one way at a time, with the rule that gives the reading |
| `reading-prediction` | `question`, `ask` (`fewer-wrong` over a recording and two thresholds, or `reading` of a word), `options`, `explain?` | commit to an answer before the model computes it |
| `challenge` | `challengeId` | the runtime's challenge runner with the book's editor |

A figure is a view of the simulator. If a lesson needs a figure that shows something the
simulator does not compute, the simulator is where the work goes first.

## The prose process

Every string a learner reads is drafted by a Haiku subagent from a brief of facts and checked by
you; CLAUDE.md states the rule and the division of labour. In practice, for one lesson:

1. Write the facts first and check each against the simulator. The first lesson's facts are
   pinned in `packages/dd-views/src/lesson-facts.test.ts`: the settle counts, what each fault
   does, the capture map. A number in prose that the simulator did not produce is the commonest
   error.
2. Write one shared fact sheet for the lesson (the circuits, what the simulator does with each,
   the rationed terms and where each is introduced, the words to avoid) and one brief per group
   of sections, each listing the facts in order, where each figure sits, and how long the section
   is. Attach `docs/style.md`.
   - The fact sheet also lists the lesson's **working words**, each with its one meaning on this
     page: the everyday words the lesson leans on, not only the rationed terms. Drafts copy the
     fact sheet's wording, so a word it uses in two senses comes back in two senses on the page.
     The signals lesson's fact sheet used "reading" for the sensor's temperature and for a way of
     reading bits, and "value" for a bit and for what its place is worth; both reached the page
     and cost a second round of every brief. The first fix pass's list for the circuit lessons:
     *keep* for a value that stays, *press* and *release* for a button, *take* for what a
     flip-flop does at the edge, *step* for the stepped model's step and nothing else.
   - The banned list includes every term a *later* lesson introduces: the term gate counts an
     earlier lesson's use of it as a failure. Scan the briefs themselves for the banned words
     before they go out; a brief that uses one gets it copied.
3. Run the drafts in parallel, then check facts only: a dropped fact gets the fewest words that
   carry it; a wrong fact or a vocabulary slip goes back with a note; nothing is rewritten.
4. Place the paragraphs: section `prose`, a figure's `lead`, a figure's `after`. A figure's
   `lead` and `after` show from the start, so under a prediction they must not give its answer:
   what follows from the answer goes in the prediction's `explain`, which shows once the learner
   commits. The content tests fail a word prediction whose lead, question or after states it.
5. Read the whole lesson once, start to finish, and give it to a reviewer with a brief (see
   CLAUDE.md, "Reviewing a lesson"). Fix code first, then re-brief the sentences a finding
   touches, then read once more.

The runtime's and the views' own labels went through the same process; they live in
`packages/lesson-runtime/src/strings.ts` and `packages/dd-views/src/strings.ts`.

## What the tests hold a lesson to

`npm run check` is exactly what CI runs: Prettier, `tsc`, Vitest, the build, Playwright.

- The schema: ten sections in order, five hints, a reference solution, an originality note, test
  ports that the interface declares, every challenge mounted.
- The term gate across lessons.
- `content/lessons/lessons.test.tsx`: every challenge's reference passes its tests and its
  starting point does not; every figure's kind exists; the whole lesson renders with no figure
  problem; plausible wrong attempts fail with a diagnosis naming the gate.
- `tests/educational/lesson.spec.ts`, in a browser at desktop and phone widths: every lesson
  renders whole with no console error and no horizontal scroll; every challenge is completable
  through the page with its reference and rejects a wrong attempt; a drawn challenge can be built
  with the keyboard; saved work is graded again on load and a saved mark earns nothing; a reset
  clears the work; hints come one rung at a time; a prediction commits before the answer; the
  overlay's roll replays identically.
- `tests/educational/diagrams.spec.ts`: no text label in any timing diagram or circuit drawing
  overlaps another or leaves its drawing, at both widths, before and after the figures are used.
  Diagrams are what a learner looks at longest; a figure can be right in every number and still
  fail here.
- `tests/educational/aesthetics.spec.ts`: the look of the page, as rules and as screenshots. No
  visible text under 11 pixels, every control at least 40 pixels tall on a phone, no line of
  prose over about 85 characters; and the lesson header and four figures must match their stored
  screenshots at both widths. The typefaces ship with the site, so the screenshots are the same
  on every machine. A change to a figure's look fails until its baseline is updated on purpose
  and the new image is looked at before it is committed. Update the figure you changed with
  `npx playwright test -g "<its test>" --update-snapshots=all`: plain `--update-snapshots`
  rewrites only a baseline that fails, and a fix smaller than the test's 2% tolerance leaves the
  old image as the record.
- `tests/educational/lesson.spec.ts` also uses every figure of every lesson (commits each
  prediction, moves each slider to both ends) and then measures the page against the viewport.
  A figure that widens the page only once it is used passes every check made on a fresh page.

A commit carries the tests for the code it changes, so that every commit passes the check on
its own.

A lesson that needs a new figure adds the figure's props schema and its test with it, and a
facts test for any number its prose will state.
