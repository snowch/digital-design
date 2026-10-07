# Module 0, meet the machine: the plan

Written by the managing session before the build started, as Modules 8 and 9's were. The build
reads it first and keeps to it. A change to this plan is the managing session's to make; a build
that needs one says so in its module note and carries on inside the plan. `docs/plan.md` is the
course plan the module comes from, and `docs/machine.md` and `docs/isa.md` are the machine it
shows.

## What the module covers

From `docs/plan.md`: what a computer does, the abstraction ladder, and using the lab. Labs: run a
tiny program, pause it, look at what the machine keeps (its place in the program, its sixteen
numbers, its memory), and click into its drawing. Capstone: trace one step of a program to the
changes it makes. It reuses nothing: it shows the machine the course builds, finished, before the
learner builds any of it.

The preface's note (`docs/notes/preface.md`) says Module 0 "runs a program on the finished
computer and so cannot be written until the computer exists". It exists now: Module 8's machine
runs the shop's programs, one instruction an edge, and Module 9's runs them in several edges.
Module 0 uses Module 8's machine, the `datapath-full` stage, so one press runs one line of the
program.

A module may be more than one lesson. Size each lesson like the existing ones and split where the
material needs it; say in the note why the split falls where it does. Every lesson has the ten
sections. The lessons are module 0, order 1 onward.

## The learner

Has done nothing in the course. The preface assumes binary to decimal and back and everyday
arithmetic, and nothing about electronics, circuits or programming. Module 0 is the first lesson
on the site: once it lands, the cover's way in names it (`ordered[0]` in `LessonList.tsx`).

**Every word Module 0 writes is held to the term gate against every rationed term.** It comes
before every lesson, so it may use no word a later lesson introduces: today every `introduces`
list in Modules 1 to 9, and Module 10's, built at the same time (below). In practice it says:

| Not | But, for example |
| --- | --- |
| instruction | a line of the program, a step |
| register, register file | the sixteen numbers the machine keeps, named R0 to R15 |
| program counter, fetch | the line it will run next |
| ALU, adder, gate (as terms) | the part that adds and compares; the smallest parts |
| RAM, ROM, address, memory-mapped | memory; where a number is kept |
| bit, binary, word, hexadecimal | a number; 1s and 0s; digits |
| threshold, edge, signed | high and low voltage; a press of the clock button |

The gate scans a lesson's prose, captions, leads, notes, the strings inside its figures' props,
and its challenges. It does not scan a figure's own strings, which live in `strings.ts` files. So
**every string a Module 0 figure shows is held to the gate by a test of its own**, as the cover's
are (`apps/course`'s cover test uses `termPattern`). A label is a word too.

The machine's drawings carry their parts' names (ALU, IR, the selectors), which are the
circuit's, not Module 0's. A drawing may show them; the lesson's words never lean on one. Where a
name of the machine's is the thing the learner must use (R0 to R15), the lesson introduces it in
plain words first. Prefer "the line it runs next" to the label PC, which stands for a term Module
8 introduces.

Module 1 opens with "A temperature sensor in a shop's freezer room", standalone. A learner coming
from Module 0 has met the shop; the opening still reads well as a zoom into one cable, so Module 1
does not change. If the build finds a line of Module 1 that now repeats Module 0, it says so in
the note and leaves the lesson as it is; the managing session decides.

## What Module 0 builds

- **A view of the running machine for a beginner.** Module 8's machine in the simulator, at 64
  bits, shown as a learner with no terms can read it:
  - the program as numbered lines in plain words ("R3 becomes R1 plus R2", "show R2 on the
    display", "if R2 is less than R3, go to line 5"), each generated from the instruction by a
    function in `dd-model` and tested against the assembler for every kind and job the module's
    programs use, with each line's stored number beside it, so the learner sees that a program is
    numbers kept in memory;
  - the line it runs next, marked;
  - the numbers the program uses, R0 to R15 by name, with the ones the last step changed marked;
  - the shop's devices: the office display, the lamps, DOOR and WARM, and the two rooms'
    readings, which the learner sets;
  - controls to run one step, run until it stops, pause, and start again.

  Every value is read off the simulator's nets, as every view in the course is. The plain-words
  lines are templates in a strings file, drafted like every other string. Module 8's
  `DatapathFigure` has most of the machinery (a program, registers, devices, run, step, a
  prediction of the next edge, faults); its own strings are full of terms. Reuse it with strings
  of Module 0's own, or build a figure of Module 0's own on the same model functions: the build's
  choice, said in the note.
- **The ladder, one level at a time.** From a line of the program down to the voltage on one wire:
  the shop and its machine; the machine's parts (the real drawing, with the overview strip a large
  drawing has); the part that adds, opened; one slice of it; the gates inside; one wire, high or
  low. Each level is the real circuit, opened as the course opens every block, with a caption of
  Module 0's own and the module that builds that level, by its name on the cover
  (`STRINGS.moduleNames`, already held to the gate). The learner sees one number at every level:
  the number a part gives at the top is the 1s and 0s on its wires at the bottom.
- **A fault from the bottom seen at the top.** One wire stuck deep inside the part that adds, and
  the shop's display shows a wrong number: the levels are one machine. Module 8's figure takes
  faults; the managing session recommends this as the module's failure experiment.
- **The capstone: trace one step.** The machine paused before a line; the learner says which
  numbers the line changes and to what, and which line runs next, then runs it and compares. An
  `answers` challenge (number and choice fields), graded by the reference, which the simulator is
  tested against after every instruction; the figures stay on the simulator. (This plan first said
  "graded by a copy of the simulator after a real step, not by the reference". The managing session
  changed it during the build: the front page re-grades saved work as it renders, and grading on
  the gates made every render cost a returning learner seconds.) The build decides whether the
  trace also follows the line down the ladder to the part that made the number.

## Using the lab

The preface's "How a lesson works" stays where it is, linked from every page's header: it is
reference a learner may want mid-lesson. Module 0 gives each control the course uses a first,
low-stakes use: a prediction before a run, a step, a run, a fault, the hint ladder, a test that
fails and says why. It may link to the preface; it does not repeat it.

## Suggested lessons

The managing session's recommendation; the build may change it and says why.

1. **What does a computer do?** The shop's machine reads the rooms' sensors and the door, follows a
   program line by line, and sets the office display and the lamps. The learner predicts the
   display, runs the program a step at a time, watches the numbers it keeps change, changes a
   room's reading and runs it again (the same program, a different display), and sees each line
   kept as a number. A figure: the shop's scene (`scene`), where the machine's numbers come from
   and go.
2. **What is the machine made of?** The ladder, the fault from the bottom seen at the top, and the
   capstone. The course's path climbs the ladder from the bottom: Module 1 starts at one wire.

Choose a program of the shop's own that a beginner can follow and that changes something they
can see (the display, a lamp). It may be one of Module 8's (the margin, which room is colder, the
sum by a loop): the learner meets it again when they build the machine that runs it, and Module
8's lesson may then say so in a later pass. Keep it under a dozen lines.

