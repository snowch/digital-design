# Brief R4-S: the shared figure's words, after the third reading

Read `docs/style.md`. Each key is a label or one or two sentences. Keep every slot in braces exactly
once. Plain text unless a key says otherwise: these show where Markdown is not rendered, so write
no backticks unless the key says code marks are kept.

## What changed on the figure (code, already done)

- The step buttons and the status line stay at the top of the window over the whole figure, its
  tables too. The drawing's overview sticks under them, over the drawing only, in a tall window; in
  a short one it scrolls away with the page.
- Each row of the table "The instruction at every level" names its wire on the page, under its
  label, and pressing the row opens the block where that wire is drawn (the PC inside the datapath,
  S inside the controller). The wire's value under the drawing is written as the row writes it.

## Keys

- `pinNote` (under the drawing, two or three sentences). Today's wording joins "writes back" as one
  verb by mistake; write it so it cannot be read that way. Facts:
  - Press a wire to pin it. A pinned wire is marked with an orange halo, stays marked as you open
    blocks, and its name and value show under the drawing, in hexadecimal for a word.
  - A blue band marks the wires the next edge uses. It starts at each register, held word, memory
    or device the edge writes, and goes back along each selector's chosen input to where the value
    starts.
  - A wire is marked along its whole length, with all its branches.
  - The band does not mark the address a store writes to, nor the input that chooses a selector's
    input (such as TRAP).
- `rowWire` (under a row's label, a few words): `{wire}` is the name of the wire the row reads, as
  the drawing names it. Today "wire {wire}".
- `romWire` (under the label "Its word in the ROM", a few words): the wire is FETCHED, and FETCHED
  carries this row's word only before a FETCH edge.
- `answers.details.traceCarry` (a wrong row in lesson 3's challenge; keep `{actual}` once, keep
  code marks): "Your row is {actual}." Then: pause at the ALU edge of `R3 <= R1 - R2`, open the ALU
  down to the group `q0`, and read the carry out of each slice's full adder, bit 3 first.
- `answers.details.joinHb` (one sentence, never the answer): open the datapath and follow HB back
  from where it leaves to the part that drives it.
- `answers.details.joinIr` (one sentence, never the answer): open the control unit and follow IR
  from where it enters to the part it goes into.
- `capUnknown` (keep code marks; slots `{a}`, `{b}`, `{line}`, `{address}`, `{registers}`, `{them}`,
  `{why}` once each): with room A at `{a}` and room B at `{b}`, your program reaches `{line}` at
  `{address}`, which reads `{registers}` (one register, or a list such as "R9 and R8") before any
  instruction has written `{them}` ("it" or "them"); then a colon and `{why}`, which ends the
  sentence.
- `capUnknownThem.one`, `capUnknownThem.many`: "it", "them".
- `capUnknownWhy` (each completes the sentence above, after the colon, and ends with a full stop):
  - `address`: the model cannot work out an address from a register that holds no value;
  - `branch`: the model cannot decide a branch on a register that holds no value;
  - `jump`: the model cannot jump to an address in a register that holds no value;
  - `control`: the model cannot write a control register from a register that holds no value.
- `capLevels.carry` (lesson 5's level hint for a wrong carry row; keep code marks): at the ALU edge
  of your first set if, open `datapath`, `alu`, `g0`, then `q1`, and read the carry out of each
  slice, bit 7 (the slice `bit3`) first.
