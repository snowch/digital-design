# Brief GM: the figures' and the checker's new messages

Read `docs/notes/module-8-datapath/briefs/00-module.md` and `docs/style.md` first. These strings
appear wherever the parts are used, in any module. Keep every `{slot}` exactly. Return
`key: text`, one line each.

- `gaveUp`: the datapath figure's status after "Run until it stops" made `{edges}` edges and the
  machine had not stopped; PC is `{pc}`. It gave up. One sentence.
- `runningEdges`: the status while a run is going: `{edges}` edges made so far. Short.
- `stepInside`: the stepper's line at a step where no named bus of the drawing changed, only wires
  inside the blocks. One sentence.
- `gateCaseInComb`: what a challenge offers instead of `cond ? a : b`, when it allows `case` and
  `always_comb`: choose with a `case` inside `always_comb`. Lower case, no full stop: it follows
  "Instead, ".
- `gateIfInComb`: the same with `if` inside `always_comb`.
- `gateCase`: instead of an `if`: choose with a `case`.
- `gateIf`: instead of a `case`: choose with `if`.
- `gateGates`: instead of `+` and `-`, where the bitwise operators are allowed: write the gates
  out.
- `repetition`: an error, lower case, no full stop: repetition such as `{4{a}}` is not part of the
  language this course uses; write the bits out, as a number or a list.
