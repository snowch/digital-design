# Module 6: Memory

A working note, written as the module was built. Times are read from the clock (`date -u`). It
records what went wrong as plainly as what went right. "The managing model" is the model that
built the module; "the drafting subagent" is the model that drafted every learner-facing string.

## Times

- Started: 2026-10-05 22:33 UTC (first command in the session).
- Finished: 2026-10-06 01:05 UTC (the commit that carries this note).

## The plan, as decided before any code

Read first: CLAUDE.md, `docs/plan.md`, `docs/notes/modules-5-6-7-plan.md`, `docs/authoring.md`,
`docs/style.md`, `docs/simulator.md`, the inventory's sections 1 and 8, `docs/checkpoints.md`,
the notes on Module 5's registers lesson, diagrams, straight wires and SystemVerilog, and the
lessons `registers`, `decoders` (and their prose and labels). Built the course and looked at the
registers lesson's pages.

### Four lessons, and why the split falls where it does

The module's list is addressing, decoders, RAM, read and write, the register file, byte
addressing, alignment and memory-mapped input and output. Each lesson takes one question the
previous one leaves open, and each is about the size of `registers`:

1. **`ram`: How can a circuit keep many words and find one again?** (address, RAM). The office
   keeps a setting for each of the four rooms the decoders lesson numbered 00 to 11, and shows
   any one of them on the display. One register per room; Module 3's decoder turns the room's
   number into one register's load enable, and a selector picks the word the display shows. The
   memory explorer opens the block to its registers, a register to its flip-flops, a flip-flop to
   its latches. The break: an address with more bits than the memory uses lands on a word that
   already holds something. Writing waits for an edge; reading does not.
2. **`register-file`: How can a circuit give out two words at once?** (register file). The
   office compares two rooms' settings side by side; one selector gives one word, so a second
   selector on the same registers gives a second word, each with its own address, while writes
   still go one at a time. Why a second write at the same edge is harder. The memory as text: a
   SystemVerilog array, read by index and written in `always_ff`.
