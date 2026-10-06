# Lesson fact sheet: "register-transfer" (Module 5, lesson 3)

Read the shared fact sheet (00-module.md) first. This sheet holds the facts of this lesson. The
learner has also done the previous lesson, on counters: a **counter** is a register whose D is
its own Q plus one, from a chain of half adders; EN decides whether an edge counts; RST starts it
at `0000`; TICK is 1 while the count is `1111` and EN is 1. You may use "counter".

## Terms this lesson introduces, and where

| term | where | plain meaning |
| --- | --- | --- |
| register transfer | the explanation (key `explanation`) | at an edge, a register takes a word worked out from registers' values before that edge; written NOW ← IN, PREV ← NOW |

Before the explanation, do not write "register transfer" or "transfer". Say "takes", "moves",
"passes". This lesson must not use: state, state machine, state diagram, next-state, one-hot,
synchronous, encoding.

## The story of this lesson

The registers lesson's display shows the number four switches held at the last press of Save.
Now the office wants a second display, PREV, that shows the number saved before that one, so
staff can see what changed. The first display is NOW. At an edge where SAVE is 1, NOW takes the
switches (IN) and PREV takes NOW, at that one edge. The lab does the same for the freezer
room's 16-bit readings, with an undo.

## The circuit (library circuit now-prev)

- Inputs IN (4 bits, the switches), SAVE, RST, CLK. Outputs NOW and PREV (4 bits each).
- Two 4-bit registers with a reset and a load enable, "now" and "prev". Both have EN = SAVE, the
  same RST and the same CLK. now's D is IN. prev's D is now's Q, the word NOW.
- At an edge where RST is 1, both become `0000`. Otherwise at an edge where SAVE is 1, NOW takes
  IN and PREV takes NOW, both at that edge.
- PREV takes the value NOW had just before the edge, not the new one. Every flip-flop takes its D
  at the same edge, and D was worked out from the Q values before the edge. The shift register
  of the registers lesson did the same, one bit at a time.

## The figures and what they show (all checked)

- Scene under the question (`transfer-scene`): switches (4 wires, IN), a Save button on SAVE, a
  clock on CLK, into a box marked ?, out to two 4-bit displays, NOW and PREV.
- Prediction 1 (`predict-prev`, now-prev): a reset; then IN `0011` with SAVE 1 for one edge;
  then IN `0101` with SAVE still 1 for one more edge. Watch PREV. Answer `0011`. Options
  `0011`, `0101`, `0000`. At the second edge NOW took `0101` and PREV took `0011`, the NOW of
  before the edge.
- Investigation explorer (`now-prev-explorer`, Clocked): starts after a reset, NOW `0000` and
  PREV `0000`. Press bits of IN, press SAVE to 1, press "Clock CLK": NOW takes IN, PREV takes the
  old NOW. With SAVE at 0, an edge changes nothing. Each register block opens to its four
  flip-flops.
- Failure experiment, prediction 2 (`predict-long-press`, now-prev): a reset; IN `0011` saved
  with SAVE 1 for one edge; SAVE 0 and IN `0101` for one edge; then SAVE pressed and held at 1
  for three edges ("press 1", "press 2", "press 3"). Watch PREV. Answer `0101`. Options
  `0011`, `0101`, `0000`. A person's press lasts many edges: the clock does not wait for the
  finger. The first edge of the press saved `0101`, and PREV took `0011`. The second edge saved
  `0101` again, and PREV took NOW, which was now `0101`. The older number, `0011`, is lost.
- Failure experiment, explorer (`save-once`, library circuit now-prev-once, Clocked): the fix. A
  flip-flop, "last", takes SAVE at every edge, so its Q, OLD, is what SAVE was at the edge before.
  A NOT gate and an AND gate make STEP = SAVE AND NOT OLD. STEP is 1 only before the first edge
  of a press: after that edge OLD is 1. STEP drives both registers' EN in place of SAVE. The
  figure starts with NOW `0011`, PREV `0000` and IN `0101`, SAVE 0. Press SAVE to 1 and press
  "Clock CLK" three times: after the first edge NOW is `0101` and PREV `0011`; the second and
  third edges change nothing. Release SAVE (press it to 0), clock once, and a new press saves
  again.
