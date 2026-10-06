# Brief NE: state-encoding, labels

Read 00-module.md, S-facts.md and N-facts.md first. Draft these short labels. Each is a few
words; a caption is one sentence ending with a full stop. Titles and headings have no full stop.
Nothing before the investigation may say "one-hot": that means `title`, `objectives`,
`titles.question`, `titles.motivation`, `titles.prediction`, and the captions `tryZeroTable` and
`predictTryZero`. Nothing before the explanation may say "synchronous" (`titles.explanation` may).

- `title`: the lesson's title, a question: which code should each state get, and how is a state
  machine written?
- `objectives` (four, each starting with a verb, ending with a full stop): say where a reset
  leads for a given set of codes; give a state machine one flip-flop per state and say what that
  costs and saves; say why an input that changes between two edges can be missed; write a state
  machine from its state diagram as text, with its states named.
- `titles.*` for the ten sections: (question) codes for the same table; (motivation) what the
  codes decide; (prediction) TRY at `00` after a reset; (investigation) one flip-flop per state,
  with IDLE at zero; (construction) the controller's codes changed in text; (failure) no state at
  zero, and an answer between two edges; (explanation) one clock, inputs read at its edges;
  (generalisation) states named in the text; (challenge) the defrost controller; (reflection)
  what the module built.
- `challengeTitles.c1`: the controller with one-hot codes and IDLE at zero, as text.
  `challengeTitles.c2`: the defrost controller, as text.
- `captions.tryZeroTable`: the same table, with TRY given `00`.
- `captions.predictTryZero`: predict SEND after a reset, then check.
- `captions.zeroIdleMachine`: open the next-state logic and clock the controller.
- `captions.writeZeroIdle`: change the codes and run the tests.
- `captions.predictOneHotReset`: predict the state's code after a reset, then check.
- `captions.predictShortOk`: predict the state after a short OK, then check.
- `captions.retryEnum`: compare the state diagram with the text that names the states.
- `captions.defrostMachine`: press the inputs and clock the defrost controller.
- `captions.writeDefrost`: write the defrost controller and run the tests.
- Options (plain text, no backticks): `options.p1Zero` SEND is 0, `options.p1One` SEND is 1,
  `options.p1X` the simulator cannot know SEND (X); `options.p2Try` TRY (0010), `options.p2Idle`
  IDLE (0001), `options.p2None` 0000, no state; `options.p3Idle` IDLE (00), `options.p3Try` TRY
  (01), `options.p3Wait` WAIT (10). The earlier lessons' unknown option read "The simulator
  cannot know Q (XXXX)".