3. **`bytes`: How does a memory of bytes keep 16-bit words?** (byte, aligned, alignment). The
   readings are 16-bit words (Module 1's `FF48`), but some things the office keeps are 8 bits. A
   memory whose addresses each name 8 bits keeps a word as two bytes, the low byte at the lower
   address. Two byte banks side by side read a whole word in one access when its address is
   even; a word at an odd address would need two rows, and this memory refuses it.
4. **`memory-map`: How does a program reach the shop's lamps?** (ROM, memory-mapped). The
   lamps, the switches and the display are given addresses of the lesson's choosing; a decoder on
   the address's top bits chooses which part answers. A ROM is a memory filled from a list of
   values when it is made, read and never written; in SystemVerilog, an array with a list of
   values. The capstone is the module's: a memory of the shape a small program needs, bytes and
   16-bit words read and written by address, a ROM, and the shop's devices at addresses the lesson
   chooses, written as text and tested by a script of the reads and writes a program makes.

Merging 1 and 2 would put two new structures and a new construct in one lesson; merging 3 and 4
would put two new ideas about what an address names (a byte; a device) in one. Each of the four
ends on the question the next opens.

### Where a memory is gates and where it is a component

- **Gates**, where the learner opens it: the four-word, four-bit RAM of lesson 1 and the register
  file of lesson 2 are Module 3's decoder and selector and Module 5's register with a load
  enable, about 250 gates each. They open one level at a time: the memory to its registers, a
  register to its flip-flops, a flip-flop to its latches.
- **A component with behaviour**, everywhere a memory is larger: a new simulator primitive,
  `memory`, and a `rom`. A memory of 256 bytes as gates is about 2,000 flip-flops and 25,000
  gates, recomputed at every settle step; a component is one evaluation. It is drawn as one closed
  block that does not open, and every lesson that shows one says that it is simulated as a
  component that behaves as the gates do.
- The `memory` primitive keeps no state of its own. Its contents are a net, as wide as the memory
  (words × width, plus one bit that says whether a list of values has been loaded), which the
  primitive reads and drives, with a second net for the clock's last level, so a rising edge is
  seen as the flip-flop sees one. So a snapshot, the trace, a replay and every view read a memory
  as they read any other net, and nothing in the engine changed. A memory starts unknown, as a
  flip-flop does, unless it was filled from a list.

### The course machine: what this module fixes and what it leaves

From the shared plan: 16-bit words; byte-addressable memory; a word's low byte at the lower
address; a word's address even. Not fixed: the instruction set, the number of registers, the
memory map. The register file's size is a parameter, the lessons use four words, and no lesson
calls it the machine's. The devices' addresses are lesson 4's own and are said to be.

## Log

- 22:33 to 22:40 Read the documents and the worked lessons; built the course; looked at the
  registers lesson's investigation at 1280 pixels.
- 22:40 to 23:00 Platform, before any words (code first, as the rules order it):
  - **The simulator's `memory` and `rom` primitives** (`packages/sim/src/memory.ts`). The
    simulator's own header promised "a second kind of primitive with an `update` on the clock";
    that would have needed snapshots, the trace and replay to learn about hidden state. Instead the
    memory keeps its words on a net it reads and drives, plus a one-bit net with the clock's last
    level, so a rising edge is seen as a flip-flop sees one and nothing in the engine changed. An
    unknown clock or write enable at a possible edge leaves the words it might have written unknown
    where they differ; an address past the last word reaches nothing (write ignored, read X). The
    engine's words are at most 1024 bits, so a memory holds at most 1023 bits; the lessons' are
    far smaller, and the HDL refuses a larger array with a sentence.
  - **dd-model `memory.ts`**: the four-word RAM as gates (`ram4`: Module 3's decoder, four AND
    gates with WE, four of Module 5's registers with a load enable, a word selector), the register
    file as gates (`regFile4`), word selectors (one Module 3 selector per bit), the memory and ROM
    components as closed blocks, a register file of any size as a component (`registerFile`, two
    reads), the memory of bytes (`byteMemory`: two banks, the write enables and ODD as gates), and
    the shop's memory (`shopMemory`). Library entries in `library-memory.ts`, hand-placed insides
    in `MEMORY_INSIDE` (joined to the library's `INSIDE`).
  - **Blocks a drawing may place** (Module 6 block in `BLOCKS`): `register`, `word-selector-2`,
    `ram`, `word-register-16`, `word-selector-16`, `byte-memory`, `table-rom`. Called through
    arrows because `combinational.ts` and `memory.ts` import each other.
  - **Sealed blocks**: a word selector, a memory or ROM component, a 16-bit register, and the
    small split and join blocks inside the memory of bytes never open (`isSealed`, exported from
    the circuit view); the content test's wire check now skips what no learner can open.
  - **HDL arrays** (`packages/hdl/src/memory.ts` and a Module 6 section of the elaborator): an
    array declared after the name (`[0:15]` or `[16]`), optionally filled from a list (`= '{...}`),
    read by index anywhere with no clock, written in an `always_ff` of its own (`mem[A] <= D;`,
    optionally under one `if`). It elaborates to the memory or ROM component, not to gates. Two
    constructs gated per challenge, `array` and `array-init`; the generator writes a memory back as
    an array, so a circuit-text figure can show one.
  - **The memory explorer** (`MemoryExplorer.tsx`): the circuit drawing with drill-down, the word
    inputs, Clock and Start again, and a table of the memory's words by address, marking the word
    each read names and the word the next edge writes, read off the simulator's nets: registers'
    outputs, a component's state net, or two banks interleaved. A second mode lists which part
    answers which addresses (lesson 4).
  - **An answer grader that asks the memory** (`memory-read`), for lesson 3's challenge: the
    simulator reads the filled memory at the case's address; a wrong answer shows "What the memory
    gives" in place of the expected word, as "What your bits read as" does in Module 1.
  - **A wide word with unknown bits is drawn a digit per four bits** (`XXXX`, `FFXX`) in the
    circuit view, where it had printed sixteen binary digits that ran into the next part.
  - Tests: 12 in dd-model (the RAM, the register file, the memory, the bytes, the shop) and 5 in
    hdl, all passing first time except the shop's reference, whose read of Q by name found another
    net called Q first (a reference built from blocks without output nets of its own; fixed by
    naming them).
- 23:00 to 23:10 The four lessons' structures with placeholder words, each checked by the content
  tests and looked at in screenshots. Two insides were laid out by hand after the first look
  (the RAM opened was a tangle; the memory of bytes drew its bit pickers as empty boxes, which
  became small sealed split and join blocks with named ports).
- 23:10 to 23:40 The prose. One voice sheet shared by every brief (`00-voice.md`, reproduced in the
  appendix), a fact sheet per lesson, five briefs per lesson (A question to prediction, B
  investigation and construction, C failure and explanation, D generalisation to the model note,
  E labels), and one for the views' and the checker's own strings: 21 briefs. Every fact was
  checked against the simulator first (a throwaway test printed each prediction's answer and each
  fault lab's failing steps; the facts tests now hold them).
- 23:40 to 23:46 Fact checks of the drafts, and the whole-lesson reads (`docs/style.md`'s second
  pass). Most drafts came back right; the ones sent back, and why, are listed under "The drafting
  profile" below.
- 23:46 to 23:52 One slip of my own process, found by reading the file after placing a redraft:
  the placement script writes the prose file whole from the drafts, so a fact fix I had made in
  the placed file ("to the code" became "to the reads and writes") was undone when the script ran
  again. Fixed by making the fix in the draft itself and placing again; every later fix was made
  in the draft first. The rule for next time: never edit a generated file by hand.
- 23:46 to 23:52 The diagram checks in the browser found three problems the content tests could
  not:
  - in the bytes lesson's scene, the address wire's bus count "4" sat on the next row's name
    "WORD" (a wide name centred over the wire below). The WORD switch moved to the top, so a
    narrow name, WE, follows the address, as in the register-file scene;
  - the shop's memory opened put the decoder on the top row, so its name left the drawing; the
    whole layout moved down one grid row;
  - at 375 pixels the memory-map scene was 12 pixels wider than the card. The signal names
    SENSOR and DISPLAY beside labels that already say "Sensor" and "Display" were dropped, and
    the scene's text summary lost the two names with them.
- 23:52 Committed the lessons with their originality notes. `main` had moved (two commits: room
  between wires, and a copyright line in every source file); merged it, with no conflict, and
  added the copyright line to the 25 new files with the repository's own script.
- 23:53 to 23:56 The mechanical half of the review: a Playwright walk of the built pages at 1280
  and 375 pixels in the light theme and 1280 in the dark, every figure's buttons pressed once and
  every select moved through its options. No console errors, no page scrolling sideways, no
  control without an accessible name, in all twelve walks.
- 00:00 to 00:08 The reading half of the review. One reviewer subagent per lesson, each with the
  same written brief (appendix: "Reviewer's brief"), read its lesson as a learner who had done
  every earlier lesson and none after, from the page's text and screenshots of every figure as
  first drawn and after every control was pressed, and checked facts against the lesson's data
  and its facts test. A sceptic subagent per lesson (appendix: "Sceptic's brief") then attacked
  each finding. The managing model saved every report and verdict unchanged. Totals:

  | lesson | findings | upheld | in part | rejected |
  | --- | --- | --- | --- | --- |
  | ram | 15 | 8 | 6 | 1 |
  | register-file | 14 | 11 | 2 | 1 |
  | bytes | 14 | 7 | 7 | 0 |
  | memory-map | 13 | 8 | 5 | 0 |

  The findings that mattered most, all upheld:
  - **bytes**: the page said ODD stops the write ("ODD is 1, so nothing is written"). In the
    circuit ODD only drives its pin; WEE and WEO are both 0 for a word at an odd address, and the
    fault lab right below shows ODD still 1 while a byte is written. And the fault lab's
    explanation named the low byte where the circuit writes the high one (the same `00` either
    way, so no number moved).
  - **bytes**: the explorer's table, shared by every memory, was captioned "Every word the memory
    keeps" with a column "Word", over rows of 8 bits, in the lesson that defines a word as two
    bytes.
  - **memory-map**: the explanation said the decoder chooses one of four parts; in the drawing
    only Y1 and Y2 are wired (the two parts that take writes), and the word selector reads A5 A4
    itself. The prediction pointed to "the table" in the investigation, which never showed the
    ROM's words; and "the table" meant both the ROM's words and the figure's table of parts.
  - **memory-map**: the fault lab's explanation gave the wrong reason for 5 of 6 failures (DISPLAY
    is checked at every step, not only at the read of the display).
  - **ram** and **register-file**: three challenge tasks said "the tests change one input at a
    time"; `runSequence` applies a step's inputs together and several steps change two or three.
    One test step was labelled "WE 0" and left WE at 1.
  - **ram**: "thousands of flip-flops", a number nobody produced, beside a memory of 256 bits; and
    "as soon as the gates settle" for a block that has no gates.
  - **register-file**: the opened figure asked the learner to watch two selectors pass different
    words, with every word unknown and no instruction to write any first.

  Rejected, with the sceptic's reason: ram F12 (title and question framed differently: normal for
  a lesson); register-file F7 (the fault lab closed in the "after" screenshot: the walk pressed the
  breadcrumb, which is how a learner closes it on purpose); bytes and memory-map none outright,
  though several were upheld only in part (for example the "word selector" label, the course's
  name for a Module 3 part, stays).

  Raised for the author, not fixed here, because they are the platform's and every lesson has
  them: the time-model note under every clocked figure ("Inputs change only while CLK is 0") sits
  above challenge tasks whose tests change inputs while CLK is 1 (register-file F2, in part); a
  fault lab's explanation is on the page before "Run checks" is pressed (memory-map F11c).
- 00:08 to 00:17 Acting on the review, code first:
  - `ram.ts`: the guard challenge's last step, labelled "WE 0", now sets WE to 0 (the label was
    false, and a failure message would have quoted it). The reference still passes and the start
    point still fails.
  - The memory explorer takes a lesson's own caption and column heading for its table
    (`caption`, `keptHeading`), so the bytes lesson's table says "Every byte the memory keeps"
    and "Byte".
  - The fault lab takes `initial` inputs, as the explorers do; the shop's fault lab first draws
    with WORD 1 and the sensor at `FF48`, like its neighbours, instead of all zeros.
  - The register-file block's drawing places its pins in the block's own port order (it was laid
    out automatically, alphabetically: RA0 above RA1, WA0 above WA1).
  - The ROM challenge's module is `room_limits`, not `lowest`: its four words are two rooms' lowest
    and highest temperatures, as the prose says. The constant's name had leaked into the page.
  - In the drawing editor, nothing changed in the end. The memory-map reviewer saw the capstone's
    AND gate with its name under "memory of bytes"; a direct test showed parts added one by one
    land clear of each other, and the collision comes from "Tidy the layout" (it is left for the
    author below). Two changes made on the way were reverted: a wider margin around a new part,
    which fixed nothing observed, and an underscore before the count in a part named after a kind
    that ends in a digit (`decoder-2_1`, not `decoder-21`), which ten drawing tests in Modules 3
    and 6 failed, because their helpers predict a new part's name as kind plus count.
  - **Main's new wire check** (room between wires, merged at 23:52) failed on the four memories
    drawn opened, which are placed by hand: buses fanning to all four registers in the order that
    must cross, select wires forced off their rows by the gates' labels, wires touching written
    values. The managing model relaid the RAM (the CLK pin moved to the top, so it leaves above
    the address pins and enters each register below D, the order the check allows; three cells
    more room before the first parts; the selector moved until A0 found a free row) and gave the
    other three to a layout subagent with the same fast loop (a dev server and a script that
    prints one lesson's problems and a screenshot). It put the register file's two selectors
    below every register output, so both fans run the same way, and widened the memory of bytes
    and the shop's memory by 3 to 5 cells. All four now pass at both widths and were looked at.
  Then fact briefs per finding to the drafting subagent, one per lesson (appendix: "Briefs after
  the review"). Of 58 keys redrafted, 53 were right first time; 5 were sent back: ram's generalisation
  (it attached the 256 flip-flops to "a memory of many words", not to the memory in the next
  figure) and a caption that no longer asked for a prediction; memory-map's question (it still
  listed pins the scene does not draw); register-file's definition, twice (it stated "a memory of
  registers gives out more than one word at once" as a general fact) and a paragraph that said
  one thing twice. The managing model's own additions: "forced to 1" in one fault label (the
  brief invited the drop), "can give" and "Such a memory is" in the register file's definition,
  a comma in "one read, or one write at a single clock edge" (a read needs no edge), "For that
  word" in the odd-address lead (so the sentence does not say WEE and WEO being 0 is a rule about
  ODD). The redrafts were spliced key by key into the placed files, so no earlier hand fix was
  undone.
