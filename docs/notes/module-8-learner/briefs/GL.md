# Brief GL: Module 8's words after the learner walks

Read `docs/notes/module-8-datapath/briefs/00-module.md` (the shared fact sheet) and `docs/style.md`
first; both apply. Each key names its lesson; read that lesson's current words
(`content/lessons/<lesson>.prose.ts`, `.labels.ts`) and keep every fact and sentence the item
does not name. Return the whole key's new text, as `lesson/key: text`, a blank line between keys.
Where an item says "change only", change only that and copy the rest exactly. A radio label has
no backticks and no full stop; a field note is at most 9 words with no full stop.

## instructions

1. `instructions/motivation`: change only the sentence "Module 7's flags lesson subtracted
   them: -184 - (-250) = 66." It must not give the result: say Module 7's flags lesson subtracted
   one reading from the other. The page's prediction asks for that result.
2. `instructions/prediction`: change only the sentence that decodes `13123000` ("kind 1 (a
   register job), job 3 (subtract), A is R1, B is R2, Y is R3"). The learner now reads the fields
   from the fields figure in the motivation: say the bus IR carries `13123000`, and to read its
   fields in the figure above. Keep everything else.
3. `instructions/jobsLead`: change only the sentence "K (the kind), J's bit 3 and C (the
   constant) go nowhere yet." Add that the ALU's four flags, ZERO, MINUS, COUT and OVER, go
   nowhere yet too (the drawing leaves them unconnected).
4. `instructions/fieldsLead` (about 45 words). State the point first: the six fields sit in the
   same place in every instruction. Then, briefly, what a box shows: the field's letter and bits,
   its digits, its bits in groups of four, its value where that says more than the digits, and
   what the field does. Choose one of the four instructions to compare them.
5. `instructions/fieldIgnored.copyA`: a note on A for `15024000` (copy B): A is read onto QA, but
   copy B does not use it. `instructions/fieldIgnored.countUpB`: a note on B for `16101000`
   (count up): B is read onto QB, but count up does not use it.
6. `instructions/c1Task`: change only the bullet "Each output is a range of IR: K is bits 31 to
   28; ...; C is 11 to 0." Say each output is a range of IR's bits, and the fields figure in the
   motivation gives each field's bits. Give no ranges.
7. `instructions/c2Task`: change only "connect the job code from IR's bits 26, 25 and 24 to OP2,
   OP1 and OP0". Say: connect OP2, OP1 and OP0 to the bits of IR that carry the ALU's code (the
   lesson says the code is J's bits 2 to 0). Give no bit numbers.

## constants

8. `constants/construction`: change only the last sentence ("The 52 bits above are all 1 when C's
   bit 11 is 1, written in hexadecimal as `52'hFFFFFFFFFFFFF`: 52 bits of 1."). Keep that the 52
   bits are all 1 when bit 11 is 1, and all 0 when it is 0. Give no literal.
9. `constants/constantsFaultsLead`: keep both faults' paragraphs and the two instructions. The
   last two paragraphs change: R1 holds -184 and R2 holds -250 (do not mention R0). Then the order:
   choose a fault and an instruction; say what R3 will hold; then press Clock edge.
10. `constants/explanation`: change only the last sentence, "The figure below shows it for four
    constants." The figure shows the copies of bit 11 and both words read signed, for four
    constants; it does not show the weights adding up. Say that.

## fetch

11. `fetch/options.p1Stops` and `fetch/options.p1Stop`: radio labels that name what happens, not
    a cause code (the codes are explained only after the learner commits). p1Stops: the machine
    stops, because the word is no instruction. p1Stop: the machine stops, because the program has
    ended. Short.
12. `fetch/c1Hints.3`: replace. Module 5's registers lesson wrote a register with a reset and an
    enable as `if (RST) Q <= 4'b0000; else if (EN) Q <= D;`: the counter here has the same shape.
    (Module 5's counter lesson did not write this pattern.)
13. `fetch/objectives.4`: "Write the ROM's fetch checks as a module." comes before the lesson
    defines fetch: say "Write the ROM's checks on PC as a module" or similar, without "fetch".
14. `fetch/explanation`: change only the paragraph that begins "The decoder works out the control
    signals". Add one sentence: this decoder is not Module 3's decoder, which turned a number into
    one line at 1; this one turns K and J into control signals.
15. `fetch/marginAfter`: add one sentence after "PC stays `010`.": RESULT is X at the stop,
    because the stop instruction's A and B digits name R0, which nothing has written; nothing uses
    that RESULT.

## memory-access

16. `memory-access/mapLead` (about 80 words). The table's rows are the parts of the memory, with
    their addresses (the table gives them; do not list them). Two parts are new: DOOR and WARM at
    `7D0` (bit 0 DOOR, bit 1 WARM, as Module 2 defined them), and the timer and waiting at `7E8`
    and `7F0`, which later modules use. No memory from `7F8` up: 31 for every access. The columns
    are load word, load byte, store word and store byte. Each cell is the memory's answer at the
    part's first address, a multiple of 8: yes, or the cause that stops the machine. A store byte
    at DOOR and WARM or a sensor gives 33, not 34: the order the construction gives. Module 6's
    memory lost a write to its sensor; this machine stops with 34.

## branches

17. `branches/c1Task`: change only the bullet "MET for each job: 0 gives 1; ...; 7 gives NOT
    (MINUS XOR OVER)." Say: MET is 1 when the job's condition holds, for the eight conditions the
    motivation lists (always, never, equal, differ, less unsigned, not less unsigned, less signed,
    not less signed). Give no flag expressions.
18. `branches/generalisation`: change only the sentence "The block grew: in the drawing it is
    "word for Y", which holds pickLoad and a second selector for the call." Keep it, and add: its
    output is YIN, the word the register file writes (as in lesson 8.4).
