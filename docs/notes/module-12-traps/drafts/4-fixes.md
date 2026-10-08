# Lesson 4: fixes of fact and form to the drafts (the building session)

- 4B: the brief's failure-experiment facts mixed two listings, and the draft flagged both
  addresses. In `SERVICES_SKIPPING` the handler is three lines longer, so its `fault` line is at
  `064` and the word past the program's end at `08C`; the brief's `064` was right, its "halted
  with cause `21`" was not (the handler's `stop` ends the run). `skippingAfter` rewritten from the
  checked facts, keeping the draft's sentences. `c1Hints.1` given "The idea:".
- 4C: `generalisation` said "the words go in registers" with a note that R1 holds the job; the
  brief's "R1 to R4" was wrong. Now "the job's words go in R2 to R4". `c2Hints.3` said job 1 ends
  with `goto back`; `show:` falls through to `back:`, so "followed by the handler's `back` line".
- 4L: the objectives given full stops, as lesson 1's have.
- The listings' comments said "service" where the prose says "job"; the comments changed.
- Every prose key not a `Lead` or a `Task` de-numbered.
- 4C: `generalisation` said the handler "goes straight to `resume`" for a job it does not offer;
  it goes to `back`, which puts R8 and R9 back first. Now "puts R8 and R9 back and resumes".