- 00:17 to 00:19 The whole of each lesson read once more, from the page. Cut: a repeated
  "three lines" paragraph in the register file's generalisation. Fixed in the words: two more
  ram captions that said "you write" where the figure writes, and three places in memory-map that
  still called the ROM's words "the table" after the review gave them their own name, the limits.

- 00:19 to 00:50 The full check run twice on the way, each catching one thing: the first, the
  naming change in the editor (reverted, above); then the walk's capstone screenshot showed the
  editor overlap still there, which led to the direct test and the second revert.
- 00:50 to 00:55 The mechanical half again, on the fixed build: the same walk at 1280 and 375
  pixels in the light theme and 1280 in the dark. No console errors, no page scrolling sideways,
  no control without an accessible name, in all twelve.
- 00:52 to 01:03 `./scripts/check.sh` on the final code, to a log: exit status 0. Prettier,
  copyright, `tsc`, Vitest (413 tests in 52 files), the build, and Playwright (302 passed, 14
  skipped, as on `main`), at desktop and phone widths. `main` had not moved since the merge at
  23:52.

## The drafting profile

21 briefs before the review (a voice sheet shared by all, a fact sheet per lesson, five section
briefs per lesson, one for the views' and the checker's strings), 4 after it. The profile matched
the one CLAUDE.md warns of: facts dropped, facts wrong, meanings drifted, and once in a while a
draft that came back as a summary of what had been written instead of the text. What was sent
back before the review, and why:

