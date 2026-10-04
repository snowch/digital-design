# Review: two lessons, read as a learner

Read on the built site (apps/course/dist, served on port 4182) at 1280 and 375 pixels, every
control pressed, every slider moved to both ends, every challenge run with the shipped stub, with
plausible wrong attempts and with the reference. Numbers were checked against the page and
against content/lessons/registers.facts.test.ts, packages/dd-views/src/lesson-facts.test.ts and
packages/dd-model/src/timing.test.ts (all 24 tests pass). No console errors on either page.

Each finding: category; severity (high: misled or stuck; medium: stumbles; low: polish); how
sure. Quotes are from the page as rendered. No finding gives any part of a challenge's answer.

## Lesson A

1. **A1** (fact; high; sure). Explanation, figure "A recorded run inside the flip-flop", the
   phase text shown from time 550 (`phases[4]`): "D fell at time 550 while CLK was 1. The master
   was closed, so nothing reached the slave and Q stayed 1." The figure's own table at time 560
   reads CLK 0, the drawing shows the master's EN at 1, and master Q follows D to 0 at time 580;
   Q stayed 1 because the slave was closed. The same box then says "CLK fell at time 500 and the
   master opened again at time 510", which contradicts its first sentence. Direction: make the
   phase say which latch held, or move the D change to a moment when CLK is 1.

2. **A2** (figure; medium; sure). Explanation lead (`internalsLead`): "While CLK is 1, the master
   is closed, so D can change and Q does not." The recorded run changes D only at 300 and 550,
   both while CLK is 0, so the figure never shows the moment this sentence describes. The
   flip-flop challenge's own test "D changes while the clock is high" checks exactly it.
   Direction: script one change of D between 400 and 500, and let a phase describe it.

3. **A3** (fact; medium; sure). Explanation after-text (`internalsAfter`): "The numbers in the
   previous section are what those gate delays add up to in this model: 30 and 10, where 30 is
   three gate delays." The previous section gives setup as 30 and says "Hold time here is zero";
   10 appears there only as "Every gate takes 10 time units" and "If D changed 10 units before
   the edge or later". The learner cannot tell what quantity 10 is. Direction: name it, or drop it.

4. **A4** (term; medium; sure). Failure experiment, setup-hold lead (`setupHoldLead`): "The roll
   declares Q undecided 20 units after the edge, which is when the slave's latch would first have
   answered." "slave" is first explained in the explanation section, below this figure, and the
   slave is itself a latch, so "the slave's latch" has no referent here. Direction: say "the second
   latch", or move the sentence to the figure that names the slave.

5. **A5** (figure; medium; sure). Setup-hold figure: the result line reads "Q captured 1 at
   1030.", "Q changed to 1 at 1045, but this is unreliable because D changed inside the window."
   and "Roll 1: Q became undecided at 1020, settled to 0 at 1060." The prose speaks only in units
   before or after the edge, the diagram has no time labels on its axis (none at either width),
   and nothing on the page says the edge is at 1000. Direction: state the edge's time once, or
   report these as offsets from the edge.

6. **A6** (fact; medium; sure). Setup-hold lead: "a replay of the same roll gives the same picture
   and a new roll gets a new seed." On the page, at one slider position, the third press of "Roll
   result" repeats the second exactly ("Roll 2: Q became undecided at 1020, settled to 0 at
   1066."), and the "Rolls" list keeps one roll per position, so Roll 1 cannot be replayed once
   Roll 2 exists. Direction: keep every roll and number seeds from the count of all rolls, or say
   the figure keeps one roll per position.

7. **A7** (figure; medium; sure). Prediction, both figures (`p1Question`, `p2Question`): "Here is
   a loop of two inverters with an OR gate on one input." and "Here is a loop of three
   inverters…". The prediction figures draw nothing; the loop is first drawn in the investigation
   figures below. A learner who knows gates and nothing else is asked to predict a circuit they
   cannot see. Direction: draw the circuit above the options, or change "Here is" to a sentence
   that describes the wiring.

