# Module 8: the reviewers' findings, for the sceptic

Each line is one reviewer's finding, condensed, with its quotation. The lessons as text are in
`/tmp/claude-0/-home-user-digital-design/0286cc8a-058f-5d56-b609-2c7c4dc92093/scratchpad/lessons/`
(8.1 to 8.5); the figure is `packages/dd-views/src/interactives/DatapathFigure.tsx`; the lessons'
data and words are `content/lessons/{instructions,constants,fetch,memory-access,branches}*.ts`;
the facts tests beside them pin the numbers.

## 8.1 instructions

- 1A. Prediction answer visible before commit: the Buses table shows RESULT = 66 and the drawing
  shows live values while the question is open; only the clock button is gated.
- 1B. The field layout (K kind, J job, A, B, Y, C constant) is never laid out before the
  prediction uses it; "K, J's bit 3 and C go nowhere yet" to a learner who cannot say what K and
  C are.
- 1C. One-letter names double: A, B, Y are digits and ALU ports; "job" is J (4 bits) and the
  ALU's 3-bit code; why J is 4 bits is not said.
- 1D. `R3 ← R1 - R2` used before the arrow is explained; "register transfer" in the
  generalisation never introduced; "held at 0" where Module 7 said "stuck at 0".
- 1E. The investigation's after-text ("With WRITEY at 0, RESULT still shows 66"; "-183", "-182,
  then -181") depends on the order the learner pressed things; does choosing an instruction reset
  the registers?
- 1F. Failure experiment asks "say which register the edge will write" with no control to record
  it; results visible before the press.
- 1G. The jobs challenge wires IR's bits straight to the register file and never uses the digits
  module, while the prose says "the digits are wires from the `digits` block".
- 1H. Repeats: "WRITEY is set by hand" four times; "a later module builds that block's insides"
  twice; "the digits are wires" three times; "one edge does one instruction" three times.
- 1I. "32,768 register jobs" counts encodings although unused digits are ignored; "These work out
  RESULT" has an unclear subject.

## 8.2 constants

- 2A. The construction gives the widening challenge's answer as code before the challenge: "when
  C[11] is 0, W is `{52'h0, C}`; when C[11] is 1, W is `{52'hFFFFFFFFFFFFF, C}`".
- 2B. Prediction answer visible: R2 holds -250 in the shown registers, the same as the answer;
  and the figure's live values are not gated.
- 2C. "numbers held nowhere else: ... even the limit -250 itself" while R2 holds -250 (room B's
  reading) in every figure; "limit" and "reading" are two senses of one number.
- 2D. The BCONST fault is half given away in its lead ("R0 is X"; "QB, which is the data output
  of the register file's read port B"); motivation says "B is unused" yet the fault makes the B
  digit matter.
- 2E. Generalisation: "Every ALU job uses a constant ... Count up and count down ignore the
  constant" contradicts itself; "A larger number takes two instructions" is not true in general.
- 2F. Names: "mask" undefined; "W" in construction vs "WIDE" in the figure; B means three things;
  "constant job" and "widen" not rationed.
- 2G. "The selector carries out a choice that the instruction kind makes" while BCONST is set by
  hand; "The constant's bits are wires leading into the `widen` module, as the register B's bits
  are wires leading into the register file" adds nothing.
- 2H. The challenge's step "changes IR and BCONST while the clock is high" is never explained.
- 2I. "In the last lesson ... In that lesson" twice in four sentences; "Copy B gives the ALU's B as
  its Y" hard to parse; prediction paragraph dense, repeats 8.1's interface instructions.
- 2J. Hint 2 of the widening gives the error value 3846; `constants-text` says "plus one module
  used inside another" although the start text already uses one.

## 8.3 fetch

- 3A. Prediction answer visible: the status line "Stops at next edge: ..." shows while HALT is 1,
  not gated on commit; the drawing shows HALT 1.
- 3B. GO is written into the counter challenge before the lesson explains it ("GO is 1 unless the
  machine is stopping" vs later "1 unless HALT is 1").
- 3C. CAUSE, CAUSED, CAUSEF: suffixes unexplained; "cause 00" for both "no problem" and `stop`.
- 3D. "decides whether this edge stops the machine. It gives HALT (1 means the next edge stops
  the machine)": this edge or the next?
- 3E. "Watch IR change as soon as PC does" but the figure shows only settled states after each
  press.
- 3F. "block "register", named pc" is drawing-tool jargon.
- 3G. Repeats: ROM size twice; decoder rules in prediction and explanation.
- 3H. Distractor "Stops at the end, cause 00" raises a misconception the lesson never raised.
- 3I. "In this lesson PC only counts up by 4, so neither check can fire yet": a full ROM of
  instructions would reach `400`.
- 3J. "The tests run 11 steps and check PC in 10 of them" while the visible step list has five
  edges.
- 3K. R1 is room A in 8.1 but the limit in the margin program; roles swap.

## 8.4 memory-access

- 4A. Prediction answer visible: the Buses table shows MQ and YIN = -184 and RESULT = `7D8`
  before commit.
- 4B. The prediction text states the mechanism before asking ("AZERO chooses 0 for an absolute
  address", "LOAD chooses MQ").
- 4C. "the ALU's add gives the address" said four times; reflection restates the motivation.
- 4D. Byte loads and stores are stated, never shown or tested.
- 4E. The memcheck task leans on "the rules above"; timer `7E8` and waiting `7F0` writable
  devices never named, so "store at a device" is unclear.
- 4F. "word" for 8 bytes and in "word selector"; "memory" for the block, the address space and
  the RAM.
- 4G. The motivation section holds only encoding facts; the why is in the question.
- 4H. The memory-text task says the tests check the display and lamps, but the test names show
  only PC.

## 8.5 branches

- 5A. Prediction answer visible: Buses table shows NEXT = `00C` before commit.
- 5B. The capstone steps the register copy at `00C`, not the branch; the section is about the
  next-PC block and the branch. Step numbers 42, 43, 79 must be pinned.
- 5C. The condition table appears four times (motivation, construction, task, hint 5): the
  challenge is transcription.
- 5D. "Any other job gives 0" untested: tests cover jobs 0 to 7 only.
- 5E. "a new block, 'word for Y'" is not new: 8.4's pickLoad was the selector; say it grew.
- 5F. The failure experiment asks what the display will show; under MET held at 1 the display is
  never written.
- 5G. Call and jump: no prediction, "target" not introduced, after-text repeats itself.
- 5H. Notation: "PC + 4c" and "PC + 4 × (-2)"; some listings give words, some not; "state" for the
  values; "-25.0 degrees" unit switch unmarked.
- 5I. Model versus reality: "passing value" undefined; "A load's path is the longest" unchecked.
- 5J. "One block stayed closed in every lesson: the decoder" while memory, stops and registers are
  closed modules too.
