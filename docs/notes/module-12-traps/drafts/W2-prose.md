construction:
All four handlers skip the store, as the investigation's handler did, and each saves R5 at `408` first. They differ in which registers they write after that, and where each register is put back from.

investigation: The figure runs the same program with a handler that saves R5 first and puts it back last. The watch shows R5 and the word at `408`. The control registers are shown too. The steps below say when to read C2 there.

savedLead:
1. Press "Run to a breakpoint". The run pauses at the handler's first line, `01C`, with R5 holding -184.
2. Press "Step": the word at `408` takes -184.
3. Keep pressing "Step". Watch R5 change. At the line at `030`, `C2 <= R5`, C2 in the control registers takes `014`. Just before `resume`, the handler puts R5 back: R5 takes -184.
4. Press "Run to the end". C2 still holds `014`: `resume` reads C2 and does not change it.

failureExperiment: A handler could save R5 on the stack, below the word R14 names, as a function does.

The figure runs a program whose stack started in the wrong place: it set R14 to `400`, the bottom of the RAM, instead of `7C0`, the top. (Module 11 said a stack started in the wrong place leads to cause `34`.)

Its first push stores at `3F8`, in the ROM, and faults; R14 then holds `3F8`.

The handler's first line stores R5 at R14 minus 8.

timelineLead:

The figure is the trap timeline of the same run, with the saving handler.

The first press of "Next edge" shows edge 4, `R0 <= 0`, the edge before the trap. Only the timeline shows each edge's transfers.

Edge 5: the store at `010` traps. That one edge makes five transfers: C2 ← `010`, C1 ← `01`, C0 ← `01`, C3 ← `34` and PC ← `01C`.

Edges 6 to 12 run the handler's lines up to `resume`. Each makes two transfers: one register or one word, and the PC.

Edge 6 saves R5: `word[408]` ← -184. Edge 12 puts it back: R5 ← -184.

Edge 13: `resume` makes two transfers: C0 ← `01` (C1's word) and PC ← `014`.

generalisation: The calling convention lets a function change R0 to R9: R1 to R4 for the arguments, R1 for the result, and R0 and R5 to R9 as free registers. The caller made the function call, so it knows those registers may change.

The motivation above says why a handler cannot have that rule.

Each register a handler writes costs two more instructions: a save and a put back. So a handler writes as few registers as it can.

c2Task:

The starting text's handler counts each refused store in the word at `400` (`word[0x400]`) and skips it. It writes R5 and R6, and saves neither.

Change the handler so that every register, R0 to R15, holds after `resume` what it held before the trap. The count and the skip must still work.

There are 3 tests. Each adds a program after yours, named `program`, and runs all of it from reset. Each program puts a word of its own in every register, R0 to R15, a different set in each test, and ends at its last line, `end: stop`.

Test 2 changes R5 and R6 between its two refused stores.

Test 3's stack started in the wrong place: it sets R14 to `0x400` and pushes, so its push faults in the ROM, and its R14 then holds `3F8`.

Each test checks the count at `400`, every register from R0 to R15, C3, the causes in order, and that the run stops at the program's `end`.

c2Hints.0: The idea: save each register the handler writes with an absolute store, before the handler's first write to it, and put each back from the same word just before `resume`.

c2Hints.1: A common mistake: saving on the stack, below R14. In test 3 the stack started at `400`, so a save below R14 lands in the ROM and faults.

c2Hints.3: Part of the answer: the starting handler writes two registers, R5 and R6, so it needs two words to save them in. The count lives at `400`, so use other addresses, such as `408` and `410`.

