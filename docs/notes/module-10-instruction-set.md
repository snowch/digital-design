# Module 10: the instruction set

A working note, written as the module was built, on the branch `module-10-instruction-set`. Times
are read from the clock (`date -u`), not estimated. "The building session" is the session that
wrote the code and the briefs and checked every draft; "the drafting subagent" is the Haiku
subagent that wrote every learner-facing sentence from a brief of checked facts. The plan is
`docs/notes/module-10-plan.md`.

## Times

- Started: 2026-10-07 04:30 UTC (first command in the session).
- The five lessons were committed by 05:51 UTC; the figures' own words, the walk and the full
  check followed (below).

## Log

- 04:30 to 04:40 Read CLAUDE.md, the plan, `docs/plan.md`, `docs/authoring.md`, `docs/style.md`,
  `docs/machine.md`, `docs/isa.md`, the notes for Modules 8 and 9, checkpoint 3, and lessons 8.1,
  9.2 and 9.5 with their words; then the code the module builds on: the reference
  (`machine.ts`), the assembler, the decoder and controller (`control.ts`), the machine of several
  edges and its comparison, the machine's text (`module9.ts`), the figures of Modules 8 and 9 and
  the answer graders. The unit tests on `main`: 897 passed, in 96 seconds.
- 04:40 Faults on the machine of several edges, each run against the reference on the colder-room
  program and Module 8's 37 programs: HOLDR stuck at 1 and HOLDM stuck at 1 change only the
  machine's own held words, and every program still agrees with the reference after every
  instruction; PCEN stuck at 1 disagrees at the first instruction (all 37 fail). (Corrected after
  the review: `compareMulticycle`'s first PCEN difference is the edge count, which the agreement
  leaves out. By what a program can see, two machines side by side, HOLDR stuck at 1 differs on 0
  programs, PCEN stuck at 1 on all 37, HOLDR stuck at 0 on 29: `instruction-set.suite.test.ts`.)
- 04:41 to 04:44 The capstone and lesson 1's second circuit, in the model and as text, before any
  lesson: the reference, the assembler and the decoder take "set if" at kind A
  (`MachineOptions.setIf`, `ControlOptions.setIf`); `ControlOptions.shortJobs` gives the register
  and constant jobs 3 edges. `content/lessons/module10.ts` makes each text from Module 9's by
  named line edits. Module 8's 37 programs run through the second circuit as the reference runs
  them, each job in 3 edges; the capstone's machine runs set if under every condition on equal,
  smaller and larger words, each in 4 edges; without its new source for register Y, it writes the
  subtraction, and the comparison names R5.
- 04:45 to 05:03 Lesson 10.1. The comparison of the two machines (`machine-compare.ts`) and its
  figure; the answers editor learnt choice fields, and the graders `choices`. The facts test caught
  a wrong fact in the building session's own brief before it reached a page: with PCEN stuck at 1
  the controller still takes the load's five edges and writes R2, and the PC runs ahead to the
  stop; brief 1B was corrected and the key redrafted. A browser test found the log table running
  off a phone; the address now sits in the instruction's cell.
- 05:03 to 05:20 Lesson 10.2. The packed layout and what the machine makes of a word
  (`encoding.ts`), `layout-compare` and `encoding-explorer` with the calculator; the grader
  `instruction-word`. The browser test caught the layouts showing before the prediction was
  committed (an edit had missed a block Prettier had rewrapped); they are now gated, and the
  test holds it.
- 05:20 to 05:32 Lesson 10.3. The comparisons with their registers swapped and the programs
  counted (`programs10.ts`), `swap-compare` and `program-compare`; the grader `exact`. Two facts
  were wrong in the building session's own expectations and the facts test said so: the
  prediction's answer read raw props without their defaults (fixed in the code), and the start of
  the `greater` challenge fails 8 tests, not 7.
