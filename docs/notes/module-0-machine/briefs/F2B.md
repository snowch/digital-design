# Fix brief F2B: lesson 0.2 after the review: construction to the end

Read `00-module.md` (this folder), `F2A.md` (its wds to keep apart and its facts), `docs/style.md`,
and the lesson's current wds in `content/lessons/inside-the-machine.prose.ts`. Redraft only the
keys below, each whole. Lengths in wds.

## Facts

- The construction's challenge: room A -180, room B -250, paused before line 3; the part that adds
  gives 70 = 64 + 4 + 2. The learner types the 1s and 0s the eight slices of least worth give, the
  slice worth 128 first, the slice worth 1 last: `0100 0110`. There are 2 tests: one checks the
  slices worth 128, 64, 32 and 16; the other the slices worth 8, 4, 2 and 1.
- The failure experiment's figure: the machine, paused before line 3 with -184 and -250, with a
  choice: nothing stuck, or the wire SUM in the slice worth 2 stuck low, at 0, whatever drives it.
  Its drawing is the half of that slice's adding part that makes the sum (the ladder's last
  level). With the wire stuck, look before running: the smallest part that makes the sum gives 1,
  and the wire SUM leaving the half stays low. A question asks what the display will show when the
  machine runs on; it is read off the stuck machine: 64. Its numbers and buttons wait for the
  answer.
- After the stuck machine runs to its stop: the display shows 64, not 66; the slice worth 2 gives
  0, so the part that adds gives 64; every line ran as before; nothing says anything is wrong.
- After a healthy run, R3 keeps 66; the part that adds has moved on to other lines' numbers.
- The course has you test each part you build before a later lesson uses it as a box.

## Keys

- construction (under 40 wds): you read 66's 1s and 0s off the slices; now do it for new
  readings, from the readings to the slices. (Not "the other way": the prediction went the same
  way.)
- slicesLead (one sentence): the ladder above shows the method on 66.
- c1Task (under 100 wds): facts above, 2 tests.
- c1Hints.1 to c1Hints.5 (one or two sentences each; no rung names): the slices give line 3's
  number, R1 minus R2, in 1s and 0s; the mistake: the readings, not their difference; for 66 =
  64 + 2 the eight give `0100 0010`; line 3 gives 70; the answer `0100 0110`.
- stuckLead (under 80 wds): what the figure and its drawing are; choose the stuck wire; look at
  the drawing before running: the part gives 1, the wire stays low; then answer the question.
- stuckQuestion (one sentence): with the wire stuck, what will the display show when the machine
  runs on to its stop?
- stuckExplain (under 50 wds; shown after the answer and a run): 66 is 64 + 2; the slice worth 2
  now gives 0, so the part that adds gives 64 and line 3 puts 64 into R3; line 4 shows it.
- stuckAfter (under 60 wds; shown once the stuck machine has run to its stop): every line ran as
  before; the program stopped normally; nothing on the page says anything is wrong; 6.4 degrees
  looks like a reasonable gap; one wire deep inside the part that adds changed what the shop sees.
- explanation (under 120 wds): each level is the level below seen from further away. While line 3
  waits, the 66 is the 1s and 0s on the slices' outputs, each a wire, high or low; when line 3
  runs, R3 takes it. So a fault at the bottom shows at the top as a wrong number, and nothing at
  the top can tell: the display had no way to know the 2 was missing. That is why the course has
  you test each part you build before a later lesson uses it as a box.
- generalisation: keep it; under 130 wds.
- tracePausedLead (one sentence, no repeat of "paused before line 3", which the figure says): the
  rooms read -120 and -250 this time.
- traceLead (one sentence): trace the next line from the figure above.
- c2Task: keep it, but say "paused before line 3" only if no nearby text does; under 100 wds.
- reflection (under 80 wds): the machine is parts inside parts; one stuck wire changed what the
  shop sees. End with the question Module 1 starts from: how does a voltage on one wire become a 1
  or a 0, and many of them a number? (No repeat of "the course climbs the ladder from the bottom".)
- modelVsReality (under 110 wds): keep it, but drop "noise" (the learner has not met it) or say it
  in plain wds: a real wire's voltage moves between high and low, and nearby wires and motors
  push it about.
