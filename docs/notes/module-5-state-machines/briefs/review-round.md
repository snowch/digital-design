# Review round: the briefs sent back to the drafting subagents

Each is a SendMessage to the subagent that drafted the keys, after the reviews and the sceptics' verdicts (see `../reviews/`). Saved as sent.

## To CA: Counters CA: review fixes, two keys

A review of the published lesson found two problems in your keys. Redraft only these two keys and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `question`, last sentence: "A lamp, TICK, lights when the count is about to start again" is true only while EN is 1. Facts: TICK is 1 while the count is `1111` and EN is 1; then the next edge starts the count again at `0000`. Keep the rest of the key as it is.
2. `prediction`: one fact is wrong. It says the two figures run "a 4-bit register and an "add one" block". Both prediction figures run the same circuit: the one the question asks for. The "add one" block is not shown until later; do not name it. Facts: each figure runs that circuit and draws it above its question; choose an option, then press "Check my prediction". Say what each figure does, not a label for them.

## To CB: Counters CB: review fixes, five keys

A review of the published lesson found problems in five of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `construction` says the same thing as `buildCountTwoLead` and the challenge's task. Say each fact once. Its facts: the construction draws a 2-bit counter; the parts offered are "D flip-flop with reset" blocks and half adder blocks; each bit needs one of each; bit 0's carry goes into bit 1's half adder. A new fact the learner needs: a "D flip-flop with reset" is the D flip-flop with an RST pin: at an edge where RST is 1, its Q becomes 0. The registers lesson built that reset from gates; this part has it inside. Drop "See how bit 1 depends on bit 0's carry...": nobody can act on it.
2. `buildCountTwoLead` repeats the section heading ("A 2-bit counter") and the construction. One sentence: the parts are the buttons above the drawing; press one port and then another to wire them.
3. `c1Hints.4` and `c1Hints.5` say nearly the same thing. Hint 3 already does bit 0. Make hint 4 bit 1 alone: half adder 1 adds Q1 and half adder 0's CARRY; its SUM goes to Q1's flip-flop's D. Keep hint 5 as the whole build.
4. `counterFaultsLead`: the fault list calls the first fault "C2 forced to 0", but the lead never says what C2 is. Name the wire: C2, the wire carrying ha1's CARRY into ha2.
Nothing else in these keys changes.

## To CC: Counters CC: review fixes, three keys

A review of the published lesson found problems in three of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `addOneLead`: "Press EN to 1. The status line says "Settled in 5 steps."" The status line already reads "Settled in 5 steps." when the figure first loads, before anything is pressed, so the sentence tells the learner nothing. Facts: when you press EN to 1, the carry takes 5 steps to pass along the chain and settle. Say that; do not quote the status line. Keep the second paragraph as it is.
2. `countToFiveLead`: "The edge after `0101` loads `0000`" uses "loads" for a reset. Facts: while Q is `0101`, EQ is 1, so the register's RST is 1; at the next edge Q becomes `0000`. Keep the rest.
3. `c2Hints.2` gives the design away and repeats the task. Replace it with a lower rung. Facts: TICK is not a fifth flip-flop; it is a wire out of the chain of half adders, so it changes as soon as EN or the count changes, not only at an edge. Do not say which wire.

## To RA: Register-transfer RA: review fixes

A review of the published lesson found problems in two of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `motivation`: two fixes.
   - Names: the register blocks are named in lower case, `now` and `prev`; the words they store are the outputs NOW and PREV, in capitals. The page uses both, and a reader cannot tell them apart. Say once, where the registers first appear, that the block now stores the word NOW and the block prev stores PREV; after that use NOW and PREV for the words, and "the NOW register" and "the PREV register" for the blocks.
   - "The prediction asks: which value does prev take..." stages the question. End by asking it directly: at an edge where SAVE is 1, does PREV take the word NOW had before the edge, or the word NOW is taking at it?
2. `prediction`: "The figure below draws the circuit above a question." does not read. Facts: the figure below draws the NOW and PREV circuit, with its question under the drawing; choose an option, then press "Check my prediction".

## To RB: Register-transfer RB: review fixes

A review of the published lesson found problems in several of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

Names, everywhere below: the register blocks are drawn as `now` and `prev`, in lower case; the words they store are NOW and PREV. Write "the NOW register" and "the PREV register" for the blocks and NOW and PREV for the words. Never use the word "now" for time beside them: write "then" or "at that point" instead.