- **Summaries for drafts**, several times: the subagent reported what it had changed rather than
  the words. Asked again for the text.
- **Imperative prediction questions** in four briefs ("Write the word ..."): the learner does not
  write in a prediction; the figure does. Sent back.
- **Wrong facts**: the RAM's scene summary; the AND gates named W0 to W3 (W0 to W3 are their
  outputs; the gates are andW0 to andW3); "press the clock" (the button is "Clock CLK"); "ODD when
  the address is odd" (ODD is a word at an odd address); "each part has an AND gate" (only the two
  that take writes); invented facts about the shop's customers and the display.
- **Number words where the figure prints digits**, and full stops on labels.
- **"bytes" avoided everywhere**, after a brief of mine said every earlier memory was 4-bit; and
  the register-file scene's title used the term before the lesson that introduces it.

The managing model's own additions, by fact, never by sentence: "The decoder grows too", "that
does not open", "so far", "for a word at", the label "word selector", "words" for "value"; an em
dash replaced, backticks stripped from options, full stops from captions, the bank labels in lower
case, "initialisation" spelled the British way, "Five of six" as "5 of 6"; and three cuts for
repeats (in the RAM's explorer, the register file's explorer lead, and the bytes lesson's
generalisation).

## What the checks caught, and what only a reader caught

