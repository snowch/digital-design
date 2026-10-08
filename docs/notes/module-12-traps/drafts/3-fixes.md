# Lesson 3: fixes of fact and form to the drafts (the building session)

- 3A: the draft flagged the prediction's "keeps the cause at `400`", reading `400` as a cause. It
  is the RAM word the handler keeps the cause in (`LAMPS_USER`); the note removed. "That state is
  **user mode**" cut to "That is": *state* is the lesson title's other word.
- 3B: the draft asked whether the learner has met `byte[...]`. No lesson before this one uses a
  byte load, so the brief was wrong: the fourth line is now `R3 <= word[timer]`, still cause `32`
  (`USER_ANSWERS` id `timer`, label `fields.timer`). The note on "C0 and C1 in words" removed: the
  failure figure's debugger shows the modes in words (`modeWords`). Hint labels added where the
  draft dropped them.
- 3L: `captions.predict` said the debugger lists the program; the figure is a listing. Backticks
  removed from `fields`, `ramTitle` and `userLabels`, which render as plain text.
- Every prose key not a `Lead` or a `Task` de-numbered.
