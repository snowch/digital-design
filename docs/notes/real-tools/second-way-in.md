# Brief: the labels of a second way in

Short button labels for three earlier graded projects, and the words on the confirmation that
replaces a learner's work. Pattern to match (Module 13.4's, already shipped): "Start from the
outline", "Start from the parts", "Start from nothing", and the confirmation "Replace my text" /
"Keep my text". Style: `docs/style.md`. Every label is a button, so a few words, no full stop.

## Facts (each checked against the lesson data before this brief)

Each of the three projects already opens blank. The new button is a second way in; the blank start
stays, and the learner picks between them.

1. **2.2 `nand`, project `nand-xor` (drawn).** The new start places A, B, Y and five NAND gates.
   None is joined. (The lesson before this one built XOR from five NAND gates.)
   Label wanted: "Start from the gates".
2. **5.5 `state-encoding`, project `defrost` (written).** The new start is the frame of the
   text: the state register with its reset, the state names, and an `always_comb` with the
   `case (state)` heading and COOL's arm. The other arms, the unused code and the outputs are
   left to the learner. Label wanted: "Start from the frame".
3. **6.4 `memory-map`, project `shop-memory` (drawn).** The new start places the five blocks
   (decoder, table ROM, byte memory, display register, word selector) with their names and ports
   showing. None is joined. The two AND gates, and the write-enable gating they carry, are left
   to the learner. Label wanted: "Start from the parts".
4. **The blank start of a drawn project** puts only the pins on the page. Label wanted, in the
   same pattern: one for a drawing.
5. **The blank start of a written project** is the module line and `endmodule` with nothing
   between. Label wanted, in the same pattern: one for a text.
6. **Confirmation for a drawing**, shown when the learner has changed the drawing and presses a
   start: two buttons, replace the drawing with the start, or keep it. The text pair for a text
   already exists ("Replace my text" / "Keep my text").

## Constraints

British English, no em dashes, no filler. Reply as a list: label key, then the label, one per line.
Keys: `startGates`, `startFrame`, `startParts`, `startBlankDrawing`, `startBlankText`,
`replaceDrawing`, `keepDrawing`.

## What was built from it

- `packages/dd-views/src/StartChooser.tsx` is the one chooser: buttons, and a "replace?"
  confirmation when the learner has changed their work. `ProgramEditor` (11.7, 12.8), `LabEditor`
  (13.4), the written editor (5.5) and the drawing editor (2.2, 6.4) all use it; the first two
  pass their own words and behave as before.
- A second way in is data: `initial.data.second = { label, parts }` for a drawn project (the kinds
  of part to place, placed as the palette places them, so ids and spots are the editor's own) or
  `{ label, hdl }` for a written one. The blank start is `initial` as it was.
- Labels, from Haiku's draft above: `startGates`, `startFrame`, `startParts` in the lessons'
  `*.labels.ts`; `startBlankDrawing`, `startBlankText`, `replaceDrawing`, `keepDrawing`,
  `replaceText`, `keepText` in `strings.ts`. Facts checked: the NAND start places five gates (the
  reference XOR has five); the shop start places the decoder, ROM, byte memory, display register and
  word selector, and the reference's two AND gates are not among them; the frame is the text of
  hints 3 and 5 up to COOL's arm.
- `packages/dd-views/src/starts.test.tsx` holds that every start, blank and second, fails its
  project's own tests and every reference passes; `tests/educational/starts.spec.ts` drives each
  second start in the browser.