- The content tests caught: a reference that read Q by name and found another net called Q; edits
  in a drawn challenge silently dropped because a stored drawing's block kind ("register") did not
  match the key it was placed under ("word-register"); loop warnings on the memory component;
  labels leaving a drawing; wires through parts in the first hand placements.
- The browser checks caught what the content tests cannot: a bus count on a neighbour's name in a
  scene, a scene 12 pixels too wide for a phone, a decoder's name above the top of its drawing,
  and (after merging main) crowded and crossing wires in all four memories drawn opened.
- Only the reading review caught: the mechanism stated wrongly (ODD stopping a write; the decoder
  choosing all four parts), a pointer to a table that did not exist, the same word for two
  things ("table", "word", "row"), task text that contradicted the tests' own steps, a step label
  that was false, and a number nobody produced. Every one of these passed every test.
- Only the managing model's own slow reread, after the review: three leftover uses of "table" for
  the limits, captions where "you" did what the figure did, a repeat across a join.

## What the machine design should know

- **Memory is fixed by the plan, and the module kept to it**: 16-bit words, byte addresses, the
  low byte at the lower address, a word's address even. A word at an odd address is refused for a
  write (nothing changes, ODD is 1) and read as the word at the even address below.
- **The register file is a parameterised component** (`registerFile` in
  `packages/dd-model/src/memory.ts`: any number of words, any width, two reads, one write). The
  lessons use four words of four bits and never call it the machine's.
- **The memory component holds at most 1023 bits** (the engine's words are at most 1024 bits, and
  one bit says whether a list of values was loaded). That is 63 16-bit words, or 127 bytes per
  bank. A machine with more memory needs either banks of components, as the memory of bytes does,
  or a primitive whose words live outside a single net. The HDL refuses a larger array with a
  sentence.
- **The shop's devices' addresses are lesson 4's own** (a quarter each, by the top two of six
  bits), and the lesson says so. Nothing in Module 6 fixes the machine's memory map.
- **The capstone is drawn, not written.** Writing it as text would need comparison operators and
  the conditional operator, which no lesson has taught; drawing it from the module's blocks
  needed neither.
- **SystemVerilog's `table` is a keyword**, so the ROM's array is named `limits`.

## Shared code this module changed

- `CircuitView.tsx`: more sealed kinds (word selectors, memory and ROM components, the 16-bit
  register, the byte split and join blocks), `isSealed` exported, and wide words with unknown
  bits drawn a hexadecimal digit per four bits.
- `content/lessons/lessons.test.tsx`: the wire check skips blocks no learner can open.
- `BLOCKS` in `combinational.ts`: the Module 5 register is placed under the key `register`, its
  composite kind, so a drawing stored and read back recompiles.
- `FaultLab.tsx`: an optional `initial` for the inputs as first drawn.
- `tests/educational/module6.spec.ts` copies Module 3's drawing helper rather than sharing it; the
  two should become one helper when a third module needs it.
- The SystemVerilog checker's new messages were drafted by the drafting subagent like every other
  learner-facing string, though they live in code (`packages/hdl/src/gate.ts`, `elaborate.ts`).

## For the author

Four points that belong to the platform, not this module, left alone:

1. The time-model note under every clocked figure says "Inputs change only while CLK is 0", and
   it sits above challenge tasks whose tests deliberately change inputs while CLK is 1. Scoping it
   to the figures ("In these figures, ...") would remove the contradiction everywhere.
2. A fault lab's explanation is on the page before "Run checks" is pressed, so the lead's "predict
   which ..." is answered just below it. Revealing it after the first run would keep the
   prediction honest.
