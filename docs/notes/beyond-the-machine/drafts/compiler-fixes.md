# The compiler chapter: fixes to the drafts

Briefs K1 to K4 (`../briefs`), drafted by the drafting subagent, checked for facts only. Every fix:

- **K1.** "Lesson 11.1", "Lesson 13.2" mid-sentence lowercased (form).
- **K2.** `stepsOutcomes`: "The branch's word is `56340003`." cut. The brief was wrong to give it:
  the construction asks for that word. For the same reason the figure's listing shows addresses
  and no words (the plan's section 6 had words). `construction`: "As in 13.2, work it out from the
  fields. Work it out from the line …" joined into one sentence (a repeat where two drafted
  sentences met).
- **K3.** "1 level higher", "2 questions", "1 command", "1 small function", "1 kind of line",
  "2 registers" written as words (not counts the model produced).
- **K4.** Five section titles named the wrong section's content and went back; the second return
  was kept. `c1Task` dropped the six runs' readings and which three light: added in one sentence.
  Hints 2 to 4: code marked as code. `rules.branch` dropped the swap for `>` and `<=`: added.
  `programs.compiled` "Compiled" became "The compiler's program", the brief's title.

The second reading, start to finish (1,384 words before it):
- the generalisation's "Compare three things: …" repeated its figure's lead: cut;
- the explanation's "The figure shows where each instruction came from:" claimed the figure showed
  Module 0's lines, which it does not: cut.

K4's return landed verbatim in `compiler.labels.ts`, `compiler.prose.ts` (task, lead, hints) and
`packages/dd-views/src/strings14.ts` (the figure's words, the refusals, the run sentences), with
the fixes above.

## After the managing session's review (items 1 to 9, 16)

Code: `branch-gates` opens with `scope: "datapath/condition"`; the figure's rule sentence is built
from the marked piece and its instruction (`{piece}`, `{instruction}`), its choice labels set code
as code, "The line as it stands" loses its line number, one instruction is singular
(`progressOne`, a form fix), and the listing shows only once it has a row. The assembler gains
`deviceName`, the refusal for a device's name where a line wants a number (risk 13).

Brief R1 (`../briefs/R1.md`), drafts in `R1.json`: `branchAfter`, `motivation`, `explanation`,
`investigation`, the five rules and `deviceName`. One fix: `branchAfter`'s last sentence began
"It", which pointed at the condition block: "The machine". Cut by hand: `stepsOutcomes` to its last
sentence (item 4: it stated both lines' results whichever line had run). The fact sheet's
"no instruction for `>=`" corrected, and the lesson's header comment.
