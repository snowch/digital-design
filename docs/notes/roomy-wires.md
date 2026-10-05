# Room between wires: no crowding, no needless crossing, no wire on a written value

The author sent two screenshots from a tablet of the decoders lesson: the demultiplexer block and
the decoder block. Each block's outputs fanned out to lamps spaced further apart than its ports,
and the wires turned down a few pixels apart, the one with furthest to go turning last, so it
crossed every other wire's way. On the inputs side the turns ran against the pins' written values.
The author asked whether to improve these lines, and whether a browser test could find others.

## What was wrong, measured

A throwaway browser script measured all 82 circuit drawings as first drawn, and found something in
44 of them:

- **64 pairs of verticals closer than half a cell** (10 pixels), most 6 pixels apart, some 2. In
  the ALU's add and subtract row, the SUB wire and a sum wire ran 4 pixels apart for 295 pixels:
  one thick line.
- **6 pairs of horizontals closer than half a cell.**
- **18 crossings between wires that leave one column and enter another in the same order**, which
  a different order of turns would not cross.
- **80 turns against a written value**: a value sits just above its wire, from 6 pixels past the
  port, and a trunk 8 or 14 pixels past the port ran through it or beside it.

The cause was in the router. Every net leaving one column of ports turned 6 pixels further out
than the one above it: the wires were bunched against the ports whatever the room, and in the
order that crosses most, since for wires fanning downwards the one starting highest should turn
last, not first.

## What changed

- **Trunks are placed per column** (`trunksOf` in `packages/dd-views/src/scene.ts`). The nets
  leaving one column that turn take verticals spread across the room before the parts they enter,
  a cell apart where they fit and half a cell where they do not, starting a cell past the ports so
  a value written there is clear. The room ends at the first part, or a part's words, standing
  across the trunk's height, so a trunk never stands inside a part it must go round. The order is
  the one that crosses least: of nets going down, the one starting lowest turns first; of nets
  going up, the one starting highest; then any swap of neighbours that removes a crossing is
  made, a crossing between wires that keep their order counting three times over. A net with a
  part in its way counts as turning, so its detour leaves from a placed trunk. Where too many nets
  share too little room, they are packed as tightly as they must be, never past the room's end.
- **A route keeps half a cell from other nets' wires where any route can.** The router tries
  every candidate route (turning early, turning late, a detour, a channel under the parts) at two
  levels: first keeping half a cell from every other net's wire, then, only if none does, merely
  off them, as before.
- **A wire turning into a part searches for its place**: 8 pixels before the part, then 6 pixels
  further back each time, the nearest that is clear, instead of taking fixed slots in turn. A
  detour still never turns in back past its own trunk.
- **Detours** may also run on the lattice's rows, after the rows half way between, and never
  within half a cell of the row of a port they pass on their way in, since a wire must take that
  row. Wires fed back to the left, and channels under the parts, are half a cell apart.
- **The automatic layout makes each gap between columns as wide as its wires need**: two cells,
  and half a cell for each signal crossing the gap, at least three.
- **A value is written only at an output a wire leaves**: an unwired output feeds nothing, and its
  value only crowded the wires beside it.
- **Placements given room**: the ALU's add and subtract row (two cells between slices), the
  decoder's gates, the register bit with an enable, and the inside of the flip-flop, each one cell
  wider where a turn and a written value had to share one cell.

Every count above is now zero in every drawing as first drawn, at desktop and phone widths. The
first three are zero too in every drawing under every fault its fault lab offers.

## The checks

- `diagrams.spec.ts`, in the browser at both widths, on every lesson as first drawn: no two wires
  of different signals within half a cell side by side, no crossing between wires that leave one
  column and enter another in the same order, and no wire within 3 pixels of a written value. Seen
  to fail first: run against the old router, layout and placements, it reported wires 6 pixels
  apart and turns touching their pins' values in the first lesson it opened.
- `content/lessons/lessons.test.tsx`, through `sceneProblems`, for every figure's circuit as first
  drawn and under every fault: the first two of those rules, beside the existing ones.
- `packages/dd-views/src/roomy.test.ts`: the demultiplexer's fan turns its wires a cell apart in
  the order that crosses none, a cell clear of its pins' values; and `sceneProblems` names two
  wires 6 pixels apart and two wires crossing in the same order, and says nothing of the other
  order.

## What is left

Inside a block a learner opens, the drawing is laid out automatically and the router places one
wire at a time; it cannot always keep half a cell in a dense block. The checks there are the
earlier ones (no wire through a part or its words, no two signals along one line). Of the 104
drawings inside blocks, 5 would fail the stricter rules: the decoder inside the decoder and
demultiplexer blocks (one crossing; the decoder block cannot be opened), the inside of an ALU slice,
in both ALUs (one pair 6 pixels apart, one crossing), and the inside of the 4-bit ALU block (three
crossings, two pairs too close). A rule that refused a route crossing a wire already placed in
the same order was tried and made them worse: later wires, with nowhere roomy left, crowded
instead. Fixing these needs placement by hand or a router that places wires together.