1. `nowPrevExplorerLead`: one run-on paragraph of instructions. Split it into short steps, one action each, and after each say what the learner sees. Same facts as before. End by saying a register block opens to its four flip-flops.
2. `nowPrevExplorerAfter`: "from now's Q to prev's D" uses the block names; follow the naming rule.
3. `construction`: cut "Data travels on wide wires carrying 4 bits each" (filler) and "Build the same circuit in the challenge below" (the lead below says it). Its facts: the challenge draws the circuit from two "4-bit register" blocks; a word of 4 bits is drawn as one thick wire.
4. `c1Hints.1` gives the key wiring at the first rung, and hint 4 says it again. Make hint 1 the lowest rung: both registers take their D at the same edge, with SAVE as EN; ask which word PREV must be given. Keep hints 2, 3 and 5; make hint 4 the PREV register's D only (it comes from the NOW register's Q).
5. `predictLongPressLead`: "The circuit above has a flaw that the tests you ran did not catch" says something fails before the learner predicts, and "above" could mean the learner's drawing. Describe the situation only: a person keeps the Save button pressed for far longer than one clock period, so SAVE stays 1 for many edges. Then what the figure does: it saves `0011`, sets IN to `0101`, then keeps SAVE at 1 for three edges. Write SAVE, the signal, not "Save", except for the button.
6. `p2Question`: "Now IN is `0101`" puts "Now" beside the word NOW. Use "Then".
7. `p2Explain`: "PREV took NOW, which was now `0101`": the lower-case "now" again. Say: PREV took NOW's word, which was `0101` by then.
8. `saveOnceLead`: the figure now shows OLD and STEP as outputs, with their values, and the drawing names the gates notOld and andStep and the flip-flop last. Split the key: first the circuit (last, OLD, STEP, STEP as both registers' EN), then what to try. Drop the result sentences ("NOW takes `0101`... The next two edges change nothing."): `saveOnceAfter` says them.
9. `saveOnceAfter`: "The fix itself is a word passed from one flip-flop to the next" is wrong: last stores one bit, SAVE's value at the edge before. Say that.

## To RC: Register-transfer RC: review fixes

A review of the published lesson found problems in three of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

Names: the register blocks are drawn as `now` and `prev`, in lower case; the words they store are NOW and PREV. Write "the NOW register" for a block and NOW for its word.

1. `explanation`, first paragraph: "a word worked out from registers' values before that edge" is hard to read, and "In the NOW and PREV circuit, ... last takes SAVE" is wrong: the flip-flop last is only in the save-once circuit. Facts: at an edge, every register takes a word that the gates worked out from the values the registers had before that edge. In the NOW and PREV circuit, the NOW register takes IN and the PREV register takes NOW. In the save-once circuit, the flip-flop last also takes SAVE, and both registers take their word only at an edge where STEP is 1. The second paragraph (the term and the arrows) stays; its "at an edge where STEP is 1" must say it is the save-once circuit.
2. `predictSwapLead`: "each selector takes A (for X) or B (for Y)" mixes two namings: the circuit has inputs A and B, and each word selector also has pins called A and B. Facts: the circuit's inputs are A, B and LOAD; while LOAD is 1, X's selector passes the input A to X's D and Y's selector passes the input B to Y's D; while LOAD is 0, X's D is Y's Q and Y's D is X's Q. Do not mention the selectors' own pin names.
3. `p3Question`: say that the input A is `0011` and the input B is `0101` while LOAD is 1, before it says what X and Y take.

## To RE: Register-transfer RE: reflection title

A review of the published lesson found that `titles.reflection`, "Moving on", names nothing. The section sums up words moved at an edge and a press saved once, and asks what decides which job a circuit does at the next edge. Give it a heading that says that, in a few words. Return only that key, in the same `key: text` format.

## To CC: CC: hint 2 format and "just"

Thank you; addOneLead and countToFiveLead are accepted. The hints came back as one `c2Hints:` key with numbers, and hint 2 uses "just", which the course cuts. Return only `c2Hints.2: ...` in the original key format, without "just" ("not only at an edge"). Hints 1, 3, 4 and 5 stay as they were before this round.

## To SA: State-machines SA: S wording

A review of the published lesson found one loose fact in `prediction`: "S is the register's code". Facts: the figures draw the register's output as the wire `state`; S is an output of the controller that is a copy of it, the state's code, so you can watch it. Redraft only `prediction` with that fact and return only it, in the same `key: text` format.

## To SB: State-machines SB: review fixes

A review of the published lesson found problems in several of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `c1Hints.2` is wrong. Row 5 without NOT FAIL is TRY AND NOT OK AND TICK; it is 1 wrongly only when FAIL is 1 too, and then row 4 is 1 as well, so N1 does not change and no test catches it. Use a mistake the tests do catch: row 8 without NOT TICK is 1 in WAIT when TICK is 1, but there row 7 applies and leads to TRY (`01`), whose bit 1 is 0. Keep the rule: every input the row reads must be in its gate.
2. `c1Hints.1` repeats the method the construction and the task give. Make it a lower rung: N1 is 1 in the rows whose next state is WAIT `10` or GIVE_UP `11`; start from one of those rows.
3. `retryMachineLead` lists "reset (RST to IDLE)" as a kind of move, then says "In each state exactly one row applies", but the diagram and the table draw no RST move and have no RST column. Facts: RST is not in the table; at an edge where RST is 1 the register becomes `00`, IDLE, whatever the row says. Say that where reset is mentioned.
4. `retryMachineAfter`, last sentence: "The arrow taken at an edge is the row that applied just before it" is hard to read and contains "just". Facts: the arrow marked in the diagram is the move of the row marked in the table, which the next edge will take.
5. `retryFaultsLead`: before the checks run, nothing has reset the circuit, so the drawing shows X on its wires; say so in one sentence. Keep the rest.

## To SC: State-machines SC: review fixes

A review of the published lesson found problems in several of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `explanation`, second paragraph: "The gates in the next-state logic read off the table, one gate per row." is missing a verb, and the construction already said the logic is read off the table one gate per row. Keep only what is new here: rows 2 and 3 need no gate, row 9's term is GIVE_UP's line, and the list of gates.
2. `reflection` opens with the motivation's definition of a state machine and repeats "read off the table, one gate per row" a third time. Open instead with what the lesson showed: one machine seen four ways (diagram, table, circuit, text) that agree in every state. Keep the closing question about codes as it is.
3. `c2Task`: one of its tests changed. Facts: the tests include an edge in WAIT with OK 1 and TICK 1 together (OK wins: the next state is IDLE), an edge in GIVE_UP with OK 1, one test where GO falls while CLK is 1, and one where OK rises while CLK is 1. Name them in the key's last sentence as before.
4. `c2Hints.4`: "WAIT's arm starts `if (OK) next = 2'b00;`" reads as if WAIT's arm already does. Say that WAIT's new arm should start that way, like TRY's.

## To SE: State-machines SE: prediction title

A review of the published lesson found that `titles.prediction`, "Staying in TRY, and a late answer", gives away the first prediction's answer (TRY) before the learner commits. Facts: the section holds two predictions: what happens after GO falls while the controller is in TRY, and what happens when an answer comes after a TICK. Name the topics without the results. Return only that key, in the same `key: text` format.

## To RA: RA: register naming consistency

Thank you; `prediction` is accepted. In `motivation`, the rest of the lesson now writes "the NOW register" and "the PREV register" for the blocks. Keep your first sentence's fact (the block drawn as now stores the word NOW; the block drawn as prev stores PREV), then write "the NOW register" and "the PREV register" after it, in place of "the now register" and "the prev register". Return only `motivation`.

## To NA: State-encoding NA: review fixes

A review of the published lesson found problems in two of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies.

1. `question`: "any four different 2-bit codes would work and carry out the same table" contradicts the lesson, which shows that TRY at `00` does not work. Facts: any four different 2-bit codes carry out the same table; the question is whether they all behave the same after a reset. Also "The retry controller's table shows what each state does and what outputs it sends in each state" is clumsy: say the table says what each state does, not which code it has.
2. `motivation`: the lesson never compares gate counts, so cut "how many gates your next-state logic builds" and "more flip-flops can mean fewer gates". Keep what the lesson shows: the codes decide where a reset leads (the course's reset loads all zeros), how many flip-flops the register needs, and whether a state's line needs a decoder or is one register bit.

## To NB: State-encoding NB: one-hot moves, review fixes

A review of the published lesson found that the term **one-hot** is defined on a figure it does not fit, and that two texts give answers away. The term moves. Redraft only the keys below and return only them, in the same `key: text` format. Every other rule of your brief still applies.

Facts that change: **one-hot** is now introduced in `p2Explain`, not in `zeroIdleMachineLead`. Before `p2Explain`, do not write "one-hot". The investigation's codes (IDLE `000`, TRY `001`, WAIT `010`, GIVE_UP `100`) are not one-hot: IDLE has no 1. They use three flip-flops for four states: one flip-flop each for TRY, WAIT and GIVE_UP, and IDLE is the code with all three at 0.

1. `zeroIdleMachineLead`: describe those codes as above: three flip-flops; bit 0 is TRY's line, bit 1 WAIT's and bit 2 GIVE_UP's, with no decoder; IDLE's line is a NOR gate of the three bits, 1 only when all are 0. Do not define one-hot; do not say "one flip-flop per state".
2. `zeroIdleMachineAfter`: drop "one flip-flop per state", "each state is read from one bit" (IDLE is read from a NOR gate) and "The next figures show why this choice of codes matters". Keep: a reset loads `000`, so the reset leads to IDLE.
3. `predictOneHotResetLead`: do not ask "What if no state has the all-zero code?" and do not say the codes miss `0000`. Facts: the next figure goes one step further and gives IDLE its own flip-flop too: IDLE `0001`, TRY `0010`, WAIT `0100`, GIVE_UP `1000`, four flip-flops. The figure draws the circuit above its question.
4. `p2Explain`: introduce the term here, plain meaning first: codes in which each state has a single 1, in its own bit, are called **one-hot**. Keep the result: a reset loads `0000`, which is no state's code; no row applies, every next-state bit is 0, and the register stays `0000` at every edge. One-hot codes need a reset that loads a state's code; the course's reset loads zeros, which is why the investigation gave IDLE `000`.
5. `p3Explain`: "row 6" points at a table the figure does not show. Name the row by what it says: in TRY, with OK, FAIL and TICK all 0, the controller stays in TRY.

## To NC: State-encoding NC: review fixes

A review of the published lesson found problems in several of your keys. Redraft only these and return only them, in the same `key: text` format. Every other rule of your brief still applies. Note: the term **one-hot** is now introduced earlier in the lesson, in the failure experiment, so you may use it.

1. `explanation`:
   - "The sender can keep OK at 1 until SEND falls" is unclear: OK comes from the manager's phone. Say: the manager's phone can keep OK at 1 until SEND falls.
   - "a flip-flop can be set by OK and cleared once the controller has read it": the course has not used "set" and "cleared" for a flip-flop. Say: a flip-flop that becomes 1 at an edge where OK is 1 and goes back to 0 once the controller has read it.
   - Cut the last paragraph ("The reset belongs to the rule too..."): "So" does not follow, and the motivation and the reflection say it.
2. `reflection`: "needs no decoder but costs more" claims a cost the lesson never shows. Facts: the investigation's codes need no decoder for TRY, WAIT and GIVE_UP (each is one bit) and a NOR gate for IDLE, and use three flip-flops instead of two.
3. `c2Task`: say what S is: the state's code, 2 bits. "each arrow is a row": the figure shows no table; say each arrow is a move, labelled with the inputs that make it.
4. `c2Hints.2` repeats the task's "WARM wins". Make it a lower rung: the defrost controller has the same shape as the retry controller's text: an `always_ff` for the state register with its reset, an `always_comb` with a `case` for the next state, and `assign` for the outputs.
5. `modelVsReality`: "Tools that turn text to gates may choose codes from an enumerated type; this course keeps them written in the list" is hard to read. Facts: when the text uses an enumerated type, tools that turn text into gates may choose the codes themselves, such as binary or one-hot; the course writes every code in the list, so the codes on the page are the codes in the circuit.

## To NE: State-encoding NE: titles and an option

A review of the published lesson found labels that give answers away or name the wrong thing. Redraft only these and return only them, in the same `key: text` format.

Facts that changed: the term one-hot is now introduced in the failure experiment, after the learner commits the second prediction; the investigation's codes (IDLE `000`, TRY `001`, WAIT `010`, GIVE_UP `100`) use three flip-flops for four states and are not one-hot.

1. `titles.prediction`, "A reset to TRY": gives the answer. The section predicts what a reset does when TRY has the code `00`; name that without the result.
2. `titles.investigation`, "One flip-flop per state, IDLE at zero": wrong for three flip-flops and four states. Name what it shows: a flip-flop for each state but IDLE, and IDLE at zero.
3. `titles.failureExperiment`: the section holds a figure that gives every state its own flip-flop, IDLE too, and an answer that comes and goes between two edges. Name both without their results.
4. `options.p2None`, "0000, no state": gives the answer. Write the value alone, as `0000` (no backticks in labels).
5. `captions.predictOneHotReset` and `captions.zeroIdleMachine`: if either says "one-hot" or "one flip-flop per state", fix it to the facts above; otherwise return it unchanged.

## To V: Figure words V: one new status line

The state-machine figure needs one more string. When the figure shows the diagram but not the table, the status line must not name a row number, since no table is on the page. Your `machine.status` is "Now {state} ({code}). Row {row} applies: the next edge gives {next} ({nextCode})." Draft `machine.statusNoTable` with the same placeholders except {row}: the state now, and the state the next edge gives. Return only `machine.statusNoTable: ...`.

## To RB: RB: two keys need another pass

Thank you; every key is accepted except two. Return only these two.
1. `nowPrevExplorerLead`: "You see SAVE light up" is not what the page does: SAVE's pin shows 1. Say that.
2. `predictLongPressLead`: "not just one" uses "just", which the course cuts; "This figure demonstrates the issue" names a problem before the learner predicts. Say only what the figure does: it saves `0011`, then sets IN to `0101`, then keeps SAVE at 1 for three edges.
