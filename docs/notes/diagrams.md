# Five drawings: four scenes and a sum on paper

The signals lesson's drawing of the sensor, the cable and the display let a learner see the
question before reading about it. The author asked whether other lessons would gain from one, and
approved five: a scene under the question of `gates`, `selectors`, `decoders` and `registers`, and
a sum on paper in the motivation of `adders`.

## What each one shows

A **scene** (`scene`, `SceneFigure.tsx`) draws where a lesson's signals come from and where they go:
the sources on the left, in the rooms the lesson names; a dashed box marked `?` for the circuit
the question asks for; and the lamps or readout it drives. A wire carries its signal's name only
where the lesson has named it by then; a wire carrying a word is drawn wide, as the circuit
drawings draw one, with a slash and its count.

- **gates**: the freezer room (named as the signals lesson's drawing names it) with a sensor on
  WARM and the door switch on DOOR, into `?`, out on ALARM to a lamp. CLOSED is left out: ALARM's
  rule does not use it, and the drawing is of the question's circuit.
- **selectors**: rooms A and B, each a sensor on 16 wires, and the switch on S, into `?`, out on
  16 wires to the display. The office is not drawn: the switch is in it, beside the display, and
  a drawing that put the display in the office and the switch outside it would be wrong.
- **decoders**: switches on S1 and S0 into `?`, out on Y0 to Y3 to a lamp for each room.
- **registers**: the four switches on 4 wires, the Save button, the clock on CLK, into `?`, out on
  4 wires to the display showing `0000`, the value the question asks for at power-on. The load
  enable and the reset are not drawn: the lesson names them later.

None of them draws a device box around the circuit: no lesson says where its circuit sits.

A **sum on paper** (`column-sum`, `ColumnSum.tsx`) writes two words in columns, the sum under a
rule, and each carry as a small 1 above the column it goes into, with an arc from the column that
made it. The carries and the sum are the model's (`columnSum` in `dd-model/bits.ts`). The adders
lesson adds `0011` and `0011`: a carry made in one column and passed on by the next, through a
column that adds three 1s. 3 + 3 was chosen over a larger sum such as 6 + 7, whose 4-bit result
reads as -3 signed: that is the lesson's overflow, and the motivation should not run into it
before the lesson does. The motivation's last two sentences moved under the figure unchanged, so
"Start with the rightmost column" still leads into the prediction.

## Fitting a phone

Each drawing is one unit per pixel, so its 12-pixel text keeps its size, and its gaps are as
narrow as their names allow. All five fit a 375-pixel phone's figure card without scrolling. The
labels were briefed with hard length limits for that, and the browser suite now fails any scene
or sum on paper that scrolls sideways, at either width. Narrow drawings are centred, as circuit
drawings are.

## How the words were made

Five fact briefs to the drafting subagent, one per figure, each with the text the figure sits
under, what the drawing shows mark by mark, the words the lesson has not yet introduced, and hard
length limits. The selectors and registers briefs said the learner has not met the slash and
count, so the caption must say what a thick line marked with a number means. The first draft of
the registers brief claimed the circuit drawings mark a wide line with its count; they do not
(they draw it wide in one colour), and the brief was corrected before it went out.

Every first draft came back with a wrong or missing fact, most from one gap in the briefs, which
said where a label sits but not what it names. Each was sent back with a note:

- gates, selectors, decoders: labels that repeated the wire's signal (WARM, S) or named no part
  ("Select", then "Bit"), where the label names the part; a summary saying a sensor "sends WARM
  when the freezer room is warm", which reads as if the wire carries nothing otherwise; the title
  "Switch selector circuit" for a circuit that is not the selector; the box said to "show" the
  circuit, and later to stand for "the circuit we must design" (the course says "you").
- adders: "You add" for a drawing the learner only reads, and a carry that "appears"; a summary
  that did not say what is added or what it comes to.
- registers: "the thick line marked 4 carries four wires", then "one from each switch", which is
  false of the second thick line; "labeled"; the clock "labelled CLK", where CLK names its wire.

The gates labels also came back in lower case, against every other drawing's capitals, and were
sent back for that. Cut by the managing session: the adders caption, which repeated the lead's
sentence about how a carry is written, is now "Adding 3 + 3 in binary."

Also changed: every caption in the adders and decoders lessons now ends with a full stop, as
every other lesson's captions do.

## The checks

- Unit tests (`scene.test.tsx`): a scene draws each source in its room, the circuit's box and
  each output with their names, buses with their counts, and a readout's label inside it when it
  has no value; a sum on paper writes the model's carries above the columns they go into, a carry
  out as one more digit, and refuses two words of different widths.
- `columnSum` is tested in `dd-model` against 6 + 7 and 15 + 1.
- The content tests fail a scene that names a signal none of its lesson's challenges uses, so a
  renamed signal cannot leave a drawing behind.
- `adders.facts.test.ts` pins the lead's numbers (3 + 3 = 6, carries into the second and third
  columns, none out, and a sum that fits both readings). The registers scene's `0000` is the
  constant the reference register resets to, and `registers.facts.test.ts` pins it to the
  question.
- `diagrams.spec.ts` checks every scene and sum on paper for label collisions and, now, for
  sideways scrolling, at desktop and phone widths. The content test, the sum's facts test and
  the scrolling check were each seen to fail on a broken input (a wrong signal name, a wrong sum,
  a label too long for a phone) before they were trusted.
