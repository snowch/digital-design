# Module 9's figures: two ideas the pages carried in words

A working note on the branch `m9-figures`, written as the work was done. The author asked whether
Module 9's lessons had figures where it makes sense; times are from `date -u`.

## The audit, as found after reading the pages

Every section of the five lessons where the learner does something has a figure, and four of the
five explanations do. Read as each page's learner, three sections carry in words what a picture
would show better:

1. `micro-operations`, explanation, "Signals that wait for the edge": kept. The only Module 9
   explanation without a figure, and its subject is timing: the control signals settle between
   edges and wait at the registers' enables, PCEN is 1 when the next state is FETCH, and GO falls
   in READ at a stop. A timing diagram of one instruction and a stop shows each point.
2. `several-edges`, motivation, "Instructions take several edges": kept. The module's longest
   section (195 words) brings in the instruction register, four held words and a controller of
   five states before any picture. A timing diagram of a constant job and a store shows the
   memory's one address at the PC for each fetch and at the ALU's result for the store, while IR
   keeps the instruction. Not a load: the prediction straight after asks how many edges a load
   takes.
3. `illegal-instructions`, motivation, "Why words are refused": left for after the decoder's
   layout by hand, which also changes that lesson. Its three reasons a word is refused end in a
   dense list of the jobs each kind allows; three refused words cut into their fields, one per
   reason, would make it concrete.

The questions, the reflections and the short generalisations need none, as in Module 8.

## What was built

- `edge-timeline` runs Module 9's machine (`machine-edges`) as it ran Module 8's stages, and gains
  `show: "state"`: the controller's state written by its name, FETCH to WRITE, from
  `CONTROL_STATES`. A control unit's signal may be named alone (`PCEN` for `control/PCEN`).
- `several-edges`' motivation: `one-port`, 8 edges of `R1 <= 5`, a store of R1 to the display,
  and `stop`; lanes CLK, S, ADDR and IR.
- `micro-operations`' explanation: `enables`, 6 edges of `R3 <= R1 - R2` and `stop`; lanes CLK, S,
  IR, the enables IREN, HOLDAB, HOLDR, WREG and PCEN, and GO. HOLDM is left out: the instruction
  does not read memory, and the lead says so.
- `module9-figures.facts.test.ts` runs both programs on the machine and pins every state, address,
  word and level the words state, edge by edge, and that the figures run those programs for those
  edges. `module9.spec.ts` checks both figures in the browser.

## The words

Brief GT9 (`module-9-figures/briefs/GT9.md`) went to the drafting subagent. Three rounds:

- Round 1. The captions and the first lead were right. The two notes under the figures dropped
  the facts that carry them: the store's address `7C0` at ↑8, the edge counts, the states before
  each edge, what each edge writes, and that ↑4 ends the instruction because the next state is
  FETCH. One sentence added a fact the brief did not give ("This instruction decides what the ALU
  computes and where the result goes"). The second lead called GO an enable. All sent back with a
  note per fact.
- Round 2. Every fact present. Two faults sent back: the first note gave ↑8 before ↑4, and "PCEN
  allows PC to advance, so this instruction ends" stated the cause the wrong way round, against
  the lesson's own explanation.
- Round 3. Right. One fact still missing from the first lead, that S is the controller's state:
  "the controller's" added, no sentence rewritten.
