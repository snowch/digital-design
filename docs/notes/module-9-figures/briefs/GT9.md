# Brief GT9: the words of two timing diagrams in lessons `several-edges` and `micro-operations`

Read `docs/style.md` first; it applies. Return only the keys below, in the `key: text` form, a
blank line between keys. A caption is short and ends with a full stop. Write ↑1, ↑2 and so on for
the rising edges, as the figure marks them. Write hexadecimal values in backticks, as the lessons
do (`7C0`, `25001005`).

Both figures are timing diagrams of a real run of Module 9's machine from the reset: one lane per
signal or bus, arrows ↑1, ↑2 ... above the lanes at the clock's rising edges, a slider that moves
a cursor through time half a clock period at a time, and a table under the diagram that gives each
lane's value at the cursor. The cursor opens just before ↑1. Lane S is the controller's state,
written by its name: FETCH, READ, ALU, MEMORY or WRITE.

## Lesson `several-edges` (lesson 3): a figure in the motivation section

The section's text, just above the figure, says: the memory has one address; at one edge it is the
PC and the instruction comes in; at a later edge it is the ALU's result and the word comes in; the
instruction register (IR) keeps the instruction while the address moves on; held words HA, HB, HR
and HM keep words from one edge to a later one; a controller's state says which edge the
instruction is at, through the states FETCH, READ, ALU, MEMORY and WRITE, and each kind passes
through only the states it needs.

The figure runs this program for 8 rising edges:
- `000` `25001005`: R1 ← 5
- `004` `480107C0`: memory[`7C0`] ← R1, a store to the display
- `008` `84000000`: stop

Lanes: CLK; S; ADDR, the memory's address, in three hexadecimal digits; IR, in eight digits.

Checked facts of the run. The state named is the one in the half period before that edge:
- Before ↑1: FETCH, ADDR `000`. ↑1 fetches R1 ← 5: IR becomes `25001005` and keeps it until ↑5.
- Before ↑2: READ. Before ↑3: ALU. Before ↑4: WRITE. In these states ADDR is HR, the ALU's last
  result (X before ↑2 and ↑3, `005` before ↑4); no edge reads or writes the memory there.
- ↑4 ends R1 ← 5: PC moves on to `004`. Before ↑5: FETCH, ADDR `004`.
- ↑5 fetches the store: IR becomes `480107C0` and keeps it to the end of the figure.
- Before ↑6: READ. Before ↑7: ALU. Before ↑8: MEMORY, and ADDR is `7C0`, the ALU's result for the
  store, the display's address.
- ↑8 writes R1's word at `7C0` and ends the store: PC moves on to `008`. After ↑8: FETCH, ADDR `008`.
- So the memory's one address is the PC at each fetch edge (↑1, ↑5) and the ALU's result at the
  store's MEMORY edge (↑8), while IR keeps each instruction.
- R1 ← 5 passes through FETCH, READ, ALU and WRITE: 4 edges. The store passes through FETCH, READ,
  ALU and MEMORY: 4 edges.

Must not: say anything about a load, or how many edges a load takes (the next section asks the
learner to predict it); use the word "micro-operation" (a later lesson introduces it).

- `captions.onePort`: a constant job and a store, edge by edge, one lane per signal or bus.
- `onePortLead`: about 60 words. What the lanes are (above) and how each is written; the arrows;
  the slider and the table; where the cursor opens.
- `onePortAfter`: about 90 words. The facts above, short. End on: the memory's one address moves
  from the PC to the ALU's result and back, and IR keeps the instruction while it does.

## Lesson `micro-operations` (lesson 4): a figure in the explanation section

The section's text, just above the figure, explains why the control signals wait for the edge:
the output logic reads the state and the decoder's signals; the decoder's signals come from IR,
which changes only at a fetch edge; each micro-operation needs its control signals at 1 before
its edge; between edges the signals settle and wait at the registers' enables; at the edge each
register whose enable is 1 takes its word; GO can fall in READ when the stop logic halts the
machine; PCEN is 1 when the next state is FETCH. The figure is the evidence for that text: its
words must point at where the diagram shows each point, not repeat the reasons.

The figure runs this program for 6 rising edges:
- `000` `13123000`: R3 ← R1 - R2, the motivation section's example
- `004` `84000000`: stop

Lanes: CLK; S; IR, in eight hexadecimal digits; IREN; HOLDAB; HOLDR; WREG; PCEN; GO, each 0 or 1.

Checked facts of the run. The state and the levels named are those in the half period before
that edge:
- Before ↑1: FETCH; IREN 1, every other enable 0; GO 1. ↑1: IR takes `13123000`.
- Before ↑2: READ; HOLDAB 1. ↑2: HA and HB take R1's and R2's words.
- Before ↑3: ALU; HOLDR 1. ↑3: HR takes HA - HB.
- Before ↑4: WRITE; WREG 1 and PCEN 1. ↑4: R3 takes HR, and PC moves on to `004`. The next state
  is FETCH, so ↑4 ends the instruction.
- Before ↑5: FETCH; IREN 1. ↑5: IR takes `84000000`, the stop.
- Before ↑6: READ; GO 0 and every enable 0: the stop logic halts the machine in READ. ↑6 writes
  nothing, and the state stays READ.
- Each enable is 1 in one state only, the one before the edge that uses it. IR keeps `13123000`
  from ↑1 to ↑5, so the decoder's signals stay the same through the instruction's edges.
- HOLDM is not drawn: R3 ← R1 - R2 does not read memory, so HOLDM stays 0 throughout.

- `captions.enables`: one instruction and a stop, edge by edge, with the enables.
- `enablesLead`: about 60 words. What the lanes are and how each is written; that HOLDM is left
  out and why; the arrows, the slider and the table; where the cursor opens.
- `enablesAfter`: about 90 words. The facts above, edge by edge and short: which enable is 1
  before each edge, PCEN beside WREG before ↑4, IR unchanged until ↑5, GO at 0 after ↑5.
