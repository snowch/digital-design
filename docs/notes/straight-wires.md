# Straight wires, whole gates, and no misleading lines

The author sent two screenshots from a tablet: the CALL circuit in `fewer-gates`, and the loops of
inverters in `remember`. In the first, each three-input AND gate's third input sat below the gate's
body, the four-input OR covered two of its four inputs, and the inverters sat at the bottom with
long wires back up past everything. In the second, the wires from `kick`, out of the OR gate and
into `q` each stepped up or down a few pixels where they should have run straight. The author
asked whether such faults can be found by a browser test. They can, and the suite now does.

## What was wrong, measured

A throwaway browser script measured all 82 circuit drawings in the course as first drawn:

- **152 kinks**: wires that step up or down by less than a grid cell (20 pixels), mostly 4, 8 or
  12 pixels, where they could run straight.
- **114 misses**: a wire meeting a gate outside the gate's drawn body, or leaving it off the end
  of its output lead. Every two-input gate missed by 4 pixels at its output.
- **6 drawings with a wire through a part**. In the shift-register chain the clock wires to `ff1`
  to `ff3` ran straight through `ff0`, so `ff0`'s Qb seemed to drive `ff1`'s clock; in the word
  selector the select wire ran through `splitA`, so bit 1 of A seemed to drive `sel3`'s select.
- Inside several blocks, laid out automatically, tall blocks overlapped each other.

The causes were in the geometry, not the drawings. A gate's symbol was always drawn 40 pixels
tall, while its box grew with its inputs (48 for two, 64 for three, 80 for four), so the body
missed its outer inputs and its output lead missed its output pin. Ports were 16 pixels apart on
a 20-pixel grid, so two ports could rarely be put level. The router gave every wire its own
vertical and never looked for parts in its way. The automatic layout stacked every part three
cells apart and spaced columns five cells apart, whatever their size.

## What changed

- **Every port lies on one 10-pixel lattice.** Inputs are a cell (20 pixels) apart, centred on the
  part, and the first is 12 pixels below the top, as a pin's port is. Any two ports can be put
  level by placing their parts a whole or half cell apart.
- **A gate is drawn to its box's height**: its body spans every input, and its output lead ends at
  its output pin.
- **Read-only drawings are straightened.** Taking parts left to right, a part moves up or down by
  half a cell or a cell where that makes more of its incoming wires straight; it never moves onto
  another part or its name, and stays where its author put it when no move helps. A part that
  rises above the drawing's top takes the whole drawing down, so a block's label stays inside. The
  builder does not straighten: a learner's part stays where the learner put it.
- **The router draws one trunk per net**, as a schematic does, with a dot where it branches, and
  takes the first route that passes through no part, no part's label or name, and no other net's
  wire: turning near the source; turning near the target; a dogleg along the nearest clear row,
  half way between the lattice's rows and at least a cell from both ends; or, last, a channel under
  the drawing, one per net.
- **The automatic layout stacks each column by the parts' heights and spaces columns by their
  widths**, with three cells between columns for the wires.
- **Placements**: the CALL circuit's inverters and the decoder's sit on their inputs' rows, with the
  inputs on rows no gate input uses, so no branch runs along a wire leaving an inverter.
- Pins are as wide as their names ("CLOSED" filled its box edge to edge); a block's name sits 3
  pixels higher and an output's value 2 pixels further right, so the two no longer touch.

Every count above is now zero: no kinks, no misses, no wire through a part or a part's words, and
no two signals along one line, in every drawing a learner can see.

## The checks

- `diagrams.spec.ts`, in the browser at desktop and phone widths, on every lesson as first drawn:
  no wire enters a gate outside its body or leaves it off its output lead, steps by less than a
  cell, passes through a part, or runs through a part's label or name. A value written on its own
  wire is placed there on purpose and is not counted.
- `content/lessons/lessons.test.tsx`, for every figure's circuit, under every fault its fault lab
  offers, and inside every block it lets a learner open: no wire through a part or its words, and
  no two signals along one line.
- `placement.test.ts`: every port of every library drawing is on the lattice, and a gate with one
  to five inputs has a body that spans them all.
- Each check was seen to fail first: the browser check on the course as it was, the words check
  with labels taken out of the router's obstacles.

## What is left

The router is a set of rules, not an optimiser: a dense drawing, such as the ALU's row of four
slices, has crossings no rule removes, and its look depends on the order wires are routed. The
four circuits that are only challenge references (`comparator-parts`, `adder-4-parts`,
`alu-slice-parts`, `alu-4`) are never drawn for a learner and are not held to the checks.
