# Brief: the message for a number given to a signal that takes names

One sentence or two, for one learner-facing error message in the HDL elaborator
(`packages/hdl/src/elaborate.ts`, constant `ENUM_NUMBER`). Style: `docs/style.md`.

## Facts the message must carry

Each was checked before this brief was written: Verilator 5.020 refuses the text below with
`ENUMVALUE` (IEEE 1800-2017 6.19.3), and the course's own elaborator accepted it until this change.

1. The text declares a list of names, `typedef enum logic [1:0] {A = 2'b00, B = 2'b01} state_t;`,
   and a signal of that list, `state_t state;`.
2. A signal declared that way takes only a name from its list (`state <= B;`), or another signal
   declared with the same list.
3. The text gave it a number instead (`state <= 2'b01;`). The number can be the right value; it is
   still refused.
4. What to write instead: the name from the list whose value that number is.
5. The message names the signal and the list. It contains the placeholders `{signal}` and
   `{type}` exactly as written, each once, and nothing else in braces.

## Constraints

- Plain words: "list of names" is what the course calls it; `typedef enum` may appear in code
  marks. Do not use the word "enumerated".
- Code in backtick marks. No em dashes. British English. Active voice. Under 40 words.
- Say what is wrong and what to write. Do not say "unfortunately", "please" or "note that".

## Matching tone (existing messages, for length and voice)

- `this label is 3 bits wide but the case compares a 2-bit value`
- `give the list a width, such as \`typedef enum logic [1:0] {...} state_t;\``