3. "Tidy the layout" stacks unwired parts in one column and counts a block's label inside the
   block's own rows, though the label is drawn above it, in the rows of the part before. A gate,
   which has no label, followed by a block leaves no room: the gate's name and the block's label
   collide (the shop capstone's AND gate and "memory of bytes"). Reserving the label's rows before
   the block would fix it, and would move every figure the automatic layout places.
4. The drawing editor names a new part by its kind and a count, so a kind that ends in a digit
   reads badly: `decoder-21`, `word-register-161` (the 16-bit register's first). Setting the count
   apart needs the browser specs' helpers to change with it, in Modules 3 and 6.

## What I would change next time

- Never edit a generated file by hand: put every fix in the source the generator reads, or splice
  by key, as this module ended up doing.
- Run the browser diagram checks before the prose, not after: the four layouts that main's new
  check failed were the module's slowest work, and a layout fixed early is a layout the
  reviewers see.
- Reproduce a reported overlap before changing code for it: the first fix here went into the
  wrong function.

## Appendix

The briefs as sent. The per-lesson fact sheets and section briefs (20 files) are summarised in
"The plan" above and are not reproduced; the review briefs are reproduced for one lesson, the
other three follow the same pattern.

### The voice sheet shared by every brief

````markdown
# Shared voice and rules for every Module 6 brief

You are drafting learner-facing text for an interactive course, *Digital Design: From Bits to a
Working Computer*. Every fact in your brief has been checked against the course's simulator. Use
only those facts. Do not add numbers, values, times or claims that are not in the brief. If a
sentence seems to need a fact that is not there, write a note in square brackets instead of
inventing it.

Read the attached style checklist (`docs/style.md` in the repository at
/home/user/digital-design/docs/style.md) before you write. Every rule in it applies.

## Voice

- British English. Direct, precise, active voice, short sentences (about twenty words at most).
- The learner is "you". No marketing tone, no filler, no "in this lesson we will", no "let's".
- No em dashes and no en dashes used as dashes. Use a full stop, a colon or a comma.
- Say the point; do not label it ("that is the key idea"), withhold it ("the third part is the
  one that matters"), or wrap it in a roundabout purpose.
- No intensifiers: actually, exactly (unless exactness is the claim), really, simply, just,
  genuinely, entirely, quite.
- Use "press" for buttons and pins, never "click" or "tap".
- Markdown is allowed: `code` for values written as bits or hexadecimal and for SystemVerilog,
  **bold** for a new term at the place it is introduced, and short lists. No headings.
- A new term arrives plain English first, then the term in bold. Never use a term before the
  place the brief says it is introduced.
- Write numbers as the brief writes them. A value of bits is written in backticks, bit 3 (the
  highest) first: `0110`. A 16-bit word is written in hexadecimal in backticks, as `FF48`.

## Who the learner is

The learner has done every lesson before this module and none after. From them they know, and you
may use without explaining:

- bits, binary, a **word** (several bits treated as one number), unsigned and signed readings,
  hexadecimal (`FF48`, a digit per four bits);
- gates (AND, OR, NOT, XOR), truth tables, SystemVerilog (`module`, `logic`, `assign`, `~ & | ^`,
  vectors such as `logic [3:0] D`, `always_ff @(posedge CLK)`, `if`, `<=`);
- a **multiplexer**, which the course draws as a block labelled "2-way selector" or "4-way
  selector": select inputs choose which input reaches the output; a "word selector" does that for
  a whole word, one selector per bit; a **bus** (wires that bring one word together);
- a **decoder** (Module 3): from two select inputs S1 S0 it makes exactly one of Y0 to Y3 equal 1,
  the one whose number S1 S0 spells; the decoders lesson numbered four rooms of the shop 00 to 11
  (rooms A, B, C and D) and lit one lamp per room;
- a **comparator** (gives EQ = 1 when two words are equal);
- the D flip-flop, which takes D at a rising edge of CLK; a **register**: flip-flops sharing one
  clock that keep a word; a **load enable**, EN: at a rising edge where EN is 1 the register takes
  D, where EN is 0 it keeps its word; X, the simulator's answer when it cannot know a value; a
  register that no edge has loaded yet is X;
- the shop's story: a freezer shop with an office display; the freezer room's sensor sends a
  16-bit reading in tenths of a degree (`FF48` read signed is -184, that is -18.4 degrees); the
  registers lesson kept a number from four switches when a Save button was pressed.
- the words "counter" and "state machine" exist (an earlier lesson defines them); do not use them.

## The page's own controls (exact labels)

- Explorer figures: a one-bit input pin is a button; pressing it flips it between 0 and 1. A word
  input has a row of bit buttons under the drawing headed "Input D" (or "Input A"). Buttons under
  the drawing: "Clock CLK" (one rising edge), "Start again" (a fresh circuit: every register X).
- Pressing a block in a drawing opens it; a trail of names above the drawing leads back out.
- Prediction figures: choose an option, then press "Check my prediction"; a timing diagram then
  shows what the simulator did.
- Fault figures: a list of fault options starting with "No fault"; a button "Run checks" that
  runs a fixed list of steps and reports how many checks failed and which.
- Challenges: a drawing editor with part buttons above it; press one port and then another to
  wire them; a "Run tests" button; a hint ladder; a "Clear work" button.
- Time-model badges: "Clocked" (inputs change only between edges; at each edge the circuit
  settles).

## How to return your draft

Return every key the brief asks for, in order, each as a line `### key` followed by its text. A
list key (hints, objectives) is returned as a numbered list under its heading. Nothing else
before or after.

````

### Reviewer's brief

````markdown
# Reviewer's brief: the reading half of the review of one lesson

You are reviewing one lesson of an interactive course, *Digital Design: From Bits to a Working
Computer*, as a reader. The repository is at /home/user/digital-design. Do not edit any file in
it. The lesson is named in the message that sent you this brief, with the lessons before it.

## Who you read as

A learner who has finished every lesson before this one and none after. Modules 1 to 5 are done:
signals and words (hexadecimal, signed readings such as `FF48`), gates, Boolean logic, Module 3's
selector, decoder, adder and arithmetic block, Module 5's latches, flip-flops, the clock, the rising
edge, registers with a load enable, the words "counter" and "state machine", and SystemVerilog's
`module`, `logic`, vectors, `assign`, the bitwise operators, `always_ff @(posedge CLK)` and `if`.
In Module 6, only the lessons before this one. Their words are in
content/lessons/<id>.prose.ts and <id>.labels.ts (ids in order: registers (Module 5), ram,
register-file, bytes, memory-map).

## What to read

- The lesson as the page shows it, top to bottom, before any control is pressed:
  REVIEW/text-<lesson>.txt (the page's text, including figure labels and buttons).
- Screenshots of every figure as first drawn: REVIEW/fig-<lesson>-ix-*.png; and after every
  control in it was pressed once (predictions answered, faults checked, explorers clocked):
  REVIEW/after-<lesson>-ix-*.png.
- The lesson's data, to check facts: content/lessons/<lesson>.ts, <lesson>.prose.ts,
  <lesson>.labels.ts, and content/lessons/<lesson>.facts.test.ts (the numbers the prose states,
  pinned against the simulator). The circuits are in packages/dd-model/src/memory.ts and
  library-memory.ts.
- The course's rules: CLAUDE.md (especially "Voice", "Terms are rationed", "What no check can
  catch") and docs/style.md (the checklist every string is edited against).

REVIEW is /tmp/claude-0/-home-user-digital-design/50aad7b1-6ac6-508a-b818-dab5bee06222/scratchpad/review.

## What to look for

1. Anything a learner who has done only the earlier lessons could not follow: a term used before
   it is explained, a definite article in front of something not yet introduced, a step the page
   skips.
2. Anything the page says that the figure next to it does not show, or shows differently. This
   course's second pass asks whether the interactive showed the mechanism the prose claims.
3. Facts. A number, value, label or step name the prose states that the figure or the data does
   not produce. Check before you assert: open the facts test or the data, or run
   `npx vitest run content/lessons/<lesson>.facts.test.ts` from the repository. If you cannot
   check a fact, say so rather than asserting it.
4. A word that means two things on one page (for example: word, read, write, address, keep, row,
   table, state, edge).
5. The same argument made twice, far apart; a paragraph that answers more than one question; a
   join between two paragraphs that does not follow.
6. Style checklist faults (docs/style.md): long sentences, labels where statements belong,
   withheld points, intensifiers, idioms, mouse-only verbs, em dashes, a number spelled as a word
   that the simulator did not produce.
7. The lesson's arc: does the question get answered; does each figure earn its place; does the
   predict, build, run, break, explain, generalise loop hold; is anything missing a learner would
   need for the challenges (without giving their answers).
8. Labels, captions and titles: do they say what the section or figure contains.

## Rules for every finding

- Quote the page, exactly, for every finding.
- Suggest a direction; never rewrite the sentence yourself.
- Check every number or cross-reference before asserting it.
- Never include a challenge's answer, or any part of it, in a finding.
- Say how sure you are and how much it matters (high, medium, low).

## Output

Reply with your findings as your final message (do not write files), numbered F1, F2, ..., each
with: the quote, where it is (section and key or figure id), what is wrong, the direction of a
fix, how you checked, and severity. Keep the whole reply under about 1,800 words; report the
findings that matter most first.

````

### Sceptic's brief

````markdown
# Sceptic's brief: attack each review finding before anyone acts on it

A reviewer has read one lesson of an interactive digital-design course and written findings, given below the brief.
the message that sent you this brief, below it. Reviewers over-call. Your job is to attack each
finding independently and give a verdict, so that only findings that survive are acted on.

The repository is at /home/user/digital-design. Do not edit any file in it. REVIEW is
/tmp/claude-0/-home-user-digital-design/50aad7b1-6ac6-508a-b818-dab5bee06222/scratchpad/review.
The lesson as the page shows it is in REVIEW/text-<lesson>.txt; screenshots in
REVIEW/fig-<lesson>-*.png and REVIEW/after-<lesson>-*.png; the lesson's data in
content/lessons/<lesson>.ts, <lesson>.prose.ts, <lesson>.labels.ts; the facts the prose states are
pinned in content/lessons/<lesson>.facts.test.ts (run it with
`npx vitest run content/lessons/<lesson>.facts.test.ts`); the circuits are in
packages/dd-model/src/memory.ts and library-memory.ts. The learner has done Modules 1 to 5 and
the Module 6 lessons before this one (ids in order: ram, register-file, bytes, memory-map; words
in content/lessons/<id>.prose.ts and .labels.ts). The rules are CLAUDE.md and docs/style.md.

For each finding:
1. Check the quote is on the page, exactly.
2. Check the claim: is it true? If it is about a fact, verify it against the data, the facts test
   or the simulator. If it is about a learner's knowledge, check the earlier lessons' words.
3. Ask whether a fix would make the lesson better for that learner, or only different.
4. Give a verdict: **upheld** (true and worth fixing), **in part** (say which part), or
   **rejected** (say why), with the evidence you used.
5. Never include a challenge's answer, and never rewrite the lesson's sentences yourself.

Reply with your verdicts as your final message (do not write files), one per finding, keyed F1,
F2, ..., then the counts upheld / in part / rejected.

````

### Briefs after the review: the shared head, and the bytes lesson's

````markdown
# After the review: redraft only the keys listed below

Read `00-voice.md` (in this folder) and /home/user/digital-design/docs/style.md first. A reviewer
read the whole lesson as a learner and a second reader checked each finding. The notes below say
what is wrong in each key and list the checked facts the new text must carry. Redraft only the keys
listed, each in full (the whole key, not just the changed sentence), keeping every other sentence
of that key that the note does not touch as close to the current text as the change allows. Do
not add facts that are not in the current text or the note. Write in the "### key" format:
a line `### key`, then the text. For a list of hints or task items keep the numbered list form.
Write the result to the file named at the end, then reply with the file's contents.

## Lesson: bytes (the third lesson of the module "Memory")

Facts for the whole brief (checked in the circuit): inside the memory of bytes, gate andEven makes WEE = WE AND NOT A0 (the even bank's write enable); gate andOddWE makes WEO = WE AND (WORD XOR A0) (the odd bank's write enable), with the XOR gate xorOdd feeding it; gate andOdd makes ODD = WORD AND A0, and ODD only drives the output pin ODD. A word at an odd address writes nothing because WEE and WEO are both 0 for it; ODD reports the refusal, it does not cause it. The selector selD sends D's high byte to the odd bank when WORD is 1 (a word), D's low byte when WORD is 0.

### motivation
"That raises two questions: when you ask for the word at address 6, which address is it really?" The sentence before already answered it (the bytes are at 6 and 7). Rephrase the first question as the one the lesson answers: a word at address 6 is the bytes at 6 and 7; can one access reach both at once? Also say "one access" in plain words where it first appears: one read or one write, at one rising edge for a write. Keep the first two paragraphs.

### explorerLead
(1) "A's last bit, A0": say lowest bit (bit 0, written rightmost). (2) A bank's row is named once, with no plain meaning: say a bank's row is the place in that bank that A's bits 3 to 1 pick, the same row number in both banks. Keep the rest.

### oddLead
"When ODD is 1, neither bank receives a write." reads as if ODD stops the write. Fact: for a word at an odd address WEE and WEO are both 0, so neither bank is written, and ODD is 1 to report it. Keep the rest.

### p3Question
"Edge 2: the word `0000` is written at address `0101`." states a write that does not happen. Say the circuit tries to write it. Keep the rest exactly.

### faultsLead
"but ODD is 1, so nothing is written": same cause problem. Fact: WEE and WEO are both 0 for it, and ODD is 1. Also name the gates as the drawing labels them: one fault changes xorOdd, the XOR gate on WORD and A0 that feeds the odd bank's write enable, to an OR gate; the other replaces the NOT gate on A0 (notA0), which feeds the even bank's write enable, with a wire. Keep the five steps.

### faultsAfter
First paragraph: "still writes its low byte, `00`, into the odd bank" is wrong: for a word, selD sends D's high byte to the odd bank. The high byte of `0000` is `00`, so the numbers stay: Q shows `0048` instead of `FF48`; 2 of 5 fail. Keep the second paragraph exactly.

### explanation
(1) "It sets ODD to 1, and nothing is written." Keep the meaning, but say WEE and WEO are 0 and ODD is 1. (2) Cut the last one-sentence paragraph ("A byte read returns the byte in Q's low 8 bits, with the high 8 bits set to 0."): the page says it twice before. (3) "just as Module 1 said about how a word can be read": name the agreement: in Module 1 the sensor and the display agree on the order of a word's bits. Keep the rest.

### openedLead
(1) "The figure now shows the memory opened." The fault lab above showed the same circuit opened; this one is the same circuit, now with the inputs free to set and the table of bytes. (2) The drawing does not label WEE and WEO: say WEE is andEven's output and WEO is andOddWE's output. Keep the selD sentence.

### openedAfter
"The selectors below them": selByte, selLow and selHigh sit to the right of the banks. Keep the rest.

### readLead
"The table shows sixteen bytes": write 16. Cut "the memory itself checks them" here: c2Task says it next.

### c2Task
"lists a memory's 16 bytes by address, in hexadecimal": the addresses are in binary, the bytes in hexadecimal. Keep the rest.

### captions.predictOdd
"Predict Q after a word is written at the odd address 0101, then check." The write does not happen. Say a word write is tried.

### faults.xorToOr and faults.notA0Cut
Make the two fault labels the same pattern, each naming the gate as drawn and what it feeds: xorOdd (the XOR feeding WEO) changed to an OR gate; notA0 (the NOT feeding WEE) replaced by a wire. Short labels, no full stop.

### memoryTable.caption and memoryTable.kept (new labels)
The explorer's table in this lesson lists bytes, not words. `memoryTable.caption`: the table's caption: every byte the memory keeps, by address (a few words, no full stop, like "Every word the memory keeps, by address"). `memoryTable.kept`: the heading of the column of kept values: one word, "Byte".

Write to: ../drafts/by-R1.md

````
