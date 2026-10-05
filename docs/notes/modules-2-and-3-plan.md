# Modules 2 and 3, built in parallel: the shared plan

Written by the managing session before either build started. Both builds read it first and keep
to it, because each is written without the other on its branch. A change to this plan is the
managing session's to make; a build that needs one says so in its module note and carries on
inside the plan.

## What each module covers

From the build prompt's curriculum:

- **Module 2, Boolean logic.** NOT, AND, OR, XOR; truth tables; expressions; NAND universality;
  simplification; depth. Lab: the circuit builder with auto-test and fault diagnosis. Capstone:
  NOT and XOR from NAND, and a minimised circuit under a gate budget.
- **Module 3, Combinational design.** Multiplexer, demultiplexer, decoder, encoder, comparator,
  adders, overflow, buses, hierarchy. Labs: 2-way and 4-way selectors; half, full and ripple
  adders; an equality comparator; an ALU slice. Capstone: a parameterised N-bit ALU slice. It
  reuses the Module 2 builder.

The curriculum rows are long. A module may be more than one lesson; size each lesson like the
existing ones and split where the material needs it. Every lesson has the ten sections.

## The learner, in course order

- **Module 1** (`signals`) is done. Its learner can already turn binary into decimal and back
  (the front page says the course assumes it) and leaves knowing bit, threshold, noise margin,
  binary, word, unsigned, signed and hexadecimal.
- **Module 2** follows Module 1. **Module 3** follows Module 2 and may assume all of it.
- **Modules 4 and 5** (`remember`, `registers`) come after both and already exist. They were
  written for a learner who "knows only gates", so Module 2 now teaches what they assumed. Read
  them to see what they take for granted; do not change them except as the terms section allows.
- The course's machine is 16-bit at the gate level. Nothing else about it is fixed yet.

## Terms

Rationed today: Module 1 introduces bit, threshold, noise margin, binary, word, unsigned, signed,
hexadecimal; Module 4 introduces feedback, latch, transparent, edge, propagation delay, setup,
hold, metastable; Module 5 introduces register and shift register.

- **Neither module uses a Module 4 or Module 5 term.** The one exception: Module 2 may take over
  "propagation delay" if its lesson on depth needs it. It then lists the term in its own
  `introduces`, removes it from `remember`'s list in the same commit, and says so in its note.
  Module 3 takes over nothing.
- **Module 2 owns the logic terms** it chooses to ration (for example truth table, XOR, NAND,
  NOR, Boolean expression, universal, depth). Never ration a word that is also ordinary English
  in lower case, such as "and", "or" or "not": the gate's pattern ignores case and would fail
  every lesson.
- **Module 3 owns the combinational terms** (for example multiplexer, demultiplexer, decoder,
  encoder, comparator, half adder, full adder, carry, overflow, bus). Module 2 does not use them.
- **Module 3 uses Module 2's terms** before Module 2's lesson exists on its branch. Until Module 2
  lands they are not rationed there, so the gate stays green and nothing needs doing. Module 3
  never lists a Module 2 term in its own `introduces`.
- **A word an earlier lesson uses in another sense** (Module 1 says "carry" in "carry it across"
  and "carries some 0 sample") gets a `termExemptions` entry on that earlier lesson, with the
  reason, added by the module that rations the word, and said in its note. That is the only edit
  either build makes to Module 1.

## Code

- **New code in new files** where it can be: each module's figure kinds, model files and tests.
  Edits to shared registries (the interactive registry, the strings files, the component library,
  the HDL construct lists, `content/lessons/index.ts`) are short appends in a block of their own,
  with a comment naming the module, so the second merge is mechanical.
- **Module 2 owns gate-level additions**: any gate kinds the simulator lacks, and grading by gate
  count (a budget) and by depth. **Module 3 owns combinational components** (selectors, decoders,
  encoders, comparators, adders) and anything the views need for buses and hierarchy.
- If Module 3 needs something Module 2 owns, it writes the smallest version it needs, in its own
  file, and says so in its note; the managing session reconciles the two at the merge.

## Branches and merging

- Module 2 builds on `module-2-boolean-logic`, Module 3 on `module-3-combinational`, both from
  `main`. Neither pushes to `main`, opens a pull request or runs the deploy workflow.
- The managing session merges Module 2 first. It then merges `main` into Module 3's branch,
  resolves what conflicts, runs the check, and merges Module 3. A build that finds `main` has
  moved before it finishes merges `main` into its branch and runs the check again.

## A question Module 1 leaves for Module 3

Module 1's reflection ends: "Signed and unsigned readings use the same 65536 patterns. Could one
way of adding two words serve both readings?" Module 3's adders and overflow answer it: one adder
serves both readings, and the readings differ only in when the result does not fit. Module 3
should pick the question up where its learner can see the answer, not as a callback for its own
sake.

## The merge (written by the managing session after both builds finished)

Module 2 finished at 16:36 UTC and Module 3 at 16:46; each had merged `main` (with the page
before the first lesson) into its branch. Module 2 was checked (the full check, 291 unit and 184
browser tests), its three lessons read start to finish, and merged first, as `main` f157765.
Module 3 was then merged onto it. Five files conflicted, every one two blocks added in the same
place (the lesson list, the model's exports, the circuit library, the book's imports, the views'
strings); each was resolved by keeping both. Both modules kept to this plan: each introduced only
its own terms, neither changed Module 4 or 5, and Module 3's one edit to Module 1 is the
exemption for "carry" the plan foresaw.

Read against Module 2, Module 3's list of where it leans on Module 2 held, with three fixes:

- **XNOR.** The adders lesson's overflow lamp offers an XNOR part and its hints say "Recall: an
  XNOR gate...", but Module 2 never introduces XNOR. The lead above that challenge now says what
  an XNOR gate is (a fact brief to the drafting subagent), and the adders lesson lists XNOR in
  `introduces`.
- **"Lesson 1", "Lesson 2", "Lesson 3".** Module 3 named its own lessons by number; a learner
  arriving from Module 2 has met other first lessons. Six sentences now say "the last lesson",
  as Module 2 does (redrafted by the drafting subagent; every other word unchanged).
- **A prediction's answer under it.** The adders lesson asks what `1000` reads as signed; the lead
  of the figure just below said "Read signed, the top bit is worth -8", visible before the
  learner answers. The sentence was cut: the prediction's explanation already says it.

Also changed: the front page's test for missing modules assumed Modules 2 and 3 were missing; it
now builds its own gap from the course's first and last modules.

Settled by Module 2, so no longer open: Module 3's question whether the "As text" panels should
be hidden before Module 4 (Module 2 teaches the course's text in its first lesson), and its
conditional notes on depth (Module 2 introduces it). Still for the author: Module 2's three
questions (the explorer's count before any press; NOR left unrationed; drawings that scroll
sideways on a phone) and Module 3's suggestion of a cut-wire fault in the decoders lab, now that
Module 2 teaches X.