- Generalisation figure (`now-prev-as-text`, circuit-text): the NOW and PREV circuit drawn as
  blocks beside its text, which the course writes as two `always_ff` blocks:

  ```
  always_ff @(posedge CLK) begin
    if (RST) NOW <= 4'b0000;
    else if (SAVE) NOW <= IN;
  end
  always_ff @(posedge CLK) begin
    if (RST) PREV <= 4'b0000;
    else if (SAVE) PREV <= NOW;
  end
  ```

  `PREV <= NOW` reads NOW's value from before the edge. The order of the two blocks, or of two
  lines inside one block, does not matter: every `<=` takes its value at the same edge. Writing
  the two lines in one `always_ff`, inside `if (SAVE) begin ... end`, makes the same circuit.
- Challenge, prediction 3 (`predict-swap`, library circuit swap): two 4-bit registers X and Y.
  X's D comes from Y's Q, and Y's D from X's Q, through a word selector each, which takes A
  (for X) and B (for Y) instead while LOAD is 1. The run: LOAD 1 with A `0011` and B `0101`, one
  edge (X `0011`, Y `0101`); then LOAD 0, one more edge. Watch X. Answer `0101`. Options `0101`,
  `0011`, `XXXX`. The two registers swap their words at one edge: X takes Y's old word and Y takes
  X's old word. In software, swapping two variables needs a third to keep one of them; here no
  third register is needed, because both take their D at the same edge.

## The challenges

- `now-prev` (draw): inputs IN (4 bits), SAVE, RST, CLK; outputs NOW and PREV (4 bits). The part
  offered is "4-bit register" blocks with inputs D, CLK, RST, EN and output Q (at an edge where
  RST is 1, Q becomes `0000`; otherwise where EN is 1, Q takes D). 7 tests, including one where
  SAVE falls while CLK is 1 and one where SAVE rises while CLK is 1. The reference: register
  "now" with D from IN, register "prev" with D from now's Q; SAVE to both EN; RST and CLK to both;
  now's Q to NOW, prev's Q to PREV.
- `readings` (write): the office keeps the freezer room's last two readings, 16 bits each. Inputs
  IN (16 bits, the reading), NEW, UNDO, RST, CLK; outputs NOW and PREV (16 bits). At an edge:
  if RST is 1, NOW and PREV become `16'h0000`; otherwise if NEW is 1, NOW takes IN and PREV takes
  NOW; otherwise if UNDO is 1, NOW takes PREV back and PREV keeps its value; otherwise both keep
  their values. The header is given. 7 tests, using the readings `FF48`, `FF06` and `0012`,
  including an edge where NEW and UNDO are both 1 (NEW wins), an edge where RST and NEW are both
  1 (RST wins), and NEW falling while CLK is 1. `16'h0000` is a 16-bit value written in
  hexadecimal (the `'h`). The reference uses one `always_ff` with `if (RST) begin ... end else if
  (NEW) begin ... end else if (UNDO) NOW <= PREV;`.

## Model versus hardware (facts)

- In the model every flip-flop takes its D at the same instant. In hardware the clock reaches
  different flip-flops at slightly different times. PREV taking the old NOW relies on NOW's
  flip-flops changing a little after the edge, later than PREV's flip-flops need their D to stay
  steady (their hold time): the registers lesson's shift register relied on the same.
- The fix for a long press assumes SAVE changes only between edges. A real button bounces: its
  contacts open and close several times in the first few thousandths of a second, so a real
  circuit also waits for the button to settle before it believes a press. The model's button
  does not bounce.
