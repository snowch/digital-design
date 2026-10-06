# Brief SE: state-machines, labels

Read 00-module.md and S-facts.md first. Draft these short labels. Each is a few words; a caption
is one sentence ending with a full stop. Titles and headings have no full stop. Nothing before
the motivation may say "state machine" or "next-state": that means `title`, `titles.question`
and `captions.scene`, and the scene's labels. Nothing before the investigation may say "state
diagram".

- `title`: the lesson's title, a question: how does a circuit work through a list of jobs?
- `objectives` (four, each starting with a verb, ending with a full stop): predict a state
  machine's next state from its diagram and inputs; read next-state logic off an encoded table,
  one gate per row; say which faults in next-state logic break which moves; change a state
  machine written as text with `always_comb` and `case`.
- `titles.*` for the ten sections: (question) the office's message to the manager; (motivation)
  jobs as states in a register; (prediction) staying in TRY, and a late answer; (investigation)
  the controller in four views; (construction) one bit of the next-state logic, drawn;
  (failure) three faults in the next-state logic; (explanation) the next state waiting at D;
  (generalisation) the controller as text; (challenge) the reset, and a late answer while
  waiting; (reflection) state machines and their codes.
- `challengeTitles.c1`: bit 1 of the next state, drawn. `challengeTitles.c2`: an answer while
  waiting, as text.
- `captions.scene`: the controller must send, wait, send again or give up.
- `captions.predictStay`: predict the state after GO falls, then check.
- `captions.predictGiveUp`: predict the state after a late OK, then check.
- `captions.retryMachine`: set the inputs, press Clock CLK, and follow the state in every view.
- `captions.buildNextOne`: draw N1 from the table and run the tests.
- `captions.retryFaults`: choose a fault and run the checks.
- `captions.nextStateInside`: press GO and Clock CLK and watch the row's gate light.
- `captions.retryAsText`: compare the state diagram with the controller as text.
- `captions.predictReset`: predict the state after a reset in WAIT, then check.
- `captions.writeLateOk`: change WAIT's arm and run the tests.
- `faults.row4`: row 4's gate output fixed at 0; `faults.row8`: row 8's; `faults.row5Or`: row 5's
  AND gate changed to OR. Keep the earlier lessons' shape: "KEEP wire forced to 0", "OR gate
  changed to AND". The gates are named row4, row5, row8 in the drawing.
- Options (plain text, no backticks; one shape, "IDLE (00)"): `options.p1Idle` IDLE (00),
  `options.p1Try` TRY (01), `options.p1Wait` WAIT (10); `options.p2Idle` IDLE (00),
  `options.p2GiveUp` GIVE_UP (11), `options.p2Try` TRY (01); `options.p3Idle` IDLE (00),
  `options.p3Try` TRY (01), `options.p3Wait` WAIT (10).
- The scene's labels (one or two words each, short enough for a phone; a label names the part,
  not its signal): `scene.office` (the room the parts are in), `scene.go` (the switch on GO:
  something to report), `scene.answers` (the receiver on OK: the phone's answer), `scene.failed`
  (the receiver on FAIL: the sender's report), `scene.timer` (the source of TICK), `scene.clock`
  (on CLK), `scene.circuit` ("?"), `scene.sender` (the lamp on SEND: the sender), `scene.siren`
  (the lamp on SIREN), `scene.title` (a few words), `scene.summary` (one or two sentences for a
  screen reader, in words, not brackets: in the office, a switch on wire GO, receivers on wires OK
  and FAIL, a timer on wire TICK and a clock on wire CLK go into a box marked with a question
  mark; wire SEND goes to the sender and wire SIREN to a siren lamp).
