# Brief RE: register-transfer, labels

Read 00-module.md and R-facts.md first. Draft these short labels. Each is a few words; a caption
is one sentence ending with a full stop. Titles and headings have no full stop. Nothing before
the explanation may say "transfer": that means `title`, `objectives`, every `titles.*` except
`titles.explanation` onwards, every caption and every option label. (The title is seen first.)

- `title`: the lesson's title, a question: how do registers pass words to each other?
- `objectives` (three, each starting with a verb): say which word a register takes when its D
  comes from a register that changes at the same edge; make a press of a button act once however
  many edges it lasts; write registers of 16 bits that take words from each other, as text.
- `titles.question`, `titles.motivation`, `titles.prediction`, `titles.investigation`,
  `titles.construction`, `titles.failureExperiment`, `titles.explanation`,
  `titles.generalisation`, `titles.challenge`, `titles.reflection`: a heading per section, a few
  words naming what it contains. The sections: (question) a display of the number saved before;
  (motivation) one register's D from another's Q; (prediction) which word PREV takes;
  (investigation) NOW and PREV running; (construction) NOW and PREV drawn; (failure) a long press,
  and saving once per press; (explanation) words moved at an edge, written with arrows;
  (generalisation) the two registers as text; (challenge) a swap, and 16-bit readings with an
  undo; (reflection) what decides the next job.
- `challengeTitles.c1`: NOW and PREV, drawn. `challengeTitles.c2`: two readings with an undo, as
  text.
- `captions.scene`: the second display shows the number saved before the latest one.
- `captions.predictPrev`: predict PREV after two saves, then check.
- `captions.nowPrevExplorer`: set IN, press SAVE and Clock CLK, and watch both displays.
- `captions.buildNowPrev`: draw NOW and PREV and run the tests.
- `captions.predictLongPress`: predict PREV after a press that lasts three edges, then check.
- `captions.saveOnce`: hold SAVE for several edges and watch it save once.
- `captions.nowPrevAsText`: compare the two registers drawn as blocks with their text.
- `captions.predictSwap`: predict X after one edge with each register's D from the other's Q,
  then check.
- `captions.writeReadings`: write the two 16-bit registers with an undo and run the tests.
- `options.p1Old`, `options.p1New`, `options.p1Zero`: PREV is `0011`, PREV is `0101`, PREV is
  `0000`. `options.p2Old`, `options.p2New`, `options.p2Zero`: the same three. `options.p3Swapped`:
  X is `0101`; `options.p3Same`: X is `0011`; `options.unknown`: the simulator cannot know X
  (`XXXX`). Options are shown as plain text: write the bits without backticks. Keep one shape:
  "PREV is 0011". The earlier lessons' unknown option read "The simulator cannot know Q (XXXX)".
- The scene's labels (each one or two words, short enough for a phone): `scene.switches` (the
  four switches on IN), `scene.save` (the Save button on SAVE), `scene.clock` (the clock on CLK),
  `scene.circuit` ("?"), `scene.now` (the display NOW), `scene.prev` (the display PREV),
  `scene.title` (what the drawing is, a few words), `scene.summary` (one or two sentences for a
  screen reader: switches on four wires, IN, a Save button on wire SAVE and a clock on wire CLK go
  into a box marked with a question mark; four wires go to a display NOW and four to a display
  PREV).