- 05:32 to 05:36 Lesson 10.4; `main` merged (two commits, no conflict).
- 05:36 to 05:51 Lesson 10.5. The capstone's block drawn and placed by hand (`capstone10.ts`), the
  decoder's table and each kind's edges with kind A, a question on `kind-edges`. The diagram
  checks caught the 64-bit words written on that drawing running off it and onto a wire; the
  circuit explorer and the fault lab now take `writtenWidth`, as Module 8's datapath figure does.
- 05:51 to 05:58 Two corrections from the managing session. Lesson 10.1's PCEN fault "skips the
  three instructions between"; it is four (`004` to `010`). The error was the building session's,
  in brief 1B, which the drafter copied faithfully; the brief and the sentence were corrected with
  the fewest words, and the facts test now counts the instructions from the assembled program.
  The managing session also asked for a figure in each lesson's opening wherever one helps; 10.2
  to 10.5 had one in their motivation, 10.1 had none (below, 06:00). The unit tests on the branch:
  1039 passed, in 173 seconds (`main`'s 897 took 96; the module adds 142 tests and 77 seconds, of
  which the second circuit's suite run is about a minute).
- 05:58 to 06:00 The figures' own words, brief 6V. The draft dropped ten facts, copied one description and wrapped every
  slot in backticks, which the figures write as plain text (list below).
- 06:00 to 06:17 Lesson 10.1's opening figure, `machine-parts`: each part the motivation names, as
  each machine's circuit has it, read from the two circuits by the component that keeps it
  (`machineParts`, machine-compare.ts) and pinned by its unit test, the lesson's facts test and the
  browser spec. Its words, brief 6W; the draft dropped one fact.
- 06:17 to 06:20 The mechanical walk (below) and this note.
- 06:20 to 06:46 The full check, `npm run check`, on `421cce7`, in this container: 25 minutes 46
  seconds; every step passed but the stored screenshots, where 641 browser tests passed and 10
  failed. The ten are the first lesson's header and figures, the scenes and the sum on paper, and
  the six named under the walk below, all outside Module 10; six of them were run on a clean
  worktree of `main` here and fail the same way. CI's run of the same check on `421cce7`
  (Check #266) passed, every screenshot included, in 26 minutes.
- 07:38 to 08:08 The reading half's findings for 10.3 (twelve), from the managing session. Code
  first: each comparison carries the flags of the subtraction its branch makes, shown under the
  branch (finding 3); the swap figure shows its pairs before the prediction and only the rows asked
  about after it (finding 9); the wide number's figure asks how many instructions the sums run
  (finding 7); Module 8's `branch-targets` drawn in the construction (finding 4), on the 7 × 5
  loop, since the colder-room program's branch line ran 28 px wider than a phone. Then brief 3R,
  one fact list per key, drafted in three parts; brief 3R2 for the figure's words. The drafts
  dropped seven facts, two of them the findings' own (the word placed in the ROM, the job meant
  by challenge 1's first question); the second pass cut two repeats the brief had carried. 10.4's
  opening question changed with 10.3's reflection (finding 8). The 10.2 findings' calculator fix
  (convert the typed words on a switch of form; drop "B is the word's constant" once B is typed)
  went in alongside.
- 08:10 to 08:35 The findings for 10.2 (ten). Code: each instruction on the opening figure has
  notes for the fields it leaves unused (item 1); the layouts figure opens on the register job,
  which nothing moves (item 3), with a browser test. Brief 2B's item 2 was wrong (mine, copied by
  the drafter) and is corrected; brief 2R, drafted in two parts, carried every fact. The prompt to
  predict in the failure experiment is gone (its answer showed on load). The plan change of item
  5 is recorded above as the managing session's. Findings for 10.1, 10.4 and 10.5 arrived
  meanwhile, with decisions A to K; `runProgram`'s count of a refused word (G, K) is held for
  10.4's round, where it changes a stated count.
- 08:35 to 09:20 Main merged (c3015c7, the verdict cache; no conflict). The findings for 10.1
  (eleven, with decisions J and K). Code: the short-jobs tests gained the refused load (item 1);
  the pair takes the stop's halting edge, so the stop takes 2 edges as 9.3 says (23 against 6),
  logs Module 8's edges row by row, and logs the stop where it was fetched (items 4, 5); the
  devices row lists the waiting bits (item 11). The fault counts are pinned by what a program can
  see. Brief 1R, drafted in two parts, dropped one fact and added one; my own brief had one wrong
  fact (Module 9's PC at the halt with PCEN stuck: `01C`, not `018`), caught by the facts test.
- 09:20 to 10:10 The findings for 10.4 (eleven, with decisions B, E to I), the lesson rebuilt
  around what is new. Code: `runProgram` no longer counts a refused instruction; `program-compare`
  can hide the ROM's bytes, show one listing for one program on two machines, and ask where a run
  halts, and its counts say "halt" where a run ends with a cause; the kind map fills its card.
  Brief 4R, the whole lesson, drafted in three parts: one fact dropped, decimals put in
  backticks, labels' case and stops. Lesson 3's reflection ends on 10.4's new question (I).

## The outline

Five lessons, as Modules 8 and 9 had (titles and challenges as they stand on the pages): each answers the question the one before ends on, and each
split falls where the learner's view of the machine changes. Module 8 asked what each instruction
does to the datapath, Module 9 how the control makes it do it; Module 10 asks what a program may
rely on, and why the instructions and their layout are what they are.

1. `instruction-set`, "What must every machine running a program agree on?": Module 8's machine and Module 9's run
   one program side by side, compared after every instruction. They agree on R0 to R15, the PC,
   the memory and the devices, and on nothing else; mid-instruction they differ. Faults: HOLDR
   stuck at 1 keeps the agreement, PCEN stuck at 1 breaks it. Challenges: sort a list of the
   machines' parts into the agreement and one circuit's own (answers); then write a third circuit
   for the same instructions, Module 9's machine with its jobs written at the ALU edge in 3 edges,
   tested edge by edge and against the reference. Introduces **instruction set** and
   **microarchitecture**.
2. `encoding`, "Why does every field keep one place in every instruction, and what does that cost?": the layout as a design. The encoding explorer
   with the course's calculator; the course's layout beside a packed one, in which a kind that
   leaves a register digit unused gives it to the constant, and pays with a field that moves.
   Challenges: write instructions' words (answers); write the packed layout's register file
   write address, `ydigit`, which needs a selector chosen by the kind where the course's layout
   reads digit 3 for every kind. Introduces **opcode** (the kind and job
   together, the books' word).
3. `immediates`, "How far can 12 bits reach, and how does a program say greater than?": the constant's range, the 2 KB memory chosen so
   every address fits, a branch's reach counted in instructions, "greater than" as "less than"
   with the registers swapped, and a number too wide for the constant. Challenges: the largest
   number a constant job puts in a register, a branch's constant and a branch's reach (answers);
   "greater than" written as text from the ALU's subtraction with its inputs swapped. Introduces
   **immediate** (the books' word for the constant).
4. `room-to-grow`, "What room is left in the instruction set, and what would a missing instruction cost?": the illegal kinds and jobs, an all-zero word
   that stops a program that runs off its end, the free kinds, and what each instruction
   `docs/isa.md` leaves out would cost the circuit and save a program, counted by runs of the
   reference. Challenges: six codes sorted as free, taken or kept refused (answers); a program of
   two calls through a register, its instructions run counted with and without that instruction
   (answers). Introduces nothing.
5. `design-an-instruction`, the capstone, "How do you add a new instruction?":
   set if, `RY ← 1` if `RA cond RB`, else 0, at kind A, the job digit a branch's condition. It
   needs what Module 9's capstone did not: a change to the datapath, the condition MET carried as a
   word to register Y, through a new control signal SET. Challenges: the design, checked against
   the layout's rules (a free kind, the fields where every instruction keeps them, the program it
   shortens, what it costs); the decoder's text with kind A; the machine's text with the new source
   for register Y, run end to end. Introduces nothing.

## Changes to the plan, the managing session's

Decisions the managing session took after the reading review, each changing
`docs/notes/module-10-plan.md`; recorded here as theirs.

- **10.2 compares two whole-digit layouts, not a layout packed by bits** (10.2's item 5). The plan
  asked for "a layout packed by bits"; the page compares fields that keep one place in every
  instruction with fields that move. 10.1's reflection, 10.2's title and its question now ask
  what the page compares, and the question says why the fields are whole digits: sixteen
  registers, kinds and jobs need 4 bits each, so cutting by bits buys room only where a field is
  unused, which the packed layout shows.

- **10.4 counts cost and saving on the instructions `docs/isa.md` leaves out other than set if**
  (decision B). The call through a register carries the with-and-without challenge; 10.4 names
  set if only as the instruction lesson 5 designs, in one clause.
- **The compatibility point is made once, in 10.4** (decision E): old programs run unchanged on a
  machine that takes only refused codes, shown by the colder-room program on both machines.
- **The kind map's layout is fixed in the shared component** (decision F): equal columns across
  its card, which changes 9.2's figure too. No stored screenshot holds the map, so no baseline
  changed; 9.2's figure was checked at both widths.
- **`runProgram` counts the stop as run and a refused instruction as not** (decisions G and K),
  as 9.3 counts; the counts every figure states were checked again.
- **`docs/isa.md`'s "runs its data as instructions"** (decision H) is the author's file and is not
  edited here. The runs show what happens: the machine runs data after a program as
  instructions until one is refused, which is usually its first (5000 puts `00001388` at `008`,
  kind 0; -250 puts `FFFFFF06`, kind F), while `12345678` runs as an add and the halt comes at
  the word's top half, at `00C`. The managing session will raise it with the author.

## The capstone's instruction, and the machine it changes

"Set if" at kind A, in the learner's own copy of Module 9's machine (`machineText(true)`, whose kind
9 is the call through a register), so lesson 9.5's "in your copy, kinds A to F stay free" holds.
The job digit is a branch's condition, unchanged (0 always, 1 never, 2 equal, 3 differ, 4 and 5
less and not less unsigned, 6 and 7 signed), so the condition block Module 8 built serves both, and
the job check treats kind A as it treats kinds 1, 2 and 5 (job bit 3 refused). "Set if less", the
plan's recommendation, is jobs 4 and 6. Its edges are a register job's, FETCH, READ, ALU, WRITE: the
decoder sets WRITEY and the ALU's subtract, so the controller does not change; at WRITE, MET is
worked out again from the held words, and register Y takes it as the word 0 or 1. Module 9's
machine is the one changed because its decoder is text the learner wrote; Module 8's decoder is a
block the course supplies closed. `docs/isa.md` does not change.

## Terms

Rationed, each where its lesson's figure first raises the question it answers:
**instruction set** and **microarchitecture** (10.1, `instruction-set`), **opcode** (10.2,
`encoding`), **immediate** (10.3, `immediates`). 10.4 and 10.5 introduce none. "Opcode" and
"immediate" are named as the books' words for the kind and job together and for the constant,
as lesson 1.1 names two's complement.

**"Encoding" is not rationed.** The plan listed it as a candidate, but Module 5's `state-encoding`
lesson already uses the word throughout, in the same sense (the codes a design gives its states);
rationing it in Module 10 would need an exemption on a lesson whose title is the word. Module 10
uses it plainly.

**Edits to lessons on `main`**: one `termExemptions` entry, on `new-instruction` (9.5), for
"instruction set": its prose says "The new instruction sets CALL", the verb. Reason, in the lesson:
"\"The new instruction sets CALL\": the verb, an instruction setting a control signal; lesson 10.1
introduces the instruction set." No other lesson on `main` was edited. "Immediately" appears in no
Module 10 string, and the briefs banned it.

Working words held to one meaning each (`briefs/00-module.md`): agree, keep, edge, kind, job,
field, digit, layout, circuit, run, stop. "Cycle" appears nowhere; "step" is not used for an edge.

## Figures

Every figure is a view of the simulator or of the reference, and each passes the diagram and
aesthetic rules at both widths.

- `machine-parts` (new, 10.1, the motivation): one row for each part the motivation names, one
  column for each machine; a cell says what that circuit has for the part (a register and its
  width, the register file, the ROM's output for Module 8's IR, the memory, the devices, or none),
  found from the component that drives the part's net or keeps it. It holds no question: it shows
  what the motivation's words say, before the investigation runs the two machines.
- `machine-compare` (new, 10.1): Module 8's machine (`datapath-full`) and Module 9's
  (`multicycleCircuit`) in two simulators, compared with each other after every instruction
  (`pairView`: the differences between what a program can see on each; the course's tests, not
  the figure, compare Module 9's machine with the reference): what a program can
  see on each, what Module 9's keeps of its own, every instruction with the edges each machine
  took; Module 9's moves an edge at a time, Module 8's takes its edge when Module 9's instruction
  ends; faults on Module 9's machine; a question before the tables show.
- `instruction-fields` (Module 8's) and `layout-compare` (new, 10.2): an instruction's word in the
  course's layout and in a packed one, digit by digit, the constant's range in each and the field
  that moves; a question before the layouts show.
- `encoding-explorer` (new, 10.2): a word typed or chosen, its fields, what the machine makes of it
  (the reference's own field split and its check for an illegal instruction), the constant widened
  by the simulated widen block; and **the calculator**, Module 7's ALU from the library
  (`alu8-flags-16-block`, `alu8-flags-64`) run in the simulator at 16 or 64 bits on two words typed
  as hexadecimal or as numbers read signed, with Y in bits, hexadecimal, unsigned and signed and the
  four flags under Module 7's names; a button takes the job and B (the constant widened) from the
  word. The failure experiment of 10.2 is the same figure without the calculator, on packed words.
- `widening` (Module 8's, 10.3) and `swap-compare` (new, 10.3): every comparison, read signed and
  unsigned, with the branch that says it and whether the reference takes it; a question.
- `program-compare` (new, 10.3 to 10.5): one or two programs run on the reference, side by side:
  their listings, the instructions written and run, the ROM used, the registers and display at the
  stop, where and why the run stopped; a program written with the learner's copy's kinds can be run
  on the course's machine; a question before the counts show.
- `kind-map` (Module 9's, 10.4).
- The capstone's change, drawn (10.5): `y-word-set`, the block that chooses register Y's word with
  the new input, placed by hand and opening on pickSet (`focus`), in `circuit-explorer` and in a
  `fault-lab` on SET; `control-table` and `kind-edges` with kind A (`setIf`), the latter with a
  question.

**The calculator on Module 8's and 9's pages: not offered.** Each of those pages that could use it
asks a prediction it would answer (a register's word after a job, a branch's constant, a flag), and
the plan allows it only where it answers none. It appears in 10.2 and nowhere else in Module 10;
10.3 to 10.5 work from figures of their own.

## The capstone: set if, and every part it changed

The instruction: `RY ← 1` if `RA cond RB`, else `RY ← 0`, at kind A, its job digit a branch's
condition, in the learner's copy of Module 9's machine. `docs/isa.md` does not change. Each part,
and how each was tested:

- **The reference** (`machine.ts`): `MachineOptions.setIf` names the kind; `isIllegal` refuses its
  jobs 8 to F; `step` writes the branch condition of RA - RB as the word 1 or 0. Tested through
  everything below.
- **The authors' assembler** (`assemble.ts`): `R5 <= R2 < R1 signed` writes kind A when told the
  kind, and refuses with "this machine has no set if" otherwise.
- **The drawn decoder** (`control.ts`, `ControlOptions.setIf`): kind A's line is the control signal
  SET; WRITEY, OP1 and OP0 take it into their ORs; the kind check knows kind A and the job check
  refuses its job bit 3 as kinds 1, 2 and 5 do. Tested against the reference's `isIllegal` for every
  kind and job under four constants (`module10.test.ts`); its outputs are the capstone's decoder
  challenge's expectations, which the challenge's reference text meets on all 262 cases.
- **The controller: no change.** Set if sets WRITEY and not MEM or CALL, so it takes a register
  job's FETCH, READ, ALU, WRITE; at WRITE the condition is worked out again from the held words.
  `stateSequence` gives kind A those states; `kindSequences` walks the drawn controller and finds
  the same (`design-an-instruction.facts.test.ts`).
- **The datapath: a new source for register Y**, MET as a word (63 zeros above it), chosen by SET,
  after the call's line. In text: `if (SET) YIN = {63'h0, MET};`; drawn: `capstone10.ts`.
- **The machine, end to end**: the learner's copy's whole text with the change runs the count of
  cold rooms and every condition on equal, smaller and larger words against the reference, each set
  if in 4 edges; without the new source it writes the subtraction and the comparison names R5
  (`module10.test.ts`). The capstone's third challenge runs the program edge by edge (33 tests).

Which machine: Module 9's, because its decoder is text the learner wrote; Module 8's decoder is a
block the course supplies closed. Which copy: the learner's Module 9 copy, with kind 9 as the call
through a register, so lesson 9.5's "kinds A to F stay free" holds and the design challenge can ask
why not kind 9. The three challenges split the work so no step repeats another (checkpoint 3's
third question): the design, then the decoder alone, then the machine whose decoder already has
kind A and lacks only the datapath's source.

"Justify" is graded where it can be: the kind (a free one), the register written (Y, where every
instruction keeps it), the condition (J, as a branch's), the program it shortens (the count of cold
rooms, counted on the reference: 10 instructions written and 9 run, against 8 and 8), and what it
costs (a new source for register Y and a control signal). The words a learner might write about it
are left to the reflection.

## Lesson 10.1's third circuit

The plan's first idea asked for the two machines compared. The lesson adds a third circuit for
the same instruction set, which the learner writes: Module 9's machine with its register and
constant jobs written at the ALU edge in 3 edges (three lines: the ALU arm of the next-state
logic, WREG, and YIN's default from HR to RESULT). Module 8's 37 programs run through it as the
reference runs them, each job in 3 edges (`module10.test.ts`). It is the plan's "how a circuit
keeps that agreement is its own business", done rather than said.

After the review, the challenge's tests run one program three times from a reset, the shop's
signals choosing the path: the margin program edge by edge; a load the memory refuses at its
memory edge (cause 33); and R3 stored to the display. The registers keep their words through a
reset (checked on the simulated circuit: R1 holds 5 after a reset that sets the PC to 0), so the
third run shows whether the refused load wrote R3. A WREG without `~MEM`, which the margin program
alone could not tell apart, fails that one test. 73 tests; the start fails 48.

## The claim in docs/isa.md about wide constants

`docs/isa.md`'s "Left out on purpose" says a constant wider than 12 bits is "built in two
instructions today". Run on the reference (10.3), that holds only for numbers up to 4094 (two
constant jobs of at most 2047). The general ways are: **one absolute load of a word kept in the
ROM** after the program, which gives any 64-bit number in one instruction and 8 bytes of ROM (5000
took 3 instructions and 24 bytes with the store and the stop, against 5 and 20 by sums); or a
sum of constant jobs, one for each 2047 or so. The lesson states what the runs show and does not
repeat the claim. A change to `docs/isa.md` is the author's.

## What the drafts got wrong

The drafting subagent's faults, each caught by the building session's check of facts and fixed by
adding words or by sending the draft back; the drafts and the fixes are kept beside the briefs
(`docs/notes/module-10-instruction-set/drafts/`).

- **Facts dropped**, the most common fault: a qualifier that carries the fact ("read signed", "at
  the stop", "the stop among them", "Module 9's machine" for "it"), a lead-in that says what a
  verdict is about ("Not an instruction:", "The packed layout moves:"), a figure's step in a lead.
  Fixed by putting the brief's words back.
- **The brief's own description copied as the text** (6V's `answer`).
- **Meaning drifted**: "stops", what the machines do, came back as "stop", the instruction's name.
- **Formatting the figures cannot show**: slots wrapped in backticks; headings and labels with full
  stops; values in quotes; "!=" typed as "≠", which the machine's text does not use.
- **Wrong facts that came from the briefs, not the drafter**: two, both the building session's, both
  in brief 1B (the PCEN fault writes R2, and it skips four instructions, not three). The drafter
  copied each faithfully. The first was caught by the facts test before it reached a page; the
  second by the managing session's reading, after which the facts test counts it.

## The mechanical walk

Each lesson was opened in the built site at 1280 px and 768 px in the light theme and at 375 px in
the dark theme; every prediction committed, every run pressed, every figure photographed after use.
No page was wider than its screen and no console error was raised. The challenges were tried with
their references and with plausible wrong attempts, through the page, in the browser spec at both
widths (each wrong attempt is rejected with its failing test named; a saved mark alone earns
nothing). Found and fixed on the way: the comparison log ran off a phone (10.1); the layouts showed
before the prediction was committed (10.2); the 64-bit words on the capstone's drawing ran off it
and onto a wire (10.5).

**Six stored screenshots fail in this container, on `main` as well as on the branch**: the
registers, state machines and signals lessons' figures and Module 2's pairs figure, by 2 to 4 per
cent of their pixels, where a line of prose wraps one word differently. The same six fail on a
clean worktree of `main` built here, so the cause is this container's text rendering, not
Module 10; none of the figures Module 10 touches is among them, and no baseline was updated.

## What the platform gained

New files: `machine-compare.ts` (with `machineParts`), `encoding.ts`, `programs10.ts`, `capstone10.ts` (model);
`Module10Figures.tsx`, `strings10.ts` (views); `module10.ts` and five lessons (content);
`tests/educational/module10.spec.ts`. Appends to shared files, each in a block of its own naming the
module: `MachineOptions.setIf`, `ControlOptions.setIf` and `shortJobs` with the decoder's options and
`stateSequence`; `assemble`'s `setIf`; `referenceFor` and `assemblyFor`; the graders `choices`,
`instruction-word` and `exact`; choice fields in `AnswerEditor`; `setIf` and a question on
`control-table` and `kind-edges`; `writtenWidth` on `circuit-explorer` and `fault-lab`; the course
modules set `machine9-set` in `book.tsx`; the library's `y-word-set`; `strings.ts`'s `machine10`
block and the control strings' kind A; CSS at the end of `course.css`.

## Candidates for the shared primitives (listed, not extracted)

- **The prediction gate** (Module 8's and 9's notes listed it): Module 10 adds five figures that
  hide their values until the learner commits, each with the same twenty lines (`machine-compare`,
  `layout-compare`, `swap-compare`, `program-compare`, `kind-edges`). It now has many consumers in
  this course; a `GatedFigure` in the platform would take the question, the options, the answer and
  the verdict's words.
- **Two programs counted**: `program-compare` would serve Module 11 directly.
- **A choice field in the answers editor**: the schema had `choice`, and the editor now draws it;
  that belongs in the platform's editor, which the metadata course could use.

Extraction waits for the author's approval.

## What I would change

- The capstone's motivation gives set if's word, `A6215000`, before the design challenge, and the
  prediction's legend names kind A, so three of the design's five answers are on the page before
  it. The design is graded as reasons the learner must choose among, not discovered; a fuller
  design challenge would let the learner pick any free kind and test the decoder at that kind.
- The calculator could also take a register's word from a run, so a learner checks a branch's
  flags against the machine without retyping.
- The two machines side by side could draw Module 9's state as its diagram, as lesson 9.3 does.
- The second circuit's suite run (37 programs through the text) adds about a minute of unit tests;
  a representative third would do.