8. **A8** (double meaning; medium; sure). "X" means two things on the page and the prose never
   says so. Investigation: "Before any kick, q is X: the simulator has nothing to go on"
   (unknown) and "The values never stop changing, so the simulator shows X" (undecidable); the
   prediction option reads "The simulator cannot decide (X)", which is wrong for the first case.
   Only the explorer's status line separates them ("These signals never settled and are shown as
   X"). Direction: one sentence, where X first appears, naming both cases.

9. **A9** (double meaning; medium; sure). "hold" has three senses on one page: the caption "Hold
   EN at 1, change D, and watch the reference table." (keep a button pressed); "While EN is 0, Q
   holds." (keeps its value); "Hold time here is zero" (a timing quantity); and the table row
   "Hold". The lesson introduces "hold" as a rationed term in the third sense. Direction: use
   "leave EN at 1" for the button, and keep "hold" for the value and the time.

10. **A10** (term; medium; sure). Setup-hold lead: "Hold time here is zero: a change at the edge
    or after is simply missed." Hold time is never said in plain English (how long D must stay put
    after the edge), so the learner receives a value for a quantity the page has not defined,
    while the objectives ask them to "see what the model says about the hold time". "simply" is a
    hedge (style rule 19). Direction: one plain sentence before the number.

11. **A11** (arc; medium; sure). Construction, challenge "The two-button light": the investigation
    figure directly above it ("Press A and B to watch LIGHT and the gates in the two-button
    circuit.") draws the complete circuit the challenge then asks for, gates, names and wiring;
    the task and its five hints treat it as unknown ("Build the light that remembers the last
    button, from NOR gates."). The challenge tests copying. Direction: show the investigation
    circuit as a closed block, or ask the challenge for something the figure does not draw.

12. **A12** (arc; medium; sure). Challenge "The D latch, as text": "Declare wires with `logic`
    and connect them with `assign` statements." No `assign` line appears in the lesson's prose or
    in any figure; the generalisation figure shows only `always_ff`, and the only examples are
    hint 3 and the "As text" panel (closed by default) under earlier drawing challenges. A learner
    without hints has to guess the syntax. Direction: show one `assign` line in the generalisation
    lead or in this challenge's lead.

13. **A13** (repeat; medium; sure). The prediction explanation "While kick was 1, the OR gate
    forced a 1 around the loop. Once kick returns to 0, the OR gate passes inverter 2's output
    unchanged to inverter 1, so the two inverters agree round the loop and nothing changes." and
    the investigation lead "While kick is 1, the OR gate forces a 1 round the loop and q is 1. When
    kick returns to 0, the OR gate passes inverter 2's output unchanged. The two inverters agree
    round the loop, so nothing changes and q stays 1." make the same argument in nearly the same
    words in consecutive sections; the three-inverter pair ("Three inverters cannot agree") does
    the same. Direction: let one carry the argument and the other add what the figure adds (the
    steps).

14. **A14** (repeat; low; sure). The D latch reference table is on the page twice: under the
    explorer ("Hold EN at 1, change D, and watch the reference table.") and as "The reference table
    for the D latch.", each with the note "Removes the forbidden input by never letting S and R
    both be 1.", with the lead between them saying the same in its own words ("The D latch removes
    that forbidden input."). Direction: show the table once.

15. **A15** (style; medium; sure). The D latch explorer lead (`dLatchExplorerLead`) does four
    jobs: how to drive the figure, "A signal that rises and falls at a steady rate, used to time a
    whole circuit, is called a clock, written CLK.", the race through two latches, and "The fix is
    two D latches in series with an inverter." plus the definition of rising edge. The clock is
    defined before the problem that needs it (style rule 13), and the inverter arrives with no
    reason given until the explanation. Direction: problem first, then the clock; move the fix to
    the figure that shows it.

16. **A16** (figure; medium; sure). Same lead: "If Q feeds the D of a second latch and both
    latches share one EN, a change races through both while EN is 1." No figure shows two latches
    sharing one EN; the figure beside the sentence is a single D latch. This race is the lesson's
    reason for the flip-flop. Direction: a two-latch figure, or let the internals figure carry the
    claim.

17. **A17** (fact; medium; sure). Generalisation after-text (`asTextAfter`): "A circuit whose next
    value depends on its present value and its inputs is the next lesson's subject." The next
    lesson in the course list is "How does a circuit keep several bits together?" (registers),
    whose own reflection defers that circuit to a lesson after it. Direction: point at registers,
    or say "a later lesson".

18. **A18** (figure; low; sure). Fault lab, "Feedback wire cut": choosing it re-lays out the
    drawing so the two gates swap sides compared with "No fault" and with the investigation
    figure, and the cut shows only as a short dashed stub; the lead describes the fault in terms of
    the gates' positions ("The LIGHT gate reads X where the other gate's output was."). Direction:
    keep the healthy layout under a fault and mark the cut.

19. **A19** (label; low; sure). The reference tables use words the lesson never uses: "D flip-flop
    (edge-triggered)", "Captures 0", "Captures 1", "No edge: unchanged", while the prose says
    "takes D" and never "edge-triggered" or "capture". Direction: align the table's words with the
    lesson's.

20. **A20** (double meaning; low; sure). "input": "The D latch removes that forbidden input." and
    the table row "Forbidden" use input for a combination of inputs; everywhere else an input is a
    pin. Direction: "that forbidden combination".

21. **A21** (fact; low; sure). Challenge "The D latch, as text", typing an `always_ff` line gives
    "This lesson has not met `always_ff @(posedge clk)` yet." The generalisation figure shows that
    line and says "You are not asked to write this yet." The message contradicts the page (it is a
    platform string, but the learner meets it here). Direction: say the challenge does not allow
    it, not that the lesson has not met it.

22. **A22** (figure; low; sure). At 375 pixels the internals drawing shows CLK, D, notClk and the
    master; the slave and Q are off-screen to the right, and the setup-hold diagram's change of Q
    is off-screen too. Both scroll sideways, but nothing on the page says so, and the lead says "To
    open the master or the slave you press its block in the drawing." Direction: a scroll cue, or a
    narrower layout for the phone.

23. **A23** (label; low; sure). Section titles that are lists: "Faults, transparency problems,
    edge timing" and "Feedback loops, tables, two-stage latches"; "How a circuit remembers" repeats
    the lesson title. Direction: one noun phrase naming what the section contains.

24. **A24** (arc; low; sure). Objective "Find the setup time of the flip-flop in the gate-delays
    model": the setup-hold lead states it ("Setup time in this model is 30 units.") before the
    learner has moved the slider. Direction: let the slider deliver the number and the prose
    confirm it.

25. **A25** (style; low; sure). Setup-hold lead: "The roll button rolls an outcome from a recorded
    seed." The button is labelled "Roll result" and appears only while the slider sits inside the
    band, so "the roll button" arrives before the learner has seen one. Direction: name the button
    and say when it appears.

## Lesson B

1. **B1** (figure; medium; sure). Failure experiment, both leads: "The wires are not labelled in
   the drawing. Press a wire to see its name and value underneath." and "GCLK is not labelled in
   the drawing: press the wire from andClk to the flip-flop to see its name, GCLK." On the page a
   press shows nothing: pointing at a wire shows "KEEP = X" or "GCLK = 0" underneath, but a click
   clears it (the press toggles off what the hover switched on), and a tap under touch emulation
   leaves the line blank. The names the leads rely on (KEEP, CHOICE, GCLK) are reachable only by
   hovering with a mouse. Direction: make a press show the name, or say "point at".

2. **B2** (fact; medium; sure). Prediction, first figure (`p1Question`): "In `0110`, bit 3 is 0 and
   bit 0 is 0." Both named bits are 0, so the example cannot show which end is bit 3, which is the
   one thing it is there to show. Direction: a value whose ends differ, or name bits 2 and 1.

3. **B3** (double meaning; medium; sure). Explanation prose: "At every rising edge, every flip-flop
   takes its D. EN decides what D becomes. When EN is 1, D is the new value." D is the circuit's
   input in "D is the new value" and the flip-flop's pin in "what D becomes", so the third sentence
   reads as "the input is the input". The fault lab already has a name for the pin's signal.
   Direction: name the flip-flop's pin differently from the circuit's input in this paragraph.

4. **B4** (term; medium; sure). Investigation lead: "arranged ff3 to ff0 from top to bottom, the
   order a word is written." "word" is defined three paragraphs later ("Several bits kept together
   and treated as one value are a **word**."). Direction: define it first, or say "the order a
   number is written".

5. **B5** (figure; medium; sure). Challenge section lead (`predictChainLead`): "This figure chains
   four flip-flops on one clock. IN goes to the first flip-flop's D. Each flip-flop's Q connects to
   the next flip-flop's D." The prediction figure draws nothing before the answer is committed and
   a timing diagram after; the chain is first drawn by the learner in the next challenge. The text
   describes the wiring fully, so the learner can follow, but "This figure" shows no such thing.
   Direction: as A7.

6. **B6** (figure; medium; sure). Challenge "The four-bit register, as text", lead: "The circuit
   your text makes is drawn under it as you type." With a correct block typed, the drawing under
   the text shows a "CONST" block, a selector symbol labelled "Q_mux" and a "register" block with
   only D and CLK ports. The lesson never introduces a selector or a constant, and the
   generalisation said "the register appears as one block with inputs D, CLK and EN, and output
   Q." Direction: draw the block with its RST and EN ports, or say the drawing may contain parts
   the text tool adds.

7. **B7** (figure; low; sure). In the same editor the typed `<=` is displayed as one glyph, ≤
   ("Q ≤ 4'b0000;"), while every example in the prose shows `Q <= D`. A font ligature in the text
   box. Direction: switch ligatures off in the editor.

8. **B8** (figure; low; sure). Explanation figure "One bit with a load enable and a reset", caption
   "Press RST and Clock CLK, then compare Q with the table.": the table never marks a row. The
   previous lesson's table under the D latch explorer marked the row in force ("Applies now"); this
   one cannot, because its CLK column holds ↑ and — while the pin holds 0 or 1. Direction: mark the
   row by the latest edge, or say the table is a static reference.

9. **B9** (double meaning; medium; sure). Reflection: "A load enable chooses what reaches D: it
   never changes when the clock arrives." The sentence reads as "EN never changes at the moment of
   the edge"; it means that EN never alters the moment the clock arrives. Direction: say that EN
   does not touch the clock.

10. **B10** (double meaning; low; sure). "step": "All four Q change in one step, each to its own
    D." (at once); "The tests change D, EN and CLK one step at a time" and '"Run checks" tests this
    bit with four steps, each ending at a rising edge' (test steps); "A failed test names the step
    and the part that drives the wrong output." A learner from the previous lesson knows "step" as
    "Settled in 2 steps." Direction: "at once" for the first, "test" for the rest.

11. **B11** (repeat; medium; sure). The lesson's one rule is stated four times: construction
    "Keep one clock for everything. Change what each flip-flop's D sees, not when it sees it.";
    after the gated-clock figure "EN only changes what reaches D" and "This course keeps one rule
    from here: every flip-flop gets CLK itself, and other signals decide only what reaches D.";
    reflection "A load enable chooses what reaches D: it never changes when the clock arrives."
    Direction: state it once where it is earned (after the failure experiment) and refer back.

12. **B12** (repeat; low; sure). Explanation lead: "At an edge where RST and EN are both 1, Q
    becomes 0. Reset wins over EN." and the table note directly beneath: "the RST input wins over
    EN; with EN at 0, Q keeps its value." Direction: drop one.

13. **B13** (arc; medium; sure). Challenge "The shift register, drawn": rung 1 of the hints,
    labelled "The concept", states the complete wiring, the same content as rung 5, and the task's
    second paragraph already says what each output takes at an edge. The ladder does not climb.
    Direction: make rung 1 the idea (bits move one place per edge) and keep the wiring for the last
    rungs.

14. **B14** (arc; low; sure). Challenge "One bit with a load enable, drawn": rung 3, labelled
    "Smaller example", states the full gating mechanism rather than a smaller example. (The previous
    lesson's follow-and-hold hints have the same shape at rung 3.) Direction: a one-gate example
    there, and the combination at rung 4.

15. **B15** (fact; low; sure). Generalisation lead: "This register combines four of the load-enable
    bits from the construction into a single unit." The block cannot be opened in this figure, and
    the circuit it holds builds each bit's enable from a selector inside the flip-flop, not from the
    construction's gates (the drawing in B6 shows that selector). Direction: say it behaves as four
    of them, or draw the block from the construction's bits.

16. **B16** (fact; low; fairly sure). Generalisation after-text: "every value written into Q must
    be eight bits wide." The page's own checker accepts `Q <= 0;` for the four-bit Q ("OK. The
    text describes a circuit."). Direction: "should", or say what the course does with a narrower
    value.

17. **B17** (label; low; sure). The fault lab carries the "Clocked" badge but has no "Clock CLK"
    button (its buttons are "Release all at once" and "Run checks"), while the next lead says 'This
    figure has the "Stepped" badge and no "Clock CLK" button' as if that were the difference
    between them. Direction: give the fault lab the button, or say the checks drive the clock.

18. **B18** (figure; low; sure). At 375 pixels, in "One bit with a load enable" and "One bit with a
    load enable and a reset", orChoice, andClear, the flip-flop and Q are off-screen to the right
    while the lead walks through them by name ("The AND gate andClear takes CHOICE and NOT RST").
    The drawing scrolls sideways with no cue. Direction: as A22.

19. **B19** (style; low; sure). Failure experiment lead: "Without it, the bit forgets. Three faults
    break it." "it" is the keep path, but "EN forced to 1" and "OR gate changed to AND" do not break
    the keep path. Direction: name the noun.

20. **B20** (originality; low; fairly sure). The shift register is the textbook serial-in chain,
    and the lesson's own story (switches, display, Save) gives it no job; it is motivated only by
    the previous lesson's question. The rest of the lesson's examples are its own. Direction: give
    the chain a use in the story, or keep it as the answer to that question and say so.

21. **B21** (arc; low; sure). Objective "Build a register from flip-flops sharing one clock, and
    say why all bits change at the same moment.": the page never asks for that build; the four-bit
    register is given in the investigation, and the learner builds one bit and a chain and writes
    the register as text. Direction: align the objective with the challenges.

22. **B22** (style; low; sure). The fault lab lead is one lead doing five jobs: the gate list, the
    step list, how the checks compare, the wire readout, the keep path, and the outcome of each of
    three faults, before the figure appears. Direction: keep the lists before the figure and move
    what each fault does to an after-text, where the learner has pressed it.

## Comparison

B reads better for its learner. Three things decide it. First, B's figures show what its prose
claims: the gated-clock figure makes the lesson's one rule visible, and every number in its leads
matched the page; A's central figure contradicts its own phase text at time 550 and never shows D
changing while CLK is 1, the mechanism its lead claims. Second, B's arc is one question answered in
order (shared clock, then load enable, then reset) and each figure earns its place; A duplicates a
table, repeats its prediction explanations in the investigation, and draws challenge 1's circuit
directly above the challenge. Third, A's timing figure reports times nobody anchors and its rolls
repeat, so its most original section is its least trustworthy. B's faults are smaller: a bit
example that cannot distinguish its ends, a wire readout a press clears, and a rule stated four
times.
