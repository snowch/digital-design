# Digital Design learner wording and interface review

## Opening check

The published baseline was `31ecb23` on `main`. The course lists 61 lessons across
Modules 0–13 and the two optional Beyond lessons. The index and **Before you start**
bring the total to 63 learner routes. The published lessons render 485 figures and
121 challenges. The index has one additional figure.

The course assumes binary-to-decimal and decimal-to-binary conversion and everyday
arithmetic. It starts with no assumed electronics, circuit-building or programming
experience. Each lesson can rely on concepts already introduced in its prerequisites.
The optional compiler and kernel lessons build on later modules.

The review follows the user’s wording and interface rubric and both of the
repository’s reading passes. Check each action against what the page prepares,
what the learner can edit, when to act and what output to inspect. Read headings,
labels, task prose, examples, feedback and optional material in order. Keep the
essential investigation visible and ask for reasoning from named evidence. Check
model claims against the simulator and distinguish a deliberate failed check from
an execution or storage error. Preserve the saved-work contract.

The opening Chromium sweep visited all 63 public routes at 375 CSS pixels in dark
mode and found no initial horizontal page overflow. The initial reading identified
instructions for unavailable controls in open circuit blocks, a worked ALU sum
with operands left over from the previous experiment, and debugger instructions
whose button label changes before the run ends. Other findings are checked against
the simulator, grading cases and actual figure controls before revision.

`CLAUDE.md` requires independent reading and prose drafting, and an unedited
platform copy. The available agent runtime does not provide Haiku. Independent
reviewers and lightweight drafting agents are used in its place. Changes to shared
wording and the storage notice belong to this course’s shell, with the platform copy
left pinned to its current source.

## Closing check

The independent reading pass covered the index, the preface, all ten sections of
each lesson, the figure leads and captions, predictions and feedback, the
challenge tasks and hints, and the model notes. Reviewers checked the findings
against figure configuration or implementation. The second pass read affected
sections in lesson order and checked the wording against the controls on screen.

| Routes | What the review checked |
| --- | --- |
| Index and Before you start | Binary conversion requirements, optional self-check, model scope, browser storage and the purpose of the lesson controls. Removed a repeated absolute privacy claim. |
| What computers do, Inside the machine, Signals | Display and register update order, prepared vs editable values, when the slice and fault values become available, exact noise-margin evidence, and which words the sensor sends. |
| Gates, NAND, Fewer gates, Selectors, Decoders, Adders, ALU | First drawing actions and optional source, the all-zero table case, settled vs passing values, what equality can establish, carry-in setup and fixed-width subtraction. |
| Remember, Registers, Counters, Register transfer, State machines, State encoding | Assertion and release order, clock sampling and gate delay, the count edge that wraps, how to save a second word, reset feedback and the scope of named state codes. |
| RAM, Register file, Bytes, Memory map | Address choices vs installed capacity, starter contents, returning to the outer circuit to set pins, odd word read and write evidence, and the optional parts starter. |
| ALU jobs, Flags, Wide ALU, ALU tests | Existing job codes and fault checks, which input and flag to inspect, where select pins are editable, and seed-specific counts. |
| Instructions, Constants, Fetch, Memory access, Branches | Prepared joins, bus values before a write edge, ROM settling in the trace, port widths, and the transient HALT value. |
| Control signals, Illegal instructions, Several edges, Micro-operations, New instruction | Decoder inputs, what the current model does with an illegal instruction, why a broken store can advance the PC, the GO condition, and the jump's constant. |
| Instruction set, Encoding, Immediates, Room to grow, Design an instruction | The comparison's boundary rule, which instruction words supply an encoded job, what a target calculation measures, unknown operands in accidental instructions, and the signed less-than example. |
| Assembly, Lists, Functions, Stack, Recursion, Debugging, Log report | Which answers a challenge asks for, caller vs callee state, reaching the function before its pushes, and the control that finishes a run after the last breakpoint. |
| Traps, Saving state, User mode, System calls, Interrupts, Nesting, Trap hardware, System call mechanism | Counts and test scope, the registers a returning handler restores, the saved trap snapshot, jobs that end the program, the pending instruction, and the timing cursor. |
| Whole machine, Full path, Tracing, Final machine, Capstone | The rise and fall of the clock, matching words across levels, how to verify a traced value, what a fault with no handler does, and when the prepared trace unlocks. |
| Compiler and Kernel | Expression ordering, valid device names, actual execution order, the scope of the timer count and hypothetical interrupt positions. |

The builder places wiring and keyboard instructions before the controls. The
result heading names an execution error once, while the result gives its reason.
The shell shows a storage warning only when a write leaves a newer copy in the
open tab. The underlying saved keys and artifacts remain compatible. A memory-only
draft survived navigation, and a subsequent successful write survived reload.

### Functional evidence

- Chromium rendered all 63 routes at 375 and 820 CSS pixels in dark mode and at
  1440 in light mode. Each sweep found 477 top-level lesson interactives and
  121 challenges, with no missing figure and no initial horizontal page overflow.
- Direct keyboard walkthroughs reproduced the ALU's three sums, the ladder's
  prediction and scope controls, and the capstone trace becoming available.
  Four debugger runs reached their final stops using the changed button label.
- The phone tests stepped through the two noise recordings and threshold choices.
  The byte-memory exercise wrote two bytes at an even address, refused an odd
  word write, and displayed ODD with WEE and WEO both zero. The blocked-storage
  check reached the warning at 320 CSS pixels in dark mode and verified
  persistence after a successful write.
- The protected platform copy, lesson IDs, challenge IDs and storage schema stay
  intact. The repository suite independently grades reference and wrong work,
  checks figures and tests layouts in the production build under its Pages path.

These checks establish that the revised actions and evidence work. The review
collected no evidence of learning effectiveness.
