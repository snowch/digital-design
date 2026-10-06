# Module 8's figures: the ideas the pages carried in words

A working note, written as the work was done, on the branch `module-8-datapath` (the managing
session's choice: this session's own branch, fast-forwarded to `main` at d5a3ccd). Times are read
from the clock (`date -u`). "The managing model" is the session that read the pages, wrote the
code and the briefs, and checked every draft; "the drafting subagent" wrote every learner-facing
sentence from a brief of checked facts.

## Times

- Started: 2026-10-06 10:46 UTC (the branch moved to `main`).

## The audit, as found after reading the pages

The managing session's audit listed seven places. Read as each page's learner:

1. `instructions`: kept. The lesson's own question is how one word carries four numbers; the page
   answers it with a sentence listing the fields and a drawing whose "digits" block is closed. A
   picture of the word cut into its fields, each field's bits and where it goes, is the answer.
2. `constants`: kept. The widening is told twice in words (construction, explanation) and the
   drawing's "widen" block is closed. A picture of the 12 bits and the 64, with bit 11's copies
   marked, for a positive and a negative constant, is what "copying bit 11 keeps the number" means.
3. `fetch`: kept. The explanation's order of events between edges is in words; the stepper shows
   one edge's settle, not several edges side by side. A timing diagram of a real run, one lane per
   bus, shows PC moving at each edge and IR and RESULT following it.
4. `memory-access`: kept. The construction lists the map and the refusals in words; the challenge
   asks the learner to turn them into checks. A map with each part's verdict for each kind of
   access, read off the machine's own check, is the picture of those rules.
5. `branches`: kept. A program's branches, call and jump are told as "PC ← PC + 4c" and listed as
   lines; a listing with an arrow from each to its target, and how often the run took each, shows
   a loop as a loop.
6. `state-encoding`: dropped. The short OK pulse between two edges is already drawn: the failure
   experiment's prediction, just above the explanation, shows its timing diagram (CLK, OK, S,
   SEND) once the learner commits. A second diagram would repeat it.
7. `bytes`: dropped. The four-bank sentence generalises the two-bank memory the page draws and
   lets the learner open; a picture of four banks would add a column, not an idea.
8. The full stage on a phone: the focused figures above now carry the ideas the full drawing was
   carrying alone; the whole drawing stays for the whole, scrolling inside its own box.

## Log

