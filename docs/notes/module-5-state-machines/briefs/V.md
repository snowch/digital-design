# Brief V: the state-machine figure's own words, and the names of new parts

Read 00-module.md and S-facts.md first. These words appear inside figures, in every lesson that
uses them. Some are templates: a word in braces, such as {state}, is filled in by the page; keep
every brace word exactly as written. Return each key with its text.

## The state-machine figure (keys `machine.*`)

The figure shows a state machine: a row of input buttons, "Clock CLK" and "Start again"
buttons, a status line, the state diagram, the encoded table, the circuit, a timing diagram and
the text, some of them per lesson.

- `machine.literal`: one input's value in an arrow's label or the table: "{name} {value}", for
  example "OK 0". Keep it as "{name} {value}" unless you see a reason not to.
- `machine.always`: an arrow's label for a row that reads no input (GIVE_UP's loop): one word,
  meaning the move happens at every edge.
- `machine.or`: the word between two rows' conditions on one arrow: one word.
- `machine.diagramLabel`: what a screen reader is told of the diagram: one sentence naming
  {states}, for example "State diagram with the states IDLE, TRY, WAIT, GIVE_UP".
- `machine.tableCaption`: the table's caption: a few words, "The encoded table" or better.
- `machine.row`, `machine.state`, `machine.next`: column headings: the row's number; the state the
  row starts from; the state the next edge gives. One or two words each.
- `machine.any`: what a cell shows when the row does not read that input: one character, "–".
- `machine.anyNote`: one sentence under the table saying what "–" means.
- `machine.inputsLabel`: what a screen reader is told the row of input buttons is: one or two
  words.
- `machine.inputButton`: an input's button: "{name} = {value}", as the circuit's pins show it.
  Keep this exact template.
- `machine.status`: the status line, one or two short sentences with {state}, {code}, {row},
  {next}, {nextCode}: the state now with its code, the row of the table that applies, and the
  state the next edge gives with its code. Example of the facts: "Now IDLE (00). Row 1 applies:
  the next edge gives TRY (01)."
- `machine.resetting`: the status line while RST is 1: the state now ({state}, {code}), that RST
  is 1, and that the next edge gives {next} ({nextCode}).
- `machine.noState`: the status line when the register holds a code no state has, including X:
  one sentence with {code}: the register holds {code}, which is no state's code.
- `machine.noName`: a few words used in place of a state's name, for a code no state has.
- `machine.circuitTitle`: what a screen reader is told the circuit drawing is: a few words.
- `machine.traceTitle`: what a screen reader is told the timing diagram is: a few words.
- `machine.textLabel`: what a screen reader is told the text is: a few words.

## Names of parts (keys `part.*`), shown as a block's label in drawings and on part buttons

Short, lower case except for signal names, like the existing "2-way selector", "half adder",
"4-bit register", "decoder":

- `part.registerBlock`: the 4-bit register with a reset and a load enable, as a part a learner
  places (now "4-bit register").
- `part.registerBlockDescribe`: one sentence on the part's button: four D flip-flops sharing one
  clock; at an edge where RST is 1, Q becomes `0000`; otherwise where EN is 1, Q takes D.
- `part.addOne`: the block that adds EN to Q (now "add one").
- `part.nextState`: the next-state logic block (now "next-state logic"). It appears only in the
  state-machines lesson and after.
- `part.outputLogic`: the output logic block (now "output logic").
- `part.split`, `part.join`: the blocks that split a word into bits and join bits into a word
  ("split", "join", as Module 3 names them).

## Names of circuits (keys `circuit.*`), shown in the trail above a drawing

A few words each, naming what the circuit is. The trail of a prediction figure is seen before
the lesson introduces its term, so:

- `circuit.counter4`: the 4-bit counting circuit of the counters lesson: shown first in a
  prediction BEFORE the word "counter" is introduced, so do not use "counter" (say what it does,
  for example "4-bit count").
- `circuit.counterTo5`: the circuit that counts 0 to 5 and starts again (after "counter" is
  introduced, so "counter" is allowed).
- `circuit.addOne4`: the add-one block alone.
- `circuit.nowPrev`: the NOW and PREV registers.
- `circuit.nowPrevOnce`: NOW and PREV saving once per press.
- `circuit.swap`: the two registers that swap.
- `circuit.retry`: the retry controller.
- `circuit.retryTryZero`: the retry controller with TRY at `00`.
- `circuit.retryOneHot`: the retry controller with one flip-flop per state, IDLE included.
- `circuit.retryZeroIdle`: the retry controller with one flip-flop per state and IDLE at `000`.
- `circuit.retryLateOk`: the retry controller with the lab's change (never shown; name it
  anyway).
- `circuit.defrost`: the defrost controller.
