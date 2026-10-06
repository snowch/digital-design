# instructions: the walker's findings, condensed

Walked at 1280 px, 375 px and dark; every instruction, pin, wire and fault pressed; both
challenges run with the start, wrong attempts and the reference.

- I1. The prediction's answer is on the page first: the motivation says "-184 - (-250) = 66", the
  prediction decodes `13123000` as subtract, and the Buses table shows RESULT `42` before commit.
- I2. Failure feedback in 64-bit binary and generated names ("buf1regs/joinAregs/...", "The BUF
  gate buf2", "a (const0)"), contradicting "It has no gates".
- I3. "Written" marks a change, not a write: a second edge rewriting 66 into R3 loses the mark,
  and looks the same as the WRITEY-at-0 edge it should be told from.
- I4. The investigation's after-text, every outcome included, visible while the learner uses
  the figure.
- I5. Faults: the first edge of the first fault shows both faults' outcomes; the Y fault is drawn
  as a floating "CONST 0000" box, nothing on the Y wire changes.
- I6. Both challenges are transcription: the tasks give every bit range and every connection.
- I7. `+` refused with "adders come in a later module" (Module 7 used `+`); literal backticks;
  "Tests could not run" twice.
- I8. The question raises the four flags; nothing says where they go.
- I9. The prediction's feedback says "The edge wrote it into R3" before any edge, while R3 shows X.
- I10. A pressed wire, by mouse, leaves a thin focus box through other blocks: false wires.
- I11. Phone: the drawing 884 px in a 317 px view; failure cards about 1,000 px each.
- I12. Repeats: WRITEY set by hand, three times; "The list: ..." repeats the radios beside it;
  "a block marked 'split', called jobBits": two names for one block.
- I13. The no-write choice's label says WRITEY is 0, and pressing WRITEY's pin makes it 1 under that
  label; the CLK pin is named "Toggle between 0 and 1" but makes an edge.
- I14. The fields lead is one overloaded sentence; per-instruction notes are in the source with
  provisional words "Draft copy A", "Draft count B" (the served build predates them).
- I15. `/favicon.ico` 404.

Keep: the fields figure; pressing a wire for its name and value; the Registers table with
"Written"; the OP0 fault visibly at 0; every stated number checked; both references pass and the
wrong attempt fails at once; dark theme; no sideways page scroll.
