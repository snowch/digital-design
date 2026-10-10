# Brief V3b: one more string for the lab's figure

Read `00-module.md` and `4-shared.md` first.

The `lab-run` figure can ask a prediction before any run: on which of its programs the text
disagrees with the model. After the learner commits, a line says what they chose, then what the
runs gave, then whether they matched: "You chose {choice}." comes before it, and "You were
correct." or "You were not correct." after it. The figure runs the programs to work out the
answer.

- `labAnswer`: one short sentence giving the answer the runs give. `{answer}` is an option's text
  such as "Only the timer program" or "Neither", and must appear once, as given. Keep it under
  ten words.