## Figures

A figure for every idea, readable at 375 pixels, as the audit of 6 October 2026 asked of every
module since. At least: the shop's scene; the machine at work (above); the program's lines beside
their stored numbers; the ladder, a level at a time; the fault seen at the top. The large drawing
opens on the part the words name (`focus`, `docs/notes/overview-strip.md`). Every figure passes
the diagrams and aesthetics tests at both widths.

## Terms

Module 0 rations none of the course's words: each belongs to the lesson where the circuit first
raises it. It may ration a word of its own that later lessons will use (the managing session sees
none it needs: "each part is used as a box, its insides hidden" says what "abstraction" would),
and says each in its note.

**Module 10 is built at the same time** and owns the instruction-set words. Avoid, as well as every
term on `main`: instruction set, encoding, immediate (which catches "immediately"), opcode,
architecture and microarchitecture. The managing session runs the gate over both modules merged.

## The platform

New code goes where the earlier modules put it: new files where it can be; edits to shared
registries as short appends in a block of their own, with a comment naming the module. Keep every
existing figure, challenge and lesson working and their tests green. Module 10's build also
appends to the registries; expect a merge, and keep each append in its own block.

The whole check takes about 25 minutes, 22 of them in the browser. A figure that steps a 64-bit
machine adds to it; keep the browser tests to what only a browser can show, and say in the note
what the module added.

## The cover and the way in

- Once Module 0 has a lesson, the way in reads "Start with Module 0" and its first lesson's title,
  from the lessons' own data. Check that it reads well, and the preface's closing link with it.
- **A returning reader.** The cover sends a reader who has passed a challenge to the first lesson
  not finished, so a reader who began before Module 0 existed would be sent back to it, away from
  where they were. Recommendation: continue from the furthest lesson in which the reader has
  passed a challenge, to the first unfinished lesson after it; the list still shows Module 0's
  challenges unfinished. The build decides, with the reader in mind, and tests what it chooses.
- The five stages stay as the author sketched them, Modules 1 to 13; the list of modules shows
  Module 0 first. The build does not redesign the cover.

## The SystemVerilog this module brings

None. Module 0 sits above the language, as Module 1 sits below it; the machine's text is not
shown.

## Originality

The ground has well-known openings. Do not reproduce or closely follow:

- Patt and Patel's levels of transformation (problem, algorithm, program, instruction set,
  microarchitecture, circuits, devices) and their figure of them;
- Tanenbaum's numbered levels of a structured computer (digital logic, microarchitecture,
  instruction set, operating system, assembly language, problem-oriented language);
- Nand2Tetris's opening: the Hack computer's overview and its diagram of layers from NAND gates up
  to applications;
- Petzold's *Code*, which builds from flashlights and relays to a computer as a story;
- the stock diagram of five units (input, output, memory, control, arithmetic).

The course's ladder is its own: drawn from the machine the learner will build, each rung the
module that builds it, from the shop's program down to one wire's voltage. Each lesson's
`originalityNote` names the textbook version of its topic and how the lesson differs, in the same
commit as the lesson.

## Branches, merging and the note

- The build works on `module-0-machine`, from `main` at the commit that adds this plan, and pushes
  only there. It never pushes to `main`, opens a pull request or runs the deploy workflow.
- `main` may move during the build (Module 10 is built at the same time, and another course's
  session updates the platform copy). Merge it into the branch whenever it does, and before
  finishing, and run the check again after each merge.
- The managing session merges the branch into `main`, after running the check and reading the
  lessons.
- The module's note, `docs/notes/module-0-machine.md`, says what was reused, what was built, what
  was extracted or could be, every edit to a lesson on `main`, the terms, and what the build would
  change.
