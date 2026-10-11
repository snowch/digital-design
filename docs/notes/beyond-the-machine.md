# Beyond the machine: the compiler and the kernel

The build's note for the two optional chapters. The plan is `docs/notes/beyond-the-machine-plan.md`;
the briefs, the drafts and each lesson's fixes to its drafts are in `docs/notes/beyond-the-machine/`.

## The lessons

| Lesson | Question | Introduces | Challenges |
| --- | --- | --- | --- |
| `compiler` (module 14, order 1) | Can a program write the instructions for a line you write? | compiler | Being the compiler: a program, graded by six runs |
| `kernel` (module 14, order 2) | How can one machine run two programs at once? | kernel | The save areas, worked out (answers); Two programs, set up (a program, three runs) |

Both are flagged `optional`, list their `prerequisites` (the compiler 10.3, 11.1 and 13.2; the
kernel 12.4, 12.5 and 12.8), and point on to *Systems From Scratch* in their reflections only, at
addresses checked by hand on 10 October 2026 against the published book (each returned its
chapter's page) and pinned in each facts test.

## Ideas that are shapes, and the figures that draw them

| Lesson | The idea | The figure |
| --- | --- | --- |
| `compiler` | a line taken apart piece by piece, each piece becoming instructions | `compile-steps`: the line as written and as it stands, the piece marked, the listing growing; an instruction pressed marks the piece it came from |
| `compiler` | a comparison followed down to the gates | `machine-levels` on `machine-final`, the condition block open at the branch's ALU edge |
| `kernel` | two programs taking turns through the kernel | the debugger's lanes, and `trap-timeline`'s lanes over the first switches |
| `kernel` | a program's words in a save area | the debugger's memory regions: `480` and `488`, then each save area as boxes |

## What was built, reused and changed

- **The platform**: the copy synced to `snowch/learning-platform` 9ab98e9, which adds the schema's
  `optional`.
- **The shell** (`apps/course`): optional lessons leave the module lines; one line, "Beyond the
  machine", follows the five stages; the way in and the pager name a chapter by that line
  (`placeOf`); after the last chapter the pager says the course ends. The page without scripts gains
  the line. Tested with a fixture chapter. Cover words: brief C7.
- **The compiler** (`packages/dd-model/src/compile.ts`): new, built as the lesson shows it, rewriting
  the line in place by five rules; `runCompiled` runs its output. `compile.test.ts` pins its output.
- **`compile-steps`** (`packages/dd-views/src/interactives/CompileSteps.tsx`): new, with its test.
  Its listing shows addresses and no words, unlike the plan's section 6: the investigation comes
  before the construction, which asks for the branch's word.
- **Strings**: `strings14.ts` (`beyond`), joined to the view strings; the construction's three
  `exact` sentences in `answers.details`. `ProgramEditor.tsx` reads a program challenge's detail
  and end sentences from `beyond` after Module 11's and Module 12's.
- **Programs**: `content/lessons/beyond.ts` holds both chapters' lines and programs, the kernel,
  its starts and the challenge's runs.
- **Reused unchanged**: the machine and its model, the assembler, the debugger, `trap-timeline`,
  `machine-levels`, `program-compare`, the program grader and the `exact` grader. `trap-timeline`'s
  limit of 400 edges holds the first switches; it was not lifted.
- **Edits to files on `main`**: `docs/plan.md` (point 5 done), `docs/platform.md` (the flag),
  `docs/authoring.md` (`compile-steps` and the sixteen kinds its table lacked),
  `content/lessons/index.ts`, `dd-model/src/index.ts`, `dd-views/src/index.ts`, `interactives/index.ts`,
  `strings.ts` (both), `course.css` and `app.css`, `LessonList.tsx`, `LessonPager.tsx`,
  `static-page.ts`, their tests and `tests/educational/pager.spec.ts`. Two Module 13 facts tests
  got a minute per test (`whole-machine`, `full-path`), as `d014187` gave `module13.test.ts`.

## Terms and words

- "compiler" (14.1) and "kernel" (14.2), each in its motivation. No `termExemptions`: no earlier
  lesson uses either. The cover's term test bans both.
- Not used: process, operating system, scheduler, context switch, time slice, token, parse, syntax,
  variable, label. The fact sheets list each page's working words (piece, rule, turn over; switch,
  turn, save and put back, save area, count, record).

## The numbers each lesson states

All are pinned in `compile.test.ts`, `compiler.facts.test.ts` and `kernel.facts.test.ts`.

- Compiler: the gap line 4 instructions and `stop`, 66; the CLASH line 7 and `stop`, dark at 66,
  lit at 150; the words, the branch `56340003`; both lines 12 instructions, 10 run, against
  Module 0's 9 and 7; every piece in R1 shows 0 for both pairs; on `machine-final` 22 edges, the
  branch's FETCH edge 19, its ALU edge 21, MET 1 before it, HR -34 and the PC `01C` at it.
- Kernel: 12.8's runner shows the gap 94 times and writes no record; at 80, 53 timer interrupts
  and 65 gaps in 5,000 instructions, the report's 2 at `640`, ALARM, record 0; the first interrupt
  after 97 at `goto gap`, stored at `588`; the third after 289 with R5 at -184; R5 -184 again after
  455 steps; a switch of 60 (9 and 51), a turn of 29; at 40, 83 interrupts and no gap; 51 the
  same, 52 not; the construction's `210`, `608`, `10`, at a moment no figure's run reaches.

## What the build would change

- The kernel's construction asks for R13's address, which the investigation's memory region shows
  for any moment. The plan accepted it; a review may ask for a word whose value, not place, must be
  worked out.
- The plan's risk 13 (the assembler's sentence for a job on two names) is not made here.
