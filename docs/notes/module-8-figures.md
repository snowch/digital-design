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


- 10:46 to 10:59. Built the five figure kinds (`packages/dd-model/src/machine-figures.ts` for
  the facts each reads off the reference machine or the simulator; `MachineFigures.tsx` for the
  views), placed them with provisional words, pinned their numbers in
  `content/lessons/module8-figures.facts.test.ts`. Committed and pushed.
- 11:00. Briefs GA (instructions, constants, fetch), GB (memory-access, branches) and GV (the
  figures' own labels) written as lists of checked facts and sent to the drafting subagent.
- 11:05. GA came back. Faults, each fixed by adding words, no sentence rewritten:
  - the three captions had no full stop (the brief asked for one);
  - `fieldsLead` dropped "the same in every instruction";
  - `edgesAfter` said "The table shows five clock edges" (the diagram shows them; the table gives
    the cursor's values): "table" became "diagram";
  - `edgesAfter` said "At each edge, PC steps on by 4", which the fifth edge contradicts; became
    "At each of these edges";
  - `edgesAfter` dropped "IR and RESULT change straight after it" and "nothing uses that RESULT";
  - `edgesAfter` wrote "edges 1–4" with an en dash; became "1 to 4".
  It added which register each edge writes (R1 to R4), which is true (Y's digit of each word) and
  stays.
- 11:09. GB came back. Faults, fixed by adding or swapping the fewest words:
  - `mapLead` called the last row "empty space" (it is the addresses with no memory) and a
    refusal "an error code" and "error 33" (the course's word is the cause that stops the
    machine); it dropped "in any part" from the misaligned word;
  - `flowLead` dropped "how many times" and "while R1 differs from R0"; its single quotes became
    the course's double quotes;
  - `callFlowLead` ended "Run the program to see where PC goes": this figure has no run button,
    the run is already made, so the sentence was cut; "returns to `010`, after the call" became
    "the line after the call";
  - `callLead` dropped the program's purpose (a loop that adds 3 + 2 + 1, and returns); added back.
- 11:13. GV came back. It dropped `addresses` and `parts.none` (the provisional "Addresses" and
  "no memory" stand: both are what the brief asked) and, in `arrowsLabel`, "the table says the
  same" (added). The FIXED strings came back as given.
- 11:20. Mechanical look at the six figures at 1280 px, 375 px and 375 px dark: no page scrolls
  sideways; the timeline scrolls inside its box with the drawing's own notice. The widening lead
  says C stands under W's low 12 bits, but C's row was drawn above W's four rows; the row moved
  under W's bits 15 to 0, so each of C's bits stands under the bit it becomes.
- 11:22. Five reviewers, one per lesson, given `module-8-figures/reviews/brief.md`.
- 11:40. The five reviews came back (`module-8-figures/reviews/findings.md`); sent to the
  sceptic. Meanwhile `main` had moved to 63d7ce4 (Module 10's plan, `docs/plan.md` only): merged
  in. A clean `main` built in this container fails the same screenshot comparisons as this branch
  (the figures-that-matter-most, signals, scenes and Module 2 pairs at both widths; registers and
  state machines on the phone): none of them names a Module 8 figure, so no baseline was touched.
- 11:45 to 12:10. Acted on the verdicts that stand (`reviews/verdicts.md`). In code: the branch
  arrows take lanes by span, arrive at their own heights where two meet one line, and a lane is
  broken where another arrow's stub crosses it (5-1); a branch's way on to the next line is
  listed in "went to" (5-3); the loop figure moved into the investigation, after the program is
  listed (5-5); the timeline marks only the rises, numbered ↑1 to ↑5, keeps an unnamed mark at
  every other time so the axis shows no third count, and opens just before ↑1 (3-1, 3-2, 3-4);
  the fields figure is one field to a row on a phone, groups bits in fours, and leaves out a value
  that says no more than its digits (1-3, 1-4, 1-5); the widening groups bits in fours and opens
  on `F9C` (2-5, 2-7); the map's last row reads "`7F8` and above" and `7D0` is named "DOOR and
  WARM", the names Module 2 gave its bits (4-2, 4-3). The fields figure, already a general kind,
  is placed in the constants motivation (`22103064`) and the memory-access motivation (the load
  and the store) (2-6, 4-6): neither answers its lesson's prediction (constants asks about `F9C`;
  memory-access asks what the load brings, which is a sensor's reading, not a field). New facts
  pinned: those fields and C's signed values, and that bits 63 to 11 of W are worth -2048
  together. Words sent as briefs GC and GW.
- 12:14. GW came back. `copyKey` dropped "Bit 11 is outlined" (added); `arrowsLabel` dropped
  "when that was not the next line" (added) and used single quotes (now double). The rest stands:
  "Memory map", "Program flow", "Transfer".
- 12:20. GC came back. Faults, fixed by adding the fewest words:
  - `instructions/fieldsLead` dropped "where that says more than the digits" and the four
    instructions to choose from;
  - `constants/wideningLead` dropped "of 16 bits" and "in both"; "Gaps every four bits show
    hexadecimal" became "group them into hexadecimal digits";
  - `fetch/edgesLead` opened with the sentence the brief said not to open with (cut: a repeat of
    the after-text's subject), and dropped "half a clock period at a time" and the opening just
    before ↑1;
  - `fetch/edgesAfter` dropped PC moving on and IR and RESULT changing at ↑1 to ↑4, and WREG 0
    before ↑5;
  - `memory-access/fieldsChoices` put backticks in radio labels (removed);
  - `branches/flowLead` said "went to" leaves out the next line, false for a branch now (added
    "and both ways of a branch"), and dropped the counts (4 times, then `018` once) and "of the
    loop above"; `callFlowLead` dropped every count;
  - `memory-access/mapLead` dropped the devices' names, DOOR and WARM's bits, the timer and
    waiting as later modules' devices, the lower cause winning, 31 for every access, and the
    contrast with Module 6: sent back.
