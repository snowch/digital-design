# Brief CE: counters, labels

Read 00-module.md and C-facts.md first. Draft these short labels. Each is a few words; a caption
is one sentence ending with a full stop. Titles and headings have no full stop. Before the
investigation's figure, nothing may say "counter": that means `title`, `titles.question`,
`titles.motivation`, `titles.prediction`, the captions `scene`, `predictWrap`, `predictPause`,
and all option labels. The word "count" is fine.

- `title`: the lesson's title, a question: how does a circuit count?
- `objectives` (three, each starting with a verb): build a counter from a register and half
  adders and say why it counts; say what happens after `1111` and why a counter needs a reset;
  make a counter start again at a chosen number with a comparator.
- `titles.question`, `titles.motivation`, `titles.prediction`, `titles.investigation`,
  `titles.construction`, `titles.failureExperiment`, `titles.explanation`,
  `titles.generalisation`, `titles.challenge`, `titles.reflection`: a heading per section, a few
  words naming what it contains. The sections: (question) measuring a wait by counting edges;
  (motivation) a register fed by an adder of its own Q; (prediction) after 16 edges, and with EN
  0; (investigation) the 4-bit counter running; (construction) a 2-bit counter drawn; (failure)
  three faults and a counter never reset; (explanation) the carry passing along the chain between
  edges; (generalisation) counting to `0101` and starting again; (challenge) the 4-bit counter
  with TICK; (reflection) what decides the next number.
- `challengeTitles.c1`: the 2-bit counter, drawn. `challengeTitles.c2`: the 4-bit counter with
  TICK, drawn.
- `captions.scene`: the display must count edges while Count is on. (Name what the drawing is
  about.)
- `captions.predictWrap`: predict Q after 16 edges from `0000`, then check.
- `captions.predictPause`: predict Q when EN goes to 0 after two edges, then check.
- `captions.counterExplorer`: reset it, then press Clock CLK and watch Q go up by one.
- `captions.buildCountTwo`: draw a 2-bit counter and run the tests.
- `captions.counterFaults`: choose a fault and run the checks.
- `captions.predictNoReset`: predict Q after three edges with no reset, then check.
- `captions.addOne`: press EN and move the slider to see the carry pass along the chain.
- `captions.countToFive`: press Clock CLK and watch TICK light at `0101`.
- `captions.buildCountTick`: draw the 4-bit counter with TICK and run the tests.
- `faults.carryCut`: the wire C2, ha1's CARRY into ha2, fixed at 0 (a few words, such as "C2
  forced to 0"; the earlier lesson's fault labels read "KEEP wire forced to 0", "EN forced to 1",
  "OR gate changed to AND": keep that shape).
- `faults.enHigh`: EN fixed at 1, in that shape.
- `faults.xorToOr`: ha0's XOR gate changed to OR, in that shape.
- `options.p1Zero`: Q is `0000`. `options.p1Stop`: Q is `1111` (it stops at the largest number).
  `options.unknown`: the simulator cannot know Q (`XXXX`). `options.p2Kept`: Q is `0010`.
  `options.p2Counted`: Q is `0101`. `options.p2Zero`: Q is `0000`. `options.p3Three`: Q is
  `0011`. `options.p3Zero`: Q is `0000`. Options are shown as plain text: write the bits
  without backticks. Keep one shape: "Q is 0000". The earlier lesson's unknown option read "The
  simulator cannot know Q (XXXX)".
- The scene's labels (each one or two words, short enough for a phone): `scene.count` (the
  switch on EN, which turns counting on), `scene.reset` (the button on RST), `scene.clock` (the
  clock on CLK), `scene.circuit` (the box: a question mark, "?"), `scene.display` (the 4-bit
  display), `scene.tick` (the lamp on TICK), `scene.title` (what the drawing is, a few words),
  `scene.summary` (one or two sentences for a screen reader: a Count switch on wire EN, a Reset
  button on wire RST and a clock on wire CLK go into a box marked with a question mark; four
  wires go to a display, and wire TICK goes to a lamp).
