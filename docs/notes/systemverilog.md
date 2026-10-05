# Naming the course's text: SystemVerilog

The author asked whether the course introduces SystemVerilog when the learner first meets it. It
did not. The gates lesson showed the ALARM circuit's text and explained it piece by piece
(`input logic`, `output logic`, `endmodule`, then `assign` and the operators), but no page named
the language, said what it is for, or said what `module` and `logic` do. The construction section
already promised that the explanation introduces the course's text, and the explanation said only
"The course also writes circuits as text."

## What changed

- The explanation's last paragraph names **SystemVerilog**. It says engineers write it to describe
  the circuits in real chips, and software turns their text into gates; that the course uses only
  some of the language and adds more as lessons need it; and that in a challenge anything the
  challenge does not use is refused, with a message. That last sentence is the construct gate
  (`packages/hdl/src/gate.ts`), whose messages begin "This challenge does not use".
- The figure's lead says what each word of the text's outer lines does: `module` starts one
  circuit and `endmodule` ends it; the word after `module` is the circuit's name; the lines in the
  brackets list its inputs and its output; `input` and `output` say which way a signal goes; and,
  in these lines, `logic` says each signal carries one bit.
- "SystemVerilog" is a rationed term of `gates`, so the term gate fails any earlier page that uses
  it. No page did.

## How the words were made

One fact brief for two passages, drafted by the drafting subagent. Checked before it went out:
the gate's message, and that the allowed constructs are set per challenge (`allowedConstructs`);
the figure's text, as generated; and that the lesson's second challenge is written as text, so the
refusal is something this learner can meet. One fact was corrected in the brief before it went
out. "`logic` says a signal carries one bit" is false of the registers lesson's `logic [3:0]`, so
the brief scoped it to these lines and told the drafter not to say that `logic` always means one
bit.

Both passages came back with every fact. Passage 1 went back once, for a fault the brief caused.
Its words "a small part of SystemVerilog" gave the page a second meaning for "part", which
everywhere else in the lesson is a piece of a circuit ("Add parts with the buttons above the
drawing", "the OR part is the wrong part"), so "adds parts as lessons need them" read as adding
gates. The redraft says "only some of the language" and "adds more". Nothing was added or cut by
the managing session.
